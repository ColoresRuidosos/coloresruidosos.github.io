// timeline.js — única fuente de tiempos: imagen, música, foley, subtítulos y tests leen esto.
export const BPM = 120;                       // pulso 0.5 s, compás 2 s
export const SECS = [
  { id: 'q1', t0: 0, t1: 5, era: 1997, lut: 'gb4' },
  { id: 'q2', t0: 5, t1: 10, era: 2005, lut: 'nes' },
  { id: 'q3', t0: 10, t1: 14.5, era: 2009, lut: 'full' },
  { id: 'q4', t0: 14.5, t1: 19, era: 2021, lut: 'full' },
  { id: 'turn', t0: 19, t1: 20, lut: 'full' },          // silencio 19.0–19.5, sacudida, remolino 19.5–20.0
  { id: 'boss', t0: 20, t1: 29.5, era: 1997, lut: 'gb4' },
  { id: 'result', t0: 29.5, t1: 34.5, lut: 'full' },
  { id: 'save', t0: 34.5, t1: 40, lut: 'full' },
];
export const DUR = 40;
// por pregunta: cuándo aparece el texto, cuándo entran las opciones, la cuenta y la revelación
export const QUIZ = [
  { id: 'q1', qIn: 0, optsIn: 0, count: [1, 2, 3], reveal: 4, out: 5 },
  { id: 'q2', qIn: 5, optsIn: 5.3, count: [6, 7, 8], reveal: 9, out: 10 },
  { id: 'q3', qIn: 10, optsIn: 10.2, count: [10.5, 11.5, 12.5], reveal: 13.5, out: 14.5 },
  { id: 'q4', qIn: 14.5, optsIn: 14.7, count: [15, 16, 17], reveal: 18, out: 19.5 },
  { id: 'boss', qIn: 20.5, optsIn: 21, count: [22.5, 23.5, 24.5], reveal: 25.5, out: 29.5 },
];
export const MARK = {
  silence: [19, 19.5], shake: 19, swirl: [19.5, 20],
  heartbeatStop: 25.1, flood: [29.5, 30.3], rankStep: 0.35, cta: 31,
  saveIn: 34.5, again: 38.5,
  mosaic: [5, 10, 14.5],                     // cruces de mosaico centrados aquí (±0.4 s)
};
export const sec = t => SECS.find(s => t >= s.t0 && t < s.t1) || SECS.at(-1);
