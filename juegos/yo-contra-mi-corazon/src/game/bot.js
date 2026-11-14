// Bot para tests y para la demo (?bot): mira los golpes anunciados y actúa en el tiempo.
// skill: { jitter (s, desviación), miss (prob. de no esquivar), hitProb (prob. de batear cada tiempo), seed }
import { createRng } from '../core/rng.js';

export function createBot({ jitter = 0, miss = 0, hitProb = 1, seed = 9, grito = true } = {}) {
  const rng = createRng(seed);
  const done = new Set();
  const gauss = () => { const u = 1 - rng(), v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * jitter; };
  return function think(m, t, dt) {
    const out = [], h = m.heart;
    const due = (at) => at >= t - 1e-9 && at < t + dt;
    for (const hit of h.hits) {
      const key = 'h' + hit.T + (hit.side || '');
      if (hit.done || hit.fake || done.has(key)) continue;
      const at = hit.T + gauss();
      if (at < t + dt) { done.add(key); if (rng() >= miss) out.push({ type: 'swipe', dir: hit.need[0], t: Math.max(t, at) }); }
    }
    if ((h.mode === 'abierto' || h.mode === 'aturdido') && h.open) {
      for (let b = h.open[0]; b <= h.open[1]; b++) {
        const key = 'b' + b + ':' + h.attackId + h.mode;
        const bt = m.clock.timeOfBeat(b);
        if (done.has(key) || !due(bt)) continue;
        done.add(key);
        if (rng() < hitProb) out.push({ type: 'tap', t: Math.max(t, bt + gauss()) });
      }
    }
    if (grito && m.stars >= 5 && h.mode === 'guardia') out.push({ type: 'mic', t });
    return out;
  };
}

export function simulate(match, step, bot, dt = 1 / 60) {
  for (let t = 0; t < match.beatmap.duration + 1 && !match.over; t += dt) step(match, t, bot(match, t, dt));
  return match;
}
