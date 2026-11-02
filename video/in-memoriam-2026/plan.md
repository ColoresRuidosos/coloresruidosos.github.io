# plan.md: decisiones técnicas del vídeo

## Stack
| Capa | Elección | Por qué |
|---|---|---|
| Animación | Un HTML con `<canvas>` 1080×1920 y `window.seek(t)` | Es la técnica de los vídeos de referencia (`notdwd-766641` en awesome-opus5-5-videos): cada fotograma es una función pura del tiempo, sin reloj, así que el render es exacto y repetible |
| Lógica | `linea.js` (UMD, sin DOM) | Se prueba con `node --test` y la usa el HTML |
| Render | Playwright (Chromium ya instalado) + ffmpeg | Sin dependencias nuevas: `canvas.toDataURL` por fotograma → ffmpeg por stdin → H.264 `yuv420p` (compatible con Instagram) |
| Tipografías | Anton, Space Grotesk y Space Mono en `fuentes/` | Identidad SPEC-001; copia local para renderizar sin red |

## Decisiones
- **E1 Vertical 9:16, 30 fps, sin audio.** Reels/TikTok/Shorts primero. Sin audio para usar música con licencia de la plataforma; una pista sintetizada por código sonaría pobre al lado de una canción real.
- **E2 Ofrenda como hilo conductor.** Abajo hay 15 veladoras en 3 filas de 5 (o lo que pida el número de artistas: la cuadrícula se calcula). Cada tarjeta enciende la suya y las anteriores siguen encendidas, de modo que el progreso se ve. El cierre muestra todas encendidas. Funciona con cualquier número de artistas.
- **E3 Tiempos.** Intro 4 s + 3.4 s por artista + cierre 6 s. Con 15 artistas son 61 s. Cada tarjeta entra con un fundido y una subida de 0.5 s, se queda quieta y sale con un fundido de 0.4 s. La veladora se enciende a los 0.3 s.
- **E4 Pétalos de cempasúchil** como partículas con semilla fija (LCG): mismo vídeo en cada render y ningún destello.
- **E5 Fechas parciales.** `AAAA-MM` se muestra como «enero de 2026». Nunca se inventa un día.
- **E6 Texto propio corto (≤ 70 caracteres)** para que se lea en 3 s. La prueba bloquea palabras de causa de muerte (mismo criterio que la propuesta de sección descartada).
- **E7 Zona segura.** Nada importante en los 220 px de arriba ni en los 250 px de abajo; la ofrenda ocupa la franja de 1180 a 1640 px.
- **E8 Hoja de contacto.** `render.js` guarda 8 fotogramas clave en una sola imagen (`contacto.png`) para revisar sin ver el vídeo completo, igual que en `okazaky-084783`.

## Riesgos
| Riesgo | Mitigación |
|---|---|
| Fecha o persona incorrecta | Dos fuentes por artista, pruebas y la lista en `spec.md` para que el equipo la revise |
| Texto ilegible en celular | Tamaños mínimos (spec §6) y revisión con la hoja de contacto |
| Muere alguien más antes de fin de año | Flujo B: agregar a `datos.json` y volver a renderizar |
