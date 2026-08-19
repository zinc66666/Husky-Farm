// Экономика: доход, банк, оффлайн-начисление, тапы.
// Все расчёты по времени идут от настенных часов, а не от кадров.

import { powerOf } from './upgrades.js';
import { itemById } from '../data/catalog.js';
import { COLOR_FAMILY } from '../data/palettes.js';
import { now } from '../core/clock.js';
import { clamp } from '../core/format.js';

export const BASE_RATE = 0.5;          // монет/сек при мощности 1
export const BASE_CAPACITY_SEC = 4 * 3600;
export const MAX_CAPACITY_SEC = 8 * 3600;
export const COMFORT_SEC = 1800;       // +30 мин за очко comfort
export const OFFLINE_CLAMP_MS = 24 * 3600 * 1000;

export const TAP_MULT = 3;             // тап даёт доход за 3 секунды
export const TAP_COOLDOWN_MS = 400;
export const FOCUS_TAPS = 10;
export const FOCUS_WINDOW_MS = 5000;
export const FOCUS_DURATION_MS = 60_000;
export const FOCUS_COOLDOWN_MS = 300_000;
export const FOCUS_MULT = 1.25;

/** Сумма decorScore и comfort по размещённым предметам + бонус за цветовую гармонию. */
export function decorStats(room) {
  let score = 0;
  let comfort = 0;
  const families = {};
  for (const placed of Object.values(room.items || {})) {
    if (!placed) continue;
    const item = itemById(placed.itemId);
    if (!item) continue;
    score += item.decorScore || 0;
    comfort += item.comfort || 0;
    const fam = COLOR_FAMILY[placed.color] || 'neutral';
    families[fam] = (families[fam] || 0) + 1;
  }
  const harmony = Object.values(families).some((n) => n >= 4);
  return { score, comfort, harmony };
}

export function decorMult(room) {
  const { score, harmony } = decorStats(room);
  return 1 + Math.min(0.6, 0.02 * score) + (harmony ? 0.05 : 0);
}

export function rankMult(rankIndex) {
  return 1 + 0.05 * rankIndex;
}

export function ratingMult(social) {
  const r = social?.ratingsReceived || { count: 0, sum: 0 };
  const count = 1 + Math.min(0.5, 0.01 * r.count);
  const avg = r.count > 0 ? r.sum / r.count : 3;
  return count + clamp(0.04 * (avg - 3), -0.08, 0.08);
}

export function guestMult(social, ts = now()) {
  const active = (social?.guests || []).filter((g) => g.expiresAt > ts).length;
  return 1 + 0.1 * Math.min(5, active);
}

export function focusMult(focus, ts = now()) {
  return focus && focus.until > ts ? FOCUS_MULT : 1;
}

export function incomePerSec(state, ts = now()) {
  return (
    BASE_RATE *
    powerOf(state.rig.pcTier) *
    decorMult(state.room) *
    rankMult(state.player.rankIndex) *
    ratingMult(state.social) *
    guestMult(state.social, ts) *
    focusMult(state.focus, ts)
  );
}

export function capacitySec(state) {
  const { comfort } = decorStats(state.room);
  return Math.min(MAX_CAPACITY_SEC, BASE_CAPACITY_SEC + COMFORT_SEC * comfort);
}

export function capacity(state, ts = now()) {
  return incomePerSec(state, ts) * capacitySec(state);
}

/** Догоняющее начисление в банк. Возвращает начисленную сумму. */
export function accrue(state, ts = now()) {
  const last = state.bank.lastAccrualAt || ts;
  let elapsed = ts - last;
  if (elapsed <= 0) {
    // Часы перевели назад — просто сбрасываем точку отсчёта, без наказаний.
    state.bank.lastAccrualAt = ts;
    return 0;
  }
  elapsed = Math.min(elapsed, OFFLINE_CLAMP_MS);
  const rate = incomePerSec(state, ts);
  const cap = rate * capacitySec(state);
  const gained = Math.min(cap - state.bank.amount, (rate * elapsed) / 1000);
  if (gained > 0) {
    state.bank.amount += gained;
    if (state.bank.amount > state.stats.bestBank) state.stats.bestBank = state.bank.amount;
  }
  state.bank.lastAccrualAt = ts;
  state.lastTickAt = ts;
  return Math.max(0, gained);
}

/** Оффлайн-расчёт при загрузке: сколько накапало, пока игры не было. */
export function offlineReport(state, ts = now()) {
  const last = state.lastTickAt || ts;
  const elapsed = clamp(ts - last, 0, OFFLINE_CLAMP_MS);
  const rate = incomePerSec(state, ts);
  const capSec = capacitySec(state);
  const seconds = Math.min(elapsed / 1000, capSec);
  return {
    elapsedMs: elapsed,
    amount: rate * seconds,
    capped: elapsed / 1000 > capSec,
  };
}

export function tapValue(state, ts = now()) {
  return incomePerSec(state, ts) * TAP_MULT;
}

export function xpForCollect(amount) {
  return Math.floor(Math.sqrt(Math.max(0, amount)));
}
