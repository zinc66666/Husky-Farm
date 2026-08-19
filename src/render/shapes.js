// Общие примитивы для всех рисовалок темы.

export function roundRect(ctx, x, y, w, h, r) {
  const rad = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

export function fillRound(ctx, x, y, w, h, r, style) {
  if (style) ctx.fillStyle = style;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
}

export function strokeRound(ctx, x, y, w, h, r, style, lw = 2) {
  if (style) ctx.strokeStyle = style;
  ctx.lineWidth = lw;
  roundRect(ctx, x, y, w, h, r);
  ctx.stroke();
}

/** Сужающаяся капсула — из них собран персонаж. */
export function capsule(ctx, x1, y1, x2, y2, w1, w2, style) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  ctx.beginPath();
  ctx.moveTo(x1 + nx * w1, y1 + ny * w1);
  ctx.lineTo(x2 + nx * w2, y2 + ny * w2);
  ctx.arc(x2, y2, w2, Math.atan2(ny, nx), Math.atan2(-ny, -nx), false);
  ctx.lineTo(x1 - nx * w1, y1 - ny * w1);
  ctx.arc(x1, y1, w1, Math.atan2(-ny, -nx), Math.atan2(ny, nx), false);
  ctx.closePath();
  if (style) {
    ctx.fillStyle = style;
    ctx.fill();
  }
}

export function ellipseFill(ctx, x, y, rx, ry, style) {
  ctx.fillStyle = style;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Мягкая тень под предметом на полу. */
export function groundShadow(ctx, x, y, rx, alpha = 0.24) {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, rx * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
}
