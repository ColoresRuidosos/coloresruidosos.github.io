# ARDE LA TORRE — Tareas (orden TDD)

> Regla: **test en rojo → código → verde → refactor.**
> Cada tarea cita su F o NFR. Leyenda: ⬜ pendiente · 🟨 en curso · ✅ hecha · ⏳ espera al usuario.
> Estado al 10 nov 2026: **especificación en borrador**; aún no hay código.

## Fase 0 · Decisiones y preparación
| ID | Tarea | Estado |
|---|---|---|
| T0.1 | El usuario aprueba la spec y responde las preguntas abiertas (spec §7): nombre, villano, los 2 músicos del MVP y si se contacta a la banda | ⏳ |
| T0.2 | Andamiaje: `package.json`, esbuild con 2 entradas (juego y mando), `serve.mjs`, `build.mjs` y `publish-web.mjs` (copiados de *Yo contra mi corazón*) | ⬜ |
| T0.3 | Prompts de arte listos (`art/PROMPTS-GEMINI.md`) | ✅ |
| T0.4 | El usuario genera las **hojas de referencia** de Antonio y Pepe con Gemini | ⏳ |
| T0.5 | Hoja de concepto: los 2 músicos pixelados, un Becario y una maqueta de pantalla del Parking a 384×216 | ⬜ |
| T0.6 | **Experimento de la vía B** (3D → sprites) con 1 músico y 3 animaciones; comparar con la vía A | ⬜ |
| T0.7 | **Experimento de conexión:** página mínima con PeerJS, 1 pantalla y 1 móvil reales, midiendo la latencia de ida y vuelta en la misma wifi y con 4G (NFR latencia) | ⬜ |

## Fase 1 · Núcleo de la simulación
| ID | Test | Código | Estado |
|---|---|---|---|
| T1.1 | `rng.test.js`: misma semilla, misma secuencia | `sim/rng.js` | ⬜ |
| T1.2 | `world.test.js`: paso fijo; mismas entradas y semilla dan el mismo estado después de 600 ticks | `sim/world.js` | ⬜ |
| T1.3 | `fighter.test.js`: caminar en 8 direcciones, límites del suelo, salto con Z y doble toque para correr (F1) | `sim/fighter.js` | ⬜ |
| T1.4 | `combat.test.js`: hay contacto con \|Δy\| ≤ 8 y no con 9; cada golpe conecta una vez por objetivo; pausa de impacto (F2) | `sim/combat.js` | ⬜ |
| T1.5 | `combat.test.js`: combo de 3 con ventana de encadenado; fuera de la ventana el combo se reinicia; el 3.º golpe tumba (F2) | `sim/moves.js` | ⬜ |
| T1.6 | `combat.test.js`: agarre a un aturdido, rodillazos, lanzamiento y que **el lanzado dañe a otros** (F2) | `sim/combat.js` | ⬜ |
| T1.7 | `combat.test.js`: especial invulnerable que cuesta un 8 % y nunca deja por debajo de 1 punto de vida (F3) | `sim/fighter.js` | ⬜ |
| T1.8 | `fighter.test.js`: retroceso, caída, suelo y levantarse con 1 s de invulnerabilidad (F4) | `sim/fighter.js` | ⬜ |

## Fase 2 · Enemigos, niveles y partida
| ID | Test | Código | Estado |
|---|---|---|---|
| T2.1 | `ai.test.js`: como mucho 2 atacantes por jugador; las fichas se devuelven; los demás rodean (F5) | `sim/ai.js` | ⬜ |
| T2.2 | `ai.test.js`: Becario, Comercial (embestida) y Guardia (bloquea de frente y no de espaldas) (F5) | `sim/ai.js` | ⬜ |
| T2.3 | `scaling.test.js`: ×1, ×1,5, ×2 y ×2,5, con 8 enemigos como máximo en pantalla (F5, plan §10) | `sim/scaling.js` | ⬜ |
| T2.4 | `level.test.js`: la oleada bloquea la cámara; al vaciarla sale «¡ADELANTE!»; el jugador más atrasado limita el avance (F6) | `sim/level.js` | ⬜ |
| T2.5 | `items.test.js`: la comida cura y la vida no pasa del máximo; las armas tienen 5 usos; romper cajas (F7) | `sim/items.js` | ⬜ |
| T2.6 | `world.test.js`: vidas, reaparición, continuar durante 10 s y Fin del juego cuando caen todos (F8) | `sim/world.js` | ⬜ |
| T2.7 | `bosses.test.js`: Jefe de Seguridad (embestida y refuerzos) y Recepcionista (teléfono y tornos) (F6) | `sim/bosses.js` | ⬜ |
| T2.8 | `bot.test.js`: un bot supera los niveles 1 y 2 solo y en grupo de 4; un bot inactivo pierde; todo es determinista | `sim/bot.js` y `scripts/tune.mjs` | ⬜ |

