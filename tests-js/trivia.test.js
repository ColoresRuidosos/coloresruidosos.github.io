const test = require("node:test");
const assert = require("node:assert");
const datos = require("../data/trivia.json");
const T = require("../assets/js/trivia/logica.js");

// Generador pseudoaleatorio con semilla, para que el sorteo sea reproducible.
function rngSemilla(semilla) {
  let s = semilla >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function respuesta(id, etapa, dificultad, acierto) {
  return { id, etapa, dificultad, acierto };
}

// Partida armada a mano: 5 fáciles, 5 difíciles, 5 muy difíciles, repartidas en etapas.
function partida(aciertos) {
  const etapas = ["E1", "E1", "E2", "E3", "E4", "E1", "E2", "E3", "E5", "E6", "E1", "E3", "E4", "E5", "E6"];
  const difs = ["facil", "facil", "facil", "facil", "facil", "dificil", "dificil", "dificil", "dificil", "dificil",
    "muy_dificil", "muy_dificil", "muy_dificil", "muy_dificil", "muy_dificil"];
  return etapas.map((e, i) => respuesta("Q" + i, e, difs[i], aciertos[i]));
}
const TODO = Array(15).fill(true);
const NADA = Array(15).fill(false);
const ANTES_DEL_BAILE = new Date("2026-11-01T18:00:00Z");
const DESPUES_DEL_BAILE = new Date("2026-12-01T18:00:00Z");

// ---------- Contrato de data/trivia.json ----------

test("cada pregunta del banco cumple el contrato", () => {
  assert.ok(Array.isArray(datos.preguntas) && datos.preguntas.length > 0);
  datos.preguntas.forEach((p) => {
    assert.deepStrictEqual(T.validarPregunta(p), [], p.id);
  });
});

test("los ids no se repiten", () => {
  const ids = datos.preguntas.map((p) => p.id);
  assert.strictEqual(new Set(ids).size, ids.length);
});

test("hay al menos 5 preguntas jugables por dificultad", () => {
  const jugables = T.preguntasJugables(datos);
  T.DIFICULTADES.forEach((d) => {
    assert.ok(jugables.filter((p) => p.dificultad === d).length >= 5, d);
  });
});

test("validarPregunta detecta fuentes faltantes, opciones mal formadas y estado inválido", () => {
  const buena = {
    id: "X01", etapa: "E1", dificultad: "facil", tipo: "dato", pregunta: "¿?",
    correcta: "A", incorrectas: ["B", "C", "D"], fuentes: ["https://a.com/1", "https://b.com/2"],
    fuerza: "solida", estado: "propuesta",
  };
  assert.deepStrictEqual(T.validarPregunta(buena), []);
  assert.ok(T.validarPregunta({ ...buena, fuentes: [] }).length > 0);
  assert.ok(T.validarPregunta({ ...buena, fuentes: ["https://a.com/1"] }).length > 0, "una sola fuente externa no es sólida");
  assert.deepStrictEqual(T.validarPregunta({ ...buena, fuentes: ["https://loveoflesbianband.com/biografia/"] }), [], "la web oficial basta sola");
  assert.deepStrictEqual(T.validarPregunta({ ...buena, fuentes: ["https://a.com/1"], fuerza: "una_fuente" }), []);
  assert.ok(T.validarPregunta({ ...buena, incorrectas: ["B", "C"] }).length > 0);
  assert.ok(T.validarPregunta({ ...buena, incorrectas: ["A", "C", "D"] }).length > 0, "la correcta no puede repetirse");
  assert.ok(T.validarPregunta({ ...buena, estado: "lista" }).length > 0);
  assert.ok(T.validarPregunta({ ...buena, dificultad: "media" }).length > 0);
  assert.ok(T.validarPregunta({ ...buena, etapa: "E9" }).length > 0);
  assert.ok(T.validarPregunta({ ...buena, tipo: "portada" }).length > 0, "las de portada necesitan descripción de la escena");
});

// ---------- Qué preguntas se juegan ----------

test("en modo normal solo se juegan las verificadas con fuente sólida", () => {
  const base = { correcta: "A", incorrectas: ["B", "C", "D"], etapa: "E1", dificultad: "facil" };
  const d = {
    borrador: false,
    preguntas: [
      { ...base, id: "a", fuerza: "solida", estado: "verificada" },
      { ...base, id: "b", fuerza: "solida", estado: "propuesta" },
      { ...base, id: "c", fuerza: "una_fuente", estado: "verificada" },
    ],
  };
  assert.deepStrictEqual(T.preguntasJugables(d).map((p) => p.id), ["a"]);
});

test("en modo borrador se juegan todas las de fuente sólida aunque falte la revisión fan", () => {
  const base = { correcta: "A", incorrectas: ["B", "C", "D"], etapa: "E1", dificultad: "facil" };
  const d = {
    borrador: true,
    preguntas: [
      { ...base, id: "a", fuerza: "solida", estado: "propuesta" },
      { ...base, id: "b", fuerza: "una_fuente", estado: "propuesta" },
    ],
  };
  assert.deepStrictEqual(T.preguntasJugables(d).map((p) => p.id), ["a"]);
});

// ---------- Sorteo ----------

test("el sorteo da 5 fáciles, 5 difíciles y 5 muy difíciles sin repetir", () => {
  const p = T.sortear(T.preguntasJugables(datos), rngSemilla(7));
  assert.strictEqual(p.length, 15);
  assert.strictEqual(new Set(p.map((q) => q.id)).size, 15);
  T.DIFICULTADES.forEach((d) => assert.strictEqual(p.filter((q) => q.dificultad === d).length, 5));
});

test("el sorteo queda ordenado por etapa y, dentro de la etapa, de fácil a muy difícil", () => {
  const p = T.sortear(T.preguntasJugables(datos), rngSemilla(3));
  for (let i = 1; i < p.length; i++) {
    const a = T.ETAPAS.indexOf(p[i - 1].etapa), b = T.ETAPAS.indexOf(p[i].etapa);
    assert.ok(a < b || (a === b && T.DIFICULTADES.indexOf(p[i - 1].dificultad) <= T.DIFICULTADES.indexOf(p[i].dificultad)));
  }
});

test("cada partida pasa por las 6 etapas", () => {
  const jug = T.preguntasJugables(datos);
  for (let semilla = 1; semilla <= 200; semilla++) {
    const etapas = new Set(T.sortear(jug, rngSemilla(semilla)).map((q) => q.etapa));
    assert.strictEqual(etapas.size, 6, "semilla " + semilla);
  }
});

test("la misma semilla da la misma partida y otra semilla da otra", () => {
  const jug = T.preguntasJugables(datos);
  const ids = (s) => T.sortear(jug, rngSemilla(s)).map((q) => q.id).join();
  assert.strictEqual(ids(42), ids(42));
  assert.notStrictEqual(ids(42), ids(43));
});

test("las opciones se barajan e incluyen la correcta una sola vez", () => {
  const q = { correcta: "A", incorrectas: ["B", "C", "D"] };
  const o = T.opciones(q, rngSemilla(1));
  assert.deepStrictEqual([...o].sort(), ["A", "B", "C", "D"]);
});

// ---------- Puntaje y categorías ----------

test("los puntos valen 1, 2 y 3 según la dificultad y suman 30 como máximo", () => {
  assert.strictEqual(T.puntaje(partida(TODO)), 30);
  assert.strictEqual(T.puntaje(partida(NADA)), 0);
  const soloFaciles = TODO.map((_, i) => i < 5);
  assert.strictEqual(T.puntaje(partida(soloFaciles)), 5);
});

test("las categorías cortan en 12/13, 22/23 y 29/30", () => {
  const casos = [[0, "pequeno"], [12, "pequeno"], [13, "lesbianito"], [22, "lesbianito"], [23, "viejo"], [29, "viejo"], [30, "john_boy"]];
  casos.forEach(([pts, id]) => assert.strictEqual(T.categoria(pts).id, id, String(pts)));
  assert.strictEqual(T.categoria(5).nombre, "Pequeño lesbiano");
  assert.strictEqual(T.categoria(30).nombre, "Club de fans de John Boy");
});

// ---------- Insignias ----------

function jugar(aciertos, estado, ahora) {
  return T.cerrarPartida(estado || T.estadoInicial(), partida(aciertos), ahora || DESPUES_DEL_BAILE);
}

test("la primera partida da Maniobras de escapismo; la segunda no la repite", () => {
  const r1 = jugar(NADA);
  assert.ok(r1.nuevas.includes("maniobras"));
  const r2 = jugar(NADA, r1.estado);
  assert.ok(!r2.nuevas.includes("maniobras"));
});

test("Viaje épico hacia la nada con 0 puntos, no con 1", () => {
  assert.ok(jugar(NADA).nuevas.includes("viaje"));
  assert.ok(!jugar(NADA.map((_, i) => i === 0)).nuevas.includes("viaje"));
});

test("Incendios de nieve con 5 aciertos seguidos, no con 4", () => {
  const cinco = NADA.map((_, i) => i >= 3 && i <= 7);
  const cuatro = NADA.map((_, i) => i >= 3 && i <= 6);
  assert.ok(jugar(cinco).nuevas.includes("incendios"));
  assert.ok(!jugar(cuatro).nuevas.includes("incendios"));
});

test("Bajo el volcán con las 5 muy difíciles, no con 4", () => {
  const todas = NADA.map((_, i) => i >= 10);
  const cuatro = NADA.map((_, i) => i >= 11);
  assert.ok(jugar(todas).nuevas.includes("volcan"));
  assert.ok(!jugar(cuatro).nuevas.includes("volcan"));
});

test("Ungravity con toda la etapa en inglés, no si falla una de E1", () => {
  const e1 = [0, 1, 5, 10];
  assert.ok(jugar(NADA.map((_, i) => e1.includes(i))).nuevas.includes("ungravity"));
  assert.ok(!jugar(NADA.map((_, i) => e1.includes(i) && i !== 10)).nuevas.includes("ungravity"));
});

test("Me amo al llegar a Viejo lesbiano y Club de fans de John Boy solo con 30", () => {
  const r = jugar(TODO);
  assert.ok(r.nuevas.includes("me_amo") && r.nuevas.includes("john_boy"));
  const casi = jugar(TODO.map((_, i) => i !== 0));
  assert.ok(casi.nuevas.includes("me_amo") && !casi.nuevas.includes("john_boy"));
});

test("Segundo asalto al superar tu mejor categoría anterior, no en la primera partida", () => {
  const r1 = jugar(NADA);
  assert.ok(!r1.nuevas.includes("segundo_asalto"));
  const r2 = jugar(TODO, r1.estado);
  assert.ok(r2.nuevas.includes("segundo_asalto"));
  const r3 = jugar(NADA, r2.estado);
  assert.ok(!r3.nuevas.includes("segundo_asalto"));
});

test("Universos infinitos a la quinta partida", () => {
  let estado = T.estadoInicial();
  for (let i = 1; i <= 5; i++) {
    const r = jugar(NADA, estado);
    assert.strictEqual(r.nuevas.includes("universos"), i === 5, "partida " + i);
    estado = r.estado;
  }
});

test("1999 al acumular 99 aciertos entre partidas", () => {
  let estado = T.estadoInicial();
  let r;
  for (let i = 0; i < 6; i++) { r = jugar(TODO, estado); estado = r.estado; } // 90 aciertos
  assert.ok(!estado.insignias["1999"]);
  r = jugar(NADA.map((_, i) => i < 9), estado); // 99
  assert.ok(r.nuevas.includes("1999"));
});

test("La noche eterna entre las 00:00 y las 04:59 hora local", () => {
  const local = (h) => new Date(2026, 11, 1, h, 30);
  assert.ok(T.cerrarPartida(T.estadoInicial(), partida(NADA), local(2)).nuevas.includes("noche_eterna"));
  assert.ok(!T.cerrarPartida(T.estadoInicial(), partida(NADA), local(5)).nuevas.includes("noche_eterna"));
  assert.ok(!T.cerrarPartida(T.estadoInicial(), partida(NADA), local(23)).nuevas.includes("noche_eterna"));
});

test("El último baile hasta el 28 de noviembre de 2026 a las 23:59 de CDMX (Puebla, última fecha en México)", () => {
  const en = (iso) => T.cerrarPartida(T.estadoInicial(), partida(NADA), new Date(iso)).nuevas.includes("ultimo_baile");
  assert.ok(en("2026-11-26T12:00:00Z"));   // entre las fechas de CDMX y Puebla
  assert.ok(en("2026-11-29T05:59:00Z"));   // 28-nov 23:59 CDMX
  assert.ok(!en("2026-11-29T06:00:00Z"));  // 29-nov 00:00 CDMX
  assert.ok(en(ANTES_DEL_BAILE.toISOString()));
});

test("Allí donde solíamos gritar al compartir, una sola vez", () => {
  const r1 = T.registrarCompartir(T.estadoInicial(), DESPUES_DEL_BAILE);
  assert.deepStrictEqual(r1.nuevas, ["alli_donde"]);
  assert.deepStrictEqual(T.registrarCompartir(r1.estado, DESPUES_DEL_BAILE).nuevas, []);
});

test("cada insignia del catálogo tiene nombre, cómo ganarla, familia e ícono", () => {
  assert.strictEqual(T.INSIGNIAS.length, 36);
  T.INSIGNIAS.forEach((i) => {
    assert.ok(i.id && i.nombre && i.como && i.icono, JSON.stringify(i));
    assert.ok(["trivia", "habilidad", "constancia", "secreta", "contrarreloj", "adivina", "concierto"].includes(i.familia), i.id);
  });
  assert.strictEqual(new Set(T.INSIGNIAS.map((i) => i.id)).size, 36);
});

// ---------- Portadas coleccionables ----------

test("acertar toda una etapa desbloquea su portada; fallar una no", () => {
  const e2 = [2, 6];
  const r = jugar(NADA.map((_, i) => e2.includes(i)));
  assert.deepStrictEqual(r.portadasNuevas, ["E2"]);
  assert.deepStrictEqual(jugar(NADA.map((_, i) => i === 2)).portadasNuevas, []);
});

test("con las 6 portadas llega Ejército de salvación", () => {
  const r = jugar(TODO);
  assert.strictEqual(r.estado.portadas.length, 6);
  assert.ok(r.nuevas.includes("ejercito"));
});

// ---------- Estado guardado ----------

test("el estado se guarda y se lee con clave versionada", () => {
  const mem = {};
  const almacen = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); } };
  const r = jugar(TODO);
  assert.strictEqual(T.guardarEstado(almacen, r.estado), true);
  assert.ok(T.CLAVE in mem);
  assert.deepStrictEqual(T.cargarEstado(almacen), r.estado);
});

