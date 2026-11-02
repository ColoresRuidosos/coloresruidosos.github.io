# Contexto para retomar el trabajo (Colores Ruidosos)

> Última actualización: 2 nov 2026 (noche). Pega este archivo, o su ruta, al empezar una sesión nueva.

## Quién y cómo trabajamos
- **Cliente:** Colores Ruidosos (@coloresruidosos), medio musical que hace reels de Instagram y una web. Escribe en español.
- **Metodología obligatoria:** Spec-Driven Development (Dominicode, Bezael Pérez). Antes de programar algo nuevo se escriben o actualizan `spec.md` (Visión, Usuarios, Funcionalidades, Flujos, Arquitectura, NFR), `plan.md` y `tasks.md`, en orden TDD (test primero).
- **Veracidad:** datos **«mil por ciento confirmados»**. Todo dato en pantalla lleva su fuente y no se inventa nada. Lo no verificado se marca ⚠️ y se pregunta.
- **Legal y ética (decidido):**
  - Ni música ni **letras** de artistas sin licencia: chiptunes originales hechos por código.
  - Las portadas se evocan, no se copian.
  - Nada de nombres, logos ni sprites de terceros (Nintendo, Neo Geo, *Spin Master*, Jason, Freddy, Pinhead).
  - Rótulo «homenaje no oficial».
  - Prensa siempre genérica, sin medios ni periodistas reales.
  - No convertir trastornos mentales en enemigos.
  - Temas sensibles (feminicidio): memorial sin violencia ni puntos, y sin nombres de víctimas sin consentimiento de su familia.

## Repositorio
- **Repo:** `edgaralrohe/awesome-opus5-5-videos`, **rama** `ccr-70ec02ed-h3g6xs` (todo subido; sin PR).
- **Stack:** HTML + Canvas 2D + ES modules · Node 22 (`node --test`) · Playwright (Chromium preinstalado; en ESM: `createRequire(import.meta.url)('playwright')`) · ffmpeg · Python 3 con PIL y numpy (sin scipy).
- **Red:** bloquea la mayoría de webs; se verifica con búsqueda web.

---

## 1. `projects/viva-belgrado-guadalquivir/` — vídeos (terminados)
| Comando | Pieza | Estado |
|---|---|---|
| `npm run render` | **«Fluye»**: 30 s, 9:16, dibujo animado a lápiz con la identidad del disco de Viva Belgrado *Mientras el Guadalquivir fluye y fluye y fluye* (arte de Josu Larrea) | ✅ |
| `npm run render:reel` | **Reel de reseña de CR**: 80 s, 34 tarjetas al pulso (120 bpm), escena 4 «Lo que la banda dice», tema CR **provisional**, nota 9/10 | ✅ (falta marca real de CR, portada en alta resolución y BPM real) |
| `npm run render:noche` | **«No es una canción de Halloween»** (José Madero, «Noche de brujas»), 36 s | ✅ publicado el 31/10 |
| `npm run render:cabanas` | **«8 cabañas»**: discografía de Madero en 8 bits estilo NES, 67 s, con chiptune original | ✅ |

Specs en `specs/`, `specs/reel/`, `specs/noche/` y `specs/cabanas/`. El MP4 sale en `out/` (no se versiona).

---

## 2. `projects/super-pepe/` — juego «MÉXICO VS. JOSÉ MADERO» (en curso)

### Cómo seguir en otro repo
- Copia la carpeta **`projects/super-pepe/`** completa (incluye `art/source/`, `specs/`, `scripts/`, `tests/`, `dist/`) y este archivo. No necesita nada más del repo actual.
- En la carpeta: `npm ci` → `npm test` (deben pasar **82 tests**) → `npm run build` (genera `dist/mexico-vs-jose-madero.html`, un solo archivo de unos 510 KB) → `npm run dev` (servidor en :5174).
- **Versión jugable compartida:** https://claude.ai/artifact/APwgHNVC6q7ajF9JwtmU3r (artifact del usuario, compartido con «cualquiera con el enlace»). Para actualizarla desde otra sesión: publicar el nuevo `dist/…html` pasando esa URL como `url`.
- Último commit en el repo actual: rama `ccr-70ec02ed-h3g6xs` de `edgaralrohe/awesome-opus5-5-videos`.

