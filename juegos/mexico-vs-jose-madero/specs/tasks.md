# Tareas — SÚPER PEPE (TDD: 🧪 test primero · 🎨 visual · 🎮 se valida jugando)

## Fase 0 — Decisiones (bloquea el arranque)
- [x] D1 Título: «MÉXICO VS. JOSÉ MADERO» · sello JMV = José Madero Vizcaíno
- [ ] D1b Título definitivo confirmado · D2 Alcance de la v1 · D3 ¿Mundo 0 Panda? · D4 ¿Contacto con su equipo? · D5 Aprobar enemigos y jefes

## Fase 1 — Motor (🧪) · prototipo v0.1 ✅ (20 tests, bot completa el nivel)
- [x] E1 🧪 `loop`: paso fijo; N llamadas de render no cambian el estado
- [x] E2 🧪 `physics`: gravedad, velocidad máxima, salto variable (soltar antes = salto más bajo), coyote time y jump buffer (6 frames)
- [x] E3 🧪 `tilemap`: parsear niveles de texto; colisión sólida, semisólida y pinchos; no atravesar paredes a velocidad máxima
- [x] E4 🧪 `camera`: zona muerta y límites
- [x] E5 🧪 `save`: serializar y deserializar con almacenamiento inyectado; versión del esquema
- [x] E6 🎮 Prototipo: Pepe (sprite del dibujo de CR) corre, salta y lanza el micrófono en un nivel gris

## Fase 1.5 — Arte v3 (hoja oficial de CR)
- [x] A1 🧪 Pipeline de recorte: 29 fotogramas, anclas dentro del fotograma, alturas ≈ 48 px
- [x] A2 🎨 Pepe con los sprites oficiales (reposo, carrera, salto/caída, aterrizaje, lanzar, daño, KO, victoria)
- [x] A3 🧪 Paparazzi: se para, apunta y congela a Pepe si lo tiene delante
- [x] A4 🧪 Reportero: embiste hacia Pepe y descansa
- [x] A5 🎨 Enemigos chibi en SVG → mismo pipeline (Titular, Paparazzi, Reportero)
- [x] A6 Brief para que CR genere las hojas finales de enemigos en el mismo estilo
- [x] A7 🧪 El bot sigue completando el nivel con los nuevos enemigos

## Fase 1.6 — v4: paseos y memorial (pendiente de decisiones)
- [x] V1a Paseos: *Alba* y *Aurora* (*Querido…* es acción)
- [ ] V1b Jefes: revisión del usuario
- [ ] V2 🧪 Modo paseo: sin daño, sin enemigos, pasajes por proximidad, momento final
- [ ] V3 🧪 Memorial «Luciérnagas»: aviso con salto, «alzar la voz» enciende luciérnagas, sin puntos ni derrota, recursos al final
- [ ] V4 Verificar en fuentes oficiales los teléfonos de ayuda (911 y líneas especializadas)
- [ ] V5 Permiso de letras (editor) y consentimiento de la familia para la dedicatoria (a través del equipo de Madero)
- [ ] V6 Revisión del memorial por el equipo de Madero y, si es posible, por una organización especializada

## Fase 2 — Juego base (🧪 + 🎨)
- [ ] J1 🧪 Jugador: daño, invencibilidad tras golpe, muerte, vidas, power-ups
- [ ] J2 🧪 Enemigo base (patrulla, pisotón) + Lunes 28 + Espina
- [ ] J3 🧪 Jefe base (máquina de fases) + La Rosa Carmesí
- [ ] J4 🎨 Mundo 1 «Carmesí» completo (nivel + jefe + hito)
- [ ] J5 🧪 Repetición: el mundo 1 se completa con una secuencia de entradas grabada
- [x] J6 🎨 Museo (hub) con 1 puerta + vitrinas
- [ ] J7 Controles táctiles + mando
- [ ] J8 Chiptune en tiempo real (tema de mundo y de jefe)
- [x] J9 🧪 Micrófono con cable: alcance, retorno, enganche a ganchos
- [x] J10 🧪 Enemigos de prensa recurrentes (Titular, Paparazzi, Micrófono de reportero)