test("un almacenamiento que lanza error o trae basura no rompe el juego", () => {
  const roto = { getItem: () => { throw new Error("bloqueado"); }, setItem: () => { throw new Error("bloqueado"); } };
  assert.deepStrictEqual(T.cargarEstado(roto), T.estadoInicial());
  assert.strictEqual(T.guardarEstado(roto, T.estadoInicial()), false);
  const basura = { getItem: () => "{no es json", setItem: () => {} };
  assert.deepStrictEqual(T.cargarEstado(basura), T.estadoInicial());
  assert.deepStrictEqual(T.cargarEstado(null), T.estadoInicial());
});

// ---------- Pistas de lo secreto ----------

test("las insignias secretas tienen una pista que no dice el nombre", () => {
  const ocultas = T.INSIGNIAS.filter((i) => i.oculta);
  assert.strictEqual(ocultas.length, 15);
  ocultas.forEach((i) => {
    assert.ok(i.pista && i.pista !== "???", i.id);
    assert.ok(!i.pista.toLowerCase().includes(i.nombre.toLowerCase()), "la pista no puede revelar el nombre: " + i.id);
  });
});

test("al sacar Viejo lesbiano se avisa que hay un nivel más; en las demás categorías no", () => {
  assert.match(T.pistaSiguiente(T.categoria(25)), /30 de 30/);
  assert.strictEqual(T.pistaSiguiente(T.categoria(5)), "");
  assert.strictEqual(T.pistaSiguiente(T.categoria(15)), "");
  assert.strictEqual(T.pistaSiguiente(T.categoria(30)), "");
});

