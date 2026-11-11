// Nivel (F6): cámara que solo avanza, oleadas que la bloquean, aparición de enemigos con escalado (F5) y objetos (F7).
import { W, FLOOR_TOP, FLOOR_BOTTOM, COUNT_SCALE, HP_SCALE, MAX_ON_SCREEN, CAM_MARGIN } from './constants.js';
import { createEnemy } from './fighter.js';

export const activePlayers = (world) => world.fighters.filter((f) => f.team === 'p' && !f.removed);
export const livePlayers = (world) => activePlayers(world).filter((f) => !f.out && !f.away && f.state !== 'dead');
export const liveEnemies = (world) => world.fighters.filter((f) => f.team === 'e' && !f.removed && f.state !== 'dead');

const lerpY = (dy) => FLOOR_TOP + (FLOOR_BOTTOM - FLOOR_TOP) * dy;

// Lista de enemigos de una oleada escalada por número de jugadores (F5).
export function scaledWave(wave, players) {
  const n = Math.max(1, Math.min(4, players));
  const base = wave.enemies;
  const count = Math.round(base.length * COUNT_SCALE[n]);
  const extras = base.filter((x) => x.type !== wave.boss);
  const out = base.slice();
  for (let k = 0; out.length < count && extras.length; k++) {
    const src = extras[k % extras.length];
    out.push({ ...src, delay: src.delay + 60 * (1 + Math.floor(k / extras.length)), side: k % 2 ? 'L' : 'R' });
  }
  return out;
}

export function setupLevel(world) {
  world.camX = 0; world.waveIdx = 0; world.waveActive = false; world.pending = [];
  world.levelTick = 0; world.goT = 0; world.waitT = world.level.elevator ? 90 : 0;
  world.cleared = false; world.clearT = 0;
  world.items = []; world.shots = [];
  world.props = world.level.props.map((p) => ({ id: world.nextId++, kind: p.kind, x: p.x, y: lerpY(p.dy), drop: p.drop, broken: false }));
}

export function hpScale(world) { return HP_SCALE[Math.max(1, Math.min(4, activePlayers(world).length))]; }

function spawn(world, s) {
  const y = s.dy != null ? lerpY(s.dy) : world.rng.int(FLOOR_TOP + 4, FLOOR_BOTTOM - 4);
  const x = s.side === 'L' ? world.camX - 24 : world.camX + W + 24;
  const f = createEnemy(world, s.type, x, y, hpScale(world));
  f.face = s.side === 'L' ? 1 : -1;
  f.wave = s.wave;
  world.fighters.push(f); world.byId.set(f.id, f);
  if (f.def.boss) world.events.push({ type: 'boss', name: f.def.name, id: f.id });
  return f;
}

function currentLimit(world) {
  const waves = world.level.waves;
  const next = waves[world.waveIdx];
  if (next) return next.cam;
  return world.level.width - W;
}

export function updateLevel(world) {
  world.levelTick++;
  if (world.goT > 0) world.goT--;
  if (world.waitT > 0) world.waitT--;
  if (world.cleared) { world.clearT++; return; }

  // Cámara: avanza con el grupo, nunca retrocede, la frena el jugador más atrasado y el bloqueo de la oleada.
  const ps = livePlayers(world);
  if (ps.length) {
    let minX = Infinity, maxX = -Infinity, sum = 0;
    for (const p of ps) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); sum += p.x; }
    const desired = Math.max(sum / ps.length, maxX - 60) - W / 2;
    const limit = currentLimit(world);
    const cap = Math.min(limit, minX - CAM_MARGIN);
    if (desired > world.camX) world.camX = Math.max(world.camX, Math.min(desired, cap));
    world.camX = Math.min(world.camX, limit);
  }

  // Activar la oleada al llegar a su posición.
  const wave = world.level.waves[world.waveIdx];
  if (!world.waveActive && wave && world.camX >= wave.cam - 0.5 && world.waitT <= 0) {
    world.waveActive = true;
    const list = scaledWave(wave, activePlayers(world).length);
    world.pending = list.map((s) => ({ ...s, at: world.levelTick + s.delay, wave: world.waveIdx }));
    world.events.push({ type: 'wave', idx: world.waveIdx, boss: !!wave.boss });
  }

  // Aparecer enemigos pendientes (máx. MAX_ON_SCREEN a la vez).
  if (world.pending.length) {
    let alive = liveEnemies(world).length;
    world.pending = world.pending.filter((s) => {
      if (s.at > world.levelTick || alive >= MAX_ON_SCREEN) return true;
      spawn(world, s); alive++;
      return false;
    });
  }

  // Refuerzos de los jefes al bajar de cierta vida.
  for (const f of world.fighters) {
    const sm = f.def.summon;
    if (!sm || f.removed || f.hp <= 0) continue;
    while (f.summonIdx < sm.at.length && f.hp / f.maxHp <= sm.at[f.summonIdx]) {
      f.summonIdx++;
      for (let i = 0; i < sm.n; i++) {
        world.pending.push({ type: world.rng.pick(sm.types), side: i % 2 ? 'L' : 'R', at: world.levelTick + i * 30, dy: null, wave: world.waveIdx });
      }
      world.events.push({ type: 'summon', id: f.id });
    }
  }

  // ¿Oleada vacía?
  if (world.waveActive && !world.pending.length && !liveEnemies(world).length) {
    world.waveActive = false;
    world.waveIdx++;
    if (world.waveIdx >= world.level.waves.length) {
      world.cleared = true; world.clearT = 0;
      for (const p of activePlayers(world)) if (!p.out && p.state !== 'dead') { p.state = 'victory'; p.t = 0; p.vx = 0; }
      world.events.push({ type: 'clear', level: world.levelIdx });
    } else {
      world.goT = 180;
      if (world.level.elevator) world.waitT = 150;
      world.events.push({ type: 'go', elevator: !!world.level.elevator });
    }
  }
}

// Cajas y papeleras (F7): se rompen con un golpe de jugador y sueltan su objeto.
export function hitProps(world, a, box, rangeFn) {
  for (const p of world.props) {
    if (p.broken || Math.abs(p.y - a.y) > 12 || a.z + box.z[0] > 32) continue;   // cajas de ~32 px de alto
    const [x0, x1] = rangeFn(a, box);
    if (x1 < p.x - 10 || x0 > p.x + 10) continue;
    p.broken = true;
    if (p.drop) world.items.push({ id: world.nextId++, kind: p.drop, x: p.x, y: p.y });
    world.events.push({ type: 'break', kind: p.kind, x: p.x, y: p.y });
  }
}
