# Sprites de los 4 músicos: hojas completas para Gemini o ChatGPT

Salen del diseño de personajes de la spec (§3.1, F14). Cada músico necesita **4 hojas**:

| Hoja | Contenido | Fotogramas |
|---|---|---|
| 1 · Movimiento | Quieto, caminar, correr y saltar | 12 (Dani: 14) |
| 2 · Combo y agarres | Su combo, patada aérea, agarre, rodillazo y lanzamiento | 13–15 |
| 3 · Daño y especial | Retroceso, caída, suelo, levantarse y su especial | 10 |
| 4 · Firma, SÚPER y victoria | Golpe de firma, SÚPER, victoria y retrato | 11–12 |

Unos **48 fotogramas por músico**. A 72 px de alto con «animación limitada», como las recreativas.

## Cómo pedirlas

1. Antes, la **hoja de referencia** del músico (`PROMPTS-GEMINI.md` §4) y la tabla de **quién es quién** (§2) rellena.
2. **Una conversación nueva por hoja.** Adjunta siempre la referencia del músico y escribe primero:
   > Usa la imagen adjunta como referencia EXACTA del personaje: misma cara, peinado, ropa, colores e instrumento.
3. Pega el **BLOQUE DE ESTILO** (`PROMPTS-GEMINI.md` §3) y después el texto de la hoja.
4. Pide **exactamente** el número de poses por fila. Si salen de más o de menos, contesta: *«Repítelo con exactamente N poses en la fila X»*.
5. Guarda con el nombre indicado y pásamelas. Las recorto y meto en el juego yo.

`[FICHA]` = la descripción de su fila en la tabla de quién es quién (pelo, cara y ropa).

---

## Hoja 1 · Movimiento (igual para los cuatro; cambia el nombre del archivo)

`antonio-1-mov.png` · `pepe-1-mov.png` · `dani-1-mov.png` · `jota-1-mov.png`
```
[BLOQUE DE ESTILO]
PERSONAJE: [FICHA], con su instrumento como en la referencia.
HOJA de exactamente 4 filas, de izquierda a derecha:
Fila 1: QUIETO ×2 (en guardia de pelea, respirando; se mueve muy poco entre las dos poses).
Fila 2: CAMINAR ×4 (ciclo de paso completo).
Fila 3: CORRER ×4 (inclinado hacia delante, zancada larga).
Fila 4: SALTAR ×2 (subiendo con las rodillas recogidas; bajando con las piernas estiradas).
```
**Solo Dani** añade al final de la fila 4: `y DOBLE SALTO ×2 (voltereta hacia delante en el aire, hecho una bola).`

---

## ANTONIO · El Frontman (voz y guitarra)

Instrumento: guitarra **roja** a la espalda y **micrófono plateado con cable** en la mano.

### `antonio-2-combo.png`
```
[BLOQUE DE ESTILO]
PERSONAJE: [FICHA], guitarra roja a la espalda y micrófono con cable en la mano de delante.
HOJA de exactamente 4 filas:
Fila 1: DIRECTO ×2 (preparación y brazo de delante extendido, con el micro en el puño).
Fila 2: GANCHO ×2 (preparación y gancho con el otro brazo).
Fila 3: GUITARRAZO ×3 (descuelga la guitarra, la levanta por el mástil y la baja hacia delante como un hacha).
Fila 4: PATADA EN EL AIRE ×1, AGARRE ×1 (sujeta con las dos manos a alguien invisible delante), RODILLAZO ×1 y LANZAMIENTO ×2 (gira y suelta hacia atrás).
```

### `antonio-3-dano.png`
```
[BLOQUE DE ESTILO]
PERSONAJE: [FICHA], guitarra roja a la espalda y micrófono en la mano.
HOJA de exactamente 4 filas:
Fila 1: RETROCESO ×1 (golpeado en la cara) y CAÍDA ×2 (despedido hacia atrás: en el aire y llegando al suelo).
Fila 2: EN EL SUELO ×1 (boca arriba) y LEVANTARSE ×2.
Fila 3: ESPECIAL «GRITO» ×4 (coge aire; se acerca el micro; grita con la boca muy abierta; ondas de sonido en arco PEGADAS al micro, sin separarse del cuerpo).
Fila 4: (vacía; no dibujes nada)
```