## Fase 2b — v5 · Mundo 1 «Carmesí» (🧪 primero)
- [x] C1 🧪 Ritmo: velocidad 165, impulso al soltar el gancho, parón de impacto, combo y puntuación, cronómetro
- [x] C2 🧪 Titulares genéricos; frase verificada solo al vencer un Titular
- [x] C3 🧪 Ovación + Solo de guitarra (vence a todo lo que hay en pantalla; al jefe, 1 golpe; invulnerable 1 s)
- [x] C4 🧪 Amplificador (alcance ×2, 10 s) y Carta de fan (+1 corazón, máx. 3)
- [x] C5 🧪 Rumor Volador (onda + picado) y Micrófono Traidor (flota, apunta, se lanza)
- [x] C6 🧪 Jefe Cámara Flash-Bot: fases, rayo bajo/alto, solo vulnerable expuesto, fase 2, Disco de Oro
- [x] C7 🎨 Niveles 1-1 Calle, 1-2 Azoteas, 1-3 Teatro con fondos por capas hechos por código
- [x] C8 🧪 Repetición: el bot completa 1-1 y 1-2; un bot de jefe vence al Flash-Bot
- [x] C9 🎨 HUD (marcador, cronómetro, combo, Ovación) + botón ★ táctil
- [x] C11 🧪 Cinemática de entrada del jefe: controles bloqueados, caída del jefe, cartel, saltable, cronómetro parado
- [x] H1 🧪 Datos de la época de Carmesí aprobados (D1–D20 sin dudosos), con fuente y dibujables con la fuente
- [x] H2 🧪 Titulares: un dato distinto cada vez, el contador sigue entre niveles
- [x] H3 🧪 Capítulo al empezar cada nivel y tarjeta «¿Sabías que…?» al terminarlo
- [x] H4 🎨 Piezas = pequeños Carmesís (moneda con rosa)
- [x] H5 🧪 Trajes por mundo + Galería del Museo con desbloqueos (guardado en el navegador)
- [~] H6 🎨 Escenarios: Gemini entrega escenas completas, no capas → se usan como **fondo panorámico** (`scripts/import_backdrop.py`, `src/render/backdrop.js`): ✅ 1-1 Calle, ✅ 1-2 Azoteas, ⏳ 1-3 Teatro (sigue el fondo por código)
- [ ] C10 🎨 Arte final sin texto ni sombras (Gemini, un personaje por imagen); logo real de CR (archivo)

