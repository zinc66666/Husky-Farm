// Ковёр на полу: рисуется первым, поэтому даёт цветовую основу всей комнате.

import { rgba, mix } from '../../../material.js';

export function draw(ctx, { w, h, mat, variant }) {
  const rx = w / 2;
  const ry = h / 2;
  const cy = -ry;

  ctx.fillStyle = mat.base;
  if (variant === 'round') {
    ctx.beginPath();
    ctx.ellipse(0, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgba(mat.light, 0.7);
    ctx.lineWidth = 5;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.ellipse(0, cy, rx * (1 - i * 0.22), ry * (1 - i * 0.22), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else {
    // трапеция — намёк на перспективу пола
    ctx.beginPath();
    ctx.moveTo(-rx * 0.78, cy - ry);
    ctx.lineTo(rx * 0.78, cy - ry);
    ctx.lineTo(rx, cy + ry);
    ctx.lineTo(-rx, cy + ry);
    ctx.closePath();
    ctx.fill();

    if (variant === 'shag') {
      ctx.strokeStyle = rgba(mat.light, 0.5);
      ctx.lineWidth = 3;
      for (let i = 0; i < 26; i++) {
        const t = i / 25;
        const x = -rx + t * rx * 2;
        ctx.beginPath();
        ctx.moveTo(x, cy - ry + 4);
        ctx.lineTo(x + (i % 2 ? 4 : -4), cy + ry - 4);
        ctx.stroke();
      }
    } else {
      ctx.strokeStyle = rgba(mat.light, 0.65);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-rx * 0.66, cy - ry * 0.5);
      ctx.lineTo(rx * 0.66, cy - ry * 0.5);
      ctx.moveTo(-rx * 0.8, cy + ry * 0.45);
      ctx.lineTo(rx * 0.8, cy + ry * 0.45);
      ctx.stroke();
    }
  }

  ctx.fillStyle = rgba('#000000', 0.12);
  ctx.beginPath();
  ctx.ellipse(0, cy, rx * 0.98, ry * 0.98, 0, 0, Math.PI * 2);
  ctx.fill();
}
