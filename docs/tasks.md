# tasks.md — avance

✅ hecho en el prototipo · ⏳ pendiente · 🔴→🟢 cubierto por tests

## Fase 1 — Dominio (TDD)
- ✅ 🔴→🟢 Normalización de URL, texto y artista (`test_normalizar_slug.py`)
- ✅ 🔴→🟢 Slugs únicos
- ✅ 🔴→🟢 Ventana de 72 h, dedup por URL, agrupación por hecho, exclusión de publicados (`test_dedup_ranking.py`)
- ✅ 🔴→🟢 Ranking México > LatAm > general con relleno y tope
- ✅ 🔴→🟢 Validación de respuestas del modelo y relevancia calculada en código (`test_esquemas_validadores.py`)
- ✅ 🔴→🟢 Validadores: créditos, copia por n-gramas, citas, longitudes
- ✅ 🔴→🟢 Front matter generado por código, interruptor de borrador, despublicación (`test_frontmatter_notas.py`)
- ✅ 🔴→🟢 Agenda: supervivencia, Sheet (corregir, ocultar, recomendar, agregar), conservar marcas, filtrado y firma (`test_eventos.py`)
- ✅ 🔴→🟢 Extracción JSON-LD
- ✅ 🔴→🟢 Coincidencia exacta de embeds (`test_embeds_flujo.py`)
- ✅ 🔴→🟢 Generador `.ics` (`tests-js/ics.test.js`)

## Fase 2 — Integración
- ✅ 🔴→🟢 Flujo completo de notas con dobles: prioriza MX, agrupa fuentes, descarta copia, no repite ni reclasifica
- ✅ Adaptadores RSS, Claude (con tope de tokens), Spotify, YouTube, Sheet CSV, HTTP con robots.txt
- ✅ 🔴→🟢 Flujo de agenda con recinto roto y Sheet (`scrape_eventos.ejecutar`)
- ⏳ Reintento automático ante errores de red transitorios

## Fase 3 — Sitio
- ✅ Portada, listado de notas, página de nota con créditos, embed y fechas
- ✅ Agenda con filtro por curador, filtro por mes y descarga `.ics`
- ✅ Identidad SPEC-001 con reglas de contraste; responsive; demo aislada
- ⏳ Imagen Open Graph por defecto (ilustración del equipo)
- ✅ Radio con estaciones
- ✅ Visor de stickers (F13/D15/D16): página `/stickers/`, listado automático de `assets/stickers/`, tarjeta 3D con reverso "Colores Ruidosos" (D16), README para que el equipo suba archivos, aviso de galería vacía
- ✅ Header responsive sin overflow horizontal (D17)
- ⏳ Bandas: se quitó la página `/bandas/` (D16); si se retoma, decidir cómo mostrar las bandas seguidas sin repetir lo que hacía la página vieja

## Fase 4 — Automatización
- ✅ Workflow diario con tests, pasos aislados, verificación de compilación y commit único
- ✅ `netlify.toml`
- ⏳ Cargar secrets y correr la primera vez a mano
- ⏳ Issue automático tras 3 corridas fallidas seguidas

## Fase 5 — Datos reales
- ⏳ V1: verificar feeds
- ⏳ V2: lista de recintos + `probar_recinto.py`
- ⏳ Crear Sheet con pestañas Eventos y Notas y publicar como CSV
- ⏳ Leer `prompts/redactar.md` en equipo y ajustar la voz
- ⏳ Primera semana: revisar el resumen diario y anotar despublicaciones y motivos

## Fase 6 — Trivia LoL 8 bits (F15/D21)
Orden TDD: primero la prueba en rojo, luego el código.
- ✅ Spec, plan y banco de preguntas con fuentes (`docs/trivia.md`)
- ⏳ Revisión fan de las preguntas (V6) y segundas fuentes (V7); al terminar, `borrador: false` en `data/trivia.json`
- ✅ 🔴→🟢 Contrato de `data/trivia.json`: 4 opciones, correcta entre ellas, fuentes, estado; ≥ 5 verificadas por dificultad (`tests-js/trivia.test.js`)
- ✅ 🔴→🟢 Sorteo 5/5/5 sin repetir, solo verificadas (o sólidas en borrador), ordenado por etapa, con semilla y pasando por las 6 etapas
- ✅ 🔴→🟢 Puntaje 1/2/3 y categorías en los cortes 12/13, 22/23, 29/30
- ✅ 🔴→🟢 Insignias: cada una con su caso que la da y su caso que no; "El último baile" respeta la fecha límite en hora CDMX
- ✅ 🔴→🟢 Portadas coleccionables: etapa completa desbloquea; las 6 dan "Ejército de salvación"
- ✅ 🔴→🟢 Estado del jugador: guardar/leer versionado; `localStorage` que lanza error no rompe nada
- ✅ Las 6 escenas pixel art y los 4 avatares de máscara (pendiente: visto bueno del equipo sobre el estilo)
- ✅ Página `/trivia/` (`layouts/trivia/`), navegación, teclado, lector de pantalla, movimiento reducido
- ✅ Tarjeta para compartir (1080×1350), sonido 8 bits y eventos en GoatCounter
- ✅ Compilar con Hugo 0.166 y jugar partidas completas con Playwright a 360 px y en escritorio, sin errores ni desborde horizontal
- ⏳ Segunda fase: tabla de récords y covers 8 bits con permiso de la banda

