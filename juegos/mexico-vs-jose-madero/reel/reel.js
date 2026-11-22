// Tráiler del Mundo 3 «Alba» (reel/spec.md). Todo sale del juego real: el bot juega 3-1, 3-2 y 3-3 y se graba.
// El juego es determinista: se busca cada momento y se vuelve a simular hasta poco antes para grabarlo.
import { SCENES, FPS, RW, RH, GAME_X, GAME_Y, totalFrames, sceneAt } from './timeline.js';
import { createGame, stepGame } from '../src/game/game.js';
import { WORLD_3 } from '../src/data/world3.js';
import { PASAJES_POR_NIVEL } from '../src/data/alba-story.js';
import { SCENE_ART } from '../src/data/scenes-art.js';
import { createArt, drawWorld, drawHud, drawCostume, text } from '../src/render/draw.js';
import { createCamera, stepCamera } from '../src/engine/camera.js';
import { albaBot } from '../tests/bot.js';

const cv = document.getElementById('reel'), ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;
const game = Object.assign(document.createElement('canvas'), { width: 320, height: 224 }), gctx = game.getContext('2d');
gctx.imageSmoothingEnabled = false;
const NONE = { left: false, right: false, jump: false, mic: false, special: false };
const img = (src) => Object.assign(new Image(), { src });
const SCN = { a1: img(SCENE_ART.a1.png) };

// ── Momentos (en pasos de 60 Hz desde el inicio del nivel) ──
const CLIPS = {
  atril: { lvl: 0, lead: 50, when: (g) => g.events.includes('pasaje') && g.alba.leidos.length === 2 },
  enemigos: { lvl: 0, lead: 70, when: (g) => g.events.includes('defeat') },
  tiro: { lvl: 1, lead: 20, when: (g) => g.alba.tiro?.status === 'play' && g.alba.tiro.malas >= 2 },
  rueda: { lvl: 1, lead: 30, when: (g) => !!g.alba.ride },
  nube: { lvl: 2, lead: 10, when: (g) => g.alba.boss?.phase === 1 && g.alba.boss.t > 0.6 },
  despedida: { lvl: 2, lead: 10, when: (g) => g.alba.boss?.phase === 4 },
};
const newGame = (lvl) => {
  const L = WORLD_3[lvl], g = createGame(L.map, {}, { alba: { start: PASAJES_POR_NIVEL[L.id] } });
  g.intro = null;
  return { g, L, art: createArt(g.level, L.theme, { costume: 'alba' }) };
};
function findMoment(c) {
  const { g } = newGame(c.lvl);
  for (let i = 0; i < 60 * 150 && g.status === 'play'; i++) { stepGame(g, albaBot(g)); if (c.when(g)) return i; }
  throw new Error('momento no encontrado');
}
const silent = (g, keepPasaje = false) => { g.thought = null; g.hint = null; if (g.popups) g.popups.length = 0; if (!keepPasaje && g.alba) g.alba.pasaje = null; };

// Estado de la escena en curso (se prepara al entrar en ella).
let cur = null, events = [];
function prepare(sc) {
  if (sc.kind === 'clip') {
    const c = CLIPS[sc.clip], at = c.at ??= findMoment(c);
    const run = newGame(c.lvl);
    for (let i = 0; i < Math.max(0, at - c.lead); i++) { stepGame(run.g, albaBot(run.g)); silent(run.g, sc.clip === 'atril'); }
    run.cam = createCamera(run.g.player.x + run.g.player.w / 2, run.g.level.w * 16, 1);
    cur = { sc, run };
  } else if (sc.kind === 'quieto') {
    const run = newGame(0), g = run.g;
    g.player.x = 38 * 16; g.checkpoint = { x: 26 * 16, y: g.checkpoint.y };
    for (let i = 0; i < 60 * 2.4; i++) { stepGame(g, NONE); silent(g); }
    run.cam = createCamera(g.player.x + g.player.w / 2, g.level.w * 16, 1);
    cur = { sc, run };
  } else cur = { sc };
}

function drawGame(run, t, bot = true) {
  const g = run.g;
  for (let k = 0; k < 60 / FPS; k++) {
    stepGame(g, bot ? albaBot(g) : NONE); silent(g, cur.sc.clip === 'atril');
    for (const e of g.events) events.push({ f: frameNo, e });
  }
  const p = g.player;
  const camX = stepCamera(run.cam, p.x + p.w / 2, g.level.w * 16, p.facing);
  drawWorld(gctx, g, run.art, camX, t, run.L.id, { flashes: true, shake: true });
  drawHud(gctx, g, `${run.L.id} ${run.L.name}`, t, run.art, { notas: false });
  frameGame(game);
}
function frameGame(src) {
  ctx.fillStyle = '#1b1226'; ctx.fillRect(GAME_X - 3, GAME_Y - 3, 326, 230);
  ctx.fillStyle = '#e8b84a'; ctx.fillRect(GAME_X - 2, GAME_Y - 2, 324, 1); ctx.fillRect(GAME_X - 2, GAME_Y + 225, 324, 1);
  ctx.drawImage(src, GAME_X, GAME_Y);
}

