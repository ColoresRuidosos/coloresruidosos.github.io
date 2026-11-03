const test = require("node:test");
const assert = require("node:assert");
const D = require("../assets/js/trivia/dia.js");

const IDS = Array.from({ length: 25 }, (_, k) => "C" + String(k).padStart(2, "0"));
const DIA = (n) => new Date(Date.UTC(2026, 10, 2 + n, 18)); // DIA(1) = 3 de noviembre, mediodía en CDMX

function rngSemilla(semilla) {
  let s = semilla >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

// ---------- Día ----------

test("el día cambia a medianoche de CDMX y el #1 es el 3 de noviembre de 2026", () => {
  assert.strictEqual(D.fechaCDMX(new Date("2026-11-05T05:59:00Z")), "2026-11-04");
  assert.strictEqual(D.fechaCDMX(new Date("2026-11-05T06:00:00Z")), "2026-11-05");
  assert.strictEqual(D.numeroDia(new Date("2026-11-03T18:00:00Z")), 1);
  assert.strictEqual(D.numeroDia(new Date("2026-11-04T05:59:00Z")), 1);
  assert.strictEqual(D.numeroDia(new Date("2026-11-04T06:00:00Z")), 2);
  assert.strictEqual(D.numeroDia(new Date("2026-12-03T18:00:00Z")), 31);
});

// ---------- Ronda del día ----------

test("la ronda del día son 10 canciones distintas, iguales para todos sin importar el orden de los ids", () => {
  const r = D.rondaDelDia(IDS, DIA(5));
  assert.strictEqual(r.length, 10);
  assert.strictEqual(new Set(r).size, 10);
  assert.deepStrictEqual(D.rondaDelDia(IDS.slice().reverse(), DIA(5)), r);
});

test("días seguidos no repiten canciones hasta dar la vuelta al banco", () => {
  const vistas = [...D.rondaDelDia(IDS, DIA(1)), ...D.rondaDelDia(IDS, DIA(2))];
  assert.strictEqual(new Set(vistas).size, 20);
});

test("con menos de 10 canciones en el banco, la ronda usa todas sin repetir", () => {
  const r = D.rondaDelDia(IDS.slice(0, 7), DIA(3));
  assert.strictEqual(r.length, 7);
  assert.strictEqual(new Set(r).size, 7);
});

test("la ronda de práctica son 10 canciones al azar sin repetir", () => {
  const r = D.rondaAlAzar(IDS, rngSemilla(3));
  assert.strictEqual(r.length, 10);
  assert.strictEqual(new Set(r).size, 10);
  assert.notDeepStrictEqual(r, D.rondaAlAzar(IDS, rngSemilla(4)));
});

// ---------- Una canción ----------

test("los fragmentos duran 1, 2, 4, 7, 11 y 16 segundos", () => {
  assert.deepStrictEqual(D.SEGUNDOS, [1, 2, 4, 7, 11, 16]);
});

test("acertar termina la canción; fallar o saltar da el siguiente fragmento", () => {
  let p = D.nuevaPartida("C04");
  p = D.intentar(p, "C01");
  assert.deepStrictEqual(p.intentos, ["mal"]);
  assert.strictEqual(D.segundosActuales(p), 2);
  p = D.intentar(p, null);
  p = D.intentar(p, "C04");
  assert.deepStrictEqual(p.intentos, ["mal", "salto", "bien"]);
  assert.ok(p.terminada && p.acierto);
  assert.strictEqual(D.intentar(p, "C02"), p, "ya terminada");
});

test("puntos por canción: 6 al primer fragmento … 1 al sexto, 0 si no se adivina", () => {
  const conIntentos = (n, acierto) => ({ intentos: Array(n).fill("mal"), acierto, terminada: true });
  assert.deepStrictEqual([1, 2, 3, 4, 5, 6].map((n) => D.puntosCancion(conIntentos(n, true))), [6, 5, 4, 3, 2, 1]);
  assert.strictEqual(D.puntosCancion(conIntentos(6, false)), 0);
});

// ---------- Avanzar en la ronda ----------

test("la ronda avanza canción por canción, suma puntos y tiempo, y termina tras la décima", () => {
  const ids = D.rondaDelDia(IDS, DIA(1));
  let r = D.nuevaRonda(ids);
  assert.strictEqual(r.actual.correcta, ids[0]);
  for (let k = 0; k < 10; k++) {
    let p = r.actual;
    if (k % 2) p = D.intentar(p, null);           // canciones impares: una saltada antes de acertar
    p = D.intentar(p, k === 9 ? "NADA" : ids[k]);   // la última se falla una vez…
    if (k === 9) for (let j = 0; j < 5; j++) p = D.intentar(p, null); // …y se rinde
    r = D.avanzarRonda(r, p, 1000 * (k + 1));
  }
  assert.ok(r.terminada);
  assert.strictEqual(r.resultados.length, 10);
  assert.deepStrictEqual(r.resultados.map((x) => x.puntos), [6, 5, 6, 5, 6, 5, 6, 5, 6, 0]);
  assert.strictEqual(D.puntajeRonda(r), 50);
  assert.strictEqual(D.aciertosRonda(r), 9);
  assert.strictEqual(D.tiempoRonda(r), 45000, "solo cuenta el tiempo de las acertadas");
  assert.strictEqual(D.duracionRonda(r), 55000, "la duración total sí cuenta todas");
});

test("avanzarRonda ignora una canción que no ha terminado", () => {
  const r = D.nuevaRonda(["C01", "C02"]);
  assert.strictEqual(D.avanzarRonda(r, D.intentar(r.actual, null), 500), r);
});

// ---------- Racha ----------

test("la racha cuenta días seguidos con al menos una acertada", () => {
  const dia = (aciertos) => ({ puntos: aciertos * 4, aciertos });
  let e = D.registrarDia(undefined, "2026-11-03", dia(3));
  assert.strictEqual(e.racha, 1);
  e = D.registrarDia(e, "2026-11-04", dia(1));
  assert.strictEqual(e.racha, 2);
  e = D.registrarDia(e, "2026-11-04", dia(9));
  assert.strictEqual(e.resultados["2026-11-04"].aciertos, 1, "se queda el primer resultado del día");
  e = D.registrarDia(e, "2026-11-06", dia(2));
  assert.strictEqual(e.racha, 1, "faltó el 5");
  e = D.registrarDia(e, "2026-11-07", dia(0));
  assert.strictEqual(e.racha, 0);
  assert.strictEqual(e.mejorRacha, 2);
});

// ---------- Compartir ----------

test("el texto para compartir lleva puntos y 10 cuadros sin revelar canciones", () => {
  const r = { terminada: true, resultados: [1, 2, 3, 4, 5, 6, 0, 1, 1, 2].map((n) => ({ intentos: n || 6, acierto: n > 0, puntos: n ? 7 - n : 0 })) };
  const t = D.textoCompartir(12, r);
  assert.match(t, /Adivina la canción de Love of Lesbian #12 · 38\/60/);
  assert.match(t, /🟩🟩🟨🟨🟧🟧🟥🟩🟩🟩/);
  assert.match(t, /coloresruidosos\.github\.io\/trivia/);
});
