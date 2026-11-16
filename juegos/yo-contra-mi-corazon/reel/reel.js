// Reel promocional (reel/spec.md): dibuja cada cuadro a 180×320 con el código del juego.
// API para scripts/reel.mjs: window.reel = { ready, setup(variante), frame(i) → dataURL, frames, events() }.
import { BEATMAP } from '../src/data/beatmap.js';
import { createMatch, step } from '../src/game/match.js';
import { createBot } from '../src/game/bot.js';
import { loadSprites, spr } from '../src/render/sprites.js';
import { drawText, textWidth } from '../src/render/text.js';
import { drawScene, createFx, feedFx, stepFx } from '../src/render/view.js';
import { EJEMPLOS } from '../src/ranking/ranking.js';
import { BADGES } from '../src/game/badges.js';

const FPS = 30, BEAT = 60 / BEATMAP.bpm, YEL = '#ffe25c', W = 180;
const canvas = document.getElementById('reel'), ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const OPTS = { sinDestellos: false };
const SEED = 7;
export const SCENES = { gancho: [0, 8], vs: [8, 16], juego: [16, 40], ranking: [40, 52], cierre: [52, 67] };
const TOTAL_BEATS = 67;
const VARIANTES = {
  principal: ['¡SOLO ESTA', 'SEMANA!'],
  'quedan-5': ['QUEDAN', '5 DÍAS'],
  'quedan-3': ['QUEDAN', '3 DÍAS'],
  'ultimo-dia': ['¡ÚLTIMO', 'DÍA!'],
};

// ---------- simulación (misma pelea que el juego, jugada por el bot perfecto) ----------
function cursor() { return { m: createMatch({ beatmap: BEATMAP, seed: SEED }), fx: createFx(), bot: createBot({ seed: SEED * 7 }), t: 0 }; }
function advance(c, T, dt, onEvent) {
  while (c.t < T - 1e-9) {
    const nt = Math.min(T, c.t + dt);
    if (!c.m.over) step(c.m, nt, c.bot(c.m, c.t, nt - c.t));
    feedFx(c.fx, c.m, OPTS, onEvent || (() => {}));
    stepFx(c.fx, nt - c.t);
    c.fx.pops = [];   // en el reel mandan los letreros de cada corte
    c.t = nt;
  }
}

// Momentos de la pelea (pasada previa)
function findMoments() {
  const c = cursor(), evs = [];
  advance(c, BEATMAP.duration, 1 / FPS, (e) => evs.push({ ...e, at: c.t }));
  const after = (t0, pred) => evs.find((e) => e.at > t0 && pred(e));
  const e1 = after(0, (e) => e.type === 'esquiva');
  const b1 = after(e1.at, (e) => e.type === 'batazo' && e.grade === 'perfecto');
  const lat = after(b1.at, (e) => e.type === 'esquiva' && e.side === 'centro');
  const gr = after(0, (e) => e.type === 'grito');
  const x3 = after(0, (e) => e.type === 'transicion' && e.to === 3);
  const f3 = after(x3.at, (e) => e.type === 'batazo');
  const ko = after(0, (e) => e.type === 'ko');
  const L = 4 * BEAT;   // cada corte dura 4 tiempos
  const clips = [
    { label: '¡ESQUIVA!', from: e1.at - 0.14 - 1.0, speed: 1 },
    { label: '¡BATEA!', from: b1.at - 0.1, speed: 0.33 },
    { label: '¡AGÁCHATE!', from: lat.at - 0.14 - 1.0, speed: 1 },
    gr ? { label: '¡GRITA!', from: gr.at - 0.25, speed: 1 } : null,
    { label: '3 FASES', from: x3.at - 0.1, speed: 1 },
    { label: '¡HASTA EL K.O.!', from: f3.at - 0.45, speed: 1 },
  ].filter(Boolean).sort((a, b) => a.from - b.from);
  return { clips, L, koFrom: ko ? ko.at - 0.7 : BEATMAP.duration - 6 };
}

