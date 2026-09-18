/* Agenda: filtro por recinto, por rango de precio, por mes y descarga del calendario elegido. */
(function () {
  var lista = document.querySelector("[data-agenda]");
  if (!lista) return;

  var tarjetas = Array.prototype.slice.call(lista.querySelectorAll("[data-evento]"));
  var chips = Array.prototype.slice.call(document.querySelectorAll("[data-recinto]"));
  var selectorMes = document.querySelector("[data-mes]");
  var precioMin = document.querySelector("[data-precio-min]");
  var precioMax = document.querySelector("[data-precio-max]");
  var vacio = document.querySelector("[data-vacio]");
  var contador = document.querySelector("[data-contador]");
  var boton = document.querySelector("[data-descargar]");
  var recintoActivo = "todos";

  function extraerPrecio(texto) {
    var m = (texto || "").match(/\d+([.,]\d+)?/);
    return m ? parseFloat(m[0].replace(",", "")) : null;
  }

  function filtrar() {
    var mes = selectorMes.value;
    var min = precioMin.value === "" ? null : parseFloat(precioMin.value);
    var max = precioMax.value === "" ? null : parseFloat(precioMax.value);
    var visibles = 0;
    tarjetas.forEach(function (t) {
      var okRecinto = recintoActivo === "todos" || t.dataset.recinto === recintoActivo;
      var okMes = t.dataset.mes === mes;
      var okPrecio = true;
      if (min !== null || max !== null) {
        var precio = extraerPrecio(t.dataset.precio);
        okPrecio = precio !== null && (min === null || precio >= min) && (max === null || precio <= max);
      }
      var ok = okRecinto && okMes && okPrecio;
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
      recintoActivo = chip.dataset.recinto;
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      filtrar();
    });
  });

  selectorMes.addEventListener("change", filtrar);
  precioMin.addEventListener("input", filtrar);
  precioMax.addEventListener("input", filtrar);
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
