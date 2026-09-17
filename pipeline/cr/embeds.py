"""Búsqueda de embeds oficiales en Spotify y YouTube. Sin credenciales, no hay embed."""
import base64
import os

import requests

from .embeds_match import elegir_album_spotify, elegir_artista_spotify, elegir_video_youtube

TIEMPO = 15


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

    def _youtube(self, artista: str, titulo: str):
        if not self.yt_llave:
            return None
        r = requests.get("https://www.googleapis.com/youtube/v3/search",
                         params={"part": "snippet", "q": f"{artista} {titulo}".strip(), "type": "video", "maxResults": 10, "key": self.yt_llave},
                         timeout=TIEMPO)
        r.raise_for_status()
        video = elegir_video_youtube(r.json().get("items", []), artista)
        if not video:
            return None
        vid = video["id"]["videoId"]
        return {"plataforma": "youtube", "tipo": "video", "id": vid, "url": f"https://www.youtube.com/watch?v={vid}"}

    def buscar(self, artista: str, titulo_lanzamiento: str = ""):
        for metodo in (self._spotify, self._youtube):
            try:
                resultado = metodo(artista, titulo_lanzamiento)
            except requests.RequestException:
                resultado = None
            if resultado:
                return resultado
        return None