// ---------- utilidades de dibujo ----------
const beatOf = (i) => (i / FPS) / BEAT;
function bg(col) { ctx.fillStyle = col; ctx.fillRect(0, 0, W, 320); }
function scaled(name, x, y, s, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.scale(s, s); spr(ctx, name, 0, 0); ctx.restore();
}
function band(y, h, col = 'rgba(10,8,20,0.82)') { ctx.fillStyle = col; ctx.fillRect(0, y, W, h); }
const pulse = (b) => Math.max(0, 1 - ((b % 2) * BEAT) / 0.18);

// ---------- escenas ----------
function gancho(b) {
  bg('#0b0915');
  const p = pulse(b);
  const g = ctx.createRadialGradient(90, 160, 10, 90, 160, 170);
  g.addColorStop(0, `rgba(160,20,50,${0.25 + 0.35 * p})`); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 320);
  const s = 1 + 0.08 * p;
  scaled('heart.idle', 90 - 50 * s, 112 - 54 * s + 40, s, 0.9);
  const [l1, l2, l3] = state.gancho === 'pepe' ? ['PEPE MADERO', 'VS', 'MI CORAZÓN'] : ['EL PAYASO', 'CONTRA', 'SU CORAZÓN'];
  if (b >= 1) drawText(ctx, l1, W / 2, 40, { scale: 2, align: 'center' });
  if (b >= 3) drawText(ctx, l2, W / 2, 62, { scale: l2 === 'VS' ? 3 : 2, align: 'center', color: l2 === 'VS' ? YEL : '#fff' });
  if (b >= 5) drawText(ctx, l3, W / 2, 262, { scale: 2, align: 'center', color: '#ff5a6e' });
  if (state.gancho === 'pepe') drawText(ctx, 'HOMENAJE NO OFICIAL', W / 2, 292, { align: 'center', color: '#a89cc0' });
}

function vs(b) {
  const k = b - SCENES.vs[0];
  bg('#2c1f40'); ctx.fillStyle = '#7a1424'; ctx.fillRect(0, 160, W, 160);
  ctx.fillStyle = '#1a0a16'; for (let x = 0; x < W; x += 12) { ctx.beginPath(); ctx.moveTo(x, 160); ctx.lineTo(x + 6, 154); ctx.lineTo(x + 12, 160); ctx.fill(); }
  const ease = (u) => 1 - Math.pow(1 - Math.min(1, Math.max(0, u)), 3);
  scaled('icon.clown', -100 + 145 * ease(k / 1.5), 40, 3);
  spr(ctx, 'heart.avisoIzq', 180 - 140 * ease((k - 0.5) / 1.5), 186);
  drawText(ctx, state.gancho === 'pepe' ? 'PEPE MADERO' : 'PAYASO', 120 - 80 * (1 - ease(k / 1.5)), 26, { align: 'center', color: '#cfc8e0' });
  if (k >= 2 && k < 4) {
    const sh = k < 2.4 ? Math.round(Math.sin(k * 60) * 3) : 0;
    drawText(ctx, 'VS', W / 2 + sh, 140, { scale: 4, align: 'center', color: YEL });
  }
  if (k >= 4) {
    band(124, 42);
    if (state.gancho === 'pepe') {   // R4: en el cartel dice «PEPE VS / MI CORAZÓN»
      const x0 = W / 2 - textWidth('PEPE VS', 2) / 2;
      drawText(ctx, 'PEPE', x0, 128, { scale: 2 });
      drawText(ctx, 'VS', x0 + 5 * 12, 128, { scale: 2, color: YEL });
    } else drawText(ctx, 'YO CONTRA', W / 2, 128, { scale: 2, align: 'center' });
    drawText(ctx, 'MI CORAZÓN', W / 2, 147, { scale: 2, align: 'center', color: '#ff6a7a' });
  }
}

