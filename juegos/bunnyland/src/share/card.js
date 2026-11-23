// Tarjeta 1080×1920 para historias (spec F14) y enlaces de Hanzer (F15; del presskit, sin parámetros de rastreo).
import { drawText } from '../render/text.js';
import { drawSprite } from '../render/sprites.js';
import { carita } from '../render/hud.js';
import { cara, medallas } from '../game/match.js';

export const LINKS = {
  spotify: 'https://open.spotify.com/artist/6iuLqfg0KiTYIv7HiNQrnE',
  instagram: 'https://www.instagram.com/hanzerbunny/',
  juego: 'https://coloresruidosos.github.io/games/bunnyland/',
};

export function drawCard(canvas, m) {
  canvas.width = 1080; canvas.height = 1920;
  const c = canvas.getContext('2d');
  c.imageSmoothingEnabled = false;
  c.fillStyle = '#EFEFEE'; c.fillRect(0, 0, 1080, 1920);
  const S = 6; // 180 × 320 lógicos
  c.save(); c.scale(S, S);
  const W = 180;
  drawText(c, 'BUNNY', W / 2, 30, { color: '#FF66C4', scale: 5, align: 'center', shadow: '#C9C6CC' });
  drawText(c, 'LAND', W / 2, 72, { color: '#FF66C4', scale: 5, align: 'center', shadow: '#C9C6CC' });
  drawSprite(c, 'bunny.cuclillas', W / 2, 140, { scale: 4 });
  const i = cara(Math.min(1, m.nivel / 5));
  drawText(c, carita(i), W / 2, 188, { color: '#FF66C4', scale: 2, align: 'center' });
  drawText(c, `${m.score}`, W / 2, 206, { color: '#061B1D', scale: 4, align: 'center' });
  drawText(c, 'PUNTOS', W / 2, 240, { color: '#061B1D', align: 'center' });
  drawText(c, `LLEGUÉ A ${m.grid.nombre}`, W / 2, 256, { color: '#FF66C4', align: 'center' });
  const md = medallas(m.score).map((x) => x.nombre).join(' · ');
  if (md) drawText(c, md, W / 2, 270, { color: '#061B1D', align: 'center' });
  drawText(c, 'HANZER × COLORES RUIDOSOS', W / 2, 300, { color: '#8A8790', align: 'center' });
  c.restore();
  return canvas;
}

export async function compartir(m) {
  const canvas = drawCard(document.createElement('canvas'), m);
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
  const file = new File([blob], 'bunnyland.png', { type: 'image/png' });
  const texto = `Hice ${m.score} puntos en BunnyLand con Hanzer Bunny U(ᵔᴗᵔ)U ${LINKS.juego}`;
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], text: texto }); return 'compartido'; } catch { return 'cancelado'; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bunnyland.png'; a.click();
  return 'descargado';
}
