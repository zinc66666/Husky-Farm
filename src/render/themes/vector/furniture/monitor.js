// Мониторы: главный и боковые. Содержимое экрана рисуется отдельно (effects.js),
// здесь только корпус и подставка — они попадают в кешируемый статический слой.

import { rgba, mix } from '../../../material.js';
import { roundRect } from '../../../shapes.js';

export function draw(ctx, { w, h, mat, accent, variant }) {
  const isSide = variant === 'side';
  const bw = variant === 'ultra' ? w * 1.18 : w;
  const bh = variant === 'oled' ? h * 1.06 : h;
  const top = -bh - (isSide ? 18 : 26);

  // ножка
  ctx.fillStyle = mat.dark;
  ctx.fillRect(-7, top + bh, 14, isSide ? 18 : 26);
  ctx.fillStyle = mix(mat.dark, '#000', 0.25);
  roundRect(ctx, -bw * 0.22, -6, bw * 0.44, 8, 4);
  ctx.fill();

  // корпус
  ctx.fillStyle = mat.base;
  roundRect(ctx, -bw / 2, top, bw, bh, variant === 'oled' ? 10 : 7);
  ctx.fill();

  // экран (выключенное стекло — свечение добавляет effects.js)
  ctx.fillStyle = '#0a0d16';
  const inset = variant === 'oled' ? 5 : 9;
  roundRect(ctx, -bw / 2 + inset, top + inset, bw - inset * 2, bh - inset * 2 - (isSide ? 6 : 10), 4);
  ctx.fill();

  // подсветка сзади у топовых панелей
  if (variant === 'ultra' || variant === 'oled') {
    ctx.strokeStyle = rgba(accent?.glow || '#4e9af1', 0.55);
    ctx.lineWidth = 3;
    roundRect(ctx, -bw / 2 - 2, top - 2, bw + 4, bh + 4, 9);
    ctx.stroke();
  }

  // логотип-полоска на нижней рамке
  ctx.fillStyle = rgba(mat.light, 0.55);
  ctx.fillRect(-10, top + bh - 8, 20, 3);
}
