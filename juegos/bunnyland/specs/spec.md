# BUNNYLAND — Especificación (SDD)

> Minijuego de Colores Ruidosos. Estado: **aprobada, en la v0.1** (23 nov 2026).
> Método: Spec-Driven Development (Dominicode).
> **Decisiones del usuario (23 nov 2026):** es **colaboración oficial** con Hanzer (§6.1). El arte se dibuja **por código por ahora**; después se reemplaza con hojas de sprites de Gemini, así que el render debe permitir cambiar los sprites sin tocar la lógica (§5).
> Sin respuesta, se toma lo recomendado: nombre «BunnyLand», **abrazar** en lugar de comer, motor propio.
> Fuente: *EPK HANZER BUNNY 2026* (presskit de 7 páginas que subió el usuario). Todo dato del juego sale de ahí; lo que no sale de ahí se marca como invención propia.
> Nombre de trabajo: **«BunnyLand»** (⏳ §7.1).

---

## 1. Visión

Un juego de **laberinto y persecución** de pantalla fija, en vertical para el celular: **Hanzer Bunny**, el conejo de peluche rosa y triste, recorre el laberinto comiendo **zanahorias** mientras lo persiguen los personajes raros de su universo. Al comer una **Zanahoria Hyperpop**, la pantalla se vuelve glitch y los enemigos se ponen tristes: el conejo puede **abrazarlos** y mandarlos de vuelta a la nube.

- **Género:** laberinto + persecución + puntos (comer todo, esquivar, voltear la persecución con un potenciador). Se toman las mecánicas del género, pero **ningún** nombre, laberinto, sprite, sonido ni interfaz de un juego existente: laberintos propios, enemigos propios con conductas propias, música propia generada por código.
- **Pantalla:** «HANZER × COLORES RUIDOSOS» (colaboración oficial). Los personajes llevan su nombre.
- **La historia en una línea:** el conejo está triste (U( ᵔ ︵ ᵔ )U) y cada zanahoria lo cura un poco. Al terminar la gira, sonríe.
- **Objetivo de negocio:** una partida corta, compartible y reconocible al instante por los fans de Hanzer (rosa, conejo triste, hyperpop), útil para promocionar su gira o un lanzamiento.

### 1.1 Claves del presskit que hacen divertido el juego

| # | Lo que dice o muestra el presskit | Cómo entra al juego |
|---|---|---|
| K1 | El emoticón **U( ᵔ ︵ ᵔ )U** en casi todas las páginas | Es el **icono de vida**, el logo de la pantalla de título y la cara del HUD. La boca se va volteando a sonrisa **U( ᵔ ᴗ ᵔ )U** según el % de zanahorias comidas |
| K2 | Bunny: peluche rosa, orejas caídas largas, **un ojo azul enorme**, cara triste, pose en cuclillas con las manos en la cara | Sprite del jugador: las orejas se mueven al correr; al perder una vida se agacha con las manos en la cara (pose de la portada) |
| K3 | «Hanzer **siempre está acompañado de su otra mitad**, Hanzer Bunny» | **Modo «Tu otra mitad»** (P1): 2 jugadores en el mismo dispositivo/teclado; el 2.º es Hanzer con su gorro rosa peludo con orejas. Si uno cae, el otro lo revive tocándolo |
| K4 | Showcase **«BunnyLand — Siento que desaparezco»** (cartel) | Nombre del juego y del último nivel. El objeto especial **«Siento que desaparezco»** vuelve al conejo translúcido 5 s: los enemigos lo pierden y vagan |
| K5 | Sticker del **diablito rojo con corona y un tercer ojo** sonriendo | **Jefe de los enemigos**: «El Coronado» |
| K6 | Cartel *Pink Sessions*: **ositos de peluche rosas** entre nubes | Enemigo «Osito Sesión» |
| K7 | Cartel BunnyLand: **estrellita amarilla con patas** y **gotita roja con ojos** | Enemigos «Estrellita» y «Gotita» |
| K8 | Nubes rosas y estrellas amarillas (BunnyLand, Pink Sessions) | La **casa de los enemigos** es una nube rosa; las estrellas son fruta bonus |
| K9 | «Transforma la **vulnerabilidad, la nostalgia y los sueños** en una experiencia **sanadora**» | Nadie muere: el conejo **abraza** a los enemigos tristes y se vuelven nubecitas que flotan a casa. Al perder, el conejo solo se agacha |
| K10 | «Conecta con el **niño interior**» y el lenguaje del **anime** | Estética pixel de anime: brillos, gotas de sudor, líneas de velocidad, ojos grandes |
| K11 | Música **hyperpop + electrónica** | Base chiptune-hyperpop propia, generada en el navegador, con subidón y *glitch* durante la Zanahoria Hyperpop |
| K12 | Escenarios: calle de la **CDMX**, **bosque con estanque de peces koi**, escenario con luces rosas, **skatepark con grafiti** (videoclip *Manhattan*) y cielo de **nubes** | Los 5 niveles de la gira (§3.1 F8) |
| K13 | Objetos del vestuario: **bolsita roja cruzada**, sudadera rosa, pantalón rosa de leopardo | Fruta bonus (bolsita) y skins desbloqueables (P2) |
| K14 | Canción **«UNBESITOMAS?»** | Objeto **«¿Un besito más?»**: un corazón que da **+1 vida** (máx. 1 por nivel) |
| K15 | Números: **52.6K** suscriptores en YouTube, **+3,500** en Instagram, **1.7K** oyentes en Spotify | *Easter eggs* de puntos: medalla al pasar 3,500 / 17,000 / 52,600 puntos |
| K16 | «**Presiona a donde quieras ir :)**» | Texto de la pantalla de título y del tutorial de deslizar |
| K17 | Paleta: rosa **#FF66C4**, fondo gris **#EFEFEE**, rosa claro **#FF85D0**, rojo **#FE2C4E**, amarillo **#FEED01**, casi negro **#061B1D**; letras gruesas y anchas con sombra | Base de la paleta del juego, más los colores que exigen los objetos: naranja y verde de la zanahoria, azul del ojo del Bunny y del estado triste, y un color por escenario (`data/palette.js`) |

