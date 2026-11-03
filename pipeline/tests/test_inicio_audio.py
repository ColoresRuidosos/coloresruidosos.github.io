"""F22/D28: los fragmentos de Adivina la canción empiezan donde el avance ya suena."""
import shutil
import subprocess

import pytest

from cr.audio_trivia import ResolverAudio
from cr.inicio_audio import inicio_audible, medir_inicio, rms_por_paso

PASO = 0.1


def perfil(*tramos):
    """tramos: (segundos, nivel) → RMS cada 0,1 s."""
    salida = []
    for seg, nivel in tramos:
        salida += [nivel] * round(seg / PASO)
    return salida


def test_avance_que_suena_desde_el_principio_empieza_en_cero():
    assert inicio_audible(perfil((30, 0.5))) == 0.0


def test_salta_el_silencio_y_el_fade_inicial():
    rms = perfil((1.5, 0.0), (1.0, 0.04), (27.5, 0.5))   # 1,5 s mudo, 1 s de fade muy bajo, luego la canción
    assert inicio_audible(rms) == 2.5


def test_no_empieza_en_un_hueco_dentro_del_primer_segundo():
    # Suena 0,6 s, se calla 0,4 s y vuelve: el fragmento de 1 s tendría medio silencio.
    rms = perfil((0.6, 0.5), (0.4, 0.0), (29, 0.5))
    assert inicio_audible(rms) == 1.0


def test_intro_muy_baja_cuenta_como_silencio_frente_al_resto():
    rms = perfil((4, 0.05), (26, 0.6))
    assert inicio_audible(rms) == 4.0


def test_nunca_pasa_de_14_s_para_que_quepan_los_16_s():
    rms = perfil((20, 0.0), (10, 0.5))
    assert inicio_audible(rms) <= 14.0


def test_sin_ventana_valida_elige_la_de_mas_energia_antes_del_tope():
    rms = perfil((5, 0.0), (1, 0.3), (24, 0.0))           # casi todo mudo: solo un golpe en el segundo 5
    assert inicio_audible(rms) == 5.0


def test_avance_mudo_o_vacio_empieza_en_cero():
    assert inicio_audible([]) == 0.0
    assert inicio_audible(perfil((30, 0.0))) == 0.0


def test_rms_por_paso_de_muestras_pcm():
    sr = 1000
    muestras = [0] * 500 + [1000, -1000] * 250             # 0,5 s mudo y 0,5 s a amplitud 1000
    rms = rms_por_paso(muestras, sr, PASO)
    assert len(rms) == 10
    assert rms[:5] == [0.0] * 5
    assert all(abs(x - 1000 / 32768) < 1e-9 for x in rms[5:])


@pytest.mark.skipif(not shutil.which("ffmpeg"), reason="sin ffmpeg")
def test_medir_inicio_descarga_y_decodifica_un_avance(tmp_path):
    ruta = tmp_path / "avance.m4a"
    subprocess.run(["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-f", "lavfi",
                    "-i", "sine=frequency=440:sample_rate=44100", "-filter_complex",
                    "[0]atrim=0:2[a];[1]atrim=0:20[b];[a][b]concat=n=2:v=0:a=1", "-c:a", "aac", str(ruta)], check=True)

    class Resp:
        content = ruta.read_bytes()

        def raise_for_status(self):
            pass

    inicio = medir_inicio("https://audio-ssl.itunes.apple.com/x.m4a", http_get=lambda url, timeout=None: Resp())
    assert 1.9 <= inicio <= 2.2


class Resp:
    def __init__(self, data):
        self.data = data

    def raise_for_status(self):
        pass

    def json(self):
        return self.data


APPLE = {"kind": "song", "artistName": "Love of Lesbian", "trackName": "Miau", "collectionName": "1999",
         "previewUrl": "https://audio-ssl.itunes.apple.com/miau.m4a", "trackViewUrl": "https://music.apple.com/mx/x?i=1"}
CANCIONES = [{"id": "9911", "titulo": "Miau", "disco": "99"}]
DISCOS = [{"id": "99", "nombre": "1999"}]


def http_apple(url, params=None, headers=None, timeout=None):
    return Resp({"results": [APPLE]})


def test_resolver_guarda_el_inicio_de_cada_avance():
    medidos = []
    r = ResolverAudio(http_get=http_apple, esperar=lambda s: None, medir_inicio=lambda u: medidos.append(u) or 2.3)
    salida = r.resolver(CANCIONES, DISCOS)
    assert salida["canciones"]["9911"]["inicio"] == 2.3
    assert medidos == [APPLE["previewUrl"]]


def test_resolver_reutiliza_el_inicio_si_el_avance_no_cambio():
    previos = {"9911": {"preview": APPLE["previewUrl"], "inicio": 1.7}}
    r = ResolverAudio(http_get=http_apple, esperar=lambda s: None, previos=previos,
                      medir_inicio=lambda u: pytest.fail("no debe descargar"))
    assert r.resolver(CANCIONES, DISCOS)["canciones"]["9911"]["inicio"] == 1.7


def test_resolver_mide_otra_vez_si_cambio_el_avance():
    previos = {"9911": {"preview": "https://audio-ssl.itunes.apple.com/viejo.m4a", "inicio": 1.7}}
    r = ResolverAudio(http_get=http_apple, esperar=lambda s: None, previos=previos, medir_inicio=lambda u: 0.4)
    assert r.resolver(CANCIONES, DISCOS)["canciones"]["9911"]["inicio"] == 0.4


def test_si_la_descarga_falla_el_inicio_es_cero_y_se_avisa(capsys):
    def falla(url):
        raise ConnectionError("caída")

    r = ResolverAudio(http_get=http_apple, esperar=lambda s: None, medir_inicio=falla)
    salida = r.resolver(CANCIONES, DISCOS)
    assert salida["canciones"]["9911"]["inicio"] == 0
    assert "9911" in capsys.readouterr().out
