// Mandos físicos (F9) con la Gamepad API, hasta 4. Mapeo estándar:
// A/Cruz = salto, X/Cuadrado = golpe, B/Círculo e Y/Triángulo = especial, Start = pausa; cruceta o stick izquierdo.
import { NEUTRAL } from './source.js';

export const DEADZONE = 0.35;
const btn = (gp, i) => !!(gp.buttons[i] && (gp.buttons[i].pressed || gp.buttons[i].value > 0.5));

export function readGamepad(gp, deadzone = DEADZONE) {
  if (!gp || !gp.connected) return NEUTRAL;
  const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
  let x = Math.abs(ax) > deadzone ? Math.sign(ax) : 0;
  let y = Math.abs(ay) > deadzone ? Math.sign(ay) : 0;
  if (btn(gp, 14)) x = -1; if (btn(gp, 15)) x = 1;
  if (btn(gp, 12)) y = -1; if (btn(gp, 13)) y = 1;
  return { x, y, golpe: btn(gp, 2), salto: btn(gp, 0), especial: btn(gp, 1) || btn(gp, 3), pausa: btn(gp, 9) };
}

export function createGamepads(nav = globalThis.navigator) {
  const pads = () => (nav && nav.getGamepads ? [...nav.getGamepads()] : []);
  return {
    sources: [0, 1, 2, 3].map((i) => ({
      key: `mando${i}`, kind: 'mando', label: `MANDO ${i + 1}`,
      read: () => readGamepad(pads()[i]),
      connected: () => !!(pads()[i] && pads()[i].connected),
    })),
  };
}
