// v7.3 · Cámara sin saltos al girar y datos sin repetir (spec §3.0f F; tareas C12 y H7).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createCamera, stepCamera, followCamera } from '../src/engine/camera.js';
import { createGame, defeat } from '../src/game/game.js';
import { ERA_FACTS_W1, CHAPTERS_W1, LEVEL_CARDS_W1 } from '../src/data/carmesi-story.js';
import { ERA_FACTS_W2, CHAPTERS_W2, LEVEL_CARDS_W2 } from '../src/data/noche-story.js';

describe('cámara (C12)', () => {
  test('al girarse, la cámara se desliza: nunca más de 2 px por fotograma', () => {
    const cam = createCamera(500, 4000, 1);
    let prev = cam.x, maxStep = 0;
    for (let i = 0; i < 120; i++) { stepCamera(cam, 500, 4000, -1); maxStep = Math.max(maxStep, Math.abs(cam.x - prev)); prev = cam.x; }
    assert.ok(maxStep <= 2, `saltó ${maxStep} px de golpe`);
    assert.equal(cam.x, followCamera(0, 500, 4000, -24), 'acaba con el margen al otro lado');
  });

  test('sigue a Pepe a velocidad máxima sin quedarse atrás', () => {
    const cam = createCamera(500, 4000, 1);
    let x = 500;
    for (let i = 0; i < 120; i++) { x += 165 / 60; stepCamera(cam, x, 4000, 1); }
    assert.ok(Math.abs(cam.x - followCamera(0, x, 4000, 24)) <= 1);
  });

  test('un cambio grande de encuadre (combate con el jefe) se desliza en vez de saltar', () => {
    const cam = createCamera(500, 4000, 1);
    const before = cam.x;
    stepCamera(cam, 700, 4000, 0);
    assert.ok(Math.abs(cam.x - before) < 40, `movió ${cam.x - before} px en un fotograma`);
  });

  test('al cargar un nivel se coloca directamente, sin deslizarse', () => {
    assert.equal(createCamera(2990, 3000, 1).x, 3000 - 320);
    assert.equal(createCamera(10, 3000, 1).x, 0);
  });
});

describe('datos sin repetir (H7)', () => {
  const worlds = [
    ['Carmesí', ERA_FACTS_W1, CHAPTERS_W1, LEVEL_CARDS_W1],
    ['Noche', ERA_FACTS_W2, CHAPTERS_W2, LEVEL_CARDS_W2],
  ];
  for (const [name, facts, chapters, cards] of worlds) {
    test(`${name}: cada dato sale una sola vez entre capítulos, Titulares y tarjetas`, () => {
      const ids = [
        ...Object.values(chapters).flatMap((c) => c.uses ?? []),
        ...facts.map((f) => f.id),
        ...Object.values(cards).flatMap((c) => c.facts.map((f) => f.id)),
      ];
      const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
      // D2 de Carmesí son dos frases distintas del mismo dato aprobado (adelanto + canción que abre el disco).
      assert.deepEqual(dup.filter((d) => d !== 'D2'), [], `repetidos: ${dup}`);
    });
  }

  test('Noche: los capítulos solo cuentan la historia; un dato como mucho y declarado en `uses`', () => {
    for (const [id, c] of Object.entries(CHAPTERS_W2)) assert.ok((c.uses ?? []).length <= 1, id);
    const txt = Object.values(CHAPTERS_W2).flatMap((c) => c.lines).join(' ');
    assert.doesNotMatch(txt, /MÁSCARAS SOCIALES|FANTASMAS»|FIGURAS DEL TERROR/);
  });

  test('Noche: N8 (28 de julio de 2017) está y tiene sus dos fuentes', () => {
    const all = [...ERA_FACTS_W2, ...Object.values(LEVEL_CARDS_W2).flatMap((c) => c.facts)];
    const n8 = all.find((f) => f.id === 'N8');
    assert.ok(n8 && /28 DE JULIO DE 2017/.test(n8.text));
    assert.match(n8.source, /ALLMUSIC.*DIARIO DE MÉXICO/);
  });

  test('cuando se acaban los datos, el Titular no repite: solo grita su titular', () => {
    const facts = [{ id: 'X', text: 'UNO', source: 'S' }];
    const g = createGame('.P.T.T.\n#######', {}, { facts });
    for (const e of g.enemies) defeat(g, e);
    assert.deepEqual(g.popups.map((p) => p.text), ['UNO']);
  });
});
