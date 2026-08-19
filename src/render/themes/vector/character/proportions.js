// Пропорции фигуры по полу. Всё в единицах комнаты, рост стоя ≈ 250.

export const PROPORTIONS = {
  m: {
    headR: 21,
    shoulder: 32,     // половина ширины плеч
    hip: 27,
    torso: 92,
    leg: 108,
    upperArm: 50,
    foreArm: 46,
    limbW: 10.5,
    armW: 8.5,
    hair: 'short',
    height: 1,
  },
  f: {
    headR: 20,
    shoulder: 28,
    hip: 30,
    torso: 88,
    leg: 104,
    upperArm: 47,
    foreArm: 44,
    limbW: 9.2,
    armW: 7.4,
    hair: 'ponytail',
    height: 0.95,
  },
};

export const PALETTES = {
  m: { skin: '#e0a882', hair: '#3a2b23', top: '#3f6ea8', bottom: '#2c3242', shoe: '#1d222c' },
  f: { skin: '#eebb95', hair: '#6b3a2a', top: '#b45c86', bottom: '#3a3550', shoe: '#25202e' },
};

export function proportionsFor(gender) {
  return PROPORTIONS[gender] || PROPORTIONS.m;
}

export function paletteFor(gender, seedTint) {
  const base = PALETTES[gender] || PALETTES.m;
  return seedTint ? { ...base, top: seedTint } : base;
}
