// v7 · Mundo 2 «Noche»: datos, farol, enemigos, jefe Enmascarado y repeticiones (spec §3.0f E; tareas N1–N6).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { TILE, LANTERN, MASK } from '../src/game/constants.js';
import { createGame, stepGame, defeat } from '../src/game/game.js';
import { lightRadius, inLight, hitMask } from '../src/game/noche.js';
import { WORLD_2 } from '../src/data/world2.js';
import { ERA_FACTS_W2, CHAPTERS_W2, LEVEL_CARDS_W2 } from '../src/data/noche-story.js';
import { canRender } from '../src/render/font.js';
import { bot, maskBot } from './bot.js';

const idle = { left: false, right: false, jump: false, mic: false, special: false };
const run = (g, n, btn = idle) => { for (let i = 0; i < n; i++) stepGame(g, typeof btn === 'function' ? btn(g) : btn); return g; };
const wrap = (s, n) => { const out = []; let l = ''; for (const w of s.split(' ')) { if ((l + ' ' + w).trim().length > n) { out.push(l); l = w; } else l = (l + ' ' + w).trim(); } if (l) out.push(l); return out; };

describe('Noche · datos (N1)', () => {
  const APPROVED = new Set(['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7']);
  const cards = Object.values(LEVEL_CARDS_W2).flatMap((c) => c.facts);

  test('solo N1–N7, cada uno con fuente; sin repetir entre Titulares y tarjetas', () => {
    for (const f of [...ERA_FACTS_W2, ...cards]) { assert.ok(APPROVED.has(f.id), f.id); assert.ok(f.source.length > 3, f.id); }
    const cardTexts = new Set(cards.map((f) => f.text));
    for (const f of ERA_FACTS_W2) assert.ok(!cardTexts.has(f.text), f.id);
  });

  test('sin nombres de personajes de terror registrados ni de Halloween como tema', () => {
    const all = [...ERA_FACTS_W2, ...cards].map((f) => f.text).join(' ') + Object.values(CHAPTERS_W2).flatMap((c) => [c.title, ...c.lines]).join(' ');
    assert.doesNotMatch(all, /JASON|FREDDY|PINHEAD|HOCKEY/);
  });

  test('capítulo y tarjeta para cada nivel; todo cabe y se puede dibujar', () => {
    for (const l of WORLD_2) { assert.ok(CHAPTERS_W2[l.id], l.id); assert.ok(LEVEL_CARDS_W2[l.id]?.facts.length >= 1, l.id); }
    const texts = [...ERA_FACTS_W2, ...cards].flatMap((f) => [f.text, f.source]).concat(Object.values(CHAPTERS_W2).flatMap((c) => [c.title, ...c.lines]));
    for (const s of texts) for (const ch of s) assert.ok(canRender(ch), `«${ch}» en «${s}»`);
    for (const f of ERA_FACTS_W2) assert.ok(wrap(f.text, 50).length <= 3, f.id);
    for (const c of Object.values(CHAPTERS_W2)) for (const l of c.lines) assert.ok(l.length <= 44, l);
  });

  test('hay datos para todos los Titulares del mundo', () => {
    const n = WORLD_2.reduce((k, l) => k + createGame(l.map).enemies.filter((e) => e.kind === 'titular').length, 0);
    assert.ok(ERA_FACTS_W2.length >= n);
  });
});

describe('Noche · niveles (N5)', () => {
  test('tres niveles: fiesta, cabañas y lago; farol en 2-2 y 2-3', () => {
    assert.deepEqual(WORLD_2.map((l) => l.id), ['2-1', '2-2', '2-3']);
    assert.deepEqual(WORLD_2.map((l) => l.theme), ['fiesta', 'cabanas', 'lago']);
    assert.deepEqual(WORLD_2.map((l) => !!l.lantern), [false, true, true]);
  });

  test('2-1 y 2-2 con puerta, 2-3 con el Enmascarado; 12–13 piezas en el mundo', () => {
    const gs = WORLD_2.map((l) => createGame(l.map, {}, { lantern: l.lantern }));
    assert.ok(gs[0].level.goal && gs[1].level.goal);
    assert.equal(gs[2].boss?.kind, 'mask');
    const pieces = gs.reduce((n, g) => n + g.pieces.length, 0);
    assert.ok(pieces >= 12 && pieces <= 13, `piezas=${pieces}`);
    const foes = new Set(gs.flatMap((g) => g.enemies.map((e) => e.kind)));
    for (const k of ['invitado', 'murcielago', 'fantasma']) assert.ok(foes.has(k), k);
    assert.ok(gs[1].items.some((i) => i.kind === 'aceite'), 'latas de aceite en las cabañas');
  });
});

