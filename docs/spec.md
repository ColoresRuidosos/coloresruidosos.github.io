# spec.md — Colores Ruidosos: fanzine digital autónomo

> Versión consolidada. Reemplaza la spec anterior basada en Vite + revisión por Pull Request.
> Metodología: Spec-Driven Development (qué y por qué). El cómo está en `plan.md`; el avance en `tasks.md`.

## 1. Visión

**Problema.** El equipo quiere un medio vivo sobre la escena indie/rock, pero cuatro amigos con otros trabajos no pueden revisar medios y carteleras todos los días.

**Solución.** Un sitio Hugo que se actualiza solo cada mañana con hasta 3 notas y una agenda de conciertos de Pachuca y CDMX, con una capa humana ligera en Google Sheets para recomendar, corregir y despublicar sin tocar código.

**Principios editoriales**
1. Solo hechos, redacción propia en español. Sin frases copiadas ni citas textuales.
2. Créditos visibles con enlace a cada medio fuente.
3. Sin imágenes ajenas: solo embeds oficiales (Spotify, YouTube) e imágenes propias del equipo (ilustraciones, fotos suyas) subidas a `assets/notas/<slug>.*`; nunca fotos tomadas de las fuentes.
4. México primero: lo que viene a México, luego Latinoamérica, luego lo general.
5. Transparencia: el sitio indica que las notas se redactan con ayuda de IA.
6. Publicación 100% automática; la corrección es posterior (decisión explícita del equipo).

**Métricas de éxito (v1)**
- 30 días seguidos de corridas sin intervención técnica.
- ≥ 1 nota semanal con relevancia México o Latinoamérica.
- Menos de 1 nota despublicada por error a la semana.

**Fuera de alcance (v1)**
- Qué pasa con la web actual (reseñas, descargas, tienda): **decisión abierta**.
- Generador dinámico de stickers (crear uno nuevo con texto/IA): la web anterior lo tenía; la galería fija (F13) resuelve la parte de "mostrar stickers", el generador queda fuera por ahora.
- Dominio propio (v1 vive en la URL de GitHub Pages).
- Recomendaciones de la comunidad (formulario abierto).
- Fuentes desde X/Instagram.
- Trivia LoL (F15), segunda fase: tabla de récords entre jugadores y versiones 8 bits de canciones de la banda (requiere permiso de la banda o su editorial).

## 2. Usuarios

| Rol | Necesita |
|---|---|
| Lector | Enterarse de giras y lanzamientos, escuchar ahí mismo, llegar a la fuente original, encontrar conciertos y guardarlos en su calendario |
| Curador (Pardy, Tanelly, Dany, Pratz) | Recomendar, corregir u ocultar eventos y despublicar notas desde el celular, sin GitHub |
| Mantenedor técnico (Edgar) | Resumen diario claro, costos acotados, poder ajustar fuentes, recintos y prompts sin tocar lógica |
| Pipeline (actor automatizado) | Configuración clara y estado persistente para no repetir |

## 3. Funcionalidades

**F1 Ingesta RSS.** Feeds configurables; solo últimas 72 h; un feed caído no detiene la corrida.

**F2 Deduplicación.** Por URL canónica y por hecho (artista + categoría). Varias fuentes del mismo hecho producen una nota con todas las fuentes. No se repite un hecho en 14 días.

**F3 Clasificación y ranking.** Categoría (gira, lanzamiento, anuncio, otro), pertenencia a indie/rock y fechas explícitas. La relevancia se calcula en código: `mx` exige fecha futura en México; `latam`, en un país latinoamericano. Tope diario de 7, con cuota de al menos 3 de escena mexicana y 3 de escena española (se rellenan entre sí antes que con fuentes internacionales).

**F4 Redacción.** Claude redacta título, entrada y cuerpo (≤ 250 palabras) con la voz de la marca. El front matter lo construye el código; las fuentes vienen del RSS, nunca del modelo.

