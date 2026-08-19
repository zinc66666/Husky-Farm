// Форма сохранения. Одна сериализуемая структура на всю игру.

import { now } from '../core/clock.js';

export const SAVE_VERSION = 1;
export const SAVE_KEY = 'hf.save';
export const BROKEN_KEY = 'hf.save.broken';

export function defaultState(ts = now()) {
  return {
    v: SAVE_VERSION,
    createdAt: ts,
    savedAt: ts,
    lastTickAt: ts, // от него считается оффлайн-доход
    seed: null,     // назначается в онбординге

    player: {
      gender: null, // 'm' | 'f' — null запускает онбординг
      name: 'Игрок',
      xp: 0,
      rankIndex: 0,
      tgId: null,
      onboarded: false,
    },

    wallet: { coins: 0, totalEarned: 0 },

    bank: { amount: 0, lastAccrualAt: ts },

    rig: { pcTier: 0 },

    room: {
      wallColor: 'graphite',
      floorColor: 'wood',
      // slot → { itemId, color }
      items: {
        desk: { itemId: 'desk_basic', color: 'wood' },
        chair: { itemId: 'chair_basic', color: 'black' },
        monitor_main: { itemId: 'monitor_24', color: 'black' },
        rug: null,
      },
    },

    // itemId → true; докупать дубликаты не нужно, цвет — свойство размещения
    owned: { desk_basic: true, chair_basic: true, monitor_24: true },

    social: {
      ratingsReceived: { count: 0, sum: 0 },
      guests: [],        // [{ id, name, at, expiresAt, stars }]
      guestsToday: 0,
      visitsUsedToday: 0,
      dayKey: '',
      ratedToday: [],    // id соседей
      friends: [],       // [{ id, name, seed, addedAt }]
      lastGuestRollAt: ts,
    },

    quests: { dayKey: '', daily: {}, chain: {} },

    counters: {
      collects: 0, taps: 0, itemsBought: 0, visits: 0, ratingsGiven: 0,
      pcUpgrades: 0, coinsEarned: 0, guestsHosted: 0, recolors: 0,
    },

    focus: { until: 0, cooldownUntil: 0, taps: [] },

    settings: { haptics: true, reducedMotion: false, themeId: 'vector' },

    stats: { offlineClaimedTotal: 0, bestBank: 0, sessions: 0 },
  };
}

/** Глубокий merge загруженного сейва поверх дефолтов: новые поля получают значения без миграции. */
export function mergeDefaults(target, source) {
  if (!source || typeof source !== 'object') return target;
  for (const key of Object.keys(target)) {
    const t = target[key];
    const s = source[key];
    if (s === undefined) continue;
    if (Array.isArray(t)) {
      target[key] = Array.isArray(s) ? s : t;
    } else if (t && typeof t === 'object' && s && typeof s === 'object') {
      mergeDefaults(t, s);
    } else if (s !== null || t === null) {
      target[key] = s;
    } else {
      target[key] = s;
    }
  }
  // Поля, которых нет в дефолтах (например слоты комнаты), сохраняем как есть.
  for (const key of Object.keys(source)) {
    if (!(key in target)) target[key] = source[key];
  }
  return target;
}