### `antonio-4-super.png`
```
[BLOQUE DE ESTILO]
PERSONAJE: [FICHA], guitarra roja y micrófono con cable.
HOJA de exactamente 4 filas:
Fila 1: LATIGAZO DE MICRO ×3 (lanza el micro hacia delante por el cable como un lazo; el cable estirado al máximo; tira de él hacia sí).
Fila 2: SÚPER «HIMNO» ×4 (sube a un pie con el micro en alto; señala al público; canta con el puño cerrado; brazos abiertos en cruz con la cabeza hacia atrás).
Fila 3: VICTORIA ×2 (guitarra en alto con una mano; micro en la otra).
Fila 4: RETRATO ×1 (solo la cabeza de frente, sonriendo con confianza).
```

---

## PEPE · El Muro (bajo)

Instrumento: **bajo largo sunburst**, sujeto bajo, a la altura de la cadera, como un hacha. Es el más ancho y pesado de los cuatro.

### `pepe-2-combo.png`
```
[BLOQUE DE ESTILO]
PERSONAJE: [FICHA], corpulento, con un bajo eléctrico largo color sunburst sujeto con las dos manos.
HOJA de exactamente 4 filas:
Fila 1: CODAZO ×2 (preparación y codazo hacia delante).
Fila 2: RODILLA ×2 (preparación y rodillazo alto).
Fila 3: BAJAZO ×3 (levanta el bajo por encima de la cabeza, lo baja con todo su peso y el cuerpo del bajo golpea el suelo delante).
Fila 4: PATADA EN EL AIRE ×1, AGARRE ×1 (levanta del cuello de la camisa a alguien invisible), RODILLAZO ×1 y LANZAMIENTO ×2 (lo levanta por encima de la cabeza y lo lanza hacia delante).
```

### `pepe-3-dano.png`
```
[BLOQUE DE ESTILO]
PERSONAJE: [FICHA], corpulento, con su bajo sunburst.
HOJA de exactamente 4 filas:
Fila 1: RETROCESO ×1 (apenas se mueve: aprieta los dientes) y CAÍDA ×2.
Fila 2: EN EL SUELO ×1 y LEVANTARSE ×2.
Fila 3: ESPECIAL «BAJO AL SUELO» ×4 (levanta el bajo con las dos manos; salta un poco; clava el bajo en el suelo; grietas cortas en el suelo a los dos lados, PEGADAS al bajo).
Fila 4: (vacía)
```

### `pepe-4-super.png`
```
[BLOQUE DE ESTILO]
PERSONAJE: [FICHA], corpulento, con su bajo sunburst.
HOJA de exactamente 4 filas:
Fila 1: PLACAJE ×3 (agacha el hombro; carga hacia delante con el bajo cruzado delante del pecho; frena).
Fila 2: SÚPER «TERREMOTO DE GRAVES» ×4 (toca una nota grave con todo el brazo; el bajo vibra con líneas de movimiento; pisotón; pose de fuerza con el bajo en alto).
Fila 3: VICTORIA ×2 (bajo apoyado en el hombro; puño en alto).
Fila 4: RETRATO ×1 (cabeza de frente, media sonrisa tranquila).
```

---

## DANI · El Relámpago (guitarra)

Instrumento: guitarra **crema o blanca**. Es el más ágil: poses estiradas y mucho movimiento.

### `dani-2-combo.png`
```
[BLOQUE DE ESTILO]
PERSONAJE: [FICHA], delgado y ágil, con una guitarra eléctrica de color crema.
HOJA de exactamente 4 filas:
Fila 1: GOLPE RÁPIDO 1 ×2 y GOLPE RÁPIDO 2 ×2 (dos golpes cortos con el puño, muy rápidos).
Fila 2: PATADA ×2 (patada frontal alta).
Fila 3: BARRIDO ×3 (gira sobre sí mismo y barre hacia delante con el cuerpo de la guitarra).
Fila 4: PATADA EN EL AIRE ×1, AGARRE ×1, RODILLAZO ×1 y LANZAMIENTO ×2.
```

### `dani-3-dano.png`
```
[BLOQUE DE ESTILO]
PERSONAJE: [FICHA], delgado, con su guitarra crema.
HOJA de exactamente 4 filas:
Fila 1: RETROCESO ×1 y CAÍDA ×2.
Fila 2: EN EL SUELO ×1 y LEVANTARSE ×2 (se levanta de un salto, con impulso de las manos).
Fila 3: ESPECIAL «SOLO» ×4 (gira sobre un pie con la guitarra extendida: de frente, de perfil, de espaldas y de perfil otra vez; estelas de movimiento PEGADAS a la guitarra).
Fila 4: (vacía)
```

