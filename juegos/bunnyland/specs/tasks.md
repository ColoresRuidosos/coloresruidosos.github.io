# BUNNYLAND — Tareas (orden TDD)

> Regla: **test en rojo → código → verde → refactor.**
> Cada tarea cita su F o NFR. Leyenda: ⬜ pendiente · 🟨 en curso · ✅ hecha · ⏳ espera al usuario.
> Estado al 23 nov 2026: **spec en borrador**, sin código.

## Fase 0 · Decisiones y preparación
| ID | Tarea | Estado |
|---|---|---|
| T0.1 | Revisión del presskit y claves K1–K17 | ✅ `spec.md` §1.1 |
| T0.2 | El usuario responde §7 (nombre, permiso, abrazo, motor, arte) | ⏳ |
| T0.3 | Hoja de concepto: Bunny, 4 enemigos, zanahorias, bonus, paleta K17 y maqueta del nivel 1 | ⬜ `scripts/atlas.py` → `art/concepto/` |
| T0.4 | Andamiaje: `package.json`, esbuild, `serve.mjs`, `build.mjs`, `publish-web.mjs` | ⬜ |

## Fase 1 · Núcleo
| ID | Test | Código | Estado |
|---|---|---|---|
| T1.1 | `rng.test.js`: misma semilla, misma secuencia | `core/rng.js` | ⬜ |
| T1.2 | `grid.test.js`: parseo, muros, túnel que envuelve, vecinos | `core/grid.js` | ⬜ |
| T1.3 | `mazes.test.js`: 5 laberintos de 21×27, todas las zanahorias alcanzables (BFS), 4 Hyperpop, una `S`, una nube (F8) | `data/mazes.js` | ⬜ |
| T1.4 | `loop.test.js`: paso fijo con acumulador | `core/loop.js` | ⬜ |
| T1.5 | `gestures.test.js`: deslizar ≥ 20 px, dirección dominante, teclado (F1) | `input/gestures.js` | ⬜ |

## Fase 2 · Reglas
| ID | Test | Código | Estado |
|---|---|---|---|
| T2.1 | `bunny.test.js`: avanza, choca con muro, giro guardado 250 ms, túnel (F1) | `game/bunny.js` | ⬜ |
| T2.2 | `level.test.js`: zanahoria +10, fin de nivel, cara por % (F2, K1) | `game/level.js` | ⬜ |
| T2.3 | `enemies.test.js`: objetivo de cada uno, sin vuelta en U, rondar ⇄ perseguir por tiempos (F5) | `game/enemies.js` | ⬜ |
| T2.4 | `enemies.test.js`: Coronado enojado, pausa del Osito, salto de Estrellita, charquito de Gotita (§3.1.1) | `game/enemies.js` | ⬜ |
| T2.5 | `match.test.js`: Hyperpop, abrazos 200→1,600, duración por nivel (F3, F4) | `game/match.js` | ⬜ |
| T2.6 | `match.test.js`: vida perdida, fin, colisión por cruce, casos borde §4.3 (F6) | `game/match.js` | ⬜ |
| T2.7 | `match.test.js`: bonus al 30 % y 70 %, besito +1 vida (máx. 5), «Siento que desaparezco» (F7, F9, F10) | `game/match.js` | ⬜ |
| T2.8 | `match.test.js`: récord y medallas 3,500 / 17,000 / 52,600 (F13, K15) | `game/match.js` | ⬜ |
| T2.9 | `bot.test.js`: el bot perfecto pasa los 5 niveles; el inactivo pierde; determinista | `game/bot.js`, `scripts/tune.mjs` | ⬜ |

## Fase 3 · Pantalla y sonido
| ID | Test | Código | Estado |
|---|---|---|---|
| T3.1 | `sprites.test.js`: todos los sprites existen y usan solo la paleta K17 | `render/sprites.js` | ⬜ |
| T3.2 | Temas de los 5 escenarios y HUD (capturas de Playwright) | `render/stage.js`, `render/hud.js` | ⬜ |
| T3.3 | Pantallas: título, cómo se juega, pausa, entre niveles, fin, girar (F11) | `render/screens.js`, `main.js` | ⬜ |
| T3.4 | `glitch.test.js`: ≤ 2 cambios/s y apagado con «menos movimiento» (NFR accesibilidad) | `render/stage.js` | ⬜ |
| T3.5 | `audio.test.js` (Web Audio simulado): 5 patrones a 140 BPM, efectos, silencio (F12) | `audio/synth.js`, `audio/sfx.js` | ⬜ |

## Fase 4 · En el navegador y en el celular
| ID | Test | Código | Estado |
|---|---|---|---|
| T4.1 | `browser.test.js`: iPhone emulado, deslizar mueve al Bunny, sin scroll, pausa en segundo plano | `main.js` | ⬜ |
| T4.2 | Peso ≤ 250 KB y arranque (NFR) | `scripts/build.mjs` | ⬜ |
| T4.3 | Tarjeta 1080×1920 (F14) | `share/card.js` | ⬜ |

## Fase 5 · Publicación y lo que sigue
| ID | Tarea | Estado |
|---|---|---|
| T5.1 | Publicar en `static/games/bunnyland/` y `data/games.json` | ⬜ |
| T5.2 | P1 · «Tu otra mitad» (2 jugadores, K3) | ⬜ |
| T5.3 | P1 · Ranking semanal | ⬜ |
| T5.4 | P2 · Skins de vestuario y modo grabación | ⬜ |
