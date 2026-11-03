/**
 * Ranking de la Trivia Love of Lesbian (F18/D24) — Apps Script del equipo de Colores Ruidosos.
 *
 * Se pega en el editor de Apps Script de un Google Sheet y se publica como aplicación web.
 * Pasos: docs/ranking/README.md. Las funciones puras (sin servicios de Google) se prueban en
 * tests-js/ranking.test.js; las listas de palabras deben ser iguales a las de
 * assets/js/trivia/ranking.js.
 *
 * Pestaña "Puntajes": fecha | semana | modo | nombre | puntos | duracionMs | dispositivo
 * Para moderar, borra la fila (el ranking se actualiza en menos de un minuto).
 */

var HOJA = "Puntajes";
var ENCABEZADOS = ["fecha", "semana", "modo", "nombre", "puntos", "duracionMs", "dispositivo"];
var MODOS = { trivia: { max: 30 } };
var TOP = 20;
var LIMITE_POR_HORA = 10;
var DURACION_MIN_MS = 15000;
var DURACION_MAX_MS = 3600000;
var OFFSET_CDMX_MS = 6 * 3600 * 1000;

var SUSTANTIVOS = ["Psiconauta", "Poeta", "Cometa", "Satélite", "Planeador", "Equilibrista",
  "Astronauta", "Antena", "Ectoplasta", "Pizzigato", "Fan", "Planeta"];
var COMPLEMENTOS = ["del Ártico", "de Halley", "del Volcán", "de Nieve", "de Bruma", "del Himalaya",
  "de Ascensor", "de Emergencias", "del Japón", "de Sed", "del Mañana", "de la Noche Eterna"];

// ---------- Funciones puras ----------

function nombreValido(nombre) {
  if (typeof nombre !== "string") return false;
  var m = /^(.+) #([1-9][0-9]?)$/.exec(nombre);
  if (!m) return false;
  return SUSTANTIVOS.some(function (s) {
    return COMPLEMENTOS.some(function (c) { return m[1] === s + " " + c; });
  });
}

function semanaCDMX(fecha) {
  var d = new Date(fecha.getTime() - OFFSET_CDMX_MS);
  var dia = (d.getUTCDay() + 6) % 7;
  var jueves = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dia + 3));
  var anio = jueves.getUTCFullYear();
  var semana = 1 + Math.floor((jueves - Date.UTC(anio, 0, 1)) / (7 * 24 * 3600 * 1000));
  return anio + "-W" + ("0" + semana).slice(-2);
}

// Devuelve "" si el envío es válido, o el motivo del rechazo.
function validarEnvio(d) {
  if (!d || typeof d !== "object") return "formato";
  var modo = MODOS[d.modo];
  if (!modo) return "modo";
  if (typeof d.puntos !== "number" || Math.floor(d.puntos) !== d.puntos || d.puntos < 0 || d.puntos > modo.max) return "puntos";
  if (typeof d.duracionMs !== "number" || d.duracionMs < DURACION_MIN_MS || d.duracionMs > DURACION_MAX_MS) return "duracion";
  if (!nombreValido(d.nombre)) return "nombre";
  if (typeof d.dispositivo !== "string" || !/^[a-z0-9]{8,32}$/.test(d.dispositivo)) return "dispositivo";
  return "";
}

function ordenar(filas, limite) {
  var vistos = {};
  return filas.slice().sort(function (a, b) {
    return (b.puntos - a.puntos) || (a.duracionMs - b.duracionMs) ||
      (new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }).filter(function (f) {
    if (vistos[f.nombre]) return false;
    vistos[f.nombre] = true;
    return true;
  }).slice(0, limite);
}

function tops(filas, modo, ahora) {
  var delModo = filas.filter(function (f) { return f.modo === modo; });
  var semana = semanaCDMX(ahora);
  var publica = function (f) { return { nombre: f.nombre, puntos: f.puntos, duracionMs: f.duracionMs }; };
  return {
    semana: ordenar(delModo.filter(function (f) { return f.semana === semana; }), TOP).map(publica),
    historico: ordenar(delModo, TOP).map(publica),
  };
}

// ---------- Aplicación web ----------

function doGet(e) {
  var modo = (e && e.parameter && e.parameter.modo) || "trivia";
  if (!MODOS[modo]) return responder({ error: "modo" });
  var cache = CacheService.getScriptCache();
  var guardado = cache.get("top-" + modo);
  if (guardado) return texto(guardado);
  var res = tops(leerFilas(), modo, new Date());
  res.semanaActual = semanaCDMX(new Date());
  var json = JSON.stringify(res);
  cache.put("top-" + modo, json, 60);
  return texto(json);
}

function doPost(e) {
  var datos;
  try { datos = JSON.parse(e.postData.contents); } catch (err) { return responder({ ok: false, error: "formato" }); }
  var error = validarEnvio(datos);
  if (error) return responder({ ok: false, error: error });
  var cache = CacheService.getScriptCache();
  var clave = "envios-" + datos.dispositivo;
  var enviados = Number(cache.get(clave) || 0);
  if (enviados >= LIMITE_POR_HORA) return responder({ ok: false, error: "limite" });
  var ahora = new Date();
  var lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    hoja().appendRow([ahora.toISOString(), semanaCDMX(ahora), datos.modo, datos.nombre, datos.puntos, datos.duracionMs, datos.dispositivo]);
  } finally {
    lock.releaseLock();
  }
  cache.put(clave, String(enviados + 1), 3600);
  cache.remove("top-" + datos.modo);
  return responder({ ok: true });
}

function hoja() {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var h = libro.getSheetByName(HOJA);
  if (h) return h;
  // Sin pestaña "Puntajes": adopta la primera si está vacía o ya trae los encabezados; si no, crea una.
  var primera = libro.getSheets()[0];
  var fila1 = primera.getLastRow() ? primera.getRange(1, 1, 1, ENCABEZADOS.length).getValues()[0].map(String) : [];
  if (!fila1.length || fila1.join() === ENCABEZADOS.join()) {
    h = primera.setName(HOJA);
  } else {
    h = libro.insertSheet(HOJA);
  }
  if (!h.getLastRow()) h.appendRow(ENCABEZADOS);
  h.getRange("A:B").setNumberFormat("@"); // fecha y semana como texto
  return h;
}

function leerFilas() {
  var valores = hoja().getDataRange().getValues();
  return valores.slice(1).filter(function (v) { return v[3]; }).map(function (v) {
    var fecha = v[0] instanceof Date ? v[0].toISOString() : String(v[0]);
    return { fecha: fecha, semana: String(v[1]), modo: String(v[2]), nombre: String(v[3]), puntos: Number(v[4]), duracionMs: Number(v[5]) };
  });
}

function responder(obj) { return texto(JSON.stringify(obj)); }

function texto(json) {
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
