// Efectos por código (spec F12). Ningún sonido de otro juego: mordidita, abrazo, Hyperpop, besito, adiós.
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

function tono(ctx, dest, { type = 'square', from, to = from, t = ctx.currentTime, dur = 0.1, vol = 0.15 }) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(from, t);
  if (to !== from) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.02);
}

export const SFX = {
  eat: (ctx, d, ev) => tono(ctx, d, { type: 'triangle', from: hz(ev?.alt ? 84 : 81), to: hz(ev?.alt ? 79 : 76), dur: 0.05, vol: 0.12 }),
  hyper: (ctx, d) => { const t = ctx.currentTime; [0, 0.06, 0.12, 0.18].forEach((k, i) => tono(ctx, d, { type: 'sawtooth', from: hz(72 + i * 5), to: hz(84 + i * 5), t: t + k, dur: 0.08, vol: 0.1 })); },
  abrazo: (ctx, d, ev) => { const t = ctx.currentTime, b = 72 + 2 * Math.log2((ev?.pts || 200) / 200); [0, 4, 7, 12].forEach((s, i) => tono(ctx, d, { type: 'triangle', from: hz(b + s), t: t + i * 0.05, dur: 0.12, vol: 0.14 })); },
  pierde: (ctx, d) => tono(ctx, d, { type: 'triangle', from: hz(76), to: hz(52), dur: 0.9, vol: 0.18 }),
  besito: (ctx, d) => { const t = ctx.currentTime; tono(ctx, d, { type: 'sine', from: hz(88), to: hz(93), t, dur: 0.08, vol: 0.2 }); tono(ctx, d, { type: 'sine', from: hz(91), to: hz(96), t: t + 0.1, dur: 0.1, vol: 0.2 }); },
  desaparezco: (ctx, d) => tono(ctx, d, { type: 'sine', from: hz(60), to: hz(96), dur: 0.6, vol: 0.12 }),
  bonus: (ctx, d) => { const t = ctx.currentTime; [0, 7, 12, 16].forEach((s, i) => tono(ctx, d, { from: hz(79 + s), t: t + i * 0.06, dur: 0.07, vol: 0.1 })); },
  clear: (ctx, d) => { const t = ctx.currentTime; [0, 4, 7, 12, 7, 12].forEach((s, i) => tono(ctx, d, { type: 'square', from: hz(72 + s), t: t + i * 0.1, dur: 0.12, vol: 0.12 })); },
};
