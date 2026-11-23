// Pantallas: título, cómo se juega, avisos sobre el laberinto, pausa, fin y girar (spec F11, F15).
import { drawText } from './text.js';
import { drawSprite } from './sprites.js';
import { carita } from './hud.js';
import { cara, medallas } from '../game/match.js';
import { MEDALLAS } from '../data/tuning.js';
import { MAZES } from '../data/mazes.js';
import { W, H, TOP, PX } from './layout.js';

const ROSA = '#FF66C4', GRIS = '#EFEFEE', NEGRO = '#061B1D', SOMBRA = '#C9C6CC';

export function boton(ctx, b, texto, { fondo = ROSA, color = '#FFFFFF' } = {}) {
  ctx.fillStyle = SOMBRA; ctx.fillRect(b.x + 2, b.y + 2, b.w, b.h);
  ctx.fillStyle = fondo; ctx.fillRect(b.x, b.y, b.w, b.h);
  drawText(ctx, texto, b.x + b.w / 2, b.y + Math.floor((b.h - 7) / 2), { color, align: 'center' });
}

// Portada: homenaje a la del presskit (el Bunny en cuclillas metido entre las letras).
export function drawTitle(ctx, frame, record) {
  ctx.fillStyle = GRIS; ctx.fillRect(0, 0, W, H);
  drawText(ctx, 'BUNNY', W / 2, 22, { color: ROSA, scale: 4, align: 'center', shadow: SOMBRA, sdx: 1, sdy: 1 });
  drawText(ctx, 'LAND', W / 2, 56, { color: ROSA, scale: 4, align: 'center', shadow: SOMBRA, sdx: 1, sdy: 1 });
  drawSprite(ctx, 'bunny.cuclillas', W / 2, 108 + Math.round(Math.sin(frame / 20)), { scale: 3 });
  drawText(ctx, 'SIENTO QUE DESAPAREZCO', W / 2, 136, { color: ROSA, align: 'center' });
  // Los cuatro de la nube
  ['coronado', 'osito', 'estrellita', 'gotita'].forEach((t, i) => drawSprite(ctx, `${t}.${(frame >> 4) & 1}`, 30 + i * 36, 152));
  if ((frame >> 5) % 2 === 0) {
    drawText(ctx, 'PRESIONA A DONDE', W / 2, 178, { color: NEGRO, align: 'center' });
    drawText(ctx, 'QUIERAS IR :)', W / 2, 188, { color: NEGRO, align: 'center' });
  }
  if (record > 0) drawText(ctx, `RÉCORD ${record}`, W / 2, 208, { color: ROSA, align: 'center' });
  drawText(ctx, carita(0), 6, H - 22, { color: ROSA });
  drawText(ctx, 'HANZER × COLORES RUIDOSOS', W / 2, H - 10, { color: NEGRO, align: 'center' });
}

export function drawHowTo(ctx, frame) {
  ctx.fillStyle = GRIS; ctx.fillRect(0, 0, W, H);
  drawText(ctx, 'CÓMO SE JUEGA', W / 2, 16, { color: ROSA, scale: 2, align: 'center', shadow: SOMBRA });
  const fila = (y, n, l1, l2) => {
    ctx.fillStyle = ROSA; ctx.fillRect(8, y - 2, 18, 18);
    drawText(ctx, String(n), 17, y + 3, { color: '#FFFFFF', align: 'center' });
    drawText(ctx, l1, 32, y, { color: NEGRO }); drawText(ctx, l2, 32, y + 10, { color: NEGRO });
  };
  fila(48, 1, 'DESLIZA EL DEDO', 'A DONDE QUIERAS IR');
  const dx = ((frame >> 1) % 40) - 20;
  drawSprite(ctx, 'bunny.lado.' + ((frame >> 3) & 1), W / 2 + dx, 82, { flip: false });
  fila(104, 2, 'COME TODAS LAS', 'ZANAHORIAS');
  for (let i = 0; i < 6; i++) { ctx.fillStyle = '#FF8A1F'; ctx.fillRect(50 + i * 12, 133, 2, 3); ctx.fillStyle = '#3BB54A'; ctx.fillRect(50 + i * 12, 132, 2, 1); }
  fila(152, 3, 'LA ZANAHORIA HYPERPOP', 'TE DEJA ABRAZARLOS');
  drawSprite(ctx, 'item.hyper', 44, 190);
  drawSprite(ctx, 'bunny.lado.0', 80, 190);
  drawSprite(ctx, 'coronado.triste.' + ((frame >> 4) & 1), 100, 190);
  drawText(ctx, '♥', 90, 178, { color: ROSA });
  if ((frame >> 5) % 2 === 0) drawText(ctx, 'TOCA PARA EMPEZAR', W / 2, 226, { color: ROSA, align: 'center' });
  drawText(ctx, 'TECLADO: FLECHAS O WASD', W / 2, 246, { color: '#8A8790', align: 'center' });
}

