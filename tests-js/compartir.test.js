const test = require("node:test");
const assert = require("node:assert");
const C = require("../assets/js/trivia/compartir.js");

test("el @ se limpia: sin arroba inicial, sin espacios y en minúsculas", () => {
  assert.strictEqual(C.limpiarArroba("@ColoresRuidosos"), "coloresruidosos");
  assert.strictEqual(C.limpiarArroba("  mi.usuario_99 "), "mi.usuario_99");
  assert.strictEqual(C.limpiarArroba("@@fan"), "fan");
  assert.strictEqual(C.limpiarArroba(""), "");
  assert.strictEqual(C.limpiarArroba(null), "");
});

test("un @ que Instagram no permitiría se descarta", () => {
  ["con espacio", "ñandú", "a".repeat(31), "<script>", "emoji😀", "guion-medio"]
    .forEach((x) => assert.strictEqual(C.limpiarArroba(x), "", x));
  assert.strictEqual(C.limpiarArroba("a".repeat(30)), "a".repeat(30));
});

test("el texto para pegar menciona la categoría, a @coloresruidosos y la dirección del juego", () => {
  const t = C.textoResultado({ categoria: "Viejo lesbiano", puntos: 27 });
  assert.match(t, /Viejo lesbiano/);
  assert.match(t, /27\/30/);
  assert.match(t, /@coloresruidosos/);
  assert.match(t, /coloresruidosos\.github\.io\/trivia/);
});

test("el texto de una chapa dice qué insignia se consiguió", () => {
  const t = C.textoChapa({ nombre: "Contradicción" });
  assert.match(t, /Contradicción/);
  assert.match(t, /@coloresruidosos/);
});

test("los dos formatos de tarjeta tienen las medidas de Instagram", () => {
  assert.deepStrictEqual(C.FORMATOS.historia, { ancho: 1080, alto: 1920 });
  assert.deepStrictEqual(C.FORMATOS.feed, { ancho: 1080, alto: 1350 });
});
