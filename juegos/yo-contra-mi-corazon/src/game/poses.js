// Qué sprite toca en cada momento (lógica pura, la usa render/view.js).
import { GOLPE_POSE, HOLD, SWING, LUNGE } from './constants.js';

const AVISO = { gIzq: 'avisoIzq', gDer: 'avisoDer', latido: 'avisoLatido', aorta: 'avisoAorta' };
const sideAviso = (s) => (s === 'izq' ? 'avisoIzq' : 'avisoDer');

// → { pose, fx: null|'latido'|'aorta', side, lunge }
export function heartPose(m, t) {
  const h = m.heart; const P = (p, extra = {}) => ({ pose: 'heart.' + p, fx: null, side: null, lunge: 0, ...extra });
  if (h.mode === 'ataque') {
    const now = h.hits.find((x) => t >= x.T && t < x.T + GOLPE_POSE);
    if (now && !now.fake) {
      if (h.attack === 'latido') return P('avisoLatido', { fx: 'latido', side: 'centro' });
      if (h.attack === 'aorta') return P('avisoAorta', { fx: 'aorta', side: 'centro', lunge: 3 });
      return P(now.side === 'izq' ? 'golpeIzq' : 'golpeDer', { side: now.side, lunge: 4 });
    }
    if (now && now.fake) return P('idle', { fx: 'finta' });
    const next = h.hits.find((x) => x.T > t);
    if (next) {
      if (h.attack === 'rafaga' || h.attack === 'finta') return P(sideAviso(next.side), { side: next.side });
      return P(AVISO[h.attack], { side: next.side });
    }
    return P('idle');
  }
  if (h.mode === 'abierto') return P(t - h.lastHurt < 0.18 ? 'dano' : 'idle', { fx: 'abierto' });
  if (h.mode === 'aturdido') return P('dano', { fx: 'aturdido' });
  if (h.mode === 'transicion' || h.mode === 'ko') return P('dano', { fx: h.mode });
  return P('idle');
}

const DX = { esquivaIzq: -16, esquivaDer: 16 };
export function clownPose(m, t) {
  const c = m.clown;
  const active = t >= c.poseAt && t < c.poseUntil;
  const pose = active ? c.pose : 'listo';
  let dx = 0, dy = 0, p = pose;
  if (DX[pose]) { const k = Math.min(1, (t - c.poseAt) / 0.06) * Math.min(1, (c.poseUntil - t) / 0.1); dx = DX[pose] * k; }
  if (pose === 'batazo') {
    // F5b: impulso (0–50 ms), se lanza y hace contacto (50–140 ms) y regresa
    const a = t - c.poseAt;
    if (a < SWING.windup) { dy = -10 * (a / SWING.windup); }
    else { p = 'impacto'; const k = a < SWING.contact ? 1 : Math.max(0, 1 - (a - SWING.contact) / (HOLD.batazo - SWING.contact)); dy = -LUNGE * k; dx = -4 * k; }
  }
  return { pose: 'clown.' + p, dx, dy, shake: pose === 'golpeado' };
}
