// v5 · Mundo 1 «Carmesí»: Rumor Volador, Micrófono Traidor y jefe Cámara Flash-Bot (spec §3.0d).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ENEMY, BOSS, OVATION, P } from '../src/game/constants.js';
import { createGame, stepGame } from '../src/game/game.js';
import { beamRect, hitBoss } from '../src/game/boss.js';

const IDLE = { left: false, right: false, jump: false, mic: false, special: false };
const run = (g, n, btn = IDLE) => { for (let i = 0; i < n; i++) stepGame(g, btn); };
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const row = (s, n = 30) => s.padEnd(n, '.');
// Combate directo: la cinemática de entrada tiene sus propios tests (v5-intro.test.js).
const fightGame = (m) => { const g = createGame(m); g.intro = null; return g; };

describe('Rumor Volador (C5)', () => {
  test('planea en onda sin caerse cuando Pepe no está debajo', () => {
    const g = createGame([row('...................V'), row(''), row(''), row(''), row(''), row('.P'), '#'.repeat(30)].join('\n'));
    const e = g.enemies[0], x0 = e.x;
    let minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < 180; i++) { stepGame(g, IDLE); minY = Math.min(minY, e.y); maxY = Math.max(maxY, e.y); }
    assert.equal(e.state, 'fly');
    assert.ok(maxY - e.home.y <= ENEMY.rumor.amp + 0.5 && e.home.y - minY <= ENEMY.rumor.amp + 0.5);
    assert.notEqual(e.x, x0, 'se desplaza');
  });

  test('cae en picado si Pepe pasa por debajo y luego vuelve a subir', () => {
    const g = createGame([row('.V'), row(''), row(''), row(''), row(''), row('.P'), '#'.repeat(30)].join('\n'));
    const e = g.enemies[0];
    g.invuln = 99;
    const states = new Set();
    for (let i = 0; i < 240; i++) { stepGame(g, IDLE); states.add(e.state); }
    assert.ok(states.has('dive') && states.has('climb'), [...states].join(','));
  });

  test('se vence pisándolo', () => {
    const g = createGame([row('.P'), row(''), row('.V'), row(''), row(''), '#'.repeat(30)].join('\n'));
    g.enemies[0].vx = 0;
    run(g, 40);
    assert.equal(g.enemies[0].alive, false);
  });
});

describe('Micrófono Traidor (C5)', () => {
  test('flota, apunta y se lanza hacia donde estaba Pepe; luego vuelve a su sitio', () => {
    const g = createGame([row(''), row(''), row('.P......M'), '#'.repeat(30)].join('\n'));
    const e = g.enemies[0];
    g.invuln = 99;
    const seen = [];
    let lungeVx = 0;
    for (let i = 0; i < 300; i++) {
      stepGame(g, IDLE);
      if (seen.at(-1) !== e.state) seen.push(e.state);
      if (e.state === 'lunge') lungeVx = e.vx;
    }
    assert.deepEqual(seen.slice(0, 4), ['aim', 'lunge', 'rest', 'return']);
    assert.ok(lungeVx < 0, 'se lanza hacia Pepe (a la izquierda)');
    assert.ok(seen.includes('hover'));
  });

  test('no te ataca si estás lejos', () => {
    const g = createGame([row('', 40), row('', 40), row('.P', 40).slice(0, 30) + 'M'.padEnd(10, '.'), '#'.repeat(40)].join('\n'));
    run(g, 120);
    assert.equal(g.enemies[0].state, 'hover');
  });

  test('si te alcanza en la embestida, te quita un corazón', () => {
    const g = createGame([row(''), row(''), row('.P.....M'), '#'.repeat(30)].join('\n'));
    run(g, 120);
    assert.ok(g.hearts < 3);
  });
});

const ARENA = [row(''), row(''), row(''), row(''), row(''), row('.P.................B'), '#'.repeat(30)].join('\n');

