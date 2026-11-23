// Fase 2 · La partida: zanahorias, Hyperpop, abrazos, vidas, bonus y récord (spec F2–F4, F6, F7, F9, F10, F13).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMatch, stepMatch, cara, medallas } from '../src/game/match.js';
import { place, tileOf } from '../src/game/actor.js';
import { TILE, READY_STEPS, DYING_STEPS, CLEAR_STEPS, hyperSteps, HUG_POINTS, BONUS_STEPS, MAX_LIVES } from '../src/data/tuning.js';

const play = (m) => { m.mode = 'play'; m.modeT = 0; return m; };
const run = (m, n, dir = null) => { for (let i = 0; i < n; i++) stepMatch(m, { dir }); };
const enemy = (m, tipo) => m.enemies.find((e) => e.tipo === tipo);
const park = (m) => m.enemies.forEach((e) => { e.estado = 'casa'; e.releaseAt = Infinity; place(e, m.grid.houseCenter.x, m.grid.houseCenter.y); });

test('empieza con «¡Lista, Bunny!», 3 vidas y todo quieto', () => {
  const m = createMatch({ seed: 1 });
  assert.equal(m.mode, 'ready'); assert.equal(m.lives, 3); assert.equal(m.nivel, 0);
  const x = m.bunny.x; run(m, READY_STEPS - 1); assert.equal(m.bunny.x, x);
  run(m, 2); assert.equal(m.mode, 'play');
});

test('zanahoria +10; la cara del HUD mejora con el porcentaje (F2, K1)', () => {
  const m = play(createMatch({ seed: 1 })); park(m);
  const total = m.total;
  run(m, 40, 'left');
  assert.ok(m.score >= 10 && m.score % 10 === 0);
  assert.equal(m.restantes, total - m.score / 10);
  assert.deepEqual([0, 0.24, 0.25, 0.5, 0.74, 0.99, 1].map(cara), [0, 0, 1, 2, 2, 3, 4]);
});

test('Zanahoria Hyperpop: +50, enemigos tristes y abrazos 200 → 1,600 (F3, F4)', () => {
  const m = play(createMatch({ seed: 1 }));
  const [px, py] = m.grid.power[0];
  place(m.bunny, px, py); m.bunny.dir = null;
  m.enemies.forEach((e) => { e.estado = 'activo'; place(e, 10, 10); e.dir = 'left'; });
  const before = m.score;
  run(m, 1);
  assert.equal(m.score, before + 50);
  assert.equal(m.hyper, hyperSteps(0));
  assert.ok(m.enemies.every((e) => e.triste));
  assert.ok(m.events.some((e) => e.type === 'hyper'));
  // Abrazos encadenados: ponemos a cada enemigo encima del Bunny
  const pts = [];
  for (const e of m.enemies) { place(e, ...tileOf(m.bunny)); const s = m.score; run(m, 1); pts.push(m.score - s); assert.equal(e.estado, 'nube'); }
  assert.deepEqual(pts, HUG_POINTS);
});

test('la Hyperpop dura menos en cada nivel (mínimo 3 s)', () => {
  assert.equal(hyperSteps(0), 360); assert.equal(hyperSteps(1), 300); assert.equal(hyperSteps(9), 180);
});

test('tocar a un enemigo normal: −1 vida, cuclillas y vuelve a empezar; sin vidas, fin (F6)', () => {
  const m = play(createMatch({ seed: 1 }));
  const c = enemy(m, 'coronado'); place(c, ...tileOf(m.bunny));
  run(m, 1);
  assert.equal(m.lives, 2); assert.equal(m.mode, 'dying');
  run(m, DYING_STEPS); assert.equal(m.mode, 'ready');
  assert.deepEqual(tileOf(m.bunny), [m.grid.start.x, m.grid.start.y]);
  m.lives = 1; play(m); place(enemy(m, 'coronado'), ...tileOf(m.bunny)); run(m, 1 + DYING_STEPS);
  assert.equal(m.mode, 'over'); assert.ok(m.events.some((e) => e.type === 'over') || m.over);
});

