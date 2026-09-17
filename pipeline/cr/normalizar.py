"""Normalización de URLs, texto y nombres de artista."""
import re
import unicodedata
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

_PARAMS_RASTREO = re.compile(r"^(utm_.*|fbclid|gclid|mc_cid|mc_eid|ref|ref_src|igshid)$", re.I)


def normalizar_url(url: str) -> str:
    """URL canónica: sin www, sin parámetros de rastreo, sin fragmento ni barra final."""
    if not url:
        return ""
    partes = urlsplit(url.strip())
    host = partes.netloc.lower()
    if host.startswith("www."):
        host = host[4:]
    query = [(k, v) for k, v in parse_qsl(partes.query, keep_blank_values=True) if not _PARAMS_RASTREO.match(k)]
    ruta = partes.path.rstrip("/")
    return urlunsplit(((partes.scheme or "https").lower(), host, ruta, urlencode(query), ""))


def quitar_acentos(texto: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFKD", texto) if not unicodedata.combining(c))


def normalizar_texto(texto: str) -> str:
    """Minúsculas, sin acentos, sin puntuación, espacios simples."""
    if not texto:
        return ""
    t = quitar_acentos(texto).lower()
    t = re.sub(r"[^\w\s]", " ", t)
    t = t.replace("_", " ")
    return re.sub(r"\s+", " ", t).strip()


def normalizar_artista(nombre: str) -> str:
    t = normalizar_texto(nombre)
    if t.startswith("the "):
        t = t[4:]
    return t


def tokenizar(texto: str) -> list[str]:
    return normalizar_texto(texto).split()
