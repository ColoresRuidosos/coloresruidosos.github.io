// Sprites finales (atlas generados por scripts/slice_sheet.py a partir de las hojas de Gemini).
// Si un músico aún no tiene atlas, o la imagen no ha cargado, se usa el sprite provisional dibujado por código.
import * as ANTONIO from '../data/atlas-antonio.js';
import * as PEPE from '../data/atlas-pepe.js';
import { getSprite, getPortrait } from './sprites.js';

const SOURCES = { antonio: ANTONIO, pepe: PEPE };
// Si a un músico le falta una pose, se usa la equivalente (cada hoja de Gemini sale algo distinta).
const FALLBACK = { hurt: 'sp0', fall2: 'fall1', fall1: 'fall0', punch2m: 'punch2a', idle1: 'idle0' };
const images = {};
// Repetidos (2P, 3P…): el mismo sprite con otro tono (donde el navegador admite filtros; si no, igual).
const TINT = [null, 'hue-rotate(160deg) saturate(0.9)', 'hue-rotate(250deg)', 'hue-rotate(80deg) saturate(0.8)'];

function image(type) {
  const src = SOURCES[type];
  if (!src || typeof Image === 'undefined') return null;
  if (!images[type]) { const im = new Image(); im.src = src.PNG; images[type] = im; }
  const im = images[type];
  return im.complete && im.naturalWidth ? im : null;
}

export const hasAtlas = (type) => !!SOURCES[type] && !!image(type);

// Nombre del fotograma según el estado de la simulación.
export function heroFrameName(f) {
  const t = f.t;
  switch (f.state) {
    case 'walk': return `walk${Math.floor(t / 8) % 4}`;
    case 'run': return `run${Math.floor(t / 5) % 4}`;
    case 'jump': return f.airAtk && f.airT < 16 ? 'air' : (f.vz > 0 ? 'jump0' : 'jump1');
    case 'attack': {
      const m = f.atk, pre = t < m.start;
      if (m.weapon) return pre ? 'punch2a' : 'punch2b';
      if (m.knock) return t < m.start / 2 ? 'guit0' : pre ? 'guit1' : 'guit2';
      return f.combo % 2 ? (pre ? 'punch2a' : 'punch2b') : (pre ? 'punch1a' : 'punch1b');
    }
    case 'dash': return 'guit2';
    case 'special': return `sp${Math.min(3, Math.floor(t / 7))}`;
    case 'grab': return f.kneeT > 0 ? 'knee' : 'grab';
    case 'throwing': return t < 7 ? 'throw0' : 'throw1';
    case 'grabbed': case 'hurt': return 'hurt';
    case 'fall': case 'thrown': return f.vz > 1 ? 'fall0' : f.vz > -1.5 ? 'fall1' : 'fall2';
    case 'down': case 'dead': return 'down';
    case 'rise': return t < 8 ? 'rise0' : 'rise1';
    case 'victory': return `win${Math.floor(t / 20) % 2}`;
    default: return `idle${Math.floor(t / 24) % 2}`;
  }
}

// Dibuja el fotograma con los pies en (x, y). Devuelve el alto dibujado (o 0 si no hay atlas).
export function drawFrame(ctx, type, palette, name, x, y, face = 1) {
  const im = image(type);
  const F = im && SOURCES[type].FRAMES;
  let n = name;
  while (F && !F[n] && FALLBACK[n]) n = FALLBACK[n];
  const fr = F && (F[n] || F.idle0);
  if (!fr) return 0;
  const [sx, sy, sw, sh, ox, oy] = fr;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (face < 0) ctx.scale(-1, 1);
  if (palette && TINT[palette % TINT.length]) ctx.filter = TINT[palette % TINT.length];
  ctx.drawImage(im, sx, sy, sw, sh, -ox, -oy, sw, sh);
  ctx.restore();
  return sh;
}

// Figura de menú (título, selección): atlas si hay; si no, el provisional.
export function drawMenuFigure(ctx, type, palette, pose, frame, x, y, h, face = 1) {
  const name = pose === 'victory' ? `win${frame % 2}` : `idle${frame % 2}`;
  if (drawFrame(ctx, type, palette, name, x, y, face)) return;
  const s = getSprite(type, palette, pose, frame, h, type);
  ctx.save(); ctx.translate(x, y); if (face < 0) ctx.scale(-1, 1); ctx.drawImage(s.canvas, -s.ox, -s.oy); ctx.restore();
}

// Retrato cuadrado (HUD, selección, resultados).
export function drawPortrait(ctx, type, palette, h, dx, dy, size) {
  const im = image(type);
  const fr = im && SOURCES[type].FRAMES.portrait;
  if (fr) {
    ctx.save();
    if (palette && TINT[palette % TINT.length]) ctx.filter = TINT[palette % TINT.length];
    ctx.drawImage(im, fr[0], fr[1], fr[2], fr[3], dx, dy, size, size);
    ctx.restore();
    return;
  }
  const pt = getPortrait(type, palette, h);
  ctx.drawImage(pt.canvas, pt.sx, pt.sy, pt.sw, pt.sh, dx, dy, size, size);
}
