# spec-video.md: vídeo dinámico «Siloé viene a México»

> Spec-Driven Development. Complementa `spec.md` (la infografía): mismos datos, otro formato.

## 1. Visión

**Problema.** La infografía funciona en el feed, pero en Reels y TikTok hace falta movimiento para frenar el scroll.

**Solución.** Un vídeo vertical de 33 s, rápido y con ritmo, que cuenta la misma historia en cinco escenas y cierra con el logo de Colores Ruidosos.

**Prompt base elegido en awesome-opus5-5-videos:** [`aschapmann-724497`](https://skillry.dev/ai-videos/opus-5-5/aschapmann-724497). Pide justo lo que solicitó el equipo:

> *«…first read my landing page and codebase to pull the real story, copy, colors, font and logo… write the video as one story in 4 to 5 scenes with one short title each… kinetic typography word by word, spring easing… elements that build in on the beat… keep each scene on screen long enough to read… end on a memorable animated logo reveal with the tagline and URL… check the frames yourself and fix anything that overlaps, clips or feels rushed.»*

**Técnica:** la de [`notdwd-766641`](https://skillry.dev/ai-videos/opus-5-5/notdwd-766641), que ya usa el vídeo In memoriam: un HTML que dibuja cada fotograma desde `seek(t)`, renderizado con Playwright y ffmpeg. Reglas que se toman de ahí: «llegar rápido, aterrizar suave», nada se congela (empuje lento en cada pausa), escalonado de 2 a 4 cuadros, grande y legible en el celular.

**Estilo Colores Ruidosos, sacado del código del sitio** (`assets/css/main.css`, `layouts/home.html`, `hugo.toml`):
- Logo: «COLORES» en crema y «RUIDOSOS» en amarillo, Anton en mayúsculas, contorno de tinta y sombra dura de 6 px; confeti de círculos rosa, amarillo, naranja, azul y verde detrás; pastilla amarilla «@coloresruidosos» inclinada.
- Cabecera tinta con borde inferior rosa; fondo crema con franjas diagonales rosa, azul y amarillo.
- Bordes de 3 px, sombras duras, Anton, Space Grotesk y Space Mono.
- Colores con significado: verde = Lanzamiento (discos), naranja = Gira (México), azul = sombra de los datos, rosa solo para el sticker «Viene a México».
- Lema: «Fanzine digital de la escena indie y rock, hecho por un grupo de amigos en México».

**Regla de veracidad.** El vídeo lee `datos.json` y solo usa los datos `verificado` (dos fuentes de dominios distintos). Una prueba comprueba que ningún pendiente (días exactos, Berklee, la broma de Santi Balmes) aparezca en el guion.

**Fuera de alcance.** Audio: se publica con música de la plataforma, igual que el vídeo In memoriam. El prompt base pide efectos de sonido, pero sin música de fondo sonarían pobres; se pueden agregar después.

## 2. Usuarios
| Rol | Necesita |
|---|---|
| Seguidor en Reels/TikTok | Entender quién es Siloé y cuándo viene antes de deslizar |
| Equipo | Un MP4 vertical listo para subir, con el texto de `pie.md` |

## 3. Funcionalidades
- **S1 Guion desde datos:** `guion(datos)` arma el contenido de las escenas solo con lo verificado.
- **S2 Escenas (5 + logo):** 01 Viene a México · 02 Quiénes son · 03 Sus discos · 04 Para que los conozcas · 05 En México · cierre con el logo.
- **S3 Ritmo:** pulso de 120 BPM (0.5 s); las entradas caen en el pulso con resorte (pequeño rebote).
- **S4 Transiciones:** cortinilla de franjas de la marca entre escenas (0.6 s), sin cortes secos.
- **S5 Render:** `node render-video.js` → `siloe-viene-a-mexico.mp4` (1080×1920, 30 fps, H.264) + `contacto-video.png`.

## 4. Flujos
**A.** `node --test tests/*.test.js` → `node render-video.js --contacto` (revisar) → `node render-video.js` → publicar con `pie.md`.
**B.** Si se confirman los días exactos en México: `mexico-dias` pasa a `verificado` y el vídeo los muestra solo, sin tocar el código.

## 5. Arquitectura
```
datos.json ─► datos.js (veracidad) ─┐
                                    ├─► escenas.js (puro: guion, línea de tiempo, resorte, cortinilla) ─► tests/video.test.js
video.html (canvas 1080×1920, seek(t)) ◄┘
render-video.js (Playwright → ffmpeg) ─► siloe-viene-a-mexico.mp4 + contacto-video.png
```

## 6. Requisitos no funcionales
- Cada escena dura al menos 4.5 s (se alcanza a leer); el texto mide 40 px o más, salvo las etiquetas de 30 px.
- Zona segura de Reels: nada importante en los 220 px de arriba ni en los 250 px de abajo.
- Determinista, sin destellos y con tipografías locales.
