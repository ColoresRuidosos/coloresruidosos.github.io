"""Artistas en seguimiento: coincidencia por nombre normalizado, sin acentos ni mayúsculas."""
import re

from .normalizar import normalizar_artista

_COLABORACION = re.compile(r"\s+(?:y|and|con|feat|ft|x)\s+|\s*[,&+/]\s*")


def cargar(entradas: list[str]) -> set[str]:
    return {normalizar_artista(e) for e in entradas or [] if e and e.strip()}


def es_seguido(artista: str, seguidos: set[str]) -> bool:
    """Coincide con el nombre completo o con cualquier participante de una colaboración."""
    if not seguidos or not artista:
        return False
    if normalizar_artista(artista) in seguidos:
        return True
    partes = _COLABORACION.split(artista)
    return any(normalizar_artista(p) in seguidos for p in partes if p.strip())
