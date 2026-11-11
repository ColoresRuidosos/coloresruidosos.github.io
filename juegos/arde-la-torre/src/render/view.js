// Vista del juego (F11, plan §6): capas, sombras, actores ordenados por profundidad, efectos y HUD.
import { W, H, FLOOR_TOP } from '../sim/constants.js';
import { getSprite } from './sprites.js';
import { hasAtlas, heroFrameName, drawFrame, drawPortrait } from './atlas.js';
import { getBackground } from './backgrounds.js';
import { drawText } from './text.js';
import { SLOT_COLORS } from '../input/slots.js';
import { HEROES } from '../sim/moves.js';

// ---- Estado del luchador → pose del sprite ----
export function spriteState(f) {
  const t = f.t;
  switch (f.state) {
    case 'walk': return ['walk', Math.floor(t / 8) % 4];
    case 'run': return ['run', Math.floor(t / 5) % 4];
    case 'jump': return [f.airAtk && f.airT < 16 ? 'air' : 'jump', 0];
    case 'attack': {
      const m = f.atk;
      if (m.weapon || m.knock) return [t < m.start ? 'wind' : 'swing', 0];
      return [f.combo % 2 ? 'punch2' : 'punch1', 0];
    }
    case 'dash': return ['dash', 0];
    case 'special': return ['special', Math.floor(t / 8) % 4];
    case 'grab': return [f.kneeT > 0 ? 'knee' : 'grab', 0];
    case 'grabbed': return ['grabbed', 0];
    case 'throwing': return ['throw', 0];
    case 'hurt': case 'fall': case 'thrown': return ['hurt', 0];
    case 'block': return ['block', 0];
    case 'down': case 'dead': return ['down', 0];
    case 'rise': return ['rise', 0];
    case 'ewind': return [f.ai && f.ai.move === 'grab' ? 'grab' : 'wind', 0];
    case 'eatk': return ['punch1', 0];
    case 'charge': return ['charge', Math.floor(t / 5) % 4];
    case 'victory': return ['victory', Math.floor(t / 20) % 2];
    default: return ['idle', Math.floor((t + (f.id * 7)) / 24) % 2];
  }
}

// ---- Efectos que nacen de los eventos de la simulación ----
export function createFx() {
  const parts = [];
  let shake = 0;
  return {
    parts,
    get shake() { return shake; },
    push(world, events, opts) {
      for (const e of events) {
        if (e.type === 'hit') {
          parts.push({ k: 'spark', x: e.x, y: e.y, z: e.z, t: 0, life: 10, big: e.dmg >= 10 });
          if (opts.shake && e.dmg >= 10) shake = Math.max(shake, 4);
        } else if (e.type === 'block') parts.push({ k: 'block', x: e.x, y: e.y, z: e.z, t: 0, life: 10 });
        else if (e.type === 'land') { parts.push({ k: 'dust', x: e.x, y: e.y, z: 0, t: 0, life: 14 }); if (opts.shake) shake = Math.max(shake, 2); }
        else if (e.type === 'special') parts.push({ k: 'sp', hero: e.hero, slot: e.slot, x: e.x, y: e.y, z: 0, t: 0, life: 36 });
        else if (e.type === 'break') for (let i = 0; i < 6; i++) parts.push({ k: 'chip', x: e.x, y: e.y, z: 10, vx: (i - 2.5) * 0.7, vz: 2 + (i % 3), t: 0, life: 24 });
        else if (e.type === 'pickup') parts.push({ k: 'pick', x: e.x, y: e.y, z: 20, t: 0, life: 30, kind: e.kind });
      }
    },
    step() {
      for (const p of parts) { p.t++; if (p.k === 'chip') { p.x += p.vx; p.z = Math.max(0, p.z + p.vz); p.vz -= 0.3; } if (p.k === 'pick') p.z += 0.5; }
      for (let i = parts.length - 1; i >= 0; i--) if (parts[i].t >= parts[i].life) parts.splice(i, 1);
      if (shake > 0) shake -= 0.5;
    },
    clear() { parts.length = 0; shake = 0; },
  };
}