### 1.2 Principios
1. **Rosa y triste, pero tierno:** todo lo que se ve sale de la paleta K17.
2. **Sanar, no matar:** no hay muertes ni sangre (K9).
3. **Una mano, en vertical:** se juega deslizando el pulgar; con teclado en escritorio.
4. **Se entiende en 3 s:** come zanahorias, huye, come la zanahoria grande y abraza.

## 2. Usuarios

| Usuario | Qué quiere | Qué implica |
|---|---|---|
| **Fan de Hanzer** (16–30 años, celular, llega desde Instagram o TikTok) | Ver al Bunny en un juego, jugar 2 min y compartir | Arranca en < 5 s, sin registro, tarjeta de resultado con la cara U( ᵔ ᴗ ᵔ )U |
| **Jugador casual** | Entender sin leer | Nivel 1 lento, flechas de «Presiona a donde quieras ir :)» la primera vez |
| **Hanzer / su equipo** (si hay colaboración) | Promocionar el showcase o un lanzamiento | Pantalla final configurable con enlace (⏳ §7.2) |
| **Equipo de CR** | Contenido para la web y reels | Publicación en `/games/bunnyland/` y modo sin HUD (P2) |

## 3. Funcionalidades

### 3.1 P0 (MVP)

| ID | Funcionalidad | Criterios de aceptación |
|---|---|---|
| **F1** | Movimiento por rejilla | El conejo avanza solo en la dirección elegida; un giro pedido antes de la esquina se guarda 250 ms y se aplica al llegar. Deslizar (≥ 20 px) o flechas/WASD. Muros bloquean. Túnel lateral que cruza la pantalla |
| **F2** | Zanahorias | Cada zanahoria chica: +10. Al comer todas, el nivel termina. La cara del HUD cambia en 0 %, 25 %, 50 %, 75 % y 100 % (K1) |
| **F3** | Zanahoria Hyperpop (4 por laberinto) | +50. Durante 6 s (baja 1 s por nivel, mínimo 3 s) los enemigos se ponen tristes (azul, lagrimitas), van más lento y huyen. Pantalla con *glitch* suave, sin destellos (NFR) |
| **F4** | Abrazo | Tocar a un enemigo triste: lo abraza y se vuelve nubecita que vuela a casa; puntos 200 → 400 → 800 → 1,600 en la misma Hyperpop. Tocar a un enemigo normal: −1 vida, pose en cuclillas (K2) |
| **F5** | 4 enemigos con conducta propia | Ver §3.1.1. Deterministas con semilla. Alternan «rondar» y «perseguir» por tiempos propios del nivel |
| **F6** | Vidas | 3 vidas (iconos U( ᵔ ︵ ᵔ )U). Sin vidas → pantalla «Siento que desaparezco…» con puntos y botón de reintentar |
| **F7** | Bonus | Dos veces por nivel (al 30 % y 70 % de zanahorias) aparece 9 s un objeto bajo la casa: estrella (nivel 1), bolsita roja (2), pez koi (3), micrófono (4), nube dorada (5). Puntos 100 → 2,000 |
| **F8** | La gira: 5 laberintos propios | 1 **Calle CDMX** (fondo gris claro, banquetas) · 2 **Bosque koi** (pasto, estanque) · 3 **Escenario rosa** (luces, humo) · 4 **Skatepark grafiti** · 5 **BunnyLand** (nubes y estrellas). Después se repite el ciclo, más rápido. Rejilla 21×27 casillas |
| **F9** | «¿Un besito más?» | Desde el nivel 2, 1 corazón por nivel en un punto fijo: +1 vida (máx. 5) (K14) |
| **F10** | «Siento que desaparezco» | Desde el nivel 3, 1 por nivel: 5 s translúcido; los enemigos no persiguen, solo vagan, y el Bunny los atraviesa sin daño. No sirve para abrazar (K4) |
| **F11** | Pantallas | Título («Presiona a donde quieras ir :)»), cómo se juega (3 viñetas), juego, pausa, entre niveles (cara cada vez más feliz y nombre del siguiente escenario), fin y girar el celular |
| **F12** | Sonido propio | Base hyperpop de 140 BPM por código, una variación por escenario; efectos de comer, abrazo, Hyperpop y vida perdida. Botón de silencio |
| **F13** | Puntos y récord | Récord en `localStorage`. Medallas de K15 en la pantalla final |
| **F14** | Tarjeta para compartir | Imagen 1080×1920 con cara final, puntos, escenario alcanzado y «HANZER × COLORES RUIDOSOS» |
| **F15** | Escucha a Hanzer | En la pantalla final, botones a Spotify e Instagram de Hanzer (enlaces del presskit, sin parámetros de rastreo) |

