// Fase 3 · Sprites: todos existen, miden 16×16 (o 8×8 los «mini») y usan solo la paleta (spec K17, §5).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPRITES, BONUS_POR_ESCENARIO } from '../src/data/sprites.js';
import { PALETTE } from '../src/data/palette.js';

const NECESARIOS = [
  ...['frente', 'lado', 'espalda'].flatMap((v) => [0, 1].map((f) => `bunny.${v}.${f}`)), 'bunny.cuclillas',
  ...['coronado', 'osito', 'estrellita', 'gotita'].flatMap((t) => [`${t}.0`, `${t}.1`, `${t}.triste.0`, `${t}.triste.1`]),
  'nube.0', 'item.hyper', 'item.besito', 'item.desaparezco', 'mini.vida', ...BONUS_POR_ESCENARIO,
];

test('están todos los sprites que usa el juego', () => {
  for (const n of NECESARIOS) assert.ok(SPRITES[n], n);
  assert.equal(BONUS_POR_ESCENARIO.length, 5);
});

test('miden 16×16 (mini: 8×8) y solo usan colores de la paleta', () => {
  for (const [n, rows] of Object.entries(SPRITES)) {
    const s = n.startsWith('mini.') ? 8 : 16;
    assert.equal(rows.length, s, `${n}: filas`);
    rows.forEach((r, i) => {
      assert.equal(r.length, s, `${n}: fila ${i} mide ${r.length}`);
      for (const ch of r) assert.ok(ch === '.' || PALETTE[ch], `${n}: color «${ch}» fuera de la paleta`);
    });
  }
});

test('el estado triste no deja rojos, amarillos ni rosas', () => {
  for (const t of ['coronado', 'osito', 'estrellita', 'gotita']) assert.ok(!/[RrYyPpd]/.test(SPRITES[`${t}.triste.0`].join('')), t);
});
