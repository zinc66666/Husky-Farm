// Минимальная шина событий между системами и UI.

const map = new Map();

export function on(name, fn) {
  if (!map.has(name)) map.set(name, new Set());
  map.get(name).add(fn);
  return () => off(name, fn);
}

export function off(name, fn) {
  const set = map.get(name);
  if (set) set.delete(fn);
}

export function emit(name, payload) {
  const set = map.get(name);
  if (!set) return;
  for (const fn of [...set]) {
    try {
      fn(payload);
    } catch (err) {
      console.error(`[events] ${name}`, err);
    }
  }
}
