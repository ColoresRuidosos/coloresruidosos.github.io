// Pantalla principal: bucle a paso fijo (60 Hz), pantallas, sala de móviles, entradas, sonido y vibración.
// Parámetros de prueba: ?net=loop (mandos por BroadcastChannel) · ?bot (juegan los bots) · ?sim=N (N ticks por cuadro)
//                      ?seed=N · ?nivel=N (1–5) · ?auto=N (N jugadores de teclado y empieza ya) · ?nonet (sin sala)
import { Peer } from 'peerjs';
import { W, H, MAX_PLAYERS } from './sim/constants.js';
import { createWorld, tick, addPlayer, removePlayer, setAway, startLevel, playerBySlot } from './sim/world.js';
import { botInput } from './sim/bot.js';
import { LEVELS } from './data/levels.js';
import { HERO_IDS } from './sim/moves.js';
import { createKeyboard } from './input/keyboard.js';
import { createGamepads } from './input/gamepad.js';
import { createTouch } from './input/touch.js';
import { createSlots } from './input/slots.js';
import { createEdges, NEUTRAL } from './input/source.js';
import { createRoom } from './net/host.js';
import { peerTransport, loopbackTransport } from './net/transport.js';
import { qrMatrix } from './render/qr.js';
import { drawWorld, drawHud, createFx } from './render/view.js';
import { drawTitle, drawLobby, drawIntro, drawPause, drawBanner, drawResults, PAUSE_ITEMS } from './render/screens.js';
import { drawText } from './render/text.js';
import { createAudio } from './audio/player.js';
import { BOSS_SONG } from './audio/music.js';
import { loadOptions, saveOptions } from './core/save.js';

const Q = new URLSearchParams(location.search);
const SIM = Math.max(1, Number(Q.get('sim')) || 1);
const BOT = Q.has('bot');
const SEED = Number(Q.get('seed')) || (Date.now() % 100000);
const START_LEVEL = Math.min(LEVELS.length, Math.max(1, Number(Q.get('nivel')) || 1)) - 1;
const AUTO = Number(Q.get('auto')) || 0;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// ---- escalado entero (plan §6) ----
function fit() {
  const k = Math.min(innerWidth / W, innerHeight / H);
  // Pantallas grandes: escala entera (nítida). Móviles y ventanas pequeñas: llenar la pantalla aunque no sea entera.
  const s = k >= 3 ? Math.floor(k) : k;
  canvas.style.width = `${W * s}px`; canvas.style.height = `${H * s}px`;
}
addEventListener('resize', fit); fit();

// ---- estado global ----
const opts = loadOptions();
const audio = createAudio(); audio.setVolume(opts.volume);
const slots = createSlots(MAX_PLAYERS);
const kb = createKeyboard(window);
const pads = createGamepads(navigator);
const touch = createTouch(document);
const LOCAL = [...kb.sources, ...pads.sources, touch.source];
const edges = new Map();                 // clave de fuente → detector de flancos
const edgeOf = (key, inp) => { if (!edges.has(key)) edges.set(key, createEdges()); return edges.get(key)(inp); };
const fx = createFx();

const app = { screen: 'titulo', t: 0, world: null, countdown: 0, pauseSel: 0, pausedBy: null, banner: null, results: null, net: 'PREPARANDO|LA SALA…' };
window.__arde = app;
app.slots = slots;

// ---- sala de móviles (F10) ----
let room = null, qr = null, padUrl = '';
const transport = Q.get('net') === 'loop' ? loopbackTransport() : peerTransport(Peer, { debug: 0 });
function padUrlFor(code) {
  const base = new URL('mando/', location.href);
  base.search = ''; base.searchParams.set('s', code);
  if (Q.get('net') === 'loop') base.searchParams.set('net', 'loop');
  return base.toString();
}
async function openRoom() {
  if (Q.has('nonet')) { app.net = 'SALA|DESACTIVADA'; return; }
  // Versión para páginas que bloquean WebRTC (p. ej. el enlace privado de Claude): solo teclado y mandos.
  if (globalThis.ARDE_SIN_RED) { app.net = 'MÓVILES:|SOLO EN LA|VERSIÓN WEB'; return; }
  room = createRoom({ transport, slots, onEvent: onRoomEvent });
  app.room = room;
  try {
    const code = await room.start();
    padUrl = padUrlFor(code);
    qr = qrMatrix(padUrl);
    app.code = code; app.padUrl = padUrl;
    if (/localhost|127\.0\.0\.1/.test(location.hostname) && Q.get('net') !== 'loop') app.net = 'OJO: USA LA IP DE TU RED';
  } catch (e) {
    console.warn('sala', e);
    app.net = 'SIN CONEXIÓN|A INTERNET';
    room = null;
  }
}

