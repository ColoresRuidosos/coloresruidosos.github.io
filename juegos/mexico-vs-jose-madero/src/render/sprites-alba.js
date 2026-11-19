// v10.3 · Sprites del Mundo 3 «Alba», dibujados por código con el generador Neo Geo (spec §3.0f Q v10.3).
// Todo es diseño propio: la Nostalgia es una nube de bruma sepia con polaroids y brazos de tira de película.
import { createGrid, shade } from './pixel.js';

// Tamaño y animaciones de cada sprite (los tests lo comprueban).
export const ALBA = {
  nostalgia: { w: 64, h: 80, anims: { flota: 4, lanza: 2, gira: 2, despide: 4 } },
  recuerdo: { w: 18, h: 20, anims: { rosa: 2, antifaz: 2, flash: 2, noria: 2 } },
  cabina: { w: 20, h: 16, anims: { idle: 1 } },
  eje: { w: 14, h: 14, anims: { idle: 1 } },
  atril: { w: 18, h: 26, anims: { normal: 1, leido: 1 } },
  luz: { w: 14, h: 14, anims: { brilla: 4 } },
  plataforma: { w: 16, h: 6, anims: { on: 1, off: 1 } },
  banca: { w: 30, h: 16, anims: { idle: 1 } },
  caballito: { w: 22, h: 26, anims: { idle: 1 } },
  diana: { w: 16, h: 16, anims: { parada: 1, caida: 1 } },
};

// ── Paletas ──
const SEPIA = ['#6e5236', '#a3815c', '#d2b48c'], SEPIA_BACK = ['#4e3a26', '#6e5236', '#8c6c4a'];
const GOLD = ['#b8862e', '#e8b84a', '#fff0a8'], GOLD_BACK = ['#8a6420', '#b8862e', '#e8b84a'];
const FILM = ['#1e1610', '#3a2c20', '#5a4634'], POLA = ['#c8bca8', '#f4eee0', '#fffdf6'];
const WOOD = ['#5a3a1e', '#8a5a30', '#c08850'], IRON = ['#2a2630', '#46404e', '#6a6276'];
const WHITE = ['#b8b0a8', '#ece6de', '#ffffff'], SUN = ['#e8a020', '#ffd040', '#fff8b0'];
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, k) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * k).toString(16).padStart(2, '0')).join('');
const mixMat = (A, B, k) => A.map((c, i) => mix(c, B[i], k));

// ── La Nostalgia (jefe) ──
function filmArm(G, x0, y0, x1, y1) {
  G.line(x0, y0, x1, y1, 5, 3);
  const n = Math.max(1, Math.floor(Math.hypot(x1 - x0, y1 - y0) / 3));
  for (let k = 1; k < n; k++) G.set(x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n, 4); // perforaciones
}
function miniPolaroid(G, x, y, foto) { G.rect(x, y, 8, 9, 5); G.rect(x + 1, y + 1, 6, 5, foto); }
function nostalgia(G, f) {
  const b = [0, 1, 2, 1][f.i % 4], cx = 32, despide = f.anim === 'despide';
  // Jirones de bruma (se mueven al flotar).
  for (let j = 0; j < 3; j++) {
    const x = 22 + j * 10, sway = Math.round(Math.sin((f.i + j) * 1.7) * 3);
    G.poly([[x - 6, 46 + b], [x + 6, 46 + b], [x + sway + 1, 76 - j * 3], [x + sway - 1, 76 - j * 3]], 2);
  }
  // Cuerpo de nube.
  G.ellipse(cx, 30 + b, 22, 19, 1);
  for (const [x, y, rx, ry] of [[14, 26, 10, 9], [50, 26, 10, 9], [32, 12, 14, 10], [21, 42, 12, 9], [43, 42, 12, 9]]) G.ellipse(x, y + b, rx, ry, 1);
  // Polaroids prendidas a la bruma.
  miniPolaroid(G, 9, 32 + b, 6); miniPolaroid(G, 45, 12 + b, 7); miniPolaroid(G, 46, 36 + b, 8);
  // Brazos de tira de película.
  if (f.anim === 'lanza') {
    filmArm(G, 12, 34 + b, 6, 50 + b);
    if (f.i === 0) { filmArm(G, 52, 30 + b, 58, 12 + b); miniPolaroid(G, 54, 2 + b, 6); }
    else filmArm(G, 52, 32 + b, 63, 27 + b);
  } else if (f.anim === 'gira') {
    filmArm(G, 14, 36 + b, f.i ? 26 : 30, 54 + b); filmArm(G, 50, 36 + b, f.i ? 60 : 62, f.i ? 52 : 48);
  } else if (despide) {
    filmArm(G, 12, 34 + b, 6, 50 + b); filmArm(G, 52, 30 + b, f.i % 2 ? 58 : 62, f.i % 2 ? 12 : 14);
  } else { filmArm(G, 12, 34 + b, 6, 50 + b); filmArm(G, 52, 34 + b, 58, 50 + b); }
  // Cara: ojos grandes y melancólicos (al despedirse, sonríe).
  G.ellipse(25, 28 + b, 4.5, 5, 9); G.ellipse(39, 28 + b, 4.5, 5, 9);
  const py = despide ? 27 : 30;
  G.rect(24, py + b, 3, 3, 10); G.rect(38, py + b, 3, 3, 10);
  if (despide) { G.rect(29, 37 + b, 7, 1, 10); G.set(28, 36 + b, 10); G.set(36, 36 + b, 10); G.rect(19, 34 + b, 3, 2, 11); G.rect(43, 34 + b, 3, 2, 11); }
  else {
    G.line(20, 23 + b, 27, 21 + b, 1, 10); G.line(37, 21 + b, 44, 23 + b, 1, 10); // cejas tristes
    G.rect(30, 37 + b, 5, 1, 10); G.set(29, 38 + b, 10); G.set(35, 38 + b, 10);
  }
}

