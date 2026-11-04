// v9.1 · Guía de objetos y ganchos más claros (spec §3.0f L; tareas GU1 y HK1).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { GUIDE } from '../src/data/guia.js';
import { canRender } from '../src/render/font.js';
import { createGame, stepGame, aimHook } from '../src/game/game.js';
import { createSave } from '../src/engine/save.js';
import { TILE } from '../src/game/constants.js';

const mem = () => { const m = {}; return { getItem: (k) => m[k] ?? null, setItem: (k, v) => { m[k] = v; } }; };

describe('guía de objetos (GU1)', () => {
  test('los 8: carta, amplificador, púa, antifaz, aceite, solo, piezas y ganchos; todo cabe y se dibuja', () => {
    assert.deepEqual(GUIDE.map((g) => g.kind), ['carta', 'amp', 'pua', 'antifaz', 'aceite', 'solo', 'piezas', 'gancho']);
    for (const g of GUIDE) {
      assert.ok(g.name.length <= 24, g.name);
      for (const l of [g.name, ...g.lines, g.first]) { assert.ok(l.length <= 44, l); for (const ch of l) assert.ok(canRender(ch), `«${ch}» en «${l}»`); }
    }
  });

  test('al recoger un objeto queda dicho cuál (para explicarlo la primera vez)', () => {
    const g = createGame('.PJ..Z..+..A.\n#############');
    const got = [];
    for (let i = 0; i < 80; i++) { stepGame(g, { right: true }); got.push(...g.events.filter((e) => e.startsWith('item:'))); }
    assert.deepEqual(got, ['item:pua', 'item:antifaz', 'item:carta', 'item:amp']);
  });

  test('lo ya explicado se guarda (seenItems)', () => {
    const st = mem(), s = createSave(st);
    assert.deepEqual(s.data.seenItems, []);
    s.data.seenItems.push('pua'); s.commit();
    assert.deepEqual(createSave(st).data.seenItems, ['pua']);
  });
});

describe('ganchos (HK1)', () => {
  test('aimHook: con un gancho delante y a tiro, es ese; lejos, detrás o muy alto, ninguno', () => {
    const g = createGame('............\n............\n............\n.......H....\n............\n............\n.P..........\n############');
    const p = g.player, h = g.level.hooks[0];
    p.x = h.x - 60; p.facing = 1;
    assert.equal(aimHook(g), h);
    p.facing = -1;
    assert.equal(aimHook(g), null, 'mirando hacia el otro lado');
    p.facing = 1; p.x = h.x - 200;
    assert.equal(aimHook(g), null, 'demasiado lejos');
    void TILE; void stepGame;
  });
});
