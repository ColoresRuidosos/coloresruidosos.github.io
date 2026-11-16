// v10.2 · Jefe «La Nostalgia» (spec §3.0f Q v10.2; tarea AL7). No se puede perder: se gana avanzando.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, stepGame } from '../src/game/game.js';
import { ALBA } from '../src/game/constants.js';
import { NOSTALGIA_LINES } from '../src/data/alba-story.js';

const B = ALBA.boss;
const NONE = { left: false, right: false, jump: false, mic: false, special: false };
// Arena: Pepe en x=2, el jefe empieza en la columna 8; noria en la 70; repisa alta a la derecha de la noria.
const W = 160;
const row = (f) => Array.from({ length: W }, (_, x) => f(x)).join('');
const ROWS = [
  row(() => '.'), row(() => '.'), row(() => '.'), row(() => '.'),
  row((x) => (x === 70 ? 'D' : '.')),
  row(() => '.'), row(() => '.'),
  row((x) => (x >= 76 ? '#' : '.')),                       // repisa alta, a la altura de las cabinas de arriba
  row((x) => (x >= 76 ? '#' : '.')), row((x) => (x >= 76 ? '#' : '.')),
  row((x) => (x === 2 ? 'P' : x === 8 ? 'n' : x >= 76 ? '#' : '.')),
  row(() => '#'), row(() => '#'),
];
const make = () => createGame(ROWS.join('\n'), {}, { alba: { start: 7 } });
const step = (g, n, btn = NONE) => { const ev = []; for (let i = 0; i < n; i++) { stepGame(g, btn); ev.push(...g.events); } return ev; };
const cx = (g) => g.player.x + g.player.w / 2;

describe('La Nostalgia', () => {
  test('aparece al entrar en su arena y dice «Quédate»', () => {
    const g = make();
    assert.equal(g.alba.boss.phase, 0);
    const ev = step(g, 60, { ...NONE, right: true });
    assert.ok(ev.includes('nostalgia'));
    assert.equal(g.alba.boss.phase, 1);
    assert.equal(g.alba.boss.line.text, NOSTALGIA_LINES.aparece);
  });

  test('fase 1: lanza recuerdos de los jefes sin repetir el anterior; si te tocan, retrocedes 48 px y no pierdes vida', () => {
    const g = make(); step(g, 60, { ...NONE, right: true });
    const kinds = [];
    for (let i = 0; i < 60 * 12; i++) { const n = g.alba.boss.shots.length; stepGame(g, NONE); if (g.alba.boss.shots.length > n) kinds.push(g.alba.boss.lastKind); g.player.x = 10 * 16; }
    assert.ok(kinds.length >= 4, `${kinds.length} ataques`);
    for (let i = 1; i < kinds.length; i++) assert.notEqual(kinds[i], kinds[i - 1]);
    assert.ok(kinds.every((k) => ['rayoBajo', 'rayoAlto', 'embestida', 'mascaras'].includes(k)));
    const h = make(); step(h, 60, { ...NONE, right: true });
    h.player.x = 30 * 16; const x0 = cx(h);
    h.alba.boss.shots.push({ kind: 'embestida', x: h.player.x - 2, y: h.player.y, w: 20, h: 36, vx: 0, vy: 0 });
    const ev = step(h, 1);
    assert.ok(ev.includes('recuerdo'));
    assert.ok(Math.abs(x0 - cx(h) - ALBA.recuerdoPush) < 3);
    assert.equal(h.hearts, 3);
  });

  test('tocar 3 rayos de sol la debilita y empieza la fase 2 («Otra vuelta»)', () => {
    const g = make(); step(g, 60, { ...NONE, right: true });
    for (const r of g.alba.boss.rays) { g.player.x = r.x - g.player.w / 2; step(g, 2); }
    assert.equal(g.alba.boss.raysTaken, 3);
    assert.equal(g.alba.boss.phase, 2);
    assert.equal(g.alba.boss.line.text, NOSTALGIA_LINES.fase2);
  });

  test('fase 2: la noria se invierte cada 4 s durante 2 s y avisa 0,6 s antes', () => {
    const g = make(); step(g, 60, { ...NONE, right: true });
    for (const r of g.alba.boss.rays) { g.player.x = r.x - g.player.w / 2; step(g, 2); }
    const w = g.alba.wheels[0], seq = [];
    let warnAt = -1, revAt = -1;
    for (let i = 0; i < 60 * 7; i++) { const ev = step(g, 1); if (ev.includes('rebobina') && warnAt < 0) warnAt = i; if (w.dir < 0 && revAt < 0) revAt = i; seq.push(w.dir); }
    assert.ok(warnAt >= 0 && revAt >= 0);
    assert.ok(Math.abs((revAt - warnAt) / 60 - B.warn) < 0.05, `aviso ${(revAt - warnAt) / 60}`);
    const back = seq.filter((d) => d < 0).length / 60;
    assert.ok(Math.abs(back - B.reverseFor) < 0.1, `al revés ${back} s`);
  });

  test('fase 3: bajar de la noria por la repisa alta → viento en contra; caminando 400 px se despide y ganas', () => {
    const g = make(); step(g, 60, { ...NONE, right: true });
    for (const r of g.alba.boss.rays) { g.player.x = r.x - g.player.w / 2; step(g, 2); }
    g.player.x = 80 * 16; g.player.y = 7 * 16 - g.player.h; g.player.vy = 0; step(g, 2);
    assert.equal(g.alba.boss.phase, 3);
    assert.equal(g.alba.boss.line.text, NOSTALGIA_LINES.fase3);
    const x0 = cx(g); step(g, 60);
    assert.ok(x0 - cx(g) > 30, 'quieto, el viento te empuja');
    step(g, 60 * 6, { ...NONE, right: true });
    assert.equal(g.alba.boss.phase, 4);
    assert.equal(g.alba.boss.line.text, NOSTALGIA_LINES.despedida);
    const ev = step(g, 60 * (B.bye + 0.5));
    assert.ok(ev.includes('won')); assert.equal(g.status, 'won');
    assert.equal(g.hearts, 3);
  });

  test('determinista: misma partida, mismos ataques', () => {
    const seq = () => { const g = make(); step(g, 60, { ...NONE, right: true }); const k = []; for (let i = 0; i < 600; i++) { const n = g.alba.boss.shots.length; stepGame(g, NONE); if (g.alba.boss.shots.length > n) k.push(g.alba.boss.lastKind); } return k.join(); };
    assert.equal(seq(), seq());
  });
});
