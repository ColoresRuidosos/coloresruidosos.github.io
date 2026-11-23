// Fase 2 · Los 4 enemigos y sus conductas (spec F5, §3.1.1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMaze } from '../src/core/grid.js';
import { MAZES } from '../src/data/mazes.js';
import { createRng } from '../src/core/rng.js';
import { TILE, OSITO_PAUSA, TP_EVERY, TP_AVISO, CHARCO_EVERY, CORNERS } from '../src/data/tuning.js';
import { createEnemies, targetFor, chooseDir, stepEnemy } from '../src/game/enemies.js';
import { tileOf, place } from '../src/game/actor.js';

const g = parseMaze(MAZES[0]);
const ctx = (over = {}) => ({ g, rng: createRng(1), bunny: { tile: [10, 20], dir: 'left' }, fase: 'perseguir', restantes: 1, vanish: false, charcos: new Map(), ...over });
const byTipo = (es) => Object.fromEntries(es.map((e) => [e.tipo, e]));

test('salen 4: el Coronado ya afuera; Osito, Estrellita y Gotita en la nube', () => {
  const e = byTipo(createEnemies(g));
  assert.deepEqual(Object.keys(e), ['coronado', 'osito', 'estrellita', 'gotita']);
  assert.equal(e.coronado.estado, 'activo');
  assert.deepEqual(tileOf(e.coronado), [g.exit.x, g.exit.y]);
  for (const t of ['osito', 'estrellita', 'gotita']) assert.equal(e[t].estado, 'casa');
});

test('objetivos al perseguir y al rondar', () => {
  const e = byTipo(createEnemies(g));
  place(e.gotita, 1, 1);
  assert.deepEqual(targetFor(e.coronado, ctx()), [10, 20]);
  assert.deepEqual(targetFor(e.osito, ctx()), [6, 20], 'Osito: 4 casillas delante del Bunny');
  assert.deepEqual(targetFor(e.gotita, ctx()), [10, 20], 'Gotita lejos: persigue');
  place(e.gotita, 10, 22);
  assert.deepEqual(targetFor(e.gotita, ctx()), CORNERS.gotita, 'Gotita cerca: huye a su esquina');
  assert.deepEqual(targetFor(e.coronado, ctx({ fase: 'rondar' })), CORNERS.coronado);
});

test('en un cruce elige la casilla más cercana al objetivo y no da media vuelta', () => {
  const e = byTipo(createEnemies(g));
  const c = e.coronado; // en la salida (10,10), fila «####.#         #.####»
  c.dir = 'left';
  assert.equal(chooseDir(c, ctx({ bunny: { tile: [19, 10], dir: 'left' } })), 'left', 'no se regresa aunque el Bunny esté a la derecha');
  c.dir = 'down';
  assert.equal(chooseDir(c, ctx({ bunny: { tile: [19, 10], dir: 'left' } })), 'right');
});

test('los de la nube salen por la puerta cuando les toca', () => {
  const e = byTipo(createEnemies(g));
  const o = e.osito;
  o.estado = 'saliendo';
  for (let i = 0; i < 400 && o.estado !== 'activo'; i++) stepEnemy(o, ctx(), 10);
  assert.equal(o.estado, 'activo');
  assert.deepEqual(tileOf(o), [g.exit.x, g.exit.y]);
});

test('Osito: se queda pasmado al chocar de frente con una pared', () => {
  const e = byTipo(createEnemies(g));
  const o = e.osito; o.estado = 'activo';
  place(o, 1, 1); o.dir = 'up'; // arriba de (1,1) hay muro
  stepEnemy(o, ctx(), 10);
  assert.equal(o.pausa, OSITO_PAUSA);
  const x = o.x, y = o.y;
  stepEnemy(o, ctx(), 10);
  assert.equal(o.x, x); assert.equal(o.y, y);
});

test('Estrellita: avisa y luego salta a una estrella (una Zanahoria Hyperpop)', () => {
  const e = byTipo(createEnemies(g));
  const s = e.estrellita; s.estado = 'activo'; place(s, 10, 10); s.dir = 'left';
  const c = ctx();
  for (let i = 0; i < TP_EVERY - TP_AVISO; i++) stepEnemy(s, c, 0);
  assert.ok(s.aviso > 0, 'avisa antes de saltar');
  for (let i = 0; i < TP_AVISO; i++) stepEnemy(s, c, 0);
  assert.ok(g.power.some(([x, y]) => x === tileOf(s)[0] && y === tileOf(s)[1]), `saltó a ${tileOf(s)}`);
});

test('Gotita: deja un charquito cada cierto tiempo', () => {
  const e = byTipo(createEnemies(g));
  const d = e.gotita; d.estado = 'activo'; place(d, 10, 10); d.dir = 'left';
  const c = ctx();
  for (let i = 0; i < CHARCO_EVERY; i++) stepEnemy(d, c, 0);
  assert.equal(c.charcos.size, 1);
});

test('triste: vaga al azar; nubecita: vuelve a la casa por el camino más corto', () => {
  const e = byTipo(createEnemies(g));
  const c = e.coronado; c.estado = 'nube'; place(c, 1, 1); c.dir = 'right';
  for (let i = 0; i < 2000 && c.estado === 'nube'; i++) stepEnemy(c, ctx(), 24);
  assert.equal(c.estado, 'saliendo');
});

test('determinista: misma semilla, mismos movimientos', () => {
  const sim = () => {
    const es = createEnemies(g); const c = ctx({ rng: createRng(9) });
    es.forEach((e) => { e.estado = 'activo'; e.triste = true; place(e, 10, 10); e.dir = 'left'; });
    for (let i = 0; i < 300; i++) es.forEach((e) => stepEnemy(e, c, 12));
    return es.map((e) => [e.x, e.y]);
  };
  assert.deepEqual(sim(), sim());
});
