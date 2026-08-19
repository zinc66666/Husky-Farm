// Растения: кактус, фикус, монстера, настольный суккулент.
// Цвет перекрашивает листву — комната читается как единая палитра.

import { rgba, mix } from '../../../material.js';
import { roundRect, groundShadow } from '../../../shapes.js';

export function draw(ctx, { w, h, mat, variant }) {
  const potH = variant === 'desk' ? h * 0.4 : h * 0.28;
  const potW = w * (variant === 'desk' ? 0.6 : 0.52);

  if (variant !== 'desk') groundShadow(ctx, 0, -3, potW * 0.9, 0.24);

  // горшок
  ctx.fillStyle = mix('#c07a55', mat.base, 0.25);
  ctx.beginPath();
  ctx.moveTo(-potW / 2, -potH);
  ctx.lineTo(potW / 2, -potH);
  ctx.lineTo(potW * 0.38, 0);
  ctx.lineTo(-potW * 0.38, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = rgba('#000000', 0.18);
  ctx.fillRect(-potW / 2, -potH, potW, 5);

  const green = mat.base;
  const dark = mat.dark;
  const top = -h;

  if (variant === 'cactus') {
    ctx.fillStyle = green;
    roundRect(ctx, -10, top + 8, 20, h - potH - 8, 10);
    ctx.fill();
    roundRect(ctx, -24, top + h * 0.4, 14, h * 0.3, 7);
    ctx.fill();
    roundRect(ctx, 12, top + h * 0.34, 13, h * 0.34, 7);
    ctx.fill();
    ctx.strokeStyle = rgba(dark, 0.5);
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 6; i++) {
      const y = top + 16 + i * ((h - potH) / 7);
      ctx.beginPath();
      ctx.moveTo(-6, y);
      ctx.lineTo(6, y);
      ctx.stroke();
    }
  } else if (variant === 'desk') {
    ctx.fillStyle = green;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * 9, -potH - 6 + Math.sin(a) * 5, 8, 5, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = mix(green, '#ffffff', 0.25);
    ctx.beginPath();
    ctx.arc(0, -potH - 8, 7, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // стебли и листья
    ctx.strokeStyle = mix(dark, '#3d6b3d', 0.4);
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    const leaves = variant === 'monstera' ? 7 : 9;
    for (let i = 0; i < leaves; i++) {
      const t = i / (leaves - 1);
      const ang = -Math.PI / 2 + (t - 0.5) * 1.9;
      const len = (h - potH) * (0.55 + 0.45 * Math.sin(Math.PI * t));
      const ex = Math.cos(ang) * len;
      const ey = -potH + Math.sin(ang) * len;
      ctx.beginPath();
      ctx.moveTo(0, -potH);
      ctx.quadraticCurveTo(ex * 0.4, -potH + (ey + potH) * 0.6, ex, ey);
      ctx.stroke();

      ctx.fillStyle = i % 2 ? green : mix(green, dark, 0.35);
      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(ang + Math.PI / 2);
      const lw = variant === 'monstera' ? 20 : 13;
      const lh = variant === 'monstera' ? 30 : 22;
      ctx.beginPath();
      ctx.ellipse(0, -lh * 0.4, lw, lh, 0, 0, Math.PI * 2);
      ctx.fill();
      if (variant === 'monstera') {
        // прорези монстеры
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.globalCompositeOperation = 'destination-out';
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.ellipse(s * lw * 0.55, -lh * 0.4, lw * 0.3, lh * 0.16, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.restore();
    }
  }
}
