/* Halley Flip (F28/D34): lógica pura. Mundo de 160 × 144 px a paso fijo de 1/60 s: la gravedad jala al
   cometa, cada toque lo impulsa hacia arriba y hay que pasar entre torres de bocinas. Sin DOM: se prueba con
   node --test tests-js/halley.test.js. */
(function (raiz) {
  var ANCHO = 160, ALTO = 144, PISO = 136, X_COMETA = 40, RADIO = 4;
  var GRAVEDAD = 0.15, IMPULSO = -2.4, CAIDA_MAX = 3.4; // cada toque sube ~19 px: un tercio del hueco
  var ANCHO_TORRE = 16, SEPARACION = 74, MARGEN = 12, PROB_NOTA = 0.45, MAX_SALTO = 34; // entre huecos seguidos
  var CLAVE = "cr-halley-v1";

  // mulberry32: la semilla vive en el estado (e.s) para que la partida sea reproducible.
  function siguiente(s) {
    s = (s + 0x6D2B79F5) >>> 0;
    var t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return { s: s, v: ((t ^ (t >>> 14)) >>> 0) / 4294967296 };
  }
  function rngSemilla(semilla) {
    var s = semilla >>> 0;
    return function () { var r = siguiente(s); s = r.s; return r.v; };
  }

  function etapa(puntos) { return Math.min(6, 1 + Math.floor(puntos / 10)); }
  function velocidad(et) { return Math.min(1.5, 1 + (et - 1) * 0.1); }
  function hueco(et) { return Math.max(38, 50 - (et - 1) * 2.4); }

  // previo = centro de la torre anterior: el nuevo hueco queda a lo más MAX_SALTO de él, para que siempre dé tiempo.
  function nuevaTorre(x, et, rng, previo) {
    var h = hueco(et), min = MARGEN + h / 2, max = PISO - MARGEN - h / 2;
    if (typeof previo === "number") { min = Math.max(min, previo - MAX_SALTO); max = Math.min(max, previo + MAX_SALTO); }
    return { x: x, centro: Math.round(min + rng() * (max - min)), hueco: h, pasada: false };
  }

  function nuevaPartida(semilla) {
    return { y: ALTO / 2, vy: 0, torres: [], notas: [], puntos: 0, notasTomadas: 0, retiradas: 0,
      vivo: true, iniciada: false, pasos: 0, s: (semilla >>> 0) || 1, proxima: ANCHO + 30 };
  }

  function chocaRect(cx, cy, r, x, y, w, h) {
    var px = Math.max(x, Math.min(cx, x + w)), py = Math.max(y, Math.min(cy, y + h));
    var dx = cx - px, dy = cy - py;
    return dx * dx + dy * dy < r * r;
  }

  function choca(e) {
    if (e.y - RADIO <= 0 || e.y + RADIO >= PISO) return true;
    return e.torres.some(function (t) {
      var arriba = t.centro - t.hueco / 2, abajo = t.centro + t.hueco / 2;
      return chocaRect(X_COMETA, e.y, RADIO, t.x, 0, ANCHO_TORRE, arriba) ||
        chocaRect(X_COMETA, e.y, RADIO, t.x, abajo, ANCHO_TORRE, PISO - abajo);
    });
  }

  /* Avanza un paso de 1/60 s. `toque` = true si en este paso hubo toque. Devuelve un estado nuevo. */
  function paso(prev, toque) {
    if (!prev.vivo) return prev;
    var e = {
      y: prev.y, vy: prev.vy, puntos: prev.puntos, notasTomadas: prev.notasTomadas, retiradas: prev.retiradas,
      vivo: true, iniciada: prev.iniciada, pasos: prev.pasos + 1, s: prev.s, proxima: prev.proxima, ultimoCentro: prev.ultimoCentro,
      torres: prev.torres.map(function (t) { return { x: t.x, centro: t.centro, hueco: t.hueco, pasada: t.pasada }; }),
      notas: prev.notas.map(function (n) { return { x: n.x, y: n.y }; }),
    };
    if (!e.iniciada) {
      if (!toque) { e.y = ALTO / 2 + Math.sin(e.pasos / 12) * 2; return e; }
      e.iniciada = true;
    }
    var rng = function () { var r = siguiente(e.s); e.s = r.s; return r.v; };
    e.vy = toque ? IMPULSO : Math.min(CAIDA_MAX, e.vy + GRAVEDAD);
    e.y += e.vy;
    var et = etapa(e.puntos), v = velocidad(et);
    e.torres.forEach(function (t) { t.x -= v; });
    e.notas.forEach(function (n) { n.x -= v; });
    e.proxima -= v;
    if (e.proxima <= ANCHO) {
      var ultima = e.torres[e.torres.length - 1];
      var t = nuevaTorre(e.proxima, et, rng, ultima ? ultima.centro : e.ultimoCentro);
      e.torres.push(t);
      if (rng() < PROB_NOTA) e.notas.push({ x: t.x + ANCHO_TORRE + (SEPARACION - ANCHO_TORRE) / 2, y: Math.round(MARGEN + 8 + rng() * (PISO - 2 * MARGEN - 16)) });
      e.proxima += SEPARACION;
    }
    e.torres.forEach(function (t) {
      if (!t.pasada && t.x + ANCHO_TORRE < X_COMETA - RADIO) { t.pasada = true; e.puntos += 1; }
    });
    var antes = e.torres.length;
    e.torres = e.torres.filter(function (t) { return t.x + ANCHO_TORRE > -2; });
    e.retiradas += antes - e.torres.length;
    if (e.torres.length) e.ultimoCentro = e.torres[e.torres.length - 1].centro;
    var quedan = [];
    e.notas.forEach(function (n) {
      var dx = n.x - X_COMETA, dy = n.y - e.y;
      if (dx * dx + dy * dy <= (RADIO + 4) * (RADIO + 4)) e.notasTomadas += 1;
      else if (n.x > -8) quedan.push(n);
    });
    e.notas = quedan;
    if (choca(e)) { e.vivo = false; e.y = Math.max(RADIO, Math.min(PISO - RADIO, e.y)); }
    return e;
  }

  function registrar(previo, r) {
    var p = previo && typeof previo === "object" ? previo : { record: 0, partidas: 0, notas: 0 };
    return { record: Math.max(p.record || 0, r.puntos), partidas: (p.partidas || 0) + 1, notas: (p.notas || 0) + r.notas,
      nuevoRecord: r.puntos > (p.record || 0) && r.puntos > 0 };
  }

  function textoCompartir(r) {
    return "Halley Flip · " + r.puntos + (r.puntos === 1 ? " punto" : " puntos") + " · etapa " + etapa(r.puntos) +
      " · " + r.notas + (r.notas === 1 ? " nota" : " notas") + "\n¿Me ganas? coloresruidosos.github.io/games/halley-flip/ · @coloresruidosos";
  }

  raiz.CRhalley = {
    ANCHO: ANCHO, ALTO: ALTO, PISO: PISO, X_COMETA: X_COMETA, RADIO: RADIO, GRAVEDAD: GRAVEDAD, IMPULSO: IMPULSO,
    CAIDA_MAX: CAIDA_MAX, ANCHO_TORRE: ANCHO_TORRE, SEPARACION: SEPARACION, MAX_SALTO: MAX_SALTO, CLAVE: CLAVE,
    rngSemilla: rngSemilla, etapa: etapa, velocidad: velocidad, hueco: hueco, nuevaTorre: nuevaTorre,
    nuevaPartida: nuevaPartida, paso: paso, choca: choca, registrar: registrar, textoCompartir: textoCompartir,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = raiz.CRhalley;
})(typeof window !== "undefined" ? window : globalThis);
