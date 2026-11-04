// v8.1 · Invitados disfrazados de la fiesta de Noche, dibujados por código (spec §3.0f G).
// Monstruos clásicos de dominio público en versión genérica y leyendas mexicanas, con diseño propio:
// nada de cabeza plana con tornillos, máscara de hockey, suéter de rayas ni caras de actores.
// Todos miran a la derecha, con proporciones chibi como Pepe. Animaciones: walk ×4, act ×2 (su ataque),
// uwalk ×4 y uact ×2 (sin disfraz), hit ×1; el Hombre invisible además parts ×4 (solo sombrero, gafas y guantes).
import { createGrid, shade } from './pixel.js';

// Materiales: 1 piel · 2 pelo · 3 ropa A · 4 ropa B · 5 zapatos · 6 detalle · 7 blanco de ojos · 8 pupila/boca
//             9 ropa A trasera (más oscura, para separar brazo y pierna de atrás) · 10 piel trasera · 11 extra
const SKIN = ['#a8684a', '#d99a72', '#f4c9a0'];
const SKIN_BACK = ['#7c4a34', '#a8684a', '#c98a66'];
const EYE = '#fff8ec', PUPIL = '#1b1226';

const W = 34, H = 52;
const SWING = [3, 0, -3, 0], BOB = [0, 1, 0, 1];

// Cuerpo común. o: { phase, foot (y de los pies), legLen, torsoTop, torsoW, arms: 'swing' | 'front' | 'up' | 'face' }
function humanoid(G, o) {
  const cx = o.cx ?? 16, s = SWING[o.phase % 4], b = o.bob ?? BOB[o.phase % 4];
  const hip = o.foot - o.legLen, tt = o.torsoTop + b, tw = o.torsoW;
  // Pierna y brazo de atrás (material trasero, más oscuro).
  if (o.legs !== false) {
    G.line(cx - 2, hip, cx - 2 - s, o.foot - 3, 4, 9);
    G.rect(cx - 4 - s, o.foot - 3, 6, 3, 5);
  }
  const armTo = (side) => {
    const sx = cx + side * (tw / 2 - 1), sy = tt + 3;
    if (o.arms === 'front') return [sx, sy, sx + 9, sy + 2];
    if (o.arms === 'up') return [sx, sy, sx + side * 3 + 2, sy - 10];
    if (o.arms === 'face') return [sx, sy, cx + 4, tt - 4];
    return [sx, sy, sx + side * s * 0.8 + 1, sy + 9];
  };
  { const [a, c, d, e] = armTo(-1); G.line(a, c, d, e, 4, o.backArm ?? 9); G.ellipse(d, e, 2.4, 2.4, o.handBack ?? 10); }
  // Torso: hombros redondos y cintura algo más estrecha.
  const waist = o.foot - o.legLen + 2;
  G.poly([[cx - tw / 2 - 1, tt + 2], [cx + tw / 2 + 1, tt + 2], [cx + tw / 2 - 1, waist], [cx - tw / 2 + 1, waist]], 3);
  G.ellipse(cx - tw / 2 + 2, tt + 3, 3.5, 3, 3); G.ellipse(cx + tw / 2 - 2, tt + 3, 3.5, 3, 3);
  G.rect(cx - tw / 2 + 2, tt, tw - 4, 3, 3);
  // Pierna y brazo de delante.
  if (o.legs !== false) {
    G.line(cx + 2, hip, cx + 2 + s, o.foot - 3, 4, o.legMat ?? 4);
    G.rect(cx + s, o.foot - 3, 6, 3, 5);
  }
  const [a, c, d, e] = armTo(1);
  G.line(a, c, d, e, 4, o.armMat ?? 12); G.ellipse(d, e, 2.6, 2.6, o.hand ?? 1);
  return { cx, tt, b };
}

// Cabeza chibi grande (como Pepe), mirando a la derecha.
function head(G, cx, cy, mat = 1) { G.ellipse(cx + 1, cy, 8.5, 9, mat); G.rect(cx + 7, cy + 1, 3, 2, mat); /* nariz */ }
function eyes(G, cx, y, mood = 'normal') {
  if (mood === 'x') { G.set(cx + 3, y, 8); G.set(cx + 4, y + 1, 8); G.set(cx + 6, y, 8); G.set(cx + 7, y + 1, 8); return; }
  G.rect(cx + 2, y, 3, 3, 7); G.rect(cx + 6, y, 3, 3, 7);
  const py = mood === 'up' ? y : y + 1;
  G.set(cx + 4, py, 8); G.set(cx + 8, py, 8);
}
function mouth(G, cx, y, kind) {
  if (kind === 'o') G.rect(cx + 4, y, 3, 3, 8);
  else if (kind === 'smile') { G.rect(cx + 3, y, 5, 1, 8); G.set(cx + 3, y - 1, 8); G.set(cx + 7, y - 1, 8); }
  else G.rect(cx + 4, y, 3, 1, 8);
}

