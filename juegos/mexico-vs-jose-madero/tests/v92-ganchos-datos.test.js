// v9.2 · Enseñar los ganchos y revisar los datos de Carmesí (spec §3.0f M; tareas HK2, DC1 y DC2).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, stepGame, defeat, hookAhead } from '../src/game/game.js';
import { WORLD_1 } from '../src/data/world1.js';
import { WORLD_2 } from '../src/data/world2.js';
import { ERA_FACTS_W1, CHAPTERS_W1 } from '../src/data/carmesi-story.js';
import { ERA_FACTS_W2 } from '../src/data/noche-story.js';
import { guideOf } from '../src/data/guia.js';

const idle = { left: false, right: false, jump: false, mic: false, special: false };
const titulars = (levels) => levels.reduce((n, l) => n + createGame(l.map).enemies.filter((e) => e.kind === 'titular').length, 0);

describe('ganchos (HK2)', () => {
  test('hookAhead: un gancho delante a menos de 140 px; detrás o lejos, ninguno', () => {
    const g = createGame('..............\n..........H...\n..............\n.P............\n##############');
    const h = g.level.hooks[0], p = g.player;
    p.x = h.x - 120; p.facing = 1;
    assert.equal(hookAhead(g), h);
    p.x = h.x - 200;
    assert.equal(hookAhead(g), null);
    p.x = h.x + 40;
    assert.equal(hookAhead(g), null, 'ya lo dejó atrás');
  });

  test('el aviso del gancho explica qué hacer antes de usarlo', () => {
    assert.match(guideOf('gancho').first, /SALTA/);
    assert.match(guideOf('gancho').first, /B/);
  });
});

describe('datos de Carmesí (DC1)', () => {
  test('se ven todos: hay al menos un Titular por dato (también en Noche)', () => {
    assert.ok(titulars(WORLD_1) >= ERA_FACTS_W1.length, `${titulars(WORLD_1)} Titulares para ${ERA_FACTS_W1.length} datos`);
    assert.ok(titulars(WORLD_2) >= ERA_FACTS_W2.length);
  });

  test('cada capítulo cuenta la historia y declara como mucho un dato: 1-1 → D2, 1-2 → D4, 1-3 → D9', () => {
    assert.deepEqual(Object.fromEntries(Object.entries(CHAPTERS_W1).map(([k, c]) => [k, c.uses])), { '1-1': ['D2'], '1-2': ['D4'], '1-3': ['D9'] });
  });

  test('en orden cronológico (el podcast de 2015, al principio)', () => {
    assert.equal(ERA_FACTS_W1[0].id, 'D19');
  });
});

describe('datos en pantalla (DC2)', () => {
  test('duran según su largo (3 s + 1 s cada 20 caracteres)', () => {
    const facts = [{ id: 'X', text: 'A'.repeat(100), source: 'S' }];
    const g = createGame('.P.T.\n#####', {}, { facts });
    defeat(g, g.enemies[0]);
    assert.ok(g.popups[0].t >= 8 - 0.01, `t=${g.popups[0].t}`);
  });

  test('si se vencen dos Titulares seguidos, los datos hacen cola: primero uno y luego el otro', () => {
    const facts = [{ id: 'A', text: 'UNO', source: 'S' }, { id: 'B', text: 'DOS', source: 'S' }];
    const g = createGame('.P.T.T......\n############', {}, { facts });
    defeat(g, g.enemies[0]); defeat(g, g.enemies[1]);
    assert.equal(g.popups.length, 2);
    for (let i = 0; i < 60; i++) stepGame(g, idle);
    assert.equal(g.popups[0].text, 'UNO', 'sigue el primero');
    assert.equal(g.popups[1].t > 3, true, 'el segundo aún no ha empezado a descontar');
    for (let i = 0; i < 60 * 4; i++) stepGame(g, idle);
    assert.equal(g.popups[0].text, 'DOS');
  });
});
