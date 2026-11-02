const test = require("node:test");
const assert = require("node:assert");
const datos = require("../data/in_memoriam.json");
const M = require("../assets/js/in-memoriam/logica.js");

const HOY = new Date("2026-11-02T18:00:00Z");

function entrada(extra) {
  return Object.assign({
    id: "x", nombre: "X", pais: "MX", region: "mx",
    nacimiento: "1950-12-25", fallecimiento: "1985-09-19",
    proyectos: ["Banda"], semblanza: "Una línea propia.",
    fuentes: ["https://ejemplo.com/nota"], estado: "verificada",
  }, extra);
}

// ---------- Contrato de data/in_memoriam.json ----------

test("cada artista del JSON cumple el contrato", () => {
  assert.ok(Array.isArray(datos.artistas) && datos.artistas.length > 0);
  datos.artistas.forEach((a) => {
    assert.deepStrictEqual(M.validarArtista(a, HOY), [], a.id);
  });
});

test("los ids no se repiten", () => {
  const ids = datos.artistas.map((a) => a.id);
  assert.strictEqual(new Set(ids).size, ids.length);
});

test("hay artistas verificados de las tres regiones", () => {
  const publicables = M.publicables(datos);
  M.REGIONES.forEach((r) => {
    assert.ok(publicables.some((a) => a.region === r), r);
  });
});

// ---------- validarArtista ----------

test("una entrada completa no tiene errores", () => {
  assert.deepStrictEqual(M.validarArtista(entrada(), HOY), []);
});

test("nacimiento y nombre_completo son opcionales", () => {
  const sinNacimiento = entrada();
  delete sinNacimiento.nacimiento;
  assert.deepStrictEqual(M.validarArtista(sinNacimiento, HOY), []);
  assert.deepStrictEqual(M.validarArtista(entrada({ nombre_completo: "Rodrigo Eduardo González Guzmán" }), HOY), []);
});

test("faltan campos obligatorios", () => {
  ["id", "nombre", "pais", "region", "fallecimiento", "proyectos", "semblanza", "fuentes", "estado"].forEach((campo) => {
    const a = entrada();
    delete a[campo];
    assert.ok(M.validarArtista(a, HOY).length > 0, campo);
  });
});

test("el id es un slug", () => {
  assert.ok(M.validarArtista(entrada({ id: "Gustavo Cerati" }), HOY).length > 0);
  assert.deepStrictEqual(M.validarArtista(entrada({ id: "gustavo-cerati" }), HOY), []);
});

test("fechas: AAAA, AAAA-MM o AAAA-MM-DD válidas", () => {
  ["1980", "1980-01", "1980-01-03"].forEach((f) => {
    assert.deepStrictEqual(M.validarArtista(entrada({ nacimiento: "1950", fallecimiento: f }), HOY), [], f);
  });
  ["03/01/1980", "1980-13", "1980-02-30", "80", "", "1980-1-3"].forEach((f) => {
    assert.ok(M.validarArtista(entrada({ fallecimiento: f }), HOY).length > 0, f);
  });
});

test("el fallecimiento no puede ser futuro", () => {
  assert.ok(M.validarArtista(entrada({ fallecimiento: "2026-11-03" }), HOY).length > 0);
  assert.ok(M.validarArtista(entrada({ fallecimiento: "2027" }), HOY).length > 0);
  assert.deepStrictEqual(M.validarArtista(entrada({ fallecimiento: "2026-11-02" }), HOY), []);
  assert.deepStrictEqual(M.validarArtista(entrada({ fallecimiento: "2026" }), HOY), []);
});

test("el nacimiento va antes del fallecimiento", () => {
  assert.ok(M.validarArtista(entrada({ nacimiento: "1990-01-01", fallecimiento: "1985-09-19" }), HOY).length > 0);
  assert.ok(M.validarArtista(entrada({ nacimiento: "1985-09-19", fallecimiento: "1985-09-19" }), HOY).length > 0);
});

test("la región tiene que coincidir con el país", () => {
  assert.ok(M.validarArtista(entrada({ pais: "AR", region: "mx" }), HOY).length > 0);
  assert.ok(M.validarArtista(entrada({ pais: "ES", region: "latam" }), HOY).length > 0);
  assert.ok(M.validarArtista(entrada({ pais: "BR", region: "latam" }), HOY).length > 0, "Brasil fuera hasta decidir A1");
  assert.deepStrictEqual(M.validarArtista(entrada({ pais: "AR", region: "latam" }), HOY), []);
  assert.deepStrictEqual(M.validarArtista(entrada({ pais: "ES", region: "es" }), HOY), []);
});

test("fuentes: al menos una y todas https", () => {
  assert.ok(M.validarArtista(entrada({ fuentes: [] }), HOY).length > 0);
  assert.ok(M.validarArtista(entrada({ fuentes: ["http://inseguro.com/x"] }), HOY).length > 0);
  assert.ok(M.validarArtista(entrada({ fuentes: ["no es url"] }), HOY).length > 0);
});

