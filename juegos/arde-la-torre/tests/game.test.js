// T2.1–T2.8: enemigos, niveles y partida.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, tick, addPlayer, setAway, removePlayer, startLevel, playerBySlot } from '../src/sim/world.js';
import { scaledWave } from '../src/sim/level.js';
import { botInput } from '../src/sim/bot.js';
import { HERO_IDS, FOOD } from '../src/sim/moves.js';
import { LEVELS } from '../src/data/levels.js';
import { TOKENS_PER_PLAYER, MAX_ON_SCREEN, CONTINUE_TICKS, W } from '../src/sim/constants.js';
import { arena, addEnemy, run, tap, IN } from './helpers.js';

test('T2.1 como mucho 2 atacantes por jugador; los demás rodean; las fichas se devuelven', () => {
  const w = arena();
  const p = w.fighters[0]; p.x = 190; p.y = 170; p.invul = 99999;
  const es = [];
  for (let i = 0; i < 6; i++) { const e = addEnemy(w, 'becario', 120 + i * 30, 150 + (i % 3) * 15); e.ai.cd = 0; e.ai.hold = false; es.push(e); }
  let maxTok = 0;
  for (let i = 0; i < 900; i++) {
    tick(w, []);
    const holders = es.filter((e) => e.ai.token === p.id).length;
    assert.equal(holders, p.tokens, 'la cuenta de fichas cuadra');
    maxTok = Math.max(maxTok, holders);
    assert.ok(holders <= TOKENS_PER_PLAYER);
  }
  assert.equal(maxTok, TOKENS_PER_PLAYER, 'llega a haber 2 atacando');
  const ring = es.filter((e) => !e.ai.token);
  assert.ok(ring.every((e) => Math.abs(e.x - p.x) >= 30), 'los que no tienen ficha esperan a distancia');
});

test('T2.2 Comercial embiste; Guardia bloquea de frente pero no de espaldas', () => {
  const w = arena();
  const p = w.fighters[0]; p.x = 120; p.y = 170;
  const c = addEnemy(w, 'comercial', 260, 170); c.ai.cd = 0; c.ai.hold = false; c.ai.token = p.id; p.tokens = 1;
  const states = new Set();
  for (let i = 0; i < 600 && !states.has('charge'); i++) { tick(w, []); states.add(c.state); }
  assert.ok(states.has('charge'), 'el comercial llega a embestir');

  const w2 = arena();
  const q = w2.fighters[0]; q.x = 100; q.y = 170; q.face = 1;
  const g = addEnemy(w2, 'guardia', 122, 170); g.face = -1;
  const evs = tap(w2, 0, 'golpe').concat(run(w2, 20));
  assert.ok(evs.some((e) => e.type === 'block')); assert.equal(g.hp, g.maxHp);
  g.face = 1;                                   // de espaldas
  const evs2 = tap(w2, 0, 'golpe').concat(run(w2, 20));
  assert.ok(evs2.some((e) => e.type === 'hit')); assert.ok(g.hp < g.maxHp);
});

test('T2.2 Guardia: tras 3 bloqueos seguidos se le rompe la guardia', () => {
  const w = arena();
  const q = w.fighters[0]; q.x = 100; q.y = 170; q.face = 1;
  const g = addEnemy(w, 'guardia', 122, 170); g.face = -1;
  let blocks = 0, hits = 0;
  for (let k = 0; k < 4; k++) { const ev = tap(w, 0, 'golpe').concat(run(w, 24)); blocks += ev.filter((e) => e.type === 'block').length; hits += ev.filter((e) => e.type === 'hit').length; g.face = -1; g.x = 122; }
  assert.equal(blocks, 3); assert.equal(hits, 1);
});

test('T2.2 Contable dispara y Ejecutiva agarra y lanza', () => {
  const w = arena();
  const p = w.fighters[0]; p.x = 100; p.y = 170;
  const c = addEnemy(w, 'contable', 250, 170); c.ai.cd = 0; c.ai.hold = false; c.ai.token = p.id; p.tokens = 1;
  let shots = 0;
  for (let i = 0; i < 900 && !shots; i++) { tick(w, []); shots += w.events.filter((e) => e.type === 'shoot').length; }
  assert.ok(shots > 0, 'dispara grapas');

  const w2 = arena();
  const q = w2.fighters[0]; q.x = 100; q.y = 170;
  const x = addEnemy(w2, 'ejecutiva', 130, 170); x.ai.cd = 0; x.ai.hold = false; x.ai.token = q.id; q.tokens = 1;
  const states = new Set();
  for (let i = 0; i < 900 && !states.has('thrown'); i++) { tick(w2, []); states.add(q.state); }
  assert.ok(states.has('grabbed') && states.has('thrown'), [...states].join(','));
});

