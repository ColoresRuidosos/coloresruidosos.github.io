// F13 temporada y F14 ranking (cliente). Las listas de nombres deben coincidir con docs/ranking/Code.gs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { SUSTANTIVOS, COMPLEMENTOS, generarNombre, nombreValido, armarEnvio, ordenar, createRanking, createDemoRanking, MODO } from '../src/ranking/ranking.js';
import { temporada, CIERRE } from '../src/ranking/temporada.js';
import { createRng } from '../src/core/rng.js';
import { RANKING_URL } from '../src/data/config.js';

const GS = (() => { const ctx = vm.createContext({}); vm.runInContext(readFileSync(new URL('../../../docs/ranking/Code.gs', import.meta.url), 'utf8'), ctx); return ctx; })();

test('las listas de nombres del juego son las del Apps Script (modo corazon)', () => {
  assert.equal(MODO, 'corazon');
  assert.deepEqual([...GS.NOMBRES.corazon.sustantivos], SUSTANTIVOS);
  assert.deepEqual([...GS.NOMBRES.corazon.complementos], COMPLEMENTOS);
});

test('nombres generados: forma «Sustantivo complemento #n», válidos en los dos lados y caben en pantalla', () => {
  const rng = createRng(3);
  let prev = null;
  for (let i = 0; i < 300; i++) {
    const n = generarNombre(rng, prev);
    assert.notEqual(n, prev); prev = n;
    assert.ok(nombreValido(n), n); assert.ok(GS.nombreValido(n, 'corazon'), n);
    assert.ok(n.length <= 26, `${n} cabe en una línea (26 caracteres)`);
  }
  assert.ok(!nombreValido('Pepe #1')); assert.ok(!GS.nombreValido('Pepe #1', 'corazon'));
});

test('el envío pasa la validación del Apps Script; uno imposible no', () => {
  const ok = armarEnvio('Juglar del Latido #42', 41234, 171234.4, 'abcdefgh12345678');
  assert.deepEqual(ok, { modo: 'corazon', nombre: 'Juglar del Latido #42', puntos: 41234, duracionMs: 171234, dispositivo: 'abcdefgh12345678' });
  assert.equal(GS.validarEnvio(ok), '');
  assert.equal(GS.validarEnvio({ ...ok, puntos: 999999 }), 'puntos');
  assert.equal(GS.validarEnvio({ ...ok, duracionMs: 5000 }), 'duracion');
});

test('el Apps Script rechaza envíos de corazon después del cierre', () => {
  assert.equal(GS.vigente('corazon', new Date('2026-11-12T12:00:00Z')), true);
  assert.equal(GS.vigente('corazon', new Date('2026-11-16T06:00:01Z')), false);
  assert.equal(GS.vigente('trivia', new Date('2030-01-01T00:00:00Z')), true);
});

test('orden: más puntos; empate, la más corta; cada nombre una vez', () => {
  const f = (nombre, puntos, duracionMs, fecha = '2026-11-10T00:00:00Z') => ({ nombre, puntos, duracionMs, fecha });
  const o = ordenar([f('A', 10, 200), f('B', 20, 300), f('A', 30, 100), f('C', 20, 250)], 20);
  assert.deepEqual(o.map((x) => x.nombre + x.puntos), ['A30', 'C20', 'B20']);
});

test('cliente: lee el top y publica; si el servidor aún no tiene el modo, avisa sin tronar', async () => {
  const calls = [];
  const ok = createRanking({ url: 'https://x/exec', fetchFn: async (u, o) => { calls.push([u, o?.method || 'GET']); return { json: async () => (o ? { ok: true } : { semana: [{ nombre: 'A', puntos: 1, duracionMs: 1 }], historico: [] }) }; } });
  assert.deepEqual((await ok.top()).lista.map((x) => x.nombre), ['A']);
  assert.deepEqual(await ok.publicar({ modo: 'corazon' }), { ok: true });
  assert.deepEqual(calls.map((c) => c[1]), ['GET', 'POST']);
  assert.match(calls[0][0], /modo=corazon/);
  const viejo = createRanking({ url: 'https://x/exec', fetchFn: async () => ({ json: async () => ({ error: 'modo' }) }) });
  assert.equal((await viejo.top()).error, 'no-listo');
  const caido = createRanking({ url: 'https://x/exec', fetchFn: async () => { throw new Error('red'); } });
  assert.equal((await caido.top()).error, 'red');
  assert.equal((await caido.publicar({})).error, 'red');
  assert.equal(createRanking({ url: '' }), null);
});

test('ranking de prueba: guarda en el navegador, ordena y se marca como prueba', async () => {
  const d = {}; const st = { getItem: (k) => d[k] ?? null, setItem: (k, v) => { d[k] = v; } };
  const r = createDemoRanking(st, () => new Date('2026-11-10T00:00:00Z'));
  assert.equal(r.prueba, true);
  await r.publicar(armarEnvio('Mimo de la Carpa #7', 500, 60000, 'abcdefgh12345678'));
  await r.publicar(armarEnvio('Mimo de la Carpa #7', 900, 60000, 'abcdefgh12345678'));
  const top = await r.top();
  const mio = top.lista.filter((x) => x.nombre === 'Mimo de la Carpa #7');
  assert.equal(mio.length, 1); assert.equal(mio[0].puntos, 900, 'una vez, con su mejor puntaje');
  assert.deepEqual(top.lista.map((x) => x.puntos), [...top.lista.map((x) => x.puntos)].sort((a, b) => b - a));
  assert.ok(top.lista.length >= 2, 'trae nombres de ejemplo para que no se vea vacío');
  assert.equal(new Set(top.lista.map((x) => x.nombre)).size, top.lista.length);
});

test('F13 temporada: abierta del 9 al 15 de nov (CDMX), cuenta los días y cierra', () => {
  assert.equal(CIERRE, '2026-11-15T23:59:59-06:00');
  const t = (iso) => temporada(new Date(iso));
  assert.deepEqual(t('2026-11-09T10:00:00-06:00'), { abierta: true, dias: 7, aviso: 'QUEDAN 7 DÍAS' });
  assert.deepEqual(t('2026-11-14T22:00:00-06:00'), { abierta: true, dias: 2, aviso: 'QUEDAN 2 DÍAS' });
  assert.deepEqual(t('2026-11-15T09:00:00-06:00'), { abierta: true, dias: 1, aviso: '¡ÚLTIMO DÍA!' });
  assert.deepEqual(t('2026-11-16T00:00:00-06:00'), { abierta: false, dias: 0, aviso: 'ESTE JUEGO YA TERMINÓ' });
});

test('la URL del ranking es la misma que usa el sitio (hugo.toml)', () => {
  const toml = readFileSync(new URL('../../../hugo.toml', import.meta.url), 'utf8');
  assert.equal(RANKING_URL, /trivia_ranking_url = "([^"]+)"/.exec(toml)[1]);
});
