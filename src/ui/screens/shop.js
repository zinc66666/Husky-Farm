// Магазин: апгрейды ПК и декор с перекраской. Превью предмета рисуется тем же
// кодом, что и комната, — карточка не может разойтись с тем, что видно на сцене.

import { el, clear, delegate } from '../../core/dom.js';
import { short } from '../../core/format.js';
import { getState } from '../../state/store.js';
import { rankFromXp, rankName } from '../../game/ranks.js';
import { tierInfo, nextTier, upgradePrice, MAX_TIER, PC_TIERS } from '../../game/upgrades.js';
import { allItems, itemById, recolorPrice } from '../../data/catalog.js';
import { SLOTS, SLOT_RANK } from '../../data/slots.js';
import { buyItem, upgradePc, recolor, removeSlot, setWallColor, setFloorColor } from '../../game/actions.js';
import { colorPicker } from '../components/colorpicker.js';
import { drawerFor } from '../../render/theme.js';
import { material } from '../../render/material.js';
import { colorSet } from '../../data/palettes.js';

const SLOT_LABEL = {
  desk: 'Стол', chair: 'Кресло', monitor_main: 'Монитор',
  monitor_side_l: 'Второй монитор', monitor_side_r: 'Третий монитор',
  rug: 'Ковёр', plant: 'Растение', desk_plant: 'Растение на стол',
  wall_art_1: 'Стена слева', wall_art_2: 'Стена справа', shelf: 'Полка',
  curtains: 'Занавески', lamp: 'Свет', organizer: 'Органайзер',
  keyboard: 'Клавиатура', mug: 'Кружка', headset: 'Наушники',
  console: 'Консоль', aquarium: 'Аквариум',
};

let tab = 'pc';
let root = null;

