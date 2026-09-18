import requests

from cr.embeds import BuscadorEmbeds


class Resp:
    def __init__(self, datos):
        self.datos = datos

    def raise_for_status(self):
        pass

    def json(self):
        return self.datos


def buscador_youtube(monkeypatch, get):
    monkeypatch.setenv("YOUTUBE_API_KEY", "llave")
    monkeypatch.delenv("SPOTIFY_CLIENT_ID", raising=False)
    monkeypatch.delenv("SPOTIFY_CLIENT_SECRET", raising=False)
    monkeypatch.setattr(requests, "get", get)
    return BuscadorEmbeds()


def canal(nombre, **id_):
    return {"id": id_, "snippet": {"channelTitle": nombre}}


def test_youtube_ignora_resultados_sin_videoid_y_usa_el_siguiente(monkeypatch):
    datos = {"items": [
        canal("Wet Leg", kind="youtube#channel", channelId="c1"),
        canal("Wet Leg", kind="youtube#video", videoId="abc123"),
    ]}
    b = buscador_youtube(monkeypatch, lambda *a, **k: Resp(datos))
    assert b.buscar("Wet Leg") == {"plataforma": "youtube", "tipo": "video", "id": "abc123",
                                   "url": "https://www.youtube.com/watch?v=abc123"}


def test_si_ningun_resultado_trae_videoid_no_hay_embed_ni_error(monkeypatch):
    datos = {"items": [canal("Wet Leg", kind="youtube#channel", channelId="c1"), {"id": "raro", "snippet": {}}]}
    assert buscador_youtube(monkeypatch, lambda *a, **k: Resp(datos)).buscar("Wet Leg") is None


def test_un_error_inesperado_en_el_embed_no_frena_la_publicacion(monkeypatch, capsys):
    def rota(*a, **k):
        raise ValueError("respuesta que no es JSON")

    assert buscador_youtube(monkeypatch, rota).buscar("Wet Leg") is None
    assert "se publica sin embed" in capsys.readouterr().out
