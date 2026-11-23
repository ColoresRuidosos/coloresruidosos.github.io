// Texto con la fuente bitmap. Todo en mayúsculas; sombra opcional como las letras del presskit.
import { GLYPHS, ACCENT, ADVANCE, textWidth } from './font.js';

export function drawText(ctx, str, x, y, { color = '#061B1D', scale = 1, align = 'left', shadow = null, sdx = 1, sdy = 1 } = {}) {
  const s = String(str).toUpperCase();
  const w = textWidth(s, scale);
  const x0 = Math.round(align === 'center' ? x - w / 2 : align === 'right' ? x - w : x);
  if (shadow) paint(ctx, s, x0 + sdx * scale, y + sdy * scale, shadow, scale);
  paint(ctx, s, x0, y, color, scale);
  return w;
}

function paint(ctx, s, x, y, color, scale) {
  ctx.fillStyle = color;
  [...s].forEach((ch, i) => {
    let g = GLYPHS[ch], marks = null;
    if (!g && ACCENT[ch]) { g = GLYPHS[ACCENT[ch][0]]; marks = ACCENT[ch][1]; }
    if (!g) return;
    const ox = x + i * ADVANCE * scale;
    g.forEach((row, ry) => { for (let rx = 0; rx < 5; rx++) if (row[rx] === '1') ctx.fillRect(ox + rx * scale, y + ry * scale, scale, scale); });
    if (marks) marks.forEach(([mx, my]) => ctx.fillRect(ox + mx * scale, y + my * scale, scale, scale));
  });
}

export { textWidth };
