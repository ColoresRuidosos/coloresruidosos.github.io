// F4–F8: la pelea. Lógica pura y determinista: step(m, t, acciones) con t = tiempo de canción (s).
import { createClock } from '../core/clock.js';
import { judge } from '../core/judge.js';
import { createRng } from '../core/rng.js';
import { ATTACKS, POOLS, TUTORIAL, HINTS } from '../data/patterns.js';
import * as K from './constants.js';

export function createMatch({ beatmap, seed = 1, assist = false, tutorial = true }) {
  const clock = createClock(beatmap);
  const fase1 = beatmap.sections.find((s) => s.kind === 'fase1').from;
  const cierre = beatmap.sections.find((s) => s.kind === 'cierre').from;
  return {
    beatmap, clock, assist, rng: createRng(seed), t: 0,
    phase: 1, over: null, overAt: 0,
    tutorial: tutorial ? [...TUTORIAL] : [], tutorialSeen: 0,
    heart: { mode: 'espera', attack: null, attackId: 0, hits: [], avisoAt: 0, until: fase1, open: null, used: new Set(),
      hp: [...K.HEART_HP], lastHurt: -9, last: [] },
    clown: { hp: K.CLOWN_HP, pose: 'listo', poseAt: 0, poseUntil: 0 },
    dodges: [], stars: 0, streak: 0, combo: 0, maxCombo: 0, score: 0,
    stats: { perfecto: 0, bien: 0, temprano: 0, fuera: 0, golpes: 0, batazos: 0, rebotes: 0, caiste: 0, dano: 0, abiertos: 0 },
    events: [], hint: null, fase1, cierre, decideAt: beatmap.duration - 4,
  };
}

const win = (m) => K.WIN.good * (m.assist ? 2 : 1);
const early = (m) => K.WIN.early * (m.assist ? 1.5 : 1);
const ev = (m, type, extra = {}) => m.events.push({ type, t: m.t, ...extra });
const section = (m, t) => m.beatmap.sections.find((s) => t >= s.from && t < s.to) || m.beatmap.sections.at(-1);

export function step(m, now, actions = []) {
  for (const a of [...(actions || [])].sort((x, y) => x.t - y.t)) {
    advance(m, Math.max(m.t, a.t));
    if (m.over) break;
    act(m, a);
  }
  advance(m, now);
  m.hint = hintOf(m);
  return m;
}

// ---------- acciones del jugador ----------
function act(m, a) {
  const h = m.heart;
  if (a.type === 'swipe') {
    m.dodges.push({ t: a.t, dir: a.dir, used: false });
    if (m.dodges.length > 12) m.dodges.shift();
    pose(m, a.dir === 'abajo' ? 'agachado' : a.dir === 'izq' ? 'esquivaIzq' : 'esquivaDer', a.t, a.dir === 'abajo' ? K.HOLD.agachado : K.HOLD.esquiva);
    return;
  }
  if (a.type === 'tap') {
    if (['transicion', 'ko', 'final'].includes(h.mode)) return;
    pose(m, 'batazo', a.t, K.HOLD.batazo);
    if ((h.mode === 'abierto' || h.mode === 'aturdido') && h.open) {
      const b = m.clock.nearestBeat(a.t);
      if (b >= h.open[0] && b <= h.open[1] && !h.used.has(b)) {
        h.used.add(b);
        const g = judge(m.clock.timeOfBeat(b), a.t, m.assist);
        const dmg = K.DMG[g] * (h.mode === 'aturdido' ? K.GRITO_MULT : 1);
        m.stats.batazos++; m.stats.dano += dmg;
        h.hp[m.phase - 1] = Math.max(0, h.hp[m.phase - 1] - dmg); h.lastHurt = a.t;
        grade(m, g, K.SCORE.batazo[g]);
        ev(m, 'batazo', { grade: g, dmg });
        if (h.hp[m.phase - 1] <= 0) barEmpty(m, a.t);
        return;
      }
    }
    m.stats.rebotes++; m.streak = 0; m.combo = 0;
    ev(m, 'rebote');
    return;
  }
  if (a.type === 'mic') {
    if (m.stars < K.STARS_MAX || ['transicion', 'ko', 'final', 'espera'].includes(h.mode)) return;
    m.stars = 0;
    const b = m.clock.nearestBeat(a.t);
    h.mode = 'aturdido'; h.hits = []; h.open = [b + 1, b + K.GRITO_BEATS]; h.used = new Set();
    h.until = m.clock.timeOfBeat(b + K.GRITO_BEATS) + win(m);
    pose(m, 'grito', a.t, K.HOLD.grito);
    ev(m, 'grito');
  }
}

