"""Resumen legible de cada corrida (GitHub Actions Job Summary)."""


def lista(titulo: str, elementos: list[str]) -> str:
    if not elementos:
        return f"**{titulo}:** ninguno\n"
    return f"**{titulo}:**\n" + "".join(f"- {e}\n" for e in elementos)


def noticias(m: dict) -> str:
    return (
        "## Noticias\n\n"
        f"- Modo: {'publicación automática' if m['autopublicar'] else 'interruptor apagado (se guardan como borrador)'}\n"
        f"- Ítems leídos: {m['leidos']} · en ventana y nuevos: {m['nuevos']} · candidatos: {m['candidatos']}\n"
        f"- Tokens usados: {m['tokens']}\n\n"
        + lista("Notas publicadas", m["publicadas"])
        + lista("Descartadas", m["descartadas"])
        + lista("Feeds con error", m["fallidos"])
        + "\n" + lista("Para compartir en redes (no publicadas como nota)", m.get("extra_redes", []))
    )


def agenda(m: dict) -> str:
    return (
        "## Agenda\n\n"
        f"- Eventos en agenda: {m['total']}\n"
        f"- Google Sheet: {'leído' if m['sheet'] else 'no disponible (se conservaron marcas anteriores)'}\n\n"
        + lista("Avisos", m["avisos"])
    )


def escribir(ruta: str | None, texto: str) -> None:
    print(texto)
    if ruta:
        with open(ruta, "a", encoding="utf-8") as f:
            f.write(texto + "\n")