## Fase 7 — Contrarreloj "¿De qué disco es?" (F16/D22)
Orden TDD: primero la prueba en rojo, luego el código.
- ✅ Spec, plan y banco de canciones con fuentes (`docs/canciones.md`)
- ⏳ Revisión fan de las canciones (V8) y tracklists que faltan (V9)
- ✅ 🔴→🟢 Contrato de `data/canciones.json`: disco entre los 10 de estudio, fuentes, fuerza, estado; sin títulos iguales al del disco; sin canciones repetidas
- ✅ 🔴→🟢 Sorteo: sin repetir canción en una partida; 4 opciones con el disco correcto una sola vez y 3 discos distintos
- ✅ 🔴→🟢 Puntos: +1, ×2 desde racha 5, ×3 desde racha 10; un error corta la racha
- ✅ 🔴→🟢 Reloj: 60 s, −3 s por error, nunca menos de 0; fin al llegar a 0 o al agotar el banco
- ✅ 🔴→🟢 Insignias Psiconautas, Los seres únicos, Radio Himalaya y Cosmos, cada una con su caso que la da y su caso que no
- ✅ 🔴→🟢 Estado: los campos nuevos se leen como 0 en un estado guardado antes de F16
- ✅ Pantalla de contrarreloj en `/trivia/`: botón en el inicio, cuenta regresiva, reloj, racha, resultado, tarjeta para compartir
- ✅ Accesibilidad: teclado, anuncios de acierto y error, movimiento reducido
- ✅ Compilar con Hugo 0.166 y jugar partidas completas con Playwright a 380 px y en escritorio (fin por tiempo con reloj simulado y fin por banco agotado)
- ⏳ Ranking del contrarreloj: agregar `contrarreloj` a `MODOS` en `Code.gs` (con su máximo de puntos) y que el equipo publique una nueva versión del script

## Fase 8 — Chapas e insignias "imposibles" (F17/D23)
- ✅ Spec y propuesta visual (chapas de concierto, aprobada por el equipo)
- ✅ 🔴→🟢 Catálogo: 25 insignias, cada una con familia e ícono; las secretas con pista
- ✅ 🔴→🟢 Cada insignia nueva con su caso que la da y su caso que no
- ✅ 🔴→🟢 Estado: un estado guardado antes de F17 se lee igual
- ✅ 🔴→🟢 Sprites: cada ícono existe y mide 16×16
- ✅ Colección con chapas, vista en grande, chapas en el resultado, código Konami y 7 toques
- ✅ Compilar y jugar con Playwright

## Fase 9 — Ranking (F18/D24)
- ✅ Spec
- ✅ 🔴→🟢 Nombres generados: formato, validación, sin repetirse en la misma tirada
- ✅ 🔴→🟢 Semana en hora de CDMX; orden por puntos, duración y fecha; un nombre una vez
- ✅ 🔴→🟢 Validación del Apps Script (puntos, duración, nombre, límite de envíos) probada en Node
- ✅ `docs/ranking/Code.gs` y `docs/ranking/README.md` con los pasos para el equipo
- ✅ Pantalla de ranking y botón "Publicar mi puntaje"; oculto sin URL. Probado de punta a punta contra `Code.gs` corriendo en Node con imitaciones de los servicios de Google
- ✅ V10: el equipo publicó el Apps Script y la URL está en `hugo.toml`
- ⏳ Probar de punta a punta contra el Sheet real (publicar un puntaje desde el sitio y ver la fila)

## Fase 10 — Compartir en Instagram (F19/D25)
- ✅ Spec
- ✅ 🔴→🟢 @ opcional: limpieza y validación; texto para pegar con categoría, @coloresruidosos y dirección
- ✅ Tarjetas historia y feed, @ en la imagen, compartir chapa, copiar texto, aviso en computadora
- ✅ Compilar y probar con Playwright

