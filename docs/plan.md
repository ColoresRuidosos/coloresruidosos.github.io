# plan.md — decisiones técnicas

## Stack
| Capa | Elección |
|---|---|
| Sitio | Hugo extended 0.166 (sistema de plantillas nuevo: `layouts/home.html`, `layouts/_partials/`, `layouts/agenda/section.html`) |
| Pipeline | Python 3.12: `feedparser`, `requests`, `beautifulsoup4`, `pyyaml`, `anthropic` |
| Tests | `pytest` (dominio e integración con dobles) + `node --test` (generador `.ics`) |
| Orquestación | GitHub Actions, un job con pasos aislados y commit único |
| Hosting | GitHub Pages (despliegue desde GitHub Actions), URL `https://coloresruidosos.github.io/` (organización `ColoresRuidosos`, repo `coloresruidosos.github.io`) |
| Capa humana | Google Sheet publicado como CSV |

## Decisiones
- **D1 JSON del modelo, YAML del código.** El modelo nunca escribe front matter; `zod`-equivalente en `cr/esquemas.py`.
- **D2 Dos modelos.** `claude-haiku-4-5-20251001` clasifica en lotes de 25; `claude-sonnet-5` redacta. Configurables en `pipeline.yaml`.
- **D3 Relevancia en código.** El modelo solo extrae fechas explícitas; `mx`/`latam` se calcula a partir de ellas.
- **D4 Estado en `pipeline/estado/noticias.json` en `main`.** Ya no hace falta rama aparte: cada corrida con cambios publica igual. Se poda solo (URLs 30 días, hechos 14 días, clasificaciones 4 días). Además se cruzan las fuentes de las notas ya publicadas, así que perder el estado no provoca duplicados masivos.
- **D5 Copia por n-gramas de 8 palabras**, ignorando palabras de nombres propios. Limitación: la fuente suele estar en inglés, así que atrapa sobre todo frases citadas.
- **D6 Agenda por JSON-LD genérico** en lugar de un scraper por diseño de página: sobrevive rediseños y cubre boleteras. Recintos sin JSON-LD → Sheet.
- **D7 El Sheet gana**, con match por recinto + fecha original + título parcial. `nueva_fecha` para no romper el match.
- **D8 `.ics` en el navegador**, horas convertidas de UTC-6 a UTC; sin hora = día completo; duración 3 h.
- **D9 Demo aislada** con `--config hugo.toml,demo/hugo.demo.toml` (cambia `contentDir` y `dataDir`).
- **D10 `baseURL` desde `actions/configure-pages`** (`-b`) para poder conectar dominio después sin tocar código. **D11 Migración de Netlify a GitHub Pages (2026-09-18):** el plan gratis de Netlify (300 créditos, 15 por deploy) no alcanza para desplegar a diario y pausa el sitio al agotarse; Pages es gratis para repos públicos y el workflow ya compilaba Hugo. Costo: sin cabeceras HTTP personalizadas (el `Referrer-Policy` pasó a `<meta>`) y sin deploy previews. **D12 Organización y sitio en la raíz (2026-09-21):** el repo pasó de `edgaralrohe/colores-ruidosos` a la organización `ColoresRuidosos` con el nombre `coloresruidosos.github.io`, así el sitio vive en la raíz y no muestra el usuario personal. Los enlaces con `relURL` sin barra inicial funcionan igual; la dirección anterior dejó de existir (GitHub no redirige Pages). **D13 Seguimiento de bandas (2026-09-21):** `data/seguimiento.yaml` (una sola lista para el pipeline y la página `/bandas/`); los seguidos van primero en la selección, cuentan para su cuota MX/ES y se saltan el filtro de género. **D14 Radio (2026-09-21):** barra fija con estaciones definidas en `data/radio.yaml`; los iframes se crean solo al pulsar (sin rastreadores previos) y solo para Spotify, Apple Music y YouTube (nocookie). Sin navegación sin recarga, la música se detiene al cambiar de página; si se quiere continuidad, hay que cargar las páginas por fetch sin recargar el reproductor. **D15 Visor de stickers (2026-09-27):** sin YAML de configuración, a diferencia de radio/seguimiento: la galería lista automáticamente cualquier imagen en `assets/stickers/` (`resources.Match`), igual que `assets/notas/<slug>.*` para las notas. El nombre del sticker sale del nombre del archivo. El generador dinámico de la web anterior no se retoma (ver spec, fuera de alcance). **Rediseño (2026-09-27):** el primer intento fue un efecto "holográfico" solo CSS (`mix-blend-mode` en hover/tap), mal recibido ("muy constante y feo"); se reemplazó por una tarjeta 3D modal (`assets/js/stickers.js`, cargado solo en `/stickers/` vía el bloque `scripts` de Hugo): clic en la galería abre un visor con `perspective`. La primera versión volteaba la tarjeta (`rotateY`); a partir de una referencia en video (calcomanía despegándose de su papel) se cambió por un **despegado**: el sticker (`.visor3d__frente`) está encima de un reverso fijo "Colores Ruidosos" (franjas de la marca + insignia con el nombre en una esquina, no al centro, para que quede visible); clic/toque lo levanta con `rotateX/rotateY/rotateZ` + `translate3d` + `scale` hacia una esquina, con sombra creciente y un degradado (`.visor3d__pliegue`) simulando el papel del reverso en el pliegue; clic de nuevo lo vuelve a pegar. Se inclina siguiendo el mouse mientras está pegado (`pointermove`, se ignora en touch y mientras está despegado). Cierra con la X, el fondo o Escape; respeta `prefers-reduced-motion` quitando las transiciones.
**D16 Bandas: se quitó la página, no la lógica (2026-09-27):** por pedido del equipo se eliminó `/bandas/` del sitio (nav, `content/bandas/`, `layouts/bandas/`, `partes-artista.html`) porque no aportaba lo suficiente. `data/seguimiento.yaml` y la prioridad en la selección de notas (D13) **siguen activos**: las bandas seguidas siguen entrando primero y saltándose el filtro de género, solo que ya no hay una página que las liste.
**D17 Header responsive (2026-09-27):** `.cabecera` y `.cabecera__nav` pasaron a `flex-wrap: wrap` — con 4 enlaces (antes de quitar Bandas) el menú se salía del viewport en móvil porque no envolvía. Verificado sin overflow horizontal desde 320px.
**D18 Bug: elegir un evento ocultaba los demás (2026-09-27):** los chips de recinto y cada `<li>` de evento usaban el mismo atributo `data-recinto` (uno como filtro a aplicar, el otro como metadato de a qué recinto pertenece el evento). `document.querySelectorAll("[data-recinto]")` armaba la lista de chips agarrando también las tarjetas de evento, así que el clic del checkbox (que burbujea hasta el `<li>`) disparaba el handler de los chips y filtraba la agenda por el recinto de *ese* evento. Diagnosticado interceptando `addEventListener` con Playwright (no bastaba con leer el código: el bug no era visible ahí, solo en el DOM real). Corregido renombrando el atributo de los chips a `data-filtro-recinto`. Ahora se pueden elegir varios eventos de cualquier recinto/fecha sin que se oculten entre sí.
**D19 Cron de respaldo (2026-09-30):** la corrida de las 8:00 (`cron: "0 14 * * *"`) a veces se retrasa varias horas o no se dispara — es comportamiento "mejor esfuerzo" de GitHub Actions con `schedule`, no un error del repo (confirmado: `state: active`, archivo sin cambios recientes). Se agregó un segundo `cron: "0 20 * * *"` (14:00 CDMX) como respaldo. Es seguro correr dos veces el mismo día: la deduplicación es por hecho (artista + categoría) en 14 días, no por calendario, y si no hay nada nuevo el paso de commit simplemente no hace nada (`git diff --cached --quiet`).

