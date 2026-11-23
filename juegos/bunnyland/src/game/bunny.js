// Hanzer Bunny: avanza solo, guarda el giro pedido 250 ms y da media vuelta al instante (spec F1).
import { OPPOSITE, step, isWalkable } from '../core/grid.js';
import { TILE, TURN_BUFFER } from '../data/tuning.js';
import { advance, tileOf } from './actor.js';

export const createBunny = (g) => ({ x: g.start.x * TILE, y: g.start.y * TILE, dir: 'left', face: 'left', want: null, wantTtl: 0 });

export function wantDir(b, dir) { if (dir) { b.want = dir; b.wantTtl = TURN_BUFFER; } }

export function moveBunny(b, g, amount) {
  if (b.want && b.dir && b.want === OPPOSITE[b.dir]) { b.dir = b.want; b.want = null; }
  advance(b, g, amount, false, () => {
    const [tx, ty] = tileOf(b);
    if (b.want && isWalkable(g, ...step(g, tx, ty, b.want))) { b.dir = b.want; b.want = null; }
    else if (b.dir && !isWalkable(g, ...step(g, tx, ty, b.dir))) b.dir = null;
  });
  if (b.want && --b.wantTtl <= 0) b.want = null;
  if (b.dir) b.face = b.dir;
}
