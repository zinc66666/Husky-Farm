// Отладочный оверлей: ?debug=1

import { getFps } from '../core/loop.js';
import { debugInfo } from './renderer.js';
import { getWorld } from '../game/world.js';
import { getState } from '../state/store.js';

let node = null;
const enabled = new URLSearchParams(location.search).get('debug') === '1';

export function initDebug() {
  if (!enabled) return;
  node = document.createElement('div');
  node.id = 'debug';
  document.getElementById('stage').append(node);
  setInterval(update, 500);
}

function update() {
  if (!node) return;
  const info = debugInfo();
  const w = getWorld();
  const s = getState();
  node.textContent = [
    `fps ${getFps()}`,
    `scale ${info.view.scale.toFixed(3)} ox ${info.view.ox.toFixed(0)} oy ${info.view.oy.toFixed(0)}`,
    `redraws ${JSON.stringify(info.redraws)}`,
    `particles ${info.particles}`,
    `h ${w.hour.toFixed(2)} ${w.phase} ${w.season} ${w.weather} i=${w.intensity.toFixed(2)}`,
    `seed ${s.seed} tier ${s.rig.pcTier}`,
  ].join('\n');
}

export function isDebug() {
  return enabled;
}