function label(text, sub = null) {
  const s = text.length <= 13 ? 2 : 1;
  band(54, (s === 2 ? 20 : 13) + (sub ? 10 : 0));
  drawText(ctx, text, W / 2, 57, { scale: s, align: 'center', color: YEL });
  if (sub) drawText(ctx, sub, W / 2, 57 + (s === 2 ? 17 : 10), { align: 'center' });
}

const TOP = EJEMPLOS.map(([n, p]) => [n.toUpperCase(), p]);   // nombres de la carrera de Pepe (F14 v0.4)
function ranking(k) {
  spr(ctx, 'stage', 0, 0); bg('rgba(10,8,20,0.82)');
  drawText(ctx, '¿QUIÉN SERÁ', W / 2, 26, { scale: 2, align: 'center' });
  drawText(ctx, 'EL MÁS MIGAJERO', W / 2, 46, { scale: 2, align: 'center', color: YEL });
  drawText(ctx, 'DE ESTA SEMANA?', W / 2, 66, { scale: 2, align: 'center' });
  const rows = [...TOP, ['¿TÚ?', null]];
  rows.forEach(([n, p], i) => {
    if (k < 1.5 + i) return;
    const y = 94 + i * 24, tu = p === null;
    if (i === 0) { ctx.fillStyle = 'rgba(255,226,92,0.16)'; ctx.fillRect(4, y - 3, W - 8, 21); }
    const c = tu ? YEL : i === 0 ? YEL : i < 3 ? '#ffb070' : '#fff';
    drawText(ctx, `${i + 1}.`, 20, y, { align: 'right', color: c });
    drawText(ctx, n, 24, y, { color: c });
    drawText(ctx, tu ? (Math.floor(k * 2) % 2 ? '?????' : '') : `${p} PTS`, W - 8, y + 9, { align: 'right', color: '#cfc8e0' });
  });
  if (k >= 8.5) { band(250, 26, '#c8283c'); drawText(ctx, '¡DESCÚBRELO!', W / 2, 256, { scale: 2, align: 'center' }); }
}

function cierre(k, variante) {
  ctx.fillStyle = 'rgba(10,8,20,0.8)'; ctx.fillRect(0, 182, W, 124);
  if (k >= 1) {
    const [l1, l2] = VARIANTES[variante];
    ctx.fillStyle = YEL; ctx.fillRect(0, 186, W, 40);
    drawText(ctx, l1, W / 2, 189, { scale: 2, align: 'center', color: '#1a0a16', shadow: null });
    drawText(ctx, l2, W / 2, 207, { scale: 2, align: 'center', color: '#a01828', shadow: null });
    drawText(ctx, 'HASTA EL DOMINGO 15 DE NOV', W / 2, 231, { align: 'center' });
  }
  if (k >= 3) {
    drawText(ctx, 'JUEGA GRATIS EN', W / 2, 246, { align: 'center', color: '#cfc8e0' });
    drawText(ctx, 'COLORESRUIDOSOS.GITHUB.IO', W / 2, 257, { align: 'center', color: YEL });
    drawText(ctx, '/GAMES', W / 2, 267, { align: 'center', color: YEL });
  }
  if (k >= 5) {
    drawText(ctx, 'HOMENAJE NO OFICIAL', W / 2, 284, { align: 'center', color: '#a89cc0' });
    drawText(ctx, '@COLORESRUIDOSOS', W / 2, 294, { align: 'center', color: YEL });
  }
}

// R5b: presenta el juego antes de las insignias
function presenta(k) {
  spr(ctx, 'stage', 0, 0); bg('rgba(10,8,20,0.55)');
  spr(ctx, 'heart.idle', 40, 70 - (Math.floor(k * 2) % 2));
  spr(ctx, 'clown.listo', 40, 158);
  band(18, 44);
  drawText(ctx, 'UN JUEGO DE', W / 2, 22, { scale: 2, align: 'center' });
  if (k >= 0.5) drawText(ctx, 'RITMO Y BOX', W / 2, 42, { scale: 2, align: 'center', color: YEL });
  if (k >= 2) { band(270, 20, '#c8283c'); drawText(ctx, 'GRATIS · EN TU CELULAR', W / 2, 277, { align: 'center' }); }
}

