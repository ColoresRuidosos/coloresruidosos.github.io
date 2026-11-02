// Fondo panorámico: una sola imagen más ancha que la pantalla que se desplaza de su borde izquierdo
// al derecho a lo largo de todo el nivel (sin repetirse, así no hay costuras). Puro: sin DOM.
import { W } from '../game/constants.js';

export function panOffset(camX, levelW, imgW) {
  const range = imgW - W, travel = levelW - W;
  if (range <= 0 || travel <= 0) return 0;
  return Math.round(Math.max(0, Math.min(range, (camX / travel) * range)));
}
