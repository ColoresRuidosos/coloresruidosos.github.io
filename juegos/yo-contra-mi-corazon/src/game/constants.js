// Todo el ajuste fino de «Yo contra mi corazón». Tiempos en segundos; «tiempos» = pulsos de la canción (168 BPM).
export const WIN = { perfect: 0.07, good: 0.14, early: 0.6 };   // F3; early = esquiva adelantada que aún salva
export const AVISO_BEATS = { 1: 4, 2: 3, 3: 3 };                  // F4: cuánto antes avisa el corazón
export const OPEN_BEATS = { 1: 4, 2: 4, 3: 3 };                   // F5: tiempos abiertos tras una buena esquiva
export const GUARD_BEATS = { fase1: 4, alta: 2, respiro: 8 };     // descanso antes del siguiente ataque, por sección
export const RECOVER_BEATS = 2;                                   // tras pegarle al payaso
export const TRANSITION_BEATS = 8;                                // cambio de fase (§4.3)
export const GRITO_BEATS = 8;                                     // F6
export const HEART_HP = [560, 640, 900];                          // barra por fase (ajustada con los bots, T2.7)
export const DMG = { perfecto: 6, bien: 5, fuera: 3 };            // por batazo; ×3 con el Grito
export const GRITO_MULT = 3;
export const CLOWN_HP = 100, HIT_DMG = 10, PHASE_HEAL = 40;       // F7
export const STARS_MAX = 5, PERFECTS_PER_STAR = 4;                // F6
export const DECISION_RATIO = 0.35;                               // F7: daño total ≥ 35 % = gana por decisión
export const SCORE = {
  esquiva: { perfecto: 100, bien: 60, temprano: 20 },
  batazo: { perfecto: 80, bien: 50, fuera: 20 },
  ko: 3000, koPorSegundo: 20, decision: 1000,
};
export const RANKS = [                                            // F8 (umbral = fracción del puntaje del bot perfecto)
  { min: 0.85, nombre: 'LEYENDA DEL CIRCO' },
  { min: 0.6, nombre: 'OVACIÓN DE PIE' },
  { min: 0.3, nombre: 'ACTO PRINCIPAL' },
  { min: 0, nombre: 'TELONERO' },
];
export const PERFECT_SCORE = 41000;                               // se recalibra con tests/bot.test.js
export const HOLD = { esquiva: 0.4, agachado: 0.4, batazo: 0.26, grito: 0.6, golpeado: 0.45 };  // poses del payaso
export const GOLPE_POSE = 0.25;                                   // cuánto se ve el puño extendido
export const SWING = { windup: 0.05, contact: 0.14 };              // F5b: impulso y contacto del batazo
export const LUNGE = 46;                                          // px que avanza el payaso al batear
