# ARDE LA TORRE (título provisional) — Especificación (SDD)

> Juego de Colores Ruidosos. Estado: **aprobada; en desarrollo (v0.1)** (11 nov 2026).
> Método: Spec-Driven Development (Dominicode, Bezael Pérez).
>
> **Decisiones del usuario (10 nov 2026):**
> - beat 'em up con scroll lateral para hasta 4 jugadores;
> - presupuesto cero;
> - sprites hechos con Gemini o ChatGPT;
> - **sin online**: una pantalla compartida y **los móviles como mandos** escaneando un QR, como los juegos de Netflix en la tele.
>
> **Decisiones del 11 nov 2026** (el usuario pidió «definir todo eso» y reducir el juego a 4–5 niveles; ver §7):
> - nombre provisional «Arde la Torre»;
> - villano: «Silencio S.A.»;
> - **5 niveles**;
> - los 4 músicos jugables desde la v0.1, con arte provisional dibujado por código. El arte final llega primero para Antonio y Pepe;
> - prototipo antes de contactar a la banda, y **sin publicar** en la web de CR hasta tener su respuesta.

---

## 1. Visión

Los cuatro miembros de **Arde Bogotá** tienen que subir la **Torre Picasso** (Madrid), planta a planta y a golpes, para llegar a la azotea y dar el concierto que alguien quiere silenciar. Es un beat 'em up cooperativo de scroll lateral con profundidad: se avanza hacia la derecha y uno se mueve arriba y abajo por el suelo. Se juega en una tele, portátil o tablet; cada jugador usa su teléfono como mando.

- **Pantalla (ficción):** «HOMENAJE NO OFICIAL · @COLORESRUIDOSOS».
  - La historia, los enemigos y los interiores de la torre son ficción.
  - Solo el exterior y los datos del edificio son reales.
- **Género y estética:** beat 'em up arcade de finales de los 80 y principios de los 90, con pixel art de sprites grandes, contorno grueso y colores saturados.
  - Se toman las **mecánicas y el estilo** del género: combos, agarres, armas del suelo, oleadas que bloquean la cámara y jefes.
  - **No** se toma ningún nombre, sprite, sonido, logo ni interfaz de *Double Dragon*, *Captain Commando*, *Fatal Fury*, *Scott Pilgrim* ni *TMNT*.
- **Objetivo:** un juego para **jugar en grupo en la misma sala**, en casa, en una previa o en un evento de la banda, que arranque en segundos y sin instalar nada.

### 1.1 Datos reales (verificados con 2 fuentes o más)

| Dato | Valor | Fuentes |
|---|---|---|
| Banda | Arde Bogotá, de Cartagena (Murcia), formada en 2017 | Wikipedia, buenamusica.com |
| Antonio García | Voz y guitarra | Wikipedia, mdwiki, buenamusica.com |
| Dani Sánchez | Guitarra | ídem |
| Pepe Esteban | Bajo | ídem |
| José Ángel Mercader («Jota») | Batería y percusión | ídem |
| Torre Picasso | 157 m. Arquitecto: Minoru Yamasaki. Abrió en 1988. Fue el edificio más alto de Madrid entre 1988 y 2007 | Wikipedia (en), arquitecturaviva.com, esmadrid.com |
| Plantas | ⚠️ **43 plantas y 5 sótanos** según la mayoría de fuentes; eldiario.es y todosobremadrid.com dicen 45. **No sale en pantalla hasta resolverlo** | Wikipedia, vallemadrid.blogspot.com · discrepan: eldiario.es, todosobremadrid.com |

### 1.2 Principios
1. **Se entiende en 10 segundos:** escaneas, eliges músico y pegas. Tres botones nada más.
2. **Mejor en grupo:** el juego escala con el número de jugadores y nadie se queda fuera si muere: reaparece.
3. **Cero euros:** herramientas gratuitas, alojamiento en GitHub Pages y ningún servidor propio.
4. **Violencia de caricatura:** sin sangre. Los golpes sueltan chispas, notas musicales y estrellas.
5. **Datos reales verificados**, ficción marcada como ficción (regla de Colores Ruidosos).

