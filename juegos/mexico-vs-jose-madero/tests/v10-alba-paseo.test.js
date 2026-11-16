// v10 · Mecánicas del paseo «Alba» (spec §3.0f Q; tareas AL1–AL6).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, stepGame } from '../src/game/game.js';
import { cabinTops } from '../src/game/alba.js';
import { ALBA as K } from '../src/game/constants.js';

const NONE = { left: false, right: false, jump: false, mic: false, special: false };
const run = (g, secs, btn = NONE) => { for (let i = 0; i < Math.round(secs * 60); i++) stepGame(g, btn); return g; };
const lvl = (rows) => rows.join('\n');
const make = (rows, opts = {}) => createGame(lvl(rows), {}, { alba: { start: 0, ...opts } });
const cx = (g) => g.player.x + g.player.w / 2;
const evs = (g, secs, btn = NONE) => { const all = []; for (let i = 0; i < Math.round(secs * 60); i++) { stepGame(g, btn); all.push(...g.events); } return all; };

describe('paseo: sin daño', () => {
  test('caer a un foso te devuelve al checkpoint sin perder corazones', () => {
    const g = make(['..........', '..........', '..P.......', '####..####', '####..####']);
    run(g, 3, { ...NONE, right: true });
    assert.equal(g.hearts, 3); assert.equal(g.status, 'play'); assert.ok(g.alba);
    assert.ok(g.player.y < 3 * 16, 'volvió arriba');
  });
});

describe('la nostalgia', () => {
  const rows = ['..............................', '..............................', '.............P................', '##############################'];
  test('quieto más de 3 s, te arrastra hacia atrás a ~20 px/s', () => {
    const g = make(rows); g.checkpoint = { x: 24, y: 48 };
    const x0 = cx(g);
    run(g, K.still - 0.1); assert.ok(Math.abs(cx(g) - x0) < 1, 'antes de 3 s no se mueve');
    run(g, 2.1);
    const moved = x0 - cx(g);
    assert.ok(moved > 30 && moved < 46, `retrocedió ${moved}`);
    assert.ok(g.alba.drag, 'se ve la bruma');
  });
  test('nunca te lleva más atrás del checkpoint', () => {
    const g = make(rows); g.checkpoint = { x: 150, y: 48 };
    run(g, 30);
    assert.ok(cx(g) >= 150 - 1, `x ${cx(g)}`);
  });
  test('nunca te tira a un foso', () => {
    const g = make(['..............................', '..............................', '.............P................', '######..######################']);
    g.checkpoint = { x: 8, y: 48 };
    run(g, 40);
    assert.equal(g.player.onGround, true);
    assert.ok(cx(g) > 8 * 16, `x ${cx(g)}`);
  });
  test('si caminas, se disipa', () => {
    const g = make(rows); g.checkpoint = { x: 24, y: 48 };
    run(g, 4); run(g, 0.2, { ...NONE, right: true });
    assert.equal(g.alba.drag, false);
  });
  test('sentado en una banca no te arrastra', () => {
    const g = make(['..............................', '..............................', '.............Pb...............', '##############################']);
    g.checkpoint = { x: 24, y: 48 };
    const x0 = cx(g);
    run(g, 8);
    assert.equal(g.alba.sitting, true);
    assert.ok(Math.abs(cx(g) - x0) < 1);
  });
});

describe('los recuerdos (polaroids)', () => {
  test('te persiguen y al tocarte te regresan 48 px, sin daño', () => {
    const g = make(['..............................', '..............................', '..........P....I..............', '##############################']);
    g.checkpoint = { x: 8, y: 48 };
    const x0 = cx(g);
    const e = evs(g, 2.9);
    assert.ok(e.includes('recuerdo'), 'te alcanzó');
    assert.equal(g.hearts, 3);
    assert.ok(Math.abs((x0 - cx(g)) - K.recuerdoPush) < 4, `regresó ${x0 - cx(g)}`);
    assert.equal(g.alba.recuerdos[0].alive, false);
  });
  test('el micrófono los disuelve en luz', () => {
    const g = make(['..............................', '..............................', '..........P.....I.............', '##############################']);
    const e = [];
    for (let i = 0; i < 150; i++) { stepGame(g, { ...NONE, mic: i % 10 < 5 }); e.push(...g.events); }   // como un jugador: toques repetidos
    assert.ok(e.includes('disuelve'));
    assert.equal(g.alba.recuerdos[0].alive, false);
  });
});

describe('la Maldita Rueda', () => {
  test('sus cabinas giran y te llevan', () => {
    const g = make(['..............................', '..............................', '..............................', '..............D...............', '..............................', '..............................', '..............................', '..P...........................', '##############################']);
    const w = g.alba.wheels[0];
    const top = cabinTops(w)[0];
    g.player.x = top.x - g.player.w / 2; g.player.y = top.y - g.player.h; g.player.vy = 0;
    const ys = [];
    for (let i = 0; i < 90; i++) { stepGame(g, NONE); ys.push(g.player.y); }
    assert.ok(Math.max(...ys) - Math.min(...ys) > 10, 'se movió con la cabina');
    assert.equal(g.alba.ride != null, true);
    assert.ok(g.player.y < 7 * 16, 'no se cayó');
  });
});

describe('luz del alba', () => {
  const rows = ['....................', '....................', '..P........@........', '####~~~~############'];
  test('las plataformas de luz solo son sólidas con luz', () => {
    const g = make(rows);
    stepGame(g, NONE);
    assert.equal(g.level.tileAt(5, 3), '.');
    g.alba.luzT = K.luzTime; stepGame(g, NONE);
    assert.equal(g.level.tileAt(5, 3), '=');
  });
  test('la Luz del Alba da 10 s de luz; detrás del checkpoint ya amaneció', () => {
    const g = make(rows);
    g.items.find((i) => i.kind === 'luz').x = cx(g); stepGame(g, NONE);
    assert.ok(g.alba.luzT > K.luzTime - 0.1);
    const h = make(rows); h.checkpoint = { x: 200, y: 48 }; stepGame(h, NONE);
    assert.equal(h.level.tileAt(5, 3), '=');
  });
});

describe('pasajes', () => {
  test('cada atril se lee una vez, con el número de canción del nivel', () => {
    const g = make(['..............................', '..............................', '..P....S.......S..............', '##############################'], { start: 4 });
    const e = evs(g, 2.5, { ...NONE, right: true });
    assert.equal(e.filter((x) => x === 'pasaje').length, 2);
    assert.deepEqual(g.alba.leidos, [4, 5]);
    assert.equal(g.alba.pasaje.idx, 5);
  });
});
