import { W, H, DT } from './game/constants.js';
import { createGame, stepGame } from './game/game.js';
import { followCamera } from './engine/camera.js';
import { WORLD_1 } from './data/world1.js';
import { ERA_FACTS_W1, CHAPTERS_W1, LEVEL_CARDS_W1 } from './data/carmesi-story.js';
import { createArt, drawWorld, drawHud, drawTitle, drawEnd, drawCard, drawIntro } from './render/draw.js';
import { createAudio } from './audio/audio.js';

const cv = document.getElementById('game');
cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;
const audio = createAudio();

// ── Progresión del Mundo 1 (spec §3.0e): capítulo → nivel → resumen → «¿Sabías que…?» → siguiente capítulo ──
let levelIdx = 0, carry = {}, levelStart = {};
let game, art;
function loadLevel(i, c = {}) {
  levelIdx = i; carry = c; levelStart = { ...c };
  const L = WORLD_1[i];
  game = createGame(L.map, c, { facts: ERA_FACTS_W1 });
  art = createArt(game.level, L.theme);
}
loadLevel(0);

let screen = 'title', camX = 0, t = 0, paused = false, card = null, screenT = 0;
const showCard = (c) => { card = c; screen = 'card'; screenT = 0; };
const chapterCard = (i) => ({ kind: 'chapter', n: i + 1, ...CHAPTERS_W1[WORLD_1[i].id], then: () => {} });
function startLevel(i, c) { loadLevel(i, c); showCard(chapterCard(i)); }
const store = {
  get: () => { try { return Number(localStorage.getItem('jmv-record')) || 0; } catch { return 0; } },
  set: (v) => { try { localStorage.setItem('jmv-record', String(v)); } catch { /* sin almacenamiento */ } },
};

// ── Entrada: teclado, táctil y mando → mismos 5 botones ──
const held = { left: false, right: false, jump: false, mic: false, special: false };
const KEYS = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', KeyZ: 'jump', Space: 'jump', ArrowUp: 'jump', KeyW: 'jump', KeyX: 'mic', KeyJ: 'mic', KeyK: 'mic', KeyC: 'special', KeyL: 'special' };
let startPressed = false;
addEventListener('keydown', (e) => {
  if (KEYS[e.code]) { held[KEYS[e.code]] = true; e.preventDefault(); }
  if (['Enter', 'KeyZ', 'Space'].includes(e.code)) startPressed = true;
  if (e.code === 'KeyP' || e.code === 'Escape') paused = !paused;
  if (e.code === 'KeyM') document.getElementById('music').textContent = audio.toggleMusic() ? '♪ ON' : '♪ OFF';
});
addEventListener('keyup', (e) => { if (KEYS[e.code]) held[KEYS[e.code]] = false; });

// Controles táctiles. En iOS, mantener pulsado selecciona texto y abre el menú «Copiar / Traducir»,
// y el botón se queda pegado: se bloquean esos gestos y cualquier interrupción suelta los botones.
const touching = new Map(); // pointerId → botón
const release = (k) => { held[k] = false; document.querySelector(`[data-btn="${k}"]`)?.classList.remove('on'); };
const releaseAll = () => { touching.clear(); for (const b of document.querySelectorAll('[data-btn]')) release(b.dataset.btn); };
for (const btn of document.querySelectorAll('[data-btn]')) {
  const k = btn.dataset.btn;
  const on = (e) => { e.preventDefault(); touching.set(e.pointerId, k); held[k] = true; btn.classList.add('on'); if (k === 'jump') startPressed = true; audio.unlock(); };
  const off = (e) => { e.preventDefault(); touching.delete(e.pointerId); release(k); };
  btn.addEventListener('pointerdown', on);
  btn.addEventListener('pointerup', off);
  btn.addEventListener('pointerleave', off);
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
}
const padEl = document.querySelector('.pad');
for (const ev of ['touchstart', 'touchmove']) padEl?.addEventListener(ev, (e) => e.preventDefault(), { passive: false });
padEl?.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('selectstart', (e) => { if (e.target.closest?.('.pad')) e.preventDefault(); });
// Toque interrumpido por el sistema (selección, llamada, cambio de app): se suelta ese botón.
addEventListener('pointercancel', (e) => { const k = touching.get(e.pointerId); touching.delete(e.pointerId); if (k) release(k); });
addEventListener('pointerup', (e) => { const k = touching.get(e.pointerId); if (k) { touching.delete(e.pointerId); release(k); } });
addEventListener('blur', releaseAll);
document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });
document.getElementById('music').addEventListener('click', (e) => { e.currentTarget.textContent = audio.toggleMusic() ? '♪ ON' : '♪ OFF'; });
cv.addEventListener('pointerdown', () => { startPressed = true; audio.unlock(); });

