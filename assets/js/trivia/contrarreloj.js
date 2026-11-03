/* Contrarreloj "¿De qué disco es?" (F16/D22): lógica pura. Título de una canción, cuatro discos,
   60 segundos. El reloj se calcula con marcas de tiempo que llegan de fuera (ahoraMs), así se prueba
   sin esperar. Pruebas en tests-js/contrarreloj.test.js. */
(function (raiz) {
  var DURACION_MS = 60000;
  var PENALIZACION_MS = 3000;
  var FUENTE_OFICIAL = /^https:\/\/(www\.)?loveoflesbianband\.com\//;

  function validarCancion(c, discos) {
    var e = [];
    if (!c || !c.id || !c.titulo) return ["sin id o título"];
    var disco = discos.filter(function (d) { return d.id === c.disco; })[0];
    if (!disco) e.push("disco desconocido");
    else if (c.titulo.toLowerCase() === disco.nombre.toLowerCase()) e.push("se llama como su disco");
    var f = Array.isArray(c.fuentes) ? c.fuentes : [];
    if (!f.length || f.some(function (u) { return !/^https:\/\//.test(u); })) e.push("fuentes faltantes o sin https");
    if (c.fuerza === "solida") {
      if (f.length < 2 && !f.some(function (u) { return FUENTE_OFICIAL.test(u); })) e.push("sólida necesita 2 fuentes o la web oficial");
    } else if (c.fuerza !== "una_fuente") e.push("fuerza inválida");
    if (c.estado !== "propuesta" && c.estado !== "verificada") e.push("estado inválido");
    return e;
  }

  function jugables(datos) {
    return (datos.canciones || []).filter(function (c) {
      return c.fuerza === "solida" && (datos.borrador || c.estado === "verificada");
    });
  }

  function barajar(lista, rng) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // El disco correcto más tres de los otros nueve, en orden al azar.
  function opciones(cancion, discos, rng) {
    rng = rng || Math.random;
    var otros = barajar(discos.filter(function (d) { return d.id !== cancion.disco; }), rng).slice(0, 3);
    return barajar([cancion.disco].concat(otros.map(function (d) { return d.id; })), rng);
  }

  function nuevaPartida(canciones, rng, inicioMs) {
    return { orden: barajar(canciones, rng || Math.random), i: 0, puntos: 0, racha: 0, mejorRacha: 0,
      aciertos: 0, errores: 0, penalizacionMs: 0, inicio: inicioMs };
  }

  // Vale ×1 hasta la 4.ª seguida, ×2 desde la 5.ª y ×3 desde la 10.ª.
  function multiplicador(racha) { return racha >= 10 ? 3 : racha >= 5 ? 2 : 1; }

  function restanteMs(p, ahoraMs) {
    return Math.max(0, DURACION_MS - (ahoraMs - p.inicio) - p.penalizacionMs);
  }

  function terminada(p, ahoraMs) {
    return restanteMs(p, ahoraMs) === 0 || p.i >= p.orden.length;
  }

  function responder(p, discoId, ahoraMs) {
    if (terminada(p, ahoraMs)) return { partida: p, acierto: false, ganados: 0, correcto: null };
    var correcto = p.orden[p.i].disco, acierto = discoId === correcto;
    var n = {};
    for (var k in p) n[k] = p[k];
    n.i = p.i + 1;
    var ganados = 0;
    if (acierto) {
      n.racha = p.racha + 1;
      ganados = multiplicador(n.racha);
      n.puntos = p.puntos + ganados;
      n.aciertos = p.aciertos + 1;
      n.mejorRacha = Math.max(p.mejorRacha, n.racha);
    } else {
      n.racha = 0;
      n.errores = p.errores + 1;
      n.penalizacionMs = p.penalizacionMs + PENALIZACION_MS;
    }
    return { partida: n, acierto: acierto, ganados: ganados, correcto: correcto };
  }

  raiz.CRcontrarreloj = {
    DURACION_MS: DURACION_MS, PENALIZACION_MS: PENALIZACION_MS,
    validarCancion: validarCancion, jugables: jugables, opciones: opciones, nuevaPartida: nuevaPartida,
    multiplicador: multiplicador, restanteMs: restanteMs, terminada: terminada, responder: responder,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = raiz.CRcontrarreloj;
})(typeof window !== "undefined" ? window : globalThis);
