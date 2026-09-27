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
