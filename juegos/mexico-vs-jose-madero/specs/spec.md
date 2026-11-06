# Spec — «MÉXICO VS. JOSÉ MADERO» (v8, borrador)

> Spec-Driven Development (Dominicode). Juego de plataformas y acción **16 bits estilo Neo Geo** (referencia: *Spin Master*, Data East, 1993), jugable en la web de Colores Ruidosos, que recorre la carrera solista de José Madero. Cada disco es un mundo con su propia jugabilidad y un jefe. El hub es **el Museo**. El final es un concierto que sirve de **preludio a su show en la Arena Ciudad de México**.
>
> **v2:** título tomado de la playera oficial; estética 16 bits; micrófono como arma; un giro de jugabilidad por mundo; enemigos de prensa; jefe final «VS» en concierto.
> **v5 (2 nov 2026):** Mundo 1 «Carmesí» definido a partir de los conceptos rescatados de Gemini (§3.0d): jefe **Cámara Flash-Bot**, enemigos **Rumor Volador** y **Micrófono Traidor**, tres niveles, juego **más rápido** (combos, puntuación, cronómetro) y **power-ups** con el **Solo de guitarra**. Los Titulares gritan titulares genéricos, no insultos. Logo de Colores Ruidosos: el real.
> **v7 (2 nov 2026):** el juego pasa a la web de Colores Ruidosos (`juegos/mexico-vs-jose-madero/`): **Opciones** (sin destellos, sin temblor, modo asistido), **guardado**, **Museo** (hub), **Galería de trajes** y **Mundo 2 «Noche»** (§3.0f).
> **v8 (2 nov 2026, ⏳ pendiente de aprobar):** feedback del usuario. La **historia se cuenta dentro del juego**: prólogo tras el Estadio GNP, Pepe sin memoria e identidad recuperada disco a disco (§1.1b). **Jefe de Noche con ataques variados** (§1.1c). **Arte Neo Geo** con hojas de Gemini (§1.2b).
> Estado: **borrador para definir con el equipo**. Las celdas marcadas con ⚠️ esperan verificación o decisión.

---

## 1. Visión

Un homenaje jugable, hecho por fans, en el que cada disco de José Madero es un mundo con su color, su ambientación sacada de la portada y del concepto real del disco, enemigos inspirados en sus canciones y un jefe final. Entre mundos aparecen **hitos verificados** de su carrera («¿Sabías que…?»). El jugador recorre **el Museo**, inspirado en el museo real de 2026 con más de 100 piezas, y recupera esas piezas por los mundos.

**Por qué funciona:**
- Madero es fan declarado del terror (Milenio, Looking Back), así que un juego de terror retro es coherente con él.
- Cada disco tiene color propio («serie de colores»: La Razón, Wikipedia), lo que encaja con una paleta de NES.
- El museo real (Monterrey, jul–ago 2026, más de 100 piezas) da la estructura: coleccionar piezas.

**Éxito:** partidas completas compartidas en redes, visitas recurrentes a la web y comentarios del tipo «mi jefe favorito es…».

### 1.1 Historia
José Madero tiene que **recordar quién es** antes de su concierto en la **Arena Ciudad de México**. La prensa lo ha perseguido durante años con titulares sensacionalistas («¡EXCLUSIVA!», «¡POLÉMICA!»), y entre tanto ruido su carrera se ha quedado desordenada en **el Museo**: cada sala es un disco y cada disco, un mundo. Recuperando las piezas de cada etapa, Pepe reconstruye su historia. Con ella llega a la Arena, donde le espera el combate final: **MÉXICO VS. JOSÉ MADERO**, un concierto en el que no se derrota a nadie: hay que **ganarse al público**.

> El arco se apoya en algo que él ha contado: que al principio de su carrera fue arrogante y que lo dejó atrás («En algún momento fui un pendejo, pero dejé atrás eso hace mucho tiempo», La Razón, 2024; «no fuera tan arrogante», Publimetro, 2025). No se usan sus declaraciones sobre salud emocional o vida privada.

### 1.1b v8 · La historia contada dentro del juego (propuesta del usuario, 2 nov 2026) ✅ aprobada

**Problema:** la historia está en la spec (§1.1), pero el juego no la cuenta. Hoy se pasa de la portada al Museo sin saber por qué Pepe está ahí, y los capítulos son datos sueltos.

**Premisa (del usuario):** José Madero acaba de llenar el estadio GNP y le toca tocar en la **Arena Ciudad de México**. Pero ha olvidado quién es y tiene que ir **disco por disco** recuperando su identidad.

**Qué es dato y qué es ficción:**

| Elemento | Tipo | Estado |
|---|---|---|
| 24 ene 2026, Estadio GNP Seguros, «Érase una Bestia», su primer estadio, con museo en una carpa | Dato | ✅ Chilango, Excélsior |
| «El más grande de México» | Dato | ⚠️ Sin verificar: no sale en pantalla hasta tener fuente |
| «Foro GNP» como nombre | — | ✅ El usuario confirma (con fotos, 2 nov) que se refiere al **Estadio GNP Seguros**, al que también se le llama así. En pantalla se usa el nombre de las fuentes: «ESTADIO GNP SEGUROS». La viñeta 1 lo muestra en vista aérea: planta cuadrada y techo cobrizo, sin el lema publicitario del techo ni marcas |
| Fecha del concierto en la Arena CDMX | Dato | ✅ **21 y 22 de mayo de 2027**, «Querido José Tour» (LOS40, 14 oct 2026; Grupo Animal). Sale en la viñeta 2 con su fuente |
| Que olvide quién es y lo recupere | **Ficción del juego** | Se presenta como cuento, nunca como dato |

**1. Prólogo** (al pulsar START la primera vez; saltable; unos 30 s; viñetas con texto, estilo intro de arcade):
1. «24 DE ENERO DE 2026. ESTADIO GNP SEGUROS. "ÉRASE UNA BESTIA": SU PRIMER ESTADIO.» Sale el escenario con público y luces de móvil.
2. «LO SIGUIENTE: LA ARENA CIUDAD DE MÉXICO.»
3. *(Ficción)* «ESA NOCHE, ENTRE FLASHES Y TITULARES, ALGO SE LE PERDIÓ.» Los Titulares rodean a Pepe y la pantalla se llena de ruido.
4. *(Ficción)* «PEPE DESPIERTA EN EL MUSEO DE LA CARPA. NO RECUERDA QUIÉN ES.» Pepe aparece **en gris, sin color**.
   - **v9 (decisión del usuario):** en las viñetas de esa noche (3 y 4), Pepe lleva el traje negro con lentes oscuros. Es una elección visual: no se afirma en pantalla que lo usara ese día, porque sigue sin fuente ⚠️.
5. «CADA DISCO GUARDA UNA PARTE DE ÉL. RECUPÉRALAS UNA A UNA ANTES DEL CONCIERTO.»

**2. La identidad como mecánica visible:**
- En el Museo hay un **retrato de Pepe** en la pared, hecho de 8 piezas (una por disco). Al empezar está apagado; cada mundo terminado **enciende su pieza** con el color del disco.
- Contador en el Museo: «IDENTIDAD 1/8».
- Pepe empieza la partida **desaturado** y gana color con cada mundo. Noche es la excepción, porque el mundo entero es en blanco y negro.

**3. Cada mundo cuenta un tramo** (de 3 a 5 frases cortas en total):

| Momento | Qué pasa |
|---|---|
| Al entrar por la puerta | Cartel «MUNDO N · DISCO · AÑO» y una frase de Pepe en primera persona, presentada como ficción: «ESTA PUERTA ROJA… ME SUENA». |
| Durante los niveles | Los capítulos actuales (datos con fuente). En los checkpoints, **pensamientos** de Pepe de una línea (ficción): «EMPECÉ ESTAS CANCIONES EN 2008… ¿O NO?» |
| Al vencer al jefe | Tarjeta «**RECUERDO RECUPERADO**»: qué significó ese disco, solo con datos verificados. Ej. Carmesí: «EMPEZAR DE CERO, EN SOLITARIO (2016)»; Noche: «LO QUE HAY DEBAJO DE LAS MÁSCARAS (2017)» |
| De vuelta en el Museo | El retrato gana su pieza y Pepe dice una línea: «YA ME ACUERDO DE ALGO MÁS». |

**4. Final:** con los 8 recuerdos, se abre la puerta de la Arena y empieza el VS (§3.3). En los créditos se separan con claridad los **datos con fuente** de la **historia inventada del juego**.

**5. Texto:** todo en la fuente del juego, con frases de 44 caracteres como máximo.

### 1.1c v8 · Jefe de Noche con patrones variados ✅ aprobado (detalle final en §3.0f G)
**Problema (usuario):** el Enmascarado «va de aquí para allá», con un patrón súper repetitivo.

**Propuesta:** un repertorio de ataques. Nunca repite el mismo dos veces seguidas y la elección depende de dónde está Pepe. Se mantiene determinista con un generador pseudoaleatorio propio, para que los tests sigan siendo repetibles.

| Ataque | Cómo se esquiva | Ventana para golpearle |
|---|---|---|
| **Embestida** (la actual) | Saltar por encima | Aturdido tras chocar con la pared |
| **Salto encima de Pepe**: salto en arco hasta donde está Pepe; al caer, onda en el suelo | Apartarse y saltar la onda | 0,8 s al aterrizar |
| **Máscaras lanzadas**: tira 3 antifaces en abanico | Esquivar o romperlas con el micrófono | Mientras recarga |
| **Entre la niebla**: desaparece y reaparece **detrás** de Pepe, con aviso de ojos | Girarse y saltar | Tras el zarpazo, 0,6 s |
| **Fase 2: invitados**: llama a 2 Invitados enmascarados | Vencerlos | Mientras los llama |

- **Muelle con altura:** el escenario 2-3 gana barcas y plataformas para moverse en vertical. La embestida deja de ser lo único que pasa.
- **Fase 2:** apagones más largos, combina dos ataques seguidos y se mueve más deprisa.
- **Lo que no cambia:** 8 golpes y, al vencerlo, se quita la máscara.

### 1.2b v8 · Arte estilo Neo Geo ⏳
- **Por qué los enemigos de Noche no se parecen:** están **dibujados por código** como provisionales. Ninguna librería los va a acercar al estilo de Pepe.
- **Qué da el aspecto Neo Geo:**
  - sprites grandes con muchos fotogramas (de 4 a 8 por animación);
  - contorno oscuro grueso;
  - sombreado de 2 a 3 tonos por color y paleta corta por personaje;
  - poses exageradas (anticipación antes de atacar y retroceso al recibir un golpe).
