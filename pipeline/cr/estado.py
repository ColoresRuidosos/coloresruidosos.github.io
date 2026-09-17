"""Estado persistente para no repetir notas ni reclasificar lo ya visto."""
import json
from datetime import datetime, timedelta
from pathlib import Path


def estado_vacio() -> dict:
    return {"urls_publicadas": {}, "claves_publicadas": {}, "clasificaciones": {}}


def cargar(ruta: Path) -> dict:
    if not ruta.exists():
        return estado_vacio()
    datos = json.loads(ruta.read_text(encoding="utf-8"))
    return {**estado_vacio(), **datos}


def guardar(ruta: Path, estado: dict) -> None:
    ruta.parent.mkdir(parents=True, exist_ok=True)
    ruta.write_text(json.dumps(estado, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def podar(estado: dict, ahora: datetime, dias_urls: int, dias_claves: int, horas_clasificaciones: int) -> dict:
    def vigentes(mapa, limite, obtener=lambda v: v):
        return {k: v for k, v in mapa.items() if datetime.fromisoformat(obtener(v)) >= limite}

    return {
        "urls_publicadas": vigentes(estado["urls_publicadas"], ahora - timedelta(days=dias_urls)),
        "claves_publicadas": vigentes(estado["claves_publicadas"], ahora - timedelta(days=dias_claves)),
        "clasificaciones": vigentes(estado["clasificaciones"], ahora - timedelta(hours=horas_clasificaciones), lambda v: v["vista"]),
    }
