# Reel · ¿Qué tan fan eres? · Love of Lesbian

Reel vertical (1080×1920, 40 s, 24 fps) para Instagram Reels: 5 preguntas de la trivia, en pixel art de 16 bits, con cuenta regresiva de 3 s.

- **Video listo:** [`ultima-partida.mp4`](ultima-partida.mp4) · póster [`poster.jpg`](poster.jpg) · subtítulos [`ultima-partida.srt`](ultima-partida.srt)
- **Por qué está hecho así:** [`spec.md`](spec.md) (métricas de los reels anteriores y objetivos), [`TREATMENT.md`](TREATMENT.md) (dirección), [`plan.md`](plan.md), [`tasks.md`](tasks.md)
- **Datos y fuentes:** [`FACTS.md`](FACTS.md). Antes de publicar, un fan confirma las 5 preguntas y las fechas.

## Hacer otra versión

Las preguntas viven en `content.js` (deben existir en `docs/trivia.md` con fuente ✅; lo vigila `tests/facts.test.mjs`) y los tiempos en `timeline.js`.

```sh
node --test reels/ultima-partida/tests/*.test.mjs        # datos y tiempos (sin dependencias)
LIB=<ruta a lemo-opuscar> FFMPEG_DIR=<ffmpeg 7+> sh reels/ultima-partida/build.sh   # render completo
```

El render usa las herramientas de la biblioteca lemo-opuscar (Chromium headless, mux a −14 LUFS) y Python con numpy, scipy y soundfile.
