"""Validación de las respuestas del modelo. Nada del modelo se usa sin pasar por aquí."""
import json
import re
from datetime import date

CATEGORIAS = {"gira", "lanzamiento", "anuncio", "otro"}
RELEVANCIAS = {"mx", "latam", "general"}
PAISES_LATAM = {
    "AR", "BO", "BR", "CL", "CO", "CR", "CU", "DO", "EC", "GT", "HN", "NI",
    "PA", "PE", "PR", "PY", "SV", "UY", "VE",
}


def extraer_json(texto: str):
    """Parsea JSON aunque venga envuelto en cercas de código o con texto alrededor."""
    if texto is None:
        raise ValueError("respuesta vacía")
    limpio = re.sub(r"```(?:json)?", "", texto).strip()
    try:
        return json.loads(limpio)
    except json.JSONDecodeError:
        inicio = min([i for i in (limpio.find("{"), limpio.find("[")) if i >= 0], default=-1)
        fin = max(limpio.rfind("}"), limpio.rfind("]"))
        if inicio < 0 or fin <= inicio:
            raise ValueError("no hay JSON en la respuesta")
        return json.loads(limpio[inicio : fin + 1])


def _fecha_iso(valor) -> str | None:
    try:
        return date.fromisoformat(str(valor)[:10]).isoformat()
    except (TypeError, ValueError):
        return None


def validar_clasificacion(obj: dict, hoy: date) -> dict | None:
    """Devuelve la clasificación saneada o None si no sirve.

    La relevancia se recalcula con las fechas: `mx` exige una fecha futura en MX
    y `latam` una en un país latinoamericano. El modelo no puede subir la prioridad
    sin una fecha que la respalde.
    """
    if not isinstance(obj, dict):
        return None
    artista = str(obj.get("artista") or "").strip()
    categoria = str(obj.get("categoria") or "").strip().lower()
    if not artista or categoria not in CATEGORIAS:
        return None
    fechas = []
    for f in obj.get("fechas_evento") or []:
        if not isinstance(f, dict):
            continue
        iso = _fecha_iso(f.get("fecha"))
        if not iso or date.fromisoformat(iso) < hoy:
            continue
        fechas.append({
            "fecha": iso,
            "ciudad": str(f.get("ciudad") or "").strip(),
            "pais": str(f.get("pais") or "").strip().upper()[:2],
            "recinto": str(f.get("recinto") or "").strip(),
        })
    paises = {f["pais"] for f in fechas}
    if "MX" in paises:
        relevancia = "mx"
    elif paises & PAISES_LATAM:
        relevancia = "latam"
    else:
        relevancia = "general"
    return {
        "artista": artista,
        "categoria": categoria,
        "es_indie_rock": bool(obj.get("es_indie_rock")),
        "relevancia": relevancia,
        "fechas_evento": fechas,
        "titulo_lanzamiento": str(obj.get("titulo_lanzamiento") or "").strip(),
    }


def validar_redaccion(obj: dict) -> dict | None:
    if not isinstance(obj, dict):
        return None
    campos = {k: str(obj.get(k) or "").strip() for k in ("titulo", "entrada", "cuerpo")}
    if not all(campos.values()):
        return None
    return campos
