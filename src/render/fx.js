// Пул частиц: осадки за окном, пылинки в луче света, монетки при сборе.
// Пул фиксированного размера — никакого мусора в кадровом пути.

const MAX = 320;

const pool = [];
for (let i = 0; i < MAX; i++) {
  pool.push({ alive: false, kind: '', x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 1, rot: 0 });
}

let cursor = 0;

function spawn(kind, opts) {
  for (let i = 0; i < MAX; i++) {
    const p = pool[cursor];
    cursor = (cursor + 1) % MAX;
    if (!p.alive) {
      Object.assign(p, { alive: true, kind, rot: 0 }, opts);
      p.max = p.life;
      return p;
    }
  }
  return null;
}

export function update(dt) {
  const s = dt / 1000;
  for (const p of pool) {
    if (!p.alive) continue;
    p.x += p.vx * s;
    p.y += p.vy * s;
    p.life -= s;
    if (p.kind === 'coin') p.vy += 620 * s;
    if (p.kind === 'dust') p.vx += Math.sin(p.y * 0.05 + p.life) * 1.2 * s;
    if (p.kind === 'steam') p.vy -= 12 * s;
    if (p.life <= 0) p.alive = false;
  }
}

export function clearAll() {
  for (const p of pool) p.alive = false;
}

/** Осадки за окном. rect — прямоугольник окна в координатах комнаты. */
export function emitPrecip(kind, rect, intensity, dt) {
  const perSec = { rain: 90, hail: 45, snow: 34 }[kind] || 0;
  const count = (perSec * intensity * dt) / 1000;
  let n = Math.floor(count);
  if (Math.random() < count - n) n++;
  for (let i = 0; i < n; i++) {
    const wind = kind === 'snow' ? (Math.random() - 0.5) * 22 : -30 - Math.random() * 40;
    spawn(kind, {
      x: rect.x + Math.random() * (rect.w + 90),
      y: rect.y - 6,
      vx: wind,
      vy: kind === 'snow' ? 46 + Math.random() * 30 : kind === 'hail' ? 340 + Math.random() * 120 : 420 + Math.random() * 160,
      life: 3.2,
      size: kind === 'snow' ? 1.6 + Math.random() * 1.8 : kind === 'hail' ? 2.2 + Math.random() * 1.4 : 1 + Math.random(),
    });
  }
}

export function emitFalling(kind, rect, rateN, dt) {
  const count = (rateN * 8 * dt) / 1000;
  let n = Math.floor(count);
  if (Math.random() < count - n) n++;
  for (let i = 0; i < n; i++) {
    spawn(kind, {
      x: rect.x + Math.random() * rect.w,
      y: rect.y - 4,
      vx: (Math.random() - 0.5) * 26,
      vy: 22 + Math.random() * 22,
      life: 5,
      size: 2.4 + Math.random() * 2.4,
    });
  }
}

export function emitDust(rect, dt) {
  if (Math.random() > dt / 900) return;
  spawn('dust', {
    x: rect.x + Math.random() * rect.w,
    y: rect.y + Math.random() * rect.h,
    vx: (Math.random() - 0.5) * 6,
    vy: -3 - Math.random() * 5,
    life: 3 + Math.random() * 3,
    size: 1 + Math.random() * 1.4,
  });
}

export function emitCoins(x, y, count = 10) {
  for (let i = 0; i < count; i++) {
    spawn('coin', {
      x,
      y,
      vx: (Math.random() - 0.5) * 300,
      vy: -180 - Math.random() * 220,
      life: 1.1,
      size: 5 + Math.random() * 4,
    });
  }
}

export function emitSteam(x, y) {
  spawn('steam', {
    x: x + (Math.random() - 0.5) * 6,
    y,
    vx: (Math.random() - 0.5) * 8,
    vy: -16 - Math.random() * 8,
    life: 1.6,
    size: 3 + Math.random() * 3,
  });
}

const COLORS = {
  rain: 'rgba(150,190,230,.72)',
  hail: 'rgba(226,240,255,.9)',
  snow: 'rgba(255,255,255,.92)',
  leaves: '#d08a3c',
  petals: '#f7c6da',
  dust: 'rgba(255,240,200,.5)',
  coin: '#f2c94c',
  steam: 'rgba(255,255,255,.28)',
};

/** Рисует частицы указанных типов. Вызывается на нужном слое. */
export function draw(ctx, kinds) {
  for (const p of pool) {
    if (!p.alive || !kinds.includes(p.kind)) continue;
    const fade = Math.min(1, p.life / (p.max * 0.4));
    ctx.globalAlpha = Math.max(0, Math.min(1, fade));
    if (p.kind === 'rain') {
      ctx.strokeStyle = COLORS.rain;
      ctx.lineWidth = p.size * 0.9;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.02, p.y - p.vy * 0.026);
      ctx.stroke();
    } else if (p.kind === 'leaves' || p.kind === 'petals') {
      ctx.fillStyle = COLORS[p.kind];
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.life * 2.4);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = COLORS[p.kind] || '#fff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

export function aliveCount() {
  return pool.reduce((n, p) => n + (p.alive ? 1 : 0), 0);
}
