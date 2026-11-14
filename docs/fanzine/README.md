# Fanzine de concierto (F27/D33)

Mini-fanzine de 8 páginas hecho con **una hoja Carta**, una edición por concierto de noviembre de 2026.

| Edición | Concierto | Para imprimir | Para revisar en pantalla |
|---|---|---|---|
| Metropólitan | Teatro Metropólitan · martes 24 nov | `fanzine-metropolitan-imprimir.pdf` | `fanzine-metropolitan-paginas.pdf` |
| Auditorio | Auditorio Nacional · miércoles 25 nov | `fanzine-auditorio-imprimir.pdf` | `fanzine-auditorio-paginas.pdf` |
| Puebla | Tecate Comuna · sábado 28 nov | `fanzine-puebla-imprimir.pdf` | `fanzine-puebla-paginas.pdf` |

## Imprimir

- Hoja **Carta horizontal**, **un solo lado**, **tamaño real (100 %)**. No uses "ajustar a la página".
- La fila de arriba sale de cabeza a propósito: así quedan bien al doblar.
- Antes del tiraje completo, imprime y dobla **uno de prueba**.

## Doblar (1 hoja → 8 páginas)

1. Dobla la hoja a la mitad a lo largo (queda una tira larga), marca bien el doblez y ábrela.
2. Dóblala a la mitad a lo ancho y luego cada mitad otra vez a la mitad: quedan 8 rectángulos marcados. Ábrela.
3. Vuelve a doblarla a la mitad a lo ancho y **corta por el doblez del centro, solo hasta la mitad de la hoja** (el corte va entre las páginas 2-3 y 6-7, sobre el doblez largo).
4. Ábrela, dóblala a lo largo otra vez y empuja los extremos hacia el centro: el corte se abre en forma de rombo.
5. Aplana hasta que quede un librito y dobla las páginas de modo que la portada (página 1) quede afuera.

## Cambiar algo

- **Conciertos:** `data/conciertos_mx.yaml` (una prueba revisa que sigan siendo 47 y en orden).
- **Preguntas:** `PREGUNTAS` en `generar_fanzine.py` (solo ids con `fuerza: solida` de `data/trivia.json`).
- **Textos y diseño:** `fanzine.html`.
- **Regenerar:**
  ```bash
  pip install segno img2pdf pyyaml
  python docs/fanzine/generar_fanzine.py
  ```
  Necesita Node con Playwright (Chromium). Si el Chromium está en otra ruta: `CHROMIUM=/ruta/a/chrome python …`.
