# PAYASO VS. CORAZÓN — Especificación (SDD)

> Minijuego de Colores Ruidosos. Estado: **borrador para aprobar** (9 nov 2026).
> Método: Spec-Driven Development (Dominicode). No se programa hasta que el usuario apruebe esta spec.
> Hoja de concepto: [`../art/concepto/hoja-concepto.png`](../art/concepto/hoja-concepto.png).

---

## 1. Visión

Un minijuego de boxeo **al ritmo de la canción**: Pepe, disfrazado de payaso, se enfrenta en el escenario a un corazón gigante y enojado. El corazón ataca en el tiempo de la música. El jugador esquiva y, cuando el corazón queda abierto, contraataca a batazos en el beat.

- **Origen:** el performance de José Madero del fin de semana del 7 y 8 de nov de 2026, en el que salió de payaso y le pegó a un corazón.
  - ⚠️ Fecha, ciudad y concierto sin verificar: no salen en pantalla hasta tener 2 fuentes.
- **Pantalla (ficción):** «HOMENAJE NO OFICIAL · @COLORESRUIDOSOS». Es una ficción inspirada en un momento del show, no una reconstrucción del concierto.
- **Género:** boxeo de pantalla fija, con el rival de frente y el jugador de espaldas, más ritmo. Se toman las mecánicas del género, pero **ningún** nombre, sprite, sonido ni interfaz de un juego existente.
- **Objetivo de negocio:** una partida corta y muy compartible en el celular, con un resultado que se pueda presumir en Instagram, aprovechando que el momento sigue fresco.

### 1.1 Principios
1. **La música manda:** cada ataque, ventana y animación cae en el tiempo de la canción.
2. **Se lee de un vistazo:** cada ataque se avisa 1 tiempo antes con un gesto, un brillo y un sonido.
3. **Una mano, en vertical:** se juega con el pulgar.
4. **Violencia de caricatura:** sin sangre. Los golpes sueltan confeti y brillos.

## 2. Usuarios

| Usuario | Qué quiere | Qué implica |
|---|---|---|
| **Fan de José Madero** (18–35 años, celular, llega desde un reel o una historia) | Revivir el momento, reírse y compartir su resultado | Arranca en menos de 5 s, sin registro, con tarjeta de resultado |
| **Jugador casual** | Entender sin tutorial largo | Primer ataque lento, más un tutorial de 3 pasos dentro de la canción |
| **Equipo de CR** | Contenido para reels y para la web | Modo grabación sin HUD (P2) y publicación en `/games/` |

## 3. Funcionalidades

**Prioridades:** P0 es el MVP, P1 viene después y P2 es deseable.

### 3.0 La canción
| Dato | Valor | Fuente |
|---|---|---|
| Canción | «Teoremas, etc.» (José Madero) | Archivo que dio el usuario |
| Duración | 3:46,6 | `ffprobe` |
| Tempo | **168 BPM** (84 a medio tiempo). Primer pulso a ~0,387 s | Medido por análisis de onsets (`scripts/beatmap.py`); hay que confirmarlo a oído |

**Secciones** (medidas por energía; hay que confirmarlas a oído y ajustar a compases):

| Tramo | Energía | Uso en el juego |
|---|---|---|
| 0:00–0:06 | Intro baja | Entrada al escenario y «¡A ESCENA!» |
| 0:06–0:36 | Media | **Fase 1 · Enojado** (incluye el tutorial) |
| 0:36–0:56 | Baja | Respiro: el corazón provoca y caen pocos ataques |
| 0:56–1:52 | Alta | Fase 1 → **Fase 2 · Parchado** (cambia a la 1:12 o al vaciar la primera barra) |
| 1:52–2:12 | Media-baja | Respiro y «el público pide más» (se carga el Grito) |
| 2:12–3:40 | Alta | **Fase 3 · Roto** (el corazón se parte en dos mitades) |
| 3:40–3:46 | Cierre | K.O. o decisión del público, y pantalla de resultado |

### 3.1 Funcionalidades P0 (MVP)

**F1 Controles táctiles (vertical).**
- Deslizar a la izquierda o a la derecha: **esquivar**.
- Deslizar hacia abajo: **agacharse**.
- Tocar: **batazo**.
- Botón de micrófono (abajo a la derecha, solo con el público lleno): **Grito**.
- En PC: ← → ↓ para moverse, Espacio para el batazo y M para el Grito.

**F2 Reloj de ritmo.** El tiempo del juego se toma del reloj de audio, no del reloj de cuadros.

**F3 Juicio de tiempo.**
- **Perfecto:** ±70 ms.
- **Bien:** ±140 ms.
- **Fuera:** cualquier otra cosa.
- Se aplica a las esquivas y a los batazos.

**F4 Ataques del corazón.** Todos se avisan 1 tiempo antes (≈357 ms a 168 BPM, o 2 tiempos en la fase 1).

