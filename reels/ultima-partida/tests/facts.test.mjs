// Cada pregunta del reel existe en docs/trivia.md de Colores Ruidosos, con la misma respuesta y fuente ✅.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { QUESTIONS } from '../content.js';

const HERE = fileURLToPath(new URL('..', import.meta.url));
import { existsSync } from 'node:fs';
// dentro del repo de Colores Ruidosos: reels/<reel>/ → ../../docs/trivia.md ; en la biblioteca: films/<reel>/ → ../../../coloresruidosos.github.io/docs/trivia.md
const MD = process.env.TRIVIA_MD || [HERE + '../../docs/trivia.md', HERE + '../../../coloresruidosos.github.io/docs/trivia.md'].find(existsSync);
const rows = Object.fromEntries(readFileSync(MD, 'utf8').split('\n')
  .filter(l => /^\| [FDM]\d\d \|/.test(l))
  .map(l => { const c = l.split('|').map(s => s.trim()); return [c[1], { answer: c[5], strength: c[8] }]; }));

test('hay 5 preguntas', () => assert.equal(QUESTIONS.length, 5));
for (const q of QUESTIONS) {
  test(`${q.id} existe en trivia.md con fuente ✅`, () => {
    const r = rows[q.id]; assert.ok(r, 'no está en trivia.md');
    assert.ok(r.strength.startsWith('✅'), 'fuente no sólida: ' + r.strength);
    assert.equal(r.answer.replace(/\*\*/g, ''), q.docAnswer);
  });
  test(`${q.id}: 4 opciones, la correcta una sola vez`, () => {
    assert.equal(q.options.length, 4);
    assert.equal(q.options.filter(o => o === q.options[q.correct]).length, 1);
    assert.ok(q.docAnswer.toLowerCase().includes(q.options[q.correct].toLowerCase().replace(/^(la|el|un|una) /, '')), 'la opción correcta no coincide con la respuesta del banco');
  });
}
test('sin comillas de letras de canciones', () => {
  for (const q of QUESTIONS) assert.ok(!/[«»"]/.test(q.text + q.options.join('')), q.id);
});
