const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const R = require("../assets/js/trivia/ranking.js");

// Code.gs se carga en un contexto aislado, sin servicios de Google: solo se prueban sus funciones puras.
const GS = (() => {
  const ctx = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../docs/ranking/Code.gs"), "utf8"), ctx);
  return ctx;
})();

function rngSemilla(semilla) {
  let s = semilla >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const fila = (nombre, puntos, duracionMs, fecha, modo = "trivia") => ({ nombre, puntos, duracionMs, fecha, modo });

// ---------- Nombres generados ----------

test("el cliente y el Apps Script usan las mismas listas de palabras", () => {
  assert.deepStrictEqual([...GS.SUSTANTIVOS], R.SUSTANTIVOS);
  assert.deepStrictEqual([...GS.COMPLEMENTOS], R.COMPLEMENTOS);
  assert.ok(R.SUSTANTIVOS.length >= 10 && R.COMPLEMENTOS.length >= 10);
});

test("un nombre generado tiene la forma «Sustantivo complemento #n» y pasa la validación de los dos lados", () => {
  const rng = rngSemilla(9);
  for (let k = 0; k < 200; k++) {
    const n = R.generarNombre(rng);
    assert.match(n, / #\d{1,2}$/);
    assert.ok(R.nombreValido(n), n);
    assert.ok(GS.nombreValido(n), n);
  }
});

test("un nombre escrito a mano no pasa", () => {
  ["Edgar", "Psiconauta del Ártico", "Psiconauta del Ártico #100", "Psiconauta del Ártico #0", "<b>Poeta</b> de Halley #3", "Poeta de Halley #3 "]
    .forEach((n) => {
      assert.ok(!R.nombreValido(n), n);
      assert.ok(!GS.nombreValido(n), n);
    });
});

test("volver a tirar la ruleta da otro nombre", () => {
  const rng = rngSemilla(3);
  const a = R.generarNombre(rng), b = R.generarNombre(rng, a);
  assert.notStrictEqual(a, b);
});

// ---------- Semana en hora de CDMX ----------

test("la semana va de lunes a domingo en hora de CDMX", () => {
  // Domingo 8 de noviembre de 2026, 23:30 en CDMX = lunes 9, 05:30 UTC: sigue siendo la semana 45.
  assert.strictEqual(R.semanaCDMX(new Date("2026-11-09T05:30:00Z")), "2026-W45");
  // Lunes 9 de noviembre, 00:00 en CDMX = 06:00 UTC: empieza la semana 46.
  assert.strictEqual(R.semanaCDMX(new Date("2026-11-09T06:00:00Z")), "2026-W46");
  assert.strictEqual(R.semanaCDMX(new Date("2027-01-01T18:00:00Z")), "2026-W53");
  assert.strictEqual(GS.semanaCDMX(new Date("2026-11-09T06:00:00Z")), "2026-W46");
});

// ---------- Orden ----------

test("ordena por puntos, luego por la partida más rápida y luego por la más antigua; cada nombre una vez", () => {
  const filas = [
    fila("A de Halley #1", 20, 90000, "2026-11-03T10:00:00Z"),
    fila("B de Halley #1", 25, 120000, "2026-11-03T10:00:00Z"),
    fila("C de Halley #1", 25, 80000, "2026-11-03T12:00:00Z"),
    fila("D de Halley #1", 25, 80000, "2026-11-03T11:00:00Z"),
    fila("B de Halley #1", 28, 200000, "2026-11-04T10:00:00Z"),
  ];
  const orden = (x) => x.map((f) => f.nombre + ":" + f.puntos);
  const esperado = ["B de Halley #1:28", "D de Halley #1:25", "C de Halley #1:25", "A de Halley #1:20"];
  assert.deepStrictEqual(orden(R.ordenar(filas, 20)), esperado);
  assert.deepStrictEqual(orden(GS.ordenar(filas, 20)), esperado);
  assert.strictEqual(R.ordenar(filas, 2).length, 2);
});

test("el Apps Script arma el top de la semana y el histórico por modo", () => {
  const ahora = new Date("2026-11-10T18:00:00Z"); // semana 46
  const filas = [
    fila("Poeta de Halley #1", 30, 60000, "2026-11-02T18:00:00Z"),          // semana 45
    fila("Cometa de Nieve #2", 22, 70000, "2026-11-09T18:00:00Z"),          // semana 46
    fila("Cometa de Nieve #3", 18, 70000, "2026-11-10T18:00:00Z"),          // semana 46
    fila("Satélite del Volcán #4", 99, 70000, "2026-11-10T18:00:00Z", "contrarreloj"),
  ].map((f) => ({ ...f, semana: GS.semanaCDMX(new Date(f.fecha)) }));
  const t = GS.tops(filas, "trivia", ahora);
  assert.deepStrictEqual(t.semana.map((f) => f.nombre), ["Cometa de Nieve #2", "Cometa de Nieve #3"]);
  assert.deepStrictEqual(t.historico.map((f) => f.nombre), ["Poeta de Halley #1", "Cometa de Nieve #2", "Cometa de Nieve #3"]);
  assert.deepStrictEqual(Object.keys(t.semana[0]).sort(), ["duracionMs", "nombre", "puntos"]);
});

// ---------- Validación del envío (Apps Script) ----------

test("el Apps Script acepta un envío válido y rechaza lo imposible", () => {
  const nombre = R.generarNombre(rngSemilla(1));
  const bueno = R.armarEnvio("trivia", nombre, 24, 95000, "a1b2c3d4e5f6");
  assert.strictEqual(GS.validarEnvio(bueno), "");
  const malos = [
    { ...bueno, modo: "otro" },
    { ...bueno, puntos: 31 },
    { ...bueno, puntos: -1 },
    { ...bueno, puntos: 12.5 },
    { ...bueno, duracionMs: 5000 },
    { ...bueno, duracionMs: 4000000 },
    { ...bueno, nombre: "Edgar" },
    { ...bueno, dispositivo: "x" },
    { ...bueno, dispositivo: "<script>" },
  ];
  malos.forEach((m) => assert.notStrictEqual(GS.validarEnvio(m), "", JSON.stringify(m)));
  assert.notStrictEqual(GS.validarEnvio(null), "");
});

test("el identificador del navegador es aleatorio y no lleva datos personales", () => {
  const id = R.nuevoDispositivo(rngSemilla(5));
  assert.match(id, /^[a-z0-9]{16}$/);
  assert.notStrictEqual(id, R.nuevoDispositivo(rngSemilla(6)));
});

test("el tiempo se muestra como m:ss", () => {
  assert.strictEqual(R.formatoTiempo(95000), "1:35");
  assert.strictEqual(R.formatoTiempo(59000), "0:59");
  assert.strictEqual(R.formatoTiempo(600000), "10:00");
});

// ---------- Modos contrarreloj y adivina (F21/D27) ----------

test("el Apps Script valida los límites de cada modo", () => {
  const nombre = R.generarNombre(rngSemilla(2));
  const env = (modo, puntos, duracionMs) => R.armarEnvio(modo, nombre, puntos, duracionMs, "a1b2c3d4e5f6");
  assert.strictEqual(GS.validarEnvio(env("contrarreloj", 194, 60000)), "");
  assert.notStrictEqual(GS.validarEnvio(env("contrarreloj", 401, 60000)), "");
  assert.notStrictEqual(GS.validarEnvio(env("contrarreloj", 20, 2000)), "");
  assert.notStrictEqual(GS.validarEnvio(env("contrarreloj", 20, 120000)), "");
  assert.strictEqual(GS.validarEnvio(env("adivina", 43, 95000)), "");
  assert.notStrictEqual(GS.validarEnvio(env("adivina", 61, 95000)), "");
  assert.notStrictEqual(GS.validarEnvio(env("adivina", 43, 1000)), "");
});

test("Adivina la canción: tablas Hoy, Semana (suma, una ronda por día) y Mejor racha", () => {
  const ahora = new Date("2026-11-11T18:00:00Z"); // miércoles 11 de noviembre en CDMX, semana 46
  const f = (nombre, puntos, ms, iso) => ({ nombre, puntos, duracionMs: ms, fecha: iso, modo: "adivina" });
  const filas = [
    f("Poeta de Halley #1", 40, 90000, "2026-11-09T18:00:00Z"),
    f("Poeta de Halley #1", 35, 80000, "2026-11-10T18:00:00Z"),
    f("Poeta de Halley #1", 50, 70000, "2026-11-11T17:00:00Z"),
    f("Poeta de Halley #1", 60, 10000, "2026-11-11T17:30:00Z"),   // segunda ronda del mismo día: no cuenta
    f("Cometa de Nieve #2", 55, 60000, "2026-11-11T16:00:00Z"),
    f("Cometa de Nieve #2", 58, 50000, "2026-11-08T18:00:00Z"),   // domingo: semana anterior
    f("Antena del Japón #3", 0, 0, "2026-11-11T15:00:00Z"),
    f("Antena del Japón #3", 20, 99000, "2026-11-10T15:00:00Z"),
    { ...f("Fan de Sed #4", 30, 1, "2026-11-11T15:00:00Z"), modo: "trivia" },
  ];
  const t = GS.topsAdivina(filas, ahora);
  assert.deepStrictEqual([...t.hoy].map((x) => x.nombre + ":" + x.puntos), ["Cometa de Nieve #2:55", "Poeta de Halley #1:50", "Antena del Japón #3:0"]);
  assert.deepStrictEqual([...t.semana].map((x) => x.nombre + ":" + x.puntos + ":" + x.dias),
    ["Poeta de Halley #1:125:3", "Cometa de Nieve #2:55:1", "Antena del Japón #3:20:2"]);
  assert.deepStrictEqual([...t.racha].map((x) => x.nombre + ":" + x.racha), ["Poeta de Halley #1:3", "Cometa de Nieve #2:1"]);
});

test("la racha del ranking se rompe si falta un día o si el último día fue hace más de uno", () => {
  const f = (nombre, puntos, iso) => ({ nombre, puntos, duracionMs: 1000, fecha: iso, modo: "adivina" });
  const filas = [f("A de Halley #1", 10, "2026-11-07T18:00:00Z"), f("A de Halley #1", 10, "2026-11-09T18:00:00Z"),
    f("A de Halley #1", 10, "2026-11-10T18:00:00Z"), f("B de Halley #1", 10, "2026-11-08T18:00:00Z")];
  const t = GS.topsAdivina(filas, new Date("2026-11-11T18:00:00Z"));
  assert.deepStrictEqual([...t.racha].map((x) => x.nombre + ":" + x.racha), ["A de Halley #1:2"]);
});
