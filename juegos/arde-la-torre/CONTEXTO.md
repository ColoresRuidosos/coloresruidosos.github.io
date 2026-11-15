# Contexto para retomar «Arde la Torre» en otra sesión

> Última actualización: **15 nov 2026**, juego en la **v0.7** (todo el arte final salvo los retratos comunes; potenciadores F7). Pega este archivo, o su ruta, al empezar una sesión nueva.
> Repo `ColoresRuidosos/coloresruidosos.github.io` · carpeta `juegos/arde-la-torre/` · rama `ccr-7c6a7cf3-vz8zlr` (todo subido; **sin PR**).

## 1. Qué es y cómo trabajamos
- **Juego:** beat 'em up cooperativo de hasta 4 jugadores, **homenaje no oficial** de Colores Ruidosos a **Arde Bogotá**. La banda sube la Torre Picasso (Madrid) para dar un concierto en la azotea que quiere apagar «Silencio S.A.» (empresa ficticia).
- **Cómo se juega:** una pantalla compartida (tele o portátil) y **los móviles como mandos** escaneando un QR, como los juegos de Netflix. También vale teclado (2 jugadores), mandos de consola y **controles táctiles** en la propia pantalla.
- **Metodología obligatoria:** Spec-Driven Development (Dominicode, Bezael Pérez). Antes de programar algo nuevo, se actualizan `specs/spec.md`, `specs/plan.md` y `specs/tasks.md`; después, **orden TDD**: test en rojo → código → verde.
- **El usuario:** escribe en español, no es programador y prefiere respuestas claras y cortas. Un amigo suyo genera las imágenes con Gemini.
- **Reglas de CR:** sin música ni letras de la banda sin licencia (chiptunes originales por código), nada de nombres, sprites ni logos de terceros, rótulo «HOMENAJE NO OFICIAL · @COLORESRUIDOSOS», datos reales verificados con 2 fuentes y **Claude no identifica a personas por la cara** (quién es quién lo dice el usuario).

## 2. Cómo se usa
```bash
cd juegos/arde-la-torre
npm ci
npm test            # 51 tests (simulación, bots que superan todo, red, atlas y navegador con 2 móviles emulados; necesita npm run build)
npm run dev         # servidor local; abrir la URL «en tu red» para que el QR funcione en los móviles
npm run build       # dist/index.html (juego), dist/mando/index.html (mando) y dist/sin-red.html (para el enlace de Claude)
npm run tune        # cómo les va a los bots en cada nivel con 1, 2 y 4 jugadores
python3 -I scripts/slice_sheet.py <músico>   # recorta las hojas de Gemini → atlas del juego
python3 -I scripts/prompts_amigo.py          # regenera los prompts para copiar (MD + página)
```
Parámetros de prueba: `?net=loop` (mandos en otras pestañas), `?bot`, `?sim=6`, `?auto=2`, `?nivel=4`, `?seed=7`, `?nonet`.

## 3. Enlaces (artifacts de Claude del usuario, ahora **públicos**)
| Qué | Enlace | Se publica desde |
|---|---|---|
| Juego jugable (sin móviles como mando: Claude bloquea WebRTC) | https://claude.ai/artifact/QpbaMur1tz8SdLe3sfQRR6 | `dist/sin-red.html` |
| Prompts para el amigo (botón Copiar) | https://claude.ai/artifact/8dLsJM7XCLzyhhswgkLaow | `dist/prompts.html` |

Al republicar, `get_artifact` → `publish_files` con `base_version`, `shared_live: "public"` y `artifact_title`.
⏸ **No se ha publicado en la web de CR** (`static/games/…`): se espera la respuesta de la banda.

## 4. Estado del juego (v0.4)
- **Niveles (spec F6 v3):** Parking (sub-jefe: Jefe de Seguridad) → Vestíbulo (Recepcionista) → Oficinas (Director Comercial) → **Final en la azotea**: el Presidente de Silencio S.A. en batalla cooperativa (F15: escudo al 60 % que se rompe encendiendo amplificadores, 2/3/4 según jugadores, aturdimiento de 4 s; furioso al 30 %) y **rescate de compañeros** (F16, solo en la final).
- **Músicos:** Antonio (voz y guitarra), Pepe (bajo), Dani (guitarra) y Jota (batería). Combo, salto, carrera, agarres, lanzamientos, especial (cuesta 8 % de vida), armas y comida.
- **Pantalla de selección:** cuatro ascensores con retrato, estadísticas y puertas animadas.
- **Mandos:** sala con QR y código (PeerJS), reconexión, entrar a mitad de partida, vibración y controles táctiles en pantalla.
- **Arte final:**
  - ✅ Los 4 músicos (`scripts/slice_sheet.py` desde `art/source/<músico>/`). Jota y Dani usan la misma escala en todas sus hojas (`scale_from_first`). A Jota se le borra al recortar el nombre de otra banda que Gemini le puso en la camiseta (`sin_texto`): mejor regenerar esas hojas con camiseta lisa.
  - ✅ Fondos de parking, vestíbulo, oficinas y azotea (`scripts/fondos.py`: la línea del suelo de la imagen se lleva a la del juego, `ZOOM` 0,75 con suelo y techo prolongados en espejo, repetición horizontal en espejo; la azotea centra el escenario). El del ascensor está guardado sin usar.
  - Escala: músicos y enemigos a ~74 px de pie (`SIZE_MUL` 1,12 en `slice_sheet.py` y `VISUAL_SCALE` en `render/sprites.js`). Retratos con encuadre común (`portrait_crop`) y brillo de piel igualado (`brighten_skin`).
  - ✅ Enemigos y jefes (`art/source/enemigos/<tipo>.jpg`, mismo `slice_sheet.py`; `erase` borra rótulos y `cuts` corta a mano), objetos (`art/source/objetos/objetos.png`) y título (`art/source/fondos/titulo.png`, `fondos.py`).
  - ⏳ Antonio: rehacer movimiento y guitarrazo con la guitarra detrás de la espalda (prompts en la página del amigo; referencia `antonio-referencia-v2`), y quitar entonces `OVERRIDE.antonio` en `render/atlas.js`.
  - ⏳ Retratos iguales: el usuario quiere partir de fotos reales; Gemini no los igualó desde los sprites.
