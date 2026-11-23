// Glitch de la Zanahoria Hyperpop sin destellos: franjas que se corren 1–3 px, cambian 2 veces por segundo (NFR accesibilidad).
import { createRng } from '../core/rng.js';
export const GLITCH_CAMBIO = 30; // pasos entre cambios → 2 por segundo

export function glitchBands(step, alto, reducido = false) {
  if (reducido) return [];
  const r = createRng(1 + Math.floor(step / GLITCH_CAMBIO) * 7919);
  return Array.from({ length: 3 }, () => ({ y: r.int(alto - 8), h: 2 + r.int(6), dx: (r.int(2) ? 1 : -1) * (1 + r.int(3)) }));
}
