// v8.1 · Invitados disfrazados de la fiesta (spec §3.0f G; tareas G1 y G2).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { TILE, P, ENEMY } from '../src/game/constants.js';
import { createGame, stepGame, defeat } from '../src/game/game.js';
import { parseLevel } from '../src/engine/tilemap.js';

const idle = { left: false, right: false, jump: false, mic: false, special: false };
const run = (g, n, btn = idle) => { for (let i = 0; i < n; i++) stepGame(g, btn); return g; };
const COSTUMED = ['gigante', 'invisible', 'anfibio', 'llorona', 'charro'];

describe('leyenda de los niveles', () => {
  test('K Gigante, N Hombre invisible, U Hombre anfibio, Q La Llorona, X Charro Negro; ya no hay invitado de frac (I)', () => {
    const L = parseLevel('KNUQXI\n######');
    assert.deepEqual(L.enemies.map((e) => e.kind), COSTUMED);
  });
});

describe('regla de los disfrazados (G1)', () => {
  for (const kind of COSTUMED) {
    test(`${kind}: el primer golpe le quita el disfraz (sigue y va más rápido) y el siguiente lo vence`, () => {
      const ch = { gigante: 'K', invisible: 'N', anfibio: 'U', llorona: 'Q', charro: 'X' }[kind];
      const g2 = createGame(`.P....${ch}.\n########`);
      const e = g2.enemies[0];
      const need = ENEMY[kind].costumeHits ?? 1;
      for (let i = 0; i < need; i++) { assert.equal(e.unmasked, false); defeat(g2, e); assert.equal(e.alive, true); }
      assert.equal(e.unmasked, true);
      assert.ok((ENEMY[kind].speed2 ?? 0) > (ENEMY[kind].speed ?? 0) || kind === 'anfibio', 'más rápido sin disfraz');
      defeat(g2, e);
      assert.equal(e.alive, false);
      assert.ok(g2.score > 0);
    });
  }

  test('el Gigante necesita 2 golpes para perder el disfraz', () => {
    assert.equal(ENEMY.gigante.costumeHits, 2);
  });

  test('el Solo de guitarra los vence de una vez', () => {
    const g = createGame('.P..K..X.\n#########');
    g.ovacion = 100;
    stepGame(g, { ...idle, special: true });
    assert.ok(g.enemies.every((e) => !e.alive));
  });
});

describe('comportamientos (G2)', () => {
  test('Gigante: lento y su empujón lanza más lejos que un golpe normal', () => {
    const g = createGame('.P....K.\n########');
    assert.ok(ENEMY.gigante.speed <= 20);
    const e = g.enemies[0];
    e.x = g.player.x + 6; run(g, 1);
    assert.ok(Math.abs(g.player.vx) > P.knockback * 1.5, `vx=${g.player.vx}`);
  });

  test('Charro Negro: se prepara y embiste hacia Pepe', () => {
    const g = createGame('.P......X.\n##########');
    const e = g.enemies[0];
    const seen = new Set();
    for (let i = 0; i < 90; i++) { stepGame(g, idle); g.invuln = 1; seen.add(e.state); }
    assert.ok(seen.has('windup') && seen.has('dash'), [...seen].join(','));
  });

  test('Hombre invisible: camina hacia Pepe', () => {
    const g = createGame('.P.......N.\n###########');
    const e = g.enemies[0], x0 = e.x;
    run(g, 60);
    assert.ok(e.x < x0 - 10);
  });

  test('Hombre anfibio: espera escondido en el foso y salta cuando Pepe pasa cerca', () => {
    const g = createGame('.P..........\n.......U....\n######..####\n######..####');
    const e = g.enemies[0];
    run(g, 10);
    assert.equal(e.state, 'hide');
    const hidden = e.y;
    assert.ok(hidden > 2 * TILE, 'escondido bajo el borde del foso');
    g.player.x = 5 * TILE;
    let top = e.y;
    for (let i = 0; i < 60; i++) { stepGame(g, idle); g.invuln = 1; top = Math.min(top, e.y); }
    assert.ok(top + e.h < 2 * TILE, `saltó por encima del suelo (top=${top})`);
    g.player.x = TILE; // Pepe se aleja: ya no vuelve a saltar
    for (let i = 0; i < 120; i++) { stepGame(g, idle); g.invuln = 1; }
    assert.ok(Math.abs(e.y - hidden) < 2, 'vuelve a esconderse');
  });

  test('La Llorona: flota hacia Pepe; su llanto lo frena 1 s sin quitarle corazones', () => {
    const g = createGame('.P........Q...................\n##############################');
    const e = g.enemies[0];
    e.x = g.player.x + 50;
    run(g, 2);
    assert.ok(g.player.slowT > 0.8, `slowT=${g.player.slowT}`);
    assert.equal(g.hearts, 3);
    g.invuln = 99; // (que un choque no cambie la velocidad)
    run(g, 30, { ...idle, right: true });
    assert.ok(Math.abs(g.player.vx) <= P.maxRun / 2 + 1, 'va a media velocidad');
    g.enemies[0].alive = false;
    run(g, 60, { ...idle, right: true });
    assert.ok(Math.abs(g.player.vx) > P.maxRun * 0.9, 'después vuelve a su velocidad');
  });

  test('sin disfraz siguen haciendo daño', () => {
    const g = createGame('.P......X.\n##########');
    const e = g.enemies[0];
    defeat(g, e);
    run(g, 8);
    g.invuln = 0; e.x = g.player.x + 4; e.y = g.player.y + g.player.h - e.h;
    run(g, 1);
    assert.ok(g.hearts < 3);
  });
});
