// F28/D34: lógica pura de Halley Flip (física de un toque, torres, puntos, etapas y notas).
const test = require("node:test");
const assert = require("node:assert");
const H = require("../assets/js/halley/flip.js");

function correr(e, pasos, decidir) { for (let k = 0; k < pasos && e.vivo; k++) e = H.paso(e, decidir ? decidir(e) : false); return e; }
// Piloto automático para las pruebas: toca si va por debajo del centro del siguiente hueco.
function piloto(e) {
  const t = e.torres.find((x) => x.x + H.ANCHO_TORRE >= H.X_COMETA - H.RADIO) || { centro: H.PISO / 2 };
  return e.y > t.centro + 6 && e.vy >= 0;
}

test("antes del primer toque el cometa flota y no cae", () => {
  const e = correr(H.nuevaPartida(1), 120);
  assert.strictEqual(e.iniciada, false);
  assert.ok(Math.abs(e.y - H.ALTO / 2) < 4);
  assert.ok(e.vivo);
});

test("la gravedad acelera hasta la caída máxima y el toque da el impulso", () => {
  let e = H.paso(H.nuevaPartida(1), true);
  assert.strictEqual(e.vy, H.IMPULSO);
  for (let k = 0; k < 60; k++) e = H.paso(e, false);
  assert.strictEqual(e.vy, H.CAIDA_MAX);
});

test("misma semilla y mismos toques dan la misma partida; otra semilla, otras torres", () => {
  const toques = (e) => e.pasos % 23 === 0;
  const a = correr(H.paso(H.nuevaPartida(7), true), 400, toques), b = correr(H.paso(H.nuevaPartida(7), true), 400, toques);
  assert.deepStrictEqual(a.torres, b.torres);
  assert.strictEqual(a.y, b.y);
  const c = correr(H.paso(H.nuevaPartida(8), true), 400, toques);
  assert.notDeepStrictEqual(a.torres.map((t) => t.centro), c.torres.map((t) => t.centro));
});

test("el hueco de cada torre siempre cabe en la pantalla, en todas las etapas", () => {
  for (let etapa = 1; etapa <= 6; etapa++) {
    const rng = H.rngSemilla(etapa);
    for (let k = 0; k < 500; k++) {
      const t = H.nuevaTorre(200, etapa, rng);
      assert.ok(t.centro - t.hueco / 2 >= 10 && t.centro + t.hueco / 2 <= H.PISO - 10, JSON.stringify(t));
    }
  }
});

test("dos huecos seguidos nunca quedan a más de MAX_SALTO de altura (siempre da tiempo de llegar)", () => {
  const rng = H.rngSemilla(5);
  let prev = 70;
  for (let k = 0; k < 2000; k++) {
    const t = H.nuevaTorre(0, 1 + (k % 6), rng, prev);
    assert.ok(Math.abs(t.centro - prev) <= H.MAX_SALTO, prev + " → " + t.centro);
    prev = t.centro;
  }
});

test("con buen pulso se pasan torres y cada una suma un punto", () => {
  const e = correr(H.paso(H.nuevaPartida(3), true), 4000, piloto);
  assert.ok(e.vivo, "el piloto no debería chocar");
  assert.ok(e.puntos >= 25, "puntos: " + e.puntos);
  assert.strictEqual(e.puntos, e.torres.filter((t) => t.pasada).length + e.retiradas);
});

test("sin tocar se choca con el piso; tocando sin parar, con el techo", () => {
  const abajo = correr(H.paso(H.nuevaPartida(2), true), 600);
  assert.ok(!abajo.vivo && abajo.y + H.RADIO >= H.PISO - H.CAIDA_MAX);
  const arriba = correr(H.paso(H.nuevaPartida(2), true), 600, () => true);
  assert.ok(!arriba.vivo && arriba.y - H.RADIO <= 0 + Math.abs(H.IMPULSO));
});

test("chocar con una torre termina la partida", () => {
  const e = H.paso(H.nuevaPartida(4), true);
  e.torres = [{ x: H.X_COMETA - 4, centro: 20, hueco: 30, pasada: false }];
  assert.strictEqual(H.paso(e, false).vivo, false);
});

test("la etapa cambia cada 10 puntos; velocidad y hueco tienen tope", () => {
  assert.deepStrictEqual([0, 9, 10, 19, 20, 49, 50, 99].map(H.etapa), [1, 1, 2, 2, 3, 5, 6, 6]);
  assert.ok(H.velocidad(1) < H.velocidad(6) && H.velocidad(6) <= 1.5);
  assert.ok(H.hueco(1) > H.hueco(6) && H.hueco(6) >= 38);
});

test("tocar una nota la recoge una sola vez", () => {
  let e = H.paso(H.nuevaPartida(5), true);
  e.torres = [];
  e.notas = [{ x: H.X_COMETA, y: e.y }];
  e = H.paso(e, false);
  assert.strictEqual(e.notasTomadas, 1);
  assert.strictEqual(e.notas.length, 0);
});

test("el récord se queda con lo mejor y el texto para compartir no revela nada raro", () => {
  let r = H.registrar(undefined, { puntos: 12, notas: 3 });
  r = H.registrar(r, { puntos: 7, notas: 9 });
  assert.deepStrictEqual({ record: r.record, partidas: r.partidas }, { record: 12, partidas: 2 });
  assert.strictEqual(H.textoCompartir({ puntos: 23, notas: 7 }),
    "Halley Flip · 23 puntos · etapa 3 · 7 notas\n¿Me ganas? coloresruidosos.github.io/games/halley-flip/ · @coloresruidosos");
});
