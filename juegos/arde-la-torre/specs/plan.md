# ARDE LA TORRE — Plan técnico

> Deriva de [`spec.md`](spec.md). Cada decisión cita la funcionalidad (F) o el requisito no funcional (NFR) que atiende.

## 1. Stack

| Pieza | Decisión | Por qué |
|---|---|---|
| Motor | **Propio, en Canvas 2D**, a 384×216 lógicos con escalado entero | Igual que los otros 2 juegos del repo: mismos patrones, tests con `node --test` y sin dependencias de motor (NFR peso). Un beat 'em up no necesita físicas complejas: solo cajas de colisión y un eje Z |
| ¿Phaser? | **No.** El repo `edgaralrohe/phaser` (Phaser 4.2.1) se queda como referencia | Phaser no genera ni mejora el arte, que es el cuello de botella. Su ventaja (escenas, animaciones y cargador) la cubren ya los módulos del repo. Su lógica cuesta más de probar sin navegador |
| Conexión de los mandos | **PeerJS** (WebRTC DataChannel), usando su servidor de señalización gratuito (`0.peerjs.com`) | Coste 0 y sin servidor propio (NFR coste). El servidor solo presenta a los dos extremos; las pulsaciones viajan directas (NFR latencia) |
| QR | Generador de QR propio y pequeño (`qr.js`, modo byte y nivel M), o una librería MIT de ~10 KB incluida en el build | No depender de servicios externos para dibujar el QR |
| Tests | `node --test` para `sim/`, `input/` y `net/`, y Playwright con el Chromium preinstalado: una pantalla y 2 mandos (`devices['iPhone 13']`) | Lo mismo que en el repo |
| Build | esbuild con **2 entradas**: `dist/index.html` (juego) y `dist/mando/index.html` (mando ligero, sin arte del juego) | NFR peso del mando ≤ 300 KB |
| Arte | Gemini o ChatGPT → scripts de Python (PIL y numpy) para recortar, quitar el fondo, pixelar y empaquetar el atlas | Mismo camino que `mexico-vs-jose-madero/scripts/slice_sheet.py` |
| Audio | Web Audio: chiptune por código (secuenciador propio) y efectos sintetizados | Regla de CR: sin música con licencia (F12) |

## 2. Estructura de carpetas

```
juegos/arde-la-torre/
├── index.html            pantalla principal (desarrollo)
├── mando/index.html      página del mando (desarrollo)
├── src/
│   ├── sim/              lógica pura: sin DOM, sin Canvas, sin tiempo real
│   │   ├── world.js        tick(world, inputs[]) → world (paso fijo de 1/60 s)
│   │   ├── fighter.js      máquina de estados del luchador (jugador y enemigo)
│   │   ├── combat.js       hitbox/hurtbox, carriles, daño, caídas y agarres
│   │   ├── moves.js        datos de golpes por músico (fotogramas, cajas y daño)
│   │   ├── ai.js           turnos de ataque y comportamiento por tipo
│   │   ├── bosses.js
│   │   ├── level.js        oleadas, bloqueo de cámara y aparición de objetos
│   │   ├── items.js
│   │   ├── scaling.js      escalado por número de jugadores (F5)
│   │   └── rng.js          aleatorio con semilla (determinismo)
│   ├── input/
│   │   ├── source.js       interfaz InputSource → {x, y, golpe, salto, especial, pausa}
│   │   ├── keyboard.js     2 configuraciones en un teclado
│   │   ├── gamepad.js      Gamepad API, hasta 4
│   │   ├── remote.js       InputSource alimentado por un mando remoto
│   │   └── slots.js        asignación J1–J4, entrar y salir en caliente
│   ├── net/
│   │   ├── protocol.js     mensajes y su codificación (función pura)
│   │   ├── transport.js    interfaz, con PeerTransport y LoopbackTransport
│   │   ├── host.js         sala: código, aceptar y rechazar, latidos, reconexión
│   │   └── pad.js          lado del móvil: conexión, envío, vibración y estado
│   ├── pad-ui/           interfaz del mando: joystick, botones, selector y vida
│   ├── render/           cámara, capas de parallax, sprites, HUD y pantallas
│   ├── audio/            secuenciador de chiptune y efectos
│   ├── data/             atlas.js, levels.js, music.js (generados o editados)
│   ├── main.js           arranque de la pantalla
│   └── pad-main.js       arranque del mando
├── scripts/              build.mjs, serve.mjs, publish-web.mjs, sprites (Python)
├── art/                  PROMPTS-GEMINI.md, fuentes (hojas originales) y concepto
└── tests/
```

## 3. Simulación (F1–F8)

- **Paso fijo a 60 Hz con acumulador.** `world.js` es una función pura: misma semilla y mismas entradas dan el mismo resultado. Eso permite:
  - grabar partidas y repetirlas en los tests;
  - usar bots para ajustar la dificultad (`scripts/tune.mjs`, como en *Yo contra mi corazón*).
