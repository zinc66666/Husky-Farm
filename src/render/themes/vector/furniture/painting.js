// Настенный декор: постер, абстракция, ночной город, неоновая вывеска.

import { rgba, mix } from '../../../material.js';
import { roundRect } from '../../../shapes.js';
import { seeded } from '../../../../core/rng.js';

export function draw(ctx, { w, h, mat, variant, slot }) {
  const x = -w / 2;
  const y = -h;

  if (variant === 'neon') {
    drawNeon(ctx, { x, y, w, h, mat });
    return;
  }

  // рама
  ctx.fillStyle = variant === 'poster' ? rgba(mat.dark, 0.9) : mat.base;
  roundRect(ctx, x, y, w, h, 4);
  ctx.fill();

  const pad = variant === 'poster' ? 4 : 9;
  const iw = w - pad * 2;
  const ih = h - pad * 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + pad, y + pad, iw, ih);
  ctx.clip();

  if (variant === 'city') {
    const g = ctx.createLinearGradient(0, y + pad, 0, y + pad + ih);
    g.addColorStop(0, mix(mat.base, '#101733', 0.7));
    g.addColorStop(1, mix(mat.glow, '#3a2350', 0.4));
    ctx.fillStyle = g;
    ctx.fillRect(x + pad, y + pad, iw, ih);
    const rnd = seeded(`city:${slot}`);
    ctx.fillStyle = 'rgba(10,12,22,.92)';
    let bx = x + pad;
    while (bx < x + pad + iw) {
      const bw = rnd.range(8, 18);
      const bh = rnd.range(ih * 0.25, ih * 0.7);
      ctx.fillRect(bx, y + pad + ih - bh, bw, bh);
      bx += bw + 2;
    }
    ctx.fillStyle = rgba(mat.glow, 0.9);
    for (let i = 0; i < 18; i++) {
      ctx.fillRect(x + pad + rnd.next() * iw, y + pad + ih - rnd.next() * ih * 0.6, 2, 3);
    }
  } else if (variant === 'abstract') {
    ctx.fillStyle = mix(mat.base, '#ffffff', 0.75);
    ctx.fillRect(x + pad, y + pad, iw, ih);
    const rnd = seeded(`abs:${slot}`);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = rgba(i % 2 ? mat.glow : mat.dark, 0.75);
      ctx.beginPath();
      ctx.ellipse(
        x + pad + rnd.next() * iw, y + pad + rnd.next() * ih,
        rnd.range(8, iw * 0.4), rnd.range(6, ih * 0.35),
        rnd.next() * Math.PI, 0, Math.PI * 2,
      );
      ctx.fill();
    }
  } else {
    // постер: крупная фигура и полоса-заголовок
    ctx.fillStyle = mix(mat.base, '#12151f', 0.55);
    ctx.fillRect(x + pad, y + pad, iw, ih);
    ctx.fillStyle = rgba(mat.glow, 0.9);
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + pad + ih * 0.18);
    ctx.lineTo(x + w / 2 + iw * 0.26, y + pad + ih * 0.7);
    ctx.lineTo(x + w / 2 - iw * 0.26, y + pad + ih * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = rgba('#ffffff', 0.85);
    ctx.fillRect(x + pad + 6, y + pad + ih - 16, iw - 12, 5);
    ctx.fillRect(x + pad + 6, y + pad + ih - 8, iw * 0.5, 4);
  }
  ctx.restore();
}

function drawNeon(ctx, { x, y, w, h, mat }) {
  ctx.strokeStyle = rgba(mat.glow, 0.95);
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // стилизованная молния
  ctx.beginPath();
  ctx.moveTo(x + w * 0.62, y + h * 0.08);
  ctx.lineTo(x + w * 0.3, y + h * 0.52);
  ctx.lineTo(x + w * 0.52, y + h * 0.52);
  ctx.lineTo(x + w * 0.34, y + h * 0.94);
  ctx.stroke();
  // гало
  const g = ctx.createRadialGradient(x + w / 2, y + h / 2, 4, x + w / 2, y + h / 2, w * 0.9);
  g.addColorStop(0, rgba(mat.glow, 0.3));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - w * 0.4, y - h * 0.2, w * 1.8, h * 1.5);
}
