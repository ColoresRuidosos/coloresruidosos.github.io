// Concierto final (F17): la banda en el escenario de la azotea y una autopista de 3 carriles por jugador.
import { W, H } from '../sim/constants.js';
import { SLOT_COLORS } from '../input/slots.js';
import { HEROES } from '../sim/moves.js';
import { drawText } from './text.js';
import { drawFrame } from './atlas.js';
import { drawDrumKit } from './drums.js';
import { getBackground } from './backgrounds.js';
import { multiplier } from '../sim/ritmo.js';

// F24: Tony no tiene instrumento propio: toca las PALMAS siguiendo la parte de la batería.
export const partOf = (parts, type) => parts[type] || parts.jota;
export const instrumentsWith = (inst) => ({ ...inst, tony: 'PALMAS' });

export const LANE_COLORS = ['#ff4d4d', '#3fa9ff', '#ffd23f'];   // los mismos colores que los botones del móvil
const LANE_NAMES = ['GOLPE', 'SALTO', 'ESPECIAL'];
const LANE_W = 15, TOP = 34, HIT_Y = 176, LOOK_MS = 1700;
const FEEDBACK = { perfect: ['¡PERFECTO!', '#ffd23f'], good: ['¡BIEN!', '#3fdc7a'], miss: ['FALLO', '#ff4d4d'] };

function laneX(cx, lane) { return Math.round(cx - LANE_W * 1.5 + lane * LANE_W); }

