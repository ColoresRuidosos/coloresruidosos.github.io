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
  // N8 (v7.3): 28 jul 2017, con dos fuentes (AllMusic, Diario de México).
  const APPROVED = new Set(['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8']);
  const cards = Object.values(LEVEL_CARDS_W2).flatMap((c) => c.facts);

  test('solo N1–N8, cada uno con fuente; sin repetir entre Titulares y tarjetas', () => {
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
  test('tres niveles: afuera del salón, el salón y la pista; farol en 2-2 y 2-3', () => {
    assert.deepEqual(WORLD_2.map((l) => l.id), ['2-1', '2-2', '2-3']);
    assert.deepEqual(WORLD_2.map((l) => l.theme), ['afuera', 'salon', 'pista']);
    assert.deepEqual(WORLD_2.map((l) => l.name), ['LA ENTRADA', 'EL SALÓN', 'LA PISTA']);
    assert.deepEqual(WORLD_2.map((l) => !!l.lantern), [false, true, true]);
  });

  test('2-1 y 2-2 con puerta, 2-3 con el Enmascarado; 12–13 piezas en el mundo', () => {
    const gs = WORLD_2.map((l) => createGame(l.map, {}, { lantern: l.lantern }));
    assert.ok(gs[0].level.goal && gs[1].level.goal);
    assert.equal(gs[2].boss?.kind, 'mask');
    const pieces = gs.reduce((n, g) => n + g.pieces.length, 0);
    assert.ok(pieces >= 12 && pieces <= 13, `piezas=${pieces}`);
    // v8.1: el reparto de la fiesta (spec §3.0f G); el invitado de frac ya no está.
    const foes = new Set(gs.flatMap((g) => g.enemies.map((e) => e.kind)));
    for (const k of ['gigante', 'invisible', 'anfibio', 'llorona', 'charro', 'murcielago', 'fantasma', 'titular']) assert.ok(foes.has(k), k);
    assert.ok(!foes.has('invitado'));
    assert.ok(gs[1].items.some((i) => i.kind === 'aceite'), 'latas de aceite en la casona');
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

describe('Enmascarado: la recompensa nunca se pierde (N8)', () => {
  const arena = WORLD_2[2];
  const fight = () => { const g = createGame(arena.map, {}, { lantern: arena.lantern }); g.intro = null; return g; };

  for (const side of ['izquierda', 'derecha']) {
    test(`vencido contra la pared de la ${side} con Pepe encima: la máscara cae en un sitio alcanzable y se recoge`, () => {
      const g = fight(), b = g.boss, L = g.level, p = g.player;
      b.hp = 1; b.phase = 2; b.state = 'stun'; b.t = 0;
      b.x = side === 'izquierda' ? TILE : (L.w - 1) * TILE - b.w;
      p.x = side === 'izquierda' ? TILE : (L.w - 1) * TILE - p.w; // Pepe del lado de la pared
      hitMask(g, b);
      const d = g.disco;
      assert.ok(d, 'deja la máscara');
      const tx = Math.floor(d.x / TILE), ty = Math.floor(d.y / TILE);
      for (const dx of [-12, 0, 12]) assert.equal(L.tileAt(Math.floor((d.x + dx) / TILE), ty), '.', `x=${d.x} toca la pared`);
      assert.ok(tx >= 1 && tx <= L.w - 2);
      for (let i = 0; i < 60 * 6 && g.status === 'play'; i++) stepGame(g, maskBot(g));
      assert.equal(g.status, 'won');
    });
  }
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
