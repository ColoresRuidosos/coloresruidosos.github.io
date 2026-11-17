// v10 · Dibujo del Mundo 3 «Alba» (spec §3.0f Q): noria, atriles, recuerdos, luz, bancas, la Nostalgia y el sepia.
// Usa las hojas de Gemini recortadas (src/data/*-atlas.js). La lógica vive en src/game/alba.js y nostalgia.js.
import { W, H, TILE, ALBA as K } from '../game/constants.js';
import { cabinTops } from '../game/alba.js';
import { PASAJES } from '../data/alba-story.js';
import { letraDe } from '../data/alba-letras.js';
import { text, wrap } from './draw.js';
import { NOSTALGIA_META, NOSTALGIA_PNG } from '../data/nostalgia-atlas.js';
import { RECUERDO_META, RECUERDO_PNG } from '../data/recuerdo-atlas.js';
import { NORIA_META, NORIA_PNG } from '../data/noria-atlas.js';
import { LUZ_META, LUZ_PNG } from '../data/luz-atlas.js';
import { FERIA_META, FERIA_PNG } from '../data/feria-atlas.js';
import { ATRIL_META, ATRIL_PNG } from '../data/atril-atlas.js';
import { PEPEALBA_META, PEPEALBA_PNG } from '../data/pepeAlba-atlas.js';

const rect = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
let S = null;
function sheets() {
  if (S) return S;
  const mk = (png, meta) => ({ img: Object.assign(new Image(), { src: png }), meta });
  S = { nos: mk(NOSTALGIA_PNG, NOSTALGIA_META), rec: mk(RECUERDO_PNG, RECUERDO_META), noria: mk(NORIA_PNG, NORIA_META),
    luz: mk(LUZ_PNG, LUZ_META), feria: mk(FERIA_PNG, FERIA_META), atril: mk(ATRIL_PNG, ATRIL_META), pepe: mk(PEPEALBA_PNG, PEPEALBA_META) };
  return S;
}
// Fotograma con ancla en los pies (x, y); si la imagen aún no carga, no dibuja nada.
function spr(ctx, sheet, key, x, y, flip = false) {
  const f = sheet.meta.frames[key];
  if (!f || !(sheet.img.complete && sheet.img.naturalWidth)) return false;
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); if (flip) ctx.scale(-1, 1);
  ctx.drawImage(sheet.img, f.x, f.y, f.w, f.h, -f.ax, -f.ay, f.w, f.h); ctx.restore();
  return true;
}
const frame = (sheet, anim, t, fps) => { const a = sheet.meta.anims[anim]; return a ? a[Math.floor(t * fps) % a.length] : null; };

// Pieza del Mundo 3: un sol pequeño.
export function drawSolPiece(ctx, x, y, t, r = 5) {
  ctx.fillStyle = '#e8a020';
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + t; rect(ctx, '#ffd040', x + Math.cos(a) * (r + 2) - 1, y + Math.sin(a) * (r + 2) - 1, 2, 2); }
  ctx.beginPath(); ctx.arc(Math.round(x), Math.round(y), r, 0, Math.PI * 2); ctx.fill();
  rect(ctx, '#fff8b0', x - 2, y - 2, 2, 2);
}

// Luz del Alba (objeto): enciende las plataformas de luz un rato.
export function drawLuz(ctx, it, t) {
  const s = sheets(), y = it.y + Math.round(Math.sin(t * 3) * 2);
  if (!spr(ctx, s.luz, frame(s.luz, 'luzAlba', t, 6), it.x, y + 7)) drawSolPiece(ctx, it.x, y, t, 6);
}

