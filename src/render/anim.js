// Плавности и проигрыватель ключевых кадров поз.

export const ease = {
  linear: (t) => t,
  inOut: (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
  out: (t) => 1 - (1 - t) ** 2,
  in: (t) => t * t,
  sine: (t) => 0.5 - Math.cos(Math.PI * t) / 2,
};

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** Смешивает два словаря углов. */
export function blendPose(a, b, t) {
  const out = {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) out[k] = lerp(a[k] ?? 0, b[k] ?? 0, t);
  return out;
}

/**
 * Проигрывает клип { duration, loop, keys: [{ t, pose, ease }] }.
 * time — секунды от начала клипа.
 */
export function playClip(clip, time) {
  const dur = clip.duration || 1;
  let phase = clip.loop === false ? Math.min(time, dur) / dur : (time % dur) / dur;
  const keys = clip.keys;
  if (!keys || !keys.length) return {};
  if (keys.length === 1) return { ...keys[0].pose };

  let i = 0;
  while (i < keys.length - 2 && keys[i + 1].t <= phase) i++;
  const a = keys[i];
  const b = keys[i + 1] || keys[0];
  const span = (b.t <= a.t ? b.t + 1 : b.t) - a.t || 1;
  let t = (phase - a.t) / span;
  t = Math.max(0, Math.min(1, t));
  const easeFn = ease[b.ease || 'inOut'] || ease.inOut;
  return blendPose(a.pose, b.pose, easeFn(t));
}

/** Аддитивная добавка поверх любой позы — чтобы ничто не выглядело замороженным. */
export function breathe(time, amount = 1) {
  const s = Math.sin(time * (Math.PI * 2) / 4);
  return { chestScale: 1 + s * 0.015 * amount, headBob: s * 0.9 * amount };
}
