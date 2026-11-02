// Historia del Mundo 2 «Noche» (spec §3.0f E). Datos N1–N7 de la tabla de fuentes verificadas
// (⏳ pendientes del visto bueno del usuario para este uso). Sin nombres de personajes de terror registrados.

// Al vencer a un Titular: uno distinto cada vez (el contador sigue entre niveles).
export const ERA_FACTS_W2 = [
  { id: 'N1', text: 'NOCHE (2017) ES EL SEGUNDO DISCO DE JOSÉ MADERO EN SOLITARIO, DESPUÉS DE CARMESÍ.', source: 'WIKIPEDIA (NOCHE) · MILENIO' },
  { id: 'N8', text: 'NOCHE SALIÓ A LA VENTA EL 28 DE JULIO DE 2017.', source: 'ALLMUSIC · DIARIO DE MÉXICO' },
  { id: 'N6', text: '«FANTASMAS» SONABA EN LOS CONCIERTOS DE LA GIRA NOCHE.', source: 'EL ALEBRIJE · SOULWAVEZ' },
  { id: 'N7', text: 'MADERO ES FAN DEL CINE DE TERROR Y DE STEPHEN KING.', source: 'MILENIO · LOOKING BACK' },
];

// Cartel al empezar cada nivel: cuenta la historia (ficción del juego). Como mucho declara un dato en `uses`,
// y ese dato ya no sale en Titulares ni tarjetas (v7.3: cada dato una sola vez por mundo).
export const CHAPTERS_W2 = {
  '2-1': { title: 'NOCHE DE BRUJAS', uses: ['N2'], lines: ['JUNIO DE 2017. SALE «NOCHE DE BRUJAS»,', 'EL PRIMER SENCILLO DE NOCHE.', '', 'PEPE LLEGA A UNA FIESTA DE DISFRACES', 'EN UNA CASONA JUNTO AL LAGO.', 'NADIE ENSEÑA LA CARA. ¿Y LA SUYA?'] },
  '2-2': { title: 'SE VA LA LUZ', uses: [], lines: ['DENTRO DE LA CASONA', 'SE VA LA LUZ DE GOLPE.', '', 'SOLO TIENE UN FAROL', 'Y UN POCO DE ACEITE.', 'ALGUIEN ESPERA EN EL MUELLE.'] },
  '2-3': { title: 'EL ENMASCARADO', uses: [], lines: ['EL ANFITRIÓN DE LA FIESTA', 'NUNCA SE QUITA EL ANTIFAZ.', '', 'QUIZÁ, DEBAJO,', 'HAYA ALGUIEN COMO TÚ.'] },
};

// Tarjeta «¿SABÍAS QUE…?» al terminar cada nivel.
export const LEVEL_CARDS_W2 = {
  '2-1': { facts: [
    { id: 'N3', text: '«NOCHE DE BRUJAS» NO ES UNA CANCIÓN DE HALLOWEEN: HABLA DE LAS MÁSCARAS SOCIALES.', source: 'MILENIO · LOOKING BACK' },
  ] },
  '2-2': { facts: [
    { id: 'N4', text: 'EL VIDEO DE «NOCHE DE BRUJAS» ES EN BLANCO Y NEGRO, UN HOMENAJE AL CINE DE TERROR CLÁSICO.', source: 'REVISTA KUADRO · MILENIO' },
  ] },
  '2-3': { facts: [
    { id: 'N5', text: 'EN LA GIRA DE NOCHE, EL ESCENARIO SE LLENÓ DE FIGURAS DEL TERROR CLÁSICO.', source: 'ABC NOTICIAS · EL ALEBRIJE' },
  ] },
};
