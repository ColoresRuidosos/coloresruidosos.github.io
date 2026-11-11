// Pantallas (F11): título, sala con QR, viñeta de nivel, pausa con opciones, fin del juego, final y resultado.
import { W, H } from '../sim/constants.js';
import { HEROES, HERO_IDS } from '../sim/moves.js';
import { SLOT_COLORS } from '../input/slots.js';
import { drawText } from './text.js';
import { drawQR } from './qr.js';
import { getSprite, getPortrait } from './sprites.js';

const BG = '#0e0b1a';

// Silueta de una torre de oficinas blanca con franjas verticales (evocada, sin logos).
function tower(ctx, x, top, w, t) {
  ctx.fillStyle = '#d9d6cf'; ctx.fillRect(x, top, w, H - top);
  ctx.fillStyle = '#b9b5ab'; for (let i = 3; i < w; i += 5) ctx.fillRect(x + i, top + 6, 2, H - top - 30);
  ctx.fillStyle = '#16122a'; for (let i = 0; i < 5; i++) ctx.fillRect(x + 4 + i * (w - 8) / 5, H - 24, (w - 8) / 5 - 3, 24);   // arcos de la base
  for (let y = top + 10; y < H - 30; y += 7) for (let i = 4; i < w - 2; i += 5) if (((y * 7 + i * 13 + Math.floor(t / 90)) % 11) === 0) { ctx.fillStyle = '#ffcf6a'; ctx.fillRect(x + i - 1, y, 2, 3); }
  // fuego de escenario en la azotea
  for (let i = 0; i < 8; i++) { const hh = 4 + ((t * 2 + i * 13) % 12); ctx.fillStyle = i % 2 ? '#ffd23f' : '#ff6a2a'; ctx.fillRect(x + 4 + i * (w - 8) / 8, top - hh, 2, hh); }
}

export function drawTitle(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#07071a'); g.addColorStop(0.7, '#3a1240'); g.addColorStop(1, '#a23a3a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { ctx.fillStyle = '#fff8'; ctx.fillRect((i * 97) % W, (i * 53) % 110, 1, 1); }
  ctx.fillStyle = '#120a1e'; for (let x = 0; x < W; x += 14) { const h = 20 + ((x * 37) % 40); ctx.fillRect(x, H - h, 13, h); }
  tower(ctx, W / 2 - 30, 70, 60, t);
  drawText(ctx, 'ARDE LA TORRE', W / 2, 16, { color: '#ffd23f', scale: 4, align: 'center', shadow: '#a3242c' });
  drawText(ctx, 'HOMENAJE NO OFICIAL · @COLORESRUIDOSOS', W / 2, 50, { color: '#fff', align: 'center' });
  // los cuatro músicos
  HERO_IDS.forEach((id, i) => {
    const s = getSprite(id, 0, 'idle', Math.floor(t / 24) % 2, HEROES[id].h, id);
    const x = i < 2 ? 50 + i * 50 : W - 100 + (i - 2) * 50;
    ctx.save(); ctx.translate(x, H - 18); if (i >= 2) ctx.scale(-1, 1); ctx.drawImage(s.canvas, -s.ox, -s.oy); ctx.restore();
  });
  if (Math.floor(t / 30) % 2 === 0) drawText(ctx, 'PULSA GOLPE O TOCA LA PANTALLA', W / 2, H - 12, { color: '#ffd23f', align: 'center' });
}

