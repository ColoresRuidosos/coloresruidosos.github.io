// T10.2 · Concierto final (F17): lógica de ritmo pura, en milisegundos de la canción.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createConcert, pressLane, stepConcert, multiplier, PERFECT_MS, GOOD_MS } from '../src/sim/ritmo.js';
import { PARTS, UNISON, INSTRUMENTS, BPM, DURATION_MS, MP3 } from '../src/data/cancion-final.js';
const NOTES = PARTS.antonio;

const chart = [[1000, 0], [1500, 1], [2000, 2], [2500, 0], [3000, 0]];

test('T10.2 ventanas: ±60 ms perfecto, ±120 ms bien, fuera no cuenta; cada nota una sola vez', () => {
  const c = createConcert({ notes: chart, slots: [0], durationMs: 4000 });
  assert.equal(PERFECT_MS, 60); assert.equal(GOOD_MS, 120);
  assert.equal(pressLane(c, 0, 0, 1059), 'perfect');
  assert.equal(pressLane(c, 0, 0, 1000), null, 'la misma nota no cuenta dos veces');
  assert.equal(pressLane(c, 0, 1, 1500 - 110), 'good');
  assert.equal(pressLane(c, 0, 2, 2000 + 121), null, 'fuera de la ventana');
  assert.equal(pressLane(c, 0, 1, 2000), null, 'carril equivocado');
  const p = c.players[0];
  assert.equal(p.score, 100 + 50); assert.equal(p.perfect, 1); assert.equal(p.good, 1);
});

test('T10.2 fallos al pasar la nota, racha que se reinicia, medidor PÚBLICO y fin', () => {
  const c = createConcert({ notes: chart, slots: [0, 1], durationMs: 4000 });
  const crowd0 = c.crowd;
  pressLane(c, 0, 0, 1000); pressLane(c, 1, 0, 1000);
  assert.ok(c.crowd > crowd0, 'los aciertos animan al público');
  stepConcert(c, 1500 + GOOD_MS + 1);
  assert.equal(c.players[0].miss, 1, 'la nota de 1500 ya pasó');
  assert.equal(c.players[0].combo, 0, 'el fallo reinicia la racha');
  assert.equal(c.players[0].maxCombo, 1);
  const before = c.crowd; stepConcert(c, 2000 + GOOD_MS + 1);
  assert.ok(c.crowd < before, 'los fallos lo bajan');
  assert.ok(c.crowd >= 0 && c.crowd <= 1);
  assert.equal(c.done, false);
  stepConcert(c, 4000);
  assert.equal(c.done, true);
  const p = c.players[1];
  assert.equal(p.perfect + p.good + p.miss, chart.length, 'todas las notas quedan contadas');
  assert.ok(p.accuracy >= 0 && p.accuracy <= 1);
});

test('T10.2 multiplicador ×2 a las 10, ×3 a las 20, ×4 a las 30', () => {
  assert.deepEqual([1, 9, 10, 19, 20, 29, 30, 99].map(multiplier), [1, 1, 2, 2, 3, 3, 4, 4]);
  const notes = Array.from({ length: 12 }, (_, i) => [1000 + i * 250, i % 3]);
  const c = createConcert({ notes, slots: [0], durationMs: 5000 });
  for (const [ms, lane] of notes) pressLane(c, 0, lane, ms);
  assert.equal(c.players[0].score, 9 * 100 + 3 * 200, 'la nota 10.ª ya vale el doble');
});

