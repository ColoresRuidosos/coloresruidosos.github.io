// v8.3 · Salón de fiestas, escenas de cada mundo, portada y festejo (spec §3.0f I; tareas SA1–SA5).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { WORLD_2 } from '../src/data/world2.js';
import { CHAPTERS_W2 } from '../src/data/noche-story.js';
import { PENSAMIENTOS, RECUERDOS } from '../src/data/historia.js';
import { WORLD_SCENES, SCENE_NAMES } from '../src/data/cinematicas.js';
import { GAME_TITLE, VICTORY } from '../src/game/constants.js';
import { canRender } from '../src/render/font.js';

describe('Noche: afuera y dentro del salón de fiestas (SA1)', () => {
  test('2-1 La Entrada (afuera), 2-2 El Salón y 2-3 La Pista', () => {
    assert.deepEqual(WORLD_2.map((l) => l.theme), ['afuera', 'salon', 'pista']);
    assert.deepEqual(WORLD_2.map((l) => l.name), ['LA ENTRADA', 'EL SALÓN', 'LA PISTA']);
  });
  test('ya no se habla de lago, muelle ni casona', () => {
    const all = [...Object.values(CHAPTERS_W2).flatMap((c) => c.lines), ...PENSAMIENTOS.noche, ...RECUERDOS.noche.lines,
      ...WORLD_SCENES.noche.intro.flatMap((p) => p.lines), ...WORLD_SCENES.noche.outro.flatMap((p) => p.lines)].join(' ');
    assert.doesNotMatch(all, /LAGO|MUELLE|CASONA/);
  });
});

describe('escenas de entrada y salida de cada mundo (SA4)', () => {
  for (const w of ['carmesi', 'noche']) {
    test(`${w}: 2 viñetas al entrar y 2 al salir, con escena dibujable, datos con fuente y ficción marcada`, () => {
      for (const part of ['intro', 'outro']) {
        const ps = WORLD_SCENES[w][part];
        assert.equal(ps.length, 2, `${w} ${part}`);
        for (const p of ps) {
          assert.ok(SCENE_NAMES.includes(p.scene), p.scene);
          assert.ok(['dato', 'ficcion'].includes(p.kind));
          if (p.kind === 'dato') assert.ok(p.source?.length > 3);
          for (const l of p.lines) { assert.ok(l.length <= 44, l); for (const ch of l) assert.ok(canRender(ch), `«${ch}» en «${l}»`); }
        }
      }
    });
  }
});

describe('portada y festejo (SA3, SA5)', () => {
  test('el título vive en una sola constante y se puede dibujar', () => {
    assert.ok(Array.isArray(GAME_TITLE) && GAME_TITLE.length >= 1);
    for (const l of GAME_TITLE) for (const ch of l) assert.ok(canRender(ch));
  });
  test('festejo: 3 s, saltable a los 0,5 s', () => {
    assert.equal(VICTORY.time, 3);
    assert.equal(VICTORY.skip, 0.5);
  });
});