// Capa del mundo: va después de las baldosas y antes de Pepe (coordenadas del nivel).
export function drawAlbaWorld(ctx, g, t, flashes = true) {
  const A = g.alba, L = g.level, s = sheets();
  // Plataformas de luz: encendidas (doradas) o apagadas (solo un contorno punteado).
  for (const { tx, ty } of L.lights) {
    const x = tx * TILE, y = ty * TILE, on = L.grid[ty][tx] === '=';
    if (on) {
      rect(ctx, '#8a6420', x, y, 16, 6); rect(ctx, '#ffd040', x, y + 1, 16, 4); rect(ctx, '#fff8b0', x, y + 1, 16, 1);
      if (A.luzT > 0 && A.luzT < 2 && flashes && Math.floor(t * 8) % 2) rect(ctx, '#fff8b0', x, y, 16, 6);   // aviso: se apaga
    } else for (let k = 0; k < 16; k += 4) rect(ctx, '#e8d8a8', x + k, y + 2, 2, 1);
  }
  // Bancas (sentarse te protege de la nostalgia).
  for (const b of A.bancas) if (!spr(ctx, s.feria, 'banca0', b.x, b.y)) { rect(ctx, '#5a3a1e', b.x - 14, b.y - 12, 28, 4); rect(ctx, '#5a3a1e', b.x - 12, b.y - 8, 2, 8); rect(ctx, '#5a3a1e', b.x + 10, b.y - 8, 2, 8); }
  // Atriles con los pasajes.
  for (const p of A.pasajes) {
    if (!spr(ctx, s.atril, p.read ? 'atrilLeido0' : 'atrilNormal0', p.x, p.y)) { rect(ctx, '#5a3a1e', p.x - 1, p.y - 20, 3, 20); rect(ctx, p.read ? '#e8b84a' : '#f4eee0', p.x - 7, p.y - 26, 14, 8); }
    if (!p.read) text(ctx, '♪', p.x, p.y - 38 + Math.round(Math.sin(t * 3 + p.x) * 2), { align: 'center', color: '#ffd040' });
  }
  // La Maldita Rueda: aro, rayos y cabinas (las cabinas se dibujan por código para que el borde coincida con la física).
  for (const w of A.wheels) {
    // Patas en «A» desde el eje hasta el suelo.
    const tx = Math.floor(w.cx / TILE); let gy = Math.floor(w.cy / TILE);
    while (gy < L.h && L.tileAt(tx, gy) !== '#') gy++;
    ctx.strokeStyle = '#3a2c20'; ctx.lineWidth = 3; ctx.beginPath();
    ctx.moveTo(w.cx, w.cy); ctx.lineTo(w.cx - 30, gy * TILE); ctx.moveTo(w.cx, w.cy); ctx.lineTo(w.cx + 30, gy * TILE); ctx.stroke();
    ctx.strokeStyle = '#3a2c20'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(w.cx, w.cy, w.r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#c08850'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(w.cx, w.cy, w.r, 0, Math.PI * 2); ctx.stroke();
    const tops = cabinTops(w);
    ctx.strokeStyle = '#5a4634'; ctx.lineWidth = 2; ctx.beginPath();
    for (const c of tops) { ctx.moveTo(w.cx, w.cy); ctx.lineTo(c.x, c.y - 6); }
    ctx.stroke();
    tops.forEach((c, k) => {
      const col = ['#c0392b', '#e8b84a', '#3a7ab8', '#5a9a4a'][k % 4], hw = K.cabinW / 2;
      rect(ctx, '#1e1610', c.x - 1, c.y - 6, 2, 6);
      rect(ctx, '#1e1610', c.x - hw, c.y, K.cabinW, 3); rect(ctx, '#f4eee0', c.x - hw + 1, c.y, K.cabinW - 2, 1);
      rect(ctx, col, c.x - hw + 2, c.y + 3, K.cabinW - 4, 9); rect(ctx, '#1e1610', c.x - hw + 2, c.y + 12, K.cabinW - 4, 2);
    });
    if (!spr(ctx, s.noria, 'eje0', w.cx, w.cy + 9)) { rect(ctx, '#e8b84a', w.cx - 4, w.cy - 4, 8, 8); }
    if (w.dir < 0) text(ctx, '◀ ◀', w.cx, w.cy - w.r - 18, { align: 'center', color: '#d2b48c' });
  }
  // Recuerdos: polaroids que flotan hacia ti (al disolverse, se desvanecen).
  for (const r of A.recuerdos) {
    if (!r.alive && r.fade > 0.5) continue;
    ctx.globalAlpha = r.alive ? 1 : 1 - r.fade * 2;
    const key = frame(s.rec, 'rec' + r.vari[0].toUpperCase() + r.vari.slice(1), t, 3);
    const yy = r.y + r.h + Math.round(Math.sin(t * 2 + r.x) * 2);
    if (!spr(ctx, s.rec, key, r.x + r.w / 2, yy)) { rect(ctx, '#f4eee0', r.x, r.y, r.w, r.h); rect(ctx, '#a3815c', r.x + 2, r.y + 2, r.w - 4, r.h - 7); }
    ctx.globalAlpha = 1;
  }
  if (A.boss) drawNostalgia(ctx, g, t, flashes);
}

function drawNostalgia(ctx, g, t, flashes) {
  const b = g.alba.boss, s = sheets();
  // Rayos de sol (fase 1): columnas doradas que se tocan.
  if (b.phase <= 1) for (const r of b.rays) if (!r.taken) {
    ctx.globalAlpha = b.phase === 1 ? 0.55 + (flashes ? 0.2 * Math.sin(t * 5 + r.x) : 0) : 0.25;
    rect(ctx, '#ffe080', r.x - 4, r.y - 70, 8, 90); rect(ctx, '#fff8b0', r.x - 1, r.y - 70, 2, 90);
    ctx.globalAlpha = 1;
    drawSolPiece(ctx, r.x, r.y - 4, t, 4);
  }
  if (b.phase === 0) return;
  // Proyectiles de memoria, en sepia (no hacen daño: te regresan).
  for (const sh of b.shots) {
    if (sh.kind === 'embestida') {
      ctx.globalAlpha = 0.6; rect(ctx, '#6e5236', sh.x, sh.y, sh.w, sh.h); rect(ctx, '#a3815c', sh.x + 4, sh.y + 4, sh.w - 8, 10); ctx.globalAlpha = 1;
    } else if (sh.kind === 'mascaras') {
      rect(ctx, '#d2b48c', sh.x, sh.y, sh.w, sh.h); rect(ctx, '#4e3a26', sh.x + 2, sh.y + 3, 2, 2); rect(ctx, '#4e3a26', sh.x + 6, sh.y + 3, 2, 2);
    } else {
      rect(ctx, '#6e5236', sh.x, sh.y, sh.w, sh.h); rect(ctx, '#d2b48c', sh.x + 2, sh.y + 2, sh.w - 4, sh.h - 4);
    }
  }
  const anim = b.phase === 4 ? 'nosBye' : b.phase === 2 ? 'nosTurn' : b.phase === 1 && b.throwT < ALBA_THROW_POSE ? 'nosThrow' : 'nosFloat';
  const y = b.y + 80 + Math.round(Math.sin(t * 1.5) * 4);
  if (b.phase === 4) ctx.globalAlpha = Math.max(0, 1 - b.t / 4);
  if (!spr(ctx, s.nos, frame(s.nos, anim, b.phase === 4 ? b.t : t, 6), b.x, y, true)) {
    ctx.globalAlpha *= 0.7; ctx.fillStyle = '#a3815c'; ctx.beginPath(); ctx.ellipse(b.x, y - 40, 28, 36, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
const ALBA_THROW_POSE = 0.5;   // v11: la pose de lanzar avisa medio segundo ANTES del recuerdo

// Pose propia del paseo (sentado en la banca, contra el viento); false si se usa la normal.
export function drawAlbaPepe(ctx, g, t, x, y, flip) {
  const A = g.alba, s = sheets();
  if (A.sitting) {   // sentado en el centro de la banca más cercana
    const b = A.bancas.reduce((m, k) => (Math.abs(k.x - x) < Math.abs(m.x - x) ? k : m), A.bancas[0]);
    return spr(ctx, s.pepe, frame(s.pepe, 'sentarse', t, 2), b ? b.x + 6 : x, y, false);
  }
  if (A.boss?.phase === 3 && g.player.onGround) return spr(ctx, s.pepe, frame(s.pepe, 'viento', t, 6), x, y, false);
  if (A.boss?.phase === 4) return spr(ctx, s.pepe, frame(s.pepe, 'amanecer', t, 2), x, y, false);
  return false;
}

// Capa de pantalla: sepia al chocar con un recuerdo, bruma si la nostalgia te arrastra, viento en la fase 3.
export function drawAlbaOverlay(ctx, g, t, flashes = true) {
  const A = g.alba;
  if (A.sepia > 0) { ctx.globalAlpha = (flashes ? 0.5 : 0.25) * (A.sepia / K.sepia); rect(ctx, '#7a5a30', 0, 0, W, H); ctx.globalAlpha = 1; }
  if (A.drag || A.still > K.still - 1) {
    const k = Math.min(1, Math.max(0, A.still - (K.still - 1)));
    ctx.globalAlpha = 0.35 * k;
    for (let i = 0; i < 6; i++) rect(ctx, '#d2b48c', 0, 60 + i * 26 + Math.sin(t + i) * 4, 90 - i * 8, 10);
    ctx.globalAlpha = 1;
  }
  if (A.boss?.phase === 3) {
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 10; i++) { const x = W - ((t * 220 + i * 53) % (W + 40)); rect(ctx, '#d2b48c', x, 30 + ((i * 37) % 170), 24, 1); }
    ctx.globalAlpha = 1;
  }
}

// HUD del paseo: sin corazones; cuenta los pasajes leídos y muestra el atril o la frase de la Nostalgia.
export function drawAlbaHud(ctx, g, t) {
  const A = g.alba;
  drawSolPiece(ctx, 10, 9, 0, 4);
  text(ctx, `PASAJES ${A.leidos.length + A.start}/${PASAJES.length}`, 18, 5, { color: '#ffd040' });
  if (A.sitting) text(ctx, 'DESCANSAS EN LA BANCA', W / 2, 36, { align: 'center', color: '#fff0c0' });
  else if (A.drag) text(ctx, 'LA NOSTALGIA TE JALA… ¡MUÉVETE!', W / 2, 36, { align: 'center', color: '#d2b48c' });
  const b = A.boss;
  if (b?.line) {
    ctx.globalAlpha = Math.min(1, b.line.t * 2);
    const w = Math.min(W - 16, b.line.text.length * 6 + 16);
    rect(ctx, '#4e3a26', W / 2 - w / 2 - 1, H - 37, w + 2, 15); rect(ctx, '#e8dcc0', W / 2 - w / 2, H - 36, w, 13);
    text(ctx, b.line.text, W / 2, H - 33, { align: 'center', color: '#4e3a26', shadow: null });
    ctx.globalAlpha = 1;
  }
  if (b && b.phase === 1) text(ctx, `RAYOS DE SOL ${b.raysTaken}/${b.rays.length}`, W / 2, H - 14, { align: 'center', color: '#ffd040' });
  if (A.pasaje) drawPasaje(ctx, A.pasaje);
}

function drawPasaje(ctx, ps) {
  const P = PASAJES[ps.idx];
  if (!P) return;
  const letra = letraDe(P.cancion), lines = wrap(P.reflexion, 44);
  const credit = letra ? wrap(letra.credito, 44) : [], extra = letra ? (letra.fragmento.length + credit.length) * 9 + 6 : 0;
  const h = 26 + lines.length * 9 + extra, y0 = 44;
  ctx.globalAlpha = Math.min(1, ps.t * 2, (K.pasajeT - ps.t) * 4 + 0.2);
  rect(ctx, '#4e3a26', 14, y0, W - 28, h); rect(ctx, '#fffdf6', 15, y0 + 1, W - 30, h - 2);
  text(ctx, `♪ ${P.cancion}`, W / 2, y0 + 5, { align: 'center', color: '#b8862e', shadow: null });
  lines.forEach((l, i) => text(ctx, l, W / 2, y0 + 18 + i * 9, { align: 'center', color: '#3a2c20', shadow: null }));
  if (letra) {
    const ly = y0 + 22 + lines.length * 9;
    letra.fragmento.forEach((l, i) => text(ctx, l, W / 2, ly + i * 9, { align: 'center', color: '#6e5236', shadow: null }));
    credit.forEach((l, i) => text(ctx, l, W / 2, ly + (letra.fragmento.length + i) * 9 + 2, { align: 'center', color: '#a3815c', shadow: null }));
  }
  ctx.globalAlpha = 1;
}

// v11 · Enemigos de Alba, dibujados por código (estilo Neo Geo, paleta sepia y dorada).
// Reloj despertador: esfera crema con borde de latón, dos campanas, patitas; al brincar, vibra y «RIIING».
// Carta del pasado: sobre sepia con sello rojo que aletea; en picada, se abre.
export function drawAlbaEnemy(ctx, e, t) {
  if (!e.alive && e.deadT > 0.6) return;
  ctx.save();
  if (!e.alive) { ctx.globalAlpha = 1 - e.deadT / 0.6; ctx.translate(0, -e.deadT * 20); }
  const x = Math.round(e.x), y = Math.round(e.y);
  if (e.kind === 'reloj') {
    const air = e.vy < -20, sh = air ? Math.round(Math.sin(t * 60)) : 0, cx = x + 9 + sh;
    // patas (caminan)
    const step = Math.floor(t * 8) % 2;
    rect(ctx, '#3a2c20', cx - 5, y + 25 + step, 3, 5 - step); rect(ctx, '#3a2c20', cx + 2, y + 26 - step, 3, 4 + step);
    // campanas y martillo
    rect(ctx, '#8a6420', cx - 9, y + 2, 6, 4); rect(ctx, '#e8b84a', cx - 8, y + 2, 4, 2);
    rect(ctx, '#8a6420', cx + 3, y + 2, 6, 4); rect(ctx, '#e8b84a', cx + 4, y + 2, 4, 2);
    rect(ctx, '#3a2c20', cx - 1, y + 1, 2, 4);
    // cuerpo: aro de latón y esfera crema
    ctx.fillStyle = '#8a6420'; ctx.beginPath(); ctx.arc(cx, y + 15, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8b84a'; ctx.beginPath(); ctx.arc(cx - 1, y + 14, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f4eee0'; ctx.beginPath(); ctx.arc(cx, y + 15, 7, 0, Math.PI * 2); ctx.fill();
    for (let k = 0; k < 12; k += 3) { const a = k * Math.PI / 6; rect(ctx, '#6e5236', cx + Math.cos(a) * 6 - 0.5, y + 15 + Math.sin(a) * 6 - 0.5, 1, 1); }
    // manecillas (giran rápido: el tiempo se va)
    ctx.strokeStyle = '#1e1610'; ctx.lineWidth = 1; ctx.beginPath();
    ctx.moveTo(cx, y + 15); ctx.lineTo(cx + Math.cos(t * 6) * 5, y + 15 + Math.sin(t * 6) * 5);
    ctx.moveTo(cx, y + 15); ctx.lineTo(cx + Math.cos(t * 0.5) * 3, y + 15 + Math.sin(t * 0.5) * 3); ctx.stroke();
    // ojos enojados
    rect(ctx, '#1e1610', cx - 4, y + 11, 2, 2); rect(ctx, '#1e1610', cx + 2, y + 11, 2, 2);
    if (air) text(ctx, 'RIIING', cx, y - 10, { align: 'center', color: '#e8b84a' });
  } else {
    const flap = e.state === 'dive' ? 0 : Math.round(Math.sin(t * 10) * 2), open = e.state === 'dive';
    rect(ctx, '#4e3a26', x, y + 2, 18, 12); rect(ctx, '#d2b48c', x + 1, y + 3, 16, 10);
    // solapa (aletea) o abierta en picada
    ctx.fillStyle = open ? '#e8dcc0' : '#a3815c'; ctx.beginPath();
    if (open) { ctx.moveTo(x + 1, y + 3); ctx.lineTo(x + 9, y - 5); ctx.lineTo(x + 17, y + 3); }
    else { ctx.moveTo(x + 1, y + 3 + flap); ctx.lineTo(x + 9, y + 9); ctx.lineTo(x + 17, y + 3 + flap); }
    ctx.fill();
    rect(ctx, '#a83a3a', x + 7, y + 6, 4, 3);   // sello
    rect(ctx, '#1e1610', x + 4, y + 10, 2, 1); rect(ctx, '#1e1610', x + 12, y + 10, 2, 1);   // ojitos
  }
  ctx.restore();
}
