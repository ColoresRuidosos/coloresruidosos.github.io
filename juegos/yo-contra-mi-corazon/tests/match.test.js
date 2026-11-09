// T2.1–T2.6: reglas de la pelea (lógica pura, sin pantalla)
import test from 'node:test';
import assert from 'node:assert/strict';
import { createMatch, step, rankOf } from '../src/game/match.js';
import { BEATMAP } from '../src/data/beatmap.js';
import { AVISO_BEATS, HEART_HP, HIT_DMG, CLOWN_HP, DMG, GRITO_MULT, PHASE_HEAL, TRANSITION_BEATS } from '../src/game/constants.js';

const DT = 1 / 60;
const run = (m, until, act = () => []) => { for (let t = m.t; t < until && !m.over; t += DT) step(m, t, act(m, t)); if (!m.over) step(m, until); return m; };
// avanza hasta que haya un ataque anunciado
function untilAttack(m, limit = 60) {
  const end = m.t + limit;
  for (let t = m.t; t < end && !m.over; t += DT) { step(m, t); if (m.heart.mode === 'ataque') return m.heart; }
  throw new Error('no llegó ningún ataque');
}
const dodge = (m, dir, t) => step(m, t, [{ type: 'swipe', dir, t }]);

test('T2.1 el primer ataque es el tutorial (gancho izq.), avisa 4 tiempos antes y pega en un tiempo par', () => {
  const m = createMatch({ beatmap: BEATMAP, seed: 1 });
  const h = untilAttack(m);
  assert.equal(h.attack, 'gIzq');
  const T = h.hits[0].T, b = m.clock.beatAt(T);
  assert.ok(Math.abs(b - Math.round(b)) < 1e-6 && Math.round(b) % 2 === 0, 'en el tiempo');
  assert.ok(Math.abs((T - h.avisoAt) / m.clock.beat - AVISO_BEATS[1]) < 1e-6);
  assert.ok(h.avisoAt >= BEATMAP.sections.find((s) => s.kind === 'fase1').from - 1e-6);
  assert.deepEqual(m.tutorial, ['gDer', 'latido'], 'quedan los otros dos del tutorial');
});

test('T2.1 misma semilla → misma secuencia de ataques', () => {
  const seq = (seed) => {
    const m = createMatch({ beatmap: BEATMAP, seed, assist: true }); const out = [];
    for (let t = 0; t < 150 && out.length < 14; t += DT) {
      const before = m.heart.attackId; step(m, t);
      if (m.heart.attackId !== before && m.heart.attack) out.push(m.heart.attack);
    }
    return out;
  };
  assert.deepEqual(seq(5), seq(5));
  assert.equal(seq(5).length, 14);
});

test('T2.2 esquivar al lado correcto abre la guardia; al lado equivocado, golpe', () => {
  const m = createMatch({ beatmap: BEATMAP, seed: 1 });
  let h = untilAttack(m); const T = h.hits[0].T;     // gIzq → hay que ir a la derecha
  dodge(m, 'der', T - 0.02); run(m, T + 0.3);
  assert.equal(m.heart.mode, 'abierto');
  assert.equal(m.stats.perfecto, 1);
  assert.equal(m.clown.hp, CLOWN_HP);
  run(m, m.heart.until + 0.01);
  h = untilAttack(m); const T2 = h.hits[0].T;        // gDer → hay que ir a la izquierda
  dodge(m, 'der', T2); run(m, T2 + 0.3);
  assert.equal(m.clown.hp, CLOWN_HP - HIT_DMG);
  assert.equal(m.heart.mode, 'recupera');
});

test('T2.2 el latido se esquiva agachándose, no de lado; la esquiva temprana salva pero no da perfecto', () => {
  const m = createMatch({ beatmap: BEATMAP, seed: 1 });
  for (let i = 0; i < 2; i++) { const h = untilAttack(m); dodge(m, h.hits[0].need[0], h.hits[0].T); run(m, h.hits[0].T + 0.3); run(m, m.heart.until + 0.01); }
  let h = untilAttack(m); assert.equal(h.attack, 'latido');
  dodge(m, 'izq', h.hits[0].T); run(m, h.hits[0].T + 0.3);
  assert.equal(m.clown.hp, CLOWN_HP - HIT_DMG);
  const m2 = createMatch({ beatmap: BEATMAP, seed: 1 });
  h = untilAttack(m2); dodge(m2, 'der', h.hits[0].T - 0.3); run(m2, h.hits[0].T + 0.3);
  assert.equal(m2.stats.temprano, 1); assert.equal(m2.heart.mode, 'abierto');
});

