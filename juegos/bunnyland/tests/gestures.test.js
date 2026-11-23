// Entrada: deslizar y teclado → dirección (spec F1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirFromDelta, dirFromKey, createSwipe } from '../src/input/gestures.js';

test('deslizar ≥ 20 px da la dirección dominante; menos, nada', () => {
  assert.equal(dirFromDelta(30, 5), 'right');
  assert.equal(dirFromDelta(-30, 25), 'left');
  assert.equal(dirFromDelta(4, -40), 'up');
  assert.equal(dirFromDelta(0, 21), 'down');
  assert.equal(dirFromDelta(10, 12), null);
});

test('el gesto dispara sin soltar el dedo y permite encadenar giros', () => {
  const got = []; const s = createSwipe((d) => got.push(d));
  s.down(100, 100); s.move(110, 100); s.move(125, 102); s.move(126, 140); s.up();
  assert.deepEqual(got, ['right', 'down']);
});

test('teclado: flechas y WASD', () => {
  assert.equal(dirFromKey('ArrowUp'), 'up'); assert.equal(dirFromKey('a'), 'left');
  assert.equal(dirFromKey('S'), 'down'); assert.equal(dirFromKey('d'), 'right'); assert.equal(dirFromKey('x'), null);
});