**F5 Validación.** Créditos completos, sin 8+ palabras copiadas, sin citas, longitudes. Un reintento con los errores; si vuelve a fallar, se descarta.

**F6 Embed oficial.** Se prueba en orden Spotify (artista o álbum con coincidencia exacta; requiere credenciales y cuenta Premium), Apple Music (búsqueda gratuita sin llave; álbum exacto o, si no, la página del artista, cuyo reproductor muestra su foto o portada) y YouTube (canal oficial o Topic). Sin coincidencia: sin embed. El embed aparece en la nota completa, no en las tarjetas.

**F7 Publicación automática.** Commit directo a `main` y despliegue a GitHub Pages desde el mismo workflow. Interruptor `autopublicar`.

**F8 Despublicación.** Pestaña Notas del Sheet → `draft: true/false`.

**F9 Agenda.** JSON-LD de carteleras de recintos + pestaña Eventos del Sheet (siempre gana). Regla de supervivencia por recinto. Eventos del equipo para recintos sin cartelera legible. Solo próximos 60 días.

**F10 Curadores.** Pardy, Tanelly, Dany y Pratz pueden recomendar/firmar un evento desde el Sheet (varios a la vez); sin firma aparece como Cartelera y se muestra igual en cada evento. El sitio filtra la agenda por recinto, no por curador.

**F11 Calendario `.ics`.** El visitante elige conciertos del mes y descarga un archivo compatible con Google Calendar, Apple y Outlook.

**F12 Observabilidad.** Resumen por corrida en GitHub Actions: publicadas, descartadas con motivo, feeds con error, avisos de recintos y Sheet, tokens usados.

**F13 Visor de stickers.** Página `/stickers/` con la galería de stickers propios del equipo (mismo principio que F6/imágenes de notas: nada de terceros). El equipo sube un archivo a `assets/stickers/`; sin configuración adicional aparece en la galería. Clic en un sticker abre una tarjeta 3D: el sticker está pegado encima de un reverso de tarjeta de colección con la marca "Colores Ruidosos"; clic/toque lo despega (como una calcomanía) y lo levanta para revelar el reverso, clic de nuevo lo vuelve a pegar. Cierra con la X, el fondo o Escape. Sin stickers subidos, la página muestra un aviso en vez de una galería vacía.

**F15 Trivia Love of Lesbian en 8 bits.** Página `/trivia/`: un juego de 15 preguntas (5 fáciles, 5 difíciles, 5 muy difíciles; 30 puntos) que recorre las seis etapas de la banda en orden, cada una con su escena pixel art inspirada en las portadas (reinterpretación propia, no copia). Al final da una categoría (**Pequeño lesbiano**, **Lesbianito**, **Viejo lesbiano** y una secreta con 30/30), insignias con nombres de canciones, portadas coleccionables y una tarjeta 8 bits para compartir. Récord, insignias y colección se guardan solo en el navegador del jugador. **Objetivo: engagement**, con lanzamiento antes de las últimas fechas de la banda en México antes de su pausa indefinida (CDMX, 24–26 de noviembre de 2026, y Puebla, 28 de noviembre). **Regla de veracidad:** cada pregunta tiene fuente enlazada (web oficial, o dos fuentes independientes), sin letras de canciones, y solo entra al juego tras la revisión de un fan. Contenido detallado (preguntas, categorías, insignias, datos descartados): `docs/trivia.md`. Sin llamadas a la API de Claude: cero costo por partida.

**Métricas de éxito de F15:** partidas iniciadas vs. terminadas (> 60 % terminan); al menos 1 de cada 5 partidas termina en compartir la tarjeta; jugadores que vuelven a jugar (insignia "Universos infinitos"). *Sin analítica en el sitio hoy: medir requiere decidir una herramienta respetuosa con la privacidad (decisión abierta).*