test("proyectos: lista no vacía de textos", () => {
  assert.ok(M.validarArtista(entrada({ proyectos: [] }), HOY).length > 0);
  assert.ok(M.validarArtista(entrada({ proyectos: "Banda" }), HOY).length > 0);
  assert.ok(M.validarArtista(entrada({ proyectos: [""] }), HOY).length > 0);
});

test("estado: verificada o propuesta", () => {
  assert.deepStrictEqual(M.validarArtista(entrada({ estado: "propuesta" }), HOY), []);
  assert.ok(M.validarArtista(entrada({ estado: "publicada" }), HOY).length > 0);
});

test("la semblanza es corta y no habla de la causa de muerte", () => {
  assert.ok(M.validarArtista(entrada({ semblanza: "a".repeat(161) }), HOY).length > 0);
  assert.deepStrictEqual(M.validarArtista(entrada({ semblanza: "a".repeat(160) }), HOY), []);
  ["Murió de cáncer.", "Tras un accidente de tráfico.", "Sobredosis.", "Fue asesinado.", "Se suicidó", "Cancer", "complicaciones del VIH"].forEach((s) => {
    assert.ok(M.validarArtista(entrada({ semblanza: s }), HOY).length > 0, s);
  });
});

// ---------- Publicar, ordenar, agrupar, filtrar ----------

test("solo se publican las verificadas", () => {
  const lista = { artistas: [entrada({ id: "a" }), entrada({ id: "b", estado: "propuesta" })] };
  assert.deepStrictEqual(M.publicables(lista).map((a) => a.id), ["a"]);
});

test("ordena de la muerte más reciente a la más antigua, con fechas parciales", () => {
  const lista = [
    entrada({ id: "a", fallecimiento: "1980-01" }),
    entrada({ id: "b", fallecimiento: "2014-09-04" }),
    entrada({ id: "c", fallecimiento: "1980-01-03" }),
    entrada({ id: "d", fallecimiento: "2025" }),
    entrada({ id: "e", fallecimiento: "2025-12-10" }),
  ];
  const orden = M.ordenar(lista).map((a) => a.id);
  assert.deepStrictEqual(orden, ["e", "d", "b", "c", "a"]);
  assert.strictEqual(lista[0].id, "a", "no muta la lista original");
});

test("agrupa por año de fallecimiento, en orden", () => {
  const grupos = M.agruparPorAnio([
    entrada({ id: "a", fallecimiento: "2014-09-04" }),
    entrada({ id: "b", fallecimiento: "2025-12-10" }),
    entrada({ id: "c", fallecimiento: "2025-05" }),
  ]);
  assert.deepStrictEqual(grupos.map((g) => g.anio), ["2025", "2014"]);
  assert.deepStrictEqual(grupos[0].artistas.map((a) => a.id), ["b", "c"]);
});

test("este año: solo quienes murieron en el año de la fecha dada", () => {
  const lista = [
    entrada({ id: "a", fallecimiento: "2026-06-05" }),
    entrada({ id: "b", fallecimiento: "2025-12-10" }),
    entrada({ id: "c", fallecimiento: "2026" }),
  ];
  assert.deepStrictEqual(M.esteAnio(lista, HOY).map((a) => a.id).sort(), ["a", "c"]);
  assert.deepStrictEqual(M.esteAnio(lista, new Date("2027-01-01T12:00:00Z")), []);
});

test("filtra por región; 'todas' devuelve todo", () => {
  const lista = [entrada({ id: "a" }), entrada({ id: "b", pais: "ES", region: "es" }), entrada({ id: "c", pais: "AR", region: "latam" })];
  assert.deepStrictEqual(M.filtrar(lista, "es").map((a) => a.id), ["b"]);
  assert.deepStrictEqual(M.filtrar(lista, "todas").map((a) => a.id), ["a", "b", "c"]);
  assert.deepStrictEqual(M.filtrar(lista, "xx"), []);
});

test("años vividos solo con fechas completas", () => {
  assert.strictEqual(M.edad(entrada({ nacimiento: "1950-12-25", fallecimiento: "1985-09-19" })), 34);
  assert.strictEqual(M.edad(entrada({ nacimiento: "1959-08-11", fallecimiento: "2014-09-04" })), 55);
  assert.strictEqual(M.edad(entrada({ nacimiento: "1950", fallecimiento: "1985-09-19" })), null);
  const sin = entrada();
  delete sin.nacimiento;
  assert.strictEqual(M.edad(sin), null);
});

test("texto de años: 'nacimiento – fallecimiento' o '† fallecimiento'", () => {
  assert.strictEqual(M.textoAnios(entrada({ nacimiento: "1959-08-11", fallecimiento: "2014-09-04" })), "1959 – 2014");
  const sin = entrada({ fallecimiento: "2025-05" });
  delete sin.nacimiento;
  assert.strictEqual(M.textoAnios(sin), "† 2025");
});
