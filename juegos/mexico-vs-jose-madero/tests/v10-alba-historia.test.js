// v10.5 · Historia y escenas de Alba (spec §3.0f Q v10.5; tarea AL9).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS_W3, LEVEL_CARDS_W3, PASAJES, NOSTALGIA_LINES, ALBA_SONGS } from '../src/data/alba-story.js';
import { LETRAS } from '../src/data/alba-letras.js';
import { RECUERDOS, PENSAMIENTOS } from '../src/data/historia.js';
import { WORLD_SCENES } from '../src/data/cinematicas.js';
import { SCENE_ART } from '../src/data/scenes-art.js';

test('carteles de los 3 niveles con títulos de canciones de Alba', () => {
  assert.deepEqual(Object.keys(CHAPTERS_W3), ['3-1', '3-2', '3-3']);
  assert.deepEqual(Object.values(CHAPTERS_W3).map((c) => c.title), ['WILLKOMMEN', 'CARRUSEL DE ADULTOS', 'AHORA Y HOY']);
  for (const c of Object.values(CHAPTERS_W3)) for (const l of c.lines) assert.ok(l.length <= 40, `línea larga: ${l}`);
});

test('«¿Sabías que…?»: un dato verificado por nivel, con 2 fuentes, sin repetirse en el mundo', () => {
  const ids = [...Object.values(CHAPTERS_W3).flatMap((c) => c.uses), ...Object.values(LEVEL_CARDS_W3).flatMap((c) => c.facts.map((f) => f.id))];
  assert.equal(new Set(ids).size, ids.length);
  for (const c of Object.values(LEVEL_CARDS_W3)) for (const f of c.facts) assert.match(f.source, / · /, `${f.id}: 2 fuentes`);
});

test('10 pasajes, uno por canción de Alba en orden, con reflexión de CR y sin «Luciérnaga»', () => {
  assert.equal(ALBA_SONGS.length, 10);
  assert.deepEqual(PASAJES.map((p) => p.cancion), ALBA_SONGS);
  for (const p of PASAJES) { assert.ok(p.reflexion.length > 10 && p.reflexion.length <= 90, p.cancion); }
  assert.ok(!/luci[ée]rnaga/i.test(JSON.stringify(PASAJES)));
});

test('letras: solo de canciones de Alba, hasta 4 líneas de 30 caracteres y con crédito (el texto lo aporta CR)', () => {
  for (const l of LETRAS) {
    assert.ok(ALBA_SONGS.includes(l.cancion), l.cancion);
    assert.ok(l.fragmento.length <= 4, `${l.cancion}: máximo 4 líneas`);
    for (const line of l.fragmento) assert.ok(line.length <= 30, `${l.cancion}: «${line}» pasa de 30`);
    if (l.fragmento.length) assert.match(l.credito, /JOSÉ MADERO · ALBA \(2018\) · USADO CON AUTORIZACIÓN/);
  }
});

test('recuerdo, 6 pensamientos y lo que dice la Nostalgia en cada fase', () => {
  assert.equal(RECUERDOS.alba.year, 2018);
  assert.equal(RECUERDOS.alba.title, 'SEGUIR ADELANTE');
  assert.equal(PENSAMIENTOS.alba.length, 6);
  assert.deepEqual(Object.keys(NOSTALGIA_LINES), ['aparece', 'fase2', 'fase3', 'despedida']);
  assert.equal(NOSTALGIA_LINES.despedida, 'GRACIAS POR RECORDARME. AHORA SIGUE.');
});

test('escenas de entrada y salida con las 4 ilustraciones de Gemini (320×150)', () => {
  const w = WORLD_SCENES.alba;
  assert.deepEqual([...w.intro, ...w.outro].map((p) => p.id), ['a1', 'a2', 'a3', 'a4']);
  for (const id of ['a1', 'a2', 'a3', 'a4']) assert.ok(SCENE_ART[id], `falta la ilustración ${id}`);
});
