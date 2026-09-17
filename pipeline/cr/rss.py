"""Lectura de feeds RSS/Atom al formato interno."""
from datetime import datetime, timezone

import feedparser
from bs4 import BeautifulSoup


def _fecha(entrada) -> datetime | None:
    t = entrada.get("published_parsed") or entrada.get("updated_parsed")
    return datetime(*t[:6], tzinfo=timezone.utc) if t else None


def _texto(html: str) -> str:
    return BeautifulSoup(html or "", "html.parser").get_text(" ", strip=True)


def convertir_feed(parsed, medio: str) -> list[dict]:
    items = []
    for e in parsed.entries:
        if not e.get("link") or not e.get("title"):
            continue
        resumen = e.get("summary") or ""
        if not resumen and e.get("content"):
            resumen = e["content"][0].get("value", "")
        items.append({
            "titulo": _texto(e["title"]),
            "url": e["link"],
            "fecha": _fecha(e),
            "resumen": _texto(resumen)[:1500],
            "medio": medio,
        })
    return items


def leer_fuentes(fuentes: list[dict], obtener) -> tuple[list[dict], list[str]]:
    """`obtener(url) -> str`. Un feed caído no detiene a los demás."""
    items, fallidos = [], []
    for f in fuentes:
        if not f.get("activa", True):
            continue
        try:
            parsed = feedparser.parse(obtener(f["url"]))
            convertidos = convertir_feed(parsed, f["nombre"])
            if not convertidos:
                raise ValueError("feed sin entradas legibles")
            items.extend(convertidos)
        except Exception as exc:  # noqa: BLE001 — se registra y se sigue
            fallidos.append(f'{f["nombre"]}: {exc}')
    return items, fallidos
