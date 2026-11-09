# PAYASO VS. CORAZÓN — Tareas (orden TDD)

> Regla: **test en rojo → código → verde → refactor.**
> Cada tarea cita su F o NFR. Leyenda: ⬜ pendiente · 🟨 en curso · ✅ hecha · ⏳ espera al usuario.

## Fase 0 · Decisiones y preparación
| ID | Tarea | Estado |
|---|---|---|
| T0.1 | Hoja de concepto de sprites y maqueta de pantalla | ✅ `art/concepto/hoja-concepto.png` |
| T0.2 | Análisis inicial de la canción (168 BPM; secciones por energía) | ✅ |
| T0.3 | El usuario aprueba la spec y responde las preguntas de §7 (canción, duración, bate, nombre) | ⏳ |
| T0.4 | Andamiaje: `package.json`, esbuild, `.gitignore` con `*.mp3` y `serve.mjs` | ⬜ |

## Fase 1 · Núcleo de ritmo (sin pantalla)
| ID | Test primero (rojo) | Luego el código | Ref. |
|---|---|---|---|
| T1.1 | `clock.test.js`: dados el `currentTime`, la latencia y el desfase, devuelve el `songTime` y el tiempo correctos; el tiempo 0 cae en `firstBeat` | `core/clock.js` | F2 |
| T1.2 | `judge.test.js`: ±70 ms da Perfecto, ±140 ms da Bien y lo demás Fuera; el modo asistido duplica las ventanas | `core/judge.js` | F3, F11 |
| T1.3 | `beatmap.test.js`: el mapa tiene un BPM entre 160 y 176, secciones contiguas que cubren 0 → duración, y 3 fases en orden | `scripts/beatmap.py` y `data/beatmap.js` | §3.0 |
| T1.4 | `gestures.test.js`: secuencias de puntero sintéticas → deslizar izq./der./abajo, tocar, micro; los casos ambiguos (23 px, 210 ms); el teclado da las mismas acciones | `input/gestures.js` | F1 |

## Fase 2 · Reglas de la pelea
| ID | Test primero (rojo) | Luego el código | Ref. |
|---|---|---|---|
| T2.1 | `heart.test.js`: cada ataque pasa por aviso → golpe en el tiempo exacto; el aviso dura 2 tiempos en la fase 1 y 1 en las fases 2 y 3; la finta no golpea; la misma semilla da la misma secuencia | `game/heart.js` y `data/patterns.js` | F4 |
| T2.2 | `exchange.test.js`: una esquiva correcta abre 2 tiempos; la esquiva al lado equivocado recibe el golpe; el agachado evita el latido pero no el gancho | `game/match.js` | F4, F5 |
| T2.3 | `damage.test.js`: el batazo en el tiempo hace daño completo, fuera de tiempo la mitad, y fuera de la ventana rebota y rompe la racha | `game/match.js` | F5 |
| T2.4 | `publico.test.js`: 4 Perfectos dan +1 estrella; recibir un golpe quita 1; con 5 estrellas se habilita el Grito, que aturde 4 tiempos y triplica el daño | `game/match.js` | F6 |
| T2.5 | `fin.test.js`: vida 0 da «SE ACABÓ EL SHOW»; la fase 3 en 0 da K.O.; al terminar la canción, 3 estrellas o más da decisión a favor; el rango se calcula según los puntos | `game/match.js` | F7, F8 |
| T2.6 | `fases.test.js`: al vaciar la barra o llegar el compás, transición de 2 tiempos; la fase 3 crea las mitades | `game/heart.js` | §4.3 |
| T2.7 | `bot.test.js`: un bot perfecto gana por K.O. antes de la 3:40; un bot inactivo pierde; un bot al 80 % gana por decisión (comprueba la dificultad) | — | NFR pruebas |

## Fase 3 · Pantalla y sonido
| ID | Test primero (rojo) | Luego el código | Ref. |
|---|---|---|---|
| T3.1 | `sprites.test.js`: cada pose existe, tiene el tamaño esperado y su contorno es la paleta oscura; con «sin destellos» no hay pose de aviso que parpadee | `render/sprites.js` (portado de `hoja_concepto.py`) | §7 del plan |
| T3.2 | `hud.test.js`: las barras, las estrellas y el tiempo restante salen del estado (snapshot de píxeles en 3 estados) | `render/hud.js` y `render/stage.js` | F9 |
| T3.3 | `screens.test.js`: transiciones Título → Cómo se juega (solo la primera vez) → Partida → Resultado | `render/screens.js` y `main.js` | F9, §4.1 |
| T3.4 | `audio.test.js` (con un AudioContext simulado): carga con progreso, desbloqueo, pausa y reanudación con cuenta de 3 tiempos | `audio/player.js` y `audio/sfx.js` | F2, F12 |
| T3.5 | `opciones.test.js`: guardar y leer `pvc-save`; desfase, asistido, sin destellos y vibración | `core/save.js` | F11 |
| T3.6 | `card.test.js`: la tarjeta mide 1080×1920 y lleva el rango y los puntos; si no hay Web Share, descarga | `share/card.js` | F10 |

## Fase 4 · En el navegador y en el celular
| ID | Tarea | Ref. |
|---|---|---|
| T4.1 | Playwright con un iPhone 13 emulado: toque → partida → deslizamientos sintéticos → el bot gana → pantalla de resultado | NFR pruebas |
| T4.2 | Playwright: horizontal muestra «Gira tu celular»; `visibilitychange` pausa | §4.4 |
| T4.3 | Medir los fps con trazas del rendimiento en CPU ×4 más lenta (60 fps o más) | NFR rendimiento |
| T4.4 | T-UX: probar con 3 personas en sus celulares reales (Android e iPhone); ajustar el umbral de deslizamiento y el desfase | F1, F2 |
| T4.5 | Build: HTML de 300 KB o menos más el MP3 aparte | NFR peso |

## Fase 5 · Publicación (bloqueada por T0.3)
| ID | Tarea | Ref. |
|---|---|---|
| T5.1 | Resolver la canción para la web: permiso, chiptune original o riesgo aceptado | spec §6.1 |
| T5.2 | `publish:web`, tarjeta en `data/games.json` y entrada F en `docs/spec.md` | Plan §10 |
| T5.3 | P1: calibración, récord local y traje «Payaso» en *México vs. José Madero* | §3.2 |
| T5.4 | P2: modo reel de 60 s sin HUD | §3.2 |
