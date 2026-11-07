// main.js — director: capas, preguntas, cuenta regresiva, transiciones, paleta por época, eventos de sonido, textos
import { W, H, SCALE, C, T, GBI, LUT, darken, whiten, bayer, bayer8, hash, clamp, FB, sprFromRows } from './px.js';
import { text, textW, textOutlined, wrap } from './font.js';
import { QUESTIONS, RESULT, SAVE } from './content.js';
import { BPM, SECS, DUR, QUIZ, MARK, sec } from './timeline.js';
import { PANEL, sky97, line05, bath09, tramp21, kitchen97, city } from './scenes.js';
import { MASKS, fanSprite } from './fan.js';

const q = new URLSearchParams(location.search);
const cv = document.getElementById('c');
const fb = new FB(W, H);
const lo = document.createElement('canvas'); lo.width = W; lo.height = H;
const g = lo.getContext('2d'), img = g.createImageData(W, H), u32 = new Uint32Array(img.data.buffer);
const out = cv.getContext('2d'); out.imageSmoothingEnabled = false;

const HDR_H = 63;                                   // la banda de marca (arriba) siempre a todo color
const QW = { x: 4, y: 170, w: 172, h: 100 };        // ventana de pregunta
const P = PANEL;
const mod = (n, m) => ((n % m) + m) % m;
const eo = x => 1 - (1 - x) * (1 - x);
const SKIN = { 1997: 'gb', 2005: 'nes' };
const skinOf = era => SKIN[era] || 'snes';

// —— Ventanas (gramática de RPG: borde en capas, fondo con dither) ——
function win(x, y, w, h, skin) {
  if (skin === 'gb') {
    const [K, D, , Wt] = GBI;
    fb.rect(x + 1, y, w - 2, h, K); fb.rect(x, y + 1, w, h - 2, K); fb.rect(x + 1, y + 1, w - 2, h - 2, D); fb.rect(x + 2, y + 2, w - 4, h - 4, Wt); return;
  }
  if (skin === 'nes') {
    fb.rect(x + 1, y, w - 2, h, C.ink); fb.rect(x, y + 1, w, h - 2, C.ink);
    fb.rect(x + 2, y + 2, w - 4, h - 4, C.white); fb.rect(x + 3, y + 3, w - 6, h - 6, C.ink); return;
  }
  fb.rect(x + 2, y, w - 4, h, C.ink); fb.rect(x, y + 2, w, h - 4, C.ink); fb.rect(x + 1, y + 1, w - 2, h - 2, C.ink);
  fb.rect(x + 2, y + 1, w - 4, h - 2, C.white); fb.rect(x + 1, y + 2, w - 2, h - 4, C.white);
  fb.rect(x + 2, y + 2, w - 4, h - 4, C.silver);
  fb.gradV(x + 3, y + 3, w - 6, h - 6, [C.blue, C.navy, C.navy, C.night]);
  fb.hline(x + 3, x + w - 4, y + 3, C.blue);
}
const ink = skin => skin === 'gb' ? { fg: GBI[0], sh: null, dim: GBI[2] } : skin === 'nes' ? { fg: C.white, sh: null, dim: C.slate } : { fg: C.white, sh: C.night, dim: C.slate };

const HAND = sprFromRows(['.kk......', 'kwwk.....', 'kwwwkkkk.', 'kwwwwwwwk', 'kwwwwkkk.', 'kwwwwk...', '.kkkk....'], { k: C.ink, w: C.white });
const CROSS = sprFromRows(['k...k', '.k.k.', '..k..', '.k.k.', 'k...k'], { k: C.hot });

// —— Textos visibles (para readcheck) y subtítulos ——
let TX = [];
const say = (id, s, x, y, sc = 1) => TX.push({ id, text: s, x0: x * SCALE, y0: (y - 3) * SCALE, x1: (x + textW(s, sc)) * SCALE, y1: (y + 9 * sc) * SCALE });