- ✅ **v8:** las hojas de Noche se hicieron con **ChatGPT** con los prompts §0d. Se recortan con `scripts/slice_rows.py` y se ven en gris. El Enmascarado se dibuja por encima de la oscuridad, salvo en el acecho y el apagón. Su caja de colisión pasa a 28×50 para ajustarse al sprite.
- **Cómo se consigue:** el camino ya probado en Carmesí. Hojas de Gemini con referencia a la hoja de Pepe, importadas con `scripts/slice_sheet.py`.
- **Prompts listos:** en `art/PROMPTS-GEMINI.md` §0d piden **más fotogramas** que los de Carmesí, para un movimiento más Neo Geo.
- **Phaser (repo `edgaralrohe/phaser`):**
  - Es un motor de juegos. **No genera ni mejora el arte.**
  - Su guía de pixel art trata de cómo **mostrar** píxeles sin emborronarlos. Este juego ya lo hace: escalado entero y `image-rendering: pixelated`.
  - Cambiar a Phaser no cambiaría el aspecto de los enemigos y obligaría a rehacer el motor y los tests (decisión 1 del plan: sin framework).

### 1.2 Dirección de arte
| Elemento | Decisión |
|---|---|
| Referencia | *Spin Master* (Neo Geo): sprites grandes y caricaturescos, contornos gruesos, colores saturados, escenarios con mucho detalle. **Solo el estilo**; ni sprites ni logo |
| Resolución | **320×224** lógicos (Neo Geo), escalado entero |
| Protagonista | El dibujo de Colores Ruidosos (`referencias/pepe-dibujo-colores-ruidosos.png`): Pepe *chibi*, barba, pañuelo rojo, camiseta blanca, vaqueros y **micrófono** |
| Arma | **Micrófono con cable**, que se lanza y vuelve como el yoyó de *Spin Master*. Se mejora con power-ups |
| Logo | Sello **«JMV»** propio estilo arcade de los 90 (letras cromadas en relieve en una placa). **No** imitar el óvalo de Nintendo ni el logo de Neo Geo ⚠️ confirmar que JMV = José Madero Vizcaíno |
| Título | **«MÉXICO VS. JOSÉ MADERO»**, tomado de la playera oficial (`referencias/playera-mexico-vs-jose-madero.png`) |

### Riesgos que hay que asumir desde ya
| Riesgo | Decisión propuesta |
|---|---|
| **Marcas de terceros** (Super Mario Bros., logo de Nintendo, Neo Geo, *Spin Master*) | Título propio («MÉXICO VS. JOSÉ MADERO»), sello «JMV» propio. Se toman mecánicas y estilo, nunca nombres, logos ni sprites |
| **Prensa como enemigo** | Prensa genérica (titulares, flashes, micrófonos de reportero); **ningún medio ni periodista real**. Al vencer un titular aparece una frase verificada del propio Madero |
| **Personajes de terror con dueño** (Jason, Freddy, Pinhead) | Arquetipos propios: «el Enmascarado del Lago», etc. Nunca los nombres ni los diseños registrados |
| **Nombre e imagen de José Madero** en una web | Rótulo «Homenaje no oficial hecho por fans» en portada y créditos. Ideal: **avisar o pedir permiso a su equipo** (incluso puede salir una colaboración) |
| **Su música grabada** | No se usa. Solo chiptunes originales compuestos por código |
| **Portadas** | Se evocan con objetos y paletas; no se reproducen |
| **Giallo trata trastornos mentales** (Chilango) | **No convertir trastornos en enemigos.** El mundo usa los códigos del cine *giallo* (maniquíes, guantes negros, teatro), nunca enfermedades |
| **Fotosensibilidad** (flashes de *Posa y sonríe*) | Flash de baja intensidad, < 3 Hz y desactivable en Opciones |

---

## 2. Usuarios

| Usuario | Necesidad |
|---|---|
| Fan de Madero (móvil, Instagram → web) | Jugar en 30 s sin instalar nada; controles táctiles; reconocer cada disco |
| Jugador retro | Controles precisos, dificultad justa, secretos |
| Colores Ruidosos | Contenido que retiene en la web; escenas grabables para reels; fácil de ampliar con nuevos discos |

---

## 3. Funcionalidades

| ID | Funcionalidad | Prioridad |
|---|---|---|
| G1 | Plataformas 2D: correr, saltar (altura variable), pisar enemigos, disparar con power-up | Must |
| G2 | **Hub «El Museo»**: 8 salas (una por disco) que abren cada mundo; las vitrinas se llenan con las piezas recuperadas | Must |
| G3 | 8 mundos = 8 discos, cada uno con 1 nivel y 1 jefe (v1). Aurora, al ser EP, es un mundo corto | Must |
| G4 | Enemigos y jefes con patrones propios (ver §3.2–3.3) | Must |
| G5 | Power-ups (ver §3.4) | Must |
| G6 | Coleccionables: **100 piezas del museo** (12–13 por mundo) + 1 pieza dorada por mundo | Must |
| G7 | Tarjetas de hitos «¿SABÍAS QUE…?» entre mundos, con fuente en los créditos | Must |
| G8 | Controles: teclado, mando (Gamepad API) y táctil (cruceta + A/B) | Must |
| G9 | Guardado del progreso en el navegador; continuar partida | Must |
| G10 | Chiptune original por mundo (motor de «8 cabañas», en tiempo real) | Must |
| G11 | Accesibilidad: sin flashes, modo «sin daño» (asistido), remapeo de teclas | Should |
| G12 | Mundo epílogo «Érase una Bestia» (estadio) con el jefe final del juego | Should |
| G13 | Modo «grabación» para reels: vertical 9:16 con la cámara centrada | Could |
| G14 | Mundo 0 «Panda / PXNDX» | Won't (v1) ⚠️ falta verificar datos y decidir |
| G15 | Ranking online | Won't (v1) |

### 3.1 Mundos (orden cronológico)

| # | Mundo | Año | Paleta | Ambientación (de dónde sale) | Mecánica del mundo |
|---|---|---|---|---|---|
| 1 | **Carmesí** | 2016 | rojo | Portada: mano y rosa que se deshace. Canciones escritas entre 2008 y 2010 | Tutorial: correr, saltar, pétalos que caen como plataformas temporales |
| 2 | **Noche** | 2017 | negro / B y N | Homenaje al terror clásico; vídeo de «Noche de brujas» en blanco y negro; fiesta de disfraces | Nivel en **blanco y negro**; cabañas junto al lago (enlace con «8 cabañas»); máscaras que cambian a los enemigos |
| 3 | **Alba** | 2018 | blanco | «Disco blanco», conceptual, *Oda a la nostalgia*. Madero lo llamó «el amanecer»; yin-yang con *Noche* | El nivel amanece: la luz revela plataformas; si te quedas quieto, «la nostalgia» te arrastra hacia atrás |
| 4 | **Psalmos** | 2019 | azul | Espiritualidad y desamor. Portada: figura en posición fetal en una esquina. Iba a tratar «el lado oscuro de Peter Pan» | Vidrieras de colores y sombras que se separan de sus dueños |
| 5 | **Giallo** | 2022 | amarillo | Doble sentido: amarillo y cine *giallo* italiano. Portada: maniquí con la cabeza en llamas. Gira *Giallo Fantastique* | Teatro y bastidores; luces amarillas que se encienden y apagan; maniquíes que solo se mueven cuando no los miras |
| 6 | **Aurora** (EP) | 2023 | naranja óxido / gris | 6 canciones. Portada: hiedra con hojas rojas sobre pared blanca | **Paseo** corto (EP): sin enemigos; pasajes junto a la hiedra y las ventanas; momento final al llegar a la pared de la portada |
| 7 | **Sarajevo** | 2024 | lila | Portada: piernas con tacones ante una cortina lila. Canciones: «Luciérnaga», «Rey Ahogado» (con Lasso) | Nivel nocturno con faroles; tramo **bajo el agua** hasta el Rey Ahogado; cierra con el memorial «Luciérnagas» |
| 8 | **Querido…** | 2026 | verde | 7.º disco, 13 canciones, **epistolar** y con aire **medieval**, cuerdas, sin sencillos. Portada: dos pierrots con perlas | Castillo medieval de cartas; los sobres son checkpoints; dos rutas (las «dos caras») |
| ★ | **Érase una Bestia** (epílogo) | 2026 | todos | Su primer estadio: Estadio GNP Seguros, 24 ene 2026 | Escenario de estadio con público; jefe final del juego |

### 3.0 Arte v3: hoja oficial de Pepe y enemigos en el mismo estilo
- **Pepe** sale de la hoja de sprites de Colores Ruidosos (`art/source/pepe-sheet.jpg`, 29 poses: reposo 4, carrera 8, agacharse 2, salto 2, aterrizaje 1, lanzar micro 2, grito 3, KO 2, daño 1, victoria 4).
- **Pipeline** `scripts/slice_sheet.py`: quita el fondo liso, separa fotogramas por componentes conectados, une los efectos a su fotograma, reduce a **48 px** de alto con una paleta común de 48 colores (aspecto 16 bits), calcula el ancla (centro de los pies) y genera `src/data/<nombre>-atlas.js`. **Cualquier hoja nueva con el mismo formato entra al juego sin trabajo manual.**
- En «lanzar micro» se borra el micrófono dibujado más allá de la mano; el juego dibuja el cable con su alcance real.
- **Enemigos:** ilustraciones *chibi* (contorno grueso oscuro, ojos grandes, sombreado plano) generadas por código en SVG y pasadas por el **mismo pipeline**, para que todo el reparto sea coherente. El arte final se puede sustituir por hojas hechas por CR siguiendo `art/BRIEF-enemigos.md`.
- **Hitbox de Pepe:** 14×40 px (sprite de 48 px; algo de margen a favor del jugador).

| Enemigo (prensa genérica) | Carácter | Comportamiento | Fotogramas |
|---|---|---|---|
| **Titular** | `T` | Periódico con patas que grita su titular; patrulla sin caerse de los bordes | andar 4 · derrotado 1 |
| **Paparazzi** | `F` | Fotógrafo genérico (gorra, gafas, gabardina, cámara). Si te tiene delante, se para, apunta y **dispara el flash: te congela 0,6 s** (sin daño; flash suave, < 3 Hz) | andar 2 · apuntar 1 · flash 1 · derrotado 1 |
| **Reportero** | `R` | Reportero genérico (traje y micrófono sin logo). Si te ve, **embiste** hacia ti, se para y vuelve a intentarlo | andar 2 · embestida 1 · derrotado 1 |

Todos se vencen pisándolos o con el micrófono, y al caer muestran una frase verificada de Madero.

