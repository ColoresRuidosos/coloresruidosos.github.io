import { TILE, P, MIC, DT, ENEMY, PUA, STAR, DROP_EVERY, HITSTOP, COMBO_WINDOW, POINTS, OVATION, GUITAR, AMP, INTRO } from './constants.js';
import { parseLevel } from '../engine/tilemap.js';
import { createPlayer, stepPlayerMotion } from '../engine/physics.js';
import { edges } from '../engine/buttons.js';
import { QUOTES, HEADLINES } from '../data/quotes.js';
import { createEnemy, stepEnemy, bounceOff } from './enemies.js';
import { createBoss, stepBoss, hitBoss as hitFlashBot } from './boss.js';
import { createLantern, stepLantern, refill, createMask, stepMask, hitMask, setMicTip } from './noche.js';

// Jefe según el nivel: 'B' Cámara Flash-Bot (Mundo 1), 'E' El Enmascarado del Lago (Mundo 2).
export const hitBoss = (g, b, force = false) => (b.kind === 'mask' ? hitMask(g, b, force) : hitFlashBot(g, b, force));

const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

// `carry`: lo que se conserva entre niveles del mismo mundo (puntos, Ovación, corazones).
// `opts.facts`: datos que salen al vencer a un Titular (por mundo; por defecto, las citas generales).
// `opts.assist`: modo asistido (no se pierden corazones). `opts.lantern`: nivel a oscuras con farol (Noche).
export function createGame(levelText, carry = {}, opts = {}) {
  const level = parseLevel(levelText);
  const g = {
    level,
    player: createPlayer(level.player),
    mic: { phase: 'idle', len: 0, dir: 1, ax: 1, ay: 0, hook: null },
    enemies: level.enemies.map((s, i) => createEnemy(s, i, HEADLINES)),
    pieces: level.pieces.map((s) => ({ ...s, taken: false })),
    items: level.items.map((s) => ({ ...s, taken: false })),
    boss: !level.boss ? null : level.boss.kind === 'mask' ? createMask(level.boss, level) : createBoss(level.boss), disco: null,
    hearts: carry.hearts ?? 3, piezas: 0, time: 0, frame: 0, invuln: 0,
    score: carry.score ?? 0, combo: 0, comboT: 0, ovacion: carry.ovacion ?? 0,
    hitstop: 0, shake: 0, guitarT: 0, amp: 0,
    checkpoint: { ...level.player }, quoteIdx: carry.quoteIdx ?? 0,
    status: 'play', popups: [], floats: [], events: [], prev: {},
    facts: opts.facts ?? QUOTES,
    pua: 0, star: 0, picks: [], defeats: 0, bossHits: 0,
    thoughts: opts.thoughts ?? null, thoughtIdx: carry.thoughtIdx ?? 0, thoughtsShown: [], thought: null,
    assist: !!opts.assist, hurts: 0, lantern: opts.lantern ? createLantern() : null, blackout: false, shots: [],
  };
  // Niveles con jefe: empiezan con su cinemática de entrada.
  g.intro = level.boss ? { t: 0, x0: g.player.x, drop: INTRO.dropH, landed: false } : null;
  return g;
}

export const micRange = (g) => MIC.range * (g.amp > 0 ? AMP.mult : 1);
export const micHand = (g) => ({ x: g.player.x + g.player.w / 2 + g.mic.dir * MIC.handX, y: g.player.y + g.player.h - MIC.handY });
export const micTip = (g) => {
  // (también lo usa el Enmascarado para romper sus máscaras con el micrófono)
  const h = micHand(g);
  return { x: h.x + g.mic.ax * g.mic.len, y: h.y + g.mic.ay * g.mic.len };
};

// Gancho al que iría el micro si se lanzara ahora (delante, a tiro y a una altura razonable), o null.
// Lo usa la puntería del micro y el aviso «B» sobre el gancho (spec §3.0f L).
export function aimHook(g) {
  const p = g.player, dir = p.facing, range = micRange(g);
  const hand = { x: p.x + p.w / 2 + dir * MIC.handX, y: p.y + p.h - MIC.handY };
  return g.level.hooks
    .filter((h) => (h.x - hand.x) * dir > 0 && Math.abs(h.y - hand.y) <= MIC.aimY && Math.hypot(h.x - hand.x, h.y - hand.y) <= range)
    .sort((a, b) => Math.abs(a.x - hand.x) - Math.abs(b.x - hand.x))[0] ?? null;
}

