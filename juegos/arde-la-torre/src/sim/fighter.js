// Luchador (plan §3): máquina de estados común a músicos y enemigos, más el control del jugador (F1–F4, F7).
import {
  W, FLOOR_TOP, FLOOR_BOTTOM, GRAV, DOUBLE_TAP, CHAIN_GAP, GRAB_CONTACT, GRAB_TICKS, MAX_KNEES,
  SPECIAL_COST, EDGE, LANE,
} from './constants.js';
import { HEROES, WEAPONS, FOOD, PUA_POINTS } from './moves.js';
import { ENEMIES } from './enemies.js';
import {
  sign, setState, landFrom, riseInvul, releaseGrab, canBeGrabbed, startGrab, placeGrabbed, throwVictim,
  weaponBox,
} from './combat.js';
import { think, enemyStates } from './ai.js';

export const NEUTRAL = Object.freeze({ x: 0, y: 0, golpe: false, salto: false, especial: false, pausa: false });

function base(world, team, type, def, x, y) {
  return {
    id: world.nextId++, team, type, def, x, y, z: 0, vx: 0, vy: 0, vz: 0, face: 1,
    hp: def.hp, maxHp: def.hp, state: 'idle', t: 0, freeze: 0, invul: 0,
    hitIds: [], grab: 0, grabbedBy: 0, knees: 0, thrownBy: 0, hurtDur: 16, knockCd: 0, removed: false,
  };
}

export function createPlayer(world, { slot, hero, palette = 0 }, x, y) {
  const def = HEROES[hero];
  if (!def) throw new Error(`músico desconocido: ${hero}`);
  return Object.assign(base(world, 'p', hero, def, x, y), {
    slot, hero, palette, prevIn: NEUTRAL, tokens: 0,
    combo: 0, chain: false, landed: false, gap: 99, run: false, runDir: 0, tapDir: 0, tapT: -99, lastX: 0,
    contact: 0, airAtk: false, airT: 0, weapon: null,
    lives: 0, score: 0, kos: 0, food: 0, continues: 0, out: false, contT: 0, away: false,
  });
}

export function createEnemy(world, type, x, y, hpScale = 1) {
  const def = ENEMIES[type];
  if (!def) throw new Error(`enemigo desconocido: ${type}`);
  const f = base(world, 'e', type, def, x, y);
  f.hp = f.maxHp = Math.round(def.hp * hpScale);
  f.ai = { token: 0, cd: 30 + world.rng.int(0, 40), side: x < world.camX + W / 2 ? -1 : 1, move: null };
  f.summonIdx = 0;
  return f;
}

const press = (f, input, k) => input[k] && !f.prevIn[k];

// ---- Física común ----
function integrateAir(world, f) {
  f.vz -= GRAV; f.z += f.vz; f.x += f.vx;
  if (f.z <= 0) { f.z = 0; return true; }
  return false;
}

export function clampToWorld(world, f) {
  f.y = Math.min(FLOOR_BOTTOM, Math.max(FLOOR_TOP, f.y));
  if (f.team === 'p') f.x = Math.min(world.camX + W - EDGE, Math.max(world.camX + EDGE, f.x));
  else {
    // Una vez que un enemigo entra en pantalla ya no sale (así siempre se le puede alcanzar).
    const lo = world.camX + 8, hi = world.camX + W - 8;
    if (f.entered) f.x = Math.min(hi, Math.max(lo, f.x));
    else if (f.x >= lo && f.x <= hi) f.entered = true;
  }
}

// Estados que no dependen de quién controla (caídas, daño, suelo…). Devuelve true si se ocupó del tick.
function stepCommon(world, f) {
  switch (f.state) {
    case 'hurt':
      f.x += f.vx; f.vx *= 0.8;
      if (++f.t >= f.hurtDur) setState(f, 'idle');
      return true;
    case 'block':
      f.x += f.vx; f.vx *= 0.8;
      if (++f.t >= 12) setState(f, 'idle');
      return true;
    case 'fall':
    case 'thrown':
      f.t++;
      if (integrateAir(world, f)) { f.thrownBy = 0; landFrom(world, f); }
      return true;
    case 'down':
      if (++f.t >= (f.team === 'p' ? 40 : 34)) setState(f, 'rise');
      return true;
    case 'rise':
      if (++f.t >= 16) { setState(f, 'idle'); f.invul = riseInvul(f); }
      return true;
    case 'dead':
      f.t++;
      return true;
    case 'grabbed': {
      const h = world.byId.get(f.grabbedBy);
      if (!h || h.removed || h.state !== 'grab') { f.grabbedBy = 0; setState(f, 'idle'); }
      f.t++;
      return true;
    }
    case 'throwing':
      if (++f.t >= 14) setState(f, 'idle');
      return true;
    case 'victory':
      f.t++;
      return true;
    default:
      return false;
  }
}

