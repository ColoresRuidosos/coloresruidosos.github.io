const test = require("node:test");
const assert = require("node:assert");
const datos = require("../datos.json");
const L = require("../linea.js");

function artista(extra) {
  return Object.assign({
    id: "x", nombre: "X", fecha: "2026-06-05", pais: "AR",
    proyectos: ["Banda"], linea: "Una línea propia.",
    fuentes: ["https://a.com/1", "https://b.com/2"],
  }, extra);
}

// ---------- Contrato de datos.json ----------

test("cada artista cumple el contrato", () => {
  assert.ok(datos.artistas.length > 0);
  datos.artistas.forEach((a) => assert.deepStrictEqual(L.validar(a), [], a.id));
});

test("ids únicos y lista en orden cronológico", () => {
  const ids = datos.artistas.map((a) => a.id);
  assert.strictEqual(new Set(ids).size, ids.length);
  assert.deepStrictEqual(L.ordenar(datos.artistas).map((a) => a.id), ids);
});

test("una entrada completa no tiene errores", () => {
  assert.deepStrictEqual(L.validar(artista()), []);
  assert.deepStrictEqual(L.validar(artista({ fecha: "2026-01" })), []);
});

test("solo 2026", () => {
  ["2025-12-10", "2027-01-01", "2026", "1985-09-19"].forEach((f) => {
    assert.ok(L.validar(artista({ fecha: f })).length > 0, f);
  });
});

test("fechas reales", () => {
  ["2026-02-30", "2026-13", "2026-1-8", "08/01/2026", ""].forEach((f) => {
    assert.ok(L.validar(artista({ fecha: f })).length > 0, f);
  });
});

test("faltan campos obligatorios", () => {
  ["id", "nombre", "fecha", "pais", "proyectos", "linea", "fuentes"].forEach((c) => {
    const a = artista();
    delete a[c];
    assert.ok(L.validar(a).length > 0, c);
  });
});

test("al menos dos fuentes https distintas", () => {
  assert.ok(L.validar(artista({ fuentes: ["https://a.com/1"] })).length > 0);
  assert.ok(L.validar(artista({ fuentes: ["https://a.com/1", "https://a.com/1"] })).length > 0);
  assert.ok(L.validar(artista({ fuentes: ["https://a.com/1", "http://b.com/2"] })).length > 0);
});

test("país hispanohablante (Brasil fuera)", () => {
  assert.ok(L.validar(artista({ pais: "BR" })).length > 0);
  assert.ok(L.validar(artista({ pais: "US" })).length > 0);
  ["MX", "ES", "UY", "PE", "CL"].forEach((p) => assert.deepStrictEqual(L.validar(artista({ pais: p })), [], p));
});

test("línea corta y sin causa de muerte", () => {
  assert.ok(L.validar(artista({ linea: "a".repeat(71) })).length > 0);
  assert.deepStrictEqual(L.validar(artista({ linea: "a".repeat(70) })), []);
  ["Murió de cáncer", "Tras un accidente", "Fue asesinado", "Neumonía", "infarto", "homicidio"].forEach((s) => {
    assert.ok(L.validar(artista({ linea: s })).length > 0, s);
  });
});

test("id con formato de slug", () => {
  assert.ok(L.validar(artista({ id: "Indio Solari" })).length > 0);
});

// ---------- Orden y fechas legibles ----------

test("ordena por fecha; el mes sin día va al final de su mes", () => {
  const lista = [
    artista({ id: "c", fecha: "2026-09" }),
    artista({ id: "a", fecha: "2026-01" }),
    artista({ id: "b", fecha: "2026-01-08" }),
    artista({ id: "d", fecha: "2026-09-30" }),
  ];
  assert.deepStrictEqual(L.ordenar(lista).map((a) => a.id), ["b", "a", "d", "c"]);
  assert.strictEqual(lista[0].id, "c", "no muta");
});

test("fecha legible en español", () => {
  assert.strictEqual(L.fechaTexto("2026-01-08"), "8 de enero");
  assert.strictEqual(L.fechaTexto("2026-10-23"), "23 de octubre");
  assert.strictEqual(L.fechaTexto("2026-05"), "mayo");
});

test("nombre del país", () => {
  assert.strictEqual(L.paisTexto("MX"), "México");
  assert.strictEqual(L.paisTexto("ES"), "España");
});

// ---------- Línea de tiempo ----------

test("duración total = intro + tramos + cierre", () => {
  const n = 15;
  assert.strictEqual(L.duracion(n), L.T.INTRO + n * L.T.TRAMO + L.T.CIERRE);
  assert.ok(L.duracion(n) <= 90, "Reels: hasta 90 s");
});

test("escena para cada instante, con límites exactos", () => {
  const n = 3;
  assert.deepStrictEqual(L.escena(0, n), { tipo: "intro", indice: -1, local: 0, progreso: 0 });
  const e0 = L.escena(L.T.INTRO, n);
  assert.strictEqual(e0.tipo, "artista");
  assert.strictEqual(e0.indice, 0);
  assert.strictEqual(e0.local, 0);
  const e2 = L.escena(L.T.INTRO + 2 * L.T.TRAMO + 1, n);
  assert.strictEqual(e2.indice, 2);
  assert.ok(Math.abs(e2.local - 1) < 1e-9);
  assert.strictEqual(L.escena(L.T.INTRO + 3 * L.T.TRAMO, n).tipo, "cierre");
  const fin = L.escena(L.duracion(n) + 5, n);
  assert.strictEqual(fin.tipo, "cierre");
  assert.strictEqual(fin.progreso, 1, "después del final se queda en el último cuadro");
  assert.strictEqual(L.escena(-1, n).tipo, "intro");
});

test("veladoras encendidas en cada instante", () => {
  const n = 4;
  assert.strictEqual(L.encendidas(0, n), 0);
  assert.strictEqual(L.encendidas(L.T.INTRO + 0.1, n), 0, "se enciende un momento después de entrar");
  assert.strictEqual(L.encendidas(L.T.INTRO + L.T.ENCENDER + 0.01, n), 1);
  assert.strictEqual(L.encendidas(L.T.INTRO + 2 * L.T.TRAMO + 2, n), 3);
  assert.strictEqual(L.encendidas(L.duracion(n), n), n);
});

test("cuadrícula de la ofrenda", () => {
  assert.deepStrictEqual(L.cuadricula(15), { filas: 3, columnas: 5 });
  assert.deepStrictEqual(L.cuadricula(16), { filas: 3, columnas: 6 });
  assert.deepStrictEqual(L.cuadricula(4), { filas: 1, columnas: 4 });
  assert.deepStrictEqual(L.cuadricula(1), { filas: 1, columnas: 1 });
});

test("aleatorio con semilla: mismo resultado en cada corrida, en [0, 1)", () => {
  const a = L.aleatorio(42), b = L.aleatorio(42), c = L.aleatorio(7);
  const sa = [a(), a(), a()], sb = [b(), b(), b()];
  assert.deepStrictEqual(sa, sb);
  assert.notDeepStrictEqual(sa, [c(), c(), c()]);
  sa.forEach((x) => assert.ok(x >= 0 && x < 1));
});

test("suavizado: 0 al inicio, 1 al final, acotado", () => {
  assert.strictEqual(L.suave(0), 0);
  assert.strictEqual(L.suave(1), 1);
  assert.strictEqual(L.suave(-3), 0);
  assert.strictEqual(L.suave(4), 1);
  assert.ok(L.suave(0.5) > 0.4 && L.suave(0.5) < 0.6);
});
