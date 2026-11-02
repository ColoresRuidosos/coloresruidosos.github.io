// Mundo 2 «Noche» (spec §3.0f E): enemigos, jefe, farol y objetos dibujados por código en blanco y negro,
// hasta tener el arte de Gemini. Sin máscaras de hockey ni personajes de terror registrados: antifaz de fiesta propio.
import { W, H } from '../game/constants.js';
import { text } from './draw.js';
import { inLight, lightRadius } from '../game/noche.js';

const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
const INK = '#000000';

// Antifaz de fiesta (diseño propio): banda blanca con dos ojos y una pluma corta.
export function antifaz(g, cx, y, flip = false, s = 1) {
  const d = flip ? -1 : 1;
  R(g, INK, cx - 7 * s, y - 1, 14 * s, 6 * s);
  R(g, '#f2f2f2', cx - 6 * s, y, 12 * s, 4 * s);
  R(g, INK, cx - 4 * s, y + s, 3 * s, 2 * s); R(g, INK, cx + 1 * s, y + s, 3 * s, 2 * s);
  R(g, '#bdbdbd', cx + d * 6 * s, y - 4 * s, 2 * s, 5 * s);
}

// Máscara veneciana negra (la del Invitado; definida en PROMPTS-GEMINI §5): antifaz con borde claro y punta curva.
function veneciana(g, cx, y, flip) {
  const d = flip ? -1 : 1;
  R(g, '#9a9a9a', cx - 7, y - 1, 14, 6);
  R(g, INK, cx - 6, y, 12, 4);
  R(g, '#e6e6e6', cx - 4, y + 1, 3, 2); R(g, '#e6e6e6', cx + 1, y + 1, 3, 2);
  R(g, INK, cx - 1, y + 3, 2, 3); // pico de la nariz
  R(g, INK, cx + d * 6, y - 3, 2, 3); R(g, INK, cx + d * 7, y - 5, 2, 2);
}

function invitado(g, e, t) {
  const fx = Math.round(e.x + e.w / 2), top = Math.round(e.y), f = e.facing < 0;
  const step = e.alive ? Math.floor(t * (e.state === 'chase' ? 12 : 6)) % 2 : 0;
  // Piernas, traje, camisa, cabeza.
  R(g, INK, fx - 6, top + 28, 5, 12 - step); R(g, INK, fx + 1, top + 28, 5, 12 - (1 - step));
  R(g, INK, fx - 8, top + 13, 16, 17); R(g, '#3a3a3a', fx - 7, top + 14, 14, 15); R(g, '#d6d6d6', fx - 2, top + 14, 4, 10);
  R(g, INK, fx - 6, top + 1, 12, 13); R(g, '#b8b8b8', fx - 5, top + 2, 10, 11);
  R(g, '#2a2a2a', fx - 6, top, 12, 3); // pelo
  if (!e.unmasked) veneciana(g, fx, top + 5, f);
  else {
    // Sin máscara: cara sorprendida (ojos muy abiertos y boca en «O»), y corre más.
    R(g, '#ffffff', fx - 4, top + 5, 3, 3); R(g, '#ffffff', fx + 1, top + 5, 3, 3);
    R(g, INK, fx - 3, top + 6, 1, 1); R(g, INK, fx + 2, top + 6, 1, 1);
    R(g, INK, fx - 1, top + 9, 3, 3); R(g, '#5a5a5a', fx, top + 10, 1, 1);
    R(g, INK, fx - 4, top + 3, 3, 1); R(g, INK, fx + 1, top + 3, 3, 1); // cejas arriba
  }
}