// ---- Jugador ----
export function stepPlayer(world, f, input) {
  if (f.out || f.removed) return;
  if (f.away) {
    f.prevIn = NEUTRAL;
    if (!stepCommon(world, f)) {
      if (f.state === 'grab') releaseGrab(world, f, 'idle');
      f.vx = 0; if (f.state !== 'idle') setState(f, 'idle');
    }
    clampToWorld(world, f);
    return;
  }
  if (f.freeze > 0) { f.freeze--; return; }
  if (f.invul > 0) f.invul--;
  f.gap++;
  if (!stepCommon(world, f)) control(world, f, input);
  clampToWorld(world, f);
  f.prevIn = input;
}

function wantsSpecial(f, input) {
  return press(f, input, 'especial') || (input.golpe && input.salto && (press(f, input, 'golpe') || press(f, input, 'salto')));
}

function startSpecial(world, f) {
  const cost = Math.ceil(f.maxHp * SPECIAL_COST);
  f.hp = Math.max(1, f.hp - cost);
  setState(f, 'special'); f.hitIds = []; f.vx = 0; f.run = false;
  world.events.push({ type: 'special', slot: f.slot, hero: f.hero, x: f.x, y: f.y });
}

function startAttack(world, f, idx) {
  f.combo = idx; f.atk = f.weapon ? weaponBox(f) : f.def.combo[idx];
  setState(f, 'attack'); f.hitIds = []; f.chain = false; f.landed = false; f.vx = 0;
  world.events.push({ type: 'swing', slot: f.slot, x: f.x });
}

function nearItem(world, f) {
  return world.items.find((it) => Math.abs(it.x - f.x) <= 14 && Math.abs(it.y - f.y) <= LANE);
}

function pickUp(world, f, it) {
  world.items.splice(world.items.indexOf(it), 1);
  if (FOOD[it.kind]) { f.hp = Math.min(f.maxHp, f.hp + Math.round(f.maxHp * FOOD[it.kind])); f.food++; }
  else if (it.kind === 'pua') f.score += PUA_POINTS;
  else if (WEAPONS[it.kind]) f.weapon = { kind: it.kind, uses: WEAPONS[it.kind].uses };
  world.events.push({ type: 'pickup', slot: f.slot, kind: it.kind, x: it.x, y: it.y });
}

