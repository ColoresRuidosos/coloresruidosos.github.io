# Genera los prompts montados (listos para copiar) para quien ayude con el arte:
#   art/PROMPTS-PARA-COPIAR.md  y  dist/prompts.html (página con botón «Copiar» en cada prompt)
# Uso: python3 -I scripts/prompts_amigo.py
import html, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FORMATO = ("FORMATO: fondo gris completamente liso #474747, sin degradado. Sin texto, sin rótulos, sin números, sin flechas, "
           "sin marcos, sin cuadrícula y SIN SOMBRA en el suelo. Cada pose separada de las demás con mucho espacio libre. "
           "El personaje mide lo mismo en todas las poses y todas se apoyan en la misma línea de suelo. Mira a la DERECHA.")
BASE = ("ESTILO: pixel art de beat 'em up arcade de principios de los 90, vista lateral de 3/4 típica del género (el personaje "
        "se ve casi de perfil, ligeramente girado hacia la cámara). Personajes caricaturescos pero reconocibles, proporciones "
        "heroicas de unas 6 cabezas de alto, contorno oscuro grueso de 1 píxel, sombreado plano de 2 a 3 tonos por color, luz "
        "cálida lateral como un foco de escenario y sombras con un toque morado. Poses exageradas y con mucha energía "
        "(anticipación antes de golpear). Arte 100 % original: NO copies personajes, sprites, logos ni interfaces de ningún "
        "videojuego existente.")
BANDA = (" Estética de banda de rock de los años 70: chaquetas de ante y de cuero, polos de punto, camisas de cuello ancho, "
         "pañuelos y corbatas estampadas, bigotes y pendientes de aro. Paleta cálida y algo desaturada (mostaza, camel, "
         "granate, azul petróleo, crema y negro).")
OFICINA = (" Son empleados caricaturescos de una empresa inventada (sátira genérica de oficina, sin logos ni marcas reales), "
           "vestidos en grises fríos y azul corporativo para que contrasten con los héroes.")
REF = "Usa la imagen adjunta como referencia EXACTA del personaje: misma cara, peinado, ropa, colores e instrumento."

def banda(txt): return f"{REF}\n\n{BASE}{BANDA}\n{FORMATO}\n\n{txt}"
def oficina(txt): return f"{BASE}{OFICINA}\n{FORMATO}\n\n{txt}"


MOV = ("HOJA de exactamente 4 filas, de izquierda a derecha:\n"
       "Fila 1: QUIETO ×2 (en guardia de pelea, respirando; se mueve muy poco entre las dos poses).\n"
       "Fila 2: CAMINAR ×4 (ciclo de paso completo).\n"
       "Fila 3: CORRER ×4 (inclinado hacia delante, zancada larga).\n"
       "Fila 4: SALTAR ×2 (subiendo con las rodillas recogidas; bajando con las piernas estiradas){extra}.")

