"""F16/D22: página de prensa. Contrato de data/prensa.yaml y compilación de /prensa/."""
import re
import shutil
import subprocess
from datetime import date
from pathlib import Path

import pytest
import yaml

RAIZ = Path(__file__).resolve().parents[2]
DATOS = RAIZ / "data/prensa.yaml"
CORREO = re.compile(r"^[^@\s]+@[^@\s]+\.[a-z]{2,}$")


@pytest.fixture(scope="module")
def prensa():
    return yaml.safe_load(DATOS.read_text(encoding="utf-8"))


def test_tiene_todas_las_secciones(prensa):
    for clave in ("fecha_corte", "presentacion", "cifras", "caso_principal", "casos",
                  "ofrecemos", "pedimos", "compromisos", "contacto", "pdf"):
        assert prensa.get(clave), clave


def test_fecha_de_corte_es_una_fecha_iso(prensa):
    assert isinstance(date.fromisoformat(str(prensa["fecha_corte"])), date)


def test_cada_cifra_dice_de_donde_sale(prensa):
    assert len(prensa["cifras"]) >= 3
    for c in prensa["cifras"]:
        for clave in ("valor", "etiqueta", "fuente"):
            assert str(c.get(clave, "")).strip(), (c, clave)


def test_cada_caso_tiene_titulo_y_texto(prensa):
    for caso in [prensa["caso_principal"], *prensa["casos"]]:
        assert caso.get("titulo") and caso.get("texto"), caso


def test_contacto_tiene_correo_valido_e_instagram(prensa):
    assert CORREO.match(prensa["contacto"]["correo"])
    assert prensa["contacto"]["instagram"].startswith("@")


def test_existen_las_imagenes_y_el_pdf_que_menciona(prensa):
    for img in prensa["caso_principal"].get("imagenes", []):
        assert (RAIZ / "assets" / img["archivo"]).is_file(), img["archivo"]
        assert img.get("alt"), img
    pdf = RAIZ / "static" / prensa["pdf"]
    assert pdf.is_file() and pdf.stat().st_size < 5 * 1024 * 1024


@pytest.fixture(scope="module")
def sitio(tmp_path_factory):
    if not shutil.which("hugo"):
        pytest.skip("hugo no está instalado")
    salida = tmp_path_factory.mktemp("sitio")
    r = subprocess.run(["hugo", "--quiet", "-d", str(salida)], cwd=RAIZ, capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
    return salida


def notas_publicadas():
    n = 0
    for md in (RAIZ / "content/posts").glob("*.md"):
        if md.name.startswith("_"):
            continue
        cabecera = md.read_text(encoding="utf-8").split("---")[1]
        if not re.search(r"^draft:\s*true", cabecera, re.M):
            n += 1
    return n


def test_la_pagina_trae_cifras_fecha_contador_y_pdf(sitio, prensa):
    html = (sitio / "prensa/index.html").read_text(encoding="utf-8")
    for c in prensa["cifras"]:
        assert str(c["valor"]) in html, c["valor"]
    assert 'datetime="%s"' % prensa["fecha_corte"] in html
    assert 'data-notas="%d"' % notas_publicadas() in html
    assert prensa["pdf"].split("/")[-1] in html
    assert prensa["contacto"]["correo"] in html


def test_el_pie_enlaza_a_prensa(sitio):
    html = (sitio / "index.html").read_text(encoding="utf-8")
    assert re.search(r'<footer class="pie">.*href="[^"]*prensa/"', html, re.S)