**D21 Trivia Love of Lesbian en 8 bits (2026-10-30):** F15. Decisiones:
- **Estático, sin backend ni API.** Preguntas en `data/trivia.json`, que Hugo incrusta en `/trivia/` como JSON; la lógica corre en el navegador. Cero costo por partida (relevante tras los créditos agotados). Una tabla de récords global obligaría a tener backend (Google Sheet + Apps Script o Supabase), sería falsificable desde el navegador y requeriría moderar apodos: se deja para una segunda fase.
- **Lógica pura separada del dibujo.** `assets/js/trivia/logica.js` (sorteo, puntaje, categoría, insignias, desbloqueos) no toca el DOM y se prueba con `node --test tests-js/trivia.test.js`, igual que `.ics`. `escenas.js` dibuja en `<canvas>`; `juego.js` conecta ambos. Sin librerías.
- **Sorteo con semilla y las 6 etapas.** El sorteo acepta un generador aleatorio inyectado para que las pruebas sean deterministas, y repite el sorteo (hasta 200 veces) hasta que la partida pase por todas las etapas del banco: sin eso, a veces una partida se saltaba una etapa entera.
- **Pixel art con código.** Cada escena se dibuja en `assets/js/trivia/escenas.js` con primitivas (rectángulos, elipses, líneas, tramados) sobre un lienzo de 160×144 (resolución tipo consola portátil), con paleta corta y escalado entero con `image-rendering: pixelated`. Algunas tienen animación ligera (neón que titila, estrellas, bandera), que se apaga con `prefers-reduced-motion`. Se dibujan a mano, inspiradas en las portadas; nunca se pixela la imagen original.
- **Veracidad por contrato.** `data/trivia.json` lleva por pregunta: `id`, `etapa`, `dificultad`, `tipo`, `pregunta`, `opciones` (4), `correcta`, `fuentes` (≥ 1 URL; ≥ 2 salvo que sea de `loveoflesbianband.com`) y `estado` (`propuesta` | `verificada`). Un test falla si algo de eso no se cumple, y el juego filtra a `verificada`. Un test exige además al menos 5 verificadas por dificultad, para que siempre se pueda armar una partida.
- **Estado del jugador en `localStorage`** bajo una sola clave versionada (`cr-trivia-v1`), con todo envuelto en `try/catch`: sin almacenamiento, el juego funciona y solo pierde récord e insignias.
- **Tarjeta para compartir** con `canvas.toBlob` → `navigator.share({files})` si existe; si no, descarga del PNG.
- **Métricas** con GoatCounter, que el sitio ya usa: eventos `trivia-iniciada`, `trivia-terminada-<categoría>` y `trivia-compartida`. Sin datos personales.
- **Fuente 8 bits** Press Start 2P (Google Fonts), solo en `/trivia/` y sin `text-transform: uppercase`, porque no trae mayúsculas acentuadas (Í, É, Ú).
- **Sonido** con Web Audio (osciladores de onda cuadrada), sin archivos de audio y apagado por defecto. Música: chiptune original, nunca melodías de la banda (D21 descarta covers 8 bits sin permiso).
- **Sin aviso de "versión de prueba" (2026-10-30):** a pedido del equipo se quitó el letrero amarillo. `borrador: true` sigue limitando el juego a las preguntas de fuente sólida mientras los fans revisan; cada pregunta muestra su fuente al responder.
- **Pistas de lo secreto (2026-11-03):** los fans preguntaban en redes cómo sacar las insignias "???". En la colección, las secretas muestran una pista críptica en lugar de "???", y el resultado de Viejo lesbiano avisa que hay un nivel más con 30 de 30 (`pistaSiguiente`). El nombre sigue oculto hasta ganarla.
- **Fecha límite:** el 28 de noviembre de 2026 (Tecate Comuna, Puebla: última fecha anunciada en México) marca el fin de la insignia "El último baile". Al principio era el 25 (Auditorio Nacional), pero el equipo avisó que había fechas posteriores; se corrigió el 2026-10-30.

