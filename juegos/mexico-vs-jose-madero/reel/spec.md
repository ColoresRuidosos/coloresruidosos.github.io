# Tráiler «Mundo 3 · Alba» — Especificación (SDD)

> Estado: ✅ el usuario lo pide (22 nov 2026: «así está bien, dame un tráiler para presentarlo»). v2: actualizado a *Alba* v11 (corazones, enemigos, Tiro de frases y la nube que te persigue).

## 1. Visión
Un tráiler vertical de unos 30 s para Instagram (Reels y Stories) y TikTok que presente el Mundo 3 «Alba»: un viaje al amanecer donde la nostalgia te persigue. Tono: divertido pero reflexivo, como el mundo. Todo el material sale del juego real (partidas del bot, sprites, fondos y escenas de Gemini ya importados); nada de imágenes de terceros.

## 2. Usuarios
- **Fans de José Madero en Instagram:** lo ven sin sonido en el feed; se tiene que entender solo con imagen y texto.
- **Quien ya jugó Carmesí y Noche:** tiene que notar que hay mundo nuevo y que se abre al terminar Noche.
- **El equipo de CR:** publica el tráiler y su portada.

## 3. Funcionalidades

**T1. Ocho escenas (≈31 s a 30 fps), juego a 320×224 en el centro de un lienzo de 360×640 (×3 = 1080×1920), letreros arriba y abajo:**

| Seg. | Escena | Texto en pantalla |
|---|---|---|
| 0–3 | **Gancho:** Pepe quieto en el pueblo y la bruma sepia que lo empieza a jalar | «SI TE QUEDAS QUIETO…» → «…LA NOSTALGIA TE JALA» |
| 3–6 | **Título:** escena a1 (salida de la fiesta) que se aclara hacia el amanecer | «MÉXICO VS. JOSÉ MADERO» · «MUNDO 3 · ALBA» |
| 6–9 | **Atril** con su pasaje (juego real) | «10 PASAJES DEL DISCO» |
| 9–12 | **Enemigos:** relojes y cartas, el micrófono | «EL TIEMPO SE TE ECHA ENCIMA» |
| 12–16 | **Tiro de frases** | «MINIJUEGO: TIRO DE FRASES» · «DISPÁRALE A LA NOSTALGIA» |
| 16–19 | **La Maldita Rueda** | «SÚBETE A LA MALDITA RUEDA» |
| 19–25 | **La Nostalgia te persige** (jefe, fase 1) | «LA NOSTALGIA TE PERSIGUE» → «CADA VEZ MÁS RÁPIDO» |
| 25–28 | **Letra:** la despedida en el juego (sale el sol y la nube sin cara se deshace) con un fragmento del disco y su crédito | «DEL JUEGO TIENES QUE BAJAR, / PUES TODO LLEGA A SU FINAL» · crédito |
| 28–31 | **Cierre:** Pepe con chaleco y bufanda | «YA DISPONIBLE» · «SE ABRE AL TERMINAR NOCHE» · «COLORESRUIDOSOS» · «HOMENAJE NO OFICIAL» · «@COLORESRUIDOSOS» |

**T2. Portada** (1080×1920, PNG): Pepe en la cima del cerro con el sol detrás, «MUNDO 3 · ALBA» y «MÉXICO VS. JOSÉ MADERO».

**T3. Audio:** música chiptune original del juego, en versión tranquila de amanecer, más los efectos suaves de Alba (pasaje, recuerdo, rayo, despedida). **No lleva audio de José Madero.** Al publicar se puede añadir «Maldita rueda» u otra canción de *Alba* desde la biblioteca de Instagram, que es la opción con licencia. Se entregan dos archivos: con música y solo con efectos.

**T4. Variante horizontal 16:9** (1920×1080, para YouTube y Facebook): ⏳ después del vertical, si el usuario la pide.

## 4. Flujo
`npm run reel` (en `juegos/mexico-vs-jose-madero/`):
1. El navegador simula los niveles 3-1, 3-2 y 3-3 con el bot y busca los momentos (atril, enemigo, tiro, noria, persecución); como el juego es determinista, vuelve a simular hasta poco antes de cada momento y graba desde ahí.
2. Dibuja cada cuadro con el código del juego.
3. ffmpeg lo escala sin suavizar a 1080×1920 (y 1920×1080) a 30 fps y mezcla el audio.
4. Salida en `reel/out/` (no se sube al repo).

## 5. Arquitectura
- `reel/reel.html` + `reel/reel.js`: usan los módulos del juego (`createGame`, `stepGame`, `albaBot`, `drawWorld`, `drawHud`, escenas) y componen el cuadro vertical: juego a 320×224 en el centro de 360×640, letreros arriba y abajo.
- `scripts/reel.mjs`: Playwright pide los cuadros, genera el audio (música chiptune del juego + efectos de los eventos) y llama a ffmpeg.
- Pruebas (`tests/reel.test.js`): la línea de tiempo (pura, `reel/timeline.js`) dura ~31 s sin huecos, y cada letrero cabe en 360 px y queda en la zona segura.

## 6. No funcionales
- **Formato:** 1080×1920, H.264 + AAC, 30 fps, ≈30 s.
- **Legibilidad:** texto mínimo de 30 px reales; todo el texto a más de 120 px de los bordes de arriba y abajo (zona segura de Reels).
- **Lo que no lleva:** sangre, imágenes de terceros, la cara realista de José ni audio de sus canciones.
- **Letra:** solo el fragmento ya aprobado para el juego, con crédito, y solo después de que CR lo coteje con la fuente oficial.
- «HOMENAJE NO OFICIAL» visible en el cierre y en la portada.
