// Utilidades para montar escenas de prueba.
import { createWorld, tick, NEUTRAL } from '../src/sim/world.js';
import { createEnemy } from '../src/sim/fighter.js';

export const IN = (o = {}) => ({ ...NEUTRAL, ...o });

// Mundo sin oleadas (cámara libre) con los jugadores indicados.
export function arena({ seed = 1, heroes = ['antonio'], opts = {} } = {}) {
  const w = createWorld({ seed, levelIdx: 0, players: heroes.map((hero, slot) => ({ slot, hero })), opts });
  w.level = { ...w.level, waves: [], props: [] };
  w.props = [];
  for (const p of w.fighters) p.invul = 0;
  return w;
}

export function addEnemy(w, type, x, y) {
  const e = createEnemy(w, type, x, y);
  e.ai.cd = 9999; e.ai.hold = true; e.entered = true;   // quieto salvo que el test diga lo contrario
  w.fighters.push(e); w.byId.set(e.id, e);
  return e;
}

export function run(w, n, inputs = []) {
  const evs = [];
  for (let i = 0; i < n; i++) {
    tick(w, typeof inputs === 'function' ? inputs(i, w) : inputs);
    evs.push(...w.events);
  }
  return evs;
}

// Pulsa un botón un tick y lo suelta el siguiente.
export function tap(w, slot, k, extra = {}) {
  const ins = []; ins[slot] = IN({ [k]: true, ...extra });
  tick(w, ins);
  const evs = [...w.events];
  const rel = []; rel[slot] = IN(extra);
  tick(w, rel);
  return evs.concat(w.events);
}
