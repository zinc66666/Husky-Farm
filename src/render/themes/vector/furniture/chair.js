// Кресло. Рисуется в два приёма: `base` — до персонажа, `back` — после,
// потому что от зрителя спинка находится ближе, чем сидящий человек.

import { rgba, mix } from '../../../material.js';
import { roundRect } from '../../../shapes.js';

export function draw(ctx, { w, h, mat, accent, variant, part = 'all' }) {
  const halfW = w / 2;
  const seatY = -h * 0.44;

  if (part === 'all' || part === 'base') {
    // тень
    ctx.fillStyle = 'rgba(0,0,0,.26)';
    ctx.beginPath();
    ctx.ellipse(0, -6, halfW * 0.8, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    if (variant === 'stool') {
      ctx.strokeStyle = mat.dark;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-halfW * 0.5, -6); ctx.lineTo(-halfW * 0.32, seatY);
      ctx.moveTo(halfW * 0.5, -6); ctx.lineTo(halfW * 0.32, seatY);
      ctx.stroke();
    } else {
      // крестовина на роликах
      ctx.strokeStyle = mix(mat.dark, '#20242e', 0.55);
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      for (const dx of [-1, -0.45, 0.45, 1]) {
        ctx.beginPath();
        ctx.moveTo(0, seatY + 76);
        ctx.lineTo(dx * halfW * 0.82, -8);
        ctx.stroke();
      }
      // газлифт
      ctx.fillStyle = mix(mat.dark, '#1b1f27', 0.5);
      ctx.fillRect(-8, seatY + 12, 16, 70);
    }

    // сиденье
    ctx.fillStyle = mat.base;
    roundRect(ctx, -halfW * 0.86, seatY, halfW * 1.72, variant === 'stool' ? 16 : 26, 9);
    ctx.fill();
    ctx.fillStyle = rgba(mat.line, 0.5);
    roundRect(ctx, -halfW * 0.86, seatY + (variant === 'stool' ? 12 : 20), halfW * 1.72, 6, 4);
    ctx.fill();
  }

  if ((part === 'all' || part === 'back') && variant !== 'stool') {
    // Спинка нарочно ниже плеч: камера стоит чуть выше персонажа, и он должен
    // оставаться видимым, а не прятаться за креслом.
    const backTop = -h * (variant === 'throne' ? 0.82 : 0.76);
    const backW = halfW * (variant === 'throne' ? 1.28 : variant === 'gaming' ? 1.18 : 1.05);

    ctx.fillStyle = mat.base;
    roundRect(ctx, -backW / 2, backTop, backW, seatY - backTop + 8, 22);
    ctx.fill();

    // вставка другого тона — «геймерский» силуэт
    if (variant === 'gaming' || variant === 'throne') {
      ctx.fillStyle = mix(mat.dark, '#000000', 0.15);
      roundRect(ctx, -backW / 2 + 16, backTop + 16, backW - 32, seatY - backTop - 18, 16);
      ctx.fill();
      ctx.strokeStyle = rgba(accent?.glow || mat.light, 0.75);
      ctx.lineWidth = 3;
      roundRect(ctx, -backW / 2 + 9, backTop + 9, backW - 18, seatY - backTop - 4, 18);
      ctx.stroke();
      // подголовник
      ctx.fillStyle = mat.dark;
      roundRect(ctx, -backW * 0.3, backTop - 4, backW * 0.6, 30, 12);
      ctx.fill();
    } else {
      ctx.fillStyle = rgba(mat.line, 0.4);
      roundRect(ctx, -backW / 2 + 12, backTop + 14, backW - 24, seatY - backTop - 20, 14);
      ctx.fill();
    }

    if (variant === 'throne') {
      ctx.fillStyle = rgba(accent?.glow || '#ffd76a', 0.9);
      ctx.beginPath();
      ctx.moveTo(0, backTop - 16);
      ctx.lineTo(10, backTop - 2);
      ctx.lineTo(-10, backTop - 2);
      ctx.closePath();
      ctx.fill();
    }
  }
}
