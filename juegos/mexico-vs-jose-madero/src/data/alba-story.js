// Historia del Mundo 3 «Alba» (spec §3.0f Q v10.5, ✅ aprobada por el usuario el 15 nov 2026).
// Ficción del juego salvo los datos A1–A4 (verificados con 2 fuentes o más). Paseo: no hay Titulares, así que no hay ERA_FACTS.

// Las 10 canciones del disco, en orden (Discogs · Album of the Year · Letras · Wikipedia ES).
export const ALBA_SONGS = ['WILLKOMMEN', 'AÚN HAY MÁS', 'LOS DE SEPTIEMBRE', 'LA CÉLULA NO EXPLOTÓ', 'CABALLEROS BRITÁNICOS',
  'AHORA Y HOY', 'NO LO CAMBIO POR NADA', 'ETRUSCO ÚNICO', 'MALDITA RUEDA', 'CARRUSEL DE ADULTOS'];

export const ERA_FACTS_W3 = [];

export const CHAPTERS_W3 = {
  '3-1': { title: 'WILLKOMMEN', uses: ['A1'], lines: ['2018. SALE ALBA, SU TERCER DISCO.', '', 'UN PUEBLO BLANCO ANTES DEL AMANECER.', 'TODO ESTÁ COMO LO RECUERDA.', '¿O EL QUE CAMBIÓ FUE ÉL?'] },
  '3-2': { title: 'CARRUSEL DE ADULTOS', uses: [], lines: ['UNA FERIA VACÍA AL ALBA.', 'LOS CABALLITOS SIGUEN GIRANDO', 'AUNQUE YA NO HAY NIÑOS.', '', 'ARRIBA ESPERA LA MALDITA RUEDA.'] },
  '3-3': { title: 'AHORA Y HOY', uses: [], lines: ['EN LA CIMA DEL CERRO', 'ALGUIEN LO ESTÁ ESPERANDO.', '', 'NO VIENE A PELEAR:', 'VIENE A PEDIRLE QUE SE QUEDE.'] },
};

export const LEVEL_CARDS_W3 = {
  '3-1': { facts: [{ id: 'A2', text: 'ALBA TIENE UN SUBTÍTULO: «ODA A LA NOSTALGIA».', source: 'DISCOGS · AMAZON' }] },
  '3-2': { facts: [{ id: 'A3', text: 'ALBA TIENE 10 CANCIONES: ABRE CON «WILLKOMMEN» Y CIERRA CON «CARRUSEL DE ADULTOS».', source: 'DISCOGS · ALBUM OF THE YEAR · LETRAS' }] },
  '3-3': { facts: [{ id: 'A4', text: 'A ALBA SE LE CONOCE COMO «EL DISCO BLANCO»: UN DISCO EXPERIMENTAL SOBRE LA NOSTALGIA.', source: 'MILENIO · ZETA TIJUANA' }] },
};

// Pasajes de los atriles: título de la canción + reflexión de Colores Ruidosos (sus propias palabras, aprobadas).
// El fragmento de letra, si lo hay, viene de alba-letras.js (lo aporta el equipo de CR, con permiso).
export const PASAJES = [
  'HAY LUGARES QUE SIGUEN ESPERÁNDOTE AUNQUE TÚ YA SEAS OTRO.',
  'CUANDO CREES QUE YA LO VISTE TODO, LA MEMORIA ABRE OTRA CAJA.',
  'LOS AMIGOS DE UNA ÉPOCA SE QUEDAN EN ELLA. RECORDARLOS TAMBIÉN ES QUERERLOS.',
  'A VECES LA NOTICIA ES ESA: SIGUES AQUÍ.',
  'DE NIÑOS JUGÁBAMOS A SER GRANDES, CON TRAJES PRESTADOS Y MODALES INVENTADOS.',
  'PARA NOSOTROS EL TÍTULO LO DICE TODO: LO QUE IMPORTA ES AHORA, Y ES HOY.',
  'HAY RECUERDOS QUE NO SE CAMBIAN POR NADA. POR ESO SE CUIDAN, NO SE REPITEN.',
  'LO QUE FUIMOS ES UNA LENGUA ANTIGUA: SOLO TÚ LA SIGUES HABLANDO.',
  'LA VUELTA QUE SIEMPRE VUELVE. PARA SALIR DE LA RUEDA HAY QUE DAR UN PASO FUERA.',
  'DE GRANDES TAMBIÉN DAMOS VUELTAS; SOLO QUE YA NADIE NOS SUBE AL CABALLITO.',
].map((reflexion, i) => ({ cancion: ALBA_SONGS[i], reflexion }));
// Pasajes por nivel: 3-1 los 4 primeros, 3-2 los 3 siguientes, 3-3 los 3 últimos.
export const PASAJES_POR_NIVEL = { '3-1': 0, '3-2': 4, '3-3': 7 };

// Lo que dice la Nostalgia en el jefe (v10.2).
export const NOSTALGIA_LINES = {
  aparece: 'QUÉDATE. AQUÍ TODO FUE MEJOR.',
  fase2: 'OTRA VUELTA. SOLO UNA MÁS.',
  fase3: '¿DE VERDAD TE VAS?',
  despedida: 'GRACIAS POR RECORDARME. AHORA SIGUE.',
};

// v11 · Tiro de frases (⏳ frases de la nostalgia para aprobar; las buenas son títulos de canciones de Alba).
export const TIRO_MALAS = ['ANTES TODO ERA MEJOR', 'YA ESTÁS GRANDE PARA ESO', 'TU MEJOR ÉPOCA YA PASÓ', 'NADA VOLVERÁ A SER IGUAL',
  'YA NO HAY NADA NUEVO', 'MEJOR NI LO INTENTES', 'QUÉDATE DONDE ESTÁS', 'ESO YA LO VISTE'];
export const TIRO_BUENAS = ['AÚN HAY MÁS', 'AHORA Y HOY', 'NO LO CAMBIO POR NADA', 'WILLKOMMEN'];