// R5: vitrina de insignias, una cada 2 tiempos, y «¿CUÁNTAS LLEVAS?»
function vitrina(y0, alto, visibles, conPista = true) {
  BADGES.forEach((bd, i) => {
    const v = visibles(i); if (v === null) return;
    const { ok, dx = 0 } = v, y = y0 + i * alto;
    ctx.fillStyle = ok ? 'rgba(255,226,92,0.14)' : 'rgba(255,255,255,0.05)'; ctx.fillRect(3 + dx, y - 2, W - 6, alto - 3);
    spr(ctx, ok ? 'badge.' + bd.id : 'badge.locked', 6 + dx, y + (conPista ? 1 : -1));
    drawText(ctx, bd.nombre, 26 + dx, y + (conPista ? 1 : 3), { color: ok ? YEL : '#8a80a0' });
    if (conPista) drawText(ctx, bd.pista, 26 + dx, y + 11, { color: ok ? '#cfc8e0' : '#6a6080', shadow: null });
  });
}
function insignias(k) {
  spr(ctx, 'stage', 0, 0); bg('rgba(10,8,20,0.86)');
  drawText(ctx, '10 INSIGNIAS', W / 2, 22, { scale: 2, align: 'center', color: YEL });
  vitrina(44, 24, (i) => {
    const t0 = 1 + i * 2; if (k < t0) return null;
    const u = Math.min(1, (k - t0) / 0.5);
    return { ok: true, dx: Math.round(60 * Math.pow(1 - u, 3)) };
  });
  if (k >= 21) {
    bg('rgba(10,8,20,0.55)');
    band(124, 50, '#c8283c');
    drawText(ctx, '¿CUÁNTAS', W / 2, 130, { scale: 2, align: 'center' });
    drawText(ctx, 'LLEVAS?', W / 2, 152, { scale: 2, align: 'center', color: YEL });
  }
}
// R5: imagen para historia (1080×1920 tras escalar ×6)
function story() {
  spr(ctx, 'stage', 0, 0); bg('rgba(10,8,20,0.88)');
  drawText(ctx, '¿CUÁNTAS', W / 2, 26, { scale: 3, align: 'center' });
  drawText(ctx, 'LLEVAS?', W / 2, 50, { scale: 3, align: 'center', color: YEL });
  const ganadas = new Set(['carmesi', 'teoremas', 'fantasmas', 'querido']);
  vitrina(90, 19, (i) => ({ ok: ganadas.has(BADGES[i].id) }), false);
  drawText(ctx, '10 INSIGNIAS · SOLO HASTA', W / 2, 284, { align: 'center', color: '#ff9aa8' });
  drawText(ctx, 'EL DOMINGO 15 DE NOV', W / 2, 294, { align: 'center' });
  drawText(ctx, '@COLORESRUIDOSOS', W / 2, 305, { align: 'center', color: YEL });
  drawText(ctx, 'HOMENAJE NO OFICIAL', W / 2, 78, { align: 'center', color: '#a89cc0' });
  return canvas.toDataURL('image/png');
}

