# Brief: hojas de sprites de enemigos (mismo estilo que la hoja de Pepe)

Los enemigos actuales son **provisionales**: ilustraciones SVG generadas por código (`scripts/enemies-svg.mjs`). Para el arte final, haced una hoja por enemigo **con el mismo formato que `art/source/pepe-sheet.jpg`**. El pipeline la convierte sola al tamaño y la paleta del juego.

## Formato obligatorio (para que el recorte automático funcione)
- **Fondo gris liso y uniforme** (#474747), sin degradados, sin sombras en el suelo y sin cuadrícula.
- Personajes **mirando a la derecha**, de cuerpo entero, **sin tocarse entre sí** (deja aire entre poses).
- **Una fila por animación o grupo**, en el orden de la tabla. Los efectos (destellos, rayas de movimiento) van cerca de su pose.
- Mismo estilo que Pepe: *chibi* con cabeza grande, contorno oscuro grueso, sombreado plano tipo cel, colores saturados y expresiones exageradas.
- **Personajes genéricos:** ni personas reales ni logos de medios. El micrófono del reportero lleva el cubo sin marca.

## Hojas
| Enemigo | Descripción | Filas (poses) |
|---|---|---|
| **Titular** | Periódico vivo con patas cortas y guantes blancos; cara enfadada gritando en la portada del periódico; cabecera negra arriba | Fila 1: andar ×4 · derrotado (arrugado, ojos en X) ×1 |
| **Paparazzi** | Fotógrafo chibi con gorra hacia atrás, gafas de sol, gabardina beige y cámara réflex con flash | Fila 1: andar ×2 · apuntar ×1 · disparar con destello ×1 · derrotado (en el suelo) ×1 |
| **Reportero** | Reportero chibi de traje azul marino, camisa blanca, corbata roja y micrófono con cubo amarillo sin logo; cara de «¿me da una declaración?» | Fila 1: andar ×2 · embestida inclinado hacia delante ×1 · derrotado ×1 |

Para los enemigos de cada disco (Lunes 28, Libro ruso, Fantasma, Maniquí, etc.) se usa el mismo formato: **andar ×2–4 · ataque ×1–2 · derrotado ×1**.

## Cómo entra al juego
```bash
# Paparazzi, por ejemplo (altura del personaje en el juego: 46 px)
python3 scripts/slice_sheet.py art/source/paparazzi.png paparazzi 46 5 "papWalk:2,papAim:1,papFlash:1,papKo:1"
```
El script genera `src/data/<nombre>-atlas.js`. Si los nombres de animación coinciden con los actuales, el juego los usa sin tocar código.
