# Prompts para Gemini: todo el arte de «MÉXICO VS. JOSÉ MADERO»

Objetivo: que **todo** (enemigos, jefes, objetos, fondos y bloques) salga con el mismo estilo que la hoja de Pepe y la hoja de prensa, y que el pipeline (`scripts/slice_sheet.py`) lo recorte sin trabajo manual.

---

## 0. Cómo usarlos

1. **Adjunta siempre 2 imágenes de referencia** en cada conversación con Gemini:
   - `art/source/pepe-sheet.jpg` (la hoja de Pepe)
   - la hoja de prensa (Documento / Paparazzi / Reportero)
2. **Pega primero el BLOQUE DE ESTILO (§1)** y después el prompt concreto.
3. **Una imagen = un personaje** (o un grupo de objetos). No mezcles varios enemigos en una hoja.
4. Si Gemini añade texto, marcos o sombras, contesta: *«Repítelo exactamente igual pero sin ningún texto, sin marcos, sin sombras en el suelo y con fondo gris liso #474747»*.
5. Guarda cada imagen con el nombre indicado (p. ej. `w1-lunes28.png`) y pásamela.

### Reglas técnicas (por qué importan)
| Regla | Motivo |
|---|---|
| Fondo **gris liso uniforme #474747** (sprites) o **magenta #FF00FF** (capas de fondo con transparencia) | El script detecta el fondo por color y lo borra |
| **Sin texto, rótulos, números, marcos ni cuadrícula** | Se recortarían como si fueran parte del sprite |
| **Sin sombras en el suelo** | La sombra se pegaría a los pies |
| Poses **separadas entre sí** (que no se toquen) | Cada pose se detecta como una figura independiente |
| **Mirando a la derecha** | El juego las voltea cuando hace falta |
| **Mismo tamaño de personaje en toda la hoja** | La escala se calcula con la primera fila |
| Filas en el orden pedido | Así cada fotograma recibe su nombre automáticamente |

---

## 0b. ⭐ PRIORIDAD v5 · Mundo 1 «Carmesí» (2 nov 2026)

Sustituyen a los sprites provisionales recortados del concepto. Cada prompt es **autocontenido**: pégalo tal cual. **Adjunta siempre** `art/source/pepe-sheet.jpg` (estilo y tamaño) y, en A–C, `art/source/carmesi/concepto-jefe-enemigos.jpg` (diseño). Usa **una conversación nueva por prompt**: así Gemini no mezcla personajes.

Al recibir cada hoja, el juego la recorta con:
```
python3 scripts/slice_sheet.py art/source/carmesi/w1-flashbot.png flashbot 76 4,3,3,2 bossWalk:4,bossCharge:2,bossFire:1,bossExposed:2,bossHurt:1,bossKo:2
python3 scripts/slice_sheet.py art/source/carmesi/w1-rumor.png rumor 30 4,2,2 rumorFly:4,rumorDive:2,rumorKo:2
python3 scripts/slice_sheet.py art/source/carmesi/w1-traidor.png traidor 34 4,3,2 traidorHover:4,traidorAim:1,traidorLunge:2,traidorKo:2
python3 scripts/slice_sheet.py art/source/pepe-solo.png pepesolo 48 4,2 solo:4,soloEnd:2
```
(El número de poses por fila tiene que coincidir **exactamente**; si Gemini pone otras, pídele que lo repita).

### A. `w1-flashbot.png` — Jefe Cámara Flash-Bot, de perfil
```
Usa la primera imagen adjunta (el jefe «Cámara Flash-Bot») como referencia de DISEÑO: cámara de fuelle antigua y oxidada, telón rojo de teatro, alambre de espino, engranajes dorados, dos bombillas de flash arriba, lente rojo grande y patas de araña metálicas. Usa la hoja de Pepe adjunta como referencia de ESTILO.

ESTILO: pixel art 16 bits de arcade de los 90, contorno oscuro grueso, sombreado plano de 2-3 tonos por color, colores saturados.
VISTA: PERFIL ESTRICTO, vista lateral pura como un jefe de un juego de plataformas 2D. NADA de perspectiva de tres cuartos. El lente apunta a la DERECHA.
FORMATO: hoja de sprites sobre un fondo gris completamente liso #474747, sin degradado. Sin texto, sin rótulos, sin números, sin flechas, sin marcos, sin cuadrícula y SIN SOMBRA en el suelo. Cada pose separada de las demás con mucho espacio libre (que no se toquen). El robot tiene el mismo tamaño en todas las poses y todas se apoyan en la misma línea de suelo. Mide 1,6 veces la altura de Pepe.

HOJA de exactamente 4 filas, de izquierda a derecha:
Fila 1: CAMINAR ×4 (ciclo de paso de las patas de araña).
Fila 2: CARGAR ×2 (el lente se ilumina cada vez más, de rojo a blanco) y DISPARAR ×1 (lente abierto con un destello corto pegado al lente; NO dibujes el rayo largo).
Fila 3: EXPUESTO ×2 (lente agrietado, humo y chispas pegados al cuerpo) y DAÑO ×1 (sacudida, tornillos saltando).
Fila 4: DERROTA ×2 (se desarma y suelta pétalos de rosa rojos que quedan cerca del cuerpo).
```

