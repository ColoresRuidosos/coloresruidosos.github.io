// Paso fijo de 60 Hz con acumulador. La lógica cuenta pasos, no milisegundos.
export const STEP_MS = 1000 / 60;
export function createLoop(onStep, maxSteps = 15) {
  let acc = 0;
  return {
    advance(ms) {
      acc += ms;
      let n = 0;
      while (acc >= STEP_MS && n < maxSteps) { onStep(); acc -= STEP_MS; n++; }
      if (n === maxSteps) acc = 0;
      return n;
    },
    reset() { acc = 0; },
  };
}
