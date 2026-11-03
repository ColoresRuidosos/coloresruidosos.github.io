/* Lógica pura de la Trivia Love of Lesbian (F15/D21): sorteo, puntaje,
   categorías, insignias, portadas y estado guardado. No toca el DOM, así se
   prueba con node --test (tests-js/trivia.test.js). */
(function (raiz) {
  var ETAPAS = ["E1", "E2", "E3", "E4", "E5", "E6"];
  var DIFICULTADES = ["facil", "dificil", "muy_dificil"];
  var PUNTOS = { facil: 1, dificil: 2, muy_dificil: 3 };
  var POR_DIFICULTAD = 5;
  var CLAVE = "cr-trivia-v1";
  var FUENTE_OFICIAL = /^https:\/\/(www\.)?loveoflesbianband\.com\//;
  // 28 de noviembre de 2026, 23:59:59 en CDMX (UTC-6): Tecate Comuna en Puebla, su última fecha anunciada en México.
  var FIN_ULTIMO_BAILE = Date.UTC(2026, 10, 29, 5, 59, 59, 999);

  var CATEGORIAS = [
    { id: "pequeno", nombre: "Pequeño lesbiano", nivel: 1, desde: 0 },
    { id: "lesbianito", nombre: "Lesbianito", nivel: 2, desde: 13 },
    { id: "viejo", nombre: "Viejo lesbiano", nivel: 3, desde: 23 },
    { id: "john_boy", nombre: "Club de fans de John Boy", nivel: 4, desde: 30 },
  ];

  var INSIGNIAS = [
    { id: "maniobras", nombre: "Maniobras de escapismo", como: "Terminar tu primera partida", familia: "trivia", icono: "equilibrista" },
    { id: "universos", nombre: "Universos infinitos", como: "Jugar 5 partidas", familia: "constancia", icono: "espiral" },
    { id: "incendios", nombre: "Incendios de nieve", como: "5 aciertos seguidos", familia: "habilidad", icono: "copo" },
    { id: "volcan", nombre: "Bajo el volcán", como: "Acertar las 5 muy difíciles de una partida", familia: "habilidad", icono: "volcan" },
    { id: "ungravity", nombre: "Ungravity", como: "Acertar toda la etapa en inglés", familia: "habilidad", icono: "nube" },
    { id: "segundo_asalto", nombre: "Segundo asalto", como: "Superar tu mejor categoría", familia: "habilidad", icono: "guante" },
    { id: "noche_eterna", nombre: "La noche eterna", como: "Jugar entre las 00:00 y las 04:59", familia: "secreta", icono: "luna", oculta: true, pista: "Juega cuando la noche no se acaba" },
    { id: "viaje", nombre: "Viaje épico hacia la nada", como: "Terminar con 0 puntos", familia: "trivia", icono: "trampolin" },
    { id: "me_amo", nombre: "Me amo", como: "Llegar a Viejo lesbiano", familia: "trivia", icono: "corazon" },
    { id: "john_boy", nombre: "Club de fans de John Boy", como: "30 de 30", familia: "secreta", icono: "corona", oculta: true, pista: "Solo para quien no falla ni una" },
    { id: "1999", nombre: "1999", como: "Acumular 99 aciertos", familia: "constancia", icono: "lupa" },
    { id: "alli_donde", nombre: "Allí donde solíamos gritar", como: "Compartir tu resultado", familia: "trivia", icono: "megafono" },
    { id: "ejercito", nombre: "Ejército de salvación", como: "Desbloquear las 6 portadas", familia: "trivia", icono: "bandera" },
    { id: "ultimo_baile", nombre: "El último baile", como: "Jugar antes del 28 de noviembre de 2026", familia: "trivia", icono: "disco" },
    // Insignias "imposibles" (F17/D23): todas secretas, con su pista.
    { id: "contradiccion", nombre: "Contradicción", como: "Fallar las 5 fáciles y acertar las 5 muy difíciles", familia: "habilidad", icono: "flechas", oculta: true, pista: "Lo fácil se te da fatal" },
    { id: "tercero_segunda", nombre: "Tercero segunda", como: "Quedarte a 1 punto de subir de categoría", familia: "habilidad", icono: "puerta", oculta: true, pista: "Tan cerca que duele" },
    { id: "yin_yen", nombre: "El yin y el yen", como: "Sacar exactamente 15 de 30", familia: "habilidad", icono: "yinyang", oculta: true, pista: "Justo a la mitad" },
    { id: "planeador", nombre: "Planeador", como: "Terminar en menos de 90 s con 20 puntos o más", familia: "habilidad", icono: "avion", oculta: true, pista: "Hay quien vuela sobre las preguntas" },
    { id: "cuando_diga_ya", nombre: "Cuando diga ya", como: "3 aciertos seguidos en menos de 2 s cada uno", familia: "habilidad", icono: "crono", oculta: true, pista: "Antes de que termines de leer" },
    { id: "oceanos", nombre: "Océanos de sed", como: "Jugar 10 partidas en un mismo día", familia: "constancia", icono: "vaso", oculta: true, pista: "Tienes sed de más" },
    { id: "hermandad", nombre: "La hermandad", como: "Jugar en 5 días distintos", familia: "constancia", icono: "hermanos", oculta: true, pista: "Vuelve cinco veces con tu gente" },
    { id: "dias_no_vividos", nombre: "Los días no vividos", como: "Volver después de 7 días sin jugar", familia: "constancia", icono: "calendario", oculta: true, pista: "Regresa cuando creas que ya lo olvidaste" },
    { id: "contraespionaje", nombre: "Contraespionaje", como: "El código Konami en el inicio", familia: "secreta", icono: "control", oculta: true, pista: "Los viejos jugadores conocen el código" },
    { id: "wio", nombre: "Wio, antenas y pijamas", como: "Tocar 7 veces la pantallita del inicio", familia: "secreta", icono: "tele", oculta: true, pista: "Hay algo escondido en la tele" },
    // Contrarreloj "¿De qué disco es?" (F16/D22).
    { id: "psiconautas", nombre: "Psiconautas", como: "Jugar tu primer contrarreloj", familia: "contrarreloj", icono: "ojo" },
    { id: "seres_unicos", nombre: "Los seres únicos", como: "10 aciertos seguidos en el contrarreloj", familia: "contrarreloj", icono: "huella" },
    { id: "radio_himalaya", nombre: "Radio Himalaya", como: "20 aciertos en un contrarreloj", familia: "contrarreloj", icono: "radio" },
    { id: "cosmos", nombre: "Cosmos (Antisistema Solar)", como: "Acertar 100 canciones en total en el contrarreloj", familia: "contrarreloj", icono: "planeta" },
    // Adivina la canción (F22/D28).
    { id: "musica_ascensores", nombre: "Música de ascensores", como: "Terminar tu primera ronda de Adivina la canción", familia: "adivina", icono: "nota" },
    { id: "primera_combustion", nombre: "Mi primera combustión", como: "Adivinar una canción con 1 segundo", familia: "adivina", icono: "cerillo" },
    { id: "ya_sale_el_sol", nombre: "Ya sale el sol", como: "Acertar las 10 canciones de una ronda", familia: "adivina", icono: "sol" },
    { id: "domingo", nombre: "Domingo astromántico", como: "Racha de 7 días en la ronda del día", familia: "adivina", icono: "estrella" },
    { id: "nada", nombre: "Nada", como: "No acertar ninguna canción en una ronda", familia: "adivina", icono: "silencio", oculta: true, pista: "Ni una te sonó conocida" },
    { id: "starman", nombre: "El día que Starman huyó", como: "60 de 60: las 10 canciones con 1 segundo", familia: "adivina", icono: "starman", oculta: true, pista: "Ni un segundo más" },
    // Concierto (F25/D31): solo con el código del cartel, del 24 al 28 de noviembre de 2026.
    { id: "noches_reversibles", nombre: "Noches reversibles", como: "Escanear el QR de Colores Ruidosos en un concierto", familia: "concierto", icono: "boleto" },
    { id: "gran_truco", nombre: "El gran truco final", como: "Tener todas las demás insignias", familia: "secreta", icono: "sombrero", oculta: true, pista: "Solo para quien lo tiene todo" },
  ];
  var SECRETOS = ["contraespionaje", "wio"];
  // "El gran truco final" no pide la insignia de fecha límite ni las del contrarreloj (D23) ni las de Adivina la canción (D28).
  var SIN_GRAN_TRUCO = ["gran_truco", "ultimo_baile"];
  var DIA_MS = 24 * 3600 * 1000;

  function validarPregunta(p) {
    var e = [];
    if (!p || typeof p.id !== "string" || !p.id) return ["sin id"];
    if (ETAPAS.indexOf(p.etapa) < 0) e.push("etapa inválida");
    if (DIFICULTADES.indexOf(p.dificultad) < 0) e.push("dificultad inválida");
    if (p.tipo !== "dato" && p.tipo !== "portada") e.push("tipo inválido");
    if (p.tipo === "portada" && !p.escena_alt) e.push("portada sin escena_alt");
    if (!p.pregunta) e.push("sin pregunta");
    if (!p.correcta) e.push("sin respuesta correcta");
    if (!Array.isArray(p.incorrectas) || p.incorrectas.length !== 3) e.push("necesita 3 incorrectas");
    else {
      var todas = [p.correcta].concat(p.incorrectas);
      if (new Set(todas).size !== 4 || todas.some(function (o) { return !o; })) e.push("opciones repetidas o vacías");
    }
    var f = Array.isArray(p.fuentes) ? p.fuentes : [];
    if (!f.length || f.some(function (u) { return !/^https:\/\//.test(u); })) e.push("fuentes faltantes o sin https");
    if (p.fuerza === "solida") {
      if (f.length < 2 && !f.some(function (u) { return FUENTE_OFICIAL.test(u); })) e.push("sólida necesita 2 fuentes o la web oficial");
    } else if (p.fuerza !== "una_fuente") e.push("fuerza inválida");
    if (p.estado !== "propuesta" && p.estado !== "verificada") e.push("estado inválido");
    return e;
  }

  function preguntasJugables(datos) {
    return (datos.preguntas || []).filter(function (p) {
      return p.fuerza === "solida" && (datos.borrador || p.estado === "verificada");
    });
  }

  function barajar(lista, rng) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function etapasDe(lista) {
    var vistas = {};
    lista.forEach(function (p) { vistas[p.etapa] = true; });
    return Object.keys(vistas).length;
  }

  /* Sortea 5 por dificultad y repite el sorteo (hasta 200 veces) hasta que la
     partida pase por todas las etapas que tiene el banco. */
  function sortear(preguntas, rng) {
    rng = rng || Math.random;
    var meta = etapasDe(preguntas), elegidas = [];
    for (var intento = 0; intento < 200; intento++) {
      elegidas = [];
      DIFICULTADES.forEach(function (d) {
        var grupo = preguntas.filter(function (p) { return p.dificultad === d; });
        elegidas = elegidas.concat(barajar(grupo, rng).slice(0, POR_DIFICULTAD));
      });
      if (etapasDe(elegidas) === meta) break;
    }
    return elegidas.sort(function (a, b) {
      return (ETAPAS.indexOf(a.etapa) - ETAPAS.indexOf(b.etapa)) ||
        (DIFICULTADES.indexOf(a.dificultad) - DIFICULTADES.indexOf(b.dificultad));
    });
  }

  function opciones(p, rng) {
    return barajar([p.correcta].concat(p.incorrectas), rng || Math.random);
  }

  function puntaje(respuestas) {
    return respuestas.reduce(function (s, r) { return s + (r.acierto ? PUNTOS[r.dificultad] : 0); }, 0);
  }

  function categoria(puntos) {
    var c = CATEGORIAS[0];
    CATEGORIAS.forEach(function (x) { if (puntos >= x.desde) c = x; });
    return c;
  }

  /* Texto para quien llega a Viejo lesbiano: le avisa que existe la categoría secreta sin nombrarla. */
  function pistaSiguiente(cat) {
    return cat && cat.id === "viejo" ? "Existe un nivel más alto. Solo se llega con 30 de 30." : "";
  }

  function estadoInicial() {
    return { v: 1, partidas: 0, aciertos: 0, mejorPuntaje: 0, mejorNivel: 0, insignias: {}, portadas: [],
      dias: [], ultimaPartida: null, partidasDia: { fecha: "", n: 0 }, crPartidas: 0, crAciertos: 0, crRecord: 0, adRondas: 0 };
  }

  // Copia el estado y completa los campos que no existían antes de F17 (D23).
  function copiar(estado) {
    var e = JSON.parse(JSON.stringify(estado));
    if (!Array.isArray(e.dias)) e.dias = [];
    if (e.ultimaPartida === undefined) e.ultimaPartida = null;
    if (!e.partidasDia) e.partidasDia = { fecha: "", n: 0 };
    ["crPartidas", "crAciertos", "crRecord", "adRondas"].forEach(function (k) { if (typeof e[k] !== "number") e[k] = 0; });
    return e;
  }

  function fechaLocal(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function rachaRapida(respuestas) {
    var n = 0;
    for (var k = 0; k < respuestas.length; k++) {
      var r = respuestas[k];
      n = r.acierto && typeof r.ms === "number" && r.ms < 2000 ? n + 1 : 0;
      if (n >= 3) return true;
    }
    return false;
  }

  function tieneTodas(estado) {
    return INSIGNIAS.every(function (i) {
      return SIN_GRAN_TRUCO.indexOf(i.id) >= 0 || i.familia === "contrarreloj" || i.familia === "adivina" ||
        i.familia === "concierto" || estado.insignias[i.id];
    });
  }

  function mejorRacha(respuestas) {
    var mejor = 0, actual = 0;
    respuestas.forEach(function (r) { actual = r.acierto ? actual + 1 : 0; mejor = Math.max(mejor, actual); });
    return mejor;
  }

  function etapasCompletas(respuestas) {
    return ETAPAS.filter(function (e) {
      var de = respuestas.filter(function (r) { return r.etapa === e; });
      return de.length > 0 && de.every(function (r) { return r.acierto; });
    });
  }

  function otorgar(estado, ids, ahora) {
    var nuevas = [];
    ids.forEach(function (id) {
      if (!estado.insignias[id]) { estado.insignias[id] = ahora.toISOString(); nuevas.push(id); }
    });
    if (nuevas.length && !estado.insignias.gran_truco && tieneTodas(estado)) {
      estado.insignias.gran_truco = ahora.toISOString();
      nuevas.push("gran_truco");
    }
    return nuevas;
  }

  /* Registra una partida terminada. `respuestas` es [{id, etapa, dificultad, acierto}]
     en el orden en que se jugaron. Devuelve el estado nuevo (no modifica el anterior). */
  function cerrarPartida(estadoPrevio, respuestas, ahora, opciones) {
    ahora = ahora || new Date();
    opciones = opciones || {};
    var estado = copiar(estadoPrevio || estadoInicial());
    var pts = puntaje(respuestas);
    var cat = categoria(pts);
    var aciertos = respuestas.filter(function (r) { return r.acierto; }).length;
    var muyDificiles = respuestas.filter(function (r) { return r.dificultad === "muy_dificil"; });
    var e1 = respuestas.filter(function (r) { return r.etapa === "E1"; });
    var nivelAnterior = estado.mejorNivel;
    var hoy = fechaLocal(ahora);
    var anterior = estado.ultimaPartida ? new Date(estado.ultimaPartida).getTime() : null;
    var facilesMal = respuestas.filter(function (r) { return r.dificultad === "facil"; });

    estado.partidas += 1;
    estado.aciertos += aciertos;
    estado.mejorPuntaje = Math.max(estado.mejorPuntaje, pts);
    estado.mejorNivel = Math.max(estado.mejorNivel, cat.nivel);
    if (estado.dias.indexOf(hoy) < 0) estado.dias = estado.dias.concat([hoy]).slice(-60);
    estado.partidasDia = estado.partidasDia.fecha === hoy ? { fecha: hoy, n: estado.partidasDia.n + 1 } : { fecha: hoy, n: 1 };
    estado.ultimaPartida = ahora.toISOString();

    var portadasNuevas = etapasCompletas(respuestas).filter(function (e) { return estado.portadas.indexOf(e) < 0; });
    estado.portadas = ETAPAS.filter(function (e) { return estado.portadas.indexOf(e) >= 0 || portadasNuevas.indexOf(e) >= 0; });

    var ganadas = [];
    if (estado.partidas === 1) ganadas.push("maniobras");
    if (estado.partidas >= 5) ganadas.push("universos");
    if (mejorRacha(respuestas) >= 5) ganadas.push("incendios");
    if (muyDificiles.length === POR_DIFICULTAD && muyDificiles.every(function (r) { return r.acierto; })) ganadas.push("volcan");
    if (e1.length && e1.every(function (r) { return r.acierto; })) ganadas.push("ungravity");
    if (nivelAnterior > 0 && cat.nivel > nivelAnterior) ganadas.push("segundo_asalto");
    if (ahora.getHours() < 5) ganadas.push("noche_eterna");
    if (pts === 0) ganadas.push("viaje");
    if (cat.nivel >= 3) ganadas.push("me_amo");
    if (cat.id === "john_boy") ganadas.push("john_boy");
    if (estado.aciertos >= 99) ganadas.push("1999");
    if (estado.portadas.length === ETAPAS.length) ganadas.push("ejercito");
    if (ahora.getTime() <= FIN_ULTIMO_BAILE) ganadas.push("ultimo_baile");
    if (facilesMal.length === POR_DIFICULTAD && facilesMal.every(function (r) { return !r.acierto; }) &&
        muyDificiles.length === POR_DIFICULTAD && muyDificiles.every(function (r) { return r.acierto; })) ganadas.push("contradiccion");
    if (pts === 12 || pts === 22 || pts === 29) ganadas.push("tercero_segunda");
    if (pts === 15) ganadas.push("yin_yen");
    if (typeof opciones.duracionMs === "number" && opciones.duracionMs < 90000 && pts >= 20) ganadas.push("planeador");
    if (rachaRapida(respuestas)) ganadas.push("cuando_diga_ya");
    if (estado.partidasDia.n >= 10) ganadas.push("oceanos");
    if (estado.dias.length >= 5) ganadas.push("hermandad");
    if (anterior !== null && ahora.getTime() - anterior >= 7 * DIA_MS) ganadas.push("dias_no_vividos");

    return { estado: estado, puntos: pts, categoria: cat, nuevas: otorgar(estado, ganadas, ahora), portadasNuevas: portadasNuevas };
  }

  function registrarCompartir(estadoPrevio, ahora) {
    var estado = copiar(estadoPrevio || estadoInicial());
    return { estado: estado, nuevas: otorgar(estado, ["alli_donde"], ahora || new Date()) };
  }

  /* Registra un contrarreloj terminado. resumen = {aciertos, mejorRacha, puntos}. */
  function cerrarContrarreloj(estadoPrevio, resumen, ahora) {
    ahora = ahora || new Date();
    var estado = copiar(estadoPrevio || estadoInicial());
    var record = resumen.puntos > estado.crRecord;
    estado.crPartidas += 1;
    estado.crAciertos += resumen.aciertos;
    estado.crRecord = Math.max(estado.crRecord, resumen.puntos);
    var ganadas = [];
    if (estado.crPartidas === 1) ganadas.push("psiconautas");
    if (resumen.mejorRacha >= 10) ganadas.push("seres_unicos");
    if (resumen.aciertos >= 20) ganadas.push("radio_himalaya");
    if (estado.crAciertos >= 100) ganadas.push("cosmos");
    return { estado: estado, nuevas: otorgar(estado, ganadas, ahora), record: record };
  }

  /* Registra una ronda de Adivina la canción. resumen = {aciertos, puntos, primeros (acertadas con 1 s),
     racha (días seguidos de la ronda del día), practica}. La práctica no cuenta para la racha. */
  function cerrarAdivina(estadoPrevio, resumen, ahora) {
    ahora = ahora || new Date();
    var estado = copiar(estadoPrevio || estadoInicial());
    estado.adRondas += 1;
    var ganadas = [];
    if (estado.adRondas === 1) ganadas.push("musica_ascensores");
    if (resumen.primeros >= 1) ganadas.push("primera_combustion");
    if (resumen.aciertos >= 10) ganadas.push("ya_sale_el_sol");
    if (!resumen.practica && resumen.racha >= 7) ganadas.push("domingo");
    if (resumen.aciertos === 0) ganadas.push("nada");
    if (resumen.puntos >= 60) ganadas.push("starman");
    return { estado: estado, nuevas: otorgar(estado, ganadas, ahora) };
  }

  // Código del cartel de concierto (F25): mayúsculas, sin espacios, guiones ni acentos.
  function normalizarCodigo(codigo) {
    return String(codigo || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  /* Canjea la insignia de concierto. huella = SHA-256 (hex) del código normalizado, calculada fuera;
     config = {huella, desde, hasta} de hugo.toml. error: "" | "codigo" | "fecha" | "ya". */
  function canjearConcierto(estadoPrevio, huella, config, ahora) {
    ahora = ahora || new Date();
    var estado = copiar(estadoPrevio || estadoInicial());
    var nada = function (error) { return { estado: estado, nuevas: [], error: error }; };
    if (!config || !config.huella || huella !== config.huella) return nada("codigo");
    var t = ahora.getTime();
    if (t < new Date(config.desde).getTime() || t > new Date(config.hasta).getTime()) return nada("fecha");
    if (estado.insignias.noches_reversibles) return nada("ya");
    return { estado: estado, nuevas: otorgar(estado, ["noches_reversibles"], ahora), error: "" };
  }

  // Secretos que se descubren fuera de la partida (código Konami, toques a la pantallita).
  function registrarSecreto(estadoPrevio, id, ahora) {
    var estado = copiar(estadoPrevio || estadoInicial());
    if (SECRETOS.indexOf(id) < 0) return { estado: estado, nuevas: [] };
    return { estado: estado, nuevas: otorgar(estado, [id], ahora || new Date()) };
  }

  function cargarEstado(almacen) {
    try {
      var crudo = almacen && almacen.getItem(CLAVE);
      if (!crudo) return estadoInicial();
      var e = JSON.parse(crudo);
      if (!e || e.v !== 1 || typeof e.insignias !== "object" || !Array.isArray(e.portadas)) return estadoInicial();
      return copiar(e);
    } catch (err) {
      return estadoInicial();
    }
  }

  function guardarEstado(almacen, estado) {
    try {
      almacen.setItem(CLAVE, JSON.stringify(estado));
      return true;
    } catch (err) {
      return false;
    }
  }

  raiz.CRtrivia = {
    ETAPAS: ETAPAS, DIFICULTADES: DIFICULTADES, PUNTOS: PUNTOS, CATEGORIAS: CATEGORIAS, INSIGNIAS: INSIGNIAS, CLAVE: CLAVE,
    validarPregunta: validarPregunta, preguntasJugables: preguntasJugables, sortear: sortear, opciones: opciones,
    puntaje: puntaje, categoria: categoria, pistaSiguiente: pistaSiguiente, estadoInicial: estadoInicial, cerrarPartida: cerrarPartida,
    registrarCompartir: registrarCompartir, registrarSecreto: registrarSecreto, cerrarContrarreloj: cerrarContrarreloj, cerrarAdivina: cerrarAdivina, normalizarCodigo: normalizarCodigo, canjearConcierto: canjearConcierto, cargarEstado: cargarEstado, guardarEstado: guardarEstado,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = raiz.CRtrivia;
})(typeof window !== "undefined" ? window : globalThis);