// —— Banda de marca ——
function header(t) {
  fb.rect(0, 0, W, HDR_H, C.bInk);
  const cols = [C.pk, C.bBlue, C.bYellow, C.ok, C.bOrange];
  for (let i = 0; i < 5; i++) fb.rect(i * 36, 0, 36, 3, cols[i]);
  for (let y = 4; y < HDR_H; y += 2) for (let x = (y >> 1) & 1; x < W; x += 6) fb.px(x, y, C.night);
  const s0 = 'LOVE OF LESBIAN · TRIVIA', x0 = Math.round((W - textW(s0)) / 2);
  text(fb, s0, x0, 15, C.pkL); say('hdr0', s0, x0, 15);
  const row = y => r => r < 0 ? C.white : r < 3 ? C.bYellow : C.bOrange;
  for (const [s, y] of [['¿QUÉ TAN', 28], ['FAN ERES?', 45]]) {
    const x = Math.round((W - textW(s, 2)) / 2);
    textOutlined(fb, s, x, y, row(y), C.bInk, 2); say('hdr' + y, s, x, y, 2);
  }
  fb.hline(0, W, HDR_H - 1, C.pk);
}

// —— Pregunta, opciones, cuenta y revelación ——
function quiz(i, t) {
  const Q = QUESTIONS[i], Z = QUIZ[i], skin = skinOf(Q.era), k = ink(skin);
  const lt = t - Z.qIn;
  const slide = Math.round((1 - eo(clamp((t - Z.qIn + (i === 0 ? 1 : 0)) / 0.3, 0, 1))) * 14);
  win(QW.x, QW.y + slide, QW.w, QW.h, skin);
  const lines = wrap(Q.text, QW.w - 16);
  const nType = i === 0 ? 1e9 : Math.floor(lt * 70);
  let used = 0;
  lines.forEach((ln, j) => {
    const vis = ln.slice(0, Math.max(0, nType - used)); used += ln.length + 1;
    text(fb, vis, QW.x + 8, QW.y + slide + 8 + j * 11, k.fg, k.sh);
  });
  if (lt >= 0) TX.push({ id: 'q' + i, text: Q.text, x0: (QW.x + 8) * SCALE, y0: (QW.y + 5) * SCALE, x1: (QW.x + QW.w - 8) * SCALE, y1: (QW.y + 8 + lines.length * 11) * SCALE });
  const oy = QW.y + slide + 12 + lines.length * 11;
  const revealed = t >= Z.reveal;
  // cursor: recorre opciones durante la cuenta; duda (sin rebote) en el último segundo
  const path = HANDS[i];
  let hi = path[0], hy = 0;
  const marks = [Z.count[0], Z.count[1], Z.count[2], Z.reveal];
  for (let m = 0; m < 4; m++) if (t >= marks[m]) hi = path[m];
  const prev = (() => { let p = path[0]; for (let m = 0; m < 4; m++) if (t >= marks[m] + .15) p = path[m]; return p; })();
  const mt = marks.findLast(m => t >= m) ?? marks[0];
  hy = Math.round((prev + (hi - prev) * eo(clamp((t - mt) / .15, 0, 1))) * 12);
  Q.options.forEach((o, j) => {
    const at = Z.optsIn + (i === 0 ? 0 : j * 0.1);
    if (t < at) return;
    const y = oy + j * 12, pop = t - at < 0.06 ? 1 : 0;
    const isOk = j === Q.correct;
    if (revealed && isOk) { fb.rect(QW.x + 16, y - 2 - pop, QW.w - 24, 11, C.ok); fb.rect(QW.x + 16, y + 8 - pop, QW.w - 24, 1, C.okD); }
    const col = revealed ? (isOk ? C.pInk : k.dim) : k.fg;
    text(fb, o, QW.x + 20, y - pop, col, revealed && isOk ? null : k.sh);
    say('q' + i + 'o' + j, o, QW.x + 20, y);
  });
  // cursor y marca de error en el jefe
  if (t >= Z.count[0] - .3 && t < Z.out) {
    const bob = t < Z.count[2] && mod(Math.floor(t * 4), 2);
    fb.blit(HAND, QW.x + 6 + (bob ? 1 : 0), oy + hy + 1);
    if (revealed && path[3] !== Q.correct && mod(Math.floor((t - Z.reveal) * 6), 2) === 0) fb.blit(CROSS, QW.x + QW.w - 14, oy + path[3] * 12 + 1);
  }
  // barra de tiempo (3 s)
  const f = clamp((t - Z.count[0]) / 3, 0, 1);
  if (t >= Z.count[0] - .5 && !revealed) {
    fb.rect(P.x, P.y + P.h + 1, P.w, 2, skin === 'gb' ? GBI[0] : C.ink);
    fb.rect(P.x, P.y + P.h + 1, Math.round(P.w * (1 - f)), 2, skin === 'gb' ? GBI[3] : f > .66 ? C.hot : C.bYellow);
  }
  // número grande de la cuenta
  for (let n = 0; n < 3; n++) {
    const a = Z.count[n]; if (t < a || t >= a + 1) continue;
    const s = String(3 - n), sc = t - a < .08 ? 4 : 3, w = textW(s, sc);
    const x = P.x + P.w - 10 - w, y = P.y + 8;
    textOutlined(fb, s, x, y, skin === 'gb' ? GBI[3] : (n === 2 ? C.hot : C.white), skin === 'gb' ? GBI[0] : C.ink, sc);
  }
  return { revealed };
}
// a dónde apunta el cursor en: 3, 2, 1, revelación (la última es su respuesta)
const HANDS = [[0, 3, 1, 1], [0, 1, 3, 2], [2, 0, 3, 1], [3, 0, 1, 2], [2, 3, 0, 0]];

