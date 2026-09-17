from datetime import datetime, timedelta, timezone
from pathlib import Path

from cr.embeds_match import elegir_album_spotify, elegir_artista_spotify, elegir_video_youtube
from cr.estado import estado_vacio
from cr.frontmatter import leer_post

import autoblog


def test_spotify_exige_coincidencia_exacta():
    resultados = [{"name": "Wet Leg Tribute", "id": "1"}, {"name": "Wet Leg", "id": "2"}]
    assert elegir_artista_spotify(resultados, "wet leg")["id"] == "2"
    assert elegir_artista_spotify([{"name": "Wet Legs", "id": "3"}], "Wet Leg") is None


def test_album_debe_ser_del_mismo_artista():
    albums = [{"name": "Moisturizer", "id": "a", "artists": [{"id": "otro"}]},
              {"name": "moisturizer", "id": "b", "artists": [{"id": "wl"}]}]
    assert elegir_album_spotify(albums, "wl", "Moisturizer")["id"] == "b"


def test_youtube_acepta_canal_oficial_o_topic():
    items = [{"snippet": {"channelTitle": "Fan Uploads"}}, {"snippet": {"channelTitle": "Wet Leg - Topic"}, "id": {"videoId": "v"}}]
    assert elegir_video_youtube(items, "Wet Leg")["id"]["videoId"] == "v"


# --- Flujo completo con dobles (sin red) ---------------------------------

AHORA = datetime(2026, 9, 16, 8, tzinfo=timezone(timedelta(hours=-6)))
CFG = {"autopublicar": True, "noticias": {"tope_diario": 3, "ventana_horas": 72, "dias_bloqueo_repetidos": 14,
       "max_caracteres_titulo": 90, "max_palabras_cuerpo": 250, "ngram_copia": 8}}


class LLMFalso:
    tokens_usados = 1234

    def __init__(self, redacciones):
        self.redacciones = list(redacciones)
        self.llamadas_clasificar = 0

    def clasificar(self, lote, hoy):
        self.llamadas_clasificar += 1
        salida = []
        for n, it in enumerate(lote):
            if "Pop" in it["titulo"]:
                salida.append({"i": n, "artista": "Pop Star", "categoria": "gira", "es_indie_rock": False})
            elif "Wet Leg" in it["titulo"]:
                salida.append({"i": n, "artista": "Wet Leg", "categoria": "gira", "es_indie_rock": True,
                               "fechas_evento": [{"fecha": "2026-11-20", "ciudad": "Ciudad de México", "pais": "MX", "recinto": "Foro"}]})
            else:
                salida.append({"i": n, "artista": "Fontaines D.C.", "categoria": "lanzamiento", "es_indie_rock": True,
                               "titulo_lanzamiento": "Romance"})
        return salida

    def redactar(self, cand, hoy, errores=None):
        return self.redacciones.pop(0)


class EmbedsFalso:
    def buscar(self, artista, titulo=""):
        return {"plataforma": "spotify", "tipo": "artist", "id": "abc", "url": "https://open.spotify.com/artist/abc"} if artista == "Wet Leg" else None


def items():
    base = AHORA.astimezone(timezone.utc)
    return [
        {"titulo": "Wet Leg announce Mexico City show", "url": "https://a.com/wl", "fecha": base - timedelta(hours=2), "resumen": "Wet Leg will play Mexico City on November 20 at Foro", "medio": "Medio A"},
        {"titulo": "Wet Leg Mexico date", "url": "https://b.com/wl?utm_source=rss", "fecha": base - timedelta(hours=3), "resumen": "Tour news", "medio": "Medio B"},
        {"titulo": "Fontaines D.C. share new single", "url": "https://a.com/fdc", "fecha": base - timedelta(hours=5), "resumen": "The band shares a song from Romance their upcoming record out soon", "medio": "Medio A"},
        {"titulo": "Pop Star tour", "url": "https://a.com/pop", "fecha": base - timedelta(hours=1), "resumen": "Pop", "medio": "Medio A"},
        {"titulo": "Old news", "url": "https://a.com/old", "fecha": base - timedelta(days=5), "resumen": "old", "medio": "Medio A"},
    ]


def test_flujo_publica_prioriza_mx_agrupa_fuentes_y_descarta_copia(tmp_path: Path):
    redacciones = [
        {"titulo": "Wet Leg viene a la Ciudad de México", "entrada": "Anótenlo.", "cuerpo": "La banda británica tocará el 20 de noviembre."},
        {"titulo": "Fontaines D.C. estrena canción", "entrada": "Nuevo adelanto.", "cuerpo": "the band shares a song from their upcoming record out soon"},
        {"titulo": "Fontaines D.C. estrena canción", "entrada": "Nuevo adelanto.", "cuerpo": "the band shares a song from their upcoming record out soon"},
    ]
    llm, estado = LLMFalso(redacciones), estado_vacio()
    estado["clasificaciones"] = {}
    m = autoblog.ejecutar(CFG, items(), ["Feed caído: timeout"], llm, EmbedsFalso(), estado, tmp_path, AHORA)

    archivos = sorted(tmp_path.glob("*.md"))
    assert len(archivos) == 1
    datos, _ = leer_post(archivos[0].read_text(encoding="utf-8"))
    assert datos["relevancia"] == "mx" and datos["draft"] is False
    assert [f["medio"] for f in datos["fuentes"]] == ["Medio A", "Medio B"]
    assert datos["embed"]["plataforma"] == "spotify"
    assert any("Fontaines" in d for d in m["descartadas"])
    assert m["fallidos"] == ["Feed caído: timeout"]


def test_segunda_corrida_no_repite_ni_reclasifica(tmp_path: Path):
    redacciones = [{"titulo": "Wet Leg viene a México", "entrada": "Sí.", "cuerpo": "Noviembre."},
                   {"titulo": "Fontaines D.C. estrena canción", "entrada": "Sí.", "cuerpo": "Nueva canción del disco."}]
    llm, estado = LLMFalso(redacciones), estado_vacio()
    autoblog.ejecutar(CFG, items(), [], llm, EmbedsFalso(), estado, tmp_path, AHORA)
    assert len(list(tmp_path.glob("*.md"))) == 2

    llm2 = LLMFalso([])
    m2 = autoblog.ejecutar(CFG, items(), [], llm2, EmbedsFalso(), estado, tmp_path, AHORA)
    assert m2["publicadas"] == [] and llm2.llamadas_clasificar == 0
