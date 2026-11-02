/* Lógica pura de In memoriam (F16/D22): contrato de datos, orden, agrupado y
   filtro por región. No toca el DOM, así se prueba con node --test
   (tests-js/in-memoriam.test.js). */
(function (raiz) {
  var REGIONES = ["mx", "es", "latam"];
  var ESTADOS = ["verificada", "propuesta"];
  // Países hispanohablantes. Brasil queda fuera hasta que el equipo decida (A1 en docs/in-memoriam.md).
  var PAISES = {
    MX: "mx", ES: "es",
    AR: "latam", BO: "latam", CL: "latam", CO: "latam", CR: "latam", CU: "latam", DO: "latam", EC: "latam",
    GT: "latam", HN: "latam", NI: "latam", PA: "latam", PE: "latam", PR: "latam", PY: "latam", SV: "latam",
    UY: "latam", VE: "latam",
  };
  var MAX_SEMBLANZA = 160;
  // Principio 3: se recuerda la obra, no el final.
  var CAUSAS = /\b(c[aá]ncer|tumor|accidente|sobredosis|suicid\w*|asesinad\w*|asesinato|homicidio|vih|sida|infarto|overdose)\b/i;
  var FECHA = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;
  var SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  function texto(v) { return typeof v === "string" && v.trim() !== ""; }

  // Devuelve {anio, mes, dia} o null. Valida días reales (no 30 de febrero).
  function leerFecha(f) {
    if (typeof f !== "string") return null;
    var m = FECHA.exec(f);
    if (!m) return null;
    var anio = +m[1], mes = m[2] ? +m[2] : null, dia = m[3] ? +m[3] : null;
    if (mes !== null && (mes < 1 || mes > 12)) return null;
    if (dia !== null) {
      var d = new Date(Date.UTC(anio, mes - 1, dia));
      if (d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return null;
    }
    return { anio: anio, mes: mes, dia: dia };
  }

  // Fecha de hoy como texto AAAA-MM-DD en hora de CDMX (UTC-6), igual que el resto del sitio.
  function hoyTexto(ahora) {
    return new Date(ahora.getTime() - 6 * 3600 * 1000).toISOString().slice(0, 10);
  }

  function validarArtista(a, ahora) {
    var errores = [];
    if (!a || typeof a !== "object") return ["no es un objeto"];
    if (!texto(a.id) || !SLUG.test(a.id)) errores.push("id debe ser un slug (minúsculas y guiones)");
    if (!texto(a.nombre)) errores.push("falta nombre");
    if (a.nombre_completo !== undefined && !texto(a.nombre_completo)) errores.push("nombre_completo vacío");
    if (!texto(a.pais) || !PAISES[a.pais]) errores.push("pais desconocido: " + a.pais);
    if (REGIONES.indexOf(a.region) === -1) errores.push("region inválida: " + a.region);
    else if (PAISES[a.pais] && PAISES[a.pais] !== a.region) errores.push("region no coincide con pais");

    var muerte = leerFecha(a.fallecimiento);
    if (!muerte) errores.push("fallecimiento inválido: " + a.fallecimiento);
    else if (a.fallecimiento > hoyTexto(ahora || new Date()).slice(0, a.fallecimiento.length)) errores.push("fallecimiento en el futuro");

    if (a.nacimiento !== undefined) {
      if (!leerFecha(a.nacimiento)) errores.push("nacimiento inválido: " + a.nacimiento);
      else if (muerte) {
        // Se comparan con la precisión de la fecha más corta ("1950" contra "1985-09-19" → "1950" contra "1985").
        var largo = Math.min(a.nacimiento.length, a.fallecimiento.length);
        if (a.nacimiento.slice(0, largo) >= a.fallecimiento.slice(0, largo)) errores.push("nacimiento no es anterior al fallecimiento");
      }
    }

    if (!Array.isArray(a.proyectos) || a.proyectos.length === 0 || !a.proyectos.every(texto)) errores.push("proyectos debe ser una lista de textos");
    if (!texto(a.semblanza)) errores.push("falta semblanza");
    else {
      if (a.semblanza.length > MAX_SEMBLANZA) errores.push("semblanza de más de " + MAX_SEMBLANZA + " caracteres");
      if (CAUSAS.test(a.semblanza)) errores.push("la semblanza menciona la causa de muerte");
    }
    if (!Array.isArray(a.fuentes) || a.fuentes.length === 0) errores.push("falta al menos una fuente");
    else a.fuentes.forEach(function (u) {
      if (typeof u !== "string" || !/^https:\/\/[^\s/]+\.[^\s/]+\/\S*$/.test(u)) errores.push("fuente no es https: " + u);
    });
    if (ESTADOS.indexOf(a.estado) === -1) errores.push("estado inválido: " + a.estado);
    return errores;
  }

  function publicables(datos) {
    return ((datos && datos.artistas) || []).filter(function (a) { return a.estado === "verificada"; });
  }

  // Más reciente primero. Una fecha parcial ("1980-01") va después de las completas de su mismo periodo:
  // al comparar texto, "1980-01" < "1980-01-03", y el orden descendente la deja al final.
  function ordenar(lista) {
    return lista.slice().sort(function (x, y) {
      if (x.fallecimiento === y.fallecimiento) return x.nombre < y.nombre ? -1 : x.nombre > y.nombre ? 1 : 0;
      return x.fallecimiento < y.fallecimiento ? 1 : -1;
    });
  }

  function agruparPorAnio(lista) {
    var grupos = [];
    ordenar(lista).forEach(function (a) {
      var anio = a.fallecimiento.slice(0, 4);
      var ultimo = grupos[grupos.length - 1];
      if (ultimo && ultimo.anio === anio) ultimo.artistas.push(a);
      else grupos.push({ anio: anio, artistas: [a] });
    });
    return grupos;
  }

  function esteAnio(lista, ahora) {
    var anio = hoyTexto(ahora || new Date()).slice(0, 4);
    return ordenar(lista.filter(function (a) { return a.fallecimiento.slice(0, 4) === anio; }));
  }

  function filtrar(lista, region) {
    if (region === "todas") return lista.slice();
    return lista.filter(function (a) { return a.region === region; });
  }

  function edad(a) {
    var n = leerFecha(a.nacimiento), f = leerFecha(a.fallecimiento);
    if (!n || !f || n.dia === null || f.dia === null) return null;
    var e = f.anio - n.anio;
    if (f.mes < n.mes || (f.mes === n.mes && f.dia < n.dia)) e -= 1;
    return e;
  }

  function textoAnios(a) {
    var muerte = a.fallecimiento.slice(0, 4);
    return a.nacimiento ? a.nacimiento.slice(0, 4) + " – " + muerte : "† " + muerte;
  }

  raiz.CRinMemoriam = {
    REGIONES: REGIONES, PAISES: PAISES, MAX_SEMBLANZA: MAX_SEMBLANZA,
    validarArtista: validarArtista, publicables: publicables, ordenar: ordenar,
    agruparPorAnio: agruparPorAnio, esteAnio: esteAnio, filtrar: filtrar, edad: edad, textoAnios: textoAnios,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = raiz.CRinMemoriam;
})(typeof window !== "undefined" ? window : globalThis);
