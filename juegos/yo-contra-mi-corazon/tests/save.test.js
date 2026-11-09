// T3.5: opciones y récord en localStorage (ycmc-save)
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadSave, writeSave, DEFAULTS, recordResult } from '../src/core/save.js';
import { cardLines } from '../src/share/card.js';

const mem = () => { const d = {}; return { getItem: (k) => d[k] ?? null, setItem: (k, v) => { d[k] = String(v); }, d }; };

test('sin guardado → valores por defecto; guardar y leer conserva opciones', () => {
  const st = mem();
  assert.deepEqual(loadSave(st), DEFAULTS);
  const s = loadSave(st); s.opts.asistido = true; s.opts.desfase = -40; s.seenHowTo = true;
  writeSave(st, s);
  const r = loadSave(st);
  assert.equal(r.opts.asistido, true); assert.equal(r.opts.desfase, -40); assert.equal(r.seenHowTo, true);
  assert.equal(r.opts.vibracion, true, 'conserva lo que no se tocó');
});

test('guardado roto o de otra versión → por defecto, sin tronar', () => {
  const st = mem(); st.setItem('ycmc-save', '{roto');
  assert.deepEqual(loadSave(st), DEFAULTS);
  st.setItem('ycmc-save', JSON.stringify({ v: 99 }));
  assert.deepEqual(loadSave(st), DEFAULTS);
  assert.deepEqual(loadSave(null), DEFAULTS);
});

test('récord: solo sube; devuelve si es nuevo', () => {
  const s = structuredClone(DEFAULTS);
  assert.equal(recordResult(s, 1000, 'TELONERO'), true);
  assert.equal(recordResult(s, 500, 'TELONERO'), false);
  assert.equal(s.best.score, 1000);
});

test('T3.6 la tarjeta para compartir lleva título, rango, puntos, resultado y la cuenta de CR', () => {
  const l = cardLines({ over: 'ko', score: 41234, rank: 'LEYENDA DEL CIRCO', stats: { perfecto: 80 }, maxCombo: 30 });
  const all = l.join(' | ');
  for (const s of ['YO CONTRA', 'MI CORAZÓN', 'LEYENDA DEL CIRCO', '41234', 'K.O.', '@COLORESRUIDOSOS']) assert.ok(all.includes(s), s);
});