// ── Recuerdo (polaroid con una foto de un mundo anterior) ──
const FOTOS = {
  rosa: { bg: '#6a1828', draw(G, y) { G.ellipse(9, y + 4, 2.6, 2.6, 7); G.line(9, y + 7, 9, y + 9, 1, 8); G.set(10, y + 8, 8); } },
  antifaz: { bg: '#5a5a66', draw(G, y) { G.rect(4, y + 3, 10, 3, 7); G.set(6, y + 4, 6); G.set(11, y + 4, 6); G.set(9, y + 2, 7); } },
  flash: { bg: '#7a2028', draw(G, y) { G.rect(5, y + 3, 8, 5, 7); G.ellipse(9, y + 5, 1.6, 1.6, 8); G.rect(6, y + 2, 2, 1, 11); } },
  noria: { bg: '#e8b46a', draw(G, y) { G.ellipse(9, y + 4, 4, 4, 7); G.ellipse(9, y + 4, 2.4, 2.4, 6); G.set(9, y + 4, 7); G.line(9, y + 8, 7, y + 10, 1, 7); G.line(9, y + 8, 11, y + 10, 1, 7); } },
};
function recuerdo(G, f) {
  const y = 1 + (f.i % 2);
  G.rect(1, y, 16, 17, 5);            // marco (con el margen de abajo más ancho, como una polaroid)
  G.rect(3, y + 2, 12, 10, 6);        // foto
  FOTOS[f.anim].draw(G, y + 1);
}
const FOTO_MATS = {
  rosa: { 7: '#e0304a', 8: '#3a8a3a' }, antifaz: { 7: '#2a2030', 6: '#5a5a66' },
  flash: { 7: '#2a2a30', 8: '#8ac0ff', 11: '#ffffff' }, noria: { 7: '#4a3a5a', 6: '#e8b46a' },
};

