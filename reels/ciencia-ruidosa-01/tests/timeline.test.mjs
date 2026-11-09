import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BPM, SECS, DUR, DROP, PREDROP, CAM, HEARTBEATS } from '../timeline.js';
const beat = 60 / BPM, onBeat = t => Math.abs(t / beat - Math.round(t / beat)) < 1e-9;
test('secciones contiguas, DUR = fin', () => { for (let i = 1; i < SECS.length; i++) assert.equal(SECS[i].t0, SECS[i - 1].t1); assert.equal(SECS.at(-1).t1, DUR); });
test('cortes y clímax en pulso', () => { for (const s of SECS) assert.ok(onBeat(s.t0), s.id); assert.ok(onBeat(DROP) && onBeat(PREDROP)); });
test('primer dato antes del s 9 (tiempo promedio actual)', () => assert.ok(SECS.find(s => s.id === 'pulse').t0 < 9));
test('el silencio dura ≥ 4 s y el corazón late más lento ahí', () => {
  const s = SECS.find(x => x.id === 'silence'); assert.ok(s.t1 - s.t0 >= 4);
  const inS = HEARTBEATS.filter(t => t >= s.t0 && t < s.t1); assert.ok(inS.length >= 3 && inS[1] - inS[0] > 1);
});
test('cámara ordenada y escalas positivas', () => { for (let i = 1; i < CAM.length; i++) assert.ok(CAM[i][0] > CAM[i - 1][0]); assert.ok(CAM.every(k => k[3] > 0)); assert.equal(CAM.at(-1)[0], DUR); });