**D22 Contrarreloj "¿De qué disco es?" (2026-11-03):** F16, segundo modo de `/trivia/`.
- **Mismo lugar y mismo estado.** Vive en `/trivia/` como otra pantalla, comparte colección, sonido y tarjeta para compartir. El estado del jugador sigue bajo `cr-trivia-v1`; los campos nuevos (`crPartidas`, `crAciertos`, `crRecord`) son opcionales y valen 0 si no existen, así no se pierden insignias guardadas.
- **Lógica pura y aparte.** `assets/js/trivia/contrarreloj.js` (sorteo de canciones y opciones, puntos con multiplicador, reloj como función de los eventos, insignias) sin DOM, con pruebas en `tests-js/contrarreloj.test.js`. El reloj se calcula a partir de marcas de tiempo inyectadas (no con `setInterval` en la lógica) para poder probarlo.
- **Opciones del mismo banco.** Las tres opciones incorrectas salen de los otros 9 discos de estudio, al azar y sin repetir; el orden de los cuatro botones también es al azar.
- **Datos.** `data/canciones.json` se genera desde `docs/canciones.md` con `docs/generar_canciones_json.py` (las canciones heredan las fuentes de su disco salvo que traigan las suyas); empieza en `borrador: true` y solo juega las de fuente sólida.
- **Sin escena durante el contrarreloj:** la escena pixel art de la etapa delataría el disco, así que se oculta en estas pantallas.
- **Ranking del contrarreloj, después:** necesita sumar el modo en `Code.gs` y una nueva versión del script publicado.
- **Insignias.** Las cuatro nuevas se suman al catálogo de `logica.js` (18 en total); "Ejército de salvación" sigue pidiendo solo las 6 portadas de la trivia.
- **Métricas.** Eventos de GoatCounter `contrarreloj-iniciada`, `contrarreloj-terminada` y `contrarreloj-compartida`.

