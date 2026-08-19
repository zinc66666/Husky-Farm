// Системный блок. Чем выше уровень, тем крупнее корпус, больше вентиляторов
// и насыщеннее подсветка — апгрейд виден на экране без единого слова.

import { rgba, mix } from '../../../material.js';
import { roundRect, groundShadow } from '../../../shapes.js';

export function draw(ctx, { w, h, mat, accent, visual = {}, t = 0 }) {
  const size = visual.size ?? 0.8;
  const bw = w * size;
  const bh = h * size;
  const top = -bh;

  groundShadow(ctx, 0, -4, bw * 0.62, 0.3);

  // корпус
  const g = ctx.createLinearGradient(-bw / 2, 0, bw / 2, 0);
  g.addColorStop(0, mix(mat.dark, '#000000', 0.2));
  g.addColorStop(0.45, mat.base);
  g.addColorStop(1, mat.dark);
  ctx.fillStyle = g;
  roundRect(ctx, -bw / 2, top, bw, bh, 8);
  ctx.fill();

  // стеклянная боковина
  if (visual.glass) {
    ctx.fillStyle = rgba('#8fb9ff', 0.1);
    roundRect(ctx, -bw / 2 + 8, top + 10, bw * 0.62, bh - 22, 6);
    ctx.fill();
    ctx.strokeStyle = rgba('#cfe0ff', 0.25);
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }

  // вентиляторы с подсветкой
  const fans = visual.fans ?? 0;
  const rgbStrength = visual.rgb ?? 0;
  for (let i = 0; i < fans; i++) {
    const cy = top + 30 + i * ((bh - 56) / Math.max(1, fans - 1 || 1));
    const cx = -bw * 0.16;
    const r = Math.min(15, bw * 0.17);
    ctx.fillStyle = '#12151d';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    if (rgbStrength > 0.05) {
      ctx.strokeStyle = rgba(accent?.glow || '#4e9af1', 0.35 + rgbStrength * 0.5);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 1.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    // лопасти
    ctx.strokeStyle = rgba('#2a2f3d', 0.9);
    ctx.lineWidth = 2;
    for (let k = 0; k < 5; k++) {
      const a = t * 2.2 + (k * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * (r - 3), cy + Math.sin(a) * (r - 3));
      ctx.stroke();
    }
  }

  // кнопка питания
  ctx.fillStyle = rgba(accent?.glow || '#7fe3c4', 0.9);
  ctx.beginPath();
  ctx.arc(bw * 0.3, top + 14, 3.4, 0, Math.PI * 2);
  ctx.fill();

  // подсветка на полу
  if (rgbStrength > 0.2) {
    const glow = ctx.createRadialGradient(0, -6, 4, 0, -6, bw * 1.1);
    glow.addColorStop(0, rgba(accent?.glow || '#4e9af1', 0.22 * rgbStrength));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(-bw * 1.1, -bw * 0.6, bw * 2.2, bw * 0.8);
  }
}
