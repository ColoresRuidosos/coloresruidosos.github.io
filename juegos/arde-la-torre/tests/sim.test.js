// T1.1–T1.8: núcleo de la simulación.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../src/sim/rng.js';
import { createWorld, tick, snapshot } from '../src/sim/world.js';
import { overlaps } from '../src/sim/combat.js';
import { HEROES } from '../src/sim/moves.js';
import { FLOOR_TOP, FLOOR_BOTTOM, LANE, DOUBLE_TAP, SPECIAL_COST, RISE_INVUL_PLAYER } from '../src/sim/constants.js';
import { botInput } from '../src/sim/bot.js';
import { arena, addEnemy, run, tap, IN } from './helpers.js';

test('T1.1 rng: misma semilla → misma secuencia; distinta semilla → distinta', () => {
  const a = createRng(7), b = createRng(7), c = createRng(8);
  const sa = Array.from({ length: 20 }, () => a.next());
  assert.deepEqual(sa, Array.from({ length: 20 }, () => b.next()));
  assert.notDeepEqual(sa, Array.from({ length: 20 }, () => c.next()));
  const r = createRng(1);
  for (let i = 0; i < 200; i++) { const v = r.int(2, 5); assert.ok(v >= 2 && v <= 5 && Number.isInteger(v)); }
});

test('T1.2 world: mismas entradas y semilla → mismo estado tras 600 ticks (con bots y enemigos)', () => {
  const play = () => {
    const w = createWorld({ seed: 42, levelIdx: 0, players: [{ slot: 0, hero: 'antonio' }, { slot: 1, hero: 'pepe' }] });
    for (let i = 0; i < 600; i++) tick(w, [botInput(w, 0), botInput(w, 1)]);
    return snapshot(w);
  };
  assert.equal(play(), play());
  const w2 = createWorld({ seed: 43, levelIdx: 0, players: [{ slot: 0, hero: 'antonio' }, { slot: 1, hero: 'pepe' }] });
  for (let i = 0; i < 600; i++) tick(w2, [botInput(w2, 0), botInput(w2, 1)]);
  assert.notEqual(play(), snapshot(w2));
});

test('T1.3 caminar en 8 direcciones y límites del suelo', () => {
  const w = arena();
  const p = w.fighters[0];
  p.x = 150; p.y = 170;
  run(w, 10, [IN({ x: 1, y: -1 })]);
  assert.ok(p.x > 150 && p.y < 170, 'diagonal arriba-derecha');
  run(w, 400, [IN({ y: -1 })]);
  assert.equal(p.y, FLOOR_TOP, 'no sube más allá del fondo');
  run(w, 400, [IN({ y: 1 })]);
  assert.equal(p.y, FLOOR_BOTTOM, 'no baja más allá del frente');
  run(w, 400, [IN({ x: -1 })]);
  assert.ok(p.x >= w.camX + 10, 'no sale por la izquierda de la pantalla');
});

test('T1.3 salto con altura Z y vuelta al suelo', () => {
  const w = arena();
  const p = w.fighters[0];
  tap(w, 0, 'salto');
  assert.equal(p.state, 'jump');
  let maxZ = 0;
  for (let i = 0; i < 60; i++) { tick(w, []); maxZ = Math.max(maxZ, p.z); }
  assert.ok(maxZ > 25, `altura ${maxZ}`);
  assert.equal(p.z, 0); assert.equal(p.state, 'idle');
});

test('T1.3 doble toque adelante → correr; un solo toque → caminar', () => {
  const w = arena();
  const p = w.fighters[0];
  run(w, 3, [IN({ x: 1 })]); run(w, 3, []); run(w, 5, [IN({ x: 1 })]);
  assert.equal(p.state, 'run');
  run(w, 30, []);
  run(w, 5, [IN({ x: 1 })]);
  assert.equal(p.state, 'walk', 'pasado el tiempo de doble toque, camina');
  assert.ok(DOUBLE_TAP > 3);
});

test('T1.4 los golpes conectan con |Δy| ≤ 8 y no con 9', () => {
  const w = arena();
  const a = w.fighters[0]; a.x = 100; a.y = 170; a.face = 1;
  const box = HEROES.antonio.combo[0];
  const t = { x: 120, y: 170 + LANE, z: 0, def: { w: 16, h: 54 } };
  assert.ok(overlaps(a, box, t));
  t.y = 170 + LANE + 1;
  assert.ok(!overlaps(a, box, t));
  t.y = 170; t.x = 80;               // detrás
  assert.ok(!overlaps(a, box, t));
});

