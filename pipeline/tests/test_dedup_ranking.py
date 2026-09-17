from datetime import datetime, timedelta, timezone

from cr.dedup import agrupar_por_hecho, dedup_por_url, excluir_publicados, filtrar_ventana
from cr.ranking import seleccionar

AHORA = datetime(2026, 9, 16, 14, tzinfo=timezone.utc)


def item(url, medio="A", horas=1, artista="Wet Leg", categoria="gira", relevancia="general", indie=True, region="intl"):
    return {
        "titulo": f"t {url}", "url": url, "url_norm": url, "fecha": AHORA - timedelta(hours=horas),
        "resumen": "r", "medio": medio, "region": region,
        "clasificacion": {"artista": artista, "categoria": categoria, "relevancia": relevancia,
                          "es_indie_rock": indie, "fechas_evento": []},
    }


def test_ventana_72_horas():
    items = [item("a", horas=71), item("b", horas=73), {**item("c"), "fecha": None}]
    assert [i["url"] for i in filtrar_ventana(items, AHORA, 72)] == ["a"]


def test_misma_url_en_dos_feeds_es_un_item():
    items = [{"url": "https://www.x.com/n/"}, {"url": "https://x.com/n"}]
    assert len(dedup_por_url(items)) == 1


def test_mismo_hecho_de_tres_medios_es_un_candidato_con_tres_fuentes():
    grupos = agrupar_por_hecho([item("u1", "A"), item("u2", "B"), item("u3", "C", artista="The Wet Leg")])
    assert len(grupos) == 1
    assert [f["medio"] for f in grupos[0]["fuentes"]] == ["A", "B", "C"]


def test_grupo_hereda_la_relevancia_mas_alta():
    grupos = agrupar_por_hecho([item("u1", relevancia="general"), item("u2", relevancia="mx")])
    assert grupos[0]["relevancia"] == "mx"


def test_grupo_hereda_la_region_mas_prioritaria():
    grupos = agrupar_por_hecho([item("u1", region="intl"), item("u2", region="mx")])
    assert grupos[0]["region"] == "mx"


def test_excluye_hechos_y_urls_ya_publicados():
    grupos = agrupar_por_hecho([item("u1", artista="Wet Leg"), item("u2", artista="Fontaines D.C.")])
    estado = {"claves_publicadas": {"wet leg|gira": "x"}, "urls_publicadas": {}}
    assert [g["artista"] for g in excluir_publicados(grupos, estado, set())] == ["Fontaines D.C."]
    assert excluir_publicados(grupos, {"claves_publicadas": {}, "urls_publicadas": {}}, {"u2"})[0]["artista"] == "Wet Leg"


def cand(artista, relevancia, fuentes=1, horas=1, indie=True, region="intl"):
    return {"artista": artista, "relevancia": relevancia, "fuentes": [{}] * fuentes, "region": region,
            "fecha": AHORA - timedelta(hours=horas), "es_indie_rock": indie, "categoria": "gira"}


def test_prioridad_mx_y_relleno_con_general():
    cs = [cand("g1", "general", 3), cand("m", "mx"), cand("g2", "general", 2), cand("g3", "general", 1)]
    assert [c["artista"] for c in seleccionar(cs, 3)] == ["m", "g1", "g2"]


def test_region_mx_es_le_gana_a_intl_aunque_la_gira_sea_menos_relevante():
    cs = [cand("intl_mx_gira", "mx", region="intl"), cand("es_general", "general", region="es")]
    assert [c["artista"] for c in seleccionar(cs, 2)] == ["es_general", "intl_mx_gira"]


def test_empate_gana_el_mas_reciente_y_no_indie_nunca_entra():
    cs = [cand("viejo", "latam", horas=10), cand("nuevo", "latam", horas=1), cand("pop", "mx", indie=False)]
    assert [c["artista"] for c in seleccionar(cs, 3)] == ["nuevo", "viejo"]


def test_tope_y_lista_vacia():
    assert len(seleccionar([cand(str(i), "mx") for i in range(5)], 2)) == 2
    assert seleccionar([], 3) == []
