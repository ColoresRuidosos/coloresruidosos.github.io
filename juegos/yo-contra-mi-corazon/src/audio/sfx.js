// Efectos chiptune hechos por código (sin muestras de terceros).
export function createSfx(ctx, out) {
  if (!ctx) return () => {};
  const g = ctx.createGain(); g.gain.value = 0.35; g.connect(out || ctx.destination);
  const tone = (f, dur, { type = 'square', vol = 0.5, to = null, delay = 0 } = {}) => {
    const t0 = ctx.currentTime + delay, o = ctx.createOscillator(), a = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0); if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    a.gain.setValueAtTime(vol, t0); a.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(a); a.connect(g); o.start(t0); o.stop(t0 + dur + 0.02);
  };
  const noise = (dur, vol = 0.4, hp = 400) => {
    const n = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate), d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), a = ctx.createGain();
    f.type = 'highpass'; f.frequency.value = hp; a.gain.value = vol; s.buffer = n; s.connect(f); f.connect(a); a.connect(g); s.start();
  };
  return (e) => {
    switch (e.type) {
      case 'aviso': tone(1320, 0.07, { vol: 0.25 }); tone(1760, 0.07, { vol: 0.25, delay: 0.07 }); break;
      case 'esquiva': tone(e.grade === 'perfecto' ? 990 : 660, 0.08, { type: 'triangle', to: 1400 }); break;
      case 'batazo': noise(0.06, 0.5, 1500); tone(e.grade === 'perfecto' ? 520 : e.grade === 'bien' ? 420 : 260, 0.12, { type: 'square', to: 120 }); break;
      case 'rebote': tone(180, 0.08, { type: 'square', vol: 0.3 }); break;
      case 'golpe': noise(0.2, 0.6, 120); tone(140, 0.25, { type: 'sawtooth', to: 50 }); break;
      case 'caiste': tone(300, 0.1); tone(200, 0.15, { delay: 0.1 }); break;
      case 'estrella': [880, 1108, 1320].forEach((f, i) => tone(f, 0.08, { type: 'triangle', delay: i * 0.05 })); break;
      case 'grito': tone(220, 0.7, { type: 'sawtooth', to: 880, vol: 0.4 }); noise(0.5, 0.2, 2000); break;
      case 'transicion': [660, 440, 330].forEach((f, i) => tone(f, 0.12, { delay: i * 0.1 })); break;
      case 'ko': case 'decision': [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, { type: 'triangle', delay: i * 0.12 })); noise(1.2, 0.25, 800); break;
      case 'derrota': case 'perdio': [392, 330, 262, 196].forEach((f, i) => tone(f, 0.22, { type: 'triangle', delay: i * 0.18 })); break;
      default: break;
    }
  };
}
