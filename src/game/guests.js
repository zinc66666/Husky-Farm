// Симуляция входящих гостей. PRNG засеян часовой корзиной, поэтому пересчёт
// при возврате во вкладку даёт тот же результат, что и «живой» ход времени.

import { getState, mutate } from '../state/store.js';
import { seeded } from '../core/rng.js';
import { hourKey, now } from '../core/clock.js';
import { roomQuality } from '../state/selectors.js';
import { incomePerSec } from './economy.js';
import { rankFromXp } from './ranks.js';
import { makeName } from '../data/names.js';
import { emit } from '../core/events.js';
import { rewardCoins, bump } from './actions.js';
import { clamp } from '../core/format.js';

export const GUEST_STAY_MS = 30 * 60 * 1000;
export const MAX_CONCURRENT = 5;
export const MAX_PER_DAY = 40;

export function guestsPerHour(state) {
  const quality = roomQuality(state);
  const decorFactor = 1 + quality * 1.4;
  const ratedToday = (state.social.ratedToday || []).length;
  const rank = rankFromXp(state.player.xp);
  return 0.8 * (1 + 0.15 * ratedToday) * decorFactor * (1 + 0.1 * rank);
}

/** Догоняющая симуляция: разыгрывает часовые корзины с прошлого раза. */
export function rollGuests(ts = now()) {
  const s = getState();
  const from = s.social.lastGuestRollAt || ts;
  const elapsed = clamp(ts - from, 0, 12 * 3600 * 1000);
  if (elapsed < 60_000) return 0;

  const perHour = guestsPerHour(s);
  const hours = elapsed / 3600000;
  const rnd = seeded(`guests:${s.seed}:${hourKey(ts)}`);

  let expected = perHour * hours;
  let arrived = Math.floor(expected);
  if (rnd.chance(expected - arrived)) arrived++;

  const quality = roomQuality(s);
  const fair = Math.round(quality * 4 + 1);
  const list = [];
  let tips = 0;
  let starsSum = 0;

  for (let i = 0; i < arrived; i++) {
    if ((s.social.guestsToday || 0) + list.length >= MAX_PER_DAY) break;
    const at = from + (elapsed * (i + 1)) / (arrived + 1);
    const stars = clamp(fair + rnd.int(-1, 1), 1, 5);
    starsSum += stars;
    tips += incomePerSec(s) * 20;
    list.push({
      id: `g:${hourKey(ts)}:${i}`,
      name: makeName(rnd),
      at,
      expiresAt: at + GUEST_STAY_MS,
      stars,
    });
  }

  mutate((st) => {
    st.social.lastGuestRollAt = ts;
    const alive = (st.social.guests || []).filter((g) => g.expiresAt > ts);
    const merged = [...alive, ...list].slice(-MAX_CONCURRENT * 3);
    st.social.guests = merged;
    st.social.guestsToday = (st.social.guestsToday || 0) + list.length;
    if (list.length) {
      st.social.ratingsReceived.count += list.length;
      st.social.ratingsReceived.sum += starsSum;
    }
  }, { silent: true });

  if (list.length) {
    bump('guestsHosted', list.length);
    rewardCoins(tips, { xp: list.length * 12 });
    emit('social:changed');
    emit('toast', {
      text: `Гостей: +${list.length}. Оценки идут в бонус к доходу`,
      kind: 'good',
    });
  }
  return list.length;
}

export function activeGuestList(ts = now()) {
  return (getState().social.guests || []).filter((g) => g.expiresAt > ts);
}
