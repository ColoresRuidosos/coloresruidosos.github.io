const test = require("node:test");
const assert = require("node:assert");
const datos = require("../datos.json");
const D = require("../datos.js");

function dato(extra) {
  return Object.assign({
    id: "x", bloque: "curiosidades", texto: "Un dato.",
    fuentes: ["https://a.com/1", "https://b.org/2"], estado: "verificado",
  }, extra);
}

test("cada dato del JSON cumple el contrato", () => {
  assert.ok(datos.datos.length > 0);
  datos.datos.forEach((d) => assert.deepStrictEqual(D.validar(d), [], d.id));
});

test("ids únicos", () => {
  const ids = datos.datos.map((d) => d.id);
  assert.strictEqual(new Set(ids).size, ids.length);
});

test("un dato verificado necesita dos fuentes https de dominios distintos", () => {
  assert.deepStrictEqual(D.validar(dato()), []);
  assert.ok(D.validar(dato({ fuentes: ["https://a.com/1"] })).length > 0);
  assert.ok(D.validar(dato({ fuentes: ["https://a.com/1", "https://www.a.com/2"] })).length > 0, "mismo dominio no cuenta");
  assert.ok(D.validar(dato({ fuentes: ["https://a.com/1", "http://b.org/2"] })).length > 0);
});

test("un pendiente puede tener una sola fuente, pero no se publica", () => {
  assert.deepStrictEqual(D.validar(dato({ estado: "pendiente", fuentes: ["https://a.com/1"] })), []);
  const lista = { datos: [dato({ id: "a" }), dato({ id: "b", estado: "pendiente" })] };
  assert.deepStrictEqual(D.publicables(lista).map((d) => d.id), ["a"]);
});

test("estado y bloque válidos", () => {
  assert.ok(D.validar(dato({ estado: "dudoso" })).length > 0);
  assert.ok(D.validar(dato({ bloque: "chismes" })).length > 0);
  assert.ok(D.validar(dato({ texto: "" })).length > 0);
});

test("los bloques obligatorios están verificados", () => {
  const pub = D.publicables(datos);
  D.OBLIGATORIOS.forEach((b) => assert.ok(pub.some((d) => d.bloque === b), b));
});

test("discos en orden cronológico y con año", () => {
  const discos = D.discos(datos);
  assert.ok(discos.length >= 5);
  discos.forEach((d) => assert.match(String(d.anio), /^\d{4}$/));
  const anios = discos.map((d) => d.anio);
  assert.deepStrictEqual(anios, anios.slice().sort((a, b) => a - b));
});

test("las fechas exactas en México no se publican mientras estén pendientes", () => {
  const exactas = datos.datos.find((d) => d.id === "mexico-dias");
  assert.ok(exactas, "el pendiente queda registrado");
  if (exactas.estado !== "verificado") {
    assert.ok(!D.publicables(datos).some((d) => d.id === "mexico-dias"));
  }
});

test("fuente oficial del organizador: verifica aunque no haya dos URLs", () => {
  const oficial = { organizador: "El Claustro", medio: "flyer oficial", recibido: "2026-11-02" };
  assert.deepStrictEqual(D.validar(dato({ fuentes: [], oficial })), []);
  assert.ok(D.validar(dato({ fuentes: [], oficial: { organizador: "El Claustro" } })).length > 0, "oficial incompleto");
  assert.ok(D.validar(dato({ fuentes: [] })).length > 0, "sin nada");
});

test("charla-showcase en El Claustro: verificada, martes 3 de noviembre de 2026 a las 14:00", () => {
  const s = datos.datos.find((d) => d.id === "showcase-claustro");
  assert.ok(s, "existe");
  assert.strictEqual(s.estado, "verificado");
  assert.strictEqual(s.fecha, "2026-11-03");
  assert.strictEqual(s.hora, "14:00");
  assert.strictEqual(D.diaSemana(s.fecha), s.dia, "el día de la semana coincide con la fecha");
  assert.strictEqual(s.dia, "martes");
  assert.ok(D.publicables(datos).some((d) => d.id === "showcase-claustro"));
});
