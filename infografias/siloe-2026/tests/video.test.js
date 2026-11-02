const test = require("node:test");
const assert = require("node:assert");
const datos = require("../datos.json");
const E = require("../escenas.js");

test("cinco escenas con título más el cierre con el logo", () => {
  const ids = E.ESCENAS.map((e) => e.id);
  assert.deepStrictEqual(ids, ["viene", "quienes", "discos", "conozcas", "mexico", "logo"]);
  E.ESCENAS.slice(0, 5).forEach((e) => assert.ok(e.titulo && e.titulo.length > 0, e.id));
});

test("cada escena dura lo suficiente para leerla y el total cabe en un Reel", () => {
  E.ESCENAS.forEach((e) => assert.ok(e.dur >= 4.5, e.id));
  assert.ok(E.duracion() >= 25 && E.duracion() <= 45, "duración " + E.duracion());
});

test("escena para cada instante, con límites exactos", () => {
  assert.deepStrictEqual(E.escena(0), { id: "viene", indice: 0, local: 0, progreso: 0 });
  const d0 = E.ESCENAS[0].dur;
  assert.strictEqual(E.escena(d0).id, "quienes");
  assert.strictEqual(E.escena(d0).local, 0);
  assert.strictEqual(E.escena(d0 - 0.001).id, "viene");
  const fin = E.escena(E.duracion() + 3);
  assert.strictEqual(fin.id, "logo");
  assert.strictEqual(fin.progreso, 1);
  assert.strictEqual(E.escena(-2).id, "viene");
});

test("resorte: sale de 0, rebota un poco por encima de 1 y se asienta exactamente en 1", () => {
  assert.strictEqual(E.resorte(0), 0);
  assert.strictEqual(E.resorte(-1), 0);
  assert.strictEqual(E.resorte(1.6), 1);
  let max = 0;
  for (let x = 0; x <= 1.5; x += 0.01) max = Math.max(max, E.resorte(x));
  assert.ok(max > 1 && max < 1.15, "rebote " + max);
});

test("llegar: la entrada empieza en su momento y dura lo indicado", () => {
  assert.strictEqual(E.llegar(0.4, 0.5), 0, "antes de empezar");
  assert.strictEqual(E.llegar(0.5 + 2, 0.5), 1, "ya asentado");
});

test("pulso de 120 BPM", () => {
  assert.strictEqual(E.PULSO, 0.5);
  assert.strictEqual(E.enPulso(3), 1.5);
});

test("cortinilla solo alrededor de los cambios de escena", () => {
  const d0 = E.ESCENAS[0].dur;
  assert.strictEqual(E.cortinilla(1), null);
  const c = E.cortinilla(d0);
  assert.ok(c !== null && c > 0 && c < 1, "a la mitad del cambio");
  assert.strictEqual(E.cortinilla(d0 - E.CORTINILLA), null);
  assert.strictEqual(E.cortinilla(0), null, "sin cortinilla al inicio");
});

test("el guion usa solo datos verificados", () => {
  const g = E.guion(datos);
  assert.strictEqual(g.banda, "Siloé");
  assert.strictEqual(g.personas.length, 3);
  assert.ok(g.discos.length >= 5);
  assert.ok(g.curiosidades.length >= 1);
  assert.ok(g.mexico.cuando && g.mexico.donde && g.mexico.con);
  const texto = JSON.stringify(g);
  ["Berklee", "Balmes", "14, 15 y 17"].forEach((p) => {
    const pendiente = datos.datos.find((d) => d.texto.includes(p));
    if (pendiente && pendiente.estado !== "verificado") assert.ok(!texto.includes(p), p + " no debe salir");
  });
});

test("si los días en México se verifican, el guion los incluye solo", () => {
  const copia = JSON.parse(JSON.stringify(datos));
  const d = copia.datos.find((x) => x.id === "mexico-dias");
  d.estado = "verificado";
  d.fuentes = ["https://a.com/1", "https://b.org/2"];
  assert.strictEqual(E.guion(copia).mexico.dias, d.texto);
  assert.strictEqual(E.guion(datos).mexico.dias, null);
});

test("el guion incluye la charla-showcase en El Claustro", () => {
  const sc = E.guion(datos).showcase;
  assert.ok(sc, "hay showcase");
  assert.strictEqual(sc.fecha, "2026-11-03");
  assert.strictEqual(sc.hora, "14:00");
  assert.match(sc.lugar, /Gran Claustro/);
});
