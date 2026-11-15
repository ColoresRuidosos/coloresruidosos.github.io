# Contexto para retomar el trabajo (Colores Ruidosos)

> Última actualización: **15 nov 2026**. Pega este archivo, o su ruta, al empezar una sesión nueva. **Lee primero la §0.**

## 0. Estado al 15 nov 2026 (léelo primero)

**Rama de trabajo:** `ccr-1125ca22-d3u2nw` en `ColoresRuidosos/coloresruidosos.github.io`.
- Lo último que se fusionó en `main` es el PR #27 (insignias de *Yo contra mi corazón*).
- Todo lo de *Alba* está en la rama, **sin fusionar**: el mundo aún no es jugable.

### 0.1 Mundo 3 «Alba» (en curso)
**Spec:** `specs/spec.md` §3.0f **Q**, v10 a v10.5 (todo aprobado por el usuario). **Tareas:** `specs/tasks.md`, Fase 3a.
- **Concepto:** **paseo** al amanecer, sin daño ni vidas; no se puede perder. 3 niveles:
  - 3-1 «Willkommen», pueblo blanco;
  - 3-2 «Carrusel de adultos», feria con la noria «Maldita Rueda»;
  - 3-3 «Ahora y hoy», cerro.
- **Mecánicas:**
  - **nostalgia:** 3 s quieto → retrocedes a 20 px/s, sin pasar del checkpoint ni caer a un foso;
  - **Recuerdos (polaroids):** te persiguen a 30 px/s y al tocarte te regresan 48 px; el micrófono los disuelve;
  - **noria:** cabinas que giran y sirven de plataforma;
  - **plataformas de luz `~`** y la **Luz del Alba `@`** (10 s);
  - **atriles `S`:** 10 pasajes, uno por canción;
  - **bancas `b`:** sentarse para la nostalgia;
  - **«Los de septiembre»:** invitados de *Noche* sin disfraz que caminan contigo;
  - **feria:** carrusel, tiro al blanco y noria;
  - **pasajes del viaje:** usan los datos de cada jugador;
  - **polaroid final del presente:** la postal compartible.
  - Caracteres de nivel libres para esto: `D` noria, `I` recuerdo, `S` atril, `@` Luz del Alba, `~` plataforma de luz, `b` banca, `n` jefe.
- **Jefe «La Nostalgia» (v10.2):**
  - fase 1: recuerdos en sepia de los jefes anteriores; se avanza tocando 3 rayos de sol;
  - fase 2: subir la noria, que se invierte cada 4 s y avisa 0,6 s antes;
  - fase 3: viento de 40 px/s en contra; hay que caminar unos 400 px.
  - Al final se despide, no muere: «GRACIAS POR RECORDARME. AHORA SIGUE.».
