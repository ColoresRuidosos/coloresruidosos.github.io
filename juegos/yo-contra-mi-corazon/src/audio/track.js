// Spec §3.0b: base chiptune propia que sustituye a la canción. Se genera por código, sin muestras de terceros.
// Sigue el mismo mapa (BPM, primer pulso, secciones), así que los ataques del corazón no cambian.

const PROG = [  // un acorde por compás de 4 tiempos: La m – Fa – Do – Sol (notas MIDI)
  { root: 45, tones: [57, 60, 64] },
  { root: 41, tones: [57, 60, 65] },
  { root: 48, tones: [55, 60, 64] },
  { root: 43, tones: [55, 59, 62] },
];
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

// Mezcla por sección: qué suena y con cuánta fuerza.
const MIX = {
  intro:   { kick: [0],          snare: [],     hat: 0.05, hat8: false, bass: 0.10, bass8: false, arp: 0,    pad: 0.04 },
  fase1:   { kick: [0, 2],       snare: [1, 3], hat: 0.07, hat8: true,  bass: 0.16, bass8: true,  arp: 0,    pad: 0 },
  respiro: { kick: [0],          snare: [],     hat: 0.04, hat8: false, bass: 0.09, bass8: false, arp: 0,    pad: 0.06 },
  alta:    { kick: [0, 1, 2, 3], snare: [1, 3], hat: 0.09, hat8: true,  bass: 0.18, bass8: true,  arp: 0.07, pad: 0 },
  cierre:  { kick: [0],          snare: [],     hat: 0,    hat8: false, bass: 0.14, bass8: false, arp: 0,    pad: 0.10 },
};

export function renderTrack({ beatmap, sampleRate = 22050 }) {
  const SR = sampleRate, out = new Float32Array(Math.ceil(beatmap.duration * SR));
  const beat = 60 / beatmap.bpm;
  let seed = 0x2f6b1d;   // ruido con semilla fija: la base siempre es igual
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

  // Cada voz escribe directo en el búfer; las caídas son multiplicativas (sin Math.exp por muestra).
  const span = (t0, dur) => [Math.max(0, Math.round(t0 * SR)), Math.min(out.length, Math.round((t0 + dur) * SR))];
  const decay = (tau) => Math.exp(-1 / (tau * SR));
  const kick = (t, v) => {
    const [a, b] = span(t, 0.22), dA = decay(0.07), dF = decay(0.03);
    let ph = 0, amp = v, sweep = 90;
    for (let i = a; i < b; i++) { ph += (2 * Math.PI * (45 + sweep)) / SR; out[i] += amp * Math.sin(ph); amp *= dA; sweep *= dF; }
  };
  const snare = (t, v) => {
    const [a, b] = span(t, 0.16), d = decay(0.045), w = (2 * Math.PI * 190) / SR;
    let amp = v;
    for (let i = a; i < b; i++) { out[i] += amp * (0.8 * rnd() + 0.3 * Math.sin(w * (i - a))); amp *= d; }
  };
  const hat = (t, v) => {
    const [a, b] = span(t, 0.04), d = decay(0.012);
    let amp = v * 0.5, prev = 0;
    for (let i = a; i < b; i++) { const n = rnd(); out[i] += amp * (n - prev); prev = n; amp *= d; }
  };
  // osciladores con fase acumulada: cuadrada (bajo) y triangular (arpegio y colchón)
  const tone = (t, m, v, dur, { wave, tau, attack, release = 0 }) => {
    const [a, b] = span(t, dur), inc = hz(m) / SR, d = decay(tau), nA = Math.max(1, attack * SR), nR = release * SR;
    let ph = 0, amp = v;
    for (let i = a; i < b; i++) {
      const k = i - a, env = Math.min(1, k / nA) * (nR ? Math.min(1, (b - i) / nR) : 1);
      out[i] += amp * env * (wave === 'sq' ? (ph < 0.5 ? 1 : -1) : 4 * Math.abs(ph - 0.5) - 1);
      ph += inc; if (ph >= 1) ph -= 1; amp *= d;
    }
  };
  const bass = (t, m, v, dur) => tone(t, m, v, dur, { wave: 'sq', tau: dur * 0.6, attack: 0.004 });
  const arp = (t, m, v) => tone(t, m, v, 0.075, { wave: 'tri', tau: 0.025, attack: 0.003 });
  const pad = (t, tones, v, dur) => { for (const m of tones) tone(t, m, v / tones.length, dur, { wave: 'tri', tau: 1e9, attack: 0.25, release: 0.25 }); };

  const kindAt = (t) => (beatmap.sections.find((s) => t >= s.from && t < s.to) || beatmap.sections.at(-1)).kind;
  for (let n = 0; ; n++) {
    const t = beatmap.firstBeat + n * beat;
    if (t >= beatmap.duration) break;
    const kind = kindAt(t), mix = MIX[kind] || MIX.fase1, pos = n % 4, chord = PROG[Math.floor(n / 4) % PROG.length];
    if (kind === 'cierre') {   // un solo acorde largo que se apaga
      if (kindAt(t - beat) !== 'cierre') { kick(t, 0.9); bass(t, chord.root, mix.bass, beatmap.duration - t); pad(t, PROG[0].tones, mix.pad, beatmap.duration - t); }
      continue;
    }
    if (mix.kick.includes(pos)) kick(t, 0.9);
    if (mix.snare.includes(pos)) snare(t, 0.45);
    if (mix.hat) { hat(t, mix.hat); if (mix.hat8) hat(t + beat / 2, mix.hat * 0.7); }
    if (mix.bass8) { bass(t, chord.root, mix.bass, beat / 2); bass(t + beat / 2, chord.root + (pos % 2 ? 12 : 0), mix.bass * 0.8, beat / 2); }
    else if (pos === 0) bass(t, chord.root, mix.bass, beat * 4);
    if (mix.pad && pos === 0) pad(t, chord.tones, mix.pad, beat * 4);
    if (mix.arp) for (let k = 0; k < 4; k++) arp(t + (k * beat) / 4, chord.tones[k % 3] + (k === 3 ? 12 : 0), mix.arp);
  }

  const fadeFrom = (beatmap.sections.find((s) => s.kind === 'cierre')?.from ?? beatmap.duration - 4) * SR;
  for (let i = 0; i < out.length; i++) {
    let x = Math.tanh(out[i] * 1.1);   // limitador suave: nunca pasa de ±1
    if (i > fadeFrom) x *= Math.max(0, 1 - (i - fadeFrom) / (out.length - fadeFrom)) ** 2;
    out[i] = x;
  }
  return out;
}
