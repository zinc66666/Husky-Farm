// Первый запуск: выбор пола персонажа с живым превью фигуры.

import { el, clear } from '../../core/dom.js';
import { chooseGender } from '../../game/actions.js';
import { drawFigure } from '../../render/themes/vector/character/rig.js';
import { setAmbient } from '../../render/material.js';

let raf = 0;

export function mountOnboarding(root, onDone) {
  clear(root);
  setAmbient('#ffffff', 0, 'onboarding');

  let chosen = null;
  const cards = {};

  const wrap = el('div', { class: 'onb' },
    el('h1', { text: 'Кто ты за компьютером?' }),
    el('p', { text: 'Выбери персонажа — его комната, апгрейды и статус геймера будут расти вместе с тобой.' }),
  );

  const row = el('div', { class: 'genders' });
  for (const g of [{ id: 'm', label: 'Парень' }, { id: 'f', label: 'Девушка' }]) {
    const canvas = el('canvas', { width: 192, height: 264 });
    const card = el('button', { class: 'gender', type: 'button', onclick: () => pick(g.id) },
      canvas, el('span', { text: g.label }));
    cards[g.id] = { card, canvas, ctx: canvas.getContext('2d') };
    row.append(card);
  }

  const go = el('button', { class: 'btn wide', type: 'button', disabled: true, text: 'Начать', onclick: start });
  wrap.append(row, el('div', { style: { height: '22px' } }), go);
  root.append(wrap);

  function pick(id) {
    chosen = id;
    for (const [key, c] of Object.entries(cards)) c.card.classList.toggle('on', key === id);
    go.disabled = false;
  }

  function start() {
    if (!chosen) return;
    stop();
    chooseGender(chosen);
    onDone?.();
  }

  const t0 = performance.now();
  const tick = () => {
    const t = (performance.now() - t0) / 1000;
    for (const [gender, c] of Object.entries(cards)) {
      const { ctx, canvas } = c;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height - 12);
      ctx.scale(2, 2);
      drawFigure(ctx, { gender, activity: 'idle', t: t + (gender === 'f' ? 1.4 : 0), scale: 0.5 });
      ctx.restore();
    }
    raf = requestAnimationFrame(tick);
  };
  tick();

  pick('m');
  return stop;
}

function stop() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}
