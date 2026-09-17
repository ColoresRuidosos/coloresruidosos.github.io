"""Elección de embed por coincidencia exacta. Mejor sin embed que con la banda equivocada."""
from .normalizar import normalizar_artista, normalizar_texto


def elegir_artista_spotify(resultados: list[dict], artista: str) -> dict | None:
    objetivo = normalizar_artista(artista)
    for r in resultados:
        if normalizar_artista(r.get("name", "")) == objetivo:
            return r
    return None


def elegir_album_spotify(resultados: list[dict], artista_id: str, titulo: str) -> dict | None:
    objetivo = normalizar_texto(titulo)
    if not objetivo:
        return None
    for r in resultados:
        ids = {a.get("id") for a in r.get("artists", [])}
        if artista_id in ids and normalizar_texto(r.get("name", "")) == objetivo:
            return r
    return None


def elegir_video_youtube(resultados: list[dict], artista: str) -> dict | None:
    objetivo = normalizar_artista(artista)
    for r in resultados:
        canal = normalizar_artista(r.get("snippet", {}).get("channelTitle", ""))
        if canal in (objetivo, f"{objetivo} topic", f"{objetivo}vevo", f"{objetivo} vevo"):
            return r
    return None
