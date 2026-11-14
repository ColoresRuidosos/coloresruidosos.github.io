// T2.7: la pelea completa con bots (comprueba la dificultad de constants.js)
import test from 'node:test';
import assert from 'node:assert/strict';
import { createMatch, step, rankOf } from '../src/game/match.js';
import { createBot, simulate } from '../src/game/bot.js';
import { BEATMAP } from '../src/data/beatmap.js';

const play = (seed, skill, opts = {}) => simulate(createMatch({ beatmap: BEATMAP, seed, ...opts }), step, createBot({ seed: seed * 7, ...skill }));

test('bot perfecto: K.O. en la fase 3 antes del cierre, sin recibir golpes, rango Leyenda', () => {
  for (const seed of [1, 2, 3]) {
    const m = play(seed, {});
    assert.equal(m.over, 'ko', `semilla ${seed}`);
    assert.equal(m.phase, 3);
    assert.ok(m.overAt > 140 && m.overAt < m.cierre, `K.O. a los ${m.overAt.toFixed(0)} s: ni muy pronto ni después del cierre`);
    assert.equal(m.stats.golpes, 0);
    assert.equal(rankOf(m.score), 'LEYENDA DEL CIRCO');
  }
});

test('bot bueno (±50 ms, falla 8 %): gana (K.O. o decisión)', () => {
  for (const seed of [1, 2, 3]) {
    const m = play(seed, { jitter: 0.05, miss: 0.08, hitProb: 0.9 });
    assert.ok(['ko', 'decision'].includes(m.over), `semilla ${seed}: ${m.over}`);
  }
});

test('bot inactivo: pierde; en asistido llega al final sin perder vida', () => {
  const idle = () => [];
  const m = simulate(createMatch({ beatmap: BEATMAP, seed: 1 }), step, idle);
  assert.equal(m.over, 'derrota');
  const a = simulate(createMatch({ beatmap: BEATMAP, seed: 1, assist: true }), step, idle);
  assert.equal(a.over, 'perdio'); assert.equal(a.clown.hp, 100);
});

test('la partida es determinista: misma semilla y mismo bot → mismo resultado', () => {
  const a = play(4, { jitter: 0.07, miss: 0.1 }), b = play(4, { jitter: 0.07, miss: 0.1 });
  assert.equal(a.score, b.score); assert.equal(a.over, b.over);
});

test('bot normal (±80 ms, falla 20 %): gana por decisión o K.O. (F7b)', () => {
  for (const seed of [1, 2, 3]) {
    const m = play(seed, { jitter: 0.08, miss: 0.2, hitProb: 0.8 });
    assert.ok(['ko', 'decision'].includes(m.over), `semilla ${seed}: ${m.over}`);
  }
});
