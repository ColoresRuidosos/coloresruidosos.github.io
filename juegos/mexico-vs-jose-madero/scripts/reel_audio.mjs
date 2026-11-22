// Audio del tráiler de Alba (reel/spec.md T3): chiptune original de amanecer + efectos en los eventos del juego.
// Sin audio de José Madero. Uso: node scripts/reel_audio.mjs <eventos.json> <salida.wav> <segundos> [--solo-efectos]
import { readFileSync, writeFileSync } from 'node:fs';
const [evPath, out, durS] = process.argv.slice(2);
const onlyFx = process.argv.includes('--solo-efectos');
const SR = 44100, FPS = 30, dur = Number(durS), n = Math.round(dur * SR);
const L = new Float32Array(n);
const midi = (m) => 440 * 2 ** ((m - 69) / 12);
const sq = (ph, duty = 0.5) => ((ph % 1) < duty ? 1 : -1);
const tri = (ph) => 1 - 4 * Math.abs((ph % 1) - 0.5);
function note(t0, len, freq, vol, wave = 'sq', f1 = freq) {
  let ph = 0; const i0 = Math.round(t0 * SR), m = Math.round(len * SR);
  for (let i = 0; i < m && i0 + i < n; i++) {
    const k = i / m, f = freq + (f1 - freq) * k; ph += f / SR;
    const env = Math.min(1, i / 200) * (1 - k) ** 1.5;
    L[i0 + i] += (wave === 'tri' ? tri(ph) : sq(ph, 0.25)) * vol * env;
  }
}

if (!onlyFx) {
  // 96 bpm en Do mayor, progresión de amanecer: C – Am – F – G. Arpegio de pulso y bajo triangular.
  const beat = 60 / 96, chords = [[48, [60, 64, 67]], [45, [57, 60, 64]], [41, [53, 57, 60]], [43, [55, 59, 62]]];
  const lead = [72, 74, 76, 79, 76, 74, 72, 67];
  for (let b = 0, t = 0; t < dur; b++, t = b * beat * 4) {
    const [bass, ch] = chords[b % 4];
    for (let s = 0; s < 8; s++) note(t + s * beat / 2, beat / 2 * 0.9, midi(ch[s % 3] + (s >= 4 ? 12 : 0)), 0.05);
    note(t, beat * 2, midi(bass), 0.16, 'tri'); note(t + beat * 2, beat * 2, midi(bass + 7), 0.14, 'tri');
    if (b >= 2) for (let s = 0; s < 4; s++) note(t + s * beat, beat * 0.8, midi(lead[(b * 4 + s) % 8]), 0.045, 'tri');
  }
}
// Efectos (los mismos sonidos que el juego, sintetizados aquí).
const FX = {
  pasaje: (t) => [523, 659, 784].forEach((f, i) => note(t + i * 0.12, 0.3, f, 0.12, 'tri')),
  mic: (t) => note(t, 0.08, 900, 0.06, 'sq', 1400),
  defeat: (t) => note(t, 0.15, 1200, 0.08, 'sq', 300),
  'tiro:mala': (t) => { note(t, 0.12, 1400, 0.08, 'sq', 200); note(t, 0.1, 880, 0.06, 'tri', 1320); },
  'tiro:empieza': (t) => [392, 523, 659].forEach((f, i) => note(t + i * 0.07, 0.08, f, 0.08)),
  recuerdo: (t) => note(t, 0.3, 440, 0.1, 'tri', 330),
  alcanza: (t) => note(t, 0.35, 220, 0.14, 'sq', 80),
  hurt: (t) => note(t, 0.25, 300, 0.1, 'sq', 120),
  rayo: (t) => [784, 988, 1175].forEach((f, i) => note(t + i * 0.07, 0.15, f, 0.1, 'tri')),
  nostalgia: (t) => note(t, 1.2, 110, 0.15, 'tri', 70),
  tic: (t) => [0, 0.05, 0.1].forEach((d) => note(t + d, 0.03, 1800, 0.04)),
  jump: (t) => note(t, 0.1, 400, 0.04, 'sq', 800),
};
const seen = new Set();
for (const { f, e } of JSON.parse(readFileSync(evPath, 'utf8'))) {
  const key = f + e; if (seen.has(key)) continue; seen.add(key);   // un efecto por cuadro
  FX[e]?.(f / FPS);
}
// Final: acorde que se apaga.
[60, 64, 67, 72].forEach((m) => note(dur - 2.6, 2.4, midi(m), 0.05, 'tri'));
// WAV estéreo de 16 bits
const buf = Buffer.alloc(44 + n * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
for (let i = 0; i < n; i++) { const v = Math.max(-1, Math.min(1, Math.tanh(L[i] * 1.2))) * 32767; buf.writeInt16LE(v | 0, 44 + i * 4); buf.writeInt16LE(v | 0, 46 + i * 4); }
writeFileSync(out, buf);
