/* Lógica pura del vídeo «In memoriam 2026»: contrato de datos, orden, fechas
   y línea de tiempo. Sin DOM: la usan video.html y tests/video.test.js. */
(function (raiz) {
  // Tiempos en segundos (plan.md, E3).
  var T = { INTRO: 4, TRAMO: 3.4, CIERRE: 6, ENCENDER: 0.3, ENTRA: 0.5, SALE: 0.4 };
  var ANIO = "2026";
  var MAX_LINEA = 70;
  var PAISES = {
    MX: "México", ES: "España", AR: "Argentina", BO: "Bolivia", CL: "Chile", CO: "Colombia",
    CR: "Costa Rica", CU: "Cuba", DO: "República Dominicana", EC: "Ecuador", GT: "Guatemala",
    HN: "Honduras", NI: "Nicaragua", PA: "Panamá", PE: "Perú", PR: "Puerto Rico", PY: "Paraguay",
    SV: "El Salvador", UY: "Uruguay", VE: "Venezuela",
  };
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
    "septiembre", "octubre", "noviembre", "diciembre"];
  // Principio 3 de la spec: se recuerda la obra, no el final.
  var CAUSAS = /\b(c[aá]ncer|tumor|accidente|sobredosis|suicid\w*|asesin\w*|homicidio|vih|sida|infarto|neumon[ií]a|enfermedad)\b/i;
  var FECHA = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/;

  function texto(v) { return typeof v === "string" && v.trim() !== ""; }

  function leerFecha(f) {
    var m = typeof f === "string" && FECHA.exec(f);
    if (!m) return null;
    var mes = +m[2], dia = m[3] ? +m[3] : null;
    if (mes < 1 || mes > 12) return null;
    if (dia !== null) {
      var d = new Date(Date.UTC(+m[1], mes - 1, dia));
      if (d.getUTCMonth() !== mes - 1) return null;
    }
    return { anio: m[1], mes: mes, dia: dia };
  }

  function validar(a) {
    var e = [];
    if (!a || typeof a !== "object") return ["no es un objeto"];
    if (!texto(a.id) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(a.id)) e.push("id debe ser un slug");
    if (!texto(a.nombre)) e.push("falta nombre");
    var f = leerFecha(a.fecha);
    if (!f) e.push("fecha inválida (AAAA-MM o AAAA-MM-DD): " + a.fecha);
    else if (f.anio !== ANIO) e.push("solo artistas fallecidos en " + ANIO);
    if (!PAISES[a.pais]) e.push("país fuera del ámbito: " + a.pais);
    if (!Array.isArray(a.proyectos) || !a.proyectos.length || !a.proyectos.every(texto)) e.push("proyectos: lista de textos");
    if (!texto(a.linea)) e.push("falta línea");
    else {
      if (a.linea.length > MAX_LINEA) e.push("línea de más de " + MAX_LINEA + " caracteres");
      if (CAUSAS.test(a.linea)) e.push("la línea menciona la causa de muerte");
    }
    var fuentes = Array.isArray(a.fuentes) ? a.fuentes : [];
    if (new Set(fuentes).size < 2) e.push("hacen falta dos fuentes distintas");
    fuentes.forEach(function (u) {
      if (typeof u !== "string" || !/^https:\/\/[^\s/]+\.[^\s/]+\/\S*$/.test(u)) e.push("fuente no es https: " + u);
    });
    return e;
  }

  // "2026-01" (solo mes) va después de todos los días de enero.
  function clave(a) { return a.fecha.length === 7 ? a.fecha + "-99" : a.fecha; }
  function ordenar(lista) {
    return lista.slice().sort(function (x, y) { return clave(x) < clave(y) ? -1 : clave(x) > clave(y) ? 1 : 0; });
  }

  function fechaTexto(f) {
    var d = leerFecha(f);
    return d.dia === null ? MESES[d.mes - 1] : d.dia + " de " + MESES[d.mes - 1];
  }
  function paisTexto(p) { return PAISES[p]; }

  function duracion(n) { return T.INTRO + n * T.TRAMO + T.CIERRE; }

  function escena(t, n) {
    if (t < T.INTRO) {
      var li = Math.max(0, t);
      return { tipo: "intro", indice: -1, local: li, progreso: li / T.INTRO };
    }
    var dentro = t - T.INTRO;
    var i = Math.floor(dentro / T.TRAMO + 1e-9);
    if (i < n) {
      var local = dentro - i * T.TRAMO;
      return { tipo: "artista", indice: i, local: local, progreso: local / T.TRAMO };
    }
    var lc = Math.min(t - T.INTRO - n * T.TRAMO, T.CIERRE);
    return { tipo: "cierre", indice: n, local: lc, progreso: lc / T.CIERRE };
  }

  function encendidas(t, n) {
    var cuenta = Math.floor((t - T.INTRO - T.ENCENDER) / T.TRAMO) + 1;
    return Math.max(0, Math.min(n, cuenta));
  }

  function cuadricula(n) {
    var filas = Math.min(3, Math.ceil(n / 5));
    return { filas: filas, columnas: Math.ceil(n / filas) };
  }

  // Ofrenda escalonada: hasta 5 veladoras en un solo nivel; si hay más, tres niveles con menos arriba.
  function niveles(n) {
    if (n <= 5) return [n];
    var base = Math.floor(n / 3);
    return [base - 1, base, n - 2 * base + 1];
  }

  // Mulberry32: pseudoaleatorio con semilla, para que cada render sea idéntico.
  function aleatorio(semilla) {
    var s = semilla >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var r = Math.imul(s ^ (s >>> 15), 1 | s);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Paleta de papel picado (plan.md, E10). Rosa mexicano es color cultural, no el rosa de la marca.
  var TINTA = "#141414", CREMA = "#F4EFE6";
  var PALETA = ["#E4007C", "#FF7A30", "#00A3A6", "#FFD23F", "#6C2A8C", "#1FB57A", "#2F5BFF"];

  function luminancia(hex) {
    var c = [1, 3, 5].map(function (i) {
      var v = parseInt(hex.substr(i, 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contraste(a, b) {
    var la = luminancia(a), lb = luminancia(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  // Tinta o crema: la que contraste más con el papel.
  function colorTexto(fondo) { return contraste(TINTA, fondo) >= contraste(CREMA, fondo) ? TINTA : CREMA; }
  function papel(i) { return PALETA[((i % PALETA.length) + PALETA.length) % PALETA.length]; }

  function suave(x) {
    var v = Math.max(0, Math.min(1, x));
    return v * v * (3 - 2 * v);
  }

  raiz.CRvideo = {
    T: T, ANIO: ANIO, validar: validar, ordenar: ordenar, fechaTexto: fechaTexto, paisTexto: paisTexto,
    duracion: duracion, escena: escena, encendidas: encendidas, cuadricula: cuadricula, niveles: niveles,
    aleatorio: aleatorio, suave: suave,
    TINTA: TINTA, CREMA: CREMA, PALETA: PALETA, contraste: contraste, colorTexto: colorTexto, papel: papel,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = raiz.CRvideo;
})(typeof window !== "undefined" ? window : globalThis);
