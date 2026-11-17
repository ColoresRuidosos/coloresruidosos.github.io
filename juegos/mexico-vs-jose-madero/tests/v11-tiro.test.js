// v11 · Minijuego «Tiro de frases» (spec §3.0f Q v11; tarea AL13). Lógica pura.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTiro, stepTiro, LANES } from '../src/game/tiro.js';
import { TIRO } from '../src/game/constants.js';
import { TIRO_MALAS, TIRO_BUENAS } from '../src/data/alba-story.js';

const NO = { left: false, right: false, jump: false, mic: false, tap: null };
const run = (T, secs, inp = NO) => { const ev = []; for (let i = 0; i < Math.round(secs * 60); i++) ev.push(...stepTiro(T, inp)); return ev; };
const play = () => { const T = createTiro(); run(T, TIRO.intro + 0.05); return T; };
const put = (T, malo, x = 100, lane = 1) => {
  const text = malo ? TIRO_MALAS[0] : TIRO_BUENAS[0], w = text.length * 6 + 8;
  const f = { text, mala: malo, x, y: LANES[lane], w, h: 13, vx: 0 };
  T.frases.push(f); return f;
};

test('frases: 8 malas y 4 buenas (títulos de Alba), todas caben en pantalla', () => {
  assert.equal(TIRO_MALAS.length, 8); assert.equal(TIRO_BUENAS.length, 4);
  for (const f of [...TIRO_MALAS, ...TIRO_BUENAS]) assert.ok(f.length * 6 + 8 <= 300, f);
});

test('empieza con una presentación y luego salen frases por los 3 carriles, en ambos sentidos', () => {
  const T = createTiro();
  assert.equal(T.status, 'intro');
  run(T, TIRO.intro + 0.05); assert.equal(T.status, 'play');
  const seen = new Set(), dirs = new Set();
  for (let i = 0; i < 60 * 10; i++) { stepTiro(T, NO); for (const f of T.frases) { seen.add(f.y); dirs.add(Math.sign(f.vx)); } }
  assert.equal(seen.size, 3); assert.ok(dirs.has(1) && dirs.has(-1));
});

test('las frases no se enciman: en cada carril hay hueco entre una y otra', () => {
  const T = play();
  for (let i = 0; i < 60 * 25; i++) {
    stepTiro(T, NO);
    for (const y of LANES) {
      const fs = T.frases.filter((f) => f.y === y).sort((a, b) => a.x - b.x);
      for (let k = 1; k < fs.length; k++) assert.ok(fs[k].x - (fs[k - 1].x + fs[k - 1].w) >= 12, `carril ${y}: ${fs[k - 1].text} / ${fs[k].text}`);
    }
  }
});

test('determinista: misma partida, mismas frases', () => {
  const seq = () => { const T = play(); const out = []; for (let i = 0; i < 600; i++) { const n = T.spawned; stepTiro(T, NO); if (T.spawned > n) out.push(T.frases.at(-1).text + T.frases.at(-1).y); } return out.join('|'); };
  assert.equal(seq(), seq());
});

test('la mira: ◀ ▶ la mueven, A cambia de carril; no sale de la pantalla', () => {
  const T = play(); const x0 = T.cross.x;
  run(T, 0.5, { ...NO, right: true }); assert.ok(T.cross.x > x0 + 60);
  run(T, 5, { ...NO, right: true }); assert.ok(T.cross.x <= 320);
  const l0 = T.lane; stepTiro(T, { ...NO, jump: true }); stepTiro(T, NO);
  assert.equal(T.lane, (l0 + 1) % 3); assert.equal(T.cross.y, LANES[T.lane]);
});

test('B dispara donde está la mira: frase mala +1; buena cuenta en contra; al aire es fallo', () => {
  const T = play(); T.frases = []; T.spawnT = 99;
  const m = put(T, true, T.cross.x - 10, T.lane);
  let ev = stepTiro(T, { ...NO, mic: true }); stepTiro(T, NO);
  assert.equal(T.malas, 1); assert.ok(ev.includes('tiro:mala')); assert.ok(!T.frases.includes(m));
  put(T, false, T.cross.x - 10, T.lane);
  ev = stepTiro(T, { ...NO, mic: true }); stepTiro(T, NO);
  assert.equal(T.buenas, 1); assert.ok(ev.includes('tiro:buena'));
  ev = stepTiro(T, { ...NO, mic: true });
  assert.ok(ev.includes('tiro:fallo'));
});

test('tocar la pantalla dispara en ese punto (celular y ratón)', () => {
  const T = play(); T.frases = []; T.spawnT = 99;
  const f = put(T, true, 40, 2);
  const ev = stepTiro(T, { ...NO, tap: { x: 45, y: LANES[2] + 4 } });
  assert.ok(ev.includes('tiro:mala')); assert.ok(!T.frases.includes(f));
});

test('ganas con 10 malas antes de 30 s; pierdes con 3 buenas o si se acaba el tiempo', () => {
  const W = play(); W.spawnT = 99;
  for (let k = 0; k < TIRO.goal; k++) { put(W, true, W.cross.x - 10, W.lane); stepTiro(W, { ...NO, mic: true }); stepTiro(W, NO); }
  assert.equal(W.status, 'won');
  const B = play(); B.spawnT = 99;
  for (let k = 0; k < TIRO.maxGood; k++) { put(B, false, B.cross.x - 10, B.lane); stepTiro(B, { ...NO, mic: true }); stepTiro(B, NO); }
  assert.equal(B.status, 'lost');
  const T = play(); run(T, TIRO.dur + 0.1);
  assert.equal(T.status, 'lost');
});

test('un jugador que apunta bien (bot de toques) gana en tiempo', () => {
  const T = play();
  for (let i = 0; i < 60 * TIRO.dur && T.status === 'play'; i++) {
    const f = i % 12 === 0 && T.frases.find((q) => q.mala && q.x > 0 && q.x + q.w < 320);
    stepTiro(T, { ...NO, tap: f ? { x: f.x + f.w / 2, y: f.y + 6 } : null });
  }
  assert.equal(T.status, 'won');
});
