// Combate (F2–F4): cajas de golpe y de daño, carriles, daño, caídas, agarres y lanzamientos.
import { LANE, HITSTOP, ASSIST_DAMAGE, RISE_INVUL_PLAYER, RISE_INVUL_ENEMY } from './constants.js';
import { WEAPONS, WEAPON_SWING } from './moves.js';

export const sign = (v) => (v > 0 ? 1 : v < 0 ? -1 : 0);

// Rango [x0, x1] que cubre una caja de golpe, según hacia dónde mira el atacante.
export function boxRange(a, box) {
  const [r0, r1] = box.reach;
  if (box.both) return [a.x - r1, a.x + r1];
  return a.face > 0 ? [a.x + r0, a.x + r1] : [a.x - r1, a.x - r0];
}

// ¿Conecta la caja `box` del atacante con el cuerpo del objetivo? Regla del género: mismo carril (|Δy| ≤ LANE).
export function overlaps(a, box, t) {
  if (Math.abs(a.y - t.y) > LANE) return false;
  const [x0, x1] = boxRange(a, box);
  const hw = t.def.w / 2;
  if (x1 < t.x - hw || x0 > t.x + hw) return false;
  const z0 = a.z + box.z[0], z1 = a.z + box.z[1];
  return !(z1 < t.z || z0 > t.z + t.def.h);
}

// Tumbado, levantándose, muerto o cayendo: no se le puede golpear (evita los malabares infinitos).
export const isDown = (f) => f.state === 'down' || f.state === 'rise' || f.state === 'dead' || f.state === 'fall' || f.state === 'thrown';
export const isAirborneHit = (f) => f.state === 'fall' || f.state === 'thrown';

// Caja de golpe activa en este tick, o null.
export function activeBox(f) {
  const t = f.t;
  switch (f.state) {
    case 'attack': {
      const m = f.atk;
      return t >= m.start && t < m.start + m.active ? m : null;
    }
    case 'jump': return f.airAtk && f.airT < 16 ? f.def.air : null;
    case 'dash': return t >= 3 ? f.def.dash : null;
    case 'special': {
      const sp = f.def.sp;
      if (t < sp.from || t > sp.to) return null;
      const last = sp.knockLast && t > sp.to - (sp.rehit || 1);
      return last ? { ...sp, knock: true } : sp;
    }
    case 'eatk': {
      const m = f.move;
      return t < m.active ? m : null;
    }
    case 'charge': return { reach: [-4, f.def.w / 2 + 8], z: [6, 50], dmg: f.move.dmg, knock: true, unblock: true };
    default: return null;
  }
}

function releaseTokens(world, f) {
  if (f.team === 'e' && f.ai && f.ai.token) {
    const p = world.byId.get(f.ai.token);
    if (p) p.tokens = Math.max(0, p.tokens - 1);
    f.ai.token = 0;
  }
}
export { releaseTokens };

export function setState(f, state) { f.state = state; f.t = 0; }

export function releaseGrab(world, holder, victimState = 'hurt') {
  const v = holder.grab ? world.byId.get(holder.grab) : null;
  holder.grab = 0;
  if (v && v.state === 'grabbed') {
    v.grabbedBy = 0;
    setState(v, victimState);
    v.hurtDur = 12; v.vx = 0;
  }
}

// Si el objetivo estaba agarrado o agarrando, se suelta todo.
function breakGrabs(world, t) {
  if (t.state === 'grab') releaseGrab(world, t, 'idle');
  if (t.state === 'grabbed' && t.grabbedBy) {
    const h = world.byId.get(t.grabbedBy);
    if (h) { h.grab = 0; setState(h, 'idle'); }
    t.grabbedBy = 0;
  }
}

export function knockdown(world, t, dir, vx = 2.0, vz = 3.2) {
  breakGrabs(world, t);
  releaseTokens(world, t);
  setState(t, 'fall');
  t.vx = dir * vx; t.vz = vz; t.z = Math.max(t.z, 1);
  t.face = -dir || t.face;
}

export function hurt(world, t, dir, push = 1.2) {
  if (t.state !== 'grabbed') { releaseTokens(world, t); breakGrabs(world, t); setState(t, 'hurt'); }
  else t.t = 0;
  t.hurtDur = t.def.boss ? 8 : 16;
  t.vx = t.state === 'grabbed' ? 0 : dir * push;
  t.face = -dir || t.face;
}

const ARMORED = new Set(['ewind', 'charge', 'eatk']);