describe('farol (N2)', () => {
  test('gasta aceite, nunca baja del mínimo y la lata lo rellena', () => {
    const g = createGame('.P......L.\n##########', {}, { lantern: true });
    assert.equal(lightRadius(g), LANTERN.max);
    run(g, 60 * (LANTERN.duration + 5));
    assert.equal(lightRadius(g), LANTERN.min);
    g.player.x = 8 * TILE + 8 - g.player.w / 2;
    run(g, 2);
    assert.ok(lightRadius(g) > LANTERN.max - 1, 'la lata lo rellena');
  });

  test('inLight: dentro del círculo, sí; fuera, no; sin farol, todo se ve', () => {
    const g = createGame('.P........\n##########', {}, { lantern: true });
    const p = g.player, cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    assert.ok(inLight(g, cx + 30, cy));
    assert.ok(!inLight(g, cx + LANTERN.max + 30, cy));
    assert.ok(inLight(createGame('.P........\n##########'), 9999, 0));
  });
});

describe('enemigos de Noche (N3)', () => {
  test('Invitado: se acerca deprisa al verte; el 1.er golpe le quita la máscara (más rápido y sigue atacando), el 2.º lo vence', () => {
    const g = createGame('.P.......I.\n###########');
    const e = g.enemies[0];
    run(g, 20);
    assert.equal(e.state, 'chase');
    const masked = Math.abs(e.vx);
    assert.ok(masked > 40);
    defeat(g, e);
    assert.equal(e.alive, true, 'sigue en pie');
    assert.equal(e.unmasked, true);
    assert.ok(g.score > 0);
    run(g, 8); // (pasa el parón de impacto)
    assert.ok(Math.abs(e.vx) > masked, 'sin máscara es más rápido');
    g.invuln = 0; e.x = g.player.x + 4; e.y = g.player.y; run(g, 2);
    assert.ok(g.hearts < 3, 'sin máscara sigue haciendo daño');
    defeat(g, e);
    assert.equal(e.alive, false);
  });

  test('Invitado: el Solo de guitarra lo vence de una vez', () => {
    const g = createGame('.P..I.\n######');
    g.ovacion = 100;
    stepGame(g, { ...idle, special: true });
    assert.equal(g.enemies[0].alive, false);
  });

  test('Murciélago: cuelga quieto y baja en curva cuando pasas cerca; luego vuelve arriba', () => {
    const g = createGame('......W.\n........\n........\n........\n........\n.P......\n########');
    const e = g.enemies[0], y0 = e.y;
    run(g, 10);
    assert.equal(e.state, 'hang');
    g.player.x = e.x - 10;
    run(g, 2);
    assert.equal(e.state, 'swoop');
    let low = e.y;
    for (let i = 0; i < 60 * 2; i++) { stepGame(g, idle); low = Math.max(low, e.y); g.invuln = 1; }
    assert.ok(low > y0 + 40, `bajó hasta ${low - y0}px`);
    assert.ok(Math.abs(e.y - y0) < 2, 'vuelve a su altura');
  });

  test('Fantasma: atraviesa paredes hacia Pepe', () => {
    const g = createGame('.P..#..O.\n#########');
    const e = g.enemies[0], x0 = e.x;
    run(g, 60 * 3);
    assert.ok(e.x < 4 * TILE, `cruzó la pared (x=${e.x}, empezó en ${x0})`);
  });
});

describe('jefe: El Enmascarado del Lago (N4)', () => {
  const arena = WORLD_2[2];
  const fight = () => { const g = createGame(arena.map, {}, { lantern: arena.lantern }); g.intro = null; return g; };

  test('acecho → embestida → choca con la pared → aturdido (solo entonces es vulnerable)', () => {
    const g = fight(), b = g.boss;
    assert.equal(b.state, 'lurk');
    const seen = new Set();
    for (let i = 0; i < 60 * 8 && !seen.has('stun'); i++) { stepGame(g, idle); g.invuln = 1; seen.add(b.state); }
    assert.ok(seen.has('dash') && seen.has('stun'), [...seen].join(','));
    const hp = b.hp;
    b.state = 'dash';
    assert.equal(hitMask(g, b), false, 'durante la embestida no se le puede dañar');
    assert.equal(b.hp, hp);
    b.state = 'stun';
    assert.equal(hitMask(g, b), true);
    assert.equal(b.hp, hp - 1);
  });

  test('5 golpes; fase 2 con apagón; al vencerlo se quita la máscara y deja la Máscara de fiesta', () => {
    const g = fight(), b = g.boss;
    assert.equal(b.hp, MASK.hp);
    const st = { blackout: false };
    for (let i = 0; i < 60 * 120 && g.status === 'play'; i++) {
      stepGame(g, maskBot(g));
      if (g.blackout) st.blackout = true;
    }
    assert.equal(b.alive, false);
    assert.equal(b.unmasked, true);
    assert.ok(st.blackout, 'hubo apagón en la fase 2');
    assert.equal(g.disco?.kind, 'mascara');
    assert.equal(g.status, 'won');
  });
});

describe('repeticiones (N6)', () => {
  for (const id of ['2-1', '2-2']) {
    test(`el bot completa ${id}`, () => {
      const L = WORLD_2.find((l) => l.id === id);
      const g = createGame(L.map, { hearts: 3 }, { lantern: L.lantern });
      for (let i = 0; i < 60 * 150 && g.status === 'play'; i++) stepGame(g, bot(g));
      assert.equal(g.status, 'won', `x=${Math.round(g.player.x)} de ${g.level.w * TILE}, corazones=${g.hearts}`);
    });
  }
});
