// F3: ventanas de tiempo. Asistido (F11) las duplica.
import { WIN } from '../game/constants.js';
export function judge(target, t, assist = false) {
  const k = assist ? 2 : 1, d = Math.abs(t - target);
  if (d <= WIN.perfect * k + 1e-9) return 'perfecto';
  if (d <= WIN.good * k + 1e-9) return 'bien';
  return 'fuera';
}