| Ataque | Aviso | Cómo se evita | Fase |
|---|---|---|---|
| **Gancho izquierdo / derecho** | Echa el puño atrás de ese lado y brilla en amarillo | Esquivar al lado contrario | 1, 2 y 3 |
| **Latido** (onda a la altura del pecho) | Se infla y las venas pulsan | Agacharse | 1, 2 y 3 |
| **Aortazo** (latigazo con la aorta desde arriba) | La aorta se enrosca | Esquivar a cualquier lado | 2 y 3 |
| **Ráfaga** (3 golpes en corcheas) | Doble brillo | Tres esquivas en el tiempo | 2 y 3 |
| **Finta** | Brilla, pero no ataca | No moverse (si esquivas antes de tiempo, pierdes la racha) | 2 y 3 |
| **Mitades** | Cada mitad avisa por su lado | Alternar la esquiva | 3 |

**F5 Contraataque.**
- Una esquiva Perfecta o Bien deja al corazón **abierto** 2 tiempos.
- Cada batazo en el tiempo durante esa ventana hace daño completo; fuera de tiempo hace la mitad.
- Fuera de la ventana el batazo rebota: no hace daño y rompe la racha.

**F6 Público y Grito.**
- Las 5 estrellas del público se llenan con los Perfectos y la racha.
- Llenas, se habilita el Grito: aturde al corazón 4 tiempos y cada batazo hace el triple de daño.

**F7 Vida y final.**
- El payaso tiene 100 puntos de vida y cada golpe recibido le quita 15. Si llega a 0: «SE ACABÓ EL SHOW» y Reintentar.
- El corazón tiene una barra por fase.
- **K.O.:** vaciar la barra de la fase 3 antes de que termine la canción.
- Si termina la canción sin K.O., gana por **decisión del público** si el público está a 3 estrellas o más.

**F8 Puntuación y rango.**
- Puntos por Perfecto, Bien, daño, racha y K.O.
- Rangos: «Telonero», «Acto principal», «Ovación de pie» y «Leyenda del circo».

**F9 Pantallas.**
1. Título, con «Toca para empezar»; ese toque también desbloquea el audio en iOS.
2. Cómo se juega: 3 dibujos (deslizar, agacharse, tocar) que se pueden saltar.
3. Partida.
4. Resultado: rango, puntos, Perfectos, K.O. o decisión, y los botones Reintentar y Compartir.

**F10 Compartir.** Genera una tarjeta PNG de 1080×1920 con el payaso, el rango y los puntos, y la comparte con la Web Share API; si no está disponible, la descarga.

**F11 Opciones.**
- Sin destellos (el brillo del aviso se cambia por un contorno fijo).
- Modo asistido: ventanas el doble de anchas y el payaso no pierde.
- Vibración.
- Volumen.
- Desfase de audio, en ms.
- Todo se guarda en `localStorage` (`pvc-save`).

**F12 Pausa automática** al cambiar de app (`visibilitychange`). Al volver, cuenta regresiva de 3 tiempos.

### 3.2 Funcionalidades P1 y P2
- **P1 · Calibración:** tocar en 8 tiempos para medir la latencia del celular.
- **P1 · Récord local** y mejor rango.
- **P1 · Traje «Payaso» desbloqueable** en *México vs. José Madero* (galería de trajes) al ganar aquí.
- **P2 · Modo reel:** un tramo de 60 s (2:12–3:12) sin HUD, para grabar.
- **P2 · Modo difícil:** avisos de medio tiempo.

### 3.3 Fuera de alcance
Multijugador, tabla de récords en línea, otras canciones y monetización.

## 4. Flujos

### 4.1 Flujo principal
```
Título ──toque──▶ ¿Primera vez? ──sí──▶ Cómo se juega ──▶ Partida
                         └──no─────────────────────────▶ Partida
Partida ──vida 0──▶ SE ACABÓ EL SHOW ──▶ Reintentar | Título
Partida ──K.O. / fin de canción──▶ Resultado ──▶ Compartir | Reintentar | Título
```

### 4.2 Un intercambio (el bucle del juego)
1. Tiempo N−1: el corazón avisa (pose de aviso, brillo y sonido).
2. Tiempo N: el golpe llega.
   - Si esquivaste bien, se juzga Perfecto o Bien y el corazón queda abierto 2 tiempos.
   - Si no, el payaso recibe el golpe: tiembla, pierde vida y la racha vuelve a 0.
3. Tiempos N+1 y N+2: batazos en el tiempo y confeti, que restan vida al corazón.
4. El corazón vuelve a la guardia y sigue la secuencia de la fase.

### 4.3 Cambio de fase
La barra de la fase se vacía o llega el compás de cambio. El corazón se tambalea 2 tiempos, sale el letrero «¡FASE 2!» o «¡FASE 3!» y cambia de sprite (curitas, o la grieta y las mitades).