MUSICOS = [
  dict(id="antonio", look="pelo rizado oscuro, barba de pocos días, alto; polo negro con ribete blanco en el cuello y cuello en pico, y un pequeño tatuaje de ancla en el brazo", nombre="Antonio", apodo="El Frontman", papel="voz y guitarra",
       inst="una guitarra eléctrica roja colgada a la espalda en diagonal y un micrófono plateado con cable en la mano de delante",
       combo=("Fila 1: DIRECTO ×2 (preparación y brazo de delante extendido, con el micro en el puño).\n"
              "Fila 2: GANCHO ×2 (preparación y gancho con el otro brazo).\n"
              "Fila 3: GUITARRAZO ×3 (descuelga la guitarra, la levanta por el mástil y la baja hacia delante como un hacha).\n"
              "Fila 4: PATADA EN EL AIRE ×1, AGARRE ×1 (sujeta con las dos manos a alguien invisible delante), RODILLAZO ×1 y LANZAMIENTO ×2 (gira y suelta hacia atrás)."),
       esp=("Fila 3: ESPECIAL «GRITO» ×4 (coge aire; se acerca el micro; grita con la boca muy abierta; ondas de sonido en arco PEGADAS al micro, sin separarse del cuerpo)."),
       sup=("Fila 1: LATIGAZO DE MICRO ×3 (lanza el micro hacia delante por el cable como un lazo; el cable estirado al máximo; tira de él hacia sí).\n"
            "Fila 2: SÚPER «HIMNO» ×4 (sube a un pie con el micro en alto; señala al público; canta con el puño cerrado; brazos abiertos en cruz con la cabeza hacia atrás).\n"
            "Fila 3: VICTORIA ×2 (guitarra en alto con una mano; micro en la otra).\n"
            "Fila 4: RETRATO ×1 (solo la cabeza de frente, sonriendo con confianza)."),
       cara="mirada intensa y segura, media sonrisa de líder", listo="cantando a pleno pulmón con el micro pegado a la boca"),
  dict(id="pepe", look="pelo oscuro peinado hacia atrás con volumen, barba recortada y bigote, un pendiente largo de aro; chaqueta de cuero negra", nombre="Pepe", apodo="El Muro", papel="bajo",
       inst="un bajo eléctrico largo color sunburst sujeto con las dos manos a la altura de la cadera, como un hacha; es el más ancho y corpulento de los cuatro",
       combo=("Fila 1: CODAZO ×2 (preparación y codazo hacia delante).\n"
              "Fila 2: RODILLA ×2 (preparación y rodillazo alto).\n"
              "Fila 3: BAJAZO ×3 (levanta el bajo por encima de la cabeza, lo baja con todo su peso y el cuerpo del bajo golpea el suelo delante).\n"
              "Fila 4: PATADA EN EL AIRE ×1, AGARRE ×1 (levanta del cuello de la camisa a alguien invisible), RODILLAZO ×1 y LANZAMIENTO ×2 (lo levanta por encima de la cabeza y lo lanza hacia delante)."),
       esp=("Fila 3: ESPECIAL «BAJO AL SUELO» ×4 (levanta el bajo con las dos manos; salta un poco; clava el bajo en el suelo; grietas cortas en el suelo a los dos lados, PEGADAS al bajo)."),
       sup=("Fila 1: PLACAJE ×3 (agacha el hombro; carga hacia delante con el bajo cruzado delante del pecho; frena).\n"
            "Fila 2: SÚPER «TERREMOTO DE GRAVES» ×4 (toca una nota grave con todo el brazo; el bajo vibra con líneas de movimiento; pisotón; pose de fuerza con el bajo en alto).\n"
            "Fila 3: VICTORIA ×2 (bajo apoyado en el hombro; puño en alto).\n"
            "Fila 4: RETRATO ×1 (cabeza de frente, media sonrisa tranquila)."),
       cara="mirada tranquila e imponente, como una pared", listo="rugiendo con el bajo levantado por encima del hombro"),
  dict(id="dani", look="pelo castaño largo y ondulado hasta los hombros, cara casi afeitada y cejas marcadas; camisa negra con lunares", nombre="Dani", apodo="El Relámpago", papel="guitarra",
       inst="una guitarra eléctrica color crema en la mano; es el más delgado y ágil de los cuatro, con poses muy estiradas",
       combo=("Fila 1: GOLPE RÁPIDO 1 ×2 y GOLPE RÁPIDO 2 ×2 (dos golpes cortos con el puño, muy rápidos).\n"
              "Fila 2: PATADA ×2 (patada frontal alta).\n"
              "Fila 3: BARRIDO ×3 (gira sobre sí mismo y barre hacia delante con el cuerpo de la guitarra).\n"
              "Fila 4: PATADA EN EL AIRE ×1, AGARRE ×1, RODILLAZO ×1 y LANZAMIENTO ×2."),
       esp=("Fila 3: ESPECIAL «SOLO» ×4 (gira sobre un pie con la guitarra extendida: de frente, de perfil, de espaldas y de perfil otra vez; estelas de movimiento PEGADAS a la guitarra)."),
       sup=("Fila 1: DESLIZAMIENTO ×3 (se tira al suelo deslizándose de lado con un pie por delante; se levanta).\n"
            "Fila 2: SÚPER «SOLO ETERNO» ×4 (de rodillas tocando la guitarra hacia arriba; tocando muy rápido con la mano borrosa; guitarra apuntando hacia delante; pose final con el mástil al cielo). Pequeñas chispas eléctricas PEGADAS a las cuerdas.\n"
            "Fila 3: VICTORIA ×2 (guitarra a la espalda; señala al frente con dos dedos).\n"
            "Fila 4: RETRATO ×1 (cabeza de frente, sonrisa pícara)."),
       cara="sonrisa pícara y mirada rápida", listo="saltando con la guitarra en alto y un dedo señalando al frente",
       extra=" y DOBLE SALTO ×2 (voltereta hacia delante en el aire, hecho una bola)"),
  dict(id="jota", look="pelo oscuro con flequillo corto y recto, bigote fino y barba de pocos días, un pequeño aro en la oreja; camisa negra", nombre="Jota", apodo="El Metrónomo", papel="batería",
       inst="una baqueta de madera clara en cada mano, algo más largas de lo normal para que se vean bien",
       combo=("Fila 1: BAQUETAZO 1 ×2 (golpe hacia delante con la baqueta derecha).\n"
              "Fila 2: BAQUETAZO 2 ×2 (golpe con la izquierda).\n"
              "Fila 3: DOBLE GOLPE ×3 (levanta las dos baquetas por encima de la cabeza y golpea hacia delante con las dos a la vez).\n"
              "Fila 4: PATADA EN EL AIRE ×1, AGARRE ×1, RODILLAZO ×1 y LANZAMIENTO ×2."),
       esp=("Fila 3: ESPECIAL «REDOBLE» ×4 (golpes alternos muy rápidos hacia delante, brazos borrosos; pequeñas líneas de impacto PEGADAS a las puntas de las baquetas)."),
       sup=("Fila 1: BAQUETA VOLADORA ×3 (echa el brazo atrás; lanza la baqueta girando; recoge la baqueta que vuelve).\n"
            "Fila 2: SÚPER «SOLO DE BATERÍA» ×4 sentado a una batería pequeña (bombo, caja y un plato) que aparece delante de él: golpe al bombo, golpe a la caja, golpe al plato y pose final con las baquetas cruzadas en alto.\n"
            "Fila 3: VICTORIA ×2 (hace girar una baqueta entre los dedos; la lanza al aire).\n"
            "Fila 4: RETRATO ×1 (cabeza de frente, concentrado, con una baqueta detrás de la oreja)."),
       cara="concentrado, llevando el ritmo con la cabeza", listo="haciendo girar las baquetas con una sonrisa enorme"),
]