## Fase 2c — v7 · Opciones, guardado, Museo, Galería y Noche (§3.0f; 🧪 primero)
- [x] O1 🧪 `save.js`: valores por defecto, ida y vuelta, datos dañados, sin almacenamiento, migración de `jmv-record` (= E5)
- [x] O2 🧪 Modo asistido: sin perder corazones ni por golpe ni por foso; no cuenta para «sin daño»
- [x] O3 🎨 Opciones Destellos y Temblor en el render + pantalla de Opciones (portada y pausa) (= P1)
- [x] O4 🧪 `progress.js`: marcas por nivel, puertas del museo, desbloqueos de los 8 trajes, traje automático por mundo
- [x] O5 🧪 Museo: pasillo sin enemigos, `doorAt`, puertas abiertas/cerradas según el guardado (= J6)
- [x] O6 🧪 Recorte de trajes: 7 trajes × 4 poses, anclas en los pies, alto ≈ 48 px (`slice_costumes.py`)
- [x] O7 🎨 Galería: vitrinas, reto, equipar; Pepe con el traje elegido y poses de reserva (= H5)
- [x] N1 🧪 Datos N1–N7 con fuente y dibujables; capítulos y tarjetas de los 3 niveles
- [x] N2 🧪 Farol: gasta, mínimo 40 px, lata de aceite lo rellena; `inLight`
- [x] N3 🧪 Invitado enmascarado (1.er golpe: sin máscara, más rápido y sigue atacando; 2.º golpe: vencido; el Solo lo vence de una vez), Murciélago (picado en curva), Fantasma (atraviesa paredes)
- [x] N4 🧪 Jefe Enmascarado: acecho → embestida → aturdido; fase 2 con apagón; 5 golpes; se quita la máscara y deja la Máscara de fiesta
- [x] N5 🎨 Niveles 2-1, 2-2, 2-3 + temas B y N por código + sprites en grises
- [x] N6 🧪 Repetición: el bot completa 2-1 y 2-2; un bot de jefe vence al Enmascarado
- [x] N7 🧪 Navegador: portada → museo → Carmesí; Opciones; Galería; Noche
- [x] W1 Publicar en la web: `static/juegos/mexico-vs-jose-madero/` + enlace en el menú (`npm run publish:web`; se despliega al fusionar en `main`)
- [x] N8 🧪 Enmascarado v7.2: 8 golpes, fase 2 con 4, aturdido 1,0 s, más rápido, doble embestida en la fase 2; la recompensa nunca cae dentro de una pared (🐞 del usuario)
- [x] C12 🧪 🐞 Cámara: el margen por delante de Pepe se desliza al girar (sin saltos de 48 px); movimientos grandes, suavizados; colocación directa al cargar
- [x] H7 🧪 Cada dato una sola vez por mundo (capítulos `uses` + Titulares + tarjetas); Titulares sin dato cuando se acaban; N8 (28 jul 2017)
- [ ] F1 ⏳ Ajustes de jugabilidad con el feedback del usuario (`constants.js`)

## Fase 2d — v8 · Historia, jefe de Noche y arte (⏳ esperando aprobación del usuario; 🧪 primero)
- [x] S1 🧪 Prólogo: 5 viñetas, saltable, solo la primera vez (se guarda); textos ≤ 44 caracteres; datos con fuente y ficción marcada
- [x] S2 🧪 Identidad: retrato de 8 piezas en el Museo, «IDENTIDAD n/8», Pepe desaturado que gana color por mundo
- [x] S3 🧪 «RECUERDO RECUPERADO» al vencer cada jefe; pensamientos en los checkpoints; línea al volver al Museo
- [ ] S4 🧪 Créditos que separan datos con fuente e historia inventada
- [x] B1 🧪 Enmascarado con repertorio: embestida, salto encima, máscaras lanzadas, niebla por detrás, invitados (fase 2); sin repetir dos veces seguidas; PRNG determinista
- [x] B2 🎨 Arena 2-3 con barcas y plataformas
- [x] A7 🎨 Hojas de Noche hechas con **ChatGPT** (prompts §0d): Invitado, Murciélago, Fantasma y Enmascarado → `scripts/slice_rows.py` (nuevo: recorta por filas y huecos y une piezas sueltas) · ⏳ escenarios
- [ ] D8 ⚠️ Verificar «el estadio más grande de México» y el nombre (Foro / Estadio GNP Seguros)

## Fase 2e — v8.1 · Noche en la fiesta (✅ aprobado; 🧪 primero)
- [x] B1 🧪 Enmascarado: repertorio (embestida, salto con ondas, máscaras, niebla, invitados), sin repetir, PRNG determinista, un golpe por ventana
- [x] B2 🎨 Muelle 2-3 más ancho, con barcas y plataformas
- [x] G1 🧪 Disfrazados: regla de los 2 golpes (3 el Gigante), más rápidos sin disfraz; Solo de una vez
- [x] G2 🧪 IA: Gigante (empujón fuerte), Hombre invisible, Hombre anfibio (salta desde el foso), La Llorona (frena 1 s), Charro Negro (embiste)
- [x] G3 🎨 Generador de sprites por código (contorno y 3 tonos) + 5 personajes, con y sin disfraz
- [x] G4 🎨 Niveles 2-1 El Jardín, 2-2 La Casona y 2-3 El Muelle; temas, capítulos y bots que los completan
- [x] S1–S3 de la Fase 2d (prólogo, identidad, recuerdos y pensamientos)