function highway(ctx, c, p, cx, ms, opts, bpm, instrument) {
  const x0 = laneX(cx, 0), w = LANE_W * 3;
  ctx.fillStyle = 'rgba(8,6,16,0.62)'; ctx.fillRect(x0 - 2, TOP, w + 4, H - TOP - 14);
  ctx.fillStyle = SLOT_COLORS[p.slot]; ctx.fillRect(x0 - 2, TOP, w + 4, 2);
  if (instrument) drawText(ctx, instrument, cx, H - 23, { color: SLOT_COLORS[p.slot], align: 'center' });
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
  for (let i = pr.next; i < pr.notes.length; i++) {
    const [t, l] = pr.notes[i];
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
  if (pr.combo >= 5) drawText(ctx, `RACHA ${pr.combo}${multiplier(pr.combo) > 1 ? ` X${multiplier(pr.combo)}` : ''}`, cx, TOP + 14, { color: '#fff', align: 'center' });
}

// Banda en el escenario: cada músico alterna dos poses al ritmo; si acaba de acertar, da un golpe de guitarra.
function band(ctx, players, c, ms, bpm, centers) {
  const beat = Math.floor(ms / (60000 / bpm));
  players.forEach((p, i) => {
    const n = players.length, side = i < n / 2 ? -1 : 1;
    const x = Math.max(16, Math.min(W - 16, centers[i] + side * (n === 1 ? 70 : 44)));
    const y = p.type === 'jota' ? 174 : 184;        // Jota, un poco más arriba, detrás de su batería
    const pr = c.players[p.slot];
    const hit = pr.last && pr.last.kind !== 'miss' && ms - pr.last.ms < 160;
    const jota = p.type === 'jota';
    const tony = p.type === 'tony';
    const pose = jota ? (ms < 0 ? 'idle0' : `sp${(beat + (hit ? 1 : 0)) % 4}`)
      : tony ? (ms > 0 && (hit || beat % 2 === 0) ? 'win0' : 'idle0')          // F24: Tony da palmas al ritmo
      : hit ? 'guit1' : ms < 0 ? 'idle0' : `win${beat % 2}`;
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(x, y, 14, 3, 0, 0, Math.PI * 2); ctx.fill();
    drawFrame(ctx, p.type, p.palette || 0, pose, x, y, -side);
    if (jota) {                                     // F22: Jota toca detrás de su batería
      const beatPos = ms > 0 ? (ms / (60000 / bpm)) % 1 : 1;
      drawDrumKit(ctx, x, y + 6, -side, hit ? 1 : Math.max(0, 1 - beatPos * 3));   // de cara al público, delante de él
    }
  });
}

// ---- Público masivo (F17 v2): cuatro filas en primer plano que botan al pulso, con contraluz de los focos.
// Cuanto más alto el medidor PÚBLICO, más brazos en alto, luces de móvil y, por encima del 80 %, confeti. Sin destellos rápidos.
const SKIN = ['#6b4a3a', '#7a5444', '#5a3c30', '#8a6250', '#4a3028'];
const HAIR = ['#120c18', '#2a1a14', '#3a2418', '#1a1420', '#5a4030', '#120c18'];
const SHIRT = ['#1c1626', '#3a1e2c', '#151320', '#2c2440', '#4a1a22', '#1e2a3a', '#2a2a2a', '#5a2a1a'];
const RIM = ['#ffb36b', '#ff6a8a', '#b38bff'];
function rnd(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
const ROWS = [{ n: 34, y: H - 40, s: 0.9 }, { n: 28, y: H - 30, s: 1.2 }, { n: 22, y: H - 18, s: 1.6 }, { n: 16, y: H - 2, s: 2.2 }];
const FANS = [];
ROWS.forEach((r, row) => {
  for (let i = 0; i < r.n; i++) FANS.push({ row, s: r.s, y: r.y, x: Math.round((i + rnd(row * 100 + i) * 0.9 - 0.2) * (W + 20) / r.n) - 10,
    k: rnd(row * 300 + i), j: rnd(row * 500 + i), h: rnd(row * 700 + i) });
});
const CONFETTI = Array.from({ length: 50 }, (_, i) => ({ x: rnd(900 + i) * W, v: 0.02 + rnd(950 + i) * 0.03, c: ['#ff4d4d', '#3fa9ff', '#ffd23f', '#3fdc7a', '#fff'][i % 5], d: rnd(990 + i) * 6 }));

// Cada persona es una silueta oscura (más oscura cuanto más cerca) con un filo de luz de los focos.
const TONES = ['#2a1a36', '#20142c', '#170e20', '#0e0816'];
function fan(ctx, f, ms, pulse, mood) {
  const s = f.s, tone = TONES[f.row];
  const hop = Math.round(pulse * (1 + f.row) * (f.k > 0.25 ? 1 : 0.3) * (0.4 + mood));
  const x = f.x + Math.round(Math.sin(ms / 800 + f.j * 6) * s), y = f.y - hop;
  const hw = Math.round(6 * s), headR = 4 * s, shoulderY = y - Math.round(8 * s);
  const rim = RIM[Math.floor(f.h * RIM.length)];
  ctx.fillStyle = tone; ctx.strokeStyle = tone; ctx.lineCap = 'round';
  // brazos en alto, en V, que se balancean
  if (f.k < 0.15 + mood * 0.7) {
    const sway = Math.sin(ms / 420 + f.j * 9) * 0.25;
    ctx.lineWidth = Math.max(2, 2.2 * s);
    const arm = (side) => {
      const ang = -Math.PI / 2 + side * (0.35 + sway * side);
      const ex = x + side * hw * 0.8 + Math.cos(ang) * 15 * s, ey = shoulderY + Math.sin(ang) * 15 * s;
      ctx.beginPath(); ctx.moveTo(x + side * hw * 0.8, shoulderY + 2); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.beginPath(); ctx.arc(ex, ey, 1.6 * s, 0, Math.PI * 2); ctx.fill();
      return [ex, ey];
    };
    const [hx, hy] = arm(-1);
    if (f.j > 0.45) arm(1);
    if (f.h < mood * 0.55) {                    // luz de móvil o mechero: un punto que brilla despacio
      ctx.globalAlpha = 0.65 + 0.35 * Math.sin(ms / 900 + f.j * 7);
      ctx.fillStyle = f.j > 0.75 ? '#ffcf6a' : '#f2f6ff';
      ctx.fillRect(Math.round(hx - 1), Math.round(hy - 2.5 * s), Math.max(2, Math.round(1.6 * s)), Math.max(2, Math.round(2.4 * s)));
      ctx.globalAlpha = 1; ctx.fillStyle = tone;
    }
  }
  // cuerpo: hombros redondeados y cabeza
  ctx.beginPath(); ctx.ellipse(x, shoulderY + 10 * s, hw + 1, 12 * s, 0, Math.PI, 0); ctx.fill();
  ctx.fillRect(x - hw - 1, Math.round(shoulderY + 10 * s) - 1, hw * 2 + 2, Math.round(30 * s));
  ctx.beginPath(); ctx.ellipse(x, shoulderY - headR * 0.55, headR * 0.85, headR, 0, 0, Math.PI * 2); ctx.fill();
  // filo de luz de los focos en la coronilla y un hombro
  ctx.fillStyle = rim; ctx.globalAlpha = 0.35 + mood * 0.35;
  ctx.fillRect(Math.round(x - headR * 0.45), Math.round(shoulderY - headR * 1.5), Math.max(2, Math.round(headR * 0.9)), Math.max(1, Math.round(s * 0.8)));
  ctx.fillRect(Math.round(x + (f.j > 0.5 ? 1 : -1) * hw * 0.3 - hw * 0.35), Math.round(shoulderY + 1), Math.round(hw * 0.7), Math.max(1, Math.round(s * 0.8)));
  ctx.globalAlpha = 1;
}

function crowd(ctx, c, ms, bpm, opts) {
  const beatPos = (ms / (60000 / bpm)) % 1;
  const pulse = ms > 0 ? Math.max(0, 1 - beatPos * 2.5) : 0;      // salto en cada pulso
  const mood = ms > 0 ? c.crowd : 0.3;
  // masa oscura de fondo, para que no se vea el suelo entre la gente
  const g0 = ctx.createLinearGradient(0, H - 52, 0, H);
  g0.addColorStop(0, 'rgba(14,8,22,0)'); g0.addColorStop(0.35, 'rgba(14,8,22,0.9)'); g0.addColorStop(1, '#0a0610');
  ctx.fillStyle = g0; ctx.fillRect(0, H - 52, W, 52);
  for (const f of FANS) fan(ctx, f, ms, pulse, mood);
  if (c.crowd > 0.8 && ms > 0 && opts.flashes !== false) for (const p of CONFETTI) {
    const y = ((ms * p.v + p.d * 40) % (H + 20)) - 10;
    ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x + Math.sin(ms / 500 + p.d) * 6), Math.round(y), 2, 3);
  }
}

export function drawConcert(ctx, { concert: c, ms, level, players, bpm, opts = {}, title, ending, instruments = {}, unisonAt = -1e9 }) {
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
  crowd(ctx, c, ms, bpm, opts);
  players.forEach((p, i) => highway(ctx, c, p, centers[i], ms, opts, bpm, instruments[p.type]));
  if (ms - unisonAt < 900) {
    const k = (ms - unisonAt) / 900;
    drawText(ctx, '¡TODOS A UNA!', W / 2, 60 - Math.round(k * 8), { color: '#ffd23f', scale: 2, align: 'center', shadow: '#a3242c' });
  }
  // cabecera: canción, progreso y medidor del público
  ctx.fillStyle = 'rgba(8,6,16,0.75)'; ctx.fillRect(0, 0, W, 24);
  drawText(ctx, title, 6, 4, { color: '#ffd23f' });
  if (players.length > 1) drawText(ctx, `BANDA ${String(c.bandScore).padStart(7, '0')}`, W / 2 + 34, 15, { color: '#fff', align: 'center' });
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
