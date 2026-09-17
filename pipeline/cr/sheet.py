"""Lectura del Google Sheet publicado como CSV (Archivo → Compartir → Publicar en la web → CSV)."""
import csv
import io

from .normalizar import normalizar_texto


def parsear_csv(texto: str) -> list[dict]:
    lector = csv.DictReader(io.StringIO(texto))
    filas = []
    for fila in lector:
        normal = {normalizar_texto(k).replace(" ", "_"): (v or "").strip() for k, v in fila.items() if k}
        if any(normal.values()):
            filas.append(normal)
    return filas


def leer(url: str, obtener) -> list[dict]:
    """`obtener(url) -> str` se inyecta para poder probar sin red."""
    return parsear_csv(obtener(url))
