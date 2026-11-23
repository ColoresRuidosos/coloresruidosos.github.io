// Base hyperpop propia, generada en el navegador (spec F12, §6.1: sin audio del artista).
// 140 BPM, 16 pasos por compás, una progresión por escenario. Con la Hyperpop el arpegio sube una octava.
export const BPM = 140;
export const STEP_S = 60 / BPM / 4;

// Raíz MIDI y progresión de 4 compases [semitonos desde la raíz, 'm' menor | 'M' mayor].
export const PATRONES = [
  { id: 'calle', raiz: 57, prog: [[0, 'm'], [-4, 'M'], [3, 'M'], [-2, 'M']] },   // La menor: Am F C G
  { id: 'bosque', raiz: 50, prog: [[0, 'M'], [7, 'M'], [9, 'm'], [5, 'M']] },     // Re: D A Bm G
  { id: 'escenario', raiz: 54, prog: [[0, 'm'], [-4, 'M'], [-7, 'm'], [-2, 'M']] }, // Fa# menor
  { id: 'skate', raiz: 52, prog: [[0, 'm'], [0, 'm'], [-4, 'M'], [-2, 'M']] },    // Mi menor, más seco
  { id: 'bunnyland', raiz: 60, prog: [[0, 'M'], [-3, 'm'], [5, 'M'], [7, 'M']] },  // Do: C Am F G
];

const ARP = [0, 2, 1, 2, 0, 2, 1, 3, 0, 2, 1, 2, 3, 2, 1, 2];
const acorde = (root, q) => [root, root + (q === 'm' ? 3 : 4), root + 7, root + 12];

// Qué suena en un paso (dato puro, se prueba sin audio).
export function notasDelPaso(escenario, paso, hyper = false) {
  const p = PATRONES[escenario % PATRONES.length];
  const compas = Math.floor(paso / 16) % p.prog.length, s = paso % 16;
  const [off, q] = p.prog[compas];
  const ch = acorde(p.raiz + off, q);
  const out = [];
  if (s % 4 === 0) out.push({ inst: 'bombo' });
  if (s === 4 || s === 12) out.push({ inst: 'palmas' });
  if (s % 2 === 1 && p.id !== 'skate') out.push({ inst: 'hat' });
  if (s === 0) out.push({ inst: 'pad', notas: ch });
  if (s % 2 === 0 || p.id === 'escenario') out.push({ inst: 'bajo', midi: ch[0] - 24 + (s >= 12 && s % 4 === 2 ? 12 : 0) });
  out.push({ inst: 'arp', midi: ch[ARP[s]] + 12 + (hyper ? 12 : 0) });
  return out;
}

const hz = (m) => 440 * 2 ** ((m - 69) / 12);

export function crearMusica(ctx, destino) {
  let timer = null, paso = 0, siguiente = 0, escenario = 0, hyper = false;
  const ruido = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate);
  const d = ruido.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

  const env = (t, g, a, dur, pico) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(pico, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); };
  function osc(type, f, t, dur, pico, filtro = 0) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    let n = o;
    if (filtro) { const bq = ctx.createBiquadFilter(); bq.type = 'lowpass'; bq.frequency.value = filtro; o.connect(bq); n = bq; }
    n.connect(g); g.connect(destino); env(t, g, 0.005, dur, pico);
    o.start(t); o.stop(t + dur + 0.02);
    return o;
  }
  function noise(t, dur, pico, hp) {
    const s = ctx.createBufferSource(), g = ctx.createGain(), bq = ctx.createBiquadFilter();
    s.buffer = ruido; bq.type = 'highpass'; bq.frequency.value = hp;
    s.connect(bq); bq.connect(g); g.connect(destino); env(t, g, 0.002, dur, pico);
    s.start(t); s.stop(t + dur + 0.02);
  }
  function tocar(n, t) {
    switch (n.inst) {
      case 'bombo': { const o = osc('sine', 150, t, 0.25, 0.9); o.frequency.exponentialRampToValueAtTime(40, t + 0.2); break; }
      case 'palmas': noise(t, 0.12, 0.35, 1200); break;
      case 'hat': noise(t, 0.03, 0.12, 7000); break;
      case 'pad': n.notas.forEach((m) => { osc('sawtooth', hz(m) * 1.003, t, STEP_S * 15, 0.035, 2200); osc('sawtooth', hz(m) * 0.997, t, STEP_S * 15, 0.035, 2200); }); break;
      case 'bajo': osc('square', hz(n.midi), t, STEP_S * 0.9, 0.18, 600); break;
      case 'arp': osc('square', hz(n.midi), t, STEP_S * 0.7, hyper ? 0.07 : 0.05, hyper ? 5000 : 3000); break;
    }
  }
  const tick = () => {
    while (siguiente < ctx.currentTime + 0.12) { for (const n of notasDelPaso(escenario, paso, hyper)) tocar(n, siguiente); paso++; siguiente += STEP_S; }
  };
  return {
    play(e) { escenario = e; paso = 0; siguiente = ctx.currentTime + 0.05; if (!timer) timer = setInterval(tick, 25); tick(); },
    stop() { clearInterval(timer); timer = null; },
    setHyper(on) { hyper = on; },
    get sonando() { return !!timer; },
  };
}
