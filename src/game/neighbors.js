// Процедурная генерация соседей. Тот же RoomModel, что у игрока, — значит
// комната соседа рисуется тем же рендерером без единого ветвления.

import { seeded } from '../core/rng.js';
import { dayKey } from '../core/clock.js';
import { makeName } from '../data/names.js';
import { allItems, itemById } from '../data/catalog.js';
import { slotsByZ, SLOT_RANK } from '../data/slots.js';
import { COLOR_SETS, COLOR_FAMILY } from '../data/palettes.js';
import { tierInfo } from './upgrades.js';
import { clamp } from '../core/format.js';

/** Устойчивый id соседа: одна и та же лента в течение суток. */
export function neighborId(day, index) {
  return `n:${day}:${index}`;
}

export function feedIds(playerSeed, count = 12, ts = Date.now()) {
  const day = dayKey(ts);
  return Array.from({ length: count }, (_, i) => neighborId(`${day}:${playerSeed}`, i));
}

/** Сосед из сида: ник, ранг, железо, декор и цветовая схема. */
export function generate(id, playerRank = 0) {
  const rnd = seeded(`neighbor:${id}`);
  const rankIndex = clamp(Math.round(playerRank + rnd.gauss() * 1.6), 0, 10);
  const pcTier = clamp(Math.round(rankIndex * 0.9 + rnd.range(-1, 1)), 0, 10);
  const gender = rnd.chance(0.5) ? 'm' : 'f';

  // Сначала выбираем схему из 2–3 цветов — комнаты выглядят осмысленно,
  // а не как случайное конфетти.
  const palette = rnd.shuffle(COLOR_SETS.full).slice(0, rnd.int(2, 3));
  const pickColor = () => rnd.pick(palette);

  const pool = allItems().filter((it) => it.requiresRank <= rankIndex && it.price > 0);
  const bySlot = new Map();
  for (const it of pool) {
    if (!bySlot.has(it.slot)) bySlot.set(it.slot, []);
    bySlot.get(it.slot).push(it);
  }

  const items = [];
  const placed = {};
  const slots = slotsByZ();
  const wanted = rnd.int(3, 10);
  const candidates = rnd.shuffle(slots.filter((s) => {
    const need = SLOT_RANK[s.id];
    return (need === undefined || rankIndex >= need) && bySlot.has(s.id);
  }));

  // Стол, кресло и монитор есть всегда — комната не бывает пустой.
  for (const base of ['desk', 'chair', 'monitor_main']) {
    const list = bySlot.get(base) || [];
    const affordable = list.filter((it) => it.requiresRank <= rankIndex);
    const item = affordable.length ? rnd.pick(affordable) : itemById(base === 'desk' ? 'desk_basic' : base === 'chair' ? 'chair_basic' : 'monitor_24');
    if (item) placed[base] = { itemId: item.id, color: pickColor() };
  }

  for (const slot of candidates) {
    if (Object.keys(placed).length >= wanted + 3) break;
    if (placed[slot.id]) continue;
    if (!rnd.chance(0.72)) continue;
    const item = rnd.pick(bySlot.get(slot.id));
    placed[slot.id] = { itemId: item.id, color: pickColor() };
  }

  for (const slot of slots) {
    const p = placed[slot.id];
    if (!p) continue;
    const item = itemById(p.itemId);
    if (!item) continue;
    items.push({
      slot: slot.id, itemId: p.itemId, color: p.color,
      draw: item.draw, variant: item.variant, z: slot.z,
    });
  }

  const decorScore = items.reduce((s, i) => s + (itemById(i.itemId)?.decorScore || 0), 0);
  const families = {};
  for (const i of items) {
    const f = COLOR_FAMILY[i.color] || 'neutral';
    families[f] = (families[f] || 0) + 1;
  }
  const harmony = Object.values(families).some((n) => n >= 4);
  const quality = 0.4 * (pcTier / 10) + 0.4 * Math.min(1, decorScore / 60) + 0.2 * (harmony ? 1 : 0.35);

  return {
    id,
    seed: id,
    owner: { name: makeName(rnd), gender, rankIndex },
    pcTier,
    pcVisual: tierInfo(pcTier).visual,
    wallColor: rnd.pick(COLOR_SETS.wall),
    floorColor: rnd.pick(['wood', 'walnut', 'gray', 'graphite', 'white']),
    items,
    decorScore,
    quality: clamp(quality, 0, 1),
    activity: rnd.pick(['play', 'play', 'window', 'tea', 'absent']),
    intent: 'play',
    pos: null,
    activityT: rnd.range(0, 6),
    isVisit: true,
  };
}

/** Краткая карточка для ленты — без полной комнаты. */
export function summary(id, playerRank) {
  const n = generate(id, playerRank);
  return {
    id: n.id,
    name: n.owner.name,
    gender: n.owner.gender,
    rankIndex: n.owner.rankIndex,
    pcTier: n.pcTier,
    items: n.items.length,
    quality: n.quality,
  };
}