- **Coordenadas:** `x` (avance), `y` (profundidad, que también decide el orden de dibujo) y `z` (altura del salto). La sombra se dibuja en `(x, y)`.
- **Luchador** (`fighter.js`), con una máquina de estados común a jugadores y enemigos:
  `quieto · camina · corre · salta · golpe[n] · aereo · agarra · agarrado · lanzado · retrocede · cae · suelo · levanta · especial · muere`.
- **Golpes como datos** (`moves.js`). Cada golpe define:
  - fotogramas de arranque, activos y recuperación;
  - la caja de golpe relativa al personaje;
  - daño, empuje, si tumba y la ventana para encadenar el siguiente golpe del combo.

  Ajustar a un músico es editar una tabla, no código.
- **Colisión** (`combat.js`): hay contacto si las cajas en X y Z se solapan **y** `|Δy| ≤ 8`. Cada golpe conecta una sola vez por objetivo. Hay una pausa de impacto de 3 cuadros y una sacudida opcional (F13).
- **Turnos de ataque** (`ai.js`): cada jugador tiene 2 fichas de ataque. Un enemigo solo ataca si consigue una ficha y, al terminar, la devuelve. Los demás se colocan en semicírculo a 40–70 px.
- **Nivel** (`level.js`): lista de oleadas con `{xBloqueo, enemigos: [{tipo, lado, retraso}]}`. La cámara solo avanza y el jugador más atrasado limita el avance, con un margen de 24 px.

## 4. Entradas y jugadores (F9)

- `InputSource.read() → {x: -1..1, y: -1..1, golpe, salto, especial, pausa}`. Los botones llegan como «pulsado ahora» y «mantenido»; el «pulsado ahora» se calcula por diferencia con el tick anterior.
- **El doble toque para correr** se detecta en `sim/`, no en la entrada, para que se comporte igual con todos los mandos.
- `slots.js` asigna los huecos J1–J4 por orden de llegada. Un hueco tiene `{fuente, músico, paleta, conectado}`. Al desconectarse, `conectado = false`, y la `sim` recibe un aviso para poner al músico en «pausa invulnerable» durante 20 s (F10.5).

## 5. Mandos en el móvil (F10)

### 5.1 Conexión
1. La pantalla crea un `Peer` con el ID `arde-<código>`, donde el código tiene 4 caracteres sin letras ambiguas (sin O, 0, I ni 1). Si PeerJS responde que ese ID está ocupado, la pantalla genera otro código.
2. El QR apunta a `…/games/arde-la-torre/mando/?s=<código>`.
3. El mando se conecta directamente al ID `arde-<código>`.
4. Canal de datos con `{ordered: false, maxRetransmits: 0}` para las entradas (se envía el estado completo, así que perder un paquete no importa) y un canal fiable para unirse, elegir músico y recibir la vida.

### 5.2 Protocolo (`protocol.js`)

| Mensaje | Sentido | Contenido |
|---|---|---|
| `hola` | móvil → pantalla | versión e ID de sesión del móvil (para reconectar) |
| `bienvenido` / `llena` | pantalla → móvil | hueco J1–J4 y color |
| `elige` | móvil → pantalla | músico |
| `in` | móvil → pantalla | **3 bytes**: x e y (−127..127) y 5 bits de botones, más un número de secuencia. Se envía al cambiar y como latido cada 50 ms |
| `estado` | pantalla → móvil | vida, vidas y «en pausa» (a 4 Hz) |
| `vibra` | pantalla → móvil | duración (al golpear y al recibir daño) |

- **Latido:** si la pantalla pasa 1,5 s sin recibir nada de un móvil, lo marca como desconectado (F10.5).

### 5.3 Interfaz del mando (`pad-ui/`)
- Horizontal, con `touch-action: none`, Pointer Events y **multitoque**: joystick y botón a la vez.
- **Joystick flotante:** su centro es donde se apoya el pulgar. Tiene una zona muerta del 20 % y 8 direcciones.
- Botones de 72 px o más, con respuesta visual al instante, antes de que llegue la confirmación (NFR latencia).
- `navigator.vibrate`, si existe (en iOS no está: se ignora sin error).
- Pide **mantener la pantalla encendida** con `navigator.wakeLock`, si existe.

### 5.4 Transporte para tests
`LoopbackTransport` implementa la misma interfaz con `BroadcastChannel`. Así Playwright abre la pantalla y 2 mandos en pestañas del mismo origen **sin internet** (NFR pruebas). El parámetro `?net=loop` lo activa.

## 6. Render (F11, NFR resolución)

- Canvas de 384×216 escalado al múltiplo entero más grande que quepa en la ventana, con `image-rendering: pixelated` y franjas negras en el resto.
- **Capas por nivel:** fondo lejano (parallax 0,3), fondo (1,0), actores ordenados por `y` y primer plano (1,2; columnas o plantas).
- **Personajes:** unos 72 px de alto (un tercio de la pantalla, el tamaño típico del género) y enemigos de 64 a 80 px.
- **Paletas:** cada sprite se guarda con índices de color, y la paleta alternativa (§3.1) se aplica al construir el atlas. Así se generan las versiones 2P de cada músico sin pintar nada más.
- **HUD:** 4 esquinas con un retrato de 24×24, la vida, las vidas y los puntos.