**F16 Contrarreloj "¿De qué disco es?"** Segundo modo de juego dentro de `/trivia/`. Aparece el título de una canción y cuatro discos de estudio para elegir; hay 60 segundos para acertar todas las que se pueda.
- **Puntos:** +1 por acierto; con racha de 5 o más vale ×2 y con 10 o más, ×3. Un error corta la racha y resta 3 segundos. No se repiten canciones en una partida; si se acaba el banco, la partida termina.
- **Resultado:** puntos, aciertos, mejor racha y récord personal, más tarjeta para compartir ("N canciones en 60 segundos").
- **Insignias nuevas**, con nombre de canción, en la misma colección: **Psiconautas** (primera partida de contrarreloj), **Los seres únicos** (10 aciertos seguidos), **Radio Himalaya** (20 aciertos en una partida) y **Cosmos (Antisistema Solar)** (100 canciones acertadas en total).
- **Veracidad:** las mismas reglas de F15. Cada canción tiene fuente y pasa por la revisión de un fan; solo se juegan las de fuente sólida (o verificadas, cuando el banco salga de borrador). Solo discos de estudio y sin canciones que se llamen como su disco. Contenido: `docs/canciones.md`.
- **Objetivo:** que la gente vuelva a jugar en los días de los conciertos de México (24 al 28 de noviembre de 2026).

**F17 Insignias como chapas y 11 insignias "imposibles".** Las insignias de la trivia pasan a verse como chapas de concierto en pixel art (aro de color por familia, ícono por canción, cuatro estados) y se abren en grande al tocarlas. Se suman 11 insignias secretas difíciles o escondidas (habilidad, constancia y dos secretos: código Konami y tocar la pantallita), con su pista en la colección, y "El gran truco final" para quien las tenga todas. Detalle: `docs/trivia.md` §2.3.

**F18 Ranking semanal e histórico.** Top 20 de la semana y Top 20 histórico de la trivia (y del contrarreloj cuando exista), consultables en `/trivia/`. Publicar un puntaje es opcional y se ofrece al terminar. Los nombres son **generados** con palabras del universo de la banda ("Psiconauta del Ártico #42"); la persona puede volver a tirar la ruleta, pero no escribir el suyo. Se guarda solo nombre generado, puntaje, duración y fecha. Los puntajes viven en un Google Sheet del equipo detrás de un Apps Script: el equipo modera borrando filas. Empate: gana la partida más rápida y después la más antigua. Cada nombre aparece una sola vez, con su mejor puntaje. La semana va de lunes a domingo en hora de CDMX.

**F19 Compartir en Instagram.** Ningún sitio puede publicar directo en Instagram, así que se le facilita a la persona:
- **Dos formatos** de tarjeta: *historia* (1080×1920) y *feed* (1080×1350), cada uno con su botón.
- **@ opcional**: la persona puede escribir su usuario de Instagram y aparece **solo en su propia imagen**, nunca en el ranking (que sigue con nombres generados). Se guarda en su navegador para la próxima vez.
- **Texto listo para pegar**: al compartir se copia un texto con la categoría, la mención a @coloresruidosos y la dirección del juego, porque Instagram no deja precargarlo.
- **En el celular** se abre el menú de compartir con la imagen (ahí aparece Instagram); **en computadora** se descarga con un aviso de pasarla al celular y etiquetar a @coloresruidosos.
- **Cada chapa ganada se puede compartir sola** desde su vista en grande ("Conseguí *Contradicción*").
- Conectar la cuenta de Instagram queda **fuera de alcance**: Meta solo permite iniciar sesión a cuentas profesionales y exige app registrada, revisión y servidor propio.

