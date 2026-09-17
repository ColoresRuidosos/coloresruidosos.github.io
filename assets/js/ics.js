/* Generador de archivos .ics (RFC 5545) para la agenda de Colores Ruidosos.
   Supuesto: todos los recintos están en Pachuca o CDMX (UTC-6 todo el año,
   México no usa horario de verano desde 2022). */
(function (raiz) {
  var OFFSET_HORAS = 6;
  var DURACION_HORAS = 3;

  function dos(n) { return String(n).padStart(2, "0"); }

  function escapar(texto) {
    return String(texto || "")
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\r?\n/g, "\\n");
  }

  function doblar(linea) {
    var partes = [];
    while (linea.length > 73) {
      partes.push(linea.slice(0, 73));
      linea = " " + linea.slice(73);
    }
    partes.push(linea);
    return partes.join("\r\n");
  }

  function utc(fecha) {
    return fecha.getUTCFullYear() + dos(fecha.getUTCMonth() + 1) + dos(fecha.getUTCDate()) +
      "T" + dos(fecha.getUTCHours()) + dos(fecha.getUTCMinutes()) + "00Z";
  }

  function soloFecha(fecha) {
    return fecha.getUTCFullYear() + dos(fecha.getUTCMonth() + 1) + dos(fecha.getUTCDate());
  }

  function lineasEvento(e, sello) {
    var p = e.fecha.split("-").map(Number);
    var lineas = ["BEGIN:VEVENT", "UID:" + e.id + "@coloresruidosos", "DTSTAMP:" + sello];
    if (e.hora) {
      var h = e.hora.split(":").map(Number);
      var inicio = new Date(Date.UTC(p[0], p[1] - 1, p[2], h[0] + OFFSET_HORAS, h[1] || 0));
      var fin = new Date(inicio.getTime() + DURACION_HORAS * 3600000);
      lineas.push("DTSTART:" + utc(inicio), "DTEND:" + utc(fin));
    } else {
      var dia = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
      var siguiente = new Date(dia.getTime() + 86400000);
      lineas.push("DTSTART;VALUE=DATE:" + soloFecha(dia), "DTEND;VALUE=DATE:" + soloFecha(siguiente));
    }
    var lugar = [e.recinto, e.ciudad].filter(Boolean).join(", ");
    var descripcion = (e.firma || "") + (e.url ? "\nMás info: " + e.url : "");
    lineas.push("SUMMARY:" + escapar(e.titulo));
    if (lugar) lineas.push("LOCATION:" + escapar(lugar));
    if (descripcion) lineas.push("DESCRIPTION:" + escapar(descripcion));
    if (e.url) lineas.push("URL:" + e.url);
    lineas.push("END:VEVENT");
    return lineas;
  }

  function crearICS(eventos, ahora) {
    var sello = utc(ahora || new Date());
    var lineas = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Colores Ruidosos//Agenda//ES",
      "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:Mis conciertos | Colores Ruidosos"];
    eventos.forEach(function (e) { lineas = lineas.concat(lineasEvento(e, sello)); });
    lineas.push("END:VCALENDAR");
    return lineas.map(doblar).join("\r\n") + "\r\n";
  }

  raiz.CRics = { crearICS: crearICS, escapar: escapar };
  if (typeof module !== "undefined" && module.exports) module.exports = raiz.CRics;
})(typeof window !== "undefined" ? window : globalThis);
