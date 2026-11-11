// Chiptunes ORIGINALES generados por código (F12, regla de CR: sin música con licencia).
// Cada tema: tempo, progresión de acordes (notas MIDI de la raíz), riff de bajo, ritmo de batería y motivo de melodía.
// songEvents() es pura: el reproductor la consulta por pasos de semicorchea.

// riff: 'x' = toca la raíz, 'o' = la quinta, '+' = la octava, '.' = silencio (16 pasos por compás)
// drums: k = bombo, s = caja, h = charles
export const SONGS = [
  { name: 'PARKING', bpm: 152, prog: [40, 40, 43, 38], riff: 'x.xox.x+x.xox.xo', drums: 'k.h.s.h.k.k.s.hh', lead: [0, 3, 5, 7, 5, 3, 0, -2], leadEvery: 2 },
  { name: 'VESTÍBULO', bpm: 140, prog: [45, 41, 43, 40], riff: 'x..xo..x+..xo.x.', drums: 'k.h.s.hkk.h.s.h.', lead: [7, 5, 3, 5, 7, 10, 7, 3], leadEvery: 2 },
  { name: 'ASCENSOR', bpm: 160, prog: [38, 38, 41, 36], riff: 'xxo.xxo.xx+.xxo.', drums: 'k.hhs.hhk.hhs.hk', lead: [0, 0, 3, 5, 3, 0, -2, 0], leadEvery: 1 },
  { name: 'OFICINAS', bpm: 146, prog: [43, 39, 41, 38], riff: 'x.o.x.+.x.o.x.o+', drums: 'k.h.s.h.k.h.s.hs', lead: [5, 7, 8, 7, 5, 3, 2, 3], leadEvery: 2 },
  { name: 'AZOTEA', bpm: 168, prog: [40, 36, 43, 38], riff: 'x+xox+xox+xox+x+', drums: 'k.hks.hkk.hks.ss', lead: [12, 10, 7, 10, 12, 15, 12, 7], leadEvery: 1 },
  { name: 'JEFE', bpm: 172, prog: [38, 39, 38, 36], riff: 'xx.xxo.xx.x+xo.x', drums: 'kkhsk.hskkhsk.ss', lead: [0, 1, 0, -1, 0, 3, 1, 0], leadEvery: 1 },
];
export const BOSS_SONG = 5;

export const stepSeconds = (song) => 60 / song.bpm / 4;

export function songEvents(song, step) {
  const evs = [];
  const bar = Math.floor(step / 16), s = step % 16;
  const root = song.prog[bar % song.prog.length];
  const r = song.riff[s];
  if (r === 'x') evs.push({ ch: 'bass', note: root, len: 1 });
  else if (r === 'o') evs.push({ ch: 'bass', note: root + 7, len: 1 });
  else if (r === '+') evs.push({ ch: 'bass', note: root + 12, len: 1 });
  const d = song.drums[s];
  if (d === 'k') evs.push({ ch: 'kick' });
  else if (d === 's') evs.push({ ch: 'snare' });
  else if (d === 'h') evs.push({ ch: 'hat' });
  // Melodía: en la 2.ª mitad de cada vuelta de 4 compases, una nota cada 2 semicorcheas (o cada 1).
  const every = 2 * song.leadEvery;
  if (bar % 4 >= 2 && s % every === 0) {
    const i = ((bar % 2) * 16 + s) / every;
    evs.push({ ch: 'lead', note: root + 24 + song.lead[Math.floor(i) % song.lead.length], len: every });
  }
  return evs;
}

export const midiHz = (n) => 440 * 2 ** ((n - 69) / 12);