### 3.0b v4 · Ritmo: mundos de acción y **paseos reflexivos**
Propuesta (⚠️ el usuario confirma qué discos): los discos más tranquilos dejan de ser niveles de combate y pasan a ser **paseos**: sin enemigos ni daño, caminar a tu ritmo y leer **pasajes**.
- ✅ **Decidido (1 nov 2026): son paseo *Alba* y *Aurora*.** *Querido…* se queda como mundo de acción normal.
- **Pasajes de canciones:** ⚠️ **las letras tienen derechos de autor.** Solo se muestran fragmentos **con permiso por escrito** del editor o del equipo de José Madero. Hasta entonces, cada pasaje es: **título de la canción + una reflexión escrita por Colores Ruidosos** (con sus propias palabras) **o una declaración verificada** de Madero sobre ese disco, con su fuente.
- Mecánica del paseo: luz y cámara lentas; los pasajes aparecen al pasar junto a objetos del disco; música ambiental original; no hay forma de perder. Al final, en lugar de un combate, hay un **momento final**.

### 3.0c v4 · Nivel «Luciérnagas»: alzar la voz (Sarajevo) — tema delicado
**Hecho verificado:** «Luciérnaga» (*Sarajevo*, 2024) trata del feminicidio de Karen Rebeca Esquivel (19 años; Naucalpan, 2016). José Madero la escribió **con su madre, Becky Espinosa**, y la dedicó, entre otras, «a las mujeres que hoy no pueden alzar la voz» (La Razón, Milenio, UnoTV, Diario de México, Revista Netas). En un podcast también habló del feminicidio de una seguidora, Prisma Lorena Villarreal (El Heraldo de México).

**Principios (no negociables):**
1. **No es un juego, es un memorial.** Sin enemigos, sin daño, sin puntos, sin cronómetro y sin «perder».
2. **No se representa la violencia** ni a víctimas ni a agresores como personajes.
3. **No se usan nombres de víctimas sin el consentimiento de sus familias.** Por defecto, el nivel no nombra a nadie. Si la familia lo autoriza, a través del equipo de Madero, se añade una dedicatoria.
4. **Aviso previo** con la opción de **saltarlo** sin penalización (el progreso cuenta igual).
5. **Recursos de ayuda** al final, ⚠️ con teléfonos verificados en fuentes oficiales antes de publicar (911 y líneas especializadas).
6. Cifras sobre feminicidio solo de fuentes oficiales (SESNSP, INEGI) y con fecha. ⚠️ De momento no se incluyen.
7. Sin la canción ni su letra (derechos). Música ambiental original, mínima.
8. Revisión previa por el equipo de Madero y, idealmente, por una organización especializada.

**Mecánica — «alzar la voz»:** calle nocturna en silencio y casi a oscuras. Pepe camina. El botón del micrófono ya no ataca: **Pepe canta (pose «shout»)** y una onda de luz despierta **luciérnagas** que suben y se quedan con él. Cada vez que alza la voz, el enjambre crece y la calle se ilumina: farolas, ventanas que se encienden y otras siluetas genéricas que se asoman a acompañar, nunca víctimas. Al final, las luciérnagas forman una gran luz sobre el escenario: un momento de silencio con la dedicatoria verificada de Madero y los recursos de ayuda.
**Lugar en el juego:** cierre del mundo *Sarajevo*, después del jefe y fuera del combate. También accesible desde el Museo («Sala de las luciérnagas»).
**Cambio derivado:** la luciérnaga **deja de ser un power-up o aliada** en el resto del juego. En los niveles oscuros, la luz pasa a ser un **farol**.

### 3.0d v5 · Mundo 1 «Carmesí» (✅ decidido el 2 nov 2026)
Referencias visuales: conceptos de Gemini rescatados por el usuario (`art/source/carmesi/`). Se usan como **guía de estilo**; los recursos del juego se rehacen sin texto ni sombras (personajes) o se dibujan por código (fondos).

**Estructura (3 niveles; en el prototipo, 1 min aprox. cada uno; se alargan tras probarlos):**
| Nivel | Escenario | Qué enseña | Final |
|---|---|---|---|
| 1-1 «Calle Carmesí» | Calle nocturna con balcones, telones rojos, papel picado y faroles; al fondo, la fachada del **Teatro Carmesí** | Correr, saltar, micrófono, primer gancho | Puerta del teatro |
| 1-2 «Azoteas» | Azoteas al atardecer: cables, tinacos, escaleras, cerros a lo lejos | Cadenas de ganchos, Rumor Volador, Micrófono Traidor | Claraboya del teatro |
| 1-3 «El Teatro» | Escenario con palcos, telón y **candelabro** (gancho) | Combate contra el jefe | Disco de Oro |

**Enemigos de Carmesí:** prensa recurrente (Titular, Paparazzi, Reportero) + **Rumor Volador** + **Micrófono Traidor** + **Espinas** (los pinchos `^` se dibujan como zarzas). *Lunes 28* y *Libro ruso* quedan para una revisión posterior (necesitan arte).

**Jefe: Cámara Flash-Bot («La Prensa Rosa»).** Cámara de fuelle antigua sobre patas de araña, con telón rojo y espinas (sustituye a la Rosa Carmesí). Máquina de fases:
1. **Camina** por el escenario hacia Pepe.
2. **Carga** (aviso de 0,8 s: el lente brilla).
3. **Rayo cegador** horizontal a ras de suelo (se salta) o, en la fase 2, a la altura de la cabeza (se esquiva quedándose en el suelo). Rayo suave, sin destellos de pantalla completa.
4. **Expuesto** (2 s): el lente se agrieta y echa humo; solo entonces el micrófono le hace daño.
- 6 golpes, **uno por apertura del lente**. Con 3 o menos entra en **fase 2**: camina más rápido y alterna rayo bajo y alto.
- **Entrada del jefe (cinemática, ~4,5 s, saltable con A/B tras 0,5 s):** bandas negras de cine y luz baja → Pepe entra solo al escenario (controles bloqueados) → el Flash-Bot **cae del techo** (temblor y polvo) → se encienden sus focos y aparece el cartel **«JEFE · CÁMARA FLASH-BOT · «LA PRENSA ROSA»»** → «¡A ESCENA!» y empieza el combate. Durante la cinemática el cronómetro no corre, el jefe no ataca y no hay daño. Sin destellos de pantalla completa.
- Al vencerlo se deshace en pétalos y deja el **Disco de Oro** (*Carmesí* fue Disco de Oro en nov. 2016, Wikipedia).

**Ritmo («dinámico y rápido»):**
- Más velocidad (130 → 165 px/s) y más aceleración; al soltar el gancho se **conserva el impulso** para encadenar ganchos.
- Enemigos de **un golpe** con **parón de impacto** (4 fotogramas) y temblor de cámara leve.
- **Combo:** vencer enemigos con menos de 2 s entre uno y otro multiplica los puntos (100 × combo).
- **Marcador** de 7 dígitos y **cronómetro** en el HUD; tiempo final por nivel.
- La frase verificada de Madero aparece al vencer a un **Titular** (no con cada enemigo), en un cartel más pequeño.

**Power-ups (v5):**
| Objeto | Carácter | Efecto |
|---|---|---|
| **Solo de guitarra** (especial) | — | Se carga la barra de **Ovación** (vencer enemigos, más con combo). Llena + botón especial (C / ★ / botón Y del mando): onda que **vence a todos los enemigos en pantalla**; al jefe le quita 1 golpe. 1 s de invulnerabilidad. Guitarra de diseño propio, sin marcas |
| **Amplificador** | `A` | El micrófono alcanza el doble durante 10 s |
| **Carta de fan** | `+` | Recupera 1 corazón (máx. 3) |
| **Farol** | — | Mundos oscuros (Noche, Sarajevo). No se usa en Carmesí |

La barra de Ovación conecta con el final («la barra es el cariño del público»).

### 3.0e v6 · Historia del Mundo 1, datos de época, trajes y Galería (✅ aprobada, 2 nov 2026)

**Historia y datos aprobados por el usuario.** Las piezas del Mundo 1 son **«pequeños Carmesís»** (monedas rojas con una rosa; evocan el disco sin copiar la portada). Implementado: `src/data/carmesi-story.js` (datos de los Titulares sin repetir, capítulos y tarjetas por nivel). En el Museo, la **Sala Carmesí** está vacía. Pepe revive 2016 para llenarla.
| Nivel | Capítulo | Por qué está ahí (cartel de 2 s al empezar) | Base verificada |
|---|---|---|---|
| 1-1 Calle | **«Lunes 28»** | «28 de febrero de 2016. Termina el último concierto en la Arena Ciudad de México. A medianoche sale su primera canción en solitario. Las canciones que guardaba desde 2008 se le vuelan por la calle». Piezas = hojas de canciones | D1, D2, D6 |
| 1-2 Azoteas | **«Plural siendo singular»** | «Abril de 2016. Sale su primer sencillo y la prensa toma la calle. Para llegar al teatro, Pepe va por encima del ruido» | D4, D5 |
| 1-3 Teatro | **«La presentación»** | «29 y 30 de septiembre de 2016: Teatro Metropólitan». La Prensa Rosa quiere la foto antes de que cante. Premio: Disco de Oro | D9, D7 |
> Cierre redondo: el juego empieza en la Arena (2016) y termina en la Arena (concierto final).

