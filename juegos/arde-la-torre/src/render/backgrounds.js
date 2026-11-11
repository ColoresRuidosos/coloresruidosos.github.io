// Fondos PROVISIONALES dibujados por código, uno por nivel (los finales saldrán de Gemini: art/PROMPTS-GEMINI.md §5).
// Dos capas: lejana (parallax 0,3) y escenario (1,0). Sin texto, sin logos y sin marcas reales (spec §6.1).
import { W, H, FLOOR_TOP } from '../sim/constants.js';
import { createRng } from '../sim/rng.js';

let makeCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
export function setBgCanvasFactory(fn) { makeCanvas = fn; }

const HORIZON = FLOOR_TOP - 12;   // donde la pared toca el suelo

function rect(ctx, c, x, y, w, h) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }

function floorTiles(ctx, width, base, line, step = 32, skew = 10) {
  rect(ctx, base, 0, HORIZON, width, H - HORIZON);
  ctx.strokeStyle = line; ctx.lineWidth = 1;
  for (let y = HORIZON + 6, k = 1; y < H; y += 6 + k * 2, k++) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(width, y + 0.5); ctx.stroke(); }
  for (let x = -40; x < width + 40; x += step) { ctx.beginPath(); ctx.moveTo(x + 0.5, HORIZON); ctx.lineTo(x - skew * 6 + 0.5, H); ctx.stroke(); }
}

function car(ctx, x, y, col, rng) {
  rect(ctx, '#0006', x + 2, y + 22, 70, 4);
  rect(ctx, col, x, y + 8, 72, 14);
  rect(ctx, col, x + 14, y, 40, 10);
  rect(ctx, '#9fc3d6', x + 18, y + 2, 15, 7); rect(ctx, '#9fc3d6', x + 36, y + 2, 15, 7);
  rect(ctx, '#0004', x, y + 16, 72, 2);
  rect(ctx, '#ffe38a', x + 68, y + 10, 4, 3); rect(ctx, '#d33', x, y + 10, 3, 3);
  for (const wx of [x + 10, x + 52]) { rect(ctx, '#111', wx, y + 18, 11, 8); rect(ctx, '#777', wx + 3, y + 21, 5, 3); }
  void rng;
}

function parking(level) {
  const width = level.width + W;
  const rng = createRng(11);
  const far = makeCanvas(Math.ceil(W + level.width * 0.3) + 4, H), fc = far.getContext('2d');
  rect(fc, '#1b1f24', 0, 0, far.width, H);
  for (let x = 0; x < far.width; x += 64) { rect(fc, '#232931', x, 20, 40, HORIZON - 20); rect(fc, '#2c333c', x, 20, 4, HORIZON - 20); }
  const near = makeCanvas(width, H), c = near.getContext('2d');
  // techo y pared
  rect(c, '#2b3038', 0, 0, width, 22);
  rect(c, '#3a4049', 0, 22, width, HORIZON - 22);
  rect(c, '#2f353d', 0, HORIZON - 30, width, 30);
  for (let x = 0; x < width; x += 8) rect(c, x % 16 ? '#d9b21f' : '#1b1b1b', x, HORIZON - 34, 8, 4);   // franja de seguridad
  // tubos y luces fluorescentes
  rect(c, '#555c66', 0, 8, width, 3);
  for (let x = 40; x < width; x += 140) { rect(c, '#e8fff0', x, 14, 46, 3); rect(c, '#bff5d8', x - 4, 17, 54, 1); c.fillStyle = 'rgba(190,255,220,0.06)'; c.beginPath(); c.moveTo(x - 10, 18); c.lineTo(x + 56, 18); c.lineTo(x + 110, HORIZON); c.lineTo(x - 64, HORIZON); c.fill(); }
  // columnas con símbolos (sin texto)
  for (let x = 90; x < width; x += 240) {
    rect(c, '#5b626d', x, 22, 26, HORIZON - 22 + 4); rect(c, '#6f7782', x, 22, 5, HORIZON - 18); rect(c, '#454b54', x + 21, 22, 5, HORIZON - 18);
    rect(c, '#d9b21f', x + 7, 52, 12, 12); rect(c, '#1b1b1b', x + 10, 55, 6, 6);
    for (let y = HORIZON - 30; y < HORIZON; y += 8) rect(c, (y / 8) % 2 ? '#d9b21f' : '#1b1b1b', x, y, 26, 4);
  }
  // coches aparcados al fondo
  const cols = ['#a3242c', '#2b4ea2', '#cfcfcf', '#2f6d3a', '#1b1b1f', '#d9822b'];
  for (let x = 150; x < width - 80; x += 150 + rng.int(0, 60)) car(c, x, HORIZON - 26, rng.pick(cols), rng);
  // suelo
  floorTiles(c, width, '#4a4f57', '#3f444b', 48, 6);
  for (let x = 0; x < width; x += 120) { rect(c, '#e6e6e6', x + 20, HORIZON + 10, 3, 30); }
  for (let i = 0; i < 30; i++) { c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(rng.int(0, width), rng.int(HORIZON + 20, H - 6), rng.int(6, 16), rng.int(2, 4), 0, 0, Math.PI * 2); c.fill(); }
  return { far, near, tint: null };
}

