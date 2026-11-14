// v9.7 (spec §3.0f P): escuchar el disco en las plataformas oficiales (sin audio de Madero en el juego).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ESCUCHAR, albumFor } from '../src/data/escuchar.js';
import { WORLDS } from '../src/data/worlds.js';

const HOSTS = { spotify: 'open.spotify.com', apple: 'music.apple.com', youtube: 'music.youtube.com' };

test('cada mundo jugable tiene su disco y 3 enlaces oficiales de búsqueda con artista y disco', () => {
  for (const w of WORLDS.filter((x) => !x.soon)) {
    const a = ESCUCHAR[w.id];
    assert.ok(a, w.id);
    assert.equal(a.year, w.year);
    for (const [k, host] of Object.entries(HOSTS)) {
      const u = new URL(a.links[k]);
      assert.equal(u.protocol, 'https:'); assert.equal(u.host, host, `${w.id}.${k}`);
      const q = decodeURIComponent(u.href).toLowerCase();
      assert.ok(q.includes('josé madero'), `${w.id}.${k}: artista`);
      assert.ok(q.includes(a.album.toLowerCase()), `${w.id}.${k}: disco`);
    }
  }
});

test('albumFor: el disco del mundo en juego o de la puerta abierta del Museo; ninguno en la portada', () => {
  assert.equal(albumFor('play', { world: 'carmesi' }, null).album, 'Carmesí');
  assert.equal(albumFor('card', { world: 'noche' }, null).album, 'Noche');
  assert.equal(albumFor('museum', null, { id: 'noche', open: true }).album, 'Noche');
  assert.equal(albumFor('museum', null, { id: 'alba', open: false }), null);
  assert.equal(albumFor('museum', null, { id: 'galeria', open: true }), null);
  assert.equal(albumFor('museum', null, null), null);
  assert.equal(albumFor('title', null, null), null);
  assert.equal(albumFor('prologue', null, null), null);
});
