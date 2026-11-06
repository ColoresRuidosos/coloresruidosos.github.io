// Audio 100 % original: tema chiptune generado por código + efectos sintetizados.
// (No se usa música de José Madero: requeriría licencia del editor. Ver specs/spec.md.)
const midi = (n) => 440 * 2 ** ((n - 69) / 12);

// Tema rockero en Mi menor, 140 bpm: Em | C | G | D.
function renderTheme(sr) {
  const bpm = 140, beat = 60 / bpm, bar = beat * 4, bars = 8, n = Math.round(bars * bar * sr);
  const out = new Float32Array(n);
  const chords = [[40, [64, 67, 71]], [36, [60, 64, 67]], [43, [67, 71, 74]], [38, [62, 66, 69]]];
  const lead = [0, 2, 1, 2, 0, -1, 2, 1, 0, 1, 2, 3, 2, 1, 0, -1];
  let lfsr = 1, phB = 0, phL = 0;
  const noise = () => { const b = (lfsr ^ (lfsr >> 1)) & 1; lfsr = (lfsr >> 1) | (b << 14); return lfsr & 1 ? 1 : -1; };
  for (let i = 0; i < n; i++) {
    const t = i / sr, b = Math.floor(t / bar) % bars, inBar = t - Math.floor(t / bar) * bar;
    const [bass, tones] = chords[b % 4];
    const e = Math.floor(inBar / (beat / 2)), tIn = inBar - e * (beat / 2);
    phB += midi(bass + (e % 2 ? 12 : 0)) / sr;
    let s = (1 - 4 * Math.abs((phB % 1) - 0.5)) * 0.22;
    const idx = b >= 4 ? lead[(e + b * 8) % 16] : (e % 2 ? -1 : e % 3);
    if (idx >= 0) {
      const note = idx === 3 ? tones[0] + 12 : tones[idx] + 12;
      phL += midi(note) / sr;
      s += ((phL % 1) < 0.25 ? 1 : -1) * 0.09 * Math.max(0, 1 - tIn / (beat * 0.55));
    }
    const bt = Math.floor(inBar / beat), tb = inBar - bt * beat;
    if (bt % 2 === 0 && tb < 0.1) s += Math.sin(2 * Math.PI * (55 + 90 * (1 - tb / 0.1)) * tb) * 0.3 * (1 - tb / 0.1);
    if (bt % 2 === 1 && tb < 0.09) s += noise() * 0.1 * (1 - tb / 0.09);
    if (tIn < 0.02) s += noise() * 0.035;
    out[i] = Math.tanh(s * 1.1) * 0.8;
  }
  return out;
}

export function createAudio() {
  let ctx = null, music = null, musicOn = true, gain = null;
  const ensure = () => {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    gain = ctx.createGain(); gain.gain.value = 0.5; gain.connect(ctx.destination);
    return ctx;
  };
  const tone = (type, f0, f1, dur, vol = 0.25) => {
    if (!ensure()) return;
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(gain); o.start(t); o.stop(t + dur);
  };
  const SFX = {
    jump: () => tone('square', 320, 640, 0.12, 0.12),
    mic: () => tone('sawtooth', 900, 300, 0.1, 0.08),
    hook: () => tone('square', 600, 1200, 0.08, 0.1),
    release: () => tone('square', 500, 900, 0.1, 0.1),
    stomp: () => tone('square', 400, 120, 0.12, 0.16),
    defeat: () => { tone('square', 660, 660, 0.06, 0.1); setTimeout(() => tone('square', 990, 990, 0.1, 0.1), 60); },
    piece: () => { tone('square', 988, 988, 0.05, 0.1); setTimeout(() => tone('square', 1319, 1319, 0.12, 0.1), 50); },
    hurt: () => tone('sawtooth', 300, 80, 0.3, 0.16),
    flash: () => tone('square', 2400, 1800, 0.06, 0.06),
    dash: () => tone('sawtooth', 200, 500, 0.15, 0.08),
    checkpoint: () => tone('triangle', 523, 1046, 0.25, 0.2),
    won: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone('square', f, f, 0.15, 0.12), i * 110)),
    // v5 · Carmesí
    guitar: () => [330, 392, 494, 659, 784, 988].forEach((f, i) => setTimeout(() => { tone('sawtooth', f, f * 1.01, 0.16, 0.12); tone('square', f / 2, f / 2, 0.16, 0.06); }, i * 55)),
    powerup: () => [523, 784, 1046].forEach((f, i) => setTimeout(() => tone('square', f, f, 0.08, 0.1), i * 60)),
    heal: () => [659, 880].forEach((f, i) => setTimeout(() => tone('triangle', f, f, 0.12, 0.18), i * 80)),
    dive: () => tone('square', 1200, 300, 0.25, 0.06),
    charge: () => tone('sawtooth', 200, 1400, 0.8, 0.07),
    beam: () => tone('sawtooth', 1600, 400, 0.4, 0.09),
    exposed: () => tone('square', 900, 700, 0.15, 0.08),
    clank: () => tone('square', 180, 160, 0.08, 0.12),
    bosshit: () => { tone('sawtooth', 300, 60, 0.25, 0.2); setTimeout(() => tone('square', 900, 900, 0.06, 0.1), 40); },
    bossdown: () => [784, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => tone('square', f, f, 0.18, 0.13), i * 140)),
    bossintro: () => tone('triangle', 60, 40, 1.2, 0.25),
    bossland: () => { tone('sawtooth', 120, 30, 0.45, 0.3); tone('square', 70, 40, 0.3, 0.2); },
    bosscard: () => [[220, 277, 330], [208, 262, 311]].forEach((ch, i) => setTimeout(() => ch.forEach((f) => tone('sawtooth', f, f, 0.4, 0.07)), i * 260)),
    fight: () => [392, 523, 659, 784].forEach((f, i) => setTimeout(() => tone('square', f, f, 0.12, 0.12), i * 70)),
    gameover: () => [392, 330, 262].forEach((f, i) => setTimeout(() => tone('triangle', f, f, 0.25, 0.2), i * 180)),
  };
  return {
    unlock() {
      if (!ensure()) return;
      if (ctx.state === 'suspended') ctx.resume();
      if (!music && musicOn) {
        const data = renderTheme(ctx.sampleRate);
        const buf = ctx.createBuffer(1, data.length, ctx.sampleRate);
        buf.copyToChannel(data, 0);
        music = ctx.createBufferSource(); music.buffer = buf; music.loop = true;
        const mg = ctx.createGain(); mg.gain.value = 0.55; music.connect(mg); mg.connect(gain); music.start();
      }
    },
    toggleMusic() {
      musicOn = !musicOn;
      if (gain) gain.gain.value = musicOn ? 0.5 : 0;
      return musicOn;
    },
    play(events) { if (musicOn) for (const e of events) SFX[e]?.(); },
  };
}
