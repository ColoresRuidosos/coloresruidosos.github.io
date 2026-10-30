# trivia.md — contenido de la Trivia Love of Lesbian (F15)

> Anexo de `spec.md` (F15). Aquí vive **qué se pregunta y qué se gana**; el cómo está en `plan.md` (D21).
> Este documento es la fuente de verdad que revisan los fans verificadores antes de que una pregunta pase a `data/trivia.json`.

## 0. Reglas de veracidad

1. **Toda pregunta lleva fuente con enlace.** Sin fuente no entra (lo vigila un test).
2. **Fuerza de la fuente:**
   - ✅ **Sólida:** la web oficial de la banda (`loveoflesbianband.com`) por sí sola, o **dos fuentes independientes** que coinciden.
   - 🟡 **Una fuente:** dato plausible con una sola fuente externa. **No entra al juego** hasta conseguir una segunda.
   - ❌ **Descartada:** las fuentes se contradicen. No se elige una versión; se saca del banco (ver §4).
3. **Revisión fan obligatoria.** Las fuentes se reunieron con un buscador web que lee fragmentos de las páginas, no la página completa. Por eso **todas** las preguntas están en estado `propuesta`: un fan abre cada enlace, confirma, y la marca `verificada`. El juego solo usa preguntas `verificada` con fuente ✅.
4. **Sin letras.** Ninguna pregunta reproduce versos (derechos de autor). Se pregunta por títulos, discos, fechas, personas y lugares.
5. **Distractores seguros.** Las opciones incorrectas deben ser claramente falsas *para esa pregunta*; si un distractor pudiera ser verdad en otra lectura, se cambia.

> Ejemplo de por qué importan estas reglas: en una respuesta anterior en el chat dije de memoria que el primer disco se llamaba "Microsoft Windows". Es falso: es *Microscopic Movies* (1999). Nada de este banco sale de memoria.

## 1. Etapas (niveles del juego)

Cada partida recorre las seis etapas en orden cronológico; el fondo pixel art cambia con cada una.

| # | Etapa | Años | Discos | Escena pixel art (reinterpretación, no copia) |
|---|---|---|---|---|
| E1 | Etapa en inglés | 1997–2003 | *Microscopic Movies*, *Is It Fiction?*, *Ungravity* | Cielo azul con nubes en degradado y letrero de neón naranja que parpadea |
| E2 | El salto al castellano | 2005–2007 | *Maniobras de escapismo*, *Cuentos chinos para niños del Japón* | Hombrecito caminando sobre una línea; burbuja roja sobre fondo blanco |
| E3 | La explosión | 2009–2014 | *1999*, *La noche eterna. Los días no vividos*, *Fantastic Shine*, *Nouvelle Cuisine Caníbal* | Bañera con azulejos verdes; collage beige con gallina etiquetada |
| E4 | Era Halley | 2016–2018 | *El poeta Halley*, *Nouvelle Cuisine Caníbal Vol. II*, *El gran truco final* | Cohete rojo con ojos en cielo turquesa; mago a contraluz con rayos |
| E5 | V.E.H.N. | 2021–2023 | *V.E.H.N. (Viaje épico hacia la nada)* | Trampolín visto desde abajo entre muros de mosaico azul |
| E6 | Ejército de salvación y la pausa | 2024–2026 | *Ejército de salvación* | Personajes con máscaras y bandera ondeando |

## 2. Categorías y reconocimientos

### 2.1 Puntaje

Partida de **15 preguntas**: 5 fáciles (1 pt), 5 difíciles (2 pts), 5 muy difíciles (3 pts) = **30 pts**. Las preguntas se sortean del banco verificado respetando esa mezcla y se ordenan por etapa.

### 2.2 Categoría final

