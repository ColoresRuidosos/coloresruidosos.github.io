// F14: ranking con el Apps Script del sitio (modo «corazon»), o de prueba en el navegador.
export const MODO = 'corazon';
export const TOP = 20;
// Iguales a NOMBRES.corazon de docs/ranking/Code.gs (tests/ranking.test.js lo revisa).
export const SUSTANTIVOS = ['Payaso', 'Payasa', 'Mimo', 'Juglar', 'Arlequín', 'Pierrot',
  'Acróbata', 'Domador', 'Faquir', 'Bufón', 'Zancudo', 'Mago'];
export const COMPLEMENTOS = ['del Latido', 'de la Aorta', 'del Bate', 'de la Carpa', 'del Confeti', 'del Telón',
  'Sin Pulso', 'de la Feria', 'del Circo', 'de Medianoche', 'del Arrítmico', 'de la Pista'];

const pick = (l, rng) => l[Math.floor(rng() * l.length)];
export function generarNombre(rng = Math.random, anterior = null) {
  let n;
  for (let k = 0; k < 20; k++) {
    n = `${pick(SUSTANTIVOS, rng)} ${pick(COMPLEMENTOS, rng)} #${1 + Math.floor(rng() * 99)}`;
    if (n !== anterior) return n;
  }
  return n;
}
export function nombreValido(nombre) {
  const m = /^(.+) #([1-9][0-9]?)$/.exec(nombre || '');
  return !!m && SUSTANTIVOS.some((s) => COMPLEMENTOS.some((c) => m[1] === `${s} ${c}`));
}
export function nuevoDispositivo(rng = Math.random) {
  const c = 'abcdefghijklmnopqrstuvwxyz0123456789'; let s = '';
  for (let k = 0; k < 16; k++) s += c[Math.floor(rng() * c.length)];
  return s;
}
export const armarEnvio = (nombre, puntos, duracionMs, dispositivo) => ({ modo: MODO, nombre, puntos, duracionMs: Math.round(duracionMs), dispositivo });

export function ordenar(filas, limite = TOP) {
  const vistos = new Set();
  return filas.slice().sort((a, b) => (b.puntos - a.puntos) || (a.duracionMs - b.duracionMs) || (new Date(a.fecha) - new Date(b.fecha)))
    .filter((f) => (vistos.has(f.nombre) ? false : vistos.add(f.nombre))).slice(0, limite);
}

// Servidor real (Apps Script). Errores: 'no-listo' (el script aún no tiene el modo), 'red', o el que mande el servidor.
export function createRanking({ url, fetchFn = globalThis.fetch?.bind(globalThis) }) {
  if (!url) return null;
  return {
    prueba: false,
    async top() {
      try {
        const r = await (await fetchFn(`${url}${url.includes('?') ? '&' : '?'}modo=${MODO}`)).json();
        if (r.error) return { error: r.error === 'modo' ? 'no-listo' : r.error, lista: [] };
        return { lista: r.semana || [] };
      } catch { return { error: 'red', lista: [] }; }
    },
    async publicar(envio) {
      try {
        const r = await (await fetchFn(url, { method: 'POST', body: JSON.stringify(envio) })).json();
        if (r.ok) return { ok: true };
        return { ok: false, error: r.error === 'modo' ? 'no-listo' : r.error || 'servidor' };
      } catch { return { ok: false, error: 'red' }; }
    },
  };
}

// Ranking de prueba (versión de un solo HTML): vive en este navegador, con nombres de ejemplo.
const EJEMPLOS = [['Pierrot de Medianoche #12', 38210, 182000], ['Faquir del Bate #3', 30120, 223000], ['Bufón Sin Pulso #77', 21480, 223000],
  ['Domador de la Aorta #40', 15900, 223000], ['Mimo del Confeti #8', 9300, 140000]];
export function createDemoRanking(storage, now = () => new Date()) {
  const KEY = 'ycmc-ranking-prueba';
  const leer = () => { try { return JSON.parse(storage?.getItem(KEY) || '[]'); } catch { return []; } };
  return {
    prueba: true,
    async top() {
      const base = EJEMPLOS.map(([nombre, puntos, duracionMs]) => ({ nombre, puntos, duracionMs, fecha: '2026-11-09T12:00:00Z' }));
      return { lista: ordenar([...leer(), ...base]).map(({ nombre, puntos, duracionMs }) => ({ nombre, puntos, duracionMs })) };
    },
    async publicar(envio) {
      const filas = leer(); filas.push({ ...envio, fecha: now().toISOString() });
      try { storage?.setItem(KEY, JSON.stringify(filas.slice(-200))); } catch { /* sin espacio */ }
      return { ok: true };
    },
  };
}
