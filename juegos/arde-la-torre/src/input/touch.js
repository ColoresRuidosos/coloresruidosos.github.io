// Táctil en la propia pantalla (F9, antes P1; adelantado el 11 nov 2026 porque el usuario prueba el enlace en su móvil).
// Joystick flotante en la mitad izquierda y botones GOLPE / SALTO / ESPECIAL a la derecha, encima del juego.
// Se comporta como una fuente más (igual que el teclado): GOLPE para unirse, ◀ ▶ para elegir músico, GOLPE para listo.
import { NEUTRAL } from './source.js';
import { createStick } from '../pad-ui/joystick.js';

const CSS = `
#tactil { position: fixed; inset: 0; pointer-events: none; z-index: 3; display: none; touch-action: none; -webkit-user-select: none; user-select: none; }
#tactil.on { display: block; }
#tactil .zona { position: absolute; left: 0; top: 18%; bottom: 0; width: 48%; pointer-events: auto; touch-action: none; }
#tactil .b { position: absolute; border-radius: 50%; display: flex; align-items: center; justify-content: center; pointer-events: auto; touch-action: none;
  font: 900 12px/1 system-ui, sans-serif; color: rgba(0,0,0,.85); text-transform: uppercase; opacity: .62; box-shadow: inset 0 -5px 0 rgba(0,0,0,.25); }
#tactil .b.down { opacity: .95; transform: scale(.92); }
#tactil .golpe { width: 84px; height: 84px; right: 18px; bottom: 18px; background: #ff4d4d; }
#tactil .salto { width: 66px; height: 66px; right: 112px; bottom: 12px; background: #3fa9ff; }
#tactil .especial { width: 62px; height: 62px; right: 46px; bottom: 112px; background: #ffd23f; font-size: 10px; }
#tactil .pausa { width: 44px; height: 44px; right: 10px; top: 10px; background: #cfc9e0; font-size: 14px; }
#tactil .base, #tactil .pomo { position: absolute; border-radius: 50%; transform: translate(-50%, -50%); display: none; pointer-events: none; }
#tactil .base { width: 120px; height: 120px; border: 3px solid rgba(255,255,255,.3); background: rgba(255,255,255,.06); }
#tactil .pomo { width: 54px; height: 54px; background: rgba(255,255,255,.55); }
#tactil .pista { position: absolute; left: 24%; top: 60%; width: 110px; height: 110px; transform: translate(-50%, -50%); border-radius: 50%; border: 3px dashed rgba(255,255,255,.18); pointer-events: none; }
#girar { position: fixed; inset: 0; z-index: 4; display: none; align-items: center; justify-content: center; flex-direction: column; gap: 8px;
  background: #0e0b1a; color: #ffd23f; font: 800 20px/1.3 system-ui, sans-serif; text-align: center; padding: 24px; }
#girar small { color: #8a8698; font-size: 14px; font-weight: 600; }
@media (orientation: portrait) { body.tactil #girar { display: flex; } }
`;

export function createTouch(doc = globalThis.document) {
  const held = { golpe: false, salto: false, especial: false, pausa: false };
  const stick = createStick(48);
  const fingers = new Map();
  let active = false;

  const style = doc.createElement('style'); style.textContent = CSS; doc.head.append(style);
  const root = doc.createElement('div'); root.id = 'tactil';
  root.innerHTML = '<div class="zona"></div><div class="pista"></div><div class="base"></div><div class="pomo"></div>' +
    '<div class="b especial" data-k="especial">Especial</div><div class="b salto" data-k="salto">Salto</div><div class="b golpe" data-k="golpe">Golpe</div><div class="b pausa" data-k="pausa">❚❚</div>';
  const girar = doc.createElement('div'); girar.id = 'girar';
  girar.innerHTML = 'Gira el móvil<small>Se juega en horizontal</small>';
  doc.body.append(root, girar);
  const base = root.querySelector('.base'), pomo = root.querySelector('.pomo'), zona = root.querySelector('.zona');

  function turnOn() {
    if (active) return;
    active = true; root.classList.add('on'); doc.body.classList.add('tactil');
  }
  const btnAt = (x, y) => { const el = doc.elementFromPoint(x, y); return el && el.dataset && el.dataset.k ? el.dataset.k : null; };
  function setBtn(k, on) {
    held[k] = on;
    const el = root.querySelector(`.${k}`); if (el) el.classList.toggle('down', on);
    if (on && navigator.vibrate) { try { navigator.vibrate(8); } catch { /* */ } }
  }
  function drawStick() {
    if (!stick.active) { base.style.display = pomo.style.display = 'none'; return; }
    const c = stick.center; base.style.display = pomo.style.display = 'block';
    base.style.left = `${c.x}px`; base.style.top = `${c.y}px`;
    const dx = c.px - c.x, dy = c.py - c.y, d = Math.hypot(dx, dy), m = Math.min(1, 48 / (d || 1));
    pomo.style.left = `${c.x + dx * m}px`; pomo.style.top = `${c.y + dy * m}px`;
  }

  root.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const k = btnAt(e.clientX, e.clientY);
    if (k) { fingers.set(e.pointerId, k); setBtn(k, true); }
    else if (e.target === zona && stick.down(e.pointerId, e.clientX, e.clientY)) drawStick();
  });
  root.addEventListener('pointermove', (e) => {
    if (stick.move(e.pointerId, e.clientX, e.clientY)) { drawStick(); return; }
    if (fingers.has(e.pointerId)) {
      const k = btnAt(e.clientX, e.clientY), was = fingers.get(e.pointerId);
      if (k && k !== was && k !== 'pausa') { setBtn(was, false); fingers.set(e.pointerId, k); setBtn(k, true); }
    }
  });
  const up = (e) => {
    if (stick.up(e.pointerId)) drawStick();
    const k = fingers.get(e.pointerId);
    if (k) { fingers.delete(e.pointerId); if (![...fingers.values()].includes(k)) setBtn(k, false); }
  };
  root.addEventListener('pointerup', up);
  root.addEventListener('pointercancel', up);

  // Se enciende con el primer toque de un dedo (o de entrada si la pantalla es táctil).
  const g = doc.defaultView || globalThis;
  g.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') turnOn(); }, { capture: true });
  if (g.matchMedia && g.matchMedia('(pointer: coarse)').matches) turnOn();

  return {
    source: {
      key: 'tactil', kind: 'tactil', label: 'PANTALLA TÁCTIL',
      read: () => (active ? { ...NEUTRAL, ...stick.vector, ...held } : NEUTRAL),
    },
    get active() { return active; },
    turnOn,
  };
}
