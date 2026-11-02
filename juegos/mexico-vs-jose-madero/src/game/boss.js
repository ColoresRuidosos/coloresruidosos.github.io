// Jefe del Mundo 1: Cámara Flash-Bot («La Prensa Rosa»). Máquina de fases pura (spec §3.0d).
//   walk → charge (aviso) → beam (rayo bajo o alto) → exposed (lente vulnerable) → walk …
import { BOSS, DT } from './constants.js';
import { moveBody } from '../engine/tilemap.js';

export function createBoss(spawn) {
  return {
    x: spawn.x - BOSS.w / 2, y: spawn.y - BOSS.h, w: BOSS.w, h: BOSS.h, vx: 0, vy: 0,
    hp: BOSS.hp, phase: 1, state: 'walk', t: 0, facing: -1, cycle: 0, beamKind: 'low',
    hurtT: 0, alive: true, deadT: 0,
  };
}

// Rectángulo del rayo: sale del lente hacia donde mira y llega hasta el borde del nivel.
export function beamRect(g, b) {
  const floor = b.y + b.h;
  const cy = floor - (b.beamKind === 'high' ? BOSS.beamHigh : BOSS.beamLow);
  const front = b.facing < 0 ? b.x : b.x + b.w;
  const end = b.facing < 0 ? 0 : g.level.w * 16;
  return { x: Math.min(front, end), y: cy - BOSS.beamH / 2, w: Math.abs(end - front), h: BOSS.beamH };
}

// Golpe al jefe. Con el micrófono solo cuenta si el lente está expuesto; el Solo de guitarra (`force`) siempre.
export function hitBoss(g, b, force = false) {
  if (!b.alive || b.hurtT > 0) return false;
  if (!force && b.state !== 'exposed') { g.events.push('clank'); return false; }
  b.hp--; b.hurtT = BOSS.hurtT;
  g.events.push('bosshit');
  g.score += 500;
  g.hitstop = 6; g.shake = Math.max(g.shake, 0.3);
  g.floats.push({ x: b.x + b.w / 2, y: b.y, text: '+500', t: 0.9 });
  if (b.hp <= BOSS.phase2) b.phase = 2;
  // Un golpe por apertura: el lente se cierra y retrocede hacia el otro lado del escenario.
  const away = Math.sign(b.x + b.w / 2 - (g.player.x + g.player.w / 2)) || 1;
  b.state = 'retreat'; b.t = 0; b.facing = away;
  if (b.hp <= 0) {
    b.alive = false; b.state = 'dead';
    g.score += 5000;
    g.events.push('bossdown');
    g.floats.push({ x: b.x + b.w / 2, y: b.y - 10, text: '+5000', t: 1.6 });
    g.disco = { x: b.x + b.w / 2, y: b.y + b.h - 14, taken: false };
  }
  return true;
}

const overlap = (a, c) => a.x < c.x + c.w && a.x + a.w > c.x && a.y < c.y + c.h && a.y + a.h > c.y;

export function stepBoss(g, b, hurt, prevBottom) {
  if (!b.alive) { b.deadT += DT; return; }
  b.t += DT;
  b.hurtT = Math.max(0, b.hurtT - DT);
  const p = g.player, pc = p.x + p.w / 2, bc = b.x + b.w / 2;
  // Gravedad (camina por el escenario).
  b.vy = Math.min(420, b.vy + 1400 * DT);
  const speed = b.phase === 2 ? BOSS.speed2 : BOSS.speed;
  if (b.state === 'walk') {
    b.facing = Math.sign(pc - bc) || b.facing;
    b.vx = Math.abs(pc - bc) > 40 ? b.facing * speed : 0;
  } else if (b.state === 'retreat') b.vx = b.facing * BOSS.retreat;
  else b.vx = 0;
  const r = moveBody(g.level, b, b.vx * DT, b.vy * DT);
  if (r.ground) b.vy = 0;
  if (b.state === 'retreat' && (r.hitX || b.t >= BOSS.retreatT)) { b.state = 'walk'; b.t = 0; }

  if (b.state === 'walk' && b.t >= BOSS.walk) {
    b.state = 'charge'; b.t = 0; b.cycle++;
    b.facing = Math.sign(pc - bc) || b.facing;
    b.beamKind = b.phase === 2 && b.cycle % 2 ? 'high' : 'low';
    g.events.push('charge');
  } else if (b.state === 'charge' && b.t >= BOSS.charge) {
    b.state = 'beam'; b.t = 0; g.events.push('beam');
  } else if (b.state === 'beam') {
    if (overlap(beamRect(g, b), p)) hurt(g, bc);
    if (b.t >= BOSS.beam) { b.state = 'exposed'; b.t = 0; g.events.push('exposed'); }
  } else if (b.state === 'exposed' && b.t >= BOSS.exposed) {
    b.state = 'walk'; b.t = 0;
  }

  // Cuerpo a cuerpo: pisarlo te hace rebotar (y le daña si está expuesto); de lado, te hace daño.
  if (overlap(p, b)) {
    if (p.vy > 0 && prevBottom <= b.y + 8) {
      p.vy = -300; p.jumping = false;
      hitBoss(g, b);
    } else hurt(g, bc);
  }
}
