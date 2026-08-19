// Оркестратор рендера: слои, трансформ комната→экран, частицы.
// Ни одной формы: все фигуры живут в теме, сборка сцены — в compose.js.

import { ROOM } from '../data/slots.js';
import { getTheme } from './theme.js';
import { ensure, markDirty, redrawCounts } from './layers.js';
import { setAmbient, material } from './material.js';
import { drawStaticScene, drawDynamicScene, drawOutside, lightingOpts } from './compose.js';
import { applyLighting } from './lighting.js';
import * as fx from './fx.js';
import { isPrecipitation } from '../game/weather.js';

let view = { scale: 1, ox: 0, oy: 0, cssW: 0, cssH: 0 };
let lastWorldKey = '';
let lastRoomKey = '';
let elapsed = 0;

export function resize(cssW, cssH) {
  view.cssW = cssW;
  view.cssH = cssH;
  // cover: сцена заполняет зону целиком. Пропорция комнаты подобрана под
  // вертикальный экран, поэтому по бокам срезается лишь пара сантиметров стены.
  view.scale = Math.max(cssW / ROOM.w, cssH / ROOM.h);
  view.ox = (cssW - ROOM.w * view.scale) / 2;
  // Низ комнаты прижат к низу сцены. Если сверху остаётся место, его
  // закрашивает продолжение стены; если не хватает — срезается потолок.
  view.oy = cssH - ROOM.h * view.scale;
  // Сколько единиц комнаты остаётся над её потолком — эту полосу дорисовываем
  // как продолжение стены, чтобы сверху не было чёрного провала.
  view.overhang = Math.ceil(Math.max(0, view.oy) / view.scale);
  markDirty('all');
}

export function screenToRoom(x, y) {
  return { x: (x - view.ox) / view.scale, y: (y - view.oy) / view.scale };
}

export function roomToScreen(x, y) {
  return { x: x * view.scale + view.ox, y: y * view.scale + view.oy };
}

export function invalidateRoom() {
  markDirty('static');
}

export function invalidateAll() {
  markDirty('all');
}

/** Основной вызов из цикла. */
export function render(ctx, model, dt, dpr) {
  const theme = getTheme();
  if (!theme) return;
  elapsed += dt / 1000;

  const world = model.world;
  setAmbient(world.light.ambient, world.light.alpha * 0.9, world.lightKey);

  const worldKey = `${world.lightKey}|${world.season}|${world.weather}|${Math.round(world.intensity * 6)}`;
  if (worldKey !== lastWorldKey) {
    lastWorldKey = worldKey;
    markDirty('outside');
    markDirty('static');
  }
  const roomKey = roomSignature(model);
  if (roomKey !== lastRoomKey) {
    lastRoomKey = roomKey;
    markDirty('static');
  }

  const over = view.overhang;
  const outside = ensure('outside', ROOM.w, ROOM.h, (c) => drawOutside(c, world));
  const staticLayer = ensure('static', ROOM.w, ROOM.h + over, (c) => {
    c.translate(0, over);
    drawStaticScene(c, model, outside.canvas, -over);
  });

  // частицы за окном
  if (isPrecipitation(world.weather) && world.intensity > 0.02) {
    fx.emitPrecip(
      world.weather,
      { x: ROOM.window.x - 40, y: ROOM.window.y, w: ROOM.window.w + 40, h: ROOM.window.h },
      world.intensity, dt,
    );
  } else if (world.seasonData?.fall) {
    fx.emitFalling(world.seasonData.fall, ROOM.window, world.seasonData.fallRate, dt);
  }
  if (world.light.sun > 0.2) {
    fx.emitDust({ x: ROOM.window.x - 150, y: ROOM.window.y + 60, w: 260, h: 380 }, dt);
  }
  fx.update(dt);

  // --- кадр ---
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // Свободная полоса сверху — продолжение стены, а не чёрный провал.
  ctx.fillStyle = wallBackdrop(model);
  ctx.fillRect(0, 0, view.cssW, view.cssH);

  ctx.setTransform(dpr * view.scale, 0, 0, dpr * view.scale, view.ox * dpr, view.oy * dpr);

  ctx.drawImage(staticLayer.canvas, 0, -over);

  // осадки видны только в проёме окна
  ctx.save();
  ctx.beginPath();
  ctx.rect(ROOM.window.x, ROOM.window.y, ROOM.window.w, ROOM.window.h);
  ctx.clip();
  fx.draw(ctx, ['rain', 'hail', 'snow', 'leaves', 'petals']);
  ctx.restore();

  drawDynamicScene(ctx, model, elapsed, { skipLighting: true });
  fx.draw(ctx, ['dust', 'steam']);

  applyLighting(ctx, world, { ...lightingOpts(model, theme, elapsed), top: -over });

  fx.draw(ctx, ['coin']);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function wallBackdrop(model) {
  return material(model.wallColor).dark;
}

function roomSignature(model) {
  return `${model.wallColor}|${model.floorColor}|${model.pcTier}|` +
    model.items.map((i) => `${i.slot}:${i.itemId}:${i.color}`).join(',');
}

export function spawnCoins(roomX, roomY, count) {
  fx.emitCoins(roomX, roomY, count);
}

export function debugInfo() {
  return { view: { ...view }, redraws: redrawCounts(), particles: fx.aliveCount() };
}
