// v10.2 · Jefe «La Nostalgia» del Mundo 3 (spec §3.0f Q v10.2). Paseo: no hace daño y no se puede perder.
// Fase 1: lanza recuerdos (en sepia) de los jefes anteriores; se avanza tocando 3 rayos de sol.
// Fase 2: la Maldita Rueda se invierte cada 4 s; hay que subirla y bajar por la repisa alta.
// Fase 3: viento en contra; caminando 400 px sale el sol. Fase 4: se despide y ganas.
import { DT, ALBA } from './constants.js';
import { moveBody } from '../engine/tilemap.js';
import { hurt } from './game.js';
import { NOSTALGIA_LINES } from '../data/alba-story.js';

const B = ALBA.boss;
const KINDS = ['rayoBajo', 'rayoAlto', 'embestida', 'mascaras'];

export function createNostalgia(level, alba) {
  const n = level.nostalgia;
  const wi = alba.wheels.findIndex((w) => w.cx > n.x);
  const w = alba.wheels[wi];
  return {
    phase: 0, t: 0, x: n.x - B.chase.start, y: n.y - 40, ground: n.y, startX: n.x, pause: 0, dash: 0, dashWarn: 0, base: n.x, fade: 0, throws: 0,
    rays: B.rays.map((dx) => ({ x: n.x + dx, y: n.y - 20, taken: false })), raysTaken: 0,
    wheel: wi, ledgeX: w ? w.cx + w.r + 16 : Infinity,
    shots: [], throwT: 1.2, lastKind: null, seed: 7, line: null, warned: false, x3: 0, sepia: 0,
  };
}

function rng(b) { b.seed = (b.seed * 1103515245 + 12345) & 0x7fffffff; return b.seed / 0x7fffffff; }
function say(b, key) { b.line = { text: NOSTALGIA_LINES[key], t: B.lineT }; }

// v11.1: los recuerdos salen de la nube hacia delante (izquierda → derecha), más rápido que Pepe.
// La embestida es la propia nube: tiembla (aviso) y se lanza.
function throwMemory(b, g) {
  const options = KINDS.filter((k) => k !== b.lastKind);
  const kind = options[Math.floor(rng(b) * options.length)];
  b.lastKind = kind; b.throws++;
  const G = b.ground, x = b.x + 10, C = B.chase;
  if (kind === 'rayoBajo') b.shots.push({ kind, x, y: G - 12, w: 26, h: 8, vx: C.shotSpeed, vy: 0 });
  else if (kind === 'rayoAlto') b.shots.push({ kind, x, y: G - 52, w: 26, h: 8, vx: C.shotSpeed, vy: 0 });
  else if (kind === 'embestida') { b.dashWarn = C.dashWarn; g.events.push('rebobina'); return; }
  else for (const vy of [-30, 0, 30]) b.shots.push({ kind, x, y: G - 60, w: 10, h: 8, vx: C.maskSpeed, vy });
  g.events.push('memoria');
}

// Movimiento de la nube: persigue a Pepe de izquierda a derecha, más rápido cuanto más ha avanzado.
function chase(b, g) {
  const p = g.player, C = B.chase, pc = p.x + p.w / 2;
  // Flota a la altura de Pepe; en la fase 2 no sube a la noria (se queda abajo, esperando).
  const high = b.phase === 2 && (g.alba.ride || p.y + p.h < b.ground - 40);
  const ty = high ? b.ground - 24 : p.y + p.h / 2;
  b.y += (ty - b.y) * Math.min(1, DT * 3);
  if (b.phase === 4) return;
  if (b.pause > 0) { b.pause -= DT; return; }
  if (b.dashWarn > 0) { b.dashWarn -= DT; if (b.dashWarn <= 0) b.dash = C.dashT; return; }
  const progress = Math.max(0, pc - b.base);
  const cap = b.phase === 3 ? C.maxWind : C.max;
  const v = b.dash > 0 ? C.dashSpeed : Math.min(cap, C.base + C.perPx * progress);
  if (b.dash > 0) b.dash -= DT;
  b.x += v * DT;
  if (pc - b.x > C.leash) b.x = pc - C.leash;
  b.x = Math.min(b.x, pc - (high ? 48 : 0));   // persigue, nunca te rebasa (bajo la noria, espera a un lado)
  // ¿Te alcanzó?
  const nx = Math.max(p.x, Math.min(b.x, p.x + p.w)), ny = Math.max(p.y, Math.min(b.y, p.y + p.h));
  if (!high && Math.hypot(nx - b.x, ny - b.y) < C.radius && g.status === 'play') {
    g.events.push('alcanza');
    g.alba.sepia = ALBA.sepia;
    hurt(g, b.x - 40);
    b.x = pc - C.recoil; b.pause = C.pause; b.dash = 0;
  }
}

