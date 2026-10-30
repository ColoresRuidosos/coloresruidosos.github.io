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