function tag(s, skin) {
  const k = ink(skin), w = textW(s) + 8;
  if (skin === 'gb') { fb.rect(P.x + 3, P.y + 3, w, 12, GBI[0]); text(fb, s, P.x + 7, P.y + 6, GBI[3]); }
  else { fb.rect(P.x + 3, P.y + 3, w, 12, C.ink); fb.rect(P.x + 4, P.y + 4, w - 2, 10, skin === 'nes' ? C.ink : C.navy); text(fb, s, P.x + 7, P.y + 6, C.white); }
  say('tag', s, P.x + 7, P.y + 6);
}
function panelFrame(skin) {
  const c = skin === 'gb' ? GBI[0] : C.ink;
  fb.rect(P.x - 2, P.y - 2, P.w + 4, 2, c); fb.rect(P.x - 2, P.y + P.h, P.w + 4, 2, c);
  fb.rect(P.x - 2, P.y, 2, P.h, c); fb.rect(P.x + P.w, P.y, 2, P.h, c);
}
function body(skin) {                             // fondo bajo la banda
  if (skin === 'gb') fb.rect(0, HDR_H, W, H - HDR_H, GBI[1]);
  else if (skin === 'nes') fb.rect(0, HDR_H, W, H - HDR_H, C.ink);
  else { fb.rect(0, HDR_H, W, H - HDR_H, C.night); for (let y = HDR_H; y < H; y++) for (let x = 0; x < W; x++) if (bayer(x, y) < .18) fb.px(x, y, C.dslate); }
  // pie: decorativo (lo tapa la interfaz del celular)
  const fy = QW.y + QW.h + 4;
  for (let x = 0; x < W; x += 4) fb.rect(x, fy, 2, 1, skin === 'gb' ? GBI[2] : C.slate);
  const hd = '@coloresruidosos'; text(fb, hd, Math.round((W - textW(hd)) / 2), fy + 8, skin === 'gb' ? GBI[3] : C.pkL);
}

