// Нижняя панель: пять пунктов, без рамок — активный помечен цветом и точкой.

import { el, clear, icon } from '../core/dom.js';
import { tg } from '../platform/telegram.js';
import { openScreen, closeScreen, currentScreen } from './ui.js';

export const NAV = [
  { id: 'home', label: 'Дом', ico: 'home' },
  { id: 'shop', label: 'Магазин', ico: 'shop' },
  { id: 'quests', label: 'Задания', ico: 'quests' },
  { id: 'friends', label: 'Друзья', ico: 'friends' },
  { id: 'wallet', label: 'Кошелёк', ico: 'wallet' },
];

let root = null;
const buttons = new Map();

export function initNavbar() {
  root = document.getElementById('nav');
  clear(root);
  for (const item of NAV) {
    const btn = el('button', {
      class: 'nav-item',
      type: 'button',
      html: `${icon(item.ico)}<span>${item.label}</span>`,
      onclick: () => select(item.id),
    });
    buttons.set(item.id, btn);
    root.append(btn);
  }
  setActive('home');
}

function select(id) {
  tg.haptic.select();
  if (id === 'home') {
    closeScreen();
    setActive('home');
    return;
  }
  if (currentScreen() === id) {
    closeScreen();
    setActive('home');
    return;
  }
  openScreen(id);
  setActive(id);
}

export function setActive(id) {
  for (const [key, btn] of buttons) btn.classList.toggle('active', key === id);
}

export function setBadge(id, on) {
  const btn = buttons.get(id);
  if (!btn) return;
  const existing = btn.querySelector('.badge');
  if (on && !existing) btn.append(el('span', { class: 'badge' }));
  if (!on && existing) existing.remove();
}
