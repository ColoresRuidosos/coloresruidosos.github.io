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
    assert.ok(w > 10 && h > 10 && w < 140 && h < 110, `${n}: ${w}×${h}`);
    assert.ok(ox >= 0 && ox < w && oy === h - 1, `${n}: ancla (${ox}, ${oy})`);
    assert.ok(x >= 0 && y >= 0);
  }
  for (const n of ['idle0', 'idle1', 'walk0', 'punch1a', 'hymn1']) {
    const h = FRAMES[n][3];
    assert.ok(h >= 60 && h <= 72, `${n} de pie mide ${h} px`);
  }
  assert.ok(FRAMES.down[2] > FRAMES.down[3] * 2, 'tumbado es más ancho que alto');
  assert.deepEqual(FRAMES.portrait.slice(2, 4), [46, 46]);
});