// ---- Objetos y cajas ----
function drawProp(ctx, p, x, y) {
  if (p.broken) return;
  if (p.kind === 'caja') {
    ctx.fillStyle = '#120c18'; ctx.fillRect(x - 11, y - 25, 22, 25);
    ctx.fillStyle = '#b8864b'; ctx.fillRect(x - 10, y - 24, 20, 23);
    ctx.fillStyle = '#8a5f30'; ctx.fillRect(x - 10, y - 13, 20, 2); ctx.fillRect(x - 1, y - 24, 2, 23);
  } else {
    ctx.fillStyle = '#120c18'; ctx.fillRect(x - 8, y - 22, 16, 22);
    ctx.fillStyle = '#5d7d8c'; ctx.fillRect(x - 7, y - 21, 14, 20);
    ctx.fillStyle = '#3f5a66'; ctx.fillRect(x - 7, y - 21, 14, 3); ctx.fillRect(x - 3, y - 15, 2, 12); ctx.fillRect(x + 2, y - 15, 2, 12);
  }
}

const ITEM_DRAW = {
  bocadillo: (c, x, y) => { c.fillStyle = '#120c18'; c.fillRect(x - 9, y - 7, 18, 7); c.fillStyle = '#e0a84a'; c.fillRect(x - 8, y - 6, 16, 5); c.fillStyle = '#f2e3b3'; c.fillRect(x - 6, y - 4, 12, 1); c.fillStyle = '#d9a640'; c.fillRect(x - 4, y - 5, 2, 1); c.fillRect(x + 2, y - 5, 2, 1); },
  cafe: (c, x, y) => { c.fillStyle = '#120c18'; c.fillRect(x - 5, y - 9, 10, 9); c.fillStyle = '#f4f4f0'; c.fillRect(x - 4, y - 8, 8, 7); c.fillStyle = '#6b3a1e'; c.fillRect(x - 4, y - 8, 8, 2); c.fillStyle = '#ddd'; c.fillRect(x + 4, y - 6, 2, 3); },
  grapadora: (c, x, y) => { c.fillStyle = '#120c18'; c.fillRect(x - 8, y - 6, 16, 6); c.fillStyle = '#c33'; c.fillRect(x - 7, y - 5, 14, 2); c.fillStyle = '#333'; c.fillRect(x - 7, y - 3, 14, 2); },
  extintor: (c, x, y) => { c.fillStyle = '#120c18'; c.fillRect(x - 5, y - 18, 10, 18); c.fillStyle = '#d42a2a'; c.fillRect(x - 4, y - 16, 8, 15); c.fillStyle = '#222'; c.fillRect(x - 2, y - 18, 5, 3); },
  silla: (c, x, y) => { c.fillStyle = '#120c18'; c.fillRect(x - 8, y - 20, 16, 20); c.fillStyle = '#2b2b33'; c.fillRect(x - 7, y - 19, 4, 12); c.fillRect(x - 7, y - 9, 14, 3); c.fillStyle = '#777'; c.fillRect(x - 1, y - 6, 2, 5); c.fillRect(x - 6, y - 2, 12, 1); },
  pua: (c, x, y, t) => { c.fillStyle = '#120c18'; c.beginPath(); c.moveTo(x - 6, y - 12); c.lineTo(x + 6, y - 12); c.lineTo(x, y - 1); c.fill(); c.fillStyle = t % 40 < 20 ? '#ffd23f' : '#ffe98a'; c.beginPath(); c.moveTo(x - 5, y - 11); c.lineTo(x + 5, y - 11); c.lineTo(x, y - 2); c.fill(); },
};
export function drawItem(ctx, kind, x, y, t = 0) { (ITEM_DRAW[kind] || ITEM_DRAW.cafe)(ctx, Math.round(x), Math.round(y), t); }