// ---------- Insignias "imposibles" (F17) ----------

const DIA = 24 * 3600 * 1000;
const BASE = new Date("2026-12-01T18:00:00Z");
const conMs = (aciertos, ms) => partida(aciertos).map((r, i) => ({ ...r, ms: Array.isArray(ms) ? ms[i] : ms }));
const gana = (r, id) => r.nuevas.includes(id);

test("Contradicción: fallar las 5 fáciles y acertar las 5 muy difíciles", () => {
  assert.ok(gana(jugar(NADA.map((_, i) => i >= 10)), "contradiccion"));
  assert.ok(!gana(jugar(NADA.map((_, i) => i >= 10 || i === 0)), "contradiccion"));
  assert.ok(!gana(jugar(NADA.map((_, i) => i >= 11)), "contradiccion"));
});

test("Tercero segunda: quedarse a 1 punto de subir (12, 22 o 29)", () => {
  const doce = NADA.map((_, i) => i <= 4 || i === 5 || i === 6 || i === 10);
  const trece = NADA.map((_, i) => i <= 8);
  assert.strictEqual(T.puntaje(partida(doce)), 12);
  assert.ok(gana(jugar(doce), "tercero_segunda"));
  assert.ok(!gana(jugar(trece), "tercero_segunda"));
  assert.ok(gana(jugar(TODO.map((_, i) => i !== 0)), "tercero_segunda"));
});

