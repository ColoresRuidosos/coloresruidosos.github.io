// v5 · Ritmo, puntuación, Ovación y power-ups (spec §3.0d).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { P, MIC, HITSTOP, COMBO_WINDOW, OVATION, GUITAR, AMP } from '../src/game/constants.js';
import { createGame, stepGame, defeat } from '../src/game/game.js';
import { HEADLINES, QUOTES } from '../src/data/quotes.js';

const IDLE = { left: false, right: false, jump: false, mic: false, special: false };
const run = (g, n, btn = IDLE) => { for (let i = 0; i < n; i++) stepGame(g, btn); };
const FLOOR = '#'.repeat(40);

describe('ritmo rápido (C1)', () => {
  test('Pepe corre a 165 px/s o más', () => {
    assert.ok(P.maxRun >= 160);
    const g = createGame(`${'.'.repeat(40)}\n.P${'.'.repeat(38)}\n${FLOOR}`);
    run(g, 90, { ...IDLE, right: true });
    assert.ok(g.player.vx >= 160, `vx=${g.player.vx}`);
  });

  test('al soltar el gancho sale disparado con impulso', () => {
    assert.ok(MIC.releaseVx >= 200);
  });

  test('vencer a un enemigo produce un parón de impacto: el mundo se detiene unos fotogramas', () => {
    const g = createGame(`..........\n.P...T....\n##########`);
    run(g, 5);
    stepGame(g, { ...IDLE, mic: true });
    let n = 0;
    while (g.enemies[0].alive && n++ < 40) stepGame(g, IDLE);
    assert.equal(g.enemies[0].alive, false);
    assert.equal(g.hitstop, HITSTOP);
    const x = g.player.x, f = g.frame;
    stepGame(g, { ...IDLE, right: true });
    assert.equal(g.player.x, x, 'no se mueve durante el parón');
    assert.equal(g.frame, f, 'el reloj de juego no avanza');
    run(g, HITSTOP);
    stepGame(g, { ...IDLE, right: true });
    assert.notEqual(g.player.x, x);
  });

  test('combo: dos enemigos seguidos valen 100 + 200', () => {
    const g = createGame(`..........\n.P.T.T....\n##########`);
    defeat(g, g.enemies[0]);
    defeat(g, g.enemies[1]);
    assert.equal(g.combo, 2);
    assert.equal(g.score, 300);
  });

  test('el combo se pierde si pasan más de 2 s', () => {
    const g = createGame(`..........\n.P.T.T....\n##########`);
    defeat(g, g.enemies[0]);
    run(g, Math.ceil(COMBO_WINDOW * 60) + 10);
    defeat(g, g.enemies[1]);
    assert.equal(g.combo, 1);
    assert.equal(g.score, 200);
  });

  test('cronómetro: g.time avanza 1 s cada 60 pasos', () => {
    const g = createGame(`..........\n.P........\n##########`);
    run(g, 60);
    assert.ok(Math.abs(g.time - 1) < 1e-6);
  });
});

describe('Titulares y frases (C2)', () => {
  test('los titulares son genéricos, sin insultos', () => {
    assert.ok(HEADLINES.includes('¡EXCLUSIVA!'));
    for (const h of HEADLINES) assert.ok(!/MAMÓN|ALTANERO|PRESUMIDO/.test(h), h);
  });

  test('la frase verificada sale al vencer un Titular, no con otros enemigos', () => {
    const g = createGame(`..........\n.P.F.T....\n##########`);
    defeat(g, g.enemies[0]);
    assert.equal(g.popups.length, 0);
    defeat(g, g.enemies[1]);
    assert.ok(g.popups.some((p) => QUOTES.some((q) => q.text === p.text)));
  });
});

describe('Ovación y Solo de guitarra (C3)', () => {
  test('vencer enemigos llena la Ovación (más con combo) hasta el máximo', () => {
    const g = createGame(`..........\n.P.T.T....\n##########`);
    defeat(g, g.enemies[0]);
    assert.equal(g.ovacion, OVATION.perHit);
    defeat(g, g.enemies[1]);
    assert.equal(g.ovacion, OVATION.perHit * 3);
    g.ovacion = OVATION.max - 1;
    g.enemies[0].alive = true;
    defeat(g, g.enemies[0]);
    assert.equal(g.ovacion, OVATION.max);
  });

  test('sin la barra llena, el botón especial no hace nada', () => {
    const g = createGame(`..........\n.P.T......\n##########`);
    g.ovacion = OVATION.max - 1;
    stepGame(g, { ...IDLE, special: true });
    assert.equal(g.enemies[0].alive, true);
  });

  test('con la barra llena, el Solo vence a todos los enemigos en pantalla y no a los lejanos', () => {
    const far = '.'.repeat(20);
    const g = createGame(`........${far}..\n.P.T..F.${far}.R\n########${'#'.repeat(20)}##`);
    g.ovacion = OVATION.max;
    stepGame(g, { ...IDLE, special: true });
    assert.equal(g.enemies[0].alive, false);
    assert.equal(g.enemies[1].alive, false);
    assert.equal(g.enemies[2].alive, true, 'el Reportero está a más de media pantalla');
    assert.equal(g.ovacion, 0);
    assert.ok(g.invuln >= GUITAR.invuln - 0.05);
    assert.ok(g.guitarT > 0, 'efecto visual activo');
  });
});

describe('power-ups (C4)', () => {
  test('Amplificador: el micrófono alcanza el doble durante 10 s', () => {
    const g = createGame(`............\n.PA.........\n############`);
    run(g, 20, { ...IDLE, right: true });
    assert.ok(g.amp > AMP.time - 1);
    run(g, 30);
    stepGame(g, { ...IDLE, mic: true });
    let maxLen = 0;
    for (let i = 0; i < 60; i++) { stepGame(g, IDLE); maxLen = Math.max(maxLen, g.mic.len); }
    assert.ok(maxLen >= MIC.range * AMP.mult - 1, `maxLen=${maxLen}`);
    run(g, AMP.time * 60);
    assert.equal(g.amp, 0);
  });

  test('Carta de fan: +1 corazón, sin pasar de 3', () => {
    const g = createGame(`............\n.P+...+.....\n############`);
    g.hearts = 2;
    run(g, 60, { ...IDLE, right: true });
    assert.equal(g.hearts, 3);
    assert.equal(g.items.filter((it) => it.taken).length, 2);
  });
});
