# Tareas — SÚPER PEPE (TDD: 🧪 test primero · 🎨 visual · 🎮 se valida jugando)

## Fase 0 — Decisiones (bloquea el arranque)
- [x] D1 Título: «MÉXICO VS. JOSÉ MADERO» · sello JMV = José Madero Vizcaíno
- [ ] D1b Título definitivo confirmado · D2 Alcance de la v1 · D3 ¿Mundo 0 Panda? · D4 ¿Contacto con su equipo? · D5 Aprobar enemigos y jefes

## Fase 1 — Motor (🧪) · prototipo v0.1 ✅ (20 tests, bot completa el nivel)
- [x] E1 🧪 `loop`: paso fijo; N llamadas de render no cambian el estado
- [x] E2 🧪 `physics`: gravedad, velocidad máxima, salto variable (soltar antes = salto más bajo), coyote time y jump buffer (6 frames)
- [x] E3 🧪 `tilemap`: parsear niveles de texto; colisión sólida, semisólida y pinchos; no atravesar paredes a velocidad máxima
- [x] E4 🧪 `camera`: zona muerta y límites
- [ ] E5 🧪 `save`: serializar y deserializar con almacenamiento inyectado; versión del esquema
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
- [ ] J6 🎨 Museo (hub) con 1 puerta + vitrinas
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
- [ ] H5 🧪 Trajes por mundo + Galería del Museo con desbloqueos (guardado en el navegador)
- [~] H6 🎨 Escenarios: Gemini entrega escenas completas, no capas → se usan como **fondo panorámico** (`scripts/import_backdrop.py`, `src/render/backdrop.js`): ✅ 1-1 Calle, ✅ 1-2 Azoteas, ⏳ 1-3 Teatro (sigue el fondo por código)
- [ ] C10 🎨 Arte final sin texto ni sombras (Gemini, un personaje por imagen); logo real de CR (archivo)

## Fase 3 — Mundos 2–8 + epílogo (para cada uno: 🧪 enemigos · 🧪 jefe · 🎨 nivel · 🧪 repetición)
- [ ] W2 Noche · W3 Alba · W4 Psalmos · W5 Giallo · W6 Aurora · W7 Sarajevo · W8 Querido…
- [ ] W9 Rueda de Prensa (intermedio) · W10 🧪 Final «MÉXICO VS. JOSÉ MADERO» (barra de público, ritmo) · W★ La Bestia (secreto)

## Fase 4 — Publicación
- [ ] P1 Accesibilidad (flashes desactivables, modo asistido, remapeo)
- [ ] P2 Créditos con fuentes + aviso de homenaje
- [ ] P3 Build estático < 1 MB + integración en la web
- [ ] P4 Modo grabación 9:16 para reels
