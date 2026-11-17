// v11 · Enemigos de Alba (spec §3.0f Q v11; tarea AL12): Reloj despertador `r` y Carta del pasado `v`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, stepGame } from '../src/game/game.js';
import { ENEMY } from '../src/game/constants.js';

const NONE = { left: false, right: false, jump: false, mic: false, special: false };
const make = (rows) => createGame(rows.join('\n'), {}, { alba: { start: 0 } });
const FLOOR = '##############################';

test('el Reloj despertador camina y brinca cada 1,6 s, sonando', () => {
  const g = make(['..............................', '..............................', '..P.................r.........', FLOOR]);
  const e = g.enemies[0];
  assert.equal(e.kind, 'reloj');
  let hops = 0; const x0 = e.x;
  for (let i = 0; i < 60 * 3.4; i++) { stepGame(g, NONE); if (g.events.includes('tic')) hops++; }
  assert.equal(hops, 2, `brincos ${hops}`);
  assert.ok(Math.abs(e.x - x0) > 20, 'camina');
  assert.ok(ENEMY.reloj.hop === 1.6);
});

test('la Carta del pasado vuela y se lanza en picada al pasar debajo', () => {
  const g = make(['..........v...................', '..............................', '..............................', '..........P...................', FLOOR]);
  const e = g.enemies[0];
  assert.equal(e.kind, 'carta');
  let dive = false;
  for (let i = 0; i < 60; i++) { stepGame(g, NONE); if (e.state === 'dive') dive = true; }
  assert.ok(dive);
});

test('el micrófono los vence; tocarlos quita 1 corazón', () => {
  const g = make(['..............................', '..............................', '..P....r......................', FLOOR]);
  for (let i = 0; i < 40; i++) stepGame(g, { ...NONE, mic: i % 10 < 5 });
  assert.equal(g.enemies[0].alive, false);
  const h = make(['..............................', '..............................', '..P.r.........................', FLOOR]);
  for (let i = 0; i < 90 && h.hearts === 3; i++) stepGame(h, NONE);
  assert.equal(h.hearts, 2);
});