## 2. Usuarios

| Usuario | Qué quiere | Qué implica |
|---|---|---|
| **Grupo de fans** (2–4 personas, 16–35 años, en un salón o en una previa) | Jugar juntos ya, cada uno con su músico favorito | Unirse con un QR en menos de 15 s y sin instalar nada. Cualquiera puede entrar o salir a mitad de partida |
| **Anfitrión** (pone la pantalla) | Que funcione en la tele o el portátil que tenga | Navegador de escritorio, tablet o Smart TV con navegador. Pantalla completa y la sala visible con letra grande |
| **Jugador en solitario** | Probarlo sin amigos | 1 jugador con teclado, mando o pantalla táctil |
| **Equipo de CR** | Contenido para reels y publicarlo en la web | Modo grabación sin HUD (P2) y publicación en `/games/arde-la-torre/` |
| **La banda** (posible) | Ver un homenaje digno | Arte cuidado, sin ridiculizar a nadie y con la puerta abierta a una colaboración oficial |

## 3. Funcionalidades

**Prioridades:** P0 es el MVP, P1 viene después y P2 es deseable.

### 3.1 Personajes jugables (v2, propuesta del 11 nov 2026 · ⏳ pendiente de aprobación)

Cada músico se reconoce por **su instrumento como arma**, una **habilidad pasiva** que cambia la forma de jugarlo, un **especial** (cuesta un 8 % de vida, como en el género) y un **SÚPER** que se carga con la barra de VOLUMEN (F14). Los cuatro comparten los controles básicos (combo, salto, patada aérea, carrera, agarre y lanzamiento).

| | **Antonio** | **Pepe** | **Dani** | **Jota** |
|---|---|---|---|---|
| Papel en la banda | Voz y guitarra | Bajo | Guitarra | Batería |
| Apodo en el juego | **El Frontman** | **El Muro** | **El Relámpago** | **El Metrónomo** |
| Estilo | Equilibrado y de apoyo | Lento, fuerte y difícil de tumbar | Rapidísimo, combos largos | Alcance medio y ritmo |
| Fuerza · Velocidad · Alcance · Agarres · Vida (1–5) | 3 · 3 · 3 · 3 · 3 | 5 · 1 · 3 · 5 · 5 | 2 · 5 · 2 · 2 · 2 | 3 · 3 · 4 · 2 · 3 |
| Combo (golpe ×N) | 3: directo, gancho y **guitarrazo** | 3: codazo, rodilla y **bajazo** de arriba abajo | 4: dos golpes rápidos, patada y **barrido con la guitarra** | 3: dos **baquetazos** y un doble golpe con ambas baquetas |
| **Pasiva** | **Carisma**: los compañeros cerca de él (a menos de 80 px) cargan el VOLUMEN un 25 % más rápido | **Aguante**: el primer golpe que recibe cada 3 s no lo interrumpe (solo pierde vida) | **Doble salto** y su carrera esquiva los proyectiles | **A tempo**: el golpe que cae en el pulso de la música hace +50 % de daño y suelta una nota (se ve un marcador en el HUD) |
| Golpe de firma (atrás + golpe) | **Latigazo de micro**: lanza el micro por el cable y **atrae** al enemigo hacia él | **Placaje**: carga corta que arrastra a todos los que encuentra | **Deslizamiento** por el suelo que derriba y pasa por debajo de los proyectiles | **Baqueta voladora**: lanza una baqueta que vuelve, como un bumerán |
| **Especial** (especial, o golpe + salto) | **Grito**: onda larga delante que tumba | **Golpe de bajo al suelo**: onda a los dos lados | **Solo**: giro con la guitarra que golpea alrededor varias veces | **Redoble**: ráfaga de golpes delante |
| **SÚPER** (especial con la barra llena) | **Himno**: el público corea; aturde a todos los enemigos de la pantalla 2 s y les hace daño | **Terremoto de graves**: tumba a todos los enemigos que estén en el suelo | **Solo eterno**: durante 3 s dispara notas-relámpago por su carril | **Solo de batería**: aparece una batería; cada golpe de bombo lanza una onda a los dos lados durante 3 s |

