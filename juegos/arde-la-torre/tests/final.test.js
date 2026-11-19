// T9.1–T9.3: 3 niveles con sub-jefe, batalla final cooperativa (F15) y rescate de compañeros (F16).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, tick } from '../src/sim/world.js';
import { LEVELS } from '../src/data/levels.js';
import { ampsFor } from '../src/sim/final.js';
import { W } from '../src/sim/constants.js';
import { IN } from './helpers.js';

const FINAL = LEVELS.length - 1;
const run = (w, n, inputs = []) => { const ev = []; for (let i = 0; i < n; i++) { tick(w, typeof inputs === 'function' ? inputs(i) : inputs); ev.push(...w.events); } return ev; };

function finalWorld(n = 1) {
  const w = createWorld({ seed: 3, levelIdx: FINAL, players: Array.from({ length: n }, (_, i) => ({ slot: i, hero: ['antonio', 'pepe', 'dani', 'jota'][i] })) });
  run(w, 40);                                   // el Presidente entra a los 30 ticks
  for (const p of w.fighters) p.invul = 0;
  const boss = w.fighters.find((f) => f.type === 'presidente');
  return { w, boss };
}

test('T9.1 tres niveles con 2 oleadas y un sub-jefe cada uno, y después la arena final', () => {
  assert.equal(LEVELS.length, 4);
  const subs = ['jefeSeguridad', 'recepcionista', 'director'];
  for (let i = 0; i < 3; i++) {
    const l = LEVELS[i];
    assert.equal(l.waves.length, 3, `${l.id}: 2 oleadas + sub-jefe`);
    assert.equal(l.waves[2].boss, subs[i]);
    assert.ok(!l.final);
  }
  const f = LEVELS[FINAL];
  assert.ok(f.final && f.arena);
  assert.equal(f.width, W, 'una sola pantalla');
  assert.deepEqual(f.waves.map((x) => x.boss), ['presidente', 'manager']);
  assert.ok(f.waves[1].surprise, 'el Manager llega por sorpresa');
});

import { ENEMIES } from '../src/sim/enemies.js';
import { botInput } from '../src/sim/bot.js';

test('T12.1 al vencer al Presidente aparece el Manager por sorpresa; al vencerlo, «¡A TOCAR!» y fin', () => {
  const m = ENEMIES.manager;
  assert.ok(m && m.boss);
  assert.ok(m.hp > ENEMIES.director.hp && m.hp < ENEMIES.presidente.hp, 'entre los subjefes y el Presidente');
  assert.ok(m.moves.shoot && m.moves.shoot.kind === 'contrato');
  const { w, boss } = finalWorld(2);
  boss.hp = 0; boss.state = 'dead'; boss.removed = true;
  const ev = run(w, 20);
  const s = ev.find((e) => e.type === 'surprise');
  assert.ok(s, 'cartel «¡SORPRESA!»');
  assert.match(s.line, /LISTOS/);
  assert.ok(!ev.some((e) => e.type === 'go'), 'sin «¡ADELANTE!» en la sorpresa');
  assert.equal(w.cleared, false, 'aún no hay concierto');
  run(w, 400);
  const mgr = w.fighters.find((f) => f.type === 'manager' && !f.removed);
  assert.ok(mgr, 'el Manager entra');
  mgr.hp = 1; mgr.invul = 0;
  const p = w.fighters.find((f) => f.team === 'p'); p.x = mgr.x - 20; p.y = mgr.y; p.face = 1;
  const ev2 = [];
  for (let i = 0; i < 600 && !w.cleared; i++) { ev2.push(...run(w, 1, [botInput(w, 0), botInput(w, 1)])); }
  assert.ok(ev2.some((e) => e.type === 'managerOk'), '«¡ESO ES! ¡A TOCAR!»');
  assert.ok(w.cleared, 'después, el concierto');
});

test('T9.2 amplificadores según jugadores: 2 · 3 · 4 · 4', () => {
  assert.deepEqual([1, 2, 3, 4].map(ampsFor), [2, 3, 4, 4]);
});