function onRoomEvent(e) {
  const w = app.world;
  if (e.type === 'join') { audio.sfx('join'); room.sendTo(e.slot, { t: 'fase', fase: phoneFase() }); app.countdown = 0; }
  else if (e.type === 'away') { if (w) setAway(w, e.slot, true); }
  else if (e.type === 'back') { if (w) setAway(w, e.slot, false); }
  else if (e.type === 'leave') { if (w) removePlayer(w, e.slot); }
  else if (e.type === 'ready' && e.ready && w && (app.screen === 'juego' || app.screen === 'pausa')) joinWorld(e.slot);
  else if (e.type === 'hero' || e.type === 'ready') audio.sfx('menu');
}

const phoneFase = () => (app.screen === 'juego' || app.screen === 'pausa' || app.screen === 'intro' ? 'juego' : app.screen === 'resultado' ? 'resultado' : 'sala');

// ---- entradas ----
function sourceInput(key) {
  const s = LOCAL.find((x) => x.key === key);
  if (s) return s.read();
  if (key.startsWith('movil:') && room) {
    const i = slots.indexOf(key);
    const src = i >= 0 ? room.sourceFor(i) : null;
    return src ? src.read() : NEUTRAL;
  }
  return NEUTRAL;
}
function slotInput(i) {
  const s = slots.get(i);
  if (!s) return NEUTRAL;
  if (BOT && app.world && app.screen === 'juego') return botInput(app.world, i);
  return sourceInput(s.key);
}

// Entra en la partida en curso (F10.5: entrar en caliente).
function joinWorld(i) {
  const w = app.world, s = slots.get(i);
  if (!w || !s || playerBySlot(w, i)) return;
  addPlayer(w, { slot: i, hero: s.hero, palette: s.palette });
}

// Al cambiar de pantalla, las teclas que siguen pulsadas no cuentan como una pulsación nueva.
function primeEdges() {
  const keys = [...LOCAL.map((s) => s.key), ...slots.joined().filter((s) => s.kind === 'movil').map((s) => s.key)];
  for (const k of keys) { const inp = sourceInput(k); for (const pre of ['', 'l:', 'p:', 'm:']) edgeOf(pre + k, inp); }
}
function go(screen) { app.screen = screen; app.t = 0; primeEdges(); }

function localJoins() {
  // Fuentes locales sin hueco: GOLPE para unirse.
  for (const src of LOCAL) {
    if (slots.indexOf(src.key) >= 0) continue;
    const e = edgeOf(src.key, src.read());
    if (e.golpe && !slots.full) {
      const i = slots.join(src.key, src.kind);
      if (i !== null) {
        audio.sfx('join');
        if (app.screen === 'juego' || app.screen === 'pausa') { slots.setReady(i, true); joinWorld(i); }
      }
    }
  }
}

// ---- partida ----
function newGame() {
  const players = slots.joined().map((s) => ({ slot: s.slot, hero: s.hero, palette: s.palette }));
  app.world = createWorld({ seed: SEED, levelIdx: START_LEVEL, players, opts: { assisted: opts.assisted } });
  fx.clear();
  goIntro();
}
function goIntro() { go('intro'); audio.play(app.world.level.music); room && room.broadcast({ t: 'fase', fase: 'juego' }); }

function handleWorldEvents(w) {
  fx.push(w, w.events, opts);
  for (const e of w.events) {
    switch (e.type) {
      case 'hit':
        audio.sfx('hit');
        if (e.team === 'p' && room) room.sendTo(e.slot, { t: 'vibra', ms: 60 });
        break;
      case 'landed': if (room) room.sendTo(e.slot, { t: 'vibra', ms: 15 }); break;
      case 'swing': audio.sfx('swing'); break;
      case 'block': audio.sfx('block'); break;
      case 'jump': audio.sfx('jump'); break;
      case 'land': if (e.team === 'e') audio.sfx('land'); break;
      case 'special': audio.sfx('special'); if (room) room.sendTo(e.slot, { t: 'vibra', ms: 120 }); break;
      case 'ko': audio.sfx('ko'); if (e.boss) audio.play(w.level.music); break;
      case 'pickup': audio.sfx('pickup'); break;
      case 'break': audio.sfx('break'); break;
      case 'go': audio.sfx('go'); break;
      case 'shoot': audio.sfx('shoot'); break;
      case 'boss': audio.play(BOSS_SONG); break;
      case 'clear': audio.sfx('clear'); break;
      default: break;
    }
  }
}