def musico_prompts(m):
    p = []
    SUBE1 = f"Sube la imagen {m['id']}-1 y después pega esto"
    p.append((f"{m['id']}-1.png", "NO subas ninguna imagen. Solo copia y pega",
              f"{BASE}{BANDA}\n{FORMATO}\n\n"
              f"PERSONAJE: caricatura respetuosa de un músico de una banda de rock española ({m['papel']}). "
              f"Aspecto: {m['look']}. Lleva {m['inst']}.\n"
              "HOJA de referencia en 1 fila de 3 poses, todas de pie y en reposo, del mismo tamaño: (1) de perfil mirando a la derecha, (2) de 3/4 mirando a la derecha, (3) de frente.",
              True))
    p.append((f"{m['id']}-2.png", SUBE1,
              banda(f"PERSONAJE: el de la imagen adjunta, con {m['inst']}.\n" + MOV.format(extra=m.get('extra', ''))), False))
    p.append((f"{m['id']}-3.png", SUBE1,
              banda(f"PERSONAJE: el de la imagen adjunta, con {m['inst']}.\nHOJA de exactamente 4 filas:\n{m['combo']}"), False))
    p.append((f"{m['id']}-4.png", SUBE1,
              banda(f"PERSONAJE: el de la imagen adjunta, con {m['inst']}.\nHOJA de exactamente 4 filas:\n"
                    "Fila 1: RETROCESO ×1 (golpeado en la cara, echado hacia atrás) y CAÍDA ×2 (despedido hacia atrás: en el aire y llegando al suelo).\n"
                    "Fila 2: EN EL SUELO ×1 (tumbado boca arriba) y LEVANTARSE ×2.\n"
                    f"{m['esp']}\nFila 4: vacía, no dibujes nada."), False))
    p.append((f"{m['id']}-5.png", SUBE1,
              banda(f"PERSONAJE: el de la imagen adjunta, con {m['inst']}.\nHOJA de exactamente 4 filas:\n{m['sup']}"), False))
    p.append((f"{m['id']}-6.png", SUBE1,
              f"{REF}\n\nRetrato en pixel art de busto (cabeza y hombros) del personaje de la imagen adjunta, para la pantalla de selección "
              "de personaje de un beat 'em up arcade de principios de los 90. Vista de 3/4 mirando a la DERECHA, "
              f"{m['cara']}. Iluminación dramática: luz cálida de foco desde abajo a la izquierda y contraluz morado, como dentro "
              "de la cabina de un ascensor antiguo de madera y latón. Mucho detalle en la cara, el pelo y el cuello de la ropa, "
              "contorno oscuro grueso, sombreado de 3 a 4 tonos por color. Formato CUADRADO 1:1, el busto ocupa casi todo el cuadro. "
              "Fondo gris completamente liso #474747. Sin texto, sin marcos y sin logos. Arte original: no imites la pantalla de "
              "selección de ningún videojuego existente.", False))
    p.append((f"{m['id']}-7.png", f"Sube la imagen {m['id']}-6 y después pega esto",
              "Usa la imagen adjunta (el retrato) como referencia EXACTA.\n\n"
              f"Exactamente el mismo retrato (mismo encuadre, tamaño, luz y fondo), pero con el personaje {m['listo']}, como si "
              "acabara de ser elegido. Fondo gris liso #474747, sin texto.", False))
    if m['id'] == 'dani':
        p.append(("dani-8.png", "NO subas ninguna imagen. Solo copia y pega",
                  "Una nota musical con forma de rayo, amarilla y blanca, en pixel art de arcade de los 90 con contorno oscuro grueso. "
                  "3 poses de animación en una fila (brillando un poco más en cada una), separadas entre sí. Fondo gris completamente "
                  "liso #474747. Sin texto.", False))
    return p

