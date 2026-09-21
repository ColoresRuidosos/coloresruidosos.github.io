/* Radio: abre la barra, cambia de estación y crea el reproductor (iframe) solo cuando alguien pulsa cargar.
   Antes de eso no se conecta con Spotify, Apple Music ni YouTube. */
(function () {
  var raiz = document.querySelector("[data-radio]");
  if (!raiz) return;

  var PERMITIDOS = ["open.spotify.com", "embed.music.apple.com", "www.youtube-nocookie.com"];
  var abrir = raiz.querySelector(".radio__abrir");
  var panel = raiz.querySelector(".radio__panel");
  var tabs = Array.prototype.slice.call(raiz.querySelectorAll("[role=tab]"));
  var estaciones = Array.prototype.slice.call(raiz.querySelectorAll("[data-estacion-panel]"));

  function guardar(clave, valor) { try { sessionStorage.setItem(clave, valor); } catch (e) { /* sin almacenamiento: se ignora */ } }
  function leer(clave) { try { return sessionStorage.getItem(clave); } catch (e) { return null; } }

  function abrirPanel(si) {
    panel.hidden = !si;
    abrir.setAttribute("aria-expanded", si ? "true" : "false");
    guardar("radio-abierto", si ? "1" : "0");
  }

  function elegirEstacion(i) {
    if (i < 0 || i >= estaciones.length) i = 0;
    tabs.forEach(function (t, n) { t.setAttribute("aria-selected", n === i ? "true" : "false"); });
    estaciones.forEach(function (e, n) { e.hidden = n !== i; });
    guardar("radio-estacion", String(i));
  }

  function crearReproductor(origen) {
    var url;
    try { url = new URL(origen.dataset.src); } catch (e) { return; }
    if (url.protocol !== "https:" || PERMITIDOS.indexOf(url.hostname) === -1) return;

    var plataforma = origen.dataset.plataforma || "";
    var alto = parseInt(origen.dataset.alto, 10) || 0;
    if (url.hostname === "www.youtube-nocookie.com") url.searchParams.set("autoplay", "1");

    var marco = document.createElement("iframe");
    marco.src = url.toString();
    marco.title = "Reproductor de " + plataforma;
    marco.className = "radio__marco";
    if (alto > 0) marco.height = String(alto); else marco.style.aspectRatio = "16 / 9";
    if (url.hostname === "embed.music.apple.com") {
      marco.setAttribute("allow", "autoplay *; encrypted-media *; fullscreen *; clipboard-write");
      marco.setAttribute("sandbox", "allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation");
    } else if (url.hostname === "open.spotify.com") {
      marco.setAttribute("allow", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture");
    } else {
      marco.setAttribute("allow", "autoplay; accelerometer; encrypted-media; gyroscope; picture-in-picture");
      marco.setAttribute("allowfullscreen", "");
    }

    var estacion = origen.closest("[data-estacion-panel]");
    var hueco = estacion.querySelector("[data-reproductor]");
    hueco.textContent = "";
    hueco.appendChild(marco);

    var esPista = origen.classList.contains("radio__pista");
    Array.prototype.forEach.call(estacion.querySelectorAll(".radio__pista"), function (b) { b.removeAttribute("aria-current"); });
    if (esPista) {
      origen.setAttribute("aria-current", "true");
    } else {
      origen.hidden = true;
      var aviso = estacion.querySelector(".radio__aviso");
      if (aviso) aviso.hidden = true;
    }
  }

  abrir.addEventListener("click", function () { abrirPanel(panel.hidden); });

  panel.addEventListener("click", function (ev) {
    var boton = ev.target.closest("button");
    if (!boton || !panel.contains(boton)) return;
    if (boton.hasAttribute("data-estacion")) elegirEstacion(parseInt(boton.dataset.estacion, 10));
    else if (boton.dataset.src) crearReproductor(boton);
  });

  raiz.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && !panel.hidden) { abrirPanel(false); abrir.focus(); }
  });

  raiz.hidden = false;
  elegirEstacion(parseInt(leer("radio-estacion"), 10) || 0);
  if (leer("radio-abierto") === "1") abrirPanel(true);
})();