function sendPhoneState() {
  if (!room) return;
  for (const s of slots.joined()) {
    if (s.kind !== 'movil') continue;
    const p = app.world && playerBySlot(app.world, s.slot);
    room.sendTo(s.slot, {
      t: 'estado', fase: phoneFase(), hero: s.hero, ready: s.ready,
      hp: p ? Math.ceil(p.hp) : 0, maxHp: p ? p.maxHp : 0, lives: p ? p.lives : 0, score: p ? p.score : 0, away: !!(p && p.away),
      enJuego: !!p,
    });
  }
}

// ---- pantallas: lógica a 60 Hz ----
function anyEdge() {
  const all = { golpe: false, salto: false, especial: false, pausa: false, left: false, right: false, up: false, down: false, from: null };
  const check = (key, inp) => { const e = edgeOf(`m:${key}`, inp); for (const k in e) if (e[k]) { all[k] = true; all.from = all.from ?? key; } };
  for (const src of LOCAL) check(src.key, src.read());
  for (const s of slots.joined()) if (s.kind === 'movil') check(s.key, sourceInput(s.key));
  return all;
}

function stepLobby() {
  localJoins();
  for (const s of slots.joined()) {
    if (s.kind === 'movil') continue;
    const e = edgeOf(`l:${s.key}`, sourceInput(s.key));
    if (!s.ready) {
      if (e.left) { slots.cycleHero(s.slot, -1); audio.sfx('menu'); }
      if (e.right) { slots.cycleHero(s.slot, 1); audio.sfx('menu'); }
      if (e.golpe && s.joinedAt !== undefined && app.t - s.joinedAt > 2) { slots.setReady(s.slot, true); audio.sfx('menu'); }
      if (e.salto) { slots.leave(s.key); edges.delete(s.key); }
    } else if (e.salto) slots.setReady(s.slot, false);
    if (s.joinedAt === undefined) slots.get(s.slot).joinedAt = app.t;
  }
  const joined = slots.joined();
  const allReady = joined.length > 0 && joined.every((s) => s.ready);
  if (allReady) { if (app.countdown <= 0) app.countdown = 180; else if (--app.countdown <= 1) { app.countdown = 0; newGame(); } }
  else app.countdown = 0;
}

function stepGame() {
  const w = app.world;
  localJoins();
  // pausa
  for (const s of slots.joined()) {
    const e = edgeOf(`p:${s.key}`, sourceInput(s.key));
    if (e.pausa) { app.pauseSel = 0; app.pausedBy = s.key; audio.suspend(); app.screen = 'pausa'; primeEdges(); return; }
  }
  const inputs = [];
  for (let i = 0; i < MAX_PLAYERS; i++) inputs[i] = slotInput(i);
  tick(w, inputs);
  handleWorldEvents(w);
  fx.step();
  if (room) room.update();
  if (w.done) {
    if (w.level.final) { app.screen = 'final'; app.t = 0; }
    else { app.screen = 'superado'; app.t = 0; }
  } else if (w.over) { app.screen = 'fin'; app.t = 0; audio.stop(); }
}

function finishResults(final) {
  const ps = app.world ? app.world.fighters.filter((f) => f.team === 'p').map((f) => ({ slot: f.slot, type: f.type, palette: f.palette, score: f.score, kos: f.kos, food: f.food, continues: f.continues })) : [];
  app.results = { players: ps.sort((a, b) => a.slot - b.slot), final };
  go('resultado');
  room && room.broadcast({ t: 'fase', fase: 'resultado' });
}

function stepPause() {
  const e = anyEdge();
  if (e.pausa) { app.screen = 'juego'; primeEdges(); audio.resume(); return; }
  if (e.up) app.pauseSel = (app.pauseSel + PAUSE_ITEMS.length - 1) % PAUSE_ITEMS.length;
  if (e.down) app.pauseSel = (app.pauseSel + 1) % PAUSE_ITEMS.length;
  const item = PAUSE_ITEMS[app.pauseSel];
  const change = e.left || e.right || e.golpe;
  if (!change) return;
  if (item === 'continuar' && e.golpe) { app.screen = 'juego'; primeEdges(); audio.resume(); }
  else if (item === 'sacudida') opts.shake = !opts.shake;
  else if (item === 'asistido') { opts.assisted = !opts.assisted; if (app.world) app.world.opts.assisted = opts.assisted; }
  else if (item === 'destellos') opts.flashes = !opts.flashes;
  else if (item === 'volumen') { opts.volume = Math.round(Math.min(1, Math.max(0, opts.volume + (e.left ? -0.1 : 0.1))) * 10) / 10; audio.setVolume(opts.volume); }
  else if (item === 'salir' && e.golpe) { audio.resume(); audio.stop(); app.world = null; go('titulo'); for (const s of slots.joined()) slots.setReady(s.slot, false); }
  saveOptions(opts);
}

