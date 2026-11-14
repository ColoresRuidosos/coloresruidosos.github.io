// F15: insignias (reglas puras y con partidas reales del bot)
import test from 'node:test';
import assert from 'node:assert/strict';
import { BADGES, earnedBadges, awardBadges } from '../src/game/badges.js';
import { createMatch, step } from '../src/game/match.js';
import { createBot, simulate } from '../src/game/bot.js';
import { BEATMAP } from '../src/data/beatmap.js';
import { FRAMES } from '../src/data/atlas.js';

const base = (o = {}) => ({ over: 'derrota', phase: 1, clown: { hp: 50 }, heart: { hp: [100, 640, 900] },
  stats: { fintas: 0, caiste: 0, gritos: 0, maxStreak: 0, ...(o.stats || {}) }, fasesLimpias: 0, ...o });
const ids = (m, ctx) => earnedBadges(m, ctx).sort();

test('hay 10 insignias con nombre, pista corta e ícono en el atlas; nunca «Luciérnaga»', () => {
  assert.equal(BADGES.length, 10);
  assert.deepEqual(BADGES.map((b) => b.id), ['carmesi', 'brujas', 'teoremas', 'bestia', 'plural', 'rey', 'fantasmas', 'psalmos', 'rueda', 'querido']);
  for (const b of BADGES) {
    assert.ok(b.nombre && b.pista.length <= 25, `${b.id}: pista de 25 caracteres o menos`);
    assert.ok(FRAMES['badge.' + b.id], `ícono ${b.id}`);
  }
  assert.ok(FRAMES['badge.locked']);
  assert.ok(!BADGES.some((b) => /luci[ée]rnaga/i.test(b.nombre)));
});

test('cada regla, por separado', () => {
  assert.deepEqual(ids(base({ heart: { hp: [0, 640, 900] } })), ['carmesi']);
  assert.deepEqual(ids(base({ stats: { fintas: 3, caiste: 0 } })), ['brujas']);
  assert.deepEqual(ids(base({ stats: { fintas: 3, caiste: 1 } })), []);
  assert.deepEqual(ids(base({ over: 'derrota' })), []);
  assert.deepEqual(ids(base({ over: 'decision', stats: { gritos: 1 } })), ['teoremas']);
  assert.deepEqual(ids(base({ over: 'decision' })), ['plural', 'teoremas']);
  assert.deepEqual(ids(base({ over: 'ko', stats: { gritos: 2 } })), ['bestia', 'teoremas']);
  assert.deepEqual(ids(base({ over: 'decision', clown: { hp: 20 }, stats: { gritos: 1 } })), ['rey', 'teoremas']);
  assert.deepEqual(ids(base({ over: 'derrota', fasesLimpias: 1 })), ['fantasmas']);
  assert.deepEqual(ids(base({ over: 'derrota', stats: { maxStreak: 16 } })), ['psalmos']);
  assert.deepEqual(ids(base({ over: 'derrota' }), { derrotasPrevias: 3 }), ['rueda']);
  assert.deepEqual(ids(base({ over: 'derrota' }), { derrotasPrevias: 2 }), []);
});

test('awardBadges solo devuelve las nuevas y guarda la fecha; «Querido…» se da al publicar', () => {
  const save = { insignias: { bestia: '2026-11-09' } };
  const nuevas = awardBadges(save, ['bestia', 'teoremas'], new Date('2026-11-10T12:00:00Z'));
  assert.deepEqual(nuevas, ['teoremas']);
  assert.equal(save.insignias.teoremas, '2026-11-10');
  assert.deepEqual(awardBadges(save, ['querido']), ['querido']);
});

test('con partidas reales: cada insignia pide otra forma de jugar', () => {
  // Con el Grito, el bot perfecto vacía la 1.ª barra y gana por K.O.
  const g = simulate(createMatch({ beatmap: BEATMAP, seed: 1 }), step, createBot({ seed: 7 }));
  const eg = ids(g);
  for (const id of ['carmesi', 'bestia', 'teoremas', 'fantasmas', 'psalmos']) assert.ok(eg.includes(id), `con Grito: ${id}`);
  assert.ok(g.stats.gritos >= 1 && !eg.includes('plural'), 'con Grito no hay Plural');
  // Sin el Grito no da tiempo de vaciar la 1.ª barra: gana por decisión → Plural y Noche de brujas
  const s = simulate(createMatch({ beatmap: BEATMAP, seed: 1 }), step, createBot({ seed: 7, grito: false }));
  const es = ids(s);
  assert.equal(s.over, 'decision');
  for (const id of ['plural', 'teoremas', 'fantasmas', 'psalmos', 'brujas']) assert.ok(es.includes(id), `sin Grito: ${id}`);
  assert.ok(!es.includes('carmesi') && !es.includes('bestia'));
  const idle = simulate(createMatch({ beatmap: BEATMAP, seed: 1 }), step, () => []);
  assert.equal(idle.fasesLimpias, 0); assert.deepEqual(ids(idle), []);
});
