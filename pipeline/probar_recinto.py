"""Prueba rápida: ¿esta página trae eventos legibles en JSON-LD?

Uso:
    python pipeline/probar_recinto.py https://sitio-del-recinto.com/cartelera
"""
import sys

from cr.jsonld import extraer_eventos
from cr.web import obtener_texto, permitido


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    url = sys.argv[1]
    if not permitido(url):
        sys.exit("robots.txt no permite leer esta página. Carga sus eventos en el Google Sheet.")
    eventos = extraer_eventos(obtener_texto(url), {"nombre": "Prueba", "url": url})
    if not eventos:
        sys.exit("La página no trae eventos en JSON-LD. Carga sus eventos en el Google Sheet.")
    print(f"{len(eventos)} eventos encontrados:")
    for e in eventos[:10]:
        print(f"  {e['fecha']} {e['hora'] or '--:--'}  {e['titulo']}")


if __name__ == "__main__":
    main()
