# YO CONTRA MI CORAZÓN — Tareas (orden TDD)

> Regla: **test en rojo → código → verde → refactor.**
> Cada tarea cita su F o NFR. Leyenda: ⬜ pendiente · 🟨 en curso · ✅ hecha · ⏳ espera al usuario.
> Estado al 9 nov 2026: **v0.2** (temporada limitada y ranking); `npm test` pasa 46 tests.

## Fase 0 · Decisiones y preparación
| ID | Tarea | Estado |
|---|---|---|
| T0.1 | Hoja de concepto de sprites y maqueta de pantalla | ✅ `art/concepto/hoja-concepto.png` |
| T0.2 | Análisis de la canción: 168 BPM estable; secciones por energía | ✅ `scripts/beatmap.py` |
| T0.3 | El usuario aprueba: canción (opción C) y nombre | ✅ · ⏳ duración (¿modo reel?) y bate |
| T0.4 | Andamiaje: `package.json`, esbuild, `serve.mjs`, `build.mjs` y `publish-web.mjs` | ✅ |

## Fase 1 · Núcleo de ritmo
| ID | Test | Código | Estado |
|---|---|---|---|
| T1.1 | `core.test.js` (reloj) | `core/clock.js` | ✅ |
| T1.2 | `core.test.js` (juicio y asistido) | `core/judge.js` | ✅ |
| T1.3 | `core.test.js` (mapa) | `data/beatmap.js` | ✅ |
| T1.4 | `gestures.test.js` | `input/gestures.js` | ✅ |

## Fase 2 · Reglas de la pelea
| ID | Test | Código | Estado |
|---|---|---|---|
| T2.1 | Tutorial, aviso, tiempo par y semilla | `game/match.js` y `data/patterns.js` | ✅ |
| T2.2 | Esquiva correcta, equivocada, agachado y temprana | `game/match.js` | ✅ |
| T2.3 | Daño en el tiempo, fuera de tiempo y rebote | `game/match.js` | ✅ |
| T2.4 | Estrellas y Grito | `game/match.js` | ✅ |
| T2.5 | Derrota, K.O. y asistido | `game/match.js` | ✅ |
| T2.6 | Fases por barra y por canción | `game/match.js` | ✅ |
| T2.7 | `bot.test.js`: el perfecto gana por K.O. después de 2:20; el bueno gana; el inactivo pierde; determinista | `game/bot.js` y `scripts/tune.mjs` | ✅ |

## Fase 3 · Pantalla y sonido
| ID | Test | Código | Estado |
|---|---|---|---|
| T3.1 | `poses.test.js` y poses en el atlas | `game/poses.js`, `scripts/atlas.py` y `render/sprites.js` | ✅ |
| T3.2 | HUD (se revisa en capturas de Playwright) | `render/view.js` | ✅ |
| T3.3 | Pantallas: título, cómo se juega, opciones, pausa con cuenta, resultado y girar | `render/screens.js` y `main.js` | ✅ (probado en el navegador) |
| T3.4 | `audio.test.js` | `audio/player.js` y `audio/sfx.js` | ✅ |
| T3.5 | `save.test.js` | `core/save.js` | ✅ |
| T3.6 | `save.test.js` (texto de la tarjeta) | `share/card.js` | ✅ |

## Fase 4 · En el navegador y en el celular
| ID | Tarea | Estado |
|---|---|---|
| T4.1 | `browser.test.js`: iPhone 13 emulado con `?sim=10&bot`; la partida completa termina sin errores | ✅ |
| T4.2 | `browser.test.js`: en horizontal pide girar; la pausa por `visibilitychange` está en el código | ✅ |
| T4.3 | Medir los fps con la CPU ×4 más lenta | ⬜ |
| T4.4 | T-UX: 3 personas en celulares reales (Android e iPhone); ajustar el umbral de deslizamiento, el desfase y la dificultad | ⏳ el usuario |
| T4.5 | Peso: HTML de 79 KB más el MP3 de 3,6 MB | ✅ |

## Fase 5 · Publicación y lo que sigue
| ID | Tarea | Estado |
|---|---|---|
| T5.1 | Canción: excepción aceptada (opción C) | ✅ |
| T5.2 | `publish:web`, tarjeta en `data/games.json` (desde el 9 nov 2026) y F25 en `docs/spec.md` | ✅ (sale al fusionar en `main`) |
| T5.3 | P1: calibración por toques, y traje «Payaso» en *México vs. José Madero* | ⬜ |
| T5.4 | P2: modo reel de 60 s sin HUD | ⏳ |

## Fase 6 · Solo esta semana y ranking (v0.2)
| ID | Test | Código | Estado |
|---|---|---|---|
| T6.1 | `ranking.test.js` (temporada): abierta del 9 al 15 nov, días que quedan, cierre | `ranking/temporada.js` y portada | ✅ |
| T6.2 | `ranking.test.js`: listas iguales al Apps Script, nombres que caben, envío válido, orden, errores del servidor y ranking de prueba | `ranking/ranking.js` | ✅ |
| T6.3 | `tests-js/ranking.test.js` del sitio sigue en verde; `vigente()` cierra el modo `corazon` | `docs/ranking/Code.gs` | ✅ |
| T6.4 | `browser.test.js`: publicar y ver tu nombre en el ranking | pantallas «Publicar» y «Ranking» | ✅ |
| T6.5 | `tests-js/games.test.js`: tarjeta «Solo esta semana» con `hasta` | `data/games.json` y `layouts/games/section.html` | ✅ |
| T6.6 | El equipo publica la versión nueva del Apps Script (`docs/ranking/README.md` §6) | — | ⏳ el equipo |
| T6.7 | Versión de prueba en un solo HTML (canción incrustada y ranking local) | `scripts/build.mjs` | ✅ |