export function drawLobby(ctx, { t, qr, code, url, slots, countdown, netStatus, local }) {
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  drawText(ctx, 'SALA', 10, 8, { color: '#ffd23f', scale: 2 });
  // QR + código
  if (qr) {
    const size = (qr.n + 4) * 2;
    drawQR(ctx, qr, 10, 28, size);
    const qx = 10 + size + 8;
    drawText(ctx, 'ESCANEA', qx, 32, { color: '#fff' });
    drawText(ctx, 'CON TU MÓVIL', qx, 42, { color: '#fff' });
    drawText(ctx, 'O ESCRIBE', qx, 58, { color: '#8a8698' });
    drawText(ctx, 'EL CÓDIGO:', qx, 68, { color: '#8a8698' });
    drawText(ctx, code || '····', qx, 80, { color: '#ffd23f', scale: 3 });
    if (url) drawText(ctx, url, 10, 28 + size + 4, { color: '#8a8698' });
  } else {
    drawText(ctx, netStatus || 'PREPARANDO LA SALA…', 10, 36, { color: '#8a8698' });
    drawText(ctx, 'MIENTRAS TANTO:', 10, 48, { color: '#8a8698' });
    drawText(ctx, 'TECLADO O MANDO', 10, 58, { color: '#8a8698' });
  }
  // controles locales
  const ly = 128;
  const lines = [
    ['SIN MÓVIL:', '#8a8698'],
    ['J1  WASD  ·  F  G  H', '#cfc9e0'],
    ['J2  FLECHAS  ·  K  L  Ñ', '#cfc9e0'],
    ['MANDO  ·  X  A  B', '#cfc9e0'],
    ['TÁCTIL · BOTONES EN PANTALLA', '#cfc9e0'],
    ['GOLPE: UNIRSE Y LISTO', '#ffd23f'],
    ['◀ ▶: CAMBIAR DE MÚSICO', '#ffd23f'],
    ['SALTO: QUITAR LISTO / SALIR', '#ffd23f'],
  ];
  lines.forEach(([txt, col], i) => drawText(ctx, txt, 10, ly + i * 11, { color: col }));
  // huecos
  for (let i = 0; i < 4; i++) {
    const x = 196 + (i % 2) * 94, y = 30 + Math.floor(i / 2) * 92, s = slots[i];
    ctx.fillStyle = '#1b1630'; ctx.fillRect(x, y, 88, 86);
    ctx.fillStyle = SLOT_COLORS[i]; ctx.fillRect(x, y, 88, 2);
    drawText(ctx, `J${i + 1}`, x + 4, y + 6, { color: SLOT_COLORS[i] });
    if (!s) { drawText(ctx, 'LIBRE', x + 44, y + 40, { color: '#4a4560', align: 'center' }); continue; }
    drawText(ctx, s.kind === 'movil' ? 'MÓVIL' : s.kind === 'mando' ? 'MANDO' : s.kind === 'tactil' ? 'TÁCTIL' : 'TECLADO', x + 84, y + 6, { color: '#8a8698', align: 'right' });
    const def = HEROES[s.hero];
    const spr = getSprite(s.hero, s.palette, s.ready ? 'victory' : 'idle', Math.floor(t / 20) % 2, def.h, s.hero);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y + 14, 88, 50); ctx.clip();
    ctx.drawImage(spr.canvas, x + 44 - spr.ox, y + 64 - spr.oy);
    ctx.restore();
    ctx.fillStyle = '#120e22'; ctx.fillRect(x, y + 64, 88, 22);
    drawText(ctx, def.name, x + 44, y + 66, { color: '#fff', align: 'center' });
    drawText(ctx, s.ready ? 'LISTO' : (s.kind === 'movil' ? 'ELIGE EN EL MÓVIL' : '◀ ELIGE ▶'), x + 44, y + 76, { color: s.ready ? '#3fdc7a' : '#ffd23f', align: 'center' });
    if (s.away) drawText(ctx, 'RECONECTANDO…', x + 44, y + 16, { color: '#ffd23f', align: 'center' });
  }
  if (countdown > 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, H / 2 - 18, W, 36);
    drawText(ctx, `¡EMPIEZA EN ${Math.ceil(countdown / 60)}!`, W / 2, H / 2 - 7, { color: '#ffd23f', scale: 2, align: 'center' });
  }
  void local;
}

export function drawIntro(ctx, level, t) {
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#1b1630'; ctx.fillRect(24, 50, W - 48, 110);
  ctx.fillStyle = '#ffd23f'; ctx.fillRect(24, 50, W - 48, 2); ctx.fillRect(24, 158, W - 48, 2);
  drawText(ctx, level.title, W / 2, 66, { color: '#ffd23f', scale: 2, align: 'center' });
  const n = Math.floor(t / 2);
  let left = n;
  level.intro.forEach((line, i) => {
    const s = line.slice(0, Math.max(0, left)); left -= line.length;
    drawText(ctx, s, W / 2, 100 + i * 14, { color: '#fff', align: 'center' });
  });
  if (t > 60 && Math.floor(t / 30) % 2) drawText(ctx, 'GOLPE PARA SEGUIR', W / 2, 176, { color: '#8a8698', align: 'center' });
  drawText(ctx, 'FICCIÓN · HOMENAJE NO OFICIAL', W / 2, H - 12, { color: '#4a4560', align: 'center' });
}

