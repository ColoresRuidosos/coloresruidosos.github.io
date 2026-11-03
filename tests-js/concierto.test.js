// F25/D31: insignia exclusiva de concierto, canjeada con el código del cartel.
const test = require("node:test");
const assert = require("node:assert");
const crypto = require("node:crypto");
const T = require("../assets/js/trivia/logica.js");

const huella = (c) => crypto.createHash("sha256").update(T.normalizarCodigo(c)).digest("hex");
const CONFIG = { huella: huella("LOL MEXICO 26"), desde: "2026-11-24T00:00:00-06:00", hasta: "2026-11-28T23:59:59-06:00" };
const EN_CONCIERTO = new Date("2026-11-26T03:30:00Z");   // 25 de noviembre, 21:30 en CDMX

test("el código se normaliza: mayúsculas, sin espacios, guiones ni acentos", () => {
  assert.strictEqual(T.normalizarCodigo("  lol-méxico 26 "), "LOLMEXICO26");
  assert.strictEqual(T.normalizarCodigo("Lol México\t26"), "LOLMEXICO26");
  assert.strictEqual(T.normalizarCodigo(""), "");
});

test("el código correcto en días de concierto da Noches reversibles", () => {
  const r = T.canjearConcierto(T.estadoInicial(), huella("lolmexico26"), CONFIG, EN_CONCIERTO);
  assert.strictEqual(r.error, "");
  assert.deepStrictEqual(r.nuevas, ["noches_reversibles"]);
  assert.ok(r.estado.insignias.noches_reversibles);
});

test("un código equivocado no da nada", () => {
  const r = T.canjearConcierto(T.estadoInicial(), huella("otro"), CONFIG, EN_CONCIERTO);
  assert.strictEqual(r.error, "codigo");
  assert.deepStrictEqual(r.nuevas, []);
});

test("fuera del 24 al 28 de noviembre (hora de CDMX) no se puede canjear", () => {
  const antes = new Date("2026-11-24T05:59:00Z"), primero = new Date("2026-11-24T06:00:00Z");
  const ultimo = new Date("2026-11-29T05:59:00Z"), despues = new Date("2026-11-29T06:00:00Z");
  assert.strictEqual(T.canjearConcierto(T.estadoInicial(), CONFIG.huella, CONFIG, antes).error, "fecha");
  assert.strictEqual(T.canjearConcierto(T.estadoInicial(), CONFIG.huella, CONFIG, primero).error, "");
  assert.strictEqual(T.canjearConcierto(T.estadoInicial(), CONFIG.huella, CONFIG, ultimo).error, "");
  assert.strictEqual(T.canjearConcierto(T.estadoInicial(), CONFIG.huella, CONFIG, despues).error, "fecha");
});

test("si ya la tienes, avisa y no la repite", () => {
  const r1 = T.canjearConcierto(T.estadoInicial(), CONFIG.huella, CONFIG, EN_CONCIERTO);
  const r2 = T.canjearConcierto(r1.estado, CONFIG.huella, CONFIG, EN_CONCIERTO);
  assert.strictEqual(r2.error, "ya");
  assert.deepStrictEqual(r2.nuevas, []);
});

test("sin configuración de concierto no se puede canjear", () => {
  assert.strictEqual(T.canjearConcierto(T.estadoInicial(), CONFIG.huella, null, EN_CONCIERTO).error, "codigo");
});

test("la insignia está a la vista, es de la familia concierto y El gran truco final no la pide", () => {
  const i = T.INSIGNIAS.find((x) => x.id === "noches_reversibles");
  assert.ok(i && !i.oculta && i.familia === "concierto");
  const estado = T.estadoInicial();
  T.INSIGNIAS.forEach((x) => {
    if (!["gran_truco", "ultimo_baile", "wio", "noches_reversibles"].includes(x.id) && !["contrarreloj", "adivina"].includes(x.familia)) estado.insignias[x.id] = "2026-11-01T00:00:00Z";
  });
  assert.deepStrictEqual(T.registrarSecreto(estado, "wio", EN_CONCIERTO).nuevas, ["wio", "gran_truco"]);
});
