// Стол. Локальные координаты: (0,0) — низ-центр слота.

import { rgba, mix } from '../../../material.js';

export function draw(ctx, { w, h, mat, variant }) {
  const topH = variant === 'glass' ? 10 : 16;
  const topY = -h;
  const legW = variant === 'glass' ? 7 : 14;
  const halfW = w / 2;

  // ножки
  ctx.fillStyle = variant === 'glass' ? mix(mat.dark, '#000', 0.1) : mat.dark;
  ctx.fillRect(-halfW + 12, topY + topH, legW, h - topH);
  ctx.fillRect(halfW - 12 - legW, topY + topH, legW, h - topH);
  if (variant === 'corner' || variant === 'wide') {
    ctx.fillRect(-legW / 2, topY + topH, legW, h - topH);
  }

  // тумба у углового стола
  if (variant === 'corner') {
    ctx.fillStyle = mat.base;
    ctx.fillRect(halfW - 108, topY + topH, 96, h - topH - 6);
    ctx.strokeStyle = rgba(mat.line, 0.7);
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const y = topY + topH + 18 + i * 34;
      ctx.beginPath();
      ctx.moveTo(halfW - 100, y);
      ctx.lineTo(halfW - 20, y);
      ctx.stroke();
    }
  }

  // царга под столешницей — стол перестаёт выглядеть висящей доской
  if (variant !== 'glass') {
    ctx.fillStyle = mix(mat.dark, mat.base, 0.4);
    ctx.fillRect(-halfW + 8, topY + topH, w - 16, 16);
  }

  // столешница
  if (variant === 'glass') {
    ctx.fillStyle = rgba(mat.light, 0.34);
    ctx.fillRect(-halfW, topY, w, topH);
    ctx.strokeStyle = rgba(mat.light, 0.85);
    ctx.lineWidth = 2;
    ctx.strokeRect(-halfW, topY, w, topH);
  } else {
    const g = ctx.createLinearGradient(0, topY, 0, topY + topH);
    g.addColorStop(0, mat.light);
    g.addColorStop(1, mat.base);
    ctx.fillStyle = g;
    ctx.fillRect(-halfW, topY, w, topH);
    ctx.fillStyle = rgba(mat.line, 0.55);
    ctx.fillRect(-halfW, topY + topH - 3, w, 3);
  }

  // тень под столом на полу
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.beginPath();
  ctx.ellipse(0, -4, halfW * 0.92, 12, 0, 0, Math.PI * 2);
  ctx.fill();
}
