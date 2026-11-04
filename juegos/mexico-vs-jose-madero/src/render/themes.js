// Escenarios del Mundo 1 «Carmesí», dibujados por código (spec §3.0d): sin texto de terceros,
// paleta sacada de los conceptos rescatados (art/source/carmesi/). Cada tema da:
//   sky(ctx)  fondo fijo · far (parallax 0.2) · mid (parallax 0.5) · tiles (colores de bloques).
import { W, H } from '../game/constants.js';
import { text } from './draw.js';

const canvas = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
export const hash = (a, b) => {
  let h = (Math.imul(a | 0, 0x27d4eb2d) ^ Math.imul(b | 0, 0x165667b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  return ((h ^ (h >>> 13)) >>> 0) / 4294967296;
};
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

// Degradado por bandas con tramado 4×4 (aspecto 16 bits).
function bands(g, colors, y0, y1, w = W) {
  const n = colors.length - 1;
  for (let y = y0; y < y1; y++) {
    const t = ((y - y0) / (y1 - y0)) * n, i = Math.min(n - 1, Math.floor(t)), f = t - i;
    for (let x = 0; x < w; x++) {
      g.fillStyle = f > BAYER[y % 4][x % 4] / 16 ? colors[i + 1] : colors[i];
      g.fillRect(x, y, 1, 1);
    }
  }
}
const prerender = (w, h, fn) => { const c = canvas(w, h); fn(c.getContext('2d')); return c; };
const rect = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

// ── Elementos comunes ─────────────────────────────────────
function curtain(g, x, y, w, h, [dk, md, hi]) {
  for (let i = 0; i < w; i += 4) {
    const c = [dk, md, hi, md][(i / 4) % 4];
    const sag = Math.round(Math.sin((i / w) * Math.PI) * 3);
    rect(g, c, x + i, y, 4, h - sag);
  }
}
function lantern(g, x, y) {
  rect(g, '#1a0a10', x, y, 1, 6);
  rect(g, '#1a0a10', x - 3, y + 6, 7, 9);
  rect(g, '#ff6a3d', x - 2, y + 7, 5, 7);
  rect(g, '#ffc98a', x - 1, y + 8, 3, 3);
}
function papelPicado(g, x0, x1, y, colors) {
  for (let x = x0; x < x1; x++) rect(g, '#2a0d14', x, y + Math.round(Math.sin(((x - x0) / (x1 - x0)) * Math.PI) * 6), 1, 1);
  for (let x = x0 + 3, i = 0; x < x1 - 4; x += 9, i++) {
    const yy = y + Math.round(Math.sin(((x - x0) / (x1 - x0)) * Math.PI) * 6) + 1;
    rect(g, colors[i % colors.length], x, yy, 6, 7);
    rect(g, '#2a0d14', x + 2, yy + 2, 2, 2); rect(g, '#2a0d14', x + 1, yy + 6, 1, 1); rect(g, '#2a0d14', x + 4, yy + 6, 1, 1);
  }
}
function windows(g, x, y, w, h, seedA, lit = '#ffb36b', dark = '#2a0d14', p = 0.35) {
  for (let wy = y + 4; wy < y + h - 6; wy += 10) for (let wx = x + 3; wx < x + w - 5; wx += 8) {
    rect(g, hash(wx + seedA, wy) < p ? lit : dark, wx, wy, 4, 6);
  }
}

// ── 1-1 Calle Carmesí: noche, balcones, telones, papel picado y el Teatro al fondo ──
function calle() {
  const sky = prerender(W, H, (g) => {
    bands(g, ['#0f0618', '#1d0a24', '#341030', '#4d1530', '#6a1d2e'], 0, 170);
    rect(g, '#6a1d2e', 0, 170, W, H - 170);
    for (let i = 0; i < 40; i++) rect(g, '#d9b8c8', Math.floor(hash(i, 7) * W), Math.floor(hash(i, 8) * 90), 1, 1);
  });
  const far = prerender(640, H, (g) => {
    // Torres góticas, ciudad y la fachada del Teatro Carmesí (meta del mundo).
    for (let i = 0; i < 26; i++) {
      const x = Math.floor(hash(i, 1) * 640), w = 18 + Math.floor(hash(i, 2) * 30), h = 40 + Math.floor(hash(i, 3) * 60);
      rect(g, i % 2 ? '#240b1e' : '#2c0f24', x, 176 - h, w, h + 50);
      windows(g, x, 176 - h, w, h, i, '#c9584a', '#1c0816', 0.18);
    }
    for (const sx of [120, 470]) {
      rect(g, '#1f0a1a', sx, 70, 22, 110);
      for (let j = 0; j < 30; j++) rect(g, '#1f0a1a', sx + 11 - Math.floor(j / 3), 40 + j, Math.floor(j / 3) * 2 + 1, 1);
      rect(g, '#ff5a4f', sx + 9, 96, 4, 8);
    }
    // Teatro: frontón, arco, telón y marquesina.
    const tx = 290;
    rect(g, '#2a0e1c', tx, 80, 120, 100);
    for (let j = 0; j < 30; j++) rect(g, '#2a0e1c', tx + 60 - j * 2, 50 + j, j * 4, 1);
    rect(g, '#3a1424', tx + 30, 110, 60, 70);
    curtain(g, tx + 34, 114, 52, 40, ['#5c0a18', '#8e1426', '#c02a38']);
    rect(g, '#1a0710', tx + 40, 150, 40, 30);
    rect(g, '#ffcf7a', tx + 18, 98, 84, 13); rect(g, '#3a1424', tx + 19, 99, 82, 11);
    text(g, 'TEATRO CARMESÍ', tx + 60, 101, { color: '#ffcf7a', align: 'center', shadow: null });
    for (let k = 0; k < 14; k++) rect(g, k % 2 ? '#ffcf7a' : '#ff6a3d', tx + 20 + k * 6, 112, 2, 2);
  });
  const mid = prerender(256, H, (g) => {
    // Fachadas cercanas con balcones, telones rojos, faroles y papel picado.
    rect(g, '#3d1420', 0, 40, 96, 150);
    for (let y = 44; y < 190; y += 6) for (let x = (y / 6) % 2 ? 0 : 6; x < 96; x += 12) rect(g, '#47182a', x, y, 10, 5);
    for (const wy of [60, 112]) {
      rect(g, '#1c0810', 14, wy, 26, 30); curtain(g, 14, wy, 26, 22, ['#5c0a18', '#8e1426', '#c02a38']);
      rect(g, '#1c0810', 56, wy, 26, 30); rect(g, '#ff9a5a', 58, wy + 2, 22, 26);
      rect(g, '#14060c', 8, wy + 30, 80, 3);
      for (let x = 10; x < 88; x += 4) rect(g, '#14060c', x, wy + 33, 1, 8);
      rect(g, '#14060c', 8, wy + 40, 80, 2);
    }
    rect(g, '#8e1426', 30, 40, 8, 40); rect(g, '#c02a38', 31, 40, 3, 38);
    lantern(g, 100, 70); lantern(g, 228, 70);
    rect(g, '#1a0a10', 160, 40, 4, 150); // poste
    papelPicado(g, 100, 228, 50, ['#ff5a4f', '#c02a38', '#ffb36b', '#e8e0d0']);
  });
  return { sky, far, mid, tiles: { top: '#b0303a', topHi: '#e85a5a', body: '#4a1c26', bodyHi: '#5e2632', bodyDk: '#2a0d16', semi: '#8e2a30', semiHi: '#d85050' } };
}

// ── 1-2 Azoteas: atardecer, cerros, tinacos, antenas y cables ──
function azoteas() {
  const sky = prerender(W, H, (g) => {
    bands(g, ['#3a1838', '#7a2a44', '#c4453f', '#ec7a3c', '#f7b25a'], 0, 150);
    rect(g, '#f7b25a', 0, 150, W, H - 150);
    for (let dy = -14; dy <= 14; dy++) { const hw = Math.floor(Math.sqrt(196 - dy * dy)); rect(g, '#ffe39a', 230 - hw, 126 + dy, hw * 2, 1); }
  });
  const far = prerender(640, H, (g) => {
    // Cerros y ciudad a contraluz.
    for (let x = 0; x < 640; x++) {
      const h = 50 + Math.sin(x / 40) * 14 + Math.sin(x / 13) * 6 + (x > 300 && x < 380 ? Math.max(0, 30 - Math.abs(x - 340)) : 0);
      rect(g, '#6a2440', x, 170 - h, 1, h + 60);
    }
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(hash(i, 4) * 640), w = 14 + Math.floor(hash(i, 5) * 24), h = 24 + Math.floor(hash(i, 6) * 50);
      rect(g, '#3e1530', x, 184 - h, w, h + 40);
      windows(g, x, 184 - h, w, h, i * 3, '#ffcf7a', '#2c0c22', 0.3);
    }
  });
  const mid = prerender(256, H, (g) => {
    // Tinaco, antena, cartel de Colores Ruidosos y cables.
    rect(g, '#2a0c18', 20, 120, 4, 70); rect(g, '#2a0c18', 44, 120, 4, 70);
    rect(g, '#1c0810', 14, 86, 40, 36); rect(g, '#3a1420', 16, 88, 36, 32); rect(g, '#4e1c2a', 16, 88, 36, 4);
    rect(g, '#2a0c18', 120, 50, 2, 140); for (let y = 56; y < 120; y += 12) rect(g, '#2a0c18', 112, y, 18, 2);
    rect(g, '#2a0c18', 170, 60, 70, 36); rect(g, '#e8dcc8', 172, 62, 66, 32);
    text(g, 'COLORES', 205, 67, { color: '#c02a38', align: 'center', shadow: null });
    text(g, 'RUIDOSOS', 205, 78, { color: '#1c0810', align: 'center', shadow: null });
    rect(g, '#2a0c18', 186, 96, 3, 94); rect(g, '#2a0c18', 222, 96, 3, 94);
    for (let x = 0; x < 256; x++) {
      rect(g, '#1c0810', x, 40 + Math.round(Math.sin((x / 256) * Math.PI) * 14), 1, 1);
      rect(g, '#1c0810', x, 46 + Math.round(Math.sin((x / 256) * Math.PI) * 20), 1, 1);
    }
  });
  return { sky, far, mid, tiles: { top: '#8a3a2a', topHi: '#c46a42', body: '#5a2a26', bodyHi: '#6e3430', bodyDk: '#341618', semi: '#6a5048', semiHi: '#a88a70' } };
}

// ── 1-3 El Teatro: palcos dorados, telón y escenario ──
function teatro() {
  const sky = prerender(W, H, (g) => {
    bands(g, ['#12040a', '#240812', '#3a0c1a', '#4a1020'], 0, H);
  });
  const far = prerender(640, H, (g) => {
    // Palcos en tres pisos con barandas doradas y público en sombra.
    for (let fl = 0; fl < 3; fl++) {
      const y = 40 + fl * 42;
      rect(g, '#2c0a16', 0, y, 640, 34);
      for (let x = 0; x < 640; x += 40) {
        rect(g, '#1a050c', x + 4, y + 4, 32, 22);
        for (let k = 0; k < 3; k++) if (hash(x + k, fl) < 0.7) { rect(g, '#3c1020', x + 8 + k * 9, y + 14, 6, 12); rect(g, '#3c1020', x + 9 + k * 9, y + 10, 4, 4); }
        rect(g, '#c8963c', x, y + 26, 40, 3); rect(g, '#f0c870', x, y + 26, 40, 1);
        for (let k = 2; k < 40; k += 5) rect(g, '#a0742a', x + k, y + 29, 2, 5);
      }
    }
  });
  const mid = prerender(256, H, (g) => {
    // Telones laterales y columnas.
    curtain(g, 0, 0, 40, 190, ['#4a0612', '#7a0e1e', '#b0202e']);
    rect(g, '#3a0a14', 120, 20, 16, 170); rect(g, '#5a1420', 122, 20, 4, 170);
    rect(g, '#c8963c', 116, 20, 24, 6); rect(g, '#c8963c', 116, 180, 24, 6);
    curtain(g, 0, 0, 256, 14, ['#4a0612', '#7a0e1e', '#b0202e']);
    for (let x = 0; x < 256; x += 8) rect(g, '#f0c870', x + 2, 14, 4, 3);
  });
  return { sky, far, mid, tiles: { top: '#7a3a20', topHi: '#b86a3a', body: '#3a1a12', bodyHi: '#4c2418', bodyDk: '#22100a', semi: '#c8963c', semiHi: '#f0c870' }, chandelier: true };
}


// ── v7 · Mundo 2 «Noche»: todo en blanco y negro (spec §3.0f E) ──────────────
const NIGHT = ['#050505', '#0d0d0d', '#171717', '#222222', '#2e2e2e'];
function moon(g, x, y, r) {
  g.fillStyle = '#d9d9d9'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f2f2f2'; g.beginPath(); g.arc(x - 2, y - 2, r - 3, 0, Math.PI * 2); g.fill();
  rect(g, '#bdbdbd', x + 3, y - 4, 3, 3); rect(g, '#c8c8c8', x - 6, y + 3, 4, 2);
}
function stars(g, w, h, seed) { for (let i = 0; i < 70; i++) rect(g, hash(i, seed) < 0.2 ? '#ffffff' : '#8a8a8a', Math.floor(hash(i, seed + 1) * w), Math.floor(hash(i, seed + 2) * h), 1, 1); }
function pine(g, x, base, h, c) { for (let k = 0; k < h; k += 3) { const w = Math.round((k / h) * 14) + 2; rect(g, c, x - w / 2, base - h + k, w, 3); } rect(g, c, x - 1, base, 3, 6); }
function cabin(g, x, y, w, h, c, lit) {
  rect(g, c, x, y, w, h);
  for (let k = 0; k < w / 2 + 4; k += 2) rect(g, c, x - 4 + k, y - k / 2, w + 8 - 2 * k, 2);
  for (let k = 3; k < h; k += 4) rect(g, '#000000', x, y + k, w, 1);
  rect(g, lit ? '#e6e6e6' : '#3a3a3a', x + w / 2 - 4, y + h / 2 - 4, 8, 7);
  rect(g, '#000000', x + w / 2, y + h / 2 - 4, 1, 7);
}
function fog(g, y, w, seed) { for (let x = 0; x < w; x += 2) { const k = Math.round(Math.sin(x / 23 + seed) * 3 + Math.sin(x / 7) * 1); rect(g, '#3a3a3a', x, y + k, 2, 2); } }
const BW_TILES = { top: '#6e6e6e', topHi: '#b0b0b0', body: '#262626', bodyHi: '#3a3a3a', bodyDk: '#141414', semi: '#8c8c8c', semiHi: '#d0d0d0' };

// v8.3 · Noche: afuera del salón de fiestas y dentro de él, en blanco y negro (spec §3.0f I).
function bulbs(g, x0, x1, y, step = 6) { for (let x = x0; x < x1; x += step) { rect(g, '#2a2a2a', x - 1, y - 1, 4, 4); rect(g, '#f4f4f4', x, y, 2, 2); } }
function guestSilhouette(g, x, base, kind, c = '#0a0a0a') {
  // Invitados disfrazados haciendo fila: capa, sombrero de charro, velo, sombrero de copa (siluetas genéricas).
  rect(g, c, x - 4, base - 26, 9, 26); g.fillStyle = c; g.beginPath(); g.arc(x, base - 30, 5, 0, Math.PI * 2); g.fill();
  if (kind === 0) { g.beginPath(); g.moveTo(x - 4, base - 26); g.lineTo(x - 10, base); g.lineTo(x + 10, base); g.lineTo(x + 5, base - 26); g.fill(); } // capa
  if (kind === 1) { g.beginPath(); g.ellipse(x, base - 34, 11, 2.5, 0, 0, Math.PI * 2); g.fill(); rect(g, c, x - 4, base - 40, 9, 6); } // sombrero ancho
  if (kind === 2) { g.beginPath(); g.moveTo(x - 6, base - 34); g.lineTo(x + 6, base - 34); g.lineTo(x + 8, base - 8); g.lineTo(x - 8, base - 8); g.fill(); } // velo
  if (kind === 3) { rect(g, c, x - 5, base - 37, 11, 2); rect(g, c, x - 3, base - 44, 7, 7); } // sombrero de copa
}
function afuera() {
  const sky = prerender(W, H, (g) => { bands(g, NIGHT, 0, H); stars(g, W, 100, 3); moon(g, 48, 36, 13); });
  const far = prerender(640, H, (g) => {
    for (let x = 0; x < 640; x += 54) { const h = 50 + Math.floor(hash(x, 7) * 40); rect(g, '#121212', x, 176 - h, 50, h); windows(g, x + 4, 180 - h, 42, h - 8, x, '#9a9a9a', '#0a0a0a', 0.3); }
    // El salón de fiestas: fachada con arco de entrada, ventanales iluminados y marquesina de focos (sin letreros).
    const X = 220;
    rect(g, '#1e1e1e', X, 70, 200, 106); rect(g, '#2a2a2a', X, 70, 200, 4);
    for (let k = 0; k < 4; k++) {
      const wx = X + 14 + k * 48 - (k > 1 ? -8 : 0);
      if (k === 2) continue;
      rect(g, '#0a0a0a', wx, 92, 26, 40); rect(g, '#d8d8d8', wx + 2, 94, 22, 36);
      for (let d = 0; d < 3; d++) guestSilhouette(g, wx + 6 + d * 7, 130, (k + d) % 4, '#3a3a3a'); // gente bailando dentro
    }
    g.fillStyle = '#0a0a0a'; g.beginPath(); g.arc(X + 100, 150, 22, Math.PI, 0); g.fill(); rect(g, '#0a0a0a', X + 78, 150, 44, 26); // arco de la puerta
    rect(g, '#e8e8e8', X + 84, 154, 32, 22); // luz que sale por la puerta
    rect(g, '#3a3a3a', X + 60, 76, 80, 12); bulbs(g, X + 62, X + 140, 79); // marquesina
  });
  const mid = prerender(256, H, (g) => {
    papelPicado(g, 0, 256, 30, ['#e6e6e6', '#9a9a9a', '#5a5a5a']);
    for (let k = 0; k < 5; k++) guestSilhouette(g, 150 + k * 16, 192, k % 4); // la fila para entrar
    rect(g, '#0a0a0a', 60, 92, 3, 100); rect(g, '#0a0a0a', 54, 88, 15, 5); rect(g, '#f0f0f0', 57, 93, 9, 3); // farola
    g.fillStyle = 'rgba(255,255,255,0.10)'; g.beginPath(); g.moveTo(61, 96); g.lineTo(36, 192); g.lineTo(86, 192); g.fill();
  });
  return { sky, far, mid, tiles: { ...BW_TILES, water: ['#1e1e1e', '#3a3a3a', '#8a8a8a'] }, goal: 'EL SALÓN', gray: true, piece: 'luna' };
}

function chandelierBW(g, x, y, lit) {
  rect(g, '#3a3a3a', x, 0, 1, y);
  rect(g, '#6a6a6a', x - 12, y, 25, 3); rect(g, '#4a4a4a', x - 8, y + 3, 17, 2);
  for (let k = -2; k <= 2; k++) { rect(g, '#9a9a9a', x + k * 5, y - 4, 1, 4); rect(g, lit ? '#ffffff' : '#5a5a5a', x + k * 5, y - 6, 1, 2); }
  if (lit) { g.fillStyle = 'rgba(255,255,255,0.08)'; g.beginPath(); g.ellipse(x, y + 20, 34, 22, 0, 0, Math.PI * 2); g.fill(); }
}
function salonWalls(g, w) {
  for (let x = 0; x < w; x += 8) for (let y = 30; y < 176; y += 8) if ((x / 8 + y / 8) % 2) rect(g, '#1a1a1a', x + 3, y + 3, 2, 2); // papel pintado
  rect(g, '#2a2a2a', 0, 150, w, 3); rect(g, '#141414', 0, 153, w, 23); // zócalo de madera
  for (let x = 0; x < w; x += 20) rect(g, '#202020', x, 156, 1, 18);
}
function salon() {
  const sky = prerender(W, H, (g) => { bands(g, ['#0a0a0a', '#121212', '#181818', '#1e1e1e'], 0, H); });
  const far = prerender(640, H, (g) => {
    salonWalls(g, 640);
    for (let x = 40; x < 640; x += 160) {
      // Ventanal en arco con cortinas recogidas y la luna.
      g.fillStyle = '#2c2c2c'; g.beginPath(); g.arc(x + 22, 62, 22, Math.PI, 0); g.fill(); rect(g, '#2c2c2c', x, 62, 44, 80);
      g.fillStyle = '#0c0c0c'; g.beginPath(); g.arc(x + 22, 64, 18, Math.PI, 0); g.fill(); rect(g, '#0c0c0c', x + 4, 64, 36, 74);
      moon(g, x + 28, 70, 6); rect(g, '#2c2c2c', x + 21, 46, 2, 92);
      for (const side of [0, 1]) { const cx = side ? x + 36 : x - 6; g.fillStyle = '#3a3a3a'; g.beginPath(); g.moveTo(cx, 40); g.lineTo(cx + 14, 40); g.lineTo(cx + (side ? 4 : 10), 140); g.lineTo(cx + (side ? 0 : 14), 140); g.fill(); }
    }
    for (let x = 120; x < 640; x += 160) { rect(g, '#3a3a3a', x, 70, 26, 34); rect(g, '#141414', x + 3, 73, 20, 28); g.fillStyle = '#2a2a2a'; g.beginPath(); g.ellipse(x + 13, 85, 5, 7, 0, 0, Math.PI * 2); g.fill(); } // retratos
  });
  const mid = prerender(256, H, (g) => {
    rect(g, '#0e0e0e', 0, 0, 256, 30);
    chandelierBW(g, 70, 44, false); chandelierBW(g, 198, 50, false); // se ha ido la luz
    // Mesa con mantel, velas y globos.
    rect(g, '#d0d0d0', 110, 164, 56, 4); rect(g, '#9a9a9a', 112, 168, 52, 24); rect(g, '#6a6a6a', 112, 168, 52, 2);
    for (const k of [0, 1, 2]) { rect(g, '#e8e8e8', 124 + k * 14, 156, 2, 8); }
    for (const [bx, by] of [[180, 120], [192, 112], [204, 124]]) { g.fillStyle = '#b0b0b0'; g.beginPath(); g.ellipse(bx, by, 6, 8, 0, 0, Math.PI * 2); g.fill(); rect(g, '#5a5a5a', bx, by + 8, 1, 44); }
  });
  return { sky, far, mid, tiles: { ...BW_TILES, checker: true }, goal: 'LA PISTA', gray: true, piece: 'luna', dark: 0.78 };
}

function pista() {
  const sky = prerender(W, H, (g) => { bands(g, ['#0a0a0a', '#141414', '#1c1c1c', '#242424'], 0, H); });
  const far = prerender(640, H, (g) => {
    salonWalls(g, 640);
    // Escenario de la orquesta: tarima, telón y músicos en silueta (instrumentos genéricos, sin marcas).
    const X = 240;
    for (let k = 0; k < 12; k++) rect(g, k % 2 ? '#2e2e2e' : '#3a3a3a', X - 20 + k * 16, 34, 16, 90);
    rect(g, '#444444', X - 30, 124, 220, 10); rect(g, '#5a5a5a', X - 30, 124, 220, 2);
    for (let k = 0; k < 4; k++) guestSilhouette(g, X + 10 + k * 46, 124, 3, '#0e0e0e');
    g.fillStyle = '#0e0e0e'; g.beginPath(); g.ellipse(X + 20, 108, 7, 12, 0, 0, Math.PI * 2); g.fill(); rect(g, '#0e0e0e', X + 19, 80, 2, 20); // contrabajo
    g.beginPath(); g.arc(X + 120, 112, 9, 0, Math.PI * 2); g.fill(); rect(g, '#0e0e0e', X + 108, 100, 24, 2); // batería
    rect(g, '#0e0e0e', X + 150, 100, 30, 14); rect(g, '#d0d0d0', X + 152, 100, 26, 2); // piano
  });
  const mid = prerender(256, H, (g) => {
    rect(g, '#0e0e0e', 0, 0, 256, 26);
    chandelierBW(g, 64, 40, true); chandelierBW(g, 192, 46, true);
    for (const x of [8, 136]) { rect(g, '#262626', x, 26, 10, 166); rect(g, '#3a3a3a', x, 26, 2, 166); } // columnas
  });
  return { sky, far, mid, tiles: { ...BW_TILES, checker: true, semi: '#6a6a6a', semiHi: '#bdbdbd' }, gray: true, piece: 'luna', dark: 0.6 };
}

// ── v7 · El Museo (hub): pasillo con cuadros y vitrinas (spec §3.0f C) ──
function museo() {
  const sky = prerender(W, H, (g) => { bands(g, ['#1b1226', '#241830', '#2e1f3a', '#3a2848'], 0, H); });
  const far = prerender(640, H, (g) => {
    rect(g, '#2a1e36', 0, 20, 640, 150);
    for (let x = 0; x < 640; x += 80) { rect(g, '#c8963c', x + 18, 44, 44, 34); rect(g, '#1b1226', x + 21, 47, 38, 28); rect(g, '#3a2848', x + 23, 49, 34, 24); }
    rect(g, '#1b1226', 0, 150, 640, 4); rect(g, '#3a2848', 0, 154, 640, 38); rect(g, '#c8963c', 0, 154, 640, 1);
  });
  const mid = prerender(256, H, (g) => { rect(g, '#120c1a', 0, 0, 256, 12); for (let x = 30; x < 256; x += 128) { rect(g, '#f0c870', x, 12, 2, 6); rect(g, '#fff2c0', x - 3, 18, 8, 3); } });
  return { sky, far, mid, tiles: { top: '#e6e0d4', topHi: '#ffffff', body: '#8a8094', bodyHi: '#a89eb4', bodyDk: '#5a5068', semi: '#c8963c', semiHi: '#f0c870' } };
}

export const THEMES = { calle, azoteas, teatro, afuera, salon, pista, museo };
import { BACKDROPS } from '../data/backdrops-w1.js';

// Si hay fondo panorámico importado (Gemini → scripts/import_backdrop.py), sustituye a las capas por código.
export const buildTheme = (name) => {
  const th = (THEMES[name] || calle)();
  const bd = BACKDROPS[name];
  if (bd && typeof Image !== 'undefined') th.backdrop = Object.assign(new Image(), { src: bd.png }), th.backdropW = bd.w;
  return th;
};
