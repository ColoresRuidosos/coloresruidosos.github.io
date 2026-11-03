const test = require("node:test");
const assert = require("node:assert");
const datos = require("../data/canciones.json");
const C = require("../assets/js/trivia/contrarreloj.js");
const T = require("../assets/js/trivia/logica.js");

function rngSemilla(semilla) {
  let s = semilla >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const IDS = datos.discos.map((d) => d.id);
const T0 = 1_000_000;

// ---------- Contrato de data/canciones.json ----------

test("hay 10 discos de estudio, cada uno con nombre, año, etapa y fuentes", () => {
  assert.strictEqual(datos.discos.length, 10);
  datos.discos.forEach((d) => {
    assert.ok(d.id && d.nombre && d.anio >= 1999 && /^E[1-6]$/.test(d.etapa) && d.fuentes.length, d.id);
  });
});

test("cada canción cumple el contrato", () => {
  datos.canciones.forEach((c) => assert.deepStrictEqual(C.validarCancion(c, datos.discos), [], c.id));
});

test("no hay títulos repetidos ni canciones que se llamen como su disco", () => {
  const titulos = datos.canciones.map((c) => c.titulo.toLowerCase());
  assert.strictEqual(new Set(titulos).size, titulos.length);
  const malo = { id: "X01", titulo: "1999", disco: "99", fuerza: "solida", estado: "propuesta", fuentes: ["https://a.com", "https://b.com"] };
  assert.ok(C.validarCancion(malo, datos.discos).length > 0);
  assert.ok(C.validarCancion({ ...malo, titulo: "Algo", disco: "ZZ" }, datos.discos).length > 0);
  assert.ok(C.validarCancion({ ...malo, titulo: "Algo", fuentes: [] }, datos.discos).length > 0);
  assert.ok(C.validarCancion({ ...malo, titulo: "Algo", fuentes: ["https://a.com"] }, datos.discos).length > 0, "sólida con una fuente");
  assert.deepStrictEqual(C.validarCancion({ ...malo, titulo: "Algo" }, datos.discos), []);
});

test("solo se juegan las de fuente sólida (o verificadas fuera de borrador) y hay suficientes", () => {
  const jug = C.jugables(datos);
  assert.ok(jug.length >= 60);
  assert.ok(jug.every((c) => c.fuerza === "solida"));
  const fuera = C.jugables({ ...datos, borrador: false });
  assert.ok(fuera.every((c) => c.estado === "verificada"));
});

// ---------- Opciones y sorteo ----------

test("las opciones son 4 discos distintos con el correcto una sola vez", () => {
  const rng = rngSemilla(4);
  C.jugables(datos).forEach((c) => {
    const o = C.opciones(c, datos.discos, rng);
    assert.strictEqual(o.length, 4);
    assert.strictEqual(new Set(o).size, 4);
    assert.strictEqual(o.filter((x) => x === c.disco).length, 1);
    o.forEach((x) => assert.ok(IDS.includes(x)));
  });
});

test("una partida no repite canciones y la misma semilla da el mismo orden", () => {
  const jug = C.jugables(datos);
  const p = C.nuevaPartida(jug, rngSemilla(7), T0);
  assert.strictEqual(p.orden.length, jug.length);
  assert.strictEqual(new Set(p.orden.map((c) => c.id)).size, jug.length);
  assert.deepStrictEqual(C.nuevaPartida(jug, rngSemilla(7), T0).orden.map((c) => c.id), p.orden.map((c) => c.id));
});

// ---------- Puntos y racha ----------

test("multiplicador: ×1 hasta 4 seguidas, ×2 desde 5, ×3 desde 10", () => {
  assert.deepStrictEqual([1, 4, 5, 9, 10, 25].map(C.multiplicador), [1, 1, 2, 2, 3, 3]);
});

test("cada acierto suma según la racha y un error la corta", () => {
  const jug = C.jugables(datos);
  let p = C.nuevaPartida(jug, rngSemilla(1), T0);
  const ganados = [];
  for (let k = 0; k < 10; k++) {
    const r = C.responder(p, p.orden[p.i].disco, T0 + 1000 * (k + 1));
    ganados.push(r.ganados);
    p = r.partida;
  }
  assert.deepStrictEqual(ganados, [1, 1, 1, 1, 2, 2, 2, 2, 2, 3]);
  assert.strictEqual(p.puntos, 17);
  assert.strictEqual(p.racha, 10);
  const otro = IDS.find((x) => x !== p.orden[p.i].disco);
  const r = C.responder(p, otro, T0 + 12000);
  assert.strictEqual(r.acierto, false);
  assert.strictEqual(r.ganados, 0);
  assert.strictEqual(r.correcto, p.orden[p.i].disco);
  assert.strictEqual(r.partida.racha, 0);
  assert.strictEqual(r.partida.mejorRacha, 10);
  assert.strictEqual(r.partida.aciertos, 10);
  assert.strictEqual(r.partida.errores, 1);
  assert.strictEqual(r.partida.i, 11);
});

// ---------- Reloj ----------

test("el reloj dura 60 s y cada error resta 3 s, sin bajar de 0", () => {
  const jug = C.jugables(datos);
  let p = C.nuevaPartida(jug, rngSemilla(2), T0);
  assert.strictEqual(C.restanteMs(p, T0), 60000);
  assert.strictEqual(C.restanteMs(p, T0 + 20000), 40000);
  const otro = IDS.find((x) => x !== p.orden[0].disco);
  p = C.responder(p, otro, T0 + 20000).partida;
  assert.strictEqual(C.restanteMs(p, T0 + 20000), 37000);
  assert.ok(!C.terminada(p, T0 + 56999));
  assert.ok(C.terminada(p, T0 + 57000));
  assert.strictEqual(C.restanteMs(p, T0 + 90000), 0);
});

test("la partida termina si se acaba el banco aunque quede tiempo", () => {
  const dos = C.jugables(datos).slice(0, 2);
  let p = C.nuevaPartida(dos, rngSemilla(3), T0);
  p = C.responder(p, p.orden[0].disco, T0 + 100).partida;
  assert.ok(!C.terminada(p, T0 + 200));
  p = C.responder(p, p.orden[1].disco, T0 + 200).partida;
  assert.ok(C.terminada(p, T0 + 300));
});

test("no se puede responder con la partida terminada", () => {
  const jug = C.jugables(datos);
  const p = C.nuevaPartida(jug, rngSemilla(5), T0);
  const r = C.responder(p, p.orden[0].disco, T0 + 61000);
  assert.strictEqual(r.ganados, 0);
  assert.strictEqual(r.partida, p);
});

// ---------- Insignias y estado (logica.js) ----------

const BASE = new Date("2026-12-01T18:00:00Z");
const resumen = (aciertos, mejorRacha, puntos) => ({ aciertos, mejorRacha, puntos });

test("Psiconautas en la primera partida de contrarreloj, no en la segunda", () => {
  const r1 = T.cerrarContrarreloj(T.estadoInicial(), resumen(0, 0, 0), BASE);
  assert.ok(r1.nuevas.includes("psiconautas"));
  assert.ok(!T.cerrarContrarreloj(r1.estado, resumen(0, 0, 0), BASE).nuevas.includes("psiconautas"));
});

test("Los seres únicos con 10 seguidas, no con 9", () => {
  assert.ok(T.cerrarContrarreloj(T.estadoInicial(), resumen(10, 10, 17), BASE).nuevas.includes("seres_unicos"));
  assert.ok(!T.cerrarContrarreloj(T.estadoInicial(), resumen(12, 9, 15), BASE).nuevas.includes("seres_unicos"));
});

test("Radio Himalaya con 20 aciertos en una partida, no con 19", () => {
  assert.ok(T.cerrarContrarreloj(T.estadoInicial(), resumen(20, 3, 20), BASE).nuevas.includes("radio_himalaya"));
  assert.ok(!T.cerrarContrarreloj(T.estadoInicial(), resumen(19, 3, 19), BASE).nuevas.includes("radio_himalaya"));
});

test("Cosmos al acumular 100 canciones acertadas entre partidas", () => {
  let e = T.estadoInicial(), r;
  for (let k = 0; k < 4; k++) { r = T.cerrarContrarreloj(e, resumen(24, 3, 24), BASE); e = r.estado; } // 96
  assert.ok(!e.insignias.cosmos);
  r = T.cerrarContrarreloj(e, resumen(4, 2, 4), BASE); // 100
  assert.ok(r.nuevas.includes("cosmos"));
  assert.strictEqual(r.estado.crAciertos, 100);
});

test("el récord del contrarreloj se guarda y se avisa cuando se supera", () => {
  const r1 = T.cerrarContrarreloj(T.estadoInicial(), resumen(10, 5, 14), BASE);
  assert.strictEqual(r1.estado.crRecord, 14);
  assert.strictEqual(r1.record, true);
  const r2 = T.cerrarContrarreloj(r1.estado, resumen(8, 4, 9), BASE);
  assert.strictEqual(r2.estado.crRecord, 14);
  assert.strictEqual(r2.record, false);
  assert.strictEqual(r2.estado.crPartidas, 2);
});

test("un estado guardado antes del contrarreloj se lee con los campos nuevos en 0", () => {
  const viejo = { v: 1, partidas: 2, aciertos: 9, mejorPuntaje: 12, mejorNivel: 1, insignias: {}, portadas: [] };
  const e = T.cargarEstado({ getItem: () => JSON.stringify(viejo), setItem: () => {} });
  assert.strictEqual(e.crPartidas, 0);
  assert.strictEqual(e.crAciertos, 0);
  assert.strictEqual(e.crRecord, 0);
});

test("las insignias del contrarreloj no cuentan para El gran truco final", () => {
  const e = T.estadoInicial();
  T.INSIGNIAS.forEach((i) => { if (!["gran_truco", "ultimo_baile", "wio"].includes(i.id) && i.familia !== "contrarreloj") e.insignias[i.id] = BASE.toISOString(); });
  assert.deepStrictEqual(T.registrarSecreto(e, "wio", BASE).nuevas, ["wio", "gran_truco"]);
});
