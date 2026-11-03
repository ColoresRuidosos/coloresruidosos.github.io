"""Genera data/canciones.json a partir de las tablas de docs/canciones.md (§1 discos, §2 canciones).

Uso, desde la raíz del repo:  python3 docs/generar_canciones_json.py
docs/canciones.md es la fuente de verdad; no edites data/canciones.json a mano.
Conserva el estado ("verificada") y el modo borrador que ya tenga el JSON.
Una canción usa las fuentes de su disco, salvo que su fila traiga enlaces propios.
"""
import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
MD = RAIZ / "docs" / "canciones.md"
JSON = RAIZ / "data" / "canciones.json"
NOTA = ('Generado desde docs/canciones.md con docs/generar_canciones_json.py. Una canción pasa a "verificada" '
        'cuando un fan abre sus fuentes y la confirma. Con borrador=true el contrarreloj usa las de fuente sólida '
        'aunque falte la revisión.')


def celdas(linea):
    partes = [c.strip() for c in linea.strip().split(" | ")]
    partes[0] = partes[0].lstrip("|").strip()
    partes[-1] = partes[-1].rstrip("|").strip()
    return partes


def enlaces(texto):
    return re.findall(r"\]\((https?://[^)]+)\)", texto)


def leer(md):
    discos, canciones = [], []
    for linea in md.split("\n"):
        if re.match(r"^\| [A-Z0-9]{2} \| \*", linea):
            id_, nombre, anio, etapa, fuentes = celdas(linea)
            discos.append({"id": id_, "nombre": nombre.strip("*"), "anio": int(anio), "etapa": etapa, "fuentes": enlaces(fuentes)})
        elif re.match(r"^\| [A-Z0-9]{2}\d\d \|", linea):
            c = celdas(linea)
            # Las filas de otras tablas (p. ej. "| 1999 | 12 | 0 |" en la cobertura) no traen un disco válido.
            if len(c) < 4 or c[2] not in {d["id"] for d in discos}:
                continue
            id_, titulo, disco, fuerza = c[:4]
            nota = c[4] if len(c) > 4 else ""
            canciones.append({"id": id_, "titulo": titulo, "disco": disco,
                              "fuerza": "solida" if fuerza.startswith("✅") else "una_fuente",
                              "estado": "propuesta", "propias": enlaces(nota)})
    por_disco = {d["id"]: d for d in discos}
    for c in canciones:
        c["fuentes"] = c.pop("propias") or por_disco[c["disco"]]["fuentes"]
    return discos, canciones


def main():
    previo = json.loads(JSON.read_text()) if JSON.exists() else {}
    verificadas = {c["id"] for c in previo.get("canciones", []) if c.get("estado") == "verificada"}
    discos, canciones = leer(MD.read_text())
    for c in canciones:
        if c["id"] in verificadas:
            c["estado"] = "verificada"
    salida = {"borrador": previo.get("borrador", True), "_nota": NOTA, "discos": discos, "canciones": canciones}
    JSON.write_text(json.dumps(salida, ensure_ascii=False, indent=2))
    print(f"{len(discos)} discos, {len(canciones)} canciones → {JSON.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
