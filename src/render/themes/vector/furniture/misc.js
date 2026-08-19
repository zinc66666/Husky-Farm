// Мелочь и крупные вещи одним файлом: клавиатура, кружка, наушники,
// консоль, аркадный автомат, аквариум.

import { rgba, mix } from '../../../material.js';
import { roundRect, groundShadow } from '../../../shapes.js';

export function draw(ctx, args) {
  const { variant } = args;
  if (variant?.startsWith('kb_')) return keyboard(ctx, args);
  if (variant === 'mug' || variant === 'mug_husky') return mug(ctx, args);
  if (variant === 'headset' || variant === 'headset_pro') return headset(ctx, args);
  if (variant === 'console') return console_(ctx, args);
  if (variant === 'arcade') return arcade(ctx, args);
  if (variant === 'aquarium') return aquarium(ctx, args);
}

function keyboard(ctx, { w, h, mat, accent, variant }) {
  const halfW = w / 2;
  ctx.fillStyle = mat.base;
  roundRect(ctx, -halfW, -h, w, h, 4);
  ctx.fill();

  const keyRows = variant === 'kb_custom' ? 4 : 3;
  ctx.fillStyle = rgba(mat.dark, 0.85);
  for (let r = 0; r < keyRows; r++) {
    for (let c = 0; c < 16; c++) {
      ctx.fillRect(-halfW + 5 + c * ((w - 10) / 16), -h + 3 + r * ((h - 6) / keyRows), (w - 10) / 16 - 1.5, (h - 6) / keyRows - 1.2);
    }
  }
  if (variant !== 'kb_membrane') {
    ctx.fillStyle = rgba(accent?.glow || mat.glow, 0.6);
    ctx.fillRect(-halfW, -1.5, w, 2.5);
  }
}

function mug(ctx, { w, h, mat, variant }) {
  ctx.fillStyle = mat.base;
  roundRect(ctx, -w / 2, -h, w * 0.82, h, 4);
  ctx.fill();
  // ручка
  ctx.strokeStyle = mat.base;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(w * 0.3, -h * 0.55, h * 0.26, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  // чай
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.ellipse(-w / 2 + w * 0.41, -h + 3, w * 0.34, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  if (variant === 'mug_husky') {
    ctx.fillStyle = rgba('#ffffff', 0.9);
    ctx.beginPath();
    ctx.arc(-w * 0.08, -h * 0.5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = mat.dark;
    ctx.beginPath();
    ctx.arc(-w * 0.1, -h * 0.52, 1.4, 0, Math.PI * 2);
    ctx.arc(-w * 0.04, -h * 0.52, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function headset(ctx, { w, h, mat, accent, variant }) {
  ctx.strokeStyle = mat.base;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, -h * 0.35, w * 0.42, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = mat.dark;
  roundRect(ctx, -w * 0.55, -h * 0.42, w * 0.28, h * 0.5, 6);
  ctx.fill();
  roundRect(ctx, w * 0.27, -h * 0.42, w * 0.28, h * 0.5, 6);
  ctx.fill();
  if (variant === 'headset_pro') {
    ctx.strokeStyle = rgba(accent?.glow || mat.glow, 0.9);
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(-w * 0.41, -h * 0.17, 6, 0, Math.PI * 2);
    ctx.arc(w * 0.41, -h * 0.17, 6, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function console_(ctx, { w, h, mat, accent }) {
  groundShadow(ctx, 0, -2, w * 0.55, 0.22);
  ctx.fillStyle = mat.base;
  roundRect(ctx, -w / 2, -h, w, h, 6);
  ctx.fill();
  ctx.fillStyle = rgba(mat.dark, 0.9);
  roundRect(ctx, -w / 2 + 8, -h + 8, w - 16, h * 0.32, 3);
  ctx.fill();
  ctx.fillStyle = rgba(accent?.glow || '#7fe3c4', 0.9);
  ctx.beginPath();
  ctx.arc(w * 0.3, -h * 0.3, 3.4, 0, Math.PI * 2);
  ctx.fill();
  // джойстик рядом
  ctx.fillStyle = mat.dark;
  roundRect(ctx, w * 0.36, -14, 26, 14, 6);
  ctx.fill();
}

function arcade(ctx, { w, h, mat, accent, t = 0 }) {
  const H = h * 2.6;
  groundShadow(ctx, 0, -2, w * 0.62, 0.3);
  ctx.fillStyle = mat.base;
  roundRect(ctx, -w / 2, -H, w, H, 10);
  ctx.fill();
  // экран
  ctx.fillStyle = '#0a0e18';
  roundRect(ctx, -w * 0.38, -H + 24, w * 0.76, H * 0.32, 5);
  ctx.fill();
  ctx.fillStyle = rgba(accent?.glow || '#56ccf2', 0.6 + 0.3 * Math.sin(t * 3));
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(-w * 0.3 + i * w * 0.14, -H + 40 + ((i * 7 + t * 26) % (H * 0.22)), 8, 6);
  }
  // панель управления
  ctx.fillStyle = mat.dark;
  roundRect(ctx, -w * 0.44, -H * 0.52, w * 0.88, 22, 5);
  ctx.fill();
  ctx.fillStyle = '#eb5757';
  ctx.beginPath();
  ctx.arc(-w * 0.2, -H * 0.52 + 10, 5, 0, Math.PI * 2);
  ctx.arc(-w * 0.04, -H * 0.52 + 10, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(accent?.glow || '#f2c94c', 0.95);
  ctx.fillRect(-w / 2, -H + 8, w, 6);
}

function aquarium(ctx, { w, h, mat, t = 0 }) {
  groundShadow(ctx, 0, -2, w * 0.55, 0.22);
  // тумба
  ctx.fillStyle = mix(mat.dark, '#2b3040', 0.5);
  roundRect(ctx, -w / 2 + 6, -h * 0.42, w - 12, h * 0.42, 4);
  ctx.fill();
  // стекло
  const top = -h * 1.5;
  ctx.fillStyle = rgba(mat.base, 0.45);
  roundRect(ctx, -w / 2, top, w, h * 1.08, 5);
  ctx.fill();
  ctx.strokeStyle = rgba('#dfeaf5', 0.5);
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // рыбки и пузыри
  for (let i = 0; i < 3; i++) {
    const fx = -w * 0.3 + ((t * 22 + i * 40) % (w * 0.6));
    const fy = top + h * 0.35 + Math.sin(t * 1.6 + i) * 12;
    ctx.fillStyle = ['#f2994a', '#f2c94c', '#eb5757'][i];
    ctx.beginPath();
    ctx.ellipse(fx, fy, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(fx - 7, fy);
    ctx.lineTo(fx - 13, fy - 4);
    ctx.lineTo(fx - 13, fy + 4);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,.4)';
  for (let i = 0; i < 5; i++) {
    const by = top + h * 1.0 - ((t * 30 + i * 25) % (h * 0.95));
    ctx.beginPath();
    ctx.arc(w * 0.28, by, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  // грунт
  ctx.fillStyle = '#4a6b4a';
  ctx.fillRect(-w / 2 + 3, top + h * 0.94, w - 6, h * 0.12);
}
