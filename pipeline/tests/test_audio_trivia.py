from cr.audio_trivia import (
    ResolverAudio,
    disco_coincide,
    elegir_cancion_apple,
    elegir_cancion_spotify,
    es_love_of_lesbian,
    titulos_iguales,
)

APPLE_OK = {
    "kind": "song", "artistName": "Love of Lesbian & Enrique Bunbury", "trackName": "El Sur",
    "collectionName": "V.E.H.N. (Viaje Épico Hacia la Nada)",
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/x/mzaf_1.plus.aac.p.m4a",
    "trackViewUrl": "https://music.apple.com/mx/album/el-sur/1540993287?i=1540993300&uo=4",
}
SPOTIFY_OK = {
    "id": "abc123", "name": "El sur (feat. Enrique Bunbury)",
    "artists": [{"name": "Love of Lesbian"}, {"name": "Enrique Bunbury"}],
    "album": {"name": "V.E.H.N. (Viaje Épico Hacia la Nada)"},
}


def test_titulos_iguales_sin_acentos_puntuacion_ni_parentesis_de_mas():
    assert titulos_iguales("Te hiero mucho (Historia del amante guisante)", "Te Hiero Mucho (Historia del Amante Guisante)")
    assert titulos_iguales("El sur", "El Sur (feat. Enrique Bunbury)")
    assert titulos_iguales("¿Qué vas a saber?", "Qué Vas a Saber")
    assert not titulos_iguales("La noche eterna", "Los días no vividos")
    assert not titulos_iguales("Nada", "Nadie por las calles")


def test_artista_acepta_colaboraciones_pero_no_tributos():
    assert es_love_of_lesbian("Love of Lesbian")
    assert es_love_of_lesbian("Love Of Lesbian & Rigoberta Bandini")
    assert not es_love_of_lesbian("Tributo a Love of Lesbian")
    assert not es_love_of_lesbian("Lesbian")


def test_disco_debe_ser_el_de_estudio():
    assert disco_coincide("1999 (o Cómo Generar Incendios de Nieve Con una Lupa Enfocando a la Luna)", "1999")
    assert disco_coincide("V.E.H.N. (Viaje Épico Hacia la Nada)", "V.E.H.N.")
    assert disco_coincide("La Noche Eterna. Los Días No Vividos", "La noche eterna. Los días no vividos")
    assert not disco_coincide("El Gran Truco Final (En Directo)", "El poeta Halley")
    assert not disco_coincide("", "1999")


def test_apple_elige_la_cancion_del_disco_de_estudio_con_avance():
    directo = {**APPLE_OK, "collectionName": "El Gran Truco Final (En Directo)"}
    sin_avance = {**APPLE_OK, "previewUrl": ""}
    otra = {**APPLE_OK, "trackName": "El Mundo"}
    assert elegir_cancion_apple([directo, otra, APPLE_OK], "El sur", "V.E.H.N.") is APPLE_OK
    assert elegir_cancion_apple([directo, sin_avance, otra], "El sur", "V.E.H.N.") is None
    assert elegir_cancion_apple([{**APPLE_OK, "kind": "music-video"}], "El sur", "V.E.H.N.") is None


def test_spotify_elige_la_pista_del_disco_de_estudio():
    directo = {**SPOTIFY_OK, "album": {"name": "El Gran Truco Final"}}
    ajena = {**SPOTIFY_OK, "artists": [{"name": "Otra Banda"}]}
    assert elegir_cancion_spotify([directo, ajena, SPOTIFY_OK], "El sur", "V.E.H.N.") is SPOTIFY_OK
    assert elegir_cancion_spotify([directo, ajena], "El sur", "V.E.H.N.") is None


class Resp:
    def __init__(self, datos):
        self.datos = datos

    def raise_for_status(self):
        pass

    def json(self):
        return self.datos


def test_resolver_arma_el_resultado_y_lista_las_que_faltan():
    def http_get(url, params=None, headers=None, timeout=None):
        if "itunes.apple.com" in url:
            return Resp({"results": [APPLE_OK] if "El sur" in params["term"] else []})
        return Resp({"tracks": {"items": [SPOTIFY_OK]}})

    r = ResolverAudio(http_get=http_get, token_spotify=lambda: "t")
    discos = [{"id": "VH", "nombre": "V.E.H.N."}]
    canciones = [{"id": "VH02", "titulo": "El sur", "disco": "VH"}, {"id": "VH03", "titulo": "El mundo", "disco": "VH"}]
    salida = r.resolver(canciones, discos)
    assert salida["canciones"]["VH02"] == {
        "preview": APPLE_OK["previewUrl"],
        "apple": "https://music.apple.com/mx/album/el-sur/1540993287?i=1540993300",
        "spotify": "https://open.spotify.com/track/abc123",
    }
    assert salida["faltan"] == ["VH03"]


def test_resolver_sin_credenciales_de_spotify_deja_el_enlace_vacio():
    def http_get(url, params=None, headers=None, timeout=None):
        assert "spotify" not in url
        return Resp({"results": [APPLE_OK]})

    r = ResolverAudio(http_get=http_get, token_spotify=None)
    salida = r.resolver([{"id": "VH02", "titulo": "El sur", "disco": "VH"}], [{"id": "VH", "nombre": "V.E.H.N."}])
    assert salida["canciones"]["VH02"]["spotify"] is None


def test_un_error_de_red_en_una_cancion_no_frena_las_demas():
    llamadas = []

    def http_get(url, params=None, headers=None, timeout=None):
        llamadas.append(params["term"])
        if "Primera" in params["term"]:
            raise ConnectionError("caída")
        return Resp({"results": [{**APPLE_OK, "trackName": "Segunda", "collectionName": "1999"}]})

    r = ResolverAudio(http_get=http_get, token_spotify=None)
    salida = r.resolver([{"id": "A", "titulo": "Primera", "disco": "99"}, {"id": "B", "titulo": "Segunda", "disco": "99"}],
                        [{"id": "99", "nombre": "1999"}])
    assert salida["faltan"] == ["A"]
    assert "B" in salida["canciones"]