#### 3.1.1 Los enemigos (diseños propios a partir de K5–K7)

| Enemigo | Aspecto | Al perseguir | Rasgo propio |
|---|---|---|---|
| **El Coronado** (jefe) | Cabeza roja, corona amarilla, tercer ojo, sonrisa enorme | Va directo a la casilla del conejo | Cuando quedan < 20 % de zanahorias se enoja: +10 % de velocidad y la corona brilla. Si el Bunny se queda quieto 2 s, «lo huele» y va por el camino más corto (contra quien se esconde) |
| **Osito Sesión** | Osito de peluche rosa | Apunta 4 casillas delante del conejo | Al chocar con una pared hace una pausa de 0.3 s (es de peluche) |
| **Estrellita** | Estrella amarilla con patitas | Vaga al azar (semilla) | Cada 8 s salta a otra estrella del laberinto (2–4 puntos fijos) con aviso de 1 s |
| **Gotita** | Gota roja con ojos | Persigue si está a > 8 casillas; si se acerca, huye a su esquina | Deja un charquito 2 s que frena al conejo un 30 % |

### 3.2 P1 y P2
- **P1 · Tu otra mitad (K3):** 2 jugadores locales (teclado WASD + flechas; o 2 mitades de pantalla táctil). El 2.º jugador es Hanzer (gorro rosa con orejas). Si uno cae, queda agachado 8 s; si el otro lo toca, revive.
- **P1 · Ranking semanal**, como los otros juegos de CR.
- **P2 · Skins** de vestuario (K13): sudadera rosa, pantalón de leopardo, camisa de cuadros (foto de la portada).
- **P2 · Modo grabación** sin HUD para reels.

### 3.3 Fuera de alcance
- Fotos reales del artista dentro del juego (todo es pixel art propio; ⏳ §7.2).
- Canciones, letras o audio del artista (solo base propia).
- Logos de terceros que salen en el presskit: festivales, bares y patrocinadores.
- Personas reales que salen en los carteles (colaboradores, abridores) como personajes.

## 4. Flujos

### 4.1 Flujo principal
Llega desde el enlace → título con el Bunny agachado y U( ᵔ ︵ ᵔ )U → toca → (1.ª vez) tutorial de deslizar → nivel 1 «Calle CDMX» → come todo → pantalla entre niveles (la cara sonríe un poco más) → … → sin vidas o al terminar BunnyLand → pantalla final con medallas y tarjeta → reintentar.

### 4.2 El bucle del nivel
Salida: 2 s de «¡Listo, Hanzer!» (cambio del usuario, 23 nov 2026) y los enemigos salen de la nube uno a uno (0 s, 3 s, 8 s, 14 s). Rondar 7 s ↔ perseguir 20 s (los tiempos bajan por nivel). Zanahoria Hyperpop → huida → abrazos → vuelven de nubecita a la casa y salen normales.

### 4.3 Casos borde
- Dos enemigos en la misma casilla al abrazar: se abrazan los dos y suman en orden.
- Se termina la Hyperpop justo al tocar: gana el enemigo si el estado ya es normal en ese cuadro.
- Comer la última zanahoria y tocar a un enemigo en el mismo cuadro: gana el conejo (nivel completo).
- La app pasa a segundo plano: pausa automática.
- Celular horizontal: aviso de girar (el juego es vertical).
- Deslizar contra una pared: el giro queda guardado 250 ms (F1); no se pierde la entrada.

