/* "Adivina la canción" (F20/D26/D27): lógica pura. Ronda del día de 10 canciones, las mismas para todos
   (medianoche de CDMX); cada canción con seis intentos y fragmentos de 1, 2, 4, 7, 11 y 16 s; puntos,
   racha de días y texto para compartir sin spoilers. Pruebas en tests-js/dia.test.js. */
(function (raiz) {
  var SEGUNDOS = [1, 2, 4, 7, 11, 16];
  var INICIO_UTC = Date.UTC(2026, 10, 3); // día #1: 3 de noviembre de 2026
  var OFFSET_CDMX_MS = 6 * 3600 * 1000;
  var DIA_MS = 24 * 3600 * 1000;
  var SEMILLA = 20261104;
  var POR_RONDA = 10;

  function fechaCDMX(fecha) {
    return new Date(fecha.getTime() - OFFSET_CDMX_MS).toISOString().slice(0, 10);
  }

  function numeroDia(fecha) {
    var f = fechaCDMX(fecha).split("-").map(Number);
    return Math.round((Date.UTC(f[0], f[1] - 1, f[2]) - INICIO_UTC) / DIA_MS) + 1;
  }

  // Generador con semilla fija: el orden es el mismo en todos los navegadores.
  function generador(semilla) {
    var s = semilla >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function orden(ids) {
    var a = ids.slice().sort(), rng = generador(SEMILLA);
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // El día n toma las posiciones (n−1)·10 … (n−1)·10+9 del orden fijo, dando la vuelta al final.
  function rondaDelDia(ids, fecha) {
    var o = orden(ids), n = numeroDia(fecha) - 1, tam = Math.min(POR_RONDA, o.length), r = [];
    for (var k = 0; k < tam; k++) r.push(o[(((n * POR_RONDA + k) % o.length) + o.length) % o.length]);
    return r;
  }

  function rondaAlAzar(ids, rng) {
    var a = ids.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a.slice(0, POR_RONDA);
  }

  function nuevaPartida(correcta) {
    return { correcta: correcta, intentos: [], terminada: false, acierto: false };
  }

  function segundosActuales(p) {
    return SEGUNDOS[Math.min(p.intentos.length, SEGUNDOS.length - 1)];
  }

  // respuesta: id de canción, o null para saltar y escuchar más.
  function intentar(p, respuesta) {
    if (p.terminada) return p;
    var acierto = respuesta === p.correcta;
    var intentos = p.intentos.concat([acierto ? "bien" : respuesta === null ? "salto" : "mal"]);
    return { correcta: p.correcta, intentos: intentos, acierto: acierto,
      terminada: acierto || intentos.length >= SEGUNDOS.length };
  }

  // 6 puntos al primer fragmento … 1 al sexto; 0 si no se adivinó.
  function puntosCancion(p) { return p.acierto ? 7 - p.intentos.length : 0; }

  function nuevaRonda(ids) {
    return { canciones: ids.slice(), i: 0, actual: nuevaPartida(ids[0]), resultados: [], terminada: false };
  }

  // Registra la canción actual (ya terminada) y pasa a la siguiente. ms: desde su primer "Escuchar" hasta la respuesta.
  function avanzarRonda(r, partida, ms) {
    if (r.terminada || !partida.terminada) return r;
    var resultados = r.resultados.concat([{ id: partida.correcta, intentos: partida.intentos.length, acierto: partida.acierto,
      puntos: puntosCancion(partida), ms: partida.acierto ? ms : 0, duracion: ms }]);
    var i = r.i + 1, fin = i >= r.canciones.length;
    return { canciones: r.canciones, i: i, actual: fin ? null : nuevaPartida(r.canciones[i]), resultados: resultados, terminada: fin };
  }

  function sumar(r, campo) { return r.resultados.reduce(function (s, x) { return s + (campo === "aciertos" ? (x.acierto ? 1 : 0) : x[campo]); }, 0); }
  function puntajeRonda(r) { return sumar(r, "puntos"); }
  function aciertosRonda(r) { return sumar(r, "aciertos"); }
  function tiempoRonda(r) { return sumar(r, "ms"); }
  function duracionRonda(r) { return sumar(r, "duracion"); }

  function diaAnterior(fecha) {
    var f = fecha.split("-").map(Number);
    return new Date(Date.UTC(f[0], f[1] - 1, f[2]) - DIA_MS).toISOString().slice(0, 10);
  }

  // Guarda el primer resultado de cada día ({puntos, aciertos}) y lleva la racha de días seguidos con al menos un acierto.
  function registrarDia(previo, fecha, resultado) {
    var e = previo ? JSON.parse(JSON.stringify(previo)) : { resultados: {}, racha: 0, mejorRacha: 0, ultimoAcierto: "" };
    if (e.resultados[fecha]) return e;
    e.resultados[fecha] = { puntos: resultado.puntos, aciertos: resultado.aciertos };
    if (resultado.aciertos > 0) {
      e.racha = e.ultimoAcierto === diaAnterior(fecha) ? e.racha + 1 : 1;
      e.ultimoAcierto = fecha;
    } else {
      e.racha = 0;
    }
    e.mejorRacha = Math.max(e.mejorRacha, e.racha);
    return e;
  }

  function cuadro(x) {
    if (!x.acierto) return "🟥";
    return x.intentos <= 2 ? "🟩" : x.intentos <= 4 ? "🟨" : "🟧";
  }

  function textoCompartir(numero, r) {
    var total = r.resultados.length * 6;
    return "Adivina la canción de Love of Lesbian #" + numero + " · " + puntajeRonda(r) + "/" + total + "\n" +
      r.resultados.map(cuadro).join("") + "\n¿Cuántas reconoces tú? coloresruidosos.github.io/trivia · @coloresruidosos";
  }

  raiz.CRdia = {
    SEGUNDOS: SEGUNDOS, POR_RONDA: POR_RONDA, fechaCDMX: fechaCDMX, numeroDia: numeroDia,
    rondaDelDia: rondaDelDia, rondaAlAzar: rondaAlAzar, nuevaPartida: nuevaPartida, segundosActuales: segundosActuales,
    intentar: intentar, puntosCancion: puntosCancion, nuevaRonda: nuevaRonda, avanzarRonda: avanzarRonda,
    puntajeRonda: puntajeRonda, aciertosRonda: aciertosRonda, tiempoRonda: tiempoRonda, duracionRonda: duracionRonda, cuadro: cuadro,
    registrarDia: registrarDia, textoCompartir: textoCompartir,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = raiz.CRdia;
})(typeof window !== "undefined" ? window : globalThis);