function openWindow(m) {
  const h = untilAttack(m); const T = h.hits[0].T;
  dodge(m, h.hits[0].need[0], T); run(m, T + 0.2);
  assert.equal(m.heart.mode, 'abierto'); return m;
}

test('T2.3 batazo en el tiempo = daño completo; fuera de tiempo = la mitad; el mismo tiempo dos veces o fuera de la ventana rebota', () => {
  const m = openWindow(createMatch({ beatmap: BEATMAP, seed: 1 }));
  const [b0] = m.heart.open; const hp0 = m.heart.hp[0];
  const tb = m.clock.timeOfBeat(b0);
  step(m, tb, [{ type: 'tap', t: tb }]);
  assert.equal(m.heart.hp[0], hp0 - DMG.perfecto);
  const tb2 = m.clock.timeOfBeat(b0 + 1) + 0.16;
  step(m, tb2, [{ type: 'tap', t: tb2 }]);
  assert.equal(m.heart.hp[0], hp0 - DMG.perfecto - DMG.fuera);
  step(m, tb2 + 0.01, [{ type: 'tap', t: tb2 - 0.1 }]);
  assert.equal(m.stats.rebotes, 1);
  run(m, m.heart.until + 0.01);
  const t = m.t; step(m, t, [{ type: 'tap', t }]);
  assert.equal(m.stats.rebotes, 2);
  assert.equal(m.combo, 0);
});

test('T2.4 cada 4 perfectos seguidos +1 estrella; un golpe quita una; con 5 el Grito aturde y triplica', () => {
  const m = createMatch({ beatmap: BEATMAP, seed: 1 });
  m.stars = 0; m.streak = 3; m.heart.hp[0] = 999;
  openWindow(m);                                     // 4.º perfecto
  assert.equal(m.stars, 1);
  m.stars = 5; run(m, m.heart.until + 0.01);
  const t = m.t; step(m, t, [{ type: 'mic', t }]);
  assert.equal(m.heart.mode, 'aturdido'); assert.equal(m.stars, 0);
  const b = m.heart.open[0], tb = m.clock.timeOfBeat(b), hp = m.heart.hp[0];
  step(m, tb, [{ type: 'tap', t: tb }]);
  assert.equal(m.heart.hp[0], hp - DMG.perfecto * GRITO_MULT);
  const m2 = createMatch({ beatmap: BEATMAP, seed: 1 }); m2.stars = 3;
  const h = untilAttack(m2); run(m2, h.hits[0].T + 0.3);
  assert.equal(m2.stars, 2);
});

test('T2.5 sin hacer nada el payaso cae: SE ACABÓ EL SHOW', () => {
  const m = run(createMatch({ beatmap: BEATMAP, seed: 2 }), BEATMAP.duration + 1);
  assert.equal(m.over, 'derrota'); assert.equal(m.clown.hp, 0);
});

test('T2.5 vaciar la barra de la fase 3 = K.O.; en asistido el payaso no pierde vida', () => {
  const m = createMatch({ beatmap: BEATMAP, seed: 3 });
  m.phase = 3; m.heart.hp = [0, 0, DMG.perfecto];
  openWindow(m);
  const tb = m.clock.timeOfBeat(m.heart.open[0]); step(m, tb, [{ type: 'tap', t: tb }]);
  assert.equal(m.over, 'ko'); assert.ok(m.score > 3000);
  const a = run(createMatch({ beatmap: BEATMAP, seed: 2, assist: true }), 100);
  assert.equal(a.clown.hp, CLOWN_HP); assert.equal(a.over, null);
});

test('T2.6 vaciar la fase 1 → transición de 8 tiempos → fase 2 y el payaso recupera vida', () => {
  const m = createMatch({ beatmap: BEATMAP, seed: 1 });
  m.clown.hp = 50; m.heart.hp[0] = DMG.perfecto;
  openWindow(m);
  const tb = m.clock.timeOfBeat(m.heart.open[0]); step(m, tb, [{ type: 'tap', t: tb }]);
  assert.equal(m.heart.mode, 'transicion');
  run(m, tb + TRANSITION_BEATS * m.clock.beat + 0.1);
  assert.equal(m.phase, 2); assert.equal(m.clown.hp, 50 + PHASE_HEAL);
});

test('T2.6 la canción manda: al llegar phase2At sin vaciar la barra, igual cambia de fase', () => {
  const m = run(createMatch({ beatmap: BEATMAP, seed: 4, assist: true }), BEATMAP.phase2At + 12);
  assert.equal(m.phase, 2);
  run(m, BEATMAP.phase3At + 12);
  assert.equal(m.phase, 3);
});

test('rangos por puntaje', () => {
  assert.equal(rankOf(0), 'TELONERO');
  assert.equal(rankOf(1e9), 'LEYENDA DEL CIRCO');
});
