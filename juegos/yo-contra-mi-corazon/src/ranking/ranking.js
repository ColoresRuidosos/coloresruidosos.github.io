// F14: ranking con el Apps Script del sitio (modo «corazon»), o de prueba en el navegador.
export const MODO = 'corazon';
export const TOP = 20;
// Iguales a NOMBRES.corazon de docs/ranking/Code.gs (tests/ranking.test.js lo revisa).
// F14 v0.4: palabras de la carrera de José Madero, solo de datos verificados (CONTEXTO.md §5):
// discos (Carmesí, Noche, Alba, Psalmos, Giallo, Aurora, Sarajevo, Querido…), canciones (Lunes 28,
// Plural siendo singular, Maldita Rueda, Rey Ahogado, Noche de brujas, Fantasmas, Teoremas etc.),
// «Érase una Bestia» y los pierrots de Querido…. Nunca «Luciérnaga» (memorial).
export const SUSTANTIVOS = ['Migajero', 'Migajera', 'Payaso', 'Payasa', 'Pierrot', 'Fantasma', 'Rey', 'Reina', 'Plural', 'Teorema', 'Brujo', 'Bruja'];
export const COMPLEMENTOS = ['de Carmesí', 'de Noche', 'del Alba', 'de Psalmos', 'de Giallo', 'de Aurora', 'de Sarajevo', 'del Lunes 28', 'de la Rueda', 'de la Bestia', 'de Querido', 'Singular'];

const pick = (l, rng) => l[Math.floor(rng() * l.length)];
export function generarNombre(rng = Math.random, anterior = null) {
  let n;
  for (let k = 0; k < 20; k++) {
    n = `${pick(SUSTANTIVOS, rng)} ${pick(COMPLEMENTOS, rng)} #${1 + Math.floor(rng() * 99)}`;
    if (n !== anterior) return n;
  }
  return n;
}
// 3 opciones distintas para elegir (sin repetir las que ya se mostraron).
export function generarOpciones(rng = Math.random, n = 3, excluir = []) {
  const out = [];
  for (let k = 0; out.length < n && k < 200; k++) {
    const x = generarNombre(rng);
    if (!out.includes(x) && !excluir.includes(x)) out.push(x);
  }
  return out;
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
export const EJEMPLOS = [['Migajero de Carmesí #28', 38210, 182000], ['Pierrot de Querido #3', 30120, 223000], ['Plural Singular #7', 21480, 223000],
  ['Fantasma de Noche #17', 15900, 223000], ['Reina de Psalmos #19', 9300, 140000]];
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
