"""Slugs para URLs de notas y ids de eventos."""
import re

from .normalizar import quitar_acentos


def crear_slug(titulo: str, existentes: set[str] | None = None, max_len: int = 60) -> str:
    existentes = existentes or set()
    base = quitar_acentos(titulo or "").lower()
    base = re.sub(r"[^a-z0-9\s-]", " ", base)
    palabras = [p for p in re.split(r"[\s-]+", base) if p]
    slug = ""
    for p in palabras:
        candidato = f"{slug}-{p}" if slug else p
        if len(candidato) > max_len:
            break
        slug = candidato
    if not slug:
        slug = (palabras[0][:max_len] if palabras else "nota")
    final, n = slug, 2
    while final in existentes:
        final = f"{slug}-{n}"
        n += 1
    return final
