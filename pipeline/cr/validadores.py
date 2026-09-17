"""Reglas editoriales convertidas en código. Una nota que falla no se publica."""
import re
from datetime import date
from urllib.parse import urlsplit

from .normalizar import tokenizar

_CITA = re.compile(r"[\"“”«»]([^\"“”«»]+)[\"“”«»]")


def validar_creditos(fuentes: list[dict], hoy: date) -> list[str]:
    errores = []
    if not fuentes:
        return ["la nota no tiene fuentes"]
    for i, f in enumerate(fuentes, 1):
        if not str(f.get("medio") or "").strip():
            errores.append(f"fuente {i}: falta el nombre del medio")
        partes = urlsplit(str(f.get("url") or ""))
        if partes.scheme not in ("http", "https") or not partes.netloc:
            errores.append(f"fuente {i}: URL inválida")
        consultado = f.get("consultado")
        if consultado and date.fromisoformat(str(consultado)) > hoy:
            errores.append(f"fuente {i}: fecha de consulta en el futuro")
    return errores


def detectar_copia(cuerpo: str, textos_fuente: list[str], excluidos: list[str], n: int = 8) -> list[str]:
    """Fragmentos de n+ palabras consecutivas que la nota comparte con alguna fuente.

    Las palabras de nombres propios (artista, disco, recinto) se ignoran para no
    marcar como copia un título largo.
    """
    tokens_excluidos = {t for nombre in excluidos for t in tokenizar(nombre)}

    def limpiar(texto):
        return [t for t in tokenizar(texto) if t not in tokens_excluidos]

    ngramas_fuente = set()
    for texto in textos_fuente:
        toks = limpiar(texto)
        ngramas_fuente.update(tuple(toks[i : i + n]) for i in range(len(toks) - n + 1))
    toks = limpiar(cuerpo)
    return sorted({" ".join(toks[i : i + n]) for i in range(len(toks) - n + 1) if tuple(toks[i : i + n]) in ngramas_fuente})


def validar_citas(texto: str, max_palabras: int = 3) -> list[str]:
    return [f"cita textual no permitida: «{m.strip()}»" for m in _CITA.findall(texto or "") if len(m.split()) > max_palabras]


def validar_longitudes(titulo: str, cuerpo: str, max_titulo: int, max_palabras: int) -> list[str]:
    errores = []
    if len(titulo) > max_titulo:
        errores.append(f"título de {len(titulo)} caracteres (máximo {max_titulo})")
    palabras = len((cuerpo or "").split())
    if palabras > max_palabras:
        errores.append(f"cuerpo de {palabras} palabras (máximo {max_palabras})")
    return errores


def validar_nota(nota: dict, textos_fuente: list[str], hoy: date, reglas: dict) -> list[str]:
    excluidos = [nota.get("artista", ""), nota.get("titulo_lanzamiento", "")]
    excluidos += [f.get("recinto", "") for f in nota.get("fechas_evento", [])]
    excluidos += [f.get("ciudad", "") for f in nota.get("fechas_evento", [])]
    errores = validar_creditos(nota.get("fuentes", []), hoy)
    errores += validar_longitudes(nota["titulo"], nota["cuerpo"], reglas["max_caracteres_titulo"], reglas["max_palabras_cuerpo"])
    texto_completo = f'{nota["titulo"]}\n{nota["entrada"]}\n{nota["cuerpo"]}'
    errores += validar_citas(texto_completo)
    copias = detectar_copia(texto_completo, textos_fuente, excluidos, reglas["ngram_copia"])
    errores += [f"frase copiada de la fuente: «{c}»" for c in copias]
    return errores
