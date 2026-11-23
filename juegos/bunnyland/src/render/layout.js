// Medidas lógicas de la pantalla (vertical): HUD arriba, laberinto 21×27 de 8 px, barra abajo.
export const W = 168, H = 264, TOP = 20, PX = 8, MAZE_H = 27 * PX, BOTTOM = TOP + MAZE_H;
export const BOTONES = {
  pausa: { x: 146, y: BOTTOM + 4, w: 20, h: 22 },
  sonido: { x: 124, y: BOTTOM + 4, w: 20, h: 22 },
};
export const dentro = (b, x, y) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h;
