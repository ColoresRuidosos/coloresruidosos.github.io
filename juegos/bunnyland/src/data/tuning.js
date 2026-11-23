// Ajuste fino del juego. Todo en pasos de 1/60 s y en unidades (una casilla = TILE).
export const TILE = 240;
export const GRID_W = 21;
export const units = (tilesPerSec) => Math.round((tilesPerSec * TILE) / 60);

export function speeds(nivel) {
  const n = Math.min(nivel, 8);
  const enemigo = 5.0 + 0.35 * n;
  return { bunny: units(6.5 + 0.25 * n), enemigo: units(enemigo), triste: units(enemigo * 0.5), nube: units(12), casa: units(3.5) };
}

export const TURN_BUFFER = 15;                // F1: 250 ms
export const READY_STEPS = 120, DYING_STEPS = 90, CLEAR_STEPS = 150;
export const START_LIVES = 3, MAX_LIVES = 5;  // F6, F9
export const hyperSteps = (nivel) => 60 * Math.max(3, 6 - nivel); // F3
export const HUG_POINTS = [200, 400, 800, 1600];                  // F4
export const CARROT_POINTS = 10, POWER_POINTS = 50, ITEM_POINTS = 100;
export const BONUS_POINTS = [100, 300, 500, 1000, 2000];          // F7: estrella, bolsita, koi, micro, nube dorada
export const BONUS_AT = [0.3, 0.7], BONUS_STEPS = 540;
export const VANISH_STEPS = 300;                                  // F10

// Rondar ⇄ perseguir (segundos); después de la lista, perseguir siempre.
export const PHASES = [[9, 15, 9, 15, 7, 20, 5], [7, 20, 7, 20, 5, 25, 3]];
export const RELEASE = { coronado: 0, osito: 180, estrellita: 480, gotita: 840 };

// §3.1.1
export const CORNERS = { coronado: [19, -2], osito: [1, -2], estrellita: [19, 28], gotita: [1, 28] };
export const OSITO_PAUSA = 18;
export const TP_EVERY = 480, TP_AVISO = 60, TP_LEJOS = 5;
export const CHARCO_EVERY = 300, CHARCO_TTL = 120, CHARCO_SLOW = 0.7;
export const GOTITA_RADIO = 8;
export const CORONADO_ENOJO = 0.2, CORONADO_RAPIDO = 1.1;
export const QUIETO_STEPS = 120; // 2 s quieto: el Coronado lo huele y va por el camino más corto

// K15: medallas con los números del presskit
export const MEDALLAS = [
  { pts: 3500, nombre: '+3,500', de: 'INSTA' },
  { pts: 17000, nombre: '1.7K ×10', de: 'SPOTIFY' },
  { pts: 52600, nombre: '52.6K', de: 'YOUTUBE' },
];