function drawShot(ctx, s, x, y) {
  const yy = Math.round(y - s.z);
  if (s.kind === 'telefono') { ctx.fillStyle = '#120c18'; ctx.fillRect(x - 6, yy - 4, 12, 7); ctx.fillStyle = '#e8e2d0'; ctx.fillRect(x - 5, yy - 3, 10, 5); ctx.fillStyle = '#333'; ctx.fillRect(x - 3, yy - 1, 6, 1); }
  else if (s.kind === 'disco') { ctx.fillStyle = '#120c18'; ctx.beginPath(); ctx.arc(x, yy, 6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#d9b21f'; ctx.beginPath(); ctx.arc(x, yy, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#120c18'; ctx.fillRect(x - 1, yy - 1, 2, 2); }
  else { ctx.fillStyle = '#d8d8e0'; ctx.fillRect(x - 3, yy - 1, 6, 2); ctx.fillStyle = '#fff'; ctx.fillRect(x - 3, yy - 1, 2, 1); }
}

// ---- Efectos ----
function drawFx(ctx, p, cam, opts) {
  const x = Math.round(p.x - cam), y = Math.round(p.y - p.z);
  const k = p.t / p.life;
  if (p.k === 'spark') {
    const r = (p.big ? 9 : 6) * (1 - k * 0.5);
    ctx.fillStyle = opts.flashes === false ? '#ffd23f' : (p.t % 4 < 2 ? '#fff' : '#ffd23f');
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.3; ctx.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r), 2, 2); }
    if (p.t < 4) { ctx.fillStyle = '#fff'; ctx.fillRect(x - 2, y - 2, 4, 4); }
  } else if (p.k === 'block') {
    ctx.fillStyle = '#9fd6ff'; for (let i = 0; i < 4; i++) ctx.fillRect(x - 6 + i * 4, y - 6 + (i % 2) * 3, 2, 2);
  } else if (p.k === 'dust') {
    ctx.fillStyle = `rgba(210,200,180,${0.6 * (1 - k)})`;
    ctx.fillRect(x - 10 - p.t, y - 2, 6, 3); ctx.fillRect(x + 4 + p.t, y - 2, 6, 3);
  } else if (p.k === 'chip') {
    ctx.fillStyle = '#8a5f30'; ctx.fillRect(x, y, 3, 3);
  } else if (p.k === 'pick') {
    drawText(ctx, p.kind === 'pua' ? '+1000' : p.kind === 'bocadillo' || p.kind === 'cafe' ? '♥' : '★', x, y - 20, { color: '#ffd23f', align: 'center' });
  } else if (p.k === 'sp') {
    const col = SLOT_COLORS[p.slot] || '#fff';
    if (p.hero === 'antonio') { // ondas del grito
      for (let i = 0; i < 3; i++) { const r = 8 + ((p.t * 3 + i * 12) % 60); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + 10, y - 44, r, -0.6, 0.6); ctx.stroke(); }
      for (let i = 0; i < 3; i++) { const r = 8 + ((p.t * 3 + i * 12) % 60); ctx.beginPath(); ctx.arc(x - 10, y - 44, r, Math.PI - 0.6, Math.PI + 0.6); ctx.stroke(); }
    } else if (p.hero === 'pepe' && p.t > 10) {
      ctx.fillStyle = col; const r = (p.t - 10) * 2.4; ctx.fillRect(x - r, y - 2, 6, 3); ctx.fillRect(x + r - 6, y - 2, 6, 3); ctx.fillStyle = '#fff8'; ctx.fillRect(x - r, y - 4, r * 2, 1);
    } else {
      ctx.fillStyle = col; for (let i = 0; i < 5; i++) { const a = p.t * 0.25 + i * 1.256; drawText(ctx, '♥', x + Math.cos(a) * 26 - 2, y - 30 + Math.sin(a) * 12, { color: col, shadow: null }); }
    }
  }
}

