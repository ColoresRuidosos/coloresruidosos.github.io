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
- **E4 Pétalos de cempasúchil** como partículas con semilla fija (mulberry32): mismo vídeo en cada render y ningún destello.
- **E9 Dirección de arte v2: papel picado a color (2026-11-02).** La primera versión (fondo tinta, luto sobrio) se reemplazó a pedido del equipo: «aludiendo a la cultura mexicana, usa colores, nada explícito». Prompt base: `x4b47x-034026` (papel recortado, vertical, 30–60 s). Cada hoja de papel picado se dibuja en un canvas aparte y se recorta con `destination-out` (flores, estrellas, soles, rombos y borde festoneado), así el fondo se ve a través de los recortes, como en el papel de china real. Sombra suave debajo de cada pieza de papel para dar profundidad de recorte. Las tiras ondean con un seno (sin azar).
- **E10 Paleta.** Rosa mexicano `#E4007C`, morado `#6C2A8C`, naranja `#FF7A30`, amarillo `#FFD23F`, verde `#1FB57A`, turquesa `#00A3A6` y azul `#2F5BFF` sobre crema `#F4EFE6`, con tinta `#141414` para texto. Usar rosa mexicano en el vídeo no rompe la regla del sitio que reserva el rosa de la marca (`#FF3E7F`) para «Viene a México»: es otro color con otro papel, el cultural. El color de cada artista rota por la paleta (`papel(i)`) y el color del texto se elige por contraste (`colorTexto`), con pruebas.
- **E11 Nada explícito.** Ningún dibujo de calaveras, cruces ni el signo †. La fecha se muestra como «8 de enero», sin «murió» ni «falleció».
- **E12 De ofrenda a ofrenda (2026-11-02).** El equipo extrañó a Robe Iniesta (10 de diciembre de 2025). En vez de una excepción, la ventana pasa a ser del 2 de noviembre de 2025 al 2 de noviembre de 2026 (`DESDE`/`HASTA` en `linea.js`). Una fecha de solo mes vale si el mes completo cae dentro (de diciembre de 2025 a octubre de 2026). El título dice «2025–2026» y cada fecha lleva su año.
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