**D23 Chapas e insignias "imposibles" (2026-11-03):** F17.
- **Dibujo aparte.** `assets/js/trivia/insignias.js` guarda cada ícono como un sprite de 16×16 en texto (un carácter por píxel, con paleta) y dibuja la chapa de 32×32 en `<canvas>`. Una prueba revisa que cada insignia del catálogo tenga su ícono y que cada sprite mida 16×16.
- **Catálogo con familia e ícono.** Cada insignia en `logica.js` lleva `familia` (trivia, habilidad, constancia, secreta, contrarreloj) e `icono`; las secretas, su `pista`.
- **Datos nuevos de la partida.** `juego.js` mide cuánto tarda cada respuesta (`ms`) y la partida completa (`duracionMs`), y los pasa a `cerrarPartida(estado, respuestas, ahora, {duracionMs})`.
- **Estado nuevo (opcional, con valores por defecto):** `dias` (fechas locales en que se jugó, máximo 60), `ultimaPartida` y `partidasDia` (`{fecha, n}`). Un estado guardado antes de F17 se lee igual.
- **Secretos fuera de la partida.** `registrarSecreto(estado, id, ahora)` otorga Contraespionaje y Wio; `juego.js` detecta el código Konami (teclado o deslizamientos sobre la pantallita) y los 7 toques seguidos (en menos de 4 s, sin deslizar).
- **El gran truco final** se revisa después de otorgar cualquier insignia; no pide "El último baile" ni las del contrarreloj, para que se pueda conseguir después del 28 de noviembre y antes de que exista el contrarreloj.

**D24 Ranking con Google Sheet + Apps Script (2026-11-03):** F18.
- **Servidor:** un Apps Script del equipo publicado como aplicación web (`docs/ranking/Code.gs`, pasos en `docs/ranking/README.md`). `doPost` valida y agrega una fila a la pestaña `Puntajes`; `doGet?modo=trivia` devuelve `{semana: [...20], historico: [...20]}`. Lecturas cacheadas 60 s (`CacheService`), escrituras con `LockService`.
- **Validación en el servidor:** modo conocido, puntos enteros 0–30, duración entre 15 s y 1 h, nombre que se pueda formar con las listas de palabras (mismas listas que el cliente), máximo 10 envíos por hora por identificador de navegador (un número aleatorio guardado en el navegador, no un dato personal).
- **Cliente:** `assets/js/trivia/ranking.js` con la parte pura (generar y validar nombres, semana en hora de CDMX, ordenar, armar el envío) probada en `tests-js/ranking.test.js`; las funciones puras de `Code.gs` se prueban en Node cargando el archivo en un `vm` sin servicios de Google.
- **Configuración:** la URL del Apps Script va en `hugo.toml` como `params.trivia_ranking_url`. Mientras esté vacía, el ranking no aparece en el sitio.
- **POST como `text/plain`** para evitar la petición previa de CORS, que Apps Script no contesta.

**D25 Compartir en Instagram (2026-11-03):** F19.
- **Parte pura aparte:** `assets/js/trivia/compartir.js` limpia el @ (sin "@" inicial ni espacios; letras, números, punto y guion bajo; máximo 30, como Instagram) y arma el texto para pegar. Pruebas en `tests-js/compartir.test.js`.
- **Las tarjetas se dibujan en `juego.js`** con un mismo dibujo para los dos tamaños: el de historia agrega aire arriba y abajo para que no lo tapen los controles de Instagram.
- **El @ va en `localStorage` (`cr-trivia-ig`) y nunca se envía al ranking.**
- **Copiar al portapapeles** con `navigator.clipboard.writeText`; si falla, el texto se muestra para copiarlo a mano.
- **@coloresruidosos** es el usuario que el sitio ya usa en su pie de página.

