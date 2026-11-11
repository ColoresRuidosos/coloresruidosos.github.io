// Mando remoto (F10): convierte los mensajes `in` del móvil en una fuente de entrada.
// Si deja de llegar el latido, la entrada vuelve a neutra (así no se quedan botones pegados).
import { NEUTRAL } from './source.js';
import { seqNewer } from '../net/protocol.js';

export const STALE_MS = 400;

export function createRemoteSource(now = () => performance.now()) {
  let state = NEUTRAL, last = -Infinity, seq = -1;
  return {
    apply(msg) {
      if (!msg) return false;
      if (seq >= 0 && !seqNewer(msg.seq, seq)) return false;   // fuera de orden o repetido
      seq = msg.seq; last = now();
      state = { x: msg.x, y: msg.y, golpe: msg.golpe, salto: msg.salto, especial: msg.especial, pausa: msg.pausa };
      return true;
    },
    read() { return now() - last > STALE_MS ? NEUTRAL : state; },
    reset() { state = NEUTRAL; seq = -1; last = -Infinity; },
    get lastSeen() { return last; },
  };
}
