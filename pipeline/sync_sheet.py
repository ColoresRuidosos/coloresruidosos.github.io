"""Despublica o republica notas según la pestaña "Notas" del Google Sheet.

Uso:
    python pipeline/sync_sheet.py
"""
import os
from pathlib import Path

from cr.notas import aplicar_despublicacion
from cr.sheet import leer
from cr.web import obtener_texto

RAIZ = Path(__file__).resolve().parent.parent


def main():
    url = os.environ.get("SHEET_NOTAS_CSV")
    if not url:
        print("SHEET_NOTAS_CSV no configurado; no hay despublicaciones que aplicar.")
        return
    filas = leer(url, lambda u: obtener_texto(u, respetar_robots=False))
    posts = {str(p): p.read_text(encoding="utf-8") for p in (RAIZ / "content/posts").glob("*.md")}
    cambios = aplicar_despublicacion(posts, filas)
    for ruta, texto in cambios.items():
        Path(ruta).write_text(texto, encoding="utf-8")
        print(f"Actualizada: {Path(ruta).name}")
    if not cambios:
        print("Sin cambios de publicación.")


if __name__ == "__main__":
    main()