function murcielago(g, e, t) {
  const cx = Math.round(e.x + e.w / 2), cy = Math.round(e.y + e.h / 2);
  if (e.state === 'hang') {
    R(g, INK, cx - 1, e.y - 4, 2, 4); R(g, INK, cx - 4, cy - 5, 8, 11); R(g, '#3a3a3a', cx - 3, cy - 4, 6, 9);
    R(g, '#e6e6e6', cx - 2, cy + 2, 1, 1); R(g, '#e6e6e6', cx + 1, cy + 2, 1, 1);
    R(g, '#ffffff', cx - 2, cy - 2, 1, 2); R(g, '#ffffff', cx + 1, cy - 2, 1, 2); // colmillos (cabeza abajo)
    return;
  }
  const up = Math.floor(t * 14) % 2;
  R(g, INK, cx - 3, cy - 3, 6, 7); R(g, '#e6e6e6', cx - 2, cy - 1, 1, 1); R(g, '#e6e6e6', cx + 1, cy - 1, 1, 1);
  R(g, '#ffffff', cx - 2, cy + 2, 1, 2); R(g, '#ffffff', cx + 1, cy + 2, 1, 2); // colmillos
  R(g, INK, cx - 3, cy - 5, 2, 2); R(g, INK, cx + 1, cy - 5, 2, 2); // orejas
  for (const d of [-1, 1]) {
    for (let k = 0; k < 6; k++) R(g, INK, cx + d * (3 + k), cy - 2 + (up ? -k / 2 : k / 3), 1, 3);
  }
}

function fantasma(g, e, t) {
  const cx = Math.round(e.x + e.w / 2), top = Math.round(e.y), wob = Math.round(Math.sin(t * 5) * 1);
  g.save(); g.globalAlpha = 0.85;
  R(g, '#9a9a9a', cx - 9, top + 3, 18, 16); R(g, '#f2f2f2', cx - 8, top + 3, 16, 15); R(g, '#f2f2f2', cx - 6, top, 12, 4);
  for (let k = 0; k < 4; k++) R(g, '#f2f2f2', cx - 8 + k * 4, top + 18, 3, 3 + ((k + Math.floor(t * 6)) % 2) + wob);
  R(g, INK, cx - 4, top + 6, 3, 4); R(g, INK, cx + 2, top + 6, 3, 4); R(g, INK, cx - 1, top + 12, 3, 2);
  g.restore();
}

export function drawNocheEnemy(g, game, e, t) {
  if (!e.alive) {
    const life = 0.8;
    if (e.deadT > life) return;
    g.save(); g.globalAlpha = Math.max(0, Math.min(1, (life - e.deadT) * 2));
    g.translate(0, e.deadT * 30);
    ({ invitado, murcielago, fantasma })[e.kind](g, e, t);
    g.restore();
    return;
  }
  if (e.kind === 'fantasma' && !inLight(game, e.x + e.w / 2, e.y + e.h / 2)) return; // solo se ve con luz
  ({ invitado, murcielago, fantasma })[e.kind](g, e, t);
}

// ── Jefe: El Enmascarado del Lago ──
export function drawMaskBoss(g, game, art, t) {
  const b = game.boss, fx = Math.round(b.x + b.w / 2), drop = game.intro ? game.intro.drop : 0, top = Math.round(b.y - drop);
  if (!b.alive) {
    if (b.deadT > 3) return;
    // Se quita la máscara: debajo hay una persona normal que saluda (y se va desvaneciendo).
    g.save(); g.globalAlpha = Math.max(0, Math.min(1, 3 - b.deadT));
    figure(g, fx, top, b.facing < 0, t, false);
    if (b.deadT < 0.4) antifaz(g, fx, top + 8 + b.deadT * 20, b.facing < 0);
    R(g, INK, fx - 3, top + 9, 2, 2); R(g, INK, fx + 2, top + 9, 2, 2); R(g, INK, fx - 2, top + 13, 5, 1);
    g.restore();
    return;
  }
  if (b.state === 'lurk' || b.state === 'blackout') return; // solo sus ojos (drawMaskEyes)
  const shakeX = b.state === 'stun' ? Math.round(Math.sin(t * 30)) : 0;
  if (b.hurtT > 0 && Math.floor(t * 30) % 2) return;
  figure(g, fx + shakeX, top, b.facing < 0, t, b.state === 'dash');
  antifaz(g, fx + shakeX, top + 8, b.facing < 0, 1);
  if (b.state === 'stun') {
    for (let i = 0; i < 3; i++) {
      const a = t * 6 + (i * Math.PI * 2) / 3;
      R(g, '#ffffff', fx + Math.cos(a) * 12, top - 6 + Math.sin(a) * 3, 2, 2);
    }
    text(g, '¡AHORA!', fx, top - 18, { color: '#ffcf7a', align: 'center' });
  }
  if (b.state === 'dash') text(g, '¡SALTA!', fx, top - 14, { color: '#ffcf7a', align: 'center' });
}