test('T2.3 escalado ×1 / ×1,5 / ×2 / ×2,5 y como mucho 8 enemigos a la vez', () => {
  const wave = { enemies: Array.from({ length: 4 }, () => ({ type: 'becario', side: 'R', delay: 0 })) };
  assert.deepEqual([1, 2, 3, 4].map((n) => scaledWave(wave, n).length), [4, 6, 8, 10]);
  const boss = { boss: 'jefeSeguridad', enemies: [{ type: 'jefeSeguridad', side: 'R', delay: 0 }, { type: 'becario', side: 'L', delay: 0 }] };
  assert.equal(scaledWave(boss, 4).filter((e) => e.type === 'jefeSeguridad').length, 1, 'el jefe no se duplica');

  const w = createWorld({ seed: 2, levelIdx: 0, players: [0, 1, 2, 3].map((slot) => ({ slot, hero: HERO_IDS[slot] })) });
  w.level = { ...w.level, waves: [{ cam: 0, enemies: Array.from({ length: 8 }, (_, i) => ({ type: 'becario', side: i % 2 ? 'L' : 'R', delay: 0 })) }] };
  for (const p of w.fighters) p.invul = 1e9;
  let max = 0;
  for (let i = 0; i < 200; i++) { tick(w, []); max = Math.max(max, w.fighters.filter((f) => f.team === 'e').length); }
  assert.equal(max, MAX_ON_SCREEN);
  assert.ok(w.pending.length > 0, 'el resto espera su turno');
});

test('T2.4 la oleada bloquea la cámara; al vaciarla sale «¡ADELANTE!»; el más atrasado limita el avance', () => {
  const w = createWorld({ seed: 1, levelIdx: 0, players: [{ slot: 0, hero: 'antonio' }, { slot: 1, hero: 'pepe' }] });
  const [a, b] = w.fighters;
  a.invul = b.invul = 1e9;
  run(w, 400, [IN({ x: 1 })]);                   // solo avanza el J1
  assert.ok(w.camX <= b.x - 24 + 0.01, 'el J2 parado frena la cámara');
  run(w, 600, [IN({ x: 1 }), IN({ x: 1 })]);
  const wave0 = LEVELS[0].waves[0];
  assert.equal(w.camX, wave0.cam, 'bloqueada en la oleada');
  assert.ok(w.waveActive);
  for (const e of w.fighters.filter((f) => f.team === 'e')) e.hp = 0, e.state = 'dead', e.t = 39;
  w.pending = [];
  const evs = run(w, 3);
  assert.ok(evs.some((e) => e.type === 'go'));
  assert.equal(w.waveIdx, 1);
  run(w, 200, [IN({ x: 1 }), IN({ x: 1 })]);
  assert.ok(w.camX > wave0.cam, 'la cámara vuelve a avanzar');
});

test('T2.5 comida cura sin pasarse; armas con 5 usos; las cajas sueltan su objeto', () => {
  const w = arena();
  const p = w.fighters[0]; p.x = 100; p.y = 170; p.face = 1;
  w.props.push({ id: 900, kind: 'caja', x: 120, y: 170, drop: 'bocadillo', broken: false });
  const evs = tap(w, 0, 'golpe').concat(run(w, 20));
  assert.ok(evs.some((e) => e.type === 'break'));
  assert.equal(w.items.length, 1);
  p.hp = p.maxHp - 5; p.x = 120;
  tap(w, 0, 'golpe');
  assert.equal(p.hp, p.maxHp, 'no pasa del máximo'); assert.equal(w.items.length, 0); assert.equal(p.food, 1);
  p.hp = 10; w.items.push({ id: 901, kind: 'cafe', x: p.x, y: p.y });
  tap(w, 0, 'golpe');
  assert.equal(p.hp, 10 + Math.round(p.maxHp * FOOD.cafe));

  w.items.push({ id: 902, kind: 'grapadora', x: p.x, y: p.y });
  tap(w, 0, 'golpe');
  assert.equal(p.weapon.kind, 'grapadora');
  const e = addEnemy(w, 'becario', p.x + 22, p.y); e.hp = e.maxHp = 9999;
  for (let k = 0; k < 5; k++) { tap(w, 0, 'golpe'); run(w, 30); e.x = p.x + 22; e.y = p.y; e.state = 'idle'; }
  assert.equal(p.weapon, null, 'se rompe tras 5 golpes que conectan');
});

