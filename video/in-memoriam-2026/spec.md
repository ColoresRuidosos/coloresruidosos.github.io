# spec.md: vídeo «In memoriam 2026»

> Metodología Spec-Driven Development: qué y por qué. El cómo está en `plan.md`; el avance, en `tasks.md`.
> Es una pieza para redes, **no** una sección del sitio (se descartó la página `/in-memoriam/` el 2026-11-02).

## 1. Visión

**Problema.** En 2026 se fueron varios músicos de la escena que cubre el fanzine. Las notas del día no alcanzan para despedirlos juntos, y el equipo quiere un homenaje que se pueda compartir.

**Solución.** Un vídeo vertical de alrededor de un minuto para Reels, TikTok y Shorts. Muestra una veladora por cada artista que murió **en 2026**, en orden cronológico: nombre, fecha, país y banda. Al final, todas las veladoras quedan encendidas en una ofrenda, con el cierre «Gracias por la música». Está hecho igual que los vídeos de [awesome-opus5-5-videos](https://github.com/edgaralrohe/awesome-opus5-5-videos) (por ejemplo `notdwd-766641`): un solo HTML que dibuja cada fotograma desde una función `seek(t)` y se renderiza con Playwright y ffmpeg. Todo está escrito en código: sin generadores de vídeo con IA y sin fotos ajenas.

**Principios**
1. **Solo 2026.** Nadie que haya muerto en otro año, aunque sea un aniversario.
2. **Veracidad.** Cada artista tiene al menos **dos fuentes** de prensa que confirman la muerte. Si no coinciden en el día, se muestra solo el mes. Un caso con una sola fuente queda pendiente.
3. **Respeto.** Sin causa de muerte, sin detalles de cómo ocurrió, sin fotos de prensa. Se recuerda la obra.
4. **Nuestro ámbito.** Rock, indie, alternativo, punk, progresivo y pop-rock de México, España y Latinoamérica hispanohablante. Fuera: regional mexicano, flamenco puro, pop masivo, urbano y tropical.
5. **Identidad (SPEC-001).** Tinta `#141414`, crema `#F4EFE6`, naranja cempasúchil `#FF7A30` y amarillo `#FFD23F` para la flama. Tipografías Anton, Space Grotesk y Space Mono. Sin rosa.

**Métricas de éxito**
- Retención media de al menos el 50 % del vídeo en Reels.
- 0 errores de dato reportados.
- Publicado antes del 2026-11-09 (semana de Día de Muertos).

**Fuera de alcance**
- Música incrustada: el vídeo sale sin audio para ponerle una canción de la biblioteca de Instagram/TikTok (con licencia de la plataforma) al publicarlo.
- Versiones 16:9 y 1:1 (son fáciles de agregar después: solo cambia el lienzo).
- Fotos o ilustraciones por artista.

## 2. Usuarios

| Rol | Necesita |
|---|---|
| Seguidor en redes | Entender en segundos quién era cada artista y sentir el homenaje sin que sea morboso |
| Equipo (Pardy, Tanelly, Dany, Pratz) | Un MP4 listo para subir y un texto para el pie de la publicación con las fuentes |
| Mantenedor (Edgar) | Agregar o quitar a alguien editando `datos.json` y volver a renderizar con un comando |

## 3. Funcionalidades

- **V1 Datos.** `datos.json` con los artistas de 2026: nombre, fecha (`AAAA-MM-DD` o `AAAA-MM`), país, proyectos, una línea propia (≤ 70 caracteres) y fuentes. Pruebas que impiden que entre alguien fuera de 2026, sin dos fuentes `https`, con una causa de muerte en el texto o desordenado.
- **V2 Línea de tiempo.** Intro de 4 s, un tramo de 3.4 s por artista y un cierre de 6 s. Una función pura dice qué escena y qué progreso corresponden a cada instante `t`.
- **V3 Escenas.** Intro (veladora y título «In memoriam 2026»), tarjeta por artista con la ofrenda de veladoras abajo (la de ese artista se enciende) y cierre con todas encendidas, la lista completa y la marca.
- **V4 Render.** `node render.js` genera `in-memoriam-2026.mp4` (1080×1920, 30 fps, H.264, sin audio) y una hoja de contacto para revisar.
- **V5 Pie de publicación.** `pie.md`: texto listo para pegar, con los nombres y las fuentes.

## 4. Flujos

**A. Publicar.** `node render.js` → revisar la hoja de contacto → subir el MP4 a Instagram/TikTok → elegir una canción tranquila de la biblioteca → pegar `pie.md`.

**B. Agregar a alguien (si muere alguien más antes de fin de año).** Agregar la entrada a `datos.json` con dos fuentes → `node --test` → `node render.js` → la línea de tiempo se ajusta sola.

**C. Corregir.** Un seguidor avisa → se corrige `datos.json` → se vuelve a renderizar.

## 5. Arquitectura

```
datos.json ──► linea.js (pura: validar, ordenar, línea de tiempo) ──► tests/video.test.js (node --test)
                    │
                    ▼
               video.html (canvas 1080×1920; window.seek(t) dibuja el fotograma t)
                    │
render.js (Playwright: seek(t) cuadro por cuadro → PNG → ffmpeg) ──► in-memoriam-2026.mp4 + contacto.png
```

Vive en `video/in-memoriam-2026/` del repo del fanzine: Hugo no lo publica y el workflow diario no lo toca.

## 6. Requisitos no funcionales

- **Legibilidad en celular:** el nombre a ≥ 110 px de alto, cada tarjeta en pantalla ≥ 3 s y textos dentro de la zona segura de Reels (sin texto importante en los 250 px de abajo ni en los 220 px de arriba).
- **Determinismo:** el mismo `datos.json` produce el mismo vídeo; las partículas usan una semilla fija y no hay `Math.random()` sin semilla ni dependencia del reloj.
- **Movimiento calmado:** fundidos y desplazamientos suaves, sin destellos (seguro para fotosensibilidad).
- **Sin red al renderizar:** las tipografías están copiadas en `fuentes/` (SIL OFL).
- **Peso:** el MP4 pesa < 25 MB.

## Lista verificada (2026-11-02)

| Fecha | Artista | País | Proyecto |
|---|---|---|---|
| 8 ene | Álvaro Peña-Rojas | Chile | The 101'ers, pionero del punk |
| ene | Adrián Bar | Argentina | Orion's Beethoven |
| 8 feb | Rafael Amador | España | Pata Negra |
| 12 feb | Saúl Cornejo | Perú | Laghonia, We All Together |
| 21 mar | Daniel Buira | Argentina | Los Piojos, La Chilinga |
| 13 abr | Felipe Staiti | Argentina | Enanitos Verdes |
| may | Walo Carrillo | Perú | Los Holys, Tarkus |
| 5 jun | Indio Solari | Argentina | Patricio Rey y sus Redonditos de Ricota |
| 30 jun | Daniel Melingo | Argentina | Los Twist, Los Abuelos de la Nada |
| 13 ago | Víctor Coyote | España | Los Coyotes |
| 26 ago | Rubén Rada | Uruguay | Totem, candombe beat |
| 31 ago | Miguel Zavaleta | Argentina | Suéter |
| sep | Jonathan “Honas” Meléndez | México | Camilo Séptimo |
| 2 oct | Ricardo Soulé | Argentina | Vox Dei |
| 23 oct | Carlos Riganti | Argentina | Alas |

**Descartados al verificar:** Maximiliano Djerfy (murió en 2021), Patricio Suárez-Vértiz (vive; quien murió fue su hermano Pedro, en 2023), Eduardo Rodríguez Rodway de Triana (vive), Armando Vega Gil (2019), Robe Iniesta y Jorge Martínez de Ilegales (diciembre de 2025).

## Decisiones abiertas (para el equipo)

| # | Pregunta | Mientras tanto |
|---|---|---|
| B1 | Gabino Palomares (canto nuevo, México, † 30 sep): ¿entra en nuestro ámbito? Sería el segundo mexicano | Fuera |
| B2 | Miguel Salazar (Los Zopilotes, Perú, † 2 ago): una sola fuente | Fuera hasta tener otra |
| B3 | Pepe Sánchez (batería de sesión, España, † 19 sep): una sola fuente y sin banda propia | Fuera |
| B4 | Adrián Bar: la fecha exacta no aparece; se infiere enero por la fecha de publicación | Se muestra «enero» |
| B5 | Jonathan Meléndez murió asesinado: ¿se incluye? El vídeo no menciona la causa | Dentro |
