# Reel promocional «Yo contra mi corazón» — Especificación (SDD)

> Estado: aprobado por el usuario (9 nov 2026): estilo «tráiler arcade de 16 bits con gameplay real, cortado al ritmo» y el texto del ranking «¿QUIÉN SERÁ EL MÁS MIGAJERO DE ESTA SEMANA? ¡DESCÚBRELO!».

## 1. Visión
Un reel vertical para Instagram de unos 24 s. Anuncia que el juego **solo está esta semana** y lleva a la gente a jugarlo y a pelear por el ranking. Todo el material sale del juego real: partidas jugadas por el bot y el mismo pixel art. No usa imágenes de terceros.

## 2. Usuarios
- **Fans de José Madero en Instagram:** lo ven sin sonido en el feed; tiene que entenderse solo con imagen y texto.
- **El equipo de CR:** publica un reel principal hoy y las variantes durante la semana.

## 3. Funcionalidades
**R1. Cinco escenas, cortadas en el tiempo de la canción** (168 BPM; 1 tiempo ≈ 0,357 s):

| Tiempos | Escena |
|---|---|
| 0–8 | **Gancho:** negro y un corazón que late; aparecen «EL PAYASO», «CONTRA» y «SU CORAZÓN» |
| 8–16 | **Cartel VS:** el retrato del payaso entra por un lado y el corazón por el otro; luego «VS» y el título |
| 16–40 | **Gameplay real**, 6 cortes de 4 tiempos: esquiva, batazo en cámara lenta (el contacto), agáchate, Grito, fase 3 y batazo al corazón partido. Cada corte lleva su letrero |
| 40–52 | **Ranking:** «¿QUIÉN SERÁ EL MÁS MIGAJERO DE ESTA SEMANA?», un top de ejemplo que baja con el ritmo y «¡DESCÚBRELO!» |
| 52–66 | **Cierre:** el K.O. de fondo, la franja amarilla («¡SOLO ESTA SEMANA!» o la cuenta regresiva), «HASTA EL DOMINGO 15 DE NOV», la dirección del juego, «HOMENAJE NO OFICIAL» y «@COLORESRUIDOSOS» |

**R2. Variantes del cierre:**
- `principal`: «¡SOLO ESTA SEMANA!», para hoy.
- `quedan-5`: «QUEDAN 5 DÍAS», para el miércoles 11.
- `quedan-3`: «QUEDAN 3 DÍAS», para el viernes 13.
- `ultimo-dia`: «¡ÚLTIMO DÍA!», para el domingo 15.

**R3. Dos audios por variante:**
- `latidos`: latidos en cada compás y efectos chiptune del juego. Al publicar se le añade «Teoremas, etc.» desde la biblioteca de Instagram, que es la opción recomendada por la licencia.
- `cancion`: el tramo de alta energía de la canción, desde 0:56, que entra justo en el cartel VS sobre la misma rejilla de tiempos.

## 4. Flujo
`npm run reel` hace lo siguiente:
1. El navegador dibuja cada cuadro a 180×320 con el código del juego.
2. ffmpeg lo escala ×6 sin suavizar, a 1080×1920 y 30 fps.
3. Se mezcla el audio.
4. Los archivos quedan en `reel/out/*.mp4`.

## 5. Arquitectura
- **`reel/reel.js`:** usa los mismos módulos del juego (`match`, `bot`, `view`, `sprites` y `text`). Antes de dibujar simula una pelea entera para encontrar los momentos (primera esquiva, primer batazo perfecto, latido, Grito, fase 3 y K.O.).
- **`scripts/reel.mjs`:**
  - abre `reel/reel.html` con Playwright;
  - pide los cuadros;
  - genera el audio de latidos y efectos con los eventos que devuelve `reel.js`;
  - llama a ffmpeg.
- **Salida:** los videos no se suben al repo (`reel/out/` está en `.gitignore`); se entregan al equipo.

## 6. No funcionales
- **Formato:** 1080×1920, H.264 + AAC, 30 fps y unos 24 s, como pide Instagram.
- **Legibilidad:** el texto mínimo es la fuente 5×7 a escala 1, que queda en 30 px reales. Todo el texto está a más de 120 px de los bordes de arriba y de abajo (zona segura de Reels).
- **Lo que no lleva:** sangre, imágenes de terceros y la cara realista de José.
- **Ranking de ejemplo:** usa los nombres de prueba del juego; no son jugadores reales.

## R4. Reel «Pepe Madero vs. mi corazón» (v2, petición del usuario, 9 nov 2026)
- **El gancho dice «PEPE MADERO», «VS» y «MI CORAZÓN»**, en lugar de «EL PAYASO», «CONTRA» y «SU CORAZÓN». Abajo lleva «HOMENAJE NO OFICIAL» desde el primer segundo, porque nombra al artista.
- En el cartel VS, el retrato se rotula «PEPE MADERO».
- **La franja del título del cartel VS dice «PEPE VS» (con «VS» en amarillo) y «MI CORAZÓN»** (petición del usuario, 10 nov 2026). Ese cuadro también sale como imagen de portada para el reel: `reel/out/portada-pepe.png`, de 1080×1920.
- **El top de ejemplo del ranking usa los nombres nuevos de la carrera** (F14 v0.4).
- Se genera con `npm run reel -- pepe`: las mismas 4 variantes del cierre × 2 audios → `reel/out/reel-pepe-*.mp4`.