// —— Pantallas finales ——
function result(t) {
  body('snes');
  kitchen97(fb, t, 'up'); panelFrame('snes');
  const s = RESULT.title, w = textW(s) + 12, x = Math.round((W - w) / 2);
  win(x, P.y + 4, w, 17, 'snes'); text(fb, s, x + 6, P.y + 9, C.bYellow, C.night); say('rt', s, x + 6, P.y + 9);
  win(QW.x, QW.y, QW.w, QW.h, 'snes');
  RESULT.ranks.forEach(([sc, name], j) => {
    const at = MARK.flood[0] + 0.4 + j * MARK.rankStep; if (t < at) return;
    const y = QW.y + 8 + j * 21, dy = t - at < .1 ? -2 : 0;
    fb.blit(MASKS[2 - j], QW.x + 8, y - 4 + dy);
    text(fb, sc, QW.x + 28, y + 1 + dy, C.bYellow, C.night); text(fb, name, QW.x + 52, y + 1 + dy, C.white, C.night);
    say('r' + j, sc + ' ' + name, QW.x + 28, y + 1);
  });
  if (t >= MARK.cta) {
    const s2 = RESULT.cta + ' ↓', w2 = textW(s2) + 12, x2 = Math.round((W - w2) / 2), y2 = QW.y + 74;
    fb.rect(x2, y2, w2, 15, C.pInk); fb.rect(x2 + 1, y2 + 1, w2 - 2, 13, C.pk);
    text(fb, s2, x2 + 6, y2 + 4 + (mod(Math.floor(t * 4), 2) ? 1 : 0), C.pInk); say('cta', s2, x2 + 6, y2 + 4);
  }
}
function saveScreen(t) {
  body('snes');
  city(fb, t, P.x, P.y, P.w, P.h); panelFrame('snes');
  // fan de espaldas mirando la ciudad (silueta con bufanda)
  const fs = fanSprite('stand', 0, mod(Math.floor(t * 12), 3), 0, false, true);
  fb.blit(fs, P.x + 24, P.y + P.h - fs.h + 1);
  const s = SAVE.title, w = textW(s) + 12, x = Math.round((W - w) / 2);
  win(x, P.y + 4, w, 27, 'snes'); text(fb, s, x + 6, P.y + 9, C.white, C.night); say('st', s, x + 6, P.y + 9);
  const s1 = SAVE.sub, x1 = Math.round((W - textW(s1)) / 2); text(fb, s1, x1, P.y + 20, C.silver, C.night); say('ss', s1, x1, P.y + 20);
  // sticker "VIENE A MÉXICO": rosa protegido, ligeramente inclinado por escalones
  if (t >= MARK.saveIn + .5) {
    const st = SAVE.sticker, sw = textW(st) + 12, sx = P.x + P.w - sw - 6, sy = P.y + P.h - 26, pop = t - MARK.saveIn - .5 < .1 ? -2 : 0;
    for (let j = 0; j < 17; j++) fb.rect(sx - 1 + Math.floor(j / 6), sy + j + pop, sw + 2, 1, C.pInk);
    for (let j = 1; j < 16; j++) fb.rect(sx + Math.floor(j / 6), sy + j + pop, sw, 1, C.pk);
    text(fb, st, sx + 7, sy + 5 + pop, C.pInk); fb.px(sx + 1, sy + 2 + pop, C.pkL); fb.px(sx + 2, sy + 2 + pop, C.pkL); say('stk', st, sx + 7, sy + 5);
  }
  win(QW.x, QW.y, QW.w, QW.h, 'snes');
  text(fb, 'GUARDAR PARTIDA', QW.x + 8, QW.y + 8, C.bYellow, C.night); say('sv', 'GUARDAR PARTIDA', QW.x + 8, QW.y + 8);
  SAVE.slots.forEach(([c, d], j) => {
    const at = MARK.saveIn + .3 + j * .3; if (t < at) return;
    const y = QW.y + 24 + j * 16;
    fb.rect(QW.x + 16, y - 3, QW.w - 24, 14, C.navy); fb.hline(QW.x + 16, QW.x + QW.w - 9, y + 10, C.blue);
    text(fb, c, QW.x + 20, y, C.white, C.night); text(fb, d, QW.x + QW.w - 12 - textW(d), y, C.bYellow, C.night);
    say('sl' + j, c + ' ' + d, QW.x + 20, y);
  });
  const u1 = SAVE.url1 + SAVE.url2;
  if (t >= MARK.saveIn + 1) {
    text(fb, SAVE.url1, QW.x + 20, QW.y + 60, C.cyan, C.night); text(fb, SAVE.url2, QW.x + 20 + textW(SAVE.url1), QW.y + 60, C.bYellow, C.night);
    say('url', u1, QW.x + 20, QW.y + 60);
  }
  if (t >= MARK.saveIn + 2) { const a = SAVE.again; text(fb, a + ' ▶', QW.x + 20, QW.y + 80, C.white, C.night); say('again', a + ' ▶', QW.x + 20, QW.y + 80); }
  // cursor: CDMX → PUEBLA → ¿OTRA PARTIDA?
  const rows = [QW.y + 25, QW.y + 41, QW.y + 81], marks = [MARK.saveIn + .3, MARK.saveIn + 1.6, MARK.again];
  let r = 0; for (let m = 0; m < 3; m++) if (t >= marks[m]) r = m;
  const pr = Math.max(0, r - 1), k = eo(clamp((t - marks[r]) / .15, 0, 1)), y = Math.round(rows[pr] + (rows[r] - rows[pr]) * k);
  if (t >= marks[0]) fb.blit(HAND, QW.x + 6 + (mod(Math.floor(t * 4), 2) && t < MARK.again ? 1 : 0), y);
}