function pose(m, p, t, hold) { Object.assign(m.clown, { pose: p, poseAt: t, poseUntil: t + hold }); }

function grade(m, g, pts) {
  if (g === 'perfecto') {
    m.streak++;
    if (m.streak % K.PERFECTS_PER_STAR === 0 && m.stars < K.STARS_MAX) { m.stars++; ev(m, 'estrella', { stars: m.stars }); }
  } else if (g === 'fuera') m.streak = 0;
  if (g === 'fuera') m.combo = 0; else { m.combo++; m.maxCombo = Math.max(m.maxCombo, m.combo); }
  m.stats[g]++;
  m.score += Math.round(pts * (1 + Math.min(m.combo, 20) / 20));
}

// ---------- el tiempo avanza ----------
function advance(m, t) {
  if (t < m.t) t = m.t;
  for (let guard = 0; guard < 64 && !m.over; guard++) {
    const h = m.heart;
    const next = nextEventTime(m);
    if (next === null || next > t) break;
    m.t = Math.max(m.t, next);
    if (m.t >= m.decideAt && !['transicion', 'ko'].includes(h.mode) && !(h.mode === 'ataque')) { decide(m); break; }
    if (h.mode === 'espera' || h.mode === 'guardia' || h.mode === 'recupera' || h.mode === 'abierto' || h.mode === 'aturdido') {
      if (h.mode === 'guardia' && h.attack) { h.mode = 'ataque'; ev(m, 'aviso', { attack: h.attack }); continue; }
      plan(m, h.until);
    } else if (h.mode === 'ataque') {
      const hit = h.hits.find((x) => !x.done);
      resolve(m, hit);
      if (m.over) break;
      if (h.hits.every((x) => x.done)) afterAttack(m);
    } else if (h.mode === 'transicion') {
      m.phase++; m.clown.hp = Math.min(K.CLOWN_HP, m.clown.hp + K.PHASE_HEAL);
      ev(m, 'fase', { phase: m.phase });
      plan(m, h.until);
    } else if (h.mode === 'final') { decide(m); break; }
  }
  if (!m.over) m.t = Math.max(m.t, t);
  if (m.over && m.t < t) m.t = t;
}

function nextEventTime(m) {
  const h = m.heart;
  if (h.mode === 'ataque') { const hit = h.hits.find((x) => !x.done); return hit ? hit.T + win(m) : m.t; }
  if (h.mode === 'guardia') return h.avisoAt;
  if (h.mode === 'final') return m.decideAt;
  return h.until;
}

function plan(m, from) {
  const h = m.heart, c = m.clock;
  h.attack = null; h.hits = []; h.open = null; h.used = new Set();
  if ((m.phase === 1 && from >= m.beatmap.phase2At) || (m.phase === 2 && from >= m.beatmap.phase3At)) return transition(m, from);
  const sec = section(m, from);
  let guardBeats = K.GUARD_BEATS[sec.kind] ?? K.GUARD_BEATS.alta;
  let attack;
  if (m.tutorial.length) { attack = m.tutorial.shift(); guardBeats = K.GUARD_BEATS.fase1; m.tutorialSeen++; }
  else attack = pick(m, sec.kind === 'respiro' ? POOLS.respiro : POOLS[m.phase]);
  const aviso = m.tutorialSeen && m.tutorialSeen <= 3 && h.attackId < 3 ? K.AVISO_BEATS[1] : K.AVISO_BEATS[m.phase];
  let hitBeat = Math.ceil(c.beatAt(from) - 1e-6) + guardBeats + aviso;
  if (hitBeat % 2) hitBeat++;
  const T = c.timeOfBeat(hitBeat);
  const lastT = attack === 'rafaga' ? c.timeOfBeat(hitBeat + 2) : T;
  if (lastT >= m.cierre) { h.mode = 'final'; h.until = m.decideAt; return; }
  h.attack = attack; h.attackId++; h.avisoAt = c.timeOfBeat(hitBeat - aviso);
  h.last = [...h.last.slice(-1), attack];
  const side = m.rng() < 0.5 ? 'izq' : 'der';
  if (attack === 'rafaga') {
    h.hits = [0, 1, 2].map((i) => { const s = (i % 2 === 0) === (side === 'izq') ? 'izq' : 'der';
      return { T: c.timeOfBeat(hitBeat + i), need: [s === 'izq' ? 'der' : 'izq'], side: s, done: false }; });
  } else if (attack === 'finta') {
    h.hits = [{ T, need: null, side, fake: true, done: false }];
  } else {
    h.hits = ATTACKS[attack].hits.map((x) => ({ ...x, T, done: false }));
  }
  h.mode = 'guardia';
}