**D26 Adivina la canción (2026-11-03):** F20. Se llamó "LoL del día" en el borrador; el equipo pidió el nombre "Adivina la canción".
- **Los enlaces se buscan en GitHub Actions, no en el navegador.** `pipeline/resolver_audio.py` (con la lógica de coincidencia en `pipeline/cr/audio_trivia.py` y pruebas en `pipeline/tests/test_audio_trivia.py`) busca cada canción jugable en la API de búsqueda de iTunes (sin llave, `country=MX`) y en la de Spotify (con las credenciales que ya usa el pipeline), y escribe `data/audio.json`: por canción, el avance (`previewUrl`), la página de Apple Music y el enlace de Spotify (la pista si coincide exacto; si no, la búsqueda de la canción, con `spotify_exacto: false`); más la lista de las que no se encontraron. La API de iTunes limita las búsquedas por minuto: pausa de 3.2 s antes de cada una y, ante 403/429, espera de un minuto y un reintento. El repo no tiene `SPOTIFY_CLIENT_ID`/`SPOTIFY_CLIENT_SECRET` configurados (la primera corrida los mostró vacíos). El navegador solo reproduce el avance.
- **Coincidencia exacta:** título igual tras normalizar (sin acentos ni puntuación; se acepta que una de las dos fuentes agregue un paréntesis al final), artista que empiece por "Love of Lesbian" (por las colaboraciones) y álbum que contenga el nombre del disco de estudio. Así se evitan versiones en directo o de recopilatorios.
- **Cuándo corre:** `.github/workflows/audio-trivia.yml` corre en los PR que cambian el banco de canciones o el resolvedor, y sube `data/audio.json` a la misma rama; también se puede lanzar a mano. Desde el entorno de desarrollo no se alcanzan Apple ni Spotify, por eso corre ahí.
- **Canción del día:** orden fijo = canciones con avance ordenadas por id y barajadas con una semilla fija; el día *n* (el #1 es el 2026-11-03, en hora de CDMX) toca la posición *n* mód total. Todos ven la misma. **Ojo:** agregar o quitar canciones con avance cambia el orden completo; conviene fusionar esos cambios justo después de medianoche de CDMX para no cambiar la canción a mitad del día.
- **Fragmentos** con `<audio>`: al tocar "Escuchar" se reproduce desde 0 y se pausa a los 1/2/4/7/11/16 s. Nada suena sin que la persona lo pida.
- **Estado** en `localStorage` bajo `cr-trivia-v1` (campos opcionales `dia`: resultados por fecha y racha).

**D27 Ronda del día y ranking de todos los modos (2026-11-03):** F20 (cambio) y F21.
- **Ronda:** el orden fijo de D26 se reparte de 10 en 10: el día *n* toma las posiciones (n−1)·10 a (n−1)·10+9, dando la vuelta al final. `dia.js` lleva la ronda: canción actual, intentos de la canción, puntos por canción (7 − intentos si acierta; 0 si no) y milisegundos desde el primer "Escuchar" hasta la respuesta correcta.
- **Práctica:** 10 canciones al azar con `Math.random`, sin guardar ni publicar.
- **`Code.gs`:** `MODOS` suma `contrarreloj` (máx. 400 puntos, duración 3–90 s) y `adivina` (máx. 60, duración 5 s–1 h, una ronda por nombre y fecha). `doGet?modo=adivina` devuelve `{hoy, semana, racha}`: *hoy* = filas de la fecha de CDMX; *semana* = suma por nombre de la primera ronda de cada día de la semana; *racha* = días seguidos por nombre con puntos > 0 que terminan hoy o ayer. Las funciones son puras y se prueban en Node como las de D24.
- **El cliente sigue funcionando con el script viejo:** si el servidor rechaza un modo nuevo ("modo"), el juego avisa que el ranking de ese modo aún no está activo.

**D28 Inicio audible e insignias de Adivina la canción (2026-11-03):** F22.
- **`inicio` por canción en `data/audio.json`:** el resolvedor (GitHub Actions) descarga cada avance, lo decodifica con ffmpeg a mono 8 kHz y mide la energía (RMS) cada 0,1 s. Referencia = percentil 95 del avance. `inicio` = primer segundo *t* (en pasos de 0,1) cuya ventana [t, t+1) tiene RMS medio ≥ 35 % de la referencia y ningún cuarto de segundo por debajo del 10 %. Tope 14 s (para que quepan los 16 s); si ninguna ventana cumple, la de más energía antes de 14 s. Si el avance no cambió desde la corrida anterior, se reutiliza su `inicio` sin descargar. Si la descarga falla, `inicio` = 0 y se avisa en el resumen.
- **Cliente:** "Escuchar" va a `inicio` (espera `loadedmetadata` si hace falta) y pausa a los 1/2/4/7/11/16 s desde ahí.
- **Insignias:** `logica.js` suma la familia `adivina` y `cerrarAdivina(estado, {aciertos, puntos, primeros, racha, diaria})`; `primeros` = canciones acertadas con 1 s. `tieneTodas` ignora la familia `adivina`. Chapas de 16×16 en `insignias.js`: nota, cerillo, sol, estrella, silencio y Starman.

**D29 Menú de modos (2026-11-03):** F23. Pantalla nueva `data-pantalla="modos"` con tres botones grandes (título + explicación) que reutilizan `data-jugar`, `data-contrarreloj` y `data-dia`; Adivina la canción sigue oculta si no hay avances. `data-volver` lleva a `modos`, y `data-volver-inicio` al inicio. El código Konami y los toques a la pantallita siguen en `inicio`.

**D30 Orden al azar en la ronda del día (2026-11-03):** F24. `rondaDelDia` sigue eligiendo las mismas 10 canciones para todos; `barajarRonda(ids, rng)` las reordena con `Math.random` al empezar una ronda nueva. La ronda guardada se reconoce con `mismasCanciones` (mismo conjunto, sin importar el orden), así que recargar no la vuelve a barajar. El ranking no cambia: compara puntos de las mismas 10 canciones.

**D31 Sección Games (2026-11-04):** F25. Los juegos se listan en `data/games.json` (`id`, `nombre`, `descripcion`, `url` relativa sin barra inicial, `desde` en RFC 3339 con zona). `layouts/games/section.html` muestra solo los que cumplen `desde` ≤ hora de compilación, así que la tarjeta aparece sola en la corrida diaria de las 8:00. La trivia se queda en `/trivia/` (cambiarla rompería las tarjetas compartidas y el ranking); solo cambia la etiqueta del menú, que queda activa en las secciones `games` y `trivia`. El juego de José Madero es un HTML de un solo archivo (~1,6 MB) compilado en `juegos/mexico-vs-jose-madero/` y copiado con `npm run publish:web` a `static/games/mexico-vs-jose-madero/index.html`; Hugo lo sirve tal cual. No va en un iframe, porque los controles táctiles necesitan la pantalla entera. `tests-js/games.test.js` valida el contrato de datos, que el archivo del juego exista y el menú.

**D32 Insignia de concierto y cartel (2026-11-03):** F26.
- `hugo.toml` → `[params.trivia_concierto]` con `codigo`, `desde` y `hasta` (RFC 3339 con zona de CDMX). La plantilla publica `sha256` del código normalizado y las fechas en `data-concierto-*`; el código en claro no va en la página.
- `logica.js`: `normalizarCodigo` (mayúsculas, sin espacios, guiones ni acentos) y `canjearConcierto(estado, huella, config, ahora)`, que devuelve `{estado, nuevas, error}` con error `"codigo"`, `"fecha"` o `"ya"`. Es pura: la huella la calcula `juego.js` con `crypto.subtle`. Familia `concierto` fuera de `tieneTodas`.
- `juego.js`: al cargar con `?codigo=` canjea, muestra el aviso en la colección y quita el parámetro de la URL con `history.replaceState`. En la colección hay un formulario para escribir el código.
- Cartel: HTML a 300 dpi → PDF (Carta y Doble Carta), QR de nivel de corrección M a `https://coloresruidosos.github.io/trivia/?codigo=<código>`, generado con `segno`. Se guarda en `docs/concierto/` junto con su script, para regenerarlo si cambia el código.

**D33 Fanzine de concierto (2026-11-04):** F27.
- `data/conciertos_mx.yaml`: lista ordenada con `fecha` (ISO), `recinto`, `ciudad`, `nota` y `marca` (la † del equipo, por definir). Secciones `cancelados`, `no_cuentan`, `sin_confirmar` y `proximos`. Una prueba revisa que haya 47 conciertos, fechas válidas y en orden.
- `docs/fanzine/`: la página 5 usa `dibujo-colorear.png` (dibujo del equipo, limpiado a línea negra sobre blanco). `fanzine.html` dibuja cada página a 300 dpi (825 × 1275 px) en canvas con las fuentes del sitio y los sprites del juego. `render.js` la abre por página y edición, y `generar_fanzine.py` impone las 8 páginas en Carta horizontal (fila de arriba de cabeza: 5 4 3 2; fila de abajo: 6 7 8 1) y arma los PDF con `img2pdf`.
- Las preguntas de la página 6 salen de `data/trivia.json` (solo `fuerza: solida`). Los QR (trivia y `?codigo=` de F26) se generan con `segno` y se verifican decodificándolos.

**D34 Halley Flip (2026-11-06):** F28.
- **Lógica pura** en `assets/js/halley/flip.js` (UMD, probada con `node --test tests-js/halley.test.js`). El mundo mide 160 × 144 px, igual que las escenas, y avanza a paso fijo de 1/60 s; el render interpola. Estado: `{y, vy, x0, torres[], notas[], puntos, notasTomadas, vivo, rng}`. `paso(estado, toque)` aplica la gravedad (0,16 px/paso²), el impulso (−2,7 px/paso), una caída máxima de 3,6 px/paso y el avance de las torres. Las torres salen con una semilla (mulberry32), así una partida es reproducible en las pruebas. Velocidad y hueco dependen de la etapa: velocidad 1,0 → 1,5 y hueco 50 → 38 px, con tope. Choque círculo-rectángulo (radio 4).
- **Pantalla** en `assets/js/halley/juego.js`: canvas 160 × 144 escalado con `image-rendering: pixelated`, `requestAnimationFrame` con acumulador de tiempo. Fondos de `escenas.js` (6 etapas), y el cometa, las torres y las notas como sprites de texto (estilo de `insignias.js`). Entrada: `pointerdown` en el canvas y la barra espaciadora.
- **Página:** `content/games/halley-flip.md` con `layout: halley-flip` y `layouts/games/halley-flip.html`. Los scripts se empaquetan con `resources.Concat` y `minify` como la trivia. Entrada nueva en `data/games.json`, con `desde` el día que se fusione.
- **Récord** en `localStorage` (`cr-halley-v1`), protegido con try/catch.

## Verificaciones pendientes
| ID | Qué | Plan B |
|---|---|---|
| V1 | Probar feeds de `fuentes.yaml` (ninguno verificado desde el entorno de desarrollo) | Quitar los que fallen; mínimo 4 |
| V2 | Lista real de recintos de Pachuca y CDMX y si traen JSON-LD (`probar_recinto.py`) | Cargar sus eventos en el Sheet |
| V3 | Primera corrida real: calidad de clasificación y tono | Ajustar `prompts/` |
| V4 | Costo real por corrida (resumen muestra tokens) | Bajar lote o tope |
| V5 | Cuotas de Spotify y YouTube con uso diario | Solo Spotify |
| V6 | Revisión fan de las 47 preguntas de `docs/trivia.md` | Lanzar con las que estén verificadas (mínimo 5 por dificultad) |
| V7 | Segunda fuente para las 8 preguntas 🟡 | Se quedan fuera del juego |
| V8 | Revisión fan de las 95 canciones de `docs/canciones.md` | Lanzar con las 69 sólidas |
| V9 | Tracklists completos de *V.E.H.N.* y de los tres discos en inglés | Esos discos aparecen solo como opción incorrecta |
| V11 | Cuántas canciones del banco tienen avance en Apple Music y enlace en Spotify (primera corrida de `audio-trivia.yml`) | Jugar solo con las que tengan avance |
| V12 | El equipo publica la nueva versión de `Code.gs` (Gestionar implementaciones → editar → Nueva versión) | Contrarreloj y Adivina la canción sin ranking hasta entonces |
| V10 | ~~El equipo publica el Apps Script y comparte la URL~~ Hecho el 2026-11-03; falta la prueba de punta a punta contra el Sheet real (desde el entorno de desarrollo no se alcanza `script.google.com`) | Si falla, vaciar `trivia_ranking_url` oculta el ranking |

## Riesgos aceptados por publicar sin revisión
| Riesgo | Mitigación disponible |
|---|---|
| Fecha o dato incorrecto en una nota | Despublicar desde el Sheet; prompt prohíbe suponer fechas |
| Embed de canción distinta del mismo artista | Coincidencia exacta de artista y álbum |
| Recinto cambia su página | Supervivencia + aviso en resumen |
| Evento del Sheet con fecha mal escrita | Se descarta con aviso |