- Cada músico es una **caricatura reconocible y respetuosa**, sin exagerar rasgos físicos para burlarse.
- Si dos jugadores eligen al mismo músico, el segundo sale con **otra paleta** (la ropa alternativa de las fotos de prensa, `art/PROMPTS-GEMINI.md` §2).
- **Acorde** (P1, se mantiene): si dos o más jugadores lanzan su SÚPER con menos de 1 s de diferencia, el daño de todos se multiplica por 1,5 y la pantalla muestra «¡ACORDE!».
- Los números (alcances, daños y tiempos) viven en `src/sim/moves.js` y se ajustan con los bots (`npm run tune`), como hasta ahora.

### 3.2 Funcionalidades P0 (MVP)

**F1 Movimiento en profundidad.**
- Moverse en 8 direcciones por un suelo con profundidad: X avanza y Y cambia de carril.
- Salto con altura Z.
- Doble toque adelante para **correr**.

**F2 Combate básico.**
- **Golpe:** combo de 3 golpes; el último tumba.
- **Salto + golpe:** patada aérea.
- **Correr + golpe:** embestida.
- **Agarre:** al caminar contra un enemigo (que no sea jefe) durante un instante se le agarra. Desde ahí, golpe para darle rodillazos y adelante + golpe para lanzarlo. **El lanzado daña a otros enemigos.**
- **Especial** (F3).
- Los golpes solo conectan si atacante y objetivo están en el mismo carril, con un margen de ±8 px en Y (regla del género).

**F3 Especial.** Con el botón Especial (o golpe + salto a la vez en el teclado) el músico es invulnerable mientras dura y golpea alrededor. Cuesta un 8 % de vida, pero nunca deja al jugador por debajo de 1 punto.

**F4 Recibir daño.** Hay tres reacciones:
- **retroceso** con un golpe normal;
- **caída** con el último golpe de un combo, un lanzamiento o el especial de un enemigo;
- **levantarse** con 1 s de invulnerabilidad parpadeando, sin destellos fuertes (NFR accesibilidad).

**F5 Enemigos** (ficción: los empleados de **«Silencio S.A.»**, una empresa genérica e inventada que quiere apagar el concierto).

| Enemigo | Comportamiento | MVP |
|---|---|---|
| **Becario** | Débil; golpe simple | P0 |
| **Comercial** | Corre hacia ti y te embiste | P0 |
| **Guardia** | Se cubre de frente. Hay que agarrarlo, atacarlo por la espalda o en el aire, o romperle la guardia (tras 3 bloqueos seguidos, el siguiente golpe entra) | P0 |
| **Contable** | Lanza grapas desde lejos (proyectil en el carril) | P0 |
| **Ejecutiva** | Agarra y lanza | P0 |

- **Turnos de ataque:** como mucho, 2 enemigos atacan a la vez a cada jugador; los demás rodean. Así es justo y se lee bien.
- **Escalado:** el número y la vida de los enemigos crecen con los jugadores (1 jugador: ×1, 2: ×1,5, 3: ×2, 4: ×2,5).

**F6 Plantas (niveles).** Hay **5 niveles** (decisión del 11 nov 2026). Cada uno es un tramo de la torre, con **scroll que se bloquea por oleadas** (aparece «¡ADELANTE! →» al limpiar) y un **jefe** al final.