// ── Gigante cosido (K): sin cabeza plana ni tornillos; cicatriz y puntadas de diseño propio ──
function gigante(G, f) {
  const o = humanoid(G, { phase: f.i, foot: 51, legLen: 13, torsoTop: 22, torsoW: 22, arms: f.act ? 'front' : 'swing', cx: 17 });
  const hy = 13 + o.b;
  if (!f.u) {
    G.ellipse(o.cx + 1, hy, 9, 9.5, 11); G.rect(o.cx + 8, hy + 1, 3, 2, 11); // cabeza grande y cuadrada (redondeada)
    // Pelo redondeado y revuelto (nada de cabeza plana: ese diseño es de Universal).
    G.ellipse(o.cx, hy - 6, 9, 5, 2);
    for (let k = 0; k < 4; k++) G.rect(o.cx - 7 + k * 4, hy - 12 + (k % 2), 3, 3, 2);
    for (let k = 0; k < 4; k++) G.rect(o.cx - 5 + k * 3, hy - 3, 2, 1 + (k % 2), 2);
    eyes(G, o.cx, hy - 1, f.act ? 'up' : 'normal');
    mouth(G, o.cx, hy + 5);
    for (let k = 0; k < 4; k++) G.set(o.cx - 3 + k * 3, hy - 3, 8); // puntadas en la frente
    G.rect(o.cx - 4, hy - 3, 10, 1, 6);
    G.rect(o.cx + 7, hy + 1, 2, 4, 6); // cicatriz en la mejilla
  } else {
    head(G, o.cx, hy);
    G.ellipse(o.cx + 1, hy - 6, 7.5, 3.5, 2);
    eyes(G, o.cx, hy - 1, 'up'); mouth(G, o.cx, hy + 5, 'o');
    // Restos del disfraz de cartón en los hombros.
    G.rect(o.cx - 10, o.tt - 2, 6, 4, 6); G.rect(o.cx + 6, o.tt - 2, 5, 3, 6);
  }
  G.rect(o.cx - 9, o.tt + 8, 18, 2, 4); // cinturón
}

// ── Hombre invisible (N): vendas, gafas redondas, sombrero y gabardina ──
function invisible(G, f) {
  const o = humanoid(G, { phase: f.i, foot: 51, legLen: 12, torsoTop: 24, torsoW: 16, arms: f.act ? 'front' : 'swing', hand: 6, handBack: 6 });
  const hy = 15 + o.b;
  G.poly([[o.cx - 9, o.tt], [o.cx + 9, o.tt], [o.cx + 11, o.tt + 18], [o.cx - 11, o.tt + 18]], 3); // gabardina
  G.rect(o.cx - 1, o.tt, 2, 16, 4);
  if (!f.u) {
    head(G, o.cx, hy, 11); // vendas
    for (let k = -6; k < 9; k += 3) G.rect(o.cx - 7, hy + k, 17, 1, 4);
    G.rect(o.cx + 1, hy - 2, 4, 4, 8); G.rect(o.cx + 7, hy - 2, 4, 4, 8); G.rect(o.cx + 5, hy - 1, 2, 1, 8); // gafas redondas
    G.set(o.cx + 1, hy - 2, 0); G.set(o.cx + 4, hy + 1, 0); G.set(o.cx + 7, hy - 2, 0); G.set(o.cx + 10, hy + 1, 0);
    G.set(o.cx + 2, hy - 1, 7); G.set(o.cx + 8, hy - 1, 7); // brillo de las lentes
  } else {
    head(G, o.cx, hy);
    G.ellipse(o.cx + 1, hy - 6, 7.5, 3, 2);
    eyes(G, o.cx, hy - 2, 'up'); mouth(G, o.cx, hy + 4, 'o');
    G.rect(o.cx - 9, o.tt + 14, 4, 6, 4); G.rect(o.cx + 7, o.tt + 16, 3, 4, 4); // vendas caídas
  }
  // Sombrero de ala.
  G.rect(o.cx - 9, hy - 8, 20, 2, 6); G.rect(o.cx - 5, hy - 14, 12, 6, 6); G.rect(o.cx - 5, hy - 10, 12, 1, 8);
}
// Solo lo que se ve del Hombre invisible a oscuras (sombrero, gafas y guantes).
const INVISIBLE_PARTS = new Set([6, 8]);

