# Prompts para Gemini o ChatGPT: arte de «ARDE LA TORRE»

Objetivo: que los 4 músicos, los enemigos y los fondos salgan **con el mismo estilo** y que el script (`scripts/slice_sheet.py`, plan §7.1) los recorte y los pixele sin trabajo manual. Es el mismo método que ya funcionó en *México vs. José Madero*.

---

## 0. Cómo usarlos

1. **Primero, la hoja de referencia de cada músico** (§2). Es la imagen más importante: **adjúntala en todas** las peticiones siguientes de ese músico.
2. **Una conversación nueva por hoja.** Así la IA no mezcla personajes.
3. Pega primero el **BLOQUE DE ESTILO (§1)** y después el prompt concreto.
4. Rellena los huecos entre corchetes, como `[PELO]`, mirando **fotos recientes** del músico. Describe rasgos (peinado, barba, gafas, ropa habitual e instrumento): no hace falta subir fotos, y si la IA se niega a dibujar a una persona real, describirla así suele funcionar.
5. Si sale texto, marcos o sombras, contesta: *«Repítelo exactamente igual pero sin ningún texto, sin marcos, sin sombras en el suelo y con fondo gris liso #474747»*.
6. Guarda cada imagen con el nombre indicado y pásamela.

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

## 1. BLOQUE DE ESTILO (pégalo siempre primero)

```
ESTILO: pixel art de beat 'em up arcade de principios de los 90, vista lateral de 3/4 típica del género (el personaje se ve casi de perfil, ligeramente girado hacia la cámara). Personajes caricaturescos pero reconocibles, proporciones heroicas de unas 6 cabezas de alto, contorno oscuro grueso de 1 píxel, sombreado plano de 2 a 3 tonos por color, colores saturados, luz desde arriba a la izquierda. Poses exageradas y con mucha energía (anticipación antes de golpear). Ambientación: rock, escenario, Madrid moderno. Arte 100 % original: NO copies personajes, sprites ni logos de ningún videojuego existente.
FORMATO: fondo gris completamente liso #474747, sin degradado. Sin texto, sin rótulos, sin números, sin flechas, sin marcos, sin cuadrícula y SIN SOMBRA en el suelo. Cada pose separada de las demás con mucho espacio libre. El personaje mide lo mismo en todas las poses y todas se apoyan en la misma línea de suelo. Mira a la DERECHA.
```

---

## 2. Hojas de referencia (una por músico)

### 2A. `ref-antonio.png`: Antonio García (voz y guitarra)
```
[BLOQUE DE ESTILO]
PERSONAJE: caricatura respetuosa de un cantante de rock español de unos 30 años. Pelo: [PELO]. Cara: [BARBA / BIGOTE / GAFAS]. Ropa: [ROPA HABITUAL EN CONCIERTO]. Lleva una guitarra eléctrica [COLOR] colgada a la espalda con la correa cruzada al pecho, y un micrófono en la mano derecha.
HOJA de referencia en 1 fila de 3 poses, todas de pie y en reposo, del mismo tamaño: (1) de perfil mirando a la derecha, (2) de 3/4 mirando a la derecha, (3) de frente.
```

### 2B. `ref-pepe.png`: Pepe Esteban (bajo)
```
[BLOQUE DE ESTILO]
PERSONAJE: caricatura respetuosa de un bajista de rock español de unos 30 años, complexión [COMPLEXIÓN]. Pelo: [PELO]. Cara: [BARBA / GAFAS]. Ropa: [ROPA]. Sostiene un bajo eléctrico [COLOR] con las dos manos, como si fuera un hacha pesada.
HOJA de referencia en 1 fila de 3 poses (perfil, 3/4 y de frente), mirando a la derecha.
```

### 2C. `ref-dani.png`: Dani Sánchez (guitarra), P1
```
[BLOQUE DE ESTILO]
PERSONAJE: caricatura respetuosa de un guitarrista de rock español de unos 30 años, ágil y delgado. Pelo: [PELO]. Cara: [RASGOS]. Ropa: [ROPA]. Guitarra eléctrica [COLOR] en la mano.
HOJA de referencia en 1 fila de 3 poses (perfil, 3/4 y de frente), mirando a la derecha.
```

### 2D. `ref-jota.png`: José Ángel «Jota» Mercader (batería), P1
```
[BLOQUE DE ESTILO]
PERSONAJE: caricatura respetuosa de un batería de rock español de unos 30 años. Pelo: [PELO]. Cara: [RASGOS]. Ropa: [ROPA]. Una baqueta en cada mano, girándolas.
HOJA de referencia en 1 fila de 3 poses (perfil, 3/4 y de frente), mirando a la derecha.
```

---

## 3. Hojas de animación (ejemplo con Antonio; para los demás, cambia el nombre y adjunta su referencia)

> **Adjunta `ref-antonio.png`** y escribe antes de cada prompt: «Usa la imagen adjunta como referencia EXACTA del personaje: misma cara, peinado, ropa, colores e instrumento».