// ---- HUD (F11): una tarjeta por jugador arriba; barra del jefe abajo ----
export function drawHud(ctx, world, extra = {}) {
  for (let slot = 0; slot < 4; slot++) {
    const x = 2 + slot * 95, y = 2;
    const p = world.fighters.find((f) => f.team === 'p' && f.slot === slot);
    ctx.fillStyle = 'rgba(10,8,20,0.72)'; ctx.fillRect(x, y, 92, 26);
    ctx.fillStyle = SLOT_COLORS[slot]; ctx.fillRect(x, y, 92, 2);
    if (!p) {
      drawText(ctx, `J${slot + 1}`, x + 4, y + 6, { color: SLOT_COLORS[slot] });
      drawText(ctx, extra.joinHint || 'ÚNETE', x + 20, y + 6, { color: '#8a8698' });
      drawText(ctx, extra.code ? `SALA ${extra.code}` : '', x + 20, y + 15, { color: '#8a8698' });
      continue;
    }
    drawPortrait(ctx, p.type, p.palette, p.def.h, x + 1, y + 3, 22);
    drawText(ctx, HEROES[p.type].name, x + 25, y + 4, { color: SLOT_COLORS[slot] });
    // vida
    ctx.fillStyle = '#120c18'; ctx.fillRect(x + 25, y + 13, 64, 5);
    const frac = Math.max(0, p.hp / p.maxHp);
    ctx.fillStyle = frac > 0.5 ? '#3fdc7a' : frac > 0.25 ? '#ffd23f' : '#ff4d4d'; ctx.fillRect(x + 26, y + 14, Math.round(62 * frac), 3);
    if (p.out) drawText(ctx, p.contT > 0 ? `CONTINUAR ${Math.ceil(p.contT / 60)}` : 'FUERA', x + 25, y + 19, { color: '#ff4d4d' });
    else if (p.away) drawText(ctx, 'SIN MANDO…', x + 25, y + 19, { color: '#ffd23f' });
    else {
      drawText(ctx, `♥${p.lives}`, x + 25, y + 19, { color: '#ff4d4d' });
      drawText(ctx, String(p.score).padStart(6, '0'), x + 89, y + 19, { color: '#cfc9e0', align: 'right' });
    }
  }
  const boss = world.fighters.find((f) => f.team === 'e' && f.def.boss && f.state !== 'dead');
  if (boss) {
    ctx.fillStyle = 'rgba(10,8,20,0.72)'; ctx.fillRect(60, H - 15, W - 120, 13);
    drawText(ctx, boss.def.name, 64, H - 13, { color: '#ffd23f' });
    ctx.fillStyle = '#120c18'; ctx.fillRect(64, H - 5, W - 128, 3);
    ctx.fillStyle = '#ff4d4d'; ctx.fillRect(64, H - 5, Math.round((W - 128) * Math.max(0, boss.hp / boss.maxHp)), 3);
  }
}

