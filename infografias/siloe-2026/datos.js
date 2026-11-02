/* Regla de veracidad de la infografía (spec.md): un dato se publica solo si está
   "verificado" con al menos dos fuentes https de dominios distintos, o con el anuncio
   oficial del organizador registrado en `oficial` (plan.md, F6). Sin DOM. */
(function (raiz) {
  var BLOQUES = ["cabecera", "integrantes", "discos", "curiosidades", "mexico"];
  var OBLIGATORIOS = ["cabecera", "integrantes", "discos", "mexico"];
  var ESTADOS = ["verificado", "pendiente"];

  function dominio(url) {
    var m = /^https:\/\/([^/\s]+)\/?\S*$/.exec(url || "");
    return m ? m[1].toLowerCase().replace(/^www\./, "") : null;
  }

  function oficialCompleto(o) {
    return !!o && typeof o.organizador === "string" && o.organizador.trim() !== "" &&
      typeof o.medio === "string" && o.medio.trim() !== "" && /^\d{4}-\d{2}-\d{2}$/.test(o.recibido || "");
  }

  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  function diaSemana(fecha) { return DIAS[new Date(fecha + "T12:00:00Z").getUTCDay()]; }

  function validar(d) {
    var e = [];
    if (!d || typeof d !== "object") return ["no es un objeto"];
    if (typeof d.id !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.id)) e.push("id debe ser un slug");
    if (BLOQUES.indexOf(d.bloque) === -1) e.push("bloque desconocido: " + d.bloque);
    if (typeof d.texto !== "string" || !d.texto.trim()) e.push("falta texto");
    if (ESTADOS.indexOf(d.estado) === -1) e.push("estado inválido: " + d.estado);
    var fuentes = Array.isArray(d.fuentes) ? d.fuentes : [];
    var oficial = d.oficial !== undefined;
    if (oficial && !oficialCompleto(d.oficial)) e.push("oficial necesita organizador, medio y recibido (AAAA-MM-DD)");
    if (!fuentes.length && !oficial) e.push("sin fuentes");
    fuentes.forEach(function (u) { if (!dominio(u)) e.push("fuente no es https: " + u); });
    if (d.fecha !== undefined && d.dia !== undefined && diaSemana(d.fecha) !== d.dia) e.push("el día de la semana no coincide con la fecha");
    if (d.estado === "verificado") {
      var dominios = {};
      fuentes.forEach(function (u) { var x = dominio(u); if (x) dominios[x] = true; });
      if (Object.keys(dominios).length < 2 && !oficialCompleto(d.oficial)) e.push("verificado necesita dos fuentes de dominios distintos o el anuncio oficial del organizador");
    }
    return e;
  }

  function publicables(datos) {
    return (datos.datos || []).filter(function (d) { return d.estado === "verificado"; });
  }

  function discos(datos) {
    return publicables(datos).filter(function (d) { return d.bloque === "discos"; })
      .sort(function (a, b) { return a.anio - b.anio; });
  }

  raiz.CRinfo = { BLOQUES: BLOQUES, OBLIGATORIOS: OBLIGATORIOS, validar: validar, publicables: publicables, discos: discos, dominio: dominio, diaSemana: diaSemana };
  if (typeof module !== "undefined" && module.exports) module.exports = raiz.CRinfo;
})(typeof window !== "undefined" ? window : globalThis);
