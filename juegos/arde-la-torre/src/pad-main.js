// Página del mando en el móvil (F10, plan §5.3). Ligera: no carga el juego, solo la conexión y la interfaz.
import { Peer } from 'peerjs';
import { createPadClient } from './net/pad.js';
import { peerTransport, loopbackTransport } from './net/transport.js';
import { isCode, normalizeCode } from './net/protocol.js';
import { createStick } from './pad-ui/joystick.js';
import { HEROES, HERO_IDS } from './sim/moves.js';
import { getSprite } from './render/sprites.js';
import { NEUTRAL } from './input/source.js';

const Q = new URLSearchParams(location.search);
const $ = (id) => document.getElementById(id);
const show = (id) => { for (const s of document.querySelectorAll('.screen')) s.classList.toggle('on', s.id === id); document.body.classList.toggle('playing', id === 'pad'); };

function sessionId() {
  if (Q.get('sid')) return Q.get('sid');
  let sid = null;
  try { sid = sessionStorage.getItem('arde-sid'); } catch { /* modo privado */ }
  if (!sid) { sid = `m${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`; try { sessionStorage.setItem('arde-sid', sid); } catch { /* */ } }
  return sid;
}

const transport = Q.get('net') === 'loop' ? loopbackTransport() : peerTransport(Peer, { debug: 0 });
let client = null, wake = null;

// ---- selector de músico ----
const heroBtns = new Map();
for (const id of HERO_IDS) {
  const b = document.createElement('button');
  b.className = 'hero'; b.type = 'button'; b.dataset.hero = id;
  const cv = document.createElement('canvas'); cv.width = 32; cv.height = 32;
  const s = getSprite(id, 0, 'idle', 0, HEROES[id].h, id);
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  c.drawImage(s.canvas, s.ox - 16, s.oy - HEROES[id].h - 8, 32, 32, 0, 0, 32, 32);
  b.append(cv, Object.assign(document.createElement('span'), { textContent: HEROES[id].name }), Object.assign(document.createElement('small'), { textContent: HEROES[id].role }));
  b.addEventListener('click', () => { if (client) client.choose(id); vibrate(10); });
  heroBtns.set(id, b); $('heroes').append(b);
}
$('ready').addEventListener('click', () => { if (!client) return; client.setReady(!client.state.ready); vibrate(20); });

// ---- mando ----
const held = { golpe: false, salto: false, especial: false, pausa: false };
const stick = createStick(60);
const fingers = new Map();      // pointerId → tecla del botón
function push() {
  const v = stick.vector;
  if (client) client.setInput({ ...NEUTRAL, x: v.x, y: v.y, ...held });
}
function setBtn(k, on) {
  if (held[k] === on) return;
  held[k] = on;
  const el = $(`b-${k}`); if (el) el.classList.toggle('down', on);
  if (on) vibrate(8);
  push();
}
function btnAt(x, y) {
  const el = document.elementFromPoint(x, y);
  return el && el.dataset && el.dataset.k ? el.dataset.k : null;
}
function drawStick() {
  const base = $('base'), knob = $('knob');
  if (!stick.active) { base.style.display = knob.style.display = 'none'; return; }
  const c = stick.center;
  base.style.display = knob.style.display = 'block';
  base.style.left = `${c.x}px`; base.style.top = `${c.y}px`;
  const dx = c.px - c.x, dy = c.py - c.y, d = Math.hypot(dx, dy), m = Math.min(1, 60 / (d || 1));
  knob.style.left = `${c.x + dx * m}px`; knob.style.top = `${c.y + dy * m}px`;
}
const pad = $('pad');
pad.addEventListener('pointerdown', (e) => {
  if (e.target.closest('#top')) return;
  e.preventDefault();
  const k = btnAt(e.clientX, e.clientY);
  if (k) { fingers.set(e.pointerId, k); setBtn(k, true); }
  else if (e.clientX < innerWidth * 0.48 && stick.down(e.pointerId, e.clientX, e.clientY)) { drawStick(); push(); }
});
pad.addEventListener('pointermove', (e) => {
  if (stick.move(e.pointerId, e.clientX, e.clientY)) { drawStick(); push(); return; }
  if (fingers.has(e.pointerId)) {    // deslizar el dedo de un botón a otro
    const k = btnAt(e.clientX, e.clientY), was = fingers.get(e.pointerId);
    if (k && k !== was) { setBtn(was, false); fingers.set(e.pointerId, k); setBtn(k, true); }
  }
});
const release = (e) => {
  if (stick.up(e.pointerId)) { drawStick(); push(); }
  const k = fingers.get(e.pointerId);
  if (k) { fingers.delete(e.pointerId); if (![...fingers.values()].includes(k)) setBtn(k, false); }
};
pad.addEventListener('pointerup', release);
pad.addEventListener('pointercancel', release);
$('pause').addEventListener('pointerdown', (e) => { e.preventDefault(); setBtn('pausa', true); setTimeout(() => setBtn('pausa', false), 120); });
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Solo tras el primer toque (Chrome bloquea la vibración antes); iOS no tiene vibración.
function vibrate(ms) {
  try {
    const ua = navigator.userActivation;
    if (navigator.vibrate && (!ua || ua.hasBeenActive)) navigator.vibrate(ms);
  } catch { /* sin vibración */ }
}
async function keepAwake() { try { if (navigator.wakeLock && !wake) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } } catch { /* sin permiso */ } }
document.addEventListener('visibilitychange', () => { if (!document.hidden) keepAwake(); });

