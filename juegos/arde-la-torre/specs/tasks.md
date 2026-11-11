# ARDE LA TORRE — Tareas (orden TDD)

> Regla: **test en rojo → código → verde → refactor.**
> Cada tarea cita su F o NFR. Leyenda: ⬜ pendiente · 🟨 en curso · ✅ hecha · ⏳ espera al usuario.
> Estado al 11 nov 2026: **v0.1 jugable** con arte provisional. `npm test` pasa **42 tests** (incluye bots que superan los 5 niveles y 2 móviles emulados).

## Fase 0 · Decisiones y preparación
| ID | Tarea | Estado |
|---|---|---|
| T0.1 | Decisiones de la spec §7 | ✅ el 11 nov 2026 (el usuario pidió «definir todo eso») |
| T0.2 | Andamiaje: `package.json`, esbuild con 2 entradas, `serve.mjs` (empaqueta al vuelo y muestra la IP de la red) y `build.mjs` | ✅ |
| T0.3 | Prompts de arte (`art/PROMPTS-GEMINI.md`) | ✅ |
| T0.4 | El usuario genera las **hojas de referencia** de Antonio y Pepe con Gemini | ⏳ |
| T0.5 | Hoja de concepto | ✅ sustituida por el arte provisional dibujado por código (sprites y fondos de los 5 niveles) |
| T0.6 | Experimento de la vía B (3D → sprites) | ⬜ opcional |
| T0.7 | Prueba de conexión con **móviles reales** por PeerJS (misma wifi y 4G), midiendo la latencia | ⏳ el usuario (en la sesión en la nube no hay móviles) |

## Fase 1 · Núcleo de la simulación — `tests/sim.test.js`
| ID | Test | Código | Estado |
|---|---|---|---|
| T1.1 | Misma semilla, misma secuencia | `sim/rng.js` | ✅ |
| T1.2 | Mismo estado tras 600 ticks con las mismas entradas | `sim/world.js` | ✅ |
| T1.3 | 8 direcciones, límites del suelo, salto con Z, doble toque para correr | `sim/fighter.js` | ✅ |
| T1.4 | \|Δy\| ≤ 8 sí y 9 no; un golpe por objetivo; pausa de impacto | `sim/combat.js` | ✅ |
| T1.5 | Combo de 3 que encadena solo si conecta; el 3.º tumba | `sim/moves.js` y `sim/fighter.js` | ✅ |
| T1.6 | Agarre, rodillazos, lanzamiento que daña a otros; los jefes no se agarran | `sim/combat.js` | ✅ |
| T1.7 | Especial invulnerable, 8 %, nunca por debajo de 1; golpe + salto también lo lanza | `sim/fighter.js` | ✅ |
| T1.8 | Retroceso, caída, suelo, levantarse con 1 s de invulnerabilidad | `sim/fighter.js` | ✅ |

## Fase 2 · Enemigos, niveles y partida — `tests/game.test.js`
| ID | Test | Código | Estado |
|---|---|---|---|
| T2.1 | Como mucho 2 atacantes por jugador; las fichas cuadran; los demás rodean | `sim/ai.js` | ✅ |
| T2.2 | Comercial embiste; Guardia bloquea de frente (guardia rota tras 3); Contable dispara; Ejecutiva agarra y lanza | `sim/ai.js` y `sim/enemies.js` | ✅ |
| T2.3 | ×1 / ×1,5 / ×2 / ×2,5, el jefe no se duplica, como mucho 8 en pantalla | `sim/level.js` | ✅ |
| T2.4 | La oleada bloquea la cámara, «¡ADELANTE!», el más atrasado frena | `sim/level.js` | ✅ |
| T2.5 | Comida sin pasarse del máximo, armas de 5 usos, cajas que sueltan objetos | `sim/fighter.js` y `sim/level.js` | ✅ |
| T2.6 | Vidas, reaparición, continuar 10 s, Fin del juego; asistido; entrar en caliente, ausencia y salida | `sim/world.js` | ✅ |
| T2.7 | Jefe de Seguridad (embiste y refuerzos) y Recepcionista (teléfonos) | `sim/enemies.js` y `sim/level.js` | ✅ |
| T2.8 | Bots que superan los **5 niveles** con 1 y 4 jugadores; un bot inactivo pierde | `sim/bot.js` y `scripts/tune.mjs` | ✅ |

## Fase 3 · Entradas locales — `tests/input.test.js`
| ID | Test | Código | Estado |
|---|---|---|---|
| T3.1 | Flancos y normalización | `input/source.js` | ✅ |
| T3.2 | 2 jugadores en un teclado | `input/keyboard.js` | ✅ |
| T3.3 | Mando físico: zona muerta, cruceta y botones | `input/gamepad.js` | ✅ |
| T3.4 | J1–J4 por llegada; el 5.º fuera; paletas distintas | `input/slots.js` | ✅ |

