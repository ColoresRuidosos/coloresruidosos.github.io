// Golpes como datos (plan §3): ajustar a un músico es editar esta tabla.
// Cajas: reach = [desde, hasta] en px delante del personaje; z = [desde, hasta] en altura.
// Tiempos en ticks (1/60 s): start (arranque), active (golpea), rec (recuperación).
// both: golpea a los dos lados. rehit: vuelve a golpear al mismo objetivo cada N ticks.

const combo = (...hits) => hits;

export const HEROES = {
  antonio: {
    name: 'ANTONIO', role: 'VOZ Y GUITARRA', special: 'GRITO',
    hp: 100, speed: 1.3, run: 2.6, jump: 4.6, w: 16, h: 58,
    combo: combo(
      { start: 3, active: 3, rec: 7, reach: [4, 30], z: [30, 52], dmg: 5, push: 1.2 },
      { start: 3, active: 3, rec: 8, reach: [4, 32], z: [28, 50], dmg: 6, push: 1.2 },
      { start: 5, active: 4, rec: 14, reach: [2, 40], z: [10, 52], dmg: 10, push: 2, knock: true },
    ),
    air: { reach: [0, 30], z: [0, 40], dmg: 9, knock: true, air: true },
    dash: { reach: [0, 34], z: [10, 50], dmg: 10, knock: true, dur: 22 },
    knee: 5, throw: 12,
    sp: { dur: 34, from: 8, to: 22, reach: [-4, 92], z: [0, 64], dmg: 14, knock: true },
  },
  pepe: {
    name: 'PEPE', role: 'BAJO', special: 'BAJO AL SUELO',
    hp: 115, speed: 1.1, run: 2.3, jump: 4.2, w: 18, h: 60,
    combo: combo(
      { start: 4, active: 3, rec: 9, reach: [4, 32], z: [30, 52], dmg: 7, push: 1.5 },
      { start: 4, active: 3, rec: 10, reach: [4, 34], z: [28, 50], dmg: 8, push: 1.5 },
      { start: 7, active: 5, rec: 16, reach: [2, 44], z: [0, 54], dmg: 13, push: 2.5, knock: true },
    ),
    air: { reach: [0, 32], z: [0, 40], dmg: 11, knock: true, air: true },
    dash: { reach: [0, 36], z: [10, 52], dmg: 12, knock: true, dur: 22 },
    knee: 7, throw: 16,
    sp: { dur: 36, from: 12, to: 22, reach: [0, 56], z: [0, 40], dmg: 15, knock: true, both: true },
  },
  dani: {
    name: 'DANI', role: 'GUITARRA', special: 'SOLO',
    hp: 90, speed: 1.55, run: 2.9, jump: 4.8, w: 14, h: 56,
    combo: combo(
      { start: 2, active: 2, rec: 6, reach: [4, 28], z: [30, 52], dmg: 4, push: 1 },
      { start: 2, active: 2, rec: 6, reach: [4, 28], z: [30, 52], dmg: 4, push: 1 },
      { start: 3, active: 3, rec: 8, reach: [4, 32], z: [26, 50], dmg: 5, push: 1.2 },
      { start: 5, active: 4, rec: 14, reach: [2, 38], z: [10, 52], dmg: 8, push: 2, knock: true },
    ),
    air: { reach: [0, 30], z: [0, 40], dmg: 8, knock: true, air: true },
    dash: { reach: [0, 34], z: [10, 50], dmg: 9, knock: true, dur: 20 },
    knee: 4, throw: 11,
    sp: { dur: 40, from: 6, to: 34, reach: [0, 44], z: [0, 56], dmg: 5, rehit: 9, both: true, knockLast: true },
  },
  jota: {
    name: 'JOTA', role: 'BATERÍA', special: 'REDOBLE',
    hp: 95, speed: 1.35, run: 2.7, jump: 4.6, w: 16, h: 56,
    combo: combo(
      { start: 3, active: 3, rec: 7, reach: [6, 38], z: [30, 54], dmg: 5, push: 1.2 },
      { start: 3, active: 3, rec: 7, reach: [6, 38], z: [30, 54], dmg: 5, push: 1.2 },
      { start: 5, active: 4, rec: 14, reach: [4, 42], z: [10, 54], dmg: 9, push: 2, knock: true },
    ),
    air: { reach: [0, 34], z: [0, 40], dmg: 9, knock: true, air: true },
    dash: { reach: [0, 38], z: [10, 50], dmg: 10, knock: true, dur: 22 },
    knee: 5, throw: 12,
    sp: { dur: 38, from: 6, to: 32, reach: [-2, 50], z: [0, 60], dmg: 4, rehit: 6, knockLast: true },
  },
};

export const HERO_IDS = Object.keys(HEROES);

// Arma recogida del suelo (F7): sustituye al combo mientras dura.
export const WEAPONS = {
  grapadora: { reach: [4, 34], z: [24, 52], dmg: 9, knock: false, uses: 5 },
  extintor: { reach: [4, 42], z: [10, 52], dmg: 12, knock: true, uses: 5 },
  silla: { reach: [2, 46], z: [6, 54], dmg: 14, knock: true, uses: 5 },
};
export const WEAPON_SWING = { start: 6, active: 4, rec: 14 };

// Comida (F7): fracción de la vida máxima que recupera.
export const FOOD = { bocadillo: 0.3, cafe: 0.1 };
export const PUA_POINTS = 1000;
