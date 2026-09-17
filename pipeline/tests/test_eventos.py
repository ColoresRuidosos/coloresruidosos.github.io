from datetime import date

from cr.eventos import aplicar_sheet, aplicar_supervivencia, conservar_marcas, nuevo_evento, preparar_agenda
from cr.jsonld import extraer_eventos
from cr.sheet import parsear_csv

HOY = date(2026, 9, 16)
CURADORES = ["Pardy", "Tanelly", "Dany", "Pratz"]


def ev(titulo, fecha="2026-10-01", recinto="Foro A", **kw):
    return nuevo_evento(titulo, fecha, recinto, "Pachuca", **kw)


def test_scraper_roto_conserva_eventos_anteriores_futuros():
    anteriores = [ev("Viejo pasado", "2026-09-01"), ev("Viejo futuro"), ev("Otro recinto", recinto="Foro B")]
    eventos, avisos = aplicar_supervivencia({"Foro A": None, "Foro B": [ev("Nuevo B", recinto="Foro B")]}, anteriores, HOY)
    assert sorted(e["titulo"] for e in eventos) == ["Nuevo B", "Viejo futuro"]
    assert "Foro A" in avisos[0]


def test_cero_eventos_tambien_cuenta_como_roto():
    eventos, avisos = aplicar_supervivencia({"Foro A": []}, [ev("Viejo")], HOY)
    assert [e["titulo"] for e in eventos] == ["Viejo"] and avisos


def test_sheet_corrige_oculta_y_marca_curadores():
    eventos = [ev("Wet Leg en vivo"), ev("Banda que se canceló", "2026-10-05")]
    filas = [
        {"recinto": "foro a", "fecha": "2026-10-01", "titulo": "wet leg", "nueva_fecha": "2026-10-02", "hora": "21:00", "pardy": "TRUE", "pratz": "x"},
        {"recinto": "Foro A", "fecha": "2026-10-05", "titulo": "Banda que", "ocultar": "sí"},
    ]
    resultado, _ = aplicar_sheet(eventos, filas, CURADORES)
    assert len(resultado) == 1
    e = resultado[0]
    assert (e["fecha"], e["hora"], e["curadores"]) == ("2026-10-02", "21:00", ["Pardy", "Pratz"])


def test_sheet_agrega_evento_del_equipo():
    filas = [{"recinto": "Foro Instagram", "fecha": "2026-10-10", "titulo": "Show local", "dany": "TRUE"}]
    resultado, _ = aplicar_sheet([], filas, CURADORES)
    assert resultado[0]["origen"] == "equipo" and resultado[0]["curadores"] == ["Dany"]


def test_sin_sheet_se_conservan_marcas_y_eventos_del_equipo():
    anterior = dict(ev("Wet Leg"), curadores=["Tanelly"])
    del_equipo = dict(ev("Local", origen="equipo"), curadores=["Dany"])
    salida = conservar_marcas([ev("Wet Leg")], [anterior, del_equipo])
    assert salida[0]["curadores"] == ["Tanelly"] and len(salida) == 2


def test_agenda_filtra_ordena_y_firma_cartelera():
    eventos = [ev("B", "2026-10-02", hora="20:00"), ev("A", "2026-10-02", hora="19:00"),
               ev("Pasado", "2026-09-10"), ev("Lejano", "2027-06-01"), dict(ev("C", "2026-09-20"), curadores=["Pardy"])]
    agenda = preparar_agenda(eventos, HOY, 60, "Cartelera")
    assert [e["titulo"] for e in agenda] == ["C", "A", "B"]
    assert agenda[0]["firma"] == ["Pardy"] and agenda[1]["firma"] == ["Cartelera"]


def test_csv_normaliza_encabezados():
    filas = parsear_csv("Recinto,Fecha,Título,Nueva fecha,Pardy\nForo A,2026-10-01,Show,,TRUE\n,,,,\n")
    assert filas == [{"recinto": "Foro A", "fecha": "2026-10-01", "titulo": "Show", "nueva_fecha": "", "pardy": "TRUE"}]


HTML = """<html><head>
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[
 {"@type":"MusicEvent","name":"Wet Leg","startDate":"2026-11-20T21:00:00-06:00","url":"https://foro.mx/wet-leg",
  "offers":{"price":"850","priceCurrency":"MXN"},
  "location":{"@type":"Place","name":"Pepsi Center","address":{"addressLocality":"Ciudad de México"}}},
 {"@type":"Organization","name":"Foro"}]}</script>
<script type="application/ld+json">[{"@type":["MusicEvent"],"name":"Sin hora","startDate":"2026-12-01"}, {"@type":"Event","name":"Roto"}]</script>
<script type="application/ld+json">{ no es json }</script>
</head></html>"""


def test_jsonld_extrae_eventos_y_ignora_basura():
    eventos = extraer_eventos(HTML, {"nombre": "Foro", "ciudad": "CDMX", "url": "https://foro.mx"})
    assert [(e["titulo"], e["fecha"], e["hora"], e["precio"]) for e in eventos] == [
        ("Wet Leg", "2026-11-20", "21:00", "850 MXN"), ("Sin hora", "2026-12-01", None, None)]
    assert eventos[1]["url"] == "https://foro.mx"
    # El recinto real viene del `location` del evento; el de config es solo respaldo.
    assert (eventos[0]["recinto"], eventos[0]["ciudad"]) == ("Pepsi Center", "Ciudad de México")
    assert (eventos[1]["recinto"], eventos[1]["ciudad"]) == ("Foro", "CDMX")


def test_flujo_agenda_con_recinto_roto_y_sheet():
    import scrape_eventos

    cfg = {"agenda": {"minimo_eventos_por_recinto": 1, "curadores": CURADORES, "firma_sin_curador": "Cartelera", "dias_futuro": 90}}
    recintos = [{"nombre": "Foro", "ciudad": "CDMX", "url": "https://foro.mx"},
                {"nombre": "Roto", "ciudad": "Pachuca", "url": "https://roto.mx"}]

    def obtener(url):
        if "roto" in url:
            raise TimeoutError("timeout")
        return HTML

    anteriores = [dict(ev("Show viejo del roto", "2026-10-03", recinto="Roto"), curadores=["Dany"])]
    filas = [{"recinto": "Pepsi Center", "fecha": "2026-11-20", "titulo": "Wet Leg", "tanelly": "TRUE"}]
    agenda, avisos = scrape_eventos.ejecutar(cfg, recintos, obtener, filas, anteriores, HOY)

    assert [e["titulo"] for e in agenda] == ["Show viejo del roto", "Wet Leg", "Sin hora"]
    assert agenda[0]["firma"] == ["Cartelera"]      # con Sheet disponible, sus marcas mandan
    assert agenda[1]["firma"] == ["Tanelly"]
    assert any("Roto" in a for a in avisos)
