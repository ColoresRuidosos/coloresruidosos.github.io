// Texto con la fuente bitmap 5×7 del repo (avance 6 px), con sombra opcional.
import { GLYPHS, ACCENT, ADVANCE, textWidth } from './font.js';

export { textWidth };

function glyph(ctx, ch, x, y, s) {
  let rows = GLYPHS[ch], extra = null;
  if (!rows && ACCENT[ch]) { rows = GLYPHS[ACCENT[ch][0]]; extra = ACCENT[ch][1]; }
  if (!rows) return;
  for (let r = 0; r < 7; r++) {
    const row = rows[r];
    for (let c = 0; c < 5; c++) if (row[c] === '1') ctx.fillRect(x + c * s, y + r * s, s, s);
  }
  if (extra) for (const [c, r] of extra) ctx.fillRect(x + c * s, y + r * s, s, s);
}

export function drawText(ctx, str, x, y, { color = '#fff', scale = 1, align = 'left', shadow = '#000' } = {}) {
  const s = String(str).toUpperCase();
  const w = textWidth(s, scale);
  let x0 = Math.round(align === 'center' ? x - w / 2 : align === 'right' ? x - w : x);
  const y0 = Math.round(y);
  const pass = (col, dx, dy) => {
    ctx.fillStyle = col;
    let cx = x0 + dx;
    for (const ch of s) { if (ch !== ' ') glyph(ctx, ch, cx, y0 + dy, scale); cx += ADVANCE * scale; }
  };
  if (shadow) pass(shadow, scale, scale);
  pass(color, 0, 0);
  return w;
}
