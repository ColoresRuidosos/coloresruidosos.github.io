// T5.1: el atlas de los sprites finales tiene todas las poses que usa el juego, con tamaños y anclas coherentes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { FRAMES, PNG } from '../src/data/atlas-antonio.js';
import { PNG as RETRATO } from '../src/data/retrato-antonio.js';

const NEEDED = ['idle0', 'idle1', 'walk0', 'walk1', 'walk2', 'walk3', 'run0', 'run1', 'run2', 'run3', 'jump0', 'jump1',
  'punch1a', 'punch1b', 'punch2a', 'punch2b', 'guit0', 'guit1', 'guit2', 'air', 'grab', 'knee', 'throw0', 'throw1',
  'fall0', 'fall1', 'fall2', 'down', 'rise0', 'rise1', 'sp0', 'sp1', 'sp2', 'sp3', 'lash0', 'lash1', 'lash2',
  'hymn0', 'hymn1', 'hymn2', 'hymn3', 'win0', 'win1', 'portrait'];

test('T5.1 atlas de Antonio: todas las poses, de pie a ~66 px, anclas dentro del fotograma', () => {
  assert.ok(PNG.startsWith('data:image/png;base64,'));
  assert.ok(RETRATO.startsWith('data:image/png;base64,'));
  for (const n of NEEDED) assert.ok(FRAMES[n], `falta ${n}`);
  for (const [n, [x, y, w, h, ox, oy]] of Object.entries(FRAMES)) {
    assert.ok(w > 10 && h > 10 && w < 160 && h < 124, `${n}: ${w}×${h}`);
    assert.ok(ox >= 0 && ox < w && oy === h - 1, `${n}: ancla (${ox}, ${oy})`);
    assert.ok(x >= 0 && y >= 0);
  }
  for (const n of ['idle0', 'idle1', 'walk0', 'punch1a', 'hymn1']) {
    const h = FRAMES[n][3];
    assert.ok(h >= 64 && h <= 84, `${n} de pie mide ${h} px`);   // ~74 px desde el 15 nov (SIZE_MUL 1,12)
  }
  assert.ok(FRAMES.down[2] > FRAMES.down[3] * 2, 'tumbado es más ancho que alto');
  assert.deepEqual(FRAMES.portrait.slice(2, 4), [58, 58]);
});

import * as PEPE from '../src/data/atlas-pepe.js';
import { PNG as RETRATO_PEPE } from '../src/data/retrato-pepe.js';

test('T5.1 atlas de Pepe: poses del juego (con equivalentes), tamaños coherentes y retrato', () => {
  const F = PEPE.FRAMES;
  for (const n of ['idle0', 'idle1', 'walk0', 'walk3', 'run0', 'run3', 'jump0', 'jump1', 'punch1a', 'punch1b', 'punch2a', 'punch2b',
    'guit0', 'guit1', 'guit2', 'air', 'grab', 'knee', 'throw0', 'throw1', 'hurt', 'fall0', 'fall1', 'down', 'rise0', 'rise1',
    'sp0', 'sp1', 'sp2', 'sp3', 'win0', 'win1', 'portrait']) assert.ok(F[n], `falta ${n}`);
  assert.ok(!F.blur, 'la pose borrosa de Gemini se descarta');
  for (const n of ['idle0', 'walk0', 'punch1b']) assert.ok(F[n][3] >= 62 && F[n][3] <= 84, `${n} mide ${F[n][3]} px`);
  assert.ok(RETRATO_PEPE.startsWith('data:image/png;base64,'));
});

import * as DANI from '../src/data/atlas-dani.js';
import * as JOTA from '../src/data/atlas-jota.js';

test('T5.1 atlas de Dani y Jota: poses del juego, tamaños coherentes y retrato', () => {
  for (const [nombre, F] of [['dani', DANI.FRAMES], ['jota', JOTA.FRAMES]]) {
    for (const n of ['idle0', 'idle1', 'walk0', 'walk3', 'run0', 'run3', 'jump0', 'jump1', 'punch1a', 'punch1b', 'punch2a', 'punch2b',
      'guit0', 'guit1', 'guit2', 'air', 'grab', 'knee', 'throw0', 'throw1', 'hurt', 'fall0', 'down', 'rise0', 'rise1',
      'sp0', 'sp1', 'sp2', 'sp3', 'win0', 'win1', 'portrait']) assert.ok(F[n], `${nombre}: falta ${n}`);
    for (const n of ['idle0', 'walk0']) assert.ok(F[n][3] >= 64 && F[n][3] <= 84, `${nombre} ${n} mide ${F[n][3]} px`);
  }
  assert.ok(DANI.FRAMES.kick0 && DANI.FRAMES.kick1, 'Dani tiene la patada de su combo de 4');
});

test('fondos finales: un JPG por nivel con su ancho y el centro del escenario', async () => {
  for (const id of ['parking', 'vestibulo', 'oficinas', 'azotea']) {
    const m = await import(`../src/data/fondo-${id}.js`);
    assert.ok(m.JPG.startsWith('data:image/jpeg;base64,'), id);
    assert.ok(m.WIDTH > 384 && m.CENTER > 0 && m.CENTER < m.WIDTH, id);
  }
});
