// v7 · Recorte de los trajes de Pepe (spec §3.0f D; tarea O6).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COSTUMES_META } from '../src/data/costumes-atlas.js';
import { COSTUMES } from '../src/game/progress.js';

const SHEET = ['rojo', 'boina', 'bandana', 'chamarra', 'vampiro', 'botarga', 'lentes'];

test('todos los trajes menos el clásico tienen sus 4 poses', () => {
  for (const id of COSTUMES.map((c) => c.id).filter((c) => c !== 'clasico')) {
    for (const pose of ['idle', 'run', 'jump', 'throw']) assert.ok(COSTUMES_META.frames[`${id}_${pose}`], `${id}_${pose}`);
  }
  assert.deepEqual(Object.keys(COSTUMES_META.frames).length, SHEET.length * 4);
});

test('alto ≈ 48 px (la botarga, con antena, algo más) y anclas dentro del fotograma', () => {
  for (const id of SHEET) {
    const f = COSTUMES_META.frames[`${id}_idle`];
    assert.ok(f.h >= 44 && f.h <= 56, `${id}: alto ${f.h}`);
  }
  for (const [k, f] of Object.entries(COSTUMES_META.frames)) {
    assert.ok(f.ax >= 0 && f.ax <= f.w && f.ay === f.h, k);
  }
});
