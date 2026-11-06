// F25/D31: sección Games (trivia + México vs. José Madero).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.join(__dirname, "..");
const leer = (p) => fs.readFileSync(path.join(raiz, p), "utf8");
const games = JSON.parse(leer("data/games.json"));

test("data/games.json: cada juego trae id, nombre, descripción, url relativa y fecha con zona", () => {
  assert.ok(Array.isArray(games) && games.length >= 2);
  const ids = new Set();
  for (const g of games) {
    for (const k of ["id", "nombre", "descripcion", "url", "desde"]) assert.equal(typeof g[k], "string", `${g.id}.${k}`);
    assert.ok(!ids.has(g.id), `id repetido ${g.id}`); ids.add(g.id);
    assert.match(g.url, /^[a-z0-9-]+(\/[a-z0-9-]+)*\/$/, `url relativa sin barra inicial: ${g.url}`);
    assert.match(g.desde, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2}|Z)$/, `desde: ${g.desde}`);
    assert.ok(!Number.isNaN(Date.parse(g.desde)));
    assert.ok(g.descripcion.length <= 220, `${g.id}: descripción corta`);
  }
});

test("la trivia sigue en /trivia/ y el juego de José Madero sale el viernes 6 nov 2026, 8:00 CDMX", () => {
  const trivia = games.find((g) => g.id === "trivia");
  assert.equal(trivia.url, "trivia/");
  const jmv = games.find((g) => g.id === "mexico-vs-jose-madero");
  assert.equal(jmv.url, "games/mexico-vs-jose-madero/");
  assert.equal(Date.parse(jmv.desde), Date.parse("2026-11-06T08:00:00-06:00"));
  assert.match(jmv.descripcion, /Carmesí/);
  assert.match(jmv.descripcion, /Noche/);
  assert.match(jmv.nombre + jmv.descripcion, /no oficial/i);
});

test("cada juego fuera de /trivia/ tiene su archivo en static/", () => {
  for (const g of games.filter((g) => g.id !== "trivia")) {
    const f = path.join(raiz, "static", g.url, "index.html");
    assert.ok(fs.existsSync(f), `falta ${f}`);
    assert.match(fs.readFileSync(f, "utf8").slice(0, 8000), /<canvas id="game"/);
  }
});

test("el menú dice Games (no Trivia) y queda activo en games y trivia", () => {
  const cab = leer("layouts/_partials/cabecera.html");
  assert.match(cab, /"games\/" \| relURL/);
  assert.match(cab, />Games</);
  assert.doesNotMatch(cab, />Trivia</);
  assert.match(cab, /in \(slice "games" "trivia"\) \$actual/);
});

test("la trivia tiene «◀ Games» y la sección Games tiene su plantilla con filtro de fecha", () => {
  assert.match(leer("layouts/trivia/section.html"), /"games\/" \| relURL[^]*◀ Games/);
  const sec = leer("layouts/games/section.html");
  assert.match(sec, /site\.Data\.games/);
  assert.match(sec, /now\.Unix/);
  assert.ok(fs.existsSync(path.join(raiz, "content/games/_index.md")));
});
