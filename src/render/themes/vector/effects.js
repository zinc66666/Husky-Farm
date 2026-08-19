// Анимированные детали, которые нельзя закешировать: содержимое экранов,
// заставка на пустом мониторе, блик по стеклу.

import { SLOTS } from '../../../data/slots.js';
import { rgba, material } from '../../material.js';

const PALETTE = ['#4e9af1', '#7fe3c4', '#a88bfa', '#f2994a', '#eb5757'];

/** Цвет свечения монитора — от него зависит рим-лайт на персонаже. */
export function screenTint(model, t) {
  const idx = Math.floor((t / 6) % PALETTE.length);
  return model.activity === 'play' ? PALETTE[idx] : '#5f7ea8';
}

export function drawScreens(ctx, { model, t, world }) {
  const playing = model.activity === 'play';
  const tint = screenTint(model, t);

  for (const item of model.items) {
    if (item.draw !== 'monitor') continue;
    const slot = SLOTS[item.slot];
    if (!slot) continue;
    const isMain = item.slot === 'monitor_main';
    const bw = item.variant === 'ultra' ? slot.w * 1.18 : slot.w;
    const bh = item.variant === 'oled' ? slot.h * 1.06 : slot.h;
    const inset = item.variant === 'oled' ? 5 : 9;
    const stand = item.variant === 'side' ? 18 : 26;

    const x = slot.x - bw / 2 + inset;
    const y = slot.y - bh - stand + inset;
    const w = bw - inset * 2;
    const h = bh - inset * 2 - (item.variant === 'side' ? 6 : 10);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    if (playing || !isMain) {
      drawGameplay(ctx, { x, y, w, h, t, tint, seed: item.slot });
    } else {
      drawScreensaver(ctx, { x, y, w, h, t, tint });
    }

    // блик по стеклу
    const gl = ctx.createLinearGradient(x, y, x + w, y + h);
    gl.addColorStop(0, `rgba(255,255,255,${0.06 + world.light.sun * 0.07})`);
    gl.addColorStop(0.5, 'rgba(255,255,255,0)');
    ctx.fillStyle = gl;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }
}

function drawGameplay(ctx, { x, y, w, h, t, tint, seed }) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, rgba(tint, 0.5));
  g.addColorStop(1, 'rgba(8,12,22,.95)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);

  // «пейзаж» игры: холмы, которые едут вбок
  const off = (t * 26) % (w * 2);
  ctx.fillStyle = rgba('#0d1626', 0.9);
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  for (let i = 0; i <= 10; i++) {
    const px = x + (i / 10) * w;
    const py = y + h * 0.62 + Math.sin(i * 0.9 + off * 0.03) * h * 0.12;
    ctx.lineTo(px, py);
  }
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();

  // интерфейс игры внутри игры
  ctx.fillStyle = rgba('#ffffff', 0.75);
  ctx.fillRect(x + 6, y + 6, w * 0.3, 3);
  ctx.fillStyle = rgba('#eb5757', 0.85);
  ctx.fillRect(x + 6, y + 6, w * 0.3 * (0.4 + 0.3 * Math.sin(t * 1.4)), 3);
  ctx.fillStyle = rgba(tint, 0.9);
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(x + w - 10 - i * 8, y + h - 10, 5, 5);
  }

  // «персонаж» игрока в игре
  ctx.fillStyle = rgba('#ffffff', 0.9);
  ctx.fillRect(x + w * 0.45, y + h * 0.5 + Math.sin(t * 5) * 3, 6, 9);
}

function drawScreensaver(ctx, { x, y, w, h, t, tint }) {
  ctx.fillStyle = '#070a12';
  ctx.fillRect(x, y, w, h);
  const px = x + (Math.sin(t * 0.5) * 0.5 + 0.5) * (w - 40) + 4;
  const py = y + (Math.cos(t * 0.37) * 0.5 + 0.5) * (h - 24) + 4;
  ctx.fillStyle = rgba(tint, 0.75);
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('husky', px, py + 12);
}

export function drawForeground(ctx, { model, t }) {
  // «дыхание» подсветки клавиатуры
  const kb = model.items.find((i) => i.slot === 'keyboard');
  if (!kb || kb.variant === 'kb_membrane') return;
  const slot = SLOTS.keyboard;
  const mat = material(kb.color);
  ctx.fillStyle = rgba(mat.glow, 0.25 + 0.2 * Math.sin(t * 2));
  ctx.fillRect(slot.x - slot.w / 2, slot.y - 2, slot.w, 3);
}
