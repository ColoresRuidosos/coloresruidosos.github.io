// Fase 3 · Sonido: 5 bases propias a 140 BPM y efectos, con un Web Audio simulado (spec F12).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BPM, STEP_S, PATRONES, notasDelPaso, crearMusica } from '../src/audio/synth.js';
import { SFX } from '../src/audio/sfx.js';

function fakeCtx() {
  const param = () => ({ value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} });
  const node = () => ({ connect() {}, start() { ctx.started++; }, stop() {}, frequency: param(), gain: param(), type: '', buffer: null });
  const ctx = {
    started: 0, currentTime: 0, sampleRate: 8000, destination: node(),
    createOscillator: node, createGain: node, createBiquadFilter: node, createBufferSource: node,
    createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }),
  };
  return ctx;
}

test('140 BPM en semicorcheas; una progresión distinta por escenario', () => {
  assert.equal(BPM, 140); assert.ok(Math.abs(STEP_S - 60 / 140 / 4) < 1e-9);
  assert.equal(PATRONES.length, 5);
  const huella = (e) => JSON.stringify(Array.from({ length: 64 }, (_, i) => notasDelPaso(e, i)));
  assert.equal(new Set([0, 1, 2, 3, 4].map(huella)).size, 5);
});

test('bombo en negras y palmas en 2 y 4; la Hyperpop sube el arpegio una octava', () => {
  const c = (inst) => Array.from({ length: 16 }, (_, i) => notasDelPaso(0, i)).filter((ns) => ns.some((n) => n.inst === inst)).length;
  assert.equal(c('bombo'), 4); assert.equal(c('palmas'), 2);
  const arp = (h) => notasDelPaso(0, 3, h).find((n) => n.inst === 'arp').midi;
  assert.equal(arp(true) - arp(false), 12);
});

test('la música programa notas y se detiene; los efectos suenan', () => {
  const ctx = fakeCtx();
  const mus = crearMusica(ctx, ctx.destination);
  mus.play(2); assert.ok(ctx.started > 0); assert.ok(mus.sonando);
  mus.stop(); assert.equal(mus.sonando, false);
  for (const [k, f] of Object.entries(SFX)) { const n = ctx.started; f(ctx, ctx.destination, { pts: 800, alt: 1 }); assert.ok(ctx.started > n, k); }
});