// ---------- API ----------
let state = null;
// Línea de tiempo por modo (en tiempos de 168 BPM). R5b: el reel de insignias presenta antes el juego.
const SUBS = { '¡ESQUIVA!': 'DESLIZA LEJOS DEL PUÑO', '¡BATEA!': 'TOCA AL RITMO DE LA CANCIÓN', '¡GRITA!': 'CON 5 ESTRELLAS: MICRÓFONO', '3 FASES': 'VACÍA SUS BARRAS: ¡K.O.!' };
function timeline(modo, mo) {
  if (modo !== 'insignias') return [['gancho', 8], ['vs', 8], ['juego', 24, mo.clips], ['ranking', 12], ['cierre', 15]];
  const clips = ['¡ESQUIVA!', '¡BATEA!', '¡GRITA!', '3 FASES'].map((l) => mo.clips.find((c) => c.label === l)).filter(Boolean)
    .map((c) => ({ ...c, sub: SUBS[c.label] }));
  return [['gancho', 8], ['vs', 8], ['presenta', 4], ['juego', clips.length * 4, clips], ['insignias', 24], ['ranking', 12], ['cierre', 15]];
}
// Acentos de sonido de cada escena (los lee scripts/reel_audio.py)
function accents(tl) {
  const out = []; let at = 0;
  const add = (b, type) => out.push({ t: (at + b) * BEAT, type });
  for (const [name, len] of tl) {
    if (name === 'vs') { add(2, 'boom'); add(4, 'boom'); }
    if (name === 'presenta' || name === 'juego') add(0, 'up');
    if (name === 'insignias') { for (let i = 0; i < 10; i++) add(1 + i * 2, 'blip'); add(21, 'boom'); }
    if (name === 'ranking') { for (let i = 0; i < 6; i++) add(1.5 + i, 'blip'); add(8.5, 'boom'); }
    if (name === 'cierre') { add(1, 'boom'); add(3, 'blip'); add(5, 'blip'); }
    at += len;
  }
  return out;
}

function setup(variante = 'principal', gancho = 'payaso', modo = 'normal') {
  const mo = findMoments();
  const tl = timeline(modo, mo);
  state = { variante, gancho, modo, mo, tl, total: tl.reduce((a, x) => a + x[1], 0), cur: cursor(), events: accents(tl), clipIdx: -1 };
}

function frame(i) {
  const b = beatOf(i), t = i / FPS, st = state;
  const rec = (e) => st.events.push({ t, type: e.type, grade: e.grade });
  let at = 0, seg = null;
  for (const sg of st.tl) { if (b < at + sg[1]) { seg = sg; break; } at += sg[1]; }
  if (!seg) { seg = st.tl.at(-1); at = st.total - seg[1]; }
  const [name, , clips] = seg, k = b - at;
  if (name === 'gancho') gancho(b);
  else if (name === 'vs') vs(b);
  else if (name === 'presenta') presenta(k);
  else if (name === 'juego') {
    const ci = Math.min(Math.floor(k / 4), clips.length - 1), clip = clips[ci];
    const gt = clip.from + (k - ci * 4) * BEAT * clip.speed;
    if (ci !== st.clipIdx) {                                      // corte nuevo: avanzar la pelea hasta su inicio
      if (clip.from < st.cur.t) st.cur = cursor();
      advance(st.cur, clip.from, 1 / FPS);
      st.cur.fx = createFx(); st.cur.m.events.length = 0; st.clipIdx = ci;
    }
    advance(st.cur, gt, (1 / FPS) * clip.speed, rec);
    drawScene(ctx, st.cur.m, gt, st.cur.fx, OPTS);
    label(clip.label, clip.sub || null);
  } else if (name === 'insignias') insignias(k);
  else if (name === 'ranking') ranking(k);
  else {
    if (st.clipIdx !== 'ko') { advance(st.cur, st.mo.koFrom, 1 / FPS); st.cur.fx = createFx(); st.cur.m.events.length = 0; st.clipIdx = 'ko'; }
    const gt = st.mo.koFrom + k * BEAT;
    advance(st.cur, gt, 1 / FPS, rec);
    drawScene(ctx, st.cur.m, gt, st.cur.fx, OPTS);
    cierre(k, st.variante);
  }
  return canvas.toDataURL('image/png');
}

window.reel = {
  ready: loadSprites(), setup, frame, story,
  get frames() { return Math.ceil((state ? state.total : TOTAL_BEATS) * BEAT * FPS); }, fps: FPS, beat: BEAT, scenes: SCENES,
  events: () => state.events,
};
