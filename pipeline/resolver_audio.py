"""Busca el avance de Apple Music y el enlace de Spotify de cada canción jugable y escribe data/audio.json (F20/D26).

Uso:
    python pipeline/resolver_audio.py

Necesita red hacia itunes.apple.com y api.spotify.com; corre en GitHub Actions (audio-trivia.yml).
Sin SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET, deja los enlaces de Spotify vacíos.
"""
import base64
import json
import os
from datetime import datetime, timezone
from pathlib import Path

import requests

from cr.audio_trivia import TIEMPO, ResolverAudio

RAIZ = Path(__file__).resolve().parent.parent
CANCIONES = RAIZ / "data/canciones.json"
SALIDA = RAIZ / "data/audio.json"
NOTA = ("Generado por pipeline/resolver_audio.py (GitHub Actions: audio-trivia.yml). Avance oficial de 30 s de "
        "Apple Music y enlace a la pista en Spotify, solo con coincidencia exacta de título, artista y disco de estudio.")


def token_spotify():
    sp_id, secreto = os.environ.get("SPOTIFY_CLIENT_ID"), os.environ.get("SPOTIFY_CLIENT_SECRET")
    if not (sp_id and secreto):
        return None
    guardado = {}

    def token():
        if "t" not in guardado:
            cred = base64.b64encode(f"{sp_id}:{secreto}".encode()).decode()
            r = requests.post("https://accounts.spotify.com/api/token", data={"grant_type": "client_credentials"},
                              headers={"Authorization": f"Basic {cred}"}, timeout=TIEMPO)
            r.raise_for_status()
            guardado["t"] = r.json()["access_token"]
        return guardado["t"]

    return token


def main():
    datos = json.loads(CANCIONES.read_text(encoding="utf-8"))
    jugables = [c for c in datos["canciones"] if c["fuerza"] == "solida" and (datos.get("borrador") or c["estado"] == "verificada")]
    res = ResolverAudio(token_spotify=token_spotify()).resolver(jugables, datos["discos"])
    salida = {"_nota": NOTA, "generado": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
              "canciones": res["canciones"], "faltan": res["faltan"]}
    SALIDA.write_text(json.dumps(salida, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    con_spotify = sum(1 for v in res["canciones"].values() if v["spotify"])
    print(f"{len(res['canciones'])} de {len(jugables)} canciones con avance; {con_spotify} con enlace de Spotify.")
    if res["faltan"]:
        print("Sin avance: " + ", ".join(res["faltan"]))


if __name__ == "__main__":
    main()
