# Colores Ruidosos — fanzine digital

Sitio en Hugo con dos piezas automáticas que corren todos los días a las 8:00 (hora de CDMX):

- **Notas:** lee feeds RSS de medios de indie/rock, elige hasta 7 noticias por corrida (al menos 3 de la escena mexicana y 3 de la española, relleno con lo demás), las redacta con Claude en la voz de la marca, con créditos visibles, y las publica.
- **Agenda:** lee las carteleras de los recintos configurados, aplica las correcciones y recomendaciones del Google Sheet del equipo, y permite a quien visita el sitio filtrar por recinto y descargar su calendario `.ics`.

La especificación completa está en [`docs/spec.md`](docs/spec.md), las decisiones técnicas en [`docs/plan.md`](docs/plan.md) y el avance en [`docs/tasks.md`](docs/tasks.md).

---

## 1. Verlo en tu computadora (5 minutos)

Necesitas [Hugo extended](https://gohugo.io/installation/) 0.146 o más reciente y Python 3.11+.

```bash
# Sitio con datos de ejemplo (no toca content/ ni data/ reales)
hugo server --config hugo.toml,demo/hugo.demo.toml
# Abre http://localhost:1313

# Tests
pip install -r pipeline/requirements.txt
pytest pipeline/tests -q
node --test tests-js/ics.test.js
```

## 2. Ponerlo en línea hoy

1. **Sube el repo a GitHub.**
2. **Activa GitHub Pages:** repo → Settings → Pages → Source: **GitHub Actions**. El workflow «Publicar Colores Ruidosos» compila Hugo y despliega: cada día a las 8:00, al lanzarlo a mano, y en cada push que cambie el sitio (`content/`, `layouts/`, `assets/`, `data/`, `static/` o `hugo.toml`). El sitio queda en `https://coloresruidosos.github.io/` (el repo debe llamarse `coloresruidosos.github.io` dentro de la organización; con otro nombre el sitio quedaría en un subdirectorio). Para volver a desplegar sin generar notas: Actions → Run workflow → marcar «Solo desplegar».
3. **Crea las llaves** y guárdalas en GitHub → Settings → Secrets and variables → Actions:

   | Secret | Para qué | Obligatorio |
   |---|---|---|
   | `ANTHROPIC_API_KEY` | Clasificar y redactar notas | Sí, para notas |
   | `SPOTIFY_CLIENT_ID` y `SPOTIFY_CLIENT_SECRET` | Embeds de Spotify (crear app en developer.spotify.com; desde feb 2026 la cuenta que la crea debe tener Spotify Premium) | No: sin ellas no hay embed |
   | `YOUTUBE_API_KEY` | Embeds de YouTube (YouTube Data API v3 en Google Cloud) | No |
   | `SHEET_EVENTOS_CSV` | URL CSV de la pestaña Eventos | No, pero recomendado |
   | `SHEET_NOTAS_CSV` | URL CSV de la pestaña Notas | No, pero recomendado |

4. **Prueba la primera corrida a mano:** GitHub → Actions → Publicar Colores Ruidosos → Run workflow. El resumen de la corrida dice qué se publicó, qué se descartó y por qué.
   - Si falla al hacer push: Settings → Actions → General → Workflow permissions → *Read and write permissions*.

## 3. Google Sheet del equipo

Crea un Sheet con dos pestañas. Publica **cada pestaña** como CSV (Archivo → Compartir → Publicar en la web → elige la pestaña → CSV) y copia cada URL a su secret.

**Pestaña `Eventos`** — el Sheet siempre gana sobre lo raspado:

| recinto | fecha | titulo | hora | ciudad | url | precio | nueva_fecha | ocultar | Pardy | Tanelly | Dany | Pratz |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Foro X | 2026-10-01 | Nombre del show | 21:00 | Pachuca | | 250 MXN | | | TRUE | | | |

- **Recomendar un evento:** escribe `recinto`, `fecha` y parte del `titulo` tal como aparece en la agenda, y marca la casilla del curador. Si nadie lo marca, el evento aparece firmado como **Cartelera**.
- **Corregir:** llena `hora`, `precio`, `url` o `nueva_fecha` (la columna `fecha` debe seguir con la fecha original para encontrar el evento).
- **Ocultar:** `ocultar` = TRUE.
- **Agregar un evento que no está en ninguna cartelera** (por ejemplo, recintos que solo publican en Instagram): llena `recinto`, `fecha` y `titulo`. Si no coincide con nada, se agrega como evento del equipo.
- Fechas siempre en formato `AAAA-MM-DD`.

**Pestaña `Notas`:**

| slug | despublicar |
|---|---|
| los-ejemplos-vienen-a-mexico | TRUE |

- `TRUE` oculta la nota en la siguiente corrida; `FALSE` la vuelve a mostrar. El slug es la última parte de la URL de la nota.
- Para ocultarla de inmediato sin esperar a mañana: corre el workflow a mano.

## 4. Operación

| Quiero… | Cómo |
|---|---|
| Apagar la publicación automática | `autopublicar: false` en `pipeline/config/pipeline.yaml`. Las notas se siguen generando, pero como borrador. |
| Agregar o quitar un medio | `pipeline/config/fuentes.yaml` |
| Agregar un recinto | Prueba primero: `python pipeline/probar_recinto.py URL`. Si encuentra eventos, agrégalo a `pipeline/config/recintos.yaml`. Si no, sus eventos van en el Sheet. |
| Ajustar el tono de las notas | `pipeline/prompts/redactar.md` |
| Embeds automáticos en las notas | Apple Music funciona sin configurar nada; YouTube con `YOUTUBE_API_KEY`; Spotify con sus credenciales (requiere Premium). Orden: Spotify, Apple Music, YouTube. |
| Ponerle imagen a una nota | Subir un archivo con el slug de la nota como nombre a `assets/notas/` (ver el README de esa carpeta). Solo imágenes propias del equipo. |
| Cambiar el tope diario | `tope_diario` en `pipeline.yaml` |

## 5. Qué hace el pipeline para no romper nada

- Una nota **no se publica** si le faltan créditos, si comparte 8+ palabras seguidas con la fuente, si trae citas textuales o si excede las longitudes.
- La prioridad "Viene a México" solo se asigna si la noticia trae una fecha explícita en México; el modelo no puede subirla por su cuenta.
- Si el scraper de un recinto se rompe o trae 0 eventos, se conservan sus eventos anteriores y se avisa en el resumen.
- Si el Sheet no responde, se conservan las recomendaciones de la corrida anterior.
- Si los tests fallan o el sitio no compila, ese día no se sube nada.
- Si no hay cambios, no se hace commit (el despliegue diario a Pages sí corre, es gratuito).

**Lo que NO verifica** (decisión del equipo de publicar sin revisión): que las fechas y datos de la noticia sean correctos, ni que el embed elegido sea la canción exacta. Revisen el resumen diario y usen la pestaña Notas para despublicar lo que esté mal.
