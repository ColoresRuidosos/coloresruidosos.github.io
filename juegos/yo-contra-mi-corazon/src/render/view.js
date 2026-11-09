// Dibuja la pelea a 180×320: escenario, corazón, payaso, efectos y HUD.
import { spr } from './sprites.js';
import { drawText } from './text.js';
import { heartPose, clownPose } from '../game/poses.js';
import { HEART_HP, CLOWN_HP, STARS_MAX } from '../game/constants.js';

export const W = 180, H = 320;
export const HEART_POS = [40, 66], CLOWN_POS = [40, 186];
export const MIC_BTN = { x: 162, y: 266, r: 13 };
export const PAUSE_BTN = { x: 162, y: 36, w: 16, h: 14 };
const YEL = '#ffe25c';

// ---------- partículas y letreros (se alimentan de m.events) ----------
export function createFx() { return { parts: [], pops: [], shake: 0, flash: 0, rings: [], banner: null }; }

export function feedFx(fx, m, opts, sfx) {
  for (const e of m.events.splice(0)) {
    sfx?.(e);
    const [hx, hy] = HEART_POS;
    if (e.type === 'batazo') {
      confetti(fx, hx + 50, hy + 50, e.grade === 'perfecto' ? 18 : 10);
      pop(fx, e.grade === 'perfecto' ? '¡PERFECTO!' : e.grade === 'bien' ? 'BIEN' : 'FUERA DE TIEMPO', e.grade === 'perfecto' ? YEL : '#fff');
    } else if (e.type === 'esquiva') pop(fx, e.grade === 'perfecto' ? '¡ESQUIVA PERFECTA!' : e.grade === 'bien' ? 'ESQUIVA' : 'ESQUIVA TEMPRANA', e.grade === 'perfecto' ? YEL : '#cfe');
    else if (e.type === 'golpe') { fx.shake = opts.sinDestellos ? 3 : 8; if (!opts.sinDestellos) fx.flash = 0.25; pop(fx, '¡AUCH!', '#ff7080'); }
    else if (e.type === 'rebote') pop(fx, '¡TOC! ESPERA TU TURNO', '#aab');
    else if (e.type === 'caiste') pop(fx, '¡CAÍSTE EN LA FINTA!', '#ff9ac8');
    else if (e.type === 'finta') pop(fx, '¡ERA FINTA!', '#cfe');
    else if (e.type === 'estrella') pop(fx, e.stars === STARS_MAX ? '¡EL PÚBLICO PIDE GRITO!' : '¡EL PÚBLICO SE PRENDE!', YEL, 1);
    else if (e.type === 'grito') { fx.rings.push({ t: 0 }); fx.banner = { text: '¡GRITO!', t: 0, dur: 0.9, y: 236 }; }
    else if (e.type === 'transicion') fx.banner = { text: `¡FASE ${e.to}!`, t: 0, dur: 2.2 };
    else if (e.type === 'ko') { fx.banner = { text: '¡K.O.!', t: 0, dur: 99 }; confetti(fx, 90, 120, 60); }
    else if (e.type === 'decision') { fx.banner = { text: '¡GANAS!', t: 0, dur: 99 }; confetti(fx, 90, 120, 40); }
    else if (e.type === 'derrota') fx.banner = { text: 'SE ACABÓ EL SHOW', t: 0, dur: 99 };
    else if (e.type === 'perdio') fx.banner = { text: 'FIN DEL SHOW', t: 0, dur: 99 };
  }
}
const COLORS = ['#ffe25c', '#78dcff', '#ff78c8', '#ffffff', '#9cff7a'];
function confetti(fx, x, y, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = 30 + Math.random() * 70;
    fx.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: 0.8 + Math.random() * 0.5, c: COLORS[i % COLORS.length] });
  }
}
function pop(fx, text, color, row = 0) { fx.pops = fx.pops.filter((p) => p.row !== row); fx.pops.push({ text, color, t: 0, row }); }

export function stepFx(fx, dt) {
  for (const p of fx.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 160 * dt; p.life -= dt; }
  fx.parts = fx.parts.filter((p) => p.life > 0);
  for (const p of fx.pops) p.t += dt;
  fx.pops = fx.pops.filter((p) => p.t < 0.9);
  for (const r of fx.rings) r.t += dt;
  fx.rings = fx.rings.filter((r) => r.t < 0.8);
  fx.shake = Math.max(0, fx.shake - dt * 30);
  fx.flash = Math.max(0, fx.flash - dt);
  if (fx.banner) { fx.banner.t += dt; if (fx.banner.t > fx.banner.dur) fx.banner = null; }
}

// ---------- escena ----------
const LIGHT = { intro: 'rgba(20,10,40,0.35)', fase1: null, respiro: 'rgba(30,20,90,0.25)', alta: 'rgba(160,20,60,0.12)', cierre: 'rgba(20,10,40,0.3)' };

