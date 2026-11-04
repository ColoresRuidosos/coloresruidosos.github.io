"""Fanzine de concierto (F26/D32): un PDF por edición, ya impuesto en Carta, más una vista en orden.

Uso (desde la raíz del repo):
    pip install segno img2pdf pyyaml
    python docs/fanzine/generar_fanzine.py

Lee data/conciertos_mx.yaml, data/trivia.json y [params.trivia_concierto] de hugo.toml; dibuja las páginas con
fanzine.html en Chromium (Playwright de Node) y las acomoda para el "one-sheet zine": hoja Carta horizontal,
fila de arriba de cabeza (5 4 3 2) y fila de abajo (6 7 8 1)."""
import io
import json
import random
import subprocess
import tempfile
import tomllib
from collections import Counter
from datetime import date
from pathlib import Path

import img2pdf
import segno
import yaml
from PIL import Image

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
PREGUNTAS = ["D12", "F05", "D03"]  # del banco verificado (fuerza sólida)
EDICIONES = {
    "metropolitan": {"nombre": "Edición Metropólitan", "recinto": "Teatro Metropólitan", "color": "#2F5BFF", "texto": "#F4EFE6",
                     "sede": lambda k: k["recinto"] == "Teatro Metropólitan", "donde": "en el Teatro Metropólitan",
                     "leyenda": "sus noches en el Metropólitan"},
    "auditorio": {"nombre": "Edición Auditorio", "recinto": "Auditorio Nacional", "color": "#FF3E7F", "texto": "#141414",
                  "sede": lambda k: k["recinto"] == "Auditorio Nacional", "donde": "en el Auditorio Nacional",
                  "leyenda": "Auditorio y Lunario"},
    "puebla": {"nombre": "Edición Puebla", "recinto": "Tecate Comuna · Puebla", "color": "#FF7A30", "texto": "#141414",
               "sede": lambda k: k["ciudad"] in ("Puebla", "San Andrés Cholula"), "donde": "en Puebla",
               "leyenda": "sus conciertos en Puebla"},
}
# Fila de arriba de cabeza (5 4 3 2), fila de abajo (6 7 8 1).
IMPOSICION = [(5, 0, 0, True), (4, 1, 0, True), (3, 2, 0, True), (2, 3, 0, True), (6, 0, 1, False), (7, 1, 1, False), (8, 2, 1, False), (1, 3, 1, False)]
PW, PH = 825, 1275


def fecha_texto(d: date) -> str:
    return f"{d.day} {MESES[d.month - 1][:3]} {d.year}"


def ordinal(n: int) -> str:
    return f"{n}.ª"


def datos():
    zm = yaml.safe_load((RAIZ / "data/conciertos_mx.yaml").read_text(encoding="utf-8"))
    conciertos = zm["conciertos"]
    trivia = {p["id"]: p for p in json.loads((RAIZ / "data/trivia.json").read_text(encoding="utf-8"))["preguntas"]}
    preguntas = []
    for pid in PREGUNTAS:
        p = trivia[pid]
        assert p["fuerza"] == "solida", pid
        ops = [p["correcta"]] + p["incorrectas"]
        random.Random(pid).shuffle(ops)
        preguntas.append({"pregunta": p["pregunta"], "opciones": ops, "correcta": ops.index(p["correcta"])})
    conf = tomllib.loads((RAIZ / "hugo.toml").read_text(encoding="utf-8"))["params"]["trivia_concierto"]
    codigo = "".join(ch for ch in conf["codigo"].upper() if ch.isalnum())
    url = "https://coloresruidosos.github.io/trivia/?codigo=" + codigo
    matriz = [[1 if v else 0 for v in fila] for fila in segno.make(url, error="m", boost_error=False).matrix]
    cdmx = sum(1 for k in conciertos if k["ciudad"] == "CDMX")
    ediciones = {}
    for clave, e in EDICIONES.items():
        prox = next(p for p in zm["proximos"] if p["edicion"] == clave)
        antes = [k for k in conciertos if e["sede"](k)]
        extra = []
        if clave == "auditorio":
            lun = [k for k in conciertos if k["recinto"] == "Lunario del Auditorio Nacional"]
            extra.append("Y en el Lunario, su hermano chico: " + ", ".join(fecha_texto(k["fecha"]) for k in lun) + ".")
        if clave == "metropolitan":
            pares = Counter(k["fecha"].year for k in antes)
            dobles = [a for a, n in pares.items() if n > 1]
            if dobles:
                extra.append("En " + ", ".join(map(str, dobles)) + " tocaron dos noches seguidas.")
        if clave == "puebla":
            extra.append("Es su última fecha anunciada en México antes de la pausa.")
        if clave != "puebla":
            extra.append(f"CDMX: {cdmx} de los {len(conciertos)} conciertos.")
        ediciones[clave] = {
            "nombre": e["nombre"], "recinto": e["recinto"], "color": e["color"], "texto": e["texto"],
            "fechaLarga": f"{DIAS[prox['fecha'].weekday()]} {prox['fecha'].day} de {MESES[prox['fecha'].month - 1]} de {prox['fecha'].year}",
            "fechaCorta": fecha_texto(prox["fecha"]),
            "vez": ordinal(len(antes) + 1), "vezNumero": len(antes) + 1, "vezTexto": "vez de Love of Lesbian " + e["donde"],
            "antes": [{"fecha": fecha_texto(k["fecha"]), "texto": k["recinto"] + (" · " + k["nota"] if k.get("nota") else "")} for k in antes],
            "extra": extra, "leyendaLista": e["leyenda"], "curiosidad": (zm.get("curiosidades") or {}).get(clave, ""),
        }
    return {"conciertos": [{"fecha": k["fecha"].isoformat(), "recinto": k["recinto"], "ciudad": k["ciudad"]} for k in conciertos],
            "preguntas": preguntas, "qr": matriz, "url": url, "ediciones": ediciones}


def pdf(imagenes, ancho_in, alto_in, destino):
    datos_png = []
    for im in imagenes:
        b = io.BytesIO()
        im.convert("RGB").quantize(colors=128, dither=Image.Dither.NONE).save(b, "PNG", optimize=True, dpi=(300, 300))
        datos_png.append(b.getvalue())
    lay = img2pdf.get_layout_fun((img2pdf.in_to_pt(ancho_in), img2pdf.in_to_pt(alto_in)))
    destino.write_bytes(img2pdf.convert(datos_png, layout_fun=lay))


def main():
    d = datos()
    (AQUI / "fanzine-datos.js").write_text("window.FANZINE = " + json.dumps(d, ensure_ascii=False) + ";\n", encoding="utf-8")
    with tempfile.TemporaryDirectory() as tmp:
        for clave in EDICIONES:
            subprocess.run(["node", str(AQUI / "render.js"), str(AQUI / "fanzine.html"), clave, tmp], check=True)
            pags = {n: Image.open(f"{tmp}/{clave}-p{n}.png").convert("RGB").resize((PW, PH)) for n in range(1, 9)}
            hoja = Image.new("RGB", (PW * 4, PH * 2), "white")
            for n, col, fila, cabeza in IMPOSICION:
                hoja.paste(pags[n].rotate(180) if cabeza else pags[n], (col * PW, fila * PH))
            pdf([hoja], 11, 8.5, AQUI / f"fanzine-{clave}-imprimir.pdf")
            pdf([pags[n] for n in range(1, 9)], PW / 300, PH / 300, AQUI / f"fanzine-{clave}-paginas.pdf")
            print(f"fanzine-{clave}: listo · QR {d['url']}")


if __name__ == "__main__":
    main()