function pad() {
  const gp = navigator.getGamepads?.()[0];
  if (!gp) return {};
  const ax = gp.axes[0] || 0;
  if (gp.buttons[9]?.pressed || gp.buttons[0]?.pressed) startPressed = startPressed || screen !== 'play';
  return { left: ax < -0.4 || gp.buttons[14]?.pressed, right: ax > 0.4 || gp.buttons[15]?.pressed, jump: gp.buttons[0]?.pressed, mic: gp.buttons[2]?.pressed || gp.buttons[1]?.pressed, special: gp.buttons[3]?.pressed };
}

function finishLevel() {
  const L = WORLD_1[levelIdx];
  const next = WORLD_1[levelIdx + 1];
  const c = { score: game.score, ovacion: game.ovacion, hearts: Math.max(game.hearts, 1), quoteIdx: game.quoteIdx };
  const fact = { kind: 'fact', facts: LEVEL_CARDS_W1[L.id].facts };
  if (next) {
    fact.then = () => startLevel(levelIdx + 1, c);
    showCard({ kind: 'clear', id: L.id, time: game.time, score: game.score, piezas: game.piezas, total: game.pieces.length, next: `${next.id} ${next.name}`, then: () => showCard(fact) });
  } else {
    if (game.score > store.get()) store.set(game.score);
    showCard({ ...fact, then: () => { screen = 'end'; screenT = 0; } });
  }
}

// ── Bucle de paso fijo ─────────────────────────────────
let last = performance.now(), acc = 0;
function frame(now) {
  acc += Math.min(0.1, (now - last) / 1000);
  last = now;
  const gp = pad();
  const btn = { left: held.left || gp.left, right: held.right || gp.right, jump: held.jump || gp.jump, mic: held.mic || gp.mic, special: held.special || gp.special };
  while (acc >= DT) {
    acc -= DT; t += DT; screenT += DT;
    if (screen === 'title' && startPressed) { audio.unlock(); startLevel(0); }
    else if (screen === 'play' && !paused) {
      stepGame(game, btn);
      audio.play(game.events);
      if (game.status === 'won') finishLevel();
      else if (game.status === 'gameover') { screen = 'end'; screenT = 0; }
    } else if (screen === 'card' && startPressed && screenT > 0.6) {
      const then = card.then; card = null; screen = 'play'; then();
    } else if (screen === 'end' && startPressed && screenT > 0.6) {
      // Tras perder, se repite el nivel con lo que tenías al empezarlo; tras ganar, vuelta a la portada.
      if (game.status === 'gameover') { loadLevel(levelIdx, { ...levelStart, hearts: 3 }); screen = 'play'; }
      else screen = 'title';
    }
    startPressed = false;
  }
  const p = game.player;
  // Contra el jefe (y en su cinemática), la cámara encuadra a Pepe y al jefe a la vez.
  const duel = game.boss && game.boss.alive;
  const target = duel ? (p.x + p.w / 2 + game.boss.x + game.boss.w / 2) / 2 + W * 0.08 : p.x + p.w / 2;
  camX = followCamera(camX, target, game.level.w * 16, duel ? 0 : p.facing * 24);
  if (screen === 'title') drawTitle(ctx, t, art);
  else {
    const L = WORLD_1[levelIdx];
    drawWorld(ctx, game, art, camX, t, L.id);
    if (game.intro) drawIntro(ctx, game, camX, t);
    else drawHud(ctx, game, `${L.id} ${L.name}`, t);
    if (screen === 'card') drawCard(ctx, card, art, t);
    if (screen === 'end') drawEnd(ctx, game, store.get(), art, t);
    if (paused) { ctx.fillStyle = 'rgba(27,18,38,0.7)'; ctx.fillRect(0, 0, W, H); }
  }
  requestAnimationFrame(frame);
}
// Acceso para pruebas automáticas (no afecta al juego).
window.__jmv = {
  get held() { return held; },
  get game() { return game; }, get screen() { return screen; }, get level() { return WORLD_1[levelIdx].id; },
  start() { startPressed = true; }, goto(i) { loadLevel(i, carry); screen = 'play'; },
};
art.ready.then(() => requestAnimationFrame(frame));

// Escalado: entero cuando cabe (píxeles nítidos); fraccionario en pantallas pequeñas.
function fit() {
  const controls = matchMedia('(pointer: coarse)').matches ? 170 : 0;
  const s = Math.min(innerWidth / W, (innerHeight - controls - 24) / H);
  const k = s >= 2 ? Math.floor(s) : Math.max(1, s);
  cv.style.width = `${Math.floor(W * k)}px`;
  cv.style.height = `${Math.floor(H * k)}px`;
}
addEventListener('resize', fit);
fit();
