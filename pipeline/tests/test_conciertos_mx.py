"""F26/D32: la lista de conciertos que usa el fanzine."""
from collections import Counter
from datetime import date
from pathlib import Path

import yaml

DATOS = yaml.safe_load((Path(__file__).resolve().parents[2] / "data/conciertos_mx.yaml").read_text(encoding="utf-8"))
C = DATOS["conciertos"]


def test_son_47_conciertos_con_fecha_recinto_y_ciudad():
    assert len(C) == 47
    for c in C:
        assert isinstance(c["fecha"], date) and c["recinto"] and c["ciudad"], c


def test_van_en_orden_y_sin_repetir():
    fechas = [(c["fecha"], c["recinto"]) for c in C]
    assert fechas == sorted(fechas)
    assert len(set(fechas)) == len(fechas)


def test_conteo_por_anio_como_la_investigacion():
    por_anio = Counter(c["fecha"].year for c in C)
    assert dict(por_anio) == {2013: 5, 2014: 4, 2016: 5, 2017: 2, 2018: 3, 2022: 11, 2023: 6, 2024: 3, 2025: 1, 2026: 7}


def test_los_proximos_son_despues_del_ultimo_y_tienen_edicion():
    ultimo = C[-1]["fecha"]
    assert [p["edicion"] for p in DATOS["proximos"]] == ["metropolitan", "auditorio", "puebla"]
    assert all(p["fecha"] > ultimo for p in DATOS["proximos"])
