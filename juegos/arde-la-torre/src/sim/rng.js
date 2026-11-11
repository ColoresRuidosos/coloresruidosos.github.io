// Aleatorio con semilla (mulberry32): misma semilla → misma partida (plan §3).
export function createRng(seed = 1) {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (a, b) => a + Math.floor(next() * (b - a + 1)),   // entero en [a, b]
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    get state() { return s; },
    set state(v) { s = v >>> 0; },
  };
}
