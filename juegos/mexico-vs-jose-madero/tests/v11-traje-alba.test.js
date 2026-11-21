// v11.2 · El traje de Alba bien acomodado: misma altura que las poses clásicas y la mano de «lanzar» donde nace el cable.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COSTUMES_META } from '../src/data/costumes-atlas.js';
import { PEPE_META } from '../src/data/pepe-atlas.js';
import { MIC } from '../src/game/constants.js';

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
  assert.ok(hand.x >= MIC.handX - 3 && hand.x <= MIC.handX + 7, `mano a ${hand.x} px del centro; el cable nace a ${MIC.handX}`);
});
