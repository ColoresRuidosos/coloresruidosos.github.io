/* Compartir en Instagram (F19/D25): la parte pura. Limpia el @ opcional de la persona (que solo
   va en su propia imagen) y arma el texto para pegar, porque Instagram no deja precargarlo. */
(function (raiz) {
  var CUENTA = "@coloresruidosos";
  var DIRECCION = "coloresruidosos.github.io/trivia";
  var FORMATOS = { historia: { ancho: 1080, alto: 1920 }, feed: { ancho: 1080, alto: 1350 } };

  // Como Instagram: letras, números, punto y guion bajo, máximo 30. Lo demás se descarta.
  function limpiarArroba(texto) {
    var s = String(texto || "").trim().replace(/^@+/, "").toLowerCase();
    return /^[a-z0-9._]{1,30}$/.test(s) ? s : "";
  }

  function textoResultado(r) {
    return "Soy " + r.categoria + " en la trivia 8 bits de Love of Lesbian 🎮 (" + r.puntos + "/30). " +
      "¿Y tú qué tan lesbiano eres? Juega en " + DIRECCION + " · " + CUENTA;
  }

  function textoChapa(ins) {
    return "Conseguí la insignia «" + ins.nombre + "» en la trivia 8 bits de Love of Lesbian 🎮 " +
      "¿Te atreves? " + DIRECCION + " · " + CUENTA;
  }

  raiz.CRcompartir = { CUENTA: CUENTA, DIRECCION: DIRECCION, FORMATOS: FORMATOS,
    limpiarArroba: limpiarArroba, textoResultado: textoResultado, textoChapa: textoChapa };
  if (typeof module !== "undefined" && module.exports) module.exports = raiz.CRcompartir;
})(typeof window !== "undefined" ? window : globalThis);