- **Potenciadores (F7, aprobada):** amplificador, pedal, púa de la suerte y pase de backstage (`POWERUPS` en `moves.js`). La Setlist espera a F14.

## 5. Decisiones pendientes del usuario
1. **Diseño de personajes v2** (spec §3.1 y F14): pasivas, golpes de firma, SÚPER y barra de VOLUMEN. Propuesto, **sin aprobar** (T8.3 y T8.4). Los potenciadores (F7) ya están. Los dibujos de los SÚPER de Antonio y Pepe ya están en sus atlas.
2. ¿Dificultad o duración de los niveles?; ¿rescate en todos los niveles o solo en la final?
3. **Fondos:** se recomendó pixel art de Gemini más efectos de profundidad por código (capas, focos, niebla) en lugar de 3D realista, que chocaría con los sprites. Opción posible: experimento «HD-2D» (Three.js) solo en la azotea.

## 6. ⭐ Siguiente tarea: automatizar la generación de imágenes (pedido del usuario, 15 nov 2026)
El usuario tarda mucho haciendo cada hoja a mano en Gemini. **Objetivo:** un script que haga solo lo que hoy hace el amigo.

**Propuesta (escribir antes la spec y las tareas, como siempre):**
- `scripts/generar_arte.mjs` (o `.py`), que:
  1. lee los prompts del mismo origen que `scripts/prompts_amigo.py` (convendría exportarlos a `art/prompts.json` para no duplicarlos);
  2. llama a la **API de Gemini** (modelo de imagen de Google AI Studio; confirmar el nombre y el precio actuales) con el prompt y, cuando el paso lo pide, **la imagen de referencia** (`<músico>-1`, o la foto para el paso 1);
  3. guarda cada resultado como `art/source/<músico>/<músico>-N.jpg` (o `enemigo-N`, `jefe-N`, `fondo-N`);
  4. **valida** la hoja antes de darla por buena (fondo gris liso, número de poses por fila con la misma lógica de `slice_sheet.py`) y reintenta si no cuadra;
  5. al terminar un músico, ejecuta `slice_sheet.py` y deja un resumen con capturas para revisar.
- Opciones: `--solo dani`, `--paso 3`, `--intentos 3`, `--seco` (simula sin llamar a la API).
- **Coste:** cada imagen cuesta unos céntimos por la API (comprobar la tarifa vigente). Ya solo quedan las 2 hojas de Antonio, los retratos y, si se quiere, repetir las de Jota sin texto y la del Director.
- **Lo que necesita el usuario:** una **clave de API de Google AI Studio** (aistudio.google.com). En una sesión en la nube, pedirla con la herramienta de credenciales para el host `generativelanguage.googleapis.com`, nunca pegada en el chat. Si se ejecuta en su ordenador, va en una variable de entorno.
- **Ojo:** Gemini puede negarse a dibujar a personas reales a partir de fotos; en ese caso, usar solo la descripción del prompt.
- Las fotos de referencia de los músicos **no van al repo** (fotos de prensa con derechos).

## 7. Mapa del código
- `src/sim/`: simulación pura y determinista a 60 Hz (`world.js`, `fighter.js`, `combat.js`, `ai.js`, `level.js`, `final.js`, `bot.js`); datos en `moves.js`, `enemies.js` y `src/data/levels.js`.
- `src/input/` (teclado, mandos, táctil y remoto), `src/net/` (protocolo, transporte PeerJS o BroadcastChannel, sala y cliente del mando).
- `src/render/`: `atlas.js` (sprites finales con poses equivalentes), `sprites.js` y `backgrounds.js` (provisionales), `view.js`, `screens.js` y `qr.js`.
- `src/main.js` (pantalla) y `src/pad-main.js` con `mando/index.html` (mando del móvil).
- `scripts/slice_sheet.py`: recorte de hojas. Quita el fondo y solo las rayas **finas** de suelo, separa poses (con corte de respaldo si se tocan filas o columnas), escala por la mediana de poses de referencia con `target` según la postura, aplica paleta fija, contorno y pies alineados, y opcionalmente recolorea (`recolor='pantalon'`). Configuración por músico en `SHEETS`.
- Documentación: `specs/` (spec, plan y tareas), `art/PROMPTS-GEMINI.md` (dirección de arte y quién es quién), `art/SPRITES-PERSONAJES.md` y `art/PROMPTS-PARA-COPIAR.md` (generado).

## 8. Lecciones del arte con Gemini
- Pedir **los mismos colores de ropa** en todas las hojas (a Antonio le cambió el pantalón).
- **Filas bien separadas y sin rayas de suelo** (a Pepe se le tocaban las filas).
- Gemini a veces añade o quita poses: revisar los recuentos y ajustar `rows`, `names` y `skip` en `SHEETS`.
- El retrato de selección sale de la **última hoja** (la de firma, SÚPER y victoria), para que tenga el mismo estilo que los sprites.
- De la hoja de daño de Pepe llegaron 3 versiones; se eligió la que coincide en el color del bajo (las otras están en `art/source/pepe/descartes-*`).
