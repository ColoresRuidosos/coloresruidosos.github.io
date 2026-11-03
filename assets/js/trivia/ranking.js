/* Ranking de la Trivia (F18/D24): la parte pura del cliente. Nombres generados con el
   universo de la banda, semana en hora de CDMX, orden y armado del envío. Las listas de
   palabras deben ser las mismas que en docs/ranking/Code.gs (tests-js/ranking.test.js lo revisa). */
(function (raiz) {
  var SUSTANTIVOS = ["Psiconauta", "Poeta", "Cometa", "Satélite", "Planeador", "Equilibrista",
    "Astronauta", "Antena", "Ectoplasta", "Pizzigato", "Fan", "Planeta"];
  var COMPLEMENTOS = ["del Ártico", "de Halley", "del Volcán", "de Nieve", "de Bruma", "del Himalaya",
    "de Ascensor", "de Emergencias", "del Japón", "de Sed", "del Mañana", "de la Noche Eterna"];
  var OFFSET_CDMX_MS = 6 * 3600 * 1000; // México no usa horario de verano desde 2022.

  function elegir(lista, rng) { return lista[Math.floor(rng() * lista.length)]; }

  function generarNombre(rng, anterior) {
    rng = rng || Math.random;
    for (var k = 0; k < 20; k++) {
      var n = elegir(SUSTANTIVOS, rng) + " " + elegir(COMPLEMENTOS, rng) + " #" + (1 + Math.floor(rng() * 99));
      if (n !== anterior) return n;
    }
    return n;
  }

  function nombreValido(nombre) {
    if (typeof nombre !== "string") return false;
    var m = /^(.+) #([1-9][0-9]?)$/.exec(nombre);
    if (!m) return false;
    return SUSTANTIVOS.some(function (s) {
      return COMPLEMENTOS.some(function (c) { return m[1] === s + " " + c; });
    });
  }

  // Semana ISO (lunes a domingo) del momento dado, en hora de CDMX: "2026-W46".
  function semanaCDMX(fecha) {
    var d = new Date(fecha.getTime() - OFFSET_CDMX_MS);
    var dia = (d.getUTCDay() + 6) % 7;
    var jueves = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dia + 3));
    var anio = jueves.getUTCFullYear();
    var semana = 1 + Math.floor((jueves - Date.UTC(anio, 0, 1)) / (7 * 24 * 3600 * 1000));
    return anio + "-W" + String(semana).padStart(2, "0");
  }

  // Más puntos primero; empate: partida más rápida; luego la más antigua. Cada nombre una vez, con su mejor fila.
  function ordenar(filas, limite) {
    var vistos = {};
    return filas.slice().sort(function (a, b) {
      return (b.puntos - a.puntos) || (a.duracionMs - b.duracionMs) ||
        (new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    }).filter(function (f) {
      if (vistos[f.nombre]) return false;
      vistos[f.nombre] = true;
      return true;
    }).slice(0, limite);
  }

  function armarEnvio(modo, nombre, puntos, duracionMs, dispositivo) {
    return { modo: modo, nombre: nombre, puntos: puntos, duracionMs: Math.round(duracionMs), dispositivo: dispositivo };
  }

  function nuevoDispositivo(rng) {
    rng = rng || Math.random;
    var c = "abcdefghijklmnopqrstuvwxyz0123456789", s = "";
    for (var k = 0; k < 16; k++) s += c[Math.floor(rng() * c.length)];
    return s;
  }

  function formatoTiempo(ms) {
    var s = Math.round(ms / 1000);
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }

  raiz.CRranking = {
    SUSTANTIVOS: SUSTANTIVOS, COMPLEMENTOS: COMPLEMENTOS,
    generarNombre: generarNombre, nombreValido: nombreValido, semanaCDMX: semanaCDMX, ordenar: ordenar,
    armarEnvio: armarEnvio, nuevoDispositivo: nuevoDispositivo, formatoTiempo: formatoTiempo,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = raiz.CRranking;
})(typeof window !== "undefined" ? window : globalThis);
