// v9.6 (spec §3.0f O): saltar la nota que está en pantalla.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { skipNotes, hasNotes } from '../src/game/game.js';
import { drawHud } from '../src/render/draw.js';
import { canRender } from '../src/render/font.js';

const game = () => ({
  popups: [{ text: 'DATO UNO', source: 'F1', t: 5 }, { text: 'DATO DOS', source: 'F2', t: 5 }],
  thought: { text: 'PENSAMIENTO', t: 5 }, hint: { text: 'AVISO', t: 5 },
});

test('skipNotes cierra lo que está en pantalla; el siguiente dato de la cola queda listo', () => {
  const g = game();
  assert.equal(hasNotes(g), true);
  skipNotes(g);
  assert.equal(g.thought, null); assert.equal(g.hint, null);
  assert.deepEqual(g.popups.map((p) => p.text), ['DATO DOS']);
  skipNotes(g);
  assert.equal(g.popups.length, 0);
  assert.equal(hasNotes(g), false);
  assert.doesNotThrow(() => skipNotes(g));
});

test('hasNotes respeta el interruptor de notas', () => {
  assert.equal(hasNotes(game(), { notas: false }), false);
});

// Contexto falso de canvas: solo registra que se dibuja.
const fake = () => new Proxy({ globalAlpha: 1, measureText: () => ({ width: 6 }) }, { get: (o, k) => (k in o ? o[k] : () => {}), set: (o, k, v) => ((o[k] = v), true) });
const hud = { hearts: 3, score: 0, piezas: 0, pieces: [], time: 0, ovacion: 0, combo: 0, comboT: 0, star: 0, pua: 0, amp: 0, assist: false, boss: null };

test('drawHud devuelve dónde dibujó cada nota, dentro de la pantalla', () => {
  const zones = drawHud(fake(), { ...hud, ...game() }, '1-1', 0, null, { notas: true });
  for (const k of ['pop', 'thought', 'hint']) {
    const z = zones[k];
    assert.ok(z, k);
    assert.ok(z.x >= 0 && z.y >= 0 && z.x + z.w <= 320 && z.y + z.h <= 224 && z.w > 20 && z.h > 8, `${k}: ${JSON.stringify(z)}`);
  }
  assert.deepEqual(drawHud(fake(), { ...hud, ...game() }, '1-1', 0, null, { notas: false }), {});
});

test('la ✕ de las notas existe en la fuente del juego', () => { assert.equal(canRender('✕'), true); });