export function hurt(g, fromX) {
  if (g.invuln > 0 || g.star > 0) return; // con el Antifaz, nada hace daño
  g.hurts++;
  if (!g.assist) g.hearts--;
  g.invuln = P.invuln;
  g.combo = 0; g.comboT = 0;
  g.shake = Math.max(g.shake, 0.25);
  g.events.push('hurt');
  const p = g.player;
  p.vx = (p.x + p.w / 2 < fromX ? -1 : 1) * P.knockback;
  p.vy = -200;
  p.hooked = null;
  if (g.hearts <= 0) { g.status = 'gameover'; g.events.push('gameover'); }
}

function respawn(g) {
  const p = g.player;
  p.x = g.checkpoint.x - p.w / 2; p.y = g.checkpoint.y - p.h; p.vx = 0; p.vy = 0; p.hooked = null;
  g.mic.phase = 'idle'; g.mic.len = 0;
}

// Puntos con combo, Ovación, parón de impacto y temblor leve.
export function scoreHit(g, x, y) {
  g.combo = g.comboT > 0 ? g.combo + 1 : 1;
  g.comboT = COMBO_WINDOW;
  const pts = POINTS * g.combo;
  g.score += pts;
  g.ovacion = Math.min(OVATION.max, g.ovacion + OVATION.perHit * g.combo);
  g.hitstop = HITSTOP;
  g.shake = Math.max(g.shake, 0.12);
  g.floats.push({ x, y, text: g.combo > 1 ? `+${pts} X${g.combo}` : `+${pts}`, t: 0.9 });
}

// Vencer a un enemigo; si es un Titular, sale una frase verificada de Madero.
// Disfrazados de Noche (v8.1): el primer golpe les quita el disfraz (el Gigante necesita 2) y siguen, más rápidos;
// el siguiente los vence. `force` (Solo de guitarra) vence siempre.
export const COSTUMED = new Set(['gigante', 'invisible', 'anfibio', 'llorona', 'charro']);
export function defeat(g, e, force = false) {
  if (!e.alive) return;
  if (COSTUMED.has(e.kind) && !e.unmasked && !force) {
    e.costumeHits = (e.costumeHits ?? 0) + 1;
    if (e.costumeHits >= (ENEMY[e.kind].costumeHits ?? 1)) { e.unmasked = true; e.unmaskT = 0; } else e.hitT = 0.3;
    g.events.push('defeat');
    scoreHit(g, e.x + e.w / 2, e.y);
    return;
  }
  e.alive = false;
  g.events.push('defeat');
  scoreHit(g, e.x + e.w / 2, e.y);
  // Cada 6 enemigos vencidos, el último deja caer una carta de fan (spec §3.0f H).
  if (++g.defeats % DROP_EVERY === 0) g.items.push({ kind: 'carta', x: e.x + e.w / 2, y: e.y + e.h - 12, taken: false, drop: true });
  // Cada dato sale una sola vez (v7.3): cuando se acaban, el Titular solo grita su titular.
  if (e.kind === 'titular' && g.quoteIdx < g.facts.length) {
    const q = g.facts[g.quoteIdx++];
    g.popups.push({ text: q.text, source: q.source, t: 3 });
  }
}

// Solo de guitarra: vence a todo lo que hay en pantalla (y daña al jefe, si lo hay).
function guitar(g) {
  const pc = g.player.x + g.player.w / 2;
  for (const e of g.enemies) if (e.alive && Math.abs(e.x + e.w / 2 - pc) <= GUITAR.reach) defeat(g, e, true);
  const b = g.boss;
  if (b?.alive && Math.abs(b.x + b.w / 2 - pc) <= GUITAR.reach + b.w / 2) hitBoss(g, b, true);
  g.ovacion = 0;
  g.invuln = Math.max(g.invuln, GUITAR.invuln);
  g.guitarT = GUITAR.fx;
  g.shake = Math.max(g.shake, 0.4);
  g.events.push('guitar');
}