- **Hecho y en la rama:**
  - historia en datos: `src/data/alba-story.js` (carteles, «¿Sabías que…?» A1–A4, 10 pasajes, frases de la Nostalgia); `historia.js` (recuerdo «SEGUIR ADELANTE» y 6 pensamientos); `cinematicas.js` (escenas a1–a4 con ilustración);
  - arte de Gemini recortado:
    - atlas `nostalgia`, `recuerdo`, `noria`, `luz`, `feria`, `atril` y `pepeAlba` (poses del paseo) en `src/data/*-atlas.js`;
    - fondos `alba-pueblo`, `alba-feria` y `alba-cerro`;
    - traje 9 «CHALECO Y BUFANDA» (id `alba`, traje automático del mundo 3);
  - sprites por código de respaldo: `src/render/sprites-alba.js`;
  - prompts: `art/PROMPTS-GEMINI.md` §0g y la página «Prompts de Alba» (https://claude.ai/artifact/1iTXGBjtfPMrU9ft6mLHs3).
  - `npm test`: 253 en verde.
- **Siguiente (tareas #2–#4):**
  1. `src/game/alba.js`, con TDD (test `tests/v10-alba-paseo.test.js`):
     - nuevos caracteres en `engine/tilemap.js`;
     - `hurt()` sin daño y foso = checkpoint cuando hay `g.alba`;
     - plataformas `~` que pasan a `=` en `L.grid` cuando hay luz;
     - cabinas como plataformas que llevan a Pepe;
     - pasajes con `PASAJES_POR_NIVEL`.
  2. Jefe «La Nostalgia»: módulo propio y bot que lo termina.
  3. `scripts/levels_world3.py` → `src/data/world3.js`.
     - Integrarlo en `main.js` (`WORLD_DATA.alba`, `pieceName`, quitar `soon` en `worlds.js`, desbloquear el traje `alba` en `progress.js`) y en `draw.js` (HUD «PASAJES n/10» sin corazones; sepia; noria).
     - Probarlo con un bot y en el navegador.
- **Decisiones del usuario:**
  - **Letras:** hay permiso para usar letras de *Alba*. **Claude no transcribe letras**: el equipo pega los fragmentos oficiales (hasta 4 líneas de 30 caracteres) y van tal cual en `src/data/alba-letras.js`, hoy vacío, con su crédito.
  - **Escena a1:** se queda con el letrero «PARTY HALL».
  - **Ropa en las escenas:** en a2, a3 y a4 Pepe sale con su ropa clásica; se aceptó así, y se pueden regenerar con el chaleco.
  - **Pensamiento 2** acortado para la burbuja: «SI ME DETENGO, ALGO ME JALA HACIA ATRÁS.».
- **Pendiente del usuario:** los fragmentos de letras.

### 0.2 «Yo contra mi corazón» (minijuego, en la web)
- **Qué es:** juego de ritmo y box (Pepe de payaso contra un corazón) con «Teoremas, etc.», que es excepción de licencia aceptada por el usuario.
- **Dónde:** `juegos/yo-contra-mi-corazon/`, publicado en `/games/yo-contra-mi-corazon/`. Su spec está en `specs/` y la del reel en `reel/spec.md`.
- **Solo la semana del 9 al 15 nov 2026:** la tarjeta de Games tiene `hasta` y desaparece sola. Después del cierre, el juego muestra «ESTE JUEGO YA TERMINÓ» y el ranking final.
- **Ranking:**
  - el Apps Script del sitio (`docs/ranking/Code.gs`, modo `corazon`, misma URL que la trivia), ya publicado por el usuario;
  - nombres de la carrera de Pepe, con 3 opciones para elegir;
  - cierra solo el 15 nov a las 23:59 CDMX.
- **Insignias:** 10, guardadas en el navegador.
- **Reels:** `npm run reel` (con `-- pepe`, `-- pepe insignias principal`). Los videos no se suben al repo.
- **Pendiente:** el lunes 16, publicar el ranking final («el más migajero de la semana») con captura del top 20.

## 1. Quién y cómo trabajamos
- **Cliente:** Colores Ruidosos (@coloresruidosos), medio musical que hace reels de Instagram y una web. Escribe en español.
- **Metodología obligatoria:** Spec-Driven Development (Dominicode, Bezael Pérez).
  - Antes de programar algo nuevo se escriben o actualizan `spec.md` (Visión, Usuarios, Funcionalidades, Flujos, Arquitectura, NFR), `plan.md` y `tasks.md`.
  - Se sigue el orden TDD: test en rojo → código → verde.
- **Veracidad:** datos **«mil por ciento confirmados»**.
  - Todo dato en pantalla lleva su fuente; un dato cuenta como verificado con 2 fuentes o más.
  - La ficción del juego se marca como tal.
  - Lo no verificado se marca ⚠️ y no sale en pantalla.
- **Legal y ética (decidido):**
  - Ni música ni **letras** de artistas sin licencia: los chiptunes son originales, hechos por código.
  - Las portadas se **evocan**, no se copian.
  - Nada de nombres, logos ni sprites de terceros: Nintendo, SNK/Neo Geo, *Spin Master*, Jason, Freddy, Pinhead, máscara de hockey ni el Frankenstein de Universal (cabeza plana con tornillos).
  - Rótulo «HOMENAJE NO OFICIAL · @COLORESRUIDOSOS» en la portada.
  - Prensa siempre genérica, sin medios ni periodistas reales.
  - No convertir trastornos mentales en enemigos.
  - Memorial (feminicidio): sin violencia ni puntos, y sin nombres de víctimas sin el consentimiento de su familia.
- **Riesgos aceptados por el usuario** (anotados en la spec; revisar antes de una publicación oficial):
  - la botarga morada (recuerda a Tinky Winky), que sale sin nombre;
  - la viñeta 2 del prólogo (la Arena), que va tal cual: un cartel con la cara realista de José Madero, «MADERO», «Querido José Tour», el logotipo de la Arena CDMX y las fechas. **Desde el 5 nov 2026 también abre el tráiler** (decisión del usuario).

## 2. Repositorios y entorno
| Repo | Qué hay | Rama |
|---|---|---|
| `ColoresRuidosos/coloresruidosos.github.io` | Web de CR (Hugo) **y el juego** en `juegos/mexico-vs-jose-madero/` | `ccr-6e2a6525-41gp9s` (todo subido; **sin PR**) |
| `edgaralrohe/awesome-opus5-5-videos` | Vídeos (Viva Belgrado y José Madero) y el origen del juego (`projects/super-pepe/`, v0.4) | `ccr-70ec02ed-h3g6xs` |
| `edgaralrohe/phaser` | Copia del motor Phaser 4. **No se usa**: el juego tiene motor propio | — |

**Entorno:**
- Node 22 (`node --test`) y Playwright con Chromium preinstalado (en ESM: `createRequire(import.meta.url)('playwright')`).
- Python 3 con PIL y numpy (sin scipy).
- La red de la sesión bloquea la mayoría de webs: se verifica con búsqueda web.

**Vídeos** (`projects/viva-belgrado-guadalquivir/`, terminados):

| Pieza | Duración | Comando |
|---|---|---|
| «Fluye» | 30 s | `npm run render` |
| Reel de reseña de CR | 80 s | `npm run render:reel` |
| «No es una canción de Halloween» | 36 s, publicado el 31/10 | `npm run render:noche` |
| «8 cabañas» | 67 s | `npm run render:cabanas` |

---

## 3. El juego: «MÉXICO VS. JOSÉ MADERO» (título provisional)

### Cómo se usa
- **Carpeta:** `juegos/mexico-vs-jose-madero/`. Desde ahí:
  - `npm ci` instala;
  - `npm test` pasa **214 tests**;
  - `npm run build` genera `dist/mexico-vs-jose-madero.html`, un solo archivo de unos 1,6 MB;
  - `npm run dev` abre el servidor en el puerto 5174.
- **Versión jugable compartida:** https://claude.ai/artifact/APwgHNVC6q7ajF9JwtmU3r (artifact del usuario, abierto a «cualquiera con el enlace»).
  - Se actualiza publicando `dist/…html` con esa URL como `url`.
  - Está en la v0.13.
- ✅ **Se publica en la web de CR** (decisión del usuario, 4 nov 2026): el menú «Trivia» pasa a **Games** (F25/D31 en `docs/`); el juego vive en `/games/mexico-vs-jose-madero/` (`npm run publish:web` lo copia a `static/games/…`) y su tarjeta aparece sola el **viernes 6 nov 2026 a las 8:00 CDMX** (`data/games.json`). Rama `ccr-af671956-9kq01g`, sin PR: se despliega al fusionar en `main`.
- 🎬 **Tráiler** (reel 9:16, 50 s, estilo 16-bit Pixel RPG con juego real grabado por bots; abre con la Arena, explica cómo se juega, los 2 mundos y «un disco cada 2 semanas»): `edgaralrohe/awesome-opus5-5-videos`, `projects/trailer-jmv/` (rama `ccr-af671956-9kq01g`); `sh build.sh` lo regenera.

### Historia (spec §1.1b, aprobada)
1. **Prólogo** (5 viñetas, saltable, solo la primera vez):
   1. Estadio GNP Seguros, 24 ene 2026, «Érase una Bestia», su primer estadio. Dato con fuente.
   2. Lo siguiente: la Arena Ciudad de México, **21 y 22 de mayo de 2027**. Dato verificado (LOS40 y Grupo Animal).
   3. Esa noche, entre flashes y titulares, algo se le perdió.
   4. Pepe despierta en el museo de la carpa y no recuerda quién es.
   5. Cada disco guarda una parte de él.
   - Esa noche Pepe lleva el **traje negro con lentes oscuros**.
2. **El Museo (hub):**
   - pasillo con 8 puertas, una por disco;
   - un retrato de Pepe de 8 piezas con el contador «IDENTIDAD n/8»;
   - una exposición que se llena al terminar cada mundo: cuadros con la rosa, el antifaz y el sol; vitrinas con el Disco de Oro, la partitura de «Plural siendo singular» (siempre) y la Máscara de fiesta.
3. **Cada mundo:**
   1. escena de entrada (2 viñetas);
   2. un capítulo por nivel;
   3. pensamientos de Pepe en los checkpoints;
   4. jefe, con pose de festejo al vencerlo;
   5. «¿Sabías que…?»;
   6. «RECUERDO RECUPERADO»;
   7. escena de salida (2 viñetas).
4. **Final previsto:** el VS en la Arena, donde la barra es el cariño del público. Aún no está hecho.

### Mundos hechos
| Mundo | Niveles | Jefe |
|---|---|---|
| **1 · Carmesí** (2016, rojo) | 1-1 Calle Carmesí · 1-2 Azoteas · 1-3 El Teatro (fondo de ChatGPT) | **Cámara Flash-Bot** «La Prensa Rosa»: rayo bajo o alto, lente expuesto, 6 golpes → Disco de Oro |
| **2 · Noche** (2017, blanco y negro) | 2-1 La Entrada (afuera del salón de fiestas) · 2-2 El Salón (se va la luz; farol) · 2-3 La Pista (farol). Los tres fondos son de ChatGPT, en gris | **El Enmascarado** «El Anfitrión»: embestida (doble en la fase 2), salto con ondas, 3 máscaras (se rompen con el micro), niebla con aviso detrás de Pepe e invitados en la fase 2. Nunca repite ataque; 8 golpes, uno por ventana; al final se quita el antifaz → Máscara de fiesta |

**Enemigos de Carmesí:** Titular (dice un dato verificado al vencerlo), Paparazzi (su flash congela 0,6 s), Reportero, Rumor Volador, Micrófono Traidor y espinas.

**Enemigos de Noche:**
- de ChatGPT: Murciélago (el vampiro) y Fantasma (solo se ve con luz);
- dibujados por código: Gigante cosido (2 golpes para quitarle el disfraz, empuja fuerte), Hombre invisible (a oscuras solo se ven el sombrero, las gafas y los guantes), Hombre anfibio (sale del estanque, avisando con burbujas), La Llorona (su llanto frena 1 s) y Charro Negro (embiste);
- **regla de los disfrazados:** el primer golpe les quita el disfraz y van más rápido; el segundo los vence.

### Sistemas
- **Movimiento:**
  - 165 px/s, salto variable, *coyote time* y *jump buffer*;
  - micrófono con cable que golpea y se engancha a los ganchos, con «B» sobre el gancho cuando está a tiro;
  - combos, cronómetro y marcador.
- **Ovación → Solo de guitarra** (C o ★): vence a todo lo que hay alrededor.
- **Ayudas:**
  - 3 cartas de fan por nivel, más una cada 6 enemigos vencidos y una cada 2 golpes al jefe si falta corazón;
  - 3 checkpoints por nivel;
  - Amplificador `A` (10 s), Púa de guitarra `J` (15 s) y Antifaz `Z` (8 s, invencible);
  - Aceite `L` para el farol.
- **Guía de objetos:** desde Opciones y desde la pausa (▶). Además, la primera vez que se recoge cada cosa sale su explicación.
- **Opciones:** destellos, temblor, modo asistido (no se pierden corazones), música y la guía. Se guarda todo en `localStorage` (`jmv-save`, esquema v1, con `seenPrologue` y `seenItems`).
- **Continuar:** se entra a un mundo por el primer nivel sin superar.
- **Galería de 8 trajes con retos:** clásico, boina, chamarra, botarga, lentes, vampiro, rojo y bandana. Modo automático: un traje por mundo.
- **Accesibilidad:** sin destellos (flash, Solo, ganchos y candelabros quietos), sin temblor y modo asistido.
- **Cámara:** se desliza sin saltos al girarse.
- **Datos:** cada dato sale una sola vez por mundo.

### Código (puntos clave)
- **Motor:**
  - `src/engine/`: tilemap de texto, física, cámara (`createCamera` y `stepCamera`), botones y guardado (`save.js`);
  - paso fijo de 60 Hz, pantalla de 320×224.
- **Juego:**
  - `src/game/game.js` orquesta: puntuación, ayudas, `aimHook`, `defeat` y la regla de los disfrazados;
  - además: `enemies.js`, `boss.js` (Flash-Bot), `noche.js` (farol, enemigos de Noche y Enmascarado), `progress.js` (marcas, trajes, puertas, identidad, exposición y continuar), `museum.js` (pasillo) y `constants.js` (**todo el ajuste fino**).
- **Datos:** `src/data/`:
  - `world1.js` y `world2.js` (niveles en texto);
  - `carmesi-story.js` y `noche-story.js` (datos y capítulos);
  - `historia.js` (prólogo, recuerdos y pensamientos), `cinematicas.js`, `guia.js` y `worlds.js`;
  - los atlas y fondos se generan con los scripts.
- **Render:** `src/render/`:
  - `draw.js`, `themes.js` (fondos por código) y `pixel.js` + `sprites-fiesta.js` (sprites por código con contorno y 3 tonos);
  - `draw-noche.js`, `draw-historia.js` (prólogo, escenas, retrato y festejo) y `draw-menus.js` (Museo, Galería, Opciones, guía y pausa).
- **Leyenda de los niveles:**

  | Tipo | Caracteres |
  |---|---|
  | Terreno | `#` sólido · `=` semisólido · `^` espinas |
  | Pepe y meta | `P` Pepe · `C` checkpoint · `G` puerta |
  | Ganchos y piezas | `H` gancho · `*` pieza |
  | Enemigos de Carmesí | `T` Titular · `F` Paparazzi · `R` Reportero · `V` Rumor · `M` Traidor |
  | Enemigos de Noche | `W` Murciélago · `O` Fantasma · `K` Gigante · `N` Invisible · `U` Anfibio · `Q` Llorona · `X` Charro |
  | Jefes | `B` Flash-Bot · `E` Enmascarado |
  | Objetos | `A` Amplificador · `+` Carta · `J` Púa · `Z` Antifaz · `L` Aceite |

  `scripts/levels_world2.py` genera Noche y `scripts/ayudas.py` reparte las ayudas.
- **Tests:**
  - motor, guardado, progreso, enemigos, jefes (repertorio y determinismo), ayudas, guía, datos sin repetir y que se puedan dibujar;
  - bots que completan cada nivel y vencen a los jefes;
  - navegador (Playwright).
  - `window.__jmv` expone el estado para las pruebas: `game`, `screen`, `paused`, `held`, `save`, `goto(i, mundo)` y `museum(puerta)`.

### Arte y herramientas
- **Pepe:** hoja oficial de CR (`art/source/pepe-sheet.jpg`, 29 poses). Trajes en `pepe-trajes-1.jpg` y `-2.png` (4 poses cada uno), recortados con `scripts/slice_costumes.py`.
- **Generación con IA:** ChatGPT funciona mejor que Gemini, que tiene un límite diario bajo. Prompts en `art/PROMPTS-GEMINI.md`:
  - §0b: personajes de Carmesí;
  - §0d: enemigos de Noche;
  - §0e: escenas del prólogo y de los mundos, y escenarios de Noche;
  - §0f: Teatro y Museo.
- **Importadores:**

  | Script | Para qué |
  |---|---|
  | `scripts/slice_sheet.py` | Hojas de sprites limpias |
  | `scripts/slice_rows.py` | Hojas de ChatGPT, por filas y huecos; une piezas sueltas |
  | `scripts/import_backdrop.py [--gris] tema=imagen` | Fondos panorámicos de 224 px; añade sin borrar |
  | `scripts/import_scene.py id=imagen@y0` | Viñetas de 320×150; tapar un cartel es opcional (`TAPAR`) |

- **Ya en el juego (de IA):**
  - fondos: Calle y Azoteas (Gemini); Teatro, Museo y los 3 de Noche (ChatGPT);
  - sprites: Flash-Bot, Rumor, Traidor y prensa (Gemini); Murciélago, Fantasma y Enmascarado (ChatGPT);
  - viñetas del prólogo p2, p3 y p5.
- ⏳ **Falta arte:**
  - viñetas p1 (estadio) y p4 (museo);
  - las 8 escenas de mundo (c1–c4 y n1–n4).
  - Mientras tanto se ven las versiones de código.

### Decisiones tomadas
- **Sello JMV** = José Madero Vizcaíno, diseño propio. Estética 16 bits Neo Geo. El arma es un micrófono con cable.
- **Nombre:** título en `GAME_TITLE` (`constants.js`). ⏳ El usuario decide. Propuesta recomendada: **«DISCO A DISCO»**; otras: «RECUERDA QUIÉN ERES», «EL MUSEO DE PEPE» y «JMV: MEMORIAS».
- **Mundos previstos:**
  - Carmesí (2016, rojo) · Noche (2017, B y N) · Alba (2018, blanco, **paseo**) · Psalmos (2019, azul);
  - Giallo (2022, amarillo) · Aurora EP (2023, naranja óxido, **paseo**) · Sarajevo (2024, lila) · Querido… (2026, verde);
  - intermedio: Rueda de Prensa; final: el VS en la Arena; secreto: La Bestia.
- **Memorial «Luciérnagas»** (cierre de Sarajevo): sin combate, aviso saltable, dedicatoria solo con el consentimiento de la familia y teléfonos de ayuda verificados ⚠️.
- **No salen en pantalla:** las polémicas de prensa negativa (la firma de autógrafos de 2016 y la acusación de plagio de la portada).

---

## 4. Pendiente con el usuario
1. **Jugarlo y dar feedback:** velocidad, dificultad, jefes y duración de los niveles → ajustes en `constants.js`.
2. **Arte que falta:** viñetas p1 y p4 y las 8 escenas de mundo (prompts §0e).
3. **Nombre definitivo** del juego.
4. **Peso:** el HTML pesa ~1,6 MB. Antes de añadir más arte o mundos, separar el arte en archivos aparte. Hace falta para la web.
5. **Créditos** que separen los datos con fuente de la historia inventada (tarea S4).
6. **Remapeo de teclas** (P1b).
7. **Ajustes menores:**
   - el Museo se ve cargado (los letreros de las puertas pasan por delante de los cuadros);
   - en el Teatro, Pepe se distingue menos sobre el fondo.
8. **Alcance:** piloto Carmesí + Noche (hecho) o los 8 mundos. ¿Panda/PXNDX como mundo 0? Revisar los jefes 3–8 y el momento final de *Aurora*.
9. **Archivo original del logo** de CR (no generarlo con IA).
10. **Equipo de Madero:**
    - visto bueno al juego, licencia de letras y música y consentimiento para el memorial;
    - revisar los riesgos aceptados (botarga y cartel de la Arena).
11. **Publicación en la web de CR:** decidida; falta fusionar la rama en `main` antes del viernes 6 nov.

## 5. Datos verificados (con fuente) — José Madero
| Dato | Fuente |
|---|---|
| *Carmesí*: 29 abr 2016, 13 canciones (escritas entre 2008 y 2010); «Lunes 28» fue el **adelanto** (0:00 del 29 feb 2016, tras el último concierto de Panda en la Arena CDMX), no un sencillo; primer sencillo «Plural siendo singular» (video 8 abr 2016); Disco de Oro en 2016; Artista Revelación monitorLATINO 2016. Lista completa D1–D20 en la spec §3.0e | Wikipedia ES, CineMedios, El Siglo de Torreón, Excélsior |
| ❌ «La noche de la mesa triste» es de PXNDX (*Bonanza*, 2012), no de *Carmesí* (la Wikipedia EN se equivoca) | — |
| *Noche*: 2017, su 2.º disco solista; salió el **28 jul 2017** (N8); «Noche de brujas», primer sencillo (9 jun 2017), **no es de Halloween** (máscaras sociales); video en blanco y negro, homenaje al terror clásico; en la gira, figuras del terror clásico y «Fantasmas» en el setlist; fan del terror y de Stephen King (N1–N8) | Wikipedia, Revista Kuadro, Milenio, Looking Back, AllMusic, Diario de México, ABC Noticias, El Alebrije, Soulwavez |
| ⚠️ Una sola fuente, sin usar: «Noche de brujas» fue la 3.ª canción que compuso para *Noche*; todas las canciones tratan de algo nocturno; n.º 1 en México (3 ago 2017); la última pista es «Natt i Stockholm» | Time Out México, Milenio, Wikipedia |
| *Alba*: 16 mar 2018; «disco blanco», conceptual, *Oda a la nostalgia*, «el amanecer»; «Maldita Rueda» | Wikipedia, Looking Back, Apple Music |
| *Psalmos*: 6 sep 2019; adelantado por filtraciones; iba a tratar el lado oscuro de Peter Pan; «Codependientes» con Cami; n.º 1 en México; con Flip Tamez; portada: persona en posición fetal en una esquina | Wikipedia, Intolerancia Diario, Informador; usuario |
| *Giallo*: 2022; amarillo + cine *giallo*; gira *Giallo Fantastique*, Auditorio Nacional el 10 jun 2022 | Grita Radio, Chilango, Entodomusic |
| *Aurora* (EP): 17 mar 2023, 6 canciones | Discogs, Spotify |
| *Sarajevo*: 2024 (fecha exacta ⚠️); «Rey Ahogado» con Lasso; «Luciérnaga» (sobre el feminicidio de Karen Rebeca Esquivel, coescrita con su madre, Becky Espinosa) | Letras, Last.fm, La Razón, Milenio, UnoTV |
| **Estadio GNP Seguros** (el usuario lo llama «Foro GNP»), 24 ene 2026, «Érase una Bestia», su primer estadio, con museo en una carpa | Chilango, Excélsior |
| Museo en Monterrey, 21 jul–21 ago 2026: más de 100 piezas, gratis, partitura original de «Plural siendo singular» | MVS Noticias, El Horizonte, Info7 |
| *Querido…*: 3 sep 2026; 7.º disco, 13 canciones, epistolar y medieval, sin sencillos; portada con dos pierrots con perlas | CineMedios, El Sol de Sinaloa, Indie AM |
| ✅ **Arena CDMX: 21 y 22 de mayo de 2027**, «Querido José Tour» (setlist distinto cada noche) | LOS40 (14 oct 2026), Grupo Animal |
| Playera «México vs. José Madero» (merch) | Class Music |
| «En algún momento fui un pendejo, pero dejé atrás eso hace mucho tiempo» | La Razón, 10 dic 2024 |
| A su yo joven le diría que no fuera tan arrogante | Publimetro, 20 oct 2025 |
| ❌ Sin verificar (no salen en pantalla): que llamara a las polémicas «sacadas de contexto»; el concepto de *Sarajevo*; que el estadio GNP sea «el más grande de México»; que usara el traje negro con lentes ese día | — |

**Lecciones de verificación:**
- No usar la Wikipedia EN de *Carmesí* como fuente única.
- Los textos de IA que aporte el usuario se comprueban punto por punto.
- Se verifica cruzando búsquedas web: 2 fuentes o más = ✅.
- Las imágenes de IA pueden traer texto, caras reales o logotipos: se revisan antes de meterlas.

## 6. Datos verificados — Viva Belgrado (reel)
- **El disco:** quinto disco, 23 oct 2026, Fueled By Salmorejo; producido por Ricky Falkner; Alain Johannes en «Menquitofla»; 11 canciones.
- **Prensa:** titular de Mondo Sonoro: «Una de las responsabilidades de hacerse mayor es ser feliz».
- **Directo:** presentación en Hiriko Soinuak (Barakaldo) el 23 oct; encuentros «Vernissage»; gira 2027.
- **Sin fuente pública:** «primer disco con Jaime y Cris» y «casi mil copias en preventa» los aportó el usuario. T13 y T14 son paráfrasis suyas.
