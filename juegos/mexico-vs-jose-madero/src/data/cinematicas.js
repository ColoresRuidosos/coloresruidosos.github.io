// v8.3 · Escenas al empezar y al terminar cada mundo (spec §3.0f I). Mismo formato que el prólogo:
// `kind` 'dato' (con fuente) o 'ficcion'. No repiten datos de los Titulares ni de las tarjetas (regla v7.3).
export const SCENE_NAMES = ['estadio', 'arena', 'titulares', 'museo', 'puertas', 'puerta', 'calle', 'disco', 'pepe', 'invitacion', 'baile'];

export const WORLD_SCENES = {
  carmesi: {
    intro: [
      { scene: 'puerta', world: 'carmesi', kind: 'ficcion', lines: ['LA PRIMERA PUERTA ES ROJA,', 'COMO UNA ROSA.', 'DETRÁS SE OYE UNA CIUDAD DE NOCHE.'] },
      { scene: 'calle', kind: 'ficcion', lines: ['UNA CALLE ROJA A MEDIANOCHE.', 'PEPE SIENTE QUE ALGO EMPIEZA AQUÍ.'] },
    ],
    outro: [
      { scene: 'disco', kind: 'ficcion', lines: ['EL TEATRO SE VACÍA.', 'EN EL ESCENARIO QUEDAN UN DISCO DE ORO', 'Y UNA ROSA.'] },
      { scene: 'pepe', world: 'carmesi', kind: 'ficcion', lines: ['PEPE RECUERDA DE DÓNDE VIENE.', 'LA PUERTA NEGRA YA ESTÁ ABIERTA.'] },
    ],
  },
  noche: {
    intro: [
      { scene: 'puerta', world: 'noche', kind: 'ficcion', lines: ['LA PUERTA NEGRA DA A UNA CALLE', 'EN BLANCO Y NEGRO.'] },
      { scene: 'invitacion', kind: 'ficcion', lines: ['EN LA MANO, UNA INVITACIÓN SIN NOMBRE:', '«BAILE DE DISFRACES.', 'VEN COMO QUIERAS SER.»'] },
    ],
    outro: [
      { scene: 'baile', kind: 'ficcion', lines: ['VUELVE LA LUZ Y SIGUE EL BAILE.', 'YA NADIE LLEVA MÁSCARA.'] },
      { scene: 'pepe', world: 'noche', kind: 'ficcion', lines: ['PEPE TAMBIÉN SE QUITA LA SUYA.', 'DOS DISCOS. FALTAN SEIS.'] },
    ],
  },
};
