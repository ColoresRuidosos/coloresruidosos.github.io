from datetime import datetime, timezone

from cr.frontmatter import construir_post, leer_post
from cr.notas import aplicar_despublicacion

AHORA = datetime(2026, 9, 16, 8, tzinfo=timezone.utc)
CAND = {"artista": "Wet Leg", "categoria": "gira", "relevancia": "mx",
        "fechas_evento": [{"fecha": "2026-11-20", "ciudad": "CDMX", "pais": "MX", "recinto": "Foro"}],
        "fuentes": [{"medio": "Stereogum", "url": "https://stereogum.com/n", "titulo": "t", "resumen": "r"}]}


def test_yaml_valido_con_comillas_y_dos_puntos():
    red = {"titulo": 'Wet Leg: "vuelven" a México', "entrada": "Sí: vuelven.", "cuerpo": "Texto."}
    datos, cuerpo = leer_post(construir_post(CAND, red, None, AHORA, "wet-leg", False))
    assert datos["title"] == 'Wet Leg: "vuelven" a México'
    assert datos["embed"] is None and datos["draft"] is False
    assert cuerpo.strip() == "Texto."


def test_fuentes_salen_del_candidato_no_de_la_redaccion():
    red = {"titulo": "t", "entrada": "e", "cuerpo": "c", "fuentes": [{"medio": "Inventado", "url": "https://falso"}]}
    datos, _ = leer_post(construir_post(CAND, red, None, AHORA, "t", False))
    assert datos["fuentes"] == [{"medio": "Stereogum", "url": "https://stereogum.com/n", "consultado": "2026-09-16"}]


def test_interruptor_apagado_genera_borrador():
    red = {"titulo": "t", "entrada": "e", "cuerpo": "c"}
    assert leer_post(construir_post(CAND, red, None, AHORA, "t", True))[0]["draft"] is True


def test_despublicar_desde_sheet():
    red = {"titulo": "t", "entrada": "e", "cuerpo": "c"}
    posts = {"a.md": construir_post(CAND, red, None, AHORA, "nota-a", False),
             "b.md": construir_post(CAND, red, None, AHORA, "nota-b", False)}
    filas = [{"slug": "nota-a", "despublicar": "TRUE"}, {"slug": "nota-b", "despublicar": ""}]
    cambios = aplicar_despublicacion(posts, filas)
    assert list(cambios) == ["a.md"]
    assert leer_post(cambios["a.md"])[0]["draft"] is True
    assert aplicar_despublicacion({"a.md": cambios["a.md"]}, [{"slug": "nota-a", "despublicar": "FALSE"}])
