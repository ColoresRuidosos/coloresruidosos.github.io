import { W, H, TILE, OVATION, BOSS, MASK, INTRO, GAME_TITLE } from '../game/constants.js';
import { GLYPHS, ADVANCE, ACCENT, textWidth } from './font.js';
import { micHand, micTip, aimHook } from '../game/game.js';
import { beamRect } from '../game/boss.js';
import { PEPE_META, PEPE_PNG } from '../data/pepe-atlas.js';
import { ENEMIES_META, ENEMIES_PNG } from '../data/enemies-atlas.js';
import { TRAIDOR_META, TRAIDOR_PNG } from '../data/traidor-atlas.js';
import { FLASHBOT_META, FLASHBOT_PNG } from '../data/flashbot-atlas.js';
import { RUMOR_META, RUMOR_PNG } from '../data/rumor-atlas.js';
import { COSTUMES_META, COSTUMES_PNG } from '../data/costumes-atlas.js';
import { toSheet } from './pixel.js';
import { renderCharacter } from './sprites-fiesta.js';
import { MURCIELAGO_META, MURCIELAGO_PNG } from '../data/murcielago-atlas.js';
import { FANTASMA_META, FANTASMA_PNG } from '../data/fantasma-atlas.js';
import { ENMASCARADO_META, ENMASCARADO_PNG } from '../data/enmascarado-atlas.js';
import { buildTheme, hash } from './themes.js';
import { drawRecuerdo, drawThought } from './draw-historia.js';
import { drawNocheEnemy, drawMaskBoss, drawMaskEyes, drawDarkness, drawMascara, drawLunaPiece, drawAceite } from './draw-noche.js';
import { panOffset } from './backdrop.js';

const canvas = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
const rect = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };

// ── Texto bitmap ───────────────────────────────────────────
export function text(ctx, str, x, y, { color = '#fff', scale = 1, align = 'left', shadow = '#1b1226', bands = null } = {}) {
  const w = textWidth(str, scale);
  let cx = Math.round(align === 'center' ? x - w / 2 : align === 'right' ? x - w : x);
  y = Math.round(y);
  for (const raw of str) {
    // Mayúsculas acentuadas: letra a tamaño completo y la tilde encima (más legible que la versión comprimida).
    const acc = ACCENT[raw];
    const ch = acc ? acc[0] : raw;
    if (acc) for (const [i, j] of acc[1]) {
      if (shadow) { ctx.fillStyle = shadow; ctx.fillRect(cx + i * scale + scale, y + j * scale + scale, scale, scale); }
      ctx.fillStyle = bands ? bands[0] : color;
      ctx.fillRect(cx + i * scale, y + j * scale, scale, scale);
    }
    const g = GLYPHS[ch];
    if (g) for (let j = 0; j < 7; j++) for (let i = 0; i < 5; i++) {
      if (g[j][i] !== '1') continue;
      if (shadow) { ctx.fillStyle = shadow; ctx.fillRect(cx + i * scale + scale, y + j * scale + scale, scale, scale); }
      ctx.fillStyle = bands ? bands[Math.min(bands.length - 1, Math.floor((j / 7) * bands.length))] : color;
      ctx.fillRect(cx + i * scale, y + j * scale, scale, scale);
    }
    cx += ADVANCE * scale;
  }
}

export function wrap(str, maxChars) {
  const out = [];
  let line = '';
  for (const w of str.split(' ')) {
    if ((line + ' ' + w).trim().length > maxChars) { out.push(line); line = w; } else line = (line + ' ' + w).trim();
  }
  if (line) out.push(line);
  return out;
}

// ── Sprites (atlas generados por scripts/slice_sheet.py) ──
const loadImage = (src) => { const img = new Image(); img.src = src; return img; };
let SHEETS = null;
const FIESTA_IDS = ['gigante', 'invisible', 'anfibio', 'llorona', 'charro'];
const NOCHE_KINDS = new Set(['murcielago', 'fantasma', ...FIESTA_IDS]);
function sheets() {
  if (SHEETS) return SHEETS;
  const mk = (png, meta) => ({ img: loadImage(png), meta });
  SHEETS = { pepe: mk(PEPE_PNG, PEPE_META), foes: mk(ENEMIES_PNG, ENEMIES_META), traidor: mk(TRAIDOR_PNG, TRAIDOR_META), boss: mk(FLASHBOT_PNG, FLASHBOT_META), rumor: mk(RUMOR_PNG, RUMOR_META), costumes: mk(COSTUMES_PNG, COSTUMES_META),
    // v8 · Noche (hojas de ChatGPT recortadas con scripts/slice_rows.py)
    murcielago: mk(MURCIELAGO_PNG, MURCIELAGO_META), fantasma: mk(FANTASMA_PNG, FANTASMA_META), enmascarado: mk(ENMASCARADO_PNG, ENMASCARADO_META) };
  SHEETS.ready = Promise.all(['pepe', 'foes', 'traidor', 'boss', 'rumor', 'costumes', 'murcielago', 'fantasma', 'enmascarado'].map((k) => SHEETS[k].img.decode()));
  // v8.1 · Invitados disfrazados dibujados por código (se generan una vez, aquí).
  for (const id of FIESTA_IDS) { const c = renderCharacter(id); SHEETS[id] = toSheet(c.frames, c.anims); }
  return SHEETS;
}

// Copia en escala de grises (Mundo 2 «Noche»): se calcula una vez por hoja, nunca en el bucle.
const GRAY = new Map();
function graySheet(sheet) {
  if (GRAY.has(sheet)) return GRAY.get(sheet);
  // Imagen aún sin cargar: se usa la original (y se vuelve a intentar en el siguiente fotograma).
  if (!(sheet.img.naturalWidth || sheet.img.width)) return sheet;
  const img = sheet.img, c = canvas(img.naturalWidth || img.width, img.naturalHeight || img.height), x = c.getContext('2d');
  x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height), a = d.data;
  for (let i = 0; i < a.length; i += 4) { const v = Math.round(a[i] * 0.3 + a[i + 1] * 0.59 + a[i + 2] * 0.11); a[i] = a[i + 1] = a[i + 2] = v; }
  x.putImageData(d, 0, 0);
  const out = { img: c, meta: sheet.meta };
  GRAY.set(sheet, out);
  return out;
}