| Puntos | Categoría | Avatar (máscara pixel art estilo *Ejército de salvación*) |
|---|---|---|
| 0–12 | **Pequeño lesbiano** | Máscara pequeña, colores pastel |
| 13–22 | **Lesbianito** | Máscara mediana con flecos |
| 23–29 | **Viejo lesbiano** | Máscara alta con plumas |
| 30 | **Club de fans de John Boy** *(secreta)* | Máscara dorada. No se anuncia en ningún lado: se descubre |

### 2.3 Insignias (logros persistentes en el navegador)

Todas llevan el nombre de una canción o disco de la banda. Se guardan en `localStorage`; si el navegador lo bloquea, el juego funciona igual sin ellas.

| Insignia | Cómo se gana | Por qué ese nombre |
|---|---|---|
| **Maniobras de escapismo** | Terminar la primera partida | Primer paso, como su primer disco en castellano |
| **Universos infinitos** | Jugar 5 partidas | Volver y volver |
| **Incendios de nieve** | 5 aciertos seguidos en una partida | Racha "imposible" |
| **Bajo el volcán** | Acertar las 5 muy difíciles de una partida | Presión máxima |
| **Ungravity** | Acertar todas las preguntas de la etapa en inglés en una partida | Dominar la etapa menos conocida |
| **Segundo asalto** | Superar tu mejor categoría anterior | Revancha |
| **La noche eterna** | Jugar entre las 00:00 y las 05:00 (hora local) | Insignia oculta, se descubre jugando |
| **Viaje épico hacia la nada** | Terminar una partida con 0 puntos | Insignia de consolación con humor |
| **Me amo** | Llegar a Viejo lesbiano | Orgullo fan |
| **Club de fans de John Boy** | 30/30 | Acompaña a la categoría secreta |
| **1999** | Acumular 99 aciertos entre todas las partidas | Coleccionista paciente |
| **Allí donde solíamos gritar** | Compartir tu tarjeta de resultado | Llevar el juego a otros |
| **Ejército de salvación** | Desbloquear las 6 portadas coleccionables (ver 2.4) | Completar la discografía |
| **El último baile** *(edición limitada)* | Jugar cualquier partida antes del 25 de noviembre de 2026 a las 23:59 (CDMX) | Su último concierto en CDMX antes de la pausa |

### 2.4 Portadas coleccionables

Acertar **todas** las preguntas de una etapa en una partida desbloquea su escena pixel art en la galería "Mi discografía". Las 6 escenas desbloqueadas dan la insignia **Ejército de salvación**.

### 2.5 Tarjeta para compartir

Al terminar: imagen 1080×1350 en 8 bits con avatar, categoría, puntaje, insignias nuevas y la dirección del sitio. Se comparte con la función de compartir del celular o se descarga. No incluye nombre ni datos del jugador.

## 3. Banco de preguntas (v1, estado: `propuesta`)

Formato: la columna **✔ Respuesta correcta** trae la respuesta; **Opciones incorrectas** trae los tres distractores. El juego baraja las cuatro.

Tipos: **D** dato · **P** portada (se muestra la escena pixel art de un disco) · **O** orden/cronología.

### 3.1 Fáciles (1 pt)

