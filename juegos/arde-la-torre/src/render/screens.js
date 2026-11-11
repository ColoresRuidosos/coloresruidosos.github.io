// Pantallas (F11): título, sala con QR, viñeta de nivel, pausa con opciones, fin del juego, final y resultado.
import { W, H } from '../sim/constants.js';
import { HEROES, HERO_IDS } from '../sim/moves.js';
import { SLOT_COLORS } from '../input/slots.js';
import { drawText } from './text.js';
import { drawQR } from './qr.js';
import { drawMenuFigure, drawPortrait } from './atlas.js';

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
    const x = i < 2 ? 50 + i * 50 : W - 100 + (i - 2) * 50;
    drawMenuFigure(ctx, id, 0, 'idle', Math.floor(t / 24) % 2, x, H - 18, HEROES[id].h, i >= 2 ? -1 : 1);
  });
  if (Math.floor(t / 30) % 2 === 0) drawText(ctx, 'PULSA GOLPE O TOCA LA PANTALLA', W / 2, H - 12, { color: '#ffd23f', align: 'center' });
}

// ---- Selección de músico: cuatro ascensores de la torre (idea de «cabinas que se abren»; aspecto propio) ----
const doors = [0, 0, 0, 0];                          // 0 = cerradas, 1 = abiertas (se animan solas)
const STAT_MAX = (() => {
  const v = HERO_IDS.map((id) => { const h = HEROES[id]; return [h.combo.reduce((a, m) => a + m.dmg, 0), h.speed, h.hp]; });
  return [0, 1, 2].map((k) => Math.max(...v.map((x) => x[k])));
})();
const statsOf = (id) => { const h = HEROES[id]; return [h.combo.reduce((a, m) => a + m.dmg, 0), h.speed, h.hp].map((v, k) => v / STAT_MAX[k]); };

function hazard(ctx, x, y, w, h, off = 0) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = '#1b1b1b'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#e8b81f';
  for (let i = -h; i < w + h; i += 8) { ctx.beginPath(); ctx.moveTo(x + i + off, y + h); ctx.lineTo(x + i + 4 + off, y + h); ctx.lineTo(x + i + 4 + h + off, y); ctx.lineTo(x + i + h + off, y); ctx.fill(); }
  ctx.restore();
}

function cabin(ctx, i, x, y, w, h, s, t) {
  const target = s ? 1 : 0;
  doors[i] += (target - doors[i]) * 0.12;
  if (Math.abs(target - doors[i]) < 0.01) doors[i] = target;
  const col = SLOT_COLORS[i];
  // indicador de planta encima de la puerta
  ctx.fillStyle = '#2a2530'; ctx.fillRect(x, y, w, 14);
  ctx.fillStyle = '#0c0a10'; ctx.fillRect(x + w / 2 - 16, y + 2, 32, 10);
  drawText(ctx, `J${i + 1}`, x + w / 2 - 2, y + 4, { color: s ? (s.ready ? '#3fdc7a' : col) : '#4a4560', align: 'center', shadow: null });
  ctx.fillStyle = s && s.ready ? '#3fdc7a' : '#3a3540';
  ctx.beginPath(); ctx.moveTo(x + w / 2 + 10, y + 10); ctx.lineTo(x + w / 2 + 13, y + 5); ctx.lineTo(x + w / 2 + 16, y + 10); ctx.fill();
  // marco de acero
  const fy = y + 16, fh = h - 16;
  ctx.fillStyle = '#8f949c'; ctx.fillRect(x, fy, w, fh);
  ctx.fillStyle = '#b9bec6'; ctx.fillRect(x, fy, 2, fh); ctx.fillStyle = '#5d626a'; ctx.fillRect(x + w - 2, fy, 2, fh);
  const ix = x + 3, iy = fy + 3, iw = w - 6, ih = fh - 6;
  // interior: cabina de madera y latón con foco
  const g = ctx.createLinearGradient(0, iy, 0, iy + ih); g.addColorStop(0, '#3a2418'); g.addColorStop(1, '#1a0f0a');
  ctx.fillStyle = g; ctx.fillRect(ix, iy, iw, ih);
  ctx.fillStyle = 'rgba(255,220,150,0.10)'; ctx.beginPath(); ctx.moveTo(ix + iw / 2 - 6, iy); ctx.lineTo(ix + iw / 2 + 6, iy); ctx.lineTo(ix + iw, iy + ih); ctx.lineTo(ix, iy + ih); ctx.fill();
  ctx.fillStyle = '#b08a3a'; ctx.fillRect(ix, iy + ih - 40, iw, 2);   // pasamanos de latón
  if (s) {
    const def = HEROES[s.hero];
    // retrato grande (×2, píxel nítido)
    ctx.fillStyle = col; ctx.fillRect(ix + iw / 2 - 26, iy + 3, 52, 52);
    ctx.fillStyle = '#120c18'; ctx.fillRect(ix + iw / 2 - 25, iy + 4, 50, 50);
    drawPortrait(ctx, s.hero, s.palette, def.h, ix + iw / 2 - 24, iy + 5, 48);
    if (!s.ready && s.kind !== 'movil' && Math.floor(t / 20) % 2) {
      drawText(ctx, '◀', ix + 1, iy + 24, { color: '#ffd23f' }); drawText(ctx, '▶', ix + iw - 6, iy + 24, { color: '#ffd23f' });
    }
    drawText(ctx, def.name, ix + iw / 2, iy + 58, { color: '#fff', align: 'center' });
    // estadísticas
    ['FUE', 'VEL', 'VIDA'].forEach((lab, k) => {
      const yy = iy + 68 + k * 8, v = statsOf(s.hero)[k];
      drawText(ctx, lab, ix + 2, yy, { color: '#cfc9e0', shadow: null });
      ctx.fillStyle = '#0c0a10'; ctx.fillRect(ix + 26, yy + 1, iw - 29, 5);
      ctx.fillStyle = col; ctx.fillRect(ix + 27, yy + 2, Math.round((iw - 31) * v), 3);
    });
    // cuerpo entero
    ctx.save(); ctx.beginPath(); ctx.rect(ix, iy + 94, iw, ih - 94); ctx.clip();
    drawMenuFigure(ctx, s.hero, s.palette, s.ready ? 'victory' : 'idle', Math.floor(t / 20) % 2, ix + iw / 2, iy + ih - 2, def.h);
    ctx.restore();
    const status = s.away ? 'SIN SEÑAL' : s.ready ? '¡LISTO!' : s.kind === 'movil' ? 'ELIGIENDO' : '¿LISTO?';   // ≤ 10 letras: cabe en la cabina
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(ix, iy + ih - 11, iw, 11);
    drawText(ctx, status, ix + iw / 2, iy + ih - 9, { color: s.ready ? '#3fdc7a' : '#ffd23f', align: 'center', shadow: null });
  }
  // puertas correderas con franja de peligro
  const half = iw / 2, open = doors[i] * (half - 2);
  for (const side of [-1, 1]) {
    const dw = half - open, dx = side < 0 ? ix : ix + iw - dw;
    if (dw <= 0.5) continue;
    ctx.fillStyle = '#a7acb4'; ctx.fillRect(dx, iy, dw, ih);
    for (let k = 3; k < dw; k += 4) { ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(dx + k, iy, 1, ih); }
    hazard(ctx, dx, iy + ih * 0.42, dw, 12, side < 0 ? 0 : 3);
    ctx.fillStyle = '#5d626a'; ctx.fillRect(side < 0 ? dx + dw - 1 : dx, iy, 1, ih);
  }
  if (!s && doors[i] < 0.05) {
    drawText(ctx, `J${i + 1}`, x + w / 2, iy + 22, { color: col, scale: 2, align: 'center' });
    if (Math.floor(t / 30) % 2) { drawText(ctx, 'PULSA', x + w / 2, iy + ih * 0.42 + 22, { color: '#120c18', align: 'center', shadow: null }); drawText(ctx, 'GOLPE', x + w / 2, iy + ih * 0.42 + 31, { color: '#120c18', align: 'center', shadow: null }); }
  }
}

