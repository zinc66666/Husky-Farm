// Состояние мира: фаза дня, сезон, погода. Пересчитывается на медленном тике
// и на возврате во вкладку; всё остальное только читает результат.

import { hourOfDay, dayKey, monthIndex, now } from '../core/clock.js';
import { daylightAt, remapHour, PHASE_NAMES } from '../data/daylight.js';
import { seasonForMonth, seasonData } from '../data/seasons.js';
import { weatherAt, WEATHER_NAMES } from './weather.js';
import { emit } from '../core/events.js';

const params = new URLSearchParams(location.search);
const seasonOverride = params.get('season');
const weatherOverride = params.get('weather');
const SEASON_KEYS = ['winter', 'spring', 'summer', 'autumn'];

let current = null;

export function updateWorld(seed = 'default', ts = now()) {
  const hour = hourOfDay(ts);
  const seasonKey = SEASON_KEYS.includes(seasonOverride)
    ? seasonOverride
    : seasonForMonth(monthIndex(ts));
  const season = seasonData(seasonKey);
  const light = daylightAt(remapHour(hour, season.sunrise, season.sunset));

  let weather = weatherAt(dayKey(ts), seed, seasonKey, hour);
  if (weatherOverride && WEATHER_NAMES[weatherOverride]) {
    weather = { kind: weatherOverride, intensity: 1, from: 0, to: 24 };
  }
  // Дождь зимой читается как снег, снег летом — как дождь: без нелепицы.
  if (seasonKey === 'winter' && weather.kind === 'rain') weather = { ...weather, kind: 'snow' };
  if (seasonKey === 'summer' && weather.kind === 'snow') weather = { ...weather, kind: 'rain' };

  const next = {
    hour,
    hour01: hour / 24,
    phase: light.phase,
    phaseName: PHASE_NAMES[light.phase] || '',
    light,
    season: seasonKey,
    seasonName: season.name,
    seasonData: season,
    weather: weather.kind,
    weatherName: WEATHER_NAMES[weather.kind] || '',
    intensity: weather.intensity,
    // квантованная корзина света — ключ кеша материалов
    lightKey: `${light.phase}:${Math.round(light.alpha * 24)}`,
  };

  const changed =
    !current ||
    current.lightKey !== next.lightKey ||
    current.weather !== next.weather ||
    current.season !== next.season ||
    Math.abs(current.intensity - next.intensity) > 0.05;

  current = next;
  if (changed) emit('world:changed', next);
  return next;
}

export function getWorld() {
  return current || updateWorld();
}
