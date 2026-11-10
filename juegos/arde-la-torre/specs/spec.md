# ARDE LA TORRE (título provisional) — Especificación (SDD)

> Juego de Colores Ruidosos. Estado: **borrador para que lo apruebe el usuario** (10 nov 2026).
> Método: Spec-Driven Development (Dominicode, Bezael Pérez).
>
> **Decisiones del usuario (10 nov 2026):**
> - beat 'em up con scroll lateral para hasta 4 jugadores;
> - presupuesto cero;
> - sprites hechos con Gemini o ChatGPT;
> - **sin online**: una pantalla compartida y **los móviles como mandos** escaneando un QR, como los juegos de Netflix en la tele.

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

### 3.1 Personajes jugables

| Músico | Perfil de combate | Especial (gasta un poco de vida, como en el género) | MVP |
|---|---|---|---|
| **Antonio** (voz y guitarra) | Equilibrado | **Grito**: una onda corta delante que tumba a los enemigos | P0 |
| **Pepe** (bajo) | Lento y fuerte, con los mejores agarres | **Golpe de bajo al suelo**: una onda a los dos lados | P0 |
| **Dani** (guitarra) | Rápido, con combos largos y poco daño | **Solo**: un giro con la guitarra que golpea alrededor | P1 |
| **Jota** (batería) | Baquetas con alcance medio y golpes múltiples | **Redoble**: varios golpes rápidos delante | P1 |

- Cada músico es una **caricatura reconocible y respetuosa**, sin exagerar rasgos físicos para burlarse.
- Si dos jugadores eligen al mismo músico, el segundo sale con **otra paleta de colores**.

### 3.2 Funcionalidades P0 (MVP)

**F1 Movimiento en profundidad.**
- Moverse en 8 direcciones por un suelo con profundidad: X avanza y Y cambia de carril.
- Salto con altura Z.
- Doble toque adelante para **correr**.

**F2 Combate básico.**
- **Golpe:** combo de 3 golpes; el último tumba.
- **Salto + golpe:** patada aérea.
- **Correr + golpe:** embestida.
- **Agarre:** al caminar contra un enemigo aturdido se le agarra. Desde ahí, golpe para darle rodillazos y adelante + golpe para lanzarlo. **El lanzado daña a otros enemigos.**
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
| **Guardia** | Se cubre de frente; hay que agarrarlo o atacarlo por la espalda | P0 |
| **Contable** | Lanza grapas desde lejos (proyectil en el carril) | P1 |
| **Ejecutiva** | Agarra y lanza | P1 |

- **Turnos de ataque:** como mucho, 2 enemigos atacan a la vez a cada jugador; los demás rodean. Así es justo y se lee bien.
- **Escalado:** el número y la vida de los enemigos crecen con los jugadores (1 jugador: ×1, 2: ×1,5, 3: ×2, 4: ×2,5).

**F6 Plantas (niveles).** Cada nivel es un tramo de la torre. Tiene un **scroll que se bloquea por oleadas** (aparece «¡ADELANTE! →» al limpiar) y un **jefe** al final.

| Nivel | Lugar (ficción) | Jefe | MVP |
|---|---|---|---|
| 1 | **Parking subterráneo**: coches, columnas y barreras | **El Jefe de Seguridad** (embiste y llama a refuerzos) | P0 |
| 2 | **Vestíbulo**: tornos de acceso, mostrador y escaleras mecánicas | **La Recepcionista**: lanza el teléfono, cierra los tornos y deja a alguien fuera unos segundos | P0 |
| 3 | **Ascensor**: pantalla fija mientras sube y entran enemigos en cada planta | — (prueba de aguante) | P1 |
| 4 | **Oficinas diáfanas**: mesas, impresoras y fuentes de agua | El Director Comercial | P1 |
| 5 | **Comedor y cocina** | ⏳ | P2 |
| 6 | **Planta técnica**: máquinas y conductos | ⏳ | P2 |
| 7 | **Azotea**: el escenario del concierto con Madrid de noche al fondo | **El Presidente de Silencio S.A.** (jefe final) | P1 |

