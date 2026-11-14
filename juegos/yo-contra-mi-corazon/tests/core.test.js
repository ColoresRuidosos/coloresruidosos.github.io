// T1.1 reloj · T1.2 juicio · semilla
import test from 'node:test';
import assert from 'node:assert/strict';
import { createClock, songTimeAt } from '../src/core/clock.js';
import { judge } from '../src/core/judge.js';
import { createRng } from '../src/core/rng.js';
import { BEATMAP } from '../src/data/beatmap.js';

test('clock: el tiempo 0 cae en firstBeat y cada tiempo dura 60/BPM', () => {
  const c = createClock({ bpm: 120, firstBeat: 0.5 });
  assert.equal(c.beat, 0.5);
  assert.equal(c.timeOfBeat(0), 0.5);
  assert.equal(c.timeOfBeat(4), 2.5);
  assert.equal(c.beatAt(2.5), 4);
  assert.equal(c.nearestBeat(2.7), 4);
  assert.equal(c.nearestBeat(2.8), 5);
});

test('clock: songTimeAt usa la marca de salida del audio, el inicio y el desfase del usuario', () => {
  // contexto: a performanceTime 1000 ms se oía contextTime 10 s; la canción arrancó en 4 s; desfase +20 ms
  const anchor = { contextTime: 10, performanceTime: 1000, startAt: 4, offsetMs: 20 };
  assert.equal(songTimeAt(1500, anchor).toFixed(3), (10 + 0.5 - 4 - 0.02).toFixed(3));
});

test('judge: ±70 ms perfecto, ±140 ms bien, lo demás fuera; asistido duplica', () => {
  assert.equal(judge(1.0, 1.06), 'perfecto');
  assert.equal(judge(1.0, 0.93), 'perfecto');
  assert.equal(judge(1.0, 1.12), 'bien');
  assert.equal(judge(1.0, 1.2), 'fuera');
  assert.equal(judge(1.0, 1.2, true), 'bien');
  assert.equal(judge(1.0, 1.13, true), 'perfecto');
});

test('rng: misma semilla, misma secuencia; distinta semilla, otra', () => {
  const a = createRng(7), b = createRng(7), c = createRng(8);
  const sa = [a(), a(), a()], sb = [b(), b(), b()], sc = [c(), c(), c()];
  assert.deepEqual(sa, sb);
  assert.notDeepEqual(sa, sc);
  for (const v of sa) assert.ok(v >= 0 && v < 1);
});

test('beatmap (T1.3): 160–176 BPM, secciones contiguas de 0 a la duración y fases en orden', () => {
  assert.ok(BEATMAP.bpm >= 160 && BEATMAP.bpm <= 176);
  const s = BEATMAP.sections;
  assert.equal(s[0].from, 0);
  assert.equal(s.at(-1).to, BEATMAP.duration);
  for (let i = 1; i < s.length; i++) assert.equal(s[i].from, s[i - 1].to);
  assert.ok(BEATMAP.phase2At < BEATMAP.phase3At && BEATMAP.phase3At < BEATMAP.duration);
  assert.ok(s.some((x) => x.kind === 'fase1') && s.some((x) => x.kind === 'cierre'));
});
