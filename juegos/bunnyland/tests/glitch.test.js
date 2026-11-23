// Fase 3 · El glitch de la Hyperpop: máximo 2 cambios por segundo y apagado con «menos movimiento» (NFR).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { glitchBands, GLITCH_CAMBIO } from '../src/render/glitch.js';

test('cambia como mucho 2 veces por segundo', () => {
  const s = new Set(Array.from({ length: 60 }, (_, i) => JSON.stringify(glitchBands(i, 216))));
  assert.ok(s.size <= 2, `${s.size} cambios en 1 s`);
  assert.ok(GLITCH_CAMBIO >= 30);
});

test('franjas pequeñas (≤ 3 px de corrimiento) y nada con «menos movimiento»', () => {
  for (let i = 0; i < 600; i += 30) for (const b of glitchBands(i, 216)) { assert.ok(Math.abs(b.dx) <= 3 && b.h <= 8); }
  assert.deepEqual(glitchBands(10, 216, true), []);
});
