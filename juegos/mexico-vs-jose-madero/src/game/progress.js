// Reglas de progreso sin DOM (spec §3.0f C–D): marcas, puertas del Museo, trajes y desbloqueos.
import { WORLDS, worldById } from '../data/worlds.js';

// Orden de las vitrinas de la Galería. `how` es el reto que se lee en la vitrina.
export const COSTUMES = [
  { id: 'clasico', name: 'CLÁSICO', how: 'DESDE EL PRINCIPIO' },
  { id: 'boina', name: 'GRIS CON BOINA', how: 'TODOS LOS CARMESÍS DE UN NIVEL DEL MUNDO 1' },
  { id: 'chamarra', name: 'CHAMARRA UNIVERSITARIA', how: 'TERMINA EL MUNDO 1 EN MENOS DE 4:00' },
  { id: 'botarga', name: 'BOTARGA MORADA', how: 'VENCE AL FLASH-BOT SIN RECIBIR DAÑO' },
  { id: 'lentes', name: 'NEGRO CON LENTES', how: 'TODOS LOS CARMESÍS DEL MUNDO 1' },
  { id: 'vampiro', name: 'VAMPIRO', how: 'TERMINA EL MUNDO 2 «NOCHE»' },
  { id: 'rojo', name: 'ROJO Y AMARILLO', how: 'SE GANA EN EL MUNDO 7' },
  { id: 'bandana', name: 'BANDANA NEGRA', how: 'SE GANA EN EL MUNDO 8' },
];
export const W1_LEVELS = ['1-1', '1-2', '1-3'];
export const WORLD1_TIME = 240; // s: reto de la chamarra
const LEVELS = { carmesi: W1_LEVELS, noche: ['2-1', '2-2', '2-3'] };

const worldData = (save, w) => (save.data.worlds[w] ??= { cleared: [], best: {} });

export function recordLevel(save, world, levelId, { time, score, piezas, total }) {
  const wd = worldData(save, world);
  if (!wd.cleared.includes(levelId)) wd.cleared.push(levelId);
  const b = wd.best[levelId];
  wd.best[levelId] = b
    ? { time: Math.min(b.time, time), score: Math.max(b.score, score), piezas: Math.max(b.piezas, piezas), total }
    : { time, score, piezas, total };
}

export const worldCleared = (save, w) => {
  const need = LEVELS[w];
  const got = save.data.worlds[w]?.cleared ?? [];
  return !!need && need.every((id) => got.includes(id));
};

// 'open' | 'locked' (falta terminar el anterior) | 'soon' (aún no existe).
export function doorState(save, worldId) {
  const w = worldById(worldId);
  if (!w || w.soon) return 'soon';
  return !w.requires || worldCleared(save, w.requires) ? 'open' : 'locked';
}

// ctx: { world, levelId, piezas, total, hurts, assist, worldDone, runTime }. Devuelve los trajes recién ganados.
export function checkUnlocks(save, ctx) {
  const got = [];
  const give = (id) => { if (!save.data.unlocked.includes(id)) { save.data.unlocked.push(id); got.push(id); } };
  if (ctx.world === 'carmesi') {
    if (ctx.total > 0 && ctx.piezas >= ctx.total) give('boina');
    if (ctx.worldDone && ctx.runTime < WORLD1_TIME) give('chamarra');
    if (ctx.levelId === '1-3' && ctx.hurts === 0 && !ctx.assist) give('botarga');
    const best = save.data.worlds.carmesi?.best ?? {};
    if (W1_LEVELS.every((id) => best[id] && best[id].piezas >= best[id].total)) give('lentes');
  }
  if (ctx.world === 'noche' && ctx.worldDone) give('vampiro');
  return got;
}

// Continuar (spec §3.0f H): primer nivel sin superar; con el mundo terminado, desde el principio.
export function startLevelIndex(save, world, levels) {
  const done = save.data.worlds[world]?.cleared ?? [];
  const i = levels.findIndex((l) => !done.includes(l.id));
  return i < 0 ? 0 : i;
}

// La exposición del Museo (spec §3.0f J): se llena al terminar cada mundo. La partitura está siempre.
export function museumExhibits(save) {
  const done = (w) => worldCleared(save, w);
  return [
    { slot: 'cuadro1', kind: 'rosa', unlocked: done('carmesi') },
    { slot: 'cuadro2', kind: 'antifaz', unlocked: done('noche') },
    { slot: 'cuadro3', kind: 'sol', unlocked: done('alba') },
    { slot: 'vitrina1', kind: 'disco', unlocked: done('carmesi') },
    { slot: 'vitrina2', kind: 'partitura', unlocked: true },
    { slot: 'vitrina3', kind: 'mascara', unlocked: done('noche') },
  ];
}

// IDENTIDAD n/8 (spec §1.1b): cuántos discos ha recuperado Pepe.
export const identity = (save) => WORLDS.filter((w) => worldCleared(save, w.id)).length;

export function costumeFor(save, worldId) {
  const c = save.data.costume;
  if (c !== 'auto' && save.data.unlocked.includes(c)) return c;
  return worldById(worldId)?.costume ?? 'clasico';
}

export { WORLDS };
