# Tráiler «Mundo 3 · Alba» — Especificación (SDD)

> Estado: ⏳ borrador para aprobar (16 nov 2026). Petición: «Necesitamos un tráiler de la nueva parte de la aventura».

## 1. Visión
Un tráiler vertical de unos 30 s para Instagram (Reels y Stories) y TikTok que presente el Mundo 3 «Alba»: un paseo al amanecer, sin daño, donde lo difícil es no quedarse atrapado en la nostalgia. Tono: divertido pero reflexivo, como el mundo. Todo el material sale del juego real (partidas del bot, sprites, fondos y escenas de Gemini ya importados); nada de imágenes de terceros.

## 2. Usuarios
- **Fans de José Madero en Instagram:** lo ven sin sonido en el feed; se tiene que entender solo con imagen y texto.
- **Quien ya jugó Carmesí y Noche:** tiene que notar que hay mundo nuevo y que se abre al terminar Noche.
- **El equipo de CR:** publica el tráiler y su portada.

## 3. Funcionalidades

**T1. Seis escenas (≈30 s, cortes cada 2 s aprox.):**

| Seg. | Escena | Texto en pantalla |
|---|---|---|
| 0–3 | **Gancho:** Pepe quieto en el pueblo; la bruma sepia lo empieza a jalar hacia atrás | «SI TE QUEDAS QUIETO…» → «…LA NOSTALGIA TE JALA» |
| 3–6 | **Título:** escena a1 (salida de la fiesta) que se aclara hacia el amanecer | «MÉXICO VS. JOSÉ MADERO» · «MUNDO 3 · ALBA» |
| 6–18 | **Paseo (gameplay real), 6 cortes:** atril con su pasaje · una polaroid que lo regresa · la Maldita Rueda · plataformas de luz · sentarse en la banca · la feria | un letrero corto por corte: «10 PASAJES DEL DISCO», «RECUERDOS QUE TE REGRESAN», «LA MALDITA RUEDA», «LUZ DEL ALBA», «DESCANSA EN LA BANCA», «AQUÍ NADIE PIERDE» |
| 18–24 | **Jefe:** aparece La Nostalgia con su frase; rayos de sol; viento en contra | «QUÉDATE. AQUÍ TODO FUE MEJOR.» (frase del juego) → «LA NOSTALGIA» |
| 24–27 | **Letra:** escena a3 (sale el sol) con un fragmento del disco y su crédito | «DEL JUEGO TIENES QUE BAJAR, / PUES TODO LLEGA A SU FINAL» · «MALDITA RUEDA» · JOSÉ MADERO · ALBA (2018) · USADO CON AUTORIZACIÓN |
| 27–30 | **Cierre:** Pepe con chaleco y bufanda frente al sol | «YA DISPONIBLE» · «SE ABRE AL TERMINAR NOCHE» · dirección del juego · «HOMENAJE NO OFICIAL» · «@COLORESRUIDOSOS» |

**T2. Portada** (1080×1920, PNG): Pepe en la cima del cerro con el sol detrás, «MUNDO 3 · ALBA» y «MÉXICO VS. JOSÉ MADERO».

**T3. Audio:** música chiptune original del juego, en versión tranquila de amanecer, más los efectos suaves de Alba (pasaje, recuerdo, rayo, despedida). **No lleva audio de José Madero.** Al publicar se puede añadir «Maldita rueda» u otra canción de *Alba* desde la biblioteca de Instagram, que es la opción con licencia. Se entregan dos archivos: con música y solo con efectos.

**T4. Variante horizontal 16:9** (1920×1080, para YouTube y Facebook): mismas escenas, sin las franjas de texto de arriba y abajo.

## 4. Flujo
`npm run reel` (en `juegos/mexico-vs-jose-madero/`):
1. El navegador simula los niveles 3-1, 3-2 y 3-3 con el bot y guarda los momentos (primer atril, primera polaroid, subida a la noria, banca, aparición del jefe, rayos, viento, despedida).
2. Dibuja cada cuadro con el código del juego.
3. ffmpeg lo escala sin suavizar a 1080×1920 (y 1920×1080) a 30 fps y mezcla el audio.
4. Salida en `reel/out/` (no se sube al repo).

## 5. Arquitectura
- `reel/reel.html` + `reel/reel.js`: usan los módulos del juego (`createGame`, `stepGame`, `albaBot`, `drawWorld`, `drawHud`, `draw-alba`, escenas) y componen el cuadro vertical: juego a 320×224 ×3 en el centro, letreros arriba y abajo.
- `scripts/reel.mjs`: Playwright pide los cuadros, genera el audio con los eventos y llama a ffmpeg.
- Pruebas (`tests/reel.test.js`): la línea de tiempo dura 30 s, cada escena tiene su momento encontrado, los textos caben en pantalla y respetan la zona segura.

## 6. No funcionales
- **Formato:** 1080×1920, H.264 + AAC, 30 fps, ≈30 s.
- **Legibilidad:** texto mínimo de 30 px reales; todo el texto a más de 120 px de los bordes de arriba y abajo (zona segura de Reels).
- **Lo que no lleva:** sangre, imágenes de terceros, la cara realista de José ni audio de sus canciones.
- **Letra:** solo el fragmento ya aprobado para el juego, con crédito, y solo después de que CR lo coteje con la fuente oficial.
- «HOMENAJE NO OFICIAL» visible en el cierre y en la portada.