ENEMIGOS = [
  ("becario", "Becario", "becario joven y desgarbado, camisa blanca arrugada por fuera, corbata gris torcida, acreditación colgada del cuello SIN texto legible y tapones naranjas en los oídos; expresión nerviosa",
   "Fila 1: QUIETO ×2 y CAMINAR ×4.\nFila 2: BOFETADA ×2 (torpe, preparación y golpe).\nFila 3: RETROCESO ×1, CAÍDA ×2 y EN EL SUELO ×1."),
  ("comercial", "Comercial", "comercial agresivo con traje gris brillante, pelo engominado, auriculares inalámbricos y un maletín; sonrisa falsa",
   "Fila 1: QUIETO ×2 y CAMINAR ×4.\nFila 2: EMBESTIDA ×3 (agacha la cabeza, carga con el maletín por delante y frena).\nFila 3: RETROCESO ×1, CAÍDA ×2 y EN EL SUELO ×1."),
  ("guardia", "Guardia", "guardia de seguridad corpulento con uniforme gris oscuro genérico (sin logos), gorra, pinganillo y un escudo antidisturbios transparente",
   "Fila 1: QUIETO CON ESCUDO ×2 y CAMINAR ×4.\nFila 2: BLOQUEAR ×1 (escudo delante, chispa pegada al escudo) y GOLPE CON ESCUDO ×2.\nFila 3: RETROCESO ×1, CAÍDA ×2 y EN EL SUELO ×1."),
  ("contable", "Contable", "contable mayor y calvo, con gafas, chaqueta de punto marrón, camisa crema y una grapadora en la mano",
   "Fila 1: QUIETO ×2 y CAMINAR ×4.\nFila 2: DISPARAR GRAPAS ×2 (apunta con la grapadora como si fuera una pistola; aprieta, con una grapa saliendo PEGADA a la grapadora) y GOLPE ×1.\nFila 3: RETROCESO ×1, CAÍDA ×2 y EN EL SUELO ×1."),
  ("ejecutiva", "Ejecutiva", "ejecutiva con traje de chaqueta y falda azul marino, blusa blanca, moño y tacones; mirada de superioridad",
   "Fila 1: QUIETO ×2 y CAMINAR ×4.\nFila 2: AGARRAR ×2 (se lanza a agarrar con las dos manos; sujeta a alguien invisible) y LANZAR ×2.\nFila 3: RETROCESO ×1, CAÍDA ×2 y EN EL SUELO ×1."),
]
JEFES = [
  ("jefe-seguridad", "Jefe 1 · Jefe de Seguridad", "jefe de seguridad enorme, traje negro, gafas de sol, pinganillo y cabeza rapada; 1,2 veces más alto que los demás",
   "Fila 1: QUIETO ×2 y CAMINAR ×4.\nFila 2: PUÑETAZO ×2 y EMBESTIDA ×3 (agacha la cabeza y carga como un toro).\nFila 3: LLAMAR REFUERZOS ×1 (habla por el pinganillo señalando), RETROCESO ×1, CAÍDA ×2 y EN EL SUELO ×1."),
  ("recepcionista", "Jefe 2 · Recepcionista", "recepcionista de un rascacielos con americana roja, moño, auriculares con micro y un teléfono de sobremesa en la mano",
   "Fila 1: QUIETO ×2 y CAMINAR ×4.\nFila 2: LANZAR TELÉFONO ×3 (echa el brazo atrás con el teléfono; lo lanza; el teléfono y su cable PEGADOS a la mano hasta soltarlo) y BOFETADA ×2.\nFila 3: LLAMAR REFUERZOS ×1 (descolgando el teléfono), RETROCESO ×1, CAÍDA ×2 y EN EL SUELO ×1."),
  ("tecnico", "Jefe 3 · Técnico de Mantenimiento", "técnico de mantenimiento corpulento con mono naranja, gorra, barba y una caja de herramientas roja",
   "Fila 1: QUIETO ×2 y CAMINAR ×4.\nFila 2: GOLPE CON LA CAJA ×3 (la levanta y la baja de golpe) y EMBESTIDA ×3.\nFila 3: RETROCESO ×1, CAÍDA ×2 y EN EL SUELO ×1."),
  ("director", "Jefe 4 · Director Comercial", "director comercial con traje oscuro de raya diplomática, corbata roja, pelo canoso engominado y un maletín",
   "Fila 1: QUIETO ×2 y CAMINAR ×4.\nFila 2: PUÑETAZO ×2, EMBESTIDA ×2 y AGARRE ×2 (agarra del cuello a alguien invisible y lo levanta).\nFila 3: LANZAR ×2, RETROCESO ×1, CAÍDA ×2 y EN EL SUELO ×1."),
  ("presidente", "Jefe final · Presidente de Silencio S.A.", "presidente de una gran empresa con traje blanco, corbata dorada, pelo plateado, gafas de sol y aire de villano de película de los 70; el más grande de todos",
   "Fila 1: QUIETO ×2 (con los brazos cruzados) y CAMINAR ×4.\nFila 2: PUÑETAZO ×2, EMBESTIDA ×2 y LANZAR UN DISCO DE ORO ×2 (como un frisbee; el disco PEGADO a la mano).\nFila 3: AGARRE ×2, RETROCESO ×1, CAÍDA ×2 y EN EL SUELO ×1."),
]

