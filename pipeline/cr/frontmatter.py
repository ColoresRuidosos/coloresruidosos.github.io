"""Construcción y lectura de archivos Markdown de Hugo. El YAML lo escribe el código, no el modelo."""
from datetime import datetime

import yaml


def construir_post(candidato: dict, redaccion: dict, embed: dict | None, ahora: datetime, slug: str, borrador: bool) -> str:
    fuentes = [
        {"medio": f["medio"], "url": f["url"], "consultado": ahora.date().isoformat()}
        for f in candidato["fuentes"]
    ]
    datos = {
        "title": redaccion["titulo"],
        "date": ahora.isoformat(timespec="seconds"),
        "draft": borrador,
        "slug": slug,
        "description": redaccion["entrada"],
        "categoria": candidato["categoria"],
        "artista": candidato["artista"],
        "relevancia": candidato["relevancia"],
        "fechas_evento": candidato.get("fechas_evento", []),
        "embed": embed,
        "fuentes": fuentes,
        "generado_por": "radar-v1",
    }
    cabecera = yaml.safe_dump(datos, allow_unicode=True, sort_keys=False, default_flow_style=False)
    return f"---\n{cabecera}---\n\n{redaccion['cuerpo'].strip()}\n"


def leer_post(texto: str) -> tuple[dict, str]:
    if not texto.startswith("---"):
        return {}, texto
    _, cabecera, cuerpo = texto.split("---", 2)
    return yaml.safe_load(cabecera) or {}, cuerpo


def cambiar_borrador(texto: str, borrador: bool) -> str:
    datos, cuerpo = leer_post(texto)
    if not datos or datos.get("draft") == borrador:
        return texto
    datos["draft"] = borrador
    cabecera = yaml.safe_dump(datos, allow_unicode=True, sort_keys=False, default_flow_style=False)
    return f"---\n{cabecera}---{cuerpo}"