// opts.costume: id del traje (spec §3.0f D); 'clasico' usa la hoja oficial de 29 poses.
export function createArt(level, theme = 'calle', opts = {}) {
  const s = sheets();
  const th = buildTheme(theme);
  const art = { ...s, theme: th, themeName: theme, tiles: renderTiles(level, th.tiles), costume: opts.costume ?? 'clasico' };
  // v8.3: Pepe siempre a todo color (la identidad perdida se ve en el retrato del Museo y en el prólogo).
  art.saturation = opts.saturation ?? 1;
  Object.defineProperty(art, 'pepeGray', { get: () => graySheet(s.pepe) });
  Object.defineProperty(art, 'costumesGray', { get: () => graySheet(s.costumes) });
  if (th.gray) for (const k of ['pepe', 'foes', 'costumes', 'murcielago', 'fantasma', 'enmascarado', ...FIESTA_IDS]) art[k] = graySheet(s[k]);
  return art;
}

// Dibuja el fotograma `key` con su ancla (centro de los pies) en (x, y); flip = mirando a la izquierda.
export function sprite(ctx, sheet, key, x, y, flip = false) {
  const f = sheet.meta.frames[key];
  if (!f) return;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(sheet.img, f.x, f.y, f.w, f.h, -f.ax, -f.ay, f.w, f.h);
  ctx.restore();
}
const loop = (sheet, anim, t, fps) => { const a = sheet.meta.anims[anim]; return a[Math.floor(t * fps) % a.length]; };

// ── Bloques ───────────────────────────────────────────────
function bramble(g, x, y) {
  // Zarza con espinas y una rosa (las «Espinas» de Carmesí).
  for (let i = 0; i < 16; i++) {
    const yy = y + 9 + Math.round(Math.sin(i / 2.2) * 3);
    rect(g, '#2a3a1c', x + i, yy, 1, 2);
    if (i % 4 === 1) { rect(g, '#e85a5a', x + i, yy - 2, 1, 2); rect(g, '#e85a5a', x + i + 1, yy + 2, 1, 2); }
  }
  for (let i = 0; i < 16; i += 5) rect(g, '#3e5228', x + i, y + 13, 3, 3);
  rect(g, '#7a0e1e', x + 6, y + 4, 5, 4); rect(g, '#c02a38', x + 7, y + 4, 3, 3); rect(g, '#ff7a7a', x + 7, y + 4, 1, 1);
}

function renderTiles(L, T) {
  const c = canvas(L.w * TILE, L.h * TILE), g = c.getContext('2d');
  for (let ty = 0; ty < L.h; ty++) for (let tx = 0; tx < L.w; tx++) {
    const t = L.tileAt(tx, ty), x = tx * TILE, y = ty * TILE;
    if (t === '#') {
      const top = ty === 0 || L.tileAt(tx, ty - 1) !== '#';
      rect(g, T.body, x, y, 16, 16);
      // Ladrillo / piedra con junta desplazada por fila.
      const off = ty % 2 ? 8 : 0;
      rect(g, T.bodyDk, x, y + 7, 16, 1); rect(g, T.bodyDk, x, y + 15, 16, 1);
      rect(g, T.bodyDk, x + ((off + 4) % 16), y, 1, 7); rect(g, T.bodyDk, x + ((off + 12) % 16), y + 8, 1, 7);
      rect(g, T.bodyHi, x + 1, y + 1, 2, 1);
      if (hash(tx, ty) < 0.2) rect(g, T.bodyHi, x + 9, y + 10, 2, 1);
      if (top) {
        rect(g, '#14060c', x, y, 16, 6);
        rect(g, T.top, x, y, 16, 5); rect(g, T.topHi, x, y, 16, 1);
        rect(g, T.bodyDk, x, y + 5, 16, 1);
        // Salón de fiestas: suelo ajedrezado blanco y negro.
        if (T.checker) for (let k = 0; k < 4; k++) rect(g, (k + tx * 4 + ty) % 2 ? '#e6e6e6' : '#1a1a1a', x + k * 4, y, 4, 5);
      }
    } else if (t === '=') {
      rect(g, '#14060c', x, y, 16, 7);
      rect(g, T.semi, x, y + 1, 16, 4); rect(g, T.semiHi, x, y + 1, 16, 1);
      rect(g, '#14060c', x + 7, y + 7, 2, 4);
    } else if (t === '^') bramble(g, x, y);
    else if (T.water && t === '.' && ty >= L.h - 2 && L.tileAt(tx, ty - 1) === '.' && (L.tileAt(tx - 1, ty) === '#' || L.tileAt(tx + 1, ty) === '#' || ty === L.h - 1)) {
      // Estanque: agua en el foso, con ondas.
      const top = ty === L.h - 2;
      rect(g, T.water[1], x, y + (top ? 6 : 0), 16, top ? 10 : 16);
      if (top) { rect(g, T.water[2], x + 2 + (tx % 3) * 3, y + 6, 5, 1); rect(g, T.water[0], x, y + 15, 16, 1); }
    }
  }
  return c;
}

