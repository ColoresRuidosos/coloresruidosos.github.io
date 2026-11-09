// main.js — Ciencia Ruidosa #1 · "Cuerpo de neón": un modelo, una cámara, la música manda
import { mulberry } from '/core/lib.js';
import { TEXTS } from './content.js';
import { SECS, DUR, DROP, PREDROP, CAM, HEARTBEATS, sec } from './timeline.js';

const cv = document.getElementById('c'), out = cv.getContext('2d'), W = 1080, H = 1920;
const buf = document.createElement('canvas'); buf.width = W; buf.height = H; const g = buf.getContext('2d');
const PINK = '#ff3e7f', CYAN = '#5fe3ff', BLUE = '#6f8bff', RED = '#ff4d6d', YEL = '#ffd23f';
const COL = { pink: PINK, red: RED, blue: BLUE, yellow: YEL };
const clamp = (x, a, b) => x < a ? a : x > b ? b : x, ss = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const eo = x => 1 - Math.pow(1 - clamp(x, 0, 1), 3), back = x => { x = clamp(x, 0, 1); const s = 1.9; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
const musicOn = t => !(t >= 9.5 && t < 14) && !(t >= PREDROP && t < DROP);

// —— Modelo del cuerpo (mitad derecha; alto 1000) ——
const R = [[0,0],[55,10],[78,55],[80,110],[70,160],[45,195],[30,215],[32,242],[95,262],[140,282],[160,322],[170,420],[178,520],[185,610],[192,680],[197,722],[186,760],[166,764],[155,732],[150,640],[140,520],[128,420],[116,362],[112,450],[106,540],[116,600],[125,652],[118,760],[106,880],[96,985],[112,1008],[62,1016],[50,990],[44,880],[34,760],[14,684],[0,676]];
const OUT = [...R, ...R.slice(1, -1).reverse().map(([x, y]) => [-x, y])];
function crPath(pts, closed = true, k = .5) {
  const P = closed ? [pts.at(-1), ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts.at(-1)];
  const p = new Path2D(); p.moveTo(...pts[0]);
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    p.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * k / 3, p1[1] + (p2[1] - p0[1]) * k / 3, p2[0] - (p3[0] - p1[0]) * k / 3, p2[1] - (p3[1] - p1[1]) * k / 3, p2[0], p2[1]);
  }
  if (closed) p.closePath(); return p;
}
const BODY = crPath(OUT);
const HEART_C = [-26, 395];
const HEART = (() => { const p = new Path2D(); const x = -26, y = 372, s = 30;
  p.moveTo(x, y + s * .35); p.bezierCurveTo(x - s * .1, y - s * .35, x - s, y - s * .2, x - s * .55, y + s * .45);
  p.lineTo(x, y + s); p.lineTo(x + s * .55, y + s * .45); p.bezierCurveTo(x + s, y - s * .2, x + s * .1, y - s * .35, x, y + s * .35); return p; })();
const LUNGS = [crPath([[-18,300],[-60,310],[-88,360],[-92,440],[-70,480],[-30,470],[-22,400]]), crPath([[18,300],[60,310],[88,360],[92,440],[70,480],[30,470],[22,400]])];
const BRAIN = crPath([[0,52],[30,48],[56,62],[66,88],[60,112],[38,126],[0,128],[-38,126],[-60,112],[-66,88],[-56,62],[-30,48]]);
const GYRI = (() => { const o = [];
  for (const side of [-1, 1]) for (let k = 1; k <= 3; k++) { const pts = [], f = 1 - k * .22, cx = side * 31, cy = 88;
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, w = 1 + .12 * Math.sin(a * (5 + k) + k); pts.push([cx + Math.cos(a) * 30 * f * w, cy + Math.sin(a) * 36 * f * w]); }
    o.push(crPath(pts)); }
  o.push(crPath([[0,54],[2,70],[-2,86],[1,102],[0,124]], false)); return o; })();
const CAUDATE = [[-21, 84], [21, 84]], ACCUMBENS = [[-9, 106], [9, 106]];
const VEINS = (() => { const o = [], sym = p => [p, p.map(([x, y]) => [-x, y])];
  for (const r of [[[-26,380],[-70,300],[-125,300],[-150,400],[-160,500],[-176,640],[-184,700]], [[-26,380],[-10,300],[-14,240],[-22,190]],
    [[-26,380],[-8,470],[-6,600],[-30,660],[-62,760],[-72,880],[-78,980]], [[-145,420],[-138,460],[-150,560],[-166,640]], [[-48,700],[-58,800],[-60,900],[-70,975]]])
    for (const p of sym(r)) o.push(crPath(p, false));
  return o; })();

