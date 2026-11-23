// BunnyLand · Hanzer × Colores Ruidosos. Conecta lógica pura, entrada, pantalla y sonido.
// Parámetros de prueba: ?seed=3 · ?bot · ?nivel=4 · ?sim=4 (más rápido) · ?menos (menos movimiento) · ?mudo
import { createMatch, stepMatch } from './game/match.js';
import { botDir } from './game/bot.js';
import { createLoop } from './core/loop.js';
import { load, save } from './core/storage.js';
import { createSwipe, dirFromKey } from './input/gestures.js';
import { drawStage } from './render/stage.js';
import { drawHud } from './render/hud.js';
import { drawTitle, drawHowTo, drawOverlay, drawPause, drawGameOver, drawRotate, BOTONES_FIN } from './render/screens.js';
import { glitchBands } from './render/glitch.js';
import { drawText } from './render/text.js';
import { W, H, TOP, MAZE_H, BOTONES, dentro } from './render/layout.js';
import { crearMusica } from './audio/synth.js';
import { SFX } from './audio/sfx.js';
import { compartir, LINKS } from './share/card.js';

const q = new URLSearchParams(location.search);
const OPT = { seed: Number(q.get('seed')) || (Date.now() % 100000), bot: q.has('bot'), nivel: Number(q.get('nivel')) || 0, sim: Math.max(1, Number(q.get('sim')) || 1), menos: q.has('menos') || matchMedia('(prefers-reduced-motion: reduce)').matches };

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = W; canvas.height = H;

const S = { pantalla: 'titulo', m: null, frame: 0, mudo: q.has('mudo') || load('mudo', false), record: load('record', 0), flotantes: [], dir: null };

// ---------- Sonido ----------
let actx = null, master = null, musica = null;
function audio() {
  if (actx) return;
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    master = actx.createGain(); master.gain.value = S.mudo ? 0 : 0.5; master.connect(actx.destination);
    musica = crearMusica(actx, master);
  } catch { actx = null; }
}
function sfx(ev) { if (actx && !S.mudo && SFX[ev.type]) SFX[ev.type](actx, master, ev); }
function setMudo(v) { S.mudo = v; save('mudo', v); if (master) master.gain.value = v ? 0 : 0.5; }

// ---------- Escalado ----------
function resize() {
  const s = Math.min(innerWidth / W, innerHeight / H);
  canvas.style.width = `${Math.floor(W * s)}px`; canvas.style.height = `${Math.floor(H * s)}px`;
}
addEventListener('resize', resize); resize();
const toLogical = (e) => { const r = canvas.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H]; };
const girar = () => matchMedia('(pointer: coarse)').matches && innerWidth > innerHeight;

// ---------- Partida ----------
function nueva() {
  S.m = createMatch({ seed: OPT.seed++, nivel: OPT.nivel, record: S.record });
  S.pantalla = 'juego'; S.flotantes = [];
  if (musica) musica.play(S.m.escenario);
}

function paso() {
  if (S.pantalla !== 'juego' || girar()) return;
  const m = S.m;
  const dir = OPT.bot ? botDir(m) : S.dir;
  S.dir = null;
  stepMatch(m, { dir });
  for (const ev of m.events) {
    sfx(ev);
    if (ev.type === 'abrazo' || ev.type === 'bonus') S.flotantes.push({ txt: `+${ev.pts}`, x: (ev.x ?? m.grid.bonus.x) * 8 + 4, y: TOP + (ev.y ?? m.grid.bonus.y) * 8, t: 50 });
    if (ev.type === 'hyper' && musica) musica.setHyper(true);
    if (ev.type === 'hyperFin' && musica) musica.setHyper(false);
    if (ev.type === 'pierde' && musica) musica.stop();
    if (ev.type === 'clear') { if (musica) musica.stop(); sfx({ type: 'clear' }); }
    if ((ev.type === 'nivel' || ev.type === 'go') && musica && !musica.sonando) { musica.setHyper(false); musica.play(m.escenario); }
    if (ev.type === 'over') { S.record = Math.max(S.record, m.score); save('record', S.record); S.pantalla = 'fin'; if (musica) musica.stop(); }
  }
  if (m.score > S.record) { S.record = m.score; save('record', S.record); }
  S.flotantes = S.flotantes.filter((f) => --f.t > 0);
}

