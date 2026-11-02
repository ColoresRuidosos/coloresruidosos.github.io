/* Regla de veracidad de la infografía (spec.md): un dato se publica solo si está
   "verificado" con al menos dos fuentes https de dominios distintos. Sin DOM. */
(function (raiz) {
  var BLOQUES = ["cabecera", "integrantes", "discos", "curiosidades", "mexico"];
  var OBLIGATORIOS = ["cabecera", "integrantes", "discos", "mexico"];
  var ESTADOS = ["verificado", "pendiente"];

  function dominio(url) {
    var m = /^https:\/\/([^/\s]+)\/?\S*$/.exec(url || "");
    return m ? m[1].toLowerCase().replace(/^www\./, "") : null;
  }

  function validar(d) {
    var e = [];
    if (!d || typeof d !== "object") return ["no es un objeto"];
    if (typeof d.id !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.id)) e.push("id debe ser un slug");
    if (BLOQUES.indexOf(d.bloque) === -1) e.push("bloque desconocido: " + d.bloque);
    if (typeof d.texto !== "string" || !d.texto.trim()) e.push("falta texto");
    if (ESTADOS.indexOf(d.estado) === -1) e.push("estado inválido: " + d.estado);
    var fuentes = Array.isArray(d.fuentes) ? d.fuentes : [];
    if (!fuentes.length) e.push("sin fuentes");
    fuentes.forEach(function (u) { if (!dominio(u)) e.push("fuente no es https: " + u); });
    if (d.estado === "verificado") {
      var dominios = {};
      fuentes.forEach(function (u) { var x = dominio(u); if (x) dominios[x] = true; });
      if (Object.keys(dominios).length < 2) e.push("verificado necesita dos fuentes de dominios distintos");
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

  raiz.CRinfo = { BLOQUES: BLOQUES, OBLIGATORIOS: OBLIGATORIOS, validar: validar, publicables: publicables, discos: discos, dominio: dominio };
  if (typeof module !== "undefined" && module.exports) module.exports = raiz.CRinfo;
})(typeof window !== "undefined" ? window : globalThis);