## Fase 3 · Entradas locales
| ID | Test | Código | Estado |
|---|---|---|---|
| T3.1 | `input.test.js`: «pulsado ahora» frente a «mantenido» con la misma interfaz para todas las fuentes (F9) | `input/source.js` | ⬜ |
| T3.2 | `input.test.js`: 2 configuraciones en un mismo teclado sin que se pisen (F9) | `input/keyboard.js` | ⬜ |
| T3.3 | `input.test.js`: gamepad simulado con zona muerta y hasta 4 a la vez (F9) | `input/gamepad.js` | ⬜ |
| T3.4 | `slots.test.js`: J1–J4 por orden de llegada; la 5.ª fuente se rechaza; el mismo músico recibe otra paleta (F9, §3.1) | `input/slots.js` | ⬜ |

## Fase 4 · Móviles como mandos (F10)
| ID | Test | Código | Estado |
|---|---|---|---|
| T4.1 | `protocol.test.js`: codificar y decodificar `in` en 3 bytes más la secuencia; mensajes fuera de orden se descartan | `net/protocol.js` | ⬜ |
| T4.2 | `net.test.js`: `LoopbackTransport` en memoria con la misma interfaz que `PeerTransport` | `net/transport.js` | ⬜ |
| T4.3 | `net.test.js`: la sala acepta 4 mandos y rechaza el 5.º con `llena`; el código no lleva caracteres ambiguos | `net/host.js` | ⬜ |
| T4.4 | `net.test.js`: 1,5 s sin latido → desconectado → pausa invulnerable 20 s → sale de la partida; reconectar con el mismo ID de sesión recupera el hueco (F10.5) | `net/host.js` e `input/slots.js` | ⬜ |
| T4.5 | `net.test.js`: `remote.js` convierte los mensajes `in` en un `InputSource`; perder paquetes no deja botones pegados | `input/remote.js` | ⬜ |
| T4.6 | `pad.test.js`: joystick flotante con zona muerta del 20 % y 8 direcciones; multitoque de joystick y botón | `pad-ui/` | ⬜ |
| T4.7 | Generar el QR (comprobarlo con un decodificador en el test) y pintarlo en la pantalla de sala | `render/qr.js` | ⬜ |
| T4.8 | `PeerTransport` con PeerJS: probarlo a mano con un móvil real (ver T0.7) | `net/transport.js` | ⬜ |

## Fase 5 · Pantalla, arte y sonido
| ID | Test | Código | Estado |
|---|---|---|---|
| T5.1 | `sprites.test.js`: el script de recorte alinea los pies, respeta 72 px de alto y deja 16 colores o menos por músico (pytest o un test de Node sobre el atlas) | `scripts/slice_sheet.py` y `scripts/atlas.py` | ⬜ |
| T5.2 | Render: escalado entero, parallax, orden por `y` y sombras (revisado en capturas de Playwright) | `render/` | ⬜ |
| T5.3 | HUD en 4 esquinas legible a 3 m (captura a 1080p) | `render/hud.js` | ⬜ |
| T5.4 | Pantallas: título, sala con QR, selección, viñeta, pausa, Fin del juego y resultado | `render/screens.js` y `main.js` | ⬜ |
| T5.5 | `audio.test.js`: el secuenciador genera los eventos correctos para un patrón (sin altavoces) | `audio/` | ⬜ |
| T5.6 | Arte final de Antonio, Pepe, 3 enemigos, 2 jefes y 2 fondos, integrados en el atlas | `art/` y `data/atlas.js` | ⏳ hojas del usuario (T0.4) |
| T5.7 | `save.test.js`: las opciones se guardan en `localStorage` (F13) | `core/save.js` | ⬜ |

## Fase 6 · En el navegador y en el móvil
| ID | Tarea | Estado |
|---|---|---|
| T6.1 | `browser.test.js`: pantalla de escritorio y **2 mandos emulados** (iPhone 13) con `?net=loop&bot`; se unen, eligen músico y completan el nivel 1 sin errores | ⬜ |
| T6.2 | `browser.test.js`: cerrar la pestaña de un mando → «Reconectando…» → volver la recupera | ⬜ |
| T6.3 | Medir los fps con 4 jugadores y 12 enemigos con la CPU ×4 más lenta (NFR rendimiento) | ⬜ |
| T6.4 | Medir el peso de `dist/` y `dist/mando/` (NFR peso) | ⬜ |
| T6.5 | T-UX: 4 personas reales con sus móviles (Android e iPhone) en la misma wifi; ajustar la zona muerta, el tamaño de los botones y la dificultad | ⏳ el usuario |

## Fase 7 · P1 y publicación
| ID | Tarea | Estado |
|---|---|---|
| T7.1 | Dani y Jota: datos de golpes, especiales y arte | ⬜ |
| T7.2 | Niveles 3 (ascensor), 4 (oficinas) y 7 (azotea, con el jefe final) | ⬜ |
| T7.3 | Contable y Ejecutiva | ⬜ |
| T7.4 | Ataque combinado «acorde» | ⬜ |
| T7.5 | Publicar en `/games/arde-la-torre/` y añadir la tarjeta en `data/games.json` | ⏳ decisión del usuario (spec §7.6) |
