/* "LoL del día" (F20/D26): lógica pura. Una canción al día, la misma para todos (medianoche de CDMX),
   seis intentos con fragmentos de 1, 2, 4, 7, 11 y 16 s, racha de días y texto para compartir sin
   spoilers. Pruebas en tests-js/dia.test.js. */
(function (raiz) {
  var SEGUNDOS = [1, 2, 4, 7, 11, 16];
  var INICIO_UTC = Date.UTC(2026, 10, 4); // día #1: 4 de noviembre de 2026
  var OFFSET_CDMX_MS = 6 * 3600 * 1000;
  var DIA_MS = 24 * 3600 * 1000;
  var SEMILLA = 20261104;

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

  function cancionDelDia(ids, fecha) {
    var o = orden(ids), n = numeroDia(fecha) - 1;
    return o[((n % o.length) + o.length) % o.length];
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

  function diaAnterior(fecha) {
    var f = fecha.split("-").map(Number);
    return new Date(Date.UTC(f[0], f[1] - 1, f[2]) - DIA_MS).toISOString().slice(0, 10);
  }

  // Guarda el primer resultado de cada día y lleva la racha de días seguidos acertando.
  function registrarDia(previo, fecha, resultado) {
    var e = previo ? JSON.parse(JSON.stringify(previo)) : { resultados: {}, racha: 0, mejorRacha: 0, ultimoAcierto: "" };
    if (e.resultados[fecha]) return e;
    e.resultados[fecha] = { acierto: resultado.acierto, intentos: resultado.intentos };
    if (resultado.acierto) {
      e.racha = e.ultimoAcierto === diaAnterior(fecha) ? e.racha + 1 : 1;
      e.ultimoAcierto = fecha;
    } else {
      e.racha = 0;
    }
    e.mejorRacha = Math.max(e.mejorRacha, e.racha);
    return e;
  }

  function textoCompartir(numero, p) {
    var cuadros = p.intentos.map(function (x) { return x === "bien" ? "🟩" : x === "salto" ? "⬛" : "🟥"; }).join("");
    for (var k = p.intentos.length; k < SEGUNDOS.length; k++) cuadros += "⬜";
    return "LoL del día #" + numero + " · " + (p.acierto ? p.intentos.length : "X") + "/6\n🔊" + cuadros +
      "\n¿La reconoces tú? coloresruidosos.github.io/trivia · @coloresruidosos";
  }

  raiz.CRdia = {
    SEGUNDOS: SEGUNDOS, fechaCDMX: fechaCDMX, numeroDia: numeroDia, cancionDelDia: cancionDelDia,
    nuevaPartida: nuevaPartida, segundosActuales: segundosActuales, intentar: intentar,
    registrarDia: registrarDia, textoCompartir: textoCompartir,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = raiz.CRdia;
})(typeof window !== "undefined" ? window : globalThis);
