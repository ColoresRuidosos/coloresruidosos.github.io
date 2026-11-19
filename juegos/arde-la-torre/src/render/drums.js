// Batería de Jota (F22): dibujada por código en pixel art. (x, y) = suelo bajo el bombo; `hit` (0–1) mueve platillos y parches.
const OUT = '#120c18';
function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = OUT; ctx.beginPath(); ctx.ellipse(x, y, rx + 1, ry + 1, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
}
function stand(ctx, x, y0, y1) { ctx.fillStyle = OUT; ctx.fillRect(x - 1, y1, 3, y0 - y1); ctx.fillStyle = '#9aa0ad'; ctx.fillRect(x, y1, 1, y0 - y1); }
function cymbal(ctx, x, y, r, tilt) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
  ctx.fillStyle = OUT; ctx.fillRect(-r - 1, -2, 2 * r + 2, 4);
  ctx.fillStyle = '#e8c65a'; ctx.fillRect(-r, -1, 2 * r, 2);
  ctx.fillStyle = '#fff2b0'; ctx.fillRect(-r + 2, -1, r, 1);
  ctx.restore();
}

export function drawDrumKit(ctx, x, y, face = 1, hit = 0) {
  x = Math.round(x); y = Math.round(y);
  const f = face < 0 ? -1 : 1, wob = Math.sin(hit * Math.PI) * 0.35;
  // platillos al fondo (crash alto y charles)
  stand(ctx, x + f * 16, y, y - 40); cymbal(ctx, x + f * 16, y - 41, 9, f * (0.25 + wob));
  stand(ctx, x - f * 17, y, y - 30); cymbal(ctx, x - f * 17, y - 31, 7, -f * wob * 0.5); cymbal(ctx, x - f * 17, y - 28, 7, 0);
  // tom aéreo y caja
  ellipse(ctx, x + f * 6, y - 30, 6, 3, '#f4f0e0'); ctx.fillStyle = '#7a1420'; ctx.fillRect(x + f * 6 - 6, y - 30, 12, 5);
  ellipse(ctx, x - f * 9, y - 22 + Math.round(hit), 7, 3, '#f4f0e0');
  ctx.fillStyle = OUT; ctx.fillRect(x - f * 9 - 7, y - 22, 14, 6); ctx.fillStyle = '#c9ccd4'; ctx.fillRect(x - f * 9 - 6, y - 21, 12, 4);
  stand(ctx, x - f * 9, y, y - 17);
  // bombo de frente con el parche y el aro
  ellipse(ctx, x, y - 12, 12, 12, '#7a1420');
  ellipse(ctx, x, y - 12, 9 + Math.round(hit), 9 + Math.round(hit), '#f4f0e0');
  ctx.fillStyle = '#ffd23f'; ctx.fillRect(x - 4, y - 13, 9, 2);                    // franja (sin logos)
  ctx.fillStyle = OUT; ctx.fillRect(x - 12, y - 1, 3, 2); ctx.fillRect(x + 10, y - 1, 3, 2);   // patas
}
