"""Núcleo del pipeline de Colores Ruidosos.

Los módulos de dominio (normalizar, slug, dedup, ranking, validadores,
frontmatter, eventos, esquemas, embeds_match, jsonld) son funciones puras
sin red. Las integraciones (rss, llm, embeds, sheet, web) hablan con el
exterior y se prueban con dobles.
"""
