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

// ---------- Ranking (fase 2/D35) ----------

test("la duración que se envía cuenta solo los pasos jugados, no la espera inicial", () => {
  let e = H.nuevaPartida(9);
  for (let k = 0; k < 300; k++) e = H.paso(e, false);   // 5 s esperando el primer toque
  assert.strictEqual(H.duracionMs(e), 0);
  e = H.paso(e, true);
  for (let k = 0; k < 119; k++) e = H.paso(e, k % 34 === 33); // ritmo que se sostiene sin chocar
  assert.ok(e.vivo);
  assert.strictEqual(e.pasosJuego, 120);
  assert.strictEqual(H.duracionMs(e), 2000);
});

test("con el mejor ritmo posible, los puntos caben en el tope del servidor (ms_inicio + ms_por_punto)", () => {
  function piloto(e) { const t = e.torres.find((x) => x.x + H.ANCHO_TORRE >= H.X_COMETA - H.RADIO) || { centro: H.PISO / 2 }; return e.y > t.centro + 6 && e.vy >= 0; }
  let e = H.paso(H.nuevaPartida(3), true);
  for (let k = 0; k < 6000 && e.vivo; k++) {
    e = H.paso(e, piloto(e));
    assert.ok(e.puntos <= 1 + Math.max(0, H.duracionMs(e) - 2000) / 700, `${e.puntos} puntos en ${H.duracionMs(e)} ms`);
  }
});

// ---------- F29/D36: insignias y trajes ----------
const T = require("../assets/js/trivia/logica.js");
const HOY = new Date("2026-11-16T20:00:00-06:00");
const cerrar = (puntos, notas, partidas, notasTotales, estado) =>
  T.cerrarHalley(estado || T.estadoInicial(), { puntos, notas }, { partidas, notas: notasTotales }, HOY);

test("las 7 insignias de Halley Flip están en la colección con su familia", () => {
  const hal = T.INSIGNIAS.filter((i) => i.familia === "halley").map((i) => i.id);
  assert.deepStrictEqual(hal.sort(), ["algunas_plantas", "amante_guisante", "cuando_no_me_ves", "fantastic_shine", "manifiesto", "oniria", "poeta_halley"]);
  assert.ok(T.INSIGNIAS.find((i) => i.id === "cuando_no_me_ves").oculta);
});

test("cerrarHalley: primera partida, umbrales de puntos y totales", () => {
  assert.deepStrictEqual(cerrar(0, 0, 1, 0).nuevas, ["poeta_halley"]);
  assert.deepStrictEqual(cerrar(9, 1, 2, 1).nuevas, ["poeta_halley"]);
  assert.deepStrictEqual(cerrar(10, 1, 2, 1).nuevas, ["poeta_halley", "fantastic_shine"]);
  assert.deepStrictEqual(cerrar(25, 1, 2, 1).nuevas, ["poeta_halley", "fantastic_shine", "manifiesto"]);
  assert.deepStrictEqual(cerrar(50, 3, 2, 3).nuevas, ["poeta_halley", "fantastic_shine", "manifiesto", "amante_guisante"]);
  assert.ok(cerrar(1, 1, 10, 1).nuevas.includes("oniria"));
  assert.ok(!cerrar(1, 1, 9, 1).nuevas.includes("oniria"));
  assert.ok(cerrar(1, 1, 3, 100).nuevas.includes("algunas_plantas"));
  assert.ok(!cerrar(1, 1, 3, 99).nuevas.includes("algunas_plantas"));
});

test("cerrarHalley: la secreta pide 10 torres sin ninguna nota", () => {
  assert.ok(cerrar(10, 0, 1, 0).nuevas.includes("cuando_no_me_ves"));
  assert.ok(!cerrar(10, 1, 1, 1).nuevas.includes("cuando_no_me_ves"));
  assert.ok(!cerrar(9, 0, 1, 0).nuevas.includes("cuando_no_me_ves"));
});

test("cerrarHalley no repite insignias ni toca el estado anterior", () => {
  const r = cerrar(12, 2, 1, 2);
  const antes = JSON.stringify(r.estado);
  const r2 = cerrar(30, 2, 2, 4, r.estado);
  assert.deepStrictEqual(r2.nuevas, ["manifiesto"]);
  assert.strictEqual(JSON.stringify(r.estado), antes);
});

test("las insignias de Halley Flip no cuentan para El gran truco final", () => {
  const e = T.estadoInicial();
  T.INSIGNIAS.forEach((i) => { if (!["gran_truco", "ultimo_baile", "wio"].includes(i.id) && !["contrarreloj", "adivina", "concierto", "halley"].includes(i.familia)) e.insignias[i.id] = HOY.toISOString(); });
  assert.deepStrictEqual(T.registrarSecreto(e, "wio", HOY).nuevas, ["wio", "gran_truco"]);
});

test("catálogo de trajes: Aviador de inicio y uno por cada insignia que no es la primera", () => {
  assert.strictEqual(H.TRAJES.length, 7);
  assert.strictEqual(H.TRAJES[0].id, "aviador");
  assert.strictEqual(H.TRAJES[0].insignia, null);
  const ids = T.INSIGNIAS.map((i) => i.id);
  H.TRAJES.slice(1).forEach((t) => { assert.ok(t.nombre && t.descripcion, t.id); assert.ok(ids.includes(t.insignia), t.id); });
  assert.strictEqual(new Set(H.TRAJES.map((t) => t.insignia)).size, 7);
});

test("trajesDisponibles y trajeElegido siguen a las insignias y caen en Aviador", () => {
  assert.deepStrictEqual(H.trajesDisponibles({}), ["aviador"]);
  assert.deepStrictEqual(H.trajesDisponibles({ fantastic_shine: "x", poeta_halley: "x" }), ["aviador", "poeta"]);
  assert.strictEqual(H.trajeElegido("poeta", { fantastic_shine: "x" }), "poeta");
  assert.strictEqual(H.trajeElegido("poeta", {}), "aviador");
  assert.strictEqual(H.trajeElegido("inventado", { fantastic_shine: "x" }), "aviador");
  assert.strictEqual(H.trajeElegido(undefined, null), "aviador");
});

test("registrar conserva el traje elegido", () => {
  assert.strictEqual(H.registrar({ record: 3, partidas: 1, notas: 0, traje: "poeta" }, { puntos: 1, notas: 0 }).traje, "poeta");
  assert.strictEqual(H.registrar(null, { puntos: 1, notas: 0 }).traje, "aviador");
});
