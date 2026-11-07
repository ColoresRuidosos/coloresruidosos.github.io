import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BPM, SECS, DUR, QUIZ } from '../timeline.js';

const beat = 60 / BPM;
const onBeat = t => Math.abs(t / beat - Math.round(t / beat)) < 1e-9;

test('secciones contiguas y DUR = fin de la última', () => {
  for (let i = 1; i < SECS.length; i++) assert.equal(SECS[i].t0, SECS[i - 1].t1, SECS[i].id);
  assert.equal(SECS[0].t0, 0); assert.equal(SECS.at(-1).t1, DUR);
});
test('5 preguntas; cuenta 3·2·1 de 1 s; revelación en pulso exacto', () => {
  assert.equal(QUIZ.length, 5);
  for (const q of QUIZ) {
    assert.deepEqual(q.count.map(c => +(c - q.count[0]).toFixed(6)), [0, 1, 2]);
    assert.equal(q.reveal, q.count[2] + 1);
    for (const t of [...q.count, q.reveal]) assert.ok(onBeat(t), `${q.id} ${t} fuera de pulso`);
    assert.ok(q.optsIn < q.count[0], `${q.id}: opciones antes de la cuenta`);
  }
});
test('la primera recompensa llega antes del s 9 (tiempo promedio actual)', () => assert.ok(QUIZ[0].reveal < 9));
test('duración de 30 a 45 s', () => assert.ok(DUR >= 30 && DUR <= 45));
