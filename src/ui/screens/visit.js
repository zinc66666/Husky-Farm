// Комната соседа: тот же рендерер, что и своя, плюс виджет оценки.

import { el, clear } from '../../core/dom.js';
import { short } from '../../core/format.js';
import { getState } from '../../state/store.js';
import { getWorld } from '../../game/world.js';
import { Api } from '../../net/api.js';
import { CATEGORIES, alreadyRated, addFriend } from '../../game/ratings.js';
import { setTheme, getTheme } from '../../render/theme.js';
import { renderRoomTo } from '../../render/preview.js';
import { rankName } from '../../game/ranks.js';

let root = null;
let raf = 0;
let neighbor = null;

export const visitScreen = {
  async mount(container, ctx) {
    root = el('div', { class: 'screen' });
    container.append(root);
    clear(root);
    root.append(el('div', { class: 'empty', text: 'Заходим в гости…' }));

    if (!getTheme()) await setTheme('vector');
    neighbor = await Api.getNeighborRoom(ctx.id);
    if (!root) return;
    render();
  },
  update() {},
  unmount() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    root = null;
    neighbor = null;
  },
};

function render() {
  const s = getState();
  clear(root);

  root.append(el('div', { class: 'screen-head' },
    el('h2', { text: neighbor.owner.name }),
    el('span', { class: 'sub', text: rankName(neighbor.owner.rankIndex) })));

  const body = el('div', { class: 'screen-body' });
  root.append(body);

  const canvas = el('canvas', { width: 360, height: 500, style: { width: '100%', borderRadius: '14px', display: 'block' } });
  body.append(canvas);
  const ctx2d = canvas.getContext('2d');

  const t0 = performance.now();
  const tick = () => {
    const t = (performance.now() - t0) / 1000;
    renderRoomTo(ctx2d, { ...neighbor, world: getWorld() }, canvas.width, canvas.height, t);
    raf = requestAnimationFrame(tick);
  };
  tick();

  body.append(el('div', { class: 'section-title', text: `Уют ${neighbor.decorScore} · ПК уровня ${neighbor.pcTier} · ${neighbor.items.length} вещей` }));

  const stars = { room: 0, pc: 0, decor: 0 };
  const rated = alreadyRated(s, neighbor.id);

  if (rated) {
    body.append(el('div', { class: 'empty', text: 'Ты уже оценил эту комнату сегодня. Возвращайся завтра.' }));
  } else {
    for (const cat of CATEGORIES) {
      const row = el('div', { class: 'rowline' }, el('span', { text: cat.label }));
      const group = el('div', { class: 'stars' });
      for (let i = 1; i <= 5; i++) {
        const btn = el('button', { class: 'star', type: 'button', text: '★', onclick: () => {
          stars[cat.id] = i;
          for (let k = 0; k < 5; k++) group.children[k].classList.toggle('on', k < i);
          send.disabled = !(stars.room && stars.pc && stars.decor);
        } });
        group.append(btn);
      }
      row.append(group);
      body.append(row);
    }

    const send = el('button', {
      class: 'btn wide mint', type: 'button', disabled: true, text: 'Отправить оценку',
      onclick: async () => {
        send.disabled = true;
        const res = await Api.rateNeighbor(neighbor.id, stars);
        if (res.ok) {
          body.querySelectorAll('.stars').forEach((n) => { n.style.pointerEvents = 'none'; });
          send.textContent = `Спасибо! +🪙 ${short(res.reward)}`;
        }
      },
    });
    body.append(el('div', { style: { height: '8px' } }), send);
  }

  const isFriend = s.social.friends.some((f) => f.id === neighbor.id);
  body.append(el('div', { style: { height: '10px' } }), el('button', {
    class: 'btn wide ghost', type: 'button', disabled: isFriend,
    text: isFriend ? 'Уже в друзьях' : 'Добавить в друзья',
    onclick: () => {
      addFriend(neighbor);
      render();
    },
  }));
}
