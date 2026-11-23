// Movimiento compartido por el Bunny y los enemigos: avanzan por la rejilla y deciden en el centro de cada casilla.
import { DIRS, step, isWalkable } from '../core/grid.js';
import { TILE, GRID_W } from '../data/tuning.js';

const WU = GRID_W * TILE;
export const tileOf = (a) => [Math.round(a.x / TILE) % GRID_W, Math.round(a.y / TILE)];
export const place = (a, tx, ty) => { a.x = tx * TILE; a.y = ty * TILE; return a; };
export const atCenter = (a) => a.x % TILE === 0 && a.y % TILE === 0;

// onCenter puede cambiar a.dir; si devuelve 'stop', el actor no se mueve más en este paso.
export function advance(a, g, amount, viaDoor, onCenter) {
  let rem = amount;
  for (let guard = 0; rem > 0 && guard < 8; guard++) {
    if (atCenter(a)) {
      if (onCenter() === 'stop' || !a.dir) return;
      const [tx, ty] = tileOf(a);
      if (!isWalkable(g, ...step(g, tx, ty, a.dir), viaDoor)) return;
    }
    if (!a.dir) return;
    const [dx, dy] = DIRS[a.dir];
    const pos = dx ? a.x : a.y;
    const off = ((pos % TILE) + TILE) % TILE;
    const dist = off === 0 ? TILE : dx + dy > 0 ? TILE - off : off;
    const s = Math.min(rem, dist);
    a.x = (((a.x + dx * s) % WU) + WU) % WU;
    a.y += dy * s;
    rem -= s;
  }
}
