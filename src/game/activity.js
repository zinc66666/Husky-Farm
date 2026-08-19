// Режиссёр активности персонажа: взвешенный автомат с гистерезисом,
// чтобы занятие держалось 20–120 секунд, а не мигало каждую секунду.

import { now } from '../core/clock.js';
import { WAYPOINTS } from '../data/slots.js';
import { powerOf } from './upgrades.js';

export const ACTIVITIES = ['play', 'window', 'tea', 'walk', 'absent'];

const MIN_MS = 20_000;
const MAX_MS = 120_000;

let state = {
  activity: 'play',
  startedAt: 0,
  endsAt: 0,
  from: WAYPOINTS.desk,
  to: WAYPOINTS.desk,
  pos: { ...WAYPOINTS.desk },
  path: [],
  pathIndex: 0,
};

export function initActivity(ts = now()) {
  state.activity = 'play';
  state.startedAt = ts;
  state.endsAt = ts + 45_000;
  state.pos = { ...WAYPOINTS.desk };
  state.from = state.to = WAYPOINTS.desk;
}

function weights(ctx) {
  const rigBoost = Math.min(1.6, 0.6 + powerOf(ctx.pcTier) ** 0.12);
  const stormy = ctx.weather === 'rain' || ctx.weather === 'hail' || ctx.weather === 'fog' || ctx.weather === 'snow';
  const phaseFlip = ctx.phase === 'dawn' || ctx.phase === 'dusk';
  return [
    { v: 'play', w: 0.55 * rigBoost },
    { v: 'window', w: 0.15 * (stormy ? 3 : 1) * (phaseFlip ? 2 : 1) },
    { v: 'tea', w: 0.12 },
    { v: 'walk', w: 0.1 },
    // Полный банк подталкивает к «пусто» — визуальный намёк «зайди собери».
    { v: 'absent', w: 0.08 * (ctx.bankFull ? 3 : 1) },
  ];
}

function pick(list, rnd) {
  const total = list.reduce((s, e) => s + e.w, 0);
  let r = rnd() * total;
  for (const e of list) {
    r -= e.w;
    if (r <= 0) return e.v;
  }
  return list[list.length - 1].v;
}

/** Вызывается на медленном тике. ctx: { pcTier, weather, phase, bankFull }. */
export function tickActivity(ctx, ts = now()) {
  if (!state.endsAt) initActivity(ts);
  if (ts < state.endsAt) return state.activity;

  const rnd = Math.random;
  let next = pick(weights(ctx), rnd);
  if (next === state.activity && next !== 'play') next = 'play';

  state.activity = next;
  state.startedAt = ts;
  state.endsAt = ts + MIN_MS + rnd() * (MAX_MS - MIN_MS);

  if (next === 'walk') {
    const spots = [WAYPOINTS.room_l, WAYPOINTS.room_c, WAYPOINTS.room_r, WAYPOINTS.window, WAYPOINTS.door];
    const count = 2 + Math.floor(rnd() * 3);
    state.path = [];
    for (let i = 0; i < count; i++) state.path.push(spots[Math.floor(rnd() * spots.length)]);
    state.path.push(WAYPOINTS.desk);
    state.pathIndex = 0;
    state.from = { ...state.pos };
    state.to = state.path[0];
  } else {
    state.from = { ...state.pos };
    state.to = next === 'window' ? WAYPOINTS.window : WAYPOINTS.desk;
    state.path = [];
  }
  return state.activity;
}

const WALK_SPEED = 90; // виртуальных пикселей в секунду

/** Двигает персонажа между путевыми точками. Вызывается каждый кадр. */
export function stepMotion(dt) {
  const target = state.to;
  if (!target) return;
  const dx = target.x - state.pos.x;
  const dy = target.y - state.pos.y;
  const dist = Math.hypot(dx, dy);
  const step = (WALK_SPEED * dt) / 1000;
  if (dist <= step || dist < 0.5) {
    state.pos.x = target.x;
    state.pos.y = target.y;
    if (state.activity === 'walk' && state.path.length) {
      state.pathIndex = (state.pathIndex + 1) % state.path.length;
      state.to = state.path[state.pathIndex];
    }
    return;
  }
  state.pos.x += (dx / dist) * step;
  state.pos.y += (dy / dist) * step;
}

export function getActivity(ts = now()) {
  const target = state.to || state.pos;
  const dx = target.x - state.pos.x;
  const dy = target.y - state.pos.y;
  const moving = Math.hypot(dx, dy) > 1.5;
  // Пока персонаж идёт к месту, он шагает независимо от «конечного» занятия.
  const visual = moving && state.activity !== 'absent' ? 'walk' : state.activity;
  return {
    activity: state.activity,
    visual,
    moving,
    pos: state.pos,
    facing: dx >= 0 ? 1 : -1,
    t: ((ts - state.startedAt) % 100000) / 1000,
  };
}

export function forceActivity(name, ts = now()) {
  state.activity = name;
  state.startedAt = ts;
  state.endsAt = ts + 60_000;
  state.to = name === 'window' ? WAYPOINTS.window : WAYPOINTS.desk;
  state.path = [];
}
