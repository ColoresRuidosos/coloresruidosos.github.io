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
