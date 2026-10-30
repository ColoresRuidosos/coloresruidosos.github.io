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
  // 25 de noviembre de 2026, 23:59:59 en CDMX (UTC-6): último concierto en el Auditorio Nacional.
  var FIN_ULTIMO_BAILE = Date.UTC(2026, 10, 26, 5, 59, 59, 999);

  var CATEGORIAS = [
    { id: "pequeno", nombre: "Pequeño lesbiano", nivel: 1, desde: 0 },
    { id: "lesbianito", nombre: "Lesbianito", nivel: 2, desde: 13 },
    { id: "viejo", nombre: "Viejo lesbiano", nivel: 3, desde: 23 },
    { id: "john_boy", nombre: "Club de fans de John Boy", nivel: 4, desde: 30 },
  ];

  var INSIGNIAS = [
    { id: "maniobras", nombre: "Maniobras de escapismo", como: "Terminar tu primera partida" },
    { id: "universos", nombre: "Universos infinitos", como: "Jugar 5 partidas" },
    { id: "incendios", nombre: "Incendios de nieve", como: "5 aciertos seguidos" },
    { id: "volcan", nombre: "Bajo el volcán", como: "Acertar las 5 muy difíciles de una partida" },
    { id: "ungravity", nombre: "Ungravity", como: "Acertar toda la etapa en inglés" },
    { id: "segundo_asalto", nombre: "Segundo asalto", como: "Superar tu mejor categoría" },
    { id: "noche_eterna", nombre: "La noche eterna", como: "???", oculta: true },
    { id: "viaje", nombre: "Viaje épico hacia la nada", como: "Terminar con 0 puntos" },
    { id: "me_amo", nombre: "Me amo", como: "Llegar a Viejo lesbiano" },
    { id: "john_boy", nombre: "Club de fans de John Boy", como: "???", oculta: true },
    { id: "1999", nombre: "1999", como: "Acumular 99 aciertos" },
    { id: "alli_donde", nombre: "Allí donde solíamos gritar", como: "Compartir tu resultado" },
    { id: "ejercito", nombre: "Ejército de salvación", como: "Desbloquear las 6 portadas" },
    { id: "ultimo_baile", nombre: "El último baile", como: "Jugar antes del 25 de noviembre de 2026" },
  ];

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

  function sortear(preguntas, rng) {
    rng = rng || Math.random;
    var elegidas = [];
    DIFICULTADES.forEach(function (d) {
      var grupo = preguntas.filter(function (p) { return p.dificultad === d; });
      elegidas = elegidas.concat(barajar(grupo, rng).slice(0, POR_DIFICULTAD));
    });
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

  function estadoInicial() {
    return { v: 1, partidas: 0, aciertos: 0, mejorPuntaje: 0, mejorNivel: 0, insignias: {}, portadas: [] };
  }

  function copiar(estado) { return JSON.parse(JSON.stringify(estado)); }

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
    return nuevas;
  }

  /* Registra una partida terminada. `respuestas` es [{id, etapa, dificultad, acierto}]
     en el orden en que se jugaron. Devuelve el estado nuevo (no modifica el anterior). */
  function cerrarPartida(estadoPrevio, respuestas, ahora) {
    ahora = ahora || new Date();
    var estado = copiar(estadoPrevio || estadoInicial());
    var pts = puntaje(respuestas);
    var cat = categoria(pts);
    var aciertos = respuestas.filter(function (r) { return r.acierto; }).length;
    var muyDificiles = respuestas.filter(function (r) { return r.dificultad === "muy_dificil"; });
    var e1 = respuestas.filter(function (r) { return r.etapa === "E1"; });
    var nivelAnterior = estado.mejorNivel;

    estado.partidas += 1;
    estado.aciertos += aciertos;
    estado.mejorPuntaje = Math.max(estado.mejorPuntaje, pts);
    estado.mejorNivel = Math.max(estado.mejorNivel, cat.nivel);

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

    return { estado: estado, puntos: pts, categoria: cat, nuevas: otorgar(estado, ganadas, ahora), portadasNuevas: portadasNuevas };
  }

  function registrarCompartir(estadoPrevio, ahora) {
    var estado = copiar(estadoPrevio || estadoInicial());
    return { estado: estado, nuevas: otorgar(estado, ["alli_donde"], ahora || new Date()) };
  }

  function cargarEstado(almacen) {
    try {
      var crudo = almacen && almacen.getItem(CLAVE);
      if (!crudo) return estadoInicial();
      var e = JSON.parse(crudo);
      if (!e || e.v !== 1 || typeof e.insignias !== "object" || !Array.isArray(e.portadas)) return estadoInicial();
      return e;
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
    puntaje: puntaje, categoria: categoria, estadoInicial: estadoInicial, cerrarPartida: cerrarPartida,
    registrarCompartir: registrarCompartir, cargarEstado: cargarEstado, guardarEstado: guardarEstado,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = raiz.CRtrivia;
})(typeof window !== "undefined" ? window : globalThis);
