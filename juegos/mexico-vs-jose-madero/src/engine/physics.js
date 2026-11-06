import { P, DT } from '../game/constants.js';
import { moveBody } from './tilemap.js';

export function createPlayer(spawn) {
  return { x: spawn.x - P.w / 2, y: spawn.y - P.h, w: P.w, h: P.h, vx: 0, vy: 0, onGround: false, coyote: 0, buffer: 0, facing: 1, jumping: false, hooked: null, frozen: 0, landT: 1 };
}

const approach = (v, target, step) => (v < target ? Math.min(target, v + step) : Math.max(target, v - step));

// Movimiento de Pepe: aceleración, salto variable, coyote time y jump buffer.
export function stepPlayerMotion(p, btn, L, dt = DT) {
  const events = [];
  if (p.hooked) {
    // El micrófono tira de Pepe hacia el gancho.
    const dx = p.hooked.x - (p.x + p.w / 2), dy = p.hooked.y - (p.y + (p.hooked.oy ?? 10));
    const d = Math.hypot(dx, dy) || 1;
    p.vx = (dx / d) * p.hooked.pull;
    p.vy = (dy / d) * p.hooked.pull;
  } else {
    const dir = (btn.right ? 1 : 0) - (btn.left ? 1 : 0);
    if (dir) {
      p.facing = dir;
      p.vx = approach(p.vx, dir * P.maxRun, (p.onGround ? P.accel : P.airAccel) * dt);
    } else if (p.onGround) {
      p.vx = approach(p.vx, 0, P.friction * dt);
    }
    p.buffer = btn.jumpPressed ? P.buffer : Math.max(0, p.buffer - 1);
    p.coyote = p.onGround ? P.coyote : Math.max(0, p.coyote - 1);
    if (p.buffer > 0 && p.coyote > 0) {
      p.vy = -P.jumpVel;
      p.buffer = 0; p.coyote = 0; p.onGround = false; p.jumping = true;
      events.push('jump');
    }
    if (!btn.jump && p.jumping && p.vy < -P.jumpCut) p.vy = -P.jumpCut;
    p.vy = Math.min(P.maxFall, p.vy + P.gravity * dt);
  }
  const r = moveBody(L, p, p.vx * dt, p.vy * dt);
  if (r.hitX) p.vx = 0;
  if (r.ceiling && p.vy < 0) p.vy = 0;
  if (r.ground && p.vy >= 0) {
    if (!p.onGround) events.push('land');
    p.vy = 0; p.onGround = true; p.jumping = false;
  } else if (!r.ground) p.onGround = false;
  return events;
}
