// Historia del Mundo 1 «Carmesí» (spec §3.0e). SOLO datos aprobados por el usuario (2 nov 2026), con fuente.
// La lista completa con estado y enlaces está en la spec; aquí, el texto que sale en pantalla.

// Al vencer a un Titular: uno distinto cada vez, en orden cronológico (el contador sigue entre niveles).
// v9.2: cada dato sale una sola vez por mundo; D2, D4 y D9 los cuentan los capítulos. Hay un Titular por dato.
export const ERA_FACTS_W1 = [
  { id: 'D19', text: 'EN 2015 EMPEZÓ CON ANDREAS ÖSTBERG EL PODCAST «DOS NOMBRES COMUNES».', source: 'APPLE PODCASTS · SPOTIFY' },
  { id: 'D3b', text: 'SE GRABÓ EN ENERO DE 2016 EN LOS ESTUDIOS DMY DE MONTERREY. EN LOS CRÉDITOS, ÉL FIGURA COMO PRODUCTOR.', source: 'DISCOGS · QOBUZ' },
  { id: 'D1', text: '28 DE FEBRERO DE 2016: ÚLTIMO CONCIERTO DE PANDA ANTES DE SU PAUSA, EN LA ARENA CIUDAD DE MÉXICO.', source: 'WIKIPEDIA ES · CINEMEDIOS' },
  { id: 'D3', text: 'EL 28 DE MARZO DE 2016 ANUNCIÓ CARMESÍ EN SUS REDES SOCIALES.', source: 'WIKIPEDIA ES · THE ELECTROSIDE' },
  { id: 'D5', text: 'CARMESÍ SALIÓ EL 29 DE ABRIL DE 2016 CON 13 CANCIONES.', source: 'EL SIGLO DE TORREÓN · EXCÉLSIOR' },
  { id: 'D13', text: 'EN EL VIDEO DE «SINMIGO» (AGOSTO DE 2016) UNA TURBA QUIERE QUEMARLO EN LA HOGUERA.', source: 'REVISTA KUADRO · WIKIPEDIA ES' },
  { id: 'D12', text: '«NO POR SER ARTISTA TENGO QUE SER UN SÚPER HOMBRE». JOSÉ MADERO, SEPTIEMBRE DE 2016.', source: 'EL UNIVERSAL · NOROESTE' },
  { id: 'D10', text: 'LA EDICIÓN DELUXE (OCTUBRE DE 2016) SUMÓ 5 CANCIONES, CON VERSIONES DE VICENTICO Y LOS AUTÉNTICOS DECADENTES.', source: 'ZETA TIJUANA · APPLE MUSIC' },
  { id: 'D11', text: 'EL TOUR CARMESÍ LLEGÓ A BUENOS AIRES Y A LIMA EN DICIEMBRE DE 2016.', source: 'CONCERT ARCHIVES · WIKIPEDIA ES' },
];

// Cartel al empezar cada nivel: por qué Pepe está ahí. Como mucho declara un dato en `uses` (no se repite en Titulares).
export const CHAPTERS_W1 = {
  '1-1': { title: 'LUNES 28', uses: ['D2'], lines: ['29 DE FEBRERO DE 2016, A LAS 0:00.', 'APARECE «LUNES 28»,', 'EL ADELANTO DE SU DISCO SOLISTA.', '', 'SUS CANCIONES NUEVAS,', 'CONVERTIDAS EN PEQUEÑOS CARMESÍS,', 'SE LE VUELAN POR LA CALLE.'] },
  '1-2': { title: 'PLURAL SIENDO SINGULAR', uses: ['D4'], lines: ['ABRIL DE 2016.', 'SALE «PLURAL SIENDO SINGULAR»,', 'SU PRIMER SENCILLO,', 'Y LA PRENSA TOMA LA CALLE.', '', 'PARA LLEGAR AL TEATRO', 'HAY QUE IR POR ENCIMA DEL RUIDO.'] },
  '1-3': { title: 'LA PRESENTACIÓN', uses: ['D9'], lines: ['29 DE SEPTIEMBRE DE 2016.', 'PRESENTA CARMESÍ EN EL TEATRO METROPÓLITAN.', '', 'LA PRENSA ROSA QUIERE', 'LA FOTO DEL ESCÁNDALO', 'ANTES DE QUE SUENE LA PRIMERA CANCIÓN.'] },
};

// Tarjeta «¿SABÍAS QUE…?» al terminar cada nivel.
export const LEVEL_CARDS_W1 = {
  '1-1': { facts: [
    { id: 'D6', text: 'LA MAYORÍA DE LAS CANCIONES DE CARMESÍ SE ESCRIBIERON ENTRE 2008 Y 2010 Y NUNCA SE USARON EN PANDA.', source: 'WIKIPEDIA ES · ZETA TIJUANA' },
    { id: 'D18', text: 'LAS 13 CANCIONES TIENEN LETRA Y MÚSICA DE JOSÉ MADERO.', source: 'INTOLERANCIA DIARIO · DISCOGS' },
  ] },
  '1-2': { facts: [
    { id: 'D17', text: 'RODRIGO «BUCHO» MONTFORT, SU DIRECTOR MUSICAL, TOCÓ LOS TECLADOS Y PREPARÓ LAS PARTITURAS DE CUERDAS, TROMPETAS, FLAUTAS Y ACORDEÓN.', source: 'SOUND:CHECK · DISCOGS' },
    { id: 'D20', text: 'EN EL DISCO, EL BAJO ES DE ANDRÉS ZABLAH Y LA BATERÍA DE «PECAS» MARTÍNEZ.', source: 'DISCOGS · WIKIPEDIA ES' },
  ] },
  '1-3': { facts: [
    { id: 'D7', text: 'CARMESÍ FUE DISCO DE ORO EN 2016: MÁS DE 30.000 COPIAS.', source: 'WIKIPEDIA ES · JACKSON LIVE' },
    { id: 'D8', text: 'MONITORLATINO LO NOMBRÓ ARTISTA REVELACIÓN MÉXICO 2016.', source: 'MONITORLATINO' },
  ] },
};