## Fase 2f — v8.2 · Más ayudas (🧪 primero)
- [x] AY1 🧪 Cartas: ≥ 3 por nivel; una cada 6 enemigos vencidos; con el jefe, una cada 2 golpes si falta corazón
- [x] AY2 🧪 Púa de guitarra `J` (15 s) y Antifaz `Z` (8 s, invencible)
- [x] AY3 🧪 Continuar el mundo desde el primer nivel sin superar
- [x] AY4 🎨 Niveles con más cartas, checkpoints y power-ups; iconos, HUD y efectos

## Fase 2g — v8.3 · Salón, color, portada, escenas y festejo (🧪 primero)
- [x] SA1 🎨 Noche: 2-1 La Entrada (afuera), 2-2 El Salón, 2-3 La Pista; fondos por código y suelo ajedrezado; textos sin lago
- [x] SA2 🎨 Pepe a todo color (solo el retrato y la viñeta 4 del prólogo en gris)
- [x] SA3 🎨 Portada solo con el nombre (`GAME_TITLE`) · ⏳ nombre definitivo
- [x] SA4 🧪 Escenas de entrada y de salida de cada mundo (datos con fuente, ficción marcada, saltables)
- [x] SA5 🧪 Pose de festejo al vencer a cada jefe (3 s, saltable a los 0,5 s)

## Fase 2h — v9 · Ilustraciones de escenas y escenarios de Noche (⏳ el usuario genera las imágenes con ChatGPT)
- [x] IL1 Prompts (PROMPTS §0e): 5 del prólogo, 8 de mundos y 3 escenarios de Noche
- [x] IL1b Prompts §0f: El Teatro (1-3) y El Museo
- [x] IL2 🧪 Importador de escenas (320×150, paleta reducida; las de Noche en gris) con respaldo por código si falta alguna
- [x] IL3 🧪 Importador de escenarios de Noche (en gris) sin pisar los de Carmesí · fondos de Teatro, Museo y Noche importados
- [ ] IL4 ⏳ Decidir el tamaño: el HTML pasaría de ~0,9 a ~1,4 MB

## Fase 2i — v9 · Museo con fondo de ChatGPT y exposición (🧪 primero)
- [x] MU1 🧪 `museumExhibits(save)`: 3 cuadros y 3 vitrinas según los mundos terminados (la partitura siempre)
- [x] MU2 🎨 Importar el fondo del Museo sin pisar los de Carmesí; dibujar la exposición en los marcos del fondo

## Fase 2j — v9.1 · Guía de objetos y ganchos (🧪 primero)
- [x] GU1 🧪 Guía: datos de los 8 objetos (caben y se dibujan); explicación la primera vez que se recoge cada uno (se guarda)
- [x] GU2 🎨 Pantalla de la guía (Opciones y pausa ▶)
- [x] HK1 🧪 `aimHook`: gancho al que iría el micro ahora; «B» sobre él; ganchos quietos sin destellos y visibles en la oscuridad

## Fase 2k — v9.2 · Ganchos y datos de Carmesí (🧪 primero)
- [x] HK2 🧪 `hookAhead` y aviso la primera vez que se ve un gancho; cartel del gancho en 1-1
- [x] DC1 🧪 Datos de Carmesí: capítulos con `uses`, cada dato una vez, un Titular por dato (se ven todos)
- [x] DC2 🧪 Datos en pantalla: duración según el largo y en cola

## Fase 2l — v9.4 · Quitar las notas (🧪 primero)
- [x] NT1 🧪 `options.notas` (por defecto SÍ, también en partidas viejas) y la opción en el menú
- [x] NT2 🧪 `hudNotes`: con NO, sin dato, pensamiento ni aviso; el aviso no se da por visto
- [x] NT3 🎨 Tecla N y botón 💬 NOTAS; navegador: alternar y que sobreviva a recargar
- [x] MV1 🧪 Mando táctil en celulares estrechos (navegador de Instagram): a 320, 360, 390 y 412 px se ven ◀ ▶ ★ B y A completos (antes la A quedaba fuera)

