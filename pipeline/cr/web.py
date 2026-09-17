"""HTTP con identificación honesta, tiempo límite y respeto a robots.txt."""
from functools import lru_cache
from urllib import robotparser
from urllib.parse import urlsplit

import requests

AGENTE = "ColoresRuidososBot/0.1 (+https://github.com/colores-ruidosos)"
TIEMPO = 20


@lru_cache(maxsize=64)
def _robots(base: str) -> robotparser.RobotFileParser:
    rp = robotparser.RobotFileParser()
    try:
        r = requests.get(f"{base}/robots.txt", headers={"User-Agent": AGENTE}, timeout=TIEMPO)
        rp.parse(r.text.splitlines() if r.status_code == 200 else [])
    except requests.RequestException:
        rp.parse([])
    return rp


def permitido(url: str) -> bool:
    p = urlsplit(url)
    return _robots(f"{p.scheme}://{p.netloc}").can_fetch(AGENTE, url)


def obtener_texto(url: str, respetar_robots: bool = True) -> str:
    if respetar_robots and not permitido(url):
        raise PermissionError(f"robots.txt no permite leer {url}")
    r = requests.get(url, headers={"User-Agent": AGENTE}, timeout=TIEMPO)
    r.raise_for_status()
    if not r.encoding or r.encoding.lower() == "iso-8859-1":
        r.encoding = r.apparent_encoding or "utf-8"
    return r.text