test("El yin y el yen: exactamente 15 de 30", () => {
  assert.ok(gana(jugar(NADA.map((_, i) => i >= 10)), "yin_yen"));
  assert.ok(!gana(jugar(NADA.map((_, i) => i >= 10 && i !== 14 || i === 0)), "yin_yen"));
});

test("Planeador: menos de 90 s con 20 puntos o más", () => {
  const cerrar = (aciertos, duracionMs) => T.cerrarPartida(T.estadoInicial(), partida(aciertos), BASE, { duracionMs });
  assert.ok(gana(cerrar(TODO, 80000), "planeador"));
  assert.ok(!gana(cerrar(TODO, 95000), "planeador"));
  assert.ok(!gana(cerrar(TODO, undefined), "planeador"));
  const diecinueve = NADA.map((_, i) => i <= 4 || (i >= 10 && i <= 13) || i === 5);
  assert.strictEqual(T.puntaje(partida(diecinueve)), 19);
  assert.ok(!gana(cerrar(diecinueve, 60000), "planeador"));
});

test("Cuando diga ya: 3 aciertos seguidos, cada uno en menos de 2 s", () => {
  const ms = Array(15).fill(5000);
  ms[3] = 1500; ms[4] = 900; ms[5] = 1999;
  assert.ok(gana(T.cerrarPartida(T.estadoInicial(), conMs(TODO, ms), BASE), "cuando_diga_ya"));
  ms[4] = 2000;
  assert.ok(!gana(T.cerrarPartida(T.estadoInicial(), conMs(TODO, ms), BASE), "cuando_diga_ya"));
  ms[4] = 900;
  assert.ok(!gana(T.cerrarPartida(T.estadoInicial(), conMs(TODO.map((_, i) => i !== 4), ms), BASE), "cuando_diga_ya"));
});

