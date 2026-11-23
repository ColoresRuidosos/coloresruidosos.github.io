// Fase 2 · El Bunny se mueve por la rejilla (spec F1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMaze } from '../src/core/grid.js';
import { MAZES } from '../src/data/mazes.js';
import { TILE, TURN_BUFFER } from '../src/data/tuning.js';
import { createBunny, wantDir, moveBunny } from '../src/game/bunny.js';
import { tileOf, place } from '../src/game/actor.js';

const g = parseMaze(MAZES[0]);
const run = (b, n, speed = 20) => { for (let i = 0; i < n; i++) moveBunny(b, g, speed); };

test('sale de su casilla hacia la izquierda y avanza a velocidad fija', () => {
  const b = createBunny(g);
  assert.deepEqual(tileOf(b), [g.start.x, g.start.y]);
  assert.equal(b.dir, 'left');
  moveBunny(b, g, 20);
  assert.equal(b.x, g.start.x * TILE - 20);
});

test('choca con el muro y se queda quieto en la última casilla libre', () => {
  // Fila 20 del laberinto 1: «#....#....S....#....#» → a la izquierda de S hay 4 casillas y muro en x=5
  const b = createBunny(g);
  run(b, 200);
  assert.deepEqual(tileOf(b), [6, 20]);
  assert.equal(b.dir, null);
  assert.equal(b.x % TILE, 0);
});

test('un giro pedido antes del cruce se guarda y se aplica al llegar; caduca a los 250 ms', () => {
  const b = createBunny(g); // S en (10,20); en (8,20) hay cruce hacia arriba (8,19)
  run(b, Math.round(TILE * 1.5 / 20)); // a medio camino entre 9 y 8
  wantDir(b, 'up');
  run(b, 7);
  assert.equal(b.dir, 'up');
  assert.equal(tileOf(b)[0], 8);
  const c = createBunny(g);
  wantDir(c, 'up');
  run(c, TURN_BUFFER + 1, 1); // muy lento: no llega al cruce antes de que caduque
  assert.equal(c.want, null);
});

test('dar media vuelta es inmediato, aunque esté entre dos casillas', () => {
  const b = createBunny(g);
  run(b, 3);
  const x = b.x;
  wantDir(b, 'right'); moveBunny(b, g, 20);
  assert.equal(b.dir, 'right'); assert.equal(b.x, x + 20);
});

test('el túnel lo lleva al otro lado', () => {
  const b = createBunny(g);
  const y = g.tunnelRows[0];
  place(b, 1, y); b.dir = 'left';
  run(b, Math.ceil(TILE * 2 / 20));
  assert.ok(tileOf(b)[0] >= 19, `x=${tileOf(b)[0]}`);
});