export const PAUSE_ITEMS = ['continuar', 'sacudida', 'asistido', 'destellos', 'volumen', 'salir'];
export function drawPause(ctx, sel, opts) {
  ctx.fillStyle = 'rgba(8,6,16,0.82)'; ctx.fillRect(0, 0, W, H);
  drawText(ctx, 'PAUSA', W / 2, 30, { color: '#ffd23f', scale: 3, align: 'center' });
  const yes = (b) => (b ? 'SÍ' : 'NO');
  const labels = {
    continuar: 'CONTINUAR', sacudida: `SACUDIDA DE PANTALLA: ${yes(opts.shake)}`, asistido: `MODO ASISTIDO: ${yes(opts.assisted)}`,
    destellos: `DESTELLOS: ${opts.flashes ? 'NORMALES' : 'REDUCIDOS'}`, volumen: `VOLUMEN: ${Math.round(opts.volume * 10)}/10`, salir: 'SALIR AL TÍTULO',
  };
  PAUSE_ITEMS.forEach((k, i) => drawText(ctx, (i === sel ? '▶ ' : '  ') + labels[k], 100, 72 + i * 16, { color: i === sel ? '#ffd23f' : '#fff' }));
  drawText(ctx, '▲▼ ELIGE · ◀ ▶ CAMBIA · GOLPE ACEPTA', W / 2, H - 20, { color: '#8a8698', align: 'center' });
  drawText(ctx, 'ASISTIDO: −30 % DE DAÑO RECIBIDO Y VIDAS INFINITAS', W / 2, H - 10, { color: '#4a4560', align: 'center' });
}

export function drawBanner(ctx, text, sub, t) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 80, W, 50);
  drawText(ctx, text, W / 2, 90, { color: '#ffd23f', scale: 3, align: 'center' });
  if (sub && t > 30) drawText(ctx, sub, W / 2, 116, { color: '#fff', align: 'center' });
}

export function drawResults(ctx, { players, final, t }) {
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  drawText(ctx, final ? '¡CONCIERTO EN LA AZOTEA!' : 'FIN DEL JUEGO', W / 2, 12, { color: final ? '#ffd23f' : '#ff4d4d', scale: 2, align: 'center' });
  if (final) drawText(ctx, 'SILENCIO S.A. NO PUDO APAGAR EL ROCK', W / 2, 32, { color: '#fff', align: 'center' });
  const best = (k) => players.reduce((a, p) => (!a || p[k] > a[k] ? p : a), null);
  const topKo = best('kos'), topFood = best('food');
  players.forEach((p, i) => {
    const x = 10 + i * 93, y = 50;
    ctx.fillStyle = '#1b1630'; ctx.fillRect(x, y, 88, 120);
    ctx.fillStyle = SLOT_COLORS[p.slot]; ctx.fillRect(x, y, 88, 2);
    const pt = getPortrait(p.type, p.palette, HEROES[p.type].h);
    ctx.drawImage(pt.canvas, pt.sx, pt.sy, pt.sw, pt.sh, x + 32, y + 6, 24, 24);
    drawText(ctx, HEROES[p.type].name, x + 44, y + 34, { color: SLOT_COLORS[p.slot], align: 'center' });
    drawText(ctx, String(p.score).padStart(7, '0'), x + 44, y + 48, { color: '#fff', align: 'center' });
    drawText(ctx, `TUMBADOS ${p.kos}`, x + 6, y + 64, { color: '#cfc9e0' });
    drawText(ctx, `BOCADILLOS ${p.food}`, x + 6, y + 74, { color: '#cfc9e0' });
    drawText(ctx, `CONTINÚES ${p.continues}`, x + 6, y + 84, { color: '#cfc9e0' });
    if (players.length > 1 && p === topKo && p.kos > 0) drawText(ctx, '★ MÁS TUMBADOS', x + 44, y + 98, { color: '#ffd23f', align: 'center' });
    if (players.length > 1 && p === topFood && p.food > 0) drawText(ctx, '★ MÁS BOCADILLOS', x + 44, y + 108, { color: '#ffd23f', align: 'center' });
  });
  if (t > 90 && Math.floor(t / 30) % 2) drawText(ctx, 'GOLPE: OTRA VEZ', W / 2, H - 22, { color: '#ffd23f', align: 'center' });
  drawText(ctx, 'HOMENAJE NO OFICIAL · @COLORESRUIDOSOS', W / 2, H - 10, { color: '#4a4560', align: 'center' });
}
