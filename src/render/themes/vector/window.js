// Вид за окном: небо по времени суток, солнце или луна, горизонт, дерево,
// земля с сезонным покровом. Рисуется на отдельном слое и кешируется.

import { rgba, mix } from '../../material.js';
import { seeded } from '../../../core/rng.js';

export function drawOutside(ctx, { world, room }) {
  const win = room.window;
  const x = win.x - 40;
  const y = win.y - 20;
  const w = win.w + 80;
  const h = win.h + 60;
  const season = world.seasonData;
  const light = world.light;
  const horizon = y + h * 0.62;

  // небо
  const sky = ctx.createLinearGradient(0, y, 0, horizon);
  sky.addColorStop(0, light.skyTop);
  sky.addColorStop(1, light.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, horizon - y);

  // звёзды ночью
  if (light.sun < 0.08) {
    const rnd = seeded('stars');
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    for (let i = 0; i < 34; i++) {
      const sx = x + rnd.next() * w;
      const sy = y + rnd.next() * (horizon - y) * 0.8;
      const r = rnd.range(0.6, 1.7);
      ctx.globalAlpha = rnd.range(0.3, 1);
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // светило: дуга по небу от рассвета к закату
  drawCelestial(ctx, { x, y, w, horizon, light, world });

  // облака
  if (world.weather !== 'clear' || light.sun > 0.2) {
    drawClouds(ctx, { x, y, w, horizon, world, light });
  }

  // дальние дома
  drawSkyline(ctx, { x, y, w, horizon, light, season });

  // земля
  const ground = ctx.createLinearGradient(0, horizon, 0, y + h);
  ground.addColorStop(0, mix(season.ground, '#000000', 0.24));
  ground.addColorStop(1, season.ground);
  ctx.fillStyle = ground;
  ctx.fillRect(x, horizon, w, y + h - horizon);

  if (season.snowCover > 0) {
    ctx.fillStyle = rgba('#eef4ff', 0.85 * season.snowCover);
    ctx.fillRect(x, horizon, w, y + h - horizon);
  }

  drawTree(ctx, { x: x + w * 0.72, base: horizon + 14, season, light });

  // дымка тумана
  if (world.weather === 'fog') {
    ctx.fillStyle = rgba('#cdd6e2', 0.15 + 0.55 * world.intensity);
    ctx.fillRect(x, y, w, h);
  }
}

function drawCelestial(ctx, { x, y, w, horizon, light, world }) {
  const isNight = light.sun < 0.06;
  const t = Math.max(0, Math.min(1, (world.hour - 5) / 15));
  const cx = x + w * (0.14 + t * 0.72);
  const cy = horizon - Math.sin(Math.PI * t) * (horizon - y) * 0.82 - 12;
  const nightT = ((world.hour + 12) % 24) / 24;
  const mx = x + w * (0.18 + nightT * 0.64);
  const my = horizon - Math.sin(Math.PI * nightT) * (horizon - y) * 0.6 - 10;

  if (isNight) {
    ctx.fillStyle = '#e8edf7';
    ctx.beginPath();
    ctx.arc(mx, my, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = light.skyTop;
    ctx.beginPath();
    ctx.arc(mx + 6, my - 4, 13, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  const halo = ctx.createRadialGradient(cx, cy, 4, cx, cy, 66);
  halo.addColorStop(0, rgba('#fff3c4', 0.85 * light.sun));
  halo.addColorStop(1, 'rgba(255,243,196,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, 66, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = mix('#fff2b8', '#ffb066', 1 - light.sun);
  ctx.beginPath();
  ctx.arc(cx, cy, 17, 0, Math.PI * 2);
  ctx.fill();
}

function drawClouds(ctx, { x, y, w, horizon, world, light }) {
  const rnd = seeded(`clouds:${world.season}:${world.weather}`);
  const heavy = world.weather === 'rain' || world.weather === 'hail' || world.weather === 'snow';
  const n = heavy ? 6 : world.weather === 'cloudy' ? 5 : 3;
  const tint = heavy ? mix(light.skyTop, '#4a5266', 0.6) : mix('#ffffff', light.skyBottom, 0.35);
  ctx.fillStyle = rgba(tint, heavy ? 0.9 : 0.55);
  for (let i = 0; i < n; i++) {
    const cx = x + rnd.next() * w;
    const cy = y + rnd.range(10, (horizon - y) * 0.5);
    const s = rnd.range(16, 34);
    ctx.beginPath();
    ctx.ellipse(cx, cy, s * 1.7, s * 0.66, 0, 0, Math.PI * 2);
    ctx.ellipse(cx - s, cy + 4, s * 1.0, s * 0.5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + s * 0.9, cy + 5, s * 1.1, s * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSkyline(ctx, { x, y, w, horizon, light, season }) {
  const rnd = seeded('skyline');
  const dark = mix(light.skyBottom, '#101728', 0.66);
  ctx.fillStyle = dark;
  let bx = x - 10;
  const lit = light.sun < 0.25;
  while (bx < x + w + 10) {
    const bw = rnd.range(24, 46);
    const bh = rnd.range(28, 84);
    ctx.fillRect(bx, horizon - bh, bw, bh);
    if (lit) {
      ctx.fillStyle = rgba('#ffd98a', 0.75);
      for (let r = 0; r < Math.floor(bh / 16); r++) {
        for (let c = 0; c < Math.floor(bw / 12); c++) {
          if (rnd.next() < 0.4) ctx.fillRect(bx + 4 + c * 12, horizon - bh + 6 + r * 16, 5, 7);
        }
      }
      ctx.fillStyle = dark;
    }
    if (season.snowCover > 0) {
      ctx.fillStyle = rgba('#eef4ff', 0.7);
      ctx.fillRect(bx, horizon - bh, bw, 3);
      ctx.fillStyle = dark;
    }
    bx += bw + rnd.range(4, 14);
  }
}

function drawTree(ctx, { x, base, season, light }) {
  ctx.strokeStyle = season.trunk;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, base);
  ctx.lineTo(x, base - 46);
  ctx.moveTo(x, base - 26);
  ctx.lineTo(x - 15, base - 44);
  ctx.moveTo(x, base - 32);
  ctx.lineTo(x + 16, base - 52);
  ctx.stroke();

  if (season.foliage && season.snowCover < 1) {
    ctx.fillStyle = mix(season.foliage, light.ambient, 0.18);
    ctx.beginPath();
    ctx.ellipse(x, base - 62, 30, 24, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 18, base - 50, 18, 15, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 19, base - 54, 19, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = rgba('#eef4ff', 0.9);
    ctx.beginPath();
    ctx.ellipse(x, base - 56, 22, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