// ── Hombre anfibio (U): escamas, cresta y aletas de diseño propio ──
function anfibio(G, f) {
  const up = f.act;
  const o = humanoid(G, { phase: f.i, foot: 51, legLen: 12, torsoTop: 24, torsoW: 16, arms: up ? 'up' : 'swing', hand: 6, handBack: 6, legMat: 3 });
  const hy = 15 + o.b;
  if (!f.u) {
    head(G, o.cx, hy, 3);
    G.poly([[o.cx - 4, hy - 7], [o.cx + 2, hy - 14], [o.cx + 6, hy - 7]], 4); // cresta
    G.poly([[o.cx - 8, hy - 1], [o.cx - 12, hy - 5], [o.cx - 11, hy + 3]], 4); // aleta lateral
    G.ellipse(o.cx + 5, hy - 1, 3, 3, 7); G.rect(o.cx + 6, hy - 1, 2, 2, 8); // ojo grande
    G.rect(o.cx + 3, hy + 5, 6, 1, 8);
    for (let k = 0; k < 3; k++) G.rect(o.cx - 6 + k * 4, o.tt + 4 + (k % 2) * 4, 2, 2, 11); // escamas
  } else {
    head(G, o.cx, hy);
    G.ellipse(o.cx + 1, hy - 6, 7.5, 3, 2);
    G.rect(o.cx - 4, hy - 6, 13, 3, 11); G.rect(o.cx + 1, hy - 5, 3, 1, 7); G.rect(o.cx + 5, hy - 5, 3, 1, 7); // gafas de buzo en la frente
    eyes(G, o.cx, hy, 'normal'); mouth(G, o.cx, hy + 5, 'smile');
  }
}

// ── La Llorona (Q): vestido blanco largo y velo; flota (sin pies) ──
function llorona(G, f) {
  const sw = Math.round(Math.sin((f.i / 4) * Math.PI * 2) * 2);
  const cx = 16, tt = 22;
  G.poly([[cx - 7, tt], [cx + 7, tt], [cx + 12 + sw, 48], [cx + 4, 46], [cx - 2, 49], [cx - 10 + sw, 47]], 3); // vestido
  G.rect(cx - 7, tt + 6, 14, 2, 4);
  const arms = f.act ? 'up' : 'face';
  humanoid(G, { phase: 0, bob: 0, foot: 47, legLen: 10, torsoTop: tt, torsoW: 14, arms: f.u ? 'swing' : arms, legs: false, cx, backArm: 9, armMat: 3 });
  const hy = 13;
  G.poly([[cx - 9, hy - 6], [cx + 4, hy - 9], [cx - 6, hy + 14], [cx - 12, hy + 10]], 2); // pelo largo
  head(G, cx, hy);
  if (!f.u) {
    G.poly([[cx - 10, hy - 9], [cx + 8, hy - 9], [cx + 2, hy + 18], [cx - 13, hy + 16]], 6); // velo
    G.ellipse(cx + 1, hy, 6, 6.5, 1);
    eyes(G, cx, hy - 1, f.act ? 'up' : 'normal');
    G.set(cx + 3, hy + 2, 11); G.set(cx + 3, hy + 3, 11); G.set(cx + 7, hy + 2, 11); // lágrimas
    mouth(G, cx, hy + 4, f.act ? 'o' : 'flat');
  } else {
    G.ellipse(cx + 1, hy - 6, 7.5, 3, 2);
    eyes(G, cx, hy - 1, 'up'); mouth(G, cx, hy + 4, 'smile');
  }
}

// ── Charro Negro (Q): traje negro con botonadura plateada y sombrero de ala ancha ──
function charro(G, f) {
  const lean = f.act ? 3 : 0;
  const o = humanoid(G, { phase: f.i, foot: 51, legLen: 13, torsoTop: 24, torsoW: 16, arms: f.act ? 'front' : 'swing', cx: 16 + lean });
  const hy = 16 + o.b;
  for (let k = 0; k < 4; k++) { G.set(o.cx - 4, o.tt + 2 + k * 3, 6); G.set(o.cx + 4, o.tt + 2 + k * 3, 6); } // botonadura
  for (let k = 0; k < 3; k++) G.set(o.cx + 2 + (o.cx % 2), o.foot - 10 + k * 3, 6);
  G.rect(o.cx - 2, o.tt + 1, 4, 3, 11); // moño
  head(G, o.cx, hy);
  if (!f.u) {
    G.ellipse(o.cx + 1, hy + 1, 7, 6, 2); // la cara queda en sombra bajo el sombrero
    G.rect(o.cx + 2, hy, 2, 1, 11); G.rect(o.cx + 6, hy, 2, 1, 11); // ojos que brillan
  } else {
    G.ellipse(o.cx + 1, hy - 5, 7.5, 3, 2);
    eyes(G, o.cx, hy - 1, 'normal'); mouth(G, o.cx, hy + 4, 'smile');
    G.rect(o.cx + 3, hy + 2, 5, 1, 2); // bigote
  }
  // Sombrero de ala muy ancha (el de la fiesta se lleva echado hacia atrás).
  const tilt = f.u ? -2 : 0;
  G.ellipse(o.cx + 1 + tilt, hy - 8, 15, 3, 4);
  G.ellipse(o.cx + 1 + tilt, hy - 13, 6, 5, 4);
  G.rect(o.cx - 4 + tilt, hy - 10, 11, 1, 6);
}

