// Все мутации состояния. Тонкие команды: вся математика живёт в economy/ratings.

import { getState, mutate, flush } from '../state/store.js';
import { now, dayKey } from '../core/clock.js';
import { emit } from '../core/events.js';
import { tg } from '../platform/telegram.js';
import {
  accrue, incomePerSec, tapValue, xpForCollect,
  TAP_COOLDOWN_MS, FOCUS_TAPS, FOCUS_WINDOW_MS, FOCUS_DURATION_MS, FOCUS_COOLDOWN_MS,
} from './economy.js';
import { rankFromXp, rankName } from './ranks.js';
import { upgradePrice, nextTier, MAX_TIER } from './upgrades.js';
import { itemById, recolorPrice } from '../data/catalog.js';
import { SLOT_RANK } from '../data/slots.js';

let lastTapAt = 0;

export function bump(counter, by = 1) {
  mutate((s) => {
    s.counters[counter] = (s.counters[counter] || 0) + by;
  }, { silent: true });
  emit('counter', { counter, by });
}

function grant(s, coins) {
  s.wallet.coins += coins;
  s.wallet.totalEarned += coins;
  s.counters.coinsEarned = (s.counters.coinsEarned || 0) + coins;
}

function addXp(s, xp) {
  const before = rankFromXp(s.player.xp);
  s.player.xp += xp;
  const after = rankFromXp(s.player.xp);
  s.player.rankIndex = after;
  if (after > before) emit('rank:up', { index: after, name: rankName(after) });
}

/** Накопление в банк — вызывается на sim-тике и при возврате во вкладку. */
export function tickAccrual(ts = now()) {
  const gained = mutate((s) => accrue(s, ts), { silent: true });
  if (gained > 0) emit('bank:changed');
  return gained;
}

export function collect() {
  const ts = now();
  const s = getState();
  accrue(s, ts);
  const amount = s.bank.amount;
  if (amount < 0.01) {
    tg.haptic.warning();
    emit('toast', { text: 'Пока нечего собирать', kind: 'warn' });
    return 0;
  }
  mutate((st) => {
    grant(st, amount);
    addXp(st, xpForCollect(amount));
    st.bank.amount = 0;
    st.bank.lastAccrualAt = ts;
    st.counters.collects++;
  });
  tg.haptic.success();
  emit('collected', { amount });
  flush({ force: true });
  return amount;
}

export function tap(x, y) {
  const ts = now();
  if (ts - lastTapAt < TAP_COOLDOWN_MS) return 0;
  lastTapAt = ts;

  const s = getState();
  const value = tapValue(s, ts);
  mutate((st) => {
    grant(st, value);
    st.counters.taps++;
    const f = st.focus;
    f.taps = (f.taps || []).filter((t) => ts - t < FOCUS_WINDOW_MS);
    f.taps.push(ts);
    if (f.taps.length >= FOCUS_TAPS && ts > (f.cooldownUntil || 0)) {
      f.until = ts + FOCUS_DURATION_MS;
      f.cooldownUntil = ts + FOCUS_COOLDOWN_MS;
      f.taps = [];
      emit('focus:start');
      emit('toast', { text: 'Фокус! +25% дохода на минуту', kind: 'good' });
    }
  });
  tg.haptic.light();
  emit('floater', { x, y, text: `+${Math.round(value) || value.toFixed(1)}` });
  return value;
}

export function upgradePc() {
  const s = getState();
  if (s.rig.pcTier >= MAX_TIER) {
    emit('toast', { text: 'Это уже максимальная сборка', kind: 'warn' });
    return false;
  }
  const price = upgradePrice(s.rig.pcTier);
  if (s.wallet.coins < price) {
    tg.haptic.warning();
    emit('toast', { text: 'Не хватает монет', kind: 'warn' });
    return false;
  }
  const tierName = nextTier(s.rig.pcTier).name;
  mutate((st) => {
    st.wallet.coins -= price;
    st.rig.pcTier++;
    st.counters.pcUpgrades++;
    addXp(st, Math.floor(Math.sqrt(price)) * 2);
  });
  tg.haptic.medium();
  emit('room:changed');
  emit('toast', { text: `Апгрейд: ${tierName}`, kind: 'good' });
  return true;
}

