"""Selección diaria: primero los artistas en seguimiento; luego cuota fija de escena mexicana
y española, rellenando lo que falte de una con la otra antes que con internacional. Dentro de
cada escena, México > LatAm > general según dónde ocurre la gira."""
from .dedup import _prioridad, _prioridad_region


def ordenar(candidatos: list[dict]) -> list[dict]:
    validos = [c for c in candidatos if c.get("es_indie_rock") and c.get("categoria") != "otro"]
    return sorted(
        validos,
        key=lambda c: (not c.get("seguido"), _prioridad_region(c.get("region", "intl")), _prioridad(c["relevancia"]),
                        -len(c["fuentes"]), -c["fecha"].timestamp()),
    )


def seleccionar(candidatos: list[dict], tope: int, cuota_mx: int = 0, cuota_es: int = 0) -> list[dict]:
    """Los seguidos entran primero y cuentan para la cuota de su escena; el tope total no se excede."""
    ordenados = ordenar(candidatos)
    seguidos = [c for c in ordenados if c.get("seguido")][: max(tope, 0)]
    resto = [c for c in ordenados if not c.get("seguido")]
    mx = [c for c in resto if c.get("region") == "mx"]
    es = [c for c in resto if c.get("region") == "es"]
    otros = [c for c in resto if c.get("region") not in ("mx", "es")]
    cuota_mx = max(cuota_mx - sum(c.get("region") == "mx" for c in seguidos), 0)
    cuota_es = max(cuota_es - sum(c.get("region") == "es" for c in seguidos), 0)

    elegidos = seguidos + mx[:cuota_mx] + es[:cuota_es]
    elegidas = {id(c) for c in elegidos}
    relleno = [c for c in mx[cuota_mx:] + es[cuota_es:] + otros if id(c) not in elegidas]
    elegidos += relleno[: max(tope - len(elegidos), 0)]
    return elegidos[: max(tope, 0)]
