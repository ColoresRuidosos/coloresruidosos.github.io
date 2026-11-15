// Sprites finales (atlas generados por scripts/slice_sheet.py a partir de las hojas de Gemini).
// Si un músico aún no tiene atlas, o la imagen no ha cargado, se usa el sprite provisional dibujado por código.
import * as ANTONIO from '../data/atlas-antonio.js';
import * as PEPE from '../data/atlas-pepe.js';
import * as DANI from '../data/atlas-dani.js';
import * as JOTA from '../data/atlas-jota.js';
import * as BECARIO from '../data/atlas-becario.js';
import * as COMERCIAL from '../data/atlas-comercial.js';
import * as GUARDIA from '../data/atlas-guardia.js';
import * as CONTABLE from '../data/atlas-contable.js';
import * as EJECUTIVA from '../data/atlas-ejecutiva.js';
import * as JEFE_SEGURIDAD from '../data/atlas-jefeSeguridad.js';
import * as RECEPCIONISTA from '../data/atlas-recepcionista.js';
import * as DIRECTOR from '../data/atlas-director.js';
import * as PRESIDENTE from '../data/atlas-presidente.js';
import * as OBJETOS from '../data/atlas-objetos.js';
import { getSprite, getPortrait } from './sprites.js';

const SOURCES = {
  antonio: ANTONIO, pepe: PEPE, dani: DANI, jota: JOTA,
  becario: BECARIO, comercial: COMERCIAL, guardia: GUARDIA, contable: CONTABLE, ejecutiva: EJECUTIVA,
  jefeSeguridad: JEFE_SEGURIDAD, recepcionista: RECEPCIONISTA, director: DIRECTOR, presidente: PRESIDENTE,
  objetos: OBJETOS,
};
// Poses de Gemini con fallos que se sustituyen por otras del mismo músico (hasta que se repitan las hojas).
// Enemigos: cada hoja trae unas poses; las que faltan se sustituyen por la más parecida de ese tipo.
const OVERRIDE = {
  comercial: { wind: 'charge0', atk: 'charge1' },          // su golpe es un maletinazo
  ejecutiva: { wind: 'throw0', atk: 'throw1' },
  contable: { wind: 'shoot0' },
  director: { wind: 'charge0', walk2: 'walk0', walk3: 'walk1', grab0: 'atk', grab1: 'atk', throw0: 'atk', throw1: 'atk', fall1: 'fall0', call: 'atk' },
  presidente: { throw0: 'grab1', throw1: 'atk2', call: 'idle2' },
};
const ENEMY_FALLBACK = {
  atk2: 'atk', idle1: 'idle0', idle2: 'idle1', walk1: 'walk0', walk2: 'walk0', walk3: 'walk1', wind: 'idle0', atk: 'wind',
  charge0: 'wind', charge1: 'charge0', charge2: 'charge1', shoot0: 'wind', shoot1: 'atk', shoot2: 'shoot1',
  grab0: 'wind', grab1: 'atk', throw0: 'grab1', throw1: 'atk', block: 'idle0', call: 'idle0', fall1: 'fall0', hurt: 'fall0',
};
// Si a un músico le falta una pose, se usa la equivalente (cada hoja de Gemini sale algo distinta).
const FALLBACK = { hurt: 'sp0', fall2: 'fall1', fall1: 'fall0', punch2m: 'punch2a', idle1: 'idle0', kick0: 'punch1a', kick1: 'punch1b' };
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
      if (f.combo === 2) return pre ? 'kick0' : 'kick1';   // Dani: el 3.er golpe de su combo de 4 es una patada
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

// Pose de un enemigo según su estado (nombres comunes de scripts/slice_sheet.py).
export function enemyFrameName(f) {
  const t = f.t;
  if (f.callT > 0 && (f.state === 'idle' || f.state === 'walk')) return 'call';   // llama a refuerzos
  switch (f.state) {
    case 'walk': return `walk${Math.floor(t / 8) % 4}`;
    case 'ewind': {
      const mv = f.ai && f.ai.move, m = f.move || {}, wind = m.windup ?? m.start ?? 14;
      if (mv === 'charge') return 'charge0';
      if (mv === 'shoot') return t < wind / 2 ? 'shoot0' : 'shoot1';
      if (mv === 'grab') return 'grab0';
      return 'wind';
    }
    case 'eatk': return f.def && f.def.boss && f.id % 2 ? 'atk2' : 'atk';
    case 'charge': return f.move && f.move.dur && t > f.move.dur - 8 ? 'charge2' : 'charge1';
    case 'grab': return 'grab1';
    case 'throwing': return t < 7 ? 'throw0' : 'throw1';
    case 'block': return 'block';
    case 'hurt': case 'grabbed': case 'stun': return 'hurt';
    case 'fall': case 'thrown': return f.vz > 0 ? 'fall0' : 'fall1';
    case 'down': case 'dead': return 'down';
    case 'rise': return t < 8 ? 'fall1' : 'idle0';
    default: return `idle${Math.floor((t + f.id * 7) / 24) % 2}`;
  }
}

export const frameName = (f) => (f.team === 'e' ? enemyFrameName(f) : heroFrameName(f));

// Fotograma [x, y, w, h, ox, oy] de un tipo, con sustituciones; null si el tipo no tiene atlas.
export function resolveFrame(type, name) {
  const src = SOURCES[type];
  if (!src) return null;
  const F = src.FRAMES, fb = src === OBJETOS ? {} : (type in { antonio: 1, pepe: 1, dani: 1, jota: 1 } ? FALLBACK : ENEMY_FALLBACK);
  let n = (OVERRIDE[type] && OVERRIDE[type][name]) || name;
  for (let k = 0; k < 8 && !F[n] && fb[n]; k++) n = (OVERRIDE[type] && OVERRIDE[type][fb[n]]) || fb[n];
  return F[n] || F.idle0 || null;
}

// Dibuja el fotograma con los pies en (x, y). Devuelve el alto dibujado (o 0 si no hay atlas).
export function drawFrame(ctx, type, palette, name, x, y, face = 1) {
  const im = image(type);
  const fr = im && resolveFrame(type, name);
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

// Objeto del suelo o arma en la mano (hoja «objetos»). Devuelve false si no hay dibujo.
export function drawObject(ctx, kind, x, y) {
  const im = image('objetos');
  const fr = im && OBJETOS.FRAMES[kind];
  if (!fr) return false;
  const [sx, sy, sw, sh, ox, oy] = fr;
  ctx.drawImage(im, sx, sy, sw, sh, Math.round(x) - ox, Math.round(y) - oy, sw, sh);
  return true;
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