// ── Piezas del escenario ──
function cabina(G) {
  G.line(10, 0, 10, 2, 1, 3);
  G.poly([[4, 5], [16, 5], [14, 2], [6, 2]], 1);
  G.rect(3, 5, 14, 8, 2); G.rect(6, 7, 8, 3, 4); G.rect(3, 12, 14, 2, 1);
}
function eje(G) {
  for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; G.rect(Math.round(7 + Math.cos(a) * 5.5) - 1, Math.round(7 + Math.sin(a) * 5.5) - 1, 2, 2, 1); }
  G.ellipse(7, 7, 4.8, 4.8, 1); G.ellipse(7, 7, 1.8, 1.8, 2);
}
function atril(G, f) {
  G.line(9, 14, 9, 23, 3, 1); G.rect(4, 23, 10, 2, 1);
  G.poly([[2, 11], [16, 9], [16, 13], [2, 15]], 1);
  G.ellipse(9, 6, 5.5, 4, 2); G.set(9, 6, 3);
  if (f.anim === 'leido') { G.set(2, 2, 4); G.set(16, 1, 4); G.set(15, 4, 4); G.set(3, 5, 4); }
}
function luz(G, f) {
  const L = 5 + (f.i % 2);
  for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4 + (f.i >= 2 ? Math.PI / 8 : 0); G.line(7, 7, 7 + Math.cos(a) * L, 7 + Math.sin(a) * L, 1, 2); }
  G.ellipse(7, 7, 3.5, 3.5, 1);
}
function plataforma(G, f) {
  if (f.anim === 'on') { G.rect(0, 1, 16, 4, 1); G.set(3, 2, 2); G.set(10, 3, 2); }
  else for (let x = 1; x < 16; x += 5) G.set(x, 2, 3);
}
function banca(G) {
  G.rect(2, 1, 26, 2, 1); G.rect(2, 4, 26, 1, 1); G.rect(2, 7, 26, 3, 1);
  G.line(4, 1, 4, 10, 1, 2); G.line(26, 1, 26, 10, 1, 2);
  G.line(5, 10, 3, 15, 2, 2); G.line(25, 10, 27, 15, 2, 2);
}
function caballito(G) {
  G.line(11, 0, 11, 25, 2, 3);
  for (let y = 1; y < 25; y += 4) G.rect(11, y, 2, 1, 4);   // rayas del tubo
  G.line(14, 15, 18, 22, 2, 1); G.line(7, 15, 3, 22, 2, 1);  // patas
  G.ellipse(11, 13, 8, 4, 1);
  G.poly([[15, 11], [18, 6], [21, 8], [18, 13]], 1); G.ellipse(19, 8, 3, 2.5, 1);
  G.ellipse(15, 7, 3, 2, 2); G.line(3, 12, 0, 17, 2, 2);     // crin y cola doradas
  G.rect(9, 9, 5, 3, 5); G.set(20, 7, 6);
}
function diana(G, f) {
  if (f.anim === 'caida') { G.rect(1, 12, 14, 2, 1); G.rect(5, 12, 6, 2, 2); G.rect(7, 12, 2, 2, 1); G.rect(7, 14, 2, 2, 3); return; }
  G.line(8, 12, 8, 15, 2, 3);
  G.ellipse(8, 7, 6.5, 6.5, 1); G.ellipse(8, 7, 4.5, 4.5, 2); G.ellipse(8, 7, 2.5, 2.5, 1); G.set(8, 7, 2);
}

const RED = ['#8a1a24', '#c8283c', '#f06070'];
const DEF = {
  nostalgia: { draw: nostalgia, mats: { 1: SEPIA, 2: SEPIA_BACK, 3: FILM, 4: '#e8dcc0', 5: POLA, 6: '#a83a3a', 7: '#4a4a5a', 8: '#3a6a9a', 9: '#fff6e4', 10: '#2a1c12', 11: '#c98a6a' } },
  recuerdo: { draw: recuerdo, mats: { 5: POLA } },
  cabina: { draw: cabina, mats: { 1: ['#1e6a6a', '#2f9a94', '#6fd0c4'], 2: ['#b8a888', '#e8dcc0', '#fffaf0'], 3: IRON, 4: '#6ab0d8' } },
  eje: { draw: eje, mats: { 1: GOLD, 2: IRON } },
  atril: { draw: atril, mats: { 1: WOOD, 2: ['#c8c0b0', '#f0ece4', '#ffffff'], 3: '#2a2420', 4: '#fff6c0' } },
  luz: { draw: luz, mats: { 1: SUN, 2: ['#e8b030', '#ffe070', '#fff8c0'] } },
  plataforma: { draw: plataforma, mats: { 1: ['#c89a30', '#ffd860', '#fffbe0'], 2: '#ffffff', 3: '#e0cf90' } },
  banca: { draw: banca, mats: { 1: WOOD, 2: IRON } },
  caballito: { draw: caballito, mats: { 1: WHITE, 2: GOLD, 3: GOLD, 4: '#c8283c', 5: ['#8a1a24', '#c8283c', '#f06070'], 6: '#2a1c12' } },
  diana: { draw: diana, mats: { 1: RED, 2: WHITE, 3: WOOD } },
};

const CACHE = new Map();
export function renderAlba(id) {
  if (CACHE.has(id)) return CACHE.get(id);
  const spec = ALBA[id], def = DEF[id], frames = [], anims = {};
  for (const [anim, n] of Object.entries(spec.anims)) {
    for (let i = 0; i < n; i++) {
      const G = createGrid(spec.w, spec.h);
      def.draw(G, { anim, i });
      let mats = { ...def.mats };
      if (id === 'recuerdo') mats = { ...mats, 6: FOTOS[anim].bg, ...FOTO_MATS[anim] };
      if (id === 'nostalgia' && anim === 'despide') {   // de sepia a dorado
        const k = (i + 1) / n;
        mats = { ...mats, 1: mixMat(SEPIA, GOLD, k), 2: mixMat(SEPIA_BACK, GOLD_BACK, k), 3: mixMat(FILM, GOLD_BACK, k * 0.7) };
      }
      const key = `${anim}${i}`;
      frames.push({ key, w: spec.w, h: spec.h, px: shade(G, mats), ax: Math.floor(spec.w / 2), ay: spec.h });
      (anims[anim] ??= []).push(key);
    }
  }
  const out = { frames, anims };
  CACHE.set(id, out);
  return out;
}
