# Prompts para Gemini o ChatGPT: arte de «ARDE LA TORRE»

Objetivo: que los 4 músicos, la pantalla de selección, los enemigos y los fondos salgan **con el mismo estilo**, y que el script (`scripts/slice_sheet.py`, plan §7.1) los recorte y los pixele sin trabajo manual. Es el mismo método que ya funcionó en *México vs. José Madero*.

> **v2 (11 nov 2026):** la dirección de arte se afina con las fotos de prensa que pasó el usuario (rock setentero) y se añaden los **retratos de la pantalla de selección** (§5), que es la de los cuatro ascensores.

---

## 0. Cómo usarlos

1. **Primero, completa la tabla de quién es quién (§2).** Las fichas A–D describen a cada músico por su ropa y su pelo, tal como salen en la foto de cuerpo entero (de izquierda a derecha). Claude no identifica a personas por la cara: el usuario pone el nombre de cada uno.
2. **Después, la hoja de referencia de cada músico (§4).** Es la imagen más importante: **adjúntala en todas** las peticiones siguientes de ese músico.
3. **Una conversación nueva por hoja.** Así la IA no mezcla personajes.
4. Pega primero el **BLOQUE DE ESTILO (§3)** y después el prompt concreto.
5. **Sobre las fotos reales:** puedes adjuntar una foto de prensa como referencia de **ropa y peinado**. Si Gemini o ChatGPT se niegan a dibujar a una persona real a partir de su foto, no adjuntes la foto: basta con la descripción de la ficha. En ningún caso se busca un retrato fotográfico, sino una **caricatura arcade respetuosa**.
6. Si sale texto, marcos o sombras, contesta: *«Repítelo exactamente igual pero sin ningún texto, sin marcos, sin sombras en el suelo y con fondo gris liso #474747»*.
7. Guarda cada imagen con el nombre indicado y pásamela.

### Reglas técnicas (por qué importan)

| Regla | Motivo |
|---|---|
| Fondo **gris liso #474747** (sprites) o **magenta #FF00FF** (capas de primer plano) | El script borra el fondo por color |
| **Sin texto, números, marcos ni cuadrícula** | Se recortarían como si fueran parte del sprite |
| **Sin sombra en el suelo** | El juego dibuja su propia sombra |
| Poses **separadas**, sin tocarse | Cada pose se detecta como una figura aparte |
| **Mirando a la derecha** | El juego las voltea |
| **Mismo tamaño y misma línea de suelo** en toda la hoja | El script alinea los pies a una línea base |
| **Exactamente** el número de poses pedido por fila | Así cada fotograma recibe su nombre solo |

---

## 1. Dirección de arte (sale de las fotos de prensa)

| Elemento | Decisión |
|---|---|
| Época | **Rock de los 70** visto con ojos de recreativa de los 90 |
| Ropa | Chaquetas de **ante** color camel, **cuero** negro de motero, polos de **punto** con cuello en contraste, camisas de cuello ancho abiertas, **corbatas y pañuelos estampados**, pantalones de pinza |
| Detalles | **Bigotes**, barbas recortadas, pendientes de **aro**, cinturones con hebilla, un tatuaje de ancla en el antebrazo |
| Paleta de los músicos | Mostaza, camel, granate, azul petróleo, crema y negro cuero. Tonos cálidos y algo desaturados, como una foto de época |
| Contraste con los enemigos | Los empleados de Silencio S.A. van en **grises fríos** y azul corporativo: así los músicos destacan siempre |
| Luz | Cálida y lateral, como de foco de escenario; sombras con un toque morado |

---

## 2. Quién es quién (✅ 11 nov 2026, según la ubicación que dio el usuario en la foto de primer plano)

| Músico | Aspecto (foto de primer plano) |
|---|---|
| **Antonio** (voz y guitarra) | ✅ Sprites hechos (11 nov 2026) a partir de otra foto de referencia: pelo muy corto, barba corta, americana de ante camel, camisa azul claro y corbata estampada. Las imágenes que falten deben seguir este aspecto |
| **Pepe** (bajo) | Arriba a la izquierda: pelo oscuro hacia atrás con volumen, barba recortada y bigote, pendiente largo de aro; chaqueta de cuero negra |
| **Dani** (guitarra) | A la derecha: pelo castaño largo y ondulado hasta los hombros, cara casi afeitada; camisa negra de lunares |
| **Jota** (batería) | Abajo a la izquierda: pelo oscuro con flequillo corto y recto, bigote fino, pequeño aro; camisa negra |