**F20 "Adivina la canción" (por su sonido).** Tercer modo de `/trivia/`, tipo *Heardle*:
- **Ronda del día: 10 canciones, las mismas para todos** (el día cambia a medianoche de CDMX). Salen del banco de canciones de F16 en un orden fijo; con ~68 canciones el banco da la vuelta cada semana, en distinto orden. Se juega una vez al día y el progreso sobrevive a recargar la página. **El orden de esas 10 es al azar en cada sesión** (F24): todos juegan las mismas canciones, pero nadie puede pasarle a otro "la 3 es tal canción". Si recargas a mitad de la ronda, sigues con tu mismo orden.
- **Puntos por canción:** 6 si se adivina con 1 s, 5 con 2 s, 4 con 4 s, 3 con 7 s, 2 con 11 s, 1 con 16 s y 0 si no. La ronda vale hasta 60. Desempate: menos tiempo total entre el primer "Escuchar" de cada canción y la respuesta correcta.
- **Rondas de práctica** ilimitadas, de 10 canciones al azar y en orden al azar cada vez, para seguir jugando: no cuentan para la racha ni el ranking.
- **Seis intentos con fragmentos que crecen:** 1, 2, 4, 7, 11 y 16 segundos desde el inicio del avance. En cada intento se elige un título de la lista (con buscador) o se salta para escuchar más. Mientras menos segundos hagan falta, mejor.
- **Después de cada canción:** su título, su disco y el botón **"Escúchala en Spotify"**, más el enlace a Apple Music como fuente del fragmento. Al final de la ronda, el resumen de las 10 con sus puntos y enlaces.
- **Para compartir sin spoilers:** texto tipo *"Adivina la canción de Love of Lesbian #12 · 43/60 · 🟩🟩🟨🟥🟧🟩🟨🟩🟩🟨"* (verde: 1–2 fragmentos; amarillo: 3–4; naranja: 5–6; rojo: no), que se copia solo, y una tarjeta para historias.
- **Constancia:** se guarda en el navegador el resultado de cada día y la racha de días seguidos con al menos una canción acertada. Si ya jugaste hoy, ves tu resultado y cuánto falta para la siguiente ronda.
- **El fragmento sale del avance oficial de 30 segundos de Apple Music.** Spotify ya no ofrece avances a apps nuevas desde noviembre de 2024, y su reproductor muestra el título. Nada de letras ni audio alojado por el sitio.
- **Solo entran canciones con coincidencia exacta** en Apple Music (mismo título, artista Love of Lesbian y el disco de estudio, no una versión en directo). El botón de Spotify lleva a la pista exacta si Spotify la encuentra; si no (o mientras el repo no tenga credenciales de Spotify), lleva a la búsqueda de esa canción en Spotify.

**F21 Ranking de todos los modos.** El botón **Ranking** muestra una tabla por modo, con el mismo sistema de F18 (nombres generados, publicar opcional, Sheet del equipo):
- **Trivia:** Esta semana / Histórico (como hoy).
- **Contrarreloj:** Esta semana / Histórico, por puntos; desempate por fecha.
- **Adivina la canción:** **Hoy** (mejor ronda del día), **Semana** (suma de las rondas de lunes a domingo, una por día) y **Mejor racha** (más días seguidos con al menos una acertada).
- Para publicar contrarreloj y Adivina la canción, el equipo actualiza el Apps Script **una vez** a una nueva versión de la misma implementación, sin cambiar la URL.

**F22 Adivina la canción sin silencios, botón claro e insignias.**
- **Ningún fragmento empieza en silencio:** algunos avances de Apple arrancan con un fade o una intro muda, y el fragmento de 1 s sonaba vacío. Cada canción guarda en qué segundo del avance empieza a sonar de verdad, y todos sus fragmentos parten de ahí (igual para todos los jugadores).
- **El botón de saltar dice lo que hace:** "No la sé · oír 2 s" (luego 4, 7, 11 y 16 s) y, en el último intento, "Me rindo". Queda claro que da más fragmento de la misma canción y no cambia de canción.
- **Seis insignias propias** (familia Adivina la canción, aro cian), con nombres de canciones del banco:

