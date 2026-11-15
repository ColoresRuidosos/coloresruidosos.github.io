// Concierto final (F17): lógica de ritmo pura. El tiempo es el de la canción, en milisegundos
// (lo da el reloj de Web Audio en main.js), así las notas no se desfasan aunque el juego vaya a tirones.
export const PERFECT_MS = 60;
export const GOOD_MS = 120;
const POINTS = { perfect: 100, good: 50 };
const CROWD = { perfect: 0.03, good: 0.02, miss: -0.04 };

export const multiplier = (combo) => (combo >= 30 ? 4 : combo >= 20 ? 3 : combo >= 10 ? 2 : 1);

export function createConcert({ notes, slots, durationMs }) {
  const players = {};
  for (const s of slots) {
    players[s] = { slot: s, score: 0, combo: 0, maxCombo: 0, perfect: 0, good: 0, miss: 0, accuracy: 0,
      done: new Uint8Array(notes.length), next: 0, last: null };
  }
  return { notes, durationMs, players, crowd: 0.5, done: false, events: [] };
}

function settle(p) {
  const n = p.perfect + p.good + p.miss;
  p.accuracy = n ? (p.perfect + p.good * 0.5) / n : 0;
}

function bump(c, kind) { c.crowd = Math.min(1, Math.max(0, c.crowd + CROWD[kind])); }

// Pulsación de un carril. Devuelve 'perfect', 'good' o null (sin nota cerca: no penaliza).
export function pressLane(c, slot, lane, ms) {
  const p = c.players[slot];
  if (!p || c.done) return null;
  let best = -1, bestD = GOOD_MS + 1;
  for (let i = p.next; i < c.notes.length; i++) {
    const [t, l] = c.notes[i];
    if (t - ms > GOOD_MS) break;
    if (l !== lane || p.done[i]) continue;
    const d = Math.abs(t - ms);
    if (d < bestD) { best = i; bestD = d; }
  }
  if (best < 0) return null;
  const kind = bestD <= PERFECT_MS ? 'perfect' : 'good';
  p.done[best] = 1; p[kind]++;
  p.combo++; p.maxCombo = Math.max(p.maxCombo, p.combo);
  p.score += POINTS[kind] * multiplier(p.combo);
  p.last = { kind, ms, lane };
  bump(c, kind); settle(p);
  c.events.push({ type: kind, slot, lane, ms });
  return kind;
}

// Avanza el reloj: las notas que ya pasaron sin tocar son fallos. Al llegar al final, `done`.
export function stepConcert(c, ms) {
  for (const p of Object.values(c.players)) {
    while (p.next < c.notes.length && c.notes[p.next][0] < ms - GOOD_MS) {
      if (!p.done[p.next]) {
        p.done[p.next] = 1; p.miss++; p.combo = 0; p.last = { kind: 'miss', ms, lane: c.notes[p.next][1] };
        bump(c, 'miss'); c.events.push({ type: 'miss', slot: p.slot, lane: c.notes[p.next][1], ms });
      }
      p.next++;
    }
    settle(p);
  }
  if (ms >= c.durationMs) {
    c.done = true;
    for (const p of Object.values(c.players)) {   // las que quedaran también cuentan como falladas
      for (; p.next < c.notes.length; p.next++) if (!p.done[p.next]) { p.done[p.next] = 1; p.miss++; }
      settle(p);
    }
  }
}