**Datos de la época (salen al vencer a un Titular, sin repetirse; uno distinto en cada tarjeta de nivel).** ✅ = 2 o más fuentes · ⚠️ = 1 fuente o fuentes que no coinciden (no se usan hasta confirmar).
| ID | Dato | Fuentes | Estado |
|---|---|---|---|
| D1 | El 28 feb 2016 fue el último concierto de Panda antes de su pausa, en la Arena Ciudad de México; a las 0:00 del lunes 29 apareció «Lunes 28» en streaming | Wikipedia ES (Carmesí), CineMedios | ✅ |
| D2 | «Lunes 28» fue el adelanto del proyecto, no un sencillo oficial; abre el disco | Wikipedia EN y ES | ✅ |
| D3 | El 28 mar 2016 anunció *Carmesí* en sus redes | Wikipedia ES, The Electroside | ✅ |
| D3b | Se grabó y mezcló en enero de 2016 en Estudios DMY (Monterrey), con Gil Elguezabal; en los créditos, José Madero Vizcaíno figura como **productor** (no «lo hizo todo solo»: hay ingeniero, músicos y masterización de Jaime Cavazos en OVU) | Créditos del disco en Discogs (edición estándar y Deluxe), Qobuz, Wikipedia ES | ✅ con este matiz (⏳ el usuario lo revisa) |
| D4 | «Plural siendo singular» fue el primer sencillo; su vídeo se estrenó el 8 abr 2016 | Wikipedia EN, El Siglo de Torreón | ✅ |
| D5 | *Carmesí* salió el 29 abr 2016 con 13 canciones | Wikipedia EN, El Siglo de Torreón, Excélsior | ✅ |
| D6 | La mayoría de las canciones se escribieron entre 2008 y 2010 y nunca se usaron en Panda | Wikipedia ES, Zeta Tijuana | ✅ |
| D7 | Fue Disco de Oro en 2016 (más de 30.000 copias) | Wikipedia ES, Jackson Live, blog El arte me llama | ✅ (mes ⚠️: oct. o nov.) |
| D8 | monitorLATINO lo nombró Artista Revelación México 2016 (lista publicada el 10 dic 2016) | monitorLATINO (fuente original), LJZ 2025 | ✅ |
| D9 | Presentó *Carmesí* en el Teatro Metropólitan el 29 y 30 sep 2016, con un show anunciado de unas 2 horas y 23 canciones | Excélsior, El Universal, Reconoce MX, Revista Kuadro | ✅ |
| D10 | Edición Deluxe (oct. 2016): 5 canciones extra, entre ellas versiones de Vicentico («Sólo un momento») y Los Auténticos Decadentes («El pájaro vio el cielo y se voló»), y un DVD de la grabación | Zeta Tijuana, Apple Music, Amazon MX, Wikipedia EN | ✅ |
| D11 | El Tour Carmesí llegó a Buenos Aires y Lima en diciembre de 2016 | Concert Archives, Wikipedia ES | ✅ |
| D12 | Cita: «No por ser artista tengo que ser un súper hombre» (sep. 2016) | El Universal, Noroeste, Vanguardia | ✅ |
| D13 | «Sinmigo» fue sencillo de *Carmesí*, con vídeo oficial el 19 ago 2016: Madero con ropa de época y una turba que quiere quemarlo en la hoguera; primer guiño al terror en sus vídeos | Revista Kuadro, Apple Music, YouTube oficial, Wikipedia ES | ✅ (que sea el 2.º o el 3.er sencillo ⚠️ no coincide) |
| — | ❌ **«La noche de la mesa triste» NO es de *Carmesí*:** es de PXNDX (*Bonanza*, 2012). La Wikipedia EN de *Carmesí* lo pone mal → **no usar la Wikipedia EN de *Carmesí* como fuente única** | Usuario; Spotify, Letras.com | Corregido |
| D14 | El vídeo de «Plural siendo singular» se grabó en el Parque Nacional Cumbres del Ajusco | Wikipedia EN | ⚠️ 1 fuente |
| D15 | Estuvo entre los 10 discos más vendidos de México en mayo de 2016 | Wikipedia (según AMPROFON) | ⚠️ 1 fuente |
| D16 | Rechazó presentarlo en el Auditorio Nacional | La Prensa (OEM) | ⚠️ 1 fuente |
| D17 | Rodrigo «Bucho» Montfort, director musical, tocó todos los teclados y llevó las trompetas, el cuarteto de cuerdas, las flautas y el acordeón, y entregó las partituras a los músicos de sesión; trabajaron sobre las sesiones de las maquetas en Digital Performer | Sound:check (entrevista), Discogs (director musical, teclados), IMDb, montfortmusic.com | ✅ |
| D18 | Las 13 canciones tienen letra y música de José Madero | Intolerancia Diario, Discogs, Wikipedia ES | ✅ |
| D19 | En 2015 empezó con Andreas Östberg el podcast «Dos Nombres Comunes» | Apple Podcasts, iVoox, Spotify | ✅ |
| D20 | Bajo: Andrés Zablah; batería: «Pecas» Martínez | Discogs, Wikipedia ES | ✅ |
| — | ❌ No confirmado (texto aportado por el usuario, 2 nov): que Roberto Martínez sea coanfitrión del podcast (solo aparece como invitado) o que el podcast filtrara la selección de canciones; que la base la grabara «Los Lemons»; que Madero financiara el disco de forma independiente (salió con EMI / Universal); trombón y corno francés. **No se usan.** | Búsquedas sin resultado | ❌ |
No se usan: polémicas de la firma de autógrafos ni la acusación de plagio de la portada (son de prensa negativa y no aportan al homenaje).

**Escenarios (v6):** Gemini no separa capas; cada escena completa se usa como **fondo panorámico** de 224 px de alto que recorre la imagen de un borde al otro a lo largo del nivel (sin repetirse ni costuras). El cartel en blanco de las Azoteas lleva «COLORES RUIDOSOS» puesto por código. En las Azoteas sale el **Cerro de la Silla** (Monterrey) en lugar de los volcanes del prompt ⏳ (el usuario decide).

**Trajes (decidido).** Uno por mundo y el resto desbloqueables en la **Galería del Museo**:
| Traje | Uso |
|---|---|
| Clásico (camiseta blanca y bandana roja) | Por defecto (Carmesí) |
| Vampiro | Mundo **Noche** |
| Rojo y amarillo (traje rojo, camisa amarilla y moño) | Mundo **Sarajevo** |
| Bandana negra (chaleco y guitarra) | Mundo **Querido…** |
| Emo (negro con lentes oscuros) | Desbloqueable (según el usuario, es el que usó en el Foro GNP ⚠️; no se pone en pantalla hasta tener fuente) |
| Gris con boina · chamarra universitaria · botarga morada | Desbloqueables |
- **Riesgo aceptado por el usuario:** la botarga morada es Tinky Winky (Teletubbies, personaje registrado). Se mantiene; recomendación: sin nombre en pantalla y solo como desbloqueable.
- **Guitarra:** la turquesa de la hoja recuerda a un modelo comercial; para el Solo se usa una de forma propia.
- Las hojas de trajes traen 4 poses (reposo, correr, saltar, lanzar micro). Faltan aterrizaje, daño, KO, victoria y grito → prompt aparte.
- **Galería:** cada traje se desbloquea con un reto (p. ej. las 6 piezas de un nivel, vencer al jefe sin daño, terminar el mundo en menos de X min) y se ve en una vitrina con su nombre y el reto.

### 3.0f v7 · Opciones, guardado, Museo, Galería de trajes y Mundo 2 «Noche» (2 nov 2026)

**Por qué:** el juego va a vivir en la web de Colores Ruidosos. Ahí lo va a abrir gente que no conocemos: hay que respetar la fotosensibilidad, dejar jugar a quien no es experto y no perder el progreso al cerrar la pestaña. El Museo y los trajes dan estructura a los 8 mundos. *Noche* es el segundo mundo del piloto recomendado (Carmesí + Noche).

#### A. Opciones (G11, NFR de accesibilidad)
Se abren desde la portada y desde la pausa. Se guardan.

| Opción | Por defecto | Qué hace |
|---|---|---|
| **Destellos** | Sí | «No»: sin el velo del flash del Paparazzi, sin el anillo del Solo, sin el destello de la cinemática y sin parpadeos. El rayo y la carga del jefe se ven fijos, sin parpadear. El parpadeo de invulnerabilidad pasa a semitransparente. **La mecánica no cambia** (el flash sigue congelando), solo el efecto |
| **Temblor** | Sí | «No»: la cámara no tiembla |
| **Modo asistido** | No | No se pierden corazones (los golpes empujan igual) y caer a un foso te devuelve al checkpoint sin perder vida. Se marca «ASISTIDO» en el HUD. **No cuenta para los retos «sin daño»** ni para los récords |
| **Música** | Sí | Igual que la tecla M |

- El **remapeo de teclas** se queda para la fase de publicación (P1b).
- Navegación: ◀ ▶ o ▲ ▼ para elegir, A para cambiar y B para salir. En el teclado, también Enter y Escape.

#### B. Guardado (G9, tarea E5)
- Módulo puro `src/engine/save.js` con el almacenamiento inyectado (en el navegador, `localStorage`; en los tests, memoria).
- Esquema `v: 1`: `options`, `worlds` (por mundo: niveles superados y mejor marca por nivel: tiempo, puntos y piezas), `unlocked` (trajes), `costume` (`auto` o un traje), `record`.
- Datos dañados, de otra versión o sin almacenamiento disponible: se empieza de cero sin romper el juego.
- Se lee el récord antiguo (`jmv-record`) para no perderlo.
- Se guarda al superar un nivel, al desbloquear un traje y al cambiar una opción.

#### C. El Museo (hub; G2, tarea J6)
- Tras la portada, Pepe aparece en un **pasillo del museo** que se recorre como un nivel: sin enemigos, sin cronómetro y sin daño.
- Hay **8 puertas**, una por disco, con su color y su año. Encima de cada puerta, una vitrina muestra las piezas recogidas: «12/18».
- **Puerta abierta**: Carmesí siempre. *Noche* se abre al terminar Carmesí. Las demás dicen «PRÓXIMAMENTE».
- **Al final del pasillo, la Galería de trajes.**
- **Entrar:** ponerse delante de una puerta abierta y pulsar B (micrófono). Aparece el aviso «B ENTRAR».
- Al terminar un mundo, o tras perder todos los corazones y elegir salir, se vuelve al Museo delante de su puerta.
- Un mundo siempre empieza en su primer nivel; los puntos se reinician al entrar.
- El récord se guarda por mundo.

#### D. Galería de trajes (H5)
Es una pantalla con 8 vitrinas. ◀ ▶ elige; A se pone el traje desbloqueado; B sale.

- **AUTOMÁTICO** (por defecto): cada mundo usa su propio traje. El clásico en Carmesí y el de vampiro en *Noche*.
- Si eliges un traje, se usa en todos los mundos.

| Traje | Cómo se desbloquea (el texto sale en la vitrina) |
|---|---|
| Clásico | Desde el principio |
| Gris con boina | Recoger todos los Carmesís de un nivel del Mundo 1 |
| Chamarra universitaria | Terminar el Mundo 1 en menos de 4:00 (suma de los 3 cronómetros) |
| Botarga morada | Vencer al Flash-Bot sin recibir daño (sin modo asistido). **Sin nombre de personaje en pantalla** |
| Negro con lentes | Recoger todos los Carmesís del Mundo 1. Su origen (Foro GNP) sigue sin fuente ⚠️: en pantalla solo sale «NEGRO CON LENTES» |
| Vampiro | Terminar el Mundo 2 «Noche» (allí se lleva puesto en modo automático) |
| Rojo y amarillo | «SE GANA EN EL MUNDO 7» (aún no se puede) |
| Bandana negra | «SE GANA EN EL MUNDO 8» (aún no se puede) |

**Arte de los trajes:** `art/source/pepe-trajes-1.jpg` y `-2.png` traen 4 poses por traje: reposo, correr, saltar y lanzar. Se recortan con `scripts/slice_costumes.py`, que quita el micrófono dibujado al lanzar, porque el juego pinta su propio cable.

Hasta que lleguen las poses que faltan:

| Pose que falta | Se usa en su lugar |
|---|---|
| Aterrizaje y agachado | Reposo |
| Daño | Salto |
| KO y victoria | Reposo |
| Grito (Solo) | Lanzar |

Así nunca se mezclan dos trajes en el mismo personaje.

