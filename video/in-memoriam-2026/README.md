# In memoriam 2025–2026 (vídeo)

Vídeo vertical (1080×1920, 30 fps, 75 s, sin audio) para Reels, TikTok y Shorts: una veladora por cada músico de nuestro ámbito que murió de ofrenda a ofrenda (del Día de Muertos de 2025 al de 2026). No forma parte del sitio: Hugo no publica esta carpeta.

- **Vídeo:** [`in-memoriam-2026.mp4`](in-memoriam-2026.mp4) · **Revisión rápida:** [`contacto.png`](contacto.png) · **Texto para publicar:** [`pie.md`](pie.md)
- **Spec:** [`spec.md`](spec.md) (incluye la lista verificada y las decisiones abiertas) · [`plan.md`](plan.md) · [`tasks.md`](tasks.md)

Está hecho igual que los vídeos de [awesome-opus5-5-videos](https://github.com/edgaralrohe/awesome-opus5-5-videos): `video.html` dibuja cada fotograma desde `window.seek(t)` y `render.js` lo graba con Playwright y ffmpeg. No usa generadores de vídeo con IA ni fotos ajenas.

## Cambiar algo y volver a renderizar

```bash
cd video/in-memoriam-2026
node --test tests/*.test.js     # valida datos.json (de ofrenda a ofrenda, dos fuentes, sin causa de muerte…)
node render.js --contacto        # solo la hoja de contacto (segundos)
node render.js                   # vídeo completo (~6 min)
```

Para verlo en vivo: `npx http-server .` (o cualquier servidor local) y abrir `video.html`.

Requiere Node 18+, Playwright con Chromium y ffmpeg. Las tipografías (Anton, Space Grotesk y Space Mono, licencia SIL OFL) están en `fuentes/`.