export const shopScreen = {
  mount(container) {
    root = el('div', { class: 'screen' });
    container.append(root);
    render();
    delegate(root, 'click', '[data-tab]', (_, node) => {
      tab = node.dataset.tab;
      render();
    });
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
  const rank = rankFromXp(s.player.xp);
  clear(root);

  root.append(
    el('div', { class: 'screen-head' },
      el('h2', { text: 'Магазин' }),
      el('span', { class: 'sub', text: `🪙 ${short(s.wallet.coins)}` })),
    el('div', { class: 'tabs' },
      tabBtn('pc', 'Компьютер'),
      tabBtn('decor', 'Декор'),
      tabBtn('room', 'Комната')),
  );

  const body = el('div', { class: 'screen-body' });
  root.append(body);

  if (tab === 'pc') renderPc(body, s);
  else if (tab === 'decor') renderDecor(body, s, rank);
  else renderRoom(body, s, rank);
}

function tabBtn(id, label) {
  return el('button', { class: `tab${tab === id ? ' active' : ''}`, type: 'button', data: { tab: id }, text: label });
}

// --- вкладка «Компьютер» ---

function renderPc(body, s) {
  const cur = tierInfo(s.rig.pcTier);
  const next = nextTier(s.rig.pcTier);
  const price = upgradePrice(s.rig.pcTier);

  const card = el('div', { class: 'card' },
    preview('pc', { visual: cur.visual, color: 'graphite' }),
    el('div', { class: 'grow' },
      el('div', { class: 'name', text: cur.name }),
      el('div', { class: 'desc', text: `Мощность ×${cur.power}. Уровень ${s.rig.pcTier} из ${MAX_TIER}.` })),
  );
  body.append(el('div', { class: 'section-title', text: 'Сейчас собрано' }), card);

  if (next) {
    const can = s.wallet.coins >= price;
    body.append(
      el('div', { class: 'section-title', text: 'Следующий уровень' }),
      el('div', { class: 'card' },
        preview('pc', { visual: next.visual, color: 'graphite' }),
        el('div', { class: 'grow' },
          el('div', { class: 'name', text: next.name }),
          el('div', { class: 'desc', text: `Мощность ×${next.power} — доход вырастет в ${(next.power / cur.power).toFixed(1)} раза` }),
          el('div', { class: 'price', text: `🪙 ${short(price)}` })),
        el('button', { class: 'btn', type: 'button', disabled: !can, text: 'Купить', onclick: () => upgradePc() })),
    );
  } else {
    body.append(el('div', { class: 'empty', text: 'Максимальная сборка. Дальше только декор и статус.' }));
  }

  body.append(el('div', { class: 'section-title', text: 'Вся линейка' }));
  for (let i = 0; i <= MAX_TIER; i++) {
    const t = PC_TIERS[i];
    body.append(el('div', { class: `rowline${i === s.rig.pcTier ? '' : ''}` },
      el('span', { text: `${i}. ${t.name}` }),
      el('span', { class: 'v', text: i <= s.rig.pcTier ? '✓' : `🪙 ${short(t.price)}` })));
  }
}

// --- вкладка «Декор» ---

function renderDecor(body, s, rank) {
  const bySlot = new Map();
  for (const item of allItems()) {
    if (item.slot === 'desk' || item.slot === 'chair' || item.slot === 'monitor_main') {
      // мебель тоже декор, но показываем её первой группой
    }
    if (!bySlot.has(item.slot)) bySlot.set(item.slot, []);
    bySlot.get(item.slot).push(item);
  }

  for (const [slot, items] of bySlot) {
    const need = SLOT_RANK[slot];
    const locked = need !== undefined && rank < need;
    body.append(el('div', { class: 'section-title', text: SLOT_LABEL[slot] || slot }));

    if (locked) {
      body.append(el('div', { class: 'card locked' },
        el('div', { class: 'grow' },
          el('div', { class: 'name', text: 'Место закрыто' }),
          el('div', { class: 'desc', text: `Откроется на ранге «${rankName(need)}»` }))));
      continue;
    }

    const placed = s.room.items[slot];
    for (const item of items) {
      body.append(itemCard(s, item, placed, rank));
    }
    if (placed) {
      body.append(el('button', {
        class: 'btn ghost wide', type: 'button', text: 'Убрать из комнаты',
        onclick: () => removeSlot(slot),
      }));
    }
  }
}

function itemCard(s, item, placed, rank) {
  const owned = !!s.owned[item.id];
  const active = placed?.itemId === item.id;
  const locked = rank < (item.requiresRank || 0);
  const can = owned || s.wallet.coins >= item.price;
  const color = active ? placed.color : item.defaultColor;

  const card = el('div', { class: `card${locked ? ' locked' : ''}` });
  const info = el('div', { class: 'grow' },
    el('div', { class: 'name', text: item.name }),
    el('div', { class: 'desc', text: `Уют +${item.decorScore}${item.comfort ? ` · ёмкость +${item.comfort * 30} мин` : ''}` }),
    el('div', { class: 'price', text: owned ? (active ? 'В комнате' : 'Куплено') : `🪙 ${short(item.price)}` }),
  );

  card.append(preview(item.draw, { variant: item.variant, color, slot: item.slot }), info);

  if (!locked) {
    card.append(el('button', {
      class: `btn${active ? ' ghost' : ''}`,
      type: 'button',
      disabled: active || !can,
      text: active ? 'Стоит' : owned ? 'Поставить' : 'Купить',
      onclick: () => buyItem(item.id),
    }));
  } else {
    card.append(el('span', { class: 'desc', text: `Ранг «${rankName(item.requiresRank)}»` }));
  }

  const wrap = el('div');
  wrap.append(card);

  if (active && item.tintable) {
    const price = recolorPrice(item, !!s.owned[`recolored:${item.id}`]);
    wrap.append(el('div', { class: 'desc', style: { margin: '-4px 4px 4px' }, text: price > 0 ? `Перекраска — 🪙 ${short(price)}` : 'Первая перекраска бесплатно' }));
    wrap.append(colorPicker({
      set: item.colors,
      value: color,
      onPick: (key) => recolor(item.slot, key),
    }));
    wrap.append(el('div', { style: { height: '10px' } }));
  }
  return wrap;
}

// --- вкладка «Комната» ---

function renderRoom(body, s, rank) {
  if (rank < 6) {
    body.append(el('div', { class: 'empty', text: `Смена цвета стен и пола откроется на ранге «${rankName(6)}».` }));
    return;
  }
  body.append(el('div', { class: 'section-title', text: 'Стены' }));
  body.append(colorPicker({ set: 'wall', value: s.room.wallColor, onPick: setWallColor }));
  body.append(el('div', { class: 'section-title', text: 'Пол' }));
  body.append(colorPicker({ set: 'wood', value: s.room.floorColor, onPick: setFloorColor }));
}

// --- превью предмета на маленьком canvas ---

function preview(drawKey, { variant, color = 'gray', visual, slot }) {
  const canvas = el('canvas', { class: 'thumb', width: 108, height: 108 });
  const ctx = canvas.getContext('2d');
  const size = SLOTS[slot] || { w: 120, h: 120 };
  const scale = Math.min(88 / Math.max(size.w, 40), 88 / Math.max(size.h, 40));

  ctx.save();
  ctx.translate(54, 96);
  ctx.scale(scale, scale);
  try {
    drawerFor(drawKey)(ctx, {
      w: size.w, h: size.h,
      mat: material(color),
      accent: material('blue'),
      variant, visual, part: 'all', t: 0,
      world: { light: { lamp: false, sun: 1 } },
      slot,
    });
  } catch (err) {
    console.warn('[shop] preview', drawKey, err);
  }
  ctx.restore();
  return canvas;
}