### Estado (v0.4, 2 nov 2026)
**Mundo 1 «Carmesí» completo y jugable** en ordenador y móvil (iPhone incluido): portada → capítulo → nivel → resumen → «¿Sabías que…?» → siguiente capítulo.
| Nivel | Capítulo (cartel al empezar) | Contenido |
|---|---|---|
| 1-1 Calle Carmesí | **«Lunes 28»**: 28 feb 2016, termina el último concierto en la Arena y a medianoche empieza algo nuevo; sus canciones, convertidas en pequeños Carmesís, se le vuelan por la calle | Fondo panorámico de Gemini (cúpula de arena con haces de luz, papel picado). Cartel de controles |
| 1-2 Azoteas | **«Plural siendo singular»**: abril 2016, la prensa toma la calle; hay que ir por encima del ruido | Fondo panorámico de Gemini (sale el **Cerro de la Silla** ⏳ el usuario decide si se queda) con cartel «COLORES RUIDOSOS» puesto por código |
| 1-3 El Teatro | **«La presentación»**: sep 2016, Teatro Metropólitan; la Prensa Rosa quiere la foto antes de que cante | Fondo por código (⏳ falta escena de Gemini). Cinemática del jefe + combate + Disco de Oro |

**Jugabilidad (spec §3.0d):**
- Velocidad 165 px/s, salto variable con *coyote time* y *jump buffer*, micrófono con cable que golpea y se engancha (impulso al soltar), parón de impacto, combo (2 s) × 100 puntos, cronómetro, marcador de 7 dígitos.
- **Ovación** (barra) → **Solo de guitarra** (C / ★ / botón Y): vence a todo lo que hay en pantalla y quita 1 golpe al jefe. **Amplificador** `A` (micro ×2, 10 s), **Carta de fan** `+` (+1 corazón).
- Piezas = **pequeños Carmesís** (moneda roja con rosa, dibujada por código).
- Enemigos: Titular, Paparazzi (flash que congela 0,6 s), Reportero (embiste), **Rumor Volador** (onda y picado), **Micrófono Traidor** (apunta y se lanza), espinas.
- **Jefe Cámara Flash-Bot «La Prensa Rosa»:** cinemática de entrada (bandas de cine, cae del techo, cartel, «¡A ESCENA!», saltable con A) → camina → carga («¡SALTA!» / «¡NO SALTES!») → rayo bajo o alto de 0,4 s → lente expuesto 2 s; 6 golpes, uno por apertura, retrocede tras cada golpe; fase 2 con 3 o menos; se deshace en pétalos → Disco de Oro. La cámara encuadra a Pepe y al jefe.
- **Historia y datos:** al vencer a un Titular sale un **dato distinto de la época de *Carmesí*** (orden cronológico, sin repetir, el contador sigue entre niveles); cada nivel cierra con su tarjeta de 2 datos y sus fuentes. Todo en `src/data/carmesi-story.js` (datos D1–D20 aprobados por el usuario).
- Controles táctiles arreglados para iOS (sin selección de texto ni menú «Copiar/Traducir»; los botones no se quedan pegados). En iPhone: jugar en horizontal y tocar una vez para que suene.

