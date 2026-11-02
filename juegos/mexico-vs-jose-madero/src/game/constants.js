// Unidades: píxeles lógicos y segundos. Paso fijo de 60 Hz.
export const W = 320, H = 224, TILE = 16, DT = 1 / 60;

export const P = {
  w: 14, h: 40, // sprite oficial de 48 px (art/source/pepe-sheet.jpg)
  accel: 1100, airAccel: 800, friction: 1300, maxRun: 165, // v5: más rápido
  gravity: 1400, jumpVel: 430, jumpCut: 150, maxFall: 420,
  coyote: 6, buffer: 6, // frames
  stompBounce: 300, invuln: 1.5, knockback: 160,
};

export const MIC = { range: 76, outSpeed: 520, backSpeed: 620, pull: 360, hookRadius: 12, releaseVx: 220, releaseVy: 300, aimY: 48, handX: 18, handY: 29 };
export const FREEZE = 0.6; // s que congela el flash del Paparazzi

// v5 · Ritmo y puntuación (spec §3.0d).
export const HITSTOP = 4; // fotogramas de parón al vencer a un enemigo
export const COMBO_WINDOW = 2; // s entre enemigos para mantener el combo
export const POINTS = 100; // × combo
export const OVATION = { max: 100, perHit: 12 }; // × combo
export const GUITAR = { reach: 176, invuln: 1, fx: 0.8 }; // px a cada lado de Pepe («en pantalla»)
export const AMP = { time: 10, mult: 2 };

export const ENEMY = {
  titular: { w: 18, h: 30, speed: 30 },
  paparazzi: { w: 18, h: 40, speed: 22, sight: 120, aim: 0.7, flash: 0.25, cool: 1.2 },
  reportero: { w: 18, h: 42, speed: 20, sight: 140, windup: 0.25, dash: 0.7, dashSpeed: 170, rest: 0.7 },
  // v5 · Carmesí (voladores: no les afecta la gravedad)
  rumor: { w: 22, h: 18, speed: 40, amp: 10, sight: 28, dive: 260, climb: 90, fly: true },
  traidor: { w: 16, h: 24, sight: 150, aim: 0.6, lunge: 230, lungeT: 0.55, rest: 0.8, back: 60, fly: true },
  // v7 · Noche (spec §3.0f E)
  // v8.1 · Invitados disfrazados de la fiesta (spec §3.0f G). `speed2` y demás «2»: sin disfraz.
  gigante: { w: 22, h: 44, speed: 18, speed2: 40, sight: 160, costumeHits: 2, push: 2 },
  invisible: { w: 16, h: 40, speed: 28, speed2: 60, sight: 220 },
  anfibio: { w: 18, h: 30, speed: 0, speed2: 0, sight: 56, warn: 0.45, jumpV: 560, rest: 1.2, rest2: 0.6, hide: 8 },
  llorona: { w: 18, h: 36, speed: 22, speed2: 40, sight: 220, cry: 64, slow: 1.0, cool: 2.5, fly: true },
  charro: { w: 18, h: 42, speed: 22, speed2: 34, sight: 140, windup: 0.3, dash: 0.7, dashSpeed: 180, dashSpeed2: 240, rest: 0.7 },
  murcielago: { w: 16, h: 12, sight: 40, swoop: 1.3, depth: 72, speed: 110, rest: 1.0, fly: true },
  fantasma: { w: 18, h: 22, speed: 26, sight: 220, fly: true },
};

// v7 · Farol de Noche: radio de luz en px; se gasta en `duration` s y nunca baja de `min`.
export const LANTERN = { max: 96, min: 40, duration: 40 };
// v7 · Jefe El Enmascarado del Lago ⏳ (provisional, spec §3.0f E).
// v7.2 (feedback del usuario: «muy fácil»): más golpes, menos tiempo aturdido, más rápido y doble embestida en la fase 2.
export const MASK = { w: 28, h: 50, hp: 8, phase2: 4, lurk: 0.8, lurk2: 0.55, dash: 230, dash2: 270, dashMax: 3, stun: 1.0, blackout: 1.0, hurtT: 0.3, spot: 3 };

// Jefe Cámara Flash-Bot (spec §3.0d).
export const BOSS = {
  w: 60, h: 56, hp: 6, phase2: 3,
  walk: 1.6, speed: 40, speed2: 70,
  charge: 0.8, beam: 0.4, exposed: 2.0, hurtT: 0.35, retreat: 150, retreatT: 1.0,
  beamLow: 14, beamHigh: 54, beamH: 12, // altura del centro del rayo sobre el suelo y grosor
};

// Cinemática de entrada del jefe (spec §3.0d): tiempos en segundos.
export const INTRO = { total: 4.5, skip: 0.5, walk: 1.3, walkDist: 96, dropStart: 1.4, dropEnd: 1.9, dropH: 190, card: 2.1, fight: 3.7 };
