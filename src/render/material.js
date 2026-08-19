// Цвет предмета → набор оттенков с подмешанным цветом окружающего света.
// Результат мемоизируется по ключу «цвет|корзина света», поэтому HSL-математики
// в кадровом пути нет вообще.

import { hexOf } from '../data/palettes.js';

const cache = new Map();
let ambientHex = '#ffffff';
let ambientAmount = 0;
let currentKey = 'init';

/** Вызывается при смене фазы света: lightKey — квантованная корзина. */
export function setAmbient(hex, amount, lightKey) {
  ambientHex = hex;
  ambientAmount = Math.max(0, Math.min(0.8, amount));
  currentKey = lightKey;
  if (cache.size > 600) cache.clear();
}

export function ambientInfo() {
  return { hex: ambientHex, amount: ambientAmount, key: currentKey };
}

export function material(colorKey) {
  const key = `${colorKey}|${currentKey}`;
  let m = cache.get(key);
  if (m) return m;

  const base = hexOf(colorKey);
  const [h, s, l] = rgbToHsl(hexToRgb(base));

  // Чёрное и белое отдельно ограничиваем, чтобы контур не сливался с заливкой.
  const lineL = l < 22 ? l + 16 : Math.max(l - 28, 4);
  const lightL = l > 92 ? l - 8 : Math.min(l + 12, 97);
  const darkL = l < 10 ? l + 9 : Math.max(l - 14, 3);

  m = {
    base: mixAmbient(hslToHex(h, s, l)),
    light: mixAmbient(hslToHex(h, Math.max(0, s - 4), lightL)),
    dark: mixAmbient(hslToHex(h, s, darkL)),
    line: mixAmbient(hslToHex(h, Math.max(0, s - 10), lineL)),
    glow: hslToHex(h, Math.min(100, s + 25), Math.min(72, l + 22)),
    raw: base,
  };
  cache.set(key, m);
  return m;
}

function mixAmbient(hex) {
  if (ambientAmount <= 0.001) return hex;
  return mix(hex, ambientHex, ambientAmount * 0.55);
}

// --- цветовая математика ---

export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]) {
  const c = (v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function mix(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
}

export function rgba(hex, alpha) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb;
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return rgbToHex(rgb.map((v) => (v + m) * 255));
}

export { hslToHex };
