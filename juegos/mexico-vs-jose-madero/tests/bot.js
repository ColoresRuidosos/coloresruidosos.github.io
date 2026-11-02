import { TILE, MIC } from '../src/game/constants.js';

// Bot sencillo: corre a la derecha, salta obstáculos, huecos y enemigos, y lanza el micro a los ganchos.
export function bot(g) {
  const p = g.player, L = g.level;
  const ahead = p.x + p.w + 6, feet = p.y + p.h;
  const tx = Math.floor(ahead / TILE), tyFeet = Math.floor((feet - 1) / TILE);
  const wall = L.tileAt(tx, tyFeet) === '#' || L.tileAt(tx, tyFeet - 1) === '#';
  const gap = p.onGround && !['#', '='].includes(L.tileAt(Math.floor((p.x + p.w + 14) / TILE), tyFeet + 1));
  const spike = L.tileAt(Math.floor((p.x + p.w + 18) / TILE), tyFeet) === '^';
  const foe = g.enemies.some((e) => e.alive && e.x + e.w > p.x && e.x - p.x < 52 && Math.abs(e.y + e.h - feet) < 24);
  const hy = p.y + p.h - MIC.handY;
  const hook = g.level.hooks.find((h) => h.x > p.x && Math.hypot(h.x - p.x, h.y - hy) < MIC.range - 4 && Math.abs(h.y - hy) < MIC.aimY);
  const hand = { x: p.x + p.w / 2 + MIC.handX, y: p.y + p.h - MIC.handY };
  const target = g.enemies.find((e) => e.alive && e.x > hand.x - 4 && e.x - hand.x < MIC.range - 8 && hand.y >= e.y - 2 && hand.y <= e.y + e.h);
  // Hombre anfibio que avisa o salta justo delante: esperar a que vuelva al agua.
  const frog = g.enemies.some((e) => e.alive && e.kind === 'anfibio' && (e.state === 'warn' || e.state === 'jump') && e.x + e.w > p.x - 8 && e.x - (p.x + p.w) < 70);
  if (frog && p.onGround) return { left: false, right: false, jump: false, mic: !!target && g.mic.phase === 'idle' && g.frame % 2 === 0 };
  const jumpNow = p.onGround && (wall || gap || spike);
  const fire = g.mic.phase === 'idle' && ((!p.onGround && !!hook) || !!target);
  // Con la Ovación llena y enemigos cerca, el Solo de guitarra (como haría un jugador).
  const solo = g.ovacion >= 100 && foe && g.frame % 2 === 0;
  return { left: false, right: !target || g.mic.phase !== 'idle', jump: jumpNow || (!p.onGround && p.vy < 0) || (p.onGround && foe && !target), mic: fire && g.frame % 2 === 0, special: solo };
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

// Bot del Enmascarado (v8.1): esquiva cada ataque y golpea con el micrófono en las ventanas.
const VULN = new Set(['stun', 'landed', 'recover', 'clawRecover', 'summon']);
export function maskBot(g) {
  const p = g.player, b = g.boss;
  const btn = { left: false, right: false, jump: false, mic: false, special: false };
  const pc = p.x + p.w / 2, feet = p.y + p.h;
  if (!b || !b.alive) {
    if (g.disco) { const dx = g.disco.x - pc; btn.right = dx > 2; btn.left = dx < -2; }
    return btn;
  }
  const W = g.level.w * TILE, mid = W / 2;
  const bc = b.x + b.w / 2, dx = bc - pc, gap = Math.abs(dx) - (b.w + p.w) / 2;
  const toward = dx > 0 ? 'right' : 'left', away = dx > 0 ? 'left' : 'right';
  const keepJumping = !p.onGround && p.vy < 0;
  if (g.ovacion >= 100 && g.frame % 2 === 0) btn.special = true;
  // Lo que viene volando (ondas y máscaras): saltar cuando está a punto de llegar.
  let danger = false;
  for (const s of g.shots) {
    const sx = s.x + s.w / 2, coming = Math.sign(s.vx) === Math.sign(pc - sx), dist = Math.abs(sx - pc);
    if (!coming || dist > 90) continue;
    danger = true;
    // Máscara a la altura de la mano y a tiro: se rompe con el micrófono. Si no, se salta.
    const handY = feet - 29;
    if (s.kind === 'mask' && Math.abs(s.y + s.h / 2 - handY) < 14 && dist < 70 && Math.sign(sx - pc) === p.facing && g.mic.phase === 'idle') btn.mic = g.frame % 2 === 0;
    else if (dist / Math.max(1, Math.abs(s.vx)) < 0.22 && s.y + s.h > p.y && s.y < feet && p.onGround) btn.jump = true;
  }
  if (danger && !btn.jump && !btn.mic) {
    // Mirar hacia lo que viene, para poder romperlo.
    const s = g.shots.find((x) => x.kind === 'mask');
    if (s && Math.sign(s.x - pc) !== p.facing && p.onGround) btn[s.x > pc ? 'right' : 'left'] = true;
  }
  // Invitados que ha llamado: micrófono si están a tiro.
  const hand = { x: pc + p.facing * 18, y: feet - 29 };
  const guest = g.enemies.find((e) => e.alive && Math.abs(e.x + e.w / 2 - pc) < 80 && hand.y >= e.y - 2 && hand.y <= e.y + e.h);
  if (danger) {
    // (primero esquivar lo que viene volando)
  } else if (VULN.has(b.state) && !b.hitThisWindow) {
    if (gap > 46) btn[toward] = true;
    else if (Math.sign(dx) !== p.facing) btn[toward] = true;
    else btn.mic = g.mic.phase === 'idle' && g.frame % 2 === 0;
  } else if (b.state === 'dash' || b.state === 'redash') {
    const coming = Math.sign(b.vx) === -Math.sign(dx);
    if (coming && gap / Math.max(1, Math.abs(b.vx)) < 0.2 && gap > 0 && p.onGround) btn.jump = true;
  } else if (b.state === 'crouch' || b.state === 'leap') {
    // Cae donde estaba Pepe: huir hacia el lado contrario al jefe; contra la pared, pasar por debajo.
    const wallBehind = away === 'left' ? pc < 4 * TILE : pc > W - 4 * TILE;
    btn[wallBehind ? toward : away] = true;
  } else if (b.state === 'fade' || b.state === 'claw') {
    // Reaparece detrás: seguir hacia delante (hacia donde mira Pepe), salvo que haya pared.
    const dir = p.facing > 0 ? 'right' : 'left';
    const wall = p.facing > 0 ? pc > W - 3 * TILE : pc < 3 * TILE;
    btn[wall ? (p.facing > 0 ? 'left' : 'right') : dir] = true;
  } else if (guest && Math.sign(guest.x - pc) === p.facing) {
    btn.mic = g.mic.phase === 'idle' && g.frame % 2 === 0;
  } else if (gap < 60) {
    btn[away] = true;
    const wallBehind = away === 'left' ? p.x < 2 * TILE + 4 : p.x + p.w > W - 2 * TILE - 4;
    if (wallBehind) { btn[away] = false; btn[toward] = true; btn.jump = p.onGround; }
  } else if (Math.abs(mid - pc) > 40) btn[mid > pc ? 'right' : 'left'] = true;
  if (keepJumping) btn.jump = true;
  return btn;
}
