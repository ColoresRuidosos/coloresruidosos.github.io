// F7b: consejo al perder, según cómo jugaste
import test from 'node:test';
import assert from 'node:assert/strict';
import { tipFor } from '../src/game/tips.js';

const m = (stats, extra = {}) => ({ over: 'derrota', stats: { perfecto: 0, bien: 0, temprano: 0, golpes: 0, batazos: 0, rebotes: 0, abiertos: 0, ...stats }, ...extra });

test('muchos golpes recibidos → mira el puño y desliza al otro lado', () => {
  assert.match(tipFor(m({ golpes: 8, perfecto: 2, bien: 1 })), /PUÑO/);
});
test('esquiva casi siempre temprano → espera el golpe', () => {
  assert.match(tipFor(m({ temprano: 9, perfecto: 1, bien: 1, golpes: 2 })), /PRONTO/);
});
test('esquiva bien pero casi no batea → toca después de esquivar', () => {
  assert.match(tipFor(m({ perfecto: 10, abiertos: 10, batazos: 4, golpes: 1 })), /ABIERTO/);
});
test('batea a lo loco → el bate rebota', () => {
  assert.match(tipFor(m({ perfecto: 10, abiertos: 10, batazos: 30, rebotes: 15, golpes: 1 })), /REBOTA/);
});
test('si no hay otra cosa → usa el Grito; tras 2 derrotas seguidas sugiere el modo asistido', () => {
  assert.match(tipFor(m({ perfecto: 10, abiertos: 10, batazos: 30, golpes: 2 })), /GRITO/);
  assert.match(tipFor(m({ golpes: 8 }), { derrotasSeguidas: 2 }), /ASISTIDO/);
});
