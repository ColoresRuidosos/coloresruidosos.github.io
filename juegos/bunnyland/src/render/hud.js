// HUD: puntos, récord y la cara U( ᵔ ︵ ᵔ )U que sonríe según las zanahorias (K1); vidas, escenario, pausa y sonido.
import { cara } from '../game/match.js';
import { drawText } from './text.js';
import { drawSprite } from './sprites.js';
import { W, TOP, BOTTOM, H, BOTONES } from './layout.js';

export const BOCAS = ['︵', '︵', '—', 'ᴗ', '▽'];
export const carita = (i) => `U(ᵔ${BOCAS[i]}ᵔ)U`;

export function drawHud(ctx, m, { mudo = false, frame = 0 } = {}) {
  ctx.fillStyle = '#061B1D'; ctx.fillRect(0, 0, W, TOP); ctx.fillRect(0, BOTTOM, W, H - BOTTOM);
  ctx.fillStyle = '#FF66C4'; ctx.fillRect(0, TOP - 1, W, 1); ctx.fillRect(0, BOTTOM, W, 1);
  drawText(ctx, String(m.score), 3, 7, { color: '#FFFFFF' });
  drawText(ctx, String(m.record), W - 3, 7, { color: '#FF85D0', align: 'right' });
  const i = cara((m.total - m.restantes) / m.total);
  drawText(ctx, carita(i), W / 2, 6, { color: '#FF66C4', align: 'center' });
  if (i === 0 && (frame >> 5) % 2) { ctx.fillStyle = '#9CCBFF'; ctx.fillRect(W / 2 - 11, 11, 1, 2); } // lagrimita
  for (let k = 0; k < m.lives; k++) drawSprite(ctx, 'mini.vida', 8 + k * 10, BOTTOM + 14);
  drawText(ctx, `NIVEL ${m.nivel + 1}`, 88, BOTTOM + 11, { color: '#FF85D0', align: 'center' });
  const p = BOTONES.pausa, s = BOTONES.sonido;
  ctx.fillStyle = '#FF66C4'; ctx.fillRect(p.x + 7, p.y + 7, 2, 8); ctx.fillRect(p.x + 11, p.y + 7, 2, 8);
  drawText(ctx, mudo ? '×' : '♪', s.x + 10, s.y + 8, { color: '#FF66C4', align: 'center' });
}
