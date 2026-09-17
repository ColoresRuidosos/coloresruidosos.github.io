/* Agenda: filtro por curador, filtro por mes y descarga del calendario elegido. */
(function () {
  var lista = document.querySelector("[data-agenda]");
  if (!lista) return;

  var tarjetas = Array.prototype.slice.call(lista.querySelectorAll("[data-evento]"));
  var chips = Array.prototype.slice.call(document.querySelectorAll("[data-firma]"));
  var selectorMes = document.querySelector("[data-mes]");
  var vacio = document.querySelector("[data-vacio]");
  var contador = document.querySelector("[data-contador]");
  var boton = document.querySelector("[data-descargar]");
  var firmaActiva = "todos";

  function filtrar() {
    var mes = selectorMes.value;
    var visibles = 0;
    tarjetas.forEach(function (t) {
      var firmas = t.dataset.firmas.split(",");
      var ok = t.dataset.mes === mes && (firmaActiva === "todos" || firmas.indexOf(firmaActiva) !== -1);
      t.hidden = !ok;
      if (ok) visibles++;
    });
    vacio.hidden = visibles > 0;
    actualizarSeleccion();
  }

  function elegidas() {
    return tarjetas.filter(function (t) {
      return !t.hidden && t.querySelector("input[name=elegir]").checked;
    });
  }

  function actualizarSeleccion() {
    var n = elegidas().length;
    contador.textContent = n === 0
      ? "Elige conciertos para armar tu calendario."
      : n === 1 ? "1 concierto elegido." : n + " conciertos elegidos.";
    boton.disabled = n === 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      firmaActiva = chip.dataset.firma;
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      filtrar();
    });
  });

  selectorMes.addEventListener("change", filtrar);
  lista.addEventListener("change", actualizarSeleccion);

  boton.addEventListener("click", function () {
    var eventos = elegidas().map(function (t) {
      var d = t.dataset;
      var firmas = d.firmas.split(",");
      return {
        id: d.id, titulo: d.titulo, fecha: d.fecha, hora: d.hora,
        recinto: d.recinto, ciudad: d.ciudad, url: d.url,
        firma: firmas[0] === "Cartelera" ? "Tomado de la cartelera" : "Recomendado por " + firmas.join(", ")
      };
    });
    var blob = new Blob([window.CRics.crearICS(eventos)], { type: "text/calendar;charset=utf-8" });
    var enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(blob);
    enlace.download = "colores-ruidosos-" + selectorMes.value + ".ics";
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(function () { URL.revokeObjectURL(enlace.href); }, 1000);
    contador.textContent = "Calendario descargado. Ábrelo para agregarlo a tu app de calendario.";
  });

  var hoy = new Date();
  var mesActual = hoy.getFullYear() + "-" + String(hoy.getMonth() + 1).padStart(2, "0");
  var opciones = Array.prototype.map.call(selectorMes.options, function (o) { return o.value; });
  if (opciones.indexOf(mesActual) !== -1) selectorMes.value = mesActual;
  filtrar();
})();
