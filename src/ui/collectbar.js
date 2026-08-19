// Средняя зона: широкая кнопка сбора с заливкой-прогрессом банка.

import { el, clear } from '../core/dom.js';
import { short, rate, duration } from '../core/format.js';
import { getState } from '../state/store.js';
import { bankInfo, income } from '../state/selectors.js';
import { collect } from '../game/actions.js';

let root = null;
let btn = null;
let fill = null;
let label = null;
let rateEl = null;

export function initCollectBar() {
  root = document.getElementById('collect');
  clear(root);

  fill = el('span', { class: 'collect-fill' });
  label = el('span', { class: 'collect-label', text: 'Собрать · 0' });
  rateEl = el('span', { class: 'collect-rate', text: '0/сек' });
  btn = el('button', { class: 'collect-btn', type: 'button', onclick: onCollect }, fill, label, rateEl);

  root.append(btn);
  update();
}

function onCollect() {
  const amount = collect();
  if (amount > 0) {
    btn.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(.985)' }, { transform: 'scale(1)' }],
      { duration: 180, easing: 'ease-out' },
    );
  }
  update();
}

export function update() {
  if (!btn) return;
  const s = getState();
  const b = bankInfo(s);
  const perSec = income(s);

  fill.style.width = `${(b.ratio * 100).toFixed(1)}%`;
  label.textContent = `Собрать · ${short(b.amount)}`;
  btn.classList.toggle('full', b.full);

  if (b.full) {
    rateEl.textContent = 'банк полон';
  } else {
    const left = perSec > 0 ? ((b.capacity - b.amount) / perSec) * 1000 : 0;
    rateEl.textContent = `${rate(perSec)} · ${duration(left)}`;
  }
}
