// v10 · Niveles 3-1, 3-2 y 3-3 de Alba: un bot los termina (spec §3.0f Q; tarea AL8).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, stepGame } from '../src/game/game.js';
import { WORLD_3 } from '../src/data/world3.js';
import { PASAJES_POR_NIVEL } from '../src/data/alba-story.js';
import { albaBot } from './bot.js';

const PASAJES = { '3-1': 4, '3-2': 3, '3-3': 3 };
for (const L of WORLD_3) {
  test(`${L.id} ${L.name}: el bot lo termina sin perder vida y lee sus ${PASAJES[L.id]} pasajes`, () => {
    const g = createGame(L.map, {}, { alba: { start: PASAJES_POR_NIVEL[L.id] } });
    for (let i = 0; i < 60 * 150 && g.status === 'play'; i++) stepGame(g, albaBot(g));
    assert.equal(g.status, 'won', `${L.id}: x=${Math.round(g.player.x)} fase=${g.alba.boss?.phase}`);
    assert.equal(g.hearts, 3);
    assert.equal(g.alba.leidos.length, PASAJES[L.id]);
    assert.deepEqual(g.alba.leidos, Array.from({ length: PASAJES[L.id] }, (_, k) => PASAJES_POR_NIVEL[L.id] + k));
  });
}

test('el mundo tiene los 10 pasajes, uno por canción, sin repetir', () => {
  const total = WORLD_3.reduce((n, L) => n + (L.map.match(/S/g) || []).length, 0);
  assert.equal(total, 10);
});
