// Concierto en la azotea (F17 v2 + F18) como página independiente: elegir músico, tocar «La Torre Picasso»
// (cada músico su parte) y ver el resultado. Entradas: teclado (2), mandos, táctil y móviles por QR (sala PeerJS).
import { Peer } from 'peerjs';
import { W, H, MAX_PLAYERS } from './sim/constants.js';
import { HEROES, HERO_IDS } from './sim/moves.js';
import { LEVELS } from './data/levels.js';
import { createKeyboard } from './input/keyboard.js';
import { createGamepads } from './input/gamepad.js';
import { createTouch } from './input/touch.js';
import { createEdges, NEUTRAL } from './input/source.js';
import { createSlots, SLOT_COLORS } from './input/slots.js';
import { createRoom } from './net/host.js';
import { peerTransport, loopbackTransport } from './net/transport.js';
import { iceConfig } from './net/ice.js';
import { qrMatrix, drawQR } from './render/qr.js';
import { createAudio } from './audio/player.js';
import { createConcert, pressLane, stepConcert } from './sim/ritmo.js';
import { drawConcert, LANE_COLORS } from './render/ritmo.js';
import { drawText } from './render/text.js';
import { drawMenuFigure, drawPortrait } from './render/atlas.js';
import { getBackground } from './render/backgrounds.js';
import * as CANCION from './data/cancion-final.js';

// Dónde está el mando cuando esta página se abre como archivo suelto (file://): en la web de Colores Ruidosos.
const PAD_WEB = 'https://coloresruidosos.github.io/games/arde-la-torre/mando/';
const Q = new URLSearchParams(location.search);
const BOT = Q.has('bot');
const AUTO = Number(Q.get('auto')) || 0;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
function fit() {
  const k = Math.min(innerWidth / W, innerHeight / H);
  const s = k >= 3 ? Math.floor(k) : k;
  canvas.style.width = `${W * s}px`; canvas.style.height = `${H * s}px`;
}
addEventListener('resize', fit); fit();

const audio = createAudio();
const slots = createSlots(MAX_PLAYERS);
const kb = createKeyboard(window), pads = createGamepads(navigator), touch = createTouch(document);
const LOCAL = [...kb.sources, ...pads.sources, touch.source];
const edges = new Map();
const edgeOf = (key, inp) => { if (!edges.has(key)) edges.set(key, createEdges()); return edges.get(key)(inp); };
const STAGE = LEVELS.find((l) => l.final);

const app = { screen: 'inicio', t: 0, k: null, loading: false, ready: false, countdown: 0, net: 'PREPARANDO LA SALA…', code: '' };
window.__concierto = app;
app.slots = slots;
const unlock = () => { audio.unlock(); if (!app.loading) { app.loading = true; audio.loadTrack(CANCION.MP3).then((ok) => { app.ready = ok; }); } };
addEventListener('pointerdown', unlock, { capture: true });
addEventListener('keydown', unlock, { capture: true });

// ---- sala de móviles (F18) ----
let room = null, qr = null;
function padUrlFor(code) {
  const local = location.protocol === 'http:' || location.protocol === 'https:';
  const base = new URL(local ? 'mando/' : PAD_WEB, location.href);
  base.search = ''; base.searchParams.set('s', code);
  if (Q.get('net') === 'loop') base.searchParams.set('net', 'loop');
  return base.toString();
}
async function openRoom() {
  if (Q.has('nonet')) { app.net = ''; return; }
  if (globalThis.ARDE_SIN_RED) { app.net = 'MÓVILES: SOLO EN LA VERSIÓN WEB'; return; }
  const transport = Q.get('net') === 'loop' ? loopbackTransport() : peerTransport(Peer, { debug: 0 }, iceConfig);
  room = createRoom({ transport, slots, onEvent: (e) => { if (e.type === 'join') room.sendTo(e.slot, { t: 'fase', fase: phoneFase() }); } });
  app.room = room;
  try {
    const code = await room.start();
    app.code = code; app.padUrl = padUrlFor(code); qr = qrMatrix(app.padUrl); app.net = '';
  } catch (e) { console.warn('sala', e); app.net = 'MÓVILES: SIN CONEXIÓN A INTERNET'; room = null; }
}
openRoom();
const phoneFase = () => (app.screen === 'concierto' ? 'juego' : app.screen === 'fin' ? 'resultado' : 'sala');
function sendPhoneState() {
  if (!room) return;
  for (const s of slots.joined()) {
    if (s.kind !== 'movil') continue;
    const pr = app.k && app.k.c.players[s.slot];
    room.sendTo(s.slot, { t: 'estado', fase: phoneFase(), modo: 'concierto', hero: s.hero, ready: s.ready, hp: 1, maxHp: 1, lives: 0, score: pr ? pr.score : 0 });
  }
}

