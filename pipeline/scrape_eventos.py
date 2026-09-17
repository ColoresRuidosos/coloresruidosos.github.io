"""Agenda: carteleras de recintos (JSON-LD) + Google Sheet del equipo → data/eventos.json.

Uso:
    python pipeline/scrape_eventos.py [--resumen RUTA]
"""
import argparse
import json
import os
from datetime import date, datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import yaml

from cr import resumen
from cr.eventos import aplicar_sheet, aplicar_supervivencia, conservar_marcas, preparar_agenda
from cr.jsonld import extraer_eventos

RAIZ = Path(__file__).resolve().parent.parent
PIPELINE = RAIZ / "pipeline"


def ejecutar(cfg: dict, recintos: list[dict], obtener, filas_sheet: list[dict] | None,
             anteriores: list[dict], hoy: date) -> tuple[list[dict], list[str]]:
    agenda_cfg = cfg["agenda"]
    raspados, avisos = {}, []
    for r in recintos:
        if not r.get("activo", True):
            continue
        try:
            raspados[r["nombre"]] = extraer_eventos(obtener(r["url"]), r)
        except Exception as exc:  # noqa: BLE001
            raspados[r["nombre"]] = None
            avisos.append(f"{r['nombre']}: {exc}")

    eventos, avisos_sup = aplicar_supervivencia(raspados, anteriores, hoy, agenda_cfg["minimo_eventos_por_recinto"])
    avisos += avisos_sup

    if filas_sheet is None:
        eventos = conservar_marcas(eventos, anteriores)
    else:
        eventos = [dict(e, curadores=[]) for e in eventos]
        eventos, avisos_sheet = aplicar_sheet(eventos, filas_sheet, agenda_cfg["curadores"])
        avisos += avisos_sheet

    return preparar_agenda(eventos, hoy, agenda_cfg["dias_futuro"], agenda_cfg["firma_sin_curador"]), avisos


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--resumen")
    args = parser.parse_args()

    from cr.sheet import leer
    from cr.web import obtener_texto

    cfg = yaml.safe_load((PIPELINE / "config/pipeline.yaml").read_text(encoding="utf-8"))
    recintos = yaml.safe_load((PIPELINE / "config/recintos.yaml").read_text(encoding="utf-8")).get("recintos") or []
    ahora = datetime.now(ZoneInfo(cfg["zona_horaria"]))
    ruta = RAIZ / "data/eventos.json"
    anteriores = json.loads(ruta.read_text(encoding="utf-8")).get("eventos", []) if ruta.exists() else []

    filas, url_sheet = None, os.environ.get("SHEET_EVENTOS_CSV")
    if url_sheet:
        try:
            filas = leer(url_sheet, lambda u: obtener_texto(u, respetar_robots=False))
        except Exception as exc:  # noqa: BLE001
            print(f"No se pudo leer el Sheet de eventos: {exc}")

    agenda, avisos = ejecutar(cfg, recintos, obtener_texto, filas, anteriores, ahora.date())
    nuevo = {"actualizado": ahora.isoformat(timespec="seconds"), "eventos": agenda}
    previo = json.loads(ruta.read_text(encoding="utf-8")) if ruta.exists() else {}
    if previo.get("eventos") != agenda:
        ruta.parent.mkdir(parents=True, exist_ok=True)
        ruta.write_text(json.dumps(nuevo, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    resumen.escribir(args.resumen, resumen.agenda({"total": len(agenda), "sheet": filas is not None, "avisos": avisos}))


if __name__ == "__main__":
    main()
