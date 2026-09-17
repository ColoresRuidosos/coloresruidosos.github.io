"""Radar de noticias: RSS → clasificación → selección → redacción → validación → Markdown.

Uso:
    python pipeline/autoblog.py [--dry-run] [--resumen RUTA]
"""
import argparse
import os
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import yaml

from cr import estado as est
from cr import resumen
from cr.dedup import agrupar_por_hecho, dedup_por_url, excluir_publicados, filtrar_ventana
from cr.esquemas import validar_clasificacion, validar_redaccion
from cr.frontmatter import construir_post
from cr.llm import TopeAlcanzado
from cr.notas import indice_sitio
from cr.ranking import ordenar, seleccionar
from cr.slug import crear_slug
from cr.validadores import validar_nota

RAIZ = Path(__file__).resolve().parent.parent
PIPELINE = RAIZ / "pipeline"
LOTE = 25


def ejecutar(cfg: dict, items: list[dict], fallidos: list[str], llm, buscador, estado: dict,
             dir_posts: Path, ahora: datetime, dry_run: bool = False) -> dict:
    reglas = cfg["noticias"]
    hoy = ahora.date()
    urls_sitio, slugs = indice_sitio(dir_posts)
    publicadas_antes = set(estado["urls_publicadas"]) | urls_sitio

    nuevos = [i for i in dedup_por_url(filtrar_ventana(items, ahora, reglas["ventana_horas"])) if i["url_norm"] not in publicadas_antes]
    m = {"autopublicar": cfg["autopublicar"], "leidos": len(items), "nuevos": len(nuevos), "candidatos": 0,
         "tokens": 0, "publicadas": [], "descartadas": [], "fallidos": list(fallidos)}

    try:
        _clasificar_pendientes(nuevos, llm, estado, ahora)
    except TopeAlcanzado as exc:
        m["descartadas"].append(f"clasificación incompleta: {exc}")

    clasificados = []
    for item in nuevos:
        guardado = estado["clasificaciones"].get(item["url_norm"])
        c = validar_clasificacion(guardado["c"], hoy) if guardado and guardado["c"] else None
        if c and c["es_indie_rock"] and c["categoria"] != "otro":
            clasificados.append({**item, "clasificacion": c})

    candidatos = excluir_publicados(agrupar_por_hecho(clasificados), estado, urls_sitio)
    m["candidatos"] = len(candidatos)

    elegidos = seleccionar(candidatos, reglas["tope_diario"], reglas.get("cuota_mx", 0), reglas.get("cuota_es", 0))
    ids_elegidos = {c["clave"] for c in elegidos}
    extras = [c for c in ordenar(candidatos) if c["clave"] not in ids_elegidos]
    m["extra_redes"] = [
        f"{c['artista']} ({c['categoria']}): {c['fuentes'][0]['titulo']} — {c['fuentes'][0]['url']}"
        for c in extras[:10]
    ]

    for cand in elegidos:
        try:
            nota, errores = _redactar_valida(cand, llm, hoy, reglas)
        except TopeAlcanzado as exc:
            m["descartadas"].append(f"{cand['artista']}: {exc}")
            break
        if errores:
            m["descartadas"].append(f"{cand['artista']}: " + "; ".join(errores))
            continue
        embed = buscador.buscar(cand["artista"], cand.get("titulo_lanzamiento", ""))
        slug = crear_slug(nota["titulo"], slugs)
        slugs.add(slug)
        md = construir_post(cand, nota, embed, ahora, slug, borrador=not cfg["autopublicar"])
        if not dry_run:
            (dir_posts / f"{hoy.isoformat()}-{slug}.md").write_text(md, encoding="utf-8")
        else:
            print(md)
        for url in cand["urls_norm"]:
            estado["urls_publicadas"][url] = ahora.isoformat()
        estado["claves_publicadas"][cand["clave"]] = ahora.isoformat()
        m["publicadas"].append(f"[{cand['relevancia']}] {nota['titulo']}" + ("" if embed else " (sin embed)"))

    m["tokens"] = getattr(llm, "tokens_usados", 0)
    return m


def _clasificar_pendientes(nuevos, llm, estado, ahora):
    pendientes = [i for i in nuevos if i["url_norm"] not in estado["clasificaciones"]]
    for inicio in range(0, len(pendientes), LOTE):
        lote = pendientes[inicio : inicio + LOTE]
        respuesta = llm.clasificar(lote, ahora.date().isoformat())
        por_indice = {r.get("i"): r for r in respuesta if isinstance(r, dict)} if isinstance(respuesta, list) else {}
        for n, item in enumerate(lote):
            crudo = por_indice.get(n)
            c = validar_clasificacion(crudo, ahora.date()) if crudo else None
            estado["clasificaciones"][item["url_norm"]] = {"vista": ahora.isoformat(), "c": c}


def _redactar_valida(cand, llm, hoy, reglas, intentos: int = 2):
    textos = [f"{f['titulo']} {f['resumen']}" for f in cand["fuentes"]]
    errores = None
    for _ in range(intentos):
        red = validar_redaccion(llm.redactar(cand, hoy.isoformat(), errores))
        if red is None:
            errores = ["la respuesta no trae titulo, entrada y cuerpo"]
            continue
        nota = {**red, "artista": cand["artista"], "titulo_lanzamiento": cand.get("titulo_lanzamiento", ""),
                "fechas_evento": cand["fechas_evento"],
                "fuentes": [{"medio": f["medio"], "url": f["url"], "consultado": hoy.isoformat()} for f in cand["fuentes"]]}
        errores = validar_nota(nota, textos, hoy, reglas)
        if not errores:
            return nota, []
    return None, errores


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="No escribe archivos ni estado")
    parser.add_argument("--resumen", help="Archivo donde anexar el resumen (GITHUB_STEP_SUMMARY)")
    args = parser.parse_args()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        sys.exit("Falta ANTHROPIC_API_KEY. Agrégala como secret en GitHub o variable de entorno local.")

    from cr.embeds import BuscadorEmbeds
    from cr.llm import ClienteClaude
    from cr.rss import leer_fuentes
    from cr.web import obtener_texto

    cfg = yaml.safe_load((PIPELINE / "config/pipeline.yaml").read_text(encoding="utf-8"))
    fuentes = yaml.safe_load((PIPELINE / "config/fuentes.yaml").read_text(encoding="utf-8"))["fuentes"]
    zona = ZoneInfo(cfg["zona_horaria"])
    ahora = datetime.now(zona)
    ruta_estado = PIPELINE / "estado/noticias.json"
    reglas = cfg["noticias"]
    estado = est.podar(est.cargar(ruta_estado), ahora, 30, reglas["dias_bloqueo_repetidos"], reglas["ventana_horas"] + 24)

    items, fallidos = leer_fuentes(fuentes, lambda u: obtener_texto(u, respetar_robots=False))
    llm = ClienteClaude(reglas["modelos"], reglas["max_tokens_corrida"])
    dir_posts = RAIZ / "content/posts"
    dir_posts.mkdir(parents=True, exist_ok=True)

    metricas = ejecutar(cfg, items, fallidos, llm, BuscadorEmbeds(), estado, dir_posts, ahora, args.dry_run)
    if not args.dry_run:
        est.guardar(ruta_estado, estado)
    resumen.escribir(args.resumen, resumen.noticias(metricas))


if __name__ == "__main__":
    main()
