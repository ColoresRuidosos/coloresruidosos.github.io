// T3.4: reproductor con un AudioContext simulado
import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlayer, createSimPlayer } from '../src/audio/player.js';

function fakeCtx() {
  const c = { currentTime: 0, state: 'suspended', outputLatency: 0.05, destination: {}, started: [],
    createGain: () => ({ gain: { value: 1, setTargetAtTime() {}, cancelScheduledValues() {}, setValueAtTime() {} }, connect() {} }),
    createBufferSource: () => ({ connect() {}, start: (when, off) => c.started.push([when, off]), stop() {}, buffer: null }),
    createBuffer: () => ({}),
    resume: async () => { c.state = 'running'; }, suspend: async () => { c.state = 'suspended'; },
    decodeAudioData: async (ab) => ({ duration: 226.6, bytes: ab.byteLength }),
    getOutputTimestamp: () => ({ contextTime: c.currentTime - 0.02, performanceTime: c.perf }),
  };
  return c;
}

test('carga con progreso y decodifica', async () => {
  const ctx = fakeCtx(); const p = createPlayer({ ctx });
  const chunks = [new Uint8Array(50), new Uint8Array(50)];
  const fetchFn = async () => ({ ok: true, headers: { get: () => '100' }, body: { getReader: () => ({ read: async () => (chunks.length ? { done: false, value: chunks.shift() } : { done: true }) }) } });
  const prog = [];
  const buf = await p.load('cancion.mp3', (f) => prog.push(f), fetchFn);
  assert.deepEqual(prog, [0.5, 1]); assert.equal(buf.bytes, 100);
});

test('songTime: usa la marca de salida y el desfase; arranca un poco en el futuro', async () => {
  const ctx = fakeCtx(); const p = createPlayer({ ctx }); p.setBuffer({ duration: 226.6 });
  await p.unlock(); ctx.currentTime = 10; p.start();
  assert.equal(ctx.started.length >= 1, true);
  const startAt = p.startAt; assert.ok(startAt > 10);
  ctx.currentTime = 12; ctx.perf = 5000;
  const t = p.songTime(5100, 30);       // 100 ms después de la marca, desfase +30 ms
  assert.equal(t.toFixed(3), (12 - 0.02 + 0.1 - startAt - 0.03).toFixed(3));
});

test('pausa y reanudación suspenden el contexto', async () => {
  const ctx = fakeCtx(); const p = createPlayer({ ctx }); p.setBuffer({ duration: 1 });
  await p.unlock(); p.start(); await p.pause(); assert.equal(ctx.state, 'suspended');
  await p.resume(); assert.equal(ctx.state, 'running');
});

test('reproductor simulado (?sim): avanza N veces más rápido y se pausa', () => {
  let now = 0; const p = createSimPlayer({ speed: 8, now: () => now });
  p.start(); now = 1000; assert.equal(p.songTime(now), 8);
  p.pause(); now = 3000; assert.equal(p.songTime(now), 8);
  p.resume(); now = 3500; assert.equal(p.songTime(now), 12);
});
