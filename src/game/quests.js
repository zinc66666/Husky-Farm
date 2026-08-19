// Задания целиком на счётчиках: actions.js только увеличивает счётчик,
// поэтому новое задание не трогает игровую логику.
// Награды заданы в минутах текущего дохода и потому масштабируются сами.

import { getState, mutate } from '../state/store.js';
import { dayKey } from '../core/clock.js';
import { seeded } from '../core/rng.js';
import { emit } from '../core/events.js';
import { incomePerSec } from './economy.js';
import { rewardCoins } from './actions.js';

export const DAILY_POOL = [
  { id: 'd_collect', counter: 'collects', goal: 5, title: 'Собери доход 5 раз', reward: { min: 15, xp: 40 } },
  { id: 'd_taps', counter: 'taps', goal: 30, title: 'Сделай 30 тапов по комнате', reward: { min: 10, xp: 30 } },
  { id: 'd_visits', counter: 'visits', goal: 3, title: 'Загляни к трём соседям', reward: { min: 25, xp: 70 } },
  { id: 'd_rate', counter: 'ratingsGiven', goal: 3, title: 'Оцени три комнаты', reward: { min: 25, xp: 70 } },
  { id: 'd_buy', counter: 'itemsBought', goal: 1, title: 'Купи предмет в магазин комнаты', reward: { min: 20, xp: 60 } },
  { id: 'd_guests', counter: 'guestsHosted', goal: 3, title: 'Прими трёх гостей', reward: { min: 30, xp: 80 } },
  { id: 'd_upgrade', counter: 'pcUpgrades', goal: 1, title: 'Апгрейдни компьютер', reward: { min: 40, xp: 120 } },
  { id: 'd_recolor', counter: 'recolors', goal: 2, title: 'Перекрась две вещи', reward: { min: 15, xp: 40 } },
  { id: 'd_earn', counter: 'coinsEarned', goalFactor: 900, title: 'Заработай доход за 15 минут', reward: { min: 20, xp: 50 } },
];

export const CHAINS = [
  { id: 'c_rank3', counter: 'rankIndex', goal: 3, title: 'Дорасти до ранга «Геймер»', reward: { min: 60, xp: 0 } },
  { id: 'c_rank6', counter: 'rankIndex', goal: 6, title: 'Дорасти до ранга «Про»', reward: { min: 120, xp: 0 } },
  { id: 'c_pc4', counter: 'pcTier', goal: 4, title: 'Собери ПК 4 уровня', reward: { min: 90, xp: 200 } },
  { id: 'c_pc7', counter: 'pcTier', goal: 7, title: 'Поставь водяное охлаждение', reward: { min: 200, xp: 800 } },
  { id: 'c_decor5', counter: 'itemsBought', goal: 5, title: 'Купи 5 предметов декора', reward: { min: 50, xp: 150 } },
  { id: 'c_decor20', counter: 'itemsBought', goal: 20, title: 'Купи 20 предметов декора', reward: { min: 180, xp: 900 } },
  { id: 'c_friends', counter: 'friends', goal: 10, title: 'Заведи 10 друзей', reward: { min: 150, xp: 600 } },
  { id: 'c_earn1m', counter: 'coinsEarned', goal: 1_000_000, title: 'Заработай 1M монет всего', reward: { min: 120, xp: 400 } },
];

/** Значение счётчика для задания — часть из counters, часть производная. */
function counterValue(state, counter, quest) {
  switch (counter) {
    case 'rankIndex': return state.player.rankIndex;
    case 'pcTier': return state.rig.pcTier;
    case 'friends': return state.social.friends.length;
    default: return state.counters[counter] || 0;
  }
}

function goalOf(quest, state) {
  if (quest.goalFactor) return Math.round(incomePerSec(state) * quest.goalFactor);
  return quest.goal;
}

/** Пять ежедневок на сутки, детерминированно от даты и сида игрока. */
export function ensureDaily(ts = Date.now()) {
  const key = dayKey(ts);
  const s = getState();
  if (s.quests.dayKey === key && Object.keys(s.quests.daily).length) return;

  const rnd = seeded(`daily:${key}:${s.seed || 'x'}`);
  const chosen = rnd.shuffle(DAILY_POOL).slice(0, 5);
  mutate((st) => {
    st.quests.dayKey = key;
    st.quests.daily = {};
    for (const q of chosen) {
      st.quests.daily[q.id] = { base: counterValue(st, q.counter, q), claimed: false };
    }
  });
  emit('quests:reset');
}

/** Список заданий с прогрессом для экрана. */
export function questList() {
  const s = getState();
  const out = { daily: [], chain: [] };

  for (const q of DAILY_POOL) {
    const rec = s.quests.daily[q.id];
    if (!rec) continue;
    const goal = goalOf(q, s);
    const progress = Math.max(0, counterValue(s, q.counter, q) - (rec.base || 0));
    out.daily.push({
      ...q, goal, progress: Math.min(progress, goal),
      done: progress >= goal, claimed: !!rec.claimed, kind: 'daily',
    });
  }

  for (const q of CHAINS) {
    const rec = s.quests.chain[q.id] || {};
    const goal = goalOf(q, s);
    const progress = counterValue(s, q.counter, q);
    out.chain.push({
      ...q, goal, progress: Math.min(progress, goal),
      done: progress >= goal, claimed: !!rec.claimed, kind: 'chain',
    });
  }
  out.chain.sort((a, b) => (a.claimed === b.claimed ? 0 : a.claimed ? 1 : -1));
  return out;
}

export function claimableCount() {
  const list = questList();
  return [...list.daily, ...list.chain].filter((q) => q.done && !q.claimed).length;
}

export function claim(id) {
  const s = getState();
  const all = questList();
  const quest = [...all.daily, ...all.chain].find((q) => q.id === id);
  if (!quest || !quest.done || quest.claimed) return false;

  const coins = incomePerSec(s) * 60 * quest.reward.min;
  mutate((st) => {
    const bucket = quest.kind === 'daily' ? st.quests.daily : st.quests.chain;
    bucket[id] = { ...(bucket[id] || {}), claimed: true };
  });
  rewardCoins(coins, { xp: quest.reward.xp, reason: `Награда: ${quest.title}` });
  emit('quests:changed');
  return true;
}
