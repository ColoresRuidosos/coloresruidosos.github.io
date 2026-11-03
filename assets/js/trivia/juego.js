/* Interfaz de la Trivia (F15/D21): conecta la lógica (CRtrivia) con las
   escenas (CRescenas) y el DOM de layouts/trivia/section.html. */
(function () {
  var T = window.CRtrivia, E = window.CRescenas, I = window.CRinsignias, R = window.CRranking, CC = window.CRcompartir,
    CR = window.CRcontrarreloj, D = window.CRdia;
  var raiz = document.querySelector("[data-trivia]");
  var crudo = document.getElementById("trivia-datos");
  if (!raiz || !T || !E || !I || !CC || !CR || !D || !crudo) return;

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
    prepararPublicar("trivia", r.puntos, partida.fin - partida.inicio);
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

  // ---------- Contrarreloj "¿De qué disco es?" (F16/D22) ----------
  var cancionesDatos = JSON.parse(document.getElementById("canciones-datos").textContent);
  var discos = cancionesDatos.discos || [];
  var discoPorId = {};
  discos.forEach(function (d) { discoPorId[d.id] = d; });
  var crJugables = CR.jugables(cancionesDatos);
  var cr = null, crReloj = 0, crBloqueado = false, crCuenta = 0, crResultado = null;

  function empezarContrarreloj() {
    clearInterval(crReloj); clearTimeout(crCuenta);
    cr = null; crBloqueado = true;
    contar("contrarreloj-iniciada");
    $("[data-cr-juego]").hidden = true;
    $("[data-cr-reloj]").textContent = "60";
    $("[data-cr-reloj]").classList.remove("es-poco");
    $("[data-cr-puntos]").textContent = "0 pts";
    $("[data-cr-racha]").textContent = "";
    mostrar("contrarreloj", true);
    var n = 3;
    (function paso() {
      if (n > 0) {
        $("[data-cr-cuenta]").textContent = String(n);
        tonos([[440, 0.08]]);
        n--;
        crCuenta = setTimeout(paso, 700);
        return;
      }
      $("[data-cr-cuenta]").textContent = "";
      tonos([[880, 0.15]]);
      cr = CR.nuevaPartida(crJugables, Math.random, Date.now());
      crBloqueado = false;
      $("[data-cr-juego]").hidden = false;
      pintarCancion();
      crReloj = setInterval(tictac, 100);
    })();
  }

  function tictac() {
    var ms = CR.restanteMs(cr, Date.now());
    var reloj = $("[data-cr-reloj]");
    reloj.textContent = String(Math.ceil(ms / 1000));
    reloj.classList.toggle("es-poco", ms <= 10000);
    if (!crBloqueado && CR.terminada(cr, Date.now())) terminarContrarreloj();
  }

  function pintarCancion() {
    var c = cr.orden[cr.i];
    $("[data-cr-cancion]").textContent = "«" + c.titulo + "»";
    $("[data-cr-cancion]").focus();
    $("[data-cr-feedback]").textContent = "";
    var lista = $("[data-cr-opciones]");
    lista.textContent = "";
    CR.opciones(c, discos, Math.random).forEach(function (id, k) {
      var d = discoPorId[id], li = crear("li"), b = crear("button", "trivia__opcion");
      b.type = "button";
      b.setAttribute("data-cr-opcion", id);
      b.appendChild(crear("span", "trivia__tecla", String(k + 1)));
      var t = crear("span", "", d.nombre);
      t.appendChild(crear("small", "", String(d.anio)));
      b.appendChild(t);
      li.appendChild(b);
      lista.appendChild(li);
    });
  }

  function responderContrarreloj(id) {
    if (crBloqueado || !cr) return;
    var r = CR.responder(cr, id, Date.now());
    if (!r.correcto) { terminarContrarreloj(); return; }
    cr = r.partida;
    crBloqueado = true;
    $$("[data-cr-opcion]").forEach(function (b) {
      b.disabled = true;
      var v = b.getAttribute("data-cr-opcion");
      if (v === r.correcto) b.classList.add("es-correcta");
      else if (v === id) b.classList.add("es-incorrecta");
    });
    var mult = CR.multiplicador(cr.racha);
    $("[data-cr-feedback]").textContent = r.acierto ? "+" + r.ganados + (mult > 1 ? " (×" + mult + ")" : "") : "−3 s · Era " + discoPorId[r.correcto].nombre;
    $("[data-cr-feedback]").setAttribute("data-acierto", String(r.acierto));
    $("[data-cr-puntos]").textContent = cr.puntos + " pts";
    $("[data-cr-racha]").textContent = cr.racha >= 2 ? "Racha " + cr.racha + (mult > 1 ? " · ×" + mult : "") : "";
    tonos(r.acierto ? SONIDOS.acierto : SONIDOS.error);
    tictac();
    setTimeout(function () {
      crBloqueado = false;
      if (CR.terminada(cr, Date.now())) terminarContrarreloj();
      else pintarCancion();
    }, r.acierto ? 250 : 700);
  }

  function terminarContrarreloj() {
    if (!cr) return;
    clearInterval(crReloj);
    var p = cr;
    cr = null; crBloqueado = true;
    var r = T.cerrarContrarreloj(estado, { aciertos: p.aciertos, mejorRacha: p.mejorRacha, puntos: p.puntos }, new Date());
    estado = r.estado;
    T.guardarEstado(almacen, estado);
    crResultado = { aciertos: p.aciertos, puntos: p.puntos, mejorRacha: p.mejorRacha };
    contar("contrarreloj-terminada");
    tonos(SONIDOS.final);
    $("[data-cr-titulo]").textContent = p.aciertos + (p.aciertos === 1 ? " canción" : " canciones");
    $("[data-cr-resumen]").textContent = p.puntos + " puntos · mejor racha " + p.mejorRacha + " · récord " + estado.crRecord;
    $("[data-cr-record]").hidden = !r.record || p.puntos === 0;
    var lista = $("[data-cr-nuevas]");
    lista.textContent = "";
    r.nuevas.forEach(function (id) { lista.appendChild(chapa(insignia(id), "nueva")); });
    $("[data-cr-nuevas-titulo]").hidden = !lista.children.length;
    $("[data-cr-aviso]").textContent = "";
    prepararPublicar("contrarreloj", p.puntos, Math.min(Date.now() - p.inicio, 90000));
    mostrar("cr-resultado");
  }

  function crearTarjetaContrarreloj(res, formato) {
    var t = lienzoTarjeta(formato), c = t.c, W = t.W, y = t.y;
    c.fillStyle = "#2F5BFF"; c.font = "30px " + FUENTE_PIXEL;
    c.fillText("CONTRARRELOJ", W / 2, y + 290);
    c.fillStyle = "#F4EFE6"; c.font = "26px " + FUENTE_PIXEL;
    c.fillText("¿De qué disco es?", W / 2, y + 345);
    c.fillStyle = "#FFD23F"; c.font = "200px " + FUENTE_PIXEL;
    c.fillText(String(res.aciertos), W / 2, y + 640);
    c.fillStyle = "#F4EFE6"; c.font = "34px " + FUENTE_PIXEL;
    c.fillText(res.aciertos === 1 ? "canción" : "canciones", W / 2, y + 740);
    c.fillText("en 60 segundos", W / 2, y + 800);
    c.fillStyle = "#1FB57A"; c.font = "28px " + FUENTE_PIXEL;
    c.fillText(res.puntos + " PUNTOS · RACHA " + res.mejorRacha, W / 2, y + 920);
    pieTarjeta(t, "¿Cuántas sacas tú?");
    return t.lienzo;
  }

  function compartirContrarreloj(formato) {
    if (!crResultado) return;
    var res = crResultado;
    compartirImagen(function () { return crearTarjetaContrarreloj(res, formato); }, "contrarreloj-love-of-lesbian-" + formato + ".png",
      CC.textoContrarreloj(res), $("[data-cr-aviso]"), function () { contar("contrarreloj-compartida"); trasCompartir(); });
  }

  // ---------- Adivina la canción: ronda del día y práctica (F20/D26/D27) ----------
  var audioDatos = JSON.parse(document.getElementById("audio-datos").textContent || "{}");
  var conAudio = crJugables.filter(function (c) { return audioDatos.canciones && audioDatos.canciones[c.id]; });
  var idsConAudio = conAudio.map(function (c) { return c.id; });
  var cancionPorId = {};
  (cancionesDatos.canciones || []).forEach(function (c) { cancionPorId[c.id] = c; });
  var CLAVE_DIA = "cr-trivia-dia-ronda";
  var dia = null, diaParar = 0, diaAnim = 0, diaArranque = null;
  var reproductor = $("[data-dia-audio]");

  function guardarRondaDia() {
    if (dia.tipo === "dia") escribir(CLAVE_DIA, JSON.stringify({ fecha: dia.fecha, ronda: dia.ronda }));
  }

  function rondaGuardada(fecha, ids) {
    try {
      var g = JSON.parse(leer(CLAVE_DIA) || "null");
      if (g && g.fecha === fecha && g.ronda && D.mismasCanciones(g.ronda.canciones, ids)) return g.ronda;
    } catch (e) { /* ronda guardada ilegible: se empieza de nuevo */ }
    return null;
  }

  function prepararPantallaDia() {
    var titulos = $("[data-dia-titulos]");
    if (!titulos.children.length) {
      (cancionesDatos.canciones || []).map(function (c) { return c.titulo; }).sort(function (a, b) { return a.localeCompare(b, "es"); })
        .forEach(function (t) { var o = crear("option"); o.value = t; titulos.appendChild(o); });
    }
    $("[data-dia-respuesta]").value = "";
    $("[data-dia-aviso]").textContent = "";
    $("[data-dia-aviso-compartir]").textContent = "";
    $("[data-dia-revelacion]").hidden = true;
  }

  function empezarDia() {
    var ahora = new Date(), fecha = D.fechaCDMX(ahora), ids = D.rondaDelDia(idsConAudio, ahora);
    // Mismas 10 canciones para todos, en un orden al azar por sesión (F24); al recargar se sigue con el orden guardado.
    dia = { tipo: "dia", fecha: fecha, numero: D.numeroDia(ahora), ronda: rondaGuardada(fecha, ids) || D.nuevaRonda(D.barajarRonda(ids, Math.random)), t0: 0 };
    $("[data-dia-titulo]").textContent = "Adivina la canción #" + dia.numero;
    prepararPantallaDia();
    if (dia.ronda.terminada) terminarRonda();
    contar("adivina-abierto");
    pintarDia();
    mostrar("dia");
  }

  function empezarPractica() {
    detenerAudio();
    dia = { tipo: "practica", ronda: D.nuevaRonda(D.rondaAlAzar(idsConAudio, Math.random)), t0: 0 };
    $("[data-dia-titulo]").textContent = "Ronda de práctica";
    prepararPantallaDia();
    contar("adivina-practica");
    pintarDia();
    mostrar("dia");
  }

  function pintarDia() {
    var r = dia.ronda, p = r.actual;
    var racha = (estado.dia && estado.dia.racha) || 0;
    $("[data-dia-racha]").textContent = dia.tipo === "dia" && racha ? "Racha " + racha + (racha === 1 ? " día" : " días") : "";
    $("[data-dia-progreso]").textContent = r.terminada ? "" : "Canción " + (r.i + 1) + "/" + r.canciones.length + " · " + D.puntajeRonda(r) + " pts";
    $("[data-dia-juego]").hidden = r.terminada || !$("[data-dia-revelacion]").hidden;
    $("[data-dia-final]").hidden = !r.terminada;
    $("[data-dia-practica]").hidden = dia.tipo === "dia" && !r.terminada;
    if (r.terminada) { pintarFinalDia(); return; }
    if (reproductor.getAttribute("data-id") !== p.correcta) {
      reproductor.src = audioDatos.canciones[p.correcta].preview;
      reproductor.setAttribute("data-id", p.correcta);
    }
    var seg = D.segundosActuales(p);
    $("[data-dia-permitido]").style.width = (seg / 16) * 100 + "%";
    $("[data-dia-escuchar]").textContent = "▶ Escuchar " + seg + " s";
    var lista = $("[data-dia-intentos]");
    lista.textContent = "";
    p.intentos.forEach(function (x, k) {
      var li = crear("li");
      li.setAttribute("data-tipo", x);
      li.textContent = (k + 1) + ". " + (x === "salto" ? "Saltado" : "✘ " + ((p.respuestas || [])[k] || "No era"));
      lista.appendChild(li);
    });
    var ultimo = p.intentos.length >= D.SEGUNDOS.length - 1;
    // Deja claro que da más fragmento de la misma canción, no otra canción (F22).
    $("[data-dia-saltar]").textContent = ultimo ? "Me rindo" : "No la sé · oír " + D.SEGUNDOS[p.intentos.length + 1] + " s";
  }

  function detenerAudio() {
    clearTimeout(diaParar); cancelAnimationFrame(diaAnim);
    if (diaArranque) { reproductor.removeEventListener("seeked", diaArranque); diaArranque = null; }
    reproductor.pause();
    reproductor.muted = false;
    $("[data-dia-sonando]").style.width = "0";
  }

  function escucharDia() {
    detenerAudio();
    var p = dia.ronda.actual;
    if (!p) return;
    if (!dia.t0) dia.t0 = Date.now();
    var seg = D.segundosActuales(p), barra = $("[data-dia-sonando]");
    // Cada avance empieza donde ya suena (F22/D28): se salta el silencio o el fade inicial.
    var desde = Number((audioDatos.canciones[p.correcta] || {}).inicio) || 0;
    var listo = reproductor.readyState >= 1;
    function arrancar() {
      reproductor.muted = false;
      var inicio = performance.now();
      (function avanzar() {
        var t = (performance.now() - inicio) / 1000;
        barra.style.width = Math.min(100, (t / 16) * 100) + "%";
        if (t < seg) diaAnim = requestAnimationFrame(avanzar);
      })();
      diaParar = setTimeout(detenerAudio, seg * 1000);
    }
    if (listo) { try { reproductor.currentTime = desde; } catch (e) { /* sin metadatos todavía */ } }
    else reproductor.muted = true; // primera vez: suena callado hasta llegar a `desde`
    // play() va dentro del toque (Safari en iPhone lo exige); el salto a `desde` puede venir después.
    reproductor.play().then(function () {
      if (listo || !desde) { if (!listo) reproductor.currentTime = 0; arrancar(); return; }
      diaArranque = function () { diaArranque = null; arrancar(); };
      reproductor.addEventListener("seeked", diaArranque, { once: true });
      reproductor.currentTime = desde;
    }).catch(function () {
      reproductor.muted = false;
      $("[data-dia-aviso]").textContent = "No se pudo reproducir el fragmento. Revisa tu conexión o el volumen e intenta de nuevo.";
    });
  }

  function intentarDia(respuestaTitulo) {
    var r = dia.ronda, p = r.actual;
    if (!p || p.terminada) return;
    var id = null;
    if (respuestaTitulo !== null) {
      var t = respuestaTitulo.trim().toLowerCase();
      var hallada = (cancionesDatos.canciones || []).filter(function (c) { return c.titulo.toLowerCase() === t; })[0];
      if (!hallada) { $("[data-dia-aviso]").textContent = "Elige un título de la lista."; return; }
      id = hallada.id;
    }
    var n = D.intentar(p, id);
    n.respuestas = (p.respuestas || []).concat([id ? cancionPorId[id].titulo : null]);
    $("[data-dia-respuesta]").value = "";
    $("[data-dia-aviso]").textContent = id && !n.acierto ? "No es esa." : "";
    if (!n.terminada) {
      r.actual = n;
      tonos(id ? SONIDOS.error : [[330, 0.06]]);
      guardarRondaDia();
      pintarDia();
      return;
    }
    detenerAudio();
    tonos(n.acierto ? SONIDOS.acierto : SONIDOS.error);
    dia.ronda = D.avanzarRonda(r, n, dia.t0 ? Date.now() - dia.t0 : 0);
    dia.t0 = 0;
    guardarRondaDia();
    revelar(n);
  }

  function revelar(p) {
    var c = cancionPorId[p.correcta], a = audioDatos.canciones[p.correcta], d = discoPorId[c.disco];
    var pts = D.puntosCancion(p);
    $("[data-dia-veredicto]").textContent = p.acierto ? "¡Sí! +" + pts + (pts === 1 ? " punto" : " puntos") : "No salió. Era:";
    $("[data-dia-cancion]").textContent = "«" + c.titulo + "»";
    $("[data-dia-disco]").textContent = d.nombre + " · " + d.anio;
    $("[data-dia-spotify]").hidden = !a.spotify;
    if (a.spotify) $("[data-dia-spotify]").href = a.spotify;
    $("[data-dia-apple]").href = a.apple;
    $("[data-dia-siguiente]").textContent = dia.ronda.terminada ? "Ver resultado ▶" : "Siguiente canción ▶";
    $("[data-dia-revelacion]").hidden = false;
    pintarDia();
    $("[data-dia-siguiente]").focus();
  }

  function siguienteCancion() {
    $("[data-dia-revelacion]").hidden = true;
    var r = dia.ronda;
    if (r.terminada) terminarRonda();
    pintarDia();
    if (!r.terminada) $("[data-dia-escuchar]").focus();
  }

  function terminarRonda() {
    var r = dia.ronda, practica = dia.tipo !== "dia";
    // La ronda del día se registra una sola vez (al recargar ya está); la práctica, cada vez que termina.
    if (dia.cerrada || (!practica && estado.dia && estado.dia.resultados && estado.dia.resultados[dia.fecha])) return;
    dia.cerrada = true;
    if (!practica) estado.dia = D.registrarDia(estado.dia, dia.fecha, { puntos: D.puntajeRonda(r), aciertos: D.aciertosRonda(r) });
    var res = T.cerrarAdivina(estado, { aciertos: D.aciertosRonda(r), puntos: D.puntajeRonda(r), primeros: D.primerosRonda(r),
      racha: (estado.dia && estado.dia.racha) || 0, practica: practica }, new Date());
    estado = res.estado;
    dia.nuevas = res.nuevas;
    T.guardarEstado(almacen, estado);
    contar(practica ? "adivina-practica-terminada" : "adivina-terminada");
    tonos(SONIDOS.final);
  }

  function pintarFinalDia() {
    var r = dia.ronda, total = r.resultados.length * 6;
    var practica = dia.tipo === "practica";
    $("[data-dia-final-titulo]").textContent = practica ? "Práctica terminada" : "Tu ronda de hoy";
    $("[data-dia-total]").textContent = D.puntajeRonda(r) + "/" + total + " · " + D.aciertosRonda(r) + " de " + r.resultados.length;
    $("[data-dia-cuadros]").textContent = r.resultados.map(D.cuadro).join("");
    var nuevas = $("[data-dia-nuevas]");
    nuevas.textContent = "";
    (dia.nuevas || []).forEach(function (id) { nuevas.appendChild(chapa(insignia(id), "nueva")); });
    $("[data-dia-nuevas-titulo]").hidden = !nuevas.children.length;
    var lista = $("[data-dia-resumen]");
    lista.textContent = "";
    r.resultados.forEach(function (x) {
      var c = cancionPorId[x.id], a = audioDatos.canciones[x.id], li = crear("li");
      li.appendChild(crear("span", "", D.cuadro(x)));
      var t = crear("span", "", c.titulo + " ");
      if (a && a.spotify) { var l = crear("a", "", "Spotify"); l.href = a.spotify; l.target = "_blank"; l.rel = "noopener"; t.appendChild(l); }
      li.appendChild(t);
      li.appendChild(crear("b", "", x.puntos + " pts"));
      lista.appendChild(li);
    });
    $("[data-dia-compartir-bloque]").hidden = practica;
    if (practica) { $("[data-publicar=adivina]").hidden = true; $("[data-dia-siguiente-ronda]").textContent = ""; return; }
    prepararPublicar("adivina", D.puntajeRonda(r), D.duracionRonda(r));
    var falta = 24 * 3600 * 1000 - ((Date.now() - 6 * 3600 * 1000) % (24 * 3600 * 1000));
    $("[data-dia-siguiente-ronda]").textContent = "La siguiente ronda sale en " + Math.floor(falta / 3600000) + " h " + Math.floor((falta % 3600000) / 60000) + " min.";
  }

  function crearTarjetaDia(formato) {
    var t = lienzoTarjeta(formato), c = t.c, W = t.W, y = t.y, r = dia.ronda;
    c.fillStyle = "#FFD23F"; c.font = "36px " + FUENTE_PIXEL;
    c.fillText("Adivina la canción #" + dia.numero, W / 2, y + 310);
    var colores = { "🟩": "#1FB57A", "🟨": "#FFD23F", "🟧": "#FF7A30", "🟥": "#FF3E7F" }, lado = 80, hueco = 14;
    var x0 = (W - (5 * lado + 4 * hueco)) / 2;
    r.resultados.forEach(function (x, k) {
      c.fillStyle = colores[D.cuadro(x)];
      c.fillRect(x0 + (k % 5) * (lado + hueco), y + 380 + Math.floor(k / 5) * (lado + hueco), lado, lado);
    });
    c.fillStyle = "#F4EFE6"; c.font = "60px " + FUENTE_PIXEL;
    c.fillText(D.puntajeRonda(r) + "/" + r.resultados.length * 6, W / 2, y + 700);
    var racha = (estado.dia && estado.dia.racha) || 0;
    if (racha) { c.font = "26px " + FUENTE_PIXEL; c.fillStyle = "#1FB57A"; c.fillText("RACHA " + racha, W / 2, y + 780); }
    pieTarjeta(t, "¿Cuántas reconoces tú?");
    return t.lienzo;
  }

  function compartirDia(formato) {
    compartirImagen(function () { return crearTarjetaDia(formato); }, "adivina-la-cancion-" + dia.numero + ".png",
      D.textoCompartir(dia.numero, dia.ronda), $("[data-dia-aviso-compartir]"), function () { contar("adivina-compartida"); trasCompartir(); });
  }

  function copiarDia() {
    var texto = D.textoCompartir(dia.numero, dia.ronda);
    copiarTexto(texto).then(function (ok) {
      $("[data-dia-aviso-compartir]").textContent = ok ? "Resultado copiado. Pégalo donde quieras." : texto;
    });
  }

  if (idsConAudio.length) $("[data-dia-modo]").hidden = false;
  $("[data-dia-form]").addEventListener("submit", function (ev) { ev.preventDefault(); intentarDia($("[data-dia-respuesta]").value); });

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

  // ---------- Insignia de concierto (F25/D31) ----------
  var concierto = raiz.getAttribute("data-concierto-huella") ? {
    huella: raiz.getAttribute("data-concierto-huella"),
    desde: raiz.getAttribute("data-concierto-desde"), hasta: raiz.getAttribute("data-concierto-hasta"),
  } : null;

  function diasConcierto() {
    var f = function (iso, opciones) { return new Date(iso).toLocaleDateString("es-MX", Object.assign({ timeZone: "America/Mexico_City" }, opciones)); };
    return "del " + f(concierto.desde, { day: "numeric" }) + " al " + f(concierto.hasta, { day: "numeric", month: "long" });
  }

  function huellaDe(codigo) {
    var datos = new TextEncoder().encode(T.normalizarCodigo(codigo));
    return crypto.subtle.digest("SHA-256", datos).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
    });
  }

  function canjear(codigo) {
    var aviso = $("[data-codigo-aviso]");
    pintarColeccion();
    if (!window.crypto || !crypto.subtle) { aviso.textContent = "Tu navegador no puede revisar el código. Prueba con otro."; return Promise.resolve(); }
    return huellaDe(codigo).then(function (h) {
      var r = T.canjearConcierto(estado, h, concierto, new Date());
      if (r.nuevas.length) { estado = r.estado; T.guardarEstado(almacen, estado); contar("concierto-canjeado"); pintarColeccion(); anunciarInsignias(r.nuevas); }
      else contar("concierto-" + r.error);
      $("[data-codigo-aviso]").textContent = {
        "": "¡Desbloqueaste Noches reversibles! Gracias por venir 🎟",
        codigo: "Ese código no existe. Revisa el que viene en el cartel.",
        fecha: "Este código solo funciona los días de concierto (" + diasConcierto() + ").",
        ya: "Ya tienes Noches reversibles. ¡Gracias por venir otra vez!",
      }[r.error];
    });
  }

  if (concierto) {
    $("[data-codigo-form]").hidden = false;
    $("[data-codigo-form]").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var campo = $("[data-codigo]");
      if (campo.value.trim()) canjear(campo.value).then(function () { campo.value = ""; });
    });
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
  var porPublicar = {}, rankingDatos = {}, rankingCargado = {}, rkModo = "trivia", periodo = "semana";
  var PERIODOS = {
    trivia: [["semana", "Esta semana"], ["historico", "Histórico"]],
    contrarreloj: [["semana", "Esta semana"], ["historico", "Histórico"]],
    adivina: [["hoy", "Hoy"], ["semana", "Semana"], ["racha", "Mejor racha"]],
  };

  function bloquePublicar(modo) { return $("[data-publicar='" + modo + "']"); }

  function prepararPublicar(modo, puntos, duracionMs) {
    var b = bloquePublicar(modo);
    if (!urlRanking || !b) return;
    porPublicar[modo] = { puntos: puntos, duracionMs: duracionMs };
    $$("[data-mi-nombre]").forEach(function (x) { x.textContent = miNombre; });
    $("[data-publicar-estado]", b).textContent = "";
    $("[data-publicar-puntaje]", b).disabled = false;
    $("[data-otro-nombre]", b).disabled = false;
    b.hidden = false;
  }

  function otroNombre() {
    miNombre = R.generarNombre(Math.random, miNombre);
    escribir("cr-trivia-nombre", miNombre);
    $$("[data-mi-nombre]").forEach(function (x) { x.textContent = miNombre; });
  }

  var ERRORES = {
    limite: "Ya publicaste muchas veces en esta hora. Intenta más tarde.",
    duracion: "Esa partida fue demasiado rápida para el ranking.",
    modo: "El ranking de este modo todavía no está activo: el equipo tiene que actualizar el script.",
  };

  function publicar(modo) {
    var datos = porPublicar[modo], b = bloquePublicar(modo);
    if (!datos || !b) return;
    var boton = $("[data-publicar-puntaje]", b), aviso = $("[data-publicar-estado]", b);
    boton.disabled = true;
    aviso.textContent = "Publicando…";
    var envio = R.armarEnvio(modo, miNombre, datos.puntos, datos.duracionMs, miDispositivo);
    fetch(urlRanking, { method: "POST", body: JSON.stringify(envio) })
      .then(function (res) { return res.json(); })
      .then(function (r) {
        if (!r.ok) throw new Error(r.error || "error");
        porPublicar[modo] = null;
        $("[data-otro-nombre]", b).disabled = true;
        aviso.textContent = "¡Listo! Tu puntaje ya está en el ranking.";
        contar("ranking-publicado-" + modo);
        rankingCargado[modo] = 0;
        verRanking(modo, modo === "adivina" ? "hoy" : "semana");
      })
      .catch(function (err) {
        boton.disabled = err.message === "modo";
        aviso.textContent = ERRORES[err.message] || "No se pudo publicar. Intenta de nuevo en un rato.";
      });
  }

  function pintarRanking() {
    $$("[data-rk-modo]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-rk-modo") === rkModo)); });
    var cont = $("[data-rk-periodos]");
    cont.textContent = "";
    PERIODOS[rkModo].forEach(function (pr) {
      var b = crear("button", "trivia__boton trivia__boton--chico", pr[1]);
      b.type = "button";
      b.setAttribute("data-periodo", pr[0]);
      b.setAttribute("aria-pressed", String(pr[0] === periodo));
      cont.appendChild(b);
    });
    var lista = $("[data-ranking-lista]"), aviso = $("[data-ranking-estado]");
    lista.textContent = "";
    var datos = rankingDatos[rkModo];
    if (!datos) return;
    var filas = datos[periodo] || [];
    aviso.textContent = filas.length ? "" : (periodo === "historico" || periodo === "racha" ? "Todavía no hay puntajes." : "Nadie ha publicado todavía. ¡Sé la primera persona!");
    filas.forEach(function (f) {
      var mio = f.nombre === miNombre;
      var li = crear("li", mio ? "es-mio" : "");
      li.appendChild(crear("span", "trivia__ranking-nombre", f.nombre + (mio ? " (tú)" : "")));
      var valor = periodo === "racha" ? f.racha + (f.racha === 1 ? " día" : " días") : f.puntos + " pts";
      var p = crear("span", "trivia__ranking-puntos", valor);
      if (periodo === "semana" && rkModo === "adivina") p.appendChild(crear("small", "", f.dias + (f.dias === 1 ? " ronda" : " rondas")));
      else if (typeof f.duracionMs === "number" && rkModo !== "contrarreloj") p.appendChild(crear("small", "", R.formatoTiempo(f.duracionMs)));
      li.appendChild(p);
      lista.appendChild(li);
    });
  }

  function verRanking(modo, cual) {
    if (modo) rkModo = modo;
    var validos = PERIODOS[rkModo].map(function (x) { return x[0]; });
    periodo = cual && validos.indexOf(cual) >= 0 ? cual : validos.indexOf(periodo) >= 0 ? periodo : validos[0];
    mostrar("ranking");
    if (rankingDatos[rkModo] && Date.now() - (rankingCargado[rkModo] || 0) < 60000) { pintarRanking(); return; }
    var pedido = rkModo;
    pintarRanking();
    $("[data-ranking-estado]").textContent = "Cargando…";
    fetch(urlRanking + (urlRanking.indexOf("?") < 0 ? "?" : "&") + "modo=" + pedido)
      .then(function (res) { return res.json(); })
      .then(function (d) {
        if (d.error) throw new Error(d.error);
        rankingDatos[pedido] = d; rankingCargado[pedido] = Date.now();
        if (pedido === rkModo) pintarRanking();
      })
      .catch(function (err) {
        if (pedido === rkModo) $("[data-ranking-estado]").textContent = err.message === "modo" ? ERRORES.modo : "No se pudo cargar el ranking. Intenta de nuevo en un rato.";
      });
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
    if (b.hasAttribute("data-iniciar")) { pintarInicio(); mostrar("modos"); contar("menu-modos"); }
    else if (b.hasAttribute("data-volver-inicio")) mostrar("inicio");
    else if (b.hasAttribute("data-jugar")) empezar();
    else if (b.hasAttribute("data-siguiente")) siguiente();
    else if (b.hasAttribute("data-ver-coleccion")) pintarColeccion();
    else if (b.hasAttribute("data-volver")) {
      clearInterval(crReloj); clearTimeout(crCuenta); cr = null;
      detenerAudio();
      pintarInicio(); mostrar("modos");
    }
    else if (b.hasAttribute("data-compartir")) compartir(b.getAttribute("data-compartir"));
    else if (b.hasAttribute("data-contrarreloj")) empezarContrarreloj();
    else if (b.hasAttribute("data-dia")) empezarDia();
    else if (b.hasAttribute("data-dia-escuchar")) escucharDia();
    else if (b.hasAttribute("data-dia-saltar")) intentarDia(null);
    else if (b.hasAttribute("data-dia-siguiente")) siguienteCancion();
    else if (b.hasAttribute("data-dia-practica")) empezarPractica();
    else if (b.hasAttribute("data-dia-compartir")) compartirDia(b.getAttribute("data-dia-compartir"));
    else if (b.hasAttribute("data-dia-copiar")) copiarDia();
    else if (b.hasAttribute("data-cr-opcion")) responderContrarreloj(b.getAttribute("data-cr-opcion"));
    else if (b.hasAttribute("data-compartir-cr")) compartirContrarreloj(b.getAttribute("data-compartir-cr"));
    else if (b.hasAttribute("data-compartir-chapa")) compartirChapa(b.getAttribute("data-compartir-chapa"));
    else if (b.hasAttribute("data-ver-ranking")) verRanking();
    else if (b.hasAttribute("data-rk-modo")) verRanking(b.getAttribute("data-rk-modo"));
    else if (b.hasAttribute("data-periodo")) { periodo = b.getAttribute("data-periodo"); pintarRanking(); }
    else if (b.hasAttribute("data-publicar-puntaje")) publicar(b.closest("[data-publicar]").getAttribute("data-publicar"));
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
    if (raiz.getAttribute("data-en") === "contrarreloj" && !ev.altKey && !ev.ctrlKey && !ev.metaKey) {
      var m = parseInt(ev.key, 10), op = $$("[data-cr-opcion]")[m - 1];
      if (m >= 1 && m <= 4 && op && !op.disabled) { ev.preventDefault(); op.click(); }
      return;
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
  // El QR del cartel abre /trivia/?codigo=…: se canjea solo y se quita el código de la URL.
  var codigoUrl = new URLSearchParams(location.search).get("codigo");
  if (codigoUrl && concierto) {
    try { history.replaceState(null, "", location.pathname + location.hash); } catch (e) { /* sin historial */ }
    canjear(codigoUrl);
  }
  raiz.classList.add("esta-lista");
})();
