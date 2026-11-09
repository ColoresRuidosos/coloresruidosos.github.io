// «Yo contra mi corazón»: arranque, pantallas, bucle y entrada.
import { BEATMAP } from './data/beatmap.js';
import { createMatch, step, rankOf } from './game/match.js';
import { createBot } from './game/bot.js';
import { createGestures } from './input/gestures.js';
import { createPlayer, createSimPlayer } from './audio/player.js';
import { createSfx } from './audio/sfx.js';
import { loadSave, writeSave, recordResult } from './core/save.js';
import { loadSprites } from './render/sprites.js';
import { drawScene, createFx, feedFx, stepFx, W, H, MIC_BTN, PAUSE_BTN } from './render/view.js';
import * as S from './render/screens.js';
import { shareCard } from './share/card.js';
import { createRanking, createDemoRanking, generarNombre, nuevoDispositivo, armarEnvio } from './ranking/ranking.js';
import { temporada } from './ranking/temporada.js';
import { tipFor } from './game/tips.js';
import { RANKING_URL } from './data/config.js';

const params = new URLSearchParams(location.search);
// Versión de prueba (un solo HTML): trae la canción incrustada y usa un ranking que vive en el navegador.
const PRUEBA = globalThis.YCMC_PRUEBA || null;
const SONG_URL = PRUEBA?.song || 'cancion.mp3';
const SIM = Number(params.get('sim')) || 0;          // ?sim=8: reloj simulado sin audio (pruebas)
const BOT = params.has('bot');                        // ?bot: juega solo (demo y pruebas)

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = W; canvas.height = H;
ctx.imageSmoothingEnabled = false;

const store = (() => { try { return window.localStorage; } catch { return null; } })();
const app = {
  screen: 'carga', prev: null, buttons: [], save: loadSave(store), loadFrac: 0, loadError: null,
  player: null, sfx: () => {}, match: null, fx: createFx(), queue: [], bot: null,
  countdownEnd: 0, overShown: 0, newRecord: false, shareMsg: '', lastT: 0, frameT: performance.now(),
  temp: temporada(), ranking: null, rk: { status: 'cargando', lista: [], error: null, page: 0, from: 'titulo' },
  pub: { status: 'listo', error: null }, published: false,
};
app.ranking = PRUEBA || params.has('rankingPrueba') ? createDemoRanking(store) : createRanking({ url: RANKING_URL });
if (!app.save.dispositivo) { app.save.dispositivo = nuevoDispositivo(); writeSave(store, app.save); }
window.__ycmc = app;

// ---------- tamaño: vertical, escalado sin suavizado ----------
function fit() {
  const s = Math.min(innerWidth / W, innerHeight / H);
  canvas.style.width = `${Math.floor(W * s)}px`; canvas.style.height = `${Math.floor(H * s)}px`;
}
addEventListener('resize', fit); fit();
const coarse = matchMedia('(pointer: coarse)').matches;
const landscape = () => coarse && innerWidth > innerHeight * 1.1;

// ---------- audio ----------
function makePlayer() {
  if (SIM) return createSimPlayer({ speed: SIM });
  const p = createPlayer();
  const fx = createSfx(p.ctx, p.master);
  app.sfx = (e) => { fx(e); if (e.type === 'golpe' && app.save.opts.vibracion) navigator.vibrate?.(60); };
  return p;
}
async function loadSong() {
  app.screen = 'carga'; app.loadError = null; app.loadFrac = 0;
  try {
    app.player = app.player || makePlayer();
    await app.player.load(SONG_URL, (f) => { app.loadFrac = f; });
    app.screen = 'titulo';
  } catch (e) {
    console.error(e);
    app.loadError = 'NO SE PUDO CARGAR LA CANCIÓN. REVISA TU CONEXIÓN.';
  }
}

// ---------- partida ----------
function startGame() {
  const seed = Number(params.get('seed')) || ((Math.random() * 1e9) >>> 0);
  app.match = createMatch({ beatmap: BEATMAP, seed, assist: app.save.opts.asistido });
  app.fx = createFx(); app.queue = []; app.overShown = 0; app.newRecord = false; app.shareMsg = ''; app.lastT = -1;
  app.published = false; app.pub = { status: 'listo', error: null };
  app.bot = BOT ? createBot({ seed }) : null;
  app.player.start(0);
  app.screen = 'juego';
}
function songNow(perf = performance.now()) { return app.player.songTime(perf, app.save.opts.desfase); }

