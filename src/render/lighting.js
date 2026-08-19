// Освещение комнаты: несколько проходов поверх нарисованной сцены.
// Главный визуальный эффект игры — ночная подсветка персонажа от монитора.

import { ROOM } from '../data/slots.js';
import { rgba } from './material.js';

const SCREEN = { x: 266, y: 596 }; // центр главного монитора

/** Насколько ярко светит монитор: чем темнее в комнате, тем сильнее. */
export function monitorGlowStrength(world) {
  const day = world?.light?.sun ?? 0.5;
  return 0.15 + 0.55 * (1 - day);
}

export function applyLighting(ctx, world, opts = {}) {
  const light = world.light;
  const top = opts.top || 0;
  const fullH = ROOM.h - top;
  const win = ROOM.window;
  const foggy = world.weather === 'fog' ? world.intensity : 0;
  const wet = world.weather === 'rain' || world.weather === 'snow' || world.weather === 'hail'
    ? world.intensity * 0.35 : 0;
  const clarity = 1 - Math.min(0.85, foggy * 0.7 + wet);

  // 1. Общий тон времени суток.
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = rgba(light.ambient, light.alpha);
  ctx.fillRect(0, top, ROOM.w, fullH);
  ctx.restore();

  // 2. Тёплый луч из окна на пол.
  const sun = light.sun * clarity;
  if (sun > 0.03) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const shaft = ctx.createLinearGradient(win.x, win.y, win.x - 180, ROOM.h);
    shaft.addColorStop(0, rgba(light.skyBottom, 0.32 * sun));
    shaft.addColorStop(0.55, rgba(light.skyBottom, 0.13 * sun));
    shaft.addColorStop(1, rgba(light.skyBottom, 0));
    ctx.fillStyle = shaft;
    ctx.beginPath();
    ctx.moveTo(win.x, win.y);
    ctx.lineTo(win.x + win.w, win.y);
    ctx.lineTo(win.x + win.w - 110, ROOM.h);
    ctx.lineTo(win.x - 230, ROOM.h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 3. Свечение монитора — рим-лайт на персонаже и столе.
  const glow = monitorGlowStrength(world) * (opts.screenOn === false ? 0.25 : 1);
  if (glow > 0.02) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(SCREEN.x, SCREEN.y, 20, SCREEN.x, SCREEN.y, 340);
    g.addColorStop(0, rgba(opts.screenTint || '#7fb6ff', 0.4 * glow));
    g.addColorStop(0.5, rgba(opts.screenTint || '#7fb6ff', 0.15 * glow));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, SCREEN.y - 340, ROOM.w, 680);
    ctx.restore();
  }

  // 4. Настольная лампа ночью.
  if (light.lamp && opts.lampOn) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(400, 610, 8, 400, 610, 180);
    g.addColorStop(0, rgba(opts.lampTint || '#ffd79a', 0.38));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(200, 420, 360, 380);
    ctx.restore();
  }

  // 5. Туман внутри комнаты.
  if (foggy > 0.02) {
    ctx.save();
    ctx.fillStyle = rgba('#c8d2e0', 0.15 * foggy);
    ctx.fillRect(0, top, ROOM.w, fullH);
    const g = ctx.createLinearGradient(0, ROOM.h * 0.55, 0, ROOM.h);
    g.addColorStop(0, rgba('#dbe3ee', 0));
    g.addColorStop(1, rgba('#dbe3ee', 0.22 * foggy));
    ctx.fillStyle = g;
    ctx.fillRect(0, ROOM.h * 0.55, ROOM.w, ROOM.h * 0.45);
    ctx.restore();
  }

  // 6. Виньетка — собирает картинку и прячет края.
  ctx.save();
  const cy = top + fullH / 2;
  const v = ctx.createRadialGradient(ROOM.w / 2, cy, ROOM.w * 0.42, ROOM.w / 2, cy, fullH * 0.78);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, `rgba(0,0,0,${0.26 + light.alpha * 0.3})`);
  ctx.fillStyle = v;
  ctx.fillRect(0, top, ROOM.w, fullH);
  ctx.restore();
}