// —— Cuadro ——
function draw(t) {
  TX = [];
  fb.clip = [0, 0, W, H];
  const S = sec(t);
  let lutBody = LUT[S.lut === 'gb4' ? 'gb4k' : S.lut === 'nes' ? 'nesKeep' : 'full'];
  let lutPanel = lutBody;
  if (S.id.startsWith('q')) {
    const i = +S.id[1] - 1, Q = QUESTIONS[i], skin = skinOf(Q.era);
    body(skin);
    const lt = t - S.t0;
    [sky97, line05, bath09, tramp21][i](fb, lt);
    panelFrame(skin); tag(Q.level + ' · ' + Q.era, skin);
    quiz(i, t);
  } else if (S.id === 'turn') {
    // la P4 se queda en pantalla mientras todo calla y tiembla
    body('snes'); tramp21(fb, 4.5 + Math.min(t - S.t0, .02)); panelFrame('snes'); tag(QUESTIONS[3].level + ' · 2021', 'snes'); quiz(3, Math.min(t, 19.49));
  } else if (S.id === 'boss') {
    const i = 4, Q = QUESTIONS[i], Z = QUIZ[i];
    body('gb');
    const lit = t >= Z.reveal;
    kitchen97(fb, t - S.t0, lit);
    panelFrame('gb');
    tag(Q.level, 'gb');
    if (t >= Z.qIn - .3) quiz(i, Math.max(t, Z.qIn - .3));
    if (lit) {                                    // la luz se prende por escalones de paleta
      const f = 1 - clamp(Math.floor((t - Z.reveal) / .06) / 4, 0, 1);
      lutPanel = darken(LUT.gb4k, f);
      if (t >= Z.reveal + .25) {
        const s = Q.extra, w = textW(s) + 10, x = Math.round((W - w) / 2), y = P.y + P.h - 17;
        fb.rect(x, y, w, 13, GBI[0]); fb.rect(x + 1, y + 1, w - 2, 11, GBI[3]); text(fb, s, x + 5, y + 3, GBI[0]); say('extra', s, x + 5, y + 3);
      }
    }
  } else if (S.id === 'result') result(t);
  else saveScreen(t);
  header(t);
  return { S, lutBody, lutPanel };
}