### Código
- `src/engine/` tilemap de texto, física, cámara, botones · `src/game/` `game.js` (orquestador, puntuación, Ovación, power-ups, cinemática), `enemies.js`, `boss.js`, `constants.js` (**todo el ajuste fino**: `P`, `MIC`, `ENEMY`, `BOSS`, `INTRO`, `OVATION`, `GUITAR`, `AMP`) · `src/render/` `draw.js`, `themes.js` (fondos por código), `backdrop.js` (panorámica), `font.js` (5×7 con tildes encima, Ñ, Ö, Ü) · `src/audio/` chiptune y efectos originales · `src/data/` niveles, atlas, historia, fondos.
- Paso fijo de 60 Hz, 320×224. `window.__jmv` expone estado para tests (`game`, `screen`, `level`, `held`, `goto(i)`).
- **Niveles** `src/data/world1.js` (texto, editable). Leyenda: `#` sólido, `=` semisólido, `^` espinas, `H` gancho, `*` Carmesí, `P` Pepe, `T` Titular, `F` Paparazzi, `R` Reportero, `V` Rumor, `M` Micrófono Traidor, `B` jefe, `A` Amplificador, `+` Carta, `C` checkpoint, `G` puerta.
- **Tests** (`npm test`, 82): motor, ritmo, power-ups, enemigos, jefe, cinemática, historia (datos aprobados, fuente, que se puedan dibujar), panorámica, bots que completan 1-1 y 1-2 y vencen al jefe, y navegador (Playwright: portada, Solo, 3 niveles, controles iOS).

### Arte y herramientas
- **Pepe:** hoja oficial de CR (`art/source/pepe-sheet.jpg`, 29 poses).
- **Gemini → juego:**
  - Personajes: `scripts/compose_frames.py <flashbot|rumor|prensa|traidor>` (recorta poses por cajas, quita rótulos, líneas de suelo y sombras, rellena huecos; fondo = color más frecuente) → `scripts/slice_sheet.py <hoja> <nombre> <alto> <filas> <anims>` (con `SLICE_BY_GAP=1` para hojas de una fila hechas de piezas). Ya en el juego: Flash-Bot (12 poses), Rumor (6), Micrófono Traidor (9), prensa (15).
  - Escenarios: Gemini **no separa capas**; se usan escenas completas como **fondo panorámico** con `scripts/import_backdrop.py tema=imagen` (224 px, 64 colores). La cámara recorre la imagen de borde a borde a lo largo del nivel (sin repetir, sin costuras).
- **Prompts:** `art/PROMPTS-GEMINI.md` §0b (personajes v5), §0c (escenarios), §1+ (resto de mundos). Reglas: un personaje por imagen, de perfil, mirando a la derecha, fondo gris liso, sin texto ni sombras.
- **Trajes de Pepe** (`art/source/pepe-trajes-1.jpg`, `-2.png`; solo 4 poses cada uno: reposo, correr, saltar, lanzar):
  | Traje | Uso |
  |---|---|
  | Clásico (camiseta blanca, bandana roja) | Por defecto |
  | Vampiro | Mundo Noche |
  | Rojo y amarillo (traje rojo, camisa amarilla, moño) | Mundo Sarajevo |
  | Bandana negra (chaleco, guitarra) | Mundo Querido… |
  | Emo (negro con lentes oscuros; según el usuario, el del Foro GNP ⚠️ sin fuente) · gris con boina · chamarra universitaria · botarga morada | Desbloqueables en la Galería del Museo |
  - Botarga morada = Tinky Winky (personaje registrado): **riesgo aceptado por el usuario**; sin nombre en pantalla. La guitarra turquesa recuerda a un modelo comercial: para el Solo, guitarra de forma propia.

### Decisiones tomadas
- **Título** «MÉXICO VS. JOSÉ MADERO» (playera oficial). **Sello JMV = José Madero Vizcaíno**, diseño propio. Estética 16 bits Neo Geo / *Spin Master*. Arma: micrófono con cable.
- **Historia general:** Pepe tiene que «recordar quién es» antes de su concierto en la **Arena Ciudad de México**, perseguido por la prensa. **Hub: el Museo** (inspirado en el de 2026). El juego **empieza y termina en la Arena**.
- Prensa genérica: Titulares con titulares genéricos («¡EXCLUSIVA!», «¡POLÉMICA!», «¡ÚLTIMA HORA!»), sin insultos ni medios reales.
- **Logo de CR:** el de los conceptos es el real; falta el **archivo original** (PNG transparente o SVG). No generarlo con IA.
- **Mundos:** Carmesí (2016, rojo) · Noche (2017, B y N) · Alba (2018, blanco, **paseo**) · Psalmos (2019, azul) · Giallo (2022, amarillo) · Aurora EP (2023, naranja óxido, **paseo**) · Sarajevo (2024, lila) · Querido… (2026, verde). Intermedio: Rueda de Prensa. Final: VS en la Arena (barra = cariño del público, música original). Secreto: La Bestia.
- **Memorial «Luciérnagas»** (cierre de Sarajevo): sin combate ni puntos, aviso previo saltable, dedicatoria solo con consentimiento de la familia, teléfonos de ayuda verificados ⚠️. La luciérnaga no es power-up; en niveles oscuros, farol.
- No se usan en pantalla polémicas de prensa negativa (firma de autógrafos de 2016, acusación de plagio de la portada).

