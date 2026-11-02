// IA de los enemigos: funciones puras sobre el estado del juego (sin DOM).
import { TILE, ENEMY, FREEZE, DT } from './constants.js';
import { moveBody } from '../engine/tilemap.js';

export function createEnemy(spawn, i, headlines) {
  const k = ENEMY[spawn.kind];
  const x = spawn.x - k.w / 2;
  // De pie sobre su casilla; los voladores, 2 px por encima del borde inferior (sin tocar el suelo).
  const y = spawn.y - k.h - (k.fly ? 2 : 0);
  return {
    kind: spawn.kind, x, y, w: k.w, h: k.h, vx: k.speed ? -k.speed : 0, vy: 0, facing: -1,
    state: k.fly ? (spawn.kind === 'rumor' ? 'fly' : 'hover') : 'walk',
    t: 0, alive: true, deadT: 0, word: headlines[i % headlines.length],
    home: { x, y }, target: null,
  };
}

// Patrulla común: gravedad, rebote en paredes y sin tirarse por los bordes.
export function patrol(g, e, speed) {
  e.vy = Math.min(420, e.vy + 1400 * DT);
  const r = moveBody(g.level, e, e.vx * DT, e.vy * DT);
  if (r.ground) e.vy = 0;
  if (r.hitX) e.vx = -e.vx;
  let ledge = false;
  if (r.ground && e.vx) {
    const frontX = e.vx > 0 ? e.x + e.w + 1 : e.x - 1;
    const below = g.level.tileAt(Math.floor(frontX / TILE), Math.floor((e.y + e.h + 1) / TILE));
    const spikes = g.level.tileAt(Math.floor(frontX / TILE), Math.floor((e.y + e.h - 1) / TILE)) === '^';
    if ((below !== '#' && below !== '=') || spikes) { e.vx = -e.vx; ledge = true; }
  }
  if (e.vx) e.facing = Math.sign(e.vx);
  if (speed !== undefined && e.vx) e.vx = Math.sign(e.vx) * speed;
  return { ...r, ledge };
}

// ¿Pepe está a la vista (delante si `front`), a menos de `range` y a su altura?
export function sees(g, e, range, front) {
  const p = g.player;
  const dx = p.x + p.w / 2 - (e.x + e.w / 2);
  const sameRow = p.y < e.y + e.h && p.y + p.h > e.y - 8;
  return sameRow && Math.abs(dx) <= range && (!front || Math.sign(dx) === e.facing);
}

const center = (b) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });

function stepPaparazzi(g, e, k) {
  if (e.state === 'walk') {
    patrol(g, e, k.speed);
    if (sees(g, e, k.sight, true)) { e.state = 'aim'; e.t = 0; e.vx = 0; }
    return;
  }
  e.vx = 0; patrol(g, e);
  if (e.state === 'aim' && e.t >= k.aim) {
    e.state = 'flash'; e.t = 0;
    g.events.push('flash');
    if (sees(g, e, k.sight + 10, true) && g.invuln <= 0) { g.player.frozen = FREEZE; g.events.push('frozen'); }
  } else if (e.state === 'flash' && e.t >= k.flash) { e.state = 'cool'; e.t = 0; }
  else if (e.state === 'cool' && e.t >= k.cool) { e.state = 'walk'; e.t = 0; e.vx = e.facing * k.speed; }
}

function stepReportero(g, e, k) {
  if (e.state === 'walk') {
    patrol(g, e, k.speed);
    if (sees(g, e, k.sight, false)) {
      e.state = 'windup'; e.t = 0;
      e.facing = Math.sign(g.player.x + g.player.w / 2 - (e.x + e.w / 2)) || e.facing;
      e.vx = 0;
    }
  } else if (e.state === 'windup') {
    patrol(g, e);
    if (e.t >= k.windup) { e.state = 'dash'; e.t = 0; e.vx = e.facing * k.dashSpeed; g.events.push('dash'); }
  } else if (e.state === 'dash') {
    const r = patrol(g, e);
    if (r.ledge || r.hitX || e.t >= k.dash) { e.state = 'rest'; e.t = 0; e.vx = 0; }
  } else if (e.state === 'rest') {
    patrol(g, e);
    if (e.t >= k.rest) { e.state = 'walk'; e.t = 0; e.vx = e.facing * k.speed; }
  }
}

