// v11.2 · El traje de Alba bien acomodado: misma altura que las poses clásicas y la mano de «lanzar» donde nace el cable.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COSTUMES_META } from '../src/data/costumes-atlas.js';
import { PEPE_META } from '../src/data/pepe-atlas.js';
import { MIC } from '../src/game/constants.js';
import { cableStart } from '../src/render/hand.js';

const C = COSTUMES_META.frames, P = PEPE_META.frames;
const CLASSIC = { idle: 'idle0', run: 'run2', jump: 'jump0', throw: 'throw1' };

test('cada pose del traje de Alba mide lo mismo que la clásica (±2 px): Pepe no se encoge al moverse', () => {
  for (const [pose, k] of Object.entries(CLASSIC)) {
    const a = C[`alba_${pose}`].h, b = P[k].h;
    assert.ok(Math.abs(a - b) <= 2, `${pose}: traje ${a} px, clásico ${b} px`);
  }
});

test('al lanzar, la mano del traje de Alba está donde nace el cable del micrófono (±3 px)', () => {
  const hand = C.alba_throw.hand;
  assert.ok(hand, 'el recorte guarda dónde está la mano');
  assert.ok(Math.abs(hand.y - -MIC.handY) <= 3, `mano a ${hand.y} px de los pies; el cable nace a ${-MIC.handY}`);
  // (en x, desde v11.3 el cable nace en la mano del traje: ver la prueba de todos los trajes)
});

test('v11.3 · en TODOS los trajes el cable sale de la mano: el recorte deja la mano entera y el cable nace ahí', () => {
  const ids = [...new Set(Object.keys(C).map((k) => k.split('_')[0]))];
  assert.ok(ids.length >= 8);
  for (const id of ids) {
    const f = C[`${id}_throw`], hand = f.hand;
    assert.ok(hand, `${id}: guarda la mano`);
    assert.ok(hand.x > 21, `${id}: el puño entero (${hand.x} px), no cortado a 20 px como antes`);
    assert.ok(hand.y < -15 && hand.y > -40 && hand.x > 10, `${id}: mano a la altura del brazo (${hand.x}, ${hand.y})`);
    // El cable nace en la mano del traje (mirando a la derecha y a la izquierda).
    assert.deepEqual(cableStart({ x: 100, y: 200 }, 1, id), { x: 100 + hand.x, y: 200 + hand.y });
    assert.deepEqual(cableStart({ x: 100, y: 200 }, -1, id), { x: 100 - hand.x, y: 200 + hand.y });
  }
  assert.equal(cableStart({ x: 100, y: 200 }, 1, 'clasico'), null, 'el clásico usa la mano de siempre');
});
