// Hoja de concepto: todos los sprites con su nombre, la paleta y los 5 escenarios (T0.3).
import { SPRITES } from '../src/data/sprites.js';
import { PALETTE } from '../src/data/palette.js';
import { TEMAS } from '../src/data/themes.js';
import { MAZES } from '../src/data/mazes.js';
import { drawSprite } from '../src/render/sprites.js';
import { drawText } from '../src/render/text.js';
import { drawStage } from '../src/render/stage.js';
import { createMatch } from '../src/game/match.js';
import { W, H } from '../src/render/layout.js';

const c = document.getElementById('c'), x = c.getContext('2d');
c.width = 1000; c.height = 560; x.imageSmoothingEnabled = false;
x.fillStyle = '#EFEFEE'; x.fillRect(0, 0, c.width, c.height);
drawText(x, 'BUNNYLAND · HOJA DE CONCEPTO V0.1 (ARTE POR CÓDIGO)', 16, 12, { color: '#FF66C4', scale: 2 });
const nombres = Object.keys(SPRITES);
nombres.forEach((n, i) => {
  const col = i % 10, fila = Math.floor(i / 10), px = 20 + col * 97, py = 50 + fila * 92;
  x.fillStyle = '#FFFFFF'; x.fillRect(px, py, 88, 70);
  drawSprite(x, n, px + 44, py + 34, { scale: n.startsWith('mini') ? 6 : 4 });
  drawText(x, n.length > 15 ? n.slice(0, 15) : n, px + 44, py + 74, { color: '#061B1D', align: 'center' });
});
const y0 = 50 + Math.ceil(nombres.length / 10) * 92 + 6;
drawText(x, 'PALETA', 20, y0, { color: '#FF66C4' });
Object.entries(PALETTE).forEach(([k, v], i) => { x.fillStyle = v; x.fillRect(20 + i * 30, y0 + 12, 26, 18); drawText(x, k, 33 + i * 30, y0 + 34, { color: '#061B1D', align: 'center' }); });
// Miniaturas de los 5 escenarios
const t = document.createElement('canvas'); t.width = W; t.height = H; const tx = t.getContext('2d');
TEMAS.forEach((tema, i) => {
  const m = createMatch({ seed: 1, nivel: i }); m.mode = 'play';
  tx.clearRect(0, 0, W, H); drawStage(tx, m, 0);
  const px = 560 + (i % 5) * 86, py = y0 - 6;
  x.drawImage(t, 0, 20, W, 216, px, py, 84, 108);
  drawText(x, MAZES[i].nombre.split(' ')[0], px + 42, py + 112, { color: '#061B1D', align: 'center' });
});
window.listo = true;
