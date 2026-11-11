// Los 5 niveles (F6). Cada oleada bloquea la cámara en `cam` (borde izquierdo) hasta vaciarla.
// e(type, side, delay, dy): side 'R' entra por la derecha, 'L' por la izquierda; delay en ticks.
// props: cajas y papeleras rompibles con lo que sueltan (F7).
const e = (type, side = 'R', delay = 0, dy = null) => ({ type, side, delay, dy });

export const LEVELS = [
  {
    id: 'parking', name: 'PARKING', title: 'NIVEL 1 · PARKING',
    intro: ['SILENCIO S.A. QUIERE APAGAR EL CONCIERTO', 'DE LA AZOTEA. HAY QUE SUBIR A GOLPES.'],
    width: 1500, music: 0,
    waves: [
      { cam: 100, enemies: [e('becario'), e('becario', 'R', 50), e('becario', 'L', 90)] },
      { cam: 420, enemies: [e('becario'), e('comercial', 'R', 40), e('becario', 'L', 80), e('comercial', 'R', 140)] },
      { cam: 760, enemies: [e('guardia'), e('becario', 'L', 30), e('comercial', 'R', 90), e('becario', 'R', 150)] },
      { cam: 1116, boss: 'jefeSeguridad', enemies: [e('jefeSeguridad'), e('becario', 'L', 60)] },
    ],
    props: [
      { kind: 'caja', x: 330, dy: 0.7, drop: 'cafe' },
      { kind: 'caja', x: 690, dy: 0.2, drop: 'grapadora' },
      { kind: 'papelera', x: 1010, dy: 0.8, drop: 'bocadillo' },
      { kind: 'caja', x: 1260, dy: 0.3, drop: 'pua' },
    ],
  },
  {
    id: 'vestibulo', name: 'VESTÍBULO', title: 'NIVEL 2 · VESTÍBULO',
    intro: ['LOS TORNOS ESTÁN CERRADOS.', 'LA RECEPCIONISTA NO DEJA PASAR A NADIE.'],
    width: 1600, music: 1,
    waves: [
      { cam: 80, enemies: [e('comercial'), e('becario', 'L', 40), e('becario', 'R', 100)] },
      { cam: 400, enemies: [e('contable'), e('becario', 'R', 30), e('comercial', 'L', 90), e('becario', 'R', 160)] },
      { cam: 780, enemies: [e('guardia'), e('contable', 'L', 40), e('comercial', 'R', 100), e('becario', 'L', 150)] },
      { cam: 1216, boss: 'recepcionista', enemies: [e('recepcionista'), e('contable', 'L', 80)] },
    ],
    props: [
      { kind: 'papelera', x: 300, dy: 0.8, drop: 'bocadillo' },
      { kind: 'caja', x: 640, dy: 0.3, drop: 'extintor' },
      { kind: 'papelera', x: 1100, dy: 0.6, drop: 'cafe' },
    ],
  },
  {
    id: 'ascensor', name: 'ASCENSOR', title: 'NIVEL 3 · ASCENSOR',
    intro: ['EL ASCENSOR SUBE... Y EN CADA PARADA', 'ENTRA MÁS GENTE DE SILENCIO S.A.'],
    width: 384, music: 2, elevator: true,
    waves: [
      { cam: 0, enemies: [e('becario', 'R'), e('becario', 'L', 20), e('comercial', 'R', 60)] },
      { cam: 0, enemies: [e('guardia', 'R'), e('contable', 'L', 30), e('becario', 'R', 80)] },
      { cam: 0, enemies: [e('ejecutiva', 'R'), e('comercial', 'L', 30), e('contable', 'R', 70), e('becario', 'L', 120)] },
      { cam: 0, boss: 'tecnico', enemies: [e('tecnico', 'R'), e('becario', 'L', 60)] },
    ],
    props: [{ kind: 'caja', x: 60, dy: 0.9, drop: 'bocadillo' }],
  },
  {
    id: 'oficinas', name: 'OFICINAS', title: 'NIVEL 4 · OFICINAS',
    intro: ['LA PLANTA DE OFICINAS. NADIE HA', 'ESCUCHADO UN DISCO EN AÑOS.'],
    width: 1700, music: 3,
    waves: [
      { cam: 90, enemies: [e('ejecutiva'), e('becario', 'L', 30), e('contable', 'R', 80)] },
      { cam: 440, enemies: [e('comercial'), e('comercial', 'L', 30), e('ejecutiva', 'R', 90), e('becario', 'R', 150)] },
      { cam: 860, enemies: [e('guardia'), e('guardia', 'L', 40), e('contable', 'R', 100), e('ejecutiva', 'L', 160)] },
      { cam: 1316, boss: 'director', enemies: [e('director'), e('contable', 'L', 70)] },
    ],
    props: [
      { kind: 'caja', x: 300, dy: 0.4, drop: 'silla' },
      { kind: 'papelera', x: 700, dy: 0.8, drop: 'cafe' },
      { kind: 'caja', x: 1150, dy: 0.2, drop: 'bocadillo' },
      { kind: 'papelera', x: 1450, dy: 0.7, drop: 'pua' },
    ],
  },
  {
    id: 'azotea', name: 'AZOTEA', title: 'NIVEL 5 · AZOTEA',
    intro: ['EL ESCENARIO ESTÁ LISTO.', 'SOLO FALTA ECHAR AL PRESIDENTE.'],
    width: 1200, music: 4, final: true,
    waves: [
      { cam: 80, enemies: [e('guardia'), e('ejecutiva', 'L', 30), e('contable', 'R', 70), e('comercial', 'R', 130)] },
      { cam: 460, enemies: [e('comercial'), e('guardia', 'L', 20), e('ejecutiva', 'R', 70), e('becario', 'L', 120), e('contable', 'R', 160)] },
      { cam: 816, boss: 'presidente', enemies: [e('presidente')] },
    ],
    props: [
      { kind: 'caja', x: 360, dy: 0.5, drop: 'bocadillo' },
      { kind: 'caja', x: 760, dy: 0.3, drop: 'bocadillo' },
      { kind: 'papelera', x: 900, dy: 0.8, drop: 'cafe' },
    ],
  },
];