FONDO = ("Pixel art de fondo para un beat 'em up arcade de principios de los 90, vista lateral con el suelo en perspectiva "
         "ocupando el TERCIO INFERIOR. Contorno oscuro y sombreado plano, paleta cálida y algo desaturada. Formato PANORÁMICO "
         "muy ancho (proporción 4:1). Sin personajes, sin texto y sin logos. Escena: ")
FONDOS = [
  ("fondo-1-parking.png", "Nivel 1 · Parking", "aparcamiento subterráneo de un rascacielos de oficinas moderno de Madrid, de noche, con columnas de hormigón marcadas con símbolos abstractos (NO letras ni números legibles), luces fluorescentes verdosas, coches genéricos aparcados (sin marcas ni matrículas legibles), barreras de entrada y manchas de aceite. Ambiente tenso pero colorido."),
  ("fondo-2-vestibulo.png", "Nivel 2 · Vestíbulo", "vestíbulo enorme de un rascacielos de oficinas de los años 80, con suelo de mármol pulido, techos muy altos, tornos de acceso de cristal, un mostrador de recepción largo, escaleras mecánicas al fondo, plantas en macetas y grandes cristaleras con la calle de noche detrás."),
  ("fondo-3-ascensor.png", "Nivel 3 · Ascensor (formato distinto: 16:9)", "interior de un ascensor de carga grande de un rascacielos, con paredes de acero cepillado, puertas correderas en el centro de la pared del fondo, un indicador de planta con una flecha (SIN números), pasamanos metálico y botonera. IMPORTANTE: este fondo NO es panorámico, es de proporción 16:9."),
  ("fondo-4-oficinas.png", "Nivel 4 · Oficinas", "planta de oficinas diáfana de día, con hileras de mesas con ordenadores antiguos, impresoras, una fuente de agua, plantas y grandes ventanales con la ciudad al fondo; todo muy gris y ordenado."),
  ("fondo-5-azotea.png", "Nivel 5 · Azotea", "azotea de un rascacielos de Madrid de noche, con un escenario de concierto montado al final (focos, torres de altavoces y pirotecnia de escenario encendida) y el skyline de Madrid iluminado al fondo, visto desde las alturas. NADA de humo, fuego ni daños en el edificio: el fuego es solo pirotecnia de escenario."),
]
OTROS = [
  ("objetos.png", "Objetos y potenciadores (una hoja)", "Hoja de objetos en pixel art para un beat 'em up arcade de los 90, contorno oscuro grueso, sombreado plano, estilo cálido setentero. Cada objeto pequeño y bien legible, separados entre sí, en una sola fila, de izquierda a derecha: bocadillo de calamares, taza de café para llevar sin logo, púa de guitarra dorada, hoja de setlist escrita con garabatos ilegibles, amplificador pequeño portátil, pedal de efectos de guitarra rojo, púa de guitarra con un trébol, pase de backstage con cordón (sin texto legible), grapadora, extintor, silla de oficina con ruedas y pie de micrófono. Fondo gris completamente liso #474747. Sin texto legible, sin marcas ni logos."),
  ("titulo-fondo.png", "Pantalla de título (opcional)", "Ilustración en pixel art para la pantalla de título de un videojuego arcade de los 90: un rascacielos de oficinas blanco de los años 80 con franjas verticales y arcos en la base, de noche, visto desde abajo en contrapicado; en la azotea, un escenario de concierto con focos y pirotecnia de escenario. Cielo de morado a rojo, skyline de Madrid en silueta con ventanas encendidas. Paleta cálida y algo desaturada. Formato PANORÁMICO 16:9. Deja libre la franja superior para el título. NADA de fuego, humo ni daños en el edificio: el fuego es solo pirotecnia del escenario. Sin texto, sin logos y sin personajes."),
]