function stepMic(g, pressed) {
  const m = g.mic, p = g.player, range = micRange(g);
  if (m.phase === 'idle') {
    // Púa de guitarra: con cada lanzamiento sale también una púa recta.
    if (pressed && g.pua > 0) { const h = micHand(g); g.picks.push({ x: h.x - PUA.w / 2, y: h.y - PUA.h / 2, w: PUA.w, h: PUA.h, vx: p.facing * PUA.speed, dist: 0 }); }
    if (pressed) {
      m.phase = 'out'; m.dir = p.facing; m.len = 0; m.ax = m.dir; m.ay = 0; m.target = null;
      // Asistencia de puntería: si hay un gancho delante a tiro, el micro sale hacia él.
      const target = aimHook(g);
      if (target) m.target = target;
      g.events.push('mic');
    }
    return;
  }
  if (m.phase === 'out') {
    m.len = Math.min(range, m.len + MIC.outSpeed * DT);
    if (m.target) {
      // Sigue apuntando al gancho elegido aunque Pepe se mueva en el aire.
      const hand = micHand(g);
      const d = Math.hypot(m.target.x - hand.x, m.target.y - hand.y) || 1;
      m.ax = (m.target.x - hand.x) / d; m.ay = (m.target.y - hand.y) / d;
    }
    const tip = micTip(g);
    const hook = g.level.hooks.find((h) => Math.hypot(h.x - tip.x, h.y - tip.y) <= MIC.hookRadius);
    if (hook) {
      m.phase = 'hook'; m.hook = hook;
      p.hooked = { x: hook.x, y: hook.y, pull: MIC.pull, oy: p.h - MIC.handY };
      g.events.push('hook');
      return;
    }
    const e = g.enemies.find((en) => en.alive && tip.x >= en.x - 2 && tip.x <= en.x + en.w + 2 && tip.y >= en.y - 4 && tip.y <= en.y + en.h + 2);
    if (e) { defeat(g, e); m.phase = 'back'; return; }
    const b = g.boss;
    if (b?.alive && tip.x >= b.x && tip.x <= b.x + b.w && tip.y >= b.y && tip.y <= b.y + b.h) { hitBoss(g, b); m.phase = 'back'; return; }
    if (m.len >= range) m.phase = 'back';
    return;
  }
  if (m.phase === 'hook') {
    const hand = micHand(g);
    const dx = m.hook.x - hand.x, dy = m.hook.y - hand.y;
    const d0 = Math.hypot(dx, dy) || 1;
    m.len = d0; m.ax = dx / d0; m.ay = dy / d0;
    if (Math.hypot(m.hook.x - (p.x + p.w / 2), m.hook.y - (p.y + p.h - MIC.handY)) < 12) {
      p.hooked = null;
      // Se conserva el impulso: sale disparado en la dirección en la que iba.
      p.vx = m.dir * MIC.releaseVx;
      p.vy = -MIC.releaseVy;
      p.jumping = false;
      m.phase = 'back';
      g.events.push('release');
    }
    return;
  }
  if (m.phase === 'back') {
    m.len -= MIC.backSpeed * DT;
    if (m.len <= 0) { m.len = 0; m.phase = 'idle'; }
  }
}

