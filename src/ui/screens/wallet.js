// Кошелёк: баланс, из чего складывается доход, ранг, статистика, приглашение.

import { el, clear } from '../../core/dom.js';
import { short, rate, duration, pct } from '../../core/format.js';
import { getState } from '../../state/store.js';
import { bankInfo, rankInfo, activeGuests } from '../../state/selectors.js';
import {
  incomePerSec, decorMult, rankMult, ratingMult, guestMult, focusMult, decorStats, capacitySec,
} from '../../game/economy.js';
import { RANKS } from '../../game/ranks.js';
import { tierInfo } from '../../game/upgrades.js';
import { averageReceived } from '../../game/ratings.js';
import { tg } from '../../platform/telegram.js';

let root = null;

export const walletScreen = {
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
  const b = bankInfo(s);
  const r = rankInfo(s);
  const perSec = incomePerSec(s);
  const stats = decorStats(s.room);
  clear(root);

  root.append(el('div', { class: 'screen-head' },
    el('h2', { text: 'Кошелёк' }),
    el('span', { class: 'sub', text: r.name })));

  const body = el('div', { class: 'screen-body' });
  root.append(body);

  body.append(el('div', { class: 'card' },
    el('div', { class: 'grow' },
      el('div', { class: 'desc', text: 'Баланс' }),
      el('div', { class: 'name', style: { fontSize: '26px' }, text: `🪙 ${short(s.wallet.coins)}` }),
      el('div', { class: 'desc', text: `${rate(perSec)} · в банке ${short(b.amount)} из ${short(b.capacity)}` }),
      el('span', { class: 'bar' }, el('i', { style: { width: `${b.ratio * 100}%` } })))));

  body.append(el('div', { class: 'section-title', text: 'Из чего складывается доход' }));
  const rows = [
    ['Компьютер', `${tierInfo(s.rig.pcTier).name} · ×${tierInfo(s.rig.pcTier).power}`],
    ['Декор', `×${decorMult(s.room).toFixed(2)} (уют ${stats.score}${stats.harmony ? ', гармония' : ''})`],
    ['Ранг', `×${rankMult(r.index).toFixed(2)}`],
    ['Оценки гостей', `×${ratingMult(s.social).toFixed(2)} (${s.social.ratingsReceived.count} шт., средняя ${averageReceived(s).toFixed(1)})`],
    ['Гости сейчас', `×${guestMult(s.social).toFixed(2)} (${activeGuests(s).length})`],
    ['Фокус', focusMult(s.focus) > 1 ? 'активен ×1.25' : 'не активен'],
    ['Ёмкость банка', duration(capacitySec(s) * 1000)],
  ];
  for (const [k, v] of rows) {
    body.append(el('div', { class: 'rowline' }, el('span', { text: k }), el('span', { class: 'v', text: v })));
  }

  body.append(el('div', { class: 'section-title', text: 'Ранг' }));
  body.append(el('div', { class: 'card' },
    el('div', { class: 'grow' },
      el('div', { class: 'name', text: r.name }),
      el('div', { class: 'desc', text: r.toNext > 0 ? `До «${RANKS[r.index + 1].name}» ещё ${short(r.toNext)} XP` : 'Максимальный статус' }),
      el('span', { class: 'bar mint' }, el('i', { style: { width: `${r.progress * 100}%` } })),
      RANKS[r.index]?.unlock ? el('div', { class: 'desc', text: `Открыто: ${RANKS[r.index].unlock}` }) : null)));

  body.append(el('div', { class: 'section-title', text: 'Статистика' }));
  const st = [
    ['Всего заработано', `🪙 ${short(s.wallet.totalEarned)}`],
    ['Сборов', short(s.counters.collects)],
    ['Тапов', short(s.counters.taps)],
    ['Куплено вещей', short(s.counters.itemsBought)],
    ['Визитов', short(s.counters.visits)],
    ['Принято гостей', short(s.counters.guestsHosted)],
    ['Оффлайн-доход', `🪙 ${short(s.stats.offlineClaimedTotal)}`],
  ];
  for (const [k, v] of st) {
    body.append(el('div', { class: 'rowline' }, el('span', { text: k }), el('span', { class: 'v', text: v })));
  }

  body.append(el('div', { style: { height: '12px' } }));
  body.append(el('button', {
    class: 'btn wide ghost', type: 'button', text: 'Позвать друга в игру',
    onclick: () => {
      const link = `https://t.me/share/url?url=${encodeURIComponent(location.href)}`;
      if (tg.available) tg.share('Собираю комнату геймера в Husky Farm — заходи!', location.href);
      else window.open(link, '_blank');
    },
  }));
}
