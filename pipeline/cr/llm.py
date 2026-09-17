"""Llamadas a Claude con tope de tokens por corrida."""
import json
import os
from pathlib import Path

from .esquemas import extraer_json

PROMPTS = Path(__file__).resolve().parent.parent / "prompts"


class TopeAlcanzado(RuntimeError):
    pass


class ClienteClaude:
    def __init__(self, modelos: dict, max_tokens_corrida: int, cliente=None):
        if cliente is None:
            import anthropic

            cliente = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
        self.cliente = cliente
        self.modelos = modelos
        self.max_tokens_corrida = max_tokens_corrida
        self.tokens_usados = 0

    def _llamar(self, modelo: str, sistema: str, mensaje: str, max_tokens: int):
        if self.tokens_usados >= self.max_tokens_corrida:
            raise TopeAlcanzado(f"se alcanzó el tope de {self.max_tokens_corrida} tokens")
        resp = self.cliente.messages.create(
            model=modelo,
            max_tokens=max_tokens,
            system=sistema,
            messages=[{"role": "user", "content": mensaje}],
        )
        self.tokens_usados += resp.usage.input_tokens + resp.usage.output_tokens
        texto = "".join(b.text for b in resp.content if getattr(b, "type", "") == "text")
        return extraer_json(texto)

    def clasificar(self, items: list[dict], hoy: str) -> list:
        sistema = (PROMPTS / "clasificar.md").read_text(encoding="utf-8")
        lote = [{"i": n, "medio": it["medio"], "titulo": it["titulo"], "resumen": it["resumen"][:600]} for n, it in enumerate(items)]
        mensaje = f"Fecha de hoy: {hoy}\n\nNotas:\n{json.dumps(lote, ensure_ascii=False)}"
        return self._llamar(self.modelos["clasificar"], sistema, mensaje, 4000)

    def redactar(self, candidato: dict, hoy: str, errores_previos: list[str] | None = None) -> dict:
        sistema = (PROMPTS / "redactar.md").read_text(encoding="utf-8")
        hechos = {
            "artista": candidato["artista"],
            "categoria": candidato["categoria"],
            "fechas_evento": candidato["fechas_evento"],
            "fuentes": [{"medio": f["medio"], "titulo": f["titulo"], "resumen": f["resumen"]} for f in candidato["fuentes"]],
        }
        mensaje = f"Fecha de hoy: {hoy}\n\nHechos:\n{json.dumps(hechos, ensure_ascii=False)}"
        if errores_previos:
            mensaje += "\n\nTu versión anterior fue rechazada por estas razones. Reescribe desde cero corrigiéndolas:\n- " + "\n- ".join(errores_previos)
        return self._llamar(self.modelos["redactar"], sistema, mensaje, 1500)