#### E. Mundo 2 «Noche» (W2): versión v7. **La sustituye §3.0f G** en niveles, reparto y jefe
**Datos que usa** (todos ya verificados en la tabla de fuentes; ⏳ falta que los apruebes para este uso):

| ID | Dato en pantalla | Fuentes |
|---|---|---|
| N1 | *Noche* (2017) es el segundo disco de José Madero en solitario | Wikipedia (Noche), Milenio |
| N2 | «Noche de brujas» fue su primer sencillo: 9 de junio de 2017 | Wikipedia (Noche), Revista Kuadro |
| N3 | «Noche de brujas» no habla de Halloween: habla de las máscaras sociales | Milenio, Looking Back |
| N4 | El videoclip de «Noche de brujas» es en blanco y negro, un homenaje al cine de terror clásico | Revista Kuadro, Milenio |
| N5 | En la gira de *Noche* el escenario se llenó de figuras del terror clásico | ABC Noticias, El Alebrije |
| N6 | «Fantasmas» sonaba en los conciertos de la gira *Noche* | El Alebrije, Soulwavez |
| N7 | Madero es fan del cine de terror y de Stephen King | Milenio, Looking Back |

- N5 no nombra a ningún personaje registrado.
- N1 depende de que *Carmesí* (2016) sea su primer disco solista, dato que ya está verificado.

**Piezas del mundo:** **pequeñas lunas plateadas** (12–13, como en Carmesí), dibujadas por código.

**Ambientación:** todo en **blanco y negro**. Los sprites de Pepe y de la prensa pasan a escala de grises al cargar el mundo; los fondos y bloques se dibujan por código con luna, cabañas, lago y niebla. El HUD conserva el color.

**Mecánica del mundo: el farol.** Encaja con la regla del memorial: la luciérnaga no es un power-up y en los niveles oscuros se usa un farol.
- En 2-2 y 2-3 todo está a oscuras salvo un círculo de luz alrededor de Pepe.
- El farol gasta aceite poco a poco. La luz baja de 96 px a un mínimo de 40 px: **nunca se queda a oscuras del todo**.
- Las **latas de aceite** `L` lo rellenan.
- Los Fantasmas solo se ven dentro de la luz.

| Nivel | Capítulo (cartel) | Contenido |
|---|---|---|
| 2-1 La Fiesta | **«Noche de brujas»** — «Junio de 2017. Sale "Noche de brujas", el primer sencillo de *Noche*. No habla de Halloween: habla de las máscaras que nos ponemos. La fiesta de disfraces ya empezó.» | Calle de noche con farolas, sin farol. Invitados enmascarados, Murciélagos, Titulares |
| 2-2 Las Cabañas | **«Fantasmas»** — «En la gira de *Noche*, el escenario se llenó de figuras del terror clásico y sonaba "Fantasmas". Junto al lago, las cabañas están a oscuras.» | A oscuras con farol, latas de aceite, Fantasmas, Murciélagos y ganchos entre cabañas |
| 2-3 El Lago | **«El Enmascarado»** — «Al fondo del muelle espera alguien con máscara. Quizá, debajo, haya alguien como tú.» | Jefe |

La frase del capítulo 2-3 es **ficción del juego**, no un dato: no lleva fuente.

**Enemigos propios de Noche** (como se definieron en §3.2 y en `art/PROMPTS-GEMINI.md` §5; ✅ confirmado por el usuario el 2 nov). Se dibujan por código en blanco y negro hasta tener el arte de Gemini (`w2-invitado.png`, `w2-fantasma.png`, `w2-murcielago.png`):

| Enemigo | `char` | Comportamiento |
|---|---|---|
| **Invitado enmascarado** | `I` | Traje elegante y **máscara veneciana negra**. Patrulla y, si te ve, se acerca deprisa. Al primer golpe (pisotón o micrófono) **pierde la máscara y cambia de comportamiento** (§3.2): cara sorprendida, **más rápido**, y sigue atacando. El segundo golpe lo vence. El Solo de guitarra lo vence de una vez. Cada golpe da puntos |
| **Murciélago** | `W` | Chibi con colmillos. Cuelga del techo. Cuando Pepe pasa cerca, baja en curva y vuelve a subir |
| **Fantasma** | `O` | Flota hacia Pepe despacio y atraviesa paredes. Solo se ve dentro de la luz del farol (en 2-1, con las farolas). Se vence con el micrófono o pisándolo |

**Jefe: El Enmascarado del Lago** ⏳ (provisional). **v7.2** (feedback del usuario, 2 nov: «muy fácil, va de aquí para allá»). Máquina de fases con **8 golpes**; la fase 2 llega con 4 o menos.

1. **Acecho**: sus ojos aparecen sobre el muelle más alejado de Pepe y salta allí. El aviso dura 0,8 s en la fase 1 y 0,55 s en la fase 2.
2. **Embestida** (230 px/s; 270 px/s en la fase 2): corre hacia Pepe por el muelle. Se salta por encima.
3. **Fase 2, doble embestida:** al chocar con la pared se da la vuelta y embiste otra vez, sin pararse. Solo queda aturdido tras el segundo choque.
4. Tras chocar queda **aturdido 1,0 s** (antes 1,6). Es vulnerable al micrófono o al pisotón, y solo admite **un golpe por aturdimiento**.
5. **Fase 2, apagón:** antes de cada acecho hay un apagón de 1 s en el que solo se le ven los ojos.
6. **Al vencerlo:** se quita la máscara y deja la **Máscara de fiesta**, que completa el mundo.
   - 🐞 Corregido: la máscara **nunca cae dentro de una pared**. Cae del lado libre y a menos de una casilla de los muros; si no, se recoloca hacia el centro.
   - Esta misma regla se aplica al Disco de Oro del Flash-Bot.

- **Riesgo legal:** nada de máscara de hockey ni de personajes de terror registrados. La máscara es un antifaz de fiesta, de diseño propio.
- **Museo:** la puerta de *Noche* es negra con marco blanco; el año sale en la puerta.


#### F. v7.3 · Correcciones del usuario (2 nov 2026)
- **🐞 La pantalla «se recarga» al girar a la izquierda.** La cámara mira un poco por delante de Pepe (24 px). Al girarse, ese margen cambiaba de lado en un solo fotograma y toda la pantalla saltaba 48 px.
  - **Arreglo:** el margen se desliza (1,5 px por fotograma).
  - Si la cámara tiene que moverse mucho de golpe (por ejemplo, al empezar el combate con el jefe), se desliza en vez de saltar. Pepe a velocidad máxima sigue encuadrado igual.
  - Al cargar un nivel, la cámara se coloca directamente, sin deslizarse.
- **Datos repetidos en Noche.** Los carteles de capítulo contaban los mismos datos que luego repetían los Titulares y las tarjetas.
  - **Regla nueva (para todos los mundos):** cada dato (por su ID) sale **una sola vez** en todo el mundo, sumando capítulos, Titulares y tarjetas.
  - Los capítulos cuentan la historia (ficción) y como mucho declaran un dato (`uses`).
  - Los Titulares no repiten datos: si se acaban, solo gritan su titular.
  - **Dato nuevo verificado:** N8, «*Noche* salió el 28 de julio de 2017» (AllMusic, Diario de México). Time Out México menciona una presentación el 14 de abril; no se usa esa fecha.
  - **Candidatos con una sola fuente** (⚠️ no se usan hasta tener la segunda): «Noche de brujas» fue la tercera canción que compuso para el disco y marcó su tono oscuro (Time Out México, entrevista); todas las canciones pasan por alguna actividad nocturna (Milenio); n.º 1 en México la semana del 3 ago 2017 (Wikipedia); la última pista es «Natt i Stockholm» (Time Out México).

#### G. v8.1 · Noche es la fiesta de disfraces (✅ aprobado por el usuario, 2 nov 2026)
**Historia del mundo (ficción del juego):** Pepe, sin memoria, llega a una **fiesta de disfraces** en una casona junto a un lago. Todo el mundo transcurre en la fiesta. El final es el duelo contra **El Enmascarado** en el muelle.

| Nivel | Capítulo | Dónde | Farol |
|---|---|---|---|
| 2-1 El Jardín | «NOCHE DE BRUJAS» (declara N2) | Jardín de la casona con farolillos y papel picado; la fiesta en marcha | No |
| 2-2 La Casona | «SE VA LA LUZ» | Dentro de la casona: pasillos, escaleras y salones. Se va la luz | Sí |
| 2-3 El Muelle | «EL ENMASCARADO» | Muelle con barcas y plataformas (más altura) | Sí |

**Reparto: los invitados disfrazados.** Monstruos clásicos de **dominio público** en versión genérica y **leyendas mexicanas** (de dominio público), todos con diseño propio.
- **Prohibido:** máscara de hockey, suéter de rayas con guante de cuchillas, cabeza plana con tornillos en el cuello, y nombres o caras de actores o películas.
- Por eso no hay Jason ni Freddy: lo que los hace reconocibles es justo lo que está protegido.

| Invitado | `char` | Arte | Comportamiento | Al perder el disfraz |
|---|---|---|---|---|
| **Vampiro** (murciélago) | `W` | Hoja de ChatGPT | Cuelga del techo y se lanza en curva | — (vencido de un golpe) |
| **Fantasma** | `O` | Hoja de ChatGPT | Flota hacia Pepe, atraviesa paredes y solo se ve con luz | — (vencido de un golpe) |
| **Gigante cosido** | `K` | Código | Lento (20 px/s); su empujón lanza más lejos; hacen falta **2 golpes** para quitarle el disfraz | Persona con un disfraz de cartón roto |
| **Hombre invisible** | `N` | Código | Camina hacia Pepe. Fuera de la luz solo se ven el sombrero, las gafas y los guantes | Se le caen las vendas: persona sorprendida |
| **Hombre anfibio** | `U` | Código | Espera en el agua (un foso). Cuando Pepe se acerca, **avisa con burbujas 0,45 s** y salta en arco. Así se puede esperar a que caiga y cruzar después | Persona con traje de buzo de fiesta |
| **La Llorona** | `Q` | Código | Flota despacio hacia Pepe. Su llanto (a menos de 64 px) lo **frena** 1 s, a mitad de velocidad. No hace daño, solo frena | Muchacha disfrazada que se ríe |
| **Charro Negro** | `X` | Código | Como el Reportero: se prepara y embiste | Persona con traje de charro de fiesta |

**Regla de los disfrazados** (K, N, U, Q, X): el primer golpe le quita el disfraz y entonces va **más rápido** y sigue atacando; el segundo golpe lo vence. El Gigante necesita 2 golpes para perder el disfraz. El Solo de guitarra los vence de una vez.

- **Se retira** el invitado de frac de la hoja de ChatGPT (`I`): sus sprites quedan en `art/source/`, pero no se usan.
- **Sprites por código, estilo Neo Geo:** se pintan formas planas en una rejilla pequeña y el generador añade **contorno oscuro** y **3 tonos por color** (luz arriba a la izquierda, sombra abajo a la derecha). Cada animación tiene de 4 a 6 fotogramas, con anticipación y retroceso. Se generan una vez al cargar, nunca en el bucle.

