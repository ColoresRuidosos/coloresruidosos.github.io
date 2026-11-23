# BunnyLand

Juego de laberinto y persecución con **Hanzer Bunny** (colaboración oficial **Hanzer × Colores Ruidosos**). El Bunny come zanahorias por 5 escenarios de la gira y, con la Zanahoria Hyperpop, **abraza** a los personajes de su universo: el Coronado, el Osito Sesión, la Estrellita y la Gotita. Se juega en vertical en el celular deslizando el dedo, o con flechas/WASD.

La especificación está en `specs/` (spec, plan y tareas, método SDD). La hoja de concepto está en `art/concepto/hoja-concepto.png`.

```bash
npm ci
npm run build         # dist/index.html (un solo archivo, ~45 KB, sin audio ni fotos)
npm test              # 46 tests: reglas, bots, sprites, audio simulado y un iPhone emulado (requiere build)
npm run dev           # http://localhost:5177 (sin compilar)
npm run tune          # cómo le va al bot en 10 semillas
npm run concepto      # regenera la hoja de concepto
npm run publish:web   # copia a static/games/bunnyland/
```

**Parámetros para probar:** `?seed=3` fija la partida · `?bot` juega solo · `?nivel=4` empieza en BunnyLand · `?sim=4` va 4 veces más rápido · `?menos` sin glitch · `?mudo`.

**Ajuste fino:** `src/data/tuning.js`. **Laberintos:** `src/data/mazes.js` (mitad izquierda; se reflejan).

## Cambiar al arte de Gemini (T5.5)
El juego pide cada dibujo por nombre (ver la hoja de concepto). Para cambiarlo, las hojas de Gemini deben traer **cada cuadro de 16×16 px** (el `mini.vida`, de 8×8), con **fondo transparente** y los mismos nombres:
- Bunny: `bunny.frente.0/1`, `bunny.lado.0/1` (mirando a la derecha), `bunny.espalda.0/1`, `bunny.cuclillas`.
- Enemigos: `coronado.0/1`, `osito.0/1`, `estrellita.0/1`, `gotita.0/1` y sus versiones `.triste.0/1` (azules, tristes).
- Objetos: `nube.0`, `item.hyper`, `item.besito`, `item.desaparezco`, `bonus.estrella`, `bonus.bolsita`, `bonus.koi`, `bonus.micro`, `bonus.nube`, `mini.vida`.

`registerAtlas(imagen, { nombre: [x, y, ancho, alto] })` en `src/render/sprites.js` reemplaza los dibujos por código sin tocar la lógica.
