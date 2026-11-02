// Historia del Mundo 2 «Noche» (spec §3.0f E). Datos N1–N7 de la tabla de fuentes verificadas
// (⏳ pendientes del visto bueno del usuario para este uso). Sin nombres de personajes de terror registrados.

// Al vencer a un Titular: uno distinto cada vez (el contador sigue entre niveles).
export const ERA_FACTS_W2 = [
  { id: 'N1', text: 'NOCHE (2017) ES EL SEGUNDO DISCO DE JOSÉ MADERO EN SOLITARIO, DESPUÉS DE CARMESÍ.', source: 'WIKIPEDIA (NOCHE) · MILENIO' },
  { id: 'N2', text: '«NOCHE DE BRUJAS» FUE EL PRIMER SENCILLO DEL DISCO: SALIÓ EL 9 DE JUNIO DE 2017.', source: 'WIKIPEDIA (NOCHE) · REVISTA KUADRO' },
  { id: 'N6', text: '«FANTASMAS» SONABA EN LOS CONCIERTOS DE LA GIRA NOCHE.', source: 'EL ALEBRIJE · SOULWAVEZ' },
  { id: 'N7', text: 'MADERO ES FAN DEL CINE DE TERROR Y DE STEPHEN KING.', source: 'MILENIO · LOOKING BACK' },
];

// Cartel al empezar cada nivel. La frase de 2-3 es ficción del juego (no es un dato y no lleva fuente).
export const CHAPTERS_W2 = {
  '2-1': { title: 'NOCHE DE BRUJAS', lines: ['JUNIO DE 2017. SALE «NOCHE DE BRUJAS»,', 'EL PRIMER SENCILLO DE NOCHE.', '', 'NO HABLA DE HALLOWEEN:', 'HABLA DE LAS MÁSCARAS QUE NOS PONEMOS.', 'LA FIESTA DE DISFRACES YA EMPEZÓ.'] },
  '2-2': { title: 'FANTASMAS', lines: ['EN LA GIRA DE NOCHE, EL ESCENARIO', 'SE LLENÓ DE FIGURAS DEL TERROR CLÁSICO', 'Y SONABA «FANTASMAS».', '', 'JUNTO AL LAGO,', 'LAS CABAÑAS ESTÁN A OSCURAS.'] },
  '2-3': { title: 'EL ENMASCARADO', lines: ['AL FONDO DEL MUELLE', 'ESPERA ALGUIEN CON MÁSCARA.', '', 'QUIZÁ, DEBAJO,', 'HAYA ALGUIEN COMO TÚ.'] },
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
