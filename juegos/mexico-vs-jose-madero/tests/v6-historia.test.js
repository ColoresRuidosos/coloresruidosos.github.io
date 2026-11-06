// v6 · Historia del Mundo 1: datos de la época de Carmesí, capítulos y tarjetas (spec §3.0e, H1–H4).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ERA_FACTS_W1, CHAPTERS_W1, LEVEL_CARDS_W1 } from '../src/data/carmesi-story.js';
import { WORLD_1 } from '../src/data/world1.js';
import { canRender } from '../src/render/font.js';
import { createGame, defeat } from '../src/game/game.js';

const APPROVED = new Set(['D1', 'D2', 'D3', 'D3b', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13', 'D17', 'D18', 'D19', 'D20']);
const wrap = (s, n) => { const out = []; let l = ''; for (const w of s.split(' ')) { if ((l + ' ' + w).trim().length > n) { out.push(l); l = w; } else l = (l + ' ' + w).trim(); } if (l) out.push(l); return out; };
const allTexts = () => [
  ...ERA_FACTS_W1.flatMap((f) => [f.text, f.source]),
  ...Object.values(CHAPTERS_W1).flatMap((c) => [c.title, ...c.lines]),
  ...Object.values(LEVEL_CARDS_W1).flatMap((c) => c.facts.flatMap((f) => [f.text, f.source])),
];

describe('datos de la época (H1)', () => {
  test('solo datos aprobados (D1–D20 sin los dudosos), cada uno con su fuente', () => {
    const cardFacts = Object.values(LEVEL_CARDS_W1).flatMap((c) => c.facts);
    for (const f of [...ERA_FACTS_W1, ...cardFacts]) {
      assert.ok(APPROVED.has(f.id), `${f.id} no está aprobado`);
      assert.ok(f.source && f.source.length > 3, `${f.id} sin fuente`);
    }
  });

  test('no se repiten: los de los Titulares y los de las tarjetas son distintos', () => {
    const ids = ERA_FACTS_W1.map((f) => f.text);
    assert.equal(new Set(ids).size, ids.length);
    const cardTexts = new Set(Object.values(LEVEL_CARDS_W1).flatMap((c) => c.facts.map((f) => f.text)));
    for (const f of ERA_FACTS_W1) assert.ok(!cardTexts.has(f.text), f.id);
  });

  test('caben en el cartel (máx. 3 líneas de 50 caracteres)', () => {
    for (const f of ERA_FACTS_W1) assert.ok(wrap(f.text, 50).length <= 3, f.id);
  });

  test('hay datos de sobra para todos los Titulares del mundo', () => {
    const titulars = WORLD_1.reduce((n, l) => n + createGame(l.map).enemies.filter((e) => e.kind === 'titular').length, 0);
    assert.ok(ERA_FACTS_W1.length >= titulars, `${ERA_FACTS_W1.length} datos para ${titulars} Titulares`);
  });

  test('todo el texto se puede dibujar con la fuente del juego', () => {
    for (const s of allTexts()) for (const ch of s) assert.ok(canRender(ch), `«${ch}» en «${s}»`);
  });
});

describe('Titulares con datos de la época (H2)', () => {
  test('cada Titular vencido muestra el siguiente dato, sin repetir', () => {
    const g = createGame('.P.T.T.T.T.\n###########', {}, { facts: ERA_FACTS_W1 });
    for (const e of g.enemies) defeat(g, e);
    assert.deepEqual(g.popups.map((p) => p.text), ERA_FACTS_W1.slice(0, 4).map((f) => f.text));
    assert.equal(g.popups[0].source, ERA_FACTS_W1[0].source);
  });

  test('el contador sigue entre niveles (no vuelve a empezar)', () => {
    const g = createGame('.P.T.\n#####', { quoteIdx: 5 }, { facts: ERA_FACTS_W1 });
    defeat(g, g.enemies[0]);
    assert.equal(g.popups[0].text, ERA_FACTS_W1[5].text);
    assert.equal(g.quoteIdx, 6);
  });
});

describe('capítulos y tarjetas por nivel (H3)', () => {
  test('cada nivel tiene su capítulo y su tarjeta «¿Sabías que…?»', () => {
    assert.deepEqual(WORLD_1.map((l) => CHAPTERS_W1[l.id].title), ['LUNES 28', 'PLURAL SIENDO SINGULAR', 'LA PRESENTACIÓN']);
    for (const l of WORLD_1) assert.ok(LEVEL_CARDS_W1[l.id].facts.length >= 1, l.id);
  });
});
