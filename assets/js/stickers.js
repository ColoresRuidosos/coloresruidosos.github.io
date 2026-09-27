/* Visor de stickers: abre una tarjeta grande en 3D (frente = sticker, reverso = Colores Ruidosos).
   Clic/toque en la tarjeta la voltea; mover el mouse la inclina un poco. Cierra con la X, el fondo o Escape. */
(function () {
  var visor = document.querySelector("[data-visor3d]");
  if (!visor) return;

  var interior = visor.querySelector("[data-visor3d-interior]");
  var imagen = visor.querySelector("[data-visor3d-imagen]");
  var abiertoPor = null;

  function abrir(boton) {
    imagen.src = boton.dataset.src;
    imagen.alt = boton.dataset.alt || "";
    interior.classList.remove("volteada");
    interior.style.removeProperty("--rx");
    interior.style.removeProperty("--ry");
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

  function voltear() { interior.classList.toggle("volteada"); }
  interior.addEventListener("click", voltear);
  interior.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); voltear(); }
  });

  interior.addEventListener("pointermove", function (ev) {
    if (ev.pointerType === "touch") return;
    var r = interior.getBoundingClientRect();
    var x = (ev.clientX - r.left) / r.width - .5;
    var y = (ev.clientY - r.top) / r.height - .5;
    interior.style.setProperty("--ry", (x * 16).toFixed(2) + "deg");
    interior.style.setProperty("--rx", (y * -16).toFixed(2) + "deg");
  });
  interior.addEventListener("pointerleave", function () {
    interior.style.removeProperty("--rx");
    interior.style.removeProperty("--ry");
  });
})();
