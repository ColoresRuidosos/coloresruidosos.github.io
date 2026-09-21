"""Búsqueda de embeds oficiales: Spotify (con credenciales), Apple Music (sin llave) y YouTube (con llave).

Orden de prueba: Spotify, Apple Music, YouTube. Solo se elige el primero que coincida exactamente."""
import base64
import os

import requests

from .embeds_match import (
    elegir_album_apple,
    elegir_album_spotify,
    elegir_artista_apple,
    elegir_artista_spotify,
    elegir_video_youtube,
)

TIEMPO = 15
APPLE = "https://itunes.apple.com/search"


class BuscadorEmbeds:
    def __init__(self):
        self.sp_id = os.environ.get("SPOTIFY_CLIENT_ID")
        self.sp_secreto = os.environ.get("SPOTIFY_CLIENT_SECRET")
        self.yt_llave = os.environ.get("YOUTUBE_API_KEY")
        self._token = None

    def _token_spotify(self):
        if self._token is None:
            cred = base64.b64encode(f"{self.sp_id}:{self.sp_secreto}".encode()).decode()
            r = requests.post("https://accounts.spotify.com/api/token", data={"grant_type": "client_credentials"},
                              headers={"Authorization": f"Basic {cred}"}, timeout=TIEMPO)
            r.raise_for_status()
            self._token = r.json()["access_token"]
        return self._token

    def _spotify(self, artista: str, titulo: str):
        if not (self.sp_id and self.sp_secreto):
            return None
        cab = {"Authorization": f"Bearer {self._token_spotify()}"}
        r = requests.get("https://api.spotify.com/v1/search", params={"q": artista, "type": "artist", "limit": 10}, headers=cab, timeout=TIEMPO)
        r.raise_for_status()
        art = elegir_artista_spotify(r.json().get("artists", {}).get("items", []), artista)
        if not art:
            return None
        if titulo:
            r = requests.get("https://api.spotify.com/v1/search", params={"q": f"{titulo} {artista}", "type": "album", "limit": 10}, headers=cab, timeout=TIEMPO)
            r.raise_for_status()
            alb = elegir_album_spotify(r.json().get("albums", {}).get("items", []), art["id"], titulo)
            if alb:
                return {"plataforma": "spotify", "tipo": "album", "id": alb["id"], "url": f"https://open.spotify.com/album/{alb['id']}"}
        return {"plataforma": "spotify", "tipo": "artist", "id": art["id"], "url": f"https://open.spotify.com/artist/{art['id']}"}

    def _apple(self, artista: str, titulo: str):
        """API de búsqueda de iTunes: gratuita y sin llave. Álbum exacto si lo hay; si no, la página del artista."""
        r = requests.get(APPLE, params={"term": artista, "entity": "musicArtist", "limit": 10, "country": "MX"}, timeout=TIEMPO)
        r.raise_for_status()
        art = elegir_artista_apple(r.json().get("results", []), artista)
        if not art:
            return None
        if titulo:
            r = requests.get(APPLE, params={"term": f"{titulo} {artista}", "entity": "album", "limit": 10, "country": "MX"}, timeout=TIEMPO)
            r.raise_for_status()
            alb = elegir_album_apple(r.json().get("results", []), art.get("artistId"), titulo)
            url = (alb or {}).get("collectionViewUrl", "").split("?")[0]
            if alb and url.startswith("https://music.apple.com/"):
                return {"plataforma": "apple", "tipo": "album", "id": str(alb["collectionId"]), "url": url}
        url = art.get("artistLinkUrl", "").split("?")[0]
        if not url.startswith("https://music.apple.com/"):
            return None
        return {"plataforma": "apple", "tipo": "artist", "id": str(art["artistId"]), "url": url}

    def _youtube(self, artista: str, titulo: str):
        if not self.yt_llave:
            return None
        r = requests.get("https://www.googleapis.com/youtube/v3/search",
                         params={"part": "snippet", "q": f"{artista} {titulo}".strip(), "type": "video", "maxResults": 10, "key": self.yt_llave},
                         timeout=TIEMPO)
        r.raise_for_status()
        # La API a veces devuelve resultados sin videoId; se descartan antes de elegir.
        items = [i for i in r.json().get("items", []) if isinstance(i.get("id"), dict) and i["id"].get("videoId")]
        video = elegir_video_youtube(items, artista)
        if not video:
            return None
        vid = video["id"]["videoId"]
        return {"plataforma": "youtube", "tipo": "video", "id": vid, "url": f"https://www.youtube.com/watch?v={vid}"}

    def buscar(self, artista: str, titulo_lanzamiento: str = ""):
        for metodo in (self._spotify, self._apple, self._youtube):
            try:
                resultado = metodo(artista, titulo_lanzamiento)
            except Exception as exc:  # noqa: BLE001 — el embed es opcional: nunca debe frenar la publicación
                codigo = getattr(getattr(exc, "response", None), "status_code", "")
                print(f"Embed ({metodo.__name__}): {type(exc).__name__} {codigo}".rstrip() + "; se publica sin embed de esta fuente")
                resultado = None
            if resultado:
                return resultado
        return None