export function stepNostalgia(g) {
  const b = g.alba.boss, p = g.player, L = g.level;
  const pc = p.x + p.w / 2, feet = p.y + p.h;
  b.t += DT;
  if (b.line && (b.line.t -= DT) <= 0) b.line = null;
  const w = g.alba.wheels[b.wheel];
  if (b.phase === 0) {
    if (pc >= b.startX) { b.phase = 1; b.x = pc - B.chase.start; b.y = p.y + p.h / 2; say(b, 'aparece'); g.events.push('nostalgia'); }
    return;
  }
  chase(b, g);
  if (b.phase === 4) b.fade = Math.min(1, b.fade + DT / B.bye);

  if (b.phase === 1) {
    if ((b.throwT -= DT) <= 0) { throwMemory(b, g); b.throwT = B.throwEvery; }
    for (const r of b.rays) {
      if (r.taken || Math.abs(r.x - pc) > 12 || Math.abs(r.y - (p.y + p.h / 2)) > 30) continue;
      r.taken = true; b.raysTaken++; g.events.push('rayo');
      b.x -= B.chase.rayPush; b.dash = 0; b.dashWarn = 0;   // la luz empuja la nube hacia atrás
      if (b.raysTaken >= b.rays.length) { b.phase = 2; b.t = 0; b.shots = []; b.base = pc; say(b, 'fase2'); g.events.push('fase'); }
    }
  }

  // Recuerdos en vuelo: si te tocan, quitan 1 corazón (v11).
  for (const s of b.shots) {
    s.x += s.vx * DT; s.y += s.vy * DT;
    if (s.x > pc + 360 || s.x + s.w < pc - 360 || s.y > b.ground + 20) { s.done = true; continue; }
    if (p.x < s.x + s.w && p.x + p.w > s.x && p.y < s.y + s.h && p.y + p.h > s.y) {
      s.done = true;
      g.alba.sepia = ALBA.sepia;
      g.events.push('recuerdo');
      hurt(g, s.x + s.w / 2);
    }
  }
  b.shots = b.shots.filter((s) => !s.done);

  if (b.phase === 2) {
    // Ciclo: 4 s girando hacia delante, aviso 0,6 s antes, 2 s al revés.
    const cyc = b.t % (B.reverseEvery + B.reverseFor);
    if (w) w.dir = cyc < B.reverseEvery ? 1 : -1;
    if (cyc >= B.reverseEvery - B.warn && cyc < B.reverseEvery) { if (!b.warned) { b.warned = true; g.events.push('rebobina'); } }
    else if (cyc < B.reverseEvery - B.warn) b.warned = false;
    if (pc > b.ledgeX && feet <= b.ground - 40 && p.onGround) {   // ya de pie en la repisa alta
      if (w) w.dir = 1;
      b.phase = 3; b.t = 0; b.x3 = pc; b.base = pc; say(b, 'fase3'); g.events.push('fase');
    }
    return;
  }

  if (b.phase === 3) {
    // Si el viento te tira de la repisa, vuelves a la fase 2: la noria sigue ahí para subir otra vez.
    if (p.onGround && feet > b.ground - 20) { b.phase = 2; b.t = 0; b.warned = false; b.base = pc; return; }
    moveBody(L, p, -B.wind * DT, 0);   // el viento sepia te empuja hacia atrás
    if (p.x + p.w / 2 - b.x3 >= B.walk) { b.phase = 4; b.t = 0; say(b, 'despedida'); g.events.push('despedida'); }
    return;
  }

  if (b.phase === 4 && b.t >= B.bye && g.status === 'play') { g.status = 'won'; g.events.push('won'); }
}