function sourceInput(key) {
  const s = LOCAL.find((x) => x.key === key);
  if (s) return s.read();
  if (key.startsWith('movil:') && room) { const i = slots.indexOf(key); const src = i >= 0 ? room.sourceFor(i) : null; return src ? src.read() : NEUTRAL; }
  return NEUTRAL;
}
function go(s) { app.screen = s; app.t = 0; for (const x of slots.joined()) edgeOf(x.key, sourceInput(x.key)); for (const src of LOCAL) edgeOf(src.key, src.read()); }

// ---- elegir músico: GOLPE entra y confirma, ◀ ▶ cambian, SALTO quita el «listo» o sale ----
function stepInicio() {
  if (room) room.update();
  for (const src of LOCAL) {
    const e = edgeOf(src.key, src.read());
    const i = slots.indexOf(src.key);
    if (i < 0) { if (e.golpe) { const k = slots.join(src.key, src.kind); if (k !== null) slots.get(k).joinedAt = app.t; } continue; }
    const s = slots.get(i);
    if (!s.ready) {
      if (e.left) slots.cycleHero(i, -1);
      if (e.right) slots.cycleHero(i, 1);
      if (e.golpe && app.t - s.joinedAt > 2) slots.setReady(i, true);
      if (e.salto) slots.leave(src.key);
    } else if (e.salto) slots.setReady(i, false);
  }
  if (AUTO && !slots.joined().length) for (let i = 0; i < AUTO; i++) { const k = slots.join(`bot${i}`, 'bot', { hero: HERO_IDS[i % 4] }); slots.setReady(k, true); }
  const joined = slots.joined();
  if (joined.length && joined.every((s) => s.ready)) { if (app.countdown <= 0) app.countdown = AUTO ? 2 : 120; else if (--app.countdown <= 1) { app.countdown = 0; startConcert(); } }
  else app.countdown = 0;
}

function startConcert() {
  unlock();
  const ps = slots.joined();
  app.players = ps.map((s) => ({ slot: s.slot, type: s.hero, palette: s.palette, key: s.key }));
  app.k = { c: createConcert({ parts: Object.fromEntries(ps.map((s) => [s.slot, CANCION.PARTS[s.hero]])), unison: CANCION.UNISON, durationMs: CANCION.DURATION_MS }),
    started: false, t0: 0, audio: false, ms: -1000, end: 0, unisonAt: -1e9 };
  go('concierto');
  if (room) room.broadcast({ t: 'fase', fase: 'juego' });
}

function stepPlay() {
  if (room) room.update();
  const k = app.k, c = k.c;
  if (!k.started) {
    if (app.ready || app.t > 240) { k.started = true; k.t0 = app.t; k.audio = audio.startTrack(0.2); }
    return;
  }
  const tm = k.audio ? audio.trackMs() : null;
  const ms = tm !== null ? tm : (app.t - k.t0) * 1000 / 60 - 200;
  k.ms = ms;
  stepConcert(c, ms);
  for (const p of app.players) {
    const pr = c.players[p.slot];
    if (BOT || p.key.startsWith('bot')) {
      for (let i = pr.next; i < pr.notes.length && pr.notes[i][0] <= ms + 8; i++) if (!pr.done[i]) pressLane(c, p.slot, pr.notes[i][1], ms);
      continue;
    }
    const e = edgeOf(p.key, sourceInput(p.key));
    ['golpe', 'salto', 'especial'].forEach((b, lane) => {
      if (e[b] && pressLane(c, p.slot, lane, ms) === 'perfect' && room && p.key.startsWith('movil:')) room.sendTo(p.slot, { t: 'vibra', ms: 25 });
    });
  }
  for (const ev of c.events) if (ev.type === 'unison') { k.unisonAt = ms; audio.sfx('cheer'); }
  c.events.length = 0;
  if (c.done) { if (!k.end) k.end = app.t; if (app.t - k.end > 180) { audio.stopTrack(); go('fin'); if (room) room.broadcast({ t: 'fase', fase: 'resultado' }); } }
}