test('se detecta el choque cuando se cruzan en sentidos opuestos', () => {
  const m = play(createMatch({ seed: 1 })); park(m);
  const c = enemy(m, 'coronado'); c.estado = 'activo';
  // Fila 20: el Bunny en (8,20) hacia la derecha y el Coronado en (9,20) hacia la izquierda
  place(m.bunny, 8, 20); m.bunny.dir = 'right'; m.bunny.x += 100;
  place(c, 9, 20); c.dir = 'left'; c.x -= 100;
  run(m, 3, 'right');
  assert.equal(m.mode, 'dying');
});

test('última zanahoria y choque en el mismo cuadro: gana el Bunny (§4.3)', () => {
  const m = play(createMatch({ seed: 1 })); park(m);
  m.items.fill(0); const [x, y] = [8, 20]; m.items[y * m.grid.w + x] = 1; m.restantes = 1;
  place(m.bunny, x, y); m.bunny.dir = null;
  const c = enemy(m, 'coronado'); c.estado = 'activo'; place(c, x, y);
  run(m, 1);
  assert.equal(m.mode, 'clear'); assert.equal(m.lives, 3);
  run(m, CLEAR_STEPS);
  assert.equal(m.nivel, 1); assert.equal(m.escenario, 1); assert.equal(m.mode, 'ready');
});

test('se acaba la Hyperpop justo al tocar: gana el enemigo (§4.3)', () => {
  const m = play(createMatch({ seed: 1 })); park(m);
  const c = enemy(m, 'coronado'); c.estado = 'activo'; c.triste = true; m.hyper = 1;
  place(c, ...tileOf(m.bunny)); m.bunny.dir = null;
  run(m, 1);
  assert.equal(m.mode, 'dying');
});

test('bonus al 30 % y al 70 % durante 9 s (F7)', () => {
  const m = play(createMatch({ seed: 1 })); park(m);
  const n30 = Math.ceil(m.total * 0.3);
  m.restantes = m.total - n30 + 1;
  place(m.bunny, 8, 20); m.bunny.dir = null; m.items[20 * m.grid.w + 8] = 1;
  run(m, 1);
  assert.equal(m.bonus.t, BONUS_STEPS - 0);
  run(m, BONUS_STEPS); assert.equal(m.bonus.t, 0);
});

test('«¿Un besito más?» da +1 vida desde el nivel 2, máx. 5 (F9)', () => {
  const m0 = play(createMatch({ seed: 1 })); assert.equal(m0.heartItem, false);
  const m = play(createMatch({ seed: 1, nivel: 1 })); park(m);
  assert.equal(m.heartItem, true);
  place(m.bunny, m.grid.heart.x, m.grid.heart.y); m.bunny.dir = null; m.lives = MAX_LIVES;
  run(m, 1);
  assert.equal(m.lives, MAX_LIVES); assert.equal(m.heartItem, false);
});

test('«Siento que desaparezco»: 5 s sin choques, desde el nivel 3 (F10)', () => {
  const m = play(createMatch({ seed: 1, nivel: 2 })); park(m);
  place(m.bunny, m.grid.vanish.x, m.grid.vanish.y); m.bunny.dir = null;
  run(m, 1);
  assert.ok(m.vanish > 0);
  const c = enemy(m, 'coronado'); c.estado = 'activo'; place(c, ...tileOf(m.bunny));
  run(m, 1);
  assert.equal(m.mode, 'play'); assert.equal(m.lives, 3);
});

test('récord y medallas 3,500 / 17,000 / 52,600 (F13, K15)', () => {
  assert.deepEqual(medallas(3499).map((x) => x.pts), []);
  assert.deepEqual(medallas(17000).map((x) => x.pts), [3500, 17000]);
  assert.equal(medallas(60000).length, 3);
  const m = play(createMatch({ seed: 1, record: 5 })); park(m);
  run(m, 30, 'left');
  assert.equal(m.record, Math.max(5, m.score));
});
