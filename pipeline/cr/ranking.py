"""Selección diaria: México > LatAm > general, rellenando hasta el tope."""
from .dedup import _prioridad


def seleccionar(candidatos: list[dict], tope: int) -> list[dict]:
    validos = [c for c in candidatos if c.get("es_indie_rock") and c.get("categoria") != "otro"]
    ordenados = sorted(
        validos,
        key=lambda c: (_prioridad(c["relevancia"]), -len(c["fuentes"]), -c["fecha"].timestamp()),
    )
    return ordenados[: max(tope, 0)]