def build():
    secciones = []
    for m in MUSICOS:
        secciones.append(dict(titulo=f"{m['nombre']} · {m['apodo']} ({m['papel']})", id=m['id'],
                              nota=f"7 imágenes{' (8 con la nota)' if m['id'] == 'dani' else ''}. Hazlas en orden.",
                              prompts=musico_prompts(m)))
    secciones.append(dict(titulo="Enemigos (empleados de Silencio S.A.)", id="enemigos", nota="No subas ninguna imagen. Solo copia y pega.",
        prompts=[(f"enemigo-{k}.png", f"{n}: no subas ninguna imagen", oficina(f"PERSONAJE: {d}.\nHOJA de exactamente 3 filas:\n{rows}"), False) for k, (i, n, d, rows) in enumerate(ENEMIGOS, 1)]))
    secciones.append(dict(titulo="Jefes", id="jefes", nota="No subas ninguna imagen. Solo copia y pega.",
        prompts=[(f"jefe-{k}.png", f"{n}: no subas ninguna imagen", oficina(f"PERSONAJE: {d}.\nHOJA de exactamente 3 filas:\n{rows}"), False) for k, (i, n, d, rows) in enumerate(JEFES, 1)]))
    secciones.append(dict(titulo="Fondos de los niveles", id="fondos", nota="No subas ninguna imagen. Solo copia y pega.",
        prompts=[(f"fondo-{k}.png", f"{n}: no subas ninguna imagen", FONDO + d, False) for k, (f, n, d) in enumerate(FONDOS, 1)]))
    secciones.append(dict(titulo="Objetos y pantalla de título", id="otros", nota="No subas ninguna imagen. Solo copia y pega.",
        prompts=[(("objetos.png", "titulo.png")[k], f"{n}: no subas ninguna imagen", d, False) for k, (f, n, d) in enumerate(OTROS)]))
    return secciones