**Jefe: El Enmascarado** (sustituye a §3.0f E «Jefe»; ✅ propuesta §1.1c aprobada). **8 golpes**; la fase 2 empieza con 4 o menos. Elige el siguiente ataque con un generador pseudoaleatorio propio y determinista, **sin repetir el anterior**. Cada ventana de vulnerabilidad admite **un golpe**.

| Ataque | Fase | Cómo se esquiva | Ventana vulnerable |
|---|---|---|---|
| **Embestida** | 1 y 2 | Saltar | Aturdido 1,0 s tras chocar con la pared (en la fase 2, tras rebotar una vez) |
| **Salto encima** | 1 y 2 | Apartarse. Al caer lanza dos ondas por el suelo (160 px/s); se saltan | 0,8 s al aterrizar |
| **Máscaras** | 1 y 2 | Tres antifaces en abanico (150 px/s). Se esquivan o se rompen con el micrófono | 0,8 s mientras recarga |
| **Niebla** | 2 | Desaparece (solo los ojos, 0,6 s) y reaparece **detrás** de Pepe con un zarpazo | 0,6 s tras el zarpazo |
| **Invitados** | 2 | Llama a 2 disfrazados (Charro Negro y Gigante) si no queda ninguno de los suyos | 1,0 s mientras los llama |

- **Fase 2:** antes de cada ataque hay un apagón de 0,6 s con solo los ojos visibles, y se mueve más deprisa.
- **Al vencerlo:** se quita el antifaz, debajo hay una persona amable que sonríe y saluda, y deja la **Máscara de fiesta**. La recompensa nunca cae dentro de una pared.
- **Arte:** hoja de ChatGPT (caminar, embestida, salto, lanzar, aturdido y quitarse la máscara).

**Historia del juego (✅ §1.1b aprobada).** Esta entrega incluye:
- el prólogo de 5 viñetas;
- el retrato de 8 piezas en el Museo y el contador «IDENTIDAD n/8»;
- Pepe desaturado que gana color con cada mundo;
- la tarjeta «RECUERDO RECUPERADO» al vencer a cada jefe;
- los pensamientos en los checkpoints;
- la línea de Pepe al volver al Museo.

Quedan para después los créditos que separan los datos de la ficción (S4).

#### H. v8.2 · Más ayudas (feedback del usuario, 2 nov 2026: «los niveles se hacen muy complicados»)
**Cartas de fan (+1 corazón, máximo 3):**
- Al menos **3 por nivel** normal.
- **Cada 6 enemigos vencidos**, el último deja caer una carta.
- **Con el jefe:** cada 2 golpes que le das cae una carta en el centro del escenario, si te falta algún corazón.
- **Más checkpoints:** al menos 3 por nivel normal.

**Power-ups nuevos** (del banco de ideas §3.4, adaptados):

| Objeto | `char` | Efecto | Duración |
|---|---|---|---|
| **Púa de guitarra** | `J` | Cada vez que lanzas el micro, sale además una púa que vuela recto (300 px/s, 200 px) y golpea al primer enemigo o al jefe (si está vulnerable) | 15 s |
| **Antifaz de la fiesta** | `Z` | Invencible: los enemigos que tocas quedan vencidos y el jefe no te hace daño. Sustituye a la «máscara de hockey» del banco, que no se usa por derechos | 8 s |

Al menos uno de los dos en cada nivel normal; el Amplificador `A` sigue.

**Continuar:** al entrar por la puerta de un mundo se empieza en el **primer nivel sin superar**. Si el mundo ya está terminado, se empieza desde el principio. Sustituye a «un mundo siempre empieza en su primer nivel» (§3.0f C).

**Guardado:** se guarda en el navegador (`localStorage`), por dispositivo y por dirección web.
- El HTML abierto desde el ordenador y la web tienen guardados distintos.
- Se guarda al superar un nivel, no a mitad de nivel.

#### I. v8.3 · Salón de fiestas, color, portada, escenas y festejo (pedido del usuario, 2 nov 2026)
**Noche: afuera y dentro de un salón de fiestas.** El nivel 1 transcurre afuera de la fiesta; los demás, dentro de un salón de fiestas, como en el video de «Noche de brujas». El video es en blanco y negro y homenajea al terror clásico (dato verificado). La ambientación se dibuja por código y es de diseño propio.

| Nivel | Nombre | Escenario | Farol |
|---|---|---|---|
| 2-1 | LA ENTRADA | Calle frente al salón: fachada con marquesina de focos (sin letreros), fila de invitados disfrazados en silueta, farolas y papel picado; estanques en el jardín de enfrente | No |
| 2-2 | EL SALÓN | Interior: ventanales con cortinas, candelabros apagados, mesas con mantel y globos, suelo ajedrezado. Se va la luz | Sí |
| 2-3 | LA PISTA | Pista de baile: escenario de la orquesta (instrumentos en silueta, sin marcas), candelabros y suelo ajedrezado; las plataformas son los palcos | Sí |

- El jefe pasa a llamarse **El Enmascarado**: ya no hay lago.
- Los capítulos y los pensamientos se ajustan a la nueva ambientación.

**Pepe a todo color.** La desaturación de §1.1b se quita: el usuario la notó «muy gris».
- Pepe se ve con su color en los niveles y en el Museo.
- La identidad perdida solo se ve en el **retrato** del Museo y en la viñeta 4 del prólogo, donde Pepe sale en gris.

**Portada solo con el nombre:** el sello JMV y el título, más tres líneas pequeñas:
- «PULSA START»;
- «B: OPCIONES»;
- «HOMENAJE NO OFICIAL · @COLORESRUIDOSOS», que es obligatoria por la decisión legal.

Sin personajes. El título está en una sola constante (`GAME_TITLE`) para poder cambiarlo. ⏳ El usuario decide el nombre definitivo.

**Escenas de cada mundo (saltables con B):**
- **Entrada:** al entrar a un mundo por su primer nivel, 2 viñetas.
- **Salida:** tras el «RECUERDO RECUPERADO», 2 viñetas.
- Mismo formato que el prólogo, con `kind`: los datos llevan fuente y la ficción va marcada.

**Pose de festejo** (como en los juegos de acción clásicos):
1. Al recoger la recompensa del jefe, la acción se congela 3 s.
2. Pepe hace su pose de victoria (la animación `win` de la hoja oficial; con traje, salto y reposo), con un foco, confeti y el cartel «¡JEFE VENCIDO!».
3. A los 0,5 s, A lo salta.

#### J. v9 · El Museo con fondo de ChatGPT y exposición que se llena (4 nov 2026)
**Fondos:** `art/source/museo/museo.png` y `art/source/carmesi/w1-teatro.png` (ChatGPT, prompt §0f). El Teatro sustituye al fondo por código del nivel 1-3 ✅. Noche: `art/source/noche/w2-afuera.png`, `w2-salon.png` y `w2-pista.png`, importados en gris ✅. Para que se vean, la penumbra fuera del farol depende del escenario: El Salón (sin luz) 0,78 y La Pista (candelabros encendidos) 0,6. La mecánica no cambia: los fantasmas solo se ven dentro de la luz: pasillo bajo una carpa, con cuadros dorados y vitrinas vacías. Se importa con `scripts/import_backdrop.py`, que ahora **añade** el fondo al archivo sin borrar los de Carmesí.

**La exposición** (dibujada por código encima del fondo, en sus marcos):

| Lugar | Contenido | Cuándo se ve |
|---|---|---|
| Cuadro 1 | Carmesí: una rosa roja sobre fondo oscuro (evoca la portada, no la copia) | Al terminar Carmesí |
| Cuadro 2 | Noche: un antifaz blanco sobre negro | Al terminar Noche |
| Cuadro 3 | Alba: un sol que amanece sobre blanco | Al terminar Alba (aún no existe) |
| Vitrina 1 | Disco de Oro | Al terminar Carmesí (*Carmesí* fue Disco de Oro en 2016, dato verificado) |
| Vitrina 2 | Partitura | Siempre. Pieza real del museo: la partitura original de «Plural siendo singular» (MVS Noticias, El Horizonte, Info7) |
| Vitrina 3 | Máscara de fiesta | Al terminar Noche (recompensa del jefe) |

- Lo que aún no se ha ganado se ve vacío, con un «?».
- Sin texto en las vitrinas, así que no se afirma nada en pantalla.

#### K. v9 · Ilustraciones de las escenas (ChatGPT)
- Se importan con `scripts/import_scene.py id=imagen@y0`, que recorta la franja de la viñeta (320×150, 64 colores) y las guarda en `src/data/scenes-art.js`. Las viñetas sin ilustración se siguen dibujando por código.
- ✅ Hechas: p2 (la Arena), p3 (titulares) y p5 (puertas). ⏳ Faltan p1 y p4, y las 8 de los mundos.
- ⚠️ **p2, riesgo aceptado por el usuario (4 nov 2026):** la imagen va **tal cual**, con un cartel que lleva la cara realista del artista (no el Pepe de CR), su nombre, el de la gira y el logotipo de la Arena CDMX. Es una excepción a las reglas de §1 («nada de logotipos de terceros»), igual que la botarga morada. Revisarla antes de una publicación oficial y si el equipo de Madero da su visto bueno. La fecha va también en el texto de la viñeta, con sus fuentes.

#### L. v9.1 · Guía de objetos y ganchos más claros (pedido del usuario, 4 nov 2026)
**Revisión de los ganchos** (8 en los 6 niveles):
- Todos se alcanzan y, una vez enganchado, Pepe cruza siempre el foso (378 de 378 intentos simulados por gancho).
- **Lo que fallaba no era la física, sino cómo se ven:**
  - 🐞 parpadeaban siempre (4 Hz), también con «Destellos: no»;
  - en El Salón (2-2) quedaban a oscuras;
  - nada indicaba cuándo estaban a tiro.
- **Arreglo:**
  - quietos sin destellos;
  - se pintan por encima de la oscuridad del farol;
  - cuando el micro llegaría al gancho si se lanza ahora (misma regla de puntería que el juego, `aimHook`), aparece una «B» sobre él.

**Guía de objetos:** pantalla con cada objeto (su dibujo, su nombre y para qué sirve).
- **Cómo se abre:** desde Opciones («GUÍA DE OBJETOS») y desde la pausa (▶).
- **Qué incluye:** Carta de fan, Amplificador, Púa de guitarra, Antifaz, Aceite, Solo de guitarra (Ovación), piezas (Carmesís y lunas) y ganchos.
- **Primera vez:** al recoger un objeto por primera vez, sale abajo su explicación de una línea durante 3 s. Queda guardado (`seenItems`) para no repetirlo.

