// Ключевые кадры освещения по часу суток. Между ними — линейная интерполяция,
// поэтому свет ползёт непрерывно, а не переключается ступенькой.

export const KEYS = [
  { h: 0,  phase: 'night', ambient: '#1b2340', alpha: 0.55, skyTop: '#050914', skyBottom: '#131c33', sun: 0.00, lamp: true },
  { h: 4,  phase: 'night', ambient: '#1d2547', alpha: 0.52, skyTop: '#070d1d', skyBottom: '#182241', sun: 0.00, lamp: true },
  { h: 5.5,phase: 'dawn',  ambient: '#2e3358', alpha: 0.45, skyTop: '#1a2140', skyBottom: '#4a3a5c', sun: 0.10, lamp: true },
  { h: 7,  phase: 'dawn',  ambient: '#6f5a6e', alpha: 0.28, skyTop: '#4a3f6b', skyBottom: '#e0946b', sun: 0.45, lamp: false },
  { h: 9,  phase: 'day',   ambient: '#cfd8ea', alpha: 0.10, skyTop: '#5b9bd8', skyBottom: '#a9cdf0', sun: 0.85, lamp: false },
  { h: 13, phase: 'day',   ambient: '#ffffff', alpha: 0.05, skyTop: '#4f93da', skyBottom: '#bcdcf7', sun: 1.00, lamp: false },
  { h: 16, phase: 'day',   ambient: '#f3ead9', alpha: 0.08, skyTop: '#5590d2', skyBottom: '#cfe0f2', sun: 0.88, lamp: false },
  { h: 18, phase: 'dusk',  ambient: '#e6a878', alpha: 0.18, skyTop: '#5f7fc0', skyBottom: '#f0b183', sun: 0.50, lamp: false },
  { h: 19.5, phase: 'dusk', ambient: '#a2648c', alpha: 0.34, skyTop: '#3a4a86', skyBottom: '#e07a63', sun: 0.20, lamp: true },
  { h: 21, phase: 'evening', ambient: '#3a3f6e', alpha: 0.46, skyTop: '#131c3d', skyBottom: '#2c2f5c', sun: 0.04, lamp: true },
  { h: 24, phase: 'night', ambient: '#1b2340', alpha: 0.55, skyTop: '#050914', skyBottom: '#131c33', sun: 0.00, lamp: true },
];

export const PHASE_NAMES = {
  night: 'Ночь',
  dawn: 'Утро',
  day: 'День',
  dusk: 'Закат',
  evening: 'Вечер',
};

/** Перевод «астрономического» часа в час LUT с учётом длины светового дня сезона. */
export function remapHour(hour, sunrise, sunset) {
  const REF_RISE = 6;
  const REF_SET = 20;
  if (hour <= sunrise) {
    const t = sunrise > 0 ? hour / sunrise : 0;
    return t * REF_RISE;
  }
  if (hour >= sunset) {
    const span = 24 - sunset;
    const t = span > 0 ? (hour - sunset) / span : 0;
    return REF_SET + t * (24 - REF_SET);
  }
  const t = (hour - sunrise) / (sunset - sunrise);
  return REF_RISE + t * (REF_SET - REF_RISE);
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]) {
  const c = (v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function mixHex(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
}

/** Состояние света для конкретного часа LUT. */
export function daylightAt(lutHour) {
  const h = ((lutHour % 24) + 24) % 24;
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1].h <= h) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const span = b.h - a.h || 1;
  const t = Math.max(0, Math.min(1, (h - a.h) / span));
  return {
    phase: t < 0.5 ? a.phase : b.phase,
    ambient: mixHex(a.ambient, b.ambient, t),
    alpha: a.alpha + (b.alpha - a.alpha) * t,
    skyTop: mixHex(a.skyTop, b.skyTop, t),
    skyBottom: mixHex(a.skyBottom, b.skyBottom, t),
    sun: a.sun + (b.sun - a.sun) * t,
    lamp: t < 0.5 ? a.lamp : b.lamp,
    hour: h,
  };
}

export { mixHex };
