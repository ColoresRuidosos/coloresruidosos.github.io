// F2: el ritmo se mide en tiempo de canción (segundos), nunca en cuadros.
export function createClock({ bpm, firstBeat }) {
  const beat = 60 / bpm;
  return {
    bpm, firstBeat, beat,
    timeOfBeat: (n) => firstBeat + n * beat,
    beatAt: (t) => (t - firstBeat) / beat,
    nearestBeat: (t) => Math.round((t - firstBeat) / beat),
  };
}

// Convierte una marca de performance.now() (ms) a tiempo de canción (s).
// anchor: { contextTime, performanceTime } = lo que se está oyendo en ese instante (getOutputTimestamp),
// startAt = contextTime en que sonó el inicio de la canción, offsetMs = desfase del usuario.
export function songTimeAt(perfMs, { contextTime, performanceTime, startAt, offsetMs = 0 }) {
  return contextTime + (perfMs - performanceTime) / 1000 - startAt - offsetMs / 1000;
}
