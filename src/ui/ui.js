// Роутер экранов: один смонтированный оверлей поверх сцены (но не поверх навигации).

import { clear } from '../core/dom.js';
import { setFpsCap } from '../core/loop.js';
import { tg } from '../platform/telegram.js';
import { getState } from '../state/store.js';

const registry = new Map();
let overlay = null;
let active = null;
let activeId = null;
let hideBack = null;
let pushedHistory = false;

export function initUi() {
  overlay = document.getElementById('overlay');
  window.addEventListener('popstate', () => {
    pushedHistory = false;
    if (activeId) closeScreen();
  });
}

/** screen: { mount(root, ctx), update?(state), unmount?() } */
export function registerScreen(id, screen) {
  registry.set(id, screen);
}

export function currentScreen() {
  return activeId;
}

export function openScreen(id, ctx = {}) {
  const screen = registry.get(id);
  if (!screen) return false;
  if (activeId) unmountActive();

  activeId = id;
  active = screen;
  clear(overlay);
  overlay.classList.add('open', 'anim');
  screen.mount(overlay, ctx);
  setFpsCap(20); // за оверлеем сцена всё ещё живёт, но экономит батарею

  hideBack = tg.back.show(() => closeScreen());
  if (!pushedHistory) {
    history.pushState({ hf: id }, '');
    pushedHistory = true;
  }
  return true;
}

export function closeScreen() {
  if (!activeId) return;
  unmountActive();
  overlay.classList.remove('open', 'anim');
  clear(overlay);
  setFpsCap(0);
  if (typeof hideBack === 'function') hideBack();
  hideBack = null;
  tg.back.hide();
  if (pushedHistory) {
    pushedHistory = false;
    history.back();
  }
  import('./navbar.js').then((m) => m.setActive('home'));
}

function unmountActive() {
  try {
    active?.unmount?.();
  } catch (err) {
    console.error('[ui] unmount', err);
  }
  active = null;
  activeId = null;
}

/** Дёргается при изменении состояния — экран сам решает, что перерисовать. */
export function updateActiveScreen() {
  try {
    active?.update?.(getState());
  } catch (err) {
    console.error('[ui] update', err);
  }
}

// --- Модалка ---

export function showModal(node) {
  const modal = document.getElementById('modal');
  clear(modal);
  modal.append(node);
  modal.classList.add('open');
}

export function hideModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('open');
  clear(modal);
}
