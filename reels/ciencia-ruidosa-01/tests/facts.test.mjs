// Cada texto con un dato lleva fuente, y la fuente está en FACTS.md
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TEXTS } from '../content.js';
const facts = readFileSync(new URL('../FACTS.md', import.meta.url), 'utf8');
for (const x of TEXTS.filter(x => x.fact)) test(`${x.id} tiene fuente en FACTS.md`, () => {
  assert.ok(x.source, 'sin fuente en pantalla'); assert.ok(facts.includes(x.source.split(',')[0].split(' (')[0]), 'fuente no está en FACTS.md: ' + x.source);
});
test('sin cifras sueltas en los datos', () => { for (const x of TEXTS.filter(x => x.fact)) assert.ok(!/\d+ ?%/.test(x.lines.join(' ')), x.id); });