// ---------- Dibujo ----------
function draw() {
  S.frame++;
  ctx.imageSmoothingEnabled = false;
  if (girar()) return drawRotate(ctx);
  if (S.pantalla === 'titulo') return drawTitle(ctx, S.frame, S.record);
  if (S.pantalla === 'tutorial') return drawHowTo(ctx, S.frame);
  if (S.pantalla === 'fin') return drawGameOver(ctx, S.m, S.frame);
  const m = S.m;
  drawStage(ctx, m, S.frame);
  if (m.hyper > 0) for (const b of glitchBands(m.t, MAZE_H, OPT.menos)) ctx.drawImage(canvas, 0, TOP + b.y, W, b.h, b.dx, TOP + b.y, W, b.h);
  for (const f of S.flotantes) drawText(ctx, f.txt, f.x, f.y - (50 - f.t) / 4, { color: '#FFFFFF', align: 'center', shadow: '#FF66C4' });
  drawOverlay(ctx, m, S.frame);
  drawHud(ctx, m, { mudo: S.mudo, frame: S.frame });
  if (S.pantalla === 'pausa') drawPause(ctx);
}

// ---------- Entrada ----------
const swipe = createSwipe((d) => { S.dir = d; }, 14);
let downAt = null;
canvas.addEventListener('pointerdown', (e) => { e.preventDefault(); audio(); if (actx?.state === 'suspended') actx.resume(); const [x, y] = toLogical(e); downAt = [x, y]; swipe.down(e.clientX, e.clientY); });
canvas.addEventListener('pointermove', (e) => { e.preventDefault(); swipe.move(e.clientX, e.clientY); });
canvas.addEventListener('pointerup', (e) => {
  swipe.up();
  const [x, y] = toLogical(e);
  if (!downAt || Math.hypot(x - downAt[0], y - downAt[1]) > 6) return;
  tap(x, y);
});
document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

function tap(x, y) {
  switch (S.pantalla) {
    case 'titulo': S.pantalla = load('tuto', false) ? (nueva(), 'juego') : 'tutorial'; break;
    case 'tutorial': save('tuto', true); nueva(); break;
    case 'pausa': S.pantalla = 'juego'; if (musica && !musica.sonando) musica.play(S.m.escenario); break;
    case 'juego':
      if (dentro(BOTONES.pausa, x, y)) pausar();
      else if (dentro(BOTONES.sonido, x, y)) setMudo(!S.mudo);
      break;
    case 'fin':
      if (dentro(BOTONES_FIN.otra, x, y)) nueva();
      else if (dentro(BOTONES_FIN.compartir, x, y)) compartir(S.m);
      else if (dentro(BOTONES_FIN.spotify, x, y)) open(LINKS.spotify, '_blank', 'noopener');
      else if (dentro(BOTONES_FIN.instagram, x, y)) open(LINKS.instagram, '_blank', 'noopener');
      break;
  }
}
function pausar() { if (S.pantalla === 'juego') { S.pantalla = 'pausa'; if (musica) musica.stop(); } }

addEventListener('keydown', (e) => {
  audio();
  const d = dirFromKey(e.key);
  if (d) { e.preventDefault(); S.dir = d; if (S.pantalla === 'titulo' || S.pantalla === 'tutorial') tap(-1, -1); return; }
  if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') { if (S.pantalla === 'pausa') tap(-1, -1); else pausar(); }
  if (e.key === 'm' || e.key === 'M') setMudo(!S.mudo);
  if (e.key === 'Enter' || e.key === ' ') { if (S.pantalla === 'fin') nueva(); else if (S.pantalla !== 'juego') tap(-1, -1); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) pausar(); });

// ---------- Bucle ----------
const loop = createLoop(() => { for (let i = 0; i < OPT.sim; i++) paso(); });
let last = performance.now();
function frame(now) { loop.advance(Math.min(100, now - last)); last = now; draw(); requestAnimationFrame(frame); }
requestAnimationFrame(frame);

// Ganchos para las pruebas en el navegador
window.__bunny = { S, OPT, nueva, tap };