### B. `w1-rumor.png` — Rumor Volador
```
Usa la primera imagen adjunta (el «Rumor Volador») como referencia de DISEÑO: pájaro hecho de hojas de periódico dobladas en papiroflexia, con manchas rojas, ojos enfadados y pico naranja. Los titulares del periódico son garabatos ilegibles, NUNCA letras ni palabras legibles. Usa la hoja de Pepe adjunta como referencia de ESTILO.

ESTILO: pixel art 16 bits de arcade de los 90, contorno oscuro grueso, sombreado plano de 2-3 tonos por color, colores saturados.
VISTA: de perfil, mirando a la DERECHA.
FORMATO: hoja de sprites sobre un fondo gris completamente liso #474747. Sin texto, sin letras, sin rótulos, sin marcos, sin cuadrícula y sin sombras. Cada pose separada de las demás con espacio libre. El mismo tamaño en todas las poses, que es el 60 % de la altura de Pepe.

HOJA de exactamente 3 filas, de izquierda a derecha:
Fila 1: VOLAR ×4 (ciclo completo de aleteo).
Fila 2: PICADO ×2 (cabeza hacia abajo y alas plegadas, cayendo en diagonal hacia delante).
Fila 3: DERROTA ×2 (se deshace en hojas de papel sueltas que forman un montón compacto).
```

### C. `w1-traidor.png` — Micrófono Traidor
```
Usa la primera imagen adjunta (el «Micrófono Traidor») como referencia de DISEÑO: micrófono de mano metálico de estilo vintage, con rejilla, envuelto en alambre de espino, un solo ojo rojo brillante, alas rojas y el cable rojo como cola. Sin logos ni marcas. Usa la hoja de Pepe adjunta como referencia de ESTILO.

ESTILO: pixel art 16 bits de arcade de los 90, contorno oscuro grueso, sombreado plano de 2-3 tonos por color, colores saturados.
VISTA: de perfil o de tres cuartos, mirando a la DERECHA.
FORMATO: hoja de sprites sobre un fondo gris completamente liso #474747. Sin texto, sin rótulos, sin marcos, sin cuadrícula y sin sombras. Cada pose separada de las demás con espacio libre. El mismo tamaño en todas las poses, que es el 70 % de la altura de Pepe.

HOJA de exactamente 3 filas, de izquierda a derecha:
Fila 1: FLOTAR ×4 (aleteo suave).
Fila 2: APUNTAR ×1 (inclinado hacia delante, con el ojo más brillante) y EMBESTIDA ×2 (lanzándose en diagonal hacia delante, con líneas de velocidad PEGADAS al cuerpo).
Fila 3: DERROTA ×2 (alas caídas, ojo en espiral y unas chispas pegadas al cuerpo).
```

### D. `pepe-solo.png` — Pepe con la guitarra (para el Solo de guitarra)
```
Usa la hoja de Pepe adjunta como referencia EXACTA del personaje (barba, pañuelo rojo, camiseta blanca, vaqueros, mismas proporciones chibi y mismo tamaño) y del estilo.

Pepe toca una guitarra eléctrica ROJA de diseño propio: cuerpo redondeado genérico, sin logo, sin marca y sin la forma reconocible de ningún modelo real.
ESTILO: pixel art 16 bits de arcade de los 90, igual que la referencia.
FORMATO: hoja de sprites sobre un fondo gris completamente liso #474747. Sin texto, sin rótulos, sin marcos y sin sombras en el suelo. Mirando a la DERECHA. Cada pose separada de las demás con espacio libre. Mismo tamaño en todas las poses.

HOJA de exactamente 2 filas, de izquierda a derecha:
Fila 1: SOLO ×4 (rasgueo enérgico, una pierna adelante, la cabeza echada hacia atrás, con 1-2 notas musicales pegadas a la guitarra).
Fila 2: FINAL ×2 (salto con la guitarra en alto y aterrizaje en pose de rock).
```

### E. Prensa limpia (3 imágenes, sección §2)
```
Repite exactamente este personaje de la imagen adjunta, con el mismo diseño, solo en su propia hoja. Fondo gris completamente liso #474747, sin texto, sin rótulos, sin cuadros y sin sombras en el suelo. Mirando a la DERECHA. Cada pose separada de las demás.
HOJA de 3 filas: Fila 1: ESPERA ×2 y CAMINAR ×4 · Fila 2: ATAQUE ×2 y DAÑO ×1 · Fila 3: DERROTA ×1.
```
Haz una imagen para cada personaje: `prensa-documento.png` (el periódico enfadado), `prensa-paparazzi.png` y `prensa-reportero.png`. En el Reportero, la credencial solo puede decir «PRESS», sin el nombre de ningún medio.

### Si Gemini se equivoca, contesta con esto
| Problema | Respuesta |
|---|---|
| Sale en tres cuartos | «Repítelo en vista lateral pura, de perfil, como un sprite de plataformas 2D. El frente mira a la derecha.» |
| Añade texto o rótulos | «Repítelo exactamente igual pero sin ningún texto, letra, número ni rótulo.» |
| Sombras en el suelo | «Quita todas las sombras del suelo; los pies tocan directamente el fondo gris.» |
| Poses que se tocan | «Separa más cada pose: debe haber espacio gris libre alrededor de cada una.» |
| Filas o número de poses distintos | «Exactamente N filas: fila 1 con X poses, fila 2 con Y… sin poses extra.» |
| Fondo con degradado o textura | «Fondo gris completamente plano #474747, del mismo color en toda la imagen.» |
| Tamaños distintos entre poses | «Mismo tamaño del personaje en todas las poses.» |

### Logo de Colores Ruidosos
**No lo generes con Gemini**, porque lo cambiaría. Pásame el **archivo original** (PNG con fondo transparente o SVG).

---

## 0c. ⭐ Escenarios del Mundo 1 por capas (v6, 2 nov 2026)

El juego pinta cada nivel con **3 capas**: **CIELO** (fija), **LEJOS** (se mueve despacio) y **CERCA** (se mueve a media velocidad). Encima van el suelo y los bloques, los ganchos y candelabros y los letreros, que dibuja el código. **Una imagen por capa y una conversación por imagen.** Adjunta como referencia el concepto del nivel: `art/source/carmesi/concepto-calle.jpg`, `concepto-azoteas.jpg` o `concepto-teatro.jpg`.