// Cinemática del jefe: Pepe entra solo, el jefe cae del techo, cartel y «¡A ESCENA!».
// El cronómetro no corre y nadie ataca. A o B la saltan tras INTRO.skip segundos.
function stepIntro(g, btn) {
  const it = g.intro, p = g.player;
  const ed = edges(g.prev, btn);
  g.prev = { ...btn };
  if (it.t === 0) g.events.push('bossintro');
  it.t += DT;
  g.frame++;
  g.shake = Math.max(0, g.shake - DT);
  if ((ed.jumpPressed || ed.micPressed) && it.t >= INTRO.skip) it.t = INTRO.total;
  const walking = it.t < INTRO.walk && p.x < it.x0 + INTRO.walkDist;
  stepPlayerMotion(p, { left: false, right: walking, jump: false, jumpPressed: false }, g.level);
  if (!walking && p.onGround) p.vx = 0;
  const k = Math.min(1, Math.max(0, (it.t - INTRO.dropStart) / (INTRO.dropEnd - INTRO.dropStart)));
  it.drop = INTRO.dropH * (1 - k * k);
  if (!it.landed && it.t >= INTRO.dropEnd) { it.landed = true; g.shake = 0.35; g.events.push('bossland'); }
  if (!it.card && it.t >= INTRO.card) { it.card = true; g.events.push('bosscard'); }
  if (it.t >= INTRO.total) {
    it.drop = 0;
    g.intro = null;
    g.boss.t = 0;
    g.events.push('fight');
  }
  return g;
}

// Púas en vuelo: golpean al primer enemigo (o al jefe, si está vulnerable) y se acaban a los 200 px.
function stepPicks(g) {
  for (const k of g.picks) {
    const dx = k.vx * DT;
    k.x += dx; k.dist += Math.abs(dx);
    if (k.dist >= PUA.range || g.level.tileAt(Math.floor((k.x + k.w / 2) / TILE), Math.floor((k.y + k.h / 2) / TILE)) === '#') { k.done = true; continue; }
    const e = g.enemies.find((en) => en.alive && overlap(k, en));
    if (e) { defeat(g, e); k.done = true; continue; }
    const b = g.boss;
    if (b?.alive && overlap(k, b)) { hitBoss(g, b); k.done = true; }
  }
  g.picks = g.picks.filter((k) => !k.done);
}