| ID | Etapa | Tipo | Pregunta | ✔ Respuesta correcta | Opciones incorrectas | Fuentes | Fuerza |
|---|---|---|---|---|---|---|---|
| F01 | E1 | D | ¿Cerca de qué ciudad se formó Love of Lesbian? | **Barcelona** | Madrid · Valencia · Bilbao | [Todomúsica](https://www.todomusica.org/love_of_lesbian/biografia/) · [Buenamúsica](https://www.buenamusica.com/love-of-lesbian/biografia) (Sant Vicenç dels Horts) | ✅ |
| F02 | E1 | D | ¿Quién es el vocalista de la banda? | **Santi Balmes** | Jordi Roig · Oriol Bonet · Julián Saldarriaga | [Bio oficial](https://loveoflesbianband.com/biografia/) · [Todomúsica](https://www.todomusica.org/love_of_lesbian/biografia/) | ✅ |
| F03 | E1 | D | ¿En qué idioma cantaban en sus tres primeros discos? | **Inglés** | Catalán · Francés · Castellano | [Ungravity, web oficial](https://loveoflesbianband.com/disco/ungravity-2003/) · [Bio oficial](https://loveoflesbianband.com/biografia/) | ✅ |
| F04 | E2 | D | ¿Cuál fue su primer disco cantado en castellano? | **Maniobras de escapismo** | *1999* · *Cuentos chinos para niños del Japón* · *El poeta Halley* | [Web oficial](https://loveoflesbianband.com/disco/maniobras-de-escapismo-2005/) · [Wikipedia](https://es.wikipedia.org/wiki/Maniobras_de_escapismo) | ✅ |
| F05 | E3 | D | "Club de fans de John Boy" y "Allí donde solíamos gritar" pertenecen al disco… | **1999** | *La noche eterna* · *Ungravity* · *V.E.H.N.* | [Web oficial, 1999](https://loveoflesbianband.com/disco/1999/) · [Deezer](https://www.deezer.com/en/album/298527) | ✅ |
| F06 | E4 | P | ¿De qué disco es esta portada? *(cohete rojo en cielo turquesa)* | **El poeta Halley** | *Ejército de salvación* · *Ungravity* · *1999* | [La Higuera](https://www.lahiguera.net/musicalia/artistas/love_of_lesbian/disco/7335/) · [El Giradiscos](https://www.elgiradiscos.com/2016/04/love-of-lesbian-el-poeta-halley.html) | ✅ |
| F07 | E4 | D | "Bajo el volcán" fue el primer sencillo de… | **El poeta Halley** | *1999* · *V.E.H.N.* · *Maniobras de escapismo* | [La Higuera](https://www.lahiguera.net/musicalia/artistas/love_of_lesbian/disco/7335/tema/12018/) · [Ecos del Vinilo](https://ecosdelvinilo.com/2016/01/love-of-lesbian-bajo-el-volcan-2.html) | ✅ |
| F08 | E4 | D | *El gran truco final* es… | **Un disco en directo** | Un disco de estudio · Un libro de Santi Balmes · Un documental | [La Ganzúa](https://www.laganzua.net/noticias/15796-love-of-lesbian-lanzan-el-gran-truco-final-disco-en-directo) · [Excélsior](https://www.excelsior.com.mx/funcion/love-lesbian-publica-su-nuevo-disco-el-gran-truco-final/1239960) | ✅ |
| F09 | E5 | D | ¿Qué significan las siglas V.E.H.N.? | **Viaje épico hacia la nada** | Vida en Halley nunca · Viejos en huelga nocturna · Volver es hacerse nadie | [Apple Music](https://music.apple.com/es/album/v-e-h-n-viaje-%C3%A9pico-hacia-la-nada/1540993287) · [TodoIndie](https://es.todoindie.com/love-of-lesbian-v-e-h-n/) | ✅ |
| F10 | E5 | D | ¿Con quién cantan "El sur"? | **Enrique Bunbury** | Joaquín Sabina · Fito Páez · Andrés Calamaro | [La Higuera](https://www.lahiguera.net/musicalia/artistas/love_of_lesbian/disco/10974/tema/24773/) · [Telecinco](https://www.telecinco.es/noticias/cultura/love-of-lesbian-bunbury-colaboracion-concierto-5000-personas-be5ma_18_3101445268.html) | ✅ |
| F11 | E6 | P | ¿De qué disco es esta portada? *(cuatro personas con máscaras y una bandera)* | **Ejército de salvación** | *El gran truco final* · *Nouvelle Cuisine Caníbal* · *V.E.H.N.* | [Discogs](https://www.discogs.com/release/32078493-Love-Of-Lesbian-Ej%C3%A9rcito-De-Salvaci%C3%B3n) · [La Higuera](https://www.lahiguera.net/musicalia/artistas/love_of_lesbian/disco/13478/) | ✅ |
| F12 | E6 | D | ¿Dónde es su último concierto en CDMX antes de la pausa? | **Auditorio Nacional** | Palacio de los Deportes · Foro Sol · Teatro Metropólitan | [El Universal](https://www.eluniversal.com.mx/espectaculos/nueva-fecha-en-cdmx-para-love-of-lesbian-confirmacion-llega-desde-el-vive-latino-2026/) · [Auditorio Nacional](https://www.auditorio.com.mx/cartelera/2026/noviembre/love-of-lesbian.html) | ✅ |
| F13 | E5 | P | ¿De qué disco es esta portada? *(trampolín visto desde abajo entre muros de mosaico)* | **V.E.H.N.** | *Ungravity* · *El poeta Halley* · *1999* | [Apple Music](https://music.apple.com/es/album/v-e-h-n-viaje-%C3%A9pico-hacia-la-nada/1540993287) · [Deezer](https://www.deezer.com/mx/album/219059692) | ✅ |
| F14 | E3 | P | ¿De qué disco es esta portada? *(una persona en una bañera)* | **1999** | *La noche eterna* · *Maniobras de escapismo* · *Ungravity* | [Web oficial, 1999](https://loveoflesbianband.com/disco/1999/) · [Deezer](https://www.deezer.com/en/album/298527) | ✅ |

### 3.2 Difíciles (2 pts)

| ID | Etapa | Tipo | Pregunta | ✔ Respuesta correcta | Opciones incorrectas | Fuentes | Fuerza |
|---|---|---|---|---|---|---|---|
| D01 | E1 | D | ¿En qué año empezó la banda? | **1997** | 1993 · 2001 · 2005 | [Bio oficial](https://loveoflesbianband.com/biografia/) (otoño de 1997) · [Todomúsica](https://www.todomusica.org/love_of_lesbian/biografia/) | ✅ |
| D02 | E1 | D | ¿Cómo se llama su primer disco? | **Microscopic Movies** | *Is It Fiction?* · *Ungravity* · *Fantastic Shine* | [Bio oficial](https://loveoflesbianband.com/biografia/) · [Wikidata](https://www.wikidata.org/wiki/Q28503651) | ✅ |
| D03 | E1 | D | ¿De qué banda fueron teloneros en su Dream Tour? | **The Cure** | Radiohead · Coldplay · Pixies | [Bio oficial](https://loveoflesbianband.com/biografia/) · [Tomavistas](https://www.tomavistasfestival.com/en/conciertos/love-of-lesbian/) | ✅ |
| D04 | E2 | D | Antes de ser miembro oficial, Julián Saldarriaga acompañaba a la banda como… | **Roadie** | Mánager · Ingeniero de sonido · Fotógrafo | [Bio oficial](https://loveoflesbianband.com/biografia/) | ✅ |
| D05 | E2 | O | ¿Con qué canción abre *Cuentos chinos para niños del Japón*? | **"Universos infinitos"** | "Me amo" · "La niña imantada" · "Noches reversibles" | [Wikipedia](https://es.wikipedia.org/wiki/Cuentos_chinos_para_ni%C3%B1os_del_Jap%C3%B3n) · [Spotify](https://open.spotify.com/album/2H8D7PqqvSyjrqZjbFxVYQ) | ✅ |
| D06 | E3 | D | ¿Qué disco les dio su primer disco de oro en España? | **1999** | *Maniobras de escapismo* · *El poeta Halley* · *Cuentos chinos para niños del Japón* | [Wikipedia](https://es.wikipedia.org/wiki/1999_(%C3%A1lbum_de_Love_of_Lesbian)) · [Web oficial, 1999](https://loveoflesbianband.com/disco/1999/) | ✅ |
| D07 | E3 | D | ¿Cuál fue su primer disco en llegar al número 1 de ventas en España? | **La noche eterna. Los días no vividos** | *1999* · *Cuentos chinos para niños del Japón* · *Maniobras de escapismo* | [Wikipedia](https://es.wikipedia.org/wiki/La_noche_eterna._Los_d%C3%ADas_no_vividos) · [Fnac](https://www.fnac.es/Love-of-Lesbian/ia71418/biografia) | ✅ |
| D08 | E3 | D | *La noche eterna. Los días no vividos* (2012) es un disco… | **Doble** | En directo · Instrumental · En inglés | [La Higuera](https://www.lahiguera.net/musicalia/artistas/love_of_lesbian/disco/4700/) · [Wikipedia](https://es.wikipedia.org/wiki/La_noche_eterna._Los_d%C3%ADas_no_vividos) | ✅ |
| D09 | E4 | D | ¿Quién tomó el bajo cuando Joan Ramon Planell dejó la banda en 2017? | **Ricky Falkner** | Dani Ferrer · Julián Saldarriaga · Jordi Roig | [El Rescate Musical](https://elrescatemusical.com/love-of-lesbian-cambio-formacion/) · [Mondo Sonoro](https://www.mondosonoro.com/entrevistas/love-of-lesbian-entrevista-truco-final/) · [Fnac](https://www.fnac.es/Love-of-Lesbian/ia71418/biografia) | ✅ |
| D10 | E5 | D | ¿Cuántas nominaciones al Latin Grammy 2021 recibieron con *V.E.H.N.*? | **3** | 1 · 2 · 5 | [Latin Grammy](https://www.latingrammy.com/en/artists/love-of-lesbian-39874/) · [Enderrock](https://www.enderrock.cat/noticia/23340/love-of-lesbian-triplement-nominat-grammy-llatins) | ✅ |
| D11 | E5 | D | ¿Qué canción de *V.E.H.N.* fue nominada a Mejor canción pop/rock en el Latin Grammy? | **"Cosmos (Antisistema Solar)"** | "El sur" · "Viaje épico hacia la nada" · "Catalunya bondage" | [Estrellas en la Mira](https://estrellasenla.com/2021/09/29/el-grupo-espanol-love-of-lesbian-nominado-a-3-premios-grammy-latino-2021/) · [La Higuera](https://www.lahiguera.net/musicalia/artistas/love_of_lesbian/disco/10974/) | ✅ |
| D12 | E6 | D | ¿Con qué gira tocaron por primera vez en el Palacio de los Deportes? | **Ejército de salvación** | *V.E.H.N.* · *El poeta Halley* · *La noche eterna* | [Máspormás](https://www.maspormas.com/ciudad/de-momento/love-of-lesbian-emocionados-por-su-primer-palacio-de-los-deportes/) · [Ídolos](https://idolosmx.com/love-of-lesbian-por-primera-vez-en-palacio-de-los-deportes/) · [Sopitas](https://www.sopitas.com/musica/love-of-lesbian-concierto-cdmx-palacio-de-los-deportes-fecha-detalles/) | ✅ |
| D13 | E6 | D | ¿Qué anunció la banda en febrero de 2026? | **Una pausa indefinida** | Su separación definitiva · Un disco en inglés · La salida de Santi Balmes | [elDiario.es](https://www.eldiario.es/cultura/musica/love-of-lesbian-anuncia-retira-escenarios-25-anos-hora-bajar-telon-tiempo_1_13025439.html) · [Time Out](https://www.timeout.es/madrid/es/noticias/love-of-lesbian-deja-los-escenarios-indefinidamente-tras-25-anos-de-carrera-022726) · [Onda Vasca](https://www.ondavasca.com/love-of-lesbian-anuncia-un-paron-indefinido-tras-25-anos-de-trayectoria/) | ✅ |
| D14 | E4 | D | ¿En qué recinto se grabó *El gran truco final*? | **WiZink Center (Madrid)** | Palau Sant Jordi (Barcelona) · Auditorio Nacional (CDMX) · Teatro Gran Rex (Buenos Aires) | [Wikipedia](https://es.wikipedia.org/wiki/El_gran_truco_final) · [Web oficial](https://loveoflesbianband.com/hace-un-ano-el-gran-truco-final/) | 🟡 confirmar que la nota oficial nombra el recinto |
| D15 | E4 | D | ¿Qué cantautor participa recitando en "El poeta Halley"? | **Joan Manuel Serrat** | Joaquín Sabina · Jorge Drexler · Luis Eduardo Aute | [El Giradiscos](https://www.elgiradiscos.com/2016/04/love-of-lesbian-el-poeta-halley.html) | 🟡 falta segunda fuente |
| D16 | E3 | D | "Fantastic Shine" (2013) nació como canción para la campaña de verano de… | **Estrella Damm** | Coca-Cola · Movistar · Seat | [Musicoscopio](https://www.musicoscopio.com/love-of-lesbian/letras/24914/) | 🟡 falta segunda fuente |
| D17 | E3 | D | ¿En qué año tocaron por primera vez en México? | **2013** | 2009 · 2016 · 2021 | [El Faro en las Calles](https://www.elfaroenlascalles.com/musica/love-of-lesbian-en-caradura/) | 🟡 falta segunda fuente |
| D18 | E6 | D | ¿Qué canción con Rigoberta Bandini adelantó *Ejército de salvación*? | **"Contradicción"** | "La hermandad" · "Tesis" · "Ya sale el sol" | [JENESAISPOP](https://jenesaispop.com/2024/04/29/474311/love-of-lesbian-anuncia-ejercito-de-salvacion/) | 🟡 falta segunda fuente |

### 3.3 Muy difíciles (3 pts)

| ID | Etapa | Tipo | Pregunta | ✔ Respuesta correcta | Opciones incorrectas | Fuentes | Fuerza |
|---|---|---|---|---|---|---|---|
| M01 | E1 | D | ¿Dónde se grabó *Microscopic Movies*? | **En la cocina de su productor, insonorizada con colchones** | En un estudio de Londres · En el garaje de Santi Balmes · En una iglesia abandonada | [Bio oficial](https://loveoflesbianband.com/biografia/) | ✅ (oficial) |
| M02 | E1 | D | El sello Pussycats Records, que editó su primer disco, era de… | **Málaga** | Barcelona · Madrid · Valencia | [Bio oficial](https://loveoflesbianband.com/biografia/) | ✅ (oficial) |
| M03 | E1 | D | *Ungravity* (2003) fue la primera producción profesional de… | **Ricky Falkner** | Santos & Fluren · Jean Hugues Dollet · Dani Ferrer | [Bio oficial](https://loveoflesbianband.com/biografia/) · [Ungravity, web oficial](https://loveoflesbianband.com/disco/ungravity-2003/) | ✅ (oficial) |
| M04 | E1 | D | ¿Qué sello francés publicó *Ungravity*? | **Naïve** | Because Music · Barclay · Ed Banger | [Bio oficial](https://loveoflesbianband.com/biografia/) · [Discogs (Naïve también edita *Maniobras*)](https://www.discogs.com/release/2985888-Love-Of-Lesbian-Maniobras-De-Escapismo) | ✅ |
| M05 | E2 | O | ¿Con qué canción abre *Maniobras de escapismo*? | **"Carta a todas tus catástrofes"** | "Domingo astromántico" · "Música de ascensores" · "Houston, tenemos un poema" | [Discogs](https://www.discogs.com/release/2985888-Love-Of-Lesbian-Maniobras-De-Escapismo) · [Todomúsica](https://www.todomusica.org/love_of_lesbian/disco_maniobras_de_escapismo.shtml) | ✅ |
| M06 | E3 | D | El segundo disco de *La noche eterna. Los días no vividos* trata sobre… | **Lo que se deja de hacer por vivir la noche** | Su etapa en inglés · Sus viajes a México · La infancia de Santi Balmes | [La Higuera](https://www.lahiguera.net/musicalia/artistas/love_of_lesbian/disco/4700/) · [Wikipedia](https://es.wikipedia.org/wiki/La_noche_eterna._Los_d%C3%ADas_no_vividos) | ✅ |
| M07 | E4 | D | *Nouvelle Cuisine Caníbal Vol. II* se editó en vinilo de 10" para… | **El Record Store Day 2017** | Un concierto en el Palau Sant Jordi · El 20 aniversario de la banda · La gira mexicana de 2017 | [La Higuera](https://www.lahiguera.net/musicalia/artistas/love_of_lesbian/disco/8353/) · [Discogs](https://www.discogs.com/release/10181990-Love-Of-Lesbian-Nouvelle-Cuisine-Can%C3%ADbal-Vol-II) | ✅ |
| M08 | E5 | D | ¿Qué fecha salió *V.E.H.N.*? | **16 de abril de 2021** | 4 de marzo de 2016 · 11 de octubre de 2024 · 22 de mayo de 2012 | [Apple Music](https://music.apple.com/es/album/v-e-h-n-viaje-%C3%A9pico-hacia-la-nada/1540993287) · [Deezer](https://www.deezer.com/mx/album/219059692) | ✅ |
| M09 | E5 | D | En marzo de 2021 tocaron ante 5.000 personas sin distancia social, como parte de un estudio clínico. ¿Dónde? | **Palau Sant Jordi (Barcelona)** | WiZink Center (Madrid) · Razzmatazz (Barcelona) · Auditorio Nacional (CDMX) | [Web oficial](https://loveoflesbianband.com/sin-impacto-en-la-transmision-de-covid-19/) · [Telecinco](https://www.telecinco.es/noticias/cultura/love-of-lesbian-bunbury-colaboracion-concierto-5000-personas-be5ma_18_3101445268.html) | ✅ |
| M10 | E6 | D | ¿Dónde fueron sus últimos conciertos en Madrid antes de la pausa? | **Noches del Botánico** | WiZink Center · Mad Cool · La Riviera | [Noches del Botánico](https://en.nochesdelbotanico.com/noticias/love-of-lesbian-anuncian-un-paron-indefinido-y-sus-tres-conciertos-en-noches-del-botanico-seran-los-ultimos-en-madrid) · [Pozuelo IN](https://pozueloin.es/noticias/noticia/love-of-lesbian-anuncia-un-paron-indefinido-y-convertira-sus-conciertos-en-noches-del-botanico-en-una-despedida-temporal-en-madrid/) | ✅ |
| M11 | E3 | D | ¿Con qué libro debutó Santi Balmes en la literatura (2011)? | **Yo mataré monstruos por ti** | *Canción de bruma* · *La doble vida de las hadas* · *Moraland* | [Lecturalia](https://www.lecturalia.com/libro/71122/yo-matare-monstruos-por-ti) · [Principal de los Libros](https://principaldeloslibros.com/infantil/94-monstruos-por-ti.html) | ✅ |
| M12 | E6 | D | ¿Cómo se tituló el comunicado con el que anunciaron la pausa? | **"El arte de detener el tiempo"** | "Nos vemos en el último verso" · "Hasta pronto, Halley" · "El gran truco final" | [Onda Vasca](https://www.ondavasca.com/love-of-lesbian-anuncia-un-paron-indefinido-tras-25-anos-de-trayectoria/) | 🟡 falta segunda fuente |
| M13 | E5 | D | ¿Qué banda invitada canta en "Catalunya bondage"? | **El Columpio Asesino** | Vetusta Morla · Lori Meyers · Sidonie | [Rocksesión](https://rocksesion.com/2021/04/22/love-of-lesbian-v-e-h-n-viaje-epico-hacia-la-nada/) · [Popelera](https://www.popelera.net/love-of-lesbian-disco-v-e-h-n/) | 🟡 confirmar en las dos páginas |
| M14 | E1 | D | ¿En qué puesto colocó Mondo Sonoro a *Ungravity* entre los discos nacionales de su año? | **4.º** | 1.º · 8.º · 10.º | [Bio oficial](https://loveoflesbianband.com/biografia/) | ✅ (oficial) |
| M15 | E3 | D | ¿Cuántas copias había que superar para el disco de oro de *1999* (2011)? | **20.000** | 10.000 · 40.000 · 100.000 | [Wikipedia](https://es.wikipedia.org/wiki/1999_(%C3%A1lbum_de_Love_of_Lesbian)) | 🟡 falta segunda fuente |

### 3.4 Cobertura

| | E1 | E2 | E3 | E4 | E5 | E6 | Total | Listas (✅) |
|---|---|---|---|---|---|---|---|---|
| Fáciles | 3 | 1 | 2 | 3 | 3 | 2 | 14 | 14 |
| Difíciles | 3 | 2 | 5 | 3 | 2 | 3 | 18 | 13 |
| Muy difíciles | 5 | 1 | 3 | 1 | 3 | 2 | 15 | 12 |
| **Total** | 11 | 4 | 10 | 7 | 8 | 7 | **47** | **39** |

Con 39 preguntas sólidas ya hay variedad para que dos partidas seguidas no se repitan por completo. Las metas para la v1 son **60+ preguntas** y **reforzar E2** (*Maniobras* y *Cuentos chinos*), la etapa más débil.

## 4. Datos descartados por fuentes contradictorias

Si alguien conoce una fuente primaria que resuelva la contradicción, el dato puede volver al banco.

| Dato | Contradicción |
|---|---|
| Origen del nombre | La biografía cuenta que una película para adultos se grabó sobre la cinta del bautizo de Santi; el propio Balmes dijo después que el nombre se le ocurrió yendo en moto; Jordi Roig lo liga a una maqueta enviada a un concurso ([Ticketmaster](https://blog.ticketmaster.pe/concierto/love-of-lesbian-como-una-pelicula-para-adultos-cambio-a-una-banda-2625/), [El Universo](https://www.eluniverso.com/entretenimiento/2020/12/30/nota/9118603/love-lesbian-grupo-hombres-que-le-otorgo-nombre-llamativo/), [El Tiempo](https://www.eltiempo.com/cultura/musica-y-libros/hemos-tenido-la-sensacion-de-que-es-un-nombre-equivocado-love-of-lesbian-la-banda-que-puso-a-sonar-indie-pop-y-rock-en-espana-3498840)). *Idea para v2:* pregunta tipo "¿cuál de estas versiones NO ha contado la banda?". |
| Año de *Is It Fiction?* | 2001 en la bio oficial, 2002 en la ficha de la web oficial y en otras discografías. |
| Año del Dream Tour con The Cure | Unas fuentes dicen 2000; la bio no da año. Se pregunta solo por la banda (D03). |
| Año de entrada de Julián Saldarriaga | 2005 en la mayoría de fuentes, 2007 en otra. Se pregunta solo por su rol previo (D04). |
| Fecha exacta de *Cuentos chinos* | 30 de abril o 20 de mayo de 2007. |
| Fecha exacta de *Ejército de salvación* | 10 u 11 de octubre de 2024. |
| Número de canciones de *La noche eterna* | 18 o 19, según la plataforma. |
| Invitados de *Ejército de salvación* (además de Rigoberta Bandini) | Solo los encontré en un resumen; no los vi confirmados en cada ficha. |
| "25 años de carrera" | La prensa lo repite al anunciar la pausa, pero la banda empezó en 1997; no se usa como dato. |
| Vive Latino 2013 como "decimocuarta edición" | Una sola fuente; no se usa. |
