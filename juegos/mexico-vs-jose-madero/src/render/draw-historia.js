// v8 · La historia en pantalla (spec §1.1b): prólogo, retrato de identidad, recuerdos y pensamientos.
import { W, H } from '../game/constants.js';
import { text, sprite } from './draw.js';
import { WORLDS } from '../data/worlds.js';
import { hash } from './themes.js';

const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };

// ── Prólogo: escenas dibujadas por código ──
function sceneEstadio(g, t, art, flashes) {
  R(g, '#06040c', 0, 0, W, H);
  // Graderío: anillos de público con luces de móvil.
  for (let ring = 0; ring < 4; ring++) {
    const y = 40 + ring * 18;
    g.fillStyle = ['#140c22', '#1c1230', '#241840', '#2c1e4c'][ring];
    g.beginPath(); g.ellipse(W / 2, y + 60, 190 - ring * 18, 40, 0, Math.PI, 0); g.fill();
    for (let i = 0; i < 40; i++) {
      const a = Math.PI + (i / 40) * Math.PI, x = W / 2 + Math.cos(a) * (180 - ring * 18), yy = y + 60 + Math.sin(a) * 34;
      const on = flashes ? hash(i + ring * 40, Math.floor(t * 3)) < 0.6 : hash(i, ring) < 0.6;
      if (on) R(g, hash(i, ring + 9) < 0.5 ? '#fff8d0' : '#bfe6ff', x, yy, 1, 1);
    }
  }
  // Escenario con haces de luz y Pepe.
  R(g, '#2a1a3a', 90, 118, 140, 14); R(g, '#3a2650', 90, 118, 140, 2);
  g.save(); g.globalAlpha = 0.18; g.fillStyle = '#ffe9a8';
  for (const x of [120, 160, 200]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x - 20, 118); g.lineTo(x + 20, 118); g.fill(); }
  g.restore();
  if (art) sprite(g, art.pepe, art.pepe.meta.anims.shout[Math.floor(t * 6) % 3], W / 2, 118);
}
function sceneArena(g, t) {
  R(g, '#08061a', 0, 0, W, H);
  for (let i = 0; i < 60; i++) R(g, '#ffffff', hash(i, 1) * W, hash(i, 2) * 70, 1, 1);
  for (let x = 0; x < W; x += 18) { const h = 30 + hash(x, 3) * 40; R(g, '#140f2a', x, 128 - h, 16, h); for (let k = 0; k < 6; k++) if (hash(x, k) < 0.4) R(g, '#ffb36b', x + 4 + (k % 2) * 6, 128 - h + 6 + k * 5, 2, 3); }
  // Una arena con cúpula (genérica, sin nombre ni logotipo).
  g.fillStyle = '#2a2050'; g.beginPath(); g.ellipse(W / 2, 128, 90, 46, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#3a2e6a'; g.beginPath(); g.ellipse(W / 2, 128, 80, 38, 0, Math.PI, 0); g.fill();
  for (let i = 0; i < 9; i++) R(g, Math.floor(t * 4 + i) % 3 ? '#7a6ad0' : '#ffe9a8', W / 2 - 72 + i * 18, 118, 6, 3);
  R(g, '#140f2a', 0, 128, W, 4);
}
function sceneTitulares(g, t, art, flashes) {
  R(g, flashes && Math.floor(t * 3) % 4 === 0 ? '#3a1020' : '#1a0810', 0, 0, W, H);
  for (let i = 0; i < 30; i++) R(g, '#2a1420', 0, hash(i, Math.floor(t * 8)) * 140, W, 1); // ruido
  if (art) {
    sprite(g, art.pepe, 'hurt0', W / 2, 120);
    for (const [x, y, f] of [[70, 110, false], [250, 112, true], [110, 132, false], [212, 134, true]]) sprite(g, art.foes, art.foes.meta.anims.titularWalk[Math.floor(t * 6) % 2], x, y, f);
  }
  const words = ['¡EXCLUSIVA!', '¡POLÉMICA!', '¡ÚLTIMA HORA!'];
  words.forEach((w, i) => text(g, w, 60 + i * 100, 30 + ((i + Math.floor(t * 2)) % 2) * 8, { color: '#ff5a4f', align: 'center' }));
}
function sceneMuseo(g, t, art) {
  R(g, '#1b1226', 0, 0, W, H); R(g, '#2a1e36', 0, 20, W, 110);
  for (let x = 20; x < W; x += 80) { R(g, '#c8963c', x, 40, 44, 34); R(g, '#1b1226', x + 3, 43, 38, 28); }
  R(g, '#e6e0d4', 0, 130, W, 4); R(g, '#8a8094', 0, 134, W, 10);
  if (art) sprite(g, art.pepeGray ?? art.pepe, 'idle0', W / 2, 130);
  text(g, '?', W / 2 + 14, 72 + Math.round(Math.sin(t * 4) * 2), { scale: 2, color: '#ffcf7a' });
}
function scenePuertas(g, t) {
  R(g, '#1b1226', 0, 0, W, H); R(g, '#2a1e36', 0, 20, W, 110); R(g, '#e6e0d4', 0, 130, W, 4);
  WORLDS.forEach((w, i) => {
    const x = 22 + i * 37;
    R(g, '#1b1226', x - 1, 76, 26, 54); R(g, w.color, x, 77, 24, 53); R(g, '#1b1226', x + 4, 84, 16, 46);
    if (Math.floor(t * 2 + i) % 4 === 0) R(g, '#ffcf7a', x + 10, 104, 3, 3);
  });
}
// v8.3 · Escenas de entrada y salida de cada mundo.
const worldColor = (id) => WORLDS.find((w) => w.id === id)?.color ?? '#c02a38';
function scenePuerta(g, t, art, flashes, panel) {
  // Una sola puerta del Museo, entreabierta, con luz que sale; Pepe camina hacia ella.
  R(g, '#1b1226', 0, 0, W, H); R(g, '#2a1e36', 0, 20, W, 110); R(g, '#e6e0d4', 0, 130, W, 4);
  const c = worldColor(panel.world), x = W / 2 + 30;
  R(g, '#1b1226', x - 2, 46, 52, 86); R(g, c, x, 48, 48, 84);
  g.save(); g.globalAlpha = 0.25 + (flashes ? 0.1 * Math.sin(t * 4) : 0); g.fillStyle = '#fff2c0';
  g.beginPath(); g.moveTo(x + 10, 50); g.lineTo(x + 40, 50); g.lineTo(x + 70, 130); g.lineTo(x - 20, 130); g.fill(); g.restore();
  R(g, '#fff2c0', x + 10, 50, 30, 80); R(g, c, x + 10, 50, 10, 80); // puerta entreabierta
  if (art) sprite(g, art.pepe, art.pepe.meta.anims.run[Math.floor(t * 10) % 8], 70 + Math.min(90, t * 40), 130);
}
function sceneCalle(g, t) {
  for (let i = 0; i < 6; i++) R(g, ['#12040a', '#240812', '#3a0c1a', '#5c1020', '#8e1426', '#c02a38'][i], 0, i * 25, W, 25);
  g.fillStyle = '#e85a5a'; g.beginPath(); g.arc(250, 36, 12, 0, Math.PI * 2); g.fill();
  for (let x = 0; x < W; x += 26) { const h = 40 + hash(x, 4) * 50; R(g, '#1a050c', x, 140 - h, 24, h); for (let k = 0; k < 5; k++) if (hash(x, k + 9) < 0.5) R(g, '#ff9a5a', x + 4 + (k % 2) * 10, 146 - h + k * 9, 3, 4); }
  for (let i = 0; i < 18; i++) { const px = (hash(i, 1) * W + t * 20) % W, py = (hash(i, 2) * 140 + t * (12 + i)) % 140; R(g, '#ff5a6a', px, py, 2, 2); } // pétalos
  R(g, '#2a0d14', 0, 140, W, 10);
}
function sceneDisco(g, t) {
  R(g, '#12040a', 0, 0, W, H);
  for (let k = 0; k < 20; k++) R(g, k % 2 ? '#7a0e1e' : '#b0202e', k * 16, 0, 16, 60 - (k % 3) * 4); // telón
  R(g, '#3a1a12', 0, 120, W, 30); R(g, '#7a3a20', 0, 118, W, 3);
  g.save(); g.globalAlpha = 0.2; g.fillStyle = '#fff2c0'; g.beginPath(); g.moveTo(150, 0); g.lineTo(120, 120); g.lineTo(200, 120); g.fill(); g.restore();
  g.fillStyle = '#1b1226'; g.beginPath(); g.arc(160, 108, 11, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ffd34a'; g.beginPath(); g.arc(160, 108, 10, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fffbe0'; g.beginPath(); g.arc(156, 104, 3, 0, Math.PI * 2); g.fill(); R(g, '#c8963c', 159, 107, 2, 2);
  R(g, '#2a6a2a', 180, 112, 16, 2); g.fillStyle = '#c02a38'; g.beginPath(); g.arc(198, 112, 4, 0, Math.PI * 2); g.fill(); // la rosa
}
function scenePepe(g, t, art, flashes, panel) {
  const c = worldColor(panel.world);
  R(g, '#1b1226', 0, 0, W, H);
  g.save(); g.globalAlpha = 0.35; g.fillStyle = c; g.beginPath(); g.arc(W / 2, 90, 60, 0, Math.PI * 2); g.fill(); g.restore();
  if (art) { g.save(); g.translate(W / 2, 126); g.scale(2, 2); sprite(g, art.pepe, art.pepe.meta.anims.win[Math.floor(t * 6) % 4], 0, 0); g.restore(); }
}
function sceneInvitacion(g, t) {
  R(g, '#0c0c0c', 0, 0, W, H);
  for (let i = 0; i < 40; i++) R(g, '#3a3a3a', hash(i, 3) * W, hash(i, 4) * 140, 1, 1);
  const y = 40 + Math.round(Math.sin(t * 2) * 2);
  R(g, '#000000', 98, y - 2, 124, 82); R(g, '#e6e6e6', 100, y, 120, 78); R(g, '#9a9a9a', 104, y + 4, 112, 70); R(g, '#e6e6e6', 106, y + 6, 108, 66);
  // Antifaz dibujado en la invitación.
  R(g, '#1a1a1a', 138, y + 26, 44, 16); R(g, '#e6e6e6', 145, y + 30, 10, 6); R(g, '#e6e6e6', 165, y + 30, 10, 6);
  for (let k = 0; k < 5; k++) R(g, '#5a5a5a', 116 + k * 20, y + 58, 10, 2);
}
function sceneBaile(g, t, art, flashes) {
  R(g, '#1a1a1a', 0, 0, W, H);
  for (let x = 0; x < W; x += 8) for (let y = 10; y < 110; y += 8) if ((x / 8 + y / 8) % 2) R(g, '#242424', x + 3, y + 3, 2, 2);
  for (const cx of [80, 240]) { R(g, '#6a6a6a', cx - 14, 30, 29, 3); for (let k = -2; k <= 2; k++) R(g, '#ffffff', cx + k * 6, 24, 2, 4); g.save(); g.globalAlpha = 0.12; g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(cx, 60, 50, 34, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
  for (let k = 0; k < 20; k++) R(g, (k + Math.floor(t * 4)) % 2 ? '#e6e6e6' : '#1a1a1a', k * 16, 130, 16, 20); // pista ajedrezada
  // Invitados ya sin máscara, bailando (siluetas que se mecen).
  for (let k = 0; k < 7; k++) {
    const x = 26 + k * 44, sway = Math.round(Math.sin(t * 5 + k) * 3);
    R(g, '#0a0a0a', x - 5 + sway, 96, 10, 34); g.fillStyle = '#0a0a0a'; g.beginPath(); g.arc(x + sway, 90, 6, 0, Math.PI * 2); g.fill();
    R(g, '#bdbdbd', x + sway + 1, 88, 2, 2);
  }
  if (flashes) for (let i = 0; i < 24; i++) R(g, i % 2 ? '#ffffff' : '#9a9a9a', (hash(i, 7) * W + t * 15) % W, (hash(i, 8) * 130 + t * 30) % 130, 2, 2); // confeti
}
const SCENES = { estadio: sceneEstadio, arena: sceneArena, titulares: sceneTitulares, museo: sceneMuseo, puertas: scenePuertas, puerta: scenePuerta, calle: sceneCalle, disco: sceneDisco, pepe: scenePepe, invitacion: sceneInvitacion, baile: sceneBaile };

export function drawPrologue(g, panel, i, t, art, flashes = true, total = 5) {
  SCENES[panel.scene](g, t, art, flashes, panel);
  R(g, '#0c0812', 0, 150, W, H - 150); R(g, '#3a2050', 0, 150, W, 1);
  panel.lines.forEach((l, k) => text(g, l, W / 2, 158 + k * 11, { align: 'center', color: '#efe8d4' }));
  if (panel.kind === 'dato') text(g, `FUENTE: ${panel.source}`, W / 2, 158 + panel.lines.length * 11 + 2, { align: 'center', color: '#b9a8d6' });
  text(g, `${i + 1}/${total}`, 6, 6, { color: '#8a7a9a' });
  if (Math.floor(t * 2) % 2 === 0) text(g, 'A: SEGUIR · B: SALTAR', W - 6, H - 10, { align: 'right', color: '#8a7a9a' });
}

// ── Museo: retrato de Pepe hecho de 8 piezas, una por disco ──
export function drawPortrait(g, art, worldsDone, x, y) {
  R(g, '#1b1226', x - 3, y - 3, 46, 64); R(g, '#c8963c', x - 2, y - 2, 44, 62); R(g, '#120c1a', x, y, 40, 58);
  sprite(g, art.pepe, 'idle0', x + 20, y + 54);
  for (let i = 0; i < 8; i++) {
    const done = worldsDone.includes(WORLDS[i].id), sy = y + 4 + i * 6.25;
    if (done) { g.save(); g.globalAlpha = 0.22; R(g, WORLDS[i].color, x, sy, 40, 7); g.restore(); }
    else { g.save(); g.globalAlpha = 0.86; R(g, '#120c1a', x, sy, 40, 7); g.restore(); }
  }
  text(g, `IDENTIDAD ${worldsDone.length}/8`, x + 20, y + 62, { align: 'center', color: '#ffcf7a' });
}

// ── Pensamiento de Pepe (al tocar un checkpoint) ──
export function drawThought(g, thought) {
  if (!thought) return;
  const a = Math.min(1, thought.t * 3);
  g.save(); g.globalAlpha = a;
  const w = Math.min(W - 16, thought.text.length * 6 + 20);
  // Debajo del HUD y de los contadores de ayudas.
  R(g, '#1b1226', W / 2 - w / 2 - 1, 45, w + 2, 15); R(g, '#efe8d4', W / 2 - w / 2, 46, w, 13);
  text(g, thought.text, W / 2, 49, { align: 'center', color: '#1b1226', shadow: null });
  g.restore();
}

// ── Tarjeta «RECUERDO RECUPERADO» al terminar un mundo ──
export function drawRecuerdo(g, card, art, t) {
  g.fillStyle = 'rgba(18,4,10,0.92)'; g.fillRect(0, 0, W, H);
  text(g, 'RECUERDO RECUPERADO', W / 2, 26, { align: 'center', color: '#ff9a9a' });
  text(g, card.title, W / 2, 42, { scale: 2, align: 'center', color: '#ffcf7a' });
  if (art) drawPortrait(g, art, card.worldsDone, W / 2 - 20, 74);
  card.lines.forEach((l, i) => text(g, l, W / 2, 152 + i * 11, { align: 'center', color: '#efe8d4' }));
  if (Math.floor(t * 2) % 2 === 0) text(g, 'PULSA A PARA SEGUIR', W / 2, 200, { align: 'center' });
}

// ── v8.3 · Pose de festejo al vencer a un jefe (la acción se congela; Pepe celebra) ──
export function drawVictory(g, game, camX, t, flashes = true) {
  const p = game.player, px = p.x + p.w / 2 - camX, py = p.y + p.h / 2;
  g.save();
  g.globalAlpha = 0.65; g.fillStyle = '#05010a';
  g.beginPath(); g.rect(0, 0, W, H); g.arc(px, py, 38, 0, Math.PI * 2); g.fill('evenodd');
  g.restore();
  // Confeti que cae.
  for (let i = 0; i < 40; i++) {
    const x = (hash(i, 3) * W + Math.sin(t * 3 + i) * 6) % W, y = ((hash(i, 4) * H + t * (40 + (i % 5) * 12)) % H);
    R(g, ['#ffcf7a', '#ff5a4f', '#7ad0ff', '#ffffff'][i % 4], x, y, 2, flashes ? 2 + (Math.floor(t * 8 + i) % 2) : 2);
  }
  const k = Math.min(1, t / 0.25);
  text(g, '¡JEFE VENCIDO!', W / 2, 40 - (1 - k) * 20, { scale: 2, align: 'center', color: '#ffcf7a' });
}