### `dani-4-super.png`
```
[BLOQUE DE ESTILO]
PERSONAJE: [FICHA], delgado, con su guitarra crema.
HOJA de exactamente 4 filas:
Fila 1: DESLIZAMIENTO ×3 (se tira al suelo deslizándose de lado con un pie por delante; se levanta).
Fila 2: SÚPER «SOLO ETERNO» ×4 (de rodillas tocando la guitarra hacia arriba; tocando muy rápido con la mano borrosa; guitarra apuntando hacia delante; pose final con el mástil al cielo). Pequeñas chispas eléctricas PEGADAS a las cuerdas.
Fila 3: VICTORIA ×2 (guitarra a la espalda; señala al frente con dos dedos).
Fila 4: RETRATO ×1 (cabeza de frente, sonrisa pícara).
```
**Proyectil del SÚPER** (archivo aparte, `dani-nota.png`): `Una nota musical con forma de rayo, amarilla y blanca, pixel art, 3 poses de animación en una fila, fondo gris liso #474747, sin texto.`

---

## JOTA · El Metrónomo (batería)

Instrumento: **dos baquetas** de madera clara, algo más largas de lo real.

### `jota-2-combo.png`
```
[BLOQUE DE ESTILO]
PERSONAJE: [FICHA], con una baqueta de madera clara en cada mano (algo más largas de lo normal).
HOJA de exactamente 4 filas:
Fila 1: BAQUETAZO 1 ×2 (golpe hacia delante con la baqueta derecha).
Fila 2: BAQUETAZO 2 ×2 (golpe con la izquierda).
Fila 3: DOBLE GOLPE ×3 (levanta las dos baquetas por encima de la cabeza y golpea hacia delante con las dos a la vez).
Fila 4: PATADA EN EL AIRE ×1, AGARRE ×1, RODILLAZO ×1 y LANZAMIENTO ×2.
```

### `jota-3-dano.png`
```
[BLOQUE DE ESTILO]
PERSONAJE: [FICHA], con sus dos baquetas.
HOJA de exactamente 4 filas:
Fila 1: RETROCESO ×1 y CAÍDA ×2.
Fila 2: EN EL SUELO ×1 y LEVANTARSE ×2.
Fila 3: ESPECIAL «REDOBLE» ×4 (golpes alternos muy rápidos hacia delante, brazos borrosos; pequeñas líneas de impacto PEGADAS a las puntas de las baquetas).
Fila 4: (vacía)
```

### `jota-4-super.png`
```
[BLOQUE DE ESTILO]
PERSONAJE: [FICHA], con sus dos baquetas.
HOJA de exactamente 4 filas:
Fila 1: BAQUETA VOLADORA ×3 (echa el brazo atrás; lanza la baqueta girando; recoge la baqueta que vuelve).
Fila 2: SÚPER «SOLO DE BATERÍA» ×4 sentado a una batería pequeña (bombo, caja y un plato) que aparece delante de él: golpe al bombo, golpe a la caja, golpe al plato y pose final con las baquetas cruzadas en alto.
Fila 3: VICTORIA ×2 (hace girar una baqueta entre los dedos; la lanza al aire).
Fila 4: RETRATO ×1 (cabeza de frente, concentrado, con una baqueta en la boca o detrás de la oreja).
```

---

## Potenciadores y armas (una hoja)

`objetos.png`
```
Hoja de objetos en pixel art para un beat 'em up arcade de los 90, contorno oscuro grueso, sombreado plano, estilo cálido setentero. Cada objeto pequeño y bien legible, separados entre sí, en una sola fila, de izquierda a derecha: bocadillo de calamares, taza de café para llevar sin logo, púa de guitarra dorada, hoja de setlist escrita con garabatos ilegibles, amplificador pequeño portátil, pedal de efectos de guitarra rojo, púa de guitarra con un trébol, pase de backstage con cordón (sin texto legible), grapadora, extintor, silla de oficina con ruedas y pie de micrófono. Fondo gris completamente liso #474747. Sin texto legible, sin marcas ni logos.
```

---

## Qué hago yo cuando me las pases

1. Las recorto con `scripts/slice_sheet.py` (fondo fuera, pies alineados, 72 px de alto, 24 colores por músico).
2. Las uno en un atlas y sustituyo los sprites provisionales del juego, animación a animación.
3. Te mando capturas para revisar y, si algo tiembla o no encaja, te digo qué pose repetir.
