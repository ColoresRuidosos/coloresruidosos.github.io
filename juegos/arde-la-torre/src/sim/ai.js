// IA de enemigos y jefes (F5, F6): turnos de ataque («fichas»), cerco y ataques por tipo.
import { TOKENS_PER_PLAYER, LANE, W } from './constants.js';
import { sign, setState, releaseTokens, canBeGrabbed, startGrab, placeGrabbed, throwVictim } from './combat.js';

const TARGETABLE = (p) => p.team === 'p' && !p.removed && !p.out && !p.away && p.state !== 'dead';

export function nearestPlayer(world, f) {
  let best = null, bd = Infinity;
  for (const p of world.fighters) {
    if (!TARGETABLE(p)) continue;
    const d = Math.abs(p.x - f.x) + Math.abs(p.y - f.y) * 2;
    if (d < bd) { bd = d; best = p; }
  }
  return best;
}

function finishMove(world, f) {
  releaseTokens(world, f);
  f.ai.move = null;
  f.ai.cd = f.def.cd + world.rng.int(0, 30);
  setState(f, 'idle');
}

function windup(f, name) {
  f.ai.move = name; f.move = f.def.moves[name];
  setState(f, 'ewind'); f.vx = 0; f.hitIds = [];
}

// Estados de ataque del enemigo. Devuelve true si se ocupó del tick.
export function enemyStates(world, f) {
  switch (f.state) {
    case 'ewind': {
      const m = f.move, name = f.ai.move;
      const wind = m.windup ?? m.start;
      if (++f.t < wind) return true;
      if (name === 'punch') { setState(f, 'eatk'); return true; }
      if (name === 'charge') { setState(f, 'charge'); f.vx = f.face * m.speed; world.events.push({ type: 'charge', x: f.x, y: f.y }); return true; }
      if (name === 'shoot') {
        world.shots.push({ id: world.nextId++, x: f.x + f.face * 14, y: f.y, z: 34, vx: f.face * m.speed, dmg: m.dmg, kind: m.kind, team: 'e', face: f.face, ttl: 160 });
        world.events.push({ type: 'shoot', kind: m.kind, x: f.x, y: f.y });
        finishMove(world, f);
        return true;
      }
      if (name === 'grab') {
        const t = world.fighters.find((p) => p.team === 'p' && canBeGrabbed(p) &&
          sign(p.x - f.x) === f.face && Math.abs(p.x - f.x) <= m.reach + (f.def.w + p.def.w) / 2 && Math.abs(p.y - f.y) <= 6);
        if (t) { startGrab(world, f, t); placeGrabbed(f, t); f.grabHold = m.hold; f.grabDmg = m.dmg; return true; }
        finishMove(world, f);
        return true;
      }
      finishMove(world, f);
      return true;
    }
    case 'eatk':
      if (++f.t >= f.move.active + f.move.rec) finishMove(world, f);
      return true;
    case 'charge':
      f.x += f.vx; f.t++;
      if (f.t >= f.move.dur || f.x < world.camX - 40 || f.x > world.camX + 424) { f.vx = 0; finishMove(world, f); }
      return true;
    case 'grab': {
      const v = world.byId.get(f.grab);
      f.t++;
      if (!v || v.removed || v.state !== 'grabbed') { f.grab = 0; finishMove(world, f); return true; }
      placeGrabbed(f, v);
      if (f.t >= f.grabHold) { throwVictim(world, f, v, f.grabDmg); releaseTokens(world, f); f.ai.move = null; f.ai.cd = f.def.cd; }
      return true;
    }
    default:
      return false;
  }
}

function tryToken(world, f, tgt) {
  if (f.def.boss || f.ai.token) return;
  if (tgt.tokens >= TOKENS_PER_PLAYER || f.ai.cd > 0) return;
  if (!world.rng.chance(0.06)) return;
  tgt.tokens++; f.ai.token = tgt.id;
}

export function think(world, f) {
  if (f.ai.hold) return;                 // quieto (lo usan los tests)
  const tgt = nearestPlayer(world, f);
  if (!tgt) { f.state = 'idle'; return; }
  if (f.ai.cd > 0) f.ai.cd--;
  // Si su ficha es de otro jugador que ya no está, la suelta.
  if (f.ai.token && f.ai.token !== tgt.id) releaseTokens(world, f);
  tryToken(world, f, tgt);

  const dx = tgt.x - f.x, adx = Math.abs(dx), ady = Math.abs(tgt.y - f.y);
  const m = f.def.moves;
  const attacker = f.def.boss || f.ai.token === tgt.id;
  f.face = sign(dx) || f.face;

  if (attacker && f.ai.cd <= 0 && tgt.z < 20) {
    const r = world.rng;
    const reach = m.punch.reach[1] + tgt.def.w / 2 - 3;
    if (m.grab && adx <= m.grab.reach + (f.def.w + tgt.def.w) / 2 && ady <= 5 && r.chance(0.4)) return windup(f, 'grab');
    if (adx <= reach && adx >= 4 && ady <= LANE - 4) return windup(f, 'punch');
    if (m.charge && ady <= 5 && adx >= m.charge.min && adx <= m.charge.max && r.chance(f.def.boss ? 0.05 : 0.025)) return windup(f, 'charge');
    if (m.shoot && ady <= 5 && adx >= m.shoot.min && adx <= m.shoot.max && r.chance(f.def.boss ? 0.035 : 0.03)) return windup(f, 'shoot');
  }

  // Movimiento
  let gx, gy, spd = f.def.speed;
  if (attacker) {
    const keep = f.def.keepAway && !f.def.boss ? f.def.keepAway : m.punch.reach[1] * 0.7 + tgt.def.w / 2;
    gx = tgt.x - (sign(dx) || 1) * keep; gy = tgt.y;
  } else {
    const side = sign(f.x - tgt.x) || f.ai.side;
    gx = tgt.x + side * (52 + (f.id % 3) * 14);
    gy = tgt.y + (f.id % 2 ? -12 : 12);
    spd *= 0.7;
  }
  gx = Math.min(world.camX + W - 20, Math.max(world.camX + 20, gx));   // siempre hacia dentro de la pantalla
  const ex = gx - f.x, ey = gy - f.y;
  let moved = false;
  if (Math.abs(ex) > 3) { f.x += sign(ex) * Math.min(spd, Math.abs(ex)); moved = true; }
  if (Math.abs(ey) > 2) { f.y += sign(ey) * Math.min(spd * 0.6, Math.abs(ey)); moved = true; }
  if (moved) { if (f.state !== 'walk') setState(f, 'walk'); else f.t++; }
  else if (f.state !== 'idle') setState(f, 'idle');
  else f.t++;
}

