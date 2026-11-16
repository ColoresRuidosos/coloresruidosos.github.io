// v10 · Mundo 3 «Alba»: paseo al amanecer, sin daño (spec §3.0f Q). Lógica pura, sin dibujo.
// La nostalgia te arrastra si te quedas quieto, los recuerdos te regresan unos pasos, la Maldita Rueda te lleva,
// la luz del alba enciende plataformas y los atriles guardan los pasajes del disco.
import { TILE, DT, ALBA as K } from './constants.js';

const VARIANTES = ['rosa', 'antifaz', 'flash', 'noria'];

export function createAlba(level, opts = {}) {
  return {
    start: opts.start ?? 0,
    still: 0, drag: false, sitting: false, sitT: 0, sepia: 0, luzT: 0, dawnX: level.player?.x ?? 0,
    recuerdos: level.recuerdos.map((r, i) => ({ x: r.x - 9, y: r.y - 10, w: 18, h: 20, vari: VARIANTES[i % 4], alive: true, fade: 0 })),
    wheels: level.wheels.map((c) => ({ cx: c.x, cy: c.y, r: K.wheelR, n: K.cabins, angle: 0, dir: 1 })),
    pasajes: level.pasajes.map((p, i) => ({ ...p, idx: (opts.start ?? 0) + i, read: false })),
    leidos: [], pasaje: null, ride: null, bancas: level.bancas,
  };
}

// Superficie de cada cabina: centro x y borde de arriba (las cabinas cuelgan del aro).
export function cabinTops(w) {
  const out = [];
  for (let k = 0; k < w.n; k++) {
    const a = w.angle + (k * 2 * Math.PI) / w.n;
    out.push({ x: w.cx + w.r * Math.cos(a), y: w.cy + w.r * Math.sin(a) + 6 });
  }
  return out;
}

const solidOrSemi = (c) => c === '#' || c === '=';

// Enciende o apaga las plataformas de luz en la rejilla ('=' semisólida si hay luz, '.' si no).
function setLights(g, A) {
  const L = g.level;
  for (const { tx, ty } of L.lights) {
    const lit = A.luzT > 0 || tx * TILE + TILE < A.dawnX;
    const c = lit ? '=' : '.';
    if (L.grid[ty][tx] !== c) L.grid[ty] = L.grid[ty].slice(0, tx) + c + L.grid[ty].slice(tx + 1);
  }
}

// Un paso de 1/60 s. `input`: botones de este paso; `prevBottom`: pies antes del movimiento; `micTip`: punta del micro.
export function stepAlba(g, input, prevBottom, micTip) {
  const A = g.alba, p = g.player, L = g.level;
  A.luzT = Math.max(0, A.luzT - DT);
  A.sepia = Math.max(0, A.sepia - DT);
  A.dawnX = Math.max(A.dawnX, g.checkpoint.x);
  if (A.pasaje && (A.pasaje.t -= DT) <= 0) A.pasaje = null;
  setLights(g, A);

  // ── La Maldita Rueda: cabinas que giran; si estás encima, te llevan ──
  const prevTops = A.wheels.map(cabinTops);
  for (const w of A.wheels) w.angle += K.wheelSpeed * w.dir * DT;
  let ride = null;
  A.wheels.forEach((w, wi) => {
    cabinTops(w).forEach((t, k) => {
      const t0 = prevTops[wi][k], pc = p.x + p.w / 2;
      if (Math.abs(pc - t.x) > K.cabinW / 2 + p.w / 2 - 2) return;
      const riding = A.ride && A.ride.w === wi && A.ride.k === k;
      const feet = p.y + p.h;
      if (riding && p.vy >= 0 && Math.abs(feet - t0.y) < 6) {
        p.x += t.x - t0.x; p.y = t.y - p.h; ride = { w: wi, k };
      } else if (p.vy >= 0 && prevBottom <= t0.y + 2 && feet >= t.y - 1) {
        p.y = t.y - p.h; ride = { w: wi, k };
      }
    });
  });
  A.ride = ride;
  if (ride) { p.vy = 0; p.onGround = true; p.jumping = false; }

  // ── La nostalgia: quieto más de 3 s, te arrastra hacia atrás (no en una banca, ni más allá del checkpoint, ni a un foso) ──
  const moving = input.left || input.right || input.jump;
  A.still = moving ? 0 : A.still + DT;
  const banca = A.bancas.find((b) => Math.abs(b.x - (p.x + p.w / 2)) < 20 && Math.abs(b.y - (p.y + p.h)) < 4);
  if (banca && p.onGround && A.still >= K.sitT) { if (!A.sitting) g.events.push('sit'); A.sitting = true; }
  if (moving || !banca) A.sitting = false;
  A.drag = false;
  if (A.still > K.still && !A.sitting && p.onGround && !ride) {
    const dx = -K.drag * DT, nx = p.x + dx;
    const feetY = Math.floor((p.y + p.h + 1) / TILE);
    const groundBehind = solidOrSemi(L.tileAt(Math.floor(nx / TILE), feetY));
    if (nx + p.w / 2 >= g.checkpoint.x && groundBehind) { p.x = nx; A.drag = true; }
  }

  // ── Recuerdos: polaroids que te persiguen; al tocarte te regresan 48 px (sin daño); el micrófono los disuelve ──
  const pcx = p.x + p.w / 2, pcy = p.y + p.h / 2;
  for (const r of A.recuerdos) {
    if (!r.alive) { r.fade += DT; continue; }
    const rx = r.x + r.w / 2, ry = r.y + r.h / 2, d = Math.hypot(pcx - rx, pcy - ry) || 1;
    if (d < K.recuerdoSee) { r.x += ((pcx - rx) / d) * K.recuerdoSpeed * DT; r.y += ((pcy - ry) / d) * K.recuerdoSpeed * DT; }
    if (g.mic.phase === 'out') {
      const tip = micTip(g);
      if (tip.x >= r.x - 6 && tip.x <= r.x + r.w + 6 && tip.y >= r.y - 6 && tip.y <= r.y + r.h + 6) {
        r.alive = false; g.mic.phase = 'back'; g.events.push('disuelve'); continue;
      }
    }
    if (p.x < r.x + r.w && p.x + p.w > r.x && p.y < r.y + r.h && p.y + p.h > r.y) {
      r.alive = false;
      p.x = Math.max(g.checkpoint.x - p.w / 2, p.x - K.recuerdoPush);
      p.vx = 0;
      A.sepia = K.sepia;
      g.events.push('recuerdo');
    }
  }

  // ── Atriles: cada pasaje se lee una vez ──
  for (const s of A.pasajes) {
    if (s.read || Math.abs(s.x - (p.x + p.w / 2)) > 14 || Math.abs(s.y - (p.y + p.h)) > 24) continue;
    s.read = true; A.leidos.push(s.idx);
    A.pasaje = { idx: s.idx, t: K.pasajeT };
    g.events.push('pasaje');
  }
}
