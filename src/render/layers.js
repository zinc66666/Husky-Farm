// Оффскрин-слои с флагами «грязный». Только слой main рисуется каждый кадр —
// это и держит 60 fps на телефоне.

const layers = new Map();

export function makeLayer(name, w, h) {
  let layer = layers.get(name);
  if (!layer) {
    const canvas = document.createElement('canvas');
    layer = { canvas, ctx: canvas.getContext('2d'), dirty: true, w: 0, h: 0, redraws: 0 };
    layers.set(name, layer);
  }
  if (layer.w !== w || layer.h !== h) {
    layer.canvas.width = w;
    layer.canvas.height = h;
    layer.w = w;
    layer.h = h;
    layer.dirty = true;
  }
  return layer;
}

export function getLayer(name) {
  return layers.get(name) || null;
}

export function markDirty(name) {
  if (name === 'all') {
    for (const layer of layers.values()) layer.dirty = true;
    return;
  }
  const layer = layers.get(name);
  if (layer) layer.dirty = true;
}

/** Перерисовывает слой, только если он помечен грязным. */
export function ensure(name, w, h, draw) {
  const layer = makeLayer(name, w, h);
  if (layer.dirty) {
    layer.ctx.setTransform(1, 0, 0, 1, 0, 0);
    layer.ctx.clearRect(0, 0, w, h);
    draw(layer.ctx, w, h);
    layer.dirty = false;
    layer.redraws++;
  }
  return layer;
}

export function redrawCounts() {
  const out = {};
  for (const [name, layer] of layers) out[name] = layer.redraws;
  return out;
}
