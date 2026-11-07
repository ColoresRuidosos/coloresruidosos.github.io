# TREATMENT — "¿Qué tan fan eres?" (Love of Lesbian · Colores Ruidosos)

Estilo: **16-bit Pixel RPG** (`styles/pixel-rpg/STYLE.md`), vertical 1080×1920 (framebuffer 180×320 ×6), 24 fps, ~40 s, sin voz. Idioma: español de México.

## 1. Tres estructuras candidatas

- **A · Partida por épocas (elegida).** Un fan pixel recorre la discografía: cada pregunta es un nivel en la época de su disco, y la profundidad de color crece con los años (4 colores → 8 bits → 16 bits). La pregunta final regresa a 1997. Gana porque la pregunta 1 está en el cuadro 0 (gancho), cada respuesta es una recompensa antes del s 9 (su tiempo promedio actual) y el color cuenta la historia sin leer nada extra.
- **B · Combate por turnos.** Cada pregunta es un monstruo; acertar le baja HP. Divertido, pero la UI de combate compite con el texto de la pregunta en 180 px de ancho y alarga la lectura.
- **C · Archivos de guardado.** Seis ranuras de guardado, una por disco; abrir cada una muestra una pregunta. Bonito, pero tarda ~2 s en arrancar: mata el gancho.

**Apertura:** la pregunta 1 ya escrita sobre el cielo de 1997 en 4 colores. **Final:** pantalla de guardado con las fechas en México; el cursor elige "¿OTRA PARTIDA?" y empalma con el cuadro 0 (bucle). **Forma de la partitura:** arranca en mono de 4 bits y gana voces con cada época; un silencio total antes del jefe; la frase final queda en la dominante y resuelve en el bucle.

## 2. Logline y arco

Un fan con una bufanda rosa viaja por 25 años de Love of Lesbian contestando una pregunta por disco, hasta la más difícil, que lo devuelve al inicio de todo.

- **Planteamiento:** 1997, 4 colores, pregunta fácil.
- **Giro:** silencio, remolino de encuentro, "PREGUNTA FINAL": de vuelta a 1997, cuarto a oscuras. La respuesta enciende la luz: la cocina del productor, forrada de colchones.
- **Final:** el color inunda la pantalla; la categoría del espectador; partida guardada con las fechas en México; bucle.

## 3. Benchmark

- **Los concursos de preguntas en vivo para el celular** (formato de cuenta regresiva + revelación): **aprender** el ritmo pregunta → opciones escalonadas → 3·2·1 → revelación inmediata, y que el que mira siempre pueda contestar antes. **No tomar** su marca, colores, sonidos ni tipografía.
- **RPG de consola de mediados de los 90** como sistema (cuadros de diálogo, menús, pantallas de guardado, fanfarria de objeto): **aprender** la gramática de UI y la paleta como emoción. **No tomar** marcos, fuentes, melodías ni personajes de ningún juego.

## 4. Lista de planos

Cuadro vertical: banda superior (título fijo) · escena 180×128 · ventana de pregunta. Todo el texto clave queda entre y = 18 y y = 262 (zona segura: el 15 % inferior lo tapa la UI de Reels).

| # | t (s) | Época | Encuadre | Cámara | Por qué |
|---|---|---|---|---|---|
| 1 | 0.0–5.0 | 1997 · 4 colores | General del cielo con nubes y un letrero de neón naranja que parpadea; el fan de cuerpo entero a la izquierda | Paneo lateral lento con parallax de nubes | Gancho: el viaje empieza, la pregunta ya está escrita |
| 2 | 5.0–10.0 | 2005 · 8 bits | Fondo blanco, el fan camina sobre una línea como equilibrista; burbuja roja | Seguimiento lateral, entra por mosaico | Cambio de idioma = cambio de mundo |
| 3 | 10.0–14.5 | 2009 · 16 bits | Medio: baño de azulejos verdes con tina; el fan se asoma | Picado/tilt vertical de 12 px | Primer color pleno: "la explosión" |
| 4 | 14.5–19.0 | 2021 · 16 bits | Contrapicado: muros de mosaico azul, el fan rebota en un trampolín (estirar y encoger) | Tilt hacia arriba siguiendo el salto | Acelerar: más rápido, más alto |
| 5 | 19.0–20.0 | — | Pantalla completa | Sacudida 3-2-1 px + remolino de encuentro a blanco | El giro; silencio total antes |
| 6 | 20.0–29.5 | 1997 · 4 colores | Cuarto a oscuras, solo los ojos del fan; al revelar se prende la luz: cocina con colchones en las paredes | Fijo; al revelar, empuje por pasos de 2 px | Jefe final: la escena oculta *es* la respuesta |
| 7 | 29.5–34.5 | 2026 · 16 bits | Pantalla de categorías con 3 máscaras pixel (pequeña, con flecos, con plumas) | Ventanas que entran deslizando | Identidad → comentario |
| 8 | 34.5–40.0 | 2026 | Pantalla de guardado: ranuras "CDMX 24–26 NOV" y "PUEBLA 28 NOV", sticker rosa "VIENE A MÉXICO", URL | Fijo; el cursor baja y elige "¿OTRA PARTIDA?" | Llamada a la acción + bucle |

