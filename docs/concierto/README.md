# Cartel de concierto con QR (F25/D31)

El cartel invita a escanear un QR que abre la trivia y desbloquea la insignia exclusiva **«Noches reversibles»**.
Solo funciona en las fechas de `[params.trivia_concierto]` de `hugo.toml` (hoy: del 24 al 28 de noviembre de 2026, hora de CDMX).

| Archivo | Para qué |
|---|---|
| `cartel-carta.pdf` | Imprimir en hoja Carta (21,6 × 27,9 cm) |
| `cartel-doble-carta.pdf` | Imprimir en Doble Carta / tabloide (27,9 × 43,2 cm) para pegarlo en el puesto |
| `generar_cartel.py` | Vuelve a hacer los dos PDF con el código y las fechas de `hugo.toml` |

**Al imprimir:** tamaño real (100 %), sin "ajustar a la página". Antes de llevarlo al concierto, escanea el QR impreso con dos celulares distintos.

## Cambiar el código

1. En `hugo.toml`, cambia `codigo` (solo letras sin acento y números), y `desde` / `hasta` si hace falta.
2. Regenera el cartel desde la raíz del repo:
   ```bash
   pip install segno img2pdf
   python docs/concierto/generar_cartel.py
   ```
   Necesita Node con Playwright (Chromium). Si el Chromium está en otra ruta: `CHROMIUM=/ruta/a/chrome python …`.
3. Sube los cambios. El sitio usa el código nuevo en cuanto se publica, y el cartel viejo deja de funcionar.

**Ojo:** el repositorio es público, así que el código no es secreto para quien lo lea aquí. Lo que limita el abuso son las fechas. Si el código se filtra antes de tiempo (por ejemplo, la foto de un cartel en redes), cámbialo e imprime de nuevo.
