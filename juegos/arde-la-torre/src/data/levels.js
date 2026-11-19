// Niveles v3 (F6, 15 nov 2026): 3 niveles con 2 oleadas y un sub-jefe cada uno, y la batalla final en la azotea (F15).
// Cada oleada bloquea la cámara en `cam` (borde izquierdo) hasta vaciarla.
// e(type, side, delay, dy): side 'R' entra por la derecha, 'L' por la izquierda; delay en ticks.
// props: cajas y papeleras rompibles con lo que sueltan (F7).
const e = (type, side = 'R', delay = 0, dy = null) => ({ type, side, delay, dy });

export const LEVELS = [
  {
    id: 'parking', name: 'PARKING', title: 'NIVEL 1 · PARKING',
    intro: ['SILENCIO S.A. QUIERE APAGAR EL CONCIERTO', 'DE LA AZOTEA. HAY QUE SUBIR A GOLPES.'],
    width: 1100, music: 0,
    waves: [
      { cam: 100, enemies: [e('becario'), e('becario', 'R', 50), e('comercial', 'L', 90)] },
      { cam: 420, enemies: [e('guardia'), e('becario', 'L', 30), e('comercial', 'R', 90), e('becario', 'R', 150)] },
      { cam: 716, boss: 'jefeSeguridad', enemies: [e('jefeSeguridad'), e('becario', 'L', 60)] },
    ],
    props: [
      { kind: 'caja', x: 330, dy: 0.7, drop: 'cafe' },
      { kind: 'caja', x: 600, dy: 0.2, drop: 'grapadora' },
      { kind: 'papelera', x: 860, dy: 0.8, drop: 'bocadillo' },
      { kind: 'caja', x: 980, dy: 0.3, drop: 'pua' },
      { kind: 'papelera', x: 520, dy: 0.5, drop: 'ampli' },
    ],
  },
  {
    id: 'vestibulo', name: 'VESTÍBULO', title: 'NIVEL 2 · VESTÍBULO',
    intro: ['LOS TORNOS ESTÁN CERRADOS.', 'LA RECEPCIONISTA NO DEJA PASAR A NADIE.'],
    width: 1200, music: 1,
    waves: [
      { cam: 80, enemies: [e('comercial'), e('becario', 'L', 40), e('contable', 'R', 100)] },
      { cam: 420, enemies: [e('guardia'), e('contable', 'L', 40), e('comercial', 'R', 100), e('becario', 'L', 150)] },
      { cam: 816, boss: 'recepcionista', enemies: [e('recepcionista'), e('becario', 'L', 80)] },
    ],
    props: [
      { kind: 'papelera', x: 300, dy: 0.8, drop: 'bocadillo' },
      { kind: 'caja', x: 640, dy: 0.3, drop: 'extintor' },
      { kind: 'papelera', x: 980, dy: 0.6, drop: 'cafe' },
      { kind: 'caja', x: 470, dy: 0.7, drop: 'pedal' },
      { kind: 'caja', x: 1120, dy: 0.5, drop: 'pase' },
    ],
  },
  {
    id: 'oficinas', name: 'OFICINAS', title: 'NIVEL 3 · OFICINAS',
    intro: ['LA PLANTA DE OFICINAS. NADIE HA', 'ESCUCHADO UN DISCO EN AÑOS.'],
    width: 1250, music: 3,
    waves: [
      { cam: 90, enemies: [e('ejecutiva'), e('becario', 'L', 30), e('contable', 'R', 80)] },
      { cam: 460, enemies: [e('comercial'), e('guardia', 'L', 30), e('ejecutiva', 'R', 90), e('becario', 'R', 150)] },
      { cam: 866, boss: 'director', enemies: [e('director'), e('contable', 'L', 70)] },
    ],
    props: [
      { kind: 'caja', x: 300, dy: 0.4, drop: 'silla' },
      { kind: 'papelera', x: 700, dy: 0.8, drop: 'cafe' },
      { kind: 'caja', x: 1000, dy: 0.2, drop: 'bocadillo' },
      { kind: 'papelera', x: 560, dy: 0.3, drop: 'suerte' },
      { kind: 'caja', x: 800, dy: 0.6, drop: 'ampli' },
    ],
  },
  {
    // Batalla final cooperativa (F15): una sola pantalla con el escenario del concierto.
    id: 'azotea', name: 'AZOTEA', title: 'FINAL · AZOTEA',
    intro: ['EL ESCENARIO ESTÁ LISTO.', 'SOLO FALTA ECHAR AL PRESIDENTE. ¡JUNTOS!'],
    width: 384, music: 4, final: true, arena: true,
    waves: [
      { cam: 0, boss: 'presidente', enemies: [e('presidente', 'R', 30)] },
      // F20: jefe sorpresa tras el Presidente (idea del manager de la banda).
      { cam: 0, boss: 'manager', surprise: { line: '¿ESTÁIS LISTOS PARA EL CONCIERTO?' }, enemies: [e('manager', 'R', 20)] },
    ],
    props: [
      { kind: 'caja', x: 40, dy: 0.9, drop: 'bocadillo' },
      { kind: 'caja', x: 344, dy: 0.1, drop: 'bocadillo' },
      { kind: 'papelera', x: 192, dy: 0.95, drop: 'pedal' },
    ],
  },
];