PASOS = [
    "Abre Gemini (gemini.google.com) o ChatGPT.",
    "Abre un chat NUEVO para cada imagen.",
    "Pulsa «Copiar» y pégalo en el chat. Si el paso dice «Sube la imagen…», primero sube esa imagen con el botón + o el clip.",
    "Descarga la imagen que salga y guárdala con el nombre que pone el paso (por ejemplo, antonio-1).",
    "Si no te gusta cómo quedó, escribe «Otra vez» en el mismo chat.",
]

def to_md(secs):
    out = ["# Arde la Torre · imágenes para el juego", "",
           "> Generado por `scripts/prompts_amigo.py`. No lo edites a mano: cambia el script y vuelve a generarlo.", "",
           "## Cómo se hace", ""] + [f"{i}. {p}" for i, p in enumerate(PASOS, 1)]
    for s in secs:
        out += ["", f"## {s['titulo']}", "", s['nota']]
        for k, (f, n, txt, ref) in enumerate(s["prompts"], 1):
            out += ["", f"### Paso {k} · {n}", "", f"Guárdala como: **{f[:-4]}**", "", "```", txt, "```"]
    return "\n".join(out) + "\n"

def to_html(secs):
    esc = html.escape
    cards = []
    for s in secs:
        items = []
        for k, (f, n, txt, ref) in enumerate(s["prompts"], 1):
            pid = f"{s['id']}-{k}"
            sube = n.startswith("Sube")
            items.append(
                f'<article class="p{" sube" if sube else ""}"><div class="num">{k}</div><div class="cuerpo">'
                f'<p class="que">{esc(n)}</p>'
                f'<button type="button" data-copy="{pid}">Copiar</button>'
                f'<p class="guarda">Guárdala como <b>{esc(f[:-4])}</b></p>'
                f'<details><summary>Ver el texto</summary><pre id="{pid}">{esc(txt)}</pre></details></div></article>')
        cards.append(f'<section id="{s["id"]}"><h2>{esc(s["titulo"])}</h2><p class="nota">{esc(s["nota"])}</p>{"".join(items)}</section>')
    pasos = "".join(f"<li>{esc(p)}</li>" for p in PASOS)
    nav = "".join(f'<a href="#{s["id"]}">{esc(s["titulo"].split(" (")[0].split(" · ")[0])}</a>' for s in secs)
    return f"""<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Imágenes para Arde la Torre</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=IBM+Plex+Sans:wght@400;600;700&family=IBM+Plex+Mono&display=swap" rel="stylesheet">
<style>
:root {{
  /* Noche de concierto. Lista de pasos grandes, un botón por paso; el texto técnico va plegado. */
  --bg: #120e1c; --panel: #1d1730; --ink: #f3eee4; --dim: #a69fb8; --accent: #ffcf3f; --sube: #4fb3ff;
  --display: "Press Start 2P", ui-monospace, monospace; --body: "IBM Plex Sans", system-ui, sans-serif; --mono: "IBM Plex Mono", ui-monospace, monospace;
  color-scheme: dark;
}}
* {{ box-sizing: border-box; }}
body {{ margin: 0; background: var(--bg); color: var(--ink); font: 17px/1.5 var(--body); }}
main {{ max-width: 720px; margin: 0 auto; padding: 24px 16px 80px; display: grid; gap: 28px; }}
h1 {{ font: 18px/1.5 var(--display); color: var(--accent); margin: 0; text-wrap: balance; }}
h2 {{ font: 13px/1.6 var(--display); color: var(--accent); margin: 0; text-wrap: balance; }}
nav {{ display: flex; flex-wrap: wrap; gap: 8px; position: sticky; top: 0; background: var(--bg); padding: 10px 0; z-index: 2; border-bottom: 1px solid #2c2442; }}
nav a {{ color: var(--ink); text-decoration: none; font-size: 14px; padding: 7px 12px; border: 1px solid #3a3156; border-radius: 6px; }}
nav a:hover, nav a:focus-visible {{ border-color: var(--accent); outline: none; }}
.como {{ background: var(--panel); border-radius: 12px; padding: 16px 18px; }}
.como ol {{ margin: 10px 0 0; padding-left: 22px; display: grid; gap: 8px; }}
section {{ display: grid; gap: 12px; }}
.nota {{ color: var(--dim); margin: 0; }}
.p {{ display: grid; grid-template-columns: 52px 1fr; gap: 14px; background: var(--panel); border-radius: 12px; padding: 14px; }}
.num {{ font: 20px/1 var(--display); color: #14101f; background: var(--accent); border-radius: 10px; display: grid; place-items: center; height: 52px; }}
.sube .num {{ background: var(--sube); }}
.cuerpo {{ display: grid; gap: 8px; min-width: 0; }}
.que {{ margin: 0; font-weight: 700; }}
.sube .que {{ color: var(--sube); }}
.guarda {{ margin: 0; color: var(--dim); }}
.guarda b {{ color: var(--ink); font-family: var(--mono); }}
button {{ justify-self: start; font: 700 17px var(--body); color: #14101f; background: var(--accent); border: 0; border-radius: 8px; padding: 12px 28px; cursor: pointer; }}
button:focus-visible {{ outline: 3px solid var(--ink); outline-offset: 2px; }}
button.ok {{ background: #5fd38a; }}
details summary {{ color: var(--dim); font-size: 14px; cursor: pointer; }}
pre {{ margin: 8px 0 0; white-space: pre-wrap; word-break: break-word; font: 13px/1.5 var(--mono); color: #ddd6ea; background: #0c0915; padding: 12px; border-radius: 6px; max-height: 280px; overflow: auto; }}
@media (prefers-reduced-motion: no-preference) {{ button {{ transition: background .15s; }} }}
</style></head>
<body><main>
<header><h1>Imágenes para Arde la Torre</h1></header>
<div class="como"><h2>Cómo se hace</h2><ol>{pasos}</ol></div>
<nav aria-label="Secciones">{nav}</nav>
{"".join(cards)}
<p class="nota">Cuando tengas las imágenes, mándalas todas juntas. · Homenaje no oficial de @coloresruidosos.</p>
</main>
<script>
document.addEventListener('click', async (e) => {{
  const b = e.target.closest('button[data-copy]'); if (!b) return;
  const el = document.getElementById(b.dataset.copy); const txt = el.textContent;
  try {{ await navigator.clipboard.writeText(txt); b.textContent = '¡Copiado!'; }}
  catch {{ el.closest('details').open = true; const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Texto seleccionado: cópialo'; }}
  b.classList.add('ok'); setTimeout(() => {{ b.textContent = 'Copiar'; b.classList.remove('ok'); }}, 2500);
}});
</script>
</body></html>
"""

if __name__ == "__main__":
    secs = build()
    n = sum(len(s["prompts"]) for s in secs)
    with open(os.path.join(ROOT, "art", "PROMPTS-PARA-COPIAR.md"), "w", encoding="utf-8") as f: f.write(to_md(secs))
    os.makedirs(os.path.join(ROOT, "dist"), exist_ok=True)
    with open(os.path.join(ROOT, "dist", "prompts.html"), "w", encoding="utf-8") as f: f.write(to_html(secs))
    print(f"{n} prompts · art/PROMPTS-PARA-COPIAR.md · dist/prompts.html")
