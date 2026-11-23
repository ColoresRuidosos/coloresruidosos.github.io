// La partida: zanahorias, Hyperpop, abrazos, vidas, bonus, niveles y récord (spec F2–F4, F6–F10, F13).
// Lógica pura: stepMatch(m, { dir }) avanza 1/60 s y deja en m.events lo que pasó (para sonido y pantalla).
import { parseMaze } from '../core/grid.js';
import { createRng } from '../core/rng.js';
import { MAZES } from '../data/mazes.js';
import * as T from '../data/tuning.js';
import { createBunny, wantDir, moveBunny } from './bunny.js';
import { createEnemies, stepEnemy } from './enemies.js';
import { tileOf } from './actor.js';

export const cara = (pct) => (pct >= 1 ? 4 : pct >= 0.75 ? 3 : pct >= 0.5 ? 2 : pct >= 0.25 ? 1 : 0);
export const medallas = (score) => T.MEDALLAS.filter((m) => score >= m.pts);

const grids = new Map();
const gridFor = (escenario) => { if (!grids.has(escenario)) grids.set(escenario, parseMaze(MAZES[escenario])); return grids.get(escenario); };

export function createMatch({ seed = 1, nivel = 0, record = 0, lives = T.START_LIVES } = {}) {
  const m = { seed, rng: createRng(seed), score: 0, record, lives, events: [], over: false };
  setupLevel(m, nivel);
  return m;
}

function setupLevel(m, nivel) {
  m.nivel = nivel; m.escenario = nivel % MAZES.length; m.vuelta = Math.floor(nivel / MAZES.length);
  const g = (m.grid = gridFor(m.escenario));
  m.items = new Uint8Array(g.w * g.h);
  for (const [x, y] of g.carrots) m.items[y * g.w + x] = 1;
  for (const [x, y] of g.power) m.items[y * g.w + x] = 2;
  m.total = m.restantes = g.carrots.length + g.power.length;
  m.bonus = { t: 0, shown: 0 };
  m.heartItem = nivel >= 1; m.vanishItem = nivel >= 2;
  m.speeds = T.speeds(nivel);
  resetActors(m);
}

function resetActors(m) {
  m.bunny = createBunny(m.grid);
  m.enemies = createEnemies(m.grid, m.nivel);
  m.charcos = new Map();
  m.hyper = 0; m.chain = 0; m.quieto = 0; m.vanish = 0; m.t = 0; m.faseT = 0; m.fase = 'rondar';
  m.bonus.t = 0;
  m.mode = 'ready'; m.modeT = 0;
}

function faseAt(nivel, t) {
  const plan = T.PHASES[Math.min(nivel, 1)];
  let acc = 0;
  for (let i = 0; i < plan.length; i++) { acc += plan[i] * 60; if (t < acc) return i % 2 ? 'perseguir' : 'rondar'; }
  return 'perseguir';
}

const emit = (m, type, extra = {}) => m.events.push({ type, ...extra });
const isAt = (p, [x, y]) => p.x === x && p.y === y;

function eat(m, tile) {
  const g = m.grid, [x, y] = tile, i = y * g.w + x;
  const it = m.items[i];
  if (it) {
    m.items[i] = 0; m.restantes--;
    if (it === 1) { m.score += T.CARROT_POINTS; emit(m, 'eat', { alt: m.restantes % 2 }); }
    else {
      m.score += T.POWER_POINTS; m.hyper = T.hyperSteps(m.nivel); m.chain = 0;
      for (const e of m.enemies) if (e.estado !== 'nube') { e.triste = true; if (e.estado === 'activo') e.reverse = true; }
      emit(m, 'hyper');
    }
    const eaten = m.total - m.restantes;
    const k = m.bonus.shown;
    if (k < T.BONUS_AT.length && eaten >= Math.ceil(m.total * T.BONUS_AT[k])) { m.bonus.shown++; m.bonus.t = T.BONUS_STEPS; emit(m, 'bonusAparece'); }
  }
  if (m.bonus.t > 0 && isAt(g.bonus, tile)) { const pts = T.BONUS_POINTS[m.escenario]; m.score += pts; m.bonus.t = 0; emit(m, 'bonus', { pts }); }
  if (m.heartItem && isAt(g.heart, tile)) { m.heartItem = false; m.lives = Math.min(T.MAX_LIVES, m.lives + 1); m.score += T.ITEM_POINTS; emit(m, 'besito'); }
  if (m.vanishItem && isAt(g.vanish, tile)) { m.vanishItem = false; m.vanish = T.VANISH_STEPS; m.score += T.ITEM_POINTS; emit(m, 'desaparezco'); }
  m.record = Math.max(m.record, m.score);
}

