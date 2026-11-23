// Cómo le va al bot en 10 semillas: nivel alcanzado, puntos, vidas y minutos. Para ajustar data/tuning.js.
import { createMatch, stepMatch } from '../src/game/match.js';
import { botDir } from '../src/game/bot.js';
const rows = [];
for (let seed = 1; seed <= 10; seed++) {
  const m = createMatch({ seed }); let s = 0;
  while (m.mode !== 'over' && m.nivel < 5 && s < 60 * 60 * 20) { stepMatch(m, { dir: botDir(m) }); s++; }
  rows.push({ seed, nivel: m.nivel, puntos: m.score, vidas: m.lives, min: +(s / 3600).toFixed(1) });
}
console.table(rows);
const niveles = rows.map((r) => r.nivel).sort((a, b) => a - b);
console.log(`mediana de nivel: ${niveles[5]} · gira completa: ${rows.filter((r) => r.nivel >= 5).length}/10`);
