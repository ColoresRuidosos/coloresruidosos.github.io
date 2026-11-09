// F11 / P1: opciones y récord en localStorage («ycmc-save», esquema v1).
const KEY = 'ycmc-save';
export const DEFAULTS = Object.freeze({ v: 1, opts: { sinDestellos: false, asistido: false, vibracion: true, desfase: 0 }, seenHowTo: false, best: { score: 0, rank: '' } });
const clone = () => JSON.parse(JSON.stringify(DEFAULTS));

export function loadSave(storage) {
  try {
    const raw = storage?.getItem(KEY); if (!raw) return clone();
    const s = JSON.parse(raw); if (s?.v !== 1) return clone();
    const d = clone();
    return { ...d, ...s, opts: { ...d.opts, ...s.opts }, best: { ...d.best, ...s.best } };
  } catch { return clone(); }
}
export function writeSave(storage, s) { try { storage?.setItem(KEY, JSON.stringify(s)); } catch { /* modo privado */ } }
export function recordResult(s, score, rank) {
  if (score <= s.best.score) return false;
  s.best = { score, rank }; return true;
}