test('T1.4 cada golpe conecta una sola vez por objetivo y hay pausa de impacto', () => {
  const w = arena();
  const p = w.fighters[0]; p.x = 100; p.y = 170; p.face = 1;
  const e = addEnemy(w, 'becario', 120, 170);
  const evs = tap(w, 0, 'golpe').concat(run(w, 20));
  assert.equal(evs.filter((x) => x.type === 'hit').length, 1);
  assert.equal(e.hp, e.maxHp - HEROES.antonio.combo[0].dmg);
});

test('T1.5 combo de 3: encadena si conecta; el 3.º tumba; fuera de tiempo se reinicia', () => {
  const w = arena();
  const p = w.fighters[0]; p.x = 100; p.y = 170; p.face = 1;
  const e = addEnemy(w, 'becario', 120, 170);
  e.hp = e.maxHp = 999;
  const seq = [];
  for (let i = 0; i < 60; i++) { tick(w, [IN({ golpe: i % 4 < 2 })]); if (p.state === 'attack') seq.push(p.combo); }
  assert.deepEqual([...new Set(seq)], [0, 1, 2]);
  assert.ok(['fall', 'down'].includes(e.state), `el tercero tumba (estado ${e.state})`);
  // Al aire: no encadena (sin contacto, el combo vuelve al primer golpe)
  const w2 = arena();
  const q = w2.fighters[0];
  const seen = [];
  for (let i = 0; i < 60; i++) { tick(w2, [IN({ golpe: i % 4 < 2 })]); if (q.state === 'attack') seen.push(q.combo); }
  assert.deepEqual([...new Set(seen)], [0]);
});

test('T1.6 agarre, rodillazos, lanzamiento y el lanzado daña a otros enemigos', () => {
  const w = arena({ heroes: ['pepe'] });
  const p = w.fighters[0]; p.x = 100; p.y = 170; p.face = 1;
  const e = addEnemy(w, 'becario', 116, 170);
  const other = addEnemy(w, 'becario', 175, 170);
  run(w, 12, [IN({ x: 1 })]);
  assert.equal(p.state, 'grab'); assert.equal(e.state, 'grabbed');
  tap(w, 0, 'golpe'); run(w, 4);
  assert.equal(e.hp, e.maxHp - HEROES.pepe.knee, 'rodillazo');
  tap(w, 0, 'golpe', { x: 1 });
  assert.equal(e.state, 'thrown');
  run(w, 40);
  assert.ok(other.hp < other.maxHp, 'el lanzado golpea al otro');
  assert.ok(['fall', 'down', 'rise'].includes(other.state));
});

test('T1.6 los jefes no se pueden agarrar', () => {
  const w = arena();
  const p = w.fighters[0]; p.x = 100; p.y = 170;
  addEnemy(w, 'jefeSeguridad', 121, 170);
  run(w, 20, [IN({ x: 1 })]);
  assert.notEqual(p.state, 'grab');
});

test('T1.7 especial: invulnerable, cuesta un 8 % y nunca deja por debajo de 1', () => {
  const w = arena();
  const p = w.fighters[0]; p.x = 100; p.y = 170; p.face = 1;
  const cost = Math.ceil(p.maxHp * SPECIAL_COST);
  tap(w, 0, 'especial');
  assert.equal(p.state, 'special');
  assert.equal(p.hp, p.maxHp - cost);
  const e = addEnemy(w, 'becario', 130, 170);
  e.ai.cd = 0; e.ai.hold = false; e.ai.token = p.id; p.tokens = 1;
  const hpBefore = p.hp;
  run(w, 20);
  assert.equal(p.hp, hpBefore, 'nadie le hace daño durante el especial');
  const w2 = arena(); const q = w2.fighters[0]; q.hp = 3;
  run(w2, 40); tap(w2, 0, 'especial');
  assert.equal(q.hp, 1);
  // Golpe + salto a la vez también lanza el especial
  const w3 = arena(); const r = w3.fighters[0];
  tick(w3, [IN({ golpe: true, salto: true })]);
  assert.equal(r.state, 'special');
});

test('T1.8 recibir daño: retroceso, caída, suelo y levantarse con 1 s de invulnerabilidad', () => {
  const w = arena();
  const p = w.fighters[0]; p.x = 150; p.y = 170;
  const e = addEnemy(w, 'guardia', 175, 170);   // su golpe tumba
  e.face = -1; e.ai.cd = 0; e.ai.hold = false; e.ai.token = p.id; p.tokens = 1;
  const states = new Set();
  for (let i = 0; i < 200 && !states.has('rise'); i++) { tick(w, []); states.add(p.state); }
  for (const s of ['fall', 'down', 'rise']) assert.ok(states.has(s), `pasa por ${s}`);
  run(w, 20);
  assert.ok(p.invul > RISE_INVUL_PLAYER - 25 && p.invul <= RISE_INVUL_PLAYER, `invulnerable al levantarse (${p.invul})`);
});
