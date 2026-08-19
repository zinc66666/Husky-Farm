// Держатель состояния: чтение, мутации, подписки, дебаунс-автосейв.

import { defaultState, mergeDefaults } from './schema.js';
import { runMigrations } from './migrations.js';
import { loadLocal, saveLocal, saveCloud, wipeLocal } from '../core/storage.js';
import { emit } from '../core/events.js';
import { now } from '../core/clock.js';

const SAVE_DEBOUNCE = 1200;

let state = defaultState();
let dirty = false;
let saveTimer = null;
const subs = new Set();

export function getState() {
  return state;
}

/** Единственный способ менять состояние: mutate(s => { ... }). */
export function mutate(fn, { silent = false } = {}) {
  const result = fn(state);
  dirty = true;
  scheduleSave();
  if (!silent) notify();
  return result;
}

export function subscribe(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}

export function notify() {
  for (const fn of [...subs]) {
    try {
      fn(state);
    } catch (err) {
      console.error('[store] subscriber', err);
    }
  }
}

function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    flush();
  }, SAVE_DEBOUNCE);
}

export function flush({ force = false } = {}) {
  if (!dirty && !force) return;
  dirty = false;
  state.savedAt = now();
  saveLocal(state);
  saveCloud(state, { force });
}

/** Загрузка при старте. Облако проверяется отдельно и позже — см. checkCloud(). */
export function initStore() {
  const { save, corrupted } = loadLocal();
  const fresh = defaultState();
  if (save) {
    state = mergeDefaults(fresh, runMigrations(save));
  } else {
    state = fresh;
  }
  state.stats.sessions++;
  return { corrupted, isNew: !save };
}

export function replaceState(next) {
  state = mergeDefaults(defaultState(), runMigrations(next));
  dirty = true;
  flush({ force: true });
  notify();
  emit('state:replaced', state);
}

export function resetAll() {
  wipeLocal();
  state = defaultState();
  dirty = true;
  flush({ force: true });
  notify();
}

// Гарантированный сброс на выгрузке/сворачивании.
const hardFlush = () => {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  flush({ force: true });
};
window.addEventListener('pagehide', hardFlush);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') hardFlush();
});
