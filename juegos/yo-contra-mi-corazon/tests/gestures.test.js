// T1.4: toque, deslizamiento y teclado → acciones
import test from 'node:test';
import assert from 'node:assert/strict';
import { createGestures } from '../src/input/gestures.js';

const mk = () => { const out = []; const g = createGestures({ emit: (a) => out.push(a), threshold: 24, tapMs: 200 }); return { g, out }; };

test('deslizar a la izquierda, derecha y abajo; se emite al cruzar el umbral, con su hora', () => {
  const { g, out } = mk();
  g.down(1, 100, 100, 1000); g.move(1, 90, 102, 1010); assert.equal(out.length, 0);
  g.move(1, 75, 103, 1020); assert.deepEqual(out, [{ type: 'swipe', dir: 'izq', at: 1020 }]);
  g.move(1, 40, 103, 1030); g.up(1, 40, 103, 1040); assert.equal(out.length, 1, 'un solo gesto por dedo');
  g.down(2, 100, 100, 2000); g.move(2, 130, 95, 2015); g.up(2, 130, 95, 2030);
  g.down(3, 100, 100, 3000); g.move(3, 104, 130, 3015); g.up(3, 104, 130, 3030);
  assert.deepEqual(out.slice(1).map((a) => a.dir), ['der', 'abajo']);
});

test('tocar: corto y casi quieto, con la hora del dedo abajo', () => {
  const { g, out } = mk();
  g.down(1, 100, 100, 500); g.move(1, 110, 108, 560); g.up(1, 110, 108, 600);
  assert.deepEqual(out, [{ type: 'tap', at: 500 }]);
});

test('casos ambiguos: 23 px no es deslizar; un toque de 210 ms no cuenta; hacia arriba es batazo', () => {
  const { g, out } = mk();
  g.down(1, 100, 100, 0); g.move(1, 123, 100, 50); g.up(1, 123, 100, 100);
  assert.deepEqual(out, [{ type: 'tap', at: 0 }]);
  g.down(2, 100, 100, 1000); g.up(2, 100, 100, 1210);
  assert.equal(out.length, 1);
  g.down(3, 100, 100, 2000); g.move(3, 100, 70, 2020);
  assert.deepEqual(out[1], { type: 'tap', at: 2020 });
});

test('teclado: flechas, espacio y M dan las mismas acciones; la tecla repetida no cuenta', () => {
  const { g, out } = mk();
  g.key('ArrowLeft', 10); g.key('ArrowRight', 20); g.key('ArrowDown', 30); g.key(' ', 40); g.key('m', 50); g.key('x', 60);
  g.key('ArrowLeft', 70, true);
  assert.deepEqual(out.map((a) => a.type + (a.dir ? ':' + a.dir : '')), ['swipe:izq', 'swipe:der', 'swipe:abajo', 'tap', 'mic']);
});
