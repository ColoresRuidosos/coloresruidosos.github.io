import { W } from '../game/constants.js';

// Sigue a Pepe con algo de adelanto, sin salirse del nivel.
export function followCamera(camX, targetX, levelWidth, lead = 0) {
  const want = targetX - W * 0.42 + lead;
  return Math.round(Math.max(0, Math.min(levelWidth - W, want)));
}
