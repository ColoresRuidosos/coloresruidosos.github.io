# ARDE LA TORRE — Tareas (orden TDD)

> Regla: **test en rojo → código → verde → refactor.**
> Cada tarea cita su F o NFR. Leyenda: ⬜ pendiente · 🟨 en curso · ✅ hecha · ⏳ espera al usuario.
> Estado al 15 nov 2026: **v0.7**: potenciadores (F7) y arte final de enemigos, jefes, objetos y título. `npm test` pasa **57 tests**.

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
| T5.1 | Script de recorte de las hojas de Gemini: quita fondo y líneas de suelo, separa poses, escala a 66 px de pie, paleta fija, contorno, pies alineados, atlas | ✅ `scripts/slice_sheet.py` · `tests/atlas.test.js` |
| T5.2 | Render: escalado entero, parallax, orden por profundidad, sombras | ✅ revisado en capturas |
| T5.3 | HUD de 4 jugadores y barra del jefe | ✅ |
| T5.4 | Pantallas: título, sala con QR, viñeta, pausa con opciones, superado, final, fin y resultado | ✅ |
| T5.5 | Secuenciador chiptune (6 temas originales) y efectos | ✅ `tests/misc.test.js` |
| T5.6 | Arte final: **los 4 músicos ✅**, **4 fondos ✅**, **5 enemigos y 4 jefes ✅**, **objetos ✅** y **título ✅** | ✅ |
| T5.6h | Enemigos, jefes, objetos y título (15 nov): `slice_sheet.py` con `erase` (rótulos que Gemini escribió en el Director y el Presidente) y `cuts` (el teléfono de la Recepcionista invade la pose vecina); `enemyFrameName` y sustituciones por tipo en `render/atlas.js`; pose de «llamar refuerzos» | ✅ `tests/atlas.test.js` |
| T5.6j | Antonio v3 (15 nov, «la guitarra está como doble y viendo para diferentes lados»): movimiento y guitarrazo repetidos con la guitarra detrás de la espalda; fuera las poses sustituidas (`OVERRIDE.antonio`) | ✅ |
| T5.6k | Antonio y Pepe v4 (16 nov, «Pepe no se parece», «también al vocalista»): rehechos desde fotos reales con la estructura de 5 hojas; las anteriores en `descartes-v2/` | ✅ |
| T5.6i | Director: Gemini dio solo 2 pasos y el agarre y el lanzamiento con la víctima en transparente (se usan otras poses). Regenerarlo sin rótulos si se quiere más animación | ⬜ opcional |
| T5.6c | Antonio v2 (11 nov 2026, el usuario: «se ven cortados y no tan coherentes»): el filtro de líneas de suelo borraba franjas del cuerpo; motas sueltas agrandaban el recorte y falseaban la escala; el cable movía el punto de apoyo; pantalón de otro color en la hoja de daño. Corregido en `scripts/slice_sheet.py` | ✅ |
| T5.6f | Proporción (15 nov, «parecen enanos»): fondos al 75 % con suelo y techo prolongados en espejo; músicos y enemigos un 12 % más grandes (~74 px de pie); retratos con el mismo encuadre y el mismo brillo de piel | ✅ |
| T5.6g | Retratos iguales (15 nov, «cómo hacer que todos sean iguales»): cabina rediseñada (retrato a todo el ancho, especial y sin cuerpo cortado) y soporte para una **hoja común con los 4 retratos** (`art/source/retratos.png`, prompt en la página del amigo) | ✅ código · ⏳ imagen del amigo |
| T5.6d | Jota: Gemini puso el nombre de otra banda en su camiseta; se borra al recortar (`remove_shirt_text`). Mejor regenerar sus hojas con «camiseta negra lisa, sin texto» | ⏳ el amigo |
| T5.6e | Dani: camisa lisa en la hoja de movimiento y de lunares en el combo (incoherencia de Gemini) | ⏳ opcional |
| T5.6b | Antonio: en `lash1`/`lash2` la punta del micro cae en la pose vecina (el cable las une). Arreglar al programar el latigazo (T8.3) o pedir la hoja con más separación | ⬜ |
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
| T8.5 | Tests y código: potenciadores temporales (amplificador, pedal, púa de la suerte) y pase de backstage; HUD con icono y barra; dibujo provisional por código (F7 aprobada el 15 nov) | ✅ `tests/game.test.js` |
| T8.6 | Hoja de objetos de Gemini (`objetos`) → sustituir los dibujos provisionales | ✅ |
| T9.1 | 3 niveles (2 oleadas + sub-jefe) y arena final (F6 v3); los bots los superan | ✅ `tests/final.test.js` · niveles de ~1 min |
| T9.2 | Tests y código: fases del Presidente, escudo, amplificadores por número de jugadores y aturdimiento (F15) | ✅ `sim/final.js` |
| T9.3 | Tests y código: rescate de compañeros en la batalla final (F16) | ✅ |
| T9.4 | Render: amplificadores apagados y encendidos, halo del escudo, avisos y «¡LEVÁNTALO!» | ✅ revisado en capturas |
| T10.1 | `scripts/cancion.py`: fragmento final de «La Torre Picasso», tempo, notas y MP3 en `src/data/cancion-final.js` | ✅ |
| T10.2 | Tests y código: `sim/ritmo.js`: ventanas de ±60 y ±120 ms, puntos, racha ×2/×3/×4, fallos, medidor PÚBLICO y fin (F17) | ✅ `tests/ritmo.test.js` |
| T10.3 | Pantalla `concierto` tras vencer al Presidente: audio con el reloj de Web Audio, autopistas por jugador, banda en el escenario, puntos sumados a los resultados; el bot toca para las pruebas | ✅ |
| T10.5 | Página aparte con solo el concierto (`concierto.html` → `dist/concierto.html`): elegir músico, tocar y resultado (pedido del 15 nov) | ✅ `tests/browser.test.js` |
| T10.6 | `cancion.py` v2: una parte por instrumento (batería, bajo, guitarra y voz), densidad creciente | ✅ `tests/ritmo.test.js` |
| T10.7 | Tests y código: partes por jugador, «¡TODOS A UNA!» y puntuación de banda | ✅ `tests/ritmo.test.js` |
| T10.8 | Render: público masivo (filas que botan, brazos, luces de móvil, confeti) y nombre del instrumento | ✅ revisado en capturas |
| T10.9 | Concierto suelto con móviles (F18): sala, QR, elección en el móvil y modo «concierto» en el mando | ✅ `tests/browser.test.js` |
| T10.10 | Modo «SOLO EL CONCIERTO» en el título del juego base (F19); los móviles cambian a los 3 botones en el concierto de ambos modos | ✅ `tests/browser.test.js` |
| T10.4 | Probar la latencia del móvil en el concierto con móviles reales | ⏳ el usuario |
| T11.1 | Tráiler de 45 s (16:9 y vertical 9:16) con escenas reales y el final de «La Torre Picasso», cortes a compás (`scripts/trailer/`) | ✅ |
| T7.4 | Publicar en `/games/arde-la-torre/` y añadir la tarjeta en `data/games.json` (`scripts/publicar.mjs`) | ✅ preparado en la rama · ⏳ llegar a `main` |
