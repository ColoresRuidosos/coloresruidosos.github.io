# MÉXICO VS. JOSÉ MADERO — prototipo jugable

Homenaje **no oficial** hecho por fans (Colores Ruidosos). Spec en [`specs/`](specs/spec.md).

**Jugar:** abre `dist/mexico-vs-jose-madero.html` (un único archivo de unos 650 KB; funciona sin servidor, también en el móvil). ⏸ Por ahora **no se publica en la web de CR** (decisión del usuario); `npm run publish:web` queda listo para cuando se decida.

**v0.7:** Museo (hub) con 8 puertas · Galería de 8 trajes con retos · Opciones (destellos, temblor, modo asistido, música) con guardado · Mundo 1 «Carmesí» y Mundo 2 «Noche» (farol, Invitados enmascarados (1.er golpe: pierden la máscara y van más rápido; 2.º: vencidos), Murciélagos, Fantasmas y El Enmascarado del Lago).

| Control | Teclado | Táctil | Mando |
|---|---|---|---|
| Mover | ← → / A D | ◀ ▶ | cruceta / stick |
| Saltar (mantén para saltar más) | Z / Espacio | A | A / Cruz |
| Micrófono (golpea, se engancha a ganchos; en el Museo, entrar) | X | B | X / B |
| Pausa (y Opciones) · Música | P / Esc · M | botón ❚❚ PAUSA | — |

```bash
npm test      # 205 tests: motor, guardado, progreso y trajes, Museo, Noche, bots que completan niveles, navegador
npm run dev   # http://localhost:5174
npm run build # dist/mexico-vs-jose-madero.html
npm run publish:web  # ⏸ no usar aún: build + copia a ../../static/juegos/mexico-vs-jose-madero/index.html
```

Qué incluye el prototipo v0.2:
- **Sprites oficiales de Pepe** (hoja de Colores Ruidosos, 29 poses) recortados automáticamente con `scripts/slice_sheet.py`.
- **Enemigos en el mismo estilo:** Titular, **Paparazzi** (el flash te congela) y **Reportero** (embiste). Arte provisional en SVG; brief para el arte final en `art/BRIEF-enemigos.md`.
- Física con salto variable, *coyote time* y *jump buffer*.
- Micrófono con cable y asistencia de puntería hacia los ganchos.
- Enemigo Titular que muestra frases verificadas, con fuente, al derrotarlo.
- 14 piezas del museo, pinchos, fosos, checkpoints con banderín JMV y la puerta de la «Sala 1».
- Música original, controles de teclado, táctiles y de mando, y récord de tiempo guardado en el navegador.

**Música:** todo es original. Usar canciones de José Madero, aunque sea en chiptune, requiere licencia del editor.