// Un paso de 1/60 s. `btn` = botones mantenidos {left,right,jump,mic,special}.
export function stepGame(g, btn) {
  g.events = [];
  if (g.status !== 'play') return g;
  // Parón de impacto: el mundo se congela unos fotogramas (los flancos de botón se guardan para después).
  if (g.hitstop > 0) { g.hitstop--; return g; }
  if (g.intro) return stepIntro(g, btn);
  const ed = edges(g.prev, btn);
  g.prev = { ...btn };
  g.frame++; g.time += DT;
  g.invuln = Math.max(0, g.invuln - DT);
  g.comboT = Math.max(0, g.comboT - DT);
  g.amp = Math.max(0, g.amp - DT);
  g.pua = Math.max(0, g.pua - DT);
  g.star = Math.max(0, g.star - DT);
  g.shake = Math.max(0, g.shake - DT);
  g.guitarT = Math.max(0, g.guitarT - DT);
  const p = g.player;

  // Congelado por un flash: no responde a los botones (la gravedad sigue).
  const frozen = p.frozen > 0;
  if (frozen) p.frozen = Math.max(0, p.frozen - DT);
  const input = frozen ? { left: false, right: false, jump: false, jumpPressed: false } : { ...btn, jumpPressed: ed.jumpPressed };
  if (frozen) p.vx = 0;

  if (ed.specialPressed && g.ovacion >= OVATION.max) guitar(g);
  stepMic(g, !frozen && ed.micPressed);
  const prevBottom = p.y + p.h;
  const wasGround = p.onGround;
  g.events.push(...stepPlayerMotion(p, input, g.level));
  // Llanto de La Llorona: Pepe va a media velocidad un momento.
  if (p.slowT > 0) { p.slowT = Math.max(0, p.slowT - DT); const m = P.maxRun / 2; p.vx = Math.max(-m, Math.min(m, p.vx)); }
  p.landT = p.onGround && !wasGround ? 0 : (p.landT ?? 1) + DT;

  for (const e of g.enemies) {
    stepEnemy(g, e);
    if (!e.alive || !overlap(p, e)) continue;
    if (g.star > 0) { defeat(g, e, true); continue; } // Antifaz: lo que tocas queda vencido
    if (p.vy > 0 && prevBottom <= e.y + 6) {
      defeat(g, e);
      p.vy = -P.stompBounce; p.jumping = false;
      g.events.push('stomp');
    } else if (g.invuln <= 0) {
      hurt(g, e.x + e.w / 2);
      if (ENEMY[e.kind].push) p.vx *= ENEMY[e.kind].push; // el empujón del Gigante
      bounceOff(g, e);
    }
  }
  if (g.boss) (g.boss.kind === 'mask' ? stepMask : stepBoss)(g, g.boss, hurt, prevBottom);
  stepPicks(g);
  stepLantern(g);
  // Disco de Oro que deja el jefe: tocarlo completa el mundo.
  if (g.disco && !g.disco.taken && g.boss.deadT > 0.4 && Math.abs(g.disco.x - (p.x + p.w / 2)) < 16 && Math.abs(g.disco.y - (p.y + p.h / 2)) < 26) {
    g.disco.taken = true; g.status = 'won'; g.events.push('won');
  }

  const near = (o) => Math.abs(o.x - (p.x + p.w / 2)) < 12 && Math.abs(o.y - (p.y + p.h / 2)) < 18;
  for (const pc of g.pieces) if (!pc.taken && near(pc)) { pc.taken = true; g.piezas++; g.events.push('piece'); }
  for (const it of g.items) {
    if (it.taken || !near(it)) continue;
    it.taken = true;
    g.events.push(`item:${it.kind}`); // para explicarlo la primera vez (guía de objetos)
    if (it.kind === 'amp') { g.amp = AMP.time; g.events.push('powerup'); g.floats.push({ x: it.x, y: it.y - 10, text: 'MICRO X2', t: 1.2 }); }
    else if (it.kind === 'pua') { g.pua = PUA.time; g.events.push('powerup'); g.floats.push({ x: it.x, y: it.y - 10, text: 'PÚA', t: 1.2 }); }
    else if (it.kind === 'antifaz') { g.star = STAR.time; g.events.push('powerup'); g.floats.push({ x: it.x, y: it.y - 10, text: '¡INVENCIBLE!', t: 1.2 }); }
    else if (it.kind === 'aceite') { refill(g); g.events.push('powerup'); g.floats.push({ x: it.x, y: it.y - 10, text: 'ACEITE', t: 1.2 }); }
    else if (it.kind === 'carta') { g.hearts = Math.min(3, g.hearts + 1); g.events.push('heal'); g.floats.push({ x: it.x, y: it.y - 10, text: '+♥', t: 1.2 }); }
  }

  // Pinchos (zarzas) bajo los pies.
  const tyFeet = Math.floor((p.y + p.h - 1) / TILE);
  for (const tx of [Math.floor((p.x + 2) / TILE), Math.floor((p.x + p.w - 2) / TILE)]) {
    if (g.level.tileAt(tx, tyFeet) === '^') hurt(g, tx * TILE + TILE / 2);
  }

  // Foso: pierdes un corazón y vuelves al último checkpoint.
  if (p.y > g.level.h * TILE + 40 && g.status === 'play') {
    g.invuln = 0;
    hurt(g, p.x);
    g.invuln = 0.6;
    if (g.status === 'play') respawn(g);
  }

  for (const c of g.level.checkpoints) {
    if (!(p.x > c.x && c.x > g.checkpoint.x)) continue;
    g.checkpoint = { ...c }; g.events.push('checkpoint');
    // Pepe piensa en voz alta (spec §1.1b): un pensamiento por checkpoint, en orden por todo el mundo.
    if (g.thoughts && g.thoughtIdx < g.thoughts.length) {
      const text = g.thoughts[g.thoughtIdx++];
      g.thoughtsShown.push(text); g.thought = { text, t: 2.6 };
    }
  }
  if (g.thought && (g.thought.t -= DT) <= 0) g.thought = null;

  const goal = g.level.goal;
  if (goal && Math.abs(goal.x - (p.x + p.w / 2)) < 10 && Math.abs(goal.y - (p.y + p.h)) < 20) {
    g.status = 'won'; g.events.push('won');
  }

  for (const pop of g.popups) pop.t -= DT;
  g.popups = g.popups.filter((pop) => pop.t > 0);
  for (const f of g.floats) { f.t -= DT; f.y -= 20 * DT; }
  g.floats = g.floats.filter((f) => f.t > 0);
  return g;
}

setMicTip(micTip);