function pause() {
  if (app.screen !== 'juego' || app.match?.over) return;
  app.player.pause(); app.screen = 'pausa';
}
function resumeWithCountdown() {
  app.screen = 'cuenta'; app.countdownEnd = performance.now() + 3 * (60000 / BEATMAP.bpm) * 2;
}
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

// ---------- entrada ----------
const gestures = createGestures({
  emit: (a) => { if (app.screen === 'juego' && !app.match.over) app.queue.push({ ...a, t: songNow(a.at) }); },
  threshold: 24, tapMs: 220,
});
const toLogical = (e) => { const r = canvas.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H]; };

canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  const [x, y] = toLogical(e);
  if (app.screen === 'juego') {
    if (x >= PAUSE_BTN.x - 12 && x < PAUSE_BTN.x + 12 && y >= PAUSE_BTN.y - 4 && y < PAUSE_BTN.y + PAUSE_BTN.h + 4) { pause(); return; }
    if (Math.hypot(x - MIC_BTN.x, y - MIC_BTN.y) <= MIC_BTN.r + 4) { app.queue.push({ type: 'mic', t: songNow(e.timeStamp) }); return; }
    canvas.setPointerCapture?.(e.pointerId);
    gestures.down(e.pointerId, e.clientX, e.clientY, e.timeStamp);
  }
}, { passive: false });
canvas.addEventListener('pointermove', (e) => { if (app.screen === 'juego') gestures.move(e.pointerId, e.clientX, e.clientY, e.timeStamp); });
canvas.addEventListener('pointercancel', (e) => gestures.cancel(e.pointerId));
canvas.addEventListener('pointerup', (e) => {
  if (app.screen === 'juego') { gestures.up(e.pointerId, e.clientX, e.clientY, e.timeStamp); return; }
  const [x, y] = toLogical(e);
  const b = S.hit(app.buttons, x, y);
  if (b) onButton(b.id);
});
addEventListener('keydown', (e) => {
  if (app.screen === 'juego') {
    if (e.key === 'Escape' || e.key === 'p') { pause(); return; }
    if (gestures.key(e.key, e.timeStamp, e.repeat)) e.preventDefault();
  } else if ((e.key === 'Enter' || e.key === ' ') && app.buttons[0]) { e.preventDefault(); onButton(app.buttons[0].id); }
  else if (e.key === 'Escape' && app.screen === 'pausa') onButton('continuar');
});

async function onButton(id) {
  const o = app.save.opts;
  switch (id) {
    case 'jugar':
      if (!app.temp.abierta) break;
      app.player.unlock();
      if (!app.save.seenHowTo) { app.screen = 'como'; app.prev = 'jugar'; } else startGame();
      break;
    case 'como': app.screen = 'como'; app.prev = 'titulo'; break;
    case 'listo':
      app.save.seenHowTo = true; writeSave(store, app.save);
      if (app.prev === 'jugar') { app.player.unlock(); startGame(); } else app.screen = 'titulo';
      break;
    case 'opciones': app.screen = 'opciones'; break;
    case 'sinDestellos': case 'asistido': case 'vibracion': o[id] = !o[id]; writeSave(store, app.save); break;
    case 'desfaseMenos': o.desfase = Math.max(-300, o.desfase - 10); writeSave(store, app.save); break;
    case 'desfaseMas': o.desfase = Math.min(300, o.desfase + 10); writeSave(store, app.save); break;
    case 'volver': app.screen = 'titulo'; break;
    case 'continuar': resumeWithCountdown(); break;
    case 'reiniciar': app.player.stop(); await app.player.resume(); startGame(); break;
    case 'salir': case 'inicio': app.player.stop(); if (app.screen === 'pausa') await app.player.resume(); app.screen = 'titulo'; break;
    case 'reintentar': startGame(); break;
    case 'compartir': {
      const m = app.match;
      const r = await shareCard({ over: m.over, score: m.score, rank: rankOf(m.score), stats: m.stats, maxCombo: m.maxCombo });
      app.shareMsg = r === 'descargado' ? 'IMAGEN DESCARGADA' : r === 'compartido' ? '¡GRACIAS POR COMPARTIR!' : '';
      break;
    }
    case 'reintentarCarga': loadSong(); break;
    case 'ranking': openRanking(app.screen); break;
    case 'rkPrev': app.rk.page = Math.max(0, app.rk.page - 1); break;
    case 'rkNext': app.rk.page++; break;
    case 'rkVolver': app.screen = app.rk.from; break;
    case 'publicar':
      if (!app.save.rankName) { app.save.rankName = generarNombre(); writeSave(store, app.save); }
      app.pub = { status: 'listo', error: null }; app.screen = 'publicar'; break;
    case 'otroNombre': app.save.rankName = generarNombre(Math.random, app.save.rankName); writeSave(store, app.save); break;
    case 'cancelarPub': app.screen = 'resultado'; break;
    case 'enviar': {
      if (app.pub.status === 'enviando') break;
      const m = app.match;
      app.pub = { status: 'enviando', error: null };
      const r = await app.ranking.publicar(armarEnvio(app.save.rankName, m.score, Math.min(m.t, BEATMAP.duration) * 1000, app.save.dispositivo));
      if (r.ok) { app.published = true; openRanking('resultado'); } else app.pub = { status: 'listo', error: r.error };
      break;
    }
    default: break;
  }
}

