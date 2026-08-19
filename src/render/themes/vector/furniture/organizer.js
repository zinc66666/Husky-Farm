// Органайзер на столе: стакан с карандашами или хаб с проводами.

import { rgba, mix } from '../../../material.js';
import { roundRect } from '../../../shapes.js';

export function draw(ctx, { w, h, mat, accent, variant }) {
  const halfW = w / 2;

  if (variant === 'pro') {
    ctx.fillStyle = mat.base;
    roundRect(ctx, -halfW, -h * 0.62, w, h * 0.62, 5);
    ctx.fill();
    ctx.fillStyle = rgba(accent?.glow || '#4e9af1', 0.85);
    for (let i = 0; i < 3; i++) ctx.fillRect(-halfW + 8 + i * 12, -h * 0.3, 7, 3);
    // провода
    ctx.strokeStyle = rgba(mat.line, 0.8);
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(halfW - 6, -h * 0.4);
    ctx.quadraticCurveTo(halfW + 16, -h * 0.1, halfW + 8, 0);
    ctx.stroke();
    return;
  }

  // стакан
  ctx.fillStyle = mat.base;
  ctx.beginPath();
  ctx.moveTo(-halfW * 0.62, -h * 0.6);
  ctx.lineTo(halfW * 0.62, -h * 0.6);
  ctx.lineTo(halfW * 0.5, 0);
  ctx.lineTo(-halfW * 0.5, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = rgba(mat.line, 0.4);
  ctx.fillRect(-halfW * 0.62, -h * 0.6, w * 0.62, 4);

  // карандаши
  const colors = ['#eb5757', '#f2c94c', '#56ccf2', '#6fcf97'];
  for (let i = 0; i < 4; i++) {
    const x = -halfW * 0.4 + i * (w * 0.22);
    const len = h * (0.5 + (i % 2) * 0.22);
    ctx.strokeStyle = colors[i];
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, -h * 0.55);
    ctx.lineTo(x + (i - 1.5) * 2.5, -h * 0.55 - len * 0.55);
    ctx.stroke();
  }
}
