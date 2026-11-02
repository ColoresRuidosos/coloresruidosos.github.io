/* Vídeo «Siloé viene a México» (spec-video.md): guion desde datos verificados,
   línea de tiempo, resorte, pulso y cortinilla. Sin DOM: lo usan video.html y las pruebas. */
(function (raiz) {
  var D = typeof module !== "undefined" && module.exports ? require("./datos.js") : raiz.CRinfo;

  var PULSO = 0.5;        // 120 BPM
  var CORTINILLA = 0.6;   // segundos de franjas entre escenas
  var ESCENAS = [
    { id: "viene", titulo: "Viene a México", dur: 4.5 },
    { id: "quienes", titulo: "Quiénes son", dur: 5.5 },
    { id: "discos", titulo: "Sus discos", dur: 7 },
    { id: "conozcas", titulo: "Para que los conozcas", dur: 6 },
    { id: "mexico", titulo: "En México", dur: 5.5 },
    { id: "logo", titulo: "", dur: 4.5 },
  ];
  var INICIOS = [];
  (function () { var a = 0; ESCENAS.forEach(function (e) { INICIOS.push(a); a += e.dur; }); })();

  function duracion() { return INICIOS[INICIOS.length - 1] + ESCENAS[ESCENAS.length - 1].dur; }

  function escena(t) {
    var tt = Math.max(0, t);
    for (var i = ESCENAS.length - 1; i >= 0; i--) {
      if (tt >= INICIOS[i] - 1e-9) {
        var local = Math.min(tt - INICIOS[i], ESCENAS[i].dur);
        if (local < 0) local = 0;
        return { id: ESCENAS[i].id, indice: i, local: local, progreso: local / ESCENAS[i].dur };
      }
    }
  }

  // Resorte amortiguado: llega rápido, rebota un poco (~10 %) y se asienta en 1 a partir de x = 1.5.
  function resorte(x) {
    if (x <= 0) return 0;
    if (x >= 1.5) return 1;
    return 1 - Math.exp(-6.5 * x) * Math.cos(9 * x);
  }
  // Entrada que empieza en `inicio` (segundos locales); `dur` es la parte rápida del movimiento.
  function llegar(local, inicio, dur) { return resorte((local - inicio) / (dur || 0.5)); }
  function enPulso(n) { return n * PULSO; }

  // Progreso 0..1 de la cortinilla si t está cerca de un cambio de escena; null si no.
  function cortinilla(t) {
    for (var i = 1; i < ESCENAS.length; i++) {
      var d = t - INICIOS[i];
      if (Math.abs(d) < CORTINILLA / 2) return (d + CORTINILLA / 2) / CORTINILLA;
    }
    return null;
  }

  // Contenido de las escenas, solo con datos verificados (regla de spec.md).
  function guion(datos) {
    var pub = D.publicables(datos);
    var de = function (b) { return pub.filter(function (d) { return d.bloque === b; }); };
    var mx = de("mexico").filter(function (d) { return d.cuando; })[0];
    var dias = pub.filter(function (d) { return d.id === "mexico-dias"; })[0];
    return {
      banda: datos.banda,
      cabecera: de("cabecera")[0].texto,
      personas: de("integrantes")[0].personas,
      discos: D.discos(datos).map(function (d) { return { anio: d.anio, titulo: d.texto, nota: d.nota || null }; }),
      curiosidades: de("curiosidades").map(function (d) { return d.texto; }),
      mexico: { cuando: mx.cuando, donde: mx.donde, con: mx.con, dias: dias ? dias.texto : null },
    };
  }

  raiz.CRescenas = {
    PULSO: PULSO, CORTINILLA: CORTINILLA, ESCENAS: ESCENAS, INICIOS: INICIOS,
    duracion: duracion, escena: escena, resorte: resorte, llegar: llegar, enPulso: enPulso,
    cortinilla: cortinilla, guion: guion,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = raiz.CRescenas;
})(typeof window !== "undefined" ? window : globalThis);
