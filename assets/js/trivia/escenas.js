/* Escenas pixel art de la Trivia (F15/D21). Cada etapa se dibuja a 160×144
   con primitivas sobre píxeles enteros y se escala con image-rendering:
   pixelated. Son reinterpretaciones propias inspiradas en las portadas,
   nunca las imágenes originales. `t` es el cuadro de animación (0 = quieto). */
(function (raiz) {
  var ANCHO = 160, ALTO = 144;

  var ETAPAS_INFO = {
    E1: { nombre: "Etapa en inglés", anios: "1997–2003", discos: "Microscopic Movies · Is It Fiction? · Ungravity" },
    E2: { nombre: "El salto al castellano", anios: "2005–2007", discos: "Maniobras de escapismo · Cuentos chinos para niños del Japón" },
    E3: { nombre: "La explosión", anios: "2009–2014", discos: "1999 · La noche eterna · Nouvelle Cuisine Caníbal" },
    E4: { nombre: "Era Halley", anios: "2016–2018", discos: "El poeta Halley · El gran truco final" },
    E5: { nombre: "V.E.H.N.", anios: "2021–2023", discos: "Viaje épico hacia la nada" },
    E6: { nombre: "Ejército de salvación", anios: "2024–2026", discos: "Ejército de salvación" },
  };

  var FUENTE = {
    A: ["010", "101", "111", "101", "101"], B: ["110", "101", "110", "101", "110"],
    E: ["111", "100", "110", "100", "111"], F: ["111", "100", "110", "100", "100"],
    I: ["111", "010", "010", "010", "111"], L: ["100", "100", "100", "100", "111"],
    N: ["110", "101", "101", "101", "101"], O: ["111", "101", "101", "101", "111"],
    S: ["111", "100", "111", "001", "111"], V: ["101", "101", "101", "101", "010"],
    "?": ["111", "001", "010", "000", "010"], " ": ["000", "000", "000", "000", "000"],
  };

  function pintor(ctx) {
    function r(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
    function elipse(cx, cy, rx, ry, c) {
      ctx.fillStyle = c;
      for (var y = -ry; y <= ry; y++) {
        var w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry + 0.5))));
        ctx.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1);
      }
    }
    function linea(x0, y0, x1, y1, c, grosor) {
      var g = grosor || 1, pasos = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
      ctx.fillStyle = c;
      for (var i = 0; i <= pasos; i++) {
        ctx.fillRect(Math.round(x0 + ((x1 - x0) * i) / pasos), Math.round(y0 + ((y1 - y0) * i) / pasos), g, g);
      }
    }
    function tramado(x, y, w, h, c1, c2, celda) {
      var k = celda || 1;
      for (var j = 0; j < h; j += k) for (var i = 0; i < w; i += k) {
        ctx.fillStyle = ((i / k + j / k) % 2) ? c2 : c1;
        ctx.fillRect(x + i, y + j, k, k);
      }
    }
    function texto(s, x, y, esc, c) {
      ctx.fillStyle = c;
      s.split("").forEach(function (ch, n) {
        (FUENTE[ch] || FUENTE[" "]).forEach(function (fila, j) {
          for (var i = 0; i < 3; i++) if (fila[i] === "1") ctx.fillRect(x + n * 4 * esc + i * esc, y + j * esc, esc, esc);
        });
      });
    }
    function anchoTexto(s, esc) { return s.length * 4 * esc - esc; }
    return { r: r, elipse: elipse, linea: linea, tramado: tramado, texto: texto, anchoTexto: anchoTexto };
  }

  // Degradado por franjas con una fila tramada entre cada una.
  function cielo(p, colores, y0, alto) {
    var franja = alto / colores.length;
    colores.forEach(function (c, i) {
      p.r(0, y0 + i * franja, ANCHO, franja + 1, c);
      if (i > 0) p.tramado(0, Math.round(y0 + i * franja), ANCHO, 2, c, colores[i - 1]);
    });
  }

  function estrella(p, x, y, c) { p.r(x, y - 2, 1, 5, c); p.r(x - 2, y, 5, 1, c); p.r(x - 1, y - 1, 3, 3, c); }

  // E1 · cielo de Ungravity y el neón de la etapa en inglés.
  function e1(p, t) {
    cielo(p, ["#0b1f5c", "#13308a", "#1d47b3", "#2f5bff", "#5a7fff", "#8aa5ff"], 0, ALTO);
    p.r(118, 0, 42, 30, "#c9ccd6");
    for (var i = 0; i < 4; i++) for (var j = 0; j < 3; j++) p.r(122 + i * 9, 4 + j * 8, 5, 4, "#8e93a3");
    p.r(118, 30, 42, 3, "#6b7080");
    var titila = t && (t % 37 === 0 || t % 37 === 2);
    var s = "LOVE OF LESBIAN", x = Math.round((ANCHO - p.anchoTexto(s, 2)) / 2);
    p.texto(s, x - 1, 55, 2, "#7a2a10"); p.texto(s, x + 1, 57, 2, "#7a2a10");
    p.texto(s, x, 56, 2, titila ? "#a8501f" : "#ff7a30");
    var d = t ? (t >> 2) % 160 : 0;
    p.elipse((30 + d) % 200 - 20, 118, 40, 12, "#dfe6ff");
    p.elipse(92, 128, 54, 16, "#ffffff");
    p.elipse((150 + d) % 200 - 20, 116, 30, 10, "#e8eeff");
    p.r(0, 132, ANCHO, 12, "#ffffff");
  }

  // E2 · burbuja roja de Cuentos chinos y el equilibrista de Maniobras.
  function e2(p, t) {
    p.r(0, 0, ANCHO, ALTO, "#f4efe6");
    p.elipse(30, 112, 22, 22, "#e0452b");
    p.r(0, 113, ANCHO, 31, "#f4efe6");
    p.r(56, 90, 4, 22, "#141414"); p.r(64, 97, 4, 15, "#141414"); p.r(72, 104, 4, 8, "#141414");
    p.r(0, 112, ANCHO, 1, "#141414");
    var x = t ? 150 - ((t >> 1) % 70) : 118, paso = t ? (t >> 2) % 2 : 0;
    p.elipse(x, 92, 3, 3, "#141414");
    p.r(x - 4, 88, 9, 1, "#141414"); p.r(x - 2, 85, 5, 3, "#141414");
    p.r(x, 95, 1, 10, "#141414");
    p.linea(x, 98, x - 4, 95 + paso * 3, "#141414"); p.linea(x, 98, x + 4, 98 - paso * 3, "#141414");
    p.linea(x, 105, x - 3 + paso * 2, 111, "#141414"); p.linea(x, 105, x + 3 - paso * 2, 111, "#141414");
    p.r(98, 14, 46, 30, "#d7261e"); p.r(96, 16, 50, 26, "#d7261e");
    for (var i = 0; i < 8; i++) p.r(104 - i, 44 + i, 8 - i, 1, "#d7261e");
    estrella(p, 104, 21, "#ffd23f");
    p.r(110, 20, 2, 2, "#ffd23f"); p.r(113, 24, 2, 2, "#ffd23f"); p.r(113, 28, 2, 2, "#ffd23f"); p.r(110, 31, 2, 2, "#ffd23f");
  }

  // E3 · la bañera de 1999: ella al frente, de negro, con el fleco sobre los ojos; él dentro de la bañera.
  function e3(p, t) {
    p.r(0, 0, ANCHO, ALTO, "#2a6764");
    for (var x = 0; x < ANCHO; x += 14) p.r(x, 0, 1, 74, "#3f8580");
    for (var y = 0; y < 74; y += 14) p.r(0, y, ANCHO, 1, "#3f8580");
    p.tramado(0, 0, 12, 74, "#2a6764", "#1d4b49", 2); p.tramado(148, 0, 12, 74, "#2a6764", "#1d4b49", 2);
    p.r(60, 18, 34, 16, "#d6ddd6"); p.r(62, 20, 30, 12, "#6f8f88");
    p.r(65, 23, 7, 9, "#e8e2d6"); p.r(66, 22, 5, 2, "#c64a3c"); p.r(76, 27, 12, 5, "#cfd6cc");
    p.r(4, 48, 22, 10, "#24302f"); p.r(8, 44, 8, 6, "#1a2322"); p.r(22, 52, 10, 3, "#8a9a96");
    p.linea(150, 20, 146, 58, "#9fb3ae", 2);
    p.r(10, 60, 146, 5, "#e4e9e3");
    p.r(14, 65, 138, 9, "#2f4f52");
    if (t && (t >> 3) % 2) p.r(30, 68, 40, 1, "#4d7275");
    p.elipse(132, 54, 8, 6, "#231a16");
    p.elipse(131, 60, 6, 7, "#c4977f");
    p.r(126, 63, 11, 5, "#3a2a22"); p.r(128, 59, 2, 1, "#231a16"); p.r(133, 59, 2, 1, "#231a16");
    p.elipse(124, 68, 12, 3, "#b48a74"); p.r(110, 70, 34, 2, "#2f4f52");
    p.r(8, 74, 150, 6, "#f2f5f0");
    p.r(12, 80, 144, 28, "#d8ddd5"); p.r(12, 100, 144, 8, "#b3bcb3");
    p.r(0, 108, ANCHO, 36, "#142c2b");
    for (var k = 0; k < 6; k++) for (var m = 0; m < 9; m++) {
      var hx = m * 20 + (k % 2) * 10, hy = 112 + k * 7;
      p.r(hx, hy, 10, 1, "#2b4c4a"); p.r(hx - 2, hy + 1, 2, 3, "#2b4c4a");
    }
    for (var j = 0; j < 58; j++) p.r(48 - j / 5, 86 + j, 34 + (j * 2) / 5, 1, "#0e0e0e");
    p.r(56, 78, 18, 10, "#0e0e0e"); p.r(80, 96, 2, 40, "#1a1a1a");
    p.elipse(62, 66, 15, 16, "#0b0b0b");
    p.elipse(70, 72, 6, 8, "#ece2da");
    p.r(64, 62, 13, 9, "#0b0b0b");
    p.r(48, 64, 10, 22, "#0b0b0b");
    p.r(72, 78, 4, 2, "#c8102e");
    p.r(75, 72, 1, 3, "#d4c6bc");
  }

  // E4 · el cohete de El poeta Halley.
  function e4(p, t) {
    cielo(p, ["#68d8d6", "#4fcfcf", "#3ec6c8"], 0, ALTO);
    [[12, 14], [40, 30], [26, 60], [70, 12], [100, 40], [8, 96], [150, 70], [118, 100]].forEach(function (s, i) {
      if (!t || (t + i * 7) % 24 > 3) estrella(p, s[0], s[1], "#ffffff");
    });
    for (var i = 0; i < 26; i++) {
      p.linea(132 - i * 3, 28 + i * 2, 132 - i * 3, 34 + i * 2, i % 2 ? "#ffd23f" : "#ff7a30", 2);
    }
    p.elipse(138, 22, 10, 10, "#ffd23f");
    [[138, 4], [156, 22], [138, 40], [120, 22], [151, 9], [151, 35], [125, 9], [125, 35]].forEach(function (q) {
      p.linea(138, 22, q[0], q[1], "#ff7a30");
    });
    p.elipse(138, 22, 6, 6, "#fff3b0");
    p.elipse(140, 112, 7, 7, "#f2a03a"); p.r(128, 112, 25, 1, "#b06a20");
    p.elipse(24, 136, 40, 14, "#ffffff"); p.elipse(90, 140, 50, 12, "#d6f3f3"); p.elipse(150, 138, 30, 10, "#ffffff");
    var b = t ? Math.round(Math.sin(t / 6) * 2) : 0;
    p.r(102, 84 + b, 10, 14, "#b81f1a"); p.r(106, 78 + b, 8, 6, "#b81f1a"); p.r(106, 98 + b, 8, 6, "#b81f1a");
    p.elipse(76, 91 + b, 34, 14, "#e2322b");
    p.elipse(74, 85 + b, 26, 5, "#f2614f");
    p.r(40, 89 + b, 6, 4, "#ffd23f"); p.r(36, 90 + b, 4, 2, "#ffd23f");
    p.elipse(54, 90 + b, 4, 4, "#ffffff"); p.elipse(66, 90 + b, 4, 4, "#ffffff");
    p.r(53, 90 + b, 2, 2, "#141414"); p.r(65, 90 + b, 2, 2, "#141414");
    p.r(84, 66 + b, 10, 12, "#3b56c4"); p.r(82, 72 + b, 2, 6, "#3b56c4"); p.r(94, 72 + b, 2, 6, "#3b56c4");
    p.elipse(89, 60 + b, 7, 7, "#bfe9ff"); p.elipse(89, 61 + b, 4, 4, "#3b56c4");
    p.r(86, 56 + b, 2, 2, "#ffffff");
  }

  // E5 · el trampolín entre muros de mosaico de V.E.H.N.
  function e5(p, t) {
    p.r(0, 0, ANCHO, ALTO, "#f1ece2");
    cielo(p, ["#8fb6e0", "#a9c6e6", "#c3d6ec", "#dbe5f0"], 8, 112);
    if (t) p.elipse((t >> 2) % 120 + 20, 30, 12, 3, "#eef3f8");
    for (var y = 8; y < 120; y++) {
      var w = Math.round(14 + (y - 8) * 0.22);
      for (var x = 4; x < 4 + w; x += 2) {
        var arriba = y < 50;
        var c = ((x + (y >> 1)) % 4 < 2) ? (arriba ? "#9a6e8a" : "#1d3f9e") : (arriba ? "#c08a6a" : "#2f5bff");
        p.r(x, y, 2, 1, c); p.r(ANCHO - x - 2, y, 2, 1, c === "#c08a6a" ? "#6d8be0" : c);
      }
      p.r(4 + w, y, 1, 1, "#c8a050"); p.r(ANCHO - 5 - w, y, 1, 1, "#c8a050");
    }
    for (var fy = 120; fy < 138; fy++) for (var fx = 4; fx < ANCHO - 4; fx += 2) {
      p.r(fx, fy, 2, 1, ((fx + fy) % 4 < 2) ? "#1d3f9e" : "#2a4fc4");
    }
    p.r(4, 119, ANCHO - 8, 1, "#c8a050");
    p.r(76, 64, 8, 56, "#9c8f80"); p.r(76, 64, 2, 56, "#b5a898");
    for (var k = 0; k < 10; k++) p.r(80 - (18 - k * 1.6), 54 + k, (18 - k * 1.6) * 2, 1, k < 2 ? "#b5a898" : "#9c8f80");
    p.r(68, 46, 1, 8, "#5a5a5a"); p.r(91, 46, 1, 8, "#5a5a5a");
    p.r(78, 45, 4, 9, "#5a4a3a"); p.elipse(80, 42, 2, 2, "#c99a7a");
  }

  // E6 · las máscaras y la bandera de Ejército de salvación.
  function e6(p, t) {
    p.r(0, 0, ANCHO, ALTO, "#ecebe8");
    p.r(0, 120, ANCHO, 24, "#dcdad5");
    p.elipse(80, 128, 70, 6, "#cfccc5");
    function cuerpo(cx, y, ancho, c) { for (var j = 0; j < 128 - y; j++) p.r(cx - ancho / 2 - j / 5, y + j, ancho + (j * 2) / 5, 1, c); }
    cuerpo(36, 78, 22, "#d99a6c"); cuerpo(36, 78, 10, "#3c4f5c");
    p.r(24, 46, 24, 32, "#ff7a30"); p.r(26, 50, 20, 4, "#ffd23f"); p.r(26, 58, 20, 4, "#2a8a9a"); p.r(26, 66, 20, 4, "#f4efe6");
    p.r(34, 54, 4, 22, "#1d2a44"); p.r(30, 74, 12, 4, "#1d2a44");
    cuerpo(80, 40, 22, "#d9d6cf");
    p.r(73, 26, 14, 14, "#d9b89c"); p.r(74, 31, 12, 2, "#141414"); p.r(76, 36, 8, 2, "#8a6a52");
    p.r(70, 14, 20, 12, "#a9b8d8"); p.r(66, 24, 28, 3, "#c5d0e8"); p.r(79, 6, 2, 8, "#d8c48a");
    p.r(68, 27, 2, 6, "#1d2a44"); p.r(90, 27, 2, 6, "#1d2a44");
    cuerpo(80, 96, 26, "#efe6d6");
    p.r(66, 58, 28, 22, "#e9dcc4"); p.r(74, 70, 3, 2, "#ff7a30"); p.r(83, 70, 3, 2, "#ff7a30");
    p.r(66, 80, 28, 16, "#6aa6d0");
    for (var i = 0; i < 28; i += 2) p.r(66 + i, 94, 1, 4, "#4c86b0");
    cuerpo(118, 80, 22, "#4a4a4a");
    p.r(106, 46, 24, 34, "#f08a3c"); p.r(108, 52, 20, 5, "#1d2a44"); p.r(108, 62, 20, 5, "#2a8a9a"); p.r(116, 68, 4, 12, "#1d2a44");
    p.r(104, 42, 8, 6, "#f08a3c"); p.r(124, 42, 8, 6, "#f08a3c");
    p.linea(124, 104, 154, 18, "#c8a070", 2);
    for (var x = 0; x < 30; x++) {
      var ola = t ? Math.round(Math.sin((x + t / 2) / 4) * 2) : Math.round(Math.sin(x / 4) * 2);
      var bx = 154 - x, by = 18 + Math.round(x * 0.4) + ola;
      for (var y = 0; y < 34; y++) {
        var banda = Math.floor((y + x * 0.6) / 6) % 3;
        p.r(bx, by + y, 1, 1, ["#ff7a30", "#2a8a9a", "#f4efe6"][banda]);
      }
    }
  }

  var DIBUJOS = { E1: e1, E2: e2, E3: e3, E4: e4, E5: e5, E6: e6 };

  function dibujarEscena(ctx, etapa, t) {
    ctx.imageSmoothingEnabled = false;
    DIBUJOS[etapa](pintor(ctx), t || 0);
  }

  function dibujarBloqueada(ctx) {
    var p = pintor(ctx);
    p.r(0, 0, ANCHO, ALTO, "#141414");
    p.tramado(0, 0, ANCHO, ALTO, "#141414", "#1f1f1f", 4);
    p.texto("?", Math.round((ANCHO - p.anchoTexto("?", 6)) / 2), 56, 6, "#ff7a30");
  }

  // Avatares 32×32: una máscara por categoría (nivel 1 a 4).
  var MASCARAS = {
    1: { base: "#f6c1d0", franjas: ["#bfe3d0", "#fff1b8"], alto: 10, adorno: null },
    2: { base: "#a9b8d8", franjas: ["#ff7a30", "#f4efe6"], alto: 13, adorno: "flecos" },
    3: { base: "#f08a3c", franjas: ["#1d2a44", "#2a8a9a"], alto: 16, adorno: "plumas" },
    4: { base: "#ffd23f", franjas: ["#ff7a30", "#fff3b0"], alto: 18, adorno: "corona" },
  };

  function dibujarAvatar(ctx, nivel) {
    ctx.imageSmoothingEnabled = false;
    var p = pintor(ctx), m = MASCARAS[nivel] || MASCARAS[1];
    p.r(0, 0, 32, 32, "#141414");
    p.r(6, 25, 20, 7, "#cfc7b6"); p.r(4, 28, 24, 4, "#cfc7b6");
    var top = 24 - m.alto;
    p.r(9, top, 14, m.alto, m.base);
    p.r(10, top + 2, 12, 2, m.franjas[0]); p.r(10, top + 6, 12, 2, m.franjas[1]);
    p.r(15, top + 3, 2, m.alto - 3, "#141414"); p.r(12, top + m.alto - 3, 8, 2, "#141414");
    if (m.adorno === "flecos") for (var i = 0; i < 14; i += 2) p.r(9 + i, 24, 1, 3, "#6aa6d0");
    if (m.adorno === "plumas") { p.r(11, top - 4, 1, 4, "#f4efe6"); p.r(16, top - 6, 1, 6, "#f4efe6"); p.r(20, top - 4, 1, 4, "#f4efe6"); }
    if (m.adorno === "corona") { p.r(9, top - 3, 14, 2, "#ffd23f"); p.r(9, top - 5, 2, 2, "#ffd23f"); p.r(15, top - 6, 2, 3, "#ffd23f"); p.r(21, top - 5, 2, 2, "#ffd23f"); p.r(15, top - 1, 2, 1, "#ff3e7f"); }
  }

  raiz.CRescenas = {
    ANCHO: ANCHO, ALTO: ALTO, ETAPAS_INFO: ETAPAS_INFO,
    dibujarEscena: dibujarEscena, dibujarBloqueada: dibujarBloqueada, dibujarAvatar: dibujarAvatar,
  };
})(typeof window !== "undefined" ? window : globalThis);
