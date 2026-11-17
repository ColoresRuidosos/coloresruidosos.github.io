// v11 · Minijuego «Tiro de frases» (spec §3.0f Q v11): galería de tiro de feria, diseño propio.
// Frases de la nostalgia cruzan en 3 carriles: dispárales; a los títulos de Alba, no. Lógica pura, sin dibujo.
import { DT, TIRO as K } from './constants.js';
import { TIRO_MALAS, TIRO_BUENAS } from '../data/alba-story.js';

export const LANES = [62, 104, 146];   // borde de arriba de cada carril (px de pantalla)
const W = 320;

export function createTiro(seed = 11) {
  return { status: 'intro', t: 0, introT: 0, lane: 1, cross: { x: W / 2, y: LANES[1] }, frases: [], spawnT: 0.3, spawned: 0,
    malas: 0, buenas: 0, seed, prev: { jump: false, mic: false }, shots: [] };
}

// mulberry32: determinista y bien repartido (el LCG simple repetía carriles).
function rng(T) {
  T.seed = (T.seed + 0x6D2B79F5) | 0;
  let r = Math.imul(T.seed ^ (T.seed >>> 15), 1 | T.seed);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
  return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
}

// Cada carril va en un solo sentido y a una sola velocidad (así no se alcanzan); solo entra una frase si hay hueco.
const LANE_DIR = [1, -1, 1], LANE_SPEED = [0.35, 1, 0.65];
const GAP = 24;
function spawn(T) {
  const mala = rng(T) >= K.goodRatio, list = mala ? TIRO_MALAS : TIRO_BUENAS;
  const text = list[Math.floor(rng(T) * list.length)], w = text.length * 6 + 8;
  const start = Math.floor(rng(T) * 3);
  for (let k = 0; k < 3; k++) {
    const lane = (start + k) % 3, dir = LANE_DIR[lane], x = dir > 0 ? -w : W;
    const free = T.frases.every((f) => f.y !== LANES[lane] || (dir > 0 ? f.x - GAP >= 0 : f.x + f.w + GAP <= W));
    if (!free) continue;
    const speed = K.speedMin + LANE_SPEED[lane] * (K.speedMax - K.speedMin);
    T.frases.push({ text, mala, w, h: 13, y: LANES[lane], x, vx: dir * speed });
    T.spawned++;
    return;
  }
}

function shoot(T, x, y, ev) {
  T.shots.push({ x, y, t: 0.25 });
  const f = T.frases.find((q) => x >= q.x - K.pad && x <= q.x + q.w + K.pad && y >= q.y - K.pad && y <= q.y + q.h + K.pad);
  if (!f) { ev.push('tiro:fallo'); return; }
  T.frases.splice(T.frases.indexOf(f), 1);
  if (f.mala) { T.malas++; ev.push('tiro:mala'); } else { T.buenas++; ev.push('tiro:buena'); }
}

// inp: { left, right, jump, mic } (botones mantenidos) y tap: { x, y } | null (toque o clic en la pantalla).
// Devuelve los eventos de este paso.
export function stepTiro(T, inp) {
  const ev = [];
  const jumpP = inp.jump && !T.prev.jump, micP = inp.mic && !T.prev.mic;
  T.prev = { jump: !!inp.jump, mic: !!inp.mic };
  for (const s of T.shots) s.t -= DT;
  T.shots = T.shots.filter((s) => s.t > 0);
  if (T.status === 'intro') { if ((T.introT += DT) >= K.intro) T.status = 'play'; return ev; }
  if (T.status !== 'play') return ev;
  T.t += DT;

  // Mira
  if (inp.left) T.cross.x -= K.crossSpeed * DT;
  if (inp.right) T.cross.x += K.crossSpeed * DT;
  T.cross.x = Math.max(0, Math.min(W, T.cross.x));
  if (jumpP) { T.lane = (T.lane + 1) % 3; T.cross.y = LANES[T.lane]; }

  // Frases
  if ((T.spawnT -= DT) <= 0) { spawn(T); T.spawnT = K.spawnEvery; }
  for (const f of T.frases) f.x += f.vx * DT;
  T.frases = T.frases.filter((f) => f.x + f.w > -2 && f.x < W + 2);

  // Disparos
  if (micP) shoot(T, T.cross.x, T.cross.y + 6, ev);
  if (inp.tap) { T.cross.x = inp.tap.x; shoot(T, inp.tap.x, inp.tap.y, ev); }

  if (T.malas >= K.goal) { T.status = 'won'; ev.push('tiro:gana'); }
  else if (T.buenas >= K.maxGood || T.t >= K.dur) { T.status = 'lost'; ev.push('tiro:pierde'); }
  return ev;
}