#### M. v9.2 · Enseñar los ganchos y revisar los datos de Carmesí (pedido del usuario, 4 nov 2026)
**Ganchos: que el jugador sepa que se puede colgar.**
- **Cartel en 1-1**, como el de los controles, poco antes del primer gancho, con el dibujo de un gancho: «¡GANCHO! SALTA Y PULSA X / B CERCA DE ÉL: TE CUELGAS Y SALES DISPARADO».
- **Aviso la primera vez que se ve un gancho:** antes se explicaba después de usarlo. Ahora salta cuando hay un gancho delante a menos de 140 px (`hookAhead`), y solo una vez.
- **La «B» sobre el gancho** cuando está a tiro (v9.1) se mantiene.

**Datos de Carmesí durante la partida (revisión):**

| Problema | Arreglo |
|---|---|
| 13 datos para 7 Titulares: 6 no salían nunca | Los datos que usan los capítulos salen de la lista. Dos enemigos pasan a ser Titulares (uno en 1-1 y otro en 1-2), así que hay un Titular por dato y se ven todos |
| Repetidos: los capítulos contaban lo mismo que los Titulares y las tarjetas; «Lunes 28» salía dos veces (dos D2) | Misma regla que en Noche: cada dato sale **una sola vez** por mundo. Cada capítulo cuenta la historia y declara como mucho un dato (`uses`): 1-1 → D2 («Lunes 28»), 1-2 → D4 (primer sencillo) y 1-3 → D9 (Metropólitan). La segunda frase de D2 se quita |
| Duraban 3 s aunque tuvieran 3 líneas, y uno tapaba al anterior | Duran **3 s + 1 s por cada 20 caracteres**, y si llegan dos seguidos **hacen cola**: se ven uno detrás de otro |

Los datos siguen siendo los aprobados (D1–D20, §3.0e) y en orden cronológico; no se añade ninguno.

#### N. v9.4 · Quitar las notas de la pantalla (pedido del equipo, 6 nov 2026)
- **Problema:** durante el juego, el dato verificado de abajo, el pensamiento de Pepe de arriba y el aviso del objeto nuevo tapan mucho la acción, sobre todo en el celular.
- **Opción nueva «NOTAS EN PANTALLA» (SÍ/NO)** en Opciones (desde la portada y desde la pausa). Por defecto SÍ y se guarda en `options.notas`. Las partidas guardadas antes la toman como SÍ.
- **Con NO**, durante el juego no salen: el dato del Titular, el pensamiento del checkpoint ni el aviso de objeto nuevo (que tampoco se da por visto, para que salga cuando se vuelvan a activar las notas).
- **Se mantiene:** el marcador, la barra de Ovación, la vida del jefe y la tarjeta «¿Sabías que…?» al terminar cada nivel. Los datos verificados no se pierden.
- **Atajos:** la tecla **N** y un botón **💬 NOTAS** en la barra bajo el juego, junto a PAUSA y ♪ (útil en el celular).
- **Mando táctil en celulares estrechos (mismo día):** en el navegador de Instagram la **A** quedaba fuera de la pantalla, porque los 5 botones medían siempre 72 px. Ahora se encogen con el ancho (entre 50 y 72 px, y la ★ entre 44 y 54) y caben de 320 px en adelante, sin bajar del mínimo táctil de 44 px.

### 3.1b Jugabilidad: mismos controles, un giro por mundo
Controles comunes: **correr, saltar, micrófono** (lanzar y recoger; en el aire sirve para engancharse a ganchos). Cada mundo añade **una** mecánica:

| Mundo | Giro de jugabilidad | Inspiración |
|---|---|---|
| Carmesí | **Clásico de acción** (tutorial): plataformas, enemigos y el micrófono | Base *Spin Master* |
| Noche | **Supervivencia a oscuras** en blanco y negro: linterna limitada; los enemigos solo se ven con luz | Terror clásico |
| Alba | **Luz y tiempo**: al amanecer aparecen plataformas; si te quedas quieto, la nostalgia te arrastra atrás | Concepto del disco |
| Psalmos | **Ascenso vertical** por una catedral, con tu sombra copiándote (puzle de sombras) | Peter Pan + espiritualidad |
| Giallo | **Sigilo**: los maniquíes se mueven cuando no los miras; luces que se apagan | Cine *giallo* |
| Aurora (EP) | **Paseo**: caminar y leer pasajes; la hiedra crece a tu paso | Portada del EP |
| Sarajevo | **Natación**: tramo submarino con oxígeno y faroles como guía; cierra con el memorial «Luciérnagas» (§3.0c) | «Rey Ahogado» |
| Querido… | **Mensajero**: llevar cartas entre torres medievales contra reloj; las cartas son checkpoints | Disco epistolar |
| Arena CDMX | **Concierto VS** (ritmo + acción): ver §3.3 | Playera «México vs. José Madero» |

### 3.2 Enemigos (borrador para definir)

Regla: cada enemigo sale de **un título de canción, una portada o un concepto verificado**, nunca de inventos sobre la vida privada del artista.

| Mundo | Enemigo | Referencia | Comportamiento |
|---|---|---|---|
| Carmesí | **Rumor Volador** (v5) | Prensa sensacionalista (genérica) | Periódico doblado como pájaro: planea en onda y **cae en picado** cuando Pepe pasa debajo; vuelve a subir |
| Carmesí | **Micrófono Traidor** (v5) | Prensa (genérica) | Micrófono con alas y espinas: flota, apunta y **se lanza** hacia donde estaba Pepe; descansa y vuelve |
| Carmesí | **Lunes 28** ⏸ | Sencillo «Lunes 28» | Hoja de calendario que vuela en zigzag |
| Carmesí | **Libro ruso** ⏸ | Sencillo «Literatura rusa» | Libro que se abre y lanza letras |
| Carmesí | **Espina** | Rosa de la portada | Zarzas en el suelo (`^`); dañan al tocarlas |
| Noche | **Invitado enmascarado** | «Noche de brujas» (fiesta de disfraces) | Al pisarlo pierde la máscara y cambia de comportamiento |
| Noche | **Fantasma** | «Fantasmas» (setlist de la gira *Noche*) | Atraviesa paredes; solo es visible con flash |
| Noche | **Murciélago** | Terror clásico | Picado en curva |
| Alba | **Recuerdo** (polaroid) | Concepto nostalgia | Te sigue lento; si te toca, te devuelve a un punto anterior |
| Alba | **Maldita Rueda** | Canción «Maldita Rueda» | Rueda que rueda por pendientes |
| Psalmos | **Codependientes** | Sencillo «Codependientes» (con Cami) | Pareja unida por una cadena: hay que vencer a los dos |
| Psalmos | **Chambelán** | «Chambelán (Nunca fui)» | Baila en formación; patrón de vals |
| Psalmos | **Sombra suelta** | Concepto original: lado oscuro de Peter Pan | Copia tus movimientos con retraso |
| Giallo | **Maniquí** | Portada de *Giallo* | Avanza solo cuando le das la espalda |
| Giallo | **Guante negro** | Código del cine *giallo* | Mano que sale de los bastidores |
| Sarajevo | **Bailarina** | «Baila conmigo» ⚠️ (versión extendida, confirmar) | Gira y rebota |
| Querido… | **Carta voladora** | Disco epistolar | Sobre que planea; al abrirlo suelta una pieza |
| Querido… | **Juglar** | Aire medieval y cuerdas | Lanza notas en arco |
| Querido… | **Pierrot de perlas** | Portada | Llora lágrimas que caen como proyectiles |
| **Todos** (recurrentes) | **Titular** | Persecución mediática (genérica) | Cartel con titular genérico («¡EXCLUSIVA!», «¡POLÉMICA!», «¡ÚLTIMA HORA!») que patrulla; al vencerlo muestra una frase verificada de Madero |
| **Todos** | **Paparazzi** | Ídem | Flash suave (< 3 Hz, desactivable) que te frena; se le vence por detrás |
| **Todos** | **Micrófono de reportero** | Ídem | Se interpone en tu camino; lo neutralizas con tu propio micrófono |

### 3.3 Jefes finales — v4 (propuesta; ⚠️ **el usuario los está revisando**)

Criterios de la revisión: (1) cada jefe sale de un concepto verificado; (2) en los **paseos** no hay combate sino un **momento final**; (3) ningún jefe castiga la vulnerabilidad ni la tristeza; (4) nada de música ni letras sin licencia.

| Mundo | Tipo | Jefe / momento final | Cómo se resuelve | Cambio respecto a v3 |
|---|---|---|---|---|
| Carmesí | Acción | ✅ **Cámara Flash-Bot** (v5) | Camina → carga → rayo (bajo / alto) → lente expuesto; 6 golpes, 2 fases; se deshace en pétalos → Disco de Oro (§3.0d) | Sustituye a la Rosa Carmesí |
| Noche | Acción | **El Enmascarado del Lago** | Aparece y desaparece entre cabañas; apagón (solo ojos); persecución. Al vencerlo **se quita la máscara** y debajo hay alguien normal (la idea de «Noche de brujas»: las máscaras sociales) | Final con mensaje |
| Alba | **Paseo** | **La Nostalgia** (momento final) | No se pelea: rebobina el camino y solo se supera **siguiendo adelante**; al final amanece | De jefe a momento final |
| Psalmos | Acción suave *o* paseo ⚠️ | **La Sombra** | Si es acción: la luz de las vidrieras la debilita. Si es paseo: la sombra **acompaña** a Pepe y se funde con él al salir de la esquina (nadie se queda solo en la esquina) | Abierto según confirméis |
| Giallo | Acción | **El Maniquí en Llamas** | Teatro a oscuras; solo ataca cuando le das la espalda (cine *giallo*, sin temas de salud mental) | Igual |
| Aurora (EP) | **Paseo** | Momento final ⚠️ (por definir con el usuario) | Sin combate | Antes: minijefe Casanova |
| Sarajevo | Acción + memorial | **El Rey Ahogado** → memorial **«Luciérnagas»** | Combate submarino; después, el nivel de alzar la voz (§3.0c), sin combate | Añadido el memorial |
| Querido… | Acción | **Los Dos Pierrots** | ⚠️ En revisión por el usuario. Recomendación: no castigar al que llora (p. ej., se golpea a la máscara que ríe o se les entregan las cartas en la fase final) | Antes «golpear al que llora» |
| Intermedio | Acción | **La Rueda de Prensa** | Micrófonos que disparan preguntas; se responde con las piezas del museo y salen frases verificadas de Madero | Igual |
| ★ Final | Ritmo | **MÉXICO VS. JOSÉ MADERO** | Pantalla VS; la barra es el **cariño del público**. Música: **chiptune original**; sus canciones solo con licencia | Corregida la música |
| Secreto | Acción | **La Bestia** | Patrones de los jefes anteriores | Igual |

