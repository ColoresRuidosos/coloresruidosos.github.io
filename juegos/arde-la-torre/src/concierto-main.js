// Concierto en la azotea (F17) como página independiente: elegir músico, tocar «La Torre Picasso» y ver el resultado.
// Entradas locales: 2 jugadores en el teclado, mandos de consola y botones táctiles (móvil). Sin red.
import { W, H } from './sim/constants.js';
import { HEROES, HERO_IDS } from './sim/moves.js';
import { LEVELS } from './data/levels.js';
import { createKeyboard } from './input/keyboard.js';
import { createGamepads } from './input/gamepad.js';
import { createTouch } from './input/touch.js';
import { createEdges } from './input/source.js';
import { SLOT_COLORS } from './input/slots.js';
import { createAudio } from './audio/player.js';
import { createConcert, pressLane, stepConcert } from './sim/ritmo.js';
import { drawConcert, LANE_COLORS } from './render/ritmo.js';
import { drawText } from './render/text.js';
import { drawMenuFigure, drawPortrait } from './render/atlas.js';
import { getBackground } from './render/backgrounds.js';
import * as CANCION from './data/cancion-final.js';

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
const kb = createKeyboard(window), pads = createGamepads(navigator), touch = createTouch(document);
const LOCAL = [...kb.sources, ...pads.sources, touch.source];
const edges = new Map();
const edgeOf = (key, inp) => { if (!edges.has(key)) edges.set(key, createEdges()); return edges.get(key)(inp); };
const STAGE = LEVELS.find((l) => l.final);

const app = { screen: 'inicio', t: 0, players: [], k: null, loading: false, ready: false };
window.__concierto = app;
const unlock = () => { audio.unlock(); if (!app.loading) { app.loading = true; audio.loadTrack(CANCION.MP3).then((ok) => { app.ready = ok; }); } };
addEventListener('pointerdown', unlock, { capture: true });
addEventListener('keydown', unlock, { capture: true });

const playerOf = (key) => app.players.find((p) => p.key === key);
function go(s) { app.screen = s; app.t = 0; for (const src of LOCAL) edgeOf(src.key, src.read()); }

function stepInicio() {
  for (const src of LOCAL) {
    const e = edgeOf(src.key, src.read());
    const p = playerOf(src.key);
    if (!p) {
      if (e.golpe && app.players.length < 4) {
        const used = new Set(app.players.map((q) => q.type));
        app.players.push({ key: src.key, slot: app.players.length, type: HERO_IDS.find((h) => !used.has(h)) || HERO_IDS[0], palette: 0 });
      }
      continue;
    }
    if (e.left || e.right) {
      const i = HERO_IDS.indexOf(p.type);
      p.type = HERO_IDS[(i + (e.right ? 1 : HERO_IDS.length - 1)) % HERO_IDS.length];
    }
    if (e.salto) startConcert();
  }
  if (AUTO && !app.players.length) {
    for (let i = 0; i < AUTO; i++) app.players.push({ key: `bot${i}`, slot: i, type: HERO_IDS[i % 4], palette: 0 });
    startConcert();
  }
}

function startConcert() {
  unlock();
  app.players.forEach((p, i) => {   // músicos repetidos: otro tono
    p.slot = i; p.palette = app.players.slice(0, i).filter((q) => q.type === p.type).length;
  });
  app.k = { c: createConcert({ notes: CANCION.NOTES, slots: app.players.map((p) => p.slot), durationMs: CANCION.DURATION_MS }),
    started: false, t0: 0, audio: false, ms: -1000, end: 0 };
  go('concierto');
}

function stepPlay() {
  const k = app.k, c = k.c;
  if (!k.started) {
    if (app.ready || app.t > 240) { k.started = true; k.t0 = app.t; k.audio = audio.startTrack(0.2); }
    return;
  }
  const ms = k.audio && audio.trackMs() !== null ? audio.trackMs() : (app.t - k.t0) * 1000 / 60 - 200;
  k.ms = ms;
  stepConcert(c, ms);
  for (const p of app.players) {
    if (BOT || p.key.startsWith('bot')) {
      const pr = c.players[p.slot];
      for (let i = pr.next; i < c.notes.length && c.notes[i][0] <= ms + 8; i++) if (!pr.done[i]) pressLane(c, p.slot, c.notes[i][1], ms);
      continue;
    }
    const src = LOCAL.find((s) => s.key === p.key);
    const e = edgeOf(p.key, src.read());
    ['golpe', 'salto', 'especial'].forEach((b, lane) => { if (e[b]) pressLane(c, p.slot, lane, ms); });
  }
  c.events.length = 0;
  if (c.done) { if (!k.end) k.end = app.t; if (app.t - k.end > 180) { audio.stopTrack(); go('fin'); } }
}