> ⚠️ La ubicación la sacó el usuario de una respuesta de Gemini; conviene que la confirme alguien de la banda. Claude no identifica a personas por la cara.
> Los prompts montados y simplificados están en [`PROMPTS-PARA-COPIAR.md`](PROMPTS-PARA-COPIAR.md) (generados por `scripts/prompts_amigo.py`).

---

## 3. BLOQUE DE ESTILO (pégalo siempre primero)

```
ESTILO: pixel art de beat 'em up arcade de principios de los 90, vista lateral de 3/4 típica del género (el personaje se ve casi de perfil, ligeramente girado hacia la cámara). Personajes caricaturescos pero reconocibles, proporciones heroicas de unas 6 cabezas de alto, contorno oscuro grueso de 1 píxel, sombreado plano de 2 a 3 tonos por color, luz cálida lateral como un foco de escenario y sombras con un toque morado. Estética de banda de rock de los años 70: chaquetas de ante y de cuero, polos de punto, camisas de cuello ancho, pañuelos y corbatas estampadas, bigotes y pendientes de aro. Paleta cálida y algo desaturada (mostaza, camel, granate, azul petróleo, crema y negro). Poses exageradas y con mucha energía (anticipación antes de golpear). Arte 100 % original: NO copies personajes, sprites, logos ni interfaces de ningún videojuego existente.
FORMATO: fondo gris completamente liso #474747, sin degradado. Sin texto, sin rótulos, sin números, sin flechas, sin marcos, sin cuadrícula y SIN SOMBRA en el suelo. Cada pose separada de las demás con mucho espacio libre. El personaje mide lo mismo en todas las poses y todas se apoyan en la misma línea de suelo. Mira a la DERECHA.
```

---

## 4. Hojas de referencia (una por músico)

Sustituye `[FICHA]` por la descripción de su fila del §2 (pelo, cara y ropa) y `[INSTRUMENTO]` por el suyo.

### 4A. `ref-antonio.png`, `ref-pepe.png`, `ref-dani.png`, `ref-jota.png`
```
[BLOQUE DE ESTILO]
PERSONAJE: caricatura respetuosa de un músico de una banda de rock española. [FICHA]. Lleva [INSTRUMENTO: guitarra eléctrica colgada a la espalda y un micrófono en la mano / bajo eléctrico sujeto con las dos manos como un hacha / guitarra eléctrica en la mano / una baqueta en cada mano].
HOJA de referencia en 1 fila de 3 poses, todas de pie y en reposo, del mismo tamaño: (1) de perfil mirando a la derecha, (2) de 3/4 mirando a la derecha, (3) de frente.
```

**Pistas por instrumento** (para que se lean bien a 72 px de alto):
- **Voz y guitarra:** micrófono plateado bien visible en la mano de delante; guitarra roja a la espalda, en diagonal.
- **Bajo:** bajo largo de color sunburst; se sujeta bajo, a la altura de la cadera.
- **Guitarra:** guitarra clara (crema o blanca), que contraste con la ropa.
- **Batería:** baquetas de madera clara, algo más largas de lo real para que se vean.

---

## 5. ⭐ Retratos para la pantalla de selección (los cuatro ascensores)

En el juego, cada jugador que se une abre las puertas de un ascensor y aparece su músico en grande. Hacen falta **2 retratos por músico**: uno en espera y otro «¡listo!».

> **Adjunta la hoja de referencia del músico** y escribe antes: «Usa la imagen adjunta como referencia EXACTA del personaje: misma cara, peinado, ropa y colores».

