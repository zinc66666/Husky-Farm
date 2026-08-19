// Погода — детерминированное расписание на сутки от хеша (дата + сид игрока).
// Перезагрузка страницы не перекатывает погоду, и сервер для этого не нужен.

import { seeded } from '../core/rng.js';
import { seasonData } from '../data/seasons.js';

export const WEATHER_NAMES = {
  clear: 'Ясно',
  cloudy: 'Облачно',
  rain: 'Дождь',
  hail: 'Град',
  fog: 'Туман',
  snow: 'Снег',
};

const RAMP_MS = 90_000; // плавный разгон интенсивности на стыке блоков

const cache = new Map();

/** Расписание блоков на сутки: [{ from, to, kind }] в часах 0..24. */
export function timelineFor(dayKey, seed, seasonKey) {
  const cacheKey = `${dayKey}|${seed}|${seasonKey}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const rnd = seeded(`weather:${cacheKey}`);
  const season = seasonData(seasonKey);
  const blocks = [];
  let h = 0;
  let prev = 'clear';
  let hailUsed = false;

  while (h < 24) {
    const lenH = rnd.range(25, 110) / 60;
    const to = Math.min(24, h + lenH);

    let weights = season.weather.map((e) => ({ ...e }));
    for (const e of weights) {
      // Град бывает только сразу после дождя и не чаще раза в сутки.
      if (e.v === 'hail' && (prev !== 'rain' || hailUsed)) e.w = 0;
      // Туман тяготеет к раннему утру.
      if (e.v === 'fog') e.w *= h >= 4 && h <= 9 ? 3 : 0.35;
      // Не повторяем один и тот же блок подряд слишком часто.
      if (e.v === prev) e.w *= 0.4;
    }
    let kind = rnd.weighted(weights.filter((e) => e.w > 0));
    if (kind === 'hail') {
      hailUsed = true;
      blocks.push({ from: h, to: Math.min(to, h + rnd.range(8, 20) / 60), kind });
      h = blocks[blocks.length - 1].to;
      prev = kind;
      continue;
    }
    blocks.push({ from: h, to, kind });
    prev = kind;
    h = to;
  }

  cache.set(cacheKey, blocks);
  if (cache.size > 12) cache.delete(cache.keys().next().value);
  return blocks;
}

/** Текущая погода с плавно нарастающей интенсивностью. */
export function weatherAt(dayKey, seed, seasonKey, hour) {
  const blocks = timelineFor(dayKey, seed, seasonKey);
  const block = blocks.find((b) => hour >= b.from && hour < b.to) || blocks[blocks.length - 1];
  const rampH = RAMP_MS / 3600000;
  const inT = Math.min(1, (hour - block.from) / rampH);
  const outT = Math.min(1, (block.to - hour) / rampH);
  const intensity = Math.max(0, Math.min(inT, outT, 1));
  return { kind: block.kind, intensity, from: block.from, to: block.to };
}

/** Осадки видны за окном; туман дополнительно вешает дымку на комнату. */
export function isPrecipitation(kind) {
  return kind === 'rain' || kind === 'hail' || kind === 'snow';
}
