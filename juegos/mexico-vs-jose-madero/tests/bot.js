import { TILE, MIC } from '../src/game/constants.js';

// Bot sencillo: corre a la derecha, salta obstáculos, huecos y enemigos, y lanza el micro a los ganchos.
export function bot(g) {
  const p = g.player, L = g.level;
  const ahead = p.x + p.w + 6, feet = p.y + p.h;
  const tx = Math.floor(ahead / TILE), tyFeet = Math.floor((feet - 1) / TILE);
  const wall = L.tileAt(tx, tyFeet) === '#' || L.tileAt(tx, tyFeet - 1) === '#';
  const gap = p.onGround && !['#', '='].includes(L.tileAt(Math.floor((p.x + p.w + 14) / TILE), tyFeet + 1));
  const spike = L.tileAt(Math.floor((p.x + p.w + 18) / TILE), tyFeet) === '^';
  const foe = g.enemies.some((e) => e.alive && e.x > p.x && e.x - p.x < 52 && Math.abs(e.y + e.h - feet) < 24);
  const hy = p.y + p.h - MIC.handY;
  const hook = g.level.hooks.find((h) => h.x > p.x && Math.hypot(h.x - p.x, h.y - hy) < MIC.range - 4 && Math.abs(h.y - hy) < MIC.aimY);
  const hand = { x: p.x + p.w / 2 + MIC.handX, y: p.y + p.h - MIC.handY };
  const target = g.enemies.find((e) => e.alive && e.x > hand.x - 4 && e.x - hand.x < MIC.range - 8 && hand.y >= e.y - 2 && hand.y <= e.y + e.h);
  const jumpNow = p.onGround && (wall || gap || spike);
  const fire = g.mic.phase === 'idle' && ((!p.onGround && !!hook) || !!target);
  return { left: false, right: !target || g.mic.phase !== 'idle', jump: jumpNow || (!p.onGround && p.vy < 0) || (p.onGround && foe && !target), mic: fire && g.frame % 2 === 0 };
}

// Bot de jefe: guarda distancia, salta el rayo bajo, aguanta en el suelo con el alto
// y se acerca a golpear con el micrófono cuando el lente queda expuesto.
export function bossBot(g) {
  const p = g.player, b = g.boss;
  const btn = { left: false, right: false, jump: false, mic: false, special: false };
  if (!b || !b.alive) {
    if (g.disco) { const dx = g.disco.x - (p.x + p.w / 2); btn.right = dx > 2; btn.left = dx < -2; }
    return btn;
  }
  const pc = p.x + p.w / 2, bc = b.x + b.w / 2, dx = bc - pc, dist = Math.abs(dx) - b.w / 2;
  const toward = dx > 0 ? 'right' : 'left', away = dx > 0 ? 'left' : 'right';
  if (g.ovacion >= 100 && g.frame % 2 === 0) btn.special = true;
  if (b.state === 'exposed') {
    if (dist > MIC.range - 24) btn[toward] = true;
    else if (Math.sign(dx) !== p.facing) btn[toward] = true;
    else btn.mic = g.mic.phase === 'idle' && g.frame % 2 === 0;
  } else if (b.state === 'charge' || b.state === 'beam') {
    const low = b.beamKind === 'low';
    if (low && ((b.state === 'charge' && b.t > 0.74) || b.state === 'beam')) btn.jump = p.onGround ? b.state === 'charge' : p.vy < 0;
  } else if (dist < 70) {
    // Que no nos arrincone: si hay pared detrás, saltamos por encima.
    btn[away] = true;
    const wallBehind = away === 'left' ? p.x < 2 * TILE + 4 : p.x + p.w > (g.level.w - 2) * TILE - 4;
    if (wallBehind) { btn[away] = false; btn[toward] = true; btn.jump = p.onGround || p.vy < 0; }
  }
  return btn;
}