**BLOQUE ESCENARIO** (pégalo antes de cada prompt):
```
ESTILO: pixel art 16 bits de arcade de los 90 (Neo Geo), igual que la imagen de referencia adjunta: contornos oscuros, sombreado plano con 2-3 tonos por color, paleta limitada y saturada. Usa la referencia SOLO para el estilo y la paleta: no copies sus personajes, su texto ni su interfaz.
FORMATO: fondo para un videojuego de plataformas 2D en VISTA LATERAL PLANA (sin perspectiva ni punto de fuga), formato apaisado 16:9. La imagen debe ser REPETIBLE EN HORIZONTAL: el borde izquierdo continúa exactamente en el borde derecho.
PROHIBIDO: personas o personajes (solo siluetas lejanas si se pide), texto, letras, números, logotipos, marcas, marcos, interfaz, firmas o marcas de agua.
```
Las capas LEJOS y CERCA llevan **fondo magenta liso #FF00FF** detrás de los elementos: el juego lo vuelve transparente.

### 1-1 «Lunes 28» · Calle Carmesí (medianoche del 28 feb 2016)
**`w1-calle-cielo.png`**
```
[BLOQUE ESCENARIO]
CAPA CIELO (cubre toda la imagen, sin magenta): cielo nocturno de ciudad a medianoche, degradado de morado muy oscuro arriba a carmesí oscuro abajo, con tramado de píxeles, pocas estrellas y una luna pequeña. Sin edificios.
```
**`w1-calle-lejos.png`**
```
[BLOQUE ESCENARIO]
CAPA LEJOS sobre fondo magenta liso #FF00FF: silueta de ciudad mexicana de noche en tonos carmesí y morado oscuro, con ventanas encendidas en naranja. A la izquierda, la cúpula iluminada de una gran arena de conciertos genérica (sin nombre ni logotipo), con haces de luz hacia el cielo, como si acabara de terminar un concierto. Algunas torres de iglesia. Los edificios ocupan el 60 % inferior y la parte de arriba es magenta.
```
**`w1-calle-cerca.png`**
```
[BLOQUE ESCENARIO]
CAPA CERCA sobre fondo magenta liso #FF00FF: fachadas de una calle del centro a medianoche: edificios de ladrillo rojo con balcones de hierro, telones rojos colgando, faroles encendidos, cables con papel picado rojo y crema sin letras, puestos de comida cerrados con la cortina bajada y pétalos de rosa rojos en el aire. Carteles pegados en la pared, en blanco o con manchas abstractas (sin texto). El 15 % inferior de la imagen va vacío en magenta (ahí va el suelo del juego).
```

### 1-2 «Plural siendo singular» · Azoteas (abril de 2016, atardecer)
**`w1-azoteas-cielo.png`**
```
[BLOQUE ESCENARIO]
CAPA CIELO (cubre toda la imagen, sin magenta): atardecer sobre la ciudad, degradado de morado arriba a naranja y amarillo abajo, nubes alargadas con tramado de píxeles y un sol grande y bajo. Sin edificios.
```
**`w1-azoteas-lejos.png`**
```
[BLOQUE ESCENARIO]
CAPA LEJOS sobre fondo magenta liso #FF00FF: dos volcanes nevados a contraluz al fondo y, delante, la ciudad en siluetas moradas con ventanas encendidas. Abajo, entre los edificios, pequeños destellos blancos de flashes de cámaras, como si hubiera una multitud de fotógrafos en la calle (sin dibujar personas). Los elementos ocupan el 65 % inferior.
```
**`w1-azoteas-cerca.png`**
```
[BLOQUE ESCENARIO]
CAPA CERCA sobre fondo magenta liso #FF00FF: azoteas de ciudad mexicana: tinacos negros sobre bases de metal, antenas de televisión, ropa tendida en un cable, escaleras de emergencia oxidadas, cables eléctricos que cruzan de lado a lado, un marco de cartel publicitario vacío en blanco y unas macetas con rosas rojas. El 15 % inferior va vacío en magenta.
```

### 1-3 «La presentación» · El Teatro (septiembre de 2016)
**`w1-teatro-cielo.png`**
```
[BLOQUE ESCENARIO]
CAPA CIELO (cubre toda la imagen, sin magenta): pared del fondo de un teatro clásico en penumbra, color vino muy oscuro, con un gran arco de proscenio de estilo art déco con motivos geométricos dorados y un telón de terciopelo rojo recogido a los lados. Luz cálida de candilejas desde abajo.
```
**`w1-teatro-lejos.png`**
```
[BLOQUE ESCENARIO]
CAPA LEJOS sobre fondo magenta liso #FF00FF: tres pisos de palcos de teatro art déco con barandillas doradas y siluetas oscuras de público (sin rasgos ni caras). Sin candelabros (los pone el juego).
```
**`w1-teatro-cerca.png`**
```
[BLOQUE ESCENARIO]
CAPA CERCA sobre fondo magenta liso #FF00FF: en los extremos izquierdo y derecho, telones de terciopelo rojo que caen desde arriba; columnas art déco con capiteles dorados; una cenefa de telón arriba a lo ancho, con flecos dorados. El centro y el 15 % inferior van vacíos en magenta. Sin candelabros.
```

### Bloques del suelo (opcional; ahora los dibuja el código)
**`w1-bloques.png`**
```
[BLOQUE ESCENARIO]
HOJA DE TEXTURAS sobre gris liso #474747, sin texto: tres cuadrados grandes separados, vistos de frente y sin perspectiva: 1) adoquín rojo oscuro con borde superior de piedra clara (suelo de la calle); 2) ladrillo de azotea con borde de lámina oxidada; 3) tablas de madera de escenario con un ribete rojo arriba. Cada cuadrado debe poder repetirse en horizontal y en vertical.
```

