// v9 · Ilustraciones de las escenas (ChatGPT) recortadas a la viñeta (spec §3.0f K; tarea IL2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SCENE_ART } from '../src/data/scenes-art.js';
import { PROLOGO } from '../src/data/historia.js';

const size = (uri) => {
  const b = Buffer.from(uri.split(',')[1], 'base64'); // cabecera PNG: ancho y alto en los bytes 16–23
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
};

test('cada ilustración es de una viñeta que existe y mide 320×150 (la franja de la escena)', () => {
  const ids = new Set(PROLOGO.map((p) => p.id));
  assert.ok(Object.keys(SCENE_ART).length >= 3);
  for (const [id, a] of Object.entries(SCENE_ART)) {
    assert.ok(ids.has(id), id);
    assert.match(a.png, /^data:image\/png;base64,/);
    assert.deepEqual(size(a.png), [320, 150], id);
  }
});

test('la Arena: el cartel con la cara, el nombre y el logotipo va tapado por una pantalla propia con el sello JMV', () => {
  assert.ok(SCENE_ART.p2.badge, 'el sello va encima de la pantalla tapada');
});