- El número de planta solo aparece en pantalla cuando se confirme la cifra (§1.1).

**F7 Objetos.**
- **Comida:** un bocadillo de calamares recupera el 30 % de la vida y un café el 10 %. Salen de cajas o papeleras rotas.
- **Armas del suelo:** grapadora, extintor y silla de oficina. Se recogen con el golpe y tienen 5 usos.
- **Púa dorada:** 1 000 puntos.

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
| Táctil en la propia pantalla | 1 jugador en tablet o móvil cuando se juega sin pantalla grande (P1) |

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
- Selección de músico.
- Introducción del nivel en 1 viñeta con texto.
- HUD: retrato, vida, vidas y puntos de cada jugador en las 4 esquinas.
- Pausa, Fin del juego y resultado: puntos por jugador, más enemigos tumbados y «más bocadillos comidos» como premios divertidos.

**F12 Audio.**
- Chiptunes **originales** hechos por código, uno por nivel y otro para el jefe, más efectos de sonido sintetizados.
- **Sin canciones de Arde Bogotá** salvo permiso de la banda o de su sello (§6.1).

**F13 Opciones.** Volumen, sacudida de pantalla, modo asistido (enemigos con −30 % de daño y vida infinita) y reducción de destellos. Se guardan en `localStorage`.

### 3.3 Funcionalidades P1 y P2
- **P1:**
  - Dani y Jota jugables.
  - Niveles 3, 4 y 7.
  - Contable y Ejecutiva.
  - Táctil en la propia pantalla.
  - **Ataque combinado**: si dos jugadores lanzan el especial a la vez cerca, sale un «acorde» con más daño.
- **P2:**
  - Niveles 5 y 6.
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
| Rendimiento | 60 fps estables con 4 jugadores y 12 enemigos en un portátil de gama media (Intel i5 de 2019) y en un iPad de 9.ª generación |
| Latencia del mando | Pulsación en el móvil → reacción en pantalla ≤ 80 ms en la misma wifi (meta: 30–50 ms) |
| Unirse | Del escaneo a «conectado» ≤ 5 s con una wifi o 4G normales |
| Resolución | 384×216 lógicos con escalado entero: ×5 = 1920×1080 y ×10 = 4K. Se ve nítido en cualquier tele: **es el «HD» del proyecto** |
| Peso | Juego ≤ 3 MB y mando ≤ 300 KB, para que cargue rápido en el móvil tras escanear |
| Coste | **0 €**: GitHub Pages, la nube gratuita de PeerJS y herramientas gratuitas |
| Compatibilidad | Pantalla: Chrome, Edge, Firefox o Safari recientes en escritorio y tablet. Mando: Safari iOS 16+ y Chrome Android 110+ |
| Accesibilidad | Destellos < 3 Hz y desactivables; modo asistido; botones táctiles ≥ 56 px; textos legibles a 3 m en la tele (≥ 8 px lógicos = 40 px reales en 1080p) |
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

## 7. Preguntas abiertas (⏳ el usuario)
1. **Nombre del juego.** Propuestas: «Arde la Torre», «Planta 43» (si se confirma la cifra) o «Asalto a la Picasso».
2. **¿Contactamos ya a la banda** o primero hacemos un prototipo jugable para enseñárselo?
3. **¿Los 2 músicos del MVP** son Antonio y Pepe, o prefieres otros?
4. **Villano:** ¿te gusta «Silencio S.A.» (una empresa que quiere apagar el rock) o prefieres otra historia?
5. **Arte:** ¿empezamos por la vía A (hojas de Gemini, ya probada en el otro juego) y hacemos una prueba de la vía B (3D gratuito con Mixamo y Blender) con un solo músico para comparar?
6. **¿Se publica en la web de CR** al terminar el MVP o se queda privado hasta tener respuesta de la banda?
