// T3.1–T3.4 y T4.6: entradas locales, huecos y joystick.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readKeys, KEYMAPS } from '../src/input/keyboard.js';
import { readGamepad } from '../src/input/gamepad.js';
import { createSlots } from '../src/input/slots.js';
import { createEdges, normalize, NEUTRAL } from '../src/input/source.js';
import { stickVector, createStick } from '../src/pad-ui/joystick.js';

test('T3.1 flancos: «pulsado ahora» solo el primer tick; normalize limita los ejes', () => {
  const e = createEdges();
  assert.equal(e({ ...NEUTRAL, golpe: true }).golpe, true);
  assert.equal(e({ ...NEUTRAL, golpe: true }).golpe, false);
  assert.equal(e(NEUTRAL).golpe, false);
  assert.equal(e({ ...NEUTRAL, x: 1 }).right, true);
  assert.deepEqual(normalize({ x: 5, y: -9, golpe: 1 }), { x: 1, y: -1, golpe: true, salto: false, especial: false, pausa: false });
});

test('T3.2 dos jugadores en el mismo teclado no se pisan', () => {
  const down = new Set(['KeyD', 'KeyF', 'ArrowLeft', 'KeyL']);
  const a = readKeys(down, KEYMAPS[0]), b = readKeys(down, KEYMAPS[1]);
  assert.deepEqual([a.x, a.golpe, a.salto], [1, true, false]);
  assert.deepEqual([b.x, b.golpe, b.salto], [-1, false, true]);
  assert.equal(readKeys(new Set(['KeyA', 'KeyD']), KEYMAPS[0]).x, 0, 'izquierda + derecha se anulan');
  assert.equal(readKeys(new Set(), KEYMAPS[0]), NEUTRAL);
});

test('T3.3 mando físico: zona muerta, cruceta y botones estándar', () => {
  const pad = (axes, pressed = []) => ({ connected: true, axes, buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: pressed.includes(i), value: pressed.includes(i) ? 1 : 0 })) });
  assert.equal(readGamepad(pad([0.2, 0])).x, 0, 'dentro de la zona muerta');
  assert.equal(readGamepad(pad([0.8, -0.9])).x, 1);
  assert.equal(readGamepad(pad([0.8, -0.9])).y, -1);
  const b = readGamepad(pad([0, 0], [0, 2, 9, 14]));
  assert.deepEqual([b.salto, b.golpe, b.pausa, b.x], [true, true, true, -1]);
  assert.equal(readGamepad(pad([0, 0], [3])).especial, true);
  assert.equal(readGamepad(null), NEUTRAL);
});

test('T3.4 huecos J1–J4 por orden de llegada; el 5.º se rechaza; mismo músico → otra paleta', () => {
  const s = createSlots();
  assert.equal(s.join('kb1', 'teclado'), 0);
  assert.equal(s.join('tel:a', 'movil'), 1);
  assert.equal(s.join('kb1', 'teclado'), 0, 'repetir no duplica');
  assert.equal(s.join('mando0', 'mando'), 2);
  assert.equal(s.join('tel:b', 'movil'), 3);
  assert.equal(s.join('tel:c', 'movil'), null);
  assert.ok(s.full);
  s.setHero(0, 'pepe'); s.setHero(1, 'pepe'); s.setHero(2, 'pepe');
  assert.equal(new Set([0, 1, 2].map((i) => s.get(i).palette)).size, 3, 'tres Pepes, tres paletas distintas');
  s.leave('tel:a');
  assert.equal(s.get(1), null);
  assert.equal(s.join('tel:d', 'movil'), 1, 'el hueco libre se reutiliza');
  assert.equal(s.setHero(0, 'nadie'), false);
});

test('T4.6 joystick: zona muerta del 20 % y 8 direcciones', () => {
  assert.deepEqual(stickVector(5, 0, 40), { x: 0, y: 0 });
  assert.deepEqual(stickVector(30, 0, 40), { x: 1, y: 0 });
  assert.deepEqual(stickVector(-30, -2, 40), { x: -1, y: 0 });
  assert.deepEqual(stickVector(20, 22, 40), { x: 1, y: 1 });
  assert.deepEqual(stickVector(0, -30, 40), { x: 0, y: -1 });
  const st = createStick(40);
  assert.ok(st.down(1, 100, 100));
  assert.ok(!st.down(2, 10, 10), 'un solo dedo controla el joystick');
  st.move(1, 140, 100);
  assert.deepEqual(st.vector, { x: 1, y: 0 });
  st.move(2, 0, 0);                        // otro dedo (un botón) no lo mueve
  assert.deepEqual(st.vector, { x: 1, y: 0 });
  st.up(1);
  assert.deepEqual(st.vector, { x: 0, y: 0 });
});