### 5A. `retrato-antonio.png` (y lo mismo con cada músico)
```
Retrato en pixel art de busto (cabeza y hombros) del personaje de la imagen adjunta, para la pantalla de selección de personaje de un beat 'em up arcade de principios de los 90. Vista de 3/4 mirando a la DERECHA, mirada intensa y segura hacia el espectador, expresión de «vamos allá». Iluminación dramática: luz cálida de foco desde abajo a la izquierda y contraluz morado, como dentro de la cabina de un ascensor antiguo de madera y latón. Mucho detalle en la cara, el pelo y el cuello de la ropa, contorno oscuro grueso, sombreado de 3 a 4 tonos por color. Formato CUADRADO 1:1, el busto ocupa casi todo el cuadro. Fondo gris completamente liso #474747. Sin texto, sin marcos y sin logos. Arte original: no imites la pantalla de selección de ningún videojuego existente.
```

### 5B. `retrato-antonio-listo.png`
```
Exactamente el mismo retrato de la imagen adjunta (mismo encuadre, tamaño, luz y fondo), pero con el personaje gritando de alegría con la boca abierta y el puño (o el instrumento) asomando por abajo, como si acabara de elegirse. Fondo gris liso #474747, sin texto.
```

**Recorte** (lo hago yo cuando me pases los retratos): se escalan a 48×48 px con paleta fija de 24 colores y sustituyen al retrato provisional de la cabina (`render/screens.js`) y del marcador.

---

## 6. Pantalla de título (opcional)

### 6A. `titulo-fondo.png`
```
Ilustración en pixel art para la pantalla de título de un videojuego arcade de los 90: un rascacielos de oficinas blanco de los años 80 con franjas verticales y arcos en la base, de noche, visto desde abajo en contrapicado; en la azotea, un escenario de concierto con focos y pirotecnia de escenario. Cielo de morado a rojo, skyline de Madrid en silueta con ventanas encendidas. Paleta cálida y algo desaturada. Formato PANORÁMICO 16:9. Deja libre la franja superior para el título. NADA de fuego, humo ni daños en el edificio: el fuego es solo pirotecnia del escenario. Sin texto, sin logos y sin personajes.
```

---

## 7. Hojas de animación (ejemplo con Antonio; para los demás, cambia el nombre y adjunta su referencia)

> **Adjunta `ref-antonio.png`** y escribe antes de cada prompt: «Usa la imagen adjunta como referencia EXACTA del personaje: misma cara, peinado, ropa, colores e instrumento».

### 7A. `antonio-mov.png`: movimiento
```
[BLOQUE DE ESTILO]
HOJA de exactamente 4 filas, de izquierda a derecha:
Fila 1: QUIETO ×2 (respiración en guardia de pelea, puños arriba, se mueve muy poco entre una pose y otra).
Fila 2: CAMINAR ×4 (ciclo de paso completo).
Fila 3: CORRER ×4 (inclinado hacia delante, zancada larga).
Fila 4: SALTAR ×2 (subiendo con las rodillas recogidas y bajando con las piernas estiradas).
```

### 7B. `antonio-golpes.png`: ataques
```
[BLOQUE DE ESTILO]
HOJA de exactamente 4 filas:
Fila 1: GOLPE 1 ×2 (directo de izquierda: preparación y brazo extendido).
Fila 2: GOLPE 2 ×2 (gancho de derecha: preparación y brazo extendido).
Fila 3: GOLPE 3 ×3 (golpe final con la guitarra: la levanta, la balancea y termina el golpe hacia delante).
Fila 4: PATADA EN EL AIRE ×1, AGARRE ×1 (sujeta con las dos manos a alguien invisible delante) y LANZAMIENTO ×2 (gira y suelta hacia atrás).
```

### 7C. `antonio-dano.png`: daño y especial
```
[BLOQUE DE ESTILO]
HOJA de exactamente 4 filas:
Fila 1: RETROCESO ×1 (golpeado en la cara, echado hacia atrás) y CAÍDA ×2 (sale despedido hacia atrás, en el aire y llegando al suelo).
Fila 2: EN EL SUELO ×1 (tumbado boca arriba) y LEVANTARSE ×2.
Fila 3: ESPECIAL «GRITO» ×4 (coge aire, grita al micrófono con la boca muy abierta y con ondas de sonido pegadas al micrófono; las ondas NO se separan del cuerpo).
Fila 4: VICTORIA ×2 (guitarra en alto) y RETRATO ×1 (solo la cabeza de frente, sonriendo con confianza, para el marcador).
```

