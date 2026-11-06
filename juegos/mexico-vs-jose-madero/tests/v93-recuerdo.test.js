// v9.3: la tarjeta «RECUERDO RECUPERADO» debe tener kind 'recuerdo' (antes el kind 'ficcion' de RECUERDOS lo pisaba
// y el juego dibujaba una tarjeta vacía al terminar cada mundo).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recuerdoCard, RECUERDOS } from '../src/data/historia.js';

for (const world of Object.keys(RECUERDOS)) {
  test(`la tarjeta de recuerdo de ${world} se dibuja como recuerdo`, () => {
    const c = recuerdoCard(world, ['carmesi']);
    assert.equal(c.kind, 'recuerdo');
    assert.equal(c.title, RECUERDOS[world].title);
    assert.deepEqual(c.lines, RECUERDOS[world].lines);
    assert.deepEqual(c.worldsDone, ['carmesi']);
  });
}