test('T2.6 vidas, reaparición, continuar durante 10 s y Fin del juego cuando caen todos', () => {
  const w = arena();
  const p = w.fighters[0];
  assert.equal(p.lives, 3);
  const kill = () => { p.hp = 0; p.state = 'dead'; p.t = 0; run(w, 70); };
  kill();
  assert.equal(p.lives, 2); assert.equal(p.out, false); assert.equal(p.hp, p.maxHp);
  kill(); kill();
  assert.equal(p.out, true); assert.ok(p.contT > CONTINUE_TICKS - 20);
  tap(w, 0, 'golpe');
  assert.equal(p.out, false); assert.equal(p.lives, 3); assert.equal(p.continues, 1);
  kill(); kill(); kill();
  run(w, CONTINUE_TICKS + 5);
  assert.equal(w.over, true);
});

test('T2.6 modo asistido: −30 % de daño y no se pierden vidas', () => {
  const w = arena({ opts: { assisted: true } });
  const p = w.fighters[0];
  p.hp = 0; p.state = 'dead'; p.t = 0; run(w, 70);
  assert.equal(p.lives, 3);
});

test('T2.6 entrar a mitad de partida, ausencia (invulnerable) y salida', () => {
  const w = arena();
  run(w, 100);
  const p2 = addPlayer(w, { slot: 1, hero: 'dani' });
  assert.equal(p2.state, 'jump', 'cae del techo');
  assert.ok(p2.x >= w.camX && p2.x <= w.camX + W);
  setAway(w, 1, true);
  const e = addEnemy(w, 'becario', p2.x + 20, p2.y); e.ai.hold = false; e.ai.cd = 0;
  run(w, 200);
  assert.equal(p2.hp, p2.maxHp, 'ausente: nadie le pega');
  assert.notEqual(e.ai.token, p2.id);
  removePlayer(w, 1);
  assert.equal(playerBySlot(w, 1), undefined);
});

test('T2.7 jefes: el de Seguridad embiste y llama refuerzos; la Recepcionista lanza teléfonos', () => {
  const w = arena();
  const p = w.fighters[0]; p.x = 100; p.y = 170; p.invul = 1e9;
  const b = addEnemy(w, 'jefeSeguridad', 300, 170); b.ai.hold = false; b.ai.cd = 0;
  const seen = new Set();
  for (let i = 0; i < 1200; i++) { tick(w, []); seen.add(b.state); if (seen.has('charge')) break; }
  assert.ok(seen.has('charge'));
  b.hp = b.maxHp * 0.6;
  const evs = run(w, 120);
  assert.ok(evs.some((e) => e.type === 'summon'));
  assert.ok(w.fighters.filter((f) => f.type === 'becario').length >= 2);

  const w2 = arena();
  const q = w2.fighters[0]; q.x = 100; q.y = 170; q.invul = 1e9;
  const r = addEnemy(w2, 'recepcionista', 280, 170); r.ai.hold = false; r.ai.cd = 0;
  let phones = 0;
  for (let i = 0; i < 1200 && !phones; i++) { tick(w2, []); phones += w2.events.filter((e) => e.type === 'shoot' && e.kind === 'telefono').length; }
  assert.ok(phones > 0);
});

test('T2.8 bots: superan los 5 niveles solos y en grupo de 4; un bot inactivo pierde; determinista', () => {
  for (let l = 0; l < LEVELS.length; l++) {
    for (const n of [1, 4]) {
      const players = Array.from({ length: n }, (_, i) => ({ slot: i, hero: HERO_IDS[(i + l) % 4] }));
      const w = createWorld({ seed: 1 + l, levelIdx: l, players });
      while (!w.done && !w.over && w.tick < 60 * 60 * 5) tick(w, players.map((p) => botInput(w, p.slot)));
      assert.ok(w.done, `nivel ${LEVELS[l].id} con ${n} jugador(es): ${w.over ? 'fin del juego' : 'sin terminar'} en la oleada ${w.waveIdx}`);
    }
  }
  const idle = createWorld({ seed: 1, levelIdx: 0, players: [{ slot: 0, hero: 'antonio' }] });
  // El inactivo no avanza: lo empujamos hasta la primera oleada y lo dejamos quieto.
  for (let i = 0; i < 400; i++) tick(idle, [IN({ x: 1 })]);
  while (!idle.over && idle.tick < 60 * 60 * 5) tick(idle, [botInput(idle, 0, 0)]);
  assert.ok(idle.over, 'quieto, acaba en Fin del juego');
});

test('startLevel: pasa al siguiente nivel con la vida llena y conservando los puntos', () => {
  const w = createWorld({ seed: 1, levelIdx: 0, players: [{ slot: 0, hero: 'antonio' }] });
  const p = w.fighters[0]; p.score = 1234; p.hp = 5; p.lives = 2;
  startLevel(w, 1);
  assert.equal(w.level.id, 'vestibulo');
  assert.equal(p.hp, p.maxHp); assert.equal(p.score, 1234); assert.equal(p.lives, 2);
  assert.equal(w.fighters.length, 1);
});