**Recorte** (lo hago yo cuando me pases la hoja):
```
python3 -I scripts/slice_sheet.py art/source/antonio-mov.png antonio 72 2,4,4,2 idle:2,walk:4,run:4,jump:2
```

---


## 8. Enemigos (empleados ficticios de «Silencio S.A.»)

### 8A. `enemigo-becario.png`
```
[BLOQUE DE ESTILO]
PERSONAJE: becario de oficina joven y desgarbado, camisa blanca arrugada por fuera, corbata gris torcida, acreditación colgada del cuello SIN texto legible, tapones naranjas en los oídos. Expresión nerviosa. Sátira genérica de oficina; no representa a ninguna empresa real.
HOJA de exactamente 3 filas:
Fila 1: QUIETO ×2 y CAMINAR ×4.
Fila 2: GOLPE ×2 (bofetada torpe).
Fila 3: RETROCESO ×1, CAÍDA ×2 y EN EL SUELO ×1.
```

### 8B. `enemigo-comercial.png`
```
[BLOQUE DE ESTILO]
PERSONAJE: comercial agresivo con traje gris brillante, pelo engominado, auriculares inalámbricos y un maletín. Sonrisa falsa.
HOJA de exactamente 3 filas:
Fila 1: QUIETO ×2 y CAMINAR ×4.
Fila 2: EMBESTIDA ×3 (agacha la cabeza, carga con el maletín por delante y frena).
Fila 3: RETROCESO ×1, CAÍDA ×2 y EN EL SUELO ×1.
```

### 8C. `enemigo-guardia.png`
```
[BLOQUE DE ESTILO]
PERSONAJE: guardia de seguridad corpulento con uniforme gris oscuro genérico (sin logos), gorra, pinganillo y un escudo antidisturbios transparente.
HOJA de exactamente 3 filas:
Fila 1: QUIETO CON ESCUDO ×2 y CAMINAR ×4.
Fila 2: BLOQUEAR ×1 (escudo delante, chispa pegada al escudo) y GOLPE CON ESCUDO ×2.
Fila 3: RETROCESO ×1, CAÍDA ×2 y EN EL SUELO ×1.
```

---

## 9. Fondos de los niveles

> Formato distinto: **sin personajes**, una imagen muy ancha. El suelo ocupa el tercio inferior (por ahí se camina).

### 9A. `fondo-parking.png`: Nivel 1
```
Pixel art de fondo para un beat 'em up arcade de principios de los 90, vista lateral con el suelo en perspectiva ocupando el TERCIO INFERIOR. Escena: aparcamiento subterráneo de un rascacielos de oficinas moderno de Madrid, de noche, con columnas de hormigón numeradas con símbolos abstractos (NO letras ni números legibles), luces fluorescentes verdosas, coches genéricos aparcados (sin marcas ni matrículas legibles), barreras de entrada y manchas de aceite. Ambiente tenso pero colorido, con contorno oscuro y sombreado plano. Formato PANORÁMICO muy ancho (proporción 4:1). Sin personajes, sin texto y sin logos.
```

### 9B. `fondo-vestibulo.png`: Nivel 2
```
(mismo encabezado que 9A) Escena: vestíbulo enorme de un rascacielos de oficinas de los años 80, con suelo de mármol pulido, techos muy altos, tornos de acceso de cristal, un mostrador de recepción largo, escaleras mecánicas al fondo y grandes cristaleras con la calle de noche detrás. Sin texto, sin logos y sin personajes. Formato panorámico 4:1.
```

### 9C. `fondo-azotea.png`: Nivel 5
```
(mismo encabezado que 9A) Escena: azotea de un rascacielos de Madrid de noche, con un escenario de concierto montado (focos, torres de altavoces y pirotecnia de escenario encendida) y el skyline de Madrid iluminado al fondo, visto desde las alturas. NADA de humo, fuego ni daños en el edificio: el fuego es solo pirotecnia de escenario. Sin texto, sin logos y sin personajes. Formato panorámico 4:1.
```
