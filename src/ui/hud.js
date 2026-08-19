// Верхняя строка: монеты, ранг, гости, время и погода. Плавающие чипы без плашки.

import { el, clear } from '../core/dom.js';
import { short } from '../core/format.js';
import { getState } from '../state/store.js';
import { rankInfo, activeGuests } from '../state/selectors.js';
import { getWorld } from '../game/world.js';

let root = null;
let nodes = null;

export function initHud() {
  root = document.getElementById('hud');
  build();
  update();
}

function build() {
  clear(root);
  const coins = el('div', { class: 'hud-chip coins' },
    el('span', { class: 'ico', text: '🪙' }),
    el('span', { class: 'v', text: '0' }));

  const bar = el('i');
  const rank = el('div', { class: 'hud-chip rank' },
    el('span', { class: 'n', text: '—' }),
    el('span', { class: 'hud-rank-bar' }, bar));

  const guests = el('div', { class: 'hud-chip guests', style: { display: 'none' } },
    el('span', { class: 'ico', text: '👥' }),
    el('span', { class: 'v', text: '0' }));

  const world = el('div', { class: 'hud-chip world' }, el('span', { class: 'v', text: '' }));

  root.append(coins, rank, guests, world);
  nodes = {
    coins: coins.querySelector('.v'),
    rankName: rank.querySelector('.n'),
    rankBar: bar,
    guests,
    guestsVal: guests.querySelector('.v'),
    world: world.querySelector('.v'),
  };
}

export function update() {
  if (!nodes) return;
  const s = getState();
  const r = rankInfo(s);
  const w = getWorld();
  const g = activeGuests(s).length;

  nodes.coins.textContent = short(s.wallet.coins);
  nodes.rankName.textContent = r.name;
  nodes.rankBar.style.width = `${Math.round(r.progress * 100)}%`;
  nodes.guests.style.display = g > 0 ? '' : 'none';
  nodes.guestsVal.textContent = String(g);

  const hh = String(Math.floor(w.hour)).padStart(2, '0');
  const mm = String(Math.floor((w.hour % 1) * 60)).padStart(2, '0');
  const icon = { clear: '☀️', cloudy: '☁️', rain: '🌧', hail: '🧊', fog: '🌫', snow: '❄️' }[w.weather] || '';
  nodes.world.textContent = `${hh}:${mm} ${icon} ${w.seasonName}`;
}
