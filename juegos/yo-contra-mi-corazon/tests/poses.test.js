// T3.1: qué pose se dibuja según el estado (lógica pura) y que todas existan en el atlas
import test from 'node:test';
import assert from 'node:assert/strict';
import { heartPose, clownPose } from '../src/game/poses.js';
import { createMatch, step } from '../src/game/match.js';
import { BEATMAP } from '../src/data/beatmap.js';
import { FRAMES } from '../src/data/atlas.js';

function attackOf(m) { for (let t = m.t; t < 60; t += 1 / 60) { step(m, t); if (m.heart.mode === 'ataque') return m.heart; } }

test('avisa del lado del puño, luego el golpe, y el corazón abierto se ve normal', () => {
  const m = createMatch({ beatmap: BEATMAP, seed: 1 });
  const h = attackOf(m); const T = h.hits[0].T;
  assert.equal(heartPose(m, T - 0.5).pose, 'heart.avisoIzq');
  assert.equal(heartPose(m, T + 0.1).pose, 'heart.golpeIzq');
  step(m, T, [{ type: 'swipe', dir: 'der', t: T }]); step(m, T + 0.3);
  assert.equal(heartPose(m, T + 0.3).pose, 'heart.idle');
  const b = m.heart.open[0], tb = m.clock.timeOfBeat(b);
  step(m, tb, [{ type: 'tap', t: tb }]);
  assert.equal(heartPose(m, tb + 0.05).pose, 'heart.dano');
});

test('el payaso: esquiva, batazo y vuelve a «listo»', () => {
  const m = createMatch({ beatmap: BEATMAP, seed: 1 });
  step(m, 1, [{ type: 'swipe', dir: 'izq', t: 1 }]);
  assert.equal(clownPose(m, 1.1).pose, 'clown.esquivaIzq');
  assert.ok(clownPose(m, 1.1).dx < 0);
  assert.equal(clownPose(m, 2).pose, 'clown.listo');
  step(m, 3, [{ type: 'tap', t: 3 }]);
  assert.equal(clownPose(m, 3.02).pose, 'clown.batazo', 'toma impulso');
  const hit = clownPose(m, 3.08);
  assert.equal(hit.pose, 'clown.impacto', 'se lanza y hace contacto');
  assert.ok(hit.dy < -30, 'avanza hacia el corazón');
  assert.equal(clownPose(m, 3.4).pose, 'clown.listo');
});

test('todas las poses posibles existen en el atlas', () => {
  for (const n of ['idle', 'avisoIzq', 'avisoDer', 'golpeIzq', 'golpeDer', 'avisoLatido', 'avisoAorta', 'dano', 'curitas']) assert.ok(FRAMES['heart.' + n], n);
  for (const n of ['listo', 'esquivaIzq', 'esquivaDer', 'agachado', 'batazo', 'impacto', 'grito', 'golpeado']) assert.ok(FRAMES['clown.' + n], n);
  for (const n of ['stage', 'crowd', 'icon.clown', 'icon.heart']) assert.ok(FRAMES[n], n);
  assert.deepEqual(FRAMES.stage.slice(2), [180, 320]);
});
