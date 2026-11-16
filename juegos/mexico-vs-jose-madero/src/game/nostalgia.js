// v10.2 · Jefe «La Nostalgia» del Mundo 3 (spec §3.0f Q v10.2). Paseo: no hace daño y no se puede perder.
// Fase 1: lanza recuerdos (en sepia) de los jefes anteriores; se avanza tocando 3 rayos de sol.
// Fase 2: la Maldita Rueda se invierte cada 4 s; hay que subirla y bajar por la repisa alta.
// Fase 3: viento en contra; caminando 400 px sale el sol. Fase 4: se despide y ganas.
import { DT, ALBA } from './constants.js';
import { moveBody } from '../engine/tilemap.js';
import { NOSTALGIA_LINES } from '../data/alba-story.js';

const B = ALBA.boss;
const KINDS = ['rayoBajo', 'rayoAlto', 'embestida', 'mascaras'];

export function createNostalgia(level, alba) {
  const n = level.nostalgia;
  const wi = alba.wheels.findIndex((w) => w.cx > n.x);
  const w = alba.wheels[wi];
  return {
    phase: 0, t: 0, x: n.x + 200, y: n.y - 90, ground: n.y, startX: n.x,
    rays: B.rays.map((dx) => ({ x: n.x + dx, y: n.y - 20, taken: false })), raysTaken: 0,
    wheel: wi, ledgeX: w ? w.cx + w.r + 16 : Infinity,
    shots: [], throwT: 1.2, lastKind: null, seed: 7, line: null, warned: false, x3: 0, sepia: 0,
  };
}

function rng(b) { b.seed = (b.seed * 1103515245 + 12345) & 0x7fffffff; return b.seed / 0x7fffffff; }
function say(b, key) { b.line = { text: NOSTALGIA_LINES[key], t: B.lineT }; }

function throwMemory(b, g) {
  const options = KINDS.filter((k) => k !== b.lastKind);
  const kind = options[Math.floor(rng(b) * options.length)];
  b.lastKind = kind;
  const G = b.ground, x = b.x;
  if (kind === 'rayoBajo') b.shots.push({ kind, x, y: G - 12, w: 26, h: 8, vx: -B.beamSpeed, vy: 0 });
  else if (kind === 'rayoAlto') b.shots.push({ kind, x, y: G - 52, w: 26, h: 8, vx: -B.beamSpeed, vy: 0 });
  else if (kind === 'embestida') b.shots.push({ kind, x, y: G - 36, w: 22, h: 36, vx: -B.dashSpeed, vy: 0 });
  else for (const vy of [-30, 0, 30]) b.shots.push({ kind, x, y: G - 60, w: 10, h: 8, vx: -B.maskSpeed, vy });
  g.events.push('memoria');
}

export function stepNostalgia(g) {
  const b = g.alba.boss, p = g.player, L = g.level;
  const pc = p.x + p.w / 2, feet = p.y + p.h;
  b.t += DT;
  if (b.line && (b.line.t -= DT) <= 0) b.line = null;
  // Flota delante de Pepe (en la fase 2, junto a la noria).
  const w = g.alba.wheels[b.wheel];
  const tx = b.phase === 2 && w ? w.cx + w.r + 40 : pc + B.lead;
  b.x += (tx - b.x) * Math.min(1, DT * 2);
  b.y = b.ground - 90 + Math.sin(b.t * 2) * 4;

  if (b.phase === 0) {
    if (pc >= b.startX) { b.phase = 1; say(b, 'aparece'); g.events.push('nostalgia'); }
    return;
  }

  if (b.phase === 1) {
    if ((b.throwT -= DT) <= 0) { throwMemory(b, g); b.throwT = B.throwEvery; }
    for (const r of b.rays) {
      if (r.taken || Math.abs(r.x - pc) > 12 || Math.abs(r.y - (p.y + p.h / 2)) > 30) continue;
      r.taken = true; b.raysTaken++; g.events.push('rayo');
      if (b.raysTaken >= b.rays.length) { b.phase = 2; b.t = 0; b.shots = []; say(b, 'fase2'); g.events.push('fase'); }
    }
  }

  // Recuerdos en vuelo: si te tocan, retrocedes 48 px (nunca antes del inicio de la arena). Sin daño.
  for (const s of b.shots) {
    s.x += s.vx * DT; s.y += s.vy * DT;
    if (s.x + s.w < pc - 320 || s.y > b.ground + 20) { s.done = true; continue; }
    if (p.x < s.x + s.w && p.x + p.w > s.x && p.y < s.y + s.h && p.y + p.h > s.y) {
      s.done = true;
      p.x = Math.max(b.startX - p.w / 2, p.x - ALBA.recuerdoPush); p.vx = 0;
      g.alba.sepia = ALBA.sepia;
      g.events.push('recuerdo');
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
      b.phase = 3; b.t = 0; b.x3 = pc; say(b, 'fase3'); g.events.push('fase');
    }
    return;
  }

  if (b.phase === 3) {
    // Si el viento te tira de la repisa, vuelves a la fase 2: la noria sigue ahí para subir otra vez.
    if (p.onGround && feet > b.ground - 20) { b.phase = 2; b.t = 0; b.warned = false; return; }
    moveBody(L, p, -B.wind * DT, 0);   // el viento sepia te empuja hacia atrás
    if (p.x + p.w / 2 - b.x3 >= B.walk) { b.phase = 4; b.t = 0; say(b, 'despedida'); g.events.push('despedida'); }
    return;
  }

  if (b.phase === 4 && b.t >= B.bye && g.status === 'play') { g.status = 'won'; g.events.push('won'); }
}