| Insignia | Cómo se gana | Visible |
|---|---|---|
| Música de ascensores | Terminar tu primera ronda (del día o de práctica) | Sí |
| Mi primera combustión | Adivinar una canción con 1 segundo | Sí |
| Ya sale el sol | Acertar las 10 canciones de una ronda | Sí |
| Domingo astromántico | Racha de 7 días seguidos en la ronda del día | Sí |
| Nada | No acertar ninguna en una ronda | Secreta · pista: "Ni una te sonó conocida" |
| El día que Starman huyó | 60 de 60: las 10 con 1 segundo | Secreta · pista: "Ni un segundo más" |

  Las rondas de práctica también dan insignias (menos la racha). Las insignias nuevas salen al final de la ronda, como en el contrarreloj, y se suman a la colección. "El gran truco final" no las pide, igual que con las del contrarreloj.

**F23 Inicio con un solo botón y menú de modos.** El inicio solo dice **"▶ Iniciar"** (con la pantallita animada y sus secretos de siempre). Al tocarlo aparece **"Elige tu modo de juego"** con los tres modos y una explicación breve de cada uno:
- **▶ Trivia:** 15 preguntas en 6 etapas, de la etapa en inglés a la pausa de 2026. Descubre qué tan lesbiano eres.
- **⏱ Contrarreloj:** 60 segundos. Te damos una canción y eliges de qué disco es; las rachas multiplican tus puntos.
- **🔊 Adivina la canción:** escucha fragmentos de 1 a 16 segundos. 10 canciones al día, la misma ronda para todos.

Al elegir, entra directo a ese juego. En el menú también están Mi colección, Ranking, el sonido y tu récord. Los botones "Volver" de los juegos, la colección y el ranking regresan a este menú, y el menú tiene su propio "Volver" al inicio.

**F25 Sección Games.** En el menú, "Trivia" pasa a llamarse **Games**. `/games/` muestra una tarjeta por juego, con nombre, una línea de qué es y el botón para jugar:
- **Trivia Love of Lesbian:** el mismo juego de siempre, en su misma dirección `/trivia/`, para que no se rompan los enlaces compartidos ni las tarjetas de resultado. Arriba lleva "◀ Games" para volver.
- **México vs. José Madero:** homenaje no oficial de 16 bits a José Madero, con sus dos primeros discos (*Carmesí* y *Noche*), rumbo a sus conciertos en la Arena Ciudad de México (21 y 22 de mayo de 2027). Se juega en `/games/mexico-vs-jose-madero/`, a pantalla completa y con controles táctiles en el celular.
- **Yo contra mi corazón:** minijuego de ritmo y box en vertical, homenaje no oficial: el payaso contra un corazón gigante, al ritmo de «Teoremas, etc.». Se juega en `/games/yo-contra-mi-corazon/`. Lleva la canción original como **excepción aceptada por el usuario** (9 nov 2026); detalle en `juegos/yo-contra-mi-corazon/specs/spec.md` §6.1. **Solo está disponible la semana del 9 al 15 de noviembre de 2026:** la tarjeta lleva «Solo esta semana» y desaparece sola gracias al campo `hasta` de `data/games.json`. Tiene ranking semanal con el mismo Apps Script de la trivia (modo `corazon`, ver `docs/ranking/README.md` §6).
- **Lanzamiento con fecha:** cada juego tiene una fecha `desde`. Antes de esa fecha la tarjeta no aparece. El de José Madero sale el **viernes 6 de noviembre de 2026 a las 8:00 (CDMX)** con la compilación diaria, aunque el cambio se fusione antes. La página del juego sí existe antes, pero no está enlazada.
- El menú marca "Games" como activo en `/games/` y en `/trivia/`.

