// La historia contada en el juego (spec §1.1b, ✅ aprobada). `kind`: 'dato' (con fuente) o 'ficcion' (cuento del juego).
// Nada de «el más grande de México» (sin verificar). La fecha de la Arena está verificada (LOS40 y Grupo Animal, oct. 2026).

// Prólogo: 5 viñetas al empezar la primera partida (saltable).
export const PROLOGO = [
  { id: 'p1', scene: 'estadio', kind: 'dato', source: 'CHILANGO · EXCÉLSIOR', lines: ['24 DE ENERO DE 2026.', 'ESTADIO GNP SEGUROS.', '«ÉRASE UNA BESTIA»: SU PRIMER ESTADIO.'] },
  { id: 'p2', scene: 'arena', kind: 'dato', source: 'LOS40 · GRUPO ANIMAL', lines: ['LO SIGUIENTE: LA ARENA CIUDAD DE MÉXICO,', '21 Y 22 DE MAYO DE 2027.'] },
  // Esa noche en el Estadio GNP, Pepe lleva el traje negro con lentes oscuros (decisión del usuario).
  { id: 'p3', scene: 'titulares', costume: 'lentes', kind: 'ficcion', lines: ['ESA NOCHE, ENTRE FLASHES Y TITULARES,', 'ALGO SE LE PERDIÓ.'] },
  { id: 'p4', scene: 'museo', costume: 'lentes', kind: 'ficcion', lines: ['PEPE DESPIERTA EN EL MUSEO DE LA CARPA.', 'NO RECUERDA QUIÉN ES.'] },
  { id: 'p5', scene: 'puertas', kind: 'ficcion', lines: ['CADA DISCO GUARDA UNA PARTE DE ÉL.', 'HAY QUE RECUPERARLAS UNA A UNA', 'ANTES DEL CONCIERTO.'] },
];

// Al vencer al jefe de cada mundo: lo que Pepe recuerda (ficción, en primera persona).
export const RECUERDOS = {
  carmesi: { kind: 'ficcion', year: 2016, title: 'EMPEZAR DE CERO', lines: ['CARMESÍ, 2016.', 'ME ACUERDO: EMPECÉ DE NUEVO, YO SOLO.'] },
  noche: { kind: 'ficcion', year: 2017, title: 'DEBAJO DE LA MÁSCARA', lines: ['NOCHE, 2017.', 'ME ACUERDO: DEBAJO DE CADA MÁSCARA', 'HAY ALGUIEN COMO YO.'] },
};

// Tarjeta «RECUERDO RECUPERADO» de un mundo. El kind va al final: RECUERDOS trae kind 'ficcion' (v9.3).
export const recuerdoCard = (world, worldsDone) => ({ ...RECUERDOS[world], kind: 'recuerdo', worldsDone });

// Pensamientos de Pepe al tocar cada checkpoint (ficción), en orden a lo largo del mundo.
export const PENSAMIENTOS = {
  carmesi: [
    'ESTA CALLE… ME SUENA.',
    'ESTAS CANCIONES LAS GUARDÉ AÑOS. ¿O NO?',
    'ALGUIEN GRITABA MI NOMBRE AQUÍ.',
    '¿POR QUÉ ME PERSIGUEN LOS TITULARES?',
    'UNA ROSA ROJA… LA HE VISTO ANTES.',
    'CREO QUE YO CANTABA EN UN TEATRO.',
  ],
  noche: [
    'NADIE AQUÍ ENSEÑA LA CARA.',
    '¿YO TAMBIÉN LLEVO UNA MÁSCARA?',
    'ESTE SALÓN… YA HE ESTADO AQUÍ.',
    'SIN LUZ SE ESCUCHA MEJOR.',
    'EL QUE NUNCA SE QUITA EL ANTIFAZ…',
    'ALGUIEN ME ESPERA EN LA PISTA.',
  ],
};

// Lo que dice Pepe al volver al Museo tras terminar un mundo.
export const VUELTA_AL_MUSEO = 'YA ME ACUERDO DE ALGO MÁS.';
