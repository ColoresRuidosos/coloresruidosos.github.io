from datetime import date, datetime, timezone

import autoblog
from cr.esquemas import extraer_json

HOY = date(2026, 9, 18)
REGLAS = {"max_caracteres_titulo": 90, "max_palabras_cuerpo": 250, "ngram_copia": 8}
CAND = {"artista": "Wet Leg", "categoria": "gira", "fechas_evento": [], "titulo_lanzamiento": "",
        "fuentes": [{"medio": "A", "url": "https://a.com/x", "titulo": "titulo original", "resumen": "resumen original"}]}
BUENA = {"titulo": "Wet Leg anuncia gira", "entrada": "Ya hay fechas.", "cuerpo": "Tocarán en noviembre."}


class LLMCon:
    def __init__(self, *respuestas):
        self.respuestas = list(respuestas)
        self.errores_recibidos = []

    def redactar(self, cand, hoy, errores=None):
        self.errores_recibidos.append(errores)
        r = self.respuestas.pop(0)
        if isinstance(r, Exception):
            raise r
        return r


def test_extraer_json_acepta_saltos_de_linea_reales_dentro_del_texto():
    texto = 'Aquí va:\n```json\n{"titulo": "T", "cuerpo": "primer párrafo\n\nsegundo párrafo"}\n```'
    assert extraer_json(texto)["cuerpo"] == "primer párrafo\n\nsegundo párrafo"


def test_redaccion_ilegible_se_reintenta_avisando_al_modelo():
    llm = LLMCon(ValueError("json roto"), BUENA)
    nota, errores = autoblog._redactar_valida(CAND, llm, HOY, REGLAS)
    assert nota["titulo"] == "Wet Leg anuncia gira" and errores == []
    assert "JSON válido" in llm.errores_recibidos[1][0]


def test_si_las_dos_redacciones_son_ilegibles_se_descarta_sin_reventar():
    nota, errores = autoblog._redactar_valida(CAND, LLMCon(ValueError("a"), ValueError("b")), HOY, REGLAS)
    assert nota is None and errores


def test_clasificacion_ilegible_deja_el_lote_pendiente_sin_frenar_la_corrida():
    class LLMRoto:
        def clasificar(self, lote, hoy):
            raise ValueError("json roto")

    estado = {"clasificaciones": {}}
    nuevos = [{"url_norm": "u1", "medio": "A", "titulo": "t", "resumen": "r"}]
    autoblog._clasificar_pendientes(nuevos, LLMRoto(), estado, datetime(2026, 9, 18, tzinfo=timezone.utc))
    assert estado["clasificaciones"] == {}
