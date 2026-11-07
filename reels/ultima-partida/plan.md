# plan.md — cómo se construye

## Decisiones técnicas

| # | Decisión | Por qué |
|---|---|---|
| P1 | Página `index.html` con `render(t)` determinista sobre framebuffer indexado `Uint8Array` 180×320 → LUT → canvas 1080×1920 (×6 vecino más cercano) | Contrato de `core/render`; el color por época es un cambio de tabla, no de alfa |
| P2 | Motor tomado del demo pixel-rpg (`px.js`, `font.js`, `ui.js`) y adaptado; escenas, personaje y línea de tiempo nuevos | Técnica probada; la historia es nuestra |
| P3 | Fuente pixel con acentos, ñ, ¿, ¡ y ↓ (se agregan glifos si faltan) | Español |
| P4 | `timeline.js` = única fuente de verdad (secciones, pulsos, revelaciones), exportado a `events.json` | Música, foley, subtítulos y checks leen los mismos números |
| P5 | `content.js` con las 5 preguntas; `FACTS.md` con sus fuentes | Rehacer el reel con otras preguntas o banda sin tocar el motor |
| P6 | Partitura chiptune y foley sintetizados en numpy (`mix.py`) a partir de `events.json` | Sin descargas, original, en la paleta del estilo |
| P7 | `mux.sh` con ffmpeg 7+ en el PATH (`FFMPEG_DIR`) | La versión 6 del sistema mide mal la longitud con loudnorm |
| P8 | Zona segura: texto clave en y ∈ [18, 262] y x ∈ [6, 166] del framebuffer | UI de Reels/TikTok |

## Checks (los tests del video)

`tests/` corre con `node --test` y `python`:
1. `facts.test.mjs`: cada pregunta de `content.js` existe en `docs/trivia.md` con la misma respuesta y fuerza ✅; no hay letras de canciones.
2. `layout.test.mjs`: todos los textos de `TEXTS(t)` caen en la zona segura y caben en su ventana.
3. `timeline.test.mjs`: revelaciones en pulso exacto (0 ms); cuenta regresiva de 3 s; la P1 se revela antes del s 9; `DUR` = fin de la última sección.
4. `readcheck.mjs` (de `core`): tiempos de lectura.
5. Final: −14 LUFS ±1, sin cuadros negros (`blackdetect`), sin tokens prohibidos (`grep`).