function step() {
  app.t++;
  if (room && app.t % 15 === 0) sendPhoneState();
  switch (app.screen) {
    case 'titulo': {
      const e = anyEdge();
      if (e.golpe || app.tapped || AUTO) {
        app.tapped = false; audio.unlock(); audio.play(0);
        app.screen = 'sala'; app.t = 0; primeEdges();
        if (AUTO) {
          for (let i = 0; i < AUTO; i++) { const k = slots.join(LOCAL[i].key, LOCAL[i].kind, { hero: HERO_IDS[i % 4] }); slots.setReady(k, true); }
          newGame();
        }
      }
      break;
    }
    case 'sala': if (room) room.update(); stepLobby(); break;
    case 'intro': {
      if (room) room.update();
      localJoins();
      const e = anyEdge();
      if (app.t > 200 || (app.t > 30 && e.golpe) || SIM > 1) go('juego');
      break;
    }
    case 'juego': stepGame(); break;
    case 'pausa': if (room) room.update(); stepPause(); break;
    case 'superado':
      if (room) room.update();
      if (app.t > 150 || SIM > 1) { startLevel(app.world, app.world.levelIdx + 1); fx.clear(); goIntro(); }
      break;
    case 'final':
      if (app.t > 240 || (SIM > 1 && app.t > 30)) finishResults(true);
      break;
    case 'fin':
      if (app.t > 180 || (SIM > 1 && app.t > 30)) finishResults(false);
      break;
    case 'resultado': {
      if (room) room.update();
      const e = anyEdge();
      if (app.t > 90 && e.golpe) {
        for (const s of slots.joined()) slots.setReady(s.slot, false);
        app.world = null; go('sala'); audio.play(0);
      }
      break;
    }
    default: break;
  }
}

// ---- dibujo ----
function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  switch (app.screen) {
    case 'titulo': drawTitle(ctx, app.t); break;
    case 'sala': drawLobby(ctx, { t: app.t, qr, code: app.code, url: '', slots: slots.list().map((s) => s && { ...s, away: room && room.isAway(s.slot) }), countdown: app.countdown, netStatus: app.net }); if (qr && app.net.startsWith('OJO')) drawText(ctx, app.net, W / 2, 182, { color: '#ff4d4d', align: 'center' }); // el QR apuntaría a localhost
      break;
    case 'intro': drawIntro(ctx, app.world.level, app.t); break;
    case 'juego': case 'pausa': case 'superado': case 'final': case 'fin':
      drawWorld(ctx, app.world, fx, opts);
      drawHud(ctx, app.world, { code: app.code, joinHint: app.code ? 'ÚNETE' : 'GOLPE' });
      if (app.screen === 'pausa') drawPause(ctx, app.pauseSel, opts);
      if (app.screen === 'superado') drawBanner(ctx, '¡PLANTA SUPERADA!', 'SEGUIMOS SUBIENDO…', app.t);
      if (app.screen === 'final') drawBanner(ctx, '¡A LA AZOTEA!', 'EL CONCIERTO PUEDE EMPEZAR', app.t);
      if (app.screen === 'fin') drawBanner(ctx, 'FIN DEL JUEGO', 'SILENCIO S.A. GANA ESTA VEZ', app.t);
      break;
    case 'resultado': drawResults(ctx, { ...app.results, t: app.t }); break;
    default: break;
  }
}

// ---- bucle ----
let last = performance.now(), acc = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (SIM > 1) for (let i = 0; i < SIM; i++) step();
  else { acc += dt; let n = 0; while (acc >= 1 / 60 && n < 5) { step(); acc -= 1 / 60; n++; } }
  draw();
  requestAnimationFrame(frame);
}

addEventListener('pointerdown', () => { audio.unlock(); if (app.screen === 'titulo') app.tapped = true; }, { capture: true });
addEventListener('keydown', () => audio.unlock(), { once: true });
document.addEventListener('visibilitychange', () => { if (document.hidden && app.screen === 'juego') { app.screen = 'pausa'; app.pauseSel = 0; audio.suspend(); } });

openRoom();
requestAnimationFrame(frame);