**Si sale mal, contesta:** «Vista lateral plana, sin perspectiva» · «Quita todo el texto y las personas» · «El fondo detrás de los elementos debe ser magenta liso #FF00FF» · «Haz que el borde izquierdo continúe en el derecho para poder repetirla».

**Al recibirlas:** el juego las reduce a 224 px de alto, vuelve transparente el magenta, ajusta la paleta y, si el borde no empalma, lo funde (tarea H6).

---

## 0d. ⭐ PRIORIDAD v8 · Mundo 2 «Noche», estilo Neo Geo (2 nov 2026)

Sustituyen a los enemigos que hoy se **dibujan por código**. Piden **más fotogramas** que Carmesí: el movimiento fluido, con anticipación y retroceso, es lo que más acerca al Neo Geo.

**Cómo pedirlos:**
- Una conversación nueva por prompt.
- Adjunta siempre `art/source/pepe-sheet.jpg`, para el estilo y el tamaño.
- **Genéralos a color.** El juego los pasa a blanco y negro, y con color salen más volúmenes.

**Cómo se recortan** (las filas tienen que coincidir **exactamente**):
```
python3 scripts/slice_sheet.py art/source/noche/w2-invitado.png invitado 46 6,6,4,3 invWalk:6,invRun:6,invUnmask:4,invKo:3
python3 scripts/slice_sheet.py art/source/noche/w2-murcielago.png murcielago 22 4,6,3 batHang:4,batFly:6,batKo:3
python3 scripts/slice_sheet.py art/source/noche/w2-fantasma.png fantasma 34 6,4,3 ghostFloat:6,ghostAttack:4,ghostKo:3
python3 scripts/slice_sheet.py art/source/noche/w2-enmascarado.png enmascarado 72 6,6,4,4,4,4 maskWalk:6,maskDash:6,maskLeap:4,maskThrow:4,maskStun:4,maskUnmask:4
```

### Bloque común (pégalo al principio de cada prompt)
```
ESTILO: pixel art de arcade de 16 bits de los 90, estilo Neo Geo (como los juegos de lucha y de acción de SNK): contorno oscuro grueso, sombreado plano de 3 tonos por color con un brillo duro, paleta corta y saturada, proporciones chibi como la hoja de Pepe adjunta, poses EXAGERADAS con anticipación antes de atacar y retroceso al recibir un golpe.
VISTA: PERFIL ESTRICTO mirando a la DERECHA, como un juego de plataformas 2D. Nada de tres cuartos.
FORMATO: hoja de sprites sobre fondo gris completamente liso #474747, sin degradado. Sin texto, sin números, sin marcos, sin cuadrícula y SIN SOMBRA en el suelo. Cada pose separada de las demás con mucho espacio (que no se toquen). Mismo tamaño del personaje en todas las poses, todas apoyadas en la misma línea de suelo. Exactamente las filas y poses pedidas, de izquierda a derecha.
```

### A. `w2-invitado.png` — Invitado enmascarado (95 % de la altura de Pepe)
```
[BLOQUE COMÚN]
PERSONAJE: invitado de una fiesta de disfraces elegante: frac negro, camisa blanca, pajarita, guantes blancos y una MÁSCARA VENECIANA NEGRA con borde dorado que le tapa los ojos. Persona genérica, sin parecido con nadie real.
Fila 1: CAMINAR ×6 (paso elegante, como bailando).
Fila 2: CORRER ×6 (se lanza hacia delante con los brazos extendidos).
Fila 3: PIERDE LA MÁSCARA ×4 (golpe → la máscara sale volando → cara SORPRENDIDA con ojos muy abiertos y boca en «O» → se recompone, enfadado).
Fila 4: DERROTA ×3 (cae de espaldas y queda tumbado).
```

### B. `w2-murcielago.png` — Murciélago (50 %)
```
[BLOQUE COMÚN]
PERSONAJE: murciélago chibi con orejas grandes, ojos brillantes y dos COLMILLOS blancos bien visibles. Gracioso, no gore.
Fila 1: COLGADO ×4 (boca abajo, envuelto en sus alas, balanceándose).
Fila 2: VOLAR ×6 (ciclo de aleteo completo, alas arriba y abajo).
Fila 3: DERROTA ×3 (se encoge, gira y cae).
```

### C. `w2-fantasma.png` — Fantasma (85 %)
```
[BLOQUE COMÚN]
PERSONAJE: fantasma clásico de sábana blanca, con dos ojos negros ovalados y el borde de abajo ondulado. Tierno, no aterrador.
Fila 1: FLOTAR ×6 (la sábana ondea, sube y baja).
Fila 2: ATACAR ×4 (se estira hacia delante con la boca abierta en «O»).
Fila 3: DERROTA ×3 (se deshace en jirones hacia arriba).
```

### D. `w2-enmascarado.png` — Jefe El Enmascarado del Lago (1,5 veces la altura de Pepe)
```
[BLOQUE COMÚN]
PERSONAJE: figura alta y elegante con abrigo largo negro, sombrero de copa baja, guantes blancos y un ANTIFAZ DE FIESTA blanco con detalles plateados (NO máscara de hockey ni de ningún personaje de terror conocido). Misterioso, no gore.
Fila 1: CAMINAR ×6 (paso lento y amenazante).
Fila 2: EMBESTIDA ×6 (agachado, corre con el abrigo ondeando).
Fila 3: SALTO ×4 (se agacha, salta en arco con el abrigo abierto, aterriza con una rodilla en el suelo).
Fila 4: LANZAR ×4 (saca tres antifaces y los lanza en abanico).
Fila 5: ATURDIDO ×4 (tambaleándose, con estrellitas y el sombrero torcido).
Fila 6: SIN MÁSCARA ×4 (se quita el antifaz → debajo hay una PERSONA NORMAL y amable → sonríe → saluda con la mano).
```