export function drawWorld(ctx, world, fx, opts = {}) {
  const bg = getBackground(world.level);
  const sh = fx && fx.shake > 0 && opts.shake !== false ? Math.round(Math.sin(world.tick * 1.7) * fx.shake) : 0;
  const elevatorBob = world.level.elevator && world.waitT > 0 && !world.waveActive ? Math.round(Math.sin(world.tick * 0.9)) : 0;
  const cam = Math.round(world.camX);
  ctx.save();
  ctx.translate(sh, elevatorBob);
  ctx.drawImage(bg.far, Math.round(-cam * 0.3), 0);
  ctx.drawImage(bg.near, -cam, 0);
  // pirotecnia de escenario en la azotea
  if (bg.fireAt) for (const fxX of bg.fireAt) {
    const x = fxX - cam; if (x < -20 || x > W + 20) continue;
    for (let i = 0; i < 5; i++) { const hh = 10 + ((world.tick * 3 + i * 17) % 22); ctx.fillStyle = i % 2 ? '#ffd23f' : '#ff6a2a'; ctx.fillRect(x + 2 + i * 2, FLOOR_TOP - 30 - hh, 2, hh); }
  }

  const actors = [];
  for (const p of world.props) if (!p.broken) actors.push({ y: p.y, draw: () => drawProp(ctx, p, Math.round(p.x - cam), Math.round(p.y)) });
  for (const it of world.items) actors.push({ y: it.y - 1, draw: () => drawItem(ctx, it.kind, it.x - cam, it.y, world.tick) });
  for (const f of world.fighters) {
    if (f.removed || (f.team === 'p' && f.out)) continue;
    actors.push({ y: f.y + (f.state === 'grabbed' ? 0.1 : 0), f });
  }
  for (const s of world.shots) actors.push({ y: s.y + 0.2, draw: () => drawShot(ctx, s, Math.round(s.x - cam), Math.round(s.y)) });
  // sombras primero
  for (const a of actors) if (a.f && !(a.f.team === 'e' && a.f.state === 'dead' && a.f.t > 20)) {
    const f = a.f, w = f.def.w * 0.9 * Math.max(0.5, 1 - f.z / 120);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(Math.round(f.x - cam), Math.round(f.y), w, 3, 0, 0, Math.PI * 2); ctx.fill();
  }
  actors.sort((a, b) => a.y - b.y);
  for (const a of actors) {
    if (a.draw) { a.draw(); continue; }
    const f = a.f;
    const blink = (f.invul > 0 && f.state !== 'special' && Math.floor(world.tick / 4) % 2 === 0) || (f.state === 'dead' && f.team === 'e' && f.t > 20 && f.t % 4 < 2);
    if (blink) continue;
    let face = f.face;
    if (f.state === 'special' && f.hero === 'dani') face = Math.floor(f.t / 5) % 2 ? -face : face;   // el «solo» gira
    const x = Math.round(f.x - cam), y = Math.round(f.y - f.z);
    let drawnH = 0;
    if (hasAtlas(f.type)) drawnH = drawFrame(ctx, f.type, f.palette || 0, heroFrameName(f), x, y, face);   // sprites finales
    if (!drawnH) {                                                                                       // provisionales
      const [st, fr] = spriteState(f);
      const spr = getSprite(f.type, f.palette || 0, st, fr, f.def.h, f.hero);
      ctx.save();
      ctx.translate(x, y);
      if (face < 0) ctx.scale(-1, 1);
      if (f.state === 'down' || f.state === 'dead') { ctx.translate(-f.def.h * 0.45, -4); ctx.rotate(-Math.PI / 2); ctx.translate(0, f.def.h * 0.1); }
      else if (f.state === 'fall' || f.state === 'thrown') ctx.rotate(-0.9);
      ctx.drawImage(spr.canvas, -spr.ox, -spr.oy);
      ctx.restore();
    }
    const topY = y - Math.max(f.def.h, drawnH && f.state !== 'down' && f.state !== 'dead' ? drawnH : 0);
    if (f.team === 'p' && !f.away) {   // marca del jugador
      ctx.fillStyle = SLOT_COLORS[f.slot];
      const mx = x - 3, my = topY - 8;
      ctx.fillRect(mx, my, 7, 2); ctx.fillRect(mx + 2, my + 2, 3, 2);
      if (f.weapon) drawItem(ctx, f.weapon.kind, x + f.face * 10, y - 22);
    }
    if (f.team === 'p' && f.away) drawText(ctx, '…', x, topY - 10, { color: '#ffd23f', align: 'center' });
  }
  if (fx) for (const p of fx.parts) drawFx(ctx, p, cam, opts);
  ctx.restore();

  // ¡ADELANTE! (parpadeo lento, < 3 Hz)
  if (world.goT > 0 && !world.level.elevator && Math.floor(world.goT / 20) % 2 === 0) drawText(ctx, '¡ADELANTE! ▶', W - 10, 96, { color: '#ffd23f', scale: 2, align: 'right' });
  if (world.level.elevator && world.waitT > 0 && !world.waveActive && world.waveIdx > 0) drawText(ctx, 'SUBIENDO…', W / 2, 96, { color: '#ffd23f', scale: 2, align: 'center' });
}