// Aplica un golpe. `a` puede ser un luchador o un proyectil ({x, team, face, slot}). Devuelve true si conectó.
export function applyHit(world, a, t, box, dirOverride = 0) {
  if (t.removed || isDown(t) || t.invul > 0 || (t.team === 'p' && (t.away || t.out))) return false;
  if (t.state === 'special') return false;            // F3: invulnerable durante el especial
  const dir = dirOverride || sign(t.x - a.x) || a.face || 1;
  const freezeA = !dirOverride && a.freeze !== undefined;
  // El guardia se cubre de frente (F5) salvo agarres, lanzamientos, especiales y embestidas.
  // Tras 3 bloqueos seguidos se le rompe la guardia y el siguiente golpe entra. Las patadas en el aire no se bloquean.
  if (t.def.block && !box.unblock && !box.air && (t.state === 'idle' || t.state === 'walk' || t.state === 'block') && t.face === -dir && (t.blocks || 0) < 3) {
    t.blocks = (t.blocks || 0) + 1;
    setState(t, 'block'); t.vx = dir * 1.2;
    if (freezeA) a.freeze = HITSTOP;
    world.events.push({ type: 'block', x: t.x, y: t.y, z: t.z + 36 });
    return 'block';                                   // cuenta como contacto, no como acierto (no encadena el combo)
  }
  t.blocks = 0;
  let dmg = box.dmg;
  if (t.team === 'p' && world.opts.assisted) dmg *= ASSIST_DAMAGE;
  t.hp -= dmg;
  const attacker = a.team === 'p' && a.slot !== undefined ? a : null;
  if (attacker) attacker.score += Math.round(dmg * 10);
  if (freezeA) a.freeze = HITSTOP;
  t.freeze = HITSTOP;
  world.events.push({ type: 'hit', x: t.x, y: t.y, z: t.z + t.def.h * 0.6, team: t.team, dmg, slot: t.team === 'p' ? t.slot : a.slot });
  if (t.hp <= 0) {
    t.hp = 0;
    if (attacker && t.team === 'e') { attacker.kos++; attacker.score += t.def.score; }
    knockdown(world, t, dir, 2.4, 3.6);
    world.events.push({ type: 'ko', team: t.team, slot: t.slot, boss: !!t.def.boss, x: t.x, y: t.y });
    return true;
  }
  if (t.def.boss && ARMORED.has(t.state) && !box.knock) return true;   // los jefes aguantan mientras atacan
  if (box.knock && !box.holdHit) {
    if (t.def.boss && t.knockCd > 0) hurt(world, t, dir, 1);
    else { knockdown(world, t, dir); if (t.def.boss) t.knockCd = 150; }
  } else if (!box.holdHit) hurt(world, t, dir, box.push ?? 1.2);
  return true;
}

// ---- Agarres (F2) ----
export function canBeGrabbed(t) {
  return !t.removed && !t.def.boss && t.z === 0 && t.invul <= 0 && !t.grabbedBy &&
    (t.state === 'idle' || t.state === 'walk' || t.state === 'hurt' || t.state === 'ewind' || t.state === 'block' || t.state === 'run' || t.state === 'attack') &&
    !(t.team === 'p' && (t.away || t.out));
}

export function startGrab(world, holder, victim) {
  releaseTokens(world, victim);
  if (victim.state === 'grab') releaseGrab(world, victim, 'idle');
  setState(holder, 'grab'); holder.grab = victim.id; holder.knees = 0; holder.vx = 0;
  setState(victim, 'grabbed'); victim.grabbedBy = holder.id; victim.vx = 0;
  victim.face = -holder.face;
  world.events.push({ type: 'grab', x: victim.x, y: victim.y });
}

// Coloca a la víctima delante del que agarra.
export function placeGrabbed(holder, victim) {
  victim.x = holder.x + holder.face * ((holder.def.w + victim.def.w) / 2 - 2);
  victim.y = holder.y; victim.z = 0;
}

export function throwVictim(world, holder, victim, dmg, dir = holder.face) {
  holder.grab = 0;
  victim.grabbedBy = 0;
  holder.face = dir;
  placeGrabbed(holder, victim);
  setState(holder, 'throwing');
  setState(victim, 'thrown');
  victim.vx = dir * 3.4; victim.vz = 3.6; victim.z = 6;
  victim.thrownBy = holder.id; victim.hitIds = [];
  const before = victim.hp;
  victim.hp = Math.max(0, victim.hp - (victim.team === 'p' && world.opts.assisted ? dmg * ASSIST_DAMAGE : dmg));
  if (holder.team === 'p') holder.score += Math.round((before - victim.hp) * 10);
  if (victim.hp <= 0 && holder.team === 'p' && victim.team === 'e') { holder.kos++; holder.score += victim.def.score; }
  world.events.push({ type: 'throw', x: victim.x, y: victim.y, slot: victim.team === 'p' ? victim.slot : holder.slot });
}

export const THROWN_HIT = { reach: [-12, 12], both: true, z: [0, 50], dmg: 10, knock: true, unblock: true };

export function landFrom(world, f) {
  // Fin de una caída: al suelo. Si no le queda vida, muere.
  f.z = 0; f.vz = 0; f.vx = 0;
  setState(f, f.hp <= 0 ? 'dead' : 'down');
  world.events.push({ type: 'land', x: f.x, y: f.y, team: f.team });
}

export function riseInvul(f) { return f.team === 'p' ? RISE_INVUL_PLAYER : RISE_INVUL_ENEMY; }

export function weaponBox(f) {
  const w = WEAPONS[f.weapon.kind];
  return { ...WEAPON_SWING, reach: w.reach, z: w.z, dmg: w.dmg, knock: w.knock, push: 2, weapon: true };
}