### E. Escenarios de Noche (escena completa)
Gemini no separa capas, así que son escenas completas que el juego usa como fondo panorámico (`scripts/import_backdrop.py`). Formato: **panorámica muy ancha (proporción 4:1), sin personajes, sin texto, a color** (el juego la pasa a blanco y negro).
- `w2-fiesta.png`: calle de barrio mexicano de noche con una fiesta de disfraces: casas con ventanas encendidas, papel picado, farolas y luna llena. Sin gente.
- `w2-cabanas.png`: bosque de pinos con niebla junto a un lago, cabañas de madera con alguna ventana encendida, luna entre nubes.
- `w2-lago.png`: muelle de madera sobre un lago quieto con niebla, barcas amarradas, bosque oscuro al fondo, la luna reflejada en el agua.

---

## 0e. ⭐ PRIORIDAD v9 · Ilustraciones de las escenas y escenarios de Noche (ChatGPT, 2 nov 2026)

Sustituyen a las escenas y fondos dibujados por código. **Una conversación por imagen.** Adjunta siempre `art/source/pepe-sheet.jpg`; en la escena 3 adjunta además la hoja de prensa.

### Bloque común para escenas (pégalo al principio)
```
ESTILO: ilustración en pixel art de una cinemática de videojuego arcade de 16 bits de los años 90 (como las intros de los juegos de Neo Geo): píxeles grandes y nítidos, contorno oscuro, sombreado plano de 3 tonos, paleta corta y con mucho contraste, encuadre de cine.
PERSONAJE: si sale el protagonista, es EXACTAMENTE el de la hoja adjunta (pelo, barba, camiseta blanca, pañuelo rojo, vaqueros), en proporción chibi.
FORMATO: imagen horizontal 3:2. Todo lo importante en la franja central (arriba y abajo se recortan). SIN texto, sin letras, sin números, sin logotipos ni marcas, sin marcos ni bordes.
```

### Bloque común para escenarios de Noche (pégalo al principio)
```
ESTILO: fondo de un videojuego de plataformas 2D en pixel art de 16 bits, en BLANCO Y NEGRO (escala de grises), como una película de terror clásica de los años 30, con niebla y contraluces. Vista lateral, sin perspectiva de tres cuartos.
FORMATO: imagen horizontal 3:2, panorámica. SIN personajes en primer plano, SIN texto, sin logotipos, sin marcos. El 20 % inferior queda oscuro y liso (ahí va el suelo del juego).
```

| Archivo | Prompt (después del bloque común) |
|---|---|
| `p1-estadio.png` | El protagonista canta en un escenario enorme, visto de lado; delante, un estadio lleno de noche, miles de luces de móvil, tres haces de luz desde arriba y confeti. Estadio genérico, sin marcas. Tonos morados y dorados |
| `p2-arena.png` | Ciudad de México de noche: edificios con ventanas encendidas y, en el centro, una arena de conciertos genérica con cúpula iluminada de morado. Sin nombre ni letreros. Estrellas y estelas de faros de coches |
| `p3-titulares.png` | El protagonista, asustado, rodeado de periódicos voladores con caras enfadadas (como los de la hoja de prensa adjunta) y destellos de cámaras de fotos. Ambiente rojo, caótico y mareante. Titulares ilegibles, solo garabatos |
| `p4-museo.png` | Interior de un museo dentro de una gran carpa, en penumbra: vitrinas vacías, cuadros con marcos dorados sin imagen. En el centro, el protagonista solo, en gris (sin color), mirando a su alrededor confundido |
| `p5-puertas.png` | Pasillo largo de museo con 8 puertas seguidas, de colores, de izquierda a derecha: rojo, negro, blanco, azul, amarillo, naranja óxido, lila y verde. El protagonista de espaldas, mirándolas. Solo la roja tiene luz por debajo |
| `c1-puerta-roja.png` | Puerta roja de museo entreabierta; por la rendija sale luz cálida y vuelan pétalos de rosa rojos. El protagonista se acerca caminando |
| `c2-calle-roja.png` | Calle del centro de una ciudad mexicana a medianoche, toda en rojos y morados: balcones de hierro, papel picado sin letras, faroles y pétalos en el aire. Sin gente |
| `c3-disco-oro.png` | Escenario de teatro vacío con telón rojo; en el suelo, bajo un foco, un disco de oro y una rosa roja. Polvo flotando en la luz |
| `c4-pepe-carmesi.png` | El protagonista en pose de victoria (brazos arriba), con un fondo rojo de pétalos y un halo de luz detrás |
| `n1-puerta-negra.png` | Puerta negra de museo que se abre a una calle en blanco y negro; al fondo, un salón de fiestas con ventanas encendidas. Lo de dentro del museo, a color; lo de fuera, en gris |
| `n2-invitacion.png` | Primer plano de una mano con guante que sostiene una invitación elegante sin texto, con un antifaz de fiesta dibujado. Fondo negro con estrellas. Blanco y negro |
| `n3-baile.png` | Salón de baile en blanco y negro con las luces encendidas: candelabros, suelo ajedrezado, invitados elegantes bailando, ya sin máscaras, y confeti. Sonrisas |
| `n4-pepe-noche.png` | El protagonista se quita un antifaz de fiesta y sonríe. Blanco y negro, pero con su pañuelo en rojo |
| `w2-afuera.png` *(escenario)* | La calle frente a un salón de fiestas elegante de noche: fachada con marquesina de focos sin letras, ventanales con siluetas bailando, fila de invitados disfrazados en silueta (capas, sombreros anchos, velos), farolas, papel picado y luna llena |
| `w2-salon.png` *(escenario)* | Interior de un gran salón de fiestas con la luz apagada: ventanales en arco con cortinas y la luna, candelabros apagados, mesas con mantel, globos, retratos antiguos, suelo ajedrezado |
| `w2-pista.png` *(escenario)* | Pista de baile de un salón de fiestas: al fondo, un escenario con telón y una orquesta en silueta (contrabajo, batería, piano, sin marcas), candelabros encendidos, palcos a los lados, suelo ajedrezado |

