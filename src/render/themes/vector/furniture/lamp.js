// Настольная лампа и неоновая трубка. Само световое пятно рисует lighting.js —
// здесь только корпус и локальное гало.

import { rgba, mix } from '../../../material.js';
import { roundRect } from '../../../shapes.js';

export function draw(ctx, { w, h, mat, variant, world }) {
  const night = world?.light?.lamp;

  if (variant === 'neon') {
    ctx.strokeStyle = rgba(mat.glow, night ? 0.95 : 0.55);
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-w * 0.4, -6);
    ctx.lineTo(-w * 0.4, -h + 12);
    ctx.quadraticCurveTo(0, -h - 8, w * 0.4, -h + 12);
    ctx.stroke();
    if (night) {
      const g = ctx.createRadialGradient(0, -h * 0.7, 4, 0, -h * 0.7, w * 1.6);
      g.addColorStop(0, rgba(mat.glow, 0.34));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(-w * 1.6, -h * 1.6, w * 3.2, h * 2);
    }
    return;
  }

  // основание и стойка
  ctx.fillStyle = mix(mat.dark, '#2b3040', 0.4);
  roundRect(ctx, -w * 0.34, -8, w * 0.68, 8, 4);
  ctx.fill();
  ctx.strokeStyle = mat.dark;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(2, -h * 0.62);
  ctx.lineTo(-w * 0.3, -h + 10);
  ctx.stroke();

  // абажур
  ctx.fillStyle = mat.base;
  ctx.beginPath();
  ctx.moveTo(-w * 0.52, -h + 4);
  ctx.lineTo(-w * 0.02, -h + 4);
  ctx.lineTo(-w * 0.14, -h + 22);
  ctx.lineTo(-w * 0.46, -h + 22);
  ctx.closePath();
  ctx.fill();

  if (night) {
    const g = ctx.createRadialGradient(-w * 0.3, -h + 24, 2, -w * 0.3, -h + 24, w * 1.3);
    g.addColorStop(0, rgba('#ffd79a', 0.4));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(-w * 1.6, -h, w * 2.6, h + 20);
  }
}
