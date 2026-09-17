const test = require("node:test");
const assert = require("node:assert");
const { crearICS, escapar } = require("../assets/js/ics.js");

const AHORA = new Date(Date.UTC(2026, 8, 16, 12, 0));

test("evento con hora se convierte de hora de CDMX a UTC con duración de 3 horas", () => {
  const ics = crearICS([{ id: "foro-2026-10-01-show", titulo: "Show", fecha: "2026-10-01", hora: "21:30", recinto: "Foro", ciudad: "Pachuca" }], AHORA);
  assert.match(ics, /DTSTART:20261002T033000Z/);
  assert.match(ics, /DTEND:20261002T063000Z/);
  assert.match(ics, /LOCATION:Foro\\, Pachuca/);
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n") && ics.endsWith("END:VCALENDAR\r\n"));
});

test("evento sin hora es de día completo", () => {
  const ics = crearICS([{ id: "x", titulo: "Festival", fecha: "2026-12-31" }], AHORA);
  assert.match(ics, /DTSTART;VALUE=DATE:20261231/);
  assert.match(ics, /DTEND;VALUE=DATE:20270101/);
});

test("escapa caracteres especiales y dobla líneas largas", () => {
  assert.strictEqual(escapar("a,b;c\nd"), "a\\,b\\;c\\nd");
  const ics = crearICS([{ id: "x", titulo: "T".repeat(200), fecha: "2026-10-01" }], AHORA);
  ics.split("\r\n").forEach((l) => assert.ok(l.length <= 74));
});