**F26 Trivia José Madero: Carmesí y Noche.** Una segunda trivia en Games, con el motor de la de Love of Lesbian, sobre las dos etapas que ya tiene el juego *México vs. José Madero*: **E1 *Carmesí* (2016)** y **E2 *Noche* (2017)**. Crece con el juego: cada vez que se abra un disco nuevo, la trivia suma su etapa.
- **Modos (decisión del usuario, 7 nov 2026):**
  - **Trivia por etapas:** fáciles, difíciles y muy difíciles, con categoría final e insignias.
  - **Contrarreloj:** 60 s; una canción de *Carmesí* o de *Noche* y cuatro discos para elegir. Solo canciones de las listas verificadas; *Alba* y *Psalmos* aparecen como opción incorrecta y nunca como respuesta.
  - **Adivina la canción:** fragmentos del avance oficial de Apple Music, como en F20 y F22.
- **Orden (decisión del usuario):** primero el **banco de preguntas** (`docs/trivia-madero.md`) para que un fan de CR lo revise. El juego se construye después y sale cuando haya **al menos 5 preguntas `verificada` por dificultad**.
- **Veracidad (lo pidió el usuario: «todo confirmado»):** las mismas reglas que `docs/trivia.md` §0.
  - Cada pregunta lleva **2 fuentes independientes con enlace**.
  - Si las fuentes se contradicen, la pregunta se descarta.
  - Con una sola fuente queda en 🟡 y no entra.
  - Todo nace como `propuesta` y solo entra al juego lo que un fan marque `verificada` tras abrir los enlaces.
  - Sin letras de canciones (solo títulos, fechas, personas y lugares) y sin polémicas.
- **Nombre en Games:** «Trivia José Madero: Carmesí y Noche». Homenaje no oficial.

**Métricas de éxito de F16:** partidas de contrarreloj frente a partidas de trivia; cuántos juegan más de una vez seguida; tarjetas compartidas.

## 4. Flujos

**A. Corrida diaria (8:00 CDMX).** Tests → notas → agenda → despublicaciones → compilar sitio → commit único (solo si hay cambios) → despliegue a GitHub Pages.

**B. Nota.** RSS → ventana 72 h → dedup URL → clasificar (con caché) → agrupar por hecho → excluir publicados → top 3 → redactar → validar (1 reintento) → embed → Markdown.

**C. Agenda.** Por recinto: leer JSON-LD → si falla o trae 0, conservar anteriores → aplicar Sheet (o conservar marcas si no responde) → filtrar futuros → firmar → `data/eventos.json`.

**D. Corregir una nota publicada.** Curador ve error → pestaña Notas: slug + TRUE → siguiente corrida (o corrida manual) la oculta.

**F. Partida de trivia.** Portada del juego → "Jugar" → sorteo de 15 preguntas verificadas (5/5/5) ordenadas por etapa → por cada etapa, escena pixel art y sus preguntas (4 opciones; acierto/error con sonido y animación breves) → resultado: puntaje, categoría con su avatar, insignias nuevas, portadas desbloqueadas → compartir tarjeta o volver a jugar.

**H. Partida de contrarreloj.** Inicio de `/trivia/` → "Contrarreloj" → cuenta regresiva 3-2-1 → canción + cuatro discos, reloj de 60 s → acierto (puntos, racha, siguiente canción) o error (−3 s, racha a cero, se marca el disco correcto 0,6 s) → al llegar a 0 s: resultado, insignias nuevas, compartir o jugar otra vez.

**G. Alta de una pregunta.** Se propone en `docs/trivia.md` con fuentes → un fan abre los enlaces y confirma → pasa a `data/trivia.json` con `estado: verificada` → los tests validan formato y fuentes → la siguiente compilación la incluye.

**E. Recomendar un evento.** Curador en pestaña Eventos: recinto, fecha, parte del título, casilla con su nombre → siguiente corrida.

## 5. Arquitectura

