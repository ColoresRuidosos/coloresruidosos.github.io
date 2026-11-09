// F1: gestos táctiles y teclado → acciones { type: 'swipe'|'tap'|'mic', dir?, at } (at = performance.now, ms).
// Lógica pura: main.js le pasa coordenadas en px de pantalla.
export function createGestures({ emit, threshold = 24, tapMs = 200 }) {
  const fingers = new Map();
  return {
    down(id, x, y, at) { fingers.set(id, { x, y, at, done: false }); },
    move(id, x, y, at) {
      const f = fingers.get(id);
      if (!f || f.done) return;
      const dx = x - f.x, dy = y - f.y;
      if (Math.hypot(dx, dy) < threshold) return;
      f.done = true;
      if (Math.abs(dx) >= Math.abs(dy)) emit({ type: 'swipe', dir: dx < 0 ? 'izq' : 'der', at });
      else if (dy > 0) emit({ type: 'swipe', dir: 'abajo', at });
      else emit({ type: 'tap', at });              // hacia arriba = batazo
    },
    up(id, x, y, at) {
      const f = fingers.get(id);
      fingers.delete(id);
      if (!f || f.done) return;
      this.move(id, x, y, at);
      if (f.done) return;
      if (at - f.at <= tapMs) emit({ type: 'tap', at: f.at });
    },
    cancel(id) { fingers.delete(id); },
    key(k, at, repeat = false) {
      if (repeat) return false;
      const a = { ArrowLeft: { type: 'swipe', dir: 'izq' }, ArrowRight: { type: 'swipe', dir: 'der' }, ArrowDown: { type: 'swipe', dir: 'abajo' },
        ' ': { type: 'tap' }, ArrowUp: { type: 'tap' }, m: { type: 'mic' }, M: { type: 'mic' } }[k];
      if (!a) return false;
      emit({ ...a, at });
      return true;
    },
  };
}
