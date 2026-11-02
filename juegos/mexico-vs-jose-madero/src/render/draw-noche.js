// Mundo 2 «Noche» (spec §3.0f E): enemigos, jefe, farol y objetos dibujados por código en blanco y negro,
// hasta tener el arte de Gemini. Sin máscaras de hockey ni personajes de terror registrados: antifaz de fiesta propio.
import { W, H } from '../game/constants.js';
import { text, sprite } from './draw.js';
import { inLight, lightRadius } from '../game/noche.js';

const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
const INK = '#000000';

// Antifaz de fiesta (diseño propio): banda blanca con dos ojos y una pluma corta.
export function antifaz(g, cx, y, flip = false, s = 1) {
  const d = flip ? -1 : 1;
  R(g, INK, cx - 7 * s, y - 1, 14 * s, 6 * s);
  R(g, '#f2f2f2', cx - 6 * s, y, 12 * s, 4 * s);
  R(g, INK, cx - 4 * s, y + s, 3 * s, 2 * s); R(g, INK, cx + 1 * s, y + s, 3 * s, 2 * s);
  R(g, '#bdbdbd', cx + d * 6 * s, y - 4 * s, 2 * s, 5 * s);
}

// v8: sprites de las hojas de ChatGPT (art/source/noche/), en gris como todo el mundo.
const frameOf = (sheet, anim, t, fps, once = false) => {
  const a = sheet.meta.anims[anim];
  const i = Math.floor(t * fps);
  return a[once ? Math.min(a.length - 1, i) : i % a.length];
};

export function drawNocheEnemy(g, game, e, t, art) {
  const fx = e.x + e.w / 2, fy = e.y + e.h, flip = e.facing < 0;
  const sheet = art[e.kind];
  if (!e.alive) {
    if (e.deadT > 0.9) return;
    g.save(); g.globalAlpha = Math.max(0, Math.min(1, (0.9 - e.deadT) * 3));
    const ko = { invitado: 'invKo', murcielago: 'batKo', fantasma: 'ghostKo' }[e.kind];
    sprite(g, sheet, frameOf(sheet, ko, e.deadT, 6, true), fx, fy + (e.kind === 'murcielago' ? e.deadT * 40 : 0), flip);
    g.restore();
    return;
  }
  if (e.kind === 'invitado') {
    // Sin máscara: primero el gesto de sorpresa y después corre con la cara descubierta.
    const key = e.unmasked
      ? ((e.unmaskT ?? 1) < 0.45 ? frameOf(sheet, 'invUnmask', e.unmaskT, 6, true) : `invUnmask${1 + (Math.floor(t * 8) % 2)}`)
      : e.state === 'chase' ? frameOf(sheet, 'invRun', t, 12) : frameOf(sheet, 'invWalk', t, 8);
    sprite(g, sheet, key, fx, fy, flip);
  } else if (e.kind === 'murcielago') {
    const key = e.state === 'swoop' ? frameOf(sheet, 'batFly', t, 14) : frameOf(sheet, 'batHang', t, 3);
    sprite(g, sheet, key, fx, fy, flip);
  } else {
    if (!inLight(game, fx, e.y + e.h / 2)) return; // solo se ve con luz
    const p = game.player, near = Math.hypot(p.x + p.w / 2 - fx, p.y + p.h / 2 - (e.y + e.h / 2)) < 44;
    sprite(g, sheet, near ? frameOf(sheet, 'ghostAttack', t, 8) : frameOf(sheet, 'ghostFloat', t, 8), fx, fy, flip);
  }
}

