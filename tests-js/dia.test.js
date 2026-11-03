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

// ---------- Insignias de Adivina la canción (F22/D28) ----------

const T = require("../assets/js/trivia/logica.js");
const AHORA = new Date("2026-11-05T18:00:00Z");
const resumen = (o) => ({ aciertos: 5, puntos: 20, primeros: 0, racha: 1, ...o });
const nuevas = (o, previo) => T.cerrarAdivina(previo || T.estadoInicial(), resumen(o), AHORA).nuevas;

test("primerosRonda cuenta las canciones acertadas con 1 s", () => {
  const r = { resultados: [{ acierto: true, intentos: 1 }, { acierto: true, intentos: 2 }, { acierto: false, intentos: 6 }, { acierto: true, intentos: 1 }] };
  assert.strictEqual(D.primerosRonda(r), 2);
});

test("Música de ascensores con la primera ronda; la segunda no la repite", () => {
  const r1 = T.cerrarAdivina(T.estadoInicial(), resumen({}), AHORA);
  assert.ok(r1.nuevas.includes("musica_ascensores"));
  assert.ok(!T.cerrarAdivina(r1.estado, resumen({}), AHORA).nuevas.includes("musica_ascensores"));
});

test("Mi primera combustión con una canción adivinada en 1 s", () => {
  assert.ok(nuevas({ primeros: 1 }).includes("primera_combustion"));
  assert.ok(!nuevas({ primeros: 0 }).includes("primera_combustion"));
});

test("Ya sale el sol con las 10 acertadas, no con 9", () => {
  assert.ok(nuevas({ aciertos: 10, puntos: 40 }).includes("ya_sale_el_sol"));
  assert.ok(!nuevas({ aciertos: 9, puntos: 40 }).includes("ya_sale_el_sol"));
});

test("Domingo astromántico con racha de 7 días en la ronda del día; la práctica no cuenta", () => {
  assert.ok(nuevas({ racha: 7 }).includes("domingo"));
  assert.ok(!nuevas({ racha: 6 }).includes("domingo"));
  assert.ok(!nuevas({ racha: 7, practica: true }).includes("domingo"));
});

test("Nada (secreta) sin ninguna acertada", () => {
  assert.ok(nuevas({ aciertos: 0, puntos: 0 }).includes("nada"));
  assert.ok(!nuevas({ aciertos: 1, puntos: 1 }).includes("nada"));
});

test("El día que Starman huyó (secreta) con 60 de 60, no con 59", () => {
  assert.ok(nuevas({ aciertos: 10, puntos: 60, primeros: 10 }).includes("starman"));
  assert.ok(!nuevas({ aciertos: 10, puntos: 59, primeros: 9 }).includes("starman"));
});

test("las insignias de Adivina la canción tienen su familia y El gran truco final no las pide", () => {
  const ids = ["musica_ascensores", "primera_combustion", "ya_sale_el_sol", "domingo", "nada", "starman"];
  const cat = T.INSIGNIAS.filter((i) => i.familia === "adivina").map((i) => i.id);
  assert.deepStrictEqual(cat, ids);
  ["nada", "starman"].forEach((id) => assert.ok(T.INSIGNIAS.find((i) => i.id === id).oculta, id));
});

// ---------- Orden al azar de la ronda del día (F24/D30) ----------

test("barajarRonda deja las mismas 10 canciones del día en otro orden", () => {
  const dia = D.rondaDelDia(IDS, DIA(4));
  const a = D.barajarRonda(dia, rngSemilla(1)), b = D.barajarRonda(dia, rngSemilla(2));
  assert.deepStrictEqual([...a].sort(), [...dia].sort());
  assert.deepStrictEqual([...b].sort(), [...dia].sort());
  assert.notDeepStrictEqual(a, b);
  assert.deepStrictEqual(dia, D.rondaDelDia(IDS, DIA(4)), "no modifica la lista original");
});

test("en muchas sesiones el orden casi nunca se repite", () => {
  const dia = D.rondaDelDia(IDS, DIA(4)), rng = rngSemilla(7), vistos = new Set();
  for (let k = 0; k < 50; k++) vistos.add(D.barajarRonda(dia, rng).join());
  assert.ok(vistos.size >= 49);
});

test("mismasCanciones reconoce la ronda guardada aunque esté en otro orden", () => {
  const dia = D.rondaDelDia(IDS, DIA(4));
  assert.ok(D.mismasCanciones(D.barajarRonda(dia, rngSemilla(3)), dia));
  assert.ok(!D.mismasCanciones(D.rondaDelDia(IDS, DIA(5)), dia));
  assert.ok(!D.mismasCanciones(dia.slice(0, 9), dia));
});