### 3A. `antonio-mov.png`: movimiento
```
[BLOQUE DE ESTILO]
HOJA de exactamente 4 filas, de izquierda a derecha:
Fila 1: QUIETO ×2 (respiración en guardia de pelea, puños arriba, se mueve muy poco entre una pose y otra).
Fila 2: CAMINAR ×4 (ciclo de paso completo).
Fila 3: CORRER ×4 (inclinado hacia delante, zancada larga).
Fila 4: SALTAR ×2 (subiendo con las rodillas recogidas y bajando con las piernas estiradas).
```

### 3B. `antonio-golpes.png`: ataques
```
[BLOQUE DE ESTILO]
HOJA de exactamente 4 filas:
Fila 1: GOLPE 1 ×2 (directo de izquierda: preparación y brazo extendido).
Fila 2: GOLPE 2 ×2 (gancho de derecha: preparación y brazo extendido).
Fila 3: GOLPE 3 ×3 (golpe final con la guitarra: la levanta, la balancea y termina el golpe hacia delante).
Fila 4: PATADA EN EL AIRE ×1, AGARRE ×1 (sujeta con las dos manos a alguien invisible delante) y LANZAMIENTO ×2 (gira y suelta hacia atrás).
```

### 3C. `antonio-dano.png`: daño y especial
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

## 4. Enemigos (empleados ficticios de «Silencio S.A.»)

### 4A. `enemigo-becario.png`
```
[BLOQUE DE ESTILO]
PERSONAJE: becario de oficina joven y desgarbado, camisa blanca arrugada por fuera, corbata gris torcida, acreditación colgada del cuello SIN texto legible, tapones naranjas en los oídos. Expresión nerviosa. Sátira genérica de oficina; no representa a ninguna empresa real.
HOJA de exactamente 3 filas:
Fila 1: QUIETO ×2 y CAMINAR ×4.
Fila 2: GOLPE ×2 (bofetada torpe).
Fila 3: RETROCESO ×1, CAÍDA ×2 y EN EL SUELO ×1.
```

### 4B. `enemigo-comercial.png`
```
[BLOQUE DE ESTILO]
PERSONAJE: comercial agresivo con traje gris brillante, pelo engominado, auriculares inalámbricos y un maletín. Sonrisa falsa.
HOJA de exactamente 3 filas:
Fila 1: QUIETO ×2 y CAMINAR ×4.
Fila 2: EMBESTIDA ×3 (agacha la cabeza, carga con el maletín por delante y frena).
Fila 3: RETROCESO ×1, CAÍDA ×2 y EN EL SUELO ×1.
```

### 4C. `enemigo-guardia.png`
```
[BLOQUE DE ESTILO]
PERSONAJE: guardia de seguridad corpulento con uniforme gris oscuro genérico (sin logos), gorra, pinganillo y un escudo antidisturbios transparente.
HOJA de exactamente 3 filas:
Fila 1: QUIETO CON ESCUDO ×2 y CAMINAR ×4.
Fila 2: BLOQUEAR ×1 (escudo delante, chispa pegada al escudo) y GOLPE CON ESCUDO ×2.
Fila 3: RETROCESO ×1, CAÍDA ×2 y EN EL SUELO ×1.
```

---

## 5. Fondos de los niveles

> Formato distinto: **sin personajes**, una imagen muy ancha. El suelo ocupa el tercio inferior (por ahí se camina).

### 5A. `fondo-parking.png`: Nivel 1
```
Pixel art de fondo para un beat 'em up arcade de principios de los 90, vista lateral con el suelo en perspectiva ocupando el TERCIO INFERIOR. Escena: aparcamiento subterráneo de un rascacielos de oficinas moderno de Madrid, de noche, con columnas de hormigón numeradas con símbolos abstractos (NO letras ni números legibles), luces fluorescentes verdosas, coches genéricos aparcados (sin marcas ni matrículas legibles), barreras de entrada y manchas de aceite. Ambiente tenso pero colorido, con contorno oscuro y sombreado plano. Formato PANORÁMICO muy ancho (proporción 4:1). Sin personajes, sin texto y sin logos.
```

### 5B. `fondo-vestibulo.png`: Nivel 2
```
(mismo encabezado que 5A) Escena: vestíbulo enorme de un rascacielos de oficinas de los años 80, con suelo de mármol pulido, techos muy altos, tornos de acceso de cristal, un mostrador de recepción largo, escaleras mecánicas al fondo y grandes cristaleras con la calle de noche detrás. Sin texto, sin logos y sin personajes. Formato panorámico 4:1.
```

### 5C. `fondo-azotea.png`: Nivel 7 (P1)
```
(mismo encabezado que 5A) Escena: azotea de un rascacielos de Madrid de noche, con un escenario de concierto montado (focos, torres de altavoces y pirotecnia de escenario encendida) y el skyline de Madrid iluminado al fondo, visto desde las alturas. NADA de humo, fuego ni daños en el edificio: el fuego es solo pirotecnia de escenario. Sin texto, sin logos y sin personajes. Formato panorámico 4:1.
```
