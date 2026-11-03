# canciones.md — banco del contrarreloj "¿De qué disco es?" (F16)

> Anexo de `spec.md` (F16) y `plan.md` (D22). Es la fuente de verdad que revisan los fans antes de que una canción pase a `data/canciones.json`.

## 0. Reglas

Son las mismas de `docs/trivia.md` §0, más tres propias de este juego:

1. **Solo discos de estudio.** Los 10: de *Microscopic Movies* a *Ejército de salvación*. Nada de EP, sencillos, directos ni recopilaciones.
2. **Fuera las canciones que se llaman como su disco** (por ejemplo "1999" o "El poeta Halley"): serían regaladas.
3. **Fuera las canciones que aparecen en más de un disco de estudio** y los interludios (por ejemplo "Momento de reflexión #1").
4. **Fuerza de la fuente:** ✅ la web oficial o dos fuentes independientes que coinciden en que la canción está en ese disco; 🟡 una sola fuente, que **no se juega** hasta tener una segunda.
5. **Revisión fan.** Las fuentes salieron de un buscador que lee fragmentos, no la página completa. Todas las canciones están como `propuesta` hasta que un fan abre los enlaces y confirma.
6. **Títulos como en la ficha del disco**, sin letras.

## 1. Discos y sus fuentes

| ID | Disco | Año | Etapa | Fuentes del tracklist |
|---|---|---|---|---|
| MM | *Microscopic Movies* | 1999 | E1 | [YouTube, álbum completo](https://www.youtube.com/watch?v=v4QhQywwYJE) |
| IF | *Is It Fiction?* | 2002 | E1 | [Charts in France](https://www.chartsinfrance.net/Love-of-Lesbian/albums-singles.html,p3) |
| UG | *Ungravity* | 2003 | E1 | [La Higuera](https://www.lahiguera.net/musicalia/artistas/love_of_lesbian/disco/3645) |
| ME | *Maniobras de escapismo* | 2005 | E2 | [Discogs](https://www.discogs.com/release/2985888-Love-Of-Lesbian-Maniobras-De-Escapismo) · [Todomúsica](https://www.todomusica.org/love_of_lesbian/disco_maniobras_de_escapismo.shtml) · [El Corte Inglés](https://www.elcorteingles.es/musica/A58540018-maniobras-de-escapismo-cd/) |
| CC | *Cuentos chinos para niños del Japón* | 2007 | E2 | [Charts in France](https://www.chartsinfrance.net/Love-of-Lesbian/albums-singles.html,p3) · [musica.com](https://www.musica.com/love-of-lesbian/cuentos-chinos-para-ninos-del-japon/canciones-del-disco) (solo las 6 primeras) |
| 99 | *1999* | 2009 | E3 | [El Corte Inglés](https://www.elcorteingles.es/musica/A54700374-1999-o-como-generar-incendios-lp-vinilo) · [Deezer](https://www.deezer.com/en/album/298527) |
| NE | *La noche eterna. Los días no vividos* | 2012 | E3 | [La Higuera](https://www.lahiguera.net/musicalia/artistas/love_of_lesbian/disco/4700/) · [Buenamúsica](https://buenamusica.com/love-of-lesbian/album/la-noche-eterna-los-dias-no-vividos) · [Deezer](https://www.deezer.com/album/2844041) |
| PH | *El poeta Halley* | 2016 | E4 | [Buenamúsica](https://buenamusica.com/love-of-lesbian/album/el-poeta-halley) · [El Corte Inglés](https://www.elcorteingles.es/musica/A23043152-el-poeta-halley-cd/) |
| VH | *V.E.H.N.* | 2021 | E5 | [La Higuera](https://www.lahiguera.net/musicalia/artistas/love_of_lesbian/disco/10974/) (sin tracklist completo en las búsquedas) |
| ES | *Ejército de salvación* | 2024 | E6 | [El Corte Inglés](https://www.elcorteingles.es/musica/A51520522-ejercito-de-salvacion-lp-vinilo/) · [First City Records](https://firstcityrecordstore.com/products/love-of-lesbian-ejercito-de-salvacion-spa-lp) · [La Higuera](https://www.lahiguera.net/musicalia/artistas/love_of_lesbian/disco/13478/) |

## 2. Canciones (v1, estado: `propuesta`)

Las fuentes de cada canción son las de su disco (§1), salvo cuando la fila dice otra cosa.

| ID | Canción | Disco | Fuerza | Nota |
|---|---|---|---|---|
| ME01 | Carta a todas tus catástrofes | ME | ✅ | |
| ME02 | Domingo astromántico | ME | ✅ | |
| ME03 | Mi personulidad | ME | ✅ | Algunas fuentes escriben "Mi persunalidad" |
| ME04 | Houston, tenemos un poema | ME | ✅ | |
| ME05 | Mi primera combustión | ME | ✅ | |
| ME06 | Música de ascensores | ME | ✅ | |
| ME07 | Marlene, la vecina del ártico | ME | ✅ | Una fuente la parte en dos títulos; confirmar en el CD |
| ME08 | Los niños del mañana | ME | ✅ | |
| ME09 | Me llaman Octubre | ME | ✅ | |
| ME10 | Limousinas | ME | ✅ | |
| CC01 | Universos infinitos | CC | ✅ | |
| CC02 | La niña imantada | CC | ✅ | |
| CC03 | Noches reversibles | CC | ✅ | |
| CC04 | Los colores de una sombra | CC | ✅ | |
| CC05 | Un día en el parque | CC | ✅ | |
| CC06 | Villancico para mi cuñado Fernando | CC | ✅ | musica.com la corta como "Villancico para mi cuñado" |
| CC07 | Me amo | CC | 🟡 | |
| CC08 | Shiwa | CC | 🟡 | El disco trae también "Shiwa (Tot a zen)" |
| CC09 | Historia de una hache que no quería ser muda | CC | 🟡 | |
| CC10 | La parábola del tonto | CC | 🟡 | |
| CC11 | Dios por Dios es cuatro | CC | 🟡 | |
| 9901 | Allí donde solíamos gritar | 99 | ✅ | |
| 9902 | Club de fans de John Boy | 99 | ✅ | |
| 9903 | Las malas lenguas | 99 | ✅ | |
| 9904 | Algunas plantas | 99 | ✅ | |
| 9905 | Cuestiones de familia | 99 | ✅ | |
| 9906 | El ectoplasta | 99 | ✅ | |
| 9907 | Segundo asalto | 99 | ✅ | |
| 9908 | Incendios de nieve | 99 | ✅ | |
| 9909 | Te hiero mucho (Historia del amante guisante) | 99 | ✅ | |
| 9910 | Cuando diga ya | 99 | ✅ | |
| 9911 | Miau | 99 | ✅ | |
| 9912 | La mirada de la gente que conspira | 99 | ✅ | El Corte Inglés da 13 pistas y Deezer 14: confirmar si falta alguna |
| NE01 | Los seres únicos | NE | ✅ | |
| NE02 | Si tú me dices Ben, yo digo Affleck | NE | ✅ | |
| NE03 | Nada | NE | ✅ | |
| NE04 | Belice | NE | ✅ | |
| NE05 | Pizzigatos | NE | ✅ | |
| NE06 | 667 | NE | ✅ | |
| NE07 | Cínicamente muertos | NE | ✅ | |
| NE08 | Orden de desahucio en mi menor | NE | ✅ | |
| NE09 | Oniria e insomnia | NE | ✅ | |
| NE10 | Nadie por las calles | NE | ✅ | |
| NE11 | El hambre invisible | NE | ✅ | |
| NE12 | Wio, antenas y pijamas | NE | ✅ | |
| NE13 | Si salimos de esta | NE | ✅ | |
| NE14 | Tercero segunda | NE | ✅ | |
| NE15 | Radio Himalaya | NE | ✅ | |
| NE16 | Los toros en la Wii (Fantástico) | NE | ✅ | |
| PH01 | Planeador | PH | ✅ | |
| PH02 | Bajo el volcán | PH | ✅ | |
| PH03 | Cuando no me ves | PH | ✅ | |
| PH04 | Los males pasajeros | PH | ✅ | |
| PH05 | I.M.T. (Incapacidad Moral Transitoria) | PH | ✅ | |
| PH06 | En busca del mago | PH | ✅ | |
| PH07 | Océanos de sed | PH | ✅ | |
| PH08 | Psiconautas | PH | ✅ | |
| PH09 | Canción de bruma | PH | ✅ | Ojo: Santi Balmes también tiene un libro con ese título |
| PH10 | Contraespionaje | PH | ✅ | |
| PH11 | El yin y el yen | PH | ✅ | |
| PH12 | El ciclo lunar de Halley Star | PH | ✅ | |
| VH01 | Cosmos (Antisistema Solar) | VH | ✅ | [Qué!](https://www.que.es/2020/11/25/love-of-lesbian-cosmos-antisistema-solar/) · [Estrellas en la Mira](https://estrellasenla.com/2021/09/29/el-grupo-espanol-love-of-lesbian-nominado-a-3-premios-grammy-latino-2021/) |
| VH02 | El sur | VH | ✅ | [La Higuera](https://www.lahiguera.net/musicalia/artistas/love_of_lesbian/disco/10974/tema/24773/) · [Qué!](https://www.que.es/2021/03/09/love-of-lesbian-bunbury-el-sur/) |
| VH03 | El mundo | VH | ✅ | [Qué!](https://www.que.es/2021/01/28/el-mundo-love-of-lesbian/) · [La Higuera](https://www.lahiguera.net/musicalia/artistas/love_of_lesbian/disco/10974/) |
| VH04 | Catalunya bondage | VH | 🟡 | [Rocksesión](https://rocksesion.com/2021/04/22/love-of-lesbian-v-e-h-n-viaje-epico-hacia-la-nada/) · [Popelera](https://www.popelera.net/love-of-lesbian-disco-v-e-h-n/) (confirmar en las dos) |
| VH05 | El paso | VH | 🟡 | |
| VH06 | Viento de oeste | VH | 🟡 | |
| ES01 | Canción de emergencias | ES | ✅ | |
| ES02 | ¿Qué vas a saber? | ES | ✅ | |
| ES03 | La hermandad | ES | ✅ | |
| ES04 | Contradicción | ES | ✅ | |
| ES05 | Tesis | ES | ✅ | |
| ES06 | Una conversación pendiente | ES | ✅ | |
| ES07 | La Champions y el Mundial | ES | ✅ | |
| ES08 | El día que Starman huyó | ES | ✅ | |
| ES09 | La herida | ES | ✅ | |
| ES10 | Ya sale el sol | ES | ✅ | |
| IF01 | All These Days | IF | 🟡 | |
| IF02 | Evasive | IF | 🟡 | |
| IF03 | A Day in the Park | IF | 🟡 | No confundir con "Un día en el parque" (CC05) |
| IF04 | Lou Reed in My City | IF | 🟡 | |
| IF05 | Stupid at All | IF | 🟡 | |
| IF06 | Move On | IF | 🟡 | |
| IF07 | Wasted Days | IF | 🟡 | |
| IF08 | Transexual Soul | IF | 🟡 | |
| IF09 | Make Up | IF | 🟡 | |
| UG01 | Hi to the Next Times | UG | 🟡 | |
| UG02 | Satellites | UG | 🟡 | |
| UG03 | Macba Girl | UG | 🟡 | |
| MM01 | Unreal | MM | 🟡 | |
| MM02 | Fame Junkie | MM | 🟡 | |
| MM03 | Marry Monday | MM | 🟡 | |
| MM04 | Beth | MM | 🟡 | |
| MM05 | Circle Moon | MM | 🟡 | |
| MM06 | Freakie Goes to Hollywood | MM | 🟡 | |

### Cobertura

| Disco | ✅ | 🟡 |
|---|---|---|
| Maniobras de escapismo | 10 | 0 |
| Cuentos chinos | 6 | 5 |
| 1999 | 12 | 0 |
| La noche eterna | 16 | 0 |
| El poeta Halley | 12 | 0 |
| V.E.H.N. | 3 | 3 |
| Ejército de salvación | 10 | 0 |
| Etapa en inglés (3 discos) | 0 | 18 |
| **Total** | **69** | **26** |

Con 69 canciones sólidas una partida de 60 segundos no se queda sin canciones. Los huecos más grandes son *V.E.H.N.* y los tres discos en inglés: con el tracklist completo de cada uno (la contraportada o la ficha oficial) se completa el banco.

## 3. Datos descartados

| Dato | Motivo |
|---|---|
| "Shine It" / "Shine It All" (*Is It Fiction?*) | Dos fuentes la escriben distinto. |
| "Mon petit cabroin" (*Maniobras*) | Pista extra que solo aparece en una edición. |
| "Shiwa (Tot a zen)", "Momento de reflexión #1", "Moment de reflexió #2" (*Cuentos chinos*) | Versión repetida e interludios. |