function cartel(ctx, lineas, y, { color = ROSA } = {}) {
  const h = lineas.length * 10 + 8;
  ctx.fillStyle = 'rgba(6,27,29,0.85)'; ctx.fillRect(14, y - 4, W - 28, h);
  lineas.forEach((l, i) => drawText(ctx, l, W / 2, y + i * 10, { color: i === 0 ? color : '#FFFFFF', align: 'center' }));
}

// Avisos sobre el laberinto según el modo de la partida.
export function drawOverlay(ctx, m, frame) {
  const y = TOP + 16 * PX + 2;
  if (m.mode === 'ready') cartel(ctx, ['¡LISTO, HANZER!', m.grid.nombre], y);
  if (m.mode === 'clear') {
    const gira = m.escenario === 4;
    const sig = MAZES[(m.escenario + 1) % MAZES.length].nombre;
    cartel(ctx, [gira ? '¡GIRA COMPLETA!' : '¡NIVEL COMPLETO!', carita(cara(1)), gira ? 'OTRA VUELTA, MÁS RÁPIDO' : `SIGUE: ${sig}`], y - 8);
  }
}

export function drawPause(ctx) {
  ctx.fillStyle = 'rgba(239,239,238,0.92)'; ctx.fillRect(0, 0, W, H);
  drawText(ctx, 'PAUSA', W / 2, 100, { color: ROSA, scale: 3, align: 'center', shadow: SOMBRA });
  drawText(ctx, 'TOCA PARA SEGUIR', W / 2, 140, { color: NEGRO, align: 'center' });
}

export const BOTONES_FIN = {
  otra: { x: 24, y: 176, w: 120, h: 18 },
  compartir: { x: 24, y: 198, w: 120, h: 18 },
  spotify: { x: 24, y: 228, w: 58, h: 16 },
  instagram: { x: 86, y: 228, w: 58, h: 16 },
};

export function drawGameOver(ctx, m, frame) {
  ctx.fillStyle = GRIS; ctx.fillRect(0, 0, W, H);
  drawText(ctx, 'SIENTO QUE', W / 2, 14, { color: ROSA, scale: 2, align: 'center', shadow: SOMBRA });
  drawText(ctx, 'DESAPAREZCO…', W / 2, 32, { color: ROSA, scale: 2, align: 'center', shadow: SOMBRA });
  drawSprite(ctx, 'bunny.cuclillas', W / 2, 70, { scale: 2, alpha: 0.75 + 0.25 * Math.sin(frame / 15) });
  drawText(ctx, `${m.score} PUNTOS`, W / 2, 96, { color: NEGRO, scale: 2, align: 'center' });
  drawText(ctx, m.score >= m.record && m.score > 0 ? '¡NUEVO RÉCORD!' : `RÉCORD ${m.record}`, W / 2, 114, { color: ROSA, align: 'center' });
  drawText(ctx, m.grid.nombre, W / 2, 126, { color: NEGRO, align: 'center' });
  const tiene = medallas(m.score).length;
  MEDALLAS.forEach((md, i) => {
    const x = 6 + i * 54, ok = i < tiene;
    ctx.fillStyle = ok ? ROSA : '#D8D5DB'; ctx.fillRect(x, 140, 50, 28);
    drawText(ctx, md.nombre, x + 25, 144, { color: ok ? '#FFFFFF' : '#8A8790', align: 'center' });
    drawText(ctx, md.de, x + 25, 156, { color: ok ? '#FFFFFF' : '#8A8790', align: 'center' });
  });
  boton(ctx, BOTONES_FIN.otra, 'OTRA VEZ');
  boton(ctx, BOTONES_FIN.compartir, 'COMPARTIR', { fondo: NEGRO });
  drawText(ctx, 'ESCUCHA A HANZER', W / 2, 219, { color: NEGRO, align: 'center' });
  boton(ctx, BOTONES_FIN.spotify, 'SPOTIFY');
  boton(ctx, BOTONES_FIN.instagram, 'INSTAGRAM');
  drawText(ctx, 'HANZER × COLORES RUIDOSOS', W / 2, H - 12, { color: '#8A8790', align: 'center' });
}

export function drawRotate(ctx) {
  ctx.fillStyle = GRIS; ctx.fillRect(0, 0, W, H);
  drawSprite(ctx, 'bunny.cuclillas', W / 2, 100, { scale: 3 });
  drawText(ctx, 'GIRA TU CELULAR', W / 2, 150, { color: ROSA, align: 'center' });
  drawText(ctx, 'SE JUEGA EN VERTICAL', W / 2, 162, { color: NEGRO, align: 'center' });
}
