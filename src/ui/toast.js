// Короткие сообщения над навигацией.

import { el } from '../core/dom.js';
import { on } from '../core/events.js';

let root = null;

export function initToasts() {
  root = document.getElementById('toasts');
  on('toast', ({ text, kind }) => toast(text, kind));
}

export function toast(text, kind = '') {
  if (!root) return;
  const node = el('div', { class: `toast ${kind}`, text });
  root.append(node);
  setTimeout(() => {
    node.style.transition = 'opacity .25s';
    node.style.opacity = '0';
    setTimeout(() => node.remove(), 260);
  }, 2200);
  while (root.childElementCount > 3) root.firstElementChild.remove();
}
