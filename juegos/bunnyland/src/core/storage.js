// localStorage sin romper si está bloqueado (modo privado). Sin cookies ni analítica (NFR Privacidad).
const P = 'bunnyland.';
export const load = (k, def) => { try { const v = localStorage.getItem(P + k); return v === null ? def : JSON.parse(v); } catch { return def; } };
export const save = (k, v) => { try { localStorage.setItem(P + k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } };
