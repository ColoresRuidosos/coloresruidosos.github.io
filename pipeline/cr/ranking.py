"""Selección diaria: escena mexicana/española > internacional; dentro de cada una,
México > LatAm > general según dónde ocurre la gira. Rellena hasta el tope."""
from .dedup import _prioridad, _prioridad_region


def seleccionar(candidatos: list[dict], tope: int) -> list[dict]:
    validos = [c for c in candidatos if c.get("es_indie_rock") and c.get("categoria") != "otro"]
    ordenados = sorted(
        validos,
        key=lambda c: (_prioridad_region(c.get("region", "intl")), _prioridad(c["relevancia"]),
                        -len(c["fuentes"]), -c["fecha"].timestamp()),
    )
    return ordenados[: max(tope, 0)]
