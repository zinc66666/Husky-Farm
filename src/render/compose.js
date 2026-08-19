// Сборка сцены из RoomModel. Отсюда рисуют и главный рендерер (со слоями),
// и превью комнаты соседа (без слоёв) — поэтому картинка гарантированно одна и та же.

import { ROOM, SLOTS } from '../data/slots.js';
import { getTheme, drawerFor } from './theme.js';
import { material } from './material.js';
import { applyLighting } from './lighting.js';

/** Цвет подсветки железа берём у клавиатуры или монитора — комната читается как единая. */
export function accentColor(model) {
  const kb = model.items.find((i) => i.slot === 'keyboard');
  if (kb?.color && kb.color !== 'black') return kb.color;
  const mon = model.items.find((i) => i.slot === 'monitor_main');
  if (mon?.color && mon.color !== 'black') return mon.color;
  return 'blue';
}

export function drawItem(ctx, item, { part = 'all', model, t = 0, world }) {
  const slot = SLOTS[item.slot];
  if (!slot) return;
  ctx.save();
  ctx.translate(slot.x, slot.y);
  drawerFor(item.draw)(ctx, {
    w: slot.w,
    h: slot.h,
    mat: material(item.color),
    accent: material(accentColor(model)),
    variant: item.variant,
    slot: item.slot,
    tier: model.pcTier,
    visual: model.pcVisual,
    part,
    t,
    world,
  });
  ctx.restore();
}

/** Вид за окном — самый дальний слой. */
export function drawOutside(ctx, world) {
  getTheme().window.drawOutside(ctx, { world, room: ROOM, t: 0 });
}

/** Всё, что не двигается: пол, стены, окно, мебель, системный блок. */
export function drawStaticScene(ctx, model, outsideCanvas, top = 0) {
  const theme = getTheme();
  const world = model.world;

  theme.room.drawFloor(ctx, { room: ROOM, mat: material(model.floorColor), world });
  theme.room.drawWalls(ctx, { room: ROOM, mat: material(model.wallColor), world, top });

  ctx.save();
  ctx.beginPath();
  ctx.rect(ROOM.window.x, ROOM.window.y, ROOM.window.w, ROOM.window.h);
  ctx.clip();
  if (outsideCanvas) ctx.drawImage(outsideCanvas, 0, 0);
  else drawOutside(ctx, world);
  ctx.restore();

  theme.room.drawWindowFrame(ctx, { room: ROOM, mat: material(model.wallColor), world });
  theme.room.drawDoor?.(ctx, { room: ROOM, mat: material(model.wallColor), world });

  for (const item of model.items) {
    if (item.slot === 'chair') {
      drawItem(ctx, item, { part: 'base', model, world });
      continue;
    }
    drawItem(ctx, item, { part: 'all', model, world });
  }

  // Системный блок рисуется всегда — это не покупка, а образ игрока.
  const slot = SLOTS.pc;
  ctx.save();
  ctx.translate(slot.x, slot.y);
  drawerFor('pc')(ctx, {
    w: slot.w, h: slot.h,
    mat: material('graphite'),
    accent: material(accentColor(model)),
    tier: model.pcTier,
    visual: model.pcVisual,
    variant: 'tower',
    part: 'all', t: 0, world,
  });
  ctx.restore();
}

/** Всё, что живёт: экраны, персонаж, спинка кресла, свет. */
export function drawDynamicScene(ctx, model, t, { skipLighting = false } = {}) {
  const theme = getTheme();
  const world = model.world;

  theme.effects?.drawScreens?.(ctx, { model, t, world });

  if (model.activity !== 'absent') {
    const pos = model.pos || { x: SLOTS.chair.x, y: SLOTS.chair.y - 38 };
    ctx.save();
    theme.character.draw(ctx, { model, pos, t: t + (model.activityT || 0), world });
    ctx.restore();
  }

  const chair = model.items.find((i) => i.slot === 'chair');
  if (chair) drawItem(ctx, chair, { part: 'back', model, t, world });

  theme.effects?.drawForeground?.(ctx, { model, t, world });

  if (!skipLighting) {
    applyLighting(ctx, world, lightingOpts(model, theme, t));
  }
}

export function lightingOpts(model, theme, t) {
  return {
    screenOn: model.activity === 'play' || model.activity === 'absent',
    screenTint: theme.effects?.screenTint?.(model, t) || '#7fb6ff',
    lampOn: !!model.items.find((i) => i.slot === 'lamp'),
    lampTint: lampTint(model),
  };
}

function lampTint(model) {
  const lamp = model.items.find((i) => i.slot === 'lamp');
  return lamp ? material(lamp.color).glow : '#ffd79a';
}
