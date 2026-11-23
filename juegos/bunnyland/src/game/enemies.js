// Los 4 enemigos del universo de Hanzer y sus conductas (spec F5, §3.1.1).
// Estados: casa → saliendo → activo (rondar ⇄ perseguir; triste con la Hyperpop) → nube → saliendo.
import { DIRS, DIR_ORDER, OPPOSITE, step, isWalkable } from '../core/grid.js';
import { TILE, CORNERS, OSITO_PAUSA, TP_EVERY, TP_AVISO, TP_LEJOS, CHARCO_EVERY, CHARCO_TTL, GOTITA_RADIO, RELEASE } from '../data/tuning.js';
import { advance, tileOf, place } from './actor.js';

export const TIPOS = ['coronado', 'osito', 'estrellita', 'gotita'];

export function createEnemies(g, nivel = 0) {
  const k = Math.max(0.4, 1 - 0.15 * nivel);
  const slots = { coronado: [g.exit.x, g.exit.y], osito: [g.houseCenter.x - 2, g.houseCenter.y], estrellita: [g.houseCenter.x + 2, g.houseCenter.y], gotita: [g.houseCenter.x, g.houseCenter.y] };
  return TIPOS.map((tipo) => place({
    tipo, estado: tipo === 'coronado' ? 'activo' : 'casa', dir: tipo === 'coronado' ? 'left' : null,
    triste: false, releaseAt: Math.round(RELEASE[tipo] * k), pausa: 0, reverse: false, tp: 0, aviso: 0, tpDest: null, ch: 0, x: 0, y: 0,
  }, ...slots[tipo]));
}

const d2 = ([ax, ay], [bx, by]) => (ax - bx) ** 2 + (ay - by) ** 2;

export function targetFor(e, ctx) {
  if (ctx.fase === 'rondar') return CORNERS[e.tipo];
  const b = ctx.bunny.tile;
  switch (e.tipo) {
    case 'osito': { const [dx, dy] = DIRS[ctx.bunny.dir || 'left']; return [b[0] + 4 * dx, b[1] + 4 * dy]; }
    case 'gotita': return d2(tileOf(e), b) > GOTITA_RADIO ** 2 ? b : CORNERS.gotita;
    default: return b;
  }
}

// Distancias a la casa (con puerta) para que las nubecitas vuelvan por el camino más corto.
function homeDist(g) {
  if (g._home) return g._home;
  const dist = new Int16Array(g.w * g.h).fill(-1);
  const q = [[g.houseCenter.x, g.houseCenter.y]]; dist[g.houseCenter.y * g.w + g.houseCenter.x] = 0;
  while (q.length) {
    const [x, y] = q.shift();
    for (const d of DIR_ORDER) {
      const [nx, ny] = step(g, x, y, d);
      if (isWalkable(g, nx, ny, true) && dist[ny * g.w + nx] < 0) { dist[ny * g.w + nx] = dist[y * g.w + x] + 1; q.push([nx, ny]); }
    }
  }
  return (g._home = dist);
}

// Si el Bunny se queda quieto, el Coronado «lo huele» y va por el camino más corto (BFS desde el Bunny, una vez por paso).
function bunnyDist(ctx) {
  const { g } = ctx, [bx, by] = ctx.bunny.tile, key = bx + ',' + by;
  if (ctx._bd && ctx._bdKey === key) return ctx._bd;
  const dist = new Int16Array(g.w * g.h).fill(-1);
  const q = [[bx, by]]; dist[by * g.w + bx] = 0;
  for (let h = 0; h < q.length; h++) {
    const [x, y] = q[h];
    for (const d of DIR_ORDER) {
      const [nx, ny] = step(g, x, y, d);
      if (isWalkable(g, nx, ny) && dist[ny * g.w + nx] < 0) { dist[ny * g.w + nx] = dist[y * g.w + x] + 1; q.push([nx, ny]); }
    }
  }
  ctx._bdKey = key;
  return (ctx._bd = dist);
}

export function chooseDir(e, ctx) {
  const { g } = ctx;
  const [tx, ty] = tileOf(e);
  const viaDoor = e.estado === 'saliendo' || e.estado === 'nube';
  let opts = DIR_ORDER.filter((d) => isWalkable(g, ...step(g, tx, ty, d), viaDoor));
  if (e.estado === 'nube') {
    const dist = homeDist(g);
    return opts.reduce((best, d) => { const [nx, ny] = step(g, tx, ty, d); const v = dist[ny * g.w + nx]; return v >= 0 && (best === null || v < best.v) ? { d, v } : best; }, null)?.d ?? null;
  }
  const noRev = opts.filter((d) => d !== OPPOSITE[e.dir]);
  if (noRev.length) opts = noRev;
  if (!opts.length) return null;
  if (e.estado === 'activo' && (e.triste || ctx.vanish || (e.tipo === 'estrellita' && ctx.fase === 'perseguir'))) return ctx.rng.pick(opts);
  if (e.tipo === 'coronado' && e.estado === 'activo' && ctx.quieto) {
    const dist = bunnyDist(ctx);
    let best = null, bv = Infinity;
    for (const d of opts) { const [nx, ny] = step(g, tx, ty, d); const v = dist[ny * g.w + nx]; if (v >= 0 && v < bv) { bv = v; best = d; } }
    if (best) return best;
  }
  const target = e.estado === 'saliendo' ? [g.exit.x, g.exit.y] : targetFor(e, ctx);
  let best = null, bv = Infinity;
  for (const d of opts) { const v = d2(step(g, tx, ty, d), target); if (v < bv) { bv = v; best = d; } }
  return best;
}

function timers(e, ctx) {
  if (e.estado !== 'activo' || e.triste) return;
  if (e.tipo === 'estrellita') {
    e.tp++;
    if (e.aviso > 0) {
      if (--e.aviso === 0) { place(e, ...e.tpDest); e.tp = 0; e.tpDest = null; }
    } else if (e.tp >= TP_EVERY - TP_AVISO) {
      const lejos = ctx.g.power.filter((p) => d2(p, ctx.bunny.tile) > TP_LEJOS ** 2);
      e.tpDest = ctx.rng.pick(lejos.length ? lejos : ctx.g.power);
      e.aviso = TP_AVISO;
    }
  } else if (e.tipo === 'gotita') {
    if (++e.ch % CHARCO_EVERY === 0) { const [x, y] = tileOf(e); ctx.charcos.set(y * ctx.g.w + x, CHARCO_TTL); }
  }
}

export function stepEnemy(e, ctx, amount) {
  if (e.estado === 'casa') return;
  timers(e, ctx);
  if (e.pausa > 0) { e.pausa--; return; }
  if (e.reverse) { if (e.dir) e.dir = OPPOSITE[e.dir]; e.reverse = false; }
  const { g } = ctx;
  advance(e, g, amount, e.estado !== 'activo', () => {
    const [tx, ty] = tileOf(e);
    if (e.estado === 'saliendo' && tx === g.exit.x && ty === g.exit.y) { e.estado = 'activo'; e.dir = 'left'; }
    if (e.estado === 'nube' && tx === g.houseCenter.x && ty === g.houseCenter.y) { e.estado = 'saliendo'; e.dir = null; }
    const blocked = e.dir && !isWalkable(g, ...step(g, tx, ty, e.dir), e.estado !== 'activo');
    const nd = chooseDir(e, ctx);
    if (e.tipo === 'osito' && e.estado === 'activo' && !e.triste && blocked) { e.pausa = OSITO_PAUSA; e.dir = nd; return 'stop'; }
    e.dir = nd;
  });
}
