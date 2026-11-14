// F10: tarjeta de 1080×1920 para historias (se dibuja a 180×320 y se escala ×6, en pixel art).
import { drawText } from '../render/text.js';
import { spr } from '../render/sprites.js';

const RESULT = { ko: '¡GANÉ POR K.O.!', decision: '¡GANÉ POR DECISIÓN!', derrota: 'ME NOQUEÓ EL CORAZÓN', perdio: 'PERDÍ POR DECISIÓN' };
export function cardLines(r) {
  return ['YO CONTRA', 'MI CORAZÓN', RESULT[r.over] || '', r.rank, `${r.score} PUNTOS`, `${r.stats.perfecto} PERFECTOS · COMBO ${r.maxCombo}`, `INSIGNIAS ${r.insignias ?? 0}/10 · ¿ME GANAS?`, 'HOMENAJE NO OFICIAL', '@COLORESRUIDOSOS'];
}

export function drawCard(ctx, r) {
  const L = cardLines(r), Y = '#ffe25c';
  spr(ctx, 'stage', 0, 0);
  ctx.fillStyle = 'rgba(10,8,20,0.55)'; ctx.fillRect(0, 0, 180, 320);
  drawText(ctx, L[0], 90, 20, { scale: 2, align: 'center' });
  drawText(ctx, L[1], 90, 38, { scale: 2, align: 'center', color: '#ff6a7a' });
  spr(ctx, r.over === 'ko' || r.over === 'decision' ? 'heart.dano' : 'heart.golpeDer', 40, 62);
  spr(ctx, r.over === 'ko' || r.over === 'decision' ? 'clown.grito' : 'clown.golpeado', 40, 150);
  ctx.fillStyle = 'rgba(10,8,20,0.85)'; ctx.fillRect(0, 232, 180, 88);
  drawText(ctx, L[2], 90, 238, { align: 'center', color: Y });
  drawText(ctx, L[3], 90, 250, { align: 'center', scale: L[3].length > 14 ? 1 : 2 });
  drawText(ctx, L[4], 90, 268, { align: 'center' });
  drawText(ctx, L[5], 90, 279, { align: 'center', color: '#cfc8e0' });
  drawText(ctx, L[6], 90, 290, { align: 'center', color: Y });
  drawText(ctx, L[7], 90, 302, { align: 'center', color: '#a89cc0' });
  drawText(ctx, L[8], 90, 311, { align: 'center', color: Y });
}

export async function shareCard(r) {
  const small = document.createElement('canvas'); small.width = 180; small.height = 320;
  drawCard(small.getContext('2d'), r);
  const big = document.createElement('canvas'); big.width = 1080; big.height = 1920;
  const g = big.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(small, 0, 0, 1080, 1920);
  const blob = await new Promise((res) => big.toBlob(res, 'image/png'));
  const file = new File([blob], 'yo-contra-mi-corazon.png', { type: 'image/png' });
  const text = `${cardLines(r)[2]} ${r.rank} · ${r.score} puntos en «Yo contra mi corazón» (@coloresruidosos)`;
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Yo contra mi corazón', text }); return 'compartido'; } catch { return 'cancelado'; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  return 'descargado';
}
