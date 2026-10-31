"""Genera data/trivia.json a partir de las tablas de docs/trivia.md (§3).

Uso, desde la raíz del repo:  python3 docs/generar_trivia_json.py
docs/trivia.md es la fuente de verdad; no edites data/trivia.json a mano.
Conserva el estado ("verificada") y el modo borrador que ya tenga el JSON.
"""
import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
MD = RAIZ / "docs" / "trivia.md"
JSON = RAIZ / "data" / "trivia.json"
DIFICULTAD = {"F": "facil", "D": "dificil", "M": "muy_dificil"}
TIPO = {"D": "dato", "P": "portada", "O": "dato"}
NOTA = ('Generado desde docs/trivia.md con docs/generar_trivia_json.py. Una pregunta pasa a "verificada" '
        'cuando un fan abre sus fuentes y la confirma. Con borrador=true el juego usa las de fuente sólida '
        'aunque falte la revisión.')


def limpio(texto):
    return re.sub(r"\*+", "", texto).strip().strip('"').strip()


def preguntas(md):
    for linea in md.split("\n"):
        if not re.match(r"^\| [FDM]\d\d \|", linea):
            continue
        id_, etapa, tipo, pregunta, correcta, malas, fuentes, fuerza = [c.strip() for c in linea.strip("|").split(" | ")]
        q = {"id": id_, "etapa": etapa, "dificultad": DIFICULTAD[id_[0]], "tipo": TIPO[tipo]}
        escena = re.search(r"\s*\*\((.+)\)\*\s*$", pregunta)
        if escena:
            q["escena_alt"] = escena.group(1)
            pregunta = pregunta[:escena.start()]
        q["pregunta"] = pregunta.replace("*", "").strip()
        q["correcta"] = limpio(correcta)
        q["incorrectas"] = [limpio(x) for x in malas.split(" · ")]
        q["fuentes"] = re.findall(r"\]\((https?://[^)]+)\)", fuentes)
        q["fuerza"] = "solida" if fuerza.startswith("✅") else "una_fuente"
        q["estado"] = "propuesta"
        yield q


def main():
    previo = json.loads(JSON.read_text()) if JSON.exists() else {}
    verificadas = {p["id"] for p in previo.get("preguntas", []) if p.get("estado") == "verificada"}
    lista = list(preguntas(MD.read_text()))
    for q in lista:
        if q["id"] in verificadas:
            q["estado"] = "verificada"
    salida = {"borrador": previo.get("borrador", True), "_nota": NOTA, "preguntas": lista}
    JSON.write_text(json.dumps(salida, ensure_ascii=False, indent=2))
    print(f"{len(lista)} preguntas → {JSON.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
