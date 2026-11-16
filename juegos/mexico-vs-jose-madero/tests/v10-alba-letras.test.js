// v10.1 · AL6b: fragmentos de letra de los atriles (los aporta el equipo de CR, con permiso; se copian tal cual).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LETRAS, letraDe } from '../src/data/alba-letras.js';
import { ALBA_SONGS } from '../src/data/alba-story.js';

test('cada fragmento: canción del disco, una sola vez, hasta 4 líneas de 30 caracteres y crédito', () => {
  assert.ok(LETRAS.length > 0);
  const vistas = new Set();
  for (const l of LETRAS) {
    assert.ok(ALBA_SONGS.includes(l.cancion), l.cancion);
    assert.ok(!vistas.has(l.cancion), `${l.cancion} repetida`); vistas.add(l.cancion);
    assert.ok(l.fragmento.length >= 1 && l.fragmento.length <= 4, l.cancion);
    for (const linea of l.fragmento) assert.ok(linea.length <= 30, `${l.cancion}: «${linea}» (${linea.length})`);
    assert.ok(l.credito.includes(`«${l.cancion}»`) && l.credito.includes('JOSÉ MADERO') && l.credito.includes('AUTORIZACIÓN'), l.credito);
  }
});

test('letraDe: devuelve el fragmento de la canción; sin fragmento, null (el atril muestra solo la reflexión)', () => {
  assert.equal(letraDe('MALDITA RUEDA').cancion, 'MALDITA RUEDA');
  assert.equal(letraDe('ETRUSCO ÚNICO'), null);
});
