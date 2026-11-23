// Fase 2 · Bots: la gira se puede completar y el juego es determinista (spec NFR Pruebas).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMatch, stepMatch } from '../src/game/match.js';
import { botDir } from '../src/game/bot.js';

export function simulate(seed, { bot = true, maxSteps = 60 * 60 * 12, hastaNivel = 5 } = {}) {
  const m = createMatch({ seed });
  let steps = 0;
  while (m.mode !== 'over' && m.nivel < hastaNivel && steps < maxSteps) { stepMatch(m, { dir: bot ? botDir(m) : null }); steps++; }
  return { nivel: m.nivel, score: m.score, lives: m.lives, steps, over: m.mode === 'over' };
}

test('la gira de 5 escenarios se puede completar (bot, semilla 2; ver npm run tune)', () => {
  const r = simulate(2);
  assert.ok(r.nivel >= 5, JSON.stringify(r));
});

test('el jugador inactivo pierde sus 3 vidas en el primer nivel', () => {
  const r = simulate(1, { bot: false, maxSteps: 60 * 60 * 3 });
  assert.ok(r.over && r.nivel === 0, JSON.stringify(r));
});

test('determinista: misma semilla, misma partida', () => {
  const a = simulate(4, { hastaNivel: 2 }), b = simulate(4, { hastaNivel: 2 });
  assert.deepEqual(a, b);
});
