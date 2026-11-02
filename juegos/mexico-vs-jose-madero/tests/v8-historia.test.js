// v8 · La historia contada dentro del juego (spec §1.1b; tareas S1–S3).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { PROLOGO, RECUERDOS, PENSAMIENTOS, VUELTA_AL_MUSEO } from '../src/data/historia.js';
import { canRender } from '../src/render/font.js';
import { createSave } from '../src/engine/save.js';
import { identity } from '../src/game/progress.js';
import { createGame, stepGame } from '../src/game/game.js';
import { WORLD_1 } from '../src/data/world1.js';
import { WORLD_2 } from '../src/data/world2.js';
import { TILE } from '../src/game/constants.js';

const mem = () => { const m = {}; return { getItem: (k) => m[k] ?? null, setItem: (k, v) => { m[k] = v; } }; };
const texts = () => [
  ...PROLOGO.flatMap((p) => [...p.lines, p.source ?? '']),
  ...Object.values(RECUERDOS).flatMap((r) => [r.title, ...r.lines]),
  ...Object.values(PENSAMIENTOS).flat(), VUELTA_AL_MUSEO,
];

describe('prólogo (S1)', () => {
  test('5 viñetas: estadio → Arena → algo se pierde → despierta en el museo → cada disco guarda una parte', () => {
    assert.equal(PROLOGO.length, 5);
    assert.match(PROLOGO[0].lines.join(' '), /24 DE ENERO DE 2026/);
    assert.match(PROLOGO[0].lines.join(' '), /ESTADIO GNP SEGUROS/);
    assert.match(PROLOGO[1].lines.join(' '), /ARENA CIUDAD DE MÉXICO/);
    assert.match(PROLOGO[3].lines.join(' '), /NO RECUERDA/);
  });

  test('los datos llevan fuente y la ficción va marcada; sin «el más grande de México» ni fecha de la Arena', () => {
    for (const p of PROLOGO) {
      assert.ok(['dato', 'ficcion'].includes(p.kind));
      if (p.kind === 'dato') assert.ok(p.source?.length > 3, p.lines[0]);
    }
    const all = PROLOGO.flatMap((p) => p.lines).join(' ');
    assert.doesNotMatch(all, /MÁS GRANDE|FORO GNP|MAYO DE 2027/);
  });

  test('se ve solo la primera vez (queda guardado)', () => {
    const st = mem();
    const s = createSave(st);
    assert.equal(s.data.seenPrologue, false);
    s.data.seenPrologue = true; s.commit();
    assert.equal(createSave(st).data.seenPrologue, true);
  });
});

test('esa noche en el Estadio GNP Pepe lleva el traje negro con lentes oscuros (decisión del usuario)', () => {
  for (const scene of ['titulares', 'museo']) assert.equal(PROLOGO.find((p) => p.scene === scene).costume, 'lentes', scene);
  assert.equal(PROLOGO.find((p) => p.scene === 'puertas').costume, undefined);
});

describe('identidad (S2)', () => {
  test('IDENTIDAD n/8: cuenta los mundos terminados', () => {
    const s = createSave(mem());
    assert.equal(identity(s), 0);
    s.data.worlds.carmesi = { cleared: ['1-1', '1-2', '1-3'], best: {} };
    assert.equal(identity(s), 1);
    s.data.worlds.noche = { cleared: ['2-1'], best: {} };
    assert.equal(identity(s), 1, 'un mundo a medias no cuenta');
  });
});

describe('recuerdos y pensamientos (S3)', () => {
  test('cada mundo jugable tiene su «RECUERDO RECUPERADO», marcado como ficción y con su año', () => {
    for (const [id, year] of [['carmesi', 2016], ['noche', 2017]]) {
      const r = RECUERDOS[id];
      assert.ok(r && r.kind === 'ficcion', id);
      assert.equal(r.year, year);
    }
  });

  test('hay un pensamiento por checkpoint de cada mundo', () => {
    for (const [id, levels] of [['carmesi', WORLD_1], ['noche', WORLD_2]]) {
      const n = levels.reduce((k, l) => k + createGame(l.map).level.checkpoints.length, 0);
      assert.ok(PENSAMIENTOS[id].length >= n, `${id}: ${PENSAMIENTOS[id].length} para ${n} checkpoints`);
    }
  });

  test('al tocar un checkpoint nuevo, Pepe piensa en voz alta (en orden, y el orden sigue entre niveles)', () => {
    const g = createGame('.P..C...C...\n############', { thoughtIdx: 1 }, { thoughts: ['A', 'B', 'C'] });
    for (let i = 0; i < 60 * 3; i++) stepGame(g, { right: true });
    assert.deepEqual(g.thoughtsShown, ['B', 'C']);
    assert.equal(g.thoughtIdx, 3);
    void TILE;
  });

  test('todo cabe (≤ 44 caracteres por línea) y se puede dibujar', () => {
    for (const s of texts()) {
      assert.ok(s.length <= 44, s);
      for (const ch of s) assert.ok(canRender(ch), `«${ch}» en «${s}»`);
    }
  });
});
