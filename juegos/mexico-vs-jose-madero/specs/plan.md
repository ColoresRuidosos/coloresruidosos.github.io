# Plan técnico — SÚPER PEPE: 8 MUNDOS

## Estructura
```
projects/super-pepe/
├── index.html            juego (canvas + controles táctiles)
├── specs/                spec.md · plan.md · tasks.md
├── src/
│   ├── engine/           puro y testeado en Node
│   │   ├── loop.js         paso fijo 60 Hz, acumulador
│   │   ├── input.js        estado de botones (teclado/táctil/mando → acciones)
│   │   ├── physics.js      AABB, gravedad, salto variable, coyote time, jump buffer
│   │   ├── tilemap.js      parseo de niveles de texto, colisión con tiles, pendientes
│   │   ├── camera.js       seguimiento con zona muerta, límites del nivel
│   │   ├── entities.js     sistema de entidades (enemigos, objetos, proyectiles)
│   │   └── save.js         serialización del progreso (inyectable: localStorage/memoria)
│   ├── game/
│   │   ├── player.js       estados: pequeño / con púa / invencible; daño, vidas
│   │   ├── enemies/        un archivo por enemigo: update(e, world, dt) puro
│   │   ├── bosses/         máquinas de estados por fase
│   │   ├── powerups.js
│   │   ├── museum.js       hub: puertas, vitrinas, piezas
│   │   └── scenes.js       título, museo, nivel, jefe, hito, créditos
│   ├── render/           Canvas: tiles, sprites 16 bits con contorno, HUD estilo arcade
│   └── audio/            sintetizador chiptune en WebAudio
├── data/
│   ├── worlds.js         paletas, nombres, hitos
│   ├── sources.js        fuentes de cada dato en pantalla
│   ├── sprites.js
│   └── levels/*.txt      mapas de caracteres
└── tests/                node --test (motor, enemigos, jefes, niveles, repeticiones)
```

## Decisiones
1. **Sin framework de juegos.** Un motor pequeño propio da control de píxel, cero dependencias y un despliegue estático de menos de 1 MB. Phaser sería la alternativa si el equipo prefiere editor y ecosistema.
2. **Niveles como texto.** Se editan sin herramientas, se revisan en un PR y se testean (que haya un camino, que haya puerta de jefe, que haya 12–13 piezas).
3. **Repeticiones como tests.** Se graba una secuencia de entradas y se comprueba que el nivel se completa. Así un cambio de física no rompe niveles sin que nos enteremos.
4. **Jefes como máquinas de estados** con fases y patrones de tiempo; cada fase con su test.
5. **Responsive.** En horizontal, el juego ocupa la pantalla. En vertical, juego arriba y cruceta + A/B debajo (encaja con los reels).

## Riesgos técnicos
| Riesgo | Mitigación |
|---|---|
| Audio bloqueado en iOS hasta tocar | Desbloquear WebAudio con el primer «START» |
| Rendimiento en móviles modestos | Tiles prerenderizados por pantalla; nada de `getImageData` en el bucle |
| Sensación de salto (lo más importante) | Afinar con constantes en `physics.js` y repeticiones; prototipo jugable en la fase 1 |

## v5 · Mundo 1 «Carmesí»
- **Módulos nuevos:** `src/game/enemies.js` (IA de todos los enemigos), `src/game/boss.js` (Flash-Bot como máquina de estados), `src/data/world1.js` (tres niveles con su tema). `game.js` queda como orquestador: jugador, micrófono, colisiones, puntuación, Ovación y power-ups.
- **Nuevos caracteres de nivel:** `V` Rumor Volador, `M` Micrófono Traidor, `B` jefe, `A` Amplificador, `+` Carta de fan.
- **Parón de impacto en la lógica** (`g.hitstop`), no en el render: así es determinista y testeable.
- **«En pantalla»** para el Solo de guitarra = a menos de media pantalla (160 px + margen) de Pepe en horizontal, sin depender de la cámara del render.
- **Fondos por código** por tema (`calle`, `azoteas`, `teatro`) en `src/render/themes.js`, con 2 capas de parallax y bloques propios; la paleta sale de los conceptos rescatados.
- **Sprites provisionales:** Rumor y Micrófono Traidor se recortan del concepto de Gemini con `slice_sheet.py`; el Flash-Bot, también (vista de tres cuartos, provisional hasta tener la hoja lateral).
