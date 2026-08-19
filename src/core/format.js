// Форматирование чисел и времени для русского UI.

const UNITS = ['', 'K', 'M', 'B', 'T', 'aa', 'ab', 'ac', 'ad', 'ae'];

/** 1234 → «1.2K». Мелкие значения показываются с одним знаком. */
export function short(n) {
  if (!isFinite(n)) return '0';
  const sign = n < 0 ? '-' : '';
  n = Math.abs(n);
  if (n < 1000) return sign + (n < 10 ? trimZero(n.toFixed(1)) : String(Math.floor(n)));
  let u = 0;
  while (n >= 1000 && u < UNITS.length - 1) {
    n /= 1000;
    u++;
  }
  return sign + trimZero(n.toFixed(n < 10 ? 2 : n < 100 ? 1 : 0)) + UNITS[u];
}

function trimZero(s) {
  return s.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
}

/** Скорость дохода в секунду. */
export function rate(n) {
  return `${short(n)}/сек`;
}

/** Длительность в мс → «3 ч 12 мин». */
export function duration(ms) {
  if (ms < 0) ms = 0;
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (d > 0) return `${d} ${plural(d, 'день', 'дня', 'дней')} ${h} ч`;
  if (h > 0) return `${h} ч ${m} мин`;
  if (m > 0) return `${m} мин`;
  return `${s} сек`;
}

/** Русские формы множественного числа. */
export function plural(n, one, few, many) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}

export function pct(x) {
  return `${Math.round(x * 100)}%`;
}

export function clamp(v, a, b) {
  return v < a ? a : v > b ? b : v;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}
