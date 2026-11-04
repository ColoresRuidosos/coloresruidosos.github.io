// v9 · El Museo con su exposición, que se llena al terminar cada mundo (spec §3.0f J; tarea MU1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSave } from '../src/engine/save.js';
import { museumExhibits } from '../src/game/progress.js';

const mem = () => { const m = {}; return { getItem: (k) => m[k] ?? null, setItem: (k, v) => { m[k] = v; } }; };
const shown = (s) => museumExhibits(s).filter((e) => e.unlocked).map((e) => e.kind);

test('al empezar solo está la partitura (pieza real del museo); el resto, vacío', () => {
  const s = createSave(mem());
  const ex = museumExhibits(s);
  assert.equal(ex.filter((e) => e.slot.startsWith('cuadro')).length, 3);
  assert.equal(ex.filter((e) => e.slot.startsWith('vitrina')).length, 3);
  assert.deepEqual(shown(s), ['partitura']);
});

test('al terminar Carmesí: su cuadro (la rosa) y el Disco de Oro; al terminar Noche: el antifaz y la Máscara de fiesta', () => {
  const s = createSave(mem());
  s.data.worlds.carmesi = { cleared: ['1-1', '1-2', '1-3'], best: {} };
  assert.deepEqual(shown(s).sort(), ['disco', 'partitura', 'rosa']);
  s.data.worlds.noche = { cleared: ['2-1', '2-2', '2-3'], best: {} };
  assert.deepEqual(shown(s).sort(), ['antifaz', 'disco', 'mascara', 'partitura', 'rosa']);
});
