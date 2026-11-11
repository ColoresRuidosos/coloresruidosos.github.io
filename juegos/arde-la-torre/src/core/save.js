// Opciones guardadas en localStorage (F13). Sin cookies ni analítica (NFR privacidad).
export const KEY = 'arde-la-torre:opciones';
export const DEFAULTS = Object.freeze({ volume: 0.7, shake: true, assisted: false, flashes: true });

export function loadOptions(storage = globalThis.localStorage) {
  try {
    const raw = storage && storage.getItem(KEY);
    const o = raw ? JSON.parse(raw) : {};
    return {
      volume: Number.isFinite(o.volume) ? Math.min(1, Math.max(0, o.volume)) : DEFAULTS.volume,
      shake: typeof o.shake === 'boolean' ? o.shake : DEFAULTS.shake,
      assisted: typeof o.assisted === 'boolean' ? o.assisted : DEFAULTS.assisted,
      flashes: typeof o.flashes === 'boolean' ? o.flashes : DEFAULTS.flashes,
    };
  } catch { return { ...DEFAULTS }; }
}

export function saveOptions(o, storage = globalThis.localStorage) {
  try { storage && storage.setItem(KEY, JSON.stringify(o)); return true; } catch { return false; }
}
