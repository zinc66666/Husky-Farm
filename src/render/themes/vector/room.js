// Пол, стены, плинтус, оконный проём и дверь.

import { mix, rgba } from '../../material.js';

export function drawFloor(ctx, { room, mat }) {
  const { w, h, floorY } = room;
  const g = ctx.createLinearGradient(0, floorY, 0, h);
  g.addColorStop(0, mat.dark);
  g.addColorStop(0.35, mat.base);
  g.addColorStop(1, mat.light);
  ctx.fillStyle = g;
  ctx.fillRect(0, floorY, w, h - floorY);

  // доски с перспективой: расходятся от центра к зрителю
  ctx.strokeStyle = rgba(mat.line, 0.32);
  ctx.lineWidth = 1.6;
  const vpX = w * 0.5;
  for (let i = -8; i <= 8; i++) {
    const topX = vpX + i * 34;
    const botX = vpX + i * 108;
    ctx.beginPath();
    ctx.moveTo(topX, floorY);
    ctx.lineTo(botX, h);
    ctx.stroke();
  }
  // поперечные швы
  for (let k = 1; k <= 4; k++) {
    const t = k / 5;
    const y = floorY + (h - floorY) * t * t;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

export function drawWalls(ctx, { room, mat, top = 0 }) {
  const { w, floorY } = room;
  // top < 0 — полоса «потолка» над комнатой на высоких экранах.
  const g = ctx.createLinearGradient(0, top, 0, floorY);
  g.addColorStop(0, mix(mat.dark, '#0b0d14', 0.45));
  g.addColorStop(top < 0 ? Math.min(0.6, -top / (floorY - top)) : 0, mix(mat.dark, mat.base, 0.5));
  g.addColorStop(0.72, mat.base);
  g.addColorStop(1, mix(mat.base, mat.light, 0.45));
  ctx.fillStyle = g;
  ctx.fillRect(0, top, w, floorY - top);

  // мягкое боковое затемнение вместо рамок
  const side = ctx.createLinearGradient(0, 0, w, 0);
  side.addColorStop(0, 'rgba(0,0,0,.28)');
  side.addColorStop(0.25, 'rgba(0,0,0,0)');
  side.addColorStop(0.78, 'rgba(0,0,0,0)');
  side.addColorStop(1, 'rgba(0,0,0,.24)');
  ctx.fillStyle = side;
  ctx.fillRect(0, top, w, floorY - top);

  // плинтус
  ctx.fillStyle = mat.line;
  ctx.fillRect(0, floorY - 14, w, 14);
  ctx.fillStyle = rgba(mat.light, 0.35);
  ctx.fillRect(0, floorY - 14, w, 3);
}

export function drawWindowFrame(ctx, { room, mat, world }) {
  const { x, y, w, h } = room.window;
  const frame = mix(mat.light, '#ffffff', 0.35);

  // подоконник
  ctx.fillStyle = frame;
  ctx.fillRect(x - 16, y + h, w + 32, 13);
  ctx.fillStyle = rgba('#000000', 0.22);
  ctx.fillRect(x - 16, y + h + 13, w + 32, 5);

  // рама
  ctx.lineWidth = 11;
  ctx.strokeStyle = frame;
  ctx.strokeRect(x, y, w, h);
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.moveTo(x, y + h * 0.44);
  ctx.lineTo(x + w, y + h * 0.44);
  ctx.stroke();

  // блик по стеклу
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const gl = ctx.createLinearGradient(x, y, x + w, y + h);
  gl.addColorStop(0, `rgba(255,255,255,${0.13 + world.light.sun * 0.1})`);
  gl.addColorStop(0.45, 'rgba(255,255,255,0)');
  ctx.fillStyle = gl;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

export function drawDoor(ctx, { room, mat }) {
  const { x, y, w, h } = room.door;
  ctx.fillStyle = mix(mat.dark, '#000000', 0.18);
  ctx.fillRect(x, y, w, h - y + y);
  ctx.fillStyle = mix(mat.base, '#000000', 0.32);
  ctx.fillRect(x + 6, y + 6, w - 12, room.floorY - y - 6);
  // филёнки
  ctx.strokeStyle = rgba(mat.line, 0.6);
  ctx.lineWidth = 2.4;
  ctx.strokeRect(x + 18, y + 26, w - 36, 118);
  ctx.strokeRect(x + 18, y + 166, w - 36, 150);
  // ручка
  ctx.fillStyle = '#c9b47a';
  ctx.beginPath();
  ctx.arc(x + w - 20, y + 190, 5.5, 0, Math.PI * 2);
  ctx.fill();
}
