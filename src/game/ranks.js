// Ранги геймера: статус, порог XP и что он открывает.

export const RANKS = [
  { name: 'Нуб',            xp: 0,         unlock: null },
  { name: 'Новичок',        xp: 250,       unlock: 'Магазин декора' },
  { name: 'Казуал',         xp: 900,       unlock: 'Визиты к соседям' },
  { name: 'Геймер',         xp: 2_500,     unlock: 'Второй монитор и друзья' },
  { name: 'Задрот',         xp: 6_500,     unlock: 'Настенный декор' },
  { name: 'Скилловик',      xp: 16_000,    unlock: 'Продвинутый декор' },
  { name: 'Про',            xp: 40_000,    unlock: 'Смена цвета стен и пола' },
  { name: 'Киберспортсмен', xp: 95_000,    unlock: 'Люкс-декор' },
  { name: 'Стример',        xp: 220_000,   unlock: '+3 визита в день' },
  { name: 'Легенда',        xp: 500_000,   unlock: 'Причёски персонажа' },
  { name: 'Мастер игры',    xp: 1_200_000, unlock: 'Золотая рамка профиля' },
];

export const MAX_RANK = RANKS.length - 1;

export function rankFromXp(xp) {
  let i = 0;
  while (i < MAX_RANK && xp >= RANKS[i + 1].xp) i++;
  return i;
}

export function rankName(index) {
  return RANKS[Math.max(0, Math.min(MAX_RANK, index | 0))].name;
}

/** Прогресс до следующего ранга: 0..1 (на максимуме — 1). */
export function rankProgress(xp) {
  const i = rankFromXp(xp);
  if (i >= MAX_RANK) return 1;
  const from = RANKS[i].xp;
  const to = RANKS[i + 1].xp;
  return Math.max(0, Math.min(1, (xp - from) / (to - from)));
}

export function xpToNext(xp) {
  const i = rankFromXp(xp);
  return i >= MAX_RANK ? 0 : RANKS[i + 1].xp - xp;
}
