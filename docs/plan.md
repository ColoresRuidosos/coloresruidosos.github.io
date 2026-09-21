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
- **D10 `baseURL` desde `actions/configure-pages`** (`-b`) para poder conectar dominio después sin tocar código. **D11 Migración de Netlify a GitHub Pages (2026-09-18):** el plan gratis de Netlify (300 créditos, 15 por deploy) no alcanza para desplegar a diario y pausa el sitio al agotarse; Pages es gratis para repos públicos y el workflow ya compilaba Hugo. Costo: sin cabeceras HTTP personalizadas (el `Referrer-Policy` pasó a `<meta>`) y sin deploy previews. **D12 Organización y sitio en la raíz (2026-09-21):** el repo pasó de `edgaralrohe/colores-ruidosos` a la organización `ColoresRuidosos` con el nombre `coloresruidosos.github.io`, así el sitio vive en la raíz y no muestra el usuario personal. Los enlaces con `relURL` sin barra inicial funcionan igual; la dirección anterior dejó de existir (GitHub no redirige Pages). **D13 Seguimiento de bandas (2026-09-21):** `data/seguimiento.yaml` (una sola lista para el pipeline y la página `/bandas/`); los seguidos van primero en la selección, cuentan para su cuota MX/ES y se saltan el filtro de género. **D14 Radio (2026-09-21):** barra fija con estaciones definidas en `data/radio.yaml`; los iframes se crean solo al pulsar (sin rastreadores previos) y solo para Spotify, Apple Music y YouTube (nocookie). Sin navegación sin recarga, la música se detiene al cambiar de página; si se quiere continuidad, hay que cargar las páginas por fetch sin recargar el reproductor.

## Verificaciones pendientes
| ID | Qué | Plan B |
|---|---|---|
| V1 | Probar feeds de `fuentes.yaml` (ninguno verificado desde el entorno de desarrollo) | Quitar los que fallen; mínimo 4 |
| V2 | Lista real de recintos de Pachuca y CDMX y si traen JSON-LD (`probar_recinto.py`) | Cargar sus eventos en el Sheet |
| V3 | Primera corrida real: calidad de clasificación y tono | Ajustar `prompts/` |
| V4 | Costo real por corrida (resumen muestra tokens) | Bajar lote o tope |
| V5 | Cuotas de Spotify y YouTube con uso diario | Solo Spotify |

## Riesgos aceptados por publicar sin revisión
| Riesgo | Mitigación disponible |
|---|---|
| Fecha o dato incorrecto en una nota | Despublicar desde el Sheet; prompt prohíbe suponer fechas |
| Embed de canción distinta del mismo artista | Coincidencia exacta de artista y álbum |
| Recinto cambia su página | Supervivencia + aviso en resumen |
| Evento del Sheet con fecha mal escrita | Se descarta con aviso |
