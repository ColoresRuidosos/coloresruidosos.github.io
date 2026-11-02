// Mundo 2 «Noche» (spec §3.0f E): farol, enemigos nuevos y jefe El Enmascarado del Lago. Lógica pura (sin DOM).
import { TILE, DT, ENEMY, LANTERN, MASK } from './constants.js';
import { moveBody, freeX } from '../engine/tilemap.js';

// ── Farol ──────────────────────────────────────────────
export const createLantern = () => ({ oil: 1 });
export function stepLantern(g) { if (g.lantern) g.lantern.oil = Math.max(0, g.lantern.oil - DT / LANTERN.duration); }
export const refill = (g) => { if (g.lantern) g.lantern.oil = 1; };
export const lightRadius = (g) => (g.lantern ? LANTERN.min + (LANTERN.max - LANTERN.min) * g.lantern.oil : Infinity);
export function inLight(g, x, y) {
  if (!g.lantern) return true;
  const p = g.player;
  return Math.hypot(x - (p.x + p.w / 2), y - (p.y + p.h / 2)) <= lightRadius(g);
}

// ── Enemigos ───────────────────────────────────────────
const center = (b) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });

// ── v8.1 · Invitados disfrazados (spec §3.0f G). Sin disfraz (`unmasked`) usan sus valores «2». ──
const spd = (e, k) => (e.unmasked ? k.speed2 : k.speed);
const towardPepe = (g, e) => Math.sign(g.player.x + g.player.w / 2 - (e.x + e.w / 2)) || e.facing;

// Gigante cosido: lento; si te ve, camina hacia ti (su empujón lo aplica game.js).
export function stepGigante(g, e, k, patrol, sees) {
  if (e.unmasked) e.unmaskT = (e.unmaskT ?? 0) + DT;
  e.hitT = Math.max(0, (e.hitT ?? 0) - DT);
  if (sees(g, e, k.sight, false)) { e.facing = towardPepe(g, e); e.vx = e.facing * spd(e, k); }
  patrol(g, e, spd(e, k));
}

// Hombre invisible: siempre va hacia Pepe (lo que se ve de él lo decide el render).
export function stepInvisible(g, e, k, patrol) {
  if (e.unmasked) e.unmaskT = (e.unmaskT ?? 0) + DT;
  e.facing = towardPepe(g, e); e.vx = e.facing * spd(e, k);
  patrol(g, e);
  e.vx = e.facing * spd(e, k);
}

// Hombre anfibio: escondido en el foso; cuando Pepe pasa cerca, salta en arco y vuelve a esconderse.
export function stepAnfibio(g, e, k) {
  if (e.unmasked) e.unmaskT = (e.unmaskT ?? 0) + DT;
  const near = Math.abs(g.player.x + g.player.w / 2 - (e.x + e.w / 2)) <= k.sight;
  if (e.state === 'hide') {
    if ((!e.jumped || e.t >= (e.unmasked ? k.rest2 : k.rest)) && near) {
      e.jumped = true; e.state = 'jump'; e.t = 0; e.vy = -k.jumpV; e.facing = towardPepe(g, e); g.events.push('dive'); }
  } else {
    e.vy = Math.min(600, e.vy + 1400 * DT);
    e.y += e.vy * DT;
    if (e.vy > 0 && e.y >= e.home.y) { e.y = e.home.y; e.vy = 0; e.state = 'hide'; e.t = 0; }
  }
}

// La Llorona: flota hacia Pepe; su llanto lo frena un momento (no quita corazones).
export function stepLlorona(g, e, k) {
  if (e.unmasked) e.unmaskT = (e.unmaskT ?? 0) + DT;
  const p = g.player, dx = p.x + p.w / 2 - (e.x + e.w / 2), dy = p.y + p.h / 2 - (e.y + e.h / 2), d = Math.hypot(dx, dy) || 1;
  if (d <= k.sight) { e.x += (dx / d) * spd(e, k) * DT; e.y += (dy / d) * spd(e, k) * DT * 0.5; e.facing = Math.sign(dx) || e.facing; }
  e.cryT = Math.max(0, (e.cryT ?? 0) - DT);
  if (d <= k.cry && e.cryT <= 0) { p.slowT = k.slow; e.cryT = k.cool; e.state = 'cry'; e.t = 0; g.events.push('frozen'); }
  else if (e.state === 'cry' && e.t > 0.6) e.state = 'float';
}

// Murciélago: cuelga del techo; si Pepe pasa cerca (por debajo), baja en curva y vuelve a subir algo más allá.
export function stepMurcielago(g, e, k) {
  const p = g.player, pc = center(p), c = center(e);
  if (e.state === 'hang') {
    if (pc.y > c.y && Math.abs(pc.x - c.x) <= k.sight) {
      e.state = 'swoop'; e.t = 0; e.facing = Math.sign(pc.x - c.x) || e.facing; g.events.push('dive');
    }
  } else if (e.state === 'swoop') {
    e.x = Math.max(0, Math.min(g.level.w * TILE - e.w, e.x + e.facing * k.speed * DT));
    const u = Math.min(1, e.t / k.swoop);
    e.y = e.home.y + Math.sin(Math.PI * u) * k.depth;
    if (u >= 1) { e.y = e.home.y; e.state = 'rest'; e.t = 0; }
  } else if (e.state === 'rest' && e.t >= k.rest) { e.state = 'hang'; e.t = 0; }
}

