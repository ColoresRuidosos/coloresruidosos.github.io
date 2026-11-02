// v8 · Sprites de Noche hechos con ChatGPT (v8.1: se quedan Murciélago, Fantasma y Enmascarado) (spec §1.2b; tarea A7): las hojas se recortan completas,
// con sus animaciones y tamaños, y sustituyen a los dibujos por código.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MURCIELAGO_META } from '../src/data/murcielago-atlas.js';
import { FANTASMA_META } from '../src/data/fantasma-atlas.js';
import { ENMASCARADO_META } from '../src/data/enmascarado-atlas.js';

const SHEETS = {
  murcielago: [MURCIELAGO_META, { batHang: 4, batFly: 6, batKo: 3 }, 24],
  fantasma: [FANTASMA_META, { ghostFloat: 6, ghostAttack: 4, ghostKo: 3 }, 28],
  enmascarado: [ENMASCARADO_META, { maskWalk: 6, maskDash: 6, maskLeap: 6, maskThrow: 6, maskStun: 6, maskUnmask: 6 }, 58],
};

for (const [name, [meta, anims, h]] of Object.entries(SHEETS)) {
  test(`${name}: todas las animaciones con su número de fotogramas`, () => {
    for (const [anim, n] of Object.entries(anims)) assert.equal(meta.anims[anim]?.length, n, anim);
  });
  test(`${name}: la primera animación mide ≈ ${h} px y las anclas están dentro del fotograma`, () => {
    const first = meta.anims[Object.keys(anims)[0]].map((k) => meta.frames[k].h);
    const avg = first.reduce((a, b) => a + b, 0) / first.length;
    assert.ok(Math.abs(avg - h) <= 3, `alto medio ${avg}`);
    for (const [k, f] of Object.entries(meta.frames)) assert.ok(f.ax >= 0 && f.ax <= f.w && f.ay > 0 && f.ay <= f.h, k);
  });
}