// Fondo del lienzo: amanecer que va de la noche (arriba) a dorado (abajo), con polvo de luz.
function backdrop(t, k) {
  const bands = ['#1b1226', '#2a1e3a', '#3a2c4a', '#5a4058', '#8a5a58', '#c08060', '#e8b070', '#ffd890'];
  for (let i = 0; i < bands.length; i++) { ctx.fillStyle = bands[i]; ctx.fillRect(0, Math.floor(i * RH / bands.length), RW, Math.ceil(RH / bands.length)); }
  ctx.fillStyle = 'rgba(18,8,16,' + (0.55 - 0.25 * k) + ')'; ctx.fillRect(0, 0, RW, RH);
  for (let i = 0; i < 26; i++) { const x = (i * 97 + t * 8) % RW, y = (i * 53 + Math.sin(t + i) * 10 + RH) % RH; ctx.fillStyle = i % 3 ? '#ffd040' : '#fff8b0'; ctx.globalAlpha = 0.35; ctx.fillRect(x, y, 2, 2); }
  ctx.globalAlpha = 1;
}
function captions(sc, local) {
  for (const c of sc.captions ?? []) {
    const age = local - c.at;
    if (age < 0) continue;
    const a = Math.min(1, age * 5), dy = Math.round((1 - a) * 8);
    ctx.globalAlpha = a;
    text(ctx, c.text, RW / 2, c.y + dy, { align: 'center', scale: c.scale ?? 2, color: c.color ?? '#ffffff', shadow: '#1b1226' });
    ctx.globalAlpha = 1;
  }
}
function scene(id, local, secs, mode) {
  const im = SCN[id];
  frameGame(game);   // marco
  ctx.fillStyle = '#000'; ctx.fillRect(GAME_X, GAME_Y, 320, 224);
  const k = Math.min(1, local / secs);
  ctx.save();
  if (mode === 'amanece') ctx.filter = `sepia(${(1 - k).toFixed(2)}) brightness(${(0.6 + 0.4 * k).toFixed(2)})`;
  const zoom = 1 + 0.06 * k;   // acercamiento lento
  ctx.translate(GAME_X + 160, GAME_Y + 112); ctx.scale(zoom, zoom);
  ctx.drawImage(im, -160, -75);
  ctx.restore(); ctx.filter = 'none';
}
function cierre(t, local) {
  frameGame(game);
  const g = gctx;
  const bands = ['#3a4a6a', '#5a6a88', '#8a8aa0', '#c8a890', '#f0c890', '#ffe0a8'];
  for (let i = 0; i < bands.length; i++) { g.fillStyle = bands[i]; g.fillRect(0, i * 38, 320, 38); }
  const r = 30 + local * 6;   // sale el sol
  g.fillStyle = '#ffd040'; g.beginPath(); g.arc(160, 190, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff8b0'; g.beginPath(); g.arc(160, 190, r * 0.7, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#6a7a50'; g.fillRect(0, 196, 320, 28);
  g.save(); g.translate(160, 196); g.scale(3, 3); drawCostume(g, cierreArt, 'alba', 'idle', 0, 0); g.restore();
  ctx.drawImage(game, GAME_X, GAME_Y);
}
let cierreArt = null;

let frameNo = 0, lastScene = null;
function frame(i) {
  frameNo = i;
  const sc = sceneAt(i), local = (i - sc.from) / FPS, t = i / FPS;
  if (sc !== lastScene) { prepare(sc); lastScene = sc; events.push({ f: i, e: 'escena:' + sc.id }); }
  backdrop(t, i / totalFrames());
  if (sc.kind === 'clip') drawGame(cur.run, t);
  else if (sc.kind === 'quieto') drawGame(cur.run, t, false);
  else if (sc.kind === 'escena') scene(sc.scene, local, sc.secs, sc.id === 'titulo' ? 'amanece' : 'fijo');
  else cierre(t, local);
  captions(sc, local);
  // Corte: 3 cuadros desde negro al empezar cada escena.
  const into = i - sc.from;
  if (into < 3) { ctx.fillStyle = `rgba(0,0,0,${1 - into / 3})`; ctx.fillRect(0, 0, RW, RH); }
  return cv.toDataURL('image/png');
}

window.reel = {
  fps: FPS, frames: totalFrames(),
  ready: Promise.all([...Object.values(SCN).map((m) => m.decode()), (async () => { const L = WORLD_3[0]; cierreArt = createArt(createGame(L.map, {}, { alba: {} }).level, L.theme, { costume: 'alba' }); await cierreArt.ready; frame(SCENES.find((x) => x.id === 'atril').from); await new Promise((r) => setTimeout(r, 800)); })()]),
  setup() { lastScene = null; events = []; for (const c of Object.values(CLIPS)) delete c.at; },
  frame,
  events: () => events,
};
