// Mundo (plan §3): tick(world, inputs) a paso fijo de 60 Hz. Determinista: misma semilla + mismas entradas = mismo estado.
// No toca DOM, Canvas ni reloj real.
import { W, H, FLOOR_TOP, FLOOR_BOTTOM, LANE, PLAYER_LIVES, RESPAWN_TICKS, CONTINUE_TICKS, SPAWN_INVUL } from './constants.js';
import { createRng } from './rng.js';
import { LEVELS } from '../data/levels.js';
import { createPlayer, stepPlayer, stepEnemy, NEUTRAL } from './fighter.js';
import { activeBox, overlaps, applyHit, boxRange, THROWN_HIT, setState, releaseGrab, releaseTokens } from './combat.js';
import { setupLevel, updateLevel, hitProps, activePlayers, livePlayers } from './level.js';

export { NEUTRAL };

export function createWorld({ seed = 1, levelIdx = 0, players = [], opts = {} } = {}) {
  const world = {
    seed, rng: createRng(seed), tick: 0, nextId: 1,
    levelIdx, level: LEVELS[levelIdx],
    fighters: [], byId: new Map(), items: [], props: [], shots: [], events: [],
    camX: 0, opts: { assisted: false, ...opts },
    over: false, done: false,
  };
  setupLevel(world);
  for (const p of players) addPlayer(world, p);
  return world;
}

// Siguiente nivel: mismos jugadores (con su puntuación y vidas), vida llena, mundo nuevo.
export function startLevel(world, levelIdx) {
  world.levelIdx = levelIdx; world.level = LEVELS[levelIdx];
  world.fighters = world.fighters.filter((f) => f.team === 'p' && !f.removed);
  world.byId = new Map(world.fighters.map((f) => [f.id, f]));
  world.done = false; world.over = false;
  setupLevel(world);
  for (const p of world.fighters) {
    p.hp = p.maxHp; p.tokens = 0; p.weapon = null; p.grab = 0; p.grabbedBy = 0;
    if (!p.out) placeAtStart(world, p); else p.x = world.camX + 30;
  }
}

function placeAtStart(world, p) {
  const n = p.slot;
  p.x = world.camX + 40 + n * 18;
  p.y = FLOOR_TOP + 14 + n * ((FLOOR_BOTTOM - FLOOR_TOP - 28) / 3);
  p.z = 0; p.vx = p.vz = 0; p.face = 1;
  setState(p, 'idle'); p.invul = 30;
}

export function addPlayer(world, { slot, hero, palette = 0, keep } = {}) {
  if (world.fighters.some((f) => f.team === 'p' && f.slot === slot && !f.removed)) throw new Error(`hueco ${slot} ocupado`);
  const p = createPlayer(world, { slot, hero, palette }, 0, 0);
  p.lives = PLAYER_LIVES;
  if (keep) Object.assign(p, { score: keep.score || 0, kos: keep.kos || 0, food: keep.food || 0 });
  world.fighters.push(p); world.byId.set(p.id, p);
  if (world.tick === 0) placeAtStart(world, p);
  else respawn(world, p);
  return p;
}

export function removePlayer(world, slot) {
  const p = playerBySlot(world, slot);
  if (!p) return;
  if (p.state === 'grab') releaseGrab(world, p, 'idle');
  if (p.grabbedBy) { const h = world.byId.get(p.grabbedBy); if (h) { h.grab = 0; setState(h, 'idle'); } }
  for (const e of world.fighters) if (e.team === 'e' && e.ai && e.ai.token === p.id) releaseTokens(world, e);
  p.removed = true;
  world.fighters = world.fighters.filter((f) => f !== p);
  world.byId.delete(p.id);
}

export function setAway(world, slot, away) {
  const p = playerBySlot(world, slot);
  if (!p || p.away === away) return;
  p.away = away;
  if (away) for (const e of world.fighters) if (e.team === 'e' && e.ai && e.ai.token === p.id) releaseTokens(world, e);
  else p.invul = 30;
}

export const playerBySlot = (world, slot) => world.fighters.find((f) => f.team === 'p' && f.slot === slot && !f.removed);

function respawn(world, p) {
  p.hp = p.maxHp; p.out = false;
  p.x = world.camX + 40 + p.slot * 20;
  p.y = FLOOR_TOP + 20 + p.slot * 12;
  p.z = 120; p.vz = 0; p.vx = 0; p.face = 1;
  setState(p, 'jump'); p.airAtk = false; p.airT = 99;
  p.invul = SPAWN_INVUL; p.weapon = null;
  world.events.push({ type: 'respawn', slot: p.slot });
}