function present(t, st) {
  const { S, lutBody, lutPanel } = st;
  const full = LUT.full;
  const inPanel = (x, y) => x >= P.x && x < P.x + P.w && y >= P.y && y < P.y + P.h;
  // inundación de color (onda de dither desde el fan)
  const fl = (t - MARK.flood[0]) / (MARK.flood[1] - MARK.flood[0]);
  const flooding = S.id === 'result' && fl < 1;
  for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) {
    let L;
    if (y < HDR_H) L = full;
    else if (flooding) { const d = Math.hypot(x - (P.x + 92), (y - (P.y + 70)) * .8) / 230; L = d + (bayer8(x, y) - .5) * .25 < fl ? full : LUT.gb4k; }
    else L = inPanel(x, y) ? lutPanel : lutBody;
    u32[i] = L[fb.d[i]];
  }
  // cruces de mosaico entre épocas (solo bajo la banda)
  let n = 1;
  for (const m of MARK.mosaic) { const a = 1 - Math.abs(t - m) / .4; if (a > 0) n = Math.max(n, 1 + Math.round(a * 11)); }
  if (t > DUR - .45) n = Math.max(n, 1 + Math.round((t - (DUR - .45)) / .45 * 11));
  if (n > 1) mosaicBelow(n);
  // remolino de encuentro → blanco, y entrada por disolvencia Bayer
  if (t >= MARK.swirl[0] && t < MARK.swirl[1]) swirl((t - MARK.swirl[0]) / (MARK.swirl[1] - MARK.swirl[0]));
  if (t >= MARK.swirl[1] && t < MARK.swirl[1] + .35) { const f = 1 - (t - MARK.swirl[1]) / .35; for (let y = HDR_H, i = HDR_H * W; y < H; y++) for (let x = 0; x < W; x++, i++) if (bayer(x, y) < f) u32[i] = 0xffffffff; }
  g.putImageData(img, 0, 0);
  // sacudida 3-2-1 px en 8 cuadros
  let sx = 0;
  const ds = t - MARK.shake; if (ds >= 0 && ds < 8 / 24) sx = [3, -3, 2, -2, 1, -1, 1, 0][Math.floor(ds * 24)];
  out.fillStyle = '#141414'; out.fillRect(0, 0, cv.width, cv.height);
  out.drawImage(lo, 0, 0, W, HDR_H, 0, 0, W * SCALE, HDR_H * SCALE);
  out.drawImage(lo, 0, HDR_H, W, H - HDR_H, sx * SCALE, HDR_H * SCALE, W * SCALE, (H - HDR_H) * SCALE);
}
function mosaicBelow(n) {
  const src = u32.slice();
  for (let y = HDR_H; y < H; y++) for (let x = 0; x < W; x++) {
    const by = Math.max(HDR_H, HDR_H + Math.floor((y - HDR_H) / n) * n), bx = Math.floor(x / n) * n;
    u32[y * W + x] = src[by * W + bx];
  }
}
function swirl(s) {
  const src = u32.slice(), cx = W / 2, cy = (HDR_H + H) / 2, ang = Math.pow(s, 1.6) * 7, blk = 1 + Math.round(s * 6);
  for (let y = HDR_H; y < H; y++) for (let x = 0; x < W; x++) {
    const X = Math.floor(x / blk) * blk, Y = Math.floor(y / blk) * blk;
    const dx = X - cx, dy = Y - cy, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx) + ang * (1 - r / 200);
    const sx = Math.round(cx + Math.cos(a) * r), sy = Math.round(cy + Math.sin(a) * r);
    let c = sx >= 0 && sx < W && sy >= HDR_H && sy < H ? src[sy * W + sx] : 0xff141414;
    if (bayer(x, y) < s * 1.2 - .2) c = 0xffffffff;
    u32[y * W + x] = c;
  }
}

