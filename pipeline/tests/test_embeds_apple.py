import requests

from cr.embeds import BuscadorEmbeds
from cr.embeds_match import elegir_album_apple, elegir_artista_apple

ARTISTA = {"artistName": "Toundra", "artistId": 373473641, "artistLinkUrl": "https://music.apple.com/mx/artist/toundra/373473641?uo=4"}
ALBUM = {"artistId": 373473641, "collectionId": 6810240891, "collectionName": "30960 - Single",
         "collectionViewUrl": "https://music.apple.com/mx/album/30960-single/6810240891?uo=4"}


def test_artista_apple_exige_nombre_exacto():
    resultados = [{"artistName": "Toundra Tribute", "artistId": 1}, ARTISTA]
    assert elegir_artista_apple(resultados, "Toundra")["artistId"] == 373473641
    assert elegir_artista_apple([{"artistName": "Toundra Tribute", "artistId": 1}], "Toundra") is None


def test_album_apple_ignora_sufijo_single_y_exige_el_mismo_artista():
    assert elegir_album_apple([ALBUM], 373473641, "30960")["collectionId"] == 6810240891
    assert elegir_album_apple([{**ALBUM, "collectionName": "Siete - EP"}], 373473641, "Siete") is not None
    assert elegir_album_apple([ALBUM], 999, "30960") is None
    assert elegir_album_apple([ALBUM], 373473641, "") is None


class Resp:
    def __init__(self, datos):
        self.datos = datos

    def raise_for_status(self):
        pass

    def json(self):
        return self.datos


def buscador(monkeypatch, artistas, albumes, llamadas=None):
    monkeypatch.delenv("SPOTIFY_CLIENT_ID", raising=False)
    monkeypatch.delenv("SPOTIFY_CLIENT_SECRET", raising=False)
    monkeypatch.setenv("YOUTUBE_API_KEY", "llave")

    def get(url, params=None, **k):
        if llamadas is not None:
            llamadas.append(url)
        if "itunes.apple.com" in url:
            return Resp({"results": artistas if params["entity"] == "musicArtist" else albumes})
        raise AssertionError("no debió llamarse a otro proveedor")

    monkeypatch.setattr(requests, "get", get)
    return BuscadorEmbeds()


def test_lanzamiento_con_album_exacto_da_embed_de_album_con_url_limpia(monkeypatch):
    assert buscador(monkeypatch, [ARTISTA], [ALBUM]).buscar("Toundra", "30960") == {
        "plataforma": "apple", "tipo": "album", "id": "6810240891", "url": "https://music.apple.com/mx/album/30960-single/6810240891"}


def test_sin_album_exacto_cae_a_la_pagina_del_artista(monkeypatch):
    assert buscador(monkeypatch, [ARTISTA], []).buscar("Toundra", "Otro Disco") == {
        "plataforma": "apple", "tipo": "artist", "id": "373473641", "url": "https://music.apple.com/mx/artist/toundra/373473641"}


def test_nota_sin_disco_usa_artista_y_apple_va_antes_que_youtube(monkeypatch):
    llamadas = []
    assert buscador(monkeypatch, [ARTISTA], [], llamadas).buscar("Toundra")["plataforma"] == "apple"
    assert all("itunes.apple.com" in u for u in llamadas)


def test_url_que_no_es_de_apple_se_descarta(monkeypatch):
    raro = {**ARTISTA, "artistLinkUrl": "https://sitio-raro.example/artist/1"}
    assert buscador(monkeypatch, [raro], []).buscar("Toundra") is None