**Cómo se importan** (lo hago yo al recibirlas): las escenas se recortan a 320×150 con paleta reducida y las de Noche pasan a gris; los escenarios van al fondo panorámico de su nivel, en gris.

---

## 1. BLOQUE DE ESTILO (pégalo al inicio de cada prompt)

```
ESTILO: pixel art 16 bits de videojuego arcade de los 90 (estilo Neo Geo / Spin Master), igual que las imágenes de referencia adjuntas: personajes chibi con cabeza grande, contorno oscuro grueso (#1b1226), sombreado plano tipo cel con 2-3 tonos por color, colores saturados, expresiones exageradas y cómicas. Iluminación desde arriba a la izquierda.
FORMATO: hoja de sprites. Fondo gris liso y uniforme #474747, sin degradado. SIN texto, SIN rótulos, SIN números, SIN marcos, SIN cuadrícula, SIN sombras en el suelo. Todos los personajes mirando a la derecha, de cuerpo entero, cada pose separada de las demás con espacio libre alrededor (que no se toquen). Mismo tamaño de personaje en toda la hoja. Personajes genéricos: no representar a personas reales, ni logos ni marcas.
```

---

## 2. Rehacer la hoja de prensa (ya tenéis el diseño; solo hay que limpiar el formato)

> Repite exactamente estos tres personajes con el mismo diseño, pero **cada uno en su propia imagen**, sin textos, sin cuadros y sin sombras, siguiendo la plantilla de §3.

- `prensa-documento.png` — el periódico enfadado (Documento/Titular)
- `prensa-paparazzi.png` — gorra verde, gafas, chaleco, cámara
- `prensa-reportero.png` — traje azul, corbata roja, micrófono; la credencial puede decir «PRESS» genérico, sin nombre de medio

---

## 3. Plantilla de enemigo (para todos)

```
[BLOQUE DE ESTILO]
PERSONAJE: <descripción>
HOJA de 3 filas, de izquierda a derecha:
Fila 1: ESPERA ×2 (respirando) · CAMINAR ×4 (ciclo de paso)
Fila 2: ATAQUE ×2 (<cómo ataca>) · DAÑO ×1 (recibe un golpe, gesto de dolor)
Fila 3: DERROTA ×1 (tirado en el suelo, ojos en X)
Tamaño: el personaje mide aprox. <N> % de la altura de Pepe en la referencia.
```

---

## 4. Enemigos por mundo

Las referencias salen de canciones, portadas y conceptos verificados (ver `specs/spec.md` §3.2). **Personajes genéricos**: ningún famoso.

### Mundo 1 · CARMESÍ (rojo, 2016)
- `w1-lunes28.png` — **Lunes 28**: hoja de calendario viva con el número 28 grande (único texto permitido: «28»), ojos somnolientos y enfadados, bracitos y alas de papel. *Vuela en zigzag.* ATAQUE: se lanza en picado. Tamaño 70 %.
- `w1-libro-ruso.png` — **Libro ruso**: libro grueso de tapa roja con detalles dorados, cara seria con bigote poblado, patitas. ATAQUE: se abre y escupe letras sueltas (sin palabras legibles). Tamaño 75 %.
- `w1-espina.png` — **Espina**: tallo de rosa con espinas, cara gruñona, enraizado. Solo ESPERA ×2 y ATAQUE ×2 (sacude espinas). Tamaño 80 %.

### Mundo 2 · NOCHE (negro / blanco y negro, 2017)
- `w2-invitado.png` — **Invitado enmascarado**: invitado de fiesta de disfraces con traje elegante y máscara veneciana negra. Fila extra: SIN MÁSCARA ×2 (cara sorprendida, más rápido). Tamaño 95 %.
- `w2-fantasma.png` — **Fantasma**: sábana clásica con ojos negros, flotando. Fila extra: SEMITRANSPARENTE ×2. Tamaño 85 %.
- `w2-murcielago.png` — **Murciélago**: murciélago chibi con colmillos. VOLAR ×4 en lugar de CAMINAR. Tamaño 50 %.
- Nota: este mundo se verá en blanco y negro (lo convierte el código), pero generadlo **a color**.

### Mundo 3 · ALBA (blanco, 2018, nostalgia) — **paseo: no generéis enemigos** (se mantienen solo como referencia)
- `w3-recuerdo.png` — **Recuerdo**: foto polaroid viva con una imagen borrosa de un atardecer, mirada triste, bracitos. ATAQUE: abraza (te arrastra). Tamaño 75 %.
- `w3-maldita-rueda.png` — **Maldita Rueda**: rueda de madera vieja con cara enfadada. RODAR ×4 en lugar de CAMINAR. Tamaño 70 %.

### Mundo 4 · PSALMOS (azul, 2019)
- `w4-codependientes.png` — **Codependientes**: pareja de figuritas chibi genéricas (chico y chica, ropa azul) unidas por una cadena dorada en las muñecas. Todas las poses son de los dos juntos. Tamaño 90 %.
- `w4-chambelan.png` — **Chambelán**: joven con traje de chambelán (chaqueta con charreteras, guantes blancos). CAMINAR = paso de vals ×4. Tamaño 95 %.
- `w4-sombra.png` — **Sombra suelta**: silueta negra de una persona con ojos blancos brillantes. Mismas poses que Pepe (correr y saltar) para imitarle. Tamaño 100 %.

