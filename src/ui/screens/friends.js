// Соседи и друзья: лента комнат, поход в гости, список гостей у себя.

import { el, clear } from '../../core/dom.js';
import { short, plural } from '../../core/format.js';
import { getState } from '../../state/store.js';
import { Api } from '../../net/api.js';
import { rankName } from '../../game/ranks.js';
import { visitsLeft, alreadyRated, useVisit } from '../../game/ratings.js';
import { activeGuestList } from '../../game/guests.js';
import { openScreen } from '../ui.js';

let root = null;
let tab = 'feed';
let feed = null;
let loading = false;

export const friendsScreen = {
  mount(container) {
    root = el('div', { class: 'screen' });
    container.append(root);
    render();
    if (!feed) load();
  },
  update() {
    if (root) render();
  },
  unmount() {
    root = null;
  },
};

async function load() {
  loading = true;
  render();
  try {
    const res = await Api.listNeighbors({ limit: 12 });
    feed = res.items;
  } catch (err) {
    console.warn('[friends] load', err);
    feed = [];
  }
  loading = false;
  if (root) render();
}

function render() {
  const s = getState();
  clear(root);

  root.append(
    el('div', { class: 'screen-head' },
      el('h2', { text: 'Друзья' }),
      el('span', { class: 'sub', text: `визитов сегодня: ${visitsLeft(s)}` })),
    el('div', { class: 'tabs' },
      tabBtn('feed', 'Соседи'),
      tabBtn('friends', `Друзья (${s.social.friends.length})`),
      tabBtn('guests', 'Гости')),
  );

  const body = el('div', { class: 'screen-body' });
  root.append(body);

  if (tab === 'feed') renderFeed(body, s);
  else if (tab === 'friends') renderFriends(body, s);
  else renderGuests(body, s);
}

function tabBtn(id, label) {
  return el('button', {
    class: `tab${tab === id ? ' active' : ''}`, type: 'button', text: label,
    onclick: () => { tab = id; render(); },
  });
}

function renderFeed(body, s) {
  if (loading) {
    body.append(el('div', { class: 'empty', text: 'Ищем, к кому заглянуть…' }));
    return;
  }
  if (!feed?.length) {
    body.append(el('div', { class: 'empty', text: 'Соседей пока не видно. Загляни позже.' }));
    return;
  }
  const left = visitsLeft(s);
  for (const n of feed) {
    const rated = alreadyRated(s, n.id);
    body.append(el('div', { class: 'card' },
      el('div', { class: 'grow' },
        el('div', { class: 'name', text: n.name }),
        el('div', { class: 'desc', text: `${rankName(n.rankIndex)} · ПК ${n.pcTier} · ${n.items} ${plural(n.items, 'вещь', 'вещи', 'вещей')}` }),
        el('span', { class: 'bar mint' }, el('i', { style: { width: `${n.quality * 100}%` } }))),
      el('button', {
        class: 'btn', type: 'button',
        disabled: left <= 0 && !rated,
        text: rated ? 'Зайти' : 'В гости',
        onclick: () => visit(n.id, rated),
      })));
  }
  body.append(el('button', { class: 'btn ghost wide', type: 'button', text: 'Обновить ленту', onclick: load }));
}

function renderFriends(body, s) {
  if (!s.social.friends.length) {
    body.append(el('div', { class: 'empty', text: 'Друзей пока нет. Загляни к соседям и добавь тех, чья комната понравилась.' }));
    return;
  }
  for (const f of s.social.friends) {
    body.append(el('div', { class: 'card' },
      el('div', { class: 'grow' },
        el('div', { class: 'name', text: f.name }),
        el('div', { class: 'desc', text: 'В друзьях — его комната всегда доступна' })),
      el('button', { class: 'btn', type: 'button', text: 'Зайти', onclick: () => visit(f.id, true) })));
  }
}

function renderGuests(body, s) {
  const guests = activeGuestList();
  body.append(el('div', { class: 'section-title', text: 'Сейчас в комнате' }));
  if (!guests.length) {
    body.append(el('div', { class: 'empty', text: 'Гостей нет. Чем уютнее комната и чем чаще ты ходишь в гости сам, тем больше их приходит.' }));
  } else {
    for (const g of guests) {
      body.append(el('div', { class: 'rowline' },
        el('span', { text: g.name }),
        el('span', { class: 'v', text: '★'.repeat(g.stars) })));
    }
  }
  const r = s.social.ratingsReceived;
  body.append(el('div', { class: 'section-title', text: 'Всего оценок' }));
  body.append(el('div', { class: 'rowline' },
    el('span', { text: 'Получено оценок' }),
    el('span', { class: 'v', text: short(r.count) })));
  body.append(el('div', { class: 'rowline' },
    el('span', { text: 'Средняя' }),
    el('span', { class: 'v', text: r.count ? (r.sum / r.count).toFixed(2) : '—' })));
  body.append(el('div', { class: 'rowline' },
    el('span', { text: 'Гостей сегодня' }),
    el('span', { class: 'v', text: short(s.social.guestsToday || 0) })));
}

function visit(id, alreadySpent) {
  if (!alreadySpent) useVisit();
  openScreen('visit', { id });
}
