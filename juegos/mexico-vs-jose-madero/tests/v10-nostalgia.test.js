// v10.2 · Jefe «La Nostalgia» (spec §3.0f Q v10.2; tarea AL7). No se puede perder: se gana avanzando.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, stepGame } from '../src/game/game.js';
import { ALBA, P, W as W_SCREEN } from '../src/game/constants.js';
import { LEAD } from '../src/engine/camera.js';
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

  test('fase 1: lanza recuerdos de los jefes sin repetir el anterior; si te tocan, pierdes 1 corazón (v11)', () => {
    const g = make(); g.assist = true; step(g, 60, { ...NONE, right: true });   // asistido: aguanta los golpes
    const kinds = [];
    for (let i = 0; i < 60 * 12; i++) { const n = g.alba.boss.throws; stepGame(g, NONE); if (g.alba.boss.throws > n) kinds.push(g.alba.boss.lastKind); g.player.x = 10 * 16; }
    assert.ok(kinds.length >= 4, `${kinds.length} ataques`);
    for (let i = 1; i < kinds.length; i++) assert.notEqual(kinds[i], kinds[i - 1]);
    assert.ok(kinds.every((k) => ['rayoBajo', 'rayoAlto', 'embestida', 'mascaras'].includes(k)));
    const h = make(); h.assist = true; step(h, 60, { ...NONE, right: true });
    h.assist = false; h.hearts = 3; h.invuln = 0; h.player.x = 30 * 16;
    h.alba.boss.shots.push({ kind: 'embestida', x: h.player.x - 2, y: h.player.y, w: 20, h: 36, vx: 0, vy: 0 });
    const ev = step(h, 1);
    assert.ok(ev.includes('recuerdo'));
    assert.equal(h.hearts, 2, 'v11: los recuerdos del jefe quitan 1 corazón');
  });

  test('v11.1 · aparece detrás de Pepe y lo persigue de izquierda a derecha', () => {
    const g = make(); g.assist = true; step(g, 60, { ...NONE, right: true });
    const b = g.alba.boss;
    assert.ok(b.x < cx(g) - 60, `nube en ${Math.round(b.x)}, Pepe en ${Math.round(cx(g))}`);
    const x0 = b.x; step(g, 30);
    assert.ok(b.x > x0, 'avanza hacia la derecha');
  });

  test('v11.1 · su velocidad sube conforme Pepe avanza, sin pasar nunca la de Pepe', () => {
    const g = make(); g.assist = true; step(g, 60, { ...NONE, right: true });
    const b = g.alba.boss;
    const speedAt = (px) => { g.player.x = b.startX + px; b.x = g.player.x - 60; b.pause = 0; b.dash = 0; const x0 = b.x; stepGame(g, NONE); return (b.x - x0) / (1 / 60); };
    const v0 = speedAt(0), v1 = speedAt(300), v2 = speedAt(2000);
    assert.ok(Math.abs(v0 - B.chase.base) < 3, `al inicio ${v0}`);
    assert.ok(v1 > v0 + 30, `más rápida al avanzar: ${v0} → ${v1}`);
    assert.ok(v2 <= B.chase.max + 1 && B.chase.max < P.maxRun, `tope ${v2}`);
  });

  test('v11.4 · la correa la deja siempre en pantalla (la cámara pone a Pepe a ~110 px del borde)', () => {
    assert.ok(B.chase.leash <= W_SCREEN * 0.42 - LEAD - 14, `correa ${B.chase.leash}`);
  });

  test('v11.1 · nunca se queda más lejos que la correa', () => {
    const g = make(); g.assist = true; step(g, 60, { ...NONE, right: true });
    g.player.x = 60 * 16; step(g, 2);
    assert.ok(cx(g) - g.alba.boss.x <= B.chase.leash + 1);
  });

  test('v11.1 · si te alcanza: −1 corazón, retrocede 120 px y se detiene', () => {
    const g = make(); step(g, 60, { ...NONE, right: true });
    const b = g.alba.boss; g.hearts = 3; g.invuln = 0; b.shots = []; b.throwT = 99;
    g.player.x = b.startX + 20; g.player.vx = 0; step(g, 20); g.invuln = 0;   // lejos de los rayos de sol
    b.x = cx(g) - 2; b.y = g.player.y + g.player.h / 2;
    const ev = step(g, 1);
    assert.ok(ev.includes('alcanza')); assert.equal(g.hearts, 2);
    assert.ok(cx(g) - b.x >= B.chase.recoil - 10, `retrocedió a ${Math.round(cx(g) - b.x)}`);
    const x1 = b.x; step(g, 30); assert.equal(b.x, x1, 'se detiene un momento');
  });

  test('v11.1 · los recuerdos salen de la nube hacia delante; la embestida avisa antes', () => {
    const g = make(); g.assist = true; step(g, 60, { ...NONE, right: true });
    const b = g.alba.boss; let warned = false, dashed = false;
    for (let i = 0; i < 60 * 14; i++) {
      const n = b.shots.length; stepGame(g, NONE);
      for (const s of b.shots.slice(n)) { assert.ok(s.vx > 0, 'hacia la derecha'); assert.ok(s.x < cx(g), 'desde detrás'); }
      if (b.dashWarn > 0) warned = true;
      if (b.dash > 0) { dashed = true; assert.ok(warned, 'avisó antes'); }
      g.player.x = 12 * 16;
    }
    assert.ok(dashed, 'se lanzó');
  });

  test('v11.1 · no puede subir a la noria: arriba estás a salvo', () => {
    const g = make(); step(g, 60, { ...NONE, right: true });
    for (const r of g.alba.boss.rays) { g.player.x = r.x - g.player.w / 2; step(g, 2); }
    assert.equal(g.alba.boss.phase, 2);
    const b = g.alba.boss; g.hearts = 3; g.invuln = 0;
    g.player.x = 70 * 16; g.player.y = 3 * 16; g.player.vy = 0; b.x = 70 * 16 + 4; b.pause = 0;
    for (let i = 0; i < 20; i++) { g.player.y = 3 * 16; g.player.vy = 0; stepGame(g, NONE); }
    assert.equal(g.hearts, 3);
    assert.ok(b.y > b.ground - 40, 'la nube se queda abajo');
    for (let i = 0; i < 60 * 6; i++) { g.player.y = 3 * 16; g.player.vy = 0; stepGame(g, NONE); }
    assert.ok(b.x < cx(g), `nunca te rebasa (nube ${Math.round(b.x)}, Pepe ${Math.round(cx(g))})`);
  });

  test('v11.4 · en la noria (fase 2) te espera a 70 px: el reto ahí es la noria que se invierte', () => {
    const g = make(); g.assist = true; step(g, 60, { ...NONE, right: true });
    for (const r of g.alba.boss.rays) { g.player.x = r.x - g.player.w / 2; step(g, 2); }
    assert.equal(g.alba.boss.phase, 2);
    g.assist = false; g.hearts = 3; g.invuln = 0; g.player.x = 66 * 16; g.player.vx = 0;
    const ev = step(g, 60 * 5);
    assert.ok(!ev.includes('alcanza')); assert.equal(g.hearts, 3);
    assert.ok(cx(g) - g.alba.boss.x >= B.chase.wheelGap - 1);
  });

  test('v11.1 · cada rayo de sol empuja la nube 100 px hacia atrás', () => {
    const g = make(); g.assist = true; step(g, 60, { ...NONE, right: true });
    const b = g.alba.boss, r = b.rays[0];
    g.player.x = r.x - g.player.w / 2; b.x = r.x - 80; b.pause = 0;
    const x0 = b.x; step(g, 1);
    assert.ok(x0 - b.x >= B.chase.rayPush - 5);
  });

  test('tocar 3 rayos de sol la debilita y empieza la fase 2 («Otra vuelta»)', () => {
    const g = make(); g.assist = true; step(g, 60, { ...NONE, right: true });
    for (const r of g.alba.boss.rays) { g.player.x = r.x - g.player.w / 2; step(g, 2); }
    assert.equal(g.alba.boss.raysTaken, 3);
    assert.equal(g.alba.boss.phase, 2);
    assert.equal(g.alba.boss.line.text, NOSTALGIA_LINES.fase2);
  });

  test('fase 2: la noria se invierte cada 4 s durante 2 s y avisa 0,6 s antes', () => {
    const g = make(); g.assist = true; step(g, 60, { ...NONE, right: true });
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
    const g = make(); g.assist = true; step(g, 60, { ...NONE, right: true });
    for (const r of g.alba.boss.rays) { g.player.x = r.x - g.player.w / 2; step(g, 2); }
    g.player.x = 80 * 16; g.player.y = 7 * 16 - g.player.h; g.player.vy = 0; step(g, 2);
    assert.equal(g.alba.boss.phase, 3);
    assert.equal(g.alba.boss.line.text, NOSTALGIA_LINES.fase3);
    const x0 = cx(g); g.alba.boss.pause = 99; step(g, 60); g.alba.boss.pause = 0;   // sin la nube, para medir solo el viento
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
