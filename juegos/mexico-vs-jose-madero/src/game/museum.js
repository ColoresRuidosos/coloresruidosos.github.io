// El Museo (hub; spec §3.0f C): pasillo sin enemigos con 8 puertas (una por disco) y la Galería al final.
// v8: a la izquierda, una pared libre para el retrato de identidad de Pepe.
// Leyenda propia: '1'–'8' puertas de los mundos (en orden), 'Y' Galería de trajes. El resto, como en los niveles.
import { TILE } from './constants.js';
import { WORLDS } from '../data/worlds.js';

export const HUB = [
  '#.........................................................................#',
  '#.........................................................................#',
  '#.........................................................................#',
  '#.........................................................................#',
  '#.........................................................................#',
  '#.........................................................................#',
  '#.........................................................................#',
  '#.........................................................................#',
  '#.........................................................................#',
  '#.........................................................................#',
  '#.........................................................................#',
  '#...P....1......2......3......4......5......6......7......8......Y........#',
  '###########################################################################',
  '###########################################################################'
].join('\n');

export function createHub(text = HUB) {
  const doors = [];
  text.split('\n').forEach((row, ty) => {
    for (let tx = 0; tx < row.length; tx++) {
      const c = row[tx];
      const feet = { x: tx * TILE + TILE / 2, y: (ty + 1) * TILE };
      if (c >= '1' && c <= '8') doors.push({ id: WORLDS[c - 1].id, n: +c, ...feet });
      else if (c === 'Y') doors.push({ id: 'galeria', n: 9, ...feet });
    }
  });
  doors.sort((a, b) => a.n - b.n);
  return { doors };
}

// Puerta delante de la que está Pepe (centro a menos de 12 px y en el suelo del pasillo), o null.
export function doorAt(hub, p) {
  const cx = p.x + p.w / 2, feet = p.y + p.h;
  return hub.doors.find((d) => Math.abs(d.x - cx) <= 12 && Math.abs(d.y - feet) <= 4) ?? null;
}
