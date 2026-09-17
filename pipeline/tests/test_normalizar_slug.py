from cr.normalizar import normalizar_artista, normalizar_texto, normalizar_url
from cr.slug import crear_slug


def test_url_canonica_quita_rastreo_www_y_barra():
    a = normalizar_url("https://www.stereogum.com/2026/nota/?utm_source=x&fbclid=1#top")
    b = normalizar_url("https://stereogum.com/2026/nota")
    assert a == b


def test_url_conserva_parametros_utiles():
    assert "p=123" in normalizar_url("https://medio.com/?p=123&utm_medium=rss")


def test_artista_sin_the_ni_acentos():
    assert normalizar_artista("The Strokes") == normalizar_artista("strokes ") == "strokes"
    assert normalizar_artista("Café Tacvba") == "cafe tacvba"


def test_texto_sin_puntuacion():
    assert normalizar_texto("¡Hola, MUNDO!") == "hola mundo"


def test_slug_translitera_y_limita():
    s = crear_slug("Little Jesus anuncia fecha en la Ciudad de México y más sorpresas para todos", max_len=40)
    assert s.startswith("little-jesus-anuncia")
    assert len(s) <= 40 and not s.endswith("-")


def test_slug_repetido_recibe_sufijo():
    assert crear_slug("Nueva gira", {"nueva-gira"}) == "nueva-gira-2"
    assert crear_slug("Nueva gira", {"nueva-gira", "nueva-gira-2"}) == "nueva-gira-3"