async function openRanking(from) {
  app.rk = { status: 'cargando', lista: [], error: null, page: 0, from: from === 'ranking' ? app.rk.from : from };
  app.screen = 'ranking';
  if (!app.ranking) { app.rk = { ...app.rk, status: 'listo', error: 'no-listo' }; return; }
  const r = await app.ranking.top();
  const mine = r.lista.findIndex((f) => f.nombre === app.save.rankName);
  app.rk = { ...app.rk, status: 'listo', lista: r.lista, error: r.error || null, page: mine >= 10 ? 1 : 0 };
}

// ---------- bucle ----------
function frame(now) {
  const dt = Math.min(0.05, (now - app.frameT) / 1000); app.frameT = now;
  app.buttons = [];
  if (landscape()) { if (app.screen === 'juego') pause(); S.drawRotate(ctx); requestAnimationFrame(frame); return; }
  const sc = app.screen;
  if (sc === 'carga') app.buttons = S.drawLoading(ctx, app.loadFrac, app.loadError);
  if (Math.floor(now / 1000) !== Math.floor((now - dt * 1000) / 1000)) app.temp = temporada();
  if (sc === 'titulo') app.buttons = S.drawTitle(ctx, now / 1000, app.save, app.temp);
  else if (sc === 'ranking') app.buttons = S.drawRanking(ctx, app.rk, { miNombre: app.save.rankName, prueba: !!app.ranking?.prueba, temp: app.temp });
  else if (sc === 'publicar') app.buttons = S.drawPublish(ctx, app.match, app.save.rankName, app.pub, !!app.ranking?.prueba);
  else if (sc === 'como') app.buttons = S.drawHowTo(ctx);
  else if (sc === 'opciones') app.buttons = S.drawOptions(ctx, app.save.opts);
  else if (sc === 'juego' || sc === 'pausa' || sc === 'cuenta' || sc === 'resultado') {
    const m = app.match;
    let t = app.lastT;
    if (sc === 'juego') {
      t = Math.max(app.lastT, songNow(now));
      const acts = app.queue.splice(0);
      if (app.bot && !m.over) { const from = Math.max(0, app.lastT); acts.push(...app.bot(m, from, Math.max(1e-3, t - from))); }
      step(m, t, acts);
      feedFx(app.fx, m, app.save.opts, app.sfx);
      if (m.over && !app.overShown) {
        app.overShown = now; app.player.fadeOut(2);
        app.newRecord = recordResult(app.save, m.score, rankOf(m.score)); writeSave(store, app.save);
        const lost = m.over === 'derrota' || m.over === 'perdio';
        app.derrotas = lost ? (app.derrotas || 0) + 1 : 0;
        app.tip = lost ? tipFor(m, { derrotasSeguidas: app.derrotas }) : null;
      }
      if (app.overShown && now - app.overShown > 2600) app.screen = 'resultado';
    }
    if (sc !== 'pausa' && sc !== 'cuenta') stepFx(app.fx, dt);
    app.lastT = t;
    drawScene(ctx, m, t, app.fx, app.save.opts);
    if (sc === 'pausa') app.buttons = S.drawPause(ctx);
    if (sc === 'cuenta') {
      const left = app.countdownEnd - now;
      if (left <= 0) { app.player.resume(); app.screen = 'juego'; } else S.drawCountdown(ctx, Math.ceil(left / ((60000 / BEATMAP.bpm) * 2)));
    }
    if (sc === 'resultado') app.buttons = S.drawResult(ctx, m, { ...app, ranking: app.ranking && m.t >= 20, tip: app.tip });
  }
  requestAnimationFrame(frame);
}

loadSprites().then(() => { loadSong(); requestAnimationFrame(frame); });