// ---- golpes de este tick ----
function processAttacks(world) {
  const fs = world.fighters;
  for (const a of fs) {
    if (a.removed || a.freeze > 0) continue;
    const box = activeBox(a);
    if (!box) continue;
    for (const t of fs) {
      if (t === a || t.team === a.team || t.removed || a.hitIds.includes(t.id)) continue;
      if (t.state === 'grabbed' && t.grabbedBy === a.id) continue;
      if (!overlaps(a, box, t)) continue;
      const r = applyHit(world, a, t, box);
      if (!r) continue;
      a.hitIds.push(t.id);
      if (r === true) { a.landed = true; if (a.team === 'p') world.events.push({ type: 'landed', slot: a.slot }); }
    }
    if (a.team === 'p') hitProps(world, a, box, boxRange);
  }
  // Cuerpos lanzados: dañan a los de su mismo equipo con los que chocan (F2).
  for (const v of fs) {
    if (v.state !== 'thrown' || !v.thrownBy || v.team !== 'e') continue;
    const thrower = world.byId.get(v.thrownBy);
    const by = thrower && thrower.team === 'p' ? thrower : { x: v.x, team: 'p', face: Math.sign(v.vx) };
    for (const t of fs) {
      if (t === v || t.team !== v.team || t.removed || v.hitIds.includes(t.id)) continue;
      if (Math.abs(t.y - v.y) > LANE || Math.abs(t.x - v.x) > (t.def.w + v.def.w) / 2 || v.z > t.def.h) continue;
      v.hitIds.push(t.id);
      applyHit(world, by, t, THROWN_HIT, Math.sign(v.vx) || 1);
    }
  }
}

function processShots(world) {
  for (const s of world.shots) {
    s.x += s.vx; s.ttl--;
    for (const p of world.fighters) {
      if (p.team !== 'p' || p.removed) continue;
      if (Math.abs(p.y - s.y) > LANE || Math.abs(p.x - s.x) > p.def.w / 2 + 4) continue;
      if (s.z < p.z || s.z > p.z + p.def.h) continue;
      if (applyHit(world, s, p, { dmg: s.dmg, push: 1.6 })) { s.ttl = 0; break; }
    }
  }
  world.shots = world.shots.filter((s) => s.ttl > 0 && s.x > world.camX - 60 && s.x < world.camX + W + 60);
}

function processDeaths(world) {
  for (const f of world.fighters) {
    if (f.state !== 'dead') continue;
    if (f.team === 'e') {
      if (f.t >= 40) f.removed = true;
      continue;
    }
    if (f.out) continue;
    if (f.t === 60) {
      if (!world.opts.assisted) f.lives--;
      if (f.lives > 0) respawn(world, f);
      else { f.out = true; f.contT = CONTINUE_TICKS; world.events.push({ type: 'out', slot: f.slot }); }
    }
  }
  if (world.fighters.some((f) => f.removed)) {
    world.fighters = world.fighters.filter((f) => !f.removed);
    world.byId = new Map(world.fighters.map((f) => [f.id, f]));
  }
}

function processContinues(world, inputs) {
  for (const p of activePlayers(world)) {
    if (!p.out) continue;
    const input = inputs[p.slot] || NEUTRAL;
    if (p.contT > 0) p.contT--;
    if (p.contT > 0 && input.golpe && !p.prevIn.golpe) {
      p.lives = PLAYER_LIVES; p.continues++; respawn(world, p);
      world.events.push({ type: 'continue', slot: p.slot });
    }
    p.prevIn = input;
  }
  const ps = activePlayers(world);
  if (ps.length && ps.every((p) => p.out && p.contT <= 0)) { world.over = true; world.events.push({ type: 'over' }); }
}

export function tick(world, inputs = []) {
  world.events = [];
  if (world.over || world.done) return world;
  world.tick++;
  for (const f of world.fighters.slice()) {
    if (f.team === 'p') { if (!world.cleared) stepPlayer(world, f, inputs[f.slot] || NEUTRAL); else if (f.state === 'victory') f.t++; else stepPlayer(world, f, NEUTRAL); }
    else stepEnemy(world, f);
  }
  processAttacks(world);
  processShots(world);
  processDeaths(world);
  processContinues(world, inputs);
  updateLevel(world);
  if (world.cleared && world.clearT >= 150) world.done = true;
  return world;
}

// Huella del estado para los tests de determinismo.
export function snapshot(world) {
  return JSON.stringify({
    t: world.tick, cam: Math.round(world.camX * 100), w: world.waveIdx, r: world.rng.state,
    f: world.fighters.map((f) => [f.id, f.type, f.state, Math.round(f.x * 100), Math.round(f.y * 100), Math.round(f.z * 100), Math.round(f.hp * 100)]),
  });
}

export { livePlayers, activePlayers, W, H };
