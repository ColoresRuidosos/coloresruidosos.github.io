# plan.md: decisiones técnicas de la infografía

## Stack
| Capa | Elección | Por qué |
|---|---|---|
| Maquetación | HTML + CSS (grid), 1080×1350 | Texto real, fácil de corregir; mismo sistema visual que el sitio |
| Datos | `datos.json` + `datos.js` (UMD, sin DOM) | La regla de las dos fuentes se prueba con `node --test` |
| Exportación | Playwright (Chromium ya instalado) | Captura exacta del lienzo; mismo enfoque que el vídeo In memoriam |

## Decisiones
- **F1 Formato 4:5 (1080×1350).** Es el que más espacio ocupa en el feed de Instagram. La historia (9:16) queda para después.
- **F2 Dos fuentes de dominios distintos por dato** (`validar` compara los dominios). Un dato con una sola fuente es `pendiente` y la página no lo dibuja.
- **F3 México sin días exactos.** Que Siloé acompaña a Morat en el Palacio de los Deportes en noviembre está confirmado por tres fuentes. Los días (14, 15 y 17) salen solo de una, así que se muestra «noviembre de 2026» y en el pie se remite a la taquilla oficial. Cuando el equipo confirme los días, se agrega la fuente y se vuelve a exportar.
- **F4 Identidad SPEC-001.** El sticker rosa «Viene a México» es justo el uso para el que está reservado el rosa. Discos en verde (Lanzamiento) y el bloque de México en naranja (Gira).
- **F5 Sin fotos.** La pieza es tipográfica: la línea de tiempo de discos es el elemento visual principal.
