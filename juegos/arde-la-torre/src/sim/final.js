// Batalla final cooperativa (F15) y rescate de compañeros (F16).
import { FLOOR_TOP, FLOOR_BOTTOM, LANE } from './constants.js';
import { setState } from './combat.js';
import { NEUTRAL } from './fighter.js';

export const AMP_HITS = 3;          // golpes para encender un amplificador
export const STUN_TICKS = 240;      // 4 s aturdido al romper el escudo
export const RESCUE_WINDOW = 180;   // 3 s en el suelo esperando rescate
export const RESCUE_HOLD = 30;      // 0,5 s manteniendo GOLPE al lado
export const RESCUE_HP = 0.4;

export const ampsFor = (players) => (players <= 1 ? 2 : players === 2 ? 3 : 4);

const AMP_SPOTS = {
  2: [[56, 0.25], [328, 0.75]],
  3: [[50, 0.2], [192, 0.95], [334, 0.2]],
  4: [[46, 0.15], [150, 0.9], [234, 0.15], [338, 0.9]],
};

function spawnAmps(world, players) {
  const n = ampsFor(players);
  for (const [x, dy] of AMP_SPOTS[n]) {
    world.props.push({ id: world.nextId++, kind: 'amp', x: world.camX + x, y: FLOOR_TOP + (FLOOR_BOTTOM - FLOOR_TOP) * dy, hits: 0, lit: false, broken: false });
  }
}

export function updateFinal(world) {
  if (!world.level.final) return;
  const boss = world.fighters.find((f) => f.type === 'presidente' && !f.removed && f.hp > 0);
  if (!boss) return;
  const players = world.fighters.filter((f) => f.team === 'p' && !f.removed).length;
  const frac = boss.hp / boss.maxHp;
  if (!boss.phase) boss.phase = 1;
  if (boss.phase === 1 && frac <= 0.6) {
    boss.phase = 2; boss.shield = true;
    spawnAmps(world, players);
    for (let i = 0; i < 2; i++) world.pending.push({ type: 'guardia', side: i ? 'L' : 'R', at: world.levelTick + 40 + i * 40, dy: null, wave: world.waveIdx });
    world.events.push({ type: 'shield' });
  }
  if (boss.phase === 2 && boss.shield) {
    const amps = world.props.filter((p) => p.kind === 'amp');
    if (amps.length && amps.every((p) => p.lit)) {
      boss.shield = false;
      if (boss.state === 'grab') { const v = world.byId.get(boss.grab); if (v) { v.grabbedBy = 0; setState(v, 'hurt'); } boss.grab = 0; }
      setState(boss, 'stun'); boss.stunDur = STUN_TICKS; boss.vx = 0;
      if (boss.ai) boss.ai.token = 0;
      world.events.push({ type: 'shieldBreak', x: boss.x, y: boss.y });
    }
  }
  if (boss.phase >= 2 && !boss.shield && frac <= 0.3 && !boss.enraged) {
    boss.phase = 3; boss.enraged = true;
    boss.def = { ...boss.def, speed: boss.def.speed * 1.25, cd: Math.round(boss.def.cd * 0.6) };
    for (let i = 0; i < 2; i++) world.pending.push({ type: i ? 'comercial' : 'guardia', side: i ? 'L' : 'R', at: world.levelTick + 30 + i * 40, dy: null, wave: world.waveIdx });
    world.events.push({ type: 'enraged' });
  }
}

// Amplificadores: se encienden a golpes (cada golpe cuenta una vez por ataque).
export function hitAmp(world, a, p) {
  if (p.lit) return;
  if (a.hitIds) { if (a.hitIds.includes(p.id)) return; a.hitIds.push(p.id); }
  p.hits++;
  world.events.push({ type: 'ampHit', x: p.x, y: p.y, hits: p.hits });
  if (p.hits >= AMP_HITS) { p.lit = true; world.events.push({ type: 'ampOn', x: p.x, y: p.y }); }
}

// ¿Se puede rescatar a este jugador caído? Solo en la final y si hay alguien en pie.
export const rescuable = (world, f) => world.level.final && f.team === 'p' &&
  world.fighters.some((o) => o !== f && o.team === 'p' && !o.removed && !o.out && !o.away && o.state !== 'dead');

// Rescate (F16): un compañero al lado que mantiene GOLPE lo levanta sin gastar vida.
export function updateRescue(world, f, inputs) {
  const helper = world.fighters.find((o) => o !== f && o.team === 'p' && !o.removed && !o.out && !o.away &&
    (o.state === 'idle' || o.state === 'walk' || o.state === 'attack') &&
    Math.abs(o.x - f.x) <= 26 && Math.abs(o.y - f.y) <= LANE + 2 && (inputs[o.slot] || NEUTRAL).golpe);
  f.rescue = helper ? (f.rescue || 0) + 1 : 0;
  if (f.rescue >= RESCUE_HOLD) {
    f.rescue = 0;
    f.hp = Math.round(f.maxHp * RESCUE_HP);
    setState(f, 'rise'); f.invul = 0;
    world.events.push({ type: 'rescue', slot: f.slot, by: helper.slot });
    return true;
  }
  return false;
}
