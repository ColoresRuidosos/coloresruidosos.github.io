// Ajuste fino: corre bots en cada nivel con 1–4 jugadores y muestra cómo les va.
// node scripts/tune.mjs [semillas]
import { createWorld, tick, startLevel } from '../src/sim/world.js';
import { botInput } from '../src/sim/bot.js';
import { HERO_IDS } from '../src/sim/moves.js';
import { LEVELS } from '../src/data/levels.js';

const seeds = Number(process.argv[2] || 3);
export function runLevel(levelIdx, n, seed, maxTicks = 60 * 60 * 6, skill = 1) {
  const players = Array.from({ length: n }, (_, i) => ({ slot: i, hero: HERO_IDS[(i + seed) % 4] }));
  const w = createWorld({ seed, levelIdx, players });
  while (!w.done && !w.over && w.tick < maxTicks) {
    const ins = players.map((p) => botInput(w, p.slot, skill));
    tick(w, ins);
  }
  const ps = w.fighters.filter((f) => f.team === 'p');
  return { done: w.done, over: w.over, secs: Math.round(w.tick / 60), wave: w.waveIdx, lives: ps.map((p) => p.lives).join('/'), cont: ps.reduce((a, p) => a + p.continues, 0) };
}
if (import.meta.url === `file://${process.argv[1]}`) {
  for (let l = 0; l < LEVELS.length; l++) for (const n of [1, 2, 4]) {
    const rs = []; for (let s = 1; s <= seeds; s++) rs.push(runLevel(l, n, s));
    console.log(LEVELS[l].id.padEnd(10), `${n}J`, rs.map((r) => `${r.done ? 'OK' : r.over ? 'GAMEOVER' : 'TIEMPO'} ${r.secs}s v${r.wave} vidas ${r.lives}${r.cont ? ` c${r.cont}` : ''}`).join(' | '));
  }
}
