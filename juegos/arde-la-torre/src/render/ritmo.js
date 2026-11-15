// Concierto final (F17): la banda en el escenario de la azotea y una autopista de 3 carriles por jugador.
import { W, H } from '../sim/constants.js';
import { SLOT_COLORS } from '../input/slots.js';
import { HEROES } from '../sim/moves.js';
import { drawText } from './text.js';
import { drawFrame } from './atlas.js';
import { getBackground } from './backgrounds.js';
import { multiplier } from '../sim/ritmo.js';

export const LANE_COLORS = ['#ff4d4d', '#3fa9ff', '#ffd23f'];   // los mismos colores que los botones del móvil
const LANE_NAMES = ['GOLPE', 'SALTO', 'ESPECIAL'];
const LANE_W = 15, TOP = 34, HIT_Y = 176, LOOK_MS = 1700;
const FEEDBACK = { perfect: ['¡PERFECTO!', '#ffd23f'], good: ['¡BIEN!', '#3fdc7a'], miss: ['FALLO', '#ff4d4d'] };

function laneX(cx, lane) { return Math.round(cx - LANE_W * 1.5 + lane * LANE_W); }

function highway(ctx, c, p, cx, ms, opts, bpm) {
  const x0 = laneX(cx, 0), w = LANE_W * 3;
  ctx.fillStyle = 'rgba(8,6,16,0.62)'; ctx.fillRect(x0 - 2, TOP, w + 4, H - TOP - 14);
  ctx.fillStyle = SLOT_COLORS[p.slot]; ctx.fillRect(x0 - 2, TOP, w + 4, 2);
  // líneas de compás que bajan
  const beat = 60000 / bpm;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let k = Math.ceil(ms / beat); k * beat < ms + LOOK_MS; k++) {
    const y = Math.round(HIT_Y - (k * beat - ms) * (HIT_Y - TOP) / LOOK_MS);
    ctx.fillRect(x0, y, w, k % 4 ? 1 : 2);
  }
  for (let l = 0; l < 3; l++) {
    const x = laneX(cx, l);
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x + LANE_W - 1, TOP + 2, 1, HIT_Y - TOP);
    // diana del carril
    ctx.strokeStyle = LANE_COLORS[l]; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x + LANE_W / 2, HIT_Y, 5, 0, Math.PI * 2); ctx.stroke();
  }
  // notas
  const pr = c.players[p.slot];
  for (let i = pr.next; i < c.notes.length; i++) {
    const [t, l] = c.notes[i];
    if (t > ms + LOOK_MS) break;
    if (pr.done[i]) continue;
    const y = Math.round(HIT_Y - (t - ms) * (HIT_Y - TOP) / LOOK_MS);
    const x = laneX(cx, l) + LANE_W / 2;
    ctx.fillStyle = '#120c18'; ctx.beginPath(); ctx.ellipse(x, y, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = LANE_COLORS[l]; ctx.beginPath(); ctx.ellipse(x, y, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(x - 2, y - 2, 3, 1);
  }
  // aciertos: un aro que se abre (sin parpadeo si los destellos están desactivados)
  const last = pr.last;
  if (last && ms - last.ms < 450) {
    const k = (ms - last.ms) / 450;
    if (last.kind !== 'miss') {
      ctx.strokeStyle = LANE_COLORS[last.lane]; ctx.globalAlpha = 1 - k; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(laneX(cx, last.lane) + LANE_W / 2, HIT_Y, 6 + k * (opts.flashes === false ? 4 : 10), 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    const [txt, col] = FEEDBACK[last.kind];
    drawText(ctx, txt, cx, HIT_Y - 26 - Math.round(k * 6), { color: col, align: 'center' });
  }
  drawText(ctx, String(pr.score).padStart(6, '0'), cx, TOP + 5, { color: SLOT_COLORS[p.slot], align: 'center' });
  if (pr.combo >= 5) drawText(ctx, `RACHA ${pr.combo}${multiplier(pr.combo) > 1 ? ` ×${multiplier(pr.combo)}` : ''}`, cx, TOP + 14, { color: '#fff', align: 'center' });
}

// Banda en el escenario: cada músico alterna dos poses al ritmo; si acaba de acertar, da un golpe de guitarra.
function band(ctx, players, c, ms, bpm, centers) {
  const beat = Math.floor(ms / (60000 / bpm));
  players.forEach((p, i) => {
    const n = players.length, side = i < n / 2 ? -1 : 1;
    const x = Math.max(16, Math.min(W - 16, centers[i] + side * (n === 1 ? 70 : 44))), y = 196;
    const pr = c.players[p.slot];
    const hit = pr.last && pr.last.kind !== 'miss' && ms - pr.last.ms < 160;
    const pose = hit ? 'guit1' : ms < 0 ? 'idle0' : `win${beat % 2}`;
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(x, y, 14, 3, 0, 0, Math.PI * 2); ctx.fill();
    drawFrame(ctx, p.type, p.palette || 0, pose, x, y, -side);
  });
}

export function drawConcert(ctx, { concert: c, ms, level, players, bpm, opts = {}, title, ending }) {
  const bg = getBackground(level);
  ctx.drawImage(bg.near, 0, 0);
  // luces de escenario: barridos lentos cuya intensidad sigue al público
  const a = 0.08 + c.crowd * 0.22;
  for (let k = 0; k < 4; k++) {
    const sway = Math.sin(ms / 900 + k * 1.7) * 40;
    const x = 60 + k * 88;
    const g = ctx.createLinearGradient(x, 0, x + sway, H);
    g.addColorStop(0, `rgba(255,${k % 2 ? 120 : 200},80,${a})`); g.addColorStop(1, 'rgba(255,160,80,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 4, 0); ctx.lineTo(x + 4, 0); ctx.lineTo(x + sway + 36, H); ctx.lineTo(x + sway - 36, H); ctx.fill();
  }
  const n = players.length;
  const centers = players.map((_, i) => Math.round(W / 2 + (i - (n - 1) / 2) * Math.min(92, 360 / n)));
  band(ctx, players, c, ms, bpm, centers);
  players.forEach((p, i) => highway(ctx, c, p, centers[i], ms, opts, bpm));
  // cabecera: canción, progreso y medidor del público
  ctx.fillStyle = 'rgba(8,6,16,0.75)'; ctx.fillRect(0, 0, W, 24);
  drawText(ctx, title, 6, 4, { color: '#ffd23f' });
  ctx.fillStyle = '#2a2436'; ctx.fillRect(6, 15, 140, 3);
  ctx.fillStyle = '#cfc9e0'; ctx.fillRect(6, 15, Math.round(140 * Math.max(0, Math.min(1, ms / c.durationMs))), 3);
  drawText(ctx, 'PÚBLICO', W - 108, 4, { color: '#fff' });
  ctx.fillStyle = '#120c18'; ctx.fillRect(W - 108, 14, 100, 6);
  ctx.fillStyle = c.crowd > 0.66 ? '#3fdc7a' : c.crowd > 0.33 ? '#ffd23f' : '#ff4d4d';
  ctx.fillRect(W - 107, 15, Math.round(98 * c.crowd), 4);
  // leyenda de los carriles al empezar
  if (ms < 2600) {
    drawText(ctx, ms < 0 ? 'PREPARADOS…' : '¡A TOCAR!', W / 2, 96, { color: '#ffd23f', scale: 2, align: 'center' });
    LANE_NAMES.forEach((nm, l) => drawText(ctx, nm, W / 2 + (l - 1) * 60, 116, { color: LANE_COLORS[l], align: 'center' }));
  }
  if (ending) drawText(ctx, '¡CONCIERTO COMPLETADO!', W / 2, 96, { color: '#ffd23f', scale: 2, align: 'center' });
}
