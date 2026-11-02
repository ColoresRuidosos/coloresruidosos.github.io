// v5 · Cinemática de entrada del jefe (spec §3.0d, C11).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { INTRO, BOSS } from '../src/game/constants.js';
import { createGame, stepGame } from '../src/game/game.js';

const IDLE = { left: false, right: false, jump: false, mic: false, special: false };
const row = (s, n = 30) => s.padEnd(n, '.');
const ARENA = [row(''), row(''), row(''), row(''), row(''), row('.P.................B'), '#'.repeat(30)].join('\n');
const collect = (g, n, btn = IDLE) => { const ev = []; for (let i = 0; i < n; i++) { stepGame(g, btn); ev.push(...g.events); } return ev; };

describe('cinemática del jefe (C11)', () => {
  test('solo los niveles con jefe empiezan con cinemática', () => {
    assert.ok(createGame(ARENA).intro);
    assert.equal(createGame('..........\n.P........\n##########').intro, null);
  });

  test('Pepe entra solo: los botones no responden y avanza hacia el escenario', () => {
    const g = createGame(ARENA);
    const x0 = g.player.x;
    collect(g, 60, { ...IDLE, left: true });
    assert.ok(g.player.x > x0 + 20, `x0=${x0} x=${g.player.x}`);
  });

  test('el jefe no ataca, no hay daño y el cronómetro no corre', () => {
    const g = createGame(ARENA);
    const ev = collect(g, Math.floor(INTRO.total * 60) - 2);
    assert.ok(g.intro, 'sigue la cinemática');
    assert.equal(g.time, 0);
    assert.equal(g.hearts, 3);
    assert.ok(!ev.includes('charge') && !ev.includes('beam'));
    assert.equal(g.boss.hp, BOSS.hp);
  });

  test('el jefe cae del techo («bossland») y al final empieza el combate («fight»)', () => {
    const g = createGame(ARENA);
    const ev = collect(g, Math.ceil(INTRO.total * 60) + 2);
    assert.equal(ev.filter((e) => e === 'bossland').length, 1);
    assert.equal(ev.filter((e) => e === 'fight').length, 1);
    assert.equal(g.intro, null);
    assert.ok(g.time > 0);
  });

  test('se puede saltar con A después de medio segundo (antes no)', () => {
    const g = createGame(ARENA);
    collect(g, 10);
    collect(g, 1, { ...IDLE, jump: true });
    assert.ok(g.intro, 'demasiado pronto para saltarla');
    collect(g, 30, IDLE);
    const ev = collect(g, 1, { ...IDLE, jump: true });
    assert.equal(g.intro, null);
    assert.ok(ev.includes('fight'));
    assert.ok(g.boss.y + g.boss.h <= 6 * 16 + 0.5, 'el jefe ya está en el suelo');
  });
});