// —— Eventos de sonido (deterministas, desde la línea de tiempo) ——
function buildEV() {
  const ev = [];
  for (const s of SECS) ev.push({ t: s.t0, type: 'section', id: s.id, lut: s.lut, t1: s.t1 });
  QUESTIONS.forEach((Q, i) => {
    const Z = QUIZ[i];
    if (i > 0) { const n = Math.ceil(Q.text.length / 2); for (let k = 0; k < n; k++) ev.push({ t: Z.qIn + k * 2 / 70, type: 'blip', era: Q.era }); }
    if (i > 0) Q.options.forEach((_, j) => ev.push({ t: Z.optsIn + j * .1, type: 'pop', era: Q.era, j }));
    Z.count.forEach((c, n) => ev.push({ t: c, type: 'tick', n: 3 - n, era: Q.era }));
    [...Z.count, Z.reveal].forEach((c, m) => { if (m === 0 || HANDS[i][m] !== HANDS[i][m - 1]) ev.push({ t: c, type: 'cursor', era: Q.era }); });
    const ok = HANDS[i][3] === Q.correct;
    ev.push({ t: Z.reveal, type: ok ? 'reveal' : 'wrong', era: Q.era });
  });
  for (let t = .125; t < 5; t += .25) ev.push({ t, type: 'step', era: 1997 });
  for (let t = 5 + 1 / 6; t < 10; t += 1 / 3) ev.push({ t, type: 'rope', era: 2005 });
  for (let t = 10; t < 14.5; t += 1) ev.push({ t: t + .8, type: 'drip' });
  for (let t = 15; t < 19; t += 1) ev.push({ t, type: 'boing' });
  ev.push({ t: MARK.shake, type: 'shake' }, { t: MARK.swirl[0], type: 'swirl' });
  for (let t = 22.5; t < MARK.heartbeatStop; t += .5) ev.push({ t, type: 'heart' });
  ev.push({ t: QUIZ[4].reveal + .02, type: 'light' });
  ev.push({ t: MARK.flood[0], type: 'flood' });
  for (let j = 0; j < 3; j++) ev.push({ t: MARK.flood[0] + .4 + j * MARK.rankStep, type: 'pop', era: 2026, j });
  ev.push({ t: MARK.cta, type: 'item' });
  ev.push({ t: MARK.saveIn + .3, type: 'cursor', era: 2026 }, { t: MARK.saveIn + .5, type: 'pop', era: 2026, j: 0 }, { t: MARK.saveIn + 1.6, type: 'cursor', era: 2026 });
  for (let k = 0; k < 6; k++) ev.push({ t: MARK.saveIn + .6 + k * .08, type: 'savetick' });
  ev.push({ t: MARK.again, type: 'select' });
  return ev.sort((a, b) => a.t - b.t);
}

// subtítulos (.srt): la pregunta y luego la respuesta
window.SUBS = QUESTIONS.flatMap((Q, i) => [
  { t0: QUIZ[i].qIn, t1: QUIZ[i].reveal, text: Q.text },
  { t0: QUIZ[i].reveal, t1: Math.min(QUIZ[i].out, i === 3 ? 19.5 : QUIZ[i].out), text: '✔ ' + Q.options[Q.correct] + (Q.extra ? ' ' + Q.extra : '') },
]).concat([
  { t0: 29.9, t1: 34.5, text: '5/5 Viejo lesbiano · 3-4 Lesbianito · 0-2 Pequeño lesbiano. Comenta la tuya' },
  { t0: 34.5, t1: DUR, text: 'Últimas fechas en México antes de la pausa: CDMX 24-26 nov · Puebla 28 nov · coloresruidosos.github.io/trivia' },
]);

window.DUR = DUR;
window.EV = buildEV();
window.render = t => { t = clamp(t, 0, DUR - 1e-6); present(t, draw(t)); };
window.TEXTS = t => { draw(clamp(t, 0, DUR - 1e-6)); return TX.filter((x, i, a) => a.findIndex(y => y.id === x.id) === i); };
window.render(+(q.get('t') || 0));
window.READY = true;