function speedFor(m, e) {
  const s = m.speeds;
  if (e.estado === 'nube') return s.nube;
  if (e.estado !== 'activo') return s.casa;
  if (e.triste) return s.triste;
  if (e.tipo === 'coronado' && m.restantes < m.total * T.CORONADO_ENOJO) return Math.round(s.enemigo * T.CORONADO_RAPIDO);
  return s.enemigo;
}

const same = (a, b) => a[0] === b[0] && a[1] === b[1];

export function stepMatch(m, input = {}) {
  m.events = [];
  switch (m.mode) {
    case 'ready': if (++m.modeT >= T.READY_STEPS) { m.mode = 'play'; m.modeT = 0; emit(m, 'go'); } return m;
    case 'dying':
      if (++m.modeT >= T.DYING_STEPS) {
        if (m.lives <= 0) { m.mode = 'over'; m.over = true; emit(m, 'over'); } else resetActors(m);
      }
      return m;
    case 'clear': if (++m.modeT >= T.CLEAR_STEPS) { setupLevel(m, m.nivel + 1); emit(m, 'nivel'); } return m;
    case 'over': return m;
  }
  m.t++;
  if (m.hyper > 0 && --m.hyper === 0) { for (const e of m.enemies) e.triste = false; emit(m, 'hyperFin'); }
  if (m.vanish > 0) m.vanish--;
  if (m.bonus.t > 0) m.bonus.t--;
  for (const [k, v] of m.charcos) { if (v <= 1) m.charcos.delete(k); else m.charcos.set(k, v - 1); }
  if (m.hyper === 0) {
    const f = faseAt(m.nivel, m.faseT++);
    if (f !== m.fase) { m.fase = f; for (const e of m.enemies) if (e.estado === 'activo') e.reverse = true; }
  }
  for (const e of m.enemies) if (e.estado === 'casa' && m.t >= e.releaseAt) e.estado = 'saliendo';

  // Bunny
  const g = m.grid, b = m.bunny;
  wantDir(b, input.dir);
  const pb = tileOf(b);
  const slow = m.charcos.has(pb[1] * g.w + pb[0]) ? T.CHARCO_SLOW : 1;
  moveBunny(b, g, Math.round(m.speeds.bunny * slow));
  const nb = tileOf(b);
  eat(m, nb);
  if (m.restantes === 0) { m.mode = 'clear'; m.modeT = 0; emit(m, 'clear', { gira: m.escenario === 4 }); return m; }

  // Enemigos
  m.quieto = b.dir ? 0 : m.quieto + 1;
  const ctx = { g, rng: m.rng, bunny: { tile: nb, dir: b.face }, fase: m.fase, vanish: m.vanish > 0, charcos: m.charcos, quieto: m.quieto >= T.QUIETO_STEPS };
  const prev = m.enemies.map(tileOf);
  for (const e of m.enemies) stepEnemy(e, ctx, speedFor(m, e));

  // Choques (misma casilla o cruzándose)
  if (m.vanish > 0) return m;
  m.enemies.forEach((e, i) => {
    if (m.mode !== 'play' || e.estado === 'casa' || e.estado === 'nube') return;
    const ne = tileOf(e);
    if (!(same(ne, nb) || (same(ne, pb) && same(prev[i], nb)))) return;
    if (e.triste) {
      const pts = T.HUG_POINTS[Math.min(m.chain++, T.HUG_POINTS.length - 1)];
      e.estado = 'nube'; e.triste = false; m.score += pts; m.record = Math.max(m.record, m.score);
      emit(m, 'abrazo', { pts, x: ne[0], y: ne[1] });
    } else {
      m.lives--; m.mode = 'dying'; m.modeT = 0; emit(m, 'pierde');
    }
  });
  return m;
}
