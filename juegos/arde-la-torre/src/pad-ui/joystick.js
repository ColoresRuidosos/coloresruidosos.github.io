// Joystick flotante (plan §5.3): el centro es donde apoya el pulgar; zona muerta del 20 %; 8 direcciones.
export const DEAD = 0.2;

export function stickVector(dx, dy, radius, dead = DEAD) {
  const d = Math.hypot(dx, dy);
  if (d < radius * dead) return { x: 0, y: 0 };
  const oct = Math.round(Math.atan2(dy, dx) / (Math.PI / 4));      // −4…4
  const a = oct * (Math.PI / 4);
  const r = (v) => (Math.abs(v) < 0.01 ? 0 : Math.sign(v));
  return { x: r(Math.cos(a)), y: r(Math.sin(a)) };
}

// Gestor multitoque: un dedo para el joystick (mitad izquierda) y otros para los botones.
export function createStick(radius) {
  let id = null, cx = 0, cy = 0, px = 0, py = 0;
  return {
    down(pid, x, y) { if (id !== null) return false; id = pid; cx = px = x; cy = py = y; return true; },
    move(pid, x, y) {
      if (pid !== id) return false;
      px = x; py = y;
      // El centro sigue al dedo si se sale del radio (joystick «que arrastra»).
      const dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy);
      if (d > radius * 1.4) { cx = px - (dx / d) * radius * 1.4; cy = py - (dy / d) * radius * 1.4; }
      return true;
    },
    up(pid) { if (pid !== id) return false; id = null; return true; },
    get active() { return id !== null; },
    get vector() { return id === null ? { x: 0, y: 0 } : stickVector(px - cx, py - cy, radius); },
    get center() { return { x: cx, y: cy, px, py }; },
  };
}