### Jefes de los mundos 2–8 (⏳ revisión del usuario)
Noche: El Enmascarado del Lago (al vencerlo se quita la máscara) · Alba: La Nostalgia (momento final) · Psalmos: La Sombra · Giallo: El Maniquí en Llamas · Aurora: momento final ⚠️ · Sarajevo: El Rey Ahogado → memorial · Querido…: Los Dos Pierrots ⚠️ (no castigar al que llora).

---

## Pendiente con el usuario
1. **Feedback de jugar el Mundo 1** (velocidad, jefe, Ovación, duración de niveles ≈ 1 min) → ajustes en `constants.js`.
2. **Escena del Teatro (1-3)** de Gemini: escena completa, sin candelabros en el centro de arriba (los pone el juego).
3. ¿Cerro de la Silla en las Azoteas o volcanes?
4. **Trajes:** pedir a Gemini las poses que faltan (aterrizaje, daño, KO, victoria, grito) → implementar trajes por mundo + **Galería del Museo** con desbloqueos y guardado (tarea H5).
5. **Archivo original del logo** de Colores Ruidosos.
6. Revisión de jefes 2–8 y momento final de *Aurora*.
7. **Equipo de Madero:** visto bueno al juego, licencia de letras y música, consentimiento de la familia para el memorial. Fecha del concierto en la Arena CDMX (sin fuente pública).
8. Alcance: piloto Carmesí + Noche (recomendado) o los 8. ¿Panda/PXNDX como mundo 0?
9. Publicación oficial en la web de CR (usa el nombre de un artista real: decide el usuario). Al tener los 8 mundos, cargar los fondos aparte (el HTML único pasaría de 1 MB).

**Siguiente tarea recomendada:** feedback del Mundo 1 → escena del Teatro → **Museo (hub) + Galería de trajes** (H5) → **Mundo 2 «Noche»** con TDD (spec, tests y después código).

### Lecciones de verificación
- **No usar la Wikipedia EN de *Carmesí* como fuente única:** decía que «La noche de la mesa triste» era sencillo del disco (es de PXNDX, *Bonanza*, 2012).
- Textos de IA que aporte el usuario: comprobar punto por punto (el 2 nov, de un texto así se descartaron «Los Lemons», la financiación independiente y a Roberto Martínez como coanfitrión del podcast).
- La red de la sesión no deja abrir Wikipedia ni periódicos; se verifica cruzando búsquedas web (2 o más fuentes = ✅).

---

