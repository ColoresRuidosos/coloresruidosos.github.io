// Generador de sprites por código, estilo Neo Geo (spec §3.0f G). Núcleo puro (se prueba en Node):
// se pintan formas planas con un número de material por píxel y `shade` pone el contorno oscuro y 3 tonos
// por material (luz arriba a la izquierda, sombra abajo a la derecha). `toSheet` lo convierte en lienzo (navegador).
export const OUTLINE = '#120c18';

export function createGrid(w, h) {
  const m = new Uint8Array(w * h);
  const G = {
    w, h, m,
    set(x, y, v) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < w && y < h) m[y * w + x] = v; },
    get(x, y) { return x >= 0 && y >= 0 && x < w && y < h ? m[y * w + x] : 0; },
    rect(x, y, rw, rh, v) { for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) G.set(x + i, y + j, v); },
    ellipse(cx, cy, rx, ry, v) {
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
        for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
          const dx = (x - cx) / rx, dy = (y - cy) / ry;
          if (dx * dx + dy * dy <= 1) G.set(x, y, v);
        }
      }
    },
    // Trazo grueso (brazos, piernas): cuadrados de lado `th` a lo largo del segmento.
    line(x0, y0, x1, y1, th, v) {
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
      for (let k = 0; k <= n; k++) {
        const x = x0 + ((x1 - x0) * k) / n, y = y0 + ((y1 - y0) * k) / n;
        G.rect(Math.round(x - th / 2), Math.round(y - th / 2), th, th, v);
      }
    },
    // Polígono relleno (capas, sombreros, vestidos).
    poly(pts, v) {
      const ys = pts.map((p) => p[1]);
      for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
        const xs = [];
        for (let i = 0; i < pts.length; i++) {
          const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
          if ((ay <= y + 0.5 && by > y + 0.5) || (by <= y + 0.5 && ay > y + 0.5)) xs.push(ax + ((y + 0.5 - ay) * (bx - ax)) / (by - ay));
        }
        xs.sort((a, b) => a - b);
        for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.round(xs[i]); x < Math.round(xs[i + 1]); x++) G.set(x, y, v);
      }
    },
  };
  return G;
}

// mats[v] = [oscuro, medio, claro] o un color plano (ojos, bocas, botones).
export function shade(G, mats) {
  const { w, h } = G, out = new Array(w * h).fill(null);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = G.get(x, y);
      if (!v) continue;
      const mat = mats[v];
      if (typeof mat === 'string') { out[y * w + x] = mat; continue; }
      const same = (dx, dy) => G.get(x + dx, y + dy) === v;
      const lit = !same(-1, 0) || !same(0, -1);
      const dark = !same(1, 0) || !same(0, 1) || !same(1, 1) || !same(2, 2);
      out[y * w + x] = lit && !(!same(1, 0) && !same(-1, 0)) ? mat[2] : dark ? mat[0] : mat[1];
    }
  }
  // Contorno: cada hueco que toca una figura (en cruz) se pinta oscuro.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (G.get(x, y)) continue;
      if (G.get(x - 1, y) || G.get(x + 1, y) || G.get(x, y - 1) || G.get(x, y + 1)) out[y * w + x] = OUTLINE;
    }
  }
  return out;
}

// Navegador: fotogramas → lienzo único y meta de atlas (mismo formato que los de scripts/slice_*.py).
export function toSheet(frames, anims) {
  const W = frames.reduce((n, f) => n + f.w + 2, 0), H = Math.max(...frames.map((f) => f.h));
  const c = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const g = c.getContext('2d');
  const meta = { frames: {}, anims };
  let x0 = 0;
  for (const f of frames) {
    for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) {
      const col = f.px[y * f.w + x];
      if (col) { g.fillStyle = col; g.fillRect(x0 + x, y, 1, 1); }
    }
    meta.frames[f.key] = { x: x0, y: 0, w: f.w, h: f.h, ax: f.ax ?? Math.floor(f.w / 2), ay: f.h };
    x0 += f.w + 2;
  }
  return { img: c, meta };
}
