/* Halley Flip (F28/D34): pantalla, entrada y sonido. La física está en flip.js (CRhalley) y los fondos son las
   escenas de la trivia (CRescenas). Paso fijo de 1/60 s con acumulador; el canvas mide 160 × 144 y se escala. */
(function () {
  var raiz = document.querySelector("[data-halley]");
  if (!raiz || !window.CRhalley || !window.CRescenas) return;
  var H = window.CRhalley, E = window.CRescenas;
  var $ = function (s, r) { return (r || raiz).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || raiz).querySelectorAll(s)); };
  var lienzo = $("[data-lienzo]"), ctx = lienzo.getContext("2d");
  var fondo = document.createElement("canvas"); fondo.width = H.ANCHO; fondo.height = H.ALTO;
  var fctx = fondo.getContext("2d");
  var sinMovimiento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DT = 1 / 60;
  var COLORES = ["#2F5BFF", "#FF7A30", "#1FB57A", "#FFD23F", "#FF3E7F", "#6ad3d0"];

  // ---------- Récord ----------
  function leer() { try { return JSON.parse(window.localStorage.getItem(H.CLAVE) || "null"); } catch (e) { return null; } }
  function guardar(v) { try { window.localStorage.setItem(H.CLAVE, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  var historial = leer() || { record: 0, partidas: 0, notas: 0 };

  function contar(evento) {
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "halley-" + evento, title: evento, event: true }); } catch (e) { /* sin analítica */ }
  }

  // ---------- Sonido (apagado de inicio) ----------
  var sonidoOn = false, audio = null;
  function tono(frec, dur, tipo, vol) {
    if (!sonidoOn) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      var o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime;
      o.type = tipo || "square"; o.frequency.value = frec;
      g.gain.setValueAtTime(vol || 0.06, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t + dur);
    } catch (e) { /* sin audio */ }
  }
  var SONIDOS = {
    toque: function () { tono(660, 0.06, "square", 0.04); },
    punto: function () { tono(988, 0.07); setTimeout(function () { tono(1319, 0.08); }, 60); },
    nota: function () { tono(1568, 0.1, "triangle", 0.08); },
    choque: function () { tono(196, 0.25, "sawtooth", 0.07); setTimeout(function () { tono(147, 0.3, "sawtooth", 0.06); }, 120); },
    etapa: function () { [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { tono(f, 0.1); }, i * 90); }); },
  };

  // ---------- Pantallas ----------
  function mostrar(nombre) {
    raiz.setAttribute("data-en", nombre);
    $$("[data-pantalla]").forEach(function (p) { p.hidden = p.getAttribute("data-pantalla") !== nombre; });
    var foco = $("[data-pantalla='" + nombre + "'] [data-foco]");
    if (foco) foco.focus();
    $("[data-pausa]").disabled = nombre !== "jugando" && nombre !== "pausa";
  }

  function hud() {
    $("[data-hud-puntos]").textContent = e.puntos;
    $("[data-hud-etapa]").textContent = H.etapa(e.puntos);
    $("[data-hud-notas]").textContent = e.notasTomadas;
    $("[data-hud-record]").textContent = Math.max(historial.record, e.puntos);
  }

  // ---------- Dibujo ----------
  var etapaFondo = 0, cuadro = 0, destello = 0;
  function pintarFondo(et) {
    E.dibujarEscena(fctx, "E" + et, sinMovimiento ? 0 : Math.floor(cuadro / 8));
    etapaFondo = et;
  }

  function torre(t, color) {
    var arriba = t.centro - t.hueco / 2, abajo = t.centro + t.hueco / 2, x = Math.round(t.x), w = H.ANCHO_TORRE;
    [[0, arriba], [abajo, H.PISO - abajo]].forEach(function (tramo) {
      var y0 = Math.round(tramo[0]), alto = Math.round(tramo[1]);
      if (alto <= 0) return;
      ctx.fillStyle = "#0d0d0d"; ctx.fillRect(x, y0, w, alto);
      ctx.fillStyle = "#2b2b2b"; ctx.fillRect(x + 1, y0, w - 2, alto);
      // Bocinas: un cono cada 14 px.
      for (var yy = y0 + 3; yy + 10 <= y0 + alto; yy += 14) {
        ctx.fillStyle = "#121212"; ctx.fillRect(x + 3, yy, 10, 10);
        ctx.fillStyle = "#5a5a5a"; ctx.fillRect(x + 4, yy + 1, 8, 8);
        ctx.fillStyle = "#8a8a8a"; ctx.fillRect(x + 6, yy + 3, 4, 4);
        ctx.fillStyle = "#121212"; ctx.fillRect(x + 7, yy + 4, 2, 2);
      }
    });
    // Borde de color en la orilla del hueco.
    ctx.fillStyle = color;
    ctx.fillRect(x - 1, Math.round(arriba) - 4, w + 2, 4);
    ctx.fillRect(x - 1, Math.round(abajo), w + 2, 4);
  }

  // Notas: corchea doble negra, más grande, con contorno crema para que se vea en los fondos oscuros.
  var NOTA = [
    "...kkkkkk",
    "...kkkkkk",
    "...k....k",
    "...k....k",
    "...k....k",
    "...k....k",
    ".kkk..kkk",
    "kkkk.kkkk",
    "kkkk.kkkk",
    ".kk...kk.",
  ];
  var NOTA_BORDE = (function () { // píxeles vecinos de la nota que no son nota: su contorno
    var lleno = function (i, j) { return j >= 0 && j < NOTA.length && i >= 0 && i < NOTA[j].length && NOTA[j][i] === "k"; };
    var borde = [];
    for (var j = -1; j <= NOTA.length; j++) for (var i = -1; i <= NOTA[0].length; i++) {
      if (lleno(i, j)) continue;
      for (var dj = -1; dj <= 1; dj++) for (var di = -1; di <= 1; di++) if (lleno(i + di, j + dj)) { borde.push([i, j]); di = dj = 2; }
    }
    return borde;
  })();
  function nota(n) {
    var x0 = Math.round(n.x) - 4, y0 = Math.round(n.y) - 5 + (sinMovimiento ? 0 : Math.round(Math.sin((cuadro + n.x) / 8)));
    ctx.fillStyle = "#F4EFE6";
    NOTA_BORDE.forEach(function (b) { ctx.fillRect(x0 + b[0], y0 + b[1], 1, 1); });
    ctx.fillStyle = "#141414";
    NOTA.forEach(function (f, j) { for (var i = 0; i < f.length; i++) if (f[i] === "k") ctx.fillRect(x0 + i, y0 + j, 1, 1); });
  }

  // El amante guisante (diseño propio, por «Te hiero mucho (Historia del amante guisante)»): guisante aviador con
  // casco, gogles, carita y un corazón que flota, jalando un listón rojo que ondea con "GRACIAS". El choque sigue siendo el
  // círculo de radio 4 en su centro.
  var GUISANTE = [ // con casco de aviador (orejeras) y gogles sobre la frente
    "....MMMM....",
    "..MMmmmmMM..",
    ".MmmmmmmmmM.",
    ".MGGGmmGGGM.",
    "MGWWhGGWWhGM",
    "MvGGGvvGGGvM",
    "MvvvkvvvkvvM",
    "MvvvkvvvkvvM",
    "MvpvvvvvvpvM",
    ".Vvvvk.kvvV.",
    ".VvvvvkvvvV.",
    "..VVvvvvVV..",
    "....VVVV....",
  ];
  var COLOR_G = { V: "#2e7d32", v: "#6cc04a", h: "#ffffff", k: "#141414", p: "#FF3E7F", M: "#5a3518", m: "#8a5a2b", G: "#4a4a4a", W: "#9fd8f0" };
  var CORAZON = [".pp.pp.", "ppppppp", "ppppppp", ".ppppp.", "..ppp..", "...p..."];
  var LETRAS = { G: ["111", "100", "101", "101", "111"], R: ["110", "101", "110", "101", "101"], A: ["010", "101", "111", "101", "101"],
    C: ["111", "100", "100", "100", "111"], I: ["111", "010", "010", "010", "111"], S: ["111", "100", "111", "001", "111"] };
  var LISTON = "GRACIAS";

  function guisante() {
    var cx = H.X_COMETA, cy = Math.round(e.y), t = sinMovimiento ? 0 : cuadro;
    var inclina = Math.max(-1.5, Math.min(1.5, e.vy * 0.5)); // al subir, el listón queda abajo (y al revés)
    var x0 = cx - 6, y0 = cy - 7, ancho = LISTON.length * 4 + 4, inicio = x0 - 4;
    ctx.fillStyle = "#c9c9c9";
    for (var k = 0; k < 4; k++) ctx.fillRect(x0 - k, Math.round(cy - inclina * k / 4), 1, 1);
    for (var c = 0; c < ancho; c++) {
      var xx = inicio - c, yy = Math.round(cy - 4 - inclina * (c + 4) / 4 + Math.sin((c + t * 1.2) / 3) * 1.5);
      ctx.fillStyle = "#E0302B"; ctx.fillRect(xx, yy, 1, 7);
      ctx.fillStyle = "#8e1a16"; ctx.fillRect(xx, yy + 7, 1, 1);
      var col = ancho - 3 - c, li = Math.floor(col / 4), cc = col % 4;
      if (li >= 0 && li < LISTON.length && cc < 3) {
        var g = LETRAS[LISTON[li]];
        ctx.fillStyle = "#F4EFE6";
        for (var f = 0; f < 5; f++) if (g[f][cc] === "1") ctx.fillRect(xx, yy + 1 + f, 1, 1);
      }
    }
    GUISANTE.forEach(function (fila, j) {
      for (var i = 0; i < fila.length; i++) {
        var color = COLOR_G[fila[i]];
        if (color) { ctx.fillStyle = color; ctx.fillRect(x0 + i, y0 + j, 1, 1); }
      }
    });
    var fase = (t % 120) / 120; // un corazón sube y se desvanece cada 2 s
    if (fase < 0.6) {
      var hx = cx + 6, hy = Math.round(cy - 9 - fase * 14);
      ctx.globalAlpha = 1 - fase / 0.6; ctx.fillStyle = "#FF3E7F";
      CORAZON.forEach(function (fila, j) { for (var i = 0; i < fila.length; i++) if (fila[i] === "p") ctx.fillRect(hx + i, hy + j, 1, 1); });
      ctx.globalAlpha = 1;
    }
  }

  function dibujar() {
    var et = H.etapa(e.puntos), color = COLORES[et - 1];
    if (et !== etapaFondo || (!sinMovimiento && cuadro % 8 === 0)) pintarFondo(et);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(fondo, 0, 0);
    ctx.fillStyle = "rgba(10,10,20,.2)"; ctx.fillRect(0, 0, H.ANCHO, H.ALTO);
    e.torres.forEach(function (t) { torre(t, color); });
    e.notas.forEach(nota);
    // Piso: escenario de madera que avanza.
    ctx.fillStyle = "#3a2516"; ctx.fillRect(0, H.PISO, H.ANCHO, H.ALTO - H.PISO);
    ctx.fillStyle = color; ctx.fillRect(0, H.PISO, H.ANCHO, 1);
    var corre = sinMovimiento ? 0 : Math.floor((e.pasos * H.velocidad(et)) % 8);
    ctx.fillStyle = "#5a3a22";
    for (var x = -corre; x < H.ANCHO; x += 8) ctx.fillRect(x, H.PISO + 3, 5, 1);
    guisante();
    if (destello > 0) { ctx.fillStyle = "rgba(255,62,127," + (destello / 12 * 0.5) + ")"; ctx.fillRect(0, 0, H.ANCHO, H.ALTO); destello--; }
  }

  // ---------- Partida ----------
  var e = H.nuevaPartida(1), modo = "inicio", toque = false, acum = 0, ultimo = 0, avisoTimer = 0;

  function nueva() {
    e = H.nuevaPartida((Math.random() * 4294967296) >>> 0);
    toque = false; acum = 0;
    $("[data-publicar]").hidden = true;
    hud();
    mostrar("listo");
    modo = "listo";
    contar("nueva");
  }

  function avisoEtapa(et) {
    var info = E.ETAPAS_INFO["E" + et];
    var p = $("[data-aviso-etapa]");
    p.textContent = "Etapa " + et + " · " + (info ? info.nombre : "");
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(function () { p.textContent = ""; }, 2200);
  }

  function fin() {
    modo = "resultado";
    destello = sinMovimiento ? 0 : 12;
    SONIDOS.choque();
    var r = { puntos: e.puntos, notas: e.notasTomadas };
    historial = H.registrar(historial, r);
    guardar({ record: historial.record, partidas: historial.partidas, notas: historial.notas });
    $("[data-res-titulo]").textContent = r.puntos >= 50 ? "¡Gira completa!" : r.puntos >= 10 ? "¡Buen vuelo!" : "¡Choque!";
    $("[data-res-puntos]").textContent = r.puntos;
    $("[data-res-detalle]").textContent = "Etapa " + H.etapa(r.puntos) + " · " + r.notas + (r.notas === 1 ? " nota" : " notas");
    $("[data-res-record]").textContent = historial.nuevoRecord ? "¡Nuevo récord!" : "Récord: " + historial.record;
    $("[data-aviso-compartir]").textContent = "";
    prepararPublicar(r.puntos, H.duracionMs(e));
    hud();
    contar("fin");
    setTimeout(function () { if (modo === "resultado") mostrar("resultado"); }, 450);
  }

  function tocar() {
    if (modo === "listo") { modo = "jugando"; mostrar("jugando"); ultimo = performance.now(); acum = 0; }
    if (modo !== "jugando") return;
    toque = true;
    SONIDOS.toque();
  }

  function pausar() {
    if (modo === "jugando") { modo = "pausa"; mostrar("pausa"); }
  }
  function seguir() {
    if (modo === "pausa") { modo = "jugando"; mostrar("jugando"); ultimo = performance.now(); acum = 0; }
  }

  function bucle(t) {
    if (modo === "jugando") {
      acum += Math.min(0.25, Math.max(0, (t - ultimo) / 1000));
      while (acum >= DT && modo === "jugando") {
        var antes = e.puntos, notas = e.notasTomadas, et = H.etapa(e.puntos);
        e = H.paso(e, toque);
        toque = false;
        acum -= DT;
        if (e.puntos > antes) { SONIDOS.punto(); if (H.etapa(e.puntos) > et) { SONIDOS.etapa(); avisoEtapa(H.etapa(e.puntos)); } }
        if (e.notasTomadas > notas) SONIDOS.nota();
        if (!e.vivo) fin();
      }
      hud();
    } else if (modo === "listo" || modo === "inicio") {
      e = H.paso(e, false); // flota mientras espera el primer toque
    }
    ultimo = t;
    cuadro++;
    dibujar();
    window.requestAnimationFrame(bucle);
  }

  // ---------- Ranking (D35): mismo Apps Script, nombre y dispositivo que la trivia ----------
  function leerTexto(k) { try { return window.localStorage.getItem(k); } catch (err) { return null; } }
  function escribirTexto(k, v) { try { window.localStorage.setItem(k, v); } catch (err) { /* sin almacenamiento */ } }
  var R = window.CRranking, urlRanking = raiz.getAttribute("data-ranking-url") || "";
  var miNombre = null, miDispositivo = null, porPublicar = null, rkDatos = null, rkCargado = 0, periodo = "semana";
  if (urlRanking && R) {
    miNombre = leerTexto("cr-trivia-nombre");
    if (!R.nombreValido(miNombre)) { miNombre = R.generarNombre(Math.random); escribirTexto("cr-trivia-nombre", miNombre); }
    miDispositivo = leerTexto("cr-trivia-dispositivo");
    if (!/^[a-z0-9]{16}$/.test(miDispositivo || "")) { miDispositivo = R.nuevoDispositivo(Math.random); escribirTexto("cr-trivia-dispositivo", miDispositivo); }
    $("[data-ver-ranking]").hidden = false;
  } else urlRanking = "";

  var ERRORES = {
    modo: "El ranking de Halley Flip todavía no está activo: el equipo tiene que actualizar el script.",
    duracion: "La partida fue muy corta para el ranking.",
    rapido: "Ese puntaje no cuadra con el tiempo jugado.",
    limite: "Ya publicaste muchas veces en esta hora. Intenta más tarde.",
  };

  function prepararPublicar(puntos, duracionMs) {
    var b = $("[data-publicar]");
    if (!urlRanking || puntos <= 0) { b.hidden = true; return; }
    porPublicar = { puntos: puntos, duracionMs: duracionMs };
    $("[data-mi-nombre]").textContent = miNombre;
    $("[data-publicar-estado]").textContent = "";
    $("[data-publicar-puntaje]").disabled = false;
    $("[data-otro-nombre]").disabled = false;
    b.hidden = false;
  }

  function publicar() {
    if (!porPublicar) return;
    var boton = $("[data-publicar-puntaje]"), aviso = $("[data-publicar-estado]");
    boton.disabled = true; aviso.textContent = "Publicando…";
    var envio = R.armarEnvio("halley", miNombre, porPublicar.puntos, porPublicar.duracionMs, miDispositivo);
    fetch(urlRanking, { method: "POST", body: JSON.stringify(envio) })
      .then(function (res) { return res.json(); })
      .then(function (r) {
        if (!r.ok) throw new Error(r.error || "error");
        porPublicar = null; $("[data-otro-nombre]").disabled = true;
        aviso.textContent = "¡Listo! Ya estás en el ranking.";
        contar("ranking-publicado"); rkCargado = 0; verRanking("semana");
      })
      .catch(function (err) {
        boton.disabled = err.message === "modo" || err.message === "rapido" || err.message === "duracion";
        aviso.textContent = ERRORES[err.message] || "No se pudo publicar. Intenta de nuevo en un rato.";
      });
  }

  function pintarRanking() {
    $$("[data-periodo]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-periodo") === periodo)); });
    var lista = $("[data-ranking-lista]"), aviso = $("[data-ranking-estado]");
    lista.textContent = "";
    if (!rkDatos) return;
    var filas = rkDatos[periodo] || [];
    aviso.textContent = filas.length ? "" : "Todavía nadie publica. ¡Sé la primera persona!";
    filas.forEach(function (f) {
      var li = document.createElement("li"), mio = f.nombre === miNombre;
      if (mio) li.className = "es-mio";
      var n = document.createElement("span"); n.textContent = f.nombre + (mio ? " (tú)" : "");
      var pts = document.createElement("b"); pts.textContent = f.puntos + " pts";
      li.appendChild(n); li.appendChild(pts); lista.appendChild(li);
    });
  }

  function verRanking(cual) {
    if (!urlRanking) return;
    if (cual) periodo = cual;
    var sec = $("[data-ranking]");
    sec.hidden = false;
    if (rkDatos && Date.now() - rkCargado < 60000) { pintarRanking(); sec.scrollIntoView({ block: "nearest" }); return; }
    pintarRanking();
    $("[data-ranking-estado]").textContent = "Cargando…";
    fetch(urlRanking + (urlRanking.indexOf("?") < 0 ? "?" : "&") + "modo=halley")
      .then(function (res) { return res.json(); })
      .then(function (d) { if (d.error) throw new Error(d.error); rkDatos = d; rkCargado = Date.now(); pintarRanking(); })
      .catch(function (err) { $("[data-ranking-estado]").textContent = err.message === "modo" ? ERRORES.modo : "No se pudo cargar el ranking. Intenta de nuevo en un rato."; });
    sec.scrollIntoView({ block: "nearest" });
  }

  // ---------- Compartir ----------
  function compartir() {
    var texto = H.textoCompartir({ puntos: e.puntos, notas: e.notasTomadas }), aviso = $("[data-aviso-compartir]");
    contar("compartir");
    if (navigator.share) { navigator.share({ text: texto }).catch(function () { /* cancelado */ }); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(function () { aviso.textContent = "¡Copiado! Pégalo en tus redes."; },
        function () { aviso.textContent = texto; });
    } else aviso.textContent = texto;
  }

  // ---------- Eventos ----------
  lienzo.addEventListener("pointerdown", function (ev) { ev.preventDefault(); tocar(); });
  raiz.addEventListener("click", function (ev) {
    var b = ev.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-jugar")) nueva();
    else if (b.hasAttribute("data-seguir")) seguir();
    else if (b.hasAttribute("data-pausa")) { if (modo === "pausa") seguir(); else pausar(); }
    else if (b.hasAttribute("data-compartir")) compartir();
    else if (b.hasAttribute("data-publicar-puntaje")) publicar();
    else if (b.hasAttribute("data-otro-nombre")) { miNombre = R.generarNombre(Math.random, miNombre); escribirTexto("cr-trivia-nombre", miNombre); $("[data-mi-nombre]").textContent = miNombre; }
    else if (b.hasAttribute("data-ver-ranking")) verRanking();
    else if (b.hasAttribute("data-periodo")) { periodo = b.getAttribute("data-periodo"); pintarRanking(); }
    else if (b.hasAttribute("data-sonido")) {
      sonidoOn = !sonidoOn;
      b.setAttribute("aria-pressed", String(sonidoOn));
      b.textContent = sonidoOn ? "♪ Sonido: sí" : "♪ Sonido: no";
      if (sonidoOn) SONIDOS.toque();
    }
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.target && /INPUT|TEXTAREA|SELECT/.test(ev.target.tagName)) return;
    var enJuego = modo === "listo" || modo === "jugando";
    if ((ev.key === " " || ev.key === "ArrowUp") && enJuego) { ev.preventDefault(); if (!ev.repeat) tocar(); }
    else if ((ev.key === "p" || ev.key === "P" || ev.key === "Escape") && (modo === "jugando" || modo === "pausa")) { ev.preventDefault(); if (modo === "pausa") seguir(); else pausar(); }
  });
  document.addEventListener("visibilitychange", function () { if (document.hidden) pausar(); });

  // Solo lectura, para las pruebas de punta a punta (no cambia la partida).
  raiz.halleyEstado = function () { return { y: e.y, vy: e.vy, puntos: e.puntos, torres: e.torres, modo: modo }; };
  $("[data-hud-record]").textContent = historial.record;
  mostrar("inicio");
  raiz.classList.add("esta-lista");
  window.requestAnimationFrame(function (t) { ultimo = t; bucle(t); });
})();
