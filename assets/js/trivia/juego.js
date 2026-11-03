/* Interfaz de la Trivia (F15/D21): conecta la lógica (CRtrivia) con las
   escenas (CRescenas) y el DOM de layouts/trivia/section.html. */
(function () {
  var T = window.CRtrivia, E = window.CRescenas, I = window.CRinsignias, R = window.CRranking, CC = window.CRcompartir;
  var raiz = document.querySelector("[data-trivia]");
  var crudo = document.getElementById("trivia-datos");
  if (!raiz || !T || !E || !I || !CC || !crudo) return;

  var datos = JSON.parse(crudo.textContent);
  var jugables = T.preguntasJugables(datos);
  var almacen = (function () { try { return window.localStorage; } catch (e) { return null; } })();
  var estado = T.cargarEstado(almacen);
  function leer(clave) { try { return almacen && almacen.getItem(clave); } catch (e) { return null; } }
  function escribir(clave, valor) { try { almacen && almacen.setItem(clave, valor); } catch (e) { /* sin almacenamiento */ } }
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
    partida = { preguntas: T.sortear(jugables), i: 0, respuestas: [], puntos: 0, inicio: Date.now(), fin: null, t0: 0 };
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
    partida.t0 = Date.now();
  }

  function responder(texto) {
    var q = partida.preguntas[partida.i];
    if (partida.respuestas.length > partida.i) return;
    var acierto = texto === q.correcta;
    partida.fin = Date.now();
    partida.respuestas.push({ id: q.id, etapa: q.etapa, dificultad: q.dificultad, acierto: acierto, ms: partida.fin - partida.t0 });
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
    var r = T.cerrarPartida(estado, partida.respuestas, new Date(), { duracionMs: partida.fin - partida.inicio });
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
    var pista = T.pistaSiguiente(r.categoria);
    $("[data-pista-siguiente]").textContent = pista;
    $("[data-pista-siguiente]").hidden = !pista;

    var lista = $("[data-nuevas]");
    lista.textContent = "";
    r.nuevas.forEach(function (id) { lista.appendChild(chapa(insignia(id), "nueva")); });
    r.portadasNuevas.forEach(function (e) {
      var li = crear("li", "trivia__insignia trivia__insignia--portada es-nueva");
      li.appendChild(crear("strong", "", "Portada desbloqueada"));
      li.appendChild(crear("span", "", E.ETAPAS_INFO[e].nombre));
      lista.appendChild(li);
    });
    $("[data-nuevas-titulo]").hidden = !lista.children.length;
    prepararPublicar(r.puntos, partida.fin - partida.inicio);
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

  // ---------- Compartir en Instagram (F19/D25) ----------
  var FUENTE_PIXEL = '"Press Start 2P", "Space Mono", monospace';

  function miArroba() { return CC.limpiarArroba(leer("cr-trivia-ig")); }

  // Lienzo base: fondo, franjas de la marca y título. En historia (9:16) el contenido baja 285 px
  // para quedar centrado y lejos de los controles de Instagram.
  function lienzoTarjeta(formato) {
    var f = CC.FORMATOS[formato], lienzo = document.createElement("canvas");
    lienzo.width = f.ancho; lienzo.height = f.alto;
    var c = lienzo.getContext("2d"), W = f.ancho, H = f.alto, y = formato === "historia" ? 285 : 0;
    c.imageSmoothingEnabled = false;
    c.fillStyle = "#141414"; c.fillRect(0, 0, W, H);
    ["#FF3E7F", "#2F5BFF", "#FFD23F", "#1FB57A", "#FF7A30"].forEach(function (col, k) {
      c.fillStyle = col; c.fillRect(k * (W / 5), 0, W / 5, 24); c.fillRect(k * (W / 5), H - 24, W / 5, 24);
    });
    c.textAlign = "center";
    c.fillStyle = "#FF7A30"; c.font = "34px " + FUENTE_PIXEL;
    c.fillText("LOVE OF LESBIAN", W / 2, y + 120);
    c.fillStyle = "#F4EFE6"; c.font = "26px " + FUENTE_PIXEL;
    c.fillText("· LA TRIVIA 8 BITS ·", W / 2, y + 170);
    return { lienzo: lienzo, c: c, W: W, y: y };
  }

  function pieTarjeta(t, pregunta) {
    var c = t.c, arroba = miArroba();
    c.fillStyle = "#FF3E7F"; c.font = "22px " + FUENTE_PIXEL;
    c.fillText(pregunta, t.W / 2, t.y + 1185);
    if (arroba) { c.fillStyle = "#FFD23F"; c.font = "26px " + FUENTE_PIXEL; c.fillText("@" + arroba, t.W / 2, t.y + 1240); }
    c.fillStyle = "#F4EFE6"; c.font = "20px " + FUENTE_PIXEL;
    c.fillText(CC.DIRECCION, t.W / 2, t.y + 1290);
  }

  function crearTarjeta(r, formato) {
    var t = lienzoTarjeta(formato), c = t.c, W = t.W, y = t.y;
    var av = document.createElement("canvas");
    av.width = 32; av.height = 32;
    E.dibujarAvatar(av.getContext("2d"), r.categoria.nivel);
    c.drawImage(av, (W - 448) / 2, y + 220, 448, 448);
    c.fillStyle = "#F4EFE6"; c.font = "30px " + FUENTE_PIXEL;
    c.fillText("Soy", W / 2, y + 740);
    c.fillStyle = "#FFD23F"; c.font = "52px " + FUENTE_PIXEL;
    partirTexto(c, r.categoria.nombre, W - 120).forEach(function (l, k) { c.fillText(l, W / 2, y + 820 + k * 72); });
    c.fillStyle = "#F4EFE6"; c.font = "36px " + FUENTE_PIXEL;
    c.fillText(r.puntos + "/30 PUNTOS", W / 2, y + 1040);
    var total = Object.keys(estado.insignias).length;
    c.font = "24px " + FUENTE_PIXEL; c.fillStyle = "#1FB57A";
    c.fillText(total + (total === 1 ? " INSIGNIA" : " INSIGNIAS") + " · " + estado.portadas.length + "/6 PORTADAS", W / 2, y + 1110);
    pieTarjeta(t, "¿Y tú qué tan lesbiano eres?");
    return t.lienzo;
  }

  function crearTarjetaChapa(ins, formato) {
    var t = lienzoTarjeta(formato), c = t.c, W = t.W, y = t.y;
    var ch = document.createElement("canvas");
    ch.width = 32; ch.height = 32;
    I.dibujarChapa(ch.getContext("2d"), ins, "ganada");
    c.drawImage(ch, (W - 512) / 2, y + 210, 512, 512);
    c.fillStyle = "#F4EFE6"; c.font = "30px " + FUENTE_PIXEL;
    c.fillText("Conseguí", W / 2, y + 800);
    c.fillStyle = "#FFD23F"; c.font = "46px " + FUENTE_PIXEL;
    var lineas = partirTexto(c, ins.nombre, W - 120);
    lineas.forEach(function (l, k) { c.fillText(l, W / 2, y + 875 + k * 64); });
    c.fillStyle = "#cfc7b6"; c.font = "30px " + '"Space Grotesk", sans-serif';
    partirTexto(c, ins.como, W - 200).forEach(function (l, k) { c.fillText(l, W / 2, y + 900 + lineas.length * 64 + k * 42); });
    pieTarjeta(t, "¿Te atreves?");
    return t.lienzo;
  }

  function copiarTexto(texto) {
    try { return navigator.clipboard.writeText(texto).then(function () { return true; }, function () { return false; }); }
    catch (e) { return Promise.resolve(false); }
  }

  // Copia el texto, y comparte la imagen (celular) o la descarga (computadora).
  function compartirImagen(hacerLienzo, archivoNombre, texto, aviso, alCompartir) {
    var fuentes = (document.fonts && document.fonts.load) ? document.fonts.load('20px "Press Start 2P"') : Promise.resolve();
    var copiado = copiarTexto(texto);
    fuentes.catch(function () {}).then(function () {
      hacerLienzo().toBlob(function (blob) {
        if (!blob) return;
        var archivo = new File([blob], archivoNombre, { type: "image/png" });
        var trasCopiar = function (ok) {
          return ok ? "El texto ya está copiado: pégalo en tu publicación." : "Copia este texto para tu publicación: " + texto;
        };
        if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
          navigator.share({ files: [archivo] })
            .then(function () { alCompartir(); return copiado; })
            .then(function (ok) { aviso.textContent = trasCopiar(ok); })
            .catch(function () { /* la persona canceló */ });
        } else {
          var a = crear("a");
          a.href = URL.createObjectURL(blob);
          a.download = archivo.name;
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
          alCompartir();
          copiado.then(function (ok) {
            aviso.textContent = "Imagen descargada. Pásala a tu celular y súbela a tus historias; etiquétanos " + CC.CUENTA + ". " + trasCopiar(ok);
          });
        }
      }, "image/png");
    });
  }

  function trasCompartir() {
    var r = T.registrarCompartir(estado, new Date());
    estado = r.estado;
    T.guardarEstado(almacen, estado);
    contar("compartida");
    anunciarInsignias(r.nuevas);
  }

  function compartir(formato) {
    if (!ultimoResultado) return;
    guardarArroba();
    var r = ultimoResultado;
    compartirImagen(function () { return crearTarjeta(r, formato); }, "mi-trivia-love-of-lesbian-" + formato + ".png",
      CC.textoResultado({ categoria: r.categoria.nombre, puntos: r.puntos }), $("[data-aviso-compartir]"), trasCompartir);
  }

  function compartirChapa(id) {
    var ins = insignia(id);
    if (!estado.insignias[id]) return;
    compartirImagen(function () { return crearTarjetaChapa(ins, "historia"); }, "insignia-" + id + ".png",
      CC.textoChapa(ins), $("[data-detalle-aviso]"), function () { contar("chapa-compartida"); trasCompartir(); });
  }

  function guardarArroba() {
    var campo = $("[data-arroba]");
    if (!campo) return;
    var limpio = CC.limpiarArroba(campo.value);
    var aviso = $("[data-arroba-aviso]");
    aviso.textContent = campo.value.trim() && !limpio ? "Ese @ no parece de Instagram; no lo pondremos en la imagen." : "";
    escribir("cr-trivia-ig", limpio);
  }

  // ---------- Chapas (F17) ----------
  var detalle = $("[data-detalle]");

  function estadoDe(ins) {
    if (estado.insignias[ins.id]) return "ganada";
    return ins.oculta ? "secreta" : "bloqueada";
  }

  function lienzoChapa(ins, est, clase) {
    var cv = crear("canvas", clase);
    cv.width = 32; cv.height = 32;
    I.dibujarChapa(cv.getContext("2d"), ins, est);
    cv.setAttribute("aria-hidden", "true");
    return cv;
  }

  // Una chapa de la lista: botón que abre la vista en grande.
  function chapa(ins, est) {
    est = est || estadoDe(ins);
    var oculta = est === "secreta";
    var li = crear("li", "trivia__chapa" + (est === "nueva" ? " es-nueva" : ""));
    var b = crear("button", "trivia__chapa-boton");
    b.type = "button";
    b.setAttribute("data-abrir-insignia", ins.id);
    b.appendChild(lienzoChapa(ins, est, "trivia__chapa-img"));
    b.appendChild(crear("strong", "", oculta ? "???" : ins.nombre));
    b.appendChild(crear("span", "", est === "nueva" ? "¡Nueva!" : oculta ? "Pista: " + ins.pista : ins.como));
    li.appendChild(b);
    return li;
  }

  function abrirDetalle(id) {
    var ins = insignia(id), est = estadoDe(ins);
    var cv = $("[data-detalle-img]", detalle);
    I.dibujarChapa(cv.getContext("2d"), ins, est);
    $("[data-detalle-nombre]", detalle).textContent = est === "secreta" ? "Insignia secreta" : ins.nombre;
    $("[data-detalle-como]", detalle).textContent = est === "secreta" ? "Pista: " + ins.pista : ins.como;
    var f = estado.insignias[id];
    var botonChapa = $("[data-compartir-chapa]", detalle);
    botonChapa.hidden = !f;
    botonChapa.setAttribute("data-compartir-chapa", id);
    $("[data-detalle-aviso]", detalle).textContent = "";
    $("[data-detalle-fecha]", detalle).textContent = f
      ? "La ganaste el " + new Date(f).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })
      : est === "secreta" ? "Todavía no la descubres." : "Todavía no la ganas.";
    if (detalle.showModal) detalle.showModal(); else detalle.setAttribute("open", "");
  }

  function cerrarDetalle() {
    if (detalle.close) detalle.close(); else detalle.removeAttribute("open");
  }

  var avisoInsignia = $("[data-aviso-insignia]"), avisoTimer = 0;
  function anunciarInsignias(ids) {
    if (!ids.length) return;
    tonos(SONIDOS.insignia);
    avisoInsignia.textContent = "¡Nueva insignia: " + ids.map(function (id) { return insignia(id).nombre; }).join(" + ") + "!";
    avisoInsignia.hidden = false;
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(function () { avisoInsignia.hidden = true; }, 4000);
  }

  function descubrir(id) {
    var r = T.registrarSecreto(estado, id, new Date());
    if (!r.nuevas.length) return;
    estado = r.estado;
    T.guardarEstado(almacen, estado);
    contar("secreto-" + id);
    anunciarInsignias(r.nuevas);
  }

  // ---------- Secretos de la pantalla de inicio ----------
  // Código Konami con teclado (↑↑↓↓←→←→BA) o deslizando sobre la pantallita (↑↑↓↓←→←→ y dos toques);
  // 7 toques seguidos a la pantallita en menos de 4 s dan "Wio, antenas y pijamas".
  var KONAMI_TECLADO = "uuddlrlrba", KONAMI_TACTIL = "uuddlrlrtt";
  var fichas = "", toques = [], inicioToque = null;
  var FLECHAS = { ArrowUp: "u", ArrowDown: "d", ArrowLeft: "l", ArrowRight: "r", b: "b", B: "b", a: "a", A: "a" };

  function ficha(f, objetivo) {
    fichas = (fichas + f).slice(-10);
    if (fichas === objetivo) { fichas = ""; descubrir("contraespionaje"); }
  }

  lienzo.addEventListener("pointerdown", function (ev) {
    if (raiz.getAttribute("data-en") !== "inicio") return;
    inicioToque = { x: ev.clientX, y: ev.clientY };
  });
  lienzo.addEventListener("pointerup", function (ev) {
    if (raiz.getAttribute("data-en") !== "inicio" || !inicioToque) return;
    var dx = ev.clientX - inicioToque.x, dy = ev.clientY - inicioToque.y;
    inicioToque = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 30) {
      toques = [];
      ficha(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "r" : "l") : (dy > 0 ? "d" : "u"), KONAMI_TACTIL);
      return;
    }
    ficha("t", KONAMI_TACTIL);
    var ahora = Date.now();
    toques = toques.filter(function (t) { return ahora - t < 4000; }).concat([ahora]);
    if (toques.length >= 7) { toques = []; descubrir("wio"); }
  });

  // ---------- Ranking (F18/D24) ----------
  var urlRanking = R ? raiz.getAttribute("data-ranking-url") : "";
  var miNombre = urlRanking ? leer("cr-trivia-nombre") : null;
  if (urlRanking && !R.nombreValido(miNombre)) { miNombre = R.generarNombre(); escribir("cr-trivia-nombre", miNombre); }
  var miDispositivo = urlRanking ? leer("cr-trivia-dispositivo") : null;
  if (urlRanking && !/^[a-z0-9]{16}$/.test(miDispositivo || "")) { miDispositivo = R.nuevoDispositivo(); escribir("cr-trivia-dispositivo", miDispositivo); }
  var porPublicar = null, rankingDatos = null, rankingCargado = 0, periodo = "semana";

  function prepararPublicar(puntos, duracionMs) {
    if (!urlRanking) return;
    porPublicar = { puntos: puntos, duracionMs: duracionMs };
    $("[data-mi-nombre]").textContent = miNombre;
    $("[data-publicar-estado]").textContent = "";
    $("[data-publicar-puntaje]").disabled = false;
    $("[data-otro-nombre]").disabled = false;
    $("[data-publicar]").hidden = false;
  }

  function otroNombre() {
    miNombre = R.generarNombre(Math.random, miNombre);
    escribir("cr-trivia-nombre", miNombre);
    $("[data-mi-nombre]").textContent = miNombre;
  }

  var ERRORES = {
    limite: "Ya publicaste muchas veces en esta hora. Intenta más tarde.",
    duracion: "Esa partida fue demasiado rápida para el ranking.",
  };

  function publicar() {
    if (!porPublicar) return;
    var boton = $("[data-publicar-puntaje]"), aviso = $("[data-publicar-estado]");
    boton.disabled = true;
    aviso.textContent = "Publicando…";
    var envio = R.armarEnvio("trivia", miNombre, porPublicar.puntos, porPublicar.duracionMs, miDispositivo);
    fetch(urlRanking, { method: "POST", body: JSON.stringify(envio) })
      .then(function (res) { return res.json(); })
      .then(function (r) {
        if (!r.ok) throw new Error(r.error || "error");
        porPublicar = null;
        $("[data-otro-nombre]").disabled = true;
        aviso.textContent = "¡Listo! Tu puntaje ya está en el ranking.";
        contar("ranking-publicado");
        rankingCargado = 0;
        verRanking("semana");
      })
      .catch(function (err) {
        boton.disabled = false;
        aviso.textContent = ERRORES[err.message] || "No se pudo publicar. Intenta de nuevo en un rato.";
      });
  }

  function pintarRanking() {
    $$("[data-periodo]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-periodo") === periodo)); });
    var lista = $("[data-ranking-lista]"), aviso = $("[data-ranking-estado]");
    lista.textContent = "";
    if (!rankingDatos) return;
    var filas = rankingDatos[periodo] || [];
    aviso.textContent = filas.length ? "" : (periodo === "semana" ? "Nadie ha publicado esta semana. ¡Sé la primera persona!" : "Todavía no hay puntajes.");
    filas.forEach(function (f) {
      var mio = f.nombre === miNombre;
      var li = crear("li", mio ? "es-mio" : "");
      li.appendChild(crear("span", "trivia__ranking-nombre", f.nombre + (mio ? " (tú)" : "")));
      var p = crear("span", "trivia__ranking-puntos", f.puntos + " pts");
      p.appendChild(crear("small", "", R.formatoTiempo(f.duracionMs)));
      li.appendChild(p);
      lista.appendChild(li);
    });
  }

  function verRanking(cual) {
    if (cual) periodo = cual;
    mostrar("ranking");
    if (rankingDatos && Date.now() - rankingCargado < 60000) { pintarRanking(); return; }
    $("[data-ranking-estado]").textContent = "Cargando…";
    $("[data-ranking-lista]").textContent = "";
    fetch(urlRanking + (urlRanking.indexOf("?") < 0 ? "?" : "&") + "modo=trivia")
      .then(function (res) { return res.json(); })
      .then(function (d) {
        if (d.error) throw new Error(d.error);
        rankingDatos = d; rankingCargado = Date.now();
        pintarRanking();
      })
      .catch(function () { $("[data-ranking-estado]").textContent = "No se pudo cargar el ranking. Intenta de nuevo en un rato."; });
  }

  if (urlRanking) $("[data-ver-ranking]").hidden = false;

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
    T.INSIGNIAS.forEach(function (i) { lista.appendChild(chapa(i)); });
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
    else if (b.hasAttribute("data-compartir")) compartir(b.getAttribute("data-compartir"));
    else if (b.hasAttribute("data-compartir-chapa")) compartirChapa(b.getAttribute("data-compartir-chapa"));
    else if (b.hasAttribute("data-ver-ranking")) verRanking();
    else if (b.hasAttribute("data-periodo")) { periodo = b.getAttribute("data-periodo"); pintarRanking(); }
    else if (b.hasAttribute("data-publicar-puntaje")) publicar();
    else if (b.hasAttribute("data-otro-nombre")) otroNombre();
    else if (b.hasAttribute("data-abrir-insignia")) abrirDetalle(b.getAttribute("data-abrir-insignia"));
    else if (b.hasAttribute("data-cerrar-detalle")) cerrarDetalle();
    else if (b.hasAttribute("data-sonido")) {
      sonidoOn = !sonidoOn;
      try { almacen && almacen.setItem(CLAVE_SONIDO, sonidoOn ? "1" : "0"); } catch (e) { /* sin almacenamiento */ }
      pintarBotonSonido();
      tonos(SONIDOS.acierto);
    }
  });

  detalle.addEventListener("click", function (ev) { if (ev.target === detalle) cerrarDetalle(); });

  document.addEventListener("keydown", function (ev) {
    if (raiz.getAttribute("data-en") === "inicio" && FLECHAS[ev.key] && !(detalle.open)) {
      if (ev.key.indexOf("Arrow") === 0 && document.activeElement === lienzo) ev.preventDefault();
      ficha(FLECHAS[ev.key], KONAMI_TECLADO);
    }
    if ($("[data-pantalla='juego']").hidden || ev.altKey || ev.ctrlKey || ev.metaKey) return;
    var n = parseInt(ev.key, 10);
    if (n >= 1 && n <= 4) {
      var b = $$("[data-opcion]")[n - 1];
      if (b && !b.disabled) { ev.preventDefault(); b.click(); }
    }
  });

  var campoArroba = $("[data-arroba]");
  campoArroba.value = miArroba() ? "@" + miArroba() : "";
  campoArroba.addEventListener("change", guardarArroba);

  pintarBotonSonido();
  pintarInicio();
  mostrar("inicio", true);
  raiz.classList.add("esta-lista");
})();
