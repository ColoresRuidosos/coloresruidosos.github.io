"""Ventana temporal, deduplicación por URL y agrupación por hecho."""
from datetime import datetime, timedelta

from .normalizar import normalizar_artista, normalizar_url


def filtrar_ventana(items: list[dict], ahora: datetime, horas: int) -> list[dict]:
    limite = ahora - timedelta(hours=horas)
    return [i for i in items if i.get("fecha") is not None and limite <= i["fecha"] <= ahora + timedelta(hours=1)]


def dedup_por_url(items: list[dict]) -> list[dict]:
    vistos, salida = set(), []
    for item in items:
        clave = normalizar_url(item["url"])
        if clave in vistos:
            continue
        vistos.add(clave)
        salida.append({**item, "url_norm": clave})
    return salida


def clave_hecho(artista: str, categoria: str) -> str:
    return f"{normalizar_artista(artista)}|{categoria}"


def agrupar_por_hecho(clasificados: list[dict]) -> list[dict]:
    """Une ítems del mismo artista y categoría en un candidato con varias fuentes.

    Cada ítem trae: titulo, url, url_norm, fecha, resumen, medio y clasificacion.
    """
    grupos: dict[str, dict] = {}
    for item in clasificados:
        c = item["clasificacion"]
        clave = clave_hecho(c["artista"], c["categoria"])
        fuente = {"medio": item["medio"], "url": item["url"], "titulo": item["titulo"], "resumen": item.get("resumen", "")}
        if clave not in grupos:
            grupos[clave] = {
                "clave": clave,
                "artista": c["artista"],
                "categoria": c["categoria"],
                "relevancia": c["relevancia"],
                "es_indie_rock": c["es_indie_rock"],
                "fechas_evento": list(c.get("fechas_evento", [])),
                "titulo_lanzamiento": c.get("titulo_lanzamiento", ""),
                "fecha": item["fecha"],
                "fuentes": [fuente],
                "urls_norm": {item["url_norm"]},
            }
            continue
        g = grupos[clave]
        if item["url_norm"] in g["urls_norm"]:
            continue
        g["urls_norm"].add(item["url_norm"])
        g["fuentes"].append(fuente)
        g["fecha"] = max(g["fecha"], item["fecha"])
        g["es_indie_rock"] = g["es_indie_rock"] or c["es_indie_rock"]
        if _prioridad(c["relevancia"]) < _prioridad(g["relevancia"]):
            g["relevancia"] = c["relevancia"]
        existentes = {(f.get("fecha"), f.get("ciudad")) for f in g["fechas_evento"]}
        for f in c.get("fechas_evento", []):
            if (f.get("fecha"), f.get("ciudad")) not in existentes:
                g["fechas_evento"].append(f)
    return list(grupos.values())


def _prioridad(relevancia: str) -> int:
    return {"mx": 0, "latam": 1}.get(relevancia, 2)


def excluir_publicados(candidatos: list[dict], estado: dict, urls_en_sitio: set[str]) -> list[dict]:
    """Quita candidatos cuyo hecho o alguna URL ya se publicó."""
    claves = estado.get("claves_publicadas", {})
    urls = set(estado.get("urls_publicadas", {})) | urls_en_sitio
    return [c for c in candidatos if c["clave"] not in claves and not (c["urls_norm"] & urls)]
