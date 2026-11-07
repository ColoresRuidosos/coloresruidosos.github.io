// content.js — las 5 preguntas del reel. Fuente: coloresruidosos.github.io/docs/trivia.md (solo ✅). Ver FACTS.md.
// Para otra versión del reel, cambia este archivo (y timeline.js si cambian los tiempos).
export const QUESTIONS = [
  { id: 'F03', era: 1997, level: 'NIVEL 1', text: '¿En qué idioma cantaban en sus tres primeros discos?',
    options: ['Catalán', 'Inglés', 'Francés', 'Castellano'], correct: 1, docAnswer: 'Inglés' },
  { id: 'F04', era: 2005, level: 'NIVEL 2', text: '¿Cuál fue su primer disco cantado en castellano?',
    options: ['1999', 'El poeta Halley', 'Maniobras de escapismo', 'V.E.H.N.'], correct: 2, docAnswer: 'Maniobras de escapismo' },
  { id: 'D06', era: 2009, level: 'NIVEL 3', text: '¿Qué disco les dio su primer disco de oro en España?',
    options: ['Maniobras de escapismo', '1999', 'Ungravity', 'El poeta Halley'], correct: 1, docAnswer: '1999' },
  { id: 'D10', era: 2021, level: 'NIVEL 4', text: '¿Cuántas nominaciones al Latin Grammy 2021 tuvo V.E.H.N.?',
    options: ['1', '2', '3', '5'], correct: 2, docAnswer: '3' },
  { id: 'M01', era: 1997, level: 'PREGUNTA FINAL', text: '¿Dónde grabaron su primer disco?',
    options: ['Un estudio de Londres', 'La cocina de su productor', 'El garaje de Santi Balmes', 'Una iglesia abandonada'],
    correct: 1, docAnswer: 'En la cocina de su productor, insonorizada con colchones', extra: '...insonorizada con colchones' },
];
export const RESULT = {
  title: '¿CUÁNTAS SACASTE?',
  ranks: [['5/5', 'VIEJO LESBIANO'], ['3-4', 'LESBIANITO'], ['0-2', 'PEQUEÑO LESBIANO']],
  cta: 'COMENTA LA TUYA',
};
export const SAVE = {
  title: 'ÚLTIMAS FECHAS EN MÉXICO',
  sub: 'antes de la pausa',
  slots: [['CDMX', '24-26 NOV'], ['PUEBLA', '28 NOV']],
  sticker: 'VIENE A MÉXICO',
  url1: 'coloresruidosos.github.io', url2: '/trivia',
  again: '¿OTRA PARTIDA?',
};
