/* In memoriam (F16): filtro por región. Sin JavaScript se ve todo el muro;
   esto solo muestra los botones y oculta tarjetas y años vacíos. */
(function () {
  var filtro = document.querySelector("[data-memoria-filtro]");
  if (!filtro) return;
  var botones = filtro.querySelectorAll("button[data-region]");
  var contador = filtro.querySelector("[data-memoria-contador]");
  var grupos = document.querySelectorAll("[data-memoria-grupo]");
  var vacio = document.querySelector("[data-memoria-vacio]");
  var NOMBRES = { todas: "", mx: " de México", es: " de España", latam: " de Latinoamérica" };

  function aplicar(region) {
    var visibles = 0;
    grupos.forEach(function (grupo) {
      var enGrupo = 0;
      grupo.querySelectorAll(".memoria[data-region]").forEach(function (tarjeta) {
        var ver = region === "todas" || tarjeta.getAttribute("data-region") === region;
        tarjeta.hidden = !ver;
        if (ver) enGrupo += 1;
      });
      grupo.hidden = enGrupo === 0;
      visibles += enGrupo;
    });
    botones.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-region") === region));
    });
    if (vacio) vacio.hidden = visibles !== 0;
    contador.textContent = visibles + (visibles === 1 ? " artista" : " artistas") + (NOMBRES[region] || "");
  }

  botones.forEach(function (b) {
    b.addEventListener("click", function () { aplicar(b.getAttribute("data-region")); });
  });
  filtro.hidden = false;
  aplicar("todas");
})();
