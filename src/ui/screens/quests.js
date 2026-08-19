// Задания: ежедневки и цепочки, награды в минутах текущего дохода.

import { el, clear } from '../../core/dom.js';
import { short, duration } from '../../core/format.js';
import { getState } from '../../state/store.js';
import { questList, claim } from '../../game/quests.js';
import { incomePerSec } from '../../game/economy.js';
import { msUntilMidnight } from '../../core/clock.js';

let root = null;

export const questsScreen = {
  mount(container) {
    root = el('div', { class: 'screen' });
    container.append(root);
    render();
  },
  update() {
    if (root) render();
  },
  unmount() {
    root = null;
  },
};

function render() {
  const s = getState();
  const list = questList();
  const perSec = incomePerSec(s);
  clear(root);

  root.append(
    el('div', { class: 'screen-head' },
      el('h2', { text: 'Задания' }),
      el('span', { class: 'sub', text: `сброс через ${duration(msUntilMidnight())}` })),
  );

  const body = el('div', { class: 'screen-body' });
  root.append(body);

  body.append(el('div', { class: 'section-title', text: 'Сегодня' }));
  for (const q of list.daily) body.append(questCard(q, perSec));

  body.append(el('div', { class: 'section-title', text: 'Достижения' }));
  for (const q of list.chain) body.append(questCard(q, perSec));
}

function questCard(q, perSec) {
  const ratio = q.goal > 0 ? Math.min(1, q.progress / q.goal) : 0;
  const reward = perSec * 60 * q.reward.min;

  const bar = el('span', { class: `bar${q.done ? ' mint' : ''}` }, el('i', { style: { width: `${ratio * 100}%` } }));

  return el('div', { class: `card${q.claimed ? ' locked' : ''}` },
    el('div', { class: 'grow' },
      el('div', { class: 'name', text: q.title }),
      el('div', { class: 'desc', text: `${short(q.progress)} / ${short(q.goal)} · награда 🪙 ${short(reward)}${q.reward.xp ? ` + ${q.reward.xp} XP` : ''}` }),
      bar),
    q.claimed
      ? el('span', { class: 'desc', text: 'Получено' })
      : el('button', {
          class: 'btn mint', type: 'button', disabled: !q.done, text: q.done ? 'Забрать' : 'В процессе',
          onclick: () => claim(q.id),
        }),
  );
}