// Jefe: El Enmascarado del Lago (hoja de ChatGPT).
export function drawMaskBoss(g, game, art, t) {
  const b = game.boss, sh = art.enmascarado, fx = Math.round(b.x + b.w / 2), drop = game.intro ? game.intro.drop : 0;
  const fy = Math.round(b.y + b.h - drop), flip = b.facing < 0;
  if (!b.alive) {
    // Se quita la máscara: debajo hay una persona normal que sonríe y saluda (y se va desvaneciendo).
    if (b.deadT > 3.2) return;
    g.save(); g.globalAlpha = Math.max(0, Math.min(1, 3.2 - b.deadT));
    sprite(g, sh, frameOf(sh, 'maskUnmask', b.deadT, 3, true), fx, fy, flip);
    g.restore();
    return;
  }
  if (b.state === 'lurk' || b.state === 'blackout') return; // solo sus ojos (drawMaskEyes)
  if (b.hurtT > 0 && Math.floor(t * 30) % 2) return;
  const dash = b.state === 'dash' || b.state === 'redash';
  const key = game.intro ? frameOf(sh, 'maskWalk', t, 8)
    : dash ? frameOf(sh, 'maskDash', t, 14)
    : b.state === 'stun' ? frameOf(sh, 'maskStun', t, 6)
    : frameOf(sh, 'maskWalk', t, 8);
  sprite(g, sh, key, fx, fy, flip);
  const top = fy - 62;
  if (b.state === 'stun') text(g, '¡AHORA!', fx, top - 8, { color: '#ffcf7a', align: 'center' });
  if (dash) text(g, '¡SALTA!', fx, top - 4, { color: '#ffcf7a', align: 'center' });
}

// Ojos del Enmascarado: se ven siempre, también a oscuras y en el apagón.
export function drawMaskEyes(g, game, t) {
  const b = game.boss;
  if (!b?.alive || game.intro || !(b.state === 'lurk' || b.state === 'blackout')) return;
  const fx = Math.round(b.x + b.w / 2), y = Math.round(b.y + 4); // a la altura del antifaz del sprite
  const on = b.state === 'blackout' || b.t > 0.15;
  if (!on) return;
  R(g, '#ffffff', fx - 4, y, 3, 2); R(g, '#ffffff', fx + 2, y, 3, 2);
  if (b.state === 'lurk' && b.t > 0.4) text(g, '!', fx, y - 14, { color: '#ffcf7a', align: 'center' });
}

// Oscuridad con el círculo de luz del farol (y, en el apagón, casi negro del todo).
let DARK = null;
export function drawDarkness(g, game, camX) {
  if (typeof document === 'undefined') return;
  DARK ??= Object.assign(document.createElement('canvas'), { width: W, height: H });
  const d = DARK.getContext('2d'), p = game.player;
  d.globalCompositeOperation = 'source-over';
  d.clearRect(0, 0, W, H);
  d.fillStyle = game.blackout ? 'rgba(0,0,0,0.97)' : 'rgba(0,0,0,0.9)';
  d.fillRect(0, 0, W, H);
  d.globalCompositeOperation = 'destination-out';
  const r = game.blackout ? Math.min(lightRadius(game), 44) : lightRadius(game);
  const cx = p.x + p.w / 2 - camX, cy = p.y + p.h / 2;
  const grad = d.createRadialGradient(cx, cy, r * 0.55, cx, cy, r);
  grad.addColorStop(0, 'rgba(0,0,0,1)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
  d.fillStyle = grad; d.beginPath(); d.arc(cx, cy, r, 0, Math.PI * 2); d.fill();
  g.drawImage(DARK, Math.round(camX), 0);
}

export function drawMascara(g, x, y) { antifaz(g, x, y - 3, false, 2); }

// Pieza del Mundo 2: pequeña luna plateada (en lugar del Carmesí).
export function drawLunaPiece(g, x, y, t, r = 6) {
  const w = Math.max(1, Math.round(Math.abs(Math.cos(t * 3)) * r));
  g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, w + 1, r + 1, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e6e6e6'; g.beginPath(); g.ellipse(x, y, w, r, 0, 0, Math.PI * 2); g.fill();
  if (w > 2) { g.fillStyle = '#7a7a7a'; g.beginPath(); g.arc(x + w / 3, y - 1, r * 0.6, 0, Math.PI * 2); g.fill(); }
}

// Lata de aceite para el farol.
export function drawAceite(g, it, t) {
  const x = Math.round(it.x), y = Math.round(it.y + Math.sin(t * 3 + it.x) * 2);
  R(g, INK, x - 5, y - 6, 10, 13); R(g, '#bdbdbd', x - 4, y - 5, 8, 11); R(g, '#7a7a7a', x - 4, y - 1, 8, 3);
  R(g, INK, x - 1, y - 9, 3, 3); R(g, '#ffe9a8', x - 2, y + 4, 4, 1);
}