// ── Objetos ───────────────────────────────────────────────
// Pequeño Carmesí: moneda roja que gira, con una rosa (evoca el disco sin copiar la portada).
export function drawCarmesi(ctx, x, y, t, r = 6) {
  const sx = Math.max(1, Math.round(Math.abs(Math.cos(t * 4 + x)) * r));
  rect(ctx, '#1b1226', x - sx - 1, y - r - 1, sx * 2 + 2, r * 2 + 2);
  rect(ctx, '#a0101e', x - sx, y - r, sx * 2, r * 2);
  rect(ctx, '#d8312b', x - sx, y - r, sx * 2, r * 2 - 2);
  rect(ctx, '#ff8a7a', x - sx, y - r, Math.max(1, sx - 1), 2);
  if (sx >= 4) {
    rect(ctx, '#5c0a18', x - 2, y - 3, 4, 3); rect(ctx, '#ffd0c0', x - 1, y - 3, 1, 1);
    rect(ctx, '#2a5a2a', x, y, 1, 3); rect(ctx, '#3e7a3a', x + 1, y + 1, 2, 1);
  }
}
function drawDisc(ctx, x, y, t, gold = '#e8b33c', hi = '#fff2b0', r = 6) {
  const sx = Math.max(1, Math.round(Math.abs(Math.cos(t * 4 + x)) * r));
  rect(ctx, '#1b1226', x - sx - 1, y - r - 1, sx * 2 + 2, r * 2 + 2);
  rect(ctx, gold, x - sx, y - r, sx * 2, r * 2);
  rect(ctx, hi, x - sx, y - r, Math.max(1, sx - 1), 3);
  rect(ctx, '#1b1226', x - 1, y - 1, 2, 2);
}
// v8.2: Púa de guitarra (triángulo redondeado con brillo) y Antifaz de la fiesta (con destello suave).
export function drawPua(ctx, x, y, s = 1) {
  ctx.fillStyle = '#1b1226'; ctx.beginPath(); ctx.moveTo(x - 5 * s, y - 5 * s); ctx.lineTo(x + 5 * s, y - 5 * s); ctx.lineTo(x, y + 6 * s); ctx.fill();
  ctx.fillStyle = '#ffcf7a'; ctx.beginPath(); ctx.moveTo(x - 4 * s, y - 4 * s); ctx.lineTo(x + 4 * s, y - 4 * s); ctx.lineTo(x, y + 4.5 * s); ctx.fill();
  rect(ctx, '#fff2c0', x - 2 * s, y - 3 * s, 2 * s, 1);
}
export function drawItem(ctx, it, t) {
  if (it.kind === 'pua') { drawPua(ctx, it.x, it.y + Math.round(Math.sin(t * 3 + it.x) * 2), 1.2); return; }
  if (it.kind === 'antifaz') {
    const y = it.y + Math.round(Math.sin(t * 3 + it.x) * 2);
    rect(ctx, '#1b1226', it.x - 8, y - 3, 16, 7); rect(ctx, '#ffcf7a', it.x - 7, y - 2, 14, 5);
    rect(ctx, '#1b1226', it.x - 5, y - 1, 3, 2); rect(ctx, '#1b1226', it.x + 2, y - 1, 3, 2); rect(ctx, '#fff2c0', it.x - 7, y - 2, 14, 1);
    return;
  }
  const y = it.y + Math.round(Math.sin(t * 3 + it.x) * 2);
  if (it.kind === 'amp') {
    // Amplificador (diseño propio): caja con rejilla y piloto.
    rect(ctx, '#1b1226', it.x - 8, y - 8, 16, 15);
    rect(ctx, '#3a2a2a', it.x - 7, y - 7, 14, 13);
    rect(ctx, '#7a6a5a', it.x - 6, y - 4, 12, 8);
    for (let i = -5; i < 6; i += 2) rect(ctx, '#3a2a2a', it.x + i, y - 4, 1, 8);
    rect(ctx, Math.floor(t * 4) % 2 ? '#ff5a4f' : '#ffcf7a', it.x + 4, y - 6, 2, 1);
  } else {
    // Carta de fan: sobre con corazón.
    rect(ctx, '#1b1226', it.x - 8, y - 6, 16, 12);
    rect(ctx, '#efe8d4', it.x - 7, y - 5, 14, 10);
    for (let i = 0; i < 7; i++) rect(ctx, '#b9a8a0', it.x - 7 + i, y - 5 + Math.floor(i / 2), 1, 1), rect(ctx, '#b9a8a0', it.x + 6 - i, y - 5 + Math.floor(i / 2), 1, 1);
    text(ctx, '♥', it.x - 2, y - 2, { color: '#d8312b', shadow: null });
  }
}
function drawChandelier(ctx, h, t, flashes = true) {
  // Candelabro del teatro: el gancho es su aro central.
  rect(ctx, '#3a2a1a', h.x - 1, 0, 2, h.y - 12);
  rect(ctx, '#c8963c', h.x - 22, h.y - 12, 44, 3);
  for (let i = -20; i <= 20; i += 8) {
    rect(ctx, '#c8963c', h.x + i, h.y - 18, 2, 6);
    rect(ctx, flashes && Math.floor(t * 8 + i) % 3 === 0 ? '#ff9a3a' : '#ffcf7a', h.x + i, h.y - 21, 2, 3);
    rect(ctx, '#ff5a4f', h.x + i, h.y - 9, 2, 4);
  }
  ctx.strokeStyle = '#1b1226'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(h.x, h.y, 6, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#f0c870'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(h.x, h.y, 6, 0, Math.PI * 2); ctx.stroke();
}
export function drawHook(ctx, h, t, flashes = true) {
  ctx.strokeStyle = '#1b1226'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(h.x, h.y, 6, 0, Math.PI * 2); ctx.stroke();
  // 🐞 v9.1: antes parpadeaba siempre; ahora, quieto si los destellos están apagados.
  ctx.strokeStyle = flashes && Math.floor(t * 4) % 2 ? '#b9bec6' : '#f7c86a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(h.x, h.y, 6, 0, Math.PI * 2); ctx.stroke();
  rect(ctx, '#5b6068', h.x - 1, h.y - 24, 2, 18);
}

// Guitarra (diseño propio, sin marcas) que aparece con el Solo.
function drawGuitar(ctx, x, y) {
  rect(ctx, '#1b1226', x - 9, y - 4, 13, 12); rect(ctx, '#d8312b', x - 8, y - 3, 11, 10); rect(ctx, '#1b1226', x - 4, y + 1, 3, 3);
  rect(ctx, '#1b1226', x + 3, y - 1, 16, 4); rect(ctx, '#8a5a2a', x + 3, y, 15, 2);
  rect(ctx, '#1b1226', x + 18, y - 3, 5, 7); rect(ctx, '#efe8d4', x + 19, y - 2, 3, 5);
}

// ── Fotograma ─────────────────────────────────────────────
export function drawWorld(ctx, g, art, camX, t, levelId = '', opts = {}) {
  const th = art.theme, flashes = opts.flashes !== false;
  const shake = g.shake > 0 && opts.shake !== false ? Math.round((hash(g.frame, 3) - 0.5) * 6 * Math.min(1, g.shake * 4)) : 0;
  if (th.backdrop && th.backdrop.complete && th.backdrop.naturalWidth) {
    // Fondo panorámico de Gemini: recorre la imagen de un borde al otro a lo largo del nivel.
    const ox = panOffset(camX, g.level.w * TILE, th.backdropW);
    ctx.drawImage(th.backdrop, -ox, 0);
    opts.backdropDecor?.(ctx, ox); // lo que va pegado al fondo (exposición del Museo)
    if (art.themeName === 'azoteas') {
      // Cartel en blanco de la imagen → Colores Ruidosos (lo pone el código, no la IA).
      text(ctx, 'COLORES', 270 - ox, 137, { color: '#c02a38', align: 'center', shadow: null });
      text(ctx, 'RUIDOSOS', 270 - ox, 147, { color: '#1c0810', align: 'center', shadow: null });
    }
  } else {
    ctx.drawImage(th.sky, 0, 0);
    const fx = -Math.floor(camX * 0.2) % 640;
    ctx.drawImage(th.far, fx, 0); ctx.drawImage(th.far, fx + 640, 0);
    const mx = -Math.floor(camX * 0.5) % 256;
    for (let x = mx; x < W; x += 256) ctx.drawImage(th.mid, x, 0);
  }

  ctx.save();
  ctx.translate(-camX + shake, shake ? Math.round((hash(g.frame, 9) - 0.5) * 4) : 0);
  if (levelId === '1-1') {
    // Cartel tutorial (por encima de la cabeza de Pepe).
    rect(ctx, '#1b1226', 52, 66, 132, 58); rect(ctx, '#efe8d4', 54, 68, 128, 54);
    text(ctx, '◀ ▶  MOVER', 60, 72, { color: '#1b1226', shadow: null });
    text(ctx, 'Z / A  SALTAR', 60, 84, { color: '#1b1226', shadow: null });
    text(ctx, 'X / B  MICRÓFONO', 60, 96, { color: '#d8312b', shadow: null });
    text(ctx, 'C / ★  SOLO', 60, 108, { color: '#7a3b8f', shadow: null });
    rect(ctx, '#1b1226', 116, 124, 4, 68);
  }

  ctx.drawImage(art.tiles, 0, 0);
  opts.decor?.(ctx);
  const drawHooks = () => { for (const h of g.level.hooks) th.chandelier ? drawChandelier(ctx, h, t, flashes) : drawHook(ctx, h, t, flashes); };
  drawHooks();
  for (const c of g.level.checkpoints) {
    const on = g.checkpoint.x >= c.x;
    rect(ctx, '#1b1226', c.x - 1, c.y - 34, 3, 34);
    rect(ctx, on ? '#d8312b' : '#6c6577', c.x + 2, c.y - 34, 18, 10);
    text(ctx, 'JMV', c.x + 3, c.y - 33, { color: on ? '#fff' : '#b9bec6', shadow: null });
  }
  if (g.level.goal) {
    // Puerta del Teatro Carmesí (en Noche, la entrada al salón o a la pista).
    const { x, y } = g.level.goal;
    rect(ctx, '#1b1226', x - 18, y - 50, 36, 50);
    rect(ctx, '#7a0e1e', x - 16, y - 48, 32, 48);
    rect(ctx, Math.floor(t * 3) % 2 ? '#ffcf7a' : '#e8a23c', x - 11, y - 40, 22, 40);
    text(ctx, th.goal ?? 'TEATRO', x, y - 60, { color: th.gray ? '#e6e6e6' : '#ffcf7a', align: 'center' });
  }
  for (const pc of g.pieces) if (!pc.taken) (th.piece === 'luna' ? drawLunaPiece : drawCarmesi)(ctx, pc.x, pc.y + Math.round(Math.sin(t * 3 + pc.x) * 2), t);
  for (const it of g.items) if (!it.taken) (it.kind === 'aceite' ? drawAceite : drawItem)(ctx, it, t);

  drawEnemies(ctx, g, art, t, flashes);
  if (g.boss && g.boss.kind !== 'mask') drawBoss(ctx, g, art, t, flashes);
  if (g.disco && !g.disco.taken && g.boss.deadT > 0.4) {
    const dy = g.disco.y + Math.round(Math.sin(t * 3) * 3);
    if (g.disco.kind === 'mascara') {
      drawMascara(ctx, g.disco.x, dy);
      text(ctx, 'MÁSCARA DE FIESTA', g.disco.x, g.disco.y - 22, { color: '#ffffff', align: 'center' });
    } else {
      drawDisc(ctx, g.disco.x, dy, t, '#ffd34a', '#fffbe0', 9);
      text(ctx, 'DISCO DE ORO', g.disco.x, g.disco.y - 22, { color: '#ffd34a', align: 'center' });
    }
  }

  // Púas en vuelo.
  for (const k of g.picks ?? []) drawPua(ctx, k.x + k.w / 2, k.y + k.h / 2, 0.8);
  // Micrófono con su cable.
  if (g.mic.phase !== 'idle') {
    const a = micHand(g), b = micTip(g);
    ctx.strokeStyle = '#1b1226'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.strokeStyle = g.amp > 0 ? '#ff5a4f' : '#5b6068'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    rect(ctx, '#1b1226', b.x - 4, b.y - 4, 8, 8); rect(ctx, '#b9bec6', b.x - 3, b.y - 3, 6, 6); rect(ctx, '#ffffff', b.x - 2, b.y - 2, 2, 2);
  }

  // Pepe (sprites oficiales de la hoja de Colores Ruidosos).
  const p = g.player;
  if (g.guitarT > 0 && flashes) {
    // Solo de guitarra: ondas que salen de Pepe (sin destellos de pantalla completa).
    const k = 1 - g.guitarT / 0.8;
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const r = (k * 200 + i * 30) % 220;
      ctx.globalAlpha = Math.max(0, 0.6 - r / 300);
      ctx.strokeStyle = i % 2 ? '#ffcf7a' : '#ff5a4f'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(p.x + p.w / 2, p.y + p.h / 2, r, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }
  if (g.guitarT > 0) drawGuitar(ctx, p.x + p.w / 2 - 6, p.y + 18);
  // Antifaz: aura dorada alrededor de Pepe (sin parpadeo si los destellos están apagados).
  if (g.star > 0) {
    ctx.save(); ctx.globalAlpha = flashes ? 0.35 + 0.25 * Math.sin(t * 12) : 0.4; ctx.fillStyle = '#ffcf7a';
    ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y + p.h / 2, 16, 26, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  // Invulnerable: parpadea; sin destellos, semitransparente.
  const blink = g.invuln > 0 && g.invuln < 1.1 && g.guitarT <= 0;
  if (!(blink && flashes && Math.floor(t * 15) % 2)) {
    if (blink && !flashes) ctx.globalAlpha = 0.55;
    if (p.frozen > 0) ctx.filter = 'brightness(1.7) saturate(0.4)';
    drawPepe(ctx, g, art, t, p.x + p.w / 2, p.y + p.h, p.facing < 0);
    ctx.filter = 'none'; ctx.globalAlpha = 1;
  }
  // Noche: oscuridad con el farol de Pepe (y los ojos del Enmascarado, que se ven siempre).
  if (g.lantern) { drawDarkness(ctx, g, camX, art); drawHooks(); } // los ganchos se ven también a oscuras
  // «B» sobre el gancho al que iría el micro si lo lanzas ahora.
  const aim = !p.hooked && g.mic.phase === 'idle' && g.status === 'play' ? aimHook(g) : null;
  if (aim) {
    rect(ctx, '#1b1226', aim.x - 6, aim.y - 40, 12, 12); rect(ctx, '#ffcf7a', aim.x - 5, aim.y - 39, 10, 10);
    text(ctx, 'B', aim.x, aim.y - 37, { align: 'center', color: '#1b1226', shadow: null });
  }
  // El Enmascarado se ve aunque esté fuera del farol (si no, sus ataques serían injustos);
  // al acechar y en el apagón, solo sus ojos.
  if (g.boss?.kind === 'mask') { drawMaskBoss(ctx, g, art, t); drawMaskEyes(ctx, g, t); }
  for (const f of g.floats) {
    ctx.globalAlpha = Math.min(1, f.t * 3);
    text(ctx, f.text, f.x, f.y, { color: f.text.startsWith('+♥') ? '#ff5a4f' : '#ffcf7a', align: 'center' });
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

const BUBBLE = (e) => e.kind === 'titular' ? e.word
  : e.kind === 'paparazzi' && e.state === 'aim' ? '¡FOTO!'
  : e.kind === 'reportero' && (e.state === 'windup' || e.state === 'dash') ? '¿DECLARACIONES?'
  : e.kind === 'traidor' && e.state === 'aim' ? '¿Y EL ESCÁNDALO?'
  : e.kind === 'rumor' && e.state === 'dive' ? '¡DICEN QUE…!' : null;

function drawEnemies(ctx, g, art, t, flashes = true) {
  for (const e of g.enemies) {
    if (NOCHE_KINDS.has(e.kind)) { drawNocheEnemy(ctx, g, e, t, art); continue; }
    if (!e.alive && e.deadT > 0.8) continue;
    const fx = e.x + e.w / 2, fy = e.y + e.h, flip = e.facing < 0;
    const carm = e.kind === 'rumor' || e.kind === 'traidor';
    const sheet = e.kind === 'rumor' ? art.rumor : e.kind === 'traidor' ? art.traidor : art.foes;
    const A = { titular: ['titularWalk', 'titularKo', 'titularHurt'], paparazzi: ['papWalk', 'papKo', 'papHurt'], reportero: ['repWalk', 'repKo', 'repHurt'], rumor: ['rumorFly', 'rumorKo', 'rumorKo'], traidor: ['traidorHover', 'traidorKo', 'traidorKo'] }[e.kind];
    if (!e.alive) {
      // Primero el gesto de daño y luego la derrota, desvaneciéndose.
      ctx.save(); ctx.globalAlpha = Math.min(1, 1.6 - e.deadT * 2);
      const ko = sheet.meta.anims[e.deadT < 0.22 ? A[2] : A[1]];
      sprite(ctx, sheet, ko[Math.min(ko.length - 1, Math.floor(e.deadT * 6))], fx, fy + (carm ? e.deadT * 30 : 0), flip);
      ctx.restore();
      continue;
    }
    let key = loop(sheet, A[0], t, e.kind === 'titular' ? 8 : 6);
    if (e.kind === 'paparazzi' && e.state !== 'walk') key = e.state === 'flash' ? 'papFlash0' : 'papAim0';
    if (e.kind === 'reportero' && (e.state === 'dash' || e.state === 'windup')) key = 'repDash0';
    if (e.kind === 'reportero' && e.state === 'rest') key = 'repWalk0';
    if (e.kind === 'rumor' && e.state === 'dive') key = 'rumorDive0';
    if (e.kind === 'traidor' && e.state === 'aim') key = 'traidorAim0';
    if (e.kind === 'traidor' && e.state === 'lunge') key = loop(sheet, 'traidorLunge', t, 12);
    // Los voladores aletean (pequeño balanceo) y el Traidor tiembla al apuntar.
    const wob = carm ? (e.kind === 'traidor' && e.state === 'aim' ? Math.round(Math.sin(t * 60)) : Math.round(Math.sin(t * 10))) : 0;
    sprite(ctx, sheet, key, fx + (e.kind === 'traidor' && e.state === 'aim' ? wob : 0), fy + (e.kind === 'rumor' ? wob : 0), e.kind === 'traidor' ? (e.state === 'aim' || e.state === 'lunge' ? flip : false) : flip);
    if (e.kind === 'paparazzi' && e.state === 'flash' && flashes) {
      ctx.save(); ctx.globalAlpha = 0.45 * (1 - e.t / 0.25); ctx.fillStyle = '#fff6a8';
      ctx.beginPath(); ctx.arc(fx + e.facing * 10, fy - 38, 26, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    const word = BUBBLE(e);
    if (word) {
      const top = Math.round(e.y) - (carm ? 22 : 16);
      const bw = textWidth(word) + 6;
      rect(ctx, '#1b1226', fx - bw / 2 - 1, top - 1, bw + 2, 12);
      rect(ctx, '#ffffff', fx - bw / 2, top, bw, 10);
      text(ctx, word, fx, top + 1, { color: '#d8312b', align: 'center', shadow: null });
    }
  }
}

function drawBoss(ctx, g, art, t) {
  const b = g.boss, fx = b.x + b.w / 2, fy = b.y + b.h, flip = b.facing < 0;
  if (!b.alive) {
    // Se deshace en pétalos.
    if (b.deadT < 1.6) {
      ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, 1.6 - b.deadT));
      sprite(ctx, art.boss, b.deadT < 0.5 ? 'bossKo0' : 'bossKo1', fx + Math.round(Math.sin(b.deadT * 40) * (b.deadT < 0.5 ? 2 : 0)), fy + 1, flip);
      ctx.restore();
      for (let i = 0; i < 26; i++) {
        const a = hash(i, 5) * Math.PI * 2, r = b.deadT * (40 + hash(i, 6) * 70);
        rect(ctx, i % 3 ? '#c02a38' : '#ff7a7a', fx + Math.cos(a) * r, fy - 30 + Math.sin(a) * r + b.deadT * b.deadT * 30, 2, 2);
      }
    }
    return;
  }
  const exposed = b.state === 'exposed';
  const hurtBlink = b.hurtT > 0 && Math.floor(t * 30) % 2;
  const A = art.boss.meta.anims;
  const key = b.hurtT > 0 ? 'bossHurt0'
    : exposed ? A.bossExposed[Math.floor(t * 6) % 2]
    : b.state === 'charge' ? A.bossCharge[b.t > BOSS.charge / 2 ? 1 : 0]
    : b.state === 'beam' ? 'bossFire0'
    : b.state === 'walk' || b.state === 'retreat' ? A.bossWalk[Math.floor(t * 10) % 4] : 'bossWalk0';
  const drop = g.intro ? g.intro.drop : 0; // cae del techo en la cinemática
  if (!(hurtBlink && b.hurtT < BOSS.hurtT / 2)) sprite(ctx, art.boss, g.intro && !g.intro.landed ? 'bossHurt0' : key, fx, fy + 1 - drop, flip);
  if (g.intro && g.intro.landed && g.intro.t < INTRO.dropEnd + 0.6) {
    // Polvo al aterrizar.
    const k = (g.intro.t - INTRO.dropEnd) / 0.6;
    for (let i = 0; i < 14; i++) {
      const side = i % 2 ? 1 : -1, d = 10 + k * (30 + hash(i, 4) * 30);
      ctx.globalAlpha = 1 - k; rect(ctx, '#b9a08a', fx + side * d, fy - 4 - hash(i, 2) * 10 * k, 3, 3); ctx.globalAlpha = 1;
    }
  }
  const lensX = fx + b.facing * 20, lensY = fy - 34;
  if (b.state === 'charge') {
    // Aviso: el lente brilla cada vez más (sin parpadeo rápido).
    const k = b.t / BOSS.charge;
    ctx.save(); ctx.globalAlpha = 0.25 + 0.5 * k; ctx.fillStyle = '#ff9a9a';
    ctx.beginPath(); ctx.arc(lensX, lensY, 6 + k * 8, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // Marca en el suelo o a la altura de la cabeza, para saber qué rayo viene.
    text(ctx, b.beamKind === 'high' ? '¡NO SALTES!' : '¡SALTA!', fx, b.y - 14, { color: '#ffcf7a', align: 'center' });
  }
  if (b.state === 'beam') {
    const r = beamRect(g, b);
    ctx.save();
    ctx.globalAlpha = 0.85; rect(ctx, '#c02a38', r.x, r.y, r.w, r.h);
    ctx.globalAlpha = 0.9; rect(ctx, '#ff9a9a', r.x, r.y + 3, r.w, r.h - 6);
    rect(ctx, '#fff0f0', r.x, r.y + 5, r.w, r.h - 10);
    ctx.restore();
  }
}

function pepeFrame(g, t, art) {
  const p = g.player, m = g.mic;
  if (g.status === 'won') return loop(art.pepe, 'win', t, 8);
  if (g.status === 'gameover') return 'ko1';
  if (g.guitarT > 0) return loop(art.pepe, 'shout', t, 10);
  if (g.invuln > 1.1) return 'hurt0';
  if (p.frozen > 0) return 'crouch0';
  if (m.phase !== 'idle') return m.phase === 'out' && m.len < 20 ? 'throw0' : 'throw1';
  if (!p.onGround) return p.vy < 0 ? 'jump0' : 'jump1';
  if (p.landT < 0.08) return 'land0';
  if (Math.abs(p.vx) > 10) return loop(art.pepe, 'run', t, 8 + (Math.abs(p.vx) / 165) * 8);
  return loop(art.pepe, 'idle', t, 5);
}

// Pepe con su traje. Los trajes solo traen 4 poses (reposo, correr, saltar, lanzar): el resto usa la más parecida.
const POSE = { idle: 'idle', run: 'run', jump: 'jump', throw: 'throw', land: 'idle', crouch: 'idle', ko: 'idle', win: 'idle', hurt: 'jump', shout: 'throw' };
function pepeSprite(ctx, g, art, t, x, y, flip, pepe, costumes) {
  const key = pepeFrame(g, t, art);
  if (!art.costume || art.costume === 'clasico') return sprite(ctx, pepe, key, x, y, flip);
  const pose = POSE[key.replace(/\d+$/, '')] ?? 'idle';
  const bob = pose === 'run' ? Math.floor(t * 12) % 2 : 0;
  sprite(ctx, costumes, `${art.costume}_${pose}`, x, y - bob, flip);
}
export function drawPepe(ctx, g, art, t, x, y, flip) {
  const sat = art.theme?.gray ? 1 : art.saturation ?? 1;
  if (sat >= 1) return pepeSprite(ctx, g, art, t, x, y, flip, art.pepe, art.costumes);
  // Sin identidad completa: Pepe en gris con su color encima, tan opaco como discos haya recuperado.
  const a = ctx.globalAlpha;
  pepeSprite(ctx, g, art, t, x, y, flip, art.pepeGray, art.costumesGray);
  ctx.globalAlpha = a * sat;
  pepeSprite(ctx, g, art, t, x, y, flip, art.pepe, art.costumes);
  ctx.globalAlpha = a;
}
export function drawCostume(ctx, art, id, pose, x, y, flip = false) {
  if (id === 'clasico') return sprite(ctx, art.pepe, pose === 'run' ? 'run2' : pose === 'jump' ? 'jump0' : pose === 'throw' ? 'throw1' : 'idle0', x, y, flip);
  sprite(ctx, art.costumes, `${id}_${pose}`, x, y, flip);
}

const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const BOSS_NAME = { flash: 'CÁMARA FLASH-BOT', mask: 'EL ENMASCARADO' };
export function drawHud(ctx, g, levelName = '', t = 0, art = null) {
  // Barra superior.
  ctx.globalAlpha = 0.55; rect(ctx, '#12040a', 0, 0, W, 30); ctx.globalAlpha = 1;
  for (let i = 0; i < 3; i++) text(ctx, '♥', 6 + i * 9, 5, { color: i < g.hearts ? '#ff5a4f' : '#4a4060' });
  text(ctx, String(g.score).padStart(7, '0'), 36, 5, { color: '#ffffff' });
  if (art?.theme?.piece === 'luna') drawLunaPiece(ctx, 86, 9, 0, 4); else drawCarmesi(ctx, 86, 9, 0, 4);
  text(ctx, `${g.piezas}/${g.pieces.length}`, 94, 5);
  text(ctx, clock(g.time), 124, 5, { color: '#b9c0d0' });
  text(ctx, levelName, W - 6, 5, { align: 'right', color: '#ffcf7a' });
  // Ovación: barra que carga el Solo de guitarra.
  const full = g.ovacion >= OVATION.max;
  text(ctx, 'OVACIÓN', 6, 17, { color: full ? '#ffcf7a' : '#b9a8d6' });
  rect(ctx, '#1b1226', 50, 17, 82, 8); rect(ctx, '#3a2050', 51, 18, 80, 6);
  rect(ctx, full ? (Math.floor(t * 6) % 2 ? '#ffcf7a' : '#ff5a4f') : '#d8312b', 51, 18, Math.round(80 * g.ovacion / OVATION.max), 6);
  if (full) text(ctx, '★ SOLO: C', 138, 17, { color: Math.floor(t * 4) % 2 ? '#ffcf7a' : '#ffffff' });
  else if (g.combo > 1 && g.comboT > 0) text(ctx, `COMBO X${g.combo}`, 138, 17, { color: '#ff9a5a' });
  // Ayudas activas (v8.2), bajo la barra.
  const aids = [g.star > 0 && `ANTIFAZ ${Math.ceil(g.star)}`, g.pua > 0 && `PÚA ${Math.ceil(g.pua)}`].filter(Boolean);
  if (aids.length) text(ctx, aids.join('  '), W - 6, 33, { align: 'right', color: '#ffcf7a' });
  if (g.amp > 0) text(ctx, `MICRO X2 ${Math.ceil(g.amp)}`, W - 6, 17, { align: 'right', color: '#ff5a4f' });
  else if (g.lantern) {
    text(ctx, 'FAROL', W - 50, 17, { align: 'right', color: '#e6e6e6' });
    rect(ctx, '#1b1226', W - 46, 17, 40, 8); rect(ctx, g.lantern.oil < 0.25 ? '#ff9a5a' : '#ffe9a8', W - 45, 18, Math.round(38 * g.lantern.oil), 6);
  }
  if (g.assist) text(ctx, 'ASISTIDO', 6, 34, { color: '#7ad0ff' });
  // Vida del jefe.
  const b = g.boss;
  if (b && b.alive) {
    const maxHp = b.kind === 'mask' ? MASK.hp : BOSS.hp, seg = Math.floor(120 / maxHp);
    text(ctx, BOSS_NAME[b.kind] ?? '', W / 2, H - 20, { align: 'center', color: '#ffcf7a' });
    rect(ctx, '#1b1226', W / 2 - 61, H - 11, 122, 8);
    for (let i = 0; i < maxHp; i++) rect(ctx, i < b.hp ? (b.phase === 2 ? '#ff5a4f' : '#d8312b') : '#3a2050', W / 2 - 60 + i * seg, H - 10, seg - 1, 6);
  }
  // Pensamiento de Pepe al tocar un checkpoint (ficción).
  drawThought(ctx, g.thought);
  // Primera vez que se recoge un objeto: su explicación (guía de objetos).
  if (g.hint) {
    ctx.globalAlpha = Math.min(1, g.hint.t * 3);
    const w = Math.min(W - 12, g.hint.text.length * 6 + 16), y0 = H - 46;
    rect(ctx, '#1b1226', W / 2 - w / 2 - 1, y0 - 1, w + 2, 15); rect(ctx, '#ffcf7a', W / 2 - w / 2, y0, w, 13);
    text(ctx, g.hint.text, W / 2, y0 + 3, { align: 'center', color: '#1b1226', shadow: null });
    ctx.globalAlpha = 1;
  }
  // Frase verificada al vencer a un Titular (cartel pequeño abajo).
  const pop = g.popups.at(-1);
  if (pop) {
    const lines = wrap(pop.text, 50);
    const h = lines.length * 9 + 14, y0 = H - h - (b && b.alive ? 26 : 6);
    ctx.globalAlpha = Math.min(1, pop.t * 2);
    rect(ctx, '#1b1226', 8, y0, W - 16, h);
    rect(ctx, '#efe8d4', 9, y0 + 1, W - 18, h - 2);
    lines.forEach((l, i) => text(ctx, l, W / 2, y0 + 4 + i * 9, { color: '#1b1226', align: 'center', shadow: null }));
    text(ctx, `— ${pop.source}`, W / 2, y0 + 4 + lines.length * 9, { color: '#d8312b', align: 'center', shadow: null });
    ctx.globalAlpha = 1;
  }
}

const CHROME = ['#ffffff', '#e6e9f0', '#b9c0d0', '#8a93a8', '#c9cfdc', '#f0f2f7', '#9aa2b5'];
const TITLE_SKY = ['#12040a', '#240812', '#3a0c1a', '#5c1020', '#8e1426', '#c02a38', '#e85a5a'];

// Sello JMV propio (arcade de los 90; no imita logos de terceros).
export function drawBadge(ctx, x, y) {
  rect(ctx, '#1b1226', x - 32, y - 4, 64, 30);
  rect(ctx, '#d8312b', x - 30, y - 2, 60, 26);
  rect(ctx, '#94201d', x - 30, y + 20, 60, 4);
  text(ctx, 'JMV', x, y + 1, { scale: 3, align: 'center', bands: CHROME, shadow: '#1b1226' });
}

export function drawTitle(ctx, t, art) {
  for (let i = 0; i < TITLE_SKY.length; i++) rect(ctx, TITLE_SKY[i], 0, Math.floor((i * H) / TITLE_SKY.length), W, 34);
  // v8.3: solo el nombre del juego (spec §3.0f I). El título vive en GAME_TITLE.
  drawBadge(ctx, W / 2, 26);
  const n = GAME_TITLE.length, y0 = 92 - (n - 1) * 14;
  GAME_TITLE.forEach((line, i) => {
    const small = line.length <= 3; // «VS.» más pequeño
    text(ctx, line, W / 2, y0 + i * 26 + (small ? 4 : 0), { scale: small ? 2 : 3, align: 'center', ...(i === n - 1 ? { bands: CHROME } : { color: i === 0 ? '#f7c86a' : '#ffffff' }) });
  });
  if (Math.floor(t * 2) % 2 === 0) text(ctx, 'PULSA START', W / 2, 168, { align: 'center' });
  text(ctx, 'B: OPCIONES', W / 2, 184, { align: 'center', color: '#8a7a9a' });
  text(ctx, 'HOMENAJE NO OFICIAL · @COLORESRUIDOSOS', W / 2, 208, { align: 'center', color: '#e6e9f0' });
}

// Tarjetas entre niveles: «nivel superado» y «¿Sabías que…?».
export function drawCard(ctx, card, art, t) {
  ctx.fillStyle = 'rgba(18,4,10,0.88)'; ctx.fillRect(0, 0, W, H);
  if (card.kind === 'clear') {
    if (art) sprite(ctx, art.pepe, loop(art.pepe, 'win', t, 8), W / 2, 72);
    text(ctx, `${card.id} SUPERADO`, W / 2, 82, { scale: 2, align: 'center', color: '#ffcf7a' });
    text(ctx, `TIEMPO ${clock(card.time)}`, W / 2, 108, { align: 'center' });
    text(ctx, `PUNTOS ${String(card.score).padStart(7, '0')}`, W / 2, 120, { align: 'center' });
    text(ctx, `${card.pieceName ?? 'CARMESÍS'} ${card.piezas}/${card.total}`, W / 2, 132, { align: 'center' });
    text(ctx, `SIGUIENTE: ${card.next}`, W / 2, 148, { align: 'center', color: '#ff9a5a' });
    (card.unlocks ?? []).forEach((u, i) => text(ctx, u, W / 2, 162 + i * 10, { align: 'center', color: '#7ad0ff' }));
  } else if (card.kind === 'fact') {
    text(ctx, '¿SABÍAS QUE…?', W / 2, 24, { scale: 2, align: 'center', color: '#ffcf7a' });
    let y = 54;
    for (const f of card.facts) {
      for (const l of wrap(f.text, 46)) { text(ctx, l, W / 2, y, { align: 'center' }); y += 11; }
      text(ctx, `FUENTE: ${f.source}`, W / 2, y + 2, { align: 'center', color: '#b9a8d6' });
      y += 24;
    }
  } else if (card.kind === 'recuerdo') {
    drawRecuerdo(ctx, card, art, t);
    return;
  } else if (card.kind === 'chapter') {
    // Por qué Pepe está aquí (spec §3.0e).
    rect(ctx, '#7a0e1e', 0, 22, W, 2); rect(ctx, '#7a0e1e', 0, H - 24, W, 2);
    text(ctx, `CAPÍTULO ${card.n}`, W / 2, 34, { align: 'center', color: '#ff9a9a' });
    text(ctx, card.title, W / 2, 48, { scale: 2, align: 'center', bands: CHROME });
    card.lines.forEach((l, i) => text(ctx, l, W / 2, 80 + i * 12, { align: 'center', color: '#efe8d4' }));
    if (Math.floor(t * 2) % 2 === 0) text(ctx, 'PULSA A PARA EMPEZAR', W / 2, 186, { align: 'center', color: '#ffcf7a' });
    return;
  }
  if (Math.floor(t * 2) % 2 === 0) text(ctx, 'PULSA A PARA SEGUIR', W / 2, 190, { align: 'center' });
}

export function drawEnd(ctx, g, best, art, t = 0, info = {}) {
  ctx.fillStyle = 'rgba(18,4,10,0.85)'; ctx.fillRect(0, 0, W, H);
  if (g.status === 'won') {
    if (art) drawCostume(ctx, art, art.costume, 'idle', W / 2, 70);
    text(ctx, info.title ?? '¡MUNDO COMPLETADO!', W / 2, 80, { scale: 2, align: 'center', color: '#ffcf7a' });
    text(ctx, `PUNTOS ${String(g.score).padStart(7, '0')}`, W / 2, 106, { align: 'center' });
    if (best) text(ctx, `RÉCORD ${String(best).padStart(7, '0')}`, W / 2, 118, { align: 'center', color: '#b9c0d0' });
    (info.lines ?? []).forEach((l, i) => text(ctx, l, W / 2, 140 + i * 11, { align: 'center', color: '#ff9a5a' }));
  } else {
    if (art) sprite(ctx, art.pepe, 'ko1', W / 2, 70);
    text(ctx, 'LOS TITULARES', W / 2, 84, { scale: 2, align: 'center', color: '#ff5a4f' });
    text(ctx, 'GANARON ESTA VEZ…', W / 2, 106, { scale: 2, align: 'center', color: '#ff5a4f' });
    text(ctx, 'A: REPETIR EL NIVEL · B: AL MUSEO', W / 2, 134, { align: 'center', color: '#b9c0d0' });
  }
  text(ctx, g.status === 'won' ? 'PULSA A PARA VOLVER AL MUSEO' : '', W / 2, 180, { align: 'center' });
}

// Cinemática de entrada del jefe (spec §3.0d): bandas de cine, foco sobre el jefe, cartel y «¡A ESCENA!».
const ease = (x) => Math.max(0, Math.min(1, x));
const BOSS_CARD = {
  flash: { world: 'JEFE · MUNDO 1', name: 'CÁMARA FLASH-BOT', sub: '«LA PRENSA ROSA»', bg: '#7a0e1e', sub2: '#ffb3b3' },
  mask: { world: 'JEFE · MUNDO 2', name: 'EL ENMASCARADO', sub: '«EL ANFITRIÓN»', bg: '#1a1a1a', sub2: '#d0d0d0' },
};
export function drawIntro(ctx, g, camX, t, opts = {}) {
  const it = g.intro, b = g.boss;
  if (!it || !b) return;
  const out = ease((INTRO.total - it.t) / 0.3), inn = ease(it.t / 0.4);
  // Luz baja con un foco sobre el escenario (sin destellos).
  const bx = b.x + b.w / 2 - camX, by = b.y + b.h / 2 - it.drop;
  ctx.save();
  ctx.globalAlpha = 0.5 * inn * out;
  ctx.fillStyle = '#05010a';
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(bx, by, 56 + (it.landed ? 6 : 0), 0, Math.PI * 2); ctx.fill('evenodd');
  ctx.restore();
  // Focos del jefe que se encienden al aterrizar.
  if (it.landed && opts.flashes !== false) {
    const k = ease((it.t - INTRO.dropEnd) / 0.5) * out;
    ctx.save(); ctx.globalAlpha = 0.35 * k; ctx.fillStyle = '#fff2c0';
    for (const dx of [-12, 10]) { ctx.beginPath(); ctx.arc(bx + dx * (b.facing < 0 ? -1 : 1), b.y - 14, 8, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  // Bandas de cine.
  const bar = Math.round(24 * inn * out);
  rect(ctx, '#000000', 0, 0, W, bar); rect(ctx, '#000000', 0, H - bar, W, bar);
  // Cartel del jefe: entra desde la derecha.
  if (it.t >= INTRO.card && it.t < INTRO.fight + 0.1) {
    const k = ease((it.t - INTRO.card) / 0.3), x = W / 2 + (1 - k) * 220;
    const c = BOSS_CARD[b.kind] ?? BOSS_CARD.flash;
    rect(ctx, '#1b1226', x - 130, 40, 260, 54); rect(ctx, c.bg, x - 128, 42, 256, 50); rect(ctx, '#c8963c', x - 128, 42, 256, 2); rect(ctx, '#c8963c', x - 128, 90, 256, 2);
    text(ctx, c.world, x, 48, { align: 'center', color: '#ffcf7a' });
    text(ctx, c.name, x, 60, { scale: 2, align: 'center', bands: CHROME });
    text(ctx, c.sub, x, 79, { align: 'center', color: c.sub2 });
  }
  if (it.t >= INTRO.fight) {
    const k = ease((it.t - INTRO.fight) / 0.15);
    text(ctx, '¡A ESCENA!', W / 2, 100 - (1 - k) * 10, { scale: 3, align: 'center', color: '#ffcf7a' });
  }
  if (it.t >= INTRO.skip && bar > 8) text(ctx, 'A: SALTAR', W - 6, H - 15, { align: 'right', color: '#8a7a9a', shadow: null });
}
