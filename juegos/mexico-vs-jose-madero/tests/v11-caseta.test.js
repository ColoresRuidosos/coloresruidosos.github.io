// v11 · Caseta `g` del Tiro de frases y reja `|` de la feria (spec §3.0f Q v11; tarea AL14).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, stepGame } from '../src/game/game.js';
import { ALBA } from '../src/game/constants.js';

const NONE = { left: false, right: false, jump: false, mic: false, special: false };
const run = (g, secs, btn = NONE) => { const ev = []; for (let i = 0; i < Math.round(secs * 60); i++) { stepGame(g, btn); ev.push(...g.events); } return ev; };
const ROWS = ['..............................', '..............|...............', '..............|...............', '..P.....g.....|.......r.......', '##############################'];
const make = () => createGame(ROWS.join('\n'), {}, { alba: { start: 4 } });
const atBooth = (g) => { g.player.x = 8 * 16 + 8 - g.player.w / 2; run(g, 0.3); };
const pressB = (g) => { const ev = []; stepGame(g, { ...NONE, mic: true }); ev.push(...g.events); stepGame(g, NONE); ev.push(...g.events); return ev; };

test('la reja es sólida mientras no ganes el tiro', () => {
  const g = make(); run(g, 4, { ...NONE, right: true });
  assert.ok(g.player.x + g.player.w <= 14 * 16 + 1, `x ${g.player.x}`);
});

test('B frente a la caseta empieza el tiro; mientras dura, el mundo se detiene', () => {
  const g = make(); atBooth(g);
  const ev = pressB(g);
  assert.ok(ev.includes('tiro:empieza')); assert.ok(g.alba.tiro);
  const x = g.player.x, ex = g.enemies[0].x, t0 = g.time;
  run(g, 2, { ...NONE, right: true });
  assert.equal(g.player.x, x); assert.equal(g.enemies[0].x, ex); assert.equal(g.time, t0);
});

test('lejos de la caseta, B es el micrófono de siempre', () => {
  const g = make(); pressB(g);
  assert.equal(g.alba.tiro, null);
});

test('al ganar: se abre la reja, Luz del Alba y +1 corazón', () => {
  const g = make(); g.hearts = 2; atBooth(g); pressB(g);
  g.alba.tiro.status = 'won';
  const ev = run(g, 2);
  assert.ok(ev.includes('tiro:premio')); assert.equal(g.alba.tiro, null);
  assert.equal(g.hearts, 3); assert.ok(g.alba.luzT > ALBA.luzTime - 2);
  run(g, 3, { ...NONE, right: true });
  assert.ok(g.player.x > 15 * 16, 'pasó la reja');
});

test('al perder: la reja sigue cerrada y se puede reintentar', () => {
  const g = make(); atBooth(g); pressB(g);
  g.alba.tiro.status = 'lost';
  run(g, 2);
  assert.equal(g.alba.tiro, null); assert.equal(g.level.tileAt(14, 2), '|');
  pressB(g); assert.ok(g.alba.tiro, 'otra vez');
});

test('el toque en pantalla llega al tiro', () => {
  const g = make(); atBooth(g); pressB(g); run(g, 2);
  const T = g.alba.tiro; T.spawnT = 99;
  T.frases.push({ text: 'ANTES TODO ERA MEJOR', mala: true, x: 40, y: 104, w: 128, h: 13, vx: 0 });
  stepGame(g, { ...NONE, tap: { x: 60, y: 110 } });
  assert.equal(T.malas, 1);
});