test('T9.2 fase 2: al bajar del 60 % sale el escudo (sin daño) y aparecen los amplificadores', () => {
  for (const n of [1, 2, 4]) {
    const { w, boss } = finalWorld(n);
    assert.ok(boss, 'el Presidente está en la arena');
    boss.hp = boss.maxHp * 0.59;
    const ev = run(w, 2);
    assert.ok(boss.shield, 'escudo activo');
    assert.ok(ev.some((e) => e.type === 'shield'));
    assert.equal(w.props.filter((p) => p.kind === 'amp').length, ampsFor(n));
    // golpe al jefe con escudo: no le hace daño
    const p = w.fighters.find((f) => f.team === 'p');
    p.x = boss.x - 22; p.y = boss.y; p.face = 1; boss.ai.hold = true;
    const hp = boss.hp;
    run(w, 2, [IN({ golpe: true })]); run(w, 20);
    assert.equal(boss.hp, hp);
  }
});

test('T9.2 tres golpes encienden un amplificador; con todos encendidos se rompe el escudo y queda aturdido 4 s', () => {
  const { w, boss } = finalWorld(1);
  boss.hp = boss.maxHp * 0.59; run(w, 2);
  boss.ai.hold = true; boss.x = 200; boss.y = 170;
  const p = w.fighters.find((f) => f.team === 'p');
  const amps = w.props.filter((a) => a.kind === 'amp');
  for (const amp of amps) {
    for (let k = 0; k < 3; k++) {
      p.x = amp.x - 18; p.y = amp.y; p.face = 1; p.state = 'idle'; p.combo = -1;
      run(w, 1, [IN({ golpe: true })]); run(w, 30);
    }
    assert.ok(amp.lit, `amplificador en x=${amp.x} encendido`);
  }
  run(w, 2);
  assert.equal(boss.shield, false);
  assert.equal(boss.state, 'stun');
  // aturdido: recibe golpes sin defenderse ni salir del aturdimiento
  const hp = boss.hp;
  p.x = boss.x - 22; p.y = boss.y; p.face = 1; p.state = 'idle';
  run(w, 1, [IN({ golpe: true })]); run(w, 12);
  assert.ok(boss.hp < hp); assert.equal(boss.state, 'stun');
  run(w, 240);
  assert.notEqual(boss.state, 'stun', 'el aturdimiento dura unos 4 s');
});

test('T9.2 fase 3: por debajo del 30 % se enfada (más rápido)', () => {
  const { w, boss } = finalWorld(1);
  const speed = boss.def.speed;
  boss.hp = boss.maxHp * 0.59; run(w, 2);
  for (const a of w.props.filter((x) => x.kind === 'amp')) a.lit = true;
  run(w, 2);
  boss.hp = boss.maxHp * 0.29;
  const ev = run(w, 2);
  assert.ok(ev.some((e) => e.type === 'enraged'));
  assert.ok(boss.def.speed > speed);
});

test('T9.3 rescate: un compañero que mantiene GOLPE al lado lo levanta sin gastar vida; si nadie lo hace, la pierde', () => {
  const { w, boss } = finalWorld(2);
  boss.ai.hold = true; boss.x = 340;
  const [a, b] = w.fighters.filter((f) => f.team === 'p');
  a.hp = 0; a.state = 'dead'; a.t = 0; a.x = 100; a.y = 170;
  b.x = 112; b.y = 170;
  run(w, 60, () => [undefined, IN({ golpe: true })]);   // 20 ticks en el suelo + 0,5 s manteniendo GOLPE
  assert.equal(a.lives, 3, 'no pierde vida');
  assert.ok(a.hp > 0 && a.state !== 'dead');
  assert.equal(Math.round(a.hp), Math.round(a.maxHp * 0.4));
  // sin rescate
  a.hp = 0; a.state = 'dead'; a.t = 0; b.x = 300;
  run(w, 200);
  assert.equal(a.lives, 2);
});

test('T9.3 el rescate solo existe en la batalla final', () => {
  const w = createWorld({ seed: 1, levelIdx: 0, players: [{ slot: 0, hero: 'antonio' }, { slot: 1, hero: 'pepe' }] });
  const [a, b] = w.fighters;
  a.hp = 0; a.state = 'dead'; a.t = 0; b.x = a.x + 10; b.y = a.y;
  run(w, 70, () => [undefined, IN({ golpe: true })]);
  assert.equal(a.lives, 2);
});
