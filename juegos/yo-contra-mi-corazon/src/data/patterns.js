// F4: qué ataques usa el corazón en cada fase (peso = frecuencia relativa).
export const ATTACKS = {
  gIzq: { hits: [{ need: ['der'], side: 'izq' }] },                 // el puño sale por la izquierda → esquiva a la derecha
  gDer: { hits: [{ need: ['izq'], side: 'der' }] },
  latido: { hits: [{ need: ['abajo'], side: 'centro' }] },          // onda a la altura del pecho → agáchate
  aorta: { hits: [{ need: ['izq', 'der'], side: 'centro' }] },     // latigazo desde arriba → a cualquier lado
  rafaga: { hits: 'rafaga' },                                       // 3 ganchos seguidos, alternando
  finta: { hits: 'finta' },                                         // avisa y no pega
};
export const POOLS = {
  1: { gIzq: 3, gDer: 3, latido: 2 },
  2: { gIzq: 3, gDer: 3, latido: 2, aorta: 2, rafaga: 1, finta: 1 },
  3: { gIzq: 3, gDer: 3, latido: 2, aorta: 2, rafaga: 2, finta: 2 },
  respiro: { gIzq: 1, gDer: 1, latido: 1 },
};
export const TUTORIAL = ['gIzq', 'gDer', 'latido'];
export const HINTS = { gIzq: 'DESLIZA ▶', gDer: '◀ DESLIZA', latido: 'DESLIZA ABAJO', abierto: '¡TOCA AL RITMO!' };
