// v5 · Mundo 1 «Carmesí»: niveles 1-1, 1-2, 1-3 y repeticiones con bot (spec §3.0d, C7–C8).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { TILE } from '../src/game/constants.js';
import { createGame, stepGame } from '../src/game/game.js';
import { WORLD_1 } from '../src/data/world1.js';
import { bot, bossBot } from './bot.js';

describe('Mundo 1 · datos', () => {
  test('tres niveles: calle, azoteas y teatro', () => {
    assert.deepEqual(WORLD_1.map((l) => l.id), ['1-1', '1-2', '1-3']);
    assert.deepEqual(WORLD_1.map((l) => l.theme), ['calle', 'azoteas', 'teatro']);
  });

  test('cada nivel tiene a Pepe; 1-1 y 1-2 tienen puerta y 1-3 tiene jefe', () => {
    for (const l of WORLD_1) {
      const g = createGame(l.map);
      assert.ok(g.level.player, l.id);
      if (l.id === '1-3') { assert.ok(g.boss); assert.equal(g.level.goal, null); }
      else assert.ok(g.level.goal, l.id);
    }
  });

  test('el mundo reparte 12–13 piezas del museo y todos los power-ups', () => {
    const gs = WORLD_1.map((l) => createGame(l.map));
    const pieces = gs.reduce((n, g) => n + g.pieces.length, 0);
    assert.ok(pieces >= 12 && pieces <= 13, `piezas=${pieces}`);
    const kinds = new Set(gs.flatMap((g) => g.items.map((i) => i.kind)));
    assert.ok(kinds.has('amp') && kinds.has('carta'));
    const foes = new Set(gs.flatMap((g) => g.enemies.map((e) => e.kind)));
    for (const k of ['titular', 'paparazzi', 'reportero', 'rumor', 'traidor']) assert.ok(foes.has(k), k);
  });

  test('las filas tienen el mismo ancho (mapa rectangular)', () => {
    for (const l of WORLD_1) {
      const rows = l.map.split('\n');
      assert.equal(new Set(rows.map((r) => r.length)).size, 1, l.id);
      assert.equal(rows.length, 14, l.id);
    }
  });
});

describe('Mundo 1 · repeticiones (C8)', () => {
  for (const id of ['1-1', '1-2']) {
    test(`el bot completa el nivel ${id} en menos de 120 s`, () => {
      const g = createGame(WORLD_1.find((l) => l.id === id).map);
      for (let i = 0; i < 60 * 120 && g.status === 'play'; i++) stepGame(g, bot(g));
      assert.equal(g.status, 'won', `${id}: estado ${g.status}, x=${Math.round(g.player.x)} de ${g.level.w * TILE}, corazones ${g.hearts}`);
    });
  }

  test('un bot de jefe vence a la Cámara Flash-Bot y recoge el Disco de Oro', () => {
    const g = createGame(WORLD_1.find((l) => l.id === '1-3').map);
    for (let i = 0; i < 60 * 150 && g.status === 'play'; i++) stepGame(g, bossBot(g));
    assert.equal(g.status, 'won', `estado ${g.status}, vida del jefe ${g.boss.hp}, corazones ${g.hearts}`);
  });
});
