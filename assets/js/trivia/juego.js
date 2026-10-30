/* Interfaz de la Trivia (F15/D21): conecta la lógica (CRtrivia) con las
   escenas (CRescenas) y el DOM de layouts/trivia/section.html. */
(function () {
  var T = window.CRtrivia, E = window.CRescenas;
  var raiz = document.querySelector("[data-trivia]");
  var crudo = document.getElementById("trivia-datos");
  if (!raiz || !T || !E || !crudo) return;

  var datos = JSON.parse(crudo.textContent);
  var jugables = T.preguntasJugables(datos);
  var almacen = (function () { try { return window.localStorage; } catch (e) { return null; } })();
  var estado = T.cargarEstado(almacen);
  var sinMovimiento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NOMBRE_DIF = { facil: "Fácil", dificil: "Difícil", muy_dificil: "Muy difícil" };

  function $(sel, base) { return (base || raiz).querySelector(sel); }
  function $$(sel, base) { return Array.prototype.slice.call((base || raiz).querySelectorAll(sel)); }
  function crear(tag, clase, texto) {
    var el = document.createElement(tag);
    if (clase) el.className = clase;
    if (texto != null) el.textContent = texto;
    return el;
  }
  function insignia(id) { return T.INSIGNIAS.filter(function (i) { return i.id === id; })[0]; }

  function contar(evento) {
    try {
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: "trivia-" + evento, title: "Trivia: " + evento, event: true });
      }
    } catch (e) { /* la analítica nunca rompe el juego */ }
  }

  // ---------- Sonido 8 bits (apagado por defecto) ----------
  var CLAVE_SONIDO = "cr-trivia-sonido";
  var sonidoOn = (function () { try { return almacen && almacen.getItem(CLAVE_SONIDO) === "1"; } catch (e) { return false; } })();
  var audio = null;
  function tonos(notas) {
    if (!sonidoOn) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      var t = audio.currentTime;
      notas.forEach(function (n) {
        var osc = audio.createOscillator(), vol = audio.createGain();
        osc.type = "square";
        osc.frequency.value = n[0];
        vol.gain.setValueAtTime(0.06, t);
        vol.gain.exponentialRampToValueAtTime(0.001, t + n[1]);
        osc.connect(vol); vol.connect(audio.destination);
        osc.start(t); osc.stop(t + n[1]);
        t += n[1];
      });
    } catch (e) { /* sin Web Audio, sin sonido */ }
  }
  var SONIDOS = {
    acierto: [[660, 0.08], [880, 0.12]],
    error: [[220, 0.12], [165, 0.2]],
    final: [[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.25]],
    insignia: [[988, 0.07], [1319, 0.15]],
  };
  function pintarBotonSonido() {
    var b = $("[data-sonido]");
    b.setAttribute("aria-pressed", String(sonidoOn));
    b.textContent = sonidoOn ? "♪ Sonido: sí" : "♪ Sonido: no";
  }

  // ---------- Pantallas ----------
  function mostrar(nombre, sinFoco) {
    raiz.setAttribute("data-en", nombre);
    $$("[data-pantalla]").forEach(function (p) { p.hidden = p.getAttribute("data-pantalla") !== nombre; });
    if (sinFoco) return;
    var foco = $("[data-pantalla='" + nombre + "'] [data-foco]");
    if (foco) foco.focus();
  }

  // ---------- Escena animada ----------
  var lienzo = $("[data-escena]");
  var ctx = lienzo.getContext("2d");
  var etapaActual = "E1", cuadro = 0, ultimo = 0;
  function animar(ms) {
    if (ms - ultimo > 110) { ultimo = ms; cuadro++; E.dibujarEscena(ctx, etapaActual, cuadro); }
    window.requestAnimationFrame(animar);
  }
  function ponerEscena(etapa) {
    etapaActual = etapa;
    E.dibujarEscena(ctx, etapa, sinMovimiento ? 0 : cuadro);
  }
  if (!sinMovimiento) window.requestAnimationFrame(animar);

  // ---------- Inicio ----------
  function pintarInicio() {
    var r = $("[data-record]");
    r.textContent = estado.partidas
      ? "Tu récord: " + estado.mejorPuntaje + " de 30 · " + estado.partidas + (estado.partidas === 1 ? " partida" : " partidas")
      : "";
    ponerEscena("E1");
    lienzo.setAttribute("aria-label", "Escena pixel art: cielo azul con el nombre de la banda en neón");
  }

  // ---------- Partida ----------
  var partida = null;

  function empezar() {
    partida = { preguntas: T.sortear(jugables), i: 0, respuestas: [], puntos: 0 };
    contar("iniciada");
    mostrar("juego");
    pintarPregunta();
  }

  function pintarPregunta() {
    var q = partida.preguntas[partida.i];
    var n = T.ETAPAS.indexOf(q.etapa) + 1;
    ponerEscena(q.etapa);
    lienzo.setAttribute("aria-label", q.escena_alt
      ? "Escena pixel art: " + q.escena_alt
      : "Escena pixel art de la etapa " + n);
    $("[data-hud-etapa]").textContent = "Etapa " + n + "/6 · " + E.ETAPAS_INFO[q.etapa].anios;
    $("[data-hud-num]").textContent = "Pregunta " + (partida.i + 1) + "/" + partida.preguntas.length;
    $("[data-hud-puntos]").textContent = partida.puntos + " pts";
    var dif = $("[data-dificultad]");
    dif.textContent = NOMBRE_DIF[q.dificultad] + " · " + T.PUNTOS[q.dificultad] + (T.PUNTOS[q.dificultad] === 1 ? " pt" : " pts");
    dif.setAttribute("data-nivel", q.dificultad);
    $("[data-pregunta]").textContent = q.pregunta;

    var lista = $("[data-opciones]");
    lista.textContent = "";
    T.opciones(q).forEach(function (texto, k) {
      var li = crear("li");
      var b = crear("button", "trivia__opcion");
      b.type = "button";
      b.setAttribute("data-opcion", texto);
      b.appendChild(crear("span", "trivia__tecla", String(k + 1)));
      b.appendChild(document.createTextNode(texto));
      b.addEventListener("click", function () { responder(texto); });
      li.appendChild(b);
      lista.appendChild(li);
    });
    $("[data-feedback]").textContent = "";
    $("[data-fuentes]").textContent = "";
    $("[data-siguiente]").hidden = true;
    $("[data-pregunta]").focus();
  }

  function responder(texto) {
    var q = partida.preguntas[partida.i];
    if (partida.respuestas.length > partida.i) return;
    var acierto = texto === q.correcta;
    partida.respuestas.push({ id: q.id, etapa: q.etapa, dificultad: q.dificultad, acierto: acierto });
    if (acierto) partida.puntos += T.PUNTOS[q.dificultad];
    $$("[data-opcion]").forEach(function (b) {
      b.disabled = true;
      var v = b.getAttribute("data-opcion");
      if (v === q.correcta) b.classList.add("es-correcta");
      else if (v === texto) b.classList.add("es-incorrecta");
    });
    $("[data-feedback]").textContent = acierto
      ? "¡Correcto! +" + T.PUNTOS[q.dificultad]
      : "No. La respuesta era: " + q.correcta;
    $("[data-feedback]").setAttribute("data-acierto", String(acierto));
    var f = $("[data-fuentes]");
    f.appendChild(document.createTextNode("Fuente: "));
    q.fuentes.forEach(function (url, k) {
      if (k) f.appendChild(document.createTextNode(" · "));
      var a = crear("a", "", new URL(url).hostname.replace(/^www\./, ""));
      a.href = url; a.target = "_blank"; a.rel = "noopener";
      f.appendChild(a);
    });
    $("[data-hud-puntos]").textContent = partida.puntos + " pts";
    tonos(acierto ? SONIDOS.acierto : SONIDOS.error);
    var sig = $("[data-siguiente]");
    sig.textContent = partida.i + 1 < partida.preguntas.length ? "Siguiente ▶" : "Ver resultado ▶";
    sig.hidden = false;
    sig.focus();
  }

  function siguiente() {
    partida.i++;
    if (partida.i < partida.preguntas.length) pintarPregunta();
    else terminar();
  }

  // ---------- Resultado ----------
  var ultimoResultado = null;

  function terminar() {
    var r = T.cerrarPartida(estado, partida.respuestas, new Date());
    estado = r.estado;
    T.guardarEstado(almacen, estado);
    ultimoResultado = r;
    contar("terminada-" + r.categoria.id);
    tonos(SONIDOS.final);

    E.dibujarAvatar($("[data-avatar]").getContext("2d"), r.categoria.nivel);
    $("[data-avatar]").setAttribute("aria-label", "Avatar: máscara de " + r.categoria.nombre);
    $("[data-categoria]").textContent = r.categoria.nombre;
    var aciertos = partida.respuestas.filter(function (x) { return x.acierto; }).length;
    $("[data-puntaje]").textContent = r.puntos + " de 30 puntos · " + aciertos + " de 15 aciertos";

    var lista = $("[data-nuevas]");
    lista.textContent = "";
    r.nuevas.forEach(function (id) {
      var i = insignia(id);
      var li = crear("li", "trivia__insignia es-nueva");
      li.appendChild(crear("strong", "", i.nombre));
      li.appendChild(crear("span", "", i.oculta ? "¡Insignia secreta!" : i.como));
      lista.appendChild(li);
    });
    r.portadasNuevas.forEach(function (e) {
      var li = crear("li", "trivia__insignia es-nueva");
      li.appendChild(crear("strong", "", "Portada desbloqueada"));
      li.appendChild(crear("span", "", E.ETAPAS_INFO[e].nombre));
      lista.appendChild(li);
    });
    $("[data-nuevas-titulo]").hidden = !lista.children.length;
    mostrar("resultado");
  }

  // ---------- Tarjeta para compartir ----------
  function partirTexto(c, texto, ancho) {
    var lineas = [], actual = "";
    texto.split(" ").forEach(function (w) {
      var prueba = actual ? actual + " " + w : w;
      if (c.measureText(prueba).width > ancho && actual) { lineas.push(actual); actual = w; }
      else actual = prueba;
    });
    lineas.push(actual);
    return lineas;
  }

  function crearTarjeta(r) {
    var W = 1080, H = 1350, lienzo = document.createElement("canvas");
    lienzo.width = W; lienzo.height = H;
    var c = lienzo.getContext("2d");
    c.imageSmoothingEnabled = false;
    c.fillStyle = "#141414"; c.fillRect(0, 0, W, H);
    ["#FF3E7F", "#2F5BFF", "#FFD23F", "#1FB57A", "#FF7A30"].forEach(function (col, k) {
      c.fillStyle = col; c.fillRect(k * (W / 5), 0, W / 5, 24); c.fillRect(k * (W / 5), H - 24, W / 5, 24);
    });
    var fuente = '"Press Start 2P", "Space Mono", monospace';
    c.textAlign = "center";
    c.fillStyle = "#FF7A30"; c.font = "34px " + fuente;
    c.fillText("LOVE OF LESBIAN", W / 2, 120);
    c.fillStyle = "#F4EFE6"; c.font = "26px " + fuente;
    c.fillText("· LA TRIVIA 8 BITS ·", W / 2, 170);

    var av = document.createElement("canvas");
    av.width = 32; av.height = 32;
    E.dibujarAvatar(av.getContext("2d"), r.categoria.nivel);
    c.drawImage(av, (W - 448) / 2, 220, 448, 448);

    c.fillStyle = "#F4EFE6"; c.font = "30px " + fuente;
    c.fillText("Soy", W / 2, 740);
    c.fillStyle = "#FFD23F"; c.font = "52px " + fuente;
    partirTexto(c, r.categoria.nombre, W - 120).forEach(function (l, k) { c.fillText(l, W / 2, 820 + k * 72); });
    c.fillStyle = "#F4EFE6"; c.font = "36px " + fuente;
    c.fillText(r.puntos + "/30 PUNTOS", W / 2, 1040);
    var total = Object.keys(estado.insignias).length;
    c.font = "24px " + fuente; c.fillStyle = "#1FB57A";
    c.fillText(total + (total === 1 ? " INSIGNIA" : " INSIGNIAS") + " · " + estado.portadas.length + "/6 PORTADAS", W / 2, 1110);
    c.fillStyle = "#FF3E7F"; c.font = "22px " + fuente;
    c.fillText("¿Y tú qué tan lesbiano eres?", W / 2, 1210);
    c.fillStyle = "#F4EFE6"; c.font = "20px " + fuente;
    c.fillText("coloresruidosos.github.io/trivia", W / 2, 1270);
    return lienzo;
  }

  function anunciar(texto) {
    var a = $("[data-aviso-compartir]");
    a.textContent = texto;
  }

  function trasCompartir() {
    var r = T.registrarCompartir(estado, new Date());
    estado = r.estado;
    T.guardarEstado(almacen, estado);
    contar("compartida");
    if (r.nuevas.length) {
      tonos(SONIDOS.insignia);
      anunciar("¡Nueva insignia: " + insignia(r.nuevas[0]).nombre + "!");
    }
  }

  function compartir() {
    if (!ultimoResultado) return;
    var listo = (document.fonts && document.fonts.load) ? document.fonts.load('20px "Press Start 2P"') : Promise.resolve();
    listo.catch(function () {}).then(function () {
      crearTarjeta(ultimoResultado).toBlob(function (blob) {
        if (!blob) return;
        var archivo = new File([blob], "mi-trivia-love-of-lesbian.png", { type: "image/png" });
        var texto = "Soy " + ultimoResultado.categoria.nombre + " en la trivia de Love of Lesbian de Colores Ruidosos";
        if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
          navigator.share({ files: [archivo], text: texto, url: location.href })
            .then(trasCompartir)
            .catch(function () { /* el usuario canceló */ });
        } else {
          var a = crear("a");
          a.href = URL.createObjectURL(blob);
          a.download = archivo.name;
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
          anunciar("Tarjeta descargada. Súbela a tus historias.");
          trasCompartir();
        }
      }, "image/png");
    });
  }

  // ---------- Colección ----------
  function pintarColeccion() {
    var portadas = $("[data-portadas]");
    portadas.textContent = "";
    T.ETAPAS.forEach(function (e, k) {
      var li = crear("li", "trivia__portada");
      var cv = crear("canvas", "trivia__mini");
      cv.width = E.ANCHO; cv.height = E.ALTO;
      var tiene = estado.portadas.indexOf(e) >= 0;
      if (tiene) E.dibujarEscena(cv.getContext("2d"), e, 0); else E.dibujarBloqueada(cv.getContext("2d"));
      cv.setAttribute("role", "img");
      cv.setAttribute("aria-label", tiene ? "Portada desbloqueada: " + E.ETAPAS_INFO[e].nombre : "Portada bloqueada");
      li.appendChild(cv);
      li.appendChild(crear("strong", "", tiene ? E.ETAPAS_INFO[e].nombre : "Etapa " + (k + 1) + " · ???"));
      var info = E.ETAPAS_INFO[e];
      if (!tiene) li.appendChild(crear("span", "", "Acierta toda esta etapa en una partida"));
      else if (info.discos !== info.nombre) li.appendChild(crear("span", "", info.discos));
      portadas.appendChild(li);
    });
    var lista = $("[data-insignias]");
    lista.textContent = "";
    T.INSIGNIAS.forEach(function (i) {
      var tiene = !!estado.insignias[i.id];
      var li = crear("li", "trivia__insignia" + (tiene ? " es-ganada" : ""));
      li.appendChild(crear("strong", "", tiene || !i.oculta ? i.nombre : "???"));
      li.appendChild(crear("span", "", tiene ? (i.oculta ? "Secreta" : i.como) : i.como));
      lista.appendChild(li);
    });
    $("[data-conteo]").textContent = Object.keys(estado.insignias).length + " de " + T.INSIGNIAS.length + " insignias · " +
      estado.portadas.length + " de 6 portadas";
    mostrar("coleccion");
  }

  // ---------- Eventos ----------
  raiz.addEventListener("click", function (ev) {
    var b = ev.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-jugar")) empezar();
    else if (b.hasAttribute("data-siguiente")) siguiente();
    else if (b.hasAttribute("data-ver-coleccion")) pintarColeccion();
    else if (b.hasAttribute("data-volver")) { pintarInicio(); mostrar("inicio"); }
    else if (b.hasAttribute("data-compartir")) compartir();
    else if (b.hasAttribute("data-sonido")) {
      sonidoOn = !sonidoOn;
      try { almacen && almacen.setItem(CLAVE_SONIDO, sonidoOn ? "1" : "0"); } catch (e) { /* sin almacenamiento */ }
      pintarBotonSonido();
      tonos(SONIDOS.acierto);
    }
  });

  document.addEventListener("keydown", function (ev) {
    if ($("[data-pantalla='juego']").hidden || ev.altKey || ev.ctrlKey || ev.metaKey) return;
    var n = parseInt(ev.key, 10);
    if (n >= 1 && n <= 4) {
      var b = $$("[data-opcion]")[n - 1];
      if (b && !b.disabled) { ev.preventDefault(); b.click(); }
    }
  });

  if (datos.borrador) $("[data-borrador]").hidden = false;
  pintarBotonSonido();
  pintarInicio();
  mostrar("inicio", true);
  raiz.classList.add("esta-lista");
})();