// Fantasma: flota despacio hacia Pepe y atraviesa paredes (solo se ve dentro de la luz: lo decide el render).
export function stepFantasma(g, e, k) {
  const pc = center(g.player), c = center(e);
  const dx = pc.x - c.x, dy = pc.y - c.y, d = Math.hypot(dx, dy) || 1;
  if (d <= k.sight) {
    e.x += (dx / d) * k.speed * DT; e.y += (dy / d) * k.speed * DT;
    e.facing = Math.sign(dx) || e.facing;
  } else e.y = e.home.y + Math.sin(e.t * 2) * 4;
}

// ── Jefe: El Enmascarado del Lago ⏳ ────────────────────
//   lurk (solo ojos, aviso) → dash (embestida) → [fase 2: redash, vuelve a embestir] → stun (aturdido, vulnerable)
//   → [fase 2: blackout] → lurk …
export function createMask(spawn, level) {
  const left = MASK.spot * TILE, right = (level.w - MASK.spot) * TILE - MASK.w;
  return {
    kind: 'mask', x: spawn.x - MASK.w / 2, y: spawn.y - MASK.h, w: MASK.w, h: MASK.h, vx: 0, vy: 0,
    hp: MASK.hp, phase: 1, state: 'lurk', t: 0, facing: -1, spots: [left, right],
    hurtT: 0, alive: true, deadT: 0, unmasked: false,
  };
}

function lurkAt(g, b) {
  // Aparece en el muelle más alejado de Pepe.
  const pc = g.player.x + g.player.w / 2;
  const [l, r] = b.spots;
  b.x = Math.abs(pc - l) > Math.abs(pc - r) ? l : r;
  b.state = 'lurk'; b.t = 0; b.vx = 0;
}

export function hitMask(g, b, force = false) {
  if (!b.alive || b.hurtT > 0) return false;
  if (!force && b.state !== 'stun') { g.events.push('clank'); return false; }
  b.hp--; b.hurtT = MASK.hurtT;
  g.events.push('bosshit');
  g.score += 500;
  g.hitstop = 6; g.shake = Math.max(g.shake, 0.3);
  g.floats.push({ x: b.x + b.w / 2, y: b.y, text: '+500', t: 0.9 });
  if (b.hp <= MASK.phase2) b.phase = 2;
  if (b.hp <= 0) {
    b.alive = false; b.state = 'dead'; b.unmasked = true;
    g.blackout = false;
    g.score += 5000;
    g.events.push('bossdown');
    g.floats.push({ x: b.x + b.w / 2, y: b.y - 10, text: 'SOLO ERA UNA MÁSCARA', t: 2.4 });
    // La máscara cae a un lado, hacia Pepe, para no taparle la cara a quien había debajo.
    // Nunca dentro de una pared: si ese lado está tapado, se recoloca hacia el centro del muelle.
    const side = g.player.x + g.player.w / 2 < b.x + b.w / 2 ? -1 : 1;
    const y = b.y + b.h - 14, mid = (g.level.w * TILE) / 2;
    g.disco = { kind: 'mascara', x: freeX(g.level, b.x + b.w / 2 + side * 30, y, mid), y, taken: false };
    return true;
  }
  if (b.phase === 2) { b.state = 'blackout'; b.t = 0; } else lurkAt(g, b);
  return true;
}

const overlap = (a, c) => a.x < c.x + c.w && a.x + a.w > c.x && a.y < c.y + c.h && a.y + a.h > c.y;

export function stepMask(g, b, hurt, prevBottom) {
  g.blackout = false;
  if (!b.alive) { b.deadT += DT; return; }
  b.t += DT;
  b.hurtT = Math.max(0, b.hurtT - DT);
  const p = g.player, pc = p.x + p.w / 2, bc = b.x + b.w / 2;
  b.vy = Math.min(420, b.vy + 1400 * DT);
  const dashing = b.state === 'dash' || b.state === 'redash';
  const r = moveBody(g.level, b, (dashing ? b.vx : 0) * DT, b.vy * DT);
  if (r.ground) b.vy = 0;

  if (b.state === 'lurk') {
    b.facing = Math.sign(pc - bc) || b.facing;
    if (b.t >= (b.phase === 2 ? MASK.lurk2 : MASK.lurk)) {
      b.state = 'dash'; b.t = 0; b.vx = b.facing * (b.phase === 2 ? MASK.dash2 : MASK.dash); g.events.push('dash');
    }
  } else if (dashing) {
    if (r.hitX && b.state === 'dash' && b.phase === 2) {
      // Doble embestida: rebota en la pared y vuelve sin pararse.
      b.state = 'redash'; b.t = 0; b.facing = -b.facing; b.vx = b.facing * MASK.dash2;
      g.shake = Math.max(g.shake, 0.2); g.events.push('dash');
    } else if (r.hitX) { b.state = 'stun'; b.t = 0; b.vx = 0; g.shake = Math.max(g.shake, 0.25); g.events.push('bossland'); }
    else if (b.t >= MASK.dashMax) lurkAt(g, b);
  } else if (b.state === 'stun' && b.t >= MASK.stun) {
    if (b.phase === 2) { b.state = 'blackout'; b.t = 0; } else lurkAt(g, b);
  } else if (b.state === 'blackout') {
    g.blackout = true;
    if (b.t >= MASK.blackout) lurkAt(g, b);
  }

  // Tocarlo: pisarlo rebota (y le daña si está aturdido); la embestida hace daño; acechando no se le puede tocar.
  if ((dashing || b.state === 'stun') && overlap(p, b)) {
    if (p.vy > 0 && prevBottom <= b.y + 8) { p.vy = -300; p.jumping = false; hitMask(g, b); }
    else if (dashing) hurt(g, bc);
  }
}
