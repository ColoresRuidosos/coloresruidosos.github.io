"""Avances y enlaces para "LoL del día" (F20/D26).

Busca cada canción del banco en la API de búsqueda de iTunes (avance oficial de 30 s, sin llave) y en
la de Spotify (enlace a la pista, con las credenciales del pipeline). Solo acepta coincidencias exactas:
mismo título, artista Love of Lesbian y el disco de estudio, para no colar versiones en directo."""
import re
import time
from urllib.parse import quote

import requests

from .normalizar import normalizar_artista, normalizar_texto

TIEMPO = 15
APPLE = "https://itunes.apple.com/search"
SPOTIFY = "https://api.spotify.com/v1/search"
ARTISTA = "Love of Lesbian"


def _sin_agregados(titulo: str) -> str:
    """Quita un paréntesis final o un " - ..." que agregan las plataformas (feat., versión, etc.)."""
    t = re.sub(r"\s*\([^)]*\)\s*$", "", titulo or "")
    return t.split(" - ")[0]


def titulos_iguales(a: str, b: str) -> bool:
    na, nb = normalizar_texto(a), normalizar_texto(b)
    if not na or not nb:
        return False
    return na == nb or normalizar_texto(_sin_agregados(a)) == normalizar_texto(_sin_agregados(b))


def es_love_of_lesbian(nombre: str) -> bool:
    return normalizar_artista(nombre).startswith(normalizar_artista(ARTISTA))


def disco_coincide(album: str, disco: str) -> bool:
    na, nd = normalizar_texto(album), normalizar_texto(disco)
    return bool(na and nd) and re.search(r"(^| )" + re.escape(nd) + r"( |$)", na) is not None


def elegir_cancion_apple(resultados, titulo: str, disco: str):
    for r in resultados:
        if (r.get("kind") == "song" and es_love_of_lesbian(r.get("artistName", ""))
                and titulos_iguales(titulo, r.get("trackName", "")) and disco_coincide(r.get("collectionName", ""), disco)
                and str(r.get("previewUrl", "")).startswith("https://") and str(r.get("trackViewUrl", "")).startswith("https://")):
            return r
    return None


def elegir_cancion_spotify(items, titulo: str, disco: str):
    for t in items:
        artistas = t.get("artists") or []
        if (artistas and es_love_of_lesbian(artistas[0].get("name", "")) and titulos_iguales(titulo, t.get("name", ""))
                and disco_coincide((t.get("album") or {}).get("name", ""), disco) and t.get("id")):
            return t
    return None


def busqueda_spotify(titulo: str) -> str:
    """Sin coincidencia exacta (o sin credenciales), el botón lleva a la búsqueda de la canción en Spotify."""
    return "https://open.spotify.com/search/" + quote(f"{titulo} {ARTISTA}")


class ResolverAudio:
    """http_get: función tipo requests.get (inyectable para pruebas). token_spotify: función que da el token, o None.
    esperar: función tipo time.sleep. La API de iTunes limita las búsquedas por minuto: se hace una pausa antes de
    cada una y, si responde 403 o 429, se espera un minuto y se reintenta una vez."""

    def __init__(self, http_get=requests.get, token_spotify=None, esperar=time.sleep, pausa_s=3.2):
        self.http_get = http_get
        self.token_spotify = token_spotify
        self.esperar = esperar
        self.pausa_s = pausa_s

    def apple(self, titulo: str, disco: str):
        params = {"term": f"{titulo} {ARTISTA}", "entity": "song", "limit": 25, "country": "MX"}
        for intento in range(2):
            self.esperar(self.pausa_s)
            try:
                r = self.http_get(APPLE, params=params, timeout=TIEMPO)
                r.raise_for_status()
                return elegir_cancion_apple(r.json().get("results", []), titulo, disco)
            except Exception as exc:  # noqa: BLE001
                codigo = getattr(getattr(exc, "response", None), "status_code", None)
                if intento == 0 and codigo in (403, 429):
                    self.esperar(60)
                    continue
                raise
        return None

    def spotify(self, titulo: str, disco: str):
        if not self.token_spotify:
            return None
        r = self.http_get(SPOTIFY, params={"q": f'track:"{titulo}" artist:"{ARTISTA}"', "type": "track", "limit": 10, "market": "MX"},
                          headers={"Authorization": f"Bearer {self.token_spotify()}"}, timeout=TIEMPO)
        r.raise_for_status()
        return elegir_cancion_spotify(r.json().get("tracks", {}).get("items", []), titulo, disco)

    def resolver(self, canciones, discos):
        nombre = {d["id"]: d["nombre"] for d in discos}
        salida, faltan = {}, []
        for c in canciones:
            disco = nombre.get(c["disco"], "")
            try:
                a = self.apple(c["titulo"], disco)
            except Exception as exc:  # noqa: BLE001 — una canción caída no frena las demás
                print(f"{c['id']}: Apple falló ({type(exc).__name__})")
                a = None
            if not a:
                faltan.append(c["id"])
                continue
            try:
                s = self.spotify(c["titulo"], disco)
            except Exception as exc:  # noqa: BLE001 — el enlace de Spotify es opcional
                print(f"{c['id']}: Spotify falló ({type(exc).__name__})")
                s = None
            salida[c["id"]] = {
                "preview": a["previewUrl"],
                "apple": a["trackViewUrl"].split("&uo=")[0].split("?uo=")[0],
                "spotify": f"https://open.spotify.com/track/{s['id']}" if s else busqueda_spotify(c["titulo"]),
                "spotify_exacto": bool(s),
            }
        return {"canciones": salida, "faltan": faltan}
