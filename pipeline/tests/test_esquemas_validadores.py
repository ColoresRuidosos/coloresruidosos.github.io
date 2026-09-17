from datetime import date

from cr.esquemas import extraer_json, validar_clasificacion, validar_redaccion
from cr.validadores import detectar_copia, validar_citas, validar_creditos, validar_longitudes, validar_nota

HOY = date(2026, 9, 16)
REGLAS = {"max_caracteres_titulo": 90, "max_palabras_cuerpo": 250, "ngram_copia": 8}


def test_extraer_json_con_cercas_y_texto():
    assert extraer_json('```json\n[{"i": 0}]\n```') == [{"i": 0}]
    assert extraer_json('Aquí va: {"titulo": "x"} listo') == {"titulo": "x"}


def test_relevancia_mx_exige_fecha_futura_en_mexico():
    base = {"artista": "Wet Leg", "categoria": "gira", "es_indie_rock": True}
    sin_fecha = validar_clasificacion({**base, "relevancia": "mx"}, HOY)
    assert sin_fecha["relevancia"] == "general"
    con_fecha = validar_clasificacion({**base, "fechas_evento": [{"fecha": "2026-11-20", "pais": "mx", "ciudad": "CDMX"}]}, HOY)
    assert con_fecha["relevancia"] == "mx"


def test_fecha_pasada_se_descarta_y_latam_se_detecta():
    c = validar_clasificacion({"artista": "X", "categoria": "gira", "fechas_evento": [
        {"fecha": "2026-01-01", "pais": "MX"}, {"fecha": "2026-12-01", "pais": "CL"}]}, HOY)
    assert c["relevancia"] == "latam" and len(c["fechas_evento"]) == 1


def test_clasificacion_invalida():
    assert validar_clasificacion({"artista": "", "categoria": "gira"}, HOY) is None
    assert validar_clasificacion({"artista": "X", "categoria": "chisme"}, HOY) is None
    assert validar_clasificacion("texto", HOY) is None


def test_redaccion_requiere_tres_campos():
    assert validar_redaccion({"titulo": "a", "entrada": "b", "cuerpo": "c"})
    assert validar_redaccion({"titulo": "a", "cuerpo": "c"}) is None


def test_creditos():
    assert validar_creditos([], HOY) == ["la nota no tiene fuentes"]
    errores = validar_creditos([{"medio": "", "url": "ftp://x", "consultado": "2026-09-20"}], HOY)
    assert len(errores) == 3
    assert validar_creditos([{"medio": "A", "url": "https://a.com/n", "consultado": "2026-09-16"}], HOY) == []


def test_copia_de_8_palabras_se_detecta_y_7_no():
    fuente = "the band will play an intimate show in the city next november"
    assert detectar_copia("dijo que the band will play an intimate show in the city", [fuente], [])
    assert not detectar_copia("the band will play an intimate show", [fuente], [])


def test_nombres_propios_no_cuentan_como_copia():
    fuente = "Godspeed You Black Emperor Lift Your Skinny Fists Like Antennas to Heaven"
    cuerpo = "Godspeed You Black Emperor Lift Your Skinny Fists Like Antennas to Heaven vuelve"
    excluidos = ["Godspeed You! Black Emperor", "Lift Your Skinny Fists Like Antennas to Heaven"]
    assert detectar_copia(cuerpo, [fuente], excluidos) == []


def test_mayusculas_y_puntuacion_no_evitan_la_deteccion():
    fuente = "One, two, three, four, five, six, seven, eight."
    assert detectar_copia("ONE two THREE four; five six seven eight", [fuente], [])


def test_citas_largas_prohibidas_y_cortas_permitidas():
    assert validar_citas('Su disco "Moisture" sale')  == []
    assert validar_citas("La banda dijo “estamos muy felices de volver”")


def test_longitudes():
    assert validar_longitudes("x" * 91, "a", 90, 250)
    assert validar_longitudes("x", "palabra " * 251, 90, 250)
    assert validar_longitudes("x", "palabra " * 250, 90, 250) == []


def test_validar_nota_completa():
    nota = {"titulo": "Wet Leg vuelve a México", "entrada": "Buenas noticias.", "cuerpo": "Tocarán en noviembre.",
            "artista": "Wet Leg", "fechas_evento": [],
            "fuentes": [{"medio": "A", "url": "https://a.com/n", "consultado": "2026-09-16"}]}
    assert validar_nota(nota, ["Wet Leg announce tour"], HOY, REGLAS) == []
    assert validar_nota({**nota, "fuentes": []}, [], HOY, REGLAS)
