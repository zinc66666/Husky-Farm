// Детерминированный PRNG: одинаковый сид — одинаковая комната, погода, соседи.

/** Строка → 32-битный сид. */
export function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

/** 32-битный сид → генератор чисел 0..1. */
export function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Удобная обёртка: строка → набор помощников. */
export function seeded(str) {
  const rnd = mulberry32(xmur3(String(str))());
  const api = {
    next: rnd,
    range: (a, b) => a + rnd() * (b - a),
    int: (a, b) => Math.floor(a + rnd() * (b - a + 1)),
    pick: (arr) => arr[Math.floor(rnd() * arr.length)],
    chance: (p) => rnd() < p,
    /** Приблизительно нормальное распределение, среднее 0, сигма 1. */
    gauss: () => (rnd() + rnd() + rnd() + rnd() - 2) * 1.1,
    weighted(entries) {
      const total = entries.reduce((s, e) => s + e.w, 0);
      let r = rnd() * total;
      for (const e of entries) {
        r -= e.w;
        if (r <= 0) return e.v;
      }
      return entries[entries.length - 1].v;
    },
    shuffle(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
  };
  return api;
}

export function randomSeed() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