// Paletas por personaje (colores; en Noche el juego las pasa a gris).
const P = {
  gigante: { 2: ['#1c1a20', '#34303a', '#55505c'], 3: ['#2a2a36', '#43435a', '#62627c'], 4: ['#1c1810', '#3a3020', '#5c4c34'], 5: ['#121014', '#24202a', '#3c3644'], 6: ['#3a2c2c', '#5a4040', '#7a5858'], 9: ['#1c1c26', '#2e2e40', '#43435a'], 11: ['#4f6a4a', '#7f9a7a', '#a8c0a0'] },
  invisible: { 2: ['#2a1c14', '#4a3424', '#6a4c34'], 3: ['#5a4630', '#86704e', '#b09a72'], 4: ['#d8ccb0', '#f0e6cc', '#ffffff'], 5: ['#1c1814', '#302a24', '#4a4238'], 6: ['#1c1c24', '#34343e', '#50505c'], 9: ['#463824', '#5a4630', '#76603e'], 11: ['#d8ccb0', '#f0e6cc', '#ffffff'] },
  anfibio: { 2: ['#2a1c14', '#4a3424', '#6a4c34'], 3: ['#1e5a3c', '#2f8a5c', '#5cc088'], 4: ['#16402a', '#20623e', '#3a8a5c'], 5: ['#16402a', '#20623e', '#3a8a5c'], 6: ['#16402a', '#2f8a5c', '#7ad6a0'], 9: ['#164a30', '#20623e', '#2f8a5c'], 11: ['#c8b040', '#e8d060', '#fff0a0'] },
  llorona: { 2: ['#0c0a10', '#1c1820', '#34303c'], 3: ['#b8b4c4', '#e6e2f0', '#ffffff'], 4: ['#8a86a0', '#a8a4bc', '#cac6da'], 6: ['#9a96aa', '#c4c0d4', '#e6e2f2'], 9: ['#9c98ac', '#bcb8cc', '#dcd8e8'], 11: '#7ad0ff' },
  charro: { 2: ['#0e0c12', '#1c1822', '#2c2834'], 3: ['#141218', '#24202c', '#3a3446'], 4: ['#100e14', '#1e1a24', '#2e2a38'], 5: ['#0c0a10', '#1a1620', '#2a2632'], 6: '#e6e6f0', 9: ['#0c0a10', '#18141e', '#24202c'], 11: '#ffcf7a' },
};
const BASE = { 1: SKIN, 7: EYE, 8: PUPIL, 10: SKIN_BACK, 5: ['#141018', '#28222e', '#3c3446'] };
const DRAW = { gigante, invisible, anfibio, llorona, charro };
const lighten = (hex, k) => '#' + [1, 3, 5].map((i) => Math.min(255, Math.round(parseInt(hex.slice(i, i + 2), 16) * k + 18)).toString(16).padStart(2, '0')).join('');

// Alto mínimo esperado (px de figura visible) para los tests.
export const FIESTA = { gigante: { minH: 44 }, invisible: { minH: 44 }, anfibio: { minH: 44 }, llorona: { minH: 40 }, charro: { minH: 44 } };

const CACHE = new Map();
export function renderCharacter(id) {
  if (CACHE.has(id)) return CACHE.get(id);
  const mats = { ...BASE, ...P[id] };
  mats[12] = typeof mats[3] === 'string' ? mats[3] : mats[3].map((c) => lighten(c, 1.12));
  const frames = [], anims = {};
  const add = (anim, i, f, keep = null) => {
    const G = createGrid(W, H);
    DRAW[id](G, { i, ...f });
    if (keep) for (let k = 0; k < G.m.length; k++) if (!keep.has(G.m[k])) G.m[k] = 0;
    const key = `${anim}${i}`;
    frames.push({ key, w: W, h: H, px: shade(G, mats) });
    (anims[anim] ??= []).push(key);
  };
  for (let i = 0; i < 4; i++) add('walk', i, {});
  for (let i = 0; i < 2; i++) add('act', i, { act: true });
  for (let i = 0; i < 4; i++) add('uwalk', i, { u: true });
  for (let i = 0; i < 2; i++) add('uact', i, { act: true, u: true });
  add('hit', 0, { act: true });
  if (id === 'invisible') for (let i = 0; i < 4; i++) add('parts', i, {}, INVISIBLE_PARTS);
  const out = { frames, anims };
  CACHE.set(id, out);
  return out;
}