function stepFin() {
  for (const src of LOCAL) {
    const e = edgeOf(src.key, src.read());
    if (app.t > 60 && e.golpe) startConcert();
    if (app.t > 60 && e.salto) { app.players = []; go('inicio'); }
  }
}

function drawInicio() {
  const bg = getBackground(STAGE);
  ctx.drawImage(bg.near, 0, 0);
  ctx.fillStyle = 'rgba(8,6,16,0.55)'; ctx.fillRect(0, 0, W, H);
  drawText(ctx, 'CONCIERTO EN LA AZOTEA', W / 2, 10, { color: '#ffd23f', scale: 2, align: 'center', shadow: '#a3242c' });
  drawText(ctx, 'LA TORRE PICASSO · ARDE BOGOTÁ', W / 2, 30, { color: '#fff', align: 'center' });
  for (let i = 0; i < 4; i++) {
    const x = 50 + i * 95, p = app.players[i];
    ctx.fillStyle = 'rgba(10,8,20,0.7)'; ctx.fillRect(x - 42, 44, 84, 118);
    ctx.fillStyle = SLOT_COLORS[i]; ctx.fillRect(x - 42, 44, 84, 2);
    if (!p) { drawText(ctx, `J${i + 1}`, x, 90, { color: SLOT_COLORS[i], align: 'center' }); drawText(ctx, 'GOLPE: ENTRAR', x, 102, { color: '#8a8698', align: 'center' }); continue; }
    drawMenuFigure(ctx, p.type, p.palette, 'idle', Math.floor(app.t / 24) % 2, x, 140, HEROES[p.type].h, 1);
    drawText(ctx, `◀ ${HEROES[p.type].name} ▶`, x, 148, { color: SLOT_COLORS[i], align: 'center' });
  }
  const lines = app.players.length
    ? ['◀ ▶ CAMBIAR DE MÚSICO · SALTO: ¡A TOCAR!', 'TECLADO J1: F G H · J2: K L Ñ · MÓVIL: BOTONES']
    : ['PULSA GOLPE PARA ENTRAR (HASTA 4)', 'TECLADO J1: F · J2: K · MANDO · MÓVIL: TOCA GOLPE'];
  if (Math.floor(app.t / 30) % 2 === 0 || app.players.length) drawText(ctx, lines[0], W / 2, 172, { color: '#ffd23f', align: 'center' });
  drawText(ctx, lines[1], W / 2, 184, { color: '#cfc9e0', align: 'center' });
  ['GOLPE', 'SALTO', 'ESPECIAL'].forEach((n, l) => drawText(ctx, n, W / 2 + (l - 1) * 56, 196, { color: LANE_COLORS[l], align: 'center' }));
  drawText(ctx, 'HOMENAJE NO OFICIAL · @COLORESRUIDOSOS', W / 2, H - 9, { color: '#8a8698', align: 'center' });
}

function drawFin() {
  ctx.fillStyle = '#0e0b1a'; ctx.fillRect(0, 0, W, H);
  drawText(ctx, '¡CONCIERTO COMPLETADO!', W / 2, 12, { color: '#ffd23f', scale: 2, align: 'center' });
  const c = app.k.c;
  drawText(ctx, c.crowd > 0.66 ? 'EL PÚBLICO SE HA VUELTO LOCO' : c.crowd > 0.33 ? 'EL PÚBLICO PIDE OTRA' : 'HAY QUE ENSAYAR MÁS', W / 2, 32, { color: '#fff', align: 'center' });
  const n = app.players.length;
  app.players.forEach((p, i) => {
    const pr = c.players[p.slot], x = Math.round(W / 2 + (i - (n - 1) / 2) * 93) - 44, y = 48;
    ctx.fillStyle = '#1b1630'; ctx.fillRect(x, y, 88, 124);
    ctx.fillStyle = SLOT_COLORS[p.slot]; ctx.fillRect(x, y, 88, 2);
    drawPortrait(ctx, p.type, p.palette, HEROES[p.type].h, x + 32, y + 6, 24);
    drawText(ctx, HEROES[p.type].name, x + 44, y + 34, { color: SLOT_COLORS[p.slot], align: 'center' });
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
      title: 'LA TORRE PICASSO · ARDE BOGOTÁ', ending: k.c.done });
    if (!k.started) drawText(ctx, 'CARGANDO LA CANCIÓN…', W / 2, 140, { color: '#cfc9e0', align: 'center' });
  } else drawFin();
}

let last = performance.now(), acc = 0;
function frame(now) {
  acc += Math.min(100, now - last); last = now;
  while (acc >= 1000 / 60) {
    acc -= 1000 / 60; app.t++;
    pads.poll && pads.poll();
    if (app.screen === 'inicio') stepInicio(); else if (app.screen === 'concierto') stepPlay(); else stepFin();
  }
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
