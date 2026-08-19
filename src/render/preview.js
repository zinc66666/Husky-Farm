// Рендер комнаты в произвольный canvas — используется при походе в гости.
// Никакого кеша слоёв: картинка маленькая и живёт недолго.

import { ROOM } from '../data/slots.js';
import { drawStaticScene, drawDynamicScene } from './compose.js';
import { setAmbient } from './material.js';

export function renderRoomTo(ctx, model, width, height, t = 0) {
  const scale = Math.max(width / ROOM.w, height / ROOM.h);
  const ox = (width - ROOM.w * scale) / 2;
  const oy = height - ROOM.h * scale;

  const light = model.world.light;
  setAmbient(light.ambient, light.alpha * 0.9, model.world.lightKey);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#0f111a';
  ctx.fillRect(0, 0, width, height);

  ctx.setTransform(scale, 0, 0, scale, ox, oy);
  drawStaticScene(ctx, model, null);
  drawDynamicScene(ctx, model, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
