// Главный цикл: три частоты тиков.
//   frame — анимации и рендер
//   sim   250 мс — накопление банка, гости
//   slow  10 с   — мир, активность, задания, автосейв
// Начисление дохода всё равно считается от настенных часов: мобильные браузеры
// душат фоновый rAF, и счёт кадров тихо сломал бы экономику.

import { emit } from './events.js';

const SIM_STEP = 250;
const SLOW_STEP = 10000;

let running = false;
let last = 0;
let simAcc = 0;
let slowAcc = 0;
let frameBudget = 0; // мс между кадрами; >0 ограничивает fps
let stats = { fps: 0, frames: 0, fpsAt: 0 };

function tick(ts) {
  if (!running) return;
  requestAnimationFrame(tick);

  const dt = Math.min(ts - last, 100); // клэмп на возврат из фона
  last = ts;

  frameBudget -= dt;
  if (frameBudget <= 0) {
    frameBudget += currentFrameInterval;
    emit('frame', dt);
    stats.frames++;
  }

  simAcc += dt;
  while (simAcc >= SIM_STEP) {
    simAcc -= SIM_STEP;
    emit('sim', SIM_STEP);
  }

  slowAcc += dt;
  while (slowAcc >= SLOW_STEP) {
    slowAcc -= SLOW_STEP;
    emit('slow', SLOW_STEP);
  }

  if (ts - stats.fpsAt >= 1000) {
    stats.fps = Math.round((stats.frames * 1000) / (ts - stats.fpsAt));
    stats.frames = 0;
    stats.fpsAt = ts;
  }
}

let currentFrameInterval = 0;

export function start() {
  if (running) return;
  running = true;
  last = performance.now();
  stats.fpsAt = last;
  requestAnimationFrame(tick);
}

export function stop() {
  running = false;
}

/** Ограничить частоту кадров (0 — без ограничения). Используется, когда открыт оверлей. */
export function setFpsCap(fps) {
  currentFrameInterval = fps > 0 ? 1000 / fps : 0;
}

export function getFps() {
  return stats.fps;
}

// Возврат во вкладку — сразу догоняем мир, не дожидаясь тиков.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    last = performance.now();
    simAcc = slowAcc = 0;
    emit('resume');
    emit('sim', SIM_STEP);
    emit('slow', SLOW_STEP);
  } else {
    emit('pause');
  }
});
