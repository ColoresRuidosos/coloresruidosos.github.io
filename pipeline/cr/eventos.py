"""Agenda: supervivencia del scraping, correcciones del Sheet y filtrado.

Regla principal: el Google Sheet siempre gana sobre lo raspado.
"""
from datetime import date, timedelta

from .normalizar import normalizar_texto
from .slug import crear_slug

VERDADERO = {"true", "verdadero", "si", "sí", "x", "1", "yes"}


def es_verdadero(valor) -> bool:
    return str(valor or "").strip().lower() in VERDADERO


def id_evento(recinto: str, fecha: str, titulo: str) -> str:
    return f"{crear_slug(recinto, max_len=30)}-{fecha}-{crear_slug(titulo, max_len=40)}"


def nuevo_evento(titulo, fecha, recinto, ciudad="", hora=None, url="", precio=None, origen="cartelera") -> dict:
    return {
        "id": id_evento(recinto, fecha, titulo),
        "titulo": titulo.strip(),
        "fecha": fecha,
        "hora": hora or None,
        "recinto": recinto.strip(),
        "ciudad": ciudad.strip(),
        "url": url or "",
        "precio": precio or None,
        "origen": origen,
        "curadores": [],
    }


def aplicar_supervivencia(raspados: dict[str, list[dict] | None], anteriores: list[dict], hoy: date, minimo: int = 1):
    """Por recinto: si el scraper falló (None) o trajo menos de `minimo` eventos,
    se conservan los eventos futuros que ya se conocían de ese recinto."""
    eventos, avisos = [], []
    for recinto, lista in raspados.items():
        if lista is None or len(lista) < minimo:
            previos = [e for e in anteriores if e["recinto"] == recinto and e.get("origen") == "cartelera" and date.fromisoformat(e["fecha"]) >= hoy]
            motivo = "falló el scraper" if lista is None else f"trajo {len(lista)} eventos"
            avisos.append(f"{recinto}: {motivo}; se conservan {len(previos)} eventos anteriores")
            eventos.extend(previos)
        else:
            eventos.extend(lista)
    return eventos, avisos


def _coincide(evento: dict, fila: dict) -> bool:
    if normalizar_texto(evento["recinto"]) != normalizar_texto(fila.get("recinto", "")):
        return False
    if evento["fecha"] != str(fila.get("fecha", "")).strip():
        return False
    a, b = normalizar_texto(evento["titulo"]), normalizar_texto(fila.get("titulo", ""))
    return bool(b) and (b in a or a in b)


def aplicar_sheet(eventos: list[dict], filas: list[dict], curadores: list[str]) -> tuple[list[dict], list[str]]:
    """Aplica correcciones, ocultados y recomendaciones. Filas sin coincidencia y
    con datos completos se agregan como eventos cargados por el equipo."""
    resultado = [dict(e, curadores=list(e.get("curadores", []))) for e in eventos]
    ocultos, avisos = set(), []
    for fila in filas:
        marcados = [c for c in curadores if es_verdadero(fila.get(c.lower()))]
        coincidencias = [e for e in resultado if _coincide(e, fila)]
        if not coincidencias:
            if all(str(fila.get(k, "")).strip() for k in ("recinto", "fecha", "titulo")):
                try:
                    date.fromisoformat(str(fila["fecha"]).strip())
                except ValueError:
                    avisos.append(f"fila con fecha inválida: {fila.get('titulo')}")
                    continue
                if es_verdadero(fila.get("ocultar")):
                    continue
                e = nuevo_evento(fila["titulo"], str(fila["fecha"]).strip(), fila["recinto"], fila.get("ciudad", ""),
                                 fila.get("hora"), fila.get("url"), fila.get("precio"), origen="equipo")
                _corregir(e, fila)
                e["curadores"] = marcados
                resultado.append(e)
            continue
        for e in coincidencias:
            if es_verdadero(fila.get("ocultar")):
                ocultos.add(e["id"])
                continue
            _corregir(e, fila)
            e["curadores"] = sorted(set(e["curadores"]) | set(marcados), key=lambda n: curadores.index(n) if n in curadores else len(curadores))
    return [e for e in resultado if e["id"] not in ocultos], avisos


def _corregir(evento: dict, fila: dict) -> None:
    nueva = str(fila.get("nueva_fecha") or "").strip()
    if nueva:
        try:
            evento["fecha"] = date.fromisoformat(nueva).isoformat()
        except ValueError:
            pass
    for campo in ("hora", "precio", "url", "ciudad"):
        valor = str(fila.get(campo) or "").strip()
        if valor:
            evento[campo] = valor


def conservar_marcas(eventos: list[dict], anteriores: list[dict]) -> list[dict]:
    """Si el Sheet no respondió, se mantienen curadores y eventos del equipo de la corrida anterior."""
    previos = {e["id"]: e for e in anteriores}
    salida = []
    for e in eventos:
        p = previos.get(e["id"])
        salida.append(dict(e, curadores=list(p.get("curadores", []))) if p else e)
    ids = {e["id"] for e in salida}
    salida += [e for e in anteriores if e.get("origen") == "equipo" and e["id"] not in ids]
    return salida


def preparar_agenda(eventos: list[dict], hoy: date, dias_futuro: int, firma_sin_curador: str) -> list[dict]:
    limite = hoy + timedelta(days=dias_futuro)
    unicos = {}
    for e in eventos:
        f = date.fromisoformat(e["fecha"])
        if hoy <= f <= limite:
            unicos.setdefault(e["id"], e)
    salida = []
    for e in unicos.values():
        firma = e["curadores"] if e.get("curadores") else [firma_sin_curador]
        salida.append(dict(e, firma=firma))
    return sorted(salida, key=lambda e: (e["fecha"], e.get("hora") or "99:99", e["titulo"]))
