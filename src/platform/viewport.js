// Размеры canvas, DPR и CSS-переменные безопасных зон.

import { tg } from './telegram.js';
import { emit } from '../core/events.js';

const MAX_DPR = 2; // выше — только нагрев телефона без видимой разницы

let canvas = null;
let ctx = null;
let cssW = 0;
let cssH = 0;
let dpr = 1;

export function initViewport(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d', { alpha: false });

  relayout();
  window.addEventListener('resize', relayout);
  window.addEventListener('orientationchange', () => setTimeout(relayout, 120));
  tg.onViewportChanged(relayout);

  return { canvas, ctx };
}

export function relayout() {
  const root = document.documentElement;

  const tgHeight = tg.viewportHeight();
  const h = tgHeight || window.innerHeight;
  root.style.setProperty('--vh', `${h / 100}px`);

  // CSS сам возьмёт максимум с env() — здесь только то, что знает Telegram.
  const inset = tg.safeArea();
  root.style.setProperty('--tg-top', `${inset.top}px`);
  root.style.setProperty('--tg-bottom', `${inset.bottom}px`);

  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  cssW = Math.max(1, Math.round(rect.width));
  cssH = Math.max(1, Math.round(rect.height));
  dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

  const pxW = Math.round(cssW * dpr);
  const pxH = Math.round(cssH * dpr);
  if (canvas.width !== pxW || canvas.height !== pxH) {
    canvas.width = pxW;
    canvas.height = pxH;
  }
  emit('resize', { cssW, cssH, dpr });
}

export function viewportInfo() {
  return { canvas, ctx, cssW, cssH, dpr };
}