```
GitHub Actions (cron) ──► pipeline/ (Python)
   autoblog.py ──► RSS · Claude · Spotify/YouTube ──► content/posts/*.md
   scrape_eventos.py ──► recintos (JSON-LD) · Sheet ──► data/eventos.json
   sync_sheet.py ──► Sheet ──► draft true/false
   hugo (verificación) ──► commit único a main
                                   │
GitHub Pages ◄─────────────────────┘  hugo --gc --minify -b <url de Pages>
   /            portada (notas + próximos conciertos)
   /notas/      listado y páginas por nota con Open Graph
   /agenda/     filtros + descarga .ics
   /stickers/   galería de stickers propios del equipo, con visor 3D
   /games/      lista de juegos (data/games.json, con fecha de salida)
   /games/mexico-vs-jose-madero/  juego de 16 bits (static/, compilado desde juegos/mexico-vs-jose-madero/)
   /trivia/     juego 8 bits sobre Love of Lesbian: trivia (data/trivia.json), contrarreloj
                (data/canciones.json) y Adivina la canción (data/audio.json), canvas; el ranking (F18)
                lee y escribe en un Apps Script ──► Google Sheet del equipo
GitHub Actions (audio-trivia.yml) ──► Apple Music (avances) · Spotify (enlaces) ──► data/audio.json
```

Estructura, modelo de datos y decisiones: ver `plan.md`.

## 6. Requisitos no funcionales

**Legal y ética:** sin frases copiadas (validador), créditos visibles, sin imágenes de terceros, respeto a `robots.txt` en carteleras, bot identificado, aviso de redacción con IA. *Criterio editorial, no asesoría legal.*

**Seguridad:** llaves solo en GitHub Secrets; HTML crudo deshabilitado en Markdown; el contenido del modelo se trata como no confiable.

**Costo:** modelo ligero para clasificar, modelo principal solo para las 3 notas; caché de clasificaciones; tope de tokens por corrida.

**Confiabilidad:** fallos aislados por fuente y por recinto; corrida idempotente; sin commit si no hay cambios; no se publica si fallan tests o compilación.

**Identidad (SPEC-001):** crema `#F4EFE6`, tinta `#141414`, rosa `#FF3E7F`, azul `#2F5BFF`, amarillo `#FFD23F`, verde `#1FB57A`, naranja `#FF7A30`; Syne y Space Grotesk. Colores primarios vibrantes (no tonos apagados). Reglas de contraste: rosa, amarillo, verde y naranja solo con texto tinta encima (nunca blanco); rosa reservado para el sticker "Viene a México"; verde, naranja, azul y amarillo marcan respectivamente las categorías Lanzamiento, Gira, Anuncio y Crónica.

**Trivia (F15):** juego completo con teclado (1–4 y Enter) y lector de pantalla (las escenas pixel art tienen texto alternativo; las preguntas tipo portada describen la imagen); sin destellos de más de 3 por segundo; `prefers-reduced-motion` quita animaciones; sonido apagado por defecto; funciona a 360 px y sin `localStorage`. Portadas redibujadas en pixel art propio, nunca las originales pixeladas; sin letras ni audio de la banda.

**Contrarreloj (F16):** se juega con teclado (1–4); el reloj se muestra como número y no solo como barra; el lector de pantalla anuncia acierto o error, no cada segundo; con `prefers-reduced-motion` no hay sacudidas ni destellos. La pantalla de inicio avisa que es con tiempo, para quien prefiera la trivia sin reloj.

**Ranking (F18):** sin datos personales ni cookies; el sitio avisa qué se publica antes de enviarlo. El servidor rechaza puntajes imposibles (fuera de 0–30, partidas de menos de 15 s) y limita los envíos por navegador. Las trampas no se pueden evitar del todo en un juego sin servidor propio: el equipo modera en el Sheet. Si el Apps Script no responde, el juego sigue funcionando y el ranking muestra un aviso.

**Accesibilidad y rendimiento:** foco visible, enlace para saltar al contenido, filtros con `aria-pressed`, responsive a 360 px, iframes con carga diferida, sin librerías JS.
