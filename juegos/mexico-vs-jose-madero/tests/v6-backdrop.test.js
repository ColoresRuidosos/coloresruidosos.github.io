// v6 · Fondos panorámicos (spec §3.0e, H6): la imagen recorre de su borde izquierdo al derecho a lo largo del nivel.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { panOffset } from '../src/render/backdrop.js';
import { BACKDROPS } from '../src/data/backdrops-w1.js';
import { W, H } from '../src/game/constants.js';

test('al inicio se ve el borde izquierdo y al final el derecho, sin salirse nunca', () => {
  const imgW = 401, levelW = 2400;
  assert.equal(panOffset(0, levelW, imgW), 0);
  assert.equal(panOffset(levelW - W, levelW, imgW), imgW - W);
  for (let x = 0; x <= levelW - W; x += 37) {
    const o = panOffset(x, levelW, imgW);
    assert.ok(o >= 0 && o <= imgW - W, `x=${x} o=${o}`);
  }
});

test('niveles más estrechos que la pantalla o imágenes justas no se mueven', () => {
  assert.equal(panOffset(100, 300, 401), 0);
  assert.equal(panOffset(500, 2400, W), 0);
});

test('fondos importados de Calle y Azoteas, a 224 px de alto y más anchos que la pantalla', () => {
  for (const k of ['calle', 'azoteas']) {
    assert.equal(BACKDROPS[k].h, H, k);
    assert.ok(BACKDROPS[k].w >= W, k);
    assert.ok(BACKDROPS[k].png.startsWith('data:image/png;base64,'), k);
  }
});
