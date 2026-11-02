// Mundo 2 «Noche» (spec §3.0f E): farol, enemigos nuevos y jefe El Enmascarado del Lago. Lógica pura (sin DOM).
import { TILE, DT, ENEMY, LANTERN, MASK } from './constants.js';
import { createEnemy } from './enemies.js';
import { HEADLINES } from '../data/quotes.js';
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

// Hombre anfibio: escondido en el foso; cuando Pepe se acerca, avisa con burbujas, salta en arco y vuelve a esconderse.
export function stepAnfibio(g, e, k) {
  if (e.unmasked) e.unmaskT = (e.unmaskT ?? 0) + DT;
  const near = Math.abs(g.player.x + g.player.w / 2 - (e.x + e.w / 2)) <= k.sight;
  if (e.state === 'hide') {
    if ((!e.jumped || e.t >= (e.unmasked ? k.rest2 : k.rest)) && near) { e.jumped = true; e.state = 'warn'; e.t = 0; }
  } else if (e.state === 'warn') {
    if (e.t >= k.warn) { e.state = 'jump'; e.t = 0; e.vy = -k.jumpV; e.facing = towardPepe(g, e); g.events.push('dive'); }
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

// ── Jefe: El Enmascarado (spec §3.0f G) ─────────────────────────────────────────────
// Repertorio: dash (embestida) · leap (salto encima + ondas) · throw (máscaras) · fog (niebla, fase 2) ·
// summon (invitados, fase 2). Elige con un generador propio y determinista, sin repetir el anterior.
// Tras cada ataque hay una ventana vulnerable (un golpe). Fase 2: apagón antes de cada ataque.
export const MASK_VULNERABLE = new Set(['stun', 'landed', 'recover', 'clawRecover', 'summon']);

export function createMask(spawn, level) {
  const left = MASK.spot * TILE, right = (level.w - MASK.spot) * TILE - MASK.w;
  return {
    kind: 'mask', x: spawn.x - MASK.w / 2, y: spawn.y - MASK.h, w: MASK.w, h: MASK.h, vx: 0, vy: 0,
    hp: MASK.hp, phase: 1, state: 'idle', t: 0, facing: -1, spots: [left, right],
    hurtT: 0, alive: true, deadT: 0, unmasked: false, seed: 20170728, last: null, attacks: [], hitThisWindow: false,
  };
}

// Generador pseudoaleatorio (mulberry32): mismo combate → mismos ataques.
function rng(b) {
  b.seed = (b.seed + 0x6d2b79f5) | 0;
  let t = b.seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const midX = (o) => o.x + o.w / 2;
function enter(b, state) { b.state = state; b.t = 0; b.vx = 0; if (MASK_VULNERABLE.has(state)) b.hitThisWindow = false; }

function choose(g, b) {
  const opts = ['dash', 'leap', 'throw'];
  if (b.phase === 2) { opts.push('fog'); if (!g.enemies.some((e) => e.alive && e.summoned)) opts.push('summon'); }
  const pool = opts.filter((a) => a !== b.last);
  const a = pool[Math.floor(rng(b) * pool.length)];
  b.last = a; b.attacks.push(a);
  const pc = midX(g.player);
  b.facing = Math.sign(pc - midX(b)) || b.facing;
  if (a === 'dash') {
    // Aparece en el muelle más alejado de Pepe (solo los ojos) y embiste.
    const [l, r] = b.spots;
    b.x = Math.abs(pc - l) > Math.abs(pc - r) ? l : r;
    enter(b, 'lurk');
  } else if (a === 'leap') enter(b, 'crouch');
  else if (a === 'throw') enter(b, 'aim');
  else if (a === 'fog') {
    // Desaparece en la niebla y sus ojos aparecen ya detrás de Pepe (aviso de 0,6 s para apartarse).
    const p = g.player, behind = pc - p.facing * 40 - b.w / 2;
    b.x = Math.max(TILE + 2, Math.min((g.level.w - 1) * TILE - b.w - 2, behind));
    enter(b, 'fade');
  }
  else enter(b, 'summon');
}

// Después de cada ataque (o de un golpe): en la fase 2, apagón; en la 1, un respiro caminando.
function next(b) { enter(b, b.phase === 2 ? 'blackout' : 'idle'); }

export function hitMask(g, b, force = false) {
  if (!b.alive || b.hurtT > 0) return false;
  if (!force && (!MASK_VULNERABLE.has(b.state) || b.hitThisWindow)) { g.events.push('clank'); return false; }
  b.hp--; b.hurtT = MASK.hurtT; b.hitThisWindow = true;
  g.events.push('bosshit');
  g.score += 500;
  g.hitstop = 6; g.shake = Math.max(g.shake, 0.3);
  g.floats.push({ x: midX(b), y: b.y, text: '+500', t: 0.9 });
  if (b.hp <= MASK.phase2) b.phase = 2;
  if (b.hp <= 0) {
    b.alive = false; b.state = 'dead'; b.unmasked = true;
    g.blackout = false; g.shots = [];
    g.score += 5000;
    g.events.push('bossdown');
    g.floats.push({ x: midX(b), y: b.y - 10, text: 'SOLO ERA UNA MÁSCARA', t: 2.4 });
    // La máscara cae hacia Pepe, y nunca dentro de una pared (se recoloca hacia el centro del muelle).
    const side = midX(g.player) < midX(b) ? -1 : 1;
    const y = b.y + b.h - 14, mid = (g.level.w * TILE) / 2;
    g.disco = { kind: 'mascara', x: freeX(g.level, midX(b) + side * 30, y, mid), y, taken: false };
    return true;
  }
  if (!force) next(b);
  return true;
}

const overlap = (a, c) => a.x < c.x + c.w && a.x + a.w > c.x && a.y < c.y + c.h && a.y + a.h > c.y;

function spawnGuests(g, b) {
  const y = b.y + b.h;
  const [l, r] = b.spots;
  for (const [kind, x] of [['charro', l + b.w / 2], ['gigante', r + b.w / 2]]) {
    const e = createEnemy({ x, y, kind }, g.enemies.length, HEADLINES);
    e.summoned = true;
    g.enemies.push(e);
  }
  g.events.push('bossland');
}

function stepShots(g) {
  const p = g.player, tip = g.mic.phase === 'out' ? micTipOf(g) : null;
  for (const s of g.shots) {
    s.x += s.vx * DT; s.y += s.vy * DT; s.life -= DT;
    const solid = g.level.tileAt(Math.floor((s.x + s.w / 2) / TILE), Math.floor((s.y + s.h / 2) / TILE)) === '#';
    if (solid) s.life = 0;
    // Las máscaras se rompen con el micrófono.
    if (s.kind === 'mask' && tip && Math.abs(tip.x - (s.x + s.w / 2)) < 9 && Math.abs(tip.y - (s.y + s.h / 2)) < 9) {
      s.life = 0; g.score += 50; g.floats.push({ x: s.x, y: s.y, text: '+50', t: 0.6 }); g.events.push('defeat');
    }
    if (s.life > 0 && overlap(p, s) && g.invuln <= 0) { s.life = 0; g.hurtFrom = s.x; g.pendingHurt = true; }
  }
  g.shots = g.shots.filter((s) => s.life > 0);
}
let micTipOf = () => null;
export function setMicTip(fn) { micTipOf = fn; }

export function stepMask(g, b, hurt, prevBottom) {
  g.blackout = false;
  if (!b.alive) { b.deadT += DT; return; }
  b.t += DT;
  b.hurtT = Math.max(0, b.hurtT - DT);
  const p = g.player, pc = midX(p), bc = midX(b);
  const wasAir = !b.onGround;
  b.vy = Math.min(600, b.vy + 1400 * DT);
  const moving = b.state === 'dash' || b.state === 'redash' || b.state === 'leap' || b.state === 'idle';
  const r = moveBody(g.level, b, (moving ? b.vx : 0) * DT, b.vy * DT);
  if (r.ground) b.vy = 0;
  b.onGround = r.ground;

  switch (b.state) {
    case 'idle':
      b.facing = Math.sign(pc - bc) || b.facing;
      b.vx = Math.abs(pc - bc) > 50 ? b.facing * MASK.walk : 0;
      if (b.t >= MASK.idle) choose(g, b);
      break;
    case 'blackout':
      g.blackout = true;
      if (b.t >= MASK.blackout) choose(g, b);
      break;
    case 'lurk':
      b.facing = Math.sign(pc - bc) || b.facing;
      if (b.t >= (b.phase === 2 ? MASK.lurk2 : MASK.lurk)) { b.state = 'dash'; b.t = 0; b.vx = b.facing * (b.phase === 2 ? MASK.dash2 : MASK.dash); g.events.push('dash'); }
      break;
    case 'dash': case 'redash':
      if (r.hitX && b.state === 'dash' && b.phase === 2) {
        // Doble embestida: rebota en la pared y vuelve sin pararse.
        b.state = 'redash'; b.t = 0; b.facing = -b.facing; b.vx = b.facing * MASK.dash2;
        g.shake = Math.max(g.shake, 0.2); g.events.push('dash');
      } else if (r.hitX) { enter(b, 'stun'); g.shake = Math.max(g.shake, 0.25); g.events.push('bossland'); }
      else if (b.t >= MASK.dashMax) next(b);
      break;
    case 'crouch':
      b.facing = Math.sign(pc - bc) || b.facing;
      if (b.t >= MASK.crouch) {
        // Salto en arco hasta donde está Pepe ahora.
        const vy = -Math.sqrt(2 * 1400 * MASK.leapH), air = (2 * -vy) / 1400;
        b.state = 'leap'; b.t = 0; b.vy = vy; b.vx = (pc - bc) / air; b.onGround = false;
        g.events.push('dive');
      }
      break;
    case 'leap':
      if (wasAir && r.ground && b.t > 0.1) {
        enter(b, 'landed');
        const y = b.y + b.h - 10;
        for (const dir of [-1, 1]) g.shots.push({ kind: 'wave', x: bc - 5 + dir * 14, y, w: 10, h: 10, vx: dir * MASK.wave, vy: 0, life: MASK.waveLife });
        g.shake = Math.max(g.shake, 0.3); g.events.push('bossland');
      }
      break;
    case 'aim':
      b.facing = Math.sign(pc - bc) || b.facing;
      if (b.t >= MASK.aim) {
        const ox = bc + b.facing * 12, oy = b.y + 16;
        const base = Math.atan2(p.y + p.h / 2 - oy, pc - ox);
        for (const da of [-0.28, 0, 0.28]) {
          const a = base + da;
          g.shots.push({ kind: 'mask', x: ox - 5, y: oy - 3, w: 10, h: 6, vx: Math.cos(a) * MASK.maskSpeed, vy: Math.sin(a) * MASK.maskSpeed, life: 3 });
        }
        g.events.push('mic');
        enter(b, 'recover');
      }
      break;
    case 'fade':
      // En la niebla: al terminar el aviso, zarpazo hacia donde esté Pepe.
      if (b.t >= MASK.fade) {
        b.facing = Math.sign(pc - midX(b)) || b.facing;
        b.state = 'claw'; b.t = 0; g.events.push('dash');
      }
      break;
    case 'claw': {
      const reach = { x: b.facing > 0 ? b.x + b.w : b.x - MASK.clawReach, y: b.y + 8, w: MASK.clawReach, h: b.h - 12 };
      if (overlap(p, reach)) hurt(g, midX(b));
      if (b.t >= MASK.claw) enter(b, 'clawRecover');
      break;
    }
    case 'summon':
      if (!b.summoned && b.t >= 0.5) { b.summoned = true; spawnGuests(g, b); }
      if (b.t >= MASK.summon) { b.summoned = false; next(b); }
      break;
    default:
      if (MASK_VULNERABLE.has(b.state)) {
        const dur = { stun: MASK.stun, landed: MASK.landed, recover: MASK.recover, clawRecover: MASK.clawRecover }[b.state];
        if (b.t >= dur) next(b);
      }
  }

  stepShots(g);
  if (g.pendingHurt) { g.pendingHurt = false; hurt(g, g.hurtFrom); }

  // Cuerpo a cuerpo: en las ventanas, pisarlo le daña; embistiendo, cayendo encima o caminando, te daña.
  const harmful = b.state === 'dash' || b.state === 'redash' || b.state === 'leap' || b.state === 'idle';
  if ((harmful || MASK_VULNERABLE.has(b.state)) && overlap(p, b)) {
    if (p.vy > 0 && prevBottom <= b.y + 8) { p.vy = -300; p.jumping = false; hitMask(g, b); }
    else if (harmful) hurt(g, bc);
  }
}
