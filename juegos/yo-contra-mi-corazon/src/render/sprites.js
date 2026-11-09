// Atlas de sprites (generado por scripts/atlas.py).
import { ATLAS_PNG, FRAMES } from '../data/atlas.js';
let img = null;
export function loadSprites() {
  return new Promise((res, rej) => { img = new Image(); img.onload = () => res(img); img.onerror = rej; img.src = ATLAS_PNG; });
}
export const frame = (name) => FRAMES[name];
// Dibuja un cuadro; opts.part = [sx, sy, sw, sh] relativo al cuadro (para partir el corazón).
export function spr(ctx, name, x, y, { part = null, alpha = 1 } = {}) {
  const f = FRAMES[name]; if (!f || !img) return;
  const [fx, fy, fw, fh] = f;
  const [sx, sy, sw, sh] = part || [0, 0, fw, fh];
  if (alpha !== 1) ctx.globalAlpha = alpha;
  ctx.drawImage(img, fx + sx, fy + sy, sw, sh, Math.round(x + sx), Math.round(y + sy), sw, sh);
  if (alpha !== 1) ctx.globalAlpha = 1;
}
