// Занавески по краям окна: карниз и две складчатые шторы.

import { rgba, mix } from '../../../material.js';

export function draw(ctx, { w, h, mat, variant }) {
  const halfW = w / 2;
  const top = -h;
  const panelW = variant === 'heavy' ? w * 0.3 : w * 0.24;

  // карниз
  ctx.fillStyle = mix(mat.dark, '#2a2f3d', 0.5);
  ctx.fillRect(-halfW - 8, top - 10, w + 16, 7);
  ctx.beginPath();
  ctx.arc(-halfW - 10, top - 6, 5, 0, Math.PI * 2);
  ctx.arc(halfW + 10, top - 6, 5, 0, Math.PI * 2);
  ctx.fill();

  for (const side of [-1, 1]) {
    const x0 = side < 0 ? -halfW : halfW - panelW;
    const g = ctx.createLinearGradient(x0, 0, x0 + panelW, 0);
    g.addColorStop(0, side < 0 ? mat.dark : mat.base);
    g.addColorStop(0.5, mat.base);
    g.addColorStop(1, side < 0 ? mat.base : mat.dark);
    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.moveTo(x0, top - 3);
    ctx.lineTo(x0 + panelW, top - 3);
    // нижний волнистый край
    const steps = 5;
    for (let i = steps; i >= 0; i--) {
      const t = i / steps;
      const x = x0 + panelW * t;
      const y = -6 + Math.sin(t * Math.PI * 2 + side) * 7;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // складки
    ctx.strokeStyle = rgba(mat.line, variant === 'heavy' ? 0.55 : 0.35);
    ctx.lineWidth = 2;
    for (let i = 1; i < 4; i++) {
      const x = x0 + (panelW / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x + side * 3, -8);
      ctx.stroke();
    }
  }
}
