// Настенная полка со всякой мелочью.

import { rgba, mix } from '../../../material.js';
import { roundRect } from '../../../shapes.js';

export function draw(ctx, { w, h, mat, accent, variant }) {
  const halfW = w / 2;
  const boardH = 9;
  const rows = variant === 'glass' ? 2 : 1;

  for (let r = 0; r < rows; r++) {
    const y = -boardH - r * (h / rows);
    ctx.fillStyle = variant === 'glass' ? rgba(mat.light, 0.4) : mat.base;
    roundRect(ctx, -halfW, y, w, boardH, 3);
    ctx.fill();
    ctx.fillStyle = rgba('#000000', 0.24);
    ctx.fillRect(-halfW, y + boardH, w, 4);

    // мелочи на полке
    const items = [
      { x: -halfW + 24, w: 12, h: 26, c: accent?.base || mat.dark },
      { x: -halfW + 40, w: 9, h: 32, c: mat.dark },
      { x: -halfW + 52, w: 11, h: 22, c: accent?.glow || mat.light },
      { x: halfW - 46, w: 26, h: 18, c: mat.dark },
    ];
    for (const it of items) {
      ctx.fillStyle = it.c;
      roundRect(ctx, it.x, y - it.h, it.w, it.h, 2);
      ctx.fill();
    }
    // фигурка
    ctx.fillStyle = mix(accent?.glow || '#7fe3c4', '#ffffff', 0.2);
    ctx.beginPath();
    ctx.arc(halfW - 20, y - 14, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(halfW - 25, y - 12, 10, 12);
  }

  // кронштейны
  ctx.strokeStyle = rgba(mat.line, 0.8);
  ctx.lineWidth = 3;
  for (const dx of [-halfW + 18, halfW - 18]) {
    ctx.beginPath();
    ctx.moveTo(dx, 0);
    ctx.lineTo(dx, -h * 0.35);
    ctx.stroke();
  }
}