describe('jefe Cámara Flash-Bot (C6)', () => {
  test('el nivel con «B» tiene jefe con 6 golpes', () => {
    const g = fightGame(ARENA);
    assert.ok(g.boss);
    assert.equal(g.boss.hp, BOSS.hp);
  });

  test('ciclo: camina → carga → rayo → expuesto → camina', () => {
    const g = fightGame(ARENA);
    g.hearts = 99;
    const seen = [];
    for (let i = 0; i < 60 * 12; i++) { stepGame(g, IDLE); if (seen.at(-1) !== g.boss.state) seen.push(g.boss.state); }
    assert.deepEqual(seen.slice(0, 5), ['walk', 'charge', 'beam', 'exposed', 'walk']);
  });

  test('rayo bajo: alcanza a Pepe de pie y no a Pepe saltando; el alto, al revés', () => {
    const g = fightGame(ARENA);
    const b = g.boss, p = g.player;
    run(g, 2);
    const standing = { ...p };
    const jumping = { ...p, y: p.y - 34 };
    b.beamKind = 'low';
    assert.ok(overlap(beamRect(g, b), standing));
    assert.ok(!overlap(beamRect(g, b), jumping));
    b.beamKind = 'high';
    assert.ok(!overlap(beamRect(g, b), standing));
    assert.ok(overlap(beamRect(g, b), jumping));
  });

  test('el rayo quita un corazón a Pepe si no lo esquiva', () => {
    const g = fightGame(ARENA);
    run(g, 60 * 4);
    assert.ok(g.hearts < 3);
  });

  test('solo le hace daño el micrófono cuando el lente está expuesto', () => {
    const g = fightGame(ARENA);
    const b = g.boss;
    b.state = 'walk';
    assert.equal(hitBoss(g, b), false);
    assert.equal(b.hp, BOSS.hp);
    b.state = 'exposed';
    assert.equal(hitBoss(g, b), true);
    assert.equal(b.hp, BOSS.hp - 1);
  });

  test('con 3 golpes o menos entra en fase 2: más rápido y alterna rayo alto y bajo', () => {
    const g = fightGame(ARENA);
    const b = g.boss;
    g.hearts = 99;
    b.hp = BOSS.phase2 + 1; b.state = 'exposed';
    hitBoss(g, b);
    assert.equal(b.phase, 2);
    const kinds = [];
    for (let i = 0; i < 60 * 14; i++) { stepGame(g, IDLE); if (b.state === 'beam' && kinds.at(-1)?.t !== b.cycle) kinds.push({ t: b.cycle, k: b.beamKind }); }
    const ks = kinds.map((k) => k.k);
    assert.ok(ks.includes('high') && ks.includes('low'), ks.join(','));
  });

  test('el Solo de guitarra le quita un golpe aunque no esté expuesto', () => {
    const g = fightGame([row(''), row(''), row(''), row(''), row(''), row('.P.......B'), '#'.repeat(30)].join('\n'));
    g.ovacion = OVATION.max;
    stepGame(g, { ...IDLE, special: true });
    assert.equal(g.boss.hp, BOSS.hp - 1);
  });

  test('al vencerlo deja el Disco de Oro; tocarlo completa el mundo', () => {
    const g = fightGame(ARENA);
    const b = g.boss;
    b.hp = 1; b.state = 'exposed';
    hitBoss(g, b);
    assert.equal(b.alive, false);
    assert.ok(g.disco);
    run(g, 30);
    g.player.x = g.disco.x - P.w / 2; g.player.y = g.disco.y - P.h / 2;
    run(g, 2);
    assert.equal(g.status, 'won');
  });

  test('tocarlo de lado quita un corazón', () => {
    const g = fightGame([row(''), row(''), row(''), row(''), row(''), row('.....P.B'), '#'.repeat(30)].join('\n'));
    run(g, 60, { ...IDLE, right: true });
    assert.ok(g.hearts < 3);
  });
});