### Mundo 5 · GIALLO (amarillo, 2022) — *estética de cine giallo; nada de enfermedades mentales*
- `w5-maniqui.png` — **Maniquí**: maniquí de tienda color crema, sin cara, articulaciones visibles. Fila extra: CONGELADO ×2 (posturas rígidas distintas). Tamaño 105 %.
- `w5-guante.png` — **Guante negro**: mano enguantada de cuero negro que sale de una cortina amarilla. Solo ESPERA ×2 · ATAQUE ×2 (agarra) · DERROTA ×1. Tamaño 60 %.

### Mundo 6 · AURORA (EP 2023, naranja óxido) — **paseo**
- **Sin enemigos: es un paseo reflexivo.** Solo hacen falta fondos (§8) y bloques (§9). Mundo 3 *Alba* tampoco necesita enemigos: ⚠️ no generéis `w3-*.png`.

### Mundo 7 · SARAJEVO (lila, 2024)
- `w7-bailarina.png` — **Bailarina**: bailarina chibi con vestido lila y tacones, girando. CAMINAR = giros ×4. Tamaño 95 %.
- `w7-pez.png` — **Pez linterna** (tramo submarino): pez lila con antena luminosa. NADAR ×4. Tamaño 55 %.

### Mundo 8 · QUERIDO… (verde, 2026, epistolar y medieval)
- `w8-carta.png` — **Carta voladora**: sobre con sello de lacre rojo y alas. VOLAR ×4. Tamaño 50 %.
- `w8-juglar.png` — **Juglar**: juglar medieval con laúd y traje verde y crema. ATAQUE: lanza notas musicales en arco. Tamaño 95 %.
- `w8-pierrot.png` — **Pierrot de perlas**: pierrot chibi de cara blanca con lágrima pintada y cuello de perlas, en verdes. ATAQUE: llora lágrimas que caen. Tamaño 95 %.

---

## 5. Jefes (uno por imagen, más grandes que Pepe)

```
[BLOQUE DE ESTILO]
JEFE FINAL: <descripción>. Mide entre 2 y 3 veces la altura de Pepe en la referencia.
HOJA de 4 filas:
Fila 1: ESPERA ×2
Fila 2: ATAQUE A ×2 · ATAQUE B ×2
Fila 3: DAÑO ×1 · FURIA ×2 (segunda fase: más rojo, más agresivo)
Fila 4: DERROTA ×2
```

| Archivo | Jefe | Descripción para el prompt |
|---|---|---|
| `boss-w1-rosa.png` | **La Rosa Carmesí** | Rosa gigante roja con cara altiva, tallo con espinas como látigos y pétalos que se deshacen en polvo. A: lluvia de pétalos · B: latigazo de espinas |
| `boss-w2-enmascarado.png` | **El Enmascarado del Lago** | Figura alta genérica de terror con capucha oscura, máscara blanca lisa con agujeros y ojos rojos brillantes (**no copiar personajes de películas**). A: aparece y desaparece · B: embestida |
| `boss-w3-nostalgia.png` | **La Nostalgia** | Figura etérea blanca y dorada hecha de fotos antiguas flotando, con un reloj de bolsillo que gira hacia atrás. A: rebobinar (espiral) · B: lanza fotos |
| `boss-w4-sombra.png` | **La Sombra** | Sombra gigante con forma de niño volador de cuento (silueta de capa y gorro puntiagudo) separándose de una figura en posición fetal. A: picado · B: manos de sombra desde el suelo |
| `boss-w5-maniqui.png` | **El Maniquí en Llamas** | Maniquí gigante color crema con la cabeza envuelta en una llama amarilla (como la portada de *Giallo*), sobre un escenario de teatro. A: brazos giratorios · B: bola de fuego amarilla |
| `boss-w7-rey.png` | **El Rey Ahogado** | Rey submarino lila y verde agua con corona torcida, capa empapada y burbujas. A: corriente de agua · B: lanza la corona como bumerán |
| `boss-w8-pierrots.png` | **Los Dos Pierrots** | Dos pierrots gigantes con cuello de perlas: uno ríe y otro llora (como la portada de *Querido…*). A: el que ríe gira · B: el que llora lanza lágrimas |
| `boss-prensa.png` | **La Rueda de Prensa** | Mesa larga con muchos micrófonos genéricos sobre brazos mecánicos y un foco. A: micrófonos que se estiran · B: ráfaga de flashes suaves |
| `boss-bestia.png` | **La Bestia** (secreto) | Criatura grande y peluda de cuento, con un pañuelo rojo en el cuello, más tierna que terrorífica. A: rugido · B: salto |

### Final «MÉXICO VS. JOSÉ MADERO» (pantalla VS)
- `vs-pepe.png`: retrato grande de Pepe de medio cuerpo, cantando con el micrófono y el pañuelo rojo, mirando a la derecha. Fondo gris liso. Expresiones: DECIDIDO ×1 · CANTANDO ×1 · VICTORIA ×1.
- `vs-publico.png`: multitud chibi de un concierto (siluetas con luces de móvil, brazos arriba), sin banderas ni logos. Expresiones: FRÍO ×1 · ANIMADO ×1 · EUFÓRICO ×1.

---

## 6. Pepe: poses extra que faltan

```
[BLOQUE DE ESTILO]
PERSONAJE: exactamente el mismo Pepe de la referencia (barba, tupé, pañuelo rojo, camiseta blanca, vaqueros, micrófono).
Fila 1: NADAR ×4 (brazada bajo el agua, mejillas hinchadas)
Fila 2: COLGADO DEL CABLE ×2 (agarrado al cable del micrófono, balanceándose)
Fila 3: LINTERNA ×2 (sujetando una linterna encendida, asustado) · CARTA ×2 (corriendo con un sobre)
Fila 4: ENTRAR POR PUERTA ×1 (de espaldas) · CEGADO ×1 (tapándose los ojos por un flash)
```
Archivo: `pepe-extra.png`

---

## 7. Objetos y power-ups (una sola hoja)

