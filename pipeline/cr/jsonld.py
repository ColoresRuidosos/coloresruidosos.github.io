"""Extrae eventos de datos estructurados schema.org (JSON-LD).

Muchos recintos y boleteras publican sus eventos con este formato para Google.
Leerlo es mucho más estable que depender del diseño visual de cada página.
"""
import json
from datetime import datetime

from bs4 import BeautifulSoup

from .eventos import nuevo_evento

TIPOS_EVENTO = {"Event", "MusicEvent", "Festival", "TheaterEvent", "ComedyEvent"}


def _nodos(dato):
    if isinstance(dato, list):
        for d in dato:
            yield from _nodos(d)
    elif isinstance(dato, dict):
        if "@graph" in dato:
            yield from _nodos(dato["@graph"])
        yield dato


def _es_evento(nodo) -> bool:
    tipo = nodo.get("@type")
    tipos = set(tipo) if isinstance(tipo, list) else {tipo}
    return bool(tipos & TIPOS_EVENTO)


def extraer_eventos(html: str, recinto: dict) -> list[dict]:
    sopa = BeautifulSoup(html, "html.parser")
    eventos = []
    for script in sopa.find_all("script", type="application/ld+json"):
        try:
            dato = json.loads(script.string or "")
        except (json.JSONDecodeError, TypeError):
            continue
        for nodo in _nodos(dato):
            if not _es_evento(nodo) or not nodo.get("name") or not nodo.get("startDate"):
                continue
            try:
                inicio = datetime.fromisoformat(str(nodo["startDate"]).replace("Z", "+00:00"))
            except ValueError:
                continue
            hora = inicio.strftime("%H:%M") if "T" in str(nodo["startDate"]) else None
            ofertas = nodo.get("offers")
            if isinstance(ofertas, list):
                ofertas = ofertas[0] if ofertas else None
            precio = None
            if isinstance(ofertas, dict) and ofertas.get("price") not in (None, ""):
                precio = f'{ofertas["price"]} {ofertas.get("priceCurrency", "")}'.strip()
            eventos.append(nuevo_evento(
                titulo=str(nodo["name"]),
                fecha=inicio.date().isoformat(),
                recinto=recinto["nombre"],
                ciudad=recinto.get("ciudad", ""),
                hora=hora,
                url=nodo.get("url") or recinto["url"],
                precio=precio,
            ))
    return eventos
