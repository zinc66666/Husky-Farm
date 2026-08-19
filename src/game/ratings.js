// Оценки и бонусы за них.

import { getState, mutate } from '../state/store.js';
import { incomePerSec } from './economy.js';
import { rankFromXp } from './ranks.js';
import { clamp } from '../core/format.js';
import { emit } from '../core/events.js';
import { rewardCoins, bump } from './actions.js';

export const CATEGORIES = [
  { id: 'room', label: 'Комната' },
  { id: 'pc', label: 'Компьютер' },
  { id: 'decor', label: 'Декор' },
];

/** Сколько визитов в день доступно: 5 + ранг, максимум 15. */
export function visitBudget(state) {
  return Math.min(15, 5 + rankFromXp(state.player.xp));
}

export function visitsLeft(state) {
  return Math.max(0, visitBudget(state) - (state.social.visitsUsedToday || 0));
}

export function alreadyRated(state, neighborId) {
  return (state.social.ratedToday || []).includes(neighborId);
}

/** Ожидаемая «честная» оценка по качеству комнаты. */
export function fairStars(quality) {
  return Math.round(quality * 4 + 1);
}

/**
 * Игрок оценивает соседа. Возвращает начисленную награду.
 * За честную оценку — бонус: так лента не превращается в раздачу пятёрок.
 */
export function rateNeighbor(neighbor, stars) {
  const s = getState();
  if (alreadyRated(s, neighbor.id)) {
    emit('toast', { text: 'Этого соседа ты уже оценил сегодня', kind: 'warn' });
    return 0;
  }
  const given = (stars.room + stars.pc + stars.decor) / 3;
  const fair = fairStars(neighbor.quality);
  const honest = Math.abs(given - fair) <= 1;

  let reward = incomePerSec(s) * 90 * (1 + 0.1 * neighbor.owner.rankIndex);
  if (honest) reward *= 1.25;

  mutate((st) => {
    st.social.ratedToday = [...(st.social.ratedToday || []), neighbor.id];
  });
  bump('ratingsGiven');
  rewardCoins(reward, {
    xp: 30 + neighbor.owner.rankIndex * 8,
    reason: honest ? 'Честная оценка: награда +25%' : 'Оценка отправлена',
  });
  emit('social:changed');
  return reward;
}

export function useVisit() {
  mutate((st) => {
    st.social.visitsUsedToday = (st.social.visitsUsedToday || 0) + 1;
  });
  bump('visits');
}

export function addFriend(neighbor) {
  const s = getState();
  if (s.social.friends.some((f) => f.id === neighbor.id)) return false;
  mutate((st) => {
    st.social.friends = [
      ...st.social.friends,
      { id: neighbor.id, name: neighbor.owner.name, seed: neighbor.seed, addedAt: Date.now() },
    ];
  });
  emit('toast', { text: `${neighbor.owner.name} теперь в друзьях`, kind: 'good' });
  emit('social:changed');
  return true;
}

export function averageReceived(state) {
  const r = state.social.ratingsReceived;
  return r.count > 0 ? clamp(r.sum / r.count, 1, 5) : 0;
}