```
[BLOQUE DE ESTILO]
HOJA DE OBJETOS, cada objeto suelto y separado, del mismo tamaño aproximado (30 % de la altura de Pepe), en este orden de izquierda a derecha y de arriba abajo:
1 púa de guitarra roja brillante · 2 rosa carmesí · 3 disco de oro · 4 máscara blanca lisa de portero (genérica) · 5 sol de amanecer pequeño · 6 farol antiguo encendido · 7 micrófono plateado · 8 sobre con lacre rojo · 9 partitura dorada enrollada · 10 disco de vinilo dorado (pieza del museo) · 11 corazón rojo · 12 gancho metálico de anilla
```
Archivo: `objetos.png`

---

## 8. Fondos de los mundos (3 capas por mundo)

Formato de cada capa: **imagen panorámica horizontal 3:1** que **se repite sin cortes por los lados** (el borde izquierdo encaja con el derecho). Sin personajes y sin texto.

```
[BLOQUE DE ESTILO, cambiando FORMATO por:]
FORMATO: fondo de videojuego 16 bits, panorámico 3:1, repetible en horizontal (el borde izquierdo encaja con el derecho), sin personajes, sin texto, sin logos.
CAPA <LEJANA | MEDIA>: <descripción>
```
- **Capa lejana** (`wN-fondo-lejano.png`): cielo y siluetas. **Opaca.**
- **Capa media** (`wN-fondo-medio.png`): estructuras con huecos. **Todo lo que no sea estructura, en magenta liso #FF00FF** (se vuelve transparente).

| Mundo | Lejana | Media |
|---|---|---|
| 0 · Prototipo / Ciudad | Atardecer morado y naranja sobre Ciudad de México, con una arena de conciertos con cúpula al fondo | Vigas de acero naranjas y ventanales de una nave industrial |
| 1 · Carmesí | Cielo rojo intenso con pétalos flotando y luna roja | Rosales gigantes, vallas de jardín y columnas rojas |
| 2 · Noche | Noche oscura, luna llena, lago con niebla y bosque de pinos (estilo cine clásico de terror) | Cabañas de madera con ventanas encendidas, guirnaldas y farolillos de fiesta de disfraces |
| 3 · Alba | Amanecer blanco y dorado, nubes suaves, campos lejanos | Marcos de fotos colgando, ramas desnudas blancas y negras |
| 4 · Psalmos | Interior de catedral azul en penumbra con rayos de luz | Columnas, vidrieras de colores y bancos de iglesia |
| 5 · Giallo | Escenario de teatro con telón amarillo y focos | Bastidores, escaleras de tramoya, maniquíes de utilería y cuerdas |
| 6 · Aurora | Pared blanca gastada con hiedra y hojas rojo-naranja (como la portada del EP) | Ventanas viejas, macetas y enredaderas |
| 7 · Sarajevo | Noche lila con cortinas de terciopelo lila enormes | Escenario con cortinas; versión submarina: algas y burbujas lilas |
| 8 · Querido… | Castillo medieval verde en la colina, cielo verdoso | Torres, estandartes verdes sin escudos y buzones antiguos |
| Museo (hub) | Sala de museo moderna en penumbra | Vitrinas vacías iluminadas y 8 puertas de colores (rojo, negro, blanco, azul, amarillo, naranja, lila, verde), sin texto |
| Arena (final) | Interior de una arena de conciertos llena, luces de escenario moradas y rojas, público con luces de móvil | Estructura del escenario, focos y pantallas (sin logos) |

---

## 8b. Nivel memorial «Luciérnagas» (tono sobrio; esperad a confirmar el diseño)
- Fondo lejano: calle de barrio mexicano de noche, casas bajas y cables de luz, cielo azul muy oscuro, sin personas, sin texto. Tono respetuoso, nada de terror.
- Fondo medio (magenta #FF00FF donde no hay estructura): fachadas con ventanas apagadas, farolas apagadas y un pequeño escenario al fondo.
- Variante: la misma calle **iluminada** por cientos de luciérnagas cálidas y ventanas encendidas.
- Partículas: luciérnaga **realista y sencilla** (un punto de luz cálida con un halo), no un personaje chibi ni una mascota.

## 9. Bloques del suelo (tileset por mundo)

```
[BLOQUE DE ESTILO]
HOJA DE BLOQUES CUADRADOS para un juego de plataformas, todos del mismo tamaño, separados entre sí, vistos de frente, en este orden:
1 suelo con borde superior (césped/remate) · 2 relleno de suelo · 3 plataforma fina que se puede atravesar · 4 pinchos / peligro · 5 bloque decorativo · 6 bloque decorativo alternativo
TEMA: <material del mundo>
```
| Mundo | Material |
|---|---|
| Carmesí | ladrillo rojo con rosas |
| Noche | madera oscura y piedra con musgo, pinchos = estacas |
| Alba | mármol blanco con grietas doradas |
| Psalmos | piedra azul de catedral, plataforma = banco de iglesia |
| Giallo | tablones de escenario amarillos, plataforma = pasarela de tramoya |
| Aurora | ladrillo blanco con hiedra roja |
| Sarajevo | terciopelo lila y madera de escenario; versión de coral |
| Querido… | piedra de castillo verde, plataforma = viga de madera |

---

## 10. Orden recomendado (piloto primero)
1. **Prensa limpia** (§2): `prensa-documento.png`, `prensa-paparazzi.png`, `prensa-reportero.png`
2. **Mundo 1 Carmesí**: 3 enemigos + jefe + fondo lejano y medio + bloques
3. **Mundo 2 Noche**: 3 enemigos + jefe + fondos + bloques
4. **Objetos** (§7) y **poses extra de Pepe** (§6)
5. El resto de mundos, el museo, la Rueda de Prensa y el final VS

Con los pasos 1 y 2 ya puedo construir el **Mundo 1 completo**.