function control(world, f, input) {
  const sp = f.def;
  switch (f.state) {
    case 'attack': {
      f.t++;
      if (press(f, input, 'golpe') && f.t >= f.atk.start) f.chain = true;
      if (wantsSpecial(f, input)) { startSpecial(world, f); return; }
      if (f.t >= f.atk.start + f.atk.active + f.atk.rec) {
        if (f.atk.weapon) {
          if (f.landed && --f.weapon.uses <= 0) { world.events.push({ type: 'weaponBreak', x: f.x, y: f.y }); f.weapon = null; }
          setState(f, 'idle'); f.gap = 0; f.combo = -1;
          return;
        }
        const next = f.combo + 1;
        if (f.chain && f.landed && next < sp.combo.length) { startAttack(world, f, next); return; }
        setState(f, 'idle'); f.gap = 0;
        if (next >= sp.combo.length || !f.landed) f.combo = -1;
      }
      return;
    }
    case 'special':
      f.t++;
      // Golpes múltiples: se vacía la lista de golpeados cada `rehit` ticks (solo cuando avanza el tiempo).
      if (sp.sp.rehit && f.t > sp.sp.from && (f.t - sp.sp.from) % sp.sp.rehit === 0) f.hitIds = [];
      if (f.t >= sp.sp.dur) { setState(f, 'idle'); f.invul = 8; }
      return;
    case 'dash':
      f.x += f.face * sp.run * 1.1; f.t++;
      if (f.t >= sp.dash.dur) { setState(f, 'idle'); f.run = false; }
      return;
    case 'jump': {
      f.t++; f.airT++;
      if (!f.airAtk && press(f, input, 'golpe')) { f.airAtk = true; f.airT = 0; f.hitIds = []; }
      if (integrateAir(world, f)) { setState(f, 'idle'); f.airAtk = false; f.vx = 0; }
      return;
    }
    case 'grab': {
      const v = world.byId.get(f.grab);
      f.t++;
      if (!v || v.removed || v.state !== 'grabbed') { f.grab = 0; setState(f, 'idle'); return; }
      placeGrabbed(f, v);
      if (f.kneeT > 0) f.kneeT--;
      const dirX = Math.round(input.x);
      if (press(f, input, 'golpe')) {
        if (dirX === f.face) { throwVictim(world, f, v, sp.throw); return; }
        if (dirX === -f.face) { throwVictim(world, f, v, sp.throw, -f.face); return; }
        // Rodillazo
        f.knees++; f.kneeT = 8;
        const dmg = world.opts.assisted && v.team === 'p' ? sp.knee * 0.7 : sp.knee;
        v.hp -= dmg; f.score += Math.round(dmg * 10); v.t = 0;
        world.events.push({ type: 'hit', x: v.x, y: v.y, z: 30, team: v.team, dmg, slot: f.slot });
        if (v.hp <= 0) { v.hp = 0; f.kos++; f.score += v.def.score; throwVictim(world, f, v, 0); return; }
        if (f.knees >= MAX_KNEES) { throwVictim(world, f, v, sp.throw); return; }
      }
      if (f.t >= GRAB_TICKS) releaseGrab(world, f);
      return;
    }
    default: break; // idle, walk, run
  }

  // ---- idle / walk / run ----
  if (wantsSpecial(f, input)) { startSpecial(world, f); return; }
  if (press(f, input, 'salto')) {
    setState(f, 'jump'); f.vz = sp.jump; f.vx = Math.round(input.x) * (f.run ? sp.run : sp.speed); f.airAtk = false; f.airT = 99;
    world.events.push({ type: 'jump', slot: f.slot });
    return;
  }
  if (press(f, input, 'golpe')) {
    const it = nearItem(world, f);
    if (it && !f.run) { pickUp(world, f, it); return; }
    if (f.run) { setState(f, 'dash'); f.hitIds = []; return; }
    const idx = !f.weapon && f.combo >= 0 && f.gap <= CHAIN_GAP && f.combo + 1 < sp.combo.length ? f.combo + 1 : 0;
    startAttack(world, f, f.weapon ? 0 : idx);
    return;
  }
  if (f.gap > CHAIN_GAP) f.combo = -1;

  // Correr: doble toque adelante (F1)
  const dx = Math.round(input.x), dy = Math.round(input.y);
  if (dx !== 0 && f.lastX === 0) {
    if (dx === f.tapDir && world.tick - f.tapT <= DOUBLE_TAP) { f.run = true; f.runDir = dx; }
    f.tapDir = dx; f.tapT = world.tick;
  }
  f.lastX = dx;
  if (f.run && dx !== f.runDir) f.run = false;
  if (dx !== 0) f.face = dx;

  const spd = f.run ? sp.run : sp.speed;
  f.x += input.x * spd;
  f.y += input.y * spd * 0.6;
  f.state = f.run ? 'run' : (dx || dy ? 'walk' : 'idle');
  if (f.state !== 'idle') f.t++;

  // Agarre: empujar contra un enemigo un instante (F2)
  if (dx !== 0 && !f.run) {
    const v = world.fighters.find((e) => e.team === 'e' && canBeGrabbed(e) &&
      sign(e.x - f.x) === dx && Math.abs(e.x - f.x) <= (f.def.w + e.def.w) / 2 + 4 && Math.abs(e.y - f.y) <= 5);
    if (v) { if (++f.contact >= GRAB_CONTACT) { f.contact = 0; startGrab(world, f, v); placeGrabbed(f, v); } }
    else f.contact = 0;
  } else f.contact = 0;
}

// ---- Enemigo ----
export function stepEnemy(world, f) {
  if (f.removed) return;
  if (f.freeze > 0) { f.freeze--; return; }
  if (f.invul > 0) f.invul--;
  if (f.knockCd > 0) f.knockCd--;
  if (stepCommon(world, f)) { clampToWorld(world, f); return; }
  if (!enemyStates(world, f)) think(world, f);
  clampToWorld(world, f);
}