## Fase 2m — v9.5 · Sin enlaces junto al mando (🧪 primero)
- [x] LK1 🧪 La página del juego no tiene enlaces (un toque sin querer sacaba del juego); el crédito sigue como texto

## Fase 2n — v9.6 · Saltar la nota (🧪 primero)
- [x] SK1 🧪 `skipNotes`: cierra el dato actual (sale el siguiente de la cola), el pensamiento y el aviso
- [x] SK2 🧪 `drawHud` devuelve dónde dibujó cada nota (con ✕); tocar dentro la salta y no hace saltar a Pepe
- [x] SK3 🎨 Botón ⏭ SALTAR NOTA (solo con nota en pantalla) y tecla S; navegador

## Fase 2o — v9.7 · Escuchar el disco (🧪 primero)
- [x] ES1 🧪 `src/data/escuchar.js`: un disco por mundo jugable; enlaces https a la búsqueda oficial (Spotify, Apple Music y YouTube Music) con artista y disco
- [x] ES2 🧪 `albumFor(screen, run, door)`: el disco del mundo o de la puerta abierta; ninguno en portada ni en puertas cerradas
- [x] ES3 🎨 Botón 🎧 y panel (pausa, 3 plataformas en otra pestaña, Volver al juego); navegador

## Fase 3 — Mundos 2–8 + epílogo (para cada uno: 🧪 enemigos · 🧪 jefe · 🎨 nivel · 🧪 repetición)
- [~] W2 Noche (v7, pendiente de visto bueno de textos y jefe) · W3 Alba (§3.0f Q, Fase 3a) · W4 Psalmos · W5 Giallo · W6 Aurora · W7 Sarajevo · W8 Querido…
- [ ] W9 Rueda de Prensa (intermedio) · W10 🧪 Final «MÉXICO VS. JOSÉ MADERO» (barra de público, ritmo) · W★ La Bestia (secreto)

## Fase 3a — v10 · Mundo 3 «Alba», paseo al amanecer (§3.0f Q; 🧪 primero)
- [ ] AL0 ⏳ El usuario aprueba o edita las 10 reflexiones de los pasajes
- [ ] AL1 🧪 `alba.js`: nostalgia (3 s quieto → retrocede a 20 px/s sin pasar del checkpoint ni caer a un foso)
- [ ] AL2 🧪 Recuerdo `I`: persigue a 30 px/s; al tocar te devuelve 48 px, sin daño; el micrófono lo disuelve
- [ ] AL3 🧪 Maldita Rueda `D`: 4 cabinas semisólidas que giran y te llevan
- [ ] AL4 🧪 Plataformas de luz `~` y Luz del Alba `@` (10 s); sólidas en el tramo ya amanecido
- [ ] AL5 🧪 Paseo: sin daño ni corazones; caer te devuelve al checkpoint
- [ ] AL6 🧪 Pasajes `S` (10, uno por canción, sin repetir) y contador
- [ ] AL7 🧪 Momento final «La Nostalgia»: viento de 40 px/s, unos 400 px caminando → amanecer; no se puede perder
- [ ] AL8 🎨 Niveles 3-1, 3-2 y 3-3 (`scripts/levels_world3.py`), con bots que los completan
- [ ] AL9 🎨 Fondos por código, sprites Neo Geo, escenas de entrada y salida, pensamientos, «¿Sabías que…?» y cuadro 3 del Museo
- [ ] AL10 🧪 Navegador: puerta 3 del Museo → 3-1 → … → momento final → «Recuerdo recuperado»

## Fase 4 — Publicación
- [~] P1 Accesibilidad: ✅ destellos y temblor desactivables, modo asistido (v7) · ⏳ P1b remapeo de teclas
- [ ] P2 Créditos con fuentes + aviso de homenaje
- [ ] P3 Build estático < 1 MB + integración en la web
- [ ] P4 Modo grabación 9:16 para reels
