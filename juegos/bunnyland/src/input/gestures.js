// Deslizar y teclado → dirección (spec F1). Sin DOM: main.js conecta los eventos.
export const SWIPE_MIN = 20;

export function dirFromDelta(dx, dy, min = SWIPE_MIN) {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < min) return null;
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
}

const KEYS = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right' };
export const dirFromKey = (key) => KEYS[String(key).toLowerCase()] || null;

// Dispara en cuanto el dedo recorre lo suficiente; el origen se mueve para encadenar giros.
export function createSwipe(onDir, min = SWIPE_MIN) {
  let ox = 0, oy = 0, active = false;
  return {
    down(x, y) { ox = x; oy = y; active = true; },
    move(x, y) {
      if (!active) return;
      const d = dirFromDelta(x - ox, y - oy, min);
      if (d) { onDir(d); ox = x; oy = y; }
    },
    up() { active = false; },
  };
}
