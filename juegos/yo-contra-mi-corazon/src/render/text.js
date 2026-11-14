// Texto con la fuente bitmap 5×7 del juego principal (font.js).
import { GLYPHS, ACCENT, textWidth } from './font.js';
export { textWidth };

function glyph(ch) {
  if (ACCENT[ch]) { const [base, marks] = ACCENT[ch]; return { rows: GLYPHS[base], marks }; }
  return { rows: GLYPHS[ch], marks: null };
}

export function drawText(ctx, str, x, y, { color = '#fff', scale = 1, shadow = '#140a19', align = 'left' } = {}) {
  const s = String(str).toUpperCase();
  const w = textWidth(s, scale);
  let cx = Math.round(align === 'center' ? x - w / 2 : align === 'right' ? x - w : x);
  y = Math.round(y);
  const paint = (ox, oy, col) => {
    ctx.fillStyle = col;
    let px = cx + ox;
    for (const ch of s) {
      const g = glyph(ch);
      if (g.rows) {
        g.rows.forEach((row, r) => { for (let q = 0; q < 5; q++) if (row[q] === '1') ctx.fillRect(px + q * scale, y + oy + r * scale, scale, scale); });
        if (g.marks) for (const [q, r] of g.marks) ctx.fillRect(px + q * scale, y + oy + r * scale, scale, scale);
      }
      px += 6 * scale;
    }
  };
  if (shadow) paint(scale, scale, shadow);
  paint(0, 0, color);
  return w;
}

// Parte un texto en líneas que quepan en maxW px (a escala 1).
export function wrap(str, maxW, scale = 1) {
  const words = String(str).split(' '); const lines = []; let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (textWidth(t, scale) <= maxW) cur = t; else { if (cur) lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}