function vestibulo(level) {
  const width = level.width + W;
  const rng = createRng(12);
  const far = makeCanvas(Math.ceil(W + level.width * 0.3) + 4, H), fc = far.getContext('2d');
  // ciudad de noche tras las cristaleras
  const g = fc.createLinearGradient(0, 0, 0, HORIZON); g.addColorStop(0, '#0d1230'); g.addColorStop(1, '#3a2a55'); fc.fillStyle = g; fc.fillRect(0, 0, far.width, H);
  for (let x = 0; x < far.width; x += rng.int(18, 34)) {
    const h = rng.int(30, 90); rect(fc, '#141a2e', x, HORIZON - h, rng.int(14, 30), h);
    for (let wy = HORIZON - h + 4; wy < HORIZON - 4; wy += 6) for (let wx = x + 2; wx < x + 12; wx += 5) if (rng.chance(0.4)) rect(fc, '#ffd98a', wx, wy, 2, 2);
  }
  const near = makeCanvas(width, H), c = near.getContext('2d');
  // cristaleras con montantes (dejan ver la capa lejana)
  c.clearRect(0, 0, width, HORIZON);
  rect(c, '#cfcabd', 0, 0, width, 16); rect(c, '#b9b3a5', 0, 16, width, 3);
  for (let x = 0; x < width; x += 64) { rect(c, '#e8e3d6', x, 16, 6, HORIZON - 16); rect(c, '#a8a294', x + 5, 16, 1, HORIZON - 16); }
  rect(c, '#e8e3d6', 0, 60, width, 3);
  c.fillStyle = 'rgba(160,200,255,0.10)'; c.fillRect(0, 19, width, HORIZON - 19);
  // mostrador largo y tornos
  for (let x = 260; x < width; x += 520) { rect(c, '#5a3a24', x, HORIZON - 28, 150, 28); rect(c, '#e8e3d6', x - 4, HORIZON - 32, 158, 5); rect(c, '#3d2616', x, HORIZON - 10, 150, 10); rect(c, '#9fc3d6', x + 20, HORIZON - 44, 16, 11); }
  for (let x = 120; x < width; x += 380) for (let k = 0; k < 4; k++) { const tx = x + k * 22; rect(c, '#9aa3ad', tx, HORIZON - 22, 8, 22); rect(c, 'rgba(160,220,255,0.55)', tx + 8, HORIZON - 18, 12, 10); rect(c, '#3fdc7a', tx + 2, HORIZON - 20, 4, 2); }
  // escaleras mecánicas al fondo
  for (let x = 620; x < width; x += 900) { c.fillStyle = '#6b737d'; c.beginPath(); c.moveTo(x, HORIZON); c.lineTo(x + 30, HORIZON); c.lineTo(x + 110, 30); c.lineTo(x + 80, 30); c.fill(); c.strokeStyle = '#2a2e33'; for (let k = 0; k < 10; k++) { c.beginPath(); c.moveTo(x + 8 + k * 8, HORIZON - k * 9); c.lineTo(x + 26 + k * 8, HORIZON - k * 9); c.stroke(); } }
  // plantas
  for (let x = 40; x < width; x += 300) { rect(c, '#6b4a2a', x, HORIZON - 14, 14, 14); c.fillStyle = '#2f6d3a'; for (let k = 0; k < 6; k++) { c.beginPath(); c.ellipse(x + 7 + (k - 3) * 3, HORIZON - 22 - (k % 3) * 5, 4, 9, (k - 3) * 0.3, 0, Math.PI * 2); c.fill(); } }
  // mármol
  floorTiles(c, width, '#d8d2c4', '#bdb6a6', 40, 8);
  for (let i = 0; i < 80; i++) { c.strokeStyle = 'rgba(120,110,95,0.25)'; c.beginPath(); const x = rng.int(0, width), y = rng.int(HORIZON + 4, H); c.moveTo(x, y); c.lineTo(x + rng.int(-20, 20), y + rng.int(2, 8)); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(0, HORIZON + 4, width, 10);
  return { far, near, tint: null };
}

function ascensor() {
  const far = makeCanvas(W, H), fc = far.getContext('2d');
  rect(fc, '#0c0d12', 0, 0, W, H);
  const near = makeCanvas(W, H), c = near.getContext('2d');
  // paredes de acero cepillado
  const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#6d737c'); g.addColorStop(0.5, '#9aa1ab'); g.addColorStop(1, '#6d737c');
  c.fillStyle = g; c.fillRect(0, 0, W, HORIZON);
  for (let x = 0; x < W; x += 3) { c.fillStyle = x % 6 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'; c.fillRect(x, 0, 1, HORIZON); }
  rect(c, '#3a3e45', 0, 0, W, 12); for (let x = 20; x < W; x += 60) rect(c, '#fff6d8', x, 4, 30, 3);
  // puertas centrales
  rect(c, '#2a2d33', 140, 20, 104, HORIZON - 20); rect(c, '#b8bec7', 144, 24, 47, HORIZON - 24); rect(c, '#b8bec7', 193, 24, 47, HORIZON - 24); rect(c, '#2a2d33', 191, 24, 2, HORIZON - 24);
  // indicador de planta: solo flechas (sin números hasta verificar el dato, spec §1.1)
  rect(c, '#111', 172, 8, 40, 10); c.fillStyle = '#ff6a2a'; c.beginPath(); c.moveTo(186, 16); c.lineTo(192, 10); c.lineTo(198, 16); c.fill();
  // pasamanos y botonera
  rect(c, '#d8dde3', 0, HORIZON - 40, W, 3); rect(c, '#8a9098', 0, HORIZON - 37, W, 1);
  rect(c, '#2a2d33', 300, 40, 18, 40); for (let k = 0; k < 6; k++) rect(c, k === 2 ? '#ffd23f' : '#cfd3d8', 305, 44 + k * 6, 8, 4);
  floorTiles(c, W, '#3a3e45', '#2f3238', 24, 4);
  rect(c, '#2a2d33', 0, H - 4, W, 4);
  return { far, near, tint: null, elevator: true };
}

function oficinas(level) {
  const width = level.width + W;
  const rng = createRng(14);
  const far = makeCanvas(Math.ceil(W + level.width * 0.3) + 4, H), fc = far.getContext('2d');
  const g = fc.createLinearGradient(0, 0, 0, HORIZON); g.addColorStop(0, '#7fb2e0'); g.addColorStop(1, '#d9e6f2'); fc.fillStyle = g; fc.fillRect(0, 0, far.width, H);
  for (let x = 0; x < far.width; x += rng.int(22, 40)) { const h = rng.int(20, 70); rect(fc, '#9db0c4', x, HORIZON - h, rng.int(18, 34), h); }
  const near = makeCanvas(width, H), c = near.getContext('2d');
  c.clearRect(0, 0, width, HORIZON);
  rect(c, '#e9e7e1', 0, 0, width, 18); for (let x = 10; x < width; x += 50) rect(c, '#fffbe9', x, 6, 34, 4);
  for (let x = 0; x < width; x += 96) { rect(c, '#d6d3cb', x, 18, 8, HORIZON - 18); }
  rect(c, '#d6d3cb', 0, HORIZON - 30, width, 30);
  // mesas con monitores, impresoras, fuentes de agua y plantas
  for (let x = 30; x < width; x += 110) {
    const k = rng.int(0, 5);
    if (k < 3) { rect(c, '#efece4', x, HORIZON - 20, 70, 6); rect(c, '#a7a196', x + 4, HORIZON - 14, 4, 14); rect(c, '#a7a196', x + 62, HORIZON - 14, 4, 14); rect(c, '#1b1b1f', x + 12, HORIZON - 36, 22, 15); rect(c, '#3fa9ff', x + 14, HORIZON - 34, 18, 11); rect(c, '#1b1b1f', x + 40, HORIZON - 34, 20, 13); rect(c, '#9fc3d6', x + 42, HORIZON - 32, 16, 9); }
    else if (k === 3) { rect(c, '#cfcfcf', x, HORIZON - 30, 34, 30); rect(c, '#8a8f96', x + 2, HORIZON - 26, 30, 6); rect(c, '#fff', x + 6, HORIZON - 34, 22, 4); }
    else { rect(c, '#9fc3d6', x + 6, HORIZON - 44, 14, 16); rect(c, '#e6e6e6', x + 4, HORIZON - 28, 18, 28); rect(c, '#3fa9ff', x + 8, HORIZON - 20, 3, 3); }
  }
  floorTiles(c, width, '#8d8f98', '#7d7f88', 36, 6);
  for (let i = 0; i < 40; i++) rect(c, 'rgba(0,0,0,0.08)', rng.int(0, width), rng.int(HORIZON + 10, H - 4), rng.int(10, 30), 2);
  return { far, near, tint: null };
}

function azotea(level) {
  const width = level.width + W;
  const rng = createRng(15);
  const far = makeCanvas(Math.ceil(W + level.width * 0.3) + 4, H), fc = far.getContext('2d');
  const g = fc.createLinearGradient(0, 0, 0, HORIZON); g.addColorStop(0, '#07071a'); g.addColorStop(0.6, '#2a1240'); g.addColorStop(1, '#a23a3a'); fc.fillStyle = g; fc.fillRect(0, 0, far.width, H);
  for (let i = 0; i < 80; i++) rect(fc, '#ffffffaa', rng.int(0, far.width), rng.int(0, 60), 1, 1);
  // skyline de Madrid de noche, visto desde lo alto (siluetas genéricas)
  for (let x = 0; x < far.width; x += rng.int(10, 26)) {
    const h = rng.int(10, 46); rect(fc, '#120a1e', x, HORIZON - h, rng.int(10, 24), h + 12);
    for (let wy = HORIZON - h + 3; wy < HORIZON; wy += 4) for (let wx = x + 2; wx < x + 10; wx += 4) if (rng.chance(0.35)) rect(fc, '#ffcf6a', wx, wy, 1, 1);
  }
  for (const [x, h] of [[80, 70], [96, 66], [260, 60], [276, 62]]) rect(fc, '#160d24', x, HORIZON - h, 12, h);   // torres altas al fondo
  const near = makeCanvas(width, H), c = near.getContext('2d');
  c.clearRect(0, 0, width, HORIZON);
  // barandilla
  rect(c, '#55505e', 0, HORIZON - 22, width, 3); for (let x = 0; x < width; x += 12) rect(c, '#55505e', x, HORIZON - 22, 2, 22);
  // maquinaria y antenas
  for (let x = 60; x < width - 500; x += 260) { rect(c, '#6b6575', x, HORIZON - 40, 60, 40); rect(c, '#4a4552', x + 6, HORIZON - 34, 20, 20); c.strokeStyle = '#2a2632'; c.beginPath(); c.arc(x + 16, HORIZON - 24, 8, 0, Math.PI * 2); c.stroke(); rect(c, '#8a8494', x + 44, HORIZON - 70, 2, 30); }
  // escenario al final: estructura, focos, altavoces y pirotecnia de escenario
  const sx = width - 520;
  rect(c, '#1b1720', sx, HORIZON - 12, 520, 12);
  for (const tx of [sx + 20, sx + 480]) { rect(c, '#8a8a92', tx, 10, 6, HORIZON - 10); for (let y = 14; y < HORIZON; y += 10) { c.strokeStyle = '#8a8a92'; c.beginPath(); c.moveTo(tx, y); c.lineTo(tx + 6, y + 10); c.stroke(); } }
  rect(c, '#8a8a92', sx + 20, 10, 466, 6);
  const lights = ['#ff4d4d', '#ffd23f', '#3fa9ff', '#ff4d4d', '#3fdc7a', '#ffd23f'];
  for (let k = 0; k < 12; k++) { const lx = sx + 40 + k * 38; rect(c, '#222', lx, 16, 10, 8); c.fillStyle = `${lights[k % 6]}22`; c.beginPath(); c.moveTo(lx, 24); c.lineTo(lx + 10, 24); c.lineTo(lx + 40, HORIZON); c.lineTo(lx - 30, HORIZON); c.fill(); }
  for (const ax of [sx + 34, sx + 440]) { rect(c, '#111', ax, HORIZON - 60, 40, 48); for (let k = 0; k < 3; k++) { c.fillStyle = '#2a2a2a'; c.beginPath(); c.arc(ax + 20, HORIZON - 50 + k * 15, 6, 0, Math.PI * 2); c.fill(); } }
  for (const px of [sx + 90, sx + 400]) { rect(c, '#333', px, HORIZON - 16, 12, 6); }
  // suelo de la azotea
  floorTiles(c, width, '#3d3846', '#332f3b', 44, 6);
  return { far, near, tint: null, fireAt: [sx + 96, sx + 406] };
}

const BUILDERS = { parking, vestibulo, ascensor, oficinas, azotea };
const cache = new Map();
export function getBackground(level) {
  if (!cache.has(level.id)) cache.set(level.id, BUILDERS[level.id](level));
  return cache.get(level.id);
}