## Datos verificados (con fuente) — José Madero
| Dato | Fuente |
|---|---|
| *Carmesí*: 29 abr 2016; Disco de Oro en 2016 (mes ⚠️ oct/nov); Artista Revelación monitorLATINO 2016; canciones de 2008–2010. **Corrección (2 nov):** «Lunes 28» fue el **adelanto** (0:00 del 29 feb 2016, tras el último concierto de Panda en la Arena CDMX), **no un sencillo**; primer sencillo «Plural siendo singular» (vídeo 8 abr 2016); también «Sinmigo» (vídeo 19 ago 2016) y «Literatura rusa». ❌ «La noche de la mesa triste» es de PXNDX (*Bonanza*, 2012), no de *Carmesí*: la Wikipedia EN se equivoca. Lista completa de datos de la época con fuentes y estado: spec §3.0e (D1–D20) | Wikipedia EN/ES, CineMedios, El Siglo de Torreón |
| *Noche*: 2017; «Noche de brujas», primer sencillo (9 jun 2017), **no es de Halloween** (máscaras sociales); vídeo en B y N, homenaje al terror clásico | Wikipedia (Noche), Revista Kuadro, Milenio, Looking Back |
| Gira *Noche*: figuras de Jason, Freddy y Pinhead en el escenario; «Fantasmas» en el setlist | ABC Noticias, El Alebrije, Soulwavez |
| Es fan del terror y de Stephen King | Milenio, Looking Back |
| *Alba*: 16 mar 2018; «disco blanco», conceptual, *Oda a la nostalgia*, «el amanecer»; «Maldita Rueda» | Wikipedia (Alba), Looking Back, Apple Music |
| *Psalmos*: 6 sep 2019; adelantado por filtraciones; iba a tratar el lado oscuro de Peter Pan; «Codependientes» con Cami; n.º 1 en México; producido con Flip Tamez; portada: persona en posición fetal en una esquina | Wikipedia ES/EN, Intolerancia Diario, Informador; portada confirmada por el usuario |
| *Giallo*: 2022; amarillo + cine *giallo*; trata trastornos mentales; gira *Giallo Fantastique*, Auditorio Nacional el 10 jun 2022 | Grita Radio, Chilango, Entodomusic |
| *Aurora* (EP): 17 mar 2023; 6 canciones (Casanova, Nueva Inglaterra, Aplaudan en Silencio, Domingo de Ceniza, Posa y Sonríe, Tiempo Compartido) | Discogs, Spotify; usuario |
| *Sarajevo*: 2024 (fecha exacta ⚠️); «Rey Ahogado» con Lasso; «Luciérnaga» | Letras, Last.fm |
| **«Luciérnaga»**: sobre el feminicidio de Karen Rebeca Esquivel (19 años; Naucalpan, 2016); coescrita con su madre, Becky Espinosa; dedicada «a las mujeres que hoy no pueden alzar la voz». En un podcast Madero habló también del feminicidio de una seguidora, Prisma Lorena Villarreal | La Razón, Milenio, UnoTV, Diario de México, Revista Netas; El Heraldo de México |
| Estadio GNP Seguros, 24 ene 2026, «Érase una Bestia» (su primer estadio), con museo en una carpa | Chilango, Excélsior |
| Museo en Monterrey, 21 jul–21 ago 2026: más de 100 piezas, gratis, partitura original de «Plural siendo singular» | MVS Noticias, El Horizonte, Info7 |
| *Querido…*: 3 sep 2026; 7.º disco, 13 canciones, epistolar y medieval, sin sencillos; verde; portada con dos pierrots con perlas | CineMedios, El Sol de Sinaloa, Indie AM |
| Playera «México vs. José Madero» (merch) | Class Music |
| «En algún momento fui un pendejo, pero dejé atrás eso hace mucho tiempo» | La Razón, 10 dic 2024 |
| A su yo joven le diría que no fuera tan arrogante | Publimetro, 20 oct 2025 |
| ❌ **No verificado:** que llamara a las polémicas «sacadas de contexto»; la fecha del concierto en la Arena CDMX; el concepto de *Sarajevo* | — |

## Datos verificados — Viva Belgrado (reel)
- Quinto disco, 23 oct 2026, Fueled By Salmorejo; producido por Ricky Falkner; Alain Johannes en «Menquitofla»; 11 canciones.
- Titular de Mondo Sonoro: «Una de las responsabilidades de hacerse mayor es ser feliz».
- Presentación en Hiriko Soinuak (Barakaldo) el 23 oct; encuentros «Vernissage»; gira 2027.
- T13 y T14 son paráfrasis del usuario. «Primer disco con Jaime y Cris» y «casi mil copias en preventa» los aportó el usuario y no hay fuente pública que los confirme.
