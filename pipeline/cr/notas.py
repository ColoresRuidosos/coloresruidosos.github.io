"""Lectura de notas publicadas y despublicación desde el Sheet."""
from pathlib import Path

from .eventos import es_verdadero
from .frontmatter import cambiar_borrador, leer_post
from .normalizar import normalizar_url


def indice_sitio(dir_posts: Path) -> tuple[set[str], set[str]]:
    """URLs de fuentes ya publicadas y slugs existentes."""
    urls, slugs = set(), set()
    for ruta in dir_posts.glob("*.md"):
        if ruta.name.startswith("_"):
            continue
        datos, _ = leer_post(ruta.read_text(encoding="utf-8"))
        if datos.get("slug"):
            slugs.add(datos["slug"])
        for f in datos.get("fuentes") or []:
            urls.add(normalizar_url(f.get("url", "")))
    return urls, slugs


def aplicar_despublicacion(posts: dict[str, str], filas: list[dict]) -> dict[str, str]:
    """Devuelve solo los archivos que cambian. `despublicar` verdadero → draft: true;
    falso explícito → draft: false; vacío → sin cambio."""
    decisiones = {}
    for fila in filas:
        slug, valor = fila.get("slug", "").strip(), fila.get("despublicar", "").strip()
        if slug and valor:
            decisiones[slug] = es_verdadero(valor)
    cambios = {}
    for ruta, texto in posts.items():
        datos, _ = leer_post(texto)
        slug = datos.get("slug")
        if slug in decisiones:
            nuevo = cambiar_borrador(texto, decisiones[slug])
            if nuevo != texto:
                cambios[ruta] = nuevo
    return cambios
