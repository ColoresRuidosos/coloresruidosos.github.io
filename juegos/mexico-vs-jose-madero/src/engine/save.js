// Guardado del progreso (spec §3.0f B). El almacenamiento se inyecta: localStorage en el navegador, memoria en los tests.
// Si no hay almacenamiento o los datos están dañados, el juego sigue en memoria sin romperse.
export const SAVE_KEY = 'jmv-save';
export const SCHEMA = 1;

export const defaults = () => ({
  v: SCHEMA,
  options: { flashes: true, shake: true, assist: false, music: true, notas: true }, // v9.4: notas = datos, pensamientos y avisos en pantalla
  worlds: {}, // { [mundo]: { cleared: [ids], best: { [nivel]: { time, score, piezas, total } } } }
  unlocked: ['clasico'],
  costume: 'auto',
  record: 0,
  seenPrologue: false, // v8: el prólogo solo se ve la primera vez
  seenItems: [], // v9.1: objetos ya explicados la primera vez que se recogen
});

const safe = (fn, fallback) => { try { return fn(); } catch { return fallback; } };

function load(storage) {
  const base = defaults();
  const raw = storage ? safe(() => storage.getItem(SAVE_KEY), null) : null;
  const old = storage ? Number(safe(() => storage.getItem('jmv-record'), 0)) || 0 : 0;
  let d = null;
  if (raw) d = safe(() => JSON.parse(raw), null);
  if (!d || typeof d !== 'object' || d.v !== SCHEMA) return { ...base, record: old };
  return {
    v: SCHEMA,
    options: { ...base.options, ...(d.options || {}) },
    worlds: d.worlds && typeof d.worlds === 'object' ? d.worlds : {},
    unlocked: Array.isArray(d.unlocked) && d.unlocked.length ? d.unlocked : base.unlocked,
    costume: typeof d.costume === 'string' ? d.costume : 'auto',
    record: Math.max(Number(d.record) || 0, old),
    seenPrologue: !!d.seenPrologue,
    seenItems: Array.isArray(d.seenItems) ? d.seenItems : [],
  };
}

export function createSave(storage) {
  const s = {
    data: load(storage),
    commit() { if (storage) safe(() => storage.setItem(SAVE_KEY, JSON.stringify(s.data)), null); },
    reset() { s.data = defaults(); s.commit(); },
  };
  return s;
}
