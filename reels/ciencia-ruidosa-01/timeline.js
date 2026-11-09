// timeline.js — única fuente de tiempos (imagen, música, foley, tests)
export const BPM = 120;
export const SECS = [
  { id: 'hook', t0: 0, t1: 3.5, music: 'intro' },
  { id: 'pulse', t0: 3.5, t1: 9.5, music: 'groove' },
  { id: 'silence', t0: 9.5, t1: 14, music: 'none' },
  { id: 'dopa', t0: 14, t1: 23, music: 'build', drop: 19 },
  { id: 'chills', t0: 23, t1: 28, music: 'climax' },
  { id: 'end', t0: 28, t1: 33, music: 'outro' },
];
export const DUR = 33;
export const DROP = 19, PREDROP = 18.5;
// cámara (mundo: alto del cuerpo = 1000): [t, cx, cy, escala]
export const CAM = [
  [0, 0, 357, 1.12], [3.5, 0, 357, 1.12], [4.6, -26, 336, 2.6], [9.5, -26, 336, 2.6], [13.6, -26, 330, 2.3],
  [14, -26, 330, 2.3], [15.4, 0, 74, 4.6], [22.75, 0, 74, 4.8], [28, 0, 357, 1.12], [33, 0, 357, 1.08],
];
// textos: [id, t0, t1, ...]
export const HEARTBEATS = (() => { const b = [];
  for (let t = 0; t < 9.5; t += 0.5) b.push(+t.toFixed(3));
  for (let t = 10.0; t < 14; t += 1.25) b.push(+t.toFixed(3));
  for (let t = 14; t < 33; t += 0.5) b.push(+t.toFixed(3));
  return b; })();
export const sec = t => SECS.find(s => t >= s.t0 && t < s.t1) || SECS.at(-1);
