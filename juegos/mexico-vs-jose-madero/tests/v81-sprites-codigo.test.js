// v8.1 · Sprites de los invitados disfrazados generados por código, estilo Neo Geo (spec §3.0f G; tarea G3).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createGrid, shade, OUTLINE } from '../src/render/pixel.js';
import { FIESTA, renderCharacter } from '../src/render/sprites-fiesta.js';

describe('generador (pixel.js)', () => {
  test('añade contorno oscuro alrededor y 3 tonos por material (luz arriba a la izquierda)', () => {
    const G = createGrid(12, 12);
    G.rect(2, 2, 8, 8, 1);
    const px = shade(G, { 1: ['#202020', '#808080', '#e0e0e0'] });
    const at = (x, y) => px[y * 12 + x];
    assert.equal(at(1, 5), OUTLINE, 'contorno a la izquierda');
    assert.equal(at(10, 5), OUTLINE, 'contorno a la derecha');
    assert.equal(at(2, 2), '#e0e0e0', 'luz arriba a la izquierda');
    assert.equal(at(9, 9), '#202020', 'sombra abajo a la derecha');
    assert.equal(at(5, 5), '#808080', 'tono medio dentro');
    assert.equal(at(0, 0), null, 'fondo transparente');
  });
});

describe('los 5 disfrazados', () => {
  const ANIMS = { walk: 4, act: 2, uwalk: 4, uact: 2, hit: 1 };
  for (const id of ['gigante', 'invisible', 'anfibio', 'llorona', 'charro']) {
    test(`${id}: todas sus animaciones, con y sin disfraz`, () => {
      const c = renderCharacter(id);
      for (const [a, n] of Object.entries(ANIMS)) assert.equal(c.anims[a]?.length, n, a);
    });

    test(`${id}: cada fotograma tiene contorno, al menos 6 colores y un alto parecido al de Pepe`, () => {
      const c = renderCharacter(id);
      for (const f of c.frames) {
        const used = f.px.filter(Boolean);
        assert.ok(used.includes(OUTLINE), `${f.key} sin contorno`);
        if (!f.key.startsWith('parts')) assert.ok(new Set(used).size >= 6, `${f.key}: ${new Set(used).size} colores`);
        const rows = [...Array(f.h).keys()].filter((y) => f.px.slice(y * f.w, y * f.w + f.w).some(Boolean));
        const hh = rows.at(-1) - rows[0] + 1;
        if (!f.key.startsWith('parts')) assert.ok(hh >= FIESTA[id].minH && hh <= f.h, `${f.key}: alto ${hh}`);
      }
    });

    test(`${id}: sin disfraz se ve distinto (otra cara u otra ropa)`, () => {
      const c = renderCharacter(id);
      const a = c.frames.find((f) => f.key === 'walk0').px.join(), b = c.frames.find((f) => f.key === 'uwalk0').px.join();
      assert.notEqual(a, b);
    });
  }

  test('Hombre invisible: a oscuras solo se ven sombrero, gafas y guantes (muchos menos píxeles)', () => {
    const c = renderCharacter('invisible');
    assert.equal(c.anims.parts?.length, 4);
    const count = (k) => c.frames.find((f) => f.key === k).px.filter(Boolean).length;
    assert.ok(count('parts0') < count('walk0') * 0.45, `${count('parts0')} de ${count('walk0')}`);
    assert.ok(count('parts0') > 20);
  });
});