// —— Dibujo con brillo ——
let S = 1;
function neon(path, col, w = 4, glow = 1, core = '#ffffff') {
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineJoin = g.lineCap = 'round';
  for (const [lw, a, blur] of [[w * 6, .10 * glow, 60], [w * 2.6, .35 * glow, 26], [w, 1, 8]]) {
    g.strokeStyle = col; g.globalAlpha = Math.min(1, a); g.lineWidth = lw / S; g.shadowColor = col; g.shadowBlur = blur; g.stroke(path);
  }
  g.globalAlpha = .8 * Math.min(1, glow + .3); g.shadowBlur = 0; g.strokeStyle = core; g.lineWidth = w * .35 / S; g.stroke(path); g.restore();
}
function glowDot(x, y, r, col, a = 1) {
  if (a <= 0 || r <= 0) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(.25, col + 'aa'); gr.addColorStop(1, col + '00');
  g.globalAlpha = Math.min(1, a); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.restore();
}
function camAt(t) {
  let i = 0; while (i < CAM.length - 2 && t >= CAM[i + 1][0]) i++;
  const [t0, x0, y0, s0] = CAM[i], [t1, x1, y1, s1] = CAM[i + 1], u = ss((t - t0) / (t1 - t0));
  const ls = Math.log(s0) + (Math.log(s1) - Math.log(s0)) * u;    // zoom en escala logarítmica: velocidad pareja
  return [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, Math.exp(ls)];
}
function setCam([cx, cy, sc]) { g.setTransform(sc, 0, 0, sc, W / 2 - cx * sc, H / 2 - cy * sc); S = sc; }
const toScreen = ([cx, cy, sc], [x, y]) => [W / 2 + (x - cx) * sc, H / 2 + (y - cy) * sc];

function background(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  const bg = g.createRadialGradient(W / 2, H * .55, 50, W / 2, H * .55, H * .75);
  bg.addColorStop(0, '#2a1170'); bg.addColorStop(.45, '#170a4d'); bg.addColorStop(1, '#06041a');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const r = mulberry(3);
  for (let i = 0; i < 14; i++) { const x = r() * W, y = r() * H, rr = 60 + r() * 160; glowDot(x + Math.sin(t * .2 + i) * 20, y, rr, ['#3b1fa8', '#5b1f8a', '#1f2fa8'][i % 3], .25); }
  for (let i = 0; i < 160; i++) { const x = r() * W, y = (r() * H - t * (6 + 10 * r())) % H; g.fillStyle = `rgba(200,210,255,${.15 + r() * .5})`; const s = r() < .1 ? 2.4 : 1.2; g.fillRect(x, (y + H) % H, s, s); }
}
// latido: envolvente desde el último latido
function beatEnv(t) { let last = -9; for (const b of HEARTBEATS) { if (b <= t) last = b; else break; } return Math.exp(-(t - last) / .12); }
function breath(t) { const rate = musicOn(t) ? 1.6 : .55; return Math.sin(t * rate * Math.PI * 2 / 2) * .5 + .5; }

