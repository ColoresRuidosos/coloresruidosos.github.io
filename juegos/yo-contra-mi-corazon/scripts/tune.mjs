// Simula bots de distinto nivel y muestra cómo acaba la pelea (para ajustar constants.js).
import { createMatch, step, damageRatio, rankOf } from '../src/game/match.js';
import { createBot, simulate } from '../src/game/bot.js';
import { BEATMAP } from '../src/data/beatmap.js';
const levels = { perfecto: { jitter: 0, miss: 0 }, bueno: { jitter: 0.05, miss: 0.08, hitProb: 0.9 }, normal: { jitter: 0.08, miss: 0.2, hitProb: 0.8 }, flojo: { jitter: 0.12, miss: 0.35, hitProb: 0.6 } };
for (const [name, skill] of Object.entries(levels)) {
  const rows = [];
  for (const seed of [1, 2, 3, 4, 5]) {
    const m = simulate(createMatch({ beatmap: BEATMAP, seed }), step, createBot({ ...skill, seed: seed * 7 }));
    rows.push(`${m.over}@${m.overAt.toFixed(0)}s fase${m.phase} vida${m.clown.hp} daño${(damageRatio(m) * 100).toFixed(0)}% pts${m.score} ${rankOf(m.score)}`);
  }
  console.log(name.padEnd(9), '\n  ' + rows.join('\n  '));
}