export function buyItem(itemId) {
  const item = itemById(itemId);
  if (!item) return false;
  const s = getState();
  if (rankFromXp(s.player.xp) < (item.requiresRank || 0)) {
    emit('toast', { text: 'Нужен ранг повыше', kind: 'warn' });
    return false;
  }
  const need = SLOT_RANK[item.slot];
  if (need !== undefined && rankFromXp(s.player.xp) < need) {
    emit('toast', { text: 'Это место откроется позже', kind: 'warn' });
    return false;
  }
  if (!s.owned[itemId] && s.wallet.coins < item.price) {
    tg.haptic.warning();
    emit('toast', { text: 'Не хватает монет', kind: 'warn' });
    return false;
  }
  mutate((st) => {
    if (!st.owned[itemId]) {
      st.wallet.coins -= item.price;
      st.owned[itemId] = true;
      st.counters.itemsBought++;
      addXp(st, Math.floor(Math.sqrt(item.price || 1)));
    }
    st.room.items[item.slot] = {
      itemId,
      color: st.room.items[item.slot]?.itemId === itemId
        ? st.room.items[item.slot].color
        : item.defaultColor,
    };
  });
  tg.haptic.medium();
  emit('room:changed');
  emit('toast', { text: `${item.name} — в комнате`, kind: 'good' });
  return true;
}

export function placeItem(itemId) {
  const item = itemById(itemId);
  if (!item) return false;
  const s = getState();
  if (!s.owned[itemId]) return buyItem(itemId);
  mutate((st) => {
    st.room.items[item.slot] = { itemId, color: item.defaultColor };
  });
  emit('room:changed');
  return true;
}

export function removeSlot(slot) {
  mutate((st) => {
    st.room.items[slot] = null;
  });
  emit('room:changed');
}

export function recolor(slot, color) {
  const s = getState();
  const placed = s.room.items[slot];
  if (!placed) return false;
  const item = itemById(placed.itemId);
  if (!item) return false;
  const key = `recolored:${placed.itemId}`;
  const price = recolorPrice(item, !!s.owned[key]);
  if (price > 0 && s.wallet.coins < price) {
    tg.haptic.warning();
    emit('toast', { text: `Перекраска стоит ${price}`, kind: 'warn' });
    return false;
  }
  mutate((st) => {
    if (price > 0) st.wallet.coins -= price;
    st.owned[key] = true;
    st.room.items[slot] = { ...placed, color };
    st.counters.recolors = (st.counters.recolors || 0) + 1;
  });
  tg.haptic.select();
  emit('room:changed');
  return true;
}

export function setWallColor(color) {
  mutate((st) => {
    st.room.wallColor = color;
  });
  emit('room:changed');
}

export function setFloorColor(color) {
  mutate((st) => {
    st.room.floorColor = color;
  });
  emit('room:changed');
}

export function chooseGender(gender, name) {
  mutate((st) => {
    st.player.gender = gender;
    st.player.onboarded = true;
    if (name) st.player.name = name;
    if (!st.seed) st.seed = String(tg.user?.id || Math.random().toString(36).slice(2, 10));
    if (tg.user?.id) st.player.tgId = tg.user.id;
  });
  flush({ force: true });
  emit('room:changed');
  emit('onboarded');
}

export function rewardCoins(amount, { xp = 0, reason = '' } = {}) {
  mutate((st) => {
    grant(st, amount);
    if (xp) addXp(st, xp);
  });
  emit('bank:changed');
  if (reason) emit('toast', { text: reason, kind: 'good' });
}

/** Сброс дневных счётчиков — вызывается при смене локальных суток. */
export function rolloverDay(ts = now()) {
  const key = dayKey(ts);
  const s = getState();
  if (s.social.dayKey === key) return false;
  mutate((st) => {
    st.social.dayKey = key;
    st.social.visitsUsedToday = 0;
    st.social.ratedToday = [];
    st.social.guestsToday = 0;
  });
  emit('day:rollover', { key });
  return true;
}

export { incomePerSec };