## 7. Arte con presupuesto cero (vía A, con un experimento de la vía B)

### 7.1 Vía A: Gemini o ChatGPT (por defecto)
1. **Hoja de referencia por músico:** de frente, de lado y de 3/4, en el estilo fijado. Es la imagen que se adjunta en todas las peticiones siguientes.
2. **Hojas de animación**, una por petición: «fila de 4 fotogramas, mismo personaje, fondo verde plano, misma escala, pies en la misma línea».
3. `scripts/slice_sheet.py` (copiado y adaptado de *México vs. José Madero*) hace lo siguiente:
   - quita el fondo verde (chroma key);
   - recorta cada fotograma por componentes conectadas;
   - **alinea los pies a una línea base común**;
   - escala a 72 px de alto con vecino más próximo, después de un suavizado previo;
   - **cuantiza a una paleta fija de 16 colores por músico**;
   - añade un contorno de 1 px.

   Ese pixelado y la paleta fija igualan los fotogramas e **igualan a los 4 músicos entre sí**.
4. Se retoca a mano en Piskel o LibreSprite solo lo que tiemble.
5. **Animación limitada** (presupuesto por músico, unos 40 fotogramas):

| Animación | Fotogramas |
|---|---|
| Quieto | 2 |
| Caminar | 4 |
| Correr | 4 |
| Saltar (subir y bajar) | 2 |
| Combo de 3 golpes | 2 + 2 + 3 |
| Patada aérea | 1 |
| Agarre y lanzamiento | 1 + 3 |
| Retroceso | 1 |
| Caída, suelo y levantarse | 2 + 1 + 2 |
| Especial | 4 |
| Victoria | 2 |
| Retrato del HUD | 1 |

- **Enemigos:** unos 20 fotogramas cada uno (quieto, caminar, 1 golpe, retroceso, caída y suelo).
- **Fondos:** 1 imagen ancha por nivel, en capas. La IA los genera bien; se pixelan y se cuantizan con el mismo script (`import_backdrop.py`).

### 7.2 Vía B: 3D gratuito → sprites (experimento T0.6)
1. Imagen de un músico en pose de T hecha con IA.
2. Modelo 3D con los planes gratuitos de Meshy, Tripo o Hunyuan3D.
3. Rig y animaciones en **Mixamo**.
4. Render en **Blender** desde un lateral a 3/4, con cámara ortográfica, a 72 px y paleta fija, mediante un script de Python.

Si la coherencia compensa el trabajo técnico, se adopta para los 4 músicos.

## 8. Audio (F12)
- Secuenciador por código con 4 canales: pulso, pulso, triángulo y ruido. Las canciones se definen como patrones en `data/music.js`.
- Cada nivel tiene un tema de unos 60 s en bucle y el jefe tiene otro tema.
- El audio se desbloquea con el primer toque o la primera pulsación de la pantalla.
- **Los móviles no reproducen música**, solo vibran, para no oír 4 altavoces desincronizados.

## 9. Publicación
- `npm run publish:web` copia `dist/` a `static/games/arde-la-torre/` (con `mando/` dentro).
- La tarjeta va en `data/games.json`.
- ⏸ **No se publica** hasta que el usuario lo decida (spec §7.6).

## 10. Riesgos técnicos

| Riesgo | Mitigación |
|---|---|
| El servidor gratuito de PeerJS se cae o tiene límites, porque no hay garantías | El transporte es abstracto. El plan B también es gratuito: un `PeerServer` propio en una capa gratuita (Render o Glitch), cambiando solo la configuración |
| WebRTC no conecta en redes con NAT estricto (wifi corporativa) sin un servidor TURN, que cuesta dinero | Mensaje claro con «usa los datos del móvil» (spec §4.4), más teclado y mando físico como respaldo. En casa (la misma wifi) conecta directo casi siempre |
| Latencia de la Smart TV o el navegador de la tele | Recomendar un portátil o una tablet conectados por HDMI o enviados a la tele. La NFR se mide en Chrome de escritorio |
| Los sprites de la IA no son coherentes | Script de pixelado y paleta fija, más animación limitada, más el experimento de la vía B |
| La IA se niega a dibujar a personas reales | Describir por rasgos y estilo caricatura (los prompts ya vienen así) |
| 4 jugadores y 12 enemigos saturan la pantalla de 384×216 | Escalado de enemigos limitado a 8 en pantalla a la vez; los demás esperan su turno fuera de cuadro |
| Safari iOS suspende la pestaña del mando al bloquear | Wake Lock, más la reconexión automática con el mismo ID de sesión (F10.5) |