test("Océanos de sed: 10 partidas el mismo día, no 9", () => {
  let estado = T.estadoInicial();
  for (let n = 1; n <= 10; n++) {
    const r = T.cerrarPartida(estado, partida(NADA), new Date(BASE.getTime() + n * 60000));
    assert.strictEqual(gana(r, "oceanos"), n === 10, "partida " + n);
    estado = r.estado;
  }
});

test("Océanos de sed: las partidas de ayer no cuentan", () => {
  let estado = T.estadoInicial();
  for (let n = 0; n < 9; n++) estado = T.cerrarPartida(estado, partida(NADA), BASE).estado;
  assert.ok(!gana(T.cerrarPartida(estado, partida(NADA), new Date(BASE.getTime() + DIA)), "oceanos"));
});

test("La hermandad: jugar en 5 días distintos", () => {
  let estado = T.estadoInicial();
  for (let d = 0; d < 5; d++) {
    const r = T.cerrarPartida(estado, partida(NADA), new Date(BASE.getTime() + d * DIA));
    assert.strictEqual(gana(r, "hermandad"), d === 4, "día " + d);
    estado = r.estado;
  }
});

test("Los días no vividos: volver tras 7 días o más sin jugar", () => {
  const e1 = T.cerrarPartida(T.estadoInicial(), partida(NADA), BASE).estado;
  assert.ok(gana(T.cerrarPartida(e1, partida(NADA), new Date(BASE.getTime() + 7 * DIA)), "dias_no_vividos"));
  assert.ok(!gana(T.cerrarPartida(e1, partida(NADA), new Date(BASE.getTime() + 6 * DIA)), "dias_no_vividos"));
  assert.ok(!gana(T.cerrarPartida(T.estadoInicial(), partida(NADA), BASE), "dias_no_vividos"));
});

