// Цвета для перекраски предметов. Ключ хранится в сейве, hex живёт только здесь —
// поэтому палитру можно править, не трогая сохранения игроков.

export const COLORS = {
  white:    { name: 'Белый',       hex: '#f2f4f8' },
  black:    { name: 'Чёрный',      hex: '#1b1d24' },
  graphite: { name: 'Графит',      hex: '#2b3040' },
  gray:     { name: 'Серый',       hex: '#8e95ad' },
  wood:     { name: 'Дерево',      hex: '#b98a5a' },
  walnut:   { name: 'Орех',        hex: '#7b5236' },
  pink:     { name: 'Розовый',     hex: '#f48fb1' },
  red:      { name: 'Красный',     hex: '#eb5757' },
  orange:   { name: 'Оранжевый',   hex: '#f2994a' },
  yellow:   { name: 'Жёлтый',      hex: '#f2c94c' },
  green:    { name: 'Зелёный',     hex: '#6fcf97' },
  mint:     { name: 'Мятный',      hex: '#7fe3c4' },
  cyan:     { name: 'Голубой',     hex: '#56ccf2' },
  blue:     { name: 'Синий',       hex: '#4e9af1' },
  purple:   { name: 'Фиолетовый',  hex: '#a88bfa' },
};

/** Наборы, из которых магазин показывает кружки для конкретной вещи. */
export const COLOR_SETS = {
  full: Object.keys(COLORS),
  wood: ['wood', 'walnut', 'white', 'black', 'graphite', 'pink', 'mint', 'cyan'],
  tech: ['black', 'white', 'graphite', 'gray', 'blue', 'purple', 'pink', 'mint', 'red'],
  soft: ['white', 'gray', 'pink', 'mint', 'cyan', 'purple', 'yellow', 'green', 'orange'],
  wall: ['graphite', 'black', 'gray', 'white', 'blue', 'purple', 'pink', 'mint', 'green'],
};

export function hexOf(key) {
  return COLORS[key]?.hex || COLORS.gray.hex;
}

export function colorName(key) {
  return COLORS[key]?.name || key;
}

export function colorSet(name) {
  return COLOR_SETS[name] || COLOR_SETS.full;
}

/** Грубые семьи цветов — по ним считается бонус за гармонию комнаты. */
export const COLOR_FAMILY = {
  white: 'neutral', black: 'neutral', graphite: 'neutral', gray: 'neutral',
  wood: 'warm', walnut: 'warm', orange: 'warm', yellow: 'warm', red: 'warm',
  pink: 'pink', purple: 'pink',
  green: 'cool', mint: 'cool', cyan: 'cool', blue: 'cool',
};
