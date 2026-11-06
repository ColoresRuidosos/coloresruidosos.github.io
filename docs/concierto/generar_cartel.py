"""Cartel de concierto con QR (F26/D32): genera cartel-carta.pdf y cartel-doble-carta.pdf.

Uso (desde la raíz del repo):
    pip install segno img2pdf
    python docs/concierto/generar_cartel.py

Lee el código y las fechas de [params.trivia_concierto] en hugo.toml, arma el QR (corrección M) que
abre https://coloresruidosos.github.io/trivia/?codigo=<código> y dibuja el cartel con cartel.html en
Chromium (Playwright de Node). Si cambias el código en hugo.toml, vuelve a correrlo e imprime de nuevo."""
import io
import json
import subprocess
import tomllib
from datetime import datetime
from pathlib import Path

import img2pdf
import segno
from PIL import Image

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
URL = "https://coloresruidosos.github.io/trivia/?codigo="
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
FORMATOS = {"carta": (8.5, 11), "doble-carta": (11, 17)}


def fechas(desde: str, hasta: str) -> str:
    a, b = datetime.fromisoformat(desde), datetime.fromisoformat(hasta)
    if (a.year, a.month) == (b.year, b.month):
        return f"del {a.day} al {b.day} de {MESES[b.month - 1]} de {b.year}"
    return f"del {a.day} de {MESES[a.month - 1]} al {b.day} de {MESES[b.month - 1]} de {b.year}"


def main():
    conf = tomllib.loads((RAIZ / "hugo.toml").read_text(encoding="utf-8"))["params"]["trivia_concierto"]
    codigo = "".join(ch for ch in conf["codigo"].upper() if ch.isalnum())
    qr = segno.make(URL + codigo, error="m", boost_error=False)
    matriz = [[1 if c else 0 for c in fila] for fila in qr.matrix]
    datos = {"codigo": codigo, "url": URL + codigo, "fechas": fechas(conf["desde"], conf["hasta"]), "qr": matriz}
    (AQUI / "cartel-datos.js").write_text("window.CARTEL = " + json.dumps(datos, ensure_ascii=False) + ";\n", encoding="utf-8")
    for nombre, (ancho, alto) in FORMATOS.items():
        png = AQUI / f"cartel-{nombre}.png"
        subprocess.run(["node", str(AQUI / "render.js"), str(AQUI / "cartel.html"), str(int(ancho * 300)), str(int(alto * 300)), str(png)], check=True)
        b = io.BytesIO()
        Image.open(png).convert("RGB").quantize(colors=128, dither=Image.Dither.NONE).save(b, "PNG", optimize=True, dpi=(300, 300))
        lay = img2pdf.get_layout_fun((img2pdf.in_to_pt(ancho), img2pdf.in_to_pt(alto)))
        (AQUI / f"cartel-{nombre}.pdf").write_bytes(img2pdf.convert([b.getvalue()], layout_fun=lay))
        print(f"cartel-{nombre}.pdf · {datos['url']} · {datos['fechas']}")


if __name__ == "__main__":
    main()