function pick(m, pool) {
  const h = m.heart;
  const entries = Object.entries(pool).filter(([k]) => !(h.last.length === 2 && h.last[0] === k && h.last[1] === k));
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = m.rng() * total;
  for (const [k, w] of entries) { if ((r -= w) < 0) return k; }
  return entries.at(-1)[0];
}

function resolve(m, hit) {
  const lo = hit.T - early(m), hi = hit.T + win(m);
  const cands = m.dodges.filter((d) => !d.used && d.t >= lo && d.t <= hi);
  const d = cands.at(-1);
  hit.done = true;
  if (hit.fake) {
    if (d) { d.used = true; m.stats.caiste++; m.streak = 0; m.combo = 0; ev(m, 'caiste'); hit.ok = true; }
    else { hit.ok = true; ev(m, 'finta'); }
    return;
  }
  if (d && hit.need.includes(d.dir)) {
    d.used = true;
    let g = judge(hit.T, d.t, m.assist);
    if (g === 'fuera') g = 'temprano';
    hit.ok = true;
    if (g === 'temprano') { m.stats.temprano++; m.combo++; m.score += K.SCORE.esquiva.temprano; }
    else grade(m, g, K.SCORE.esquiva[g]);
    ev(m, 'esquiva', { grade: g, side: hit.side });
    return;
  }
  if (d) d.used = true;
  hit.ok = false;
  m.stats.golpes++; m.streak = 0; m.combo = 0;
  if (m.stars > 0) m.stars--;
  if (!m.assist) m.clown.hp = Math.max(0, m.clown.hp - K.HIT_DMG);
  pose(m, 'golpeado', hit.T, K.HOLD.golpeado);
  ev(m, 'golpe', { side: hit.side, attack: m.heart.attack });
  if (m.clown.hp <= 0) { m.over = 'derrota'; m.overAt = m.t; m.heart.mode = 'ko'; ev(m, 'derrota'); }
}

function afterAttack(m) {
  const h = m.heart, c = m.clock;
  const lastT = h.hits.at(-1).T, lastBeat = c.nearestBeat(lastT);
  if (h.hits.some((x) => !x.ok)) { h.mode = 'recupera'; h.until = c.timeOfBeat(lastBeat + K.RECOVER_BEATS); return; }
  if (h.hits[0].fake) { h.mode = 'recupera'; h.until = c.timeOfBeat(lastBeat + 1); return; }
  const n = K.OPEN_BEATS[m.phase];
  h.mode = 'abierto'; h.open = [lastBeat + 1, lastBeat + n]; h.used = new Set();
  h.until = c.timeOfBeat(lastBeat + n) + win(m);
  m.stats.abiertos++;
  ev(m, 'abierto');
}

function barEmpty(m, t) {
  if (m.phase < 3) return transition(m, t);
  m.over = 'ko'; m.overAt = t; m.heart.mode = 'ko';
  m.score += K.SCORE.ko + Math.round(Math.max(0, m.beatmap.duration - t) * K.SCORE.koPorSegundo);
  ev(m, 'ko');
}

function transition(m, t) {
  const h = m.heart;
  h.mode = 'transicion'; h.hits = []; h.open = null; h.attack = null;
  h.until = m.clock.timeOfBeat(m.clock.nearestBeat(t) + K.TRANSITION_BEATS);
  ev(m, 'transicion', { to: m.phase + 1 });
}

export function damageRatio(m) {
  const total = K.HEART_HP.reduce((a, b) => a + b, 0);
  return Math.min(1, m.stats.dano / total);
}

function decide(m) {
  if (m.over) return;
  const won = damageRatio(m) >= K.DECISION_RATIO;
  m.over = won ? 'decision' : 'perdio'; m.overAt = m.t; m.heart.mode = won ? 'ko' : 'final';
  if (won) m.score += K.SCORE.decision;
  ev(m, m.over);
}

function hintOf(m) {
  const h = m.heart;
  if (m.heart.attackId <= 3 && h.mode === 'ataque' && TUTORIAL.includes(h.attack) && m.tutorialSeen && m.tutorialSeen <= 3) return HINTS[h.attack];
  if (h.mode === 'abierto' && m.stats.batazos < 3) return HINTS.abierto;
  return null;
}

export function rankOf(score) {
  const f = score / K.PERFECT_SCORE;
  return K.RANKS.find((r) => f >= r.min).nombre;
}