### 4.4 Casos borde
| Caso | Comportamiento |
|---|---|
| Audio bloqueado (iOS) | No arranca hasta un toque. Se muestra «Toca para empezar» |
| Pestaña en segundo plano | Pausa automática. Al volver, cuenta de 3 tiempos |
| Celular en horizontal | Aviso «Gira tu celular», salvo en PC |
| Toque y deslizamiento ambiguos | Desplazamiento de 24 px o más = deslizar; menos, en menos de 200 ms = tocar |
| Dos gestos en el mismo tiempo | Cuenta el primero |
| La canción no carga | Mensaje con Reintentar; el juego no arranca sin audio |

## 5. Arquitectura

Juego independiente en `juegos/payaso-vs-corazon/`, con el mismo enfoque que *México vs. José Madero*: motor propio sin dependencias en tiempo de ejecución, `node --test`, esbuild y Playwright.

```
juegos/payaso-vs-corazon/
  specs/            spec.md · plan.md · tasks.md
  art/concepto/     hoja de concepto
  scripts/          beatmap.py (canción → tiempos y secciones) · hoja_concepto.py · build.mjs · publish-web.mjs
  src/
    core/   clock.js (tiempo de audio → tiempo) · judge.js (ventanas) · rng.js (semilla)
    input/  gestures.js (toque, deslizamiento y teclado → acciones)
    game/   heart.js (máquina de estados y patrones por fase) · clown.js · match.js (vida, público, puntos y fin)
    data/   beatmap.js (generado) · patterns.js (secuencias de ataques por sección) · textos.js
    render/ sprites.js (sprites por código, como la hoja) · stage.js · hud.js · screens.js · font.js (5×7, compartida)
    audio/  player.js (Web Audio: carga, desbloqueo y desfase) · sfx.js (efectos chiptune por código)
    share/  card.js (tarjeta de 1080×1920)
  tests/    unidad · bots · navegador
```

- **Lógica pura:** `core/` y `game/` no tocan el DOM: reciben `(tiempo, acciones)` y devuelven el estado. Así se prueban sin navegador y con bots.
- **Datos:** la canción no se analiza en el celular. `beatmap.py` genera `beatmap.js` una sola vez y la secuencia de ataques es determinista (misma semilla, misma partida).
- **Resolución:** 180×320 lógicos, escalados por enteros, con *letterbox* y `image-rendering: pixelated`.
- **Salida:** `dist/index.html` (código y sprites) más la canción en un archivo aparte, para poder cambiar el audio sin recompilar.

## 6. Requisitos no funcionales

| NFR | Meta |
|---|---|
| Rendimiento | 60 fps en un Android de gama media (Moto G de 2023) y en un iPhone 11 |
| Sincronía | Error entre el beat y la animación < 1 cuadro. Se usa `AudioContext.currentTime` más `outputLatency` y el desfase del usuario |
| Peso | HTML de 300 KB o menos sin la canción. La canción como MP3 de 128 kbps (~3,6 MB), cargada con barra de progreso |
| Arranque | Jugable en 5 s o menos con 4G |
| Compatibilidad | Safari iOS 16 o más reciente, Chrome Android 110 o más reciente, y escritorio |
| Accesibilidad | Sin destellos, modo asistido, botones de 44 px o más y textos de 7 px lógicos (21 px reales) o más |
| Pruebas | Todo el `core/` y el `game/` con tests; un bot que gana la partida completa; Playwright con un iPhone emulado |
| Privacidad | Sin analítica ni cookies. Solo `localStorage` |

### 6.1 Legal y ética (riesgos que el usuario debe aceptar)

| Tema | Riesgo | Propuesta |
|---|---|---|
| **Canción original** | **Contradice la regla del proyecto** («ni música ni letras sin licencia», `CONTEXTO.md` §1). Publicar el MP3 en un sitio público es distribuir la grabación | El MP3 **no se sube al repo** (`.gitignore`). Para publicar en la web hay 3 opciones: **A)** pedir permiso al equipo de Madero; **B)** un chiptune original al mismo tempo y con la misma estructura, de modo que el mapa de ataques sirva igual; **C)** riesgo aceptado por el usuario y anotado aquí. ⏳ **Decide el usuario** |
| Imagen de José Madero | Pepe de payaso es una caricatura, como en el juego principal | Rótulo de homenaje no oficial y sin su nombre en el título del minijuego |
| Corazón | La referencia recuerda a un personaje de dibujos animados con derechos | Diseño propio: corazón anatómico con aorta y venas. No es una botarga peluda |
| Bate con clavos | Violencia | Sin sangre: confeti y brillos. ⏳ Que el usuario confirme si quiere los clavos o un bate liso |

## 7. Preguntas abiertas
1. **Canción en la web pública:** ¿opción A, B o C (§6.1)?
2. **Duración:** ¿canción completa (3:46) como modo principal, o el modo reel de 60 s como principal y la canción completa como «Concierto completo»?
3. **Bate:** ¿con clavos o liso?
4. **Nombre:** «Payaso vs. Corazón» (provisional). Otras opciones: «Teoremas a batazos» o «El show del corazón».