export function drawLobby(ctx, { t, qr, code, slots, countdown, netStatus }) {
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x += 24) { ctx.fillStyle = 'rgba(255,255,255,0.025)'; ctx.fillRect(x, 0, 12, H); }
  drawText(ctx, 'ELIGE A TU MÚSICO', 6, 5, { color: '#ffd23f', scale: 2, shadow: '#a3242c' });
  // panel del QR (izquierda)
  ctx.fillStyle = '#1b1630'; ctx.fillRect(4, 24, 90, 162);
  if (qr) {
    const size = (qr.n + 4) * 2;
    drawQR(ctx, qr, 4 + Math.round((90 - size) / 2), 28, size);
    drawText(ctx, 'ESCANEA CON', 49, 28 + size + 4, { color: '#fff', align: 'center' });
    drawText(ctx, 'TU MÓVIL', 49, 28 + size + 13, { color: '#fff', align: 'center' });
    drawText(ctx, 'CÓDIGO', 49, 28 + size + 26, { color: '#8a8698', align: 'center' });
    drawText(ctx, code || '····', 49, 28 + size + 36, { color: '#ffd23f', scale: 2, align: 'center' });
  } else {
    const lines = String(netStatus || 'PREPARANDO|LA SALA…').split('|');   // líneas cortas: el panel mide 90 px
    lines.forEach((l, k) => drawText(ctx, l.trim(), 49, 40 + k * 10, { color: '#8a8698', align: 'center' }));
    drawText(ctx, 'JUEGA CON', 49, 90, { color: '#fff', align: 'center' });
    drawText(ctx, 'TECLADO,', 49, 100, { color: '#fff', align: 'center' });
    drawText(ctx, 'MANDO O', 49, 110, { color: '#fff', align: 'center' });
    drawText(ctx, 'PANTALLA', 49, 120, { color: '#fff', align: 'center' });
    drawText(ctx, 'TÁCTIL', 49, 130, { color: '#fff', align: 'center' });
  }
  // los cuatro ascensores
  for (let i = 0; i < 4; i++) cabin(ctx, i, 100 + i * 71, 24, 66, 162, slots[i], t);
  // ayuda de controles
  drawText(ctx, 'GOLPE: UNIRSE Y LISTO · ◀ ▶: MÚSICO · SALTO: SALIR', W / 2, 192, { color: '#ffd23f', align: 'center' });
  drawText(ctx, 'J1 F G H · J2 K L Ñ · MANDO X A B · TÁCTIL', W / 2, 203, { color: '#8a8698', align: 'center' });
  if (countdown > 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, H / 2 - 18, W, 36);
    drawText(ctx, `¡SUBIMOS EN ${Math.ceil(countdown / 60)}!`, W / 2, H / 2 - 7, { color: '#ffd23f', scale: 2, align: 'center' });
  }
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
    drawPortrait(ctx, p.type, p.palette, HEROES[p.type].h, x + 32, y + 6, 24);
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
