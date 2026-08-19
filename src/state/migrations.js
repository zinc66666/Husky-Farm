// Миграции сейва: только аддитивные шаги, ничего не удаляем.
// Плюс к ним работает mergeDefaults — новые поля получают значения и без миграции.

import { SAVE_VERSION } from './schema.js';

export const MIGRATIONS = [
  // Пример будущего шага:
  // { to: 2, up(s) { s.settings.sound ??= false; return s; } },
];

export function runMigrations(save) {
  if (!save || typeof save !== 'object') return save;
  let s = save;
  const steps = [...MIGRATIONS].sort((a, b) => a.to - b.to);
  for (const step of steps) {
    if ((s.v || 0) < step.to) {
      s = step.up(s) || s;
      s.v = step.to;
    }
  }
  s.v = SAVE_VERSION;
  return s;
}
