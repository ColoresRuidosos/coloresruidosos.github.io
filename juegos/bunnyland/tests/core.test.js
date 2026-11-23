// Fase 1 · Núcleo: semilla, rejilla, laberintos y paso fijo (spec F1, F8).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../src/core/rng.js';
import { parseMaze, mirror, isWalkable, step, OPPOSITE, WALL, DOOR, HOUSE } from '../src/core/grid.js';
import { MAZES } from '../src/data/mazes.js';
import { createLoop } from '../src/core/loop.js';

test('rng: misma semilla, misma secuencia; distinta semilla, distinta', () => {
  const a = createRng(7), b = createRng(7), c = createRng(8);
  const sa = Array.from({ length: 20 }, () => a.next());
  assert.deepEqual(sa, Array.from({ length: 20 }, () => b.next()));
  assert.notDeepEqual(sa, Array.from({ length: 20 }, () => c.next()));
  assert.ok(sa.every((v) => v >= 0 && v < 1));
  const r = createRng(3);
  for (let i = 0; i < 100; i++) { const n = r.int(4); assert.ok(n >= 0 && n < 4 && Number.isInteger(n)); }
});

test('grid: espejo, muros, puerta, casa y túnel que envuelve', () => {
  const m = mirror(['#abcdefghij'])[0];
  assert.equal(m, '#abcdefghijihgfedcba#');
  const g = parseMaze(MAZES[0]);
  assert.equal(g.w, 21); assert.equal(g.h, 27);
  assert.equal(g.cell(0, 0), WALL);
  assert.equal(g.cell(g.door.x, g.door.y), DOOR);
  assert.equal(g.cell(g.houseCenter.x, g.houseCenter.y), HOUSE);
  assert.equal(isWalkable(g, g.door.x, g.door.y), false, 'la puerta no deja pasar al conejo');
  assert.equal(isWalkable(g, g.door.x, g.door.y, true), true, 'la puerta sí deja pasar a quien sale o vuelve');
  const ty = g.tunnelRows[0];
  assert.ok(isWalkable(g, 0, ty) && isWalkable(g, -1, ty), 'el túnel envuelve: x=-1 es x=20');
  assert.deepEqual(step(g, 0, ty, 'left'), [20, ty]);
  assert.equal(OPPOSITE.up, 'down');
});

test('mazes: 5 laberintos válidos de 21×27 (F8)', () => {
  assert.equal(MAZES.length, 5);
  for (const def of MAZES) {
    const g = parseMaze(def);
    assert.equal(g.rows.length, 27, def.id);
    assert.ok(g.rows.every((r) => r.length === 21), def.id);
    assert.equal(g.power.length, 4, `${def.id}: 4 Zanahorias Hyperpop`);
    assert.ok(g.carrots.length > 180, `${def.id}: suficientes zanahorias`);
    // Todas las zanahorias y especiales alcanzables desde la salida del conejo (BFS)
    const seen = new Set([g.start.x + ',' + g.start.y]); const q = [[g.start.x, g.start.y]];
    while (q.length) {
      const [x, y] = q.shift();
      for (const d of ['up', 'down', 'left', 'right']) {
        const [nx, ny] = step(g, x, y, d);
        if (isWalkable(g, nx, ny) && !seen.has(nx + ',' + ny)) { seen.add(nx + ',' + ny); q.push([nx, ny]); }
      }
    }
    for (const [x, y] of [...g.carrots, ...g.power, [g.bonus.x, g.bonus.y], [g.heart.x, g.heart.y], [g.vanish.x, g.vanish.y], [g.exit.x, g.exit.y]]) {
      assert.ok(seen.has(x + ',' + y), `${def.id}: ${x},${y} alcanzable`);
    }
    // Sin callejones: cada casilla caminable tiene al menos 2 salidas
    for (const k of seen) {
      const [x, y] = k.split(',').map(Number);
      const n = ['up', 'down', 'left', 'right'].filter((d) => isWalkable(g, ...step(g, x, y, d))).length;
      assert.ok(n >= 2, `${def.id}: callejón en ${k}`);
    }
    // Los especiales no tienen zanahoria encima
    for (const s of [g.bonus, g.heart, g.vanish]) assert.ok(!g.carrots.some(([x, y]) => x === s.x && y === s.y), def.id);
  }
});

test('loop: paso fijo de 60 Hz con acumulador, sin espiral', () => {
  let n = 0;
  const loop = createLoop(() => n++);
  loop.advance(1000 / 60 * 3 + 2); assert.equal(n, 3);
  loop.advance(1000 / 60 - 1); assert.equal(n, 4, 'el resto acumulado completa un paso');
  loop.advance(5000); assert.ok(n <= 4 + 15, 'máximo 15 pasos por cuadro');
  loop.reset(); n = 0; loop.advance(1000 / 60 * 2 + 0.5); assert.equal(n, 2);
});