function waves(t) {                                   // ondas que bajan sobre la cabeza, una por pulso
  if (!musicOn(t) && !(t >= 9.5 && t < 10.2)) return;
  if (S > 2) return;                                  // solo en planos abiertos
  for (let k = 0; k < 4; k++) {
    const tb = Math.floor(t * 2) / 2 - k * .5, age = t - tb; if (age < 0 || age > 2) continue;
    if (!musicOn(tb)) continue;
    const r = 120 + age * 230, a = Math.max(0, 1 - age / 2), p = new Path2D(); p.arc(0, -320, r, Math.PI * .3, Math.PI * .7);
    neon(p, PINK, 2.4, .9 * a);
  }
}
function anatomy(t, o = {}) {
  g.save(); g.clip(BODY);
  const gr = g.createLinearGradient(0, 0, 0, 1000); gr.addColorStop(0, 'rgba(90,110,255,.22)'); gr.addColorStop(1, 'rgba(120,60,220,.12)');
  g.fillStyle = gr; g.fillRect(-300, -50, 600, 1100);
  const be = beatEnv(t);
  for (const v of VEINS) neon(v, RED, 1.1, .45 + .5 * be, '#ffb3c0');
  g.restore();
  const br = 1 + .035 * breath(t);
  for (const l of LUNGS) { g.save(); g.translate(0, 390); g.scale(br, br); g.translate(0, -390); neon(l, BLUE, 1.6, .5 + .2 * breath(t)); g.restore(); }
  neon(crPath([[0,215],[0,420],[0,560],[0,650]], false), CYAN, 1.2, .5);
  neon(BRAIN, PINK, 2, .8 + (o.brain || 0));
  for (const gy of GYRI) neon(gy, PINK, 1, .45 + (o.brain || 0) * .5, '#ffc2d6');
  const hb = 1 + .16 * be;
  g.save(); g.translate(...HEART_C); g.scale(hb, hb); g.translate(-HEART_C[0], -HEART_C[1]);
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,60,100,${.35 + .4 * be})`; g.fill(HEART); g.restore();
  neon(HEART, RED, 2.4, .8 + .8 * be, '#ffd0d8'); g.restore();
  glowDot(HEART_C[0], HEART_C[1], 60 + 40 * be, PINK, .35 + .45 * be);
  // núcleos: caudado (anticipación) y accumbens (clímax)
  const ca = o.caudate || 0, ac = o.accumbens || 0;
  for (const [x, y] of CAUDATE) { glowDot(x, y, 10 + 12 * ca, YEL, .25 + .75 * ca); }
  for (const [x, y] of ACCUMBENS) { glowDot(x, y, 8 + 14 * ac, PINK, .2 + .8 * ac); }
  neon(BODY, CYAN, 3.2, 1 + (o.body || 0));
}
// partículas de dopamina: del tallo cerebral hacia el núcleo activo
function dopamine(t) {
  if (t < 14.4 || t >= 23.2) return;
  const r = mulberry(77), climax = t >= DROP, n = Math.floor(clamp((t - 14.4) / 4, 0, 1) * 70) + (climax ? 50 : 0);
  for (let i = 0; i < n; i++) {
    const seed = r(), side = i % 2 ? 1 : -1, per = climax ? .8 : 1.4, ph = ((t + seed * per) % per) / per;
    const tg = (climax ? ACCUMBENS : CAUDATE)[side > 0 ? 1 : 0];
    const sx = side * (14 + r() * 30), sy = 150 + r() * 10, mx = sx * .5 + side * 20 * r(), my = 120 - r() * 20;
    const u = eo(ph), x = (1 - u) * (1 - u) * sx + 2 * (1 - u) * u * mx + u * u * tg[0], y = (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * my + u * u * tg[1];
    glowDot(x + (r() - .5) * 6 * u, y + (r() - .5) * 6 * u, 1.4 + r() * 1.4, i % 3 ? YEL : PINK, .9 * Math.sin(ph * Math.PI) + .1);
  }
}
function ecg(t) {                                      // electro abajo, en el pulso y el silencio
  if (t < 3.8 || t >= 14.2) return;
  const a = clamp((t - 3.8) / .4, 0, 1) * clamp((14.2 - t) / .3, 0, 1);
  g.setTransform(1, 0, 0, 1, 0, 0); S = 1;
  const p = new Path2D(), y0 = 1360;
  for (let x = 80; x <= 1000; x += 3) {
    const tau = t - (1000 - x) / 380; let v = 0;
    for (const b of HEARTBEATS) { const d = tau - b; if (d > -.06 && d < .2) v += (d < 0 ? 0 : d < .03 ? -d / .03 * 90 : d < .06 ? -90 + (d - .03) / .03 * 130 : d < .09 ? 40 - (d - .06) / .03 * 40 : 0); }
    v += Math.sin(tau * 3) * 2;
    x === 80 ? p.moveTo(x, y0 + v) : p.lineTo(x, y0 + v);
  }
  neon(p, musicOn(t) ? RED : BLUE, 3, a);
  const tip = new Path2D(); glowDot(1000, y0, 18, '#ffffff', a * .8);
}

// —— Antebrazo (escena de los escalofríos, en pantalla) ——
const ARM_TOP = [[-80,1240],[180,1150],[420,1060],[600,990]];
const ARM_BOT = [[690,1150],[470,1230],[220,1330],[-80,1440]];
const HANDP = [[600,990],[640,930],[690,880],[730,880],[722,920],[700,960],[760,930],[850,870],[880,880],[868,900],[790,965],
  [800,985],[900,940],[924,952],[910,972],[812,1020],[812,1040],[900,1012],[918,1026],[902,1044],[810,1074],[800,1092],[870,1078],[880,1094],[862,1106],[780,1126],[690,1150]];
const ARMSHAPE = crPath([...ARM_TOP, ...HANDP.slice(1), ...ARM_BOT.slice(1)], true, .35);
const HAIRS = (() => { const r = mulberry(21), o = [];
  for (const [edge, side] of [[ARM_TOP, -1], [ARM_BOT, 1]]) for (let i = 0; i < edge.length - 1; i++) {
    const [x0, y0] = edge[i], [x1, y1] = edge[i + 1], L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
    for (let d = 10; d < L - 10; d += 16) { const x = x0 + (x1 - x0) * d / L + (r() - .5) * 4, y = y0 + (y1 - y0) * d / L;
      o.push({ x, y, nx: nx * side, ny: ny * side, h: 18 + r() * 22, w1: (r() - .5) * 8, w2: (r() - .5) * 10, col: r() < .5 ? PINK : YEL, along: clamp((x + 80) / 760, 0, 1) }); }
  }
  return o; })();
function arm(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); S = 1;
  const dy = Math.sin(t * 1.3) * 6;
  g.translate(0, dy);
  g.save(); g.clip(ARMSHAPE);
  const gr = g.createLinearGradient(0, 900, 900, 1300); gr.addColorStop(0, 'rgba(90,110,255,.25)'); gr.addColorStop(1, 'rgba(160,60,220,.18)');
  g.fillStyle = gr; g.fillRect(-100, 800, 1100, 700);
  const be = beatEnv(t);
  neon(crPath([[-80,1340],[200,1250],[420,1150],[620,1070],[700,1040]], false), RED, 3, .5 + .4 * be, '#ffb3c0');
  neon(crPath([[160,1265],[300,1240],[460,1170]], false), RED, 2, .4 + .3 * be, '#ffb3c0');
  g.restore();
  neon(ARMSHAPE, CYAN, 5, 1);
  for (const h of HAIRS) {                             // ola de piel de gallina: del codo a la mano, con rebote
    const k = back((t - 23.35 - h.along * .9) / .35), ht = h.h * (.15 + .85 * k);
    const p = new Path2D(); p.moveTo(h.x, h.y);
    const lean = 1 - k;                                 // acostados → de pie
    const tx = h.x + h.nx * ht + (h.ny ? -h.ny : 0) * ht * .8 * lean + h.w2, ty = h.y + h.ny * ht + h.nx * ht * .8 * lean;
    p.quadraticCurveTo((h.x + tx) / 2 + h.w1, (h.y + ty) / 2, tx, ty);
    neon(p, h.col, 2, .4 + .5 * k, '#fff2c4');
    glowDot(h.x - h.nx * 6, h.y - h.ny * 6, 3 + 3 * k, PINK, .3 + .5 * k);
  }
}

// —— Textos ——
let TX = [];
function textBlock(x, t) {
  const fade = eo((t - x.t0) / .25), rise = (1 - fade) * 18;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  if (x.kind === 'badge') {
    g.font = '700 30px SG'; const s = x.lines[0], w = g.measureText(s).width + 44;
    g.fillStyle = 'rgba(7,5,26,.7)'; g.beginPath(); g.roundRect(60, 112, w, 50, 25); g.fill();
    g.strokeStyle = PINK; g.lineWidth = 2; g.stroke(); g.fillStyle = '#ffd6e4'; g.textAlign = 'left'; g.fillText(s, 82, 147);
    TX.push({ id: x.id, text: s, x0: 60, y0: 112, x1: 60 + w, y1: 162 }); return;
  }
  if (x.kind === 'head') {
    let size = x.size; g.font = `800 ${size}px Syne`;
    const mw = Math.max(...x.lines.map(l => g.measureText(l).width)); if (mw > 940) { size = Math.floor(size * 940 / mw); g.font = `800 ${size}px Syne`; }
    const col = COL[x.color];
    x.lines.forEach((s, i) => { const y = x.y + i * size * 1.08 + rise;
      g.save(); g.globalAlpha = fade * .7; g.shadowColor = col; g.shadowBlur = 34; g.fillStyle = col; g.fillText(s, W / 2, y); g.restore();
      g.globalAlpha = fade; g.fillStyle = '#ffffff'; g.fillText(s, W / 2, y); });
    const w = Math.min(940, mw); TX.push({ id: x.id, text: x.lines.join(' '), x0: W / 2 - w / 2, y0: x.y - size, x1: W / 2 + w / 2, y1: x.y + (x.lines.length - 1) * size * 1.08 + 10 }); return;
  }
  if (x.kind === 'body') {
    g.font = '500 46px SG'; g.globalAlpha = fade;
    if (x.y > 1000) { const w0 = Math.max(...x.lines.map(l => g.measureText(l).width)); g.fillStyle = 'rgba(7,5,26,.8)'; g.beginPath(); g.roundRect(W / 2 - w0 / 2 - 26, x.y - 48 + rise, w0 + 52, 66, 33); g.fill(); }
    x.lines.forEach((s, i) => { const y = x.y + i * 58 + rise;
      g.save(); g.shadowColor = '#07051a'; g.shadowBlur = 18; g.fillStyle = '#eef1ff'; g.fillText(s, W / 2, y); g.restore(); });
    const w = Math.max(...x.lines.map(l => g.measureText(l).width));
    TX.push({ id: x.id, text: x.lines.join(' '), x0: W / 2 - w / 2, y0: x.y - 46, x1: W / 2 + w / 2, y1: x.y + (x.lines.length - 1) * 58 + 12 }); g.globalAlpha = 1; return;
  }
  if (x.kind === 'src') {
    g.font = '500 28px SG'; const s = x.lines[0], w = g.measureText(s).width;
    g.globalAlpha = fade; g.fillStyle = 'rgba(7,5,26,.8)'; g.beginPath(); g.roundRect(W / 2 - w / 2 - 22, 1546, w + 44, 48, 24); g.fill();
    g.globalAlpha = fade * .9; g.fillStyle = '#c9d4ff'; g.fillText(s, W / 2, 1580);
    TX.push({ id: x.id, text: s, x0: W / 2 - w / 2, y0: 1552, x1: W / 2 + w / 2, y1: 1590 }); g.globalAlpha = 1; return;
  }
  if (x.kind === 'cta') {
    const pop = back((t - x.t0) / .35), size = 52; g.font = `700 ${size}px SG`; const s = x.lines[0];
    const w = g.measureText(s).width + 64, h = size * 1.6, sc = .6 + .4 * pop;
    g.save(); g.translate(W / 2, x.y); g.scale(sc, sc);
    g.shadowColor = PINK; g.shadowBlur = 44; g.fillStyle = PINK; g.beginPath(); g.roundRect(-w / 2, -h * .68, w, h, h / 2); g.fill();
    g.shadowBlur = 0; g.fillStyle = '#141414'; g.fillText(s, 0, size * .14); g.restore();
    TX.push({ id: x.id, text: s, x0: W / 2 - w / 2, y0: x.y - h * .68, x1: W / 2 + w / 2, y1: x.y + h * .32 });
  }
}
function label(x, t, cam, pts, col) {
  const fade = eo((t - x.t0) / .3), [sx, sy] = toScreen(cam, pts[1]);
  const lx = 900, ly = 1250, s = x.lines[0];
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = fade; g.strokeStyle = col; g.lineWidth = 3;
  g.beginPath(); g.moveTo(sx + 14, sy + 14); g.lineTo(lx - 60, ly); g.lineTo(lx + 100, ly); g.stroke();
  g.font = '700 34px SG'; g.textAlign = 'right'; const w = g.measureText(s).width;
  g.fillStyle = 'rgba(7,5,26,.8)'; g.beginPath(); g.roundRect(lx + 100 - w - 14, ly - 50, w + 28, 46, 12); g.fill();
  g.fillStyle = col; g.fillText(s, lx + 100, ly - 14); TX.push({ id: x.id, text: s, x0: lx + 100 - w, y0: ly - 46, x1: lx + 100, y1: ly - 6 });
  g.globalAlpha = 1;
}
function brand() {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  ['#ff3e7f', '#2f5bff', '#ffd23f', '#1fb57a', '#ff7a30'].forEach((c, i) => { g.fillStyle = c; g.fillRect(i * W / 5, 0, W / 5, 10); });
  g.font = '500 30px SG'; g.textAlign = 'center'; g.fillStyle = 'rgba(7,5,26,.75)'; g.beginPath(); g.roundRect(W / 2 - 150, 1722, 300, 52, 26); g.fill();
  g.fillStyle = 'rgba(255,143,179,.85)'; g.fillText('@coloresruidosos', W / 2, 1760);
}

// —— Escena por tiempo ——
function bodyScene(t) {
  const cam = camAt(t); setCam(cam);
  waves(t);
  const ca = t >= 14.6 && t < DROP + .3 ? ss((t - 15.2) / 2.5) * (t < DROP ? 1 : 1 - ss((t - DROP) / .3)) : 0;
  const ac = t >= DROP && t < 28 ? ss((t - DROP) / .25) : t >= 28 ? .7 : 0;
  anatomy(t, { caudate: ca, accumbens: ac, brain: t >= DROP ? .5 : 0, body: t >= 28 ? .4 : 0 });
  dopamine(t);
  return cam;
}
function draw(t) {
  TX = [];
  background(t);
  let cam = null;
  const S0 = sec(t).id;
  if (S0 === 'chills') arm(t); else cam = bodyScene(t);
  ecg(t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  const band = g.createLinearGradient(0, 0, 0, 640); band.addColorStop(0, 'rgba(7,5,26,.92)'); band.addColorStop(.62, 'rgba(7,5,26,.78)'); band.addColorStop(1, 'rgba(7,5,26,0)');
  g.fillStyle = band; g.fillRect(0, 0, W, 640);
  for (const x of TEXTS) {
    if (t < x.t0 || t >= x.t1) continue;
    if (x.kind === 'label') { if (cam) label(x, t, cam, x.id === 'l2a' ? CAUDATE : ACCUMBENS, x.id === 'l2a' ? YEL : PINK); continue; }
    textBlock(x, t);
  }
  brand();
}
// barrido (whip) hacia el brazo y destello al final
function compose(t) {
  out.setTransform(1, 0, 0, 1, 0, 0); out.globalAlpha = 1; out.globalCompositeOperation = 'source-over';
  const w0 = 22.75, w1 = 23.25;
  if (t >= w0 && t < w1) {
    const out_ = t < 23, u = out_ ? (t - w0) / (23 - w0) : (t - 23) / (w1 - 23);
    const off = out_ ? -Math.pow(u, 2) * W * 1.1 : (1 - eo(u)) * W * 1.1, dir = out_ ? 1 : -1, sp = out_ ? u : 1 - u;
    out.fillStyle = '#07051a'; out.fillRect(0, 0, W, H);
    for (let i = 5; i >= 0; i--) { out.globalAlpha = i ? .14 : 1; out.drawImage(buf, off + i * dir * 60 * sp, 0); }
    out.globalAlpha = 1;
  } else out.drawImage(buf, 0, 0);
  if (t >= 28 && t < 28.45) { out.globalCompositeOperation = 'lighter'; out.globalAlpha = (1 - (t - 28) / .45) * .85; out.fillStyle = '#ff8fb3'; out.fillRect(0, 0, W, H); out.globalAlpha = 1; out.globalCompositeOperation = 'source-over'; }
}

// —— Eventos de sonido ——
function buildEV() {
  const ev = SECS.map(s => ({ t: s.t0, type: 'section', id: s.id, music: s.music, t1: s.t1 }));
  for (const b of HEARTBEATS) ev.push({ t: b, type: 'heart', solo: !musicOn(b) });
  for (const x of TEXTS) if (x.kind === 'head' || x.kind === 'cta') ev.push({ t: x.t0, type: 'title' });
  for (const x of TEXTS) if (x.kind === 'label') ev.push({ t: x.t0, type: 'tick' });
  for (let t = 15; t < 23; t += .25) ev.push({ t, type: 'sparkle', climax: t >= DROP });
  ev.push({ t: 22.6, type: 'whoosh' }, { t: 23.35, type: 'shimmer' }, { t: 28, type: 'flash' });
  return ev.sort((a, b) => a.t - b.t);
}
window.SUBS = TEXTS.filter(x => x.kind !== 'badge' && x.kind !== 'label').map(x => ({ t0: x.t0, t1: x.t1, text: x.lines.join(' ') }));
window.DUR = DUR;
window.EV = buildEV();
window.render = t => { t = clamp(t, 0, DUR - 1e-6); draw(t); compose(t); };
window.TEXTS = t => { draw(clamp(t, 0, DUR - 1e-6)); return TX; };
await document.fonts.load('800 80px Syne'); await document.fonts.load('500 40px SG'); await document.fonts.load('700 40px SG');
window.render(0); window.READY = true;