// Rumor Volador: planea en onda alrededor de su casa y cae en picado si Pepe pasa por debajo.
function stepRumor(g, e, k) {
  const p = g.player, c = center(e);
  if (e.state === 'fly') {
    const r = moveBody(g.level, e, e.vx * DT, 0);
    if (r.hitX || Math.abs(e.x - e.home.x) > 3 * TILE) { e.vx = -e.vx; e.x = Math.max(e.home.x - 3 * TILE, Math.min(e.home.x + 3 * TILE, e.x)); }
    e.y = e.home.y + Math.sin(e.t * 3) * k.amp;
    e.facing = Math.sign(e.vx) || e.facing;
    const below = p.y > e.y + e.h;
    if (below && Math.abs(p.x + p.w / 2 - c.x) <= k.sight) { e.state = 'dive'; e.t = 0; e.vx = 0; g.events.push('dive'); }
  } else if (e.state === 'dive') {
    const r = moveBody(g.level, e, 0, k.dive * DT);
    if (r.ground || e.y > e.home.y + 9 * TILE) { e.state = 'climb'; e.t = 0; }
  } else if (e.state === 'climb') {
    e.y = Math.max(e.home.y, e.y - k.climb * DT);
    if (e.y <= e.home.y) { e.state = 'fly'; e.t = 0; e.vx = e.facing * k.speed; }
  }
}

// Micrófono Traidor: flota, te apunta, se lanza hacia donde estabas, descansa y vuelve a su sitio.
function stepTraidor(g, e, k) {
  const p = g.player, c = center(e), pc = center(p);
  if (e.state === 'hover') {
    e.y = e.home.y + Math.sin(e.t * 4) * 3;
    e.facing = Math.sign(pc.x - c.x) || e.facing;
    if (Math.hypot(pc.x - c.x, pc.y - c.y) <= k.sight) { e.state = 'aim'; e.t = 0; }
  } else if (e.state === 'aim') {
    e.facing = Math.sign(pc.x - c.x) || e.facing;
    if (e.t >= k.aim) {
      const d = Math.hypot(pc.x - c.x, pc.y - c.y) || 1;
      e.vx = ((pc.x - c.x) / d) * k.lunge; e.vy = ((pc.y - c.y) / d) * k.lunge;
      e.state = 'lunge'; e.t = 0; g.events.push('dash');
    }
  } else if (e.state === 'lunge') {
    const r = moveBody(g.level, e, e.vx * DT, e.vy * DT);
    if (r.hitX || r.ground || r.ceiling || e.t >= k.lungeT) { e.state = 'rest'; e.t = 0; e.vx = 0; e.vy = 0; }
  } else if (e.state === 'rest') {
    if (e.t >= k.rest) { e.state = 'return'; e.t = 0; }
  } else if (e.state === 'return') {
    const dx = e.home.x - e.x, dy = e.home.y - e.y, d = Math.hypot(dx, dy);
    const s = k.back * DT;
    if (d <= s) { e.x = e.home.x; e.y = e.home.y; e.state = 'hover'; e.t = 0; }
    else { e.x += (dx / d) * s; e.y += (dy / d) * s; }
  }
}

export function stepEnemy(g, e) {
  if (!e.alive) { e.deadT += DT; return; }
  const k = ENEMY[e.kind];
  e.t += DT;
  if (e.kind === 'paparazzi') stepPaparazzi(g, e, k);
  else if (e.kind === 'reportero') stepReportero(g, e, k);
  else if (e.kind === 'rumor') stepRumor(g, e, k);
  else if (e.kind === 'traidor') stepTraidor(g, e, k);
  else patrol(g, e, k.speed);
  if (e.y > g.level.h * TILE + 64) e.alive = false;
}

// Choque con Pepe sin pisotón: el enemigo se aparta y retoma su patrón.
export function bounceOff(g, e) {
  const p = g.player;
  e.facing = e.x + e.w / 2 < p.x + p.w / 2 ? -1 : 1;
  const k = ENEMY[e.kind];
  if (e.state === 'walk') e.vx = e.facing * k.speed;
  else if (e.state === 'dash') { e.state = 'rest'; e.t = 0; e.vx = 0; }
  else if (e.state === 'lunge') { e.state = 'rest'; e.t = 0; e.vx = 0; e.vy = 0; }
  else if (e.state === 'dive') { e.state = 'climb'; e.t = 0; }
}
