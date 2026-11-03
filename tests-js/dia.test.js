const test = require("node:test");
const assert = require("node:assert");
const D = require("../assets/js/trivia/dia.js");

const IDS = ["ME01", "ME02", "9901", "NE04", "PH01", "VH02", "ES04"];

// ---------- Día y canción del día ----------

test("el día cambia a medianoche de CDMX y el #1 es el 4 de noviembre de 2026", () => {
  assert.strictEqual(D.fechaCDMX(new Date("2026-11-05T05:59:00Z")), "2026-11-04");
  assert.strictEqual(D.fechaCDMX(new Date("2026-11-05T06:00:00Z")), "2026-11-05");
  assert.strictEqual(D.numeroDia(new Date("2026-11-04T18:00:00Z")), 1);
  assert.strictEqual(D.numeroDia(new Date("2026-11-05T06:00:00Z")), 2);
  assert.strictEqual(D.numeroDia(new Date("2026-12-04T18:00:00Z")), 31);
});

test("todos ven la misma canción el mismo día, sin importar el orden en que lleguen los ids", () => {
  const dia = new Date("2026-11-10T18:00:00Z");
  assert.strictEqual(D.cancionDelDia(IDS, dia), D.cancionDelDia(IDS.slice().reverse(), dia));
});

test("no se repite una canción hasta recorrer todo el banco", () => {
  const vistas = [];
  for (let k = 0; k < IDS.length; k++) vistas.push(D.cancionDelDia(IDS, new Date(Date.UTC(2026, 10, 4 + k, 18))));
  assert.strictEqual(new Set(vistas).size, IDS.length);
  assert.strictEqual(D.cancionDelDia(IDS, new Date(Date.UTC(2026, 10, 4 + IDS.length, 18))), vistas[0]);
});

// ---------- Intentos ----------

test("los fragmentos duran 1, 2, 4, 7, 11 y 16 segundos", () => {
  assert.deepStrictEqual(D.SEGUNDOS, [1, 2, 4, 7, 11, 16]);
});

test("acertar termina la partida; fallar o saltar da el siguiente fragmento", () => {
  let p = D.nuevaPartida("NE04");
  p = D.intentar(p, "ME01");
  assert.deepStrictEqual(p.intentos, ["mal"]);
  assert.strictEqual(p.terminada, false);
  assert.strictEqual(D.segundosActuales(p), 2);
  p = D.intentar(p, null);
  assert.deepStrictEqual(p.intentos, ["mal", "salto"]);
  p = D.intentar(p, "NE04");
  assert.deepStrictEqual(p.intentos, ["mal", "salto", "bien"]);
  assert.strictEqual(p.terminada, true);
  assert.strictEqual(p.acierto, true);
  assert.strictEqual(D.intentar(p, "ME02"), p, "ya terminada");
});

test("con seis intentos sin acertar, la partida termina perdida", () => {
  let p = D.nuevaPartida("NE04");
  for (let k = 0; k < 6; k++) p = D.intentar(p, k % 2 ? null : "ME01");
  assert.strictEqual(p.terminada, true);
  assert.strictEqual(p.acierto, false);
  assert.strictEqual(p.intentos.length, 6);
});

// ---------- Racha de días ----------

test("la racha suma días seguidos acertando y se corta con un fallo o un día sin jugar", () => {
  const ganar = (n) => ({ acierto: true, intentos: n });
  let e = D.registrarDia(undefined, "2026-11-04", ganar(1));
  assert.strictEqual(e.racha, 1);
  e = D.registrarDia(e, "2026-11-05", ganar(3));
  assert.strictEqual(e.racha, 2);
  e = D.registrarDia(e, "2026-11-05", ganar(6));
  assert.strictEqual(e.racha, 2, "jugar dos veces el mismo día no suma");
  assert.strictEqual(e.resultados["2026-11-05"].intentos, 3, "se queda el primer resultado del día");
  e = D.registrarDia(e, "2026-11-07", ganar(2));
  assert.strictEqual(e.racha, 1, "faltó el 6");
  e = D.registrarDia(e, "2026-11-08", { acierto: false, intentos: 6 });
  assert.strictEqual(e.racha, 0);
  assert.strictEqual(e.mejorRacha, 2);
});

// ---------- Compartir ----------

test("el texto para compartir no revela la canción", () => {
  const t = D.textoCompartir(12, { intentos: ["mal", "salto", "bien"], acierto: true });
  assert.match(t, /LoL del día #12/);
  assert.match(t, /🔊🟥⬛🟩⬜⬜⬜/);
  assert.match(t, /3\/6/);
  assert.match(t, /coloresruidosos\.github\.io\/trivia/);
  const perdida = D.textoCompartir(3, { intentos: Array(6).fill("mal"), acierto: false });
  assert.match(perdida, /X\/6/);
  assert.match(perdida, /🟥🟥🟥🟥🟥🟥/);
});