// ---- estado → interfaz ----
const STATUS = {
  conectando: ['Conectando…', 'Buscando la sala'],
  reconectando: ['Reconectando…', 'Se cortó la conexión. Volviendo a entrar'],
  llena: ['Sala llena (4/4)', 'Ya hay cuatro jugadores en esta partida'],
  cerrada: ['Sala cerrada', 'No se pudo conectar. Si la pantalla se recargó, vuelve a escanear el QR. Si estás en una wifi de empresa u hotel, prueba con los datos del móvil'],
};
function render(st) {
  document.documentElement.style.setProperty('--c', st.color || '#ff4d4d');
  if (st.status !== 'conectado') {
    const [t, p] = STATUS[st.status] || STATUS.conectando;
    $('st-title').textContent = t; $('st-text').textContent = st.error && st.status === 'cerrada' ? `${p}.` : p;
    $('retry').style.display = st.status === 'cerrada' ? '' : 'none';
    show('s-status');
    return;
  }
  const tag = `J${st.slot + 1}`;
  $('pick-tag').textContent = tag; $('pad-name').textContent = `${tag} · ${HEROES[st.hero] ? HEROES[st.hero].name : ''}`;
  for (const [id, b] of heroBtns) { b.classList.toggle('sel', id === st.hero); b.disabled = st.ready; }
  $('ready').classList.toggle('on', st.ready);
  $('ready').textContent = st.ready ? '✓ Listo (toca para cambiar)' : '¡Listo!';
  const inGame = st.fase === 'juego' && st.maxHp > 0;
  if (inGame || st.fase === 'resultado') {
    show('pad'); keepAwake();
    $('hp').firstElementChild.style.width = `${st.maxHp ? Math.round((100 * st.hp) / st.maxHp) : 0}%`;
    $('lives').textContent = `×${st.lives}`;
    $('msg').textContent = st.fase === 'resultado' ? 'Mira la pantalla · GOLPE para jugar otra vez' : st.hp <= 0 && st.lives <= 0 ? 'GOLPE para continuar' : '';
  } else {
    show('s-pick');
    $('pick-hint').textContent = st.fase === 'juego' ? 'La partida ya empezó: elige y pulsa Listo para entrar' : 'Cuando todos estén listos, empieza en la pantalla';
  }
}

function start(code) {
  if (client) client.stop();
  client = createPadClient({ transport, code, sid: sessionId(), onChange: render, onVibrate: vibrate });
  client.start();
  window.__pad = client;
}
$('retry').addEventListener('click', () => client && client.retryNow());
$('go').addEventListener('click', () => {
  const c = normalizeCode($('code').value);
  if (!isCode(c)) { $('code').style.borderColor = '#ff4d4d'; return; }
  history.replaceState(null, '', `?s=${c}${Q.get('net') === 'loop' ? '&net=loop' : ''}`);
  start(c);
});
$('code').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('go').click(); });

setInterval(() => client && client.tick(), 16);
const code = normalizeCode(Q.get('s'));
if (isCode(code)) start(code); else show('s-code');
