// Реестр тем рендера. Каталог ссылается на рисовалки строковым ключом,
// поэтому пиксельная или 3D-тема подставляется без правок игровой логики.

const REGISTRY = {
  vector: () => import('./themes/vector/index.js'),
  // pixel: () => import('./themes/pixel/index.js'),
};

const REQUIRED_FURNITURE = [
  'desk', 'chair', 'monitor', 'pc', 'shelf', 'painting',
  'plant', 'curtains', 'organizer', 'lamp', 'rug', 'misc',
];

let active = null;

export async function setTheme(id) {
  const load = REGISTRY[id] || REGISTRY.vector;
  const mod = await load();
  active = mod.default || mod;
  return active;
}

export function getTheme() {
  return active;
}

export function themeIds() {
  return Object.keys(REGISTRY);
}

/** Отсутствующая рисовалка не роняет игру — рисуется заметный плейсхолдер. */
export function drawerFor(key) {
  const fn = active?.furniture?.[key];
  if (fn) return fn;
  return placeholder(key);
}

function placeholder(key) {
  return (ctx, p) => {
    ctx.fillStyle = '#ff00aa';
    ctx.globalAlpha = 0.7;
    ctx.fillRect(-p.w / 2, -p.h, p.w, p.h);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#000';
    ctx.font = '12px monospace';
    ctx.fillText(key, -p.w / 2 + 4, -p.h / 2);
  };
}

export function missingDrawers() {
  if (!active) return REQUIRED_FURNITURE;
  return REQUIRED_FURNITURE.filter((k) => typeof active.furniture?.[k] !== 'function');
}