## Fase 4 · Móviles como mandos — `tests/net.test.js`, `tests/input.test.js`, `tests/misc.test.js`
| ID | Test | Código | Estado |
|---|---|---|---|
| T4.1 | Entradas en 5 bytes, ida y vuelta, fuera de orden | `net/protocol.js` | ✅ |
| T4.2 | Transporte local con la misma interfaz que PeerJS | `net/transport.js` | ✅ |
| T4.3 | 4 móviles sí, el 5.º «llena»; códigos sin caracteres ambiguos | `net/host.js` | ✅ |
| T4.4 | Ausente a los 1,5 s, fuera a los 20 s, reconexión con el mismo hueco | `net/host.js` y `net/pad.js` | ✅ |
| T4.5 | Sin botones pegados si se corta | `input/remote.js` | ✅ |
| T4.6 | Joystick flotante con zona muerta del 20 % y 8 direcciones, multitoque | `pad-ui/joystick.js` | ✅ |
| T4.7 | QR que se decodifica con jsQR | `render/qr.js` | ✅ |
| T4.8 | `PeerTransport` con móviles reales | `net/transport.js` | ⏳ igual que T0.7 |

## Fase 5 · Pantalla, arte y sonido
| ID | Tarea | Estado |
|---|---|---|
| T5.1 | Script de recorte de las hojas de Gemini (alinear pies, 72 px, 16 colores) | ⬜ cuando lleguen las hojas (T0.4) |
| T5.2 | Render: escalado entero, parallax, orden por profundidad, sombras | ✅ revisado en capturas |
| T5.3 | HUD de 4 jugadores y barra del jefe | ✅ |
| T5.4 | Pantallas: título, sala con QR, viñeta, pausa con opciones, superado, final, fin y resultado | ✅ |
| T5.5 | Secuenciador chiptune (6 temas originales) y efectos | ✅ `tests/misc.test.js` |
| T5.6 | Arte final de Antonio y Pepe, enemigos, jefes y fondos | ⏳ hojas del usuario |
| T5.7 | Opciones guardadas | ✅ `tests/misc.test.js` |

## Fase 6 · En el navegador y en el móvil — `tests/browser.test.js`
| ID | Tarea | Estado |
|---|---|---|
| T6.1 | Pantalla + 2 iPhone emulados por la sala: se unen, eligen, juegan el nivel 1 sin errores | ✅ |
| T6.2 | Cerrar un móvil → ausente → vuelve con el mismo sid y recupera su hueco | ✅ |
| T6.3 | fps con la CPU ×4 más lenta | ✅ 60 fps de media y p95 de 16,8 ms (4 jugadores, 1080p) |
| T6.4 | Peso | ✅ juego 196 KB y mando 117 KB (límites: 3 MB y 300 KB) |
| T6.5 | T-UX: 4 personas reales con sus móviles | ⏳ el usuario |

## Fase 7 · Lo que falta
| ID | Tarea | Estado |
|---|---|---|
| T7.1 | Arte final (sustituir `render/sprites.js` y `render/backgrounds.js` por los atlas) | ⏳ hojas de Gemini |
| T7.2 | Ataque combinado «acorde» (P1) | ⬜ |
| T7.3 | Táctil en la propia pantalla para 1 jugador sin mando (adelantado: el usuario prueba el enlace privado en su móvil) | ✅ `input/touch.js`, probado en un iPhone emulado |
| T7.5 | Pantalla de selección «cuatro ascensores» con retrato, estadísticas y puertas animadas | ✅ revisada en capturas |
| T7.6 | Retratos finales de selección (prompts §5 de `art/PROMPTS-GEMINI.md`) | ⏳ el usuario: completar «quién es quién» (§2) y generarlos |
| T8.1 | Aprobar el diseño de personajes v2 (spec §3.1, F7, F14) | ⏳ el usuario |
| T8.2 | Hojas de sprites de los 4 músicos y de objetos (`art/SPRITES-PERSONAJES.md`) | ⏳ el usuario (Gemini o ChatGPT) |
| T8.3 | Tests y código: pasivas, golpes de firma y SÚPER (`moves.js`, `fighter.js`) | ⬜ tras T8.1 |
| T8.4 | Tests y código: barra de VOLUMEN (F14) y potenciadores temporales (F7) | ⬜ tras T8.1 |
| T7.4 | Publicar en `/games/arde-la-torre/` y añadir la tarjeta en `data/games.json` | ⏸ hasta tener la respuesta de la banda (spec §7) |