| Nivel | Lugar (ficción) | Jefe |
|---|---|---|
| 1 | **Parking subterráneo**: coches, columnas y barreras | **El Jefe de Seguridad**: embiste y llama a 2 becarios a los 2/3 y a 1/3 de su vida |
| 2 | **Vestíbulo**: tornos de acceso, mostrador y escaleras mecánicas | **La Recepcionista**: lanza teléfonos por el carril y llama a comerciales |
| 3 | **Ascensor**: pantalla fija mientras sube; los enemigos entran en cada parada | **El Técnico de Mantenimiento**: embiste con la caja de herramientas |
| 4 | **Oficinas diáfanas**: mesas, impresoras y fuentes de agua | **El Director Comercial**: embiste, agarra y lanza, y llama a ejecutivas |
| 5 | **Azotea**: el escenario del concierto con Madrid de noche al fondo | **El Presidente de Silencio S.A.** (jefe final): mezcla de todo, más rápido |

- El número de planta solo sale en pantalla cuando se confirme la cifra (§1.1).
- Los jefes comparten un mismo motor de comportamiento con 3 ataques (embestir, lanzar y llamar refuerzos) que se combinan por jefe.

**F7 Objetos y potenciadores** (v2, propuesta ⏳). Salen de cajas, papeleras y máquinas de vending rotas, o los suelta un enemigo especial al caer.

| Objeto | Efecto | Duración |
|---|---|---|
| **Bocadillo de calamares** | +30 % de vida | — |
| **Café** | +10 % de vida | — |
| **Púa dorada** | +1000 puntos | — |
| **Setlist** | Llena la barra de VOLUMEN | — |
| **Amplificador portátil** | Golpes con +50 % de daño y chispas más grandes | 15 s |
| **Pedal de distorsión** | Cada golpe suelta una onda corta (+20 px de alcance) | 12 s |
| **Púa de la suerte** | Invulnerable (parpadeo dorado lento, sin destellos) | 6 s |
| **Pase de backstage** | +1 vida (muy raro: uno por nivel) | — |

**Armas del suelo** (5 usos; sustituyen al combo): grapadora, extintor, silla de oficina y **pie de micro** (el de más alcance).

- Solo un potenciador temporal a la vez por jugador; coger otro sustituye al anterior.
- El HUD muestra el icono del potenciador activo con una barra de tiempo.

**F8 Vidas y reaparición.**
- Cada jugador empieza con 3 vidas y reaparece cayendo del techo.
- Con 0 vidas, puede volver con un toque en «CONTINUAR» de su mando durante 10 s, mientras quede alguien vivo.
- La partida termina si caen todos.

**F9 Hasta 4 jugadores locales** con cualquier mezcla de mandos:

| Entrada | Detalle |
|---|---|
| Teclado | 2 jugadores en un mismo teclado. J1: WASD + F (golpe), G (salto), H (especial). J2: flechas + 1, 2, 3 del teclado numérico (o K, L, Ñ) |
| Mando físico | Hasta 4 mandos (Gamepad API) por USB o Bluetooth |
| **Móvil como mando** | F10 |
| Táctil en la propia pantalla | 1 jugador en tablet o móvil: joystick y botones encima del juego (adelantado a P0 el 11 nov 2026) |

**F10 Móviles como mandos (QR).** La pieza clave del proyecto:
1. La pantalla principal muestra un **código QR** y un **código de sala corto** de 4 caracteres, por ejemplo `K7QP`.
2. El jugador escanea el QR o abre `coloresruidosos.github.io/games/arde-la-torre/mando` y escribe el código.
3. En el móvil aparece el **selector de músico**; en la pantalla principal, el mismo selector con el color de cada jugador.
4. El móvil pasa a ser un **mando en horizontal**:
   - joystick virtual a la izquierda;
   - **GOLPE**, **SALTO** y **ESPECIAL** a la derecha;
   - pausa arriba;
   - **vibración** al golpear y al recibir daño, si el móvil lo permite;
   - la barra de vida del jugador, para no tener que buscarla en la pantalla.
5. **Entrar y salir en caliente:** un móvil nuevo puede unirse a mitad del nivel y aparece al lado del grupo. Si un móvil se desconecta, su músico se queda quieto e invulnerable durante 20 s mientras el mando intenta reconectarse solo; después sale de la partida.
6. Después de la conexión inicial, solo viajan pulsaciones: unos pocos bytes y **sin vídeo**. El juego corre únicamente en la pantalla principal.