// Figura alta con abrigo largo y sombrero de copa baja (diseño propio).
function figure(g, fx, top, flip, t, dash) {
  const lean = dash ? (flip ? -3 : 3) : 0;
  R(g, INK, fx - 11 + lean, top + 16, 22, 26); R(g, '#2a2a2a', fx - 10 + lean, top + 17, 20, 24);
  R(g, '#4a4a4a', fx - 1 + lean, top + 17, 2, 24);
  const step = dash ? Math.floor(t * 14) % 2 : 0;
  R(g, INK, fx - 7, top + 40, 5, 4 + step); R(g, INK, fx + 2, top + 40, 5, 4 + (1 - step));
  R(g, INK, fx - 7 + lean, top + 2, 14, 15); R(g, '#a8a8a8', fx - 6 + lean, top + 3, 12, 13);
  R(g, INK, fx - 9 + lean, top, 18, 3); R(g, INK, fx - 6 + lean, top - 6, 12, 6); R(g, '#3a3a3a', fx - 5 + lean, top - 5, 10, 1);
}

// Ojos del Enmascarado: se ven siempre, también a oscuras y en el apagón.
export function drawMaskEyes(g, game, t) {
  const b = game.boss;
  if (!b?.alive || game.intro || !(b.state === 'lurk' || b.state === 'blackout')) return;
  const fx = Math.round(b.x + b.w / 2), y = Math.round(b.y + 12);
  const on = b.state === 'blackout' || b.t > 0.15;
  if (!on) return;
  R(g, '#ffffff', fx - 4, y, 3, 2); R(g, '#ffffff', fx + 2, y, 3, 2);
  if (b.state === 'lurk' && b.t > 0.4) text(g, '!', fx, y - 14, { color: '#ffcf7a', align: 'center' });
}

// Oscuridad con el círculo de luz del farol (y, en el apagón, casi negro del todo).
let DARK = null;
export function drawDarkness(g, game, camX) {
  if (typeof document === 'undefined') return;
  DARK ??= Object.assign(document.createElement('canvas'), { width: W, height: H });
  const d = DARK.getContext('2d'), p = game.player;
  d.globalCompositeOperation = 'source-over';
  d.clearRect(0, 0, W, H);
  d.fillStyle = game.blackout ? 'rgba(0,0,0,0.97)' : 'rgba(0,0,0,0.9)';
  d.fillRect(0, 0, W, H);
  d.globalCompositeOperation = 'destination-out';
  const r = game.blackout ? Math.min(lightRadius(game), 44) : lightRadius(game);
  const cx = p.x + p.w / 2 - camX, cy = p.y + p.h / 2;
  const grad = d.createRadialGradient(cx, cy, r * 0.55, cx, cy, r);
  grad.addColorStop(0, 'rgba(0,0,0,1)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
  d.fillStyle = grad; d.beginPath(); d.arc(cx, cy, r, 0, Math.PI * 2); d.fill();
  g.drawImage(DARK, Math.round(camX), 0);
}

export function drawMascara(g, x, y) { antifaz(g, x, y - 3, false, 2); }

// Pieza del Mundo 2: pequeña luna plateada (en lugar del Carmesí).
export function drawLunaPiece(g, x, y, t, r = 6) {
  const w = Math.max(1, Math.round(Math.abs(Math.cos(t * 3)) * r));
  g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, w + 1, r + 1, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e6e6e6'; g.beginPath(); g.ellipse(x, y, w, r, 0, 0, Math.PI * 2); g.fill();
  if (w > 2) { g.fillStyle = '#7a7a7a'; g.beginPath(); g.arc(x + w / 3, y - 1, r * 0.6, 0, Math.PI * 2); g.fill(); }
}

// Lata de aceite para el farol.
export function drawAceite(g, it, t) {
  const x = Math.round(it.x), y = Math.round(it.y + Math.sin(t * 3 + it.x) * 2);
  R(g, INK, x - 5, y - 6, 10, 13); R(g, '#bdbdbd', x - 4, y - 5, 8, 11); R(g, '#7a7a7a', x - 4, y - 1, 8, 3);
  R(g, INK, x - 1, y - 9, 3, 3); R(g, '#ffe9a8', x - 2, y + 4, 4, 1);
}