test("Contraespionaje y Wio se ganan con registrarSecreto; un id desconocido no da nada", () => {
  assert.deepStrictEqual(T.registrarSecreto(T.estadoInicial(), "contraespionaje", BASE).nuevas, ["contraespionaje"]);
  assert.deepStrictEqual(T.registrarSecreto(T.estadoInicial(), "wio", BASE).nuevas, ["wio"]);
  assert.deepStrictEqual(T.registrarSecreto(T.estadoInicial(), "maniobras", BASE).nuevas, []);
  const r = T.registrarSecreto(T.estadoInicial(), "wio", BASE);
  assert.deepStrictEqual(T.registrarSecreto(r.estado, "wio", BASE).nuevas, []);
});

test("El gran truco final: todas las demás, sin contar El último baile", () => {
  const estado = T.estadoInicial();
  T.INSIGNIAS.forEach((i) => {
    if (!["gran_truco", "ultimo_baile", "wio"].includes(i.id) && !["contrarreloj", "adivina", "concierto"].includes(i.familia)) estado.insignias[i.id] = BASE.toISOString();
  });
  assert.deepStrictEqual(T.registrarSecreto(estado, "wio", BASE).nuevas, ["wio", "gran_truco"]);
  delete estado.insignias.me_amo;
  assert.deepStrictEqual(T.registrarSecreto(estado, "wio", BASE).nuevas, ["wio"]);
});

test("un estado guardado antes de F17 se lee y sigue sumando", () => {
  const viejo = { v: 1, partidas: 3, aciertos: 20, mejorPuntaje: 18, mejorNivel: 2, insignias: { maniobras: "2026-11-01T00:00:00Z" }, portadas: ["E1"] };
  const almacen = { getItem: () => JSON.stringify(viejo), setItem: () => {} };
  const cargado = T.cargarEstado(almacen);
  assert.strictEqual(cargado.partidas, 3);
  const r = T.cerrarPartida(cargado, partida(NADA), BASE);
  assert.strictEqual(r.estado.partidas, 4);
  assert.deepStrictEqual(r.estado.dias.length, 1);
  assert.ok(!gana(r, "dias_no_vividos"));
});

// ---------- Sprites de las chapas ----------

test("cada insignia tiene su ícono y cada sprite mide 16×16 con colores de la paleta", () => {
  const I = require("../assets/js/trivia/insignias.js");
  T.INSIGNIAS.forEach((ins) => assert.ok(I.ICONOS[ins.icono], "falta el ícono " + ins.icono));
  Object.entries(I.ICONOS).forEach(([nombre, filas]) => {
    assert.strictEqual(filas.length, 16, nombre);
    filas.forEach((f, k) => {
      assert.strictEqual(f.length, 16, nombre + " fila " + k);
      [...f].forEach((ch) => assert.ok(ch in I.PALETA, nombre + ": color desconocido " + ch));
    });
  });
});