**F11 Pantallas.**
- Título con «HOMENAJE NO OFICIAL · @COLORESRUIDOSOS».
- Sala: QR, jugadores conectados y «Pulsa GOLPE para empezar».
- **Selección de músico: los cuatro ascensores** (11 nov 2026, pedido del usuario: «estilo de pantalla de selección con cabinas»). Cada hueco es un ascensor con su indicador J1–J4; al unirse un jugador, se abren las puertas con franja de peligro y aparece su músico con retrato grande, estadísticas (fuerza, velocidad y vida) y cuerpo entero. Al marcar listo, el indicador se pone verde. Se toma la idea de las cabinas que se abren, **no** el aspecto de ningún juego concreto.
- Introducción del nivel en 1 viñeta con texto.
- HUD: una tarjeta por jugador en la fila de arriba (retrato, vida, vidas y puntos) y la barra del jefe abajo.
- Pausa, Fin del juego y resultado: puntos por jugador, más enemigos tumbados y «más bocadillos comidos» como premios divertidos.

**F12 Audio.**
- Chiptunes **originales** hechos por código, uno por nivel y otro para el jefe, más efectos de sonido sintetizados.
- **Sin canciones de Arde Bogotá** salvo permiso de la banda o de su sello (§6.1).

**F13 Opciones.** Volumen, sacudida de pantalla, modo asistido (enemigos con −30 % de daño y vida infinita) y reducción de destellos. Se guardan en `localStorage`.

**F14 Barra de VOLUMEN y SÚPER** (v2, propuesta ⏳). Cada jugador tiene una barra de VOLUMEN en su tarjeta del HUD.
- **Se carga** golpeando (+1 por golpe que conecta), tumbando (+4) y recibiendo daño (+2), con un máximo de 100. Carisma de Antonio y el Setlist la cargan más rápido.
- **Llena**, la tarjeta brilla (sin destellos) y el siguiente **ESPECIAL** lanza el **SÚPER**: no cuesta vida, es invulnerable y vacía la barra.
- En el móvil, el botón ESPECIAL cambia a «SÚPER» y vibra cuando la barra está llena.

### 3.3 Funcionalidades P1 y P2
- **P1:**
  - Arte final de Dani, Jota, los enemigos y los niveles 3–5.
  - Táctil en la propia pantalla.
  - **Ataque combinado**: si dos jugadores lanzan el especial a la vez cerca, sale un «acorde» con más daño.
- **P2:**
  - Modo grabación sin HUD para los reels.
  - Ranking local de la sesión.
  - Escena final en la azotea al ritmo de un chiptune.

### 3.4 Fuera de alcance
- **Online a distancia** (cada uno en su casa): descartado por el usuario el 10 nov 2026.
- Cada jugador viendo el juego en su propio móvil.
- Tiendas de apps (iOS o Android), versión nativa de Smart TV o consolas.
- Cuentas, inicio de sesión, compras y anuncios.

## 4. Flujos

### 4.1 Flujo principal (2–4 personas)
1. El anfitrión abre el juego en la pantalla grande y pulsa «JUGAR EN GRUPO». Aparecen el QR y el código.
2. Cada persona escanea con su móvil; se abre la web del mando, que **ya lleva el código** dentro del QR.
3. El móvil se conecta: aparece «J2 conectado» en la pantalla y el móvil vibra.
4. Cada uno elige músico en su móvil.
5. Cualquiera pulsa GOLPE para empezar.
6. Se juega el nivel por oleadas, luego llega el jefe y sale la pantalla de nivel superado.
7. El juego pasa al siguiente nivel con una viñeta.
8. Al final (o con el Fin del juego), los puntos y los premios.
9. «Otra vez» vuelve al paso 4 sin reconectar.

### 4.2 Flujo en solitario
Pulsar «JUGAR» con el teclado, el mando o la pantalla táctil lleva directamente a la selección de músico, sin QR.

