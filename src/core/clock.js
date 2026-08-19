// Единственный источник времени. Отладочные переопределения живут здесь,
// чтобы остальной код никогда не читал Date напрямую.

const params = new URLSearchParams(location.search);

let hourOverride = null; // 0..24

const t = params.get('t');
if (t) {
  const m = /^(\d{1,2})(?::(\d{2}))?$/.exec(t.trim());
  if (m) hourOverride = Math.min(24, +m[1] + (m[2] ? +m[2] / 60 : 0));
}

export function now() {
  return Date.now();
}

/** Час суток как дробное число 0..24 (или отладочное значение). */
export function hourOfDay(ts = now()) {
  if (hourOverride !== null) return hourOverride;
  const d = new Date(ts);
  return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
}

export function isHourOverridden() {
  return hourOverride !== null;
}

/** Ключ локальных суток 'YYYY-MM-DD' — используется для ежедневок и погоды. */
export function dayKey(ts = now()) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Индекс часовой корзины — стабильный сид для симуляции гостей. */
export function hourKey(ts = now()) {
  return Math.floor(ts / 3600000);
}

export function monthIndex(ts = now()) {
  const m = params.get('month');
  if (m !== null) return Math.max(0, Math.min(11, +m));
  return new Date(ts).getMonth();
}

/** Миллисекунд до локальной полуночи. */
export function msUntilMidnight(ts = now()) {
  const d = new Date(ts);
  d.setHours(24, 0, 0, 0);
  return d.getTime() - ts;
}
