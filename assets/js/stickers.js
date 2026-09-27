/* Visor de stickers: abre una tarjeta grande en 3D (el sticker está "pegado" encima de un
   reverso "Colores Ruidosos"). Clic/toque lo despega y lo levanta para revelar el reverso;
   clic de nuevo lo vuelve a pegar. Mover el mouse lo inclina un poco mientras está pegado.
   Cierra con la X, el fondo o Escape. */
(function () {
  var visor = document.querySelector("[data-visor3d]");
  if (!visor) return;

  var carta = visor.querySelector("[data-visor3d-carta]");
  var frente = visor.querySelector("[data-visor3d-frente]");
  var imagen = visor.querySelector("[data-visor3d-imagen]");
  var ayuda = visor.querySelector("[data-visor3d-ayuda]");
  var abiertoPor = null;

  function abrir(boton) {
    imagen.src = boton.dataset.src;
    imagen.alt = boton.dataset.alt || "";
    carta.classList.remove("despegada");
    ayuda.textContent = "Toca el sticker para despegarlo";
    frente.style.removeProperty("--rx");
    frente.style.removeProperty("--ry");
    visor.hidden = false;
    document.body.classList.add("sin-scroll");
    abiertoPor = boton;
    visor.querySelector(".visor3d__cerrar").focus();
  }

  function cerrar() {
    if (visor.hidden) return;
    visor.hidden = true;
    document.body.classList.remove("sin-scroll");
    imagen.src = "";
    if (abiertoPor) { abiertoPor.focus(); abiertoPor = null; }
  }

  document.querySelectorAll(".sticker-abrir").forEach(function (boton) {
    boton.addEventListener("click", function () { abrir(boton); });
  });

  visor.querySelectorAll("[data-visor3d-cerrar]").forEach(function (el) {
    el.addEventListener("click", cerrar);
  });

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") cerrar();
  });

  function despegar() {
    var despegada = carta.classList.toggle("despegada");
    ayuda.textContent = despegada ? "Toca el sticker para volver a pegarlo" : "Toca el sticker para despegarlo";
    frente.style.removeProperty("--rx");
    frente.style.removeProperty("--ry");
  }
  frente.addEventListener("click", despegar);

  frente.addEventListener("pointermove", function (ev) {
    if (ev.pointerType === "touch" || carta.classList.contains("despegada")) return;
    var r = frente.getBoundingClientRect();
    var x = (ev.clientX - r.left) / r.width - .5;
    var y = (ev.clientY - r.top) / r.height - .5;
    frente.style.setProperty("--ry", (x * 14).toFixed(2) + "deg");
    frente.style.setProperty("--rx", (y * -14).toFixed(2) + "deg");
  });
  frente.addEventListener("pointerleave", function () {
    frente.style.removeProperty("--rx");
    frente.style.removeProperty("--ry");
  });
})();
