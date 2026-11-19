// T11.1–T11.2: base chiptune propia que sustituye a la canción (spec §3.0b)
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderTrack } from '../src/audio/track.js';
import { BEATMAP } from '../src/data/beatmap.js';

const SR = 8000;   // baja resolución para que el test sea rápido
const pcm = renderTrack({ beatmap: BEATMAP, sampleRate: SR });
const beat = 60 / BEATMAP.bpm;
const rms = (from, to) => {
  const a = Math.floor(from * SR), b = Math.min(pcm.length, Math.floor(to * SR));
  let s = 0; for (let i = a; i < b; i++) s += pcm[i] * pcm[i];
  return Math.sqrt(s / Math.max(1, b - a));
};

test('dura lo mismo que el mapa y no se satura', () => {
  assert.equal(pcm.length, Math.ceil(BEATMAP.duration * SR));
  let max = 0; for (const x of pcm) { assert.ok(Number.isFinite(x)); max = Math.max(max, Math.abs(x)); }
  assert.ok(max <= 1, `pico ${max}`); assert.ok(max > 0.3, 'tiene volumen');
});

test('silencio antes del primer pulso', () => {
  assert.ok(rms(0, BEATMAP.firstBeat - 0.01) < 1e-6);
});

test('es determinista', () => {
  const otra = renderTrack({ beatmap: BEATMAP, sampleRate: SR });
  assert.deepEqual(otra.slice(100000, 100500), pcm.slice(100000, 100500));
});

test('el golpe cae en el beat: más energía justo después de cada tiempo que justo antes', () => {
  let ok = 0, total = 0;
  for (const sec of BEATMAP.sections.filter((s) => s.kind === 'fase1' || s.kind === 'alta')) {
    const n0 = Math.ceil((sec.from - BEATMAP.firstBeat) / beat) + 1, n1 = Math.floor((sec.to - BEATMAP.firstBeat) / beat) - 1;
    for (let n = n0; n <= n1; n++) {
      const t = BEATMAP.firstBeat + n * beat; total++;
      if (rms(t, t + 0.04) > 1.5 * rms(t - 0.06, t - 0.01)) ok++;
    }
  }
  assert.ok(total > 300); assert.ok(ok / total > 0.95, `${ok}/${total} tiempos con ataque`);
});

test('la sección «alta» suena más fuerte que el «respiro»', () => {
  const sec = (k) => BEATMAP.sections.filter((s) => s.kind === k);
  const avg = (arr) => arr.reduce((a, s) => a + rms(s.from, s.to), 0) / arr.length;
  assert.ok(avg(sec('alta')) > 1.2 * avg(sec('respiro')));
});

test('se apaga al final', () => {
  assert.ok(rms(BEATMAP.duration - 0.3, BEATMAP.duration) < 0.02);
});
