// Huecos J1–J4 (F9, plan §4): por orden de llegada; el mismo músico repetido sale con otra paleta.
import { MAX_PLAYERS } from '../sim/constants.js';
import { HERO_IDS } from '../sim/moves.js';

export const SLOT_COLORS = ['#ff4d4d', '#3fa9ff', '#ffd23f', '#3fdc7a'];   // J1 rojo · J2 azul · J3 amarillo · J4 verde

export function createSlots(max = MAX_PLAYERS) {
  const slots = Array(max).fill(null);
  const idx = (key) => slots.findIndex((s) => s && s.key === key);

  function paletteFor(i, hero) {
    const used = new Set(slots.filter((s, j) => s && j !== i && s.hero === hero).map((s) => s.palette));
    let p = 0; while (used.has(p)) p++;
    return p;
  }

  return {
    join(key, kind, extra = {}) {
      const have = idx(key);
      if (have >= 0) return have;
      const i = slots.indexOf(null);
      if (i < 0) return null;
      const hero = extra.hero || HERO_IDS[i % HERO_IDS.length];
      slots[i] = { key, kind, hero, palette: 0, ready: false, ...extra };
      slots[i].palette = paletteFor(i, slots[i].hero);
      return i;
    },
    leave(key) { const i = idx(key); if (i >= 0) slots[i] = null; return i; },
    indexOf: idx,
    get: (i) => slots[i],
    setHero(i, hero) {
      if (!slots[i] || !HERO_IDS.includes(hero)) return false;
      slots[i].hero = hero; slots[i].palette = paletteFor(i, hero);
      return true;
    },
    cycleHero(i, dir) {
      const s = slots[i]; if (!s) return;
      const k = (HERO_IDS.indexOf(s.hero) + dir + HERO_IDS.length) % HERO_IDS.length;
      this.setHero(i, HERO_IDS[k]);
    },
    setReady(i, ready) { if (slots[i]) slots[i].ready = ready; },
    list: () => slots.map((s, i) => (s ? { slot: i, ...s } : null)),
    joined: () => slots.map((s, i) => (s ? { slot: i, ...s } : null)).filter(Boolean),
    get full() { return slots.every(Boolean); },
  };
}