## Fase 11 — LoL del día (F20/D26)
- ✅ Spec
- ✅ 🔴→🟢 Coincidencia exacta con Apple Music y Spotify (título, artista, disco de estudio), pausas y reintento, enlace a la búsqueda de Spotify como respaldo
- ✅ `pipeline/resolver_audio.py` y `.github/workflows/audio-trivia.yml`; V11: 68 de 69 con avance (falta "Limousinas", que Apple escribe distinto); 0 enlaces exactos de Spotify por falta de credenciales, todos con enlace a la búsqueda
- ✅ 🔴→🟢 Canción del día igual para todos, sin repetir hasta recorrer el banco; día en hora de CDMX
- ✅ 🔴→🟢 Intentos y segundos (1, 2, 4, 7, 11, 16), resultado, racha de días y texto para compartir
- ✅ Pantalla en `/trivia/`, reproducción de fragmentos, buscador de títulos, revelación con Spotify; la partida del día sobrevive a recargar la página
- ✅ Compilar y probar con Playwright (avance sustituido por un tono local)
- ⏳ Configurar `SPOTIFY_CLIENT_ID` y `SPOTIFY_CLIENT_SECRET` en el repo para enlaces directos a la pista

## Fase 12 — Ronda del día y ranking de todos los modos (F20/F21/D27)
- ✅ Spec
- ✅ 🔴→🟢 Ronda del día: 10 canciones iguales para todos, sin repetir dentro de la ronda; puntos 6…1/0; tiempo; texto con 10 cuadros
- ✅ 🔴→🟢 Racha con al menos una acertada; práctica al azar
- ✅ 🔴→🟢 `Code.gs`: modos contrarreloj y adivina; tablas hoy, semana (suma) y racha
- ✅ Pantallas: ronda, revelación por canción, resumen, práctica, publicar en contrarreloj y Adivina la canción, ranking por modo
- ✅ V12: el equipo publica la nueva versión del script (implementación nueva, URL cambiada en `hugo.toml`)

## Fase 13 — Adivina la canción sin silencios e insignias (F22/D28)
- ✅ Spec
- ✅ 🔴→🟢 `inicio_audible`: salta fade y silencio inicial; tope 14 s; sin ventana válida, la de más energía
- ✅ 🔴→🟢 Resolvedor: guarda `inicio`, reutiliza el de la corrida anterior, 0 si la descarga falla
- ✅ 🔴→🟢 `cerrarAdivina`: las 6 insignias; `gran_truco` no las pide; sprites de 16×16
- ✅ Cliente: fragmentos desde `inicio`; botón "No la sé · oír N s" / "Me rindo"; insignias nuevas al final de la ronda
- ✅ Corrida del workflow en el PR: `data/audio.json` con `inicio` para las 68 canciones (21 avances movidos)

## Fase 14 — Inicio y menú de modos (F23/D29)
- ✅ Spec
- ✅ Inicio con solo "▶ Iniciar"; menú con los 3 modos y su explicación; colección, ranking, sonido y récord en el menú
- ✅ "Volver" de juegos, colección y ranking → menú; "Volver" del menú → inicio
- ✅ e2e a 390 px: iniciar → elegir cada modo → volver

## Fase 15 — Orden al azar en la ronda del día (F24/D30)
- ✅ Spec
- ✅ 🔴→🟢 `barajarRonda`: mismas 10 canciones, otro orden; `mismasCanciones` ignora el orden
- ✅ Cliente: barajar al empezar una ronda nueva; al recargar se conserva el orden guardado

## Fase 16 — Insignia de concierto y cartel con QR (F25/D31)
- ✅ Spec
- ✅ 🔴→🟢 `normalizarCodigo` y `canjearConcierto`: código bueno en fecha, malo, fuera de fecha, ya canjeado; `gran_truco` no la pide
- ✅ Cliente: canje por `?codigo=` y por formulario en la colección; avisos; quitar el parámetro de la URL
- ✅ Cartel Carta y Doble Carta con QR verificado (se decodifica y abre la URL correcta)
- ✅ e2e: QR → insignia nueva en la colección; fuera de fecha → aviso

## Fase 17 — Fanzine de concierto (F26/D32)
- ✅ Spec
- ✅ 🔴→🟢 `data/conciertos_mx.yaml`: 47 conciertos válidos y en orden; conteos por año y por sede
- ✅ Páginas 1–8 de la edición Auditorio · ⏳ revisión con el equipo
- ✅ Imposición en Carta + guía de doblado · ⏳ prueba física de doblez
- ✅ Ediciones Metropolitan y Puebla
