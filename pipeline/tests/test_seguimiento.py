from datetime import datetime, timedelta, timezone

from cr import seguimiento
from cr.dedup import agrupar_por_hecho
from cr.ranking import seleccionar

AHORA = datetime(2026, 9, 21, 14, tzinfo=timezone.utc)
SEGUIDOS = seguimiento.cargar(["Iván Ferreiro", "Dani Martín", "Cariño", "Caifanes", "Rubén Pozo"])


def cand(artista, region="intl", seguido=False, relevancia="general", indie=True):
    return {"artista": artista, "relevancia": relevancia, "fuentes": [{}], "region": region, "seguido": seguido,
            "fecha": AHORA - timedelta(hours=1), "es_indie_rock": indie, "categoria": "gira"}


def test_coincide_sin_acentos_ni_mayusculas():
    assert seguimiento.es_seguido("IVAN FERREIRO", SEGUIDOS)
    assert seguimiento.es_seguido("dani martin", SEGUIDOS)


def test_coincide_con_un_participante_de_una_colaboracion():
    assert seguimiento.es_seguido("Iván Ferreiro y Rubén Pozo", SEGUIDOS)
    assert seguimiento.es_seguido("Wet Leg, Caifanes", SEGUIDOS)
    assert seguimiento.es_seguido("Rubén Pozo & Los Planetas", SEGUIDOS)


def test_no_coincide_por_parecido_ni_por_subcadena():
    assert not seguimiento.es_seguido("Cariño Malo", SEGUIDOS)
    assert not seguimiento.es_seguido("Wet Leg", SEGUIDOS)
    assert not seguimiento.es_seguido("", SEGUIDOS)
    assert not seguimiento.es_seguido("Caifanes", set())


def test_el_grupo_hereda_la_marca_de_seguido():
    def it(url, seguido):
        return {"titulo": url, "url": url, "url_norm": url, "fecha": AHORA, "resumen": "", "medio": "A", "region": "es",
                "clasificacion": {"artista": "Leiva", "categoria": "gira", "relevancia": "general",
                                  "es_indie_rock": True, "seguido": seguido, "fechas_evento": []}}
    assert agrupar_por_hecho([it("u1", False), it("u2", True)])[0]["seguido"] is True


def test_seguidos_van_primero_aunque_sean_de_menor_prioridad():
    cs = [cand("mx1", "mx", relevancia="mx"), cand("intl_seguido", "intl", seguido=True)]
    assert [c["artista"] for c in seleccionar(cs, 1)] == ["intl_seguido"]


def test_seguidos_cuentan_para_la_cuota_de_su_escena_y_no_exceden_el_tope():
    cs = [cand("seg_mx", "mx", seguido=True)] + [cand(f"mx{i}", "mx") for i in range(4)] + \
         [cand(f"es{i}", "es") for i in range(4)]
    elegidos = seleccionar(cs, 7, cuota_mx=3, cuota_es=3)
    assert [c["artista"] for c in elegidos] == ["seg_mx", "mx0", "mx1", "es0", "es1", "es2", "mx2"]
    assert len(seleccionar([cand(f"s{i}", seguido=True) for i in range(9)], 7, 3, 3)) == 7


def test_sin_seguidos_la_seleccion_no_cambia():
    cs = [cand(f"mx{i}", "mx") for i in range(5)] + [cand("es1", "es")]
    assert [c["artista"] for c in seleccionar(cs, 6, cuota_mx=3, cuota_es=3)] == ["mx0", "mx1", "mx2", "es1", "mx3", "mx4"]


def test_flujo_un_seguido_no_indie_se_publica_primero(tmp_path):
    from test_embeds_flujo import AHORA as AHORA_FLUJO, CFG, EmbedsFalso, LLMFalso, items
    import autoblog
    from cr.estado import estado_vacio

    cfg = {**CFG, "noticias": {**CFG["noticias"], "tope_diario": 1}, "seguimiento": ["Pop Star"]}
    llm = LLMFalso([{"titulo": "Pop Star anuncia gira", "entrada": "Va.", "cuerpo": "Nueva gira del artista."}])
    m = autoblog.ejecutar(cfg, items(), [], llm, EmbedsFalso(), estado_vacio(), tmp_path, AHORA_FLUJO)
    assert len(list(tmp_path.glob("*.md"))) == 1
    assert m["publicadas"] and "(seguido)" in m["publicadas"][0] and "Pop Star" in m["publicadas"][0]

    otro = tmp_path / "sin_seguimiento"
    otro.mkdir()
    redaccion = {"titulo": "Wet Leg viene", "entrada": "Va.", "cuerpo": "Noviembre."}
    sin = autoblog.ejecutar({**cfg, "seguimiento": []}, items(), [], LLMFalso([redaccion]), EmbedsFalso(),
                            estado_vacio(), otro, AHORA_FLUJO)
    assert "Pop Star" not in sin["publicadas"][0]


def test_la_lista_real_reconoce_nsqk_y_nesquik():
    import yaml
    from pathlib import Path
    ruta = Path(__file__).resolve().parent.parent.parent / "data" / "seguimiento.yaml"
    seguidos = seguimiento.cargar(yaml.safe_load(ruta.read_text(encoding="utf-8"))["artistas"])
    assert len(seguidos) == 26
    assert seguimiento.es_seguido("NSQK", seguidos) and seguimiento.es_seguido("Nesquik", seguidos)
    assert seguimiento.es_seguido("Camiches", seguidos) and seguimiento.es_seguido("Alcala Norte", seguidos)


def test_entradas_con_alias_reconocen_todas_las_escrituras():
    seguidos = seguimiento.cargar([{"nombre": "NSQK", "alias": ["Nesquik"]}, "Leiva", {"nombre": "Solo nombre"}])
    assert seguidos == {"nsqk", "nesquik", "leiva", "solo nombre"}
    assert seguimiento.es_seguido("Nesquik", seguidos) and seguimiento.es_seguido("nsqk", seguidos)
