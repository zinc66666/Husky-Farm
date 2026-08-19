// Точка входа персонажа: ставит фигуру в нужное место и включает нужный клип.

import { drawFigure } from './rig.js';
import { emitSteam } from '../../../fx.js';

const CLIP_FOR = {
  play: 'play',
  tea: 'tea',
  window: 'window',
  walk: 'walk',
};

let steamAt = 0;

export function draw(ctx, { model, pos, t, world }) {
  const activity = model.activity;
  const clip = CLIP_FOR[activity] || 'idle';
  const seated = activity === 'play' || activity === 'tea';

  ctx.save();
  ctx.translate(pos.x, pos.y);

  // Сидя фигура чуть меньше — она дальше от зрителя, за столом.
  const scale = seated ? 0.96 : 1;

  drawFigure(ctx, {
    gender: model.owner.gender,
    activity: clip,
    t,
    scale,
    world,
    mugVisible: activity === 'tea',
  });

  ctx.restore();

  // пар от кружки
  if (activity === 'tea' && t - steamAt > 0.28) {
    steamAt = t;
    emitSteam(pos.x + 22, pos.y - 108);
  }
}