### 3.3-v3 Jefes finales (versión anterior, como referencia)

| Mundo | Jefe | Referencia | Fases (borrador) | Al vencerlo |
|---|---|---|---|---|
| Carmesí | **La Rosa Carmesí** | Portada | 1) Lluvia de pétalos · 2) Látigos de espinas · 3) Se deshace como en la portada | **Disco de Oro** (*Carmesí* fue Disco de Oro en nov. 2016) |
| Noche | **El Enmascarado del Lago** | Máscaras de la fiesta + figuras de terror en la gira *Noche* (arquetipo propio) | 1) Aparece y desaparece entre las cabañas · 2) Apagón: solo ves sus ojos · 3) Persecución | Máscara de hockey (power-up) |
| Alba | **La Nostalgia** | Concepto del disco | Rebobina el nivel y tu posición; solo se vence **avanzando** (mensaje del disco: la nostalgia puede impedir disfrutar el presente) | Luz del Alba |
| Psalmos | **La Sombra** | Concepto original del lado oscuro de Peter Pan; la pelea es en la esquina de la portada | Se separa de la figura en posición fetal; la luz de la vidriera la debilita | Vidriera (pieza) |
| Giallo | **El Maniquí en Llamas** | Portada | Se apagan las luces del teatro; ataca cuando le das la espalda | Programa de mano de *Giallo Fantastique* (pieza) |
| Aurora | **Casanova** (minijefe) | «Casanova» | Duelo corto de esquivar rosas | Hoja de hiedra (pieza) |
| Sarajevo | **El Rey Ahogado** | «Rey Ahogado» (con Lasso) | Bajo el agua: corona que tira corrientes; los faroles marcan los huecos | Corona (pieza) → abre el memorial «Luciérnagas» |
| Querido… | **Los Dos Pierrots** | Portada (dos rostros) | Jefe doble: cuando uno ríe, el otro llora; hay que golpear al que llora | Carta sellada (pieza dorada) |
| Intermedio | **La Rueda de Prensa** | Persecución mediática (genérica) | Mesa con micrófonos que disparan preguntas; hay que responder con las piezas del museo recuperadas | Pase a la Arena |
| ★ **Final** | **MÉXICO VS. JOSÉ MADERO** | Playera oficial + concierto en la Arena CDMX ⚠️ fecha por confirmar | Pantalla «VS» de juego de lucha. La barra de México **no es de vida, es de público**: se llena tocando a ritmo (las canciones de cada mundo en chiptune) y esquivando titulares. Fases: 1) público frío · 2) se enciende · 3) canta contigo. ⚠️ v4: música original (sus canciones solo con licencia) | Concierto completo, créditos y museo lleno |
| Opcional | **La Bestia** | «Érase una Bestia», su primer estadio (24 ene 2026) | Jefe secreto con patrones de los 8 jefes | Partitura dorada |

### 3.4 Power-ups y objetos

> **v5:** la tabla vigente es la de §3.0d (Solo de guitarra con barra de Ovación, Amplificador, Carta de fan, Farol). Esta tabla queda como banco de ideas para otros mundos.

| Objeto | Referencia | Efecto |
|---|---|---|
| **Púa de guitarra** | Guitarras expuestas en el museo | Disparo (equivalente a la flor de fuego) |
| **Rosa carmesí** | Portada de *Carmesí* | +1 corazón |
| **Disco de Oro** | Disco de Oro de *Carmesí* (nov. 2016) | Vida extra |
| **Máscara de hockey** | Terror de la gira *Noche* | Invencible 8 s (las máscaras de la fiesta te ignoran) |
| **Luz del Alba** | «El amanecer» (*Alba*) | Revela plataformas ocultas durante 10 s |
| **Farol** | Niveles nocturnos | Ilumina el entorno en zonas oscuras (la luciérnaga se reserva para el nivel memorial) |
| **Micrófono** | Directo | Grito que aturde a los enemigos de la pantalla (1 uso) |
| **Carta** | *Querido…* epistolar | Checkpoint |
| **Partitura dorada** | Partitura original de «Plural siendo singular» expuesta en el museo | Pieza dorada secreta (1 por mundo; todas = final secreto) |
| **Pieza del museo** | Más de 100 piezas del museo real | Coleccionable (100 en total) |

### 3.5 Hitos «¿SABÍAS QUE…?» (verificados)

Además de estos hitos, las frases que aparecen al vencer un **Titular** salen solo de entrevistas citadas (La Razón 2024, Publimetro 2025, Milenio). Las frases **«sacado de contexto»** no están verificadas: ⚠️ no se usan hasta tener fuente.


| Tras | Hito | Fuentes |
|---|---|---|
| Carmesí | Salió el 29 abr 2016; fue **Disco de Oro** (nov. 2016) y monitorLATINO lo nombró Artista Revelación 2016. Muchas canciones son de 2008–2010 | Wikipedia (Carmesí) |
| Noche | «Noche de brujas» **no es de Halloween**: habla de máscaras sociales. En la gira, figuras de terror salían al escenario | Wikipedia (Noche), Revista Kuadro, ABC Noticias, El Alebrije |
| Alba | Es el «disco blanco»: conceptual, sobre la nostalgia; Madero lo llamó «el amanecer» | Wikipedia (Alba), Looking Back |
| Psalmos | Se adelantó por filtraciones; al principio iba a tratar el lado oscuro de Peter Pan; fue **n.º 1 en ventas en México** | Wikipedia ES (Psalmos), Intolerancia Diario, Wikipedia EN (n.º 1 2019) |
| Giallo | El título es amarillo y también un género de cine de terror italiano; la gira *Giallo Fantastique* pasó por el Auditorio Nacional (10 jun 2022) | Grita Radio, Entodomusic |
| Aurora | EP de 6 canciones, publicado el 17 mar 2023 | Discogs, Spotify |
| Sarajevo | Incluye «Rey Ahogado» con Lasso ⚠️ (fecha de 2024 distinta según la fuente) | Letras, Last.fm, Sazum |
| Estadio | 24 ene 2026: su primer Estadio GNP Seguros, «Érase una Bestia», con museo en una carpa | Chilango, Excélsior |
| Museo | Monterrey, 21 jul–21 ago 2026: más de 100 piezas, gratis, con la partitura original de «Plural siendo singular» | MVS Noticias, El Horizonte, Info7 |
| Querido… | 3 sep 2026: 7.º disco, 13 canciones, epistolar, sin sencillos previos; el verde es su color | CineMedios, El Sol de Sinaloa, Indie AM |
| Playera | «México vs. José Madero»: merch a la venta en su tienda oficial de música | Class Music |

---

## 4. Flujos

### 4.1 Jugador
1. Portada → «PULSA START» (con el aviso de homenaje no oficial).
2. **Museo** (hub): Pepe camina por un pasillo con 8 puertas de colores. Solo está abierta la siguiente; las vitrinas muestran las piezas recogidas.
3. Mundo: nivel → puerta del jefe → jefe → recompensa → tarjeta «¿SABÍAS QUE…?» → vuelta al museo con la vitrina actualizada.
4. Tras el mundo 8 se abre la sala «Érase una Bestia» (epílogo).
5. Créditos con fuentes, aviso legal y @coloresruidosos.

### 4.2 Equipo (añadir un disco nuevo)
1. Añadir una entrada en `data/worlds.js` (paleta, textos, fuentes).
2. Dibujar el nivel en `data/levels/<mundo>.txt` (mapa de caracteres).
3. Elegir enemigos de la biblioteca o crear uno con su test.
4. `npm test` → `npm run build` → subir `dist/` a la web.

---

## 5. Arquitectura

- **Motor propio en ES Modules + Canvas 2D**, sin dependencias de runtime. Reutiliza de «8 cabañas» la paleta, la fuente 5×7, los sprites y el chiptune.
- **Resolución lógica 320×224** (Neo Geo), escalado entero, `image-rendering: pixelated`. Responsive: cabe en horizontal y en vertical con controles táctiles debajo.
- **Lógica pura y testeable en Node** (sin DOM): física AABB, colisiones con tiles, IA de enemigos (funciones `update(state, dt)`), patrones de jefes, inventario y guardado.
- **Bucle de paso fijo a 60 Hz** (determinista: permite repeticiones y grabar reels).
- **Datos**: niveles como texto (un carácter = un tile), mundos y hitos en JSON/JS.
- **Audio**: WebAudio con el sintetizador chiptune en tiempo real; un tema por mundo y otro por jefe.
- **Entrega**: un solo HTML (`dist/`), publicado en la web de CR en `static/juegos/mexico-vs-jose-madero/` (v7). Guardado en `localStorage` mediante `src/engine/save.js` (almacenamiento inyectado).

## 6. Requisitos no funcionales

| NFR | Criterio |
|---|---|
| Rendimiento | 60 fps en un móvil medio; < 1 MB de descarga inicial |
| Controles | Latencia < 1 fotograma; *coyote time* (6 frames) y *jump buffer* (6 frames) |
| Accesibilidad | Sin flashes > 3 Hz; flashes desactivables; modo asistido; remapeo; textos ≥ 8 px lógicos |
| Compatibilidad | Chrome, Safari iOS, Firefox; teclado, táctil y mando |
| Determinismo | Misma entrada → misma partida (tests de repetición) |
| Veracidad | Todo dato en pantalla tiene su fuente en `data/sources.js` y en los créditos |
| Legal | Título propio; «Homenaje no oficial»; sin música grabada, portadas ni personajes registrados |

## Decisiones abiertas (para definir juntos)
- **v5:** ✅ Mundo 1 definido (§3.0d) · ✅ el logo de Colores Ruidosos de los conceptos es el real (⚠️ falta el archivo original para usarlo en el juego)
- **v4:** ✅ paseos = *Alba* y *Aurora* · ⏳ el usuario revisa los jefes (§3.3 v4) · momento final de *Aurora* por definir · · ¿pedimos al equipo de Madero el **permiso para los fragmentos de letras** y, a la familia (a través de su equipo), el **consentimiento para la dedicatoria** del memorial?
0. **Fecha y enlace del concierto en la Arena CDMX** (no aparece en ninguna fuente pública consultada) y confirmar **JMV = José Madero Vizcaíno**.
1. **Título**: ✅ propuesta «MÉXICO VS. JOSÉ MADERO» (de la playera). Evitar «Bros» y el óvalo de Nintendo.
2. **Alcance de la v1**: 8 mundos × (1 nivel + jefe), o un MVP de 2 mundos (Carmesí + Noche) para probar primero.
3. ¿Incluimos **Panda/PXNDX** como mundo 0?
4. ¿Escribimos al **equipo de José Madero** antes de publicar?
5. Enemigos y jefes de §3.2–3.3: ¿cuáles se quedan, cuáles cambiamos?