### 4.3 Flujo de un combate (el bucle del juego)
1. Aparece una oleada y la cámara se bloquea.
2. Los enemigos reparten los turnos de ataque.
3. Los jugadores hacen combos, agarran, lanzan y usan armas.
4. La oleada queda vacía y sale «¡ADELANTE! →»; la cámara se libera.
5. Se repite hasta llegar al jefe.

### 4.4 Casos borde

| Caso | Qué pasa |
|---|---|
| El móvil se bloquea o cambia de app | El mando avisa con «Reconectando…» y se reconecta solo al volver; el músico queda en pausa (F10.5) |
| La pantalla principal se recarga | Los mandos muestran «Sala cerrada» y un botón para volver a escanear |
| Llega un 5.º jugador | El mando dice «Sala llena (4/4)» |
| La red bloquea WebRTC (wifi corporativa o de hotel) | Tras 10 s el mando dice «No se pudo conectar: prueba con los datos del móvil». La pantalla ofrece jugar con teclado o mando |
| Sin internet | Solo funcionan el teclado, los mandos físicos y el táctil (el QR necesita internet para la conexión inicial) |
| Dos jugadores eligen el mismo músico | El segundo sale con otra paleta (§3.1) |
| Todos sin vidas | Fin del juego, con 10 s para continuar |
| Pestaña de la pantalla en segundo plano | Pausa automática (`visibilitychange`) |
| Mando físico y móvil a la vez | Cada dispositivo es un jugador distinto. El orden de llegada decide J1–J4 |

## 5. Arquitectura

```
┌─────────────────── PANTALLA PRINCIPAL (navegador) ───────────────────┐
│                                                                       │
│  input/            sim/ (lógica pura, determinista, 60 Hz)    render/ │
│  ┌──────────┐     ┌──────────────────────────────────────┐  ┌───────┐ │
│  │ teclado  │──┐  │ mundo: jugadores, enemigos, objetos  │  │Canvas │ │
│  │ gamepad  │──┼─▶│ combate: hitbox/hurtbox, carriles    │─▶│2D     │ │
│  │ remoto ◀─┼──┘  │ IA: turnos de ataque, jefes          │  │384×216│ │
│  └────▲─────┘     │ nivel: oleadas, cámara, scroll       │  │×5=1080p│ │
│       │           └──────────────────────────────────────┘  └───────┘ │
│  net/host.js  (sala, códigos, jugadores J1–J4)        audio/ (chiptune)│
└───────▲───────────────────────────────────────────────────────────────┘
        │ WebRTC DataChannel (PeerJS; su servidor gratuito solo presenta
        │ a los dos extremos, y después la conexión va directa)
┌───────┴──────────── MÓVIL (página /mando) ────────────┐
│ net/pad.js → joystick + 3 botones → {ejes, botones}   │
│ recibe: vida, color, vibración                        │
└───────────────────────────────────────────────────────┘
```

- **Principio clave:** la simulación (`sim/`) **no sabe de dónde vienen las entradas**. Cada jugador es un `InputSource` que da `{x, y, golpe, salto, especial}` en cada tick. El teclado, el mando físico y el móvil son intercambiables, y los tests pueden inyectar entradas grabadas o bots.
- **Motor propio en Canvas 2D**, igual que *México vs. José Madero* y *Yo contra mi corazón*. Por qué no Phaser: [`plan.md`](plan.md) §1.
- **Transporte abstracto:** `PeerTransport` en producción y `LoopbackTransport` (con `BroadcastChannel`) en desarrollo y tests, para probar los mandos sin internet.
- **Arte:** hojas de Gemini o ChatGPT → recorte y pixelado por script → atlas. Detalle en [`plan.md`](plan.md) §7 y prompts en [`../art/PROMPTS-GEMINI.md`](../art/PROMPTS-GEMINI.md).

## 6. Requisitos no funcionales