test('T10.6 una parte por instrumento: ~80 s, ordenadas, en la rejilla de corcheas, empieza fácil', () => {
  assert.ok(MP3.startsWith('data:audio/mpeg;base64,'));
  assert.ok(DURATION_MS > 70000 && DURATION_MS < 90000, `${DURATION_MS} ms`);
  assert.ok(BPM > 110 && BPM < 125);
  assert.deepEqual(Object.keys(PARTS).sort(), ['antonio', 'dani', 'jota', 'pepe']);
  assert.deepEqual(INSTRUMENTS, { antonio: 'VOZ', pepe: 'BAJO', dani: 'GUITARRA', jota: 'BATERÍA' });
  const key = (ns) => ns.map((n) => n.join(':')).join(',');
  assert.notEqual(key(PARTS.jota), key(PARTS.pepe), 'cada instrumento tiene su parte');
  assert.notEqual(key(PARTS.dani), key(PARTS.antonio));
  for (const [hero, NOTES] of Object.entries(PARTS)) {
  assert.ok(NOTES.length > 80 && NOTES.length < 400, `${hero}: ${NOTES.length} notas`);
  const eighth = 60000 / BPM / 2;
  for (let i = 1; i < NOTES.length; i++) {
    assert.ok(NOTES[i][0] - NOTES[i - 1][0] >= eighth - 2, `notas ${i - 1} y ${i} demasiado juntas`);
    assert.ok([0, 1, 2].includes(NOTES[i][1]));
  }
  assert.ok(NOTES[0][0] >= 2000, 'da tiempo a prepararse');
  assert.ok(NOTES[NOTES.length - 1][0] < DURATION_MS - 500);
  const first10s = NOTES.filter(([ms]) => ms < 12000).length, last10s = NOTES.filter(([ms]) => ms > DURATION_MS - 22000 && ms < DURATION_MS - 12000).length;
  assert.ok(first10s <= last10s + 2, 'el principio no es más denso que el clímax');
  for (const lane of [0, 1, 2]) assert.ok(NOTES.filter((n) => n[1] === lane).length > NOTES.length * 0.15, `${hero}: carril ${lane} poco usado`);
  }
  assert.ok(UNISON.length >= 8 && UNISON.length <= 60, `${UNISON.length} momentos «todos a una»`);
  for (const ms of UNISON) for (const ns of Object.values(PARTS)) assert.ok(ns.some((n) => n[0] === ms), `todas las partes tienen nota en ${ms}`);
});

test('T10.7 partes por jugador, «¡TODOS A UNA!» con bonus y puntuación de banda', () => {
  const parts = { 0: [[1000, 0], [2000, 1]], 1: [[1000, 2], [1500, 1], [2000, 0]] };
  const c = createConcert({ parts, unison: [1000, 2000], durationMs: 3000 });
  assert.equal(pressLane(c, 0, 2, 1000), null, 'J1 no tiene nota en el carril de J2');
  pressLane(c, 0, 0, 1000);
  assert.ok(!c.events.some((e) => e.type === 'unison'), 'falta J2');
  pressLane(c, 1, 2, 1010);
  const ev = c.events.find((e) => e.type === 'unison');
  assert.ok(ev, '¡TODOS A UNA!');
  assert.equal(c.players[0].score, 100 + 50); assert.equal(c.players[1].score, 100 + 50);
  assert.equal(c.unisons, 1);
  // en 2000, J2 falla: no hay bonus
  pressLane(c, 0, 1, 2000); stepConcert(c, 2000 + GOOD_MS + 1);
  assert.equal(c.unisons, 1);
  assert.equal(c.bandScore, c.players[0].score + c.players[1].score);
  // con un solo jugador no hay «todos a una»
  const solo = createConcert({ parts: { 0: [[1000, 0]] }, unison: [1000], durationMs: 2000 });
  pressLane(solo, 0, 0, 1000);
  assert.equal(solo.unisons, 0);
});

test('T10.2 un bot perfecto saca todo PERFECTO; uno que no toca falla todas', () => {
  const c = createConcert({ notes: NOTES, slots: [0, 1], durationMs: DURATION_MS, unison: UNISON });
  for (const [ms, lane] of NOTES) { stepConcert(c, ms); pressLane(c, 0, lane, ms); }
  stepConcert(c, DURATION_MS);
  assert.equal(c.players[0].perfect, NOTES.length);
  assert.equal(c.players[0].maxCombo, NOTES.length);
  assert.equal(c.players[1].miss, NOTES.length);
  assert.equal(c.players[0].accuracy, 1);
  assert.equal(c.players[1].accuracy, 0);
});

import { statSync, existsSync } from 'node:fs';
test('T6.4 peso: juego ≤ 4 MB (con la canción de F17) y mando ≤ 300 KB', { skip: !existsSync('dist/index.html') && 'falta npm run build' }, () => {
  assert.ok(statSync('dist/index.html').size <= 4 * 1024 * 1024, `juego ${statSync('dist/index.html').size} B`);
  assert.ok(statSync('dist/mando/index.html').size <= 300 * 1024);
});