## 5. Arquitectura

Juego independiente en `juegos/bunnyland/`, con el mismo enfoque que los otros juegos de CR: motor propio sin dependencias en tiempo de ejecución, `node --test`, esbuild y Playwright (⏳ §7.4 si se prefiere Phaser 4).

```
juegos/bunnyland/
  specs/         spec.md · plan.md · tasks.md
  art/concepto/  hoja de concepto (sprites, paleta K17, maqueta)
  scripts/       atlas.py · build.mjs · serve.mjs · publish-web.mjs · tune.mjs
  src/
    core/    grid.js (rejilla, muros, túnel) · rng.js (semilla) · loop.js (paso fijo 60 Hz)
    game/    bunny.js · enemies.js (conductas §3.1.1) · level.js (zanahorias, bonus, tiempos) · match.js (vidas, puntos, fases)
    data/    mazes.js (5 laberintos en texto) · tuning.js · textos.js
    input/   gestures.js (deslizar y teclado → dirección)
    render/  sprites.js · stage.js · hud.js · screens.js · font.js
    audio/   synth.js (base hyperpop por código) · sfx.js
    share/   card.js
  tests/     unidad · bots · navegador
```

- **Sprites intercambiables (decisión del 23 nov):** la lógica solo conoce nombres de sprite (`bunny.der.0`, `coronado.triste.1`…). `render/sprites.js` los dibuja por código hoy; mañana `render/atlas.js` los leerá de las hojas de Gemini recortadas con `scripts/slice_sheet.py`, con el mismo nombre y tamaño (16×16 por cuadro).
- **Lógica pura:** `core/` y `game/` no tocan el DOM: reciben `(paso, entrada)` y devuelven estado. Se prueban sin navegador y con bots.
- **Resolución:** 168×216 lógicos para el laberinto (21×27 casillas de 8 px) + HUD; escalado por enteros, `image-rendering: pixelated`.
- **Salida:** un solo `dist/index.html`.

## 6. Requisitos no funcionales

| NFR | Meta |
|---|---|
| Rendimiento | 60 fps en un Android de gama media y en un iPhone 11 |
| Peso | HTML ≤ 250 KB, sin archivos de audio ni fotos |
| Arranque | Jugable en ≤ 5 s con 4G |
| Compatibilidad | Safari iOS 16+, Chrome Android 110+ y escritorio |
| Accesibilidad | El *glitch* de la Hyperpop sin destellos (< 3 por segundo, sin parpadeo a pantalla completa); opción «menos movimiento»; botones ≥ 44 px |
| Pruebas | Todo `core/` y `game/` con tests; un bot que pasa los 5 niveles; Playwright con un iPhone emulado |
| Privacidad | Sin analítica ni cookies. Solo `localStorage` |

### 6.1 Legal y ética

| Tema | Riesgo | Propuesta |
|---|---|---|
| Música | La colaboración no dice si incluye canciones | Base propia por código hasta que el equipo de Hanzer mande una canción con permiso por escrito (⏳ §7.6) |
| Juego del género | Parecerse demasiado a un clásico con derechos | Laberintos, enemigos, conductas, sonidos y nombres propios. Sin «Pac» ni nada parecido en ningún texto |
| Hanzer Bunny y el diablito | Son personajes del artista | ✅ Colaboración oficial (23 nov 2026): se usan con su nombre. Aun así, pixel art propio, nunca recortes de las fotos del presskit |
| Logos de terceros en el presskit | FNSM, Hertz Souls, Bar Bunny, Pink Sessions, dreamers | No se usan. «Pink Sessions» solo inspira al osito, sin el nombre del evento |
| Personas en los carteles | Colaboradores y abridores | No aparecen. Claude no identifica personas por la cara |
| Datos de contacto del presskit | Teléfono y correo personales | **No** van en el juego ni en el repo |
| Cifras de redes (K15) | Cambian con el tiempo | Se usan como números de medalla, no como dato actual |

## 7. Preguntas abiertas
1. Nombre: se usa «BunnyLand» (recomendado; sin respuesta todavía).
2. ✅ Colaboración oficial (23 nov 2026).
3. Abrazo: se usa abrazar (recomendado; sin respuesta todavía).
4. Motor: se usa el motor propio (recomendado; sin respuesta todavía).
5. ✅ Arte por código ahora; hojas de Gemini después (23 nov 2026).
6. ⏳ **¿Hay una canción de Hanzer con permiso para el juego?** Si la mandan, sustituye a la base propia en el nivel 5 (BunnyLand).