**Movimiento nativo:** la **profundidad de color como tiempo**. Cada época tiene su tabla de color, la final regresa a 4 colores, y al final el color inunda la pantalla con una onda de dither. **Color protegido:** el rosa de Colores Ruidosos (`#FF3E7F`), en la bufanda del fan, es el único color que sobrevive en todas las épocas, y vuelve en el sticker "VIENE A MÉXICO" (la marca reserva el rosa para ese sticker).

## 5. Hoja de beats

Las preguntas salen solo de `docs/trivia.md` con fuente ✅ (ver `FACTS.md`).

| t | Beat |
|---|---|
| 0.0 | Título "¿QUÉ TAN FAN ERES?" + "NIVEL 1 · 1997" + P1 escrita: "¿En qué idioma cantaban en sus 3 primeros discos?" |
| 0.6–1.0 | Opciones entran escalonadas (Inglés · Catalán · Francés · Castellano) |
| 1.0 / 2.0 / 3.0 | 3 · 2 · 1; el cursor de mano duda entre opciones |
| 4.0 | Revelación: INGLÉS en verde, el resto en gris; fanfarria corta |
| 5.0 | Mosaico → 2005. P2: "¿Su primer disco cantado en castellano?" (Maniobras de escapismo) |
| 9.0 | Revelación |
| 10.0 | → 2009. P3: "¿Qué disco les dio su primer disco de oro en España?" (1999) |
| 13.5 | Revelación |
| 14.5 | → 2021. P4: "¿Cuántas nominaciones al Latin Grammy 2021 recibieron con V.E.H.N.?" (3) |
| 18.0 | Revelación |
| 19.0 | Silencio total; sacudida |
| 19.5 | Remolino de encuentro → blanco |
| 20.0 | "¡PREGUNTA FINAL!" en 4 colores |
| 21.0 | P5: "¿Dónde grabaron su primer disco?" en un cuarto a oscuras |
| 23.0 / 24.0 / 25.0 | 3 · 2 · 1 con latido de corazón |
| 26.0 | Luz: cocina con colchones. "EN LA COCINA DE SU PRODUCTOR" + "…forrada de colchones" |
| 29.5 | El color inunda la pantalla. "¿CUÁNTAS SACASTE?" + categorías |
| 31.0 | "COMENTA LA TUYA ↓" |
| 34.5 | Pantalla de guardado con las fechas, el sticker y la URL |
| 38.5 | Cursor → "¿OTRA PARTIDA?" ▶ |
| 40.0 | Corte al cuadro 0 (bucle) |

## 6. Mapa de cues

120 BPM (pulso = 0.5 s, compás de 4/4 = 2 s). Todas las revelaciones caen en pulso: 4.0, 9.0, 13.5, 18.0, 26.0.

| Sección | t | Instrumentación |
|---|---|---|
| P1 1997 | 0–5 | Mono, 4 bits: pulso 25 % melodía + ruido LFSR suave |
| P2 2005 | 5–10 | Mono tipo NES: + bajo triangular |
| P3 2009 | 10–14.5 | Estéreo 16 bits con eco: + pulso 12.5 % armonía + batería completa |
| P4 2021 | 14.5–19 | Igual + arpegio en semicorcheas (aceleración) |
| Silencio | 19.0–19.5 | Cero absoluto, sin colas de eco |
| Jefe | 19.5–29.5 | Remolino → mono 4 bits, bajo pedal + latido en la cuenta; acorde "luz" a todo el grupo en 26.0 |
| Final | 29.5–40 | Inundación de color = vuelve todo el grupo; la frase queda en la dominante en 39.5 y resuelve en el cuadro 0 |

En cada pregunta: tic en cada número de la cuenta (agudo en 1); en la revelación, fanfarria mayor de 3 notas.

## 7. Diseño sonoro

| Sección | Ambiente | Foley | Música |
|---|---|---|---|
| P1 | viento bit-crushed | blips de texto, blip de cursor, zumbido del neón | mono 4 bits |
| P2 | — | pasos sobre la cuerda (eco), blips | NES |
| P3 | gotas de la llave | blips, chapoteo | 16 bits |
| P4 | — | resorte del trampolín (cada bote) | 16 bits + arpegio |
| Giro | silencio total | sacudida, remolino | — |
| Jefe | zumbido grave | **latido** (el único sonido orgánico), interruptor de luz al revelar | pedal → acorde |
| Final | — | pasos de ventana, ticks de guardado, campanita "objeto obtenido" | grupo completo |

Silencios: 19.0–19.5 (total) y 25.6–26.0 (solo el latido se corta) antes de la luz. Transiciones con sonido: el zumbido del neón entra antes del corte al jefe (J-cut); los ticks de guardado siguen por encima del corte del bucle.

## 8. Texto y títulos

- Fuente pixel original de ancho variable (mayúscula de 7 px) con sombra de 1 px, acentos, ñ, ¿ y ¡.
- **Ventana de pregunta:** borde en capas (tinta / blanco / plata), fondo azul oscuro con dither; en 1997 es clara (4 colores) y en 2005 negra con marco blanco (8 bits).
- **Revelación:** la opción correcta pasa a verde de marca (`#1FB57A`) con texto tinta; las demás a gris.
- **Títulos** a 2× con contorno de tinta y degradado por filas; entran con disolvencia Bayer, nunca con alfa.
- Sin subtítulos de voz (no hay voz); el `.srt` lleva las preguntas para accesibilidad.
