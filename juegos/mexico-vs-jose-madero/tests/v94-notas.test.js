// v9.4 (spec §3.0f N): opción para quitar las notas de la pantalla durante el juego.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSave, defaults, SAVE_KEY } from '../src/engine/save.js';
import { OPTION_ITEMS } from '../src/render/draw-menus.js';
import { hudNotes } from '../src/render/draw.js';

const memory = (init = {}) => { const m = { ...init }; return { getItem: (k) => m[k] ?? null, setItem: (k, v) => { m[k] = v; } }; };

test('las notas salen por defecto y en las partidas guardadas antes de v9.4', () => {
  assert.equal(defaults().options.notas, true);
  const s = createSave(memory({ [SAVE_KEY]: JSON.stringify({ v: 1, options: { flashes: false } }) }));
  assert.equal(s.data.options.notas, true);
});

test('«NOTAS EN PANTALLA» está en Opciones, antes de la guía, con su explicación', () => {
  const i = OPTION_ITEMS.findIndex((x) => x.key === 'notas');
  assert.ok(i >= 0);
  assert.ok(i < OPTION_ITEMS.findIndex((x) => x.key === 'guia'));
  assert.match(OPTION_ITEMS[i].name, /NOTAS/);
  assert.match(OPTION_ITEMS[i].help, /SABÍAS QUE/);
  assert.match(OPTION_ITEMS[i].help, /N/);
});

test('hudNotes: con notas, todo; sin notas, ni dato, ni pensamiento, ni aviso', () => {
  const g = { popups: [{ text: 'DATO', source: 'FUENTE', t: 2 }], thought: { text: 'PENSAMIENTO', t: 2 }, hint: { text: 'AVISO', t: 2 } };
  assert.deepEqual(hudNotes(g, { notas: true }), { pop: g.popups[0], thought: g.thought, hint: g.hint });
  assert.deepEqual(hudNotes(g, { notas: false }), { pop: null, thought: null, hint: null });
  assert.deepEqual(hudNotes({ popups: [] }, {}), { pop: null, thought: null, hint: null });
});
