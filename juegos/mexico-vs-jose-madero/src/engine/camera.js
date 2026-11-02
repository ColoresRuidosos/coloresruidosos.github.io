import { W } from '../game/constants.js';

export const LEAD = 24; // px que la cámara mira por delante de Pepe
const LEAD_SPEED = 1.5; // px por fotograma: el margen se desliza al girar (🐞 v7.3: antes saltaba 48 px)
const FREE = 8; // px por fotograma que la cámara sigue sin suavizar (Pepe a tope va a 2,75)

// Encuadre ideal: Pepe un poco a la izquierda del centro, con `lead` de adelanto, sin salirse del nivel.
export function followCamera(camX, targetX, levelWidth, lead = 0) {
  const want = targetX - W * 0.42 + lead;
  return Math.round(Math.max(0, Math.min(levelWidth - W, want)));
}

// Cámara con estado: se coloca directamente al cargar un nivel...
export function createCamera(targetX, levelWidth, facing = 1) {
  const lead = facing * LEAD;
  return { x: followCamera(0, targetX, levelWidth, lead), lead };
}

// ...y después se desliza. `facing` 0 = sin adelanto (combate con el jefe).
export function stepCamera(cam, targetX, levelWidth, facing) {
  const goal = facing * LEAD;
  cam.lead += Math.max(-LEAD_SPEED, Math.min(LEAD_SPEED, goal - cam.lead));
  const want = followCamera(0, targetX, levelWidth, cam.lead);
  const d = want - cam.x;
  // Movimientos normales: exactos. Saltos grandes de encuadre: se reparten en varios fotogramas.
  cam.x = Math.abs(d) <= FREE ? want : Math.round(cam.x + Math.sign(d) * Math.max(FREE, Math.abs(d) * 0.12));
  return cam.x;
}
