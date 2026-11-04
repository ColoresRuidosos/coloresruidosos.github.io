// v8.2 · Más ayudas: cartas, Púa de guitarra, Antifaz y continuar el mundo (spec §3.0f H; tareas AY1–AY4).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, stepGame, defeat } from '../src/game/game.js';
import { hitMask } from '../src/game/noche.js';
import { createSave } from '../src/engine/save.js';
import { startLevelIndex } from '../src/game/progress.js';
import { WORLD_1 } from '../src/data/world1.js';
import { WORLD_2 } from '../src/data/world2.js';
import { TILE, PUA, STAR } from '../src/game/constants.js';

const idle = { left: false, right: false, jump: false, mic: false, special: false };
const run = (g, n, btn = idle) => { for (let i = 0; i < n; i++) stepGame(g, btn); return g; };
const mem = () => { const m = {}; return { getItem: (k) => m[k] ?? null, setItem: (k, v) => { m[k] = v; } }; };

describe('cartas de fan (AY1)', () => {
  test('al menos 3 cartas y 3 checkpoints en cada nivel normal, y un power-up nuevo', () => {
    for (const L of [...WORLD_1, ...WORLD_2]) {
      const g = createGame(L.map);
      if (g.boss) continue;
      const k = (kind) => g.items.filter((i) => i.kind === kind).length;
      assert.ok(k('carta') >= 3, `${L.id}: ${k('carta')} cartas`);
      assert.ok(g.level.checkpoints.length >= 3, `${L.id}: ${g.level.checkpoints.length} checkpoints`);
      assert.ok(k('pua') + k('antifaz') >= 1, `${L.id}: sin Púa ni Antifaz`);
    }
  });

  test('cada 6 enemigos vencidos, el último deja caer una carta', () => {
    const g = createGame('.P.T.T.T.T.T.T.T.\n#################');
    const before = g.items.length;
    for (const e of g.enemies.slice(0, 5)) defeat(g, e);
    assert.equal(g.items.length, before);
    defeat(g, g.enemies[5]);
    const drop = g.items.at(-1);
    assert.equal(g.items.length, before + 1);
    assert.equal(drop.kind, 'carta');
    assert.ok(Math.abs(drop.x - (g.enemies[5].x + g.enemies[5].w / 2)) < 2);
  });

  test('con el jefe: cada 2 golpes cae una carta en el centro si falta algún corazón', () => {
    const L = WORLD_2[2];
    const g = createGame(L.map, { hearts: 2 }, { lantern: true }); g.intro = null;
    const b = g.boss, hit = () => { b.state = 'stun'; b.hitThisWindow = false; b.hurtT = 0; hitMask(g, b); };
    hit();
    assert.equal(g.items.filter((i) => i.kind === 'carta').length, 0);
    hit();
    const c = g.items.filter((i) => i.kind === 'carta');
    assert.equal(c.length, 1);
    assert.ok(Math.abs(c[0].x - (g.level.w * TILE) / 2) < 24);
    const g2 = createGame(L.map, { hearts: 3 }, { lantern: true }); g2.intro = null;
    const b2 = g2.boss;
    for (let i = 0; i < 2; i++) { b2.state = 'stun'; b2.hitThisWindow = false; b2.hurtT = 0; hitMask(g2, b2); }
    assert.equal(g2.items.filter((i) => i.kind === 'carta').length, 0, 'con los 3 corazones no cae');
  });
});

describe('power-ups (AY2)', () => {
  test('Púa de guitarra: al lanzar el micro sale una púa que vence al primer enemigo a 200 px', () => {
    const g = createGame('.P.J..........T..\n##################');
    run(g, 40, { ...idle, right: true });
    assert.ok(g.pua > PUA.time - 1, 'recogida');
    run(g, 2);
    const e = g.enemies[0];
    e.x = g.player.x + g.player.w + 120; e.vx = 0;
    stepGame(g, { ...idle, mic: true }); stepGame(g, idle);
    assert.ok(g.picks.length >= 1, 'sale la púa');
    run(g, 40);
    assert.equal(e.alive, false);
    assert.equal(g.picks.length, 0);
  });

  test('la Púa se acaba a los 15 s', () => {
    const g = createGame('.P......\n########');
    g.pua = PUA.time;
    run(g, 60 * PUA.time + 2);
    assert.equal(g.pua, 0);
    stepGame(g, { ...idle, mic: true });
    assert.equal(g.picks.length, 0);
  });

  test('Antifaz: 8 s de invencible; lo que tocas queda vencido y no quita corazones', () => {
    const g = createGame('.PZ...X......\n#############');
    run(g, 20, { ...idle, right: true });
    assert.ok(g.star > STAR.time - 1);
    const e = g.enemies[0];
    e.x = g.player.x + 4; e.y = g.player.y + g.player.h - e.h;
    run(g, 2);
    assert.equal(e.alive, false, 'vencido de una vez (aunque vaya disfrazado)');
    assert.equal(g.hearts, 3);
    run(g, 60 * STAR.time);
    assert.equal(g.star, 0);
  });

  test('con el Antifaz el jefe no hace daño', () => {
    const L = WORLD_2[2];
    const g = createGame(L.map, {}, { lantern: true }); g.intro = null;
    g.star = STAR.time; g.boss.state = 'dash'; g.boss.vx = -200;
    g.boss.x = g.player.x + 2; g.boss.y = g.player.y + g.player.h - g.boss.h;
    run(g, 3);
    assert.equal(g.hearts, 3);
  });
});

describe('continuar (AY3)', () => {
  test('se empieza en el primer nivel sin superar; con el mundo terminado, desde el principio', () => {
    const s = createSave(mem());
    assert.equal(startLevelIndex(s, 'noche', WORLD_2), 0);
    s.data.worlds.noche = { cleared: ['2-1'], best: {} };
    assert.equal(startLevelIndex(s, 'noche', WORLD_2), 1);
    s.data.worlds.noche.cleared.push('2-2');
    assert.equal(startLevelIndex(s, 'noche', WORLD_2), 2);
    s.data.worlds.noche.cleared.push('2-3');
    assert.equal(startLevelIndex(s, 'noche', WORLD_2), 0);
  });
});