function stepFin() {
  if (room) room.update();
  for (const s of slots.joined()) {
    const e = edgeOf(s.key, sourceInput(s.key));
    if (app.t > 60 && e.golpe) { startConcert(); return; }
    if (app.t > 60 && e.salto) { for (const x of slots.joined()) slots.setReady(x.slot, false); go('inicio'); if (room) room.broadcast({ t: 'fase', fase: 'sala' }); return; }
  }
}

// ---- dibujo ----
function drawInicio() {
  const bg = getBackground(STAGE);
  ctx.drawImage(bg.near, 0, 0);
  ctx.fillStyle = 'rgba(8,6,16,0.6)'; ctx.fillRect(0, 0, W, H);
  drawText(ctx, 'CONCIERTO EN LA AZOTEA', W / 2, 8, { color: '#ffd23f', scale: 2, align: 'center', shadow: '#a3242c' });
  drawText(ctx, 'LA TORRE PICASSO · ARDE BOGOTÁ', W / 2, 26, { color: '#fff', align: 'center' });
  const left = qr ? 96 : 0;
  if (qr) {
    ctx.fillStyle = 'rgba(10,8,20,0.75)'; ctx.fillRect(4, 38, 88, 124);
    drawQR(ctx, qr, 8, 42, 80);
    drawText(ctx, 'ESCANEA CON', 48, 126, { color: '#cfc9e0', align: 'center' });
    drawText(ctx, 'EL MÓVIL', 48, 136, { color: '#cfc9e0', align: 'center' });
    drawText(ctx, `SALA ${app.code}`, 48, 146, { color: '#ffd23f', align: 'center' });
    drawText(ctx, 'MISMA WIFI', 48, 155, { color: '#3fdc7a', align: 'center' });   // F10.6
  } else if (app.net) drawText(ctx, app.net, W / 2, 164, { color: '#8a8698', align: 'center' });
  const cw = (W - left - 8) / 4;
  for (let i = 0; i < 4; i++) {
    const x = Math.round(left + 4 + cw * i + cw / 2), s = slots.get(i);
    ctx.fillStyle = 'rgba(10,8,20,0.7)'; ctx.fillRect(Math.round(x - cw / 2 + 2), 38, Math.round(cw - 4), 124);
    ctx.fillStyle = SLOT_COLORS[i]; ctx.fillRect(Math.round(x - cw / 2 + 2), 38, Math.round(cw - 4), 2);
    if (!s) { drawText(ctx, `J${i + 1}`, x, 86, { color: SLOT_COLORS[i], align: 'center' }); drawText(ctx, 'GOLPE', x, 98, { color: '#8a8698', align: 'center' }); drawText(ctx, 'O MÓVIL', x, 108, { color: '#8a8698', align: 'center' }); continue; }
    drawMenuFigure(ctx, s.hero, s.palette, s.ready ? 'victory' : 'idle', Math.floor(app.t / 24) % 2, x, 132, HEROES[s.hero].h, 1);
    drawText(ctx, HEROES[s.hero].name, x, 138, { color: SLOT_COLORS[i], align: 'center' });
    drawText(ctx, CANCION.INSTRUMENTS[s.hero], x, 147, { color: '#cfc9e0', align: 'center' });
    drawText(ctx, s.ready ? '¡LISTO!' : s.kind === 'movil' ? 'ELIGE EN EL MÓVIL' : '◀ ▶ · GOLPE', x, 156, { color: s.ready ? '#3fdc7a' : '#8a8698', align: 'center' });
  }
  const msg = app.countdown > 0 ? `¡EMPIEZA EN ${Math.ceil(app.countdown / 60)}!` : slots.joined().length ? 'CUANDO TODOS ESTÉN LISTOS, EMPIEZA' : 'PULSA GOLPE O ESCANEA EL QR (HASTA 4)';
  drawText(ctx, msg, W / 2, 172, { color: '#ffd23f', align: 'center' });
  drawText(ctx, 'TECLADO J1: F G H · J2: K L Ñ · MANDO · TÁCTIL', W / 2, 184, { color: '#cfc9e0', align: 'center' });
  ['GOLPE', 'SALTO', 'ESPECIAL'].forEach((n, l) => drawText(ctx, n, W / 2 + (l - 1) * 56, 196, { color: LANE_COLORS[l], align: 'center' }));
  drawText(ctx, 'HOMENAJE NO OFICIAL · @COLORESRUIDOSOS', W / 2, H - 9, { color: '#8a8698', align: 'center' });
}

