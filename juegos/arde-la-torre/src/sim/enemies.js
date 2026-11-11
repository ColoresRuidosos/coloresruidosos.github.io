// Empleados ficticios de «Silencio S.A.» (F5) y jefes (F6). Todo es ficción y sátira genérica de oficina.
// Ataques:
//   punch: golpe cuerpo a cuerpo
//   charge: embestida por el carril
//   shoot: proyectil (grapas o teléfonos)
//   grab: agarra y lanza
// Los jefes usan los mismos ataques combinados (plan §3) y llaman a refuerzos al bajar de cierta vida.

const punch = (dmg, o = {}) => ({ start: 14, active: 3, rec: 20, reach: [4, 28], z: [24, 50], dmg, ...o });

export const ENEMIES = {
  becario: {
    name: 'BECARIO', hp: 22, speed: 0.85, w: 16, h: 54, score: 100, cd: 50,
    moves: { punch: punch(5) },
  },
  comercial: {
    name: 'COMERCIAL', hp: 28, speed: 1.05, w: 16, h: 56, score: 150, cd: 60,
    moves: { punch: punch(5), charge: { windup: 20, speed: 3.2, dur: 42, dmg: 8, min: 56, max: 190 } },
  },
  guardia: {
    name: 'GUARDIA', hp: 42, speed: 0.7, w: 20, h: 60, score: 200, cd: 70, block: true,
    moves: { punch: punch(8, { start: 16, reach: [4, 32], knock: true }) },
  },
  contable: {
    name: 'CONTABLE', hp: 20, speed: 0.75, w: 16, h: 52, score: 150, cd: 90, keepAway: 90,
    moves: { punch: punch(4), shoot: { windup: 22, speed: 3, dmg: 6, min: 60, max: 230, kind: 'grapa' } },
  },
  ejecutiva: {
    name: 'EJECUTIVA', hp: 30, speed: 1.0, w: 16, h: 56, score: 200, cd: 60,
    moves: { punch: punch(5), grab: { windup: 14, reach: 22, hold: 40, dmg: 10 } },
  },

  // Jefes
  jefeSeguridad: {
    name: 'JEFE DE SEGURIDAD', boss: true, hp: 170, speed: 0.95, w: 24, h: 68, score: 2000, cd: 50,
    moves: { punch: punch(9, { reach: [4, 36], knock: true }), charge: { windup: 26, speed: 3.6, dur: 48, dmg: 12, min: 50, max: 220 } },
    summon: { types: ['becario'], n: 2, at: [0.66, 0.33] },
  },
  recepcionista: {
    name: 'RECEPCIONISTA', boss: true, hp: 160, speed: 1.0, w: 20, h: 62, score: 2000, cd: 55,
    moves: { punch: punch(8, { reach: [4, 32] }), shoot: { windup: 22, speed: 3.4, dmg: 9, min: 50, max: 260, kind: 'telefono' } },
    summon: { types: ['comercial'], n: 2, at: [0.5] },
  },
  tecnico: {
    name: 'TÉCNICO DE MANTENIMIENTO', boss: true, hp: 190, speed: 0.9, w: 24, h: 66, score: 2500, cd: 50,
    moves: { punch: punch(11, { start: 18, reach: [4, 40], knock: true }), charge: { windup: 24, speed: 3.4, dur: 44, dmg: 12, min: 50, max: 220 } },
    summon: { types: ['becario', 'guardia'], n: 2, at: [0.5] },
  },
  director: {
    name: 'DIRECTOR COMERCIAL', boss: true, hp: 210, speed: 1.05, w: 22, h: 66, score: 3000, cd: 50,
    moves: {
      punch: punch(9, { reach: [4, 34] }),
      charge: { windup: 22, speed: 3.6, dur: 44, dmg: 11, min: 50, max: 220 },
      grab: { windup: 14, reach: 26, hold: 44, dmg: 14 },
    },
    summon: { types: ['ejecutiva'], n: 2, at: [0.66, 0.33] },
  },
  presidente: {
    name: 'PRESIDENTE DE SILENCIO S.A.', boss: true, hp: 300, speed: 1.15, w: 24, h: 70, score: 5000, cd: 40,
    moves: {
      punch: punch(10, { start: 12, reach: [4, 36], knock: true }),
      charge: { windup: 20, speed: 3.9, dur: 46, dmg: 12, min: 50, max: 230 },
      shoot: { windup: 18, speed: 3.6, dur: 0, dmg: 9, min: 60, max: 260, kind: 'disco' },
      grab: { windup: 12, reach: 26, hold: 44, dmg: 14 },
    },
    summon: { types: ['guardia', 'contable', 'comercial'], n: 2, at: [0.75, 0.5, 0.25] },
  },
};
