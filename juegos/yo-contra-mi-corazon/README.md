# Yo contra mi corazón

Minijuego de ritmo y box (homenaje no oficial de Colores Ruidosos): el payaso esquiva y batea a un corazón gigante al ritmo de la canción. Se juega en vertical en el celular.

La especificación está en `specs/` (spec, plan y tareas). La hoja de concepto está en `art/concepto/`.

```bash
npm ci
npm test              # 37 tests: reglas, bots, audio simulado y un iPhone emulado (requiere npm run build)
npm run dev           # http://localhost:5175 (sin compilar)
npm run build         # dist/index.html + dist/cancion.mp3
npm run publish:web   # copia a static/games/yo-contra-mi-corazon/
```

**Parámetros para probar:**
- `?sim=8` usa un reloj 8 veces más rápido, sin audio.
- `?bot` hace que juegue solo.
- `?seed=3` fija la pelea.

**Regenerar arte y mapa** (Python con PIL y numpy, más ffmpeg):
```bash
python3 -I scripts/atlas.py
python3 -I scripts/beatmap.py ../../static/games/yo-contra-mi-corazon/cancion.mp3
python3 -I scripts/hoja_concepto.py src/render/font.js art/concepto/hoja-concepto.png
```

**Ajuste fino** en `src/game/constants.js`. Para ver cómo le va a cada tipo de jugador: `node scripts/tune.mjs`.
