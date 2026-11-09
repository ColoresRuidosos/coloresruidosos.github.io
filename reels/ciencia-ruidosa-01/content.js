// content.js — todos los textos en pantalla. kind: badge | head | body | src | cta | label
const B = 'Bernardi et al., Heart (2006)', SAL = 'Salimpoor et al., Nature Neuroscience (2011)';
export const TEXTS = [
  { id: 'badge', kind: 'badge', t0: 0, t1: 33, lines: ['CIENCIA RUIDOSA #1'] },
  { id: 'title', kind: 'head', t0: 0, t1: 3.5, y: 250, size: 92, color: 'pink', lines: ['LO QUE LE PASA', 'A TU CUERPO'] },
  { id: 'sub', kind: 'body', t0: 0, t1: 3.5, y: 445, lines: ['cuando suena TU canción'] },
  { id: 'h1', kind: 'head', t0: 3.5, t1: 9.5, y: 290, size: 110, color: 'red', lines: ['1 · PULSO'] },
  { id: 'b1', kind: 'body', t0: 3.8, t1: 9.5, y: 390, fact: true, source: B, lines: ['Si la música va rápido,', 'tu respiración y tu pulso', 'se aceleran'] },
  { id: 'h1b', kind: 'head', t0: 9.5, t1: 14, y: 290, size: 110, color: 'blue', lines: ['SILENCIO'] },
  { id: 'b1b', kind: 'body', t0: 9.5, t1: 14, y: 390, fact: true, source: B, lines: ['En los silencios,', 'tu pulso cae por', 'debajo de lo normal'] },
  { id: 's1', kind: 'src', t0: 3.8, t1: 14, lines: ['Fuente: ' + B] },
  { id: 'h2', kind: 'head', t0: 14.2, t1: 23, y: 290, size: 110, color: 'yellow', lines: ['2 · DOPAMINA'] },
  { id: 'b2a', kind: 'body', t0: 14.6, t1: 19, y: 390, fact: true, source: SAL, lines: ['Segundos ANTES del clímax,', 'tu cerebro ya la libera'] },
  { id: 'b2b', kind: 'body', t0: 19, t1: 23, y: 390, fact: true, source: SAL, lines: ['Y en el clímax,', 'otra zona toma el relevo'] },
  { id: 'l2a', kind: 'label', t0: 15.4, t1: 19, lines: ['NÚCLEO CAUDADO'] },
  { id: 'l2b', kind: 'label', t0: 19, t1: 23, lines: ['NÚCLEO ACCUMBENS'] },
  { id: 's2', kind: 'src', t0: 14.6, t1: 28, lines: ['Fuente: ' + SAL] },
  { id: 'h3', kind: 'head', t0: 23.2, t1: 28, y: 290, size: 110, color: 'pink', lines: ['3 · ESCALOFRÍOS'] },
  { id: 'b3', kind: 'body', t0: 23.4, t1: 28, y: 390, fact: true, source: SAL, lines: ['Y se te enchina la piel', 'justo en tu parte favorita'] },
  { id: 'cta', kind: 'cta', t0: 28.4, t1: 33, y: 1440, lines: ['¿Qué canción te los da? ↓'] },
  { id: 'follow', kind: 'body', t0: 29, t1: 33, y: 1540, lines: ['Sigue para más Ciencia Ruidosa'] },
];