export function drawScene(ctx, m, t, fx, opts) {
  const c = m.clock, beatF = c.beatAt(t), onBeat = t >= 0 && (beatF - Math.floor(beatF)) * c.beat < 0.08;
  ctx.save();
  if (fx.shake > 0) ctx.translate(Math.round((Math.random() - 0.5) * fx.shake), Math.round((Math.random() - 0.5) * fx.shake));
  spr(ctx, 'stage', 0, 0);
  const sec = m.beatmap.sections.find((s) => t >= s.from && t < s.to);
  const tint = sec && LIGHT[sec.kind];
  if (tint) { ctx.fillStyle = tint; ctx.fillRect(0, 0, W, H); }
  if (sec?.kind === 'alta' && onBeat && !opts.sinDestellos) { ctx.fillStyle = 'rgba(255,240,200,0.06)'; ctx.fillRect(16, 0, 148, 240); }
  drawHeart(ctx, m, t, onBeat, opts);
  // payaso
  const cp = clownPose(m, t);
  let [cx, cy] = CLOWN_POS; cx += cp.dx;
  if (cp.shake) cx += Math.round(Math.sin(t * 90) * 2);
  spr(ctx, cp.pose, cx, cy);
  // público al frente: brinca con el ritmo (más con más estrellas)
  const bob = onBeat ? (m.stars >= 3 ? 3 : 1) : 0;
  spr(ctx, 'crowd', 0, 276 - bob);
  // efectos
  for (const p of fx.parts) { ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); }
  for (const r of fx.rings) {
    ctx.strokeStyle = YEL; ctx.lineWidth = 1; const rad = 8 + r.t * 120;
    ctx.beginPath(); ctx.ellipse(CLOWN_POS[0] + 30, CLOWN_POS[1] + 10, rad, rad * 0.6, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
  if (fx.flash > 0) { ctx.fillStyle = `rgba(255,40,60,${(fx.flash * 1.2).toFixed(2)})`; ctx.fillRect(0, 0, W, H); }
  drawHud(ctx, m, t, beatF);
  // letreros
  for (const p of fx.pops) drawText(ctx, p.text, W / 2, 58 + p.row * 11 - Math.round(p.t * 10), { color: p.color, align: 'center' });
  if (m.hint) {
    const blink = opts.sinDestellos || Math.floor(t * 4) % 2 === 0;
    ctx.fillStyle = 'rgba(10,8,18,0.75)'; ctx.fillRect(20, 176, 140, 16);
    if (blink) drawText(ctx, m.hint, W / 2, 181, { color: YEL, align: 'center' });
  }
  if (fx.banner) {
    const s = fx.banner.text.length > 10 ? 2 : 3;
    const by = fx.banner.y ?? 128;
    ctx.fillStyle = 'rgba(10,8,18,0.7)'; ctx.fillRect(0, by, W, 12 * s);
    drawText(ctx, fx.banner.text, W / 2, by + 2 + s, { color: YEL, scale: s, align: 'center' });
  }
  if (t < m.fase1 && t >= 0) {
    drawText(ctx, '¡A ESCENA!', W / 2, 140, { color: YEL, scale: 2, align: 'center' });
    drawText(ctx, 'ESQUIVA Y BATEA AL RITMO', W / 2, 162, { align: 'center' });
  }
}

function drawHeart(ctx, m, t, onBeat, opts) {
  const hp = heartPose(m, t);
  let [x, y] = HEART_POS;
  y += hp.lunge + (onBeat ? -1 : 0);
  if (hp.fx === 'transicion') x += Math.round(Math.sin(t * 40) * 2);
  if (hp.fx === 'ko') { const k = Math.min(1, (t - m.overAt) / 1.2); y += Math.round(k * k * 60); }
  if (hp.fx === 'abierto' || hp.fx === 'aturdido') x += Math.round(Math.sin(t * 6) * 2);
  const alpha = hp.fx === 'ko' ? Math.max(0, 1 - (t - m.overAt) / 1.6) : 1;
  if (m.phase >= 3 && hp.fx !== 'ko') {
    // fase 3: el corazón partido en dos mitades; la que ataca se adelanta
    const gap = 3 + (hp.side === 'izq' ? 0 : 0);
    const l = hp.side === 'izq' ? 5 : 0, r = hp.side === 'der' ? 5 : 0;
    spr(ctx, hp.pose, x - gap - l, y + l, { part: [0, 0, 50, 108] });
    spr(ctx, hp.pose, x + gap + r, y + r, { part: [50, 0, 50, 108] });
    spr(ctx, 'heart.curitas', x - gap - l, y + l, { part: [0, 0, 50, 108] });
    spr(ctx, 'heart.curitas', x + gap + r, y + r, { part: [50, 0, 50, 108] });
    ctx.fillStyle = '#1a0a16';
    for (let yy = 26; yy < 98; yy += 3) { ctx.fillRect(x + 50 - gap - l - 1, y + l + yy + ((yy / 3) % 2), 1, 2); ctx.fillRect(x + 50 + gap + r, y + r + yy + ((yy / 3) % 2), 1, 2); }
  } else {
    spr(ctx, hp.pose, x, y, { alpha });
    if (m.phase >= 2) spr(ctx, 'heart.curitas', x, y, { alpha });
  }
  // efectos de ataque
  if (hp.fx === 'latido') {
    const T = m.heart.hits[0].T, k = (t - T) / 0.25;
    ctx.strokeStyle = '#ffc85a'; ctx.lineWidth = 2;
    for (const d of [0, 10]) { ctx.beginPath(); ctx.ellipse(90, 150, 20 + k * 80 + d, 8 + k * 30 + d / 2, 0, 0, Math.PI * 2); ctx.stroke(); }
  }
  if (hp.fx === 'aorta') {
    ctx.strokeStyle = '#ff9678'; ctx.lineWidth = 4; ctx.beginPath();
    ctx.moveTo(x + 30, y + 14); ctx.quadraticCurveTo(x + 10, y + 120, x + 52, y + 150); ctx.stroke();
    ctx.strokeStyle = '#1a0a16'; ctx.lineWidth = 1; ctx.stroke();
  }
  if (hp.fx === 'aturdido' || hp.fx === 'transicion') {
    for (let i = 0; i < 3; i++) {
      const a = t * 5 + i * 2.1, sx = x + 50 + Math.cos(a) * 26, sy = y + 6 + Math.sin(a) * 6;
      ctx.fillStyle = YEL; ctx.fillRect(Math.round(sx) - 1, Math.round(sy), 3, 1); ctx.fillRect(Math.round(sx), Math.round(sy) - 1, 1, 3);
    }
  }
}

function bar(ctx, x, y, w, frac, col, rev = false) {
  ctx.fillStyle = '#1a0a16'; ctx.fillRect(x, y, w, 7);
  ctx.fillStyle = '#2c2238'; ctx.fillRect(x + 1, y + 1, w - 2, 5);
  const fw = Math.round((w - 2) * Math.max(0, Math.min(1, frac)));
  ctx.fillStyle = col; ctx.fillRect(rev ? x + w - 1 - fw : x + 1, y + 1, fw, 5);
}

function star(ctx, x, y, on) {
  ctx.fillStyle = on ? YEL : '#3c3248';
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const r = i % 2 ? 1.8 : 4, a = -Math.PI / 2 + i * Math.PI / 5; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
  ctx.fill();
}

export function drawHud(ctx, m, t, beatF) {
  ctx.fillStyle = 'rgba(10,8,18,0.92)'; ctx.fillRect(0, 0, W, 34);
  spr(ctx, 'icon.clown', 2, 2); spr(ctx, 'icon.heart', 148, 2);
  drawText(ctx, 'PAYASO', 34, 4);
  bar(ctx, 34, 13, 52, m.clown.hp / CLOWN_HP, m.clown.hp > 30 ? '#78e678' : '#ff7050');
  drawText(ctx, 'CORAZÓN', 146, 4, { align: 'right' });
  bar(ctx, 94, 13, 52, m.heart.hp[m.phase - 1] / HEART_HP[m.phase - 1], '#f03c50', true);
  drawText(ctx, 'F' + m.phase, 146, 22, { align: 'right', color: '#ff9aa8' });
  drawText(ctx, 'PÚBLICO', 34, 22, { color: YEL });
  for (let i = 0; i < STARS_MAX; i++) star(ctx, 83 + i * 9, 25.5, i < m.stars);
  // puntos
  drawText(ctx, String(m.score).padStart(6, '0'), 3, 37, { color: '#cfc8e0' });
  // tiempo restante y ritmo
  const left = Math.max(0, m.beatmap.duration - Math.max(0, t));
  drawText(ctx, `${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}`, W / 2, 37, { align: 'center', color: '#cfc8e0' });
  if (t >= 0) {
    const k = Math.floor(beatF / 2) % 4;
    for (let i = 0; i < 4; i++) { ctx.fillStyle = i === k ? YEL : '#5a5070'; ctx.fillRect(W / 2 - 13 + i * 7, 47, i === k ? 4 : 3, i === k ? 4 : 3); }
  }
  // pausa
  ctx.fillStyle = 'rgba(10,8,18,0.7)'; ctx.fillRect(PAUSE_BTN.x - 8, PAUSE_BTN.y, PAUSE_BTN.w, PAUSE_BTN.h);
  ctx.fillStyle = '#fff'; ctx.fillRect(PAUSE_BTN.x - 4, PAUSE_BTN.y + 3, 2, 8); ctx.fillRect(PAUSE_BTN.x + 1, PAUSE_BTN.y + 3, 2, 8);
  // botón del micrófono (Grito)
  const full = m.stars >= STARS_MAX, { x, y, r } = MIC_BTN;
  ctx.fillStyle = full ? 'rgba(80,30,110,0.95)' : 'rgba(30,24,40,0.7)';
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = full ? YEL : '#5a5070'; ctx.lineWidth = full && Math.floor(t * 4) % 2 ? 2 : 1; ctx.stroke();
  ctx.fillStyle = full ? '#e6e6f0' : '#6a6080';
  ctx.fillRect(x - 2, y - 7, 5, 8); ctx.fillRect(x, y + 1, 1, 4); ctx.fillRect(x - 3, y + 5, 7, 1);
  if (full) drawText(ctx, 'GRITO', x, y - r - 9, { color: YEL, align: 'center' });
}
