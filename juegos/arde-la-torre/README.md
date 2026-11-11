# Arde la Torre (título provisional)

Beat 'em up cooperativo para hasta 4 jugadores, homenaje no oficial de Colores Ruidosos a **Arde Bogotá**: la banda sube la Torre Picasso en 5 niveles (parking, vestíbulo, ascensor, oficinas y azotea) para dar su concierto. Se juega en una pantalla compartida y **cada jugador usa su móvil como mando** escaneando un QR, como los juegos de Netflix en la tele. También vale el teclado (2 personas) y los mandos de consola.

**Estado:** v0.1 jugable con **arte provisional dibujado por código**. El arte final sale de las hojas de Gemini (`art/PROMPTS-GEMINI.md`). ⏸ No se publica en la web hasta tener la respuesta de la banda.

## Probarlo

```bash
npm ci
npm run dev        # abre la URL «en tu red» en el portátil o la tele; los móviles en la misma wifi escanean el QR
npm test           # 41 tests: simulación, bots que superan los 5 niveles, red, y una pantalla con 2 móviles emulados (tras npm run build)
npm run build      # dist/index.html (juego, ~196 KB) y dist/mando/index.html (mando, ~117 KB)
npm run tune       # cómo les va a los bots en cada nivel con 1, 2 y 4 jugadores
```

> Abre la pantalla con la IP de tu red (la que imprime `npm run dev`), no con `localhost`: el QR lleva esa dirección y el móvil tiene que poder llegar a ella.

| Control | Teclado J1 | Teclado J2 | Mando | Móvil |
|---|---|---|---|---|
| Moverse | WASD | Flechas | Cruceta o stick | Joystick (mitad izquierda) |
| Golpe (unirse, listo, aceptar) | F o Espacio | K, Intro o 1 del teclado numérico | X / Cuadrado | GOLPE |
| Salto | G | L | A / Cruz | SALTO |
| Especial (o golpe + salto) | H | Ñ | B / Círculo o Y / Triángulo | ESPECIAL |
| Pausa | Esc o P | Retroceso | Start | ❚❚ |

Doble toque adelante: correr. Empujar contra un enemigo: agarrarlo (luego golpe para dar rodillazos, adelante + golpe para lanzarlo).

**Parámetros de prueba:** `?net=loop` (mandos por BroadcastChannel en otras pestañas, sin internet), `?bot` (juegan los bots), `?sim=6` (6 veces más rápido), `?auto=2` (2 jugadores de teclado y empieza ya), `?nivel=3`, `?seed=7`, `?nonet` (sin sala).

## Documentación

| Documento | Qué contiene |
|---|---|
| [`specs/spec.md`](specs/spec.md) | Visión, usuarios, funcionalidades, flujos, arquitectura, NFR y decisiones |
| [`specs/plan.md`](specs/plan.md) | Decisiones técnicas: motor propio en Canvas, PeerJS para los mandos y el camino del arte con IA |
| [`specs/tasks.md`](specs/tasks.md) | Tareas en orden TDD y su estado |
| [`art/PROMPTS-GEMINI.md`](art/PROMPTS-GEMINI.md) | Prompts listos para generar los sprites y los fondos |

## Estructura

- `src/sim/`: la simulación pura y determinista (sin DOM): combate, IA, niveles y bots.
- `src/input/`: teclado, mandos y mando remoto, más los huecos J1–J4.
- `src/net/`: protocolo, transporte (PeerJS o local), sala y cliente del móvil.
- `src/render/`: arte provisional, fondos, HUD, pantallas y QR.
- `src/audio/`: chiptunes originales por código.
- `src/main.js`: la pantalla. `src/pad-main.js` y `mando/index.html`: el mando.