function drawFin() {
  ctx.fillStyle = '#0e0b1a'; ctx.fillRect(0, 0, W, H);
  drawText(ctx, '¡CONCIERTO COMPLETADO!', W / 2, 10, { color: '#ffd23f', scale: 2, align: 'center' });
  const c = app.k.c;
  drawText(ctx, c.crowd > 0.66 ? 'EL PÚBLICO SE HA VUELTO LOCO' : c.crowd > 0.33 ? 'EL PÚBLICO PIDE OTRA' : 'HAY QUE ENSAYAR MÁS', W / 2, 28, { color: '#fff', align: 'center' });
  const n = app.players.length;
  if (n > 1) drawText(ctx, `BANDA ${c.bandScore} · TODOS A UNA ×${c.unisons}`, W / 2, 38, { color: '#ffd23f', align: 'center' });
  app.players.forEach((p, i) => {
    const pr = c.players[p.slot], x = Math.round(W / 2 + (i - (n - 1) / 2) * 93) - 44, y = 48;
    ctx.fillStyle = '#1b1630'; ctx.fillRect(x, y, 88, 128);
    ctx.fillStyle = SLOT_COLORS[p.slot]; ctx.fillRect(x, y, 88, 2);
    drawPortrait(ctx, p.type, p.palette, HEROES[p.type].h, x + 32, y + 6, 24);
    drawText(ctx, `${HEROES[p.type].name} · ${CANCION.INSTRUMENTS[p.type]}`, x + 44, y + 34, { color: SLOT_COLORS[p.slot], align: 'center' });
    drawText(ctx, String(pr.score).padStart(6, '0'), x + 44, y + 46, { color: '#fff', align: 'center' });
    drawText(ctx, `PRECISIÓN ${Math.round(pr.accuracy * 100)}%`, x + 6, y + 62, { color: '#3fdc7a' });
    drawText(ctx, `PERFECTO ${pr.perfect}`, x + 6, y + 74, { color: '#ffd23f' });
    drawText(ctx, `BIEN ${pr.good}`, x + 6, y + 84, { color: '#cfc9e0' });
    drawText(ctx, `FALLOS ${pr.miss}`, x + 6, y + 94, { color: '#ff4d4d' });
    drawText(ctx, `MEJOR RACHA ${pr.maxCombo}`, x + 6, y + 106, { color: '#cfc9e0' });
  });
  if (app.t > 60 && Math.floor(app.t / 30) % 2) drawText(ctx, 'GOLPE: OTRA VEZ · SALTO: CAMBIAR MÚSICOS', W / 2, H - 22, { color: '#ffd23f', align: 'center' });
  drawText(ctx, 'HOMENAJE NO OFICIAL · @COLORESRUIDOSOS', W / 2, H - 10, { color: '#4a4560', align: 'center' });
}

function draw() {
  if (app.screen === 'inicio') drawInicio();
  else if (app.screen === 'concierto') {
    const k = app.k;
    drawConcert(ctx, { concert: k.c, ms: k.started ? k.ms : -1000, level: STAGE, players: app.players, bpm: CANCION.BPM, opts: {},
      title: 'LA TORRE PICASSO · ARDE BOGOTÁ', ending: k.c.done, instruments: CANCION.INSTRUMENTS, unisonAt: k.unisonAt });
    if (!k.started) drawText(ctx, 'CARGANDO LA CANCIÓN…', W / 2, 140, { color: '#cfc9e0', align: 'center' });
  } else drawFin();
}

let last = performance.now(), acc = 0;
function frame(now) {
  acc += Math.min(100, now - last); last = now;
  while (acc >= 1000 / 60) {
    acc -= 1000 / 60; app.t++;
    if (room && app.t % 15 === 0) sendPhoneState();
    if (app.screen === 'inicio') stepInicio(); else if (app.screen === 'concierto') stepPlay(); else stepFin();
  }
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
