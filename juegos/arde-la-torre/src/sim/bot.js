// Bot para tests y ajuste (T2.8): se alinea en el carril con el enemigo más cercano y pega.
// skill: 1 = bueno; 0 = inactivo (no toca nada).
import { FLOOR_TOP, FLOOR_BOTTOM, W } from './constants.js';
import { NEUTRAL } from './fighter.js';

const sgn = (v, dead) => (v > dead ? 1 : v < -dead ? -1 : 0);

export function botInput(world, slot, skill = 1) {
  const me = world.fighters.find((f) => f.team === 'p' && f.slot === slot && !f.removed);
  if (!me || skill <= 0) return NEUTRAL;
  const t = world.tick;
  const pulse = t % 4 < 2;
  if (me.out) return { ...NEUTRAL, golpe: pulse };
  if (me.state === 'grab') return { ...NEUTRAL, golpe: pulse };

  // Objetos cerca: si tiene poca vida, a por la comida.
  const food = world.items.find((it) => (it.kind === 'bocadillo' || it.kind === 'cafe') && me.hp < me.maxHp * 0.7 &&
    it.x > world.camX + 12 && it.x < world.camX + W - 12);
  const enemies = world.fighters.filter((f) => f.team === 'e' && !f.removed && f.state !== 'dead');
  let target = null, bd = Infinity;
  for (const e of enemies) {
    const d = Math.abs(e.x - me.x) + Math.abs(e.y - me.y) * 2.5;
    if (d < bd) { bd = d; target = e; }
  }
  if (food && (!target || bd > 80)) return goTo(me, food.x, food.y, { golpe: Math.abs(food.x - me.x) < 10 && Math.abs(food.y - me.y) < 6 && pulse });

  if (!target) {
    // Nadie: avanzar hacia la derecha por el centro.
    const gy = (FLOOR_TOP + FLOOR_BOTTOM) / 2 + (slot - 1.5) * 12;
    return { ...NEUTRAL, x: world.camX + W - 40 > me.x ? 1 : 0, y: sgn(gy - me.y, 3) };
  }
  // Rodeado: especial (si le queda vida).
  const close = enemies.filter((e) => Math.abs(e.x - me.x) < 44 && Math.abs(e.y - me.y) < 10).length;
  if (close >= 3 && me.hp > me.maxHp * 0.3 && me.state !== 'special') return { ...NEUTRAL, especial: pulse };

  const side = me.x <= target.x ? -1 : 1;
  const gx = target.x + side * (target.def.w / 2 + 14);
  const dx = target.x - me.x, ady = Math.abs(target.y - me.y);
  const inRange = Math.abs(dx) < 36 && ady <= 4 && target.z < 30;
  if (inRange) {
    // Mirar hacia el enemigo y pegar.
    const faceOk = Math.sign(dx) === me.face || dx === 0;
    if (!faceOk) return { ...NEUTRAL, x: Math.sign(dx) };
    return { ...NEUTRAL, golpe: pulse };
  }
  // Evitar quedarse en el carril de una embestida o de un proyectil: alinearse a distancia.
  return goTo(me, gx, target.y, {});
}

function goTo(me, gx, gy, extra) {
  return { ...NEUTRAL, x: sgn(gx - me.x, 3), y: sgn(gy - me.y, 2), ...extra };
}
