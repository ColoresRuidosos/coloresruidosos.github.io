// v11.3 · Dónde nace el cable del micrófono en el dibujo: en la mano del traje (cada hoja de Gemini lanza con el brazo
// a otra altura). Solo es dibujo: el alcance del micro (micHand en game.js) no cambia.
import { COSTUMES_META } from '../data/costumes-atlas.js';

// feet: pies de Pepe (centro); dir: 1 mirando a la derecha, -1 a la izquierda. null = usar la mano de siempre.
export function cableStart(feet, dir, costume) {
  const hand = costume && costume !== 'clasico' ? COSTUMES_META.frames[`${costume}_throw`]?.hand : null;
  return hand ? { x: feet.x + dir * hand.x, y: feet.y + hand.y } : null;
}
