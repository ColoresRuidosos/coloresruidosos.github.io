# BUNNYLAND — Plan técnico

> Deriva de `spec.md` (aprobada el 23 nov 2026): colaboración oficial, arte por código ahora y de Gemini después, motor propio y abrazos.

## 1. Stack
- JavaScript ES2022 en módulos, **sin dependencias en tiempo de ejecución**.
- `esbuild` para empaquetar en un solo `dist/index.html`; `node --test` para unidad y bots; Playwright (Chromium preinstalado) para navegador e iPhone emulado.
- Mismos scripts que los otros juegos: `npm run dev | build | test | publish:web`.

## 2. Bucle y tiempo (F1, F5)
- Paso fijo de 60 Hz (`core/loop.js`) con acumulador; el render interpola. La lógica cuenta **pasos**, no milisegundos, para ser determinista.
- `core/rng.js`: mulberry32 con semilla (`?seed=`). Toda aleatoriedad (Estrellita, Gotita) pasa por ahí.

## 3. Rejilla y movimiento (F1, F8)
- `data/mazes.js`: cada laberinto son 27 filas de la **mitad izquierda** (11 caracteres; se reflejan a 21): `#` muro, `.` zanahoria, `o` Hyperpop, `=` puerta de la nube, `H` casa, `T` túnel, `S` salida del conejo, ` ` vacío. El besito (F9), «Siento que desaparezco» (F10) y el bonus (F7) se colocan solos en la columna central (arriba, abajo y bajo la casa). Las estrellas de la Estrellita son las 4 casillas de Hyperpop.
- `core/grid.js`: parsea, valida (simetría opcional, todas las zanahorias alcanzables desde `S` con BFS, túneles en pares) y expone `vecinos(c)`, `esMuro(c)`, `envolver(x)`.
- Movimiento en sub-casillas (8 sub-pasos por casilla). Giro guardado 15 pasos (250 ms). Velocidades en `data/tuning.js` como fracción de la máxima, por nivel.

## 4. Enemigos (F3–F5, §3.1.1)
- Máquina de estados por enemigo: `casa → saliendo → rondar ⇄ perseguir → triste → nubecita → casa`.
- En cada cruce eligen la casilla vecina (sin dar vuelta en U, salvo al cambiar de fase) que minimiza la distancia a su **objetivo**:
  - Coronado: casilla del conejo. Enojado si zanahorias < 20 %. Si el conejo lleva 2 s quieto, camino más corto (BFS).
  - Osito: 4 casillas delante del conejo; pausa de 18 pasos al chocar.
  - Estrellita: objetivo aleatorio con RNG; teletransporte cada 480 pasos a un `*` con aviso de 60 pasos.
  - Gotita: conejo si distancia > 8; si no, su esquina. Charquito: casilla marcada 120 pasos, velocidad del conejo × 0.7.
- En «rondar», cada uno va a su esquina propia. En «triste», objetivo aleatorio y velocidad × 0.5.

## 5. Partida (F2, F4, F6, F7, F9, F10, F13)
- `game/match.js`: vidas, puntos, cadena de abrazos, bonus por umbral de zanahorias, fin de nivel, récord y medallas (3,500 / 17,000 / 52,600).
- Colisión por casilla **y** por cruce (para que no se atraviesen al ir en sentidos opuestos). Orden de resolución en el mismo cuadro según §4.3.
- Cara del HUD: función pura `cara(porcentaje)` → 5 estados.

## 6. Entrada (F1)
- `input/gestures.js`: deslizar ≥ 20 px en cualquier parte de la pantalla → dirección dominante; flechas/WASD. P1 (2 jugadores): segundo mapeo de teclas.

## 7. Render (F8, F11)
- Canvas 2D, 168×(216+40 HUD) lógicos, escalado entero y *letterbox*.
- `data/sprites.js`: mapas de píxeles de 16×16 en texto (una letra por color de `data/palette.js`): Bunny de frente y de lado × 2 cuadros + cuclillas; 4 enemigos × 2 cuadros + triste; nubecita; zanahorias; bonus; besito; desaparezco. Es dato puro: se prueba en Node.
- `render/sprites.js` convierte cada mapa en un canvas una sola vez y los guarda por nombre. **Cambio a Gemini:** `render/atlas.js` cargará una imagen y un JSON de recortes con los mismos nombres; `getSprite(nombre)` busca primero en el atlas y si no, en los dibujados por código.
- `concepto.html` + Playwright → `art/concepto/hoja-concepto.png` para revisar todo el arte de un vistazo.
- Tema por escenario: colores de muro, fondo y decoración (K12, K17).
- *Glitch* de Hyperpop: desplazamiento horizontal de franjas y separación RGB de 1 px, ≤ 2 cambios/s; desactivado con «menos movimiento».

## 8. Audio (F12)
- `audio/synth.js`: Web Audio, base hyperpop de 140 BPM (bombo, clap con reverb, bajo con sidechain, arpegio agudo con pitch-up), un patrón por escenario. Se desbloquea con el primer toque.
- `audio/sfx.js`: comer (dos tonos alternados), Hyperpop (barrido), abrazo (acorde mayor), vida perdida (bajada triste).

## 9. Compartir (F14)
- `share/card.js`: canvas 1080×1920 → `navigator.share` con archivo si existe; si no, descarga.

## 10. Publicación
- `npm run publish:web` copia a `static/games/bunnyland/`; entrada en `data/games.json` con fecha `desde`.

## 11. Ajuste de dificultad (v0.1)
- `npm run tune`: el bot juega 10 semillas. Al 23 nov 2026: mediana nivel 2, 1/10 completa la gira. El bot es más torpe que una persona (no usa la Hyperpop a propósito); el ajuste fino se hace con pruebas de gente real.
- Velocidades: Bunny 6.5 casillas/s (+0.25 por nivel); enemigos 5.0 (+0.35 por nivel, tope en el nivel 9).

## 12. Riesgos técnicos
| Riesgo | Mitigación |
|---|---|
| Enemigos que se atraviesan con el conejo | Colisión por cruce además de por casilla (test dedicado) |
| Laberinto inválido (zanahoria inalcanzable) | Validación BFS en test de cada laberinto |
| Deslizar en iOS hace scroll o zoom | `touch-action: none` y `preventDefault` en `touchmove` |
| Dificultad mal calibrada | Bots (perfecto, bueno, novato) y `scripts/tune.mjs` |
