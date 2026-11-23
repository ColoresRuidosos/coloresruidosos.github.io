// Convierte los mapas de data/sprites.js en lienzos una sola vez y los dibuja por nombre.
// Punto de cambio para Gemini (spec §5): registerAtlas() reemplaza un nombre por un recorte de imagen.
import { SPRITES } from '../data/sprites.js';
import { PALETTE } from '../data/palette.js';

const cache = new Map();
const atlas = new Map();

export function registerAtlas(img, frames) { for (const [name, [x, y, w, h]] of Object.entries(frames)) atlas.set(name, { img, x, y, w, h }); }

function build(name) {
  const rows = SPRITES[name];
  if (!rows) return null;
  const c = document.createElement('canvas');
  c.width = rows[0].length; c.height = rows.length;
  const g = c.getContext('2d');
  rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.') { g.fillStyle = PALETTE[ch]; g.fillRect(x, y, 1, 1); } }));
  return { img: c, x: 0, y: 0, w: c.width, h: c.height };
}

export function getSprite(name) {
  if (atlas.has(name)) return atlas.get(name);
  if (!cache.has(name)) cache.set(name, build(name));
  return cache.get(name);
}

// Dibuja centrado en (cx, cy). flip: espejo horizontal.
export function drawSprite(ctx, name, cx, cy, { flip = false, alpha = 1, scale = 1 } = {}) {
  const s = getSprite(name);
  if (!s) return;
  const w = s.w * scale, h = s.h * scale;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(Math.round(cx), Math.round(cy));
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(s.img, s.x, s.y, s.w, s.h, -Math.floor(w / 2), -Math.floor(h / 2), w, h);
  ctx.restore();
}