| NFR | Meta |
|---|---|
| Rendimiento | 60 fps estables con 4 jugadores y 8 enemigos en un portátil de gama media (Intel i5 de 2019) y en un iPad de 9.ª generación |
| Latencia del mando | Pulsación en el móvil → reacción en pantalla ≤ 80 ms en la misma wifi (meta: 30–50 ms) |
| Unirse | Del escaneo a «conectado» ≤ 5 s con una wifi o 4G normales |
| Resolución | 384×216 lógicos con escalado entero: ×5 = 1920×1080 y ×10 = 4K. Se ve nítido en cualquier tele: **es el «HD» del proyecto** |
| Peso | Juego ≤ 3 MB y mando ≤ 300 KB, para que cargue rápido en el móvil tras escanear |
| Coste | **0 €**: GitHub Pages, la nube gratuita de PeerJS y herramientas gratuitas |
| Compatibilidad | Pantalla: Chrome, Edge, Firefox o Safari recientes en escritorio y tablet. Mando: Safari iOS 16+ y Chrome Android 110+ |
| Accesibilidad | Destellos < 3 Hz y desactivables; modo asistido; botones táctiles ≥ 56 px; textos legibles a 3 m en la tele (fuente de 7 px lógicos = 35 px reales en 1080p) |
| Pruebas | Toda la `sim/` con tests; bots que superan cada nivel con 1 y con 4 jugadores; Playwright con una pantalla y 2 mandos emulados (`LoopbackTransport`) |
| Privacidad | Sin analítica, cookies ni cuentas. Los móviles solo se conocen por un ID aleatorio de la sesión |

### 6.1 Legal y ética (riesgos que el usuario debe aceptar)

| Tema | Riesgo | Propuesta |
|---|---|---|
| **Nombre e imagen de la banda** | Usar a 4 personas reales y su marca | Rótulo de homenaje no oficial. Caricaturas respetuosas. ⏳ **Muy recomendable: escribir a la banda o a su management** antes de publicarlo. Puede acabar en colaboración (y en permiso para su música) |
| **Su música** | La regla de CR es no usar música ni letras sin licencia | Chiptunes originales. Sus canciones solo entran con permiso por escrito |
| **Torre Picasso** | Edificio real con propietario y empresas dentro | Solo el nombre, el exterior y los datos públicos. Interiores inventados. **Ninguna** empresa ni logo real dentro |
| **«Arde» + torre + arquitecto de las Torres Gemelas** | Una torre en llamas puede leerse como alusión a atentados | **Nada de incendios del edificio, aviones ni derrumbes.** «Arde» es el fuego del escenario: focos, pirotecnia del concierto en la azotea y llamas en los especiales |
| **Juegos de referencia** | Marcas y arte con dueño | Solo el género y el estilo. Ningún nombre, sprite, sonido ni interfaz. Enemigos y jefes propios |
| **Imágenes generadas con IA de personas reales** | Gemini o ChatGPT pueden negarse, o el resultado puede parecer un retrato real | Caricatura descrita por rasgos (pelo, barba, ropa e instrumento) o fotos que la banda autorice. Nunca hacerlo pasar por material oficial |
| **Enemigos** | Que se lean como burla a un colectivo | Empleados de una empresa ficticia; sátira de oficina genérica, sin nacionalidades ni grupos reales |

## 7. Decisiones (11 nov 2026)

El usuario pidió definir lo pendiente. Se puede cambiar cualquiera de estas decisiones.

| Pregunta | Decisión |
|---|---|
| Nombre | **«Arde la Torre»** (provisional) |
| ¿Contactar ya a la banda? | **Primero el prototipo**, para enseñarles algo jugable |
| Músicos | **Los 4 jugables** desde la v0.1 con arte provisional; el arte final de Antonio y Pepe va primero |
| Villano | **«Silencio S.A.»**, una empresa inventada que quiere apagar el rock |
| Arte | **Vía A** (hojas de Gemini). La prueba de la vía B queda como tarea opcional (T0.6) |
| Publicación | ⏸ **No se publica** en la web de CR hasta tener la respuesta de la banda |
| Niveles | **5** (§F6) |
