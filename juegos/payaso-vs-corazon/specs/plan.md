# PAYASO VS. CORAZÓN — Plan técnico

> Deriva de [`spec.md`](spec.md). Cada decisión cita la funcionalidad (F) o el requisito no funcional (NFR) que atiende.

## 1. Stack
| Pieza | Decisión | Por qué |
|---|---|---|
| Motor | Propio, en Canvas 2D, a 180×320 lógicos | Igual que *México vs. José Madero*; sin dependencias en tiempo de ejecución (NFR peso) |
| Audio | Web Audio API (`AudioBufferSourceNode`) | El reloj de audio es la única fuente de tiempo fiable para el ritmo (F2) |
| Tests | `node --test` y Playwright con Chromium preinstalado (`devices['iPhone 13']`) | Lo mismo que en el repo |
| Build | esbuild, que genera un solo HTML; el MP3 va aparte | NFR peso y arranque |
| Análisis de la canción | Python con numpy (sin scipy, que no está en el entorno) | Ya se hizo un primer análisis: 168 BPM |

## 2. Tiempo y ritmo (F2, F3)
- `clock.js`:
  - `songTime = ctx.currentTime − startAt − outputLatency − userOffset`;
  - `beat = (songTime − firstBeat) / (60 / BPM)`.
- El bucle del juego avanza a paso fijo de 60 Hz para la animación, pero **toda decisión de juego usa `songTime`**. Así un cuadro perdido no mueve el ritmo.
- `judge.js` es una función pura: `judge(tAcción, tObjetivo, asistido) → 'perfecto' | 'bien' | 'fuera'`.
- Las acciones se marcan con `performance.now()` en el evento táctil y se convierten a `songTime` con un ancla medida en cada cuadro. Así se evita perder la precisión de 16 ms del cuadro.

## 3. Mapa de la canción (`scripts/beatmap.py` → `src/data/beatmap.js`)
1. Decodifica con ffmpeg (mono, 11 025 Hz).
2. Calcula el flujo espectral, el tempo por comb filter (resultado: 168,0 BPM) y la fase del primer pulso.
3. Detecta secciones por la energía RMS en ventanas de 4 s. Esas fronteras se **ajustan a mano** a compases (`SECCIONES` en el script).
4. Exporta `{ bpm, firstBeat, duration, sections: [{ from, to, kind }] }`.

El script se corre una vez. El MP3 no entra al repo; el mapa sí (son solo números).

## 4. El corazón (F4)
- **Máquina de estados:** `guardia → aviso → golpe → (abierto | recupera) → guardia`, más `aturdido` (Grito), `transicion` (fase) y `ko`.
- **Patrones por sección** (`patterns.js`): listas de compases como `['gIzq', '-', 'latido', '-']`, donde cada elemento es un tiempo de 168 BPM agrupado por 2 (es decir, 84 BPM).
  - La **fase 1** usa avisos de 2 tiempos.
  - Las **fases 2 y 3** usan 1 tiempo.
  - Con la semilla fija se elige entre variantes, para no repetir la misma secuencia dos veces seguidas.
- **Fase 3:** dos sub-entidades (`mitadIzq` y `mitadDer`) que se turnan.

## 5. Payaso y partida (F5–F8)
- `clown.js`: estados `listo`, `esquivaIzq`, `esquivaDer`, `agachado` (300 ms), `batazo` (150 ms), `grito` y `golpeado`.
- `match.js`:
  - vidas;
  - el público: +1 estrella cada 4 Perfectos seguidos y −1 al recibir un golpe;
  - puntos, rango, K.O. y decisión.
- **Ajuste fino:** todas las constantes van en `constants.js`, como en el juego principal.

## 6. Entrada (F1)
`gestures.js`:
- máquina por puntero: `pointerdown → move → up`;
- deslizar si el desplazamiento es de 24 px o más (en px de pantalla), en la dirección dominante;
- tocar si dura menos de 200 ms y se mueve menos de 24 px;
- el botón del micro es una zona circular;
- `touch-action: none`;
- el teclado se traduce a las mismas acciones.

## 7. Render (F9, F11)
- **Sprites por código**, generados al arrancar en `OffscreenCanvas` y con la misma técnica que la hoja de concepto (contorno + 3 tonos, `scripts/hoja_concepto.py`). Se porta a JS en `render/sprites.js`. Así no hay imágenes que pesen y el estilo queda idéntico.
- **Animación:**
  - el corazón «late» en cada tiempo (escala vertical de 1 px);
  - el escenario cambia la luz por sección;
  - los murciélagos se mueven a medio tiempo.
- **Sin destellos:** el brillo amarillo del aviso pasa a ser un contorno fijo y sin parpadeo.

## 8. Audio (F2, F12)
- `player.js`:
  - `fetch` del MP3 con progreso, luego `decodeAudioData`;
  - desbloqueo en el primer toque;
  - pausa con `ctx.suspend()` y reanudación con cuenta de 3 tiempos.
- **Efectos (`sfx.js`):** osciladores de Web Audio para el aviso, el batazo, el golpe recibido y el público. No se usan muestras de terceros.

## 9. Compartir (F10)
- Canvas de 1080×1920 con el escenario escalado, el payaso, el rango, los puntos y «@coloresruidosos».
- `navigator.share({ files })` si está disponible; si no, una descarga con `<a download>`.

## 10. Publicación
- `npm run publish:web` copia `dist/` a `static/games/payaso-vs-corazon/`.
- La tarjeta va en `data/games.json`, con su fecha de salida.
- **Solo cuando se resuelva la pregunta legal de la canción** (spec §6.1).

## 11. Riesgos técnicos
| Riesgo | Mitigación |
|---|---|
| Latencia de audio en Android (hasta 100 ms o más) | `outputLatency`, la calibración P1 y ventanas generosas en la fase 1 |
| Safari pausa el `AudioContext` | Se escucha `statechange` y se muestra «Toca para seguir» |
| El tempo medido no cuadra en algún tramo (por ejemplo, un ritardando) | Revisar a oído; si cambia, el mapa admite segmentos con su propio BPM |
| Toques accidentales al deslizar | Umbral de 24 px y prueba con usuarios reales (T-UX) |
