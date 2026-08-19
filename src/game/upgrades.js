// Уровни ПК. Цена ×4.5, мощность ×2.5 — классическая замедляющаяся кривая.
// `visual` читает рисовалка ПК: чем выше уровень, тем крупнее и ярче железо.

export const PC_TIERS = [
  { name: 'Офисный ПК',        price: 0,          power: 1,    visual: { size: 0.72, fans: 0, rgb: 0.0, glass: false, monitors: 1 } },
  { name: 'Бюджетная сборка',  price: 150,        power: 2.5,  visual: { size: 0.80, fans: 1, rgb: 0.1, glass: false, monitors: 1 } },
  { name: 'Игровая сборка',    price: 900,        power: 6,    visual: { size: 0.88, fans: 2, rgb: 0.3, glass: false, monitors: 1 } },
  { name: 'Новая видеокарта',  price: 4_500,      power: 15,   visual: { size: 0.94, fans: 2, rgb: 0.45, glass: true,  monitors: 1 } },
  { name: 'Кастом с подсветкой', price: 22_000,   power: 38,   visual: { size: 1.00, fans: 3, rgb: 0.7, glass: true,  monitors: 1 } },
  { name: 'Двухмониторка',     price: 100_000,    power: 95,   visual: { size: 1.04, fans: 3, rgb: 0.8, glass: true,  monitors: 2 } },
  { name: 'Стример-риг',       price: 450_000,    power: 240,  visual: { size: 1.08, fans: 4, rgb: 0.85, glass: true, monitors: 2 } },
  { name: 'Водяное охлаждение', price: 2_000_000, power: 600,  visual: { size: 1.12, fans: 4, rgb: 0.9, glass: true,  monitors: 2 } },
  { name: 'Топ-энд сборка',    price: 9_000_000,  power: 1_500, visual: { size: 1.16, fans: 5, rgb: 0.95, glass: true, monitors: 2 } },
  { name: 'Про-киберспорт',    price: 40_000_000, power: 3_800, visual: { size: 1.20, fans: 5, rgb: 1.0, glass: true, monitors: 3 } },
  { name: 'ПК мечты',          price: 180_000_000, power: 9_500, visual: { size: 1.25, fans: 6, rgb: 1.0, glass: true, monitors: 3 } },
];

export const MAX_TIER = PC_TIERS.length - 1;

export function tierInfo(index) {
  return PC_TIERS[Math.max(0, Math.min(MAX_TIER, index | 0))];
}

export function powerOf(index) {
  return tierInfo(index).power;
}

export function nextTier(index) {
  return index >= MAX_TIER ? null : PC_TIERS[index + 1];
}

export function upgradePrice(index) {
  const next = nextTier(index);
  return next ? next.price : Infinity;
}
