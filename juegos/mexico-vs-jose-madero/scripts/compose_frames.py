#!/usr/bin/env python3
"""Recorta poses de hojas de Gemini «imperfectas» (con rótulos, líneas de suelo o sombras) y compone
una hoja limpia de una sola fila para scripts/slice_sheet.py.

  python3 scripts/compose_frames.py <conjunto>      conjuntos: flashbot · rumor · prensa
Cada pose se define por una caja (x0, y0, x1, y1) en píxeles de la imagen original y una escala relativa.
La sombra y la línea de suelo se quitan con un relleno desde el borde de la caja: solo se borra el gris
neutro conectado con el fondo (el sombreado interior de las figuras está rodeado de contorno y no se toca).
"""
import sys
import numpy as np
from PIL import Image

def load(src):
    a = np.asarray(Image.open(src).convert('RGB')).astype(np.int16)
    # Fondo = color más frecuente (las capturas de pantalla traen bordes oscuros que engañan a la mediana de los bordes).
    q = (a // 4).reshape(-1, 3)
    vals, counts = np.unique(q[:: max(1, len(q) // 200000)], axis=0, return_counts=True)
    bg = vals[counts.argmax()] * 4 + 2
    return a, bg

def flood(passable, seed):
    reach = seed & passable
    while True:
        n = reach.copy()
        n[1:] |= reach[:-1]; n[:-1] |= reach[1:]; n[:, 1:] |= reach[:, :-1]; n[:, :-1] |= reach[:, 1:]
        n &= passable
        if (n == reach).all(): return reach
        reach = n

def frame(a, bg, box, scale, blank=(), shadow=True, holes=False):
    x0, y0, x1, y1 = box
    c = a[y0:y1, x0:x1].copy()
    for bx0, by0, bx1, by1 in blank:  # rótulos que se cuelan en la caja
        c[max(0, by0 - y0):max(0, by1 - y0), max(0, bx0 - x0):max(0, bx1 - x0)] = bg
    diff = np.abs(c - bg).sum(axis=2)
    fg = diff > 30
    if shadow:
        v = c.mean(axis=2); sat = c.max(axis=2) - c.min(axis=2)
        shade = (sat < 14) & (v < bg.mean() - 3) & (v > bg.mean() - 48)
        seed = np.zeros_like(fg); seed[0, :] = seed[-1, :] = seed[:, 0] = seed[:, -1] = True
        gone = flood(shade | ~fg, seed) & fg
        fg &= ~gone
    if holes:
        # Lo que el fondo no alcanza desde el borde es parte de la figura (metal gris parecido al fondo).
        seed = np.zeros_like(fg); seed[0, :] = seed[-1, :] = seed[:, 0] = seed[:, -1] = True
        fg |= ~flood(~fg, seed)
    rgba = np.dstack([c.astype(np.uint8), np.where(fg, 255, 0).astype(np.uint8)])
    img = Image.fromarray(rgba, 'RGBA')
    img = img.crop(img.getbbox())
    return img.resize((max(1, round(img.width * scale)), max(1, round(img.height * scale))), Image.LANCZOS)

def sheet(frames, out, bg, gap=200):
    H = max(f.height for f in frames) + 2 * gap
    W = sum(f.width for f in frames) + gap * (len(frames) + 1)
    canvas = Image.new('RGB', (W, H), tuple(int(v) for v in bg))
    x = gap
    for f in frames:
        canvas.paste(f, (x, H - gap - f.height), f)
        x += f.width + gap
    canvas.save(out)
    print(out, canvas.size, len(frames), 'poses')

S = 2752 / 2000  # las hojas de 2752 px se midieron sobre una vista de 2000 px
sc = lambda b: tuple(round(v * S) for v in b)

SETS = {
    # Jefe: CAMINAR×4 · CARGAR×2 · DISPARAR×1 · EXPUESTO×2 · DAÑO×1 · DERROTA×2
    'flashbot': ('art/source/carmesi/w1-flashbot-gemini.jpg', 'art/source/carmesi/flashbot-sheet.png', [
        (sc((95, 35, 390, 352)), 1), (sc((440, 35, 740, 352)), 1), (sc((785, 35, 1080, 352)), 1), (sc((1125, 35, 1425, 352)), 1),
        (sc((80, 365, 380, 628)), 1), (sc((450, 365, 760, 628)), 1), (sc((815, 365, 1195, 628)), 1),
        # La fila 3-4 de Gemini sale más grande que la 1: se iguala con 0,85.
        (sc((60, 650, 420, 1030)), 0.85), (sc((445, 650, 805, 1030)), 0.85), (sc((825, 650, 1215, 1030)), 0.85),
        (sc((1260, 660, 1605, 1030)), 0.85), (sc((1605, 800, 1975, 1040)), 0.85),
    ], [sc((690, 350, 860, 400)), sc((425, 620, 790, 670)), sc((260, 1035, 590, 1085)), sc((1510, 1035, 1690, 1085))]),
    # Rumor: VOLAR×3 · PICADO×1 · DERROTA×2
    'rumor': ('art/source/carmesi/w1-rumor-gemini.jpg', 'art/source/carmesi/rumor-sheet.png', [
        (sc((135, 35, 440, 360)), 1), (sc((590, 40, 900, 345)), 1), (sc((1565, 30, 1865, 395)), 1),
        (sc((1075, 425, 1465, 735)), 1),
        (sc((485, 745, 865, 1040)), 1), (sc((1100, 870, 1615, 1090)), 1),
    ], []),
    # Micrófono Traidor (captura de 1008 px): FLOTAR×4 · APUNTAR×1 · EMBESTIDA×2 · DERROTA×2
    'traidor': ('art/source/carmesi/w1-traidor-gemini.png', 'art/source/carmesi/traidor-sheet.png', [
        ((80, 5, 245, 182), 1), ((295, 20, 470, 172), 1), ((520, 20, 718, 168), 1), ((765, 5, 948, 178), 1),
        ((88, 200, 255, 338), 1), ((368, 178, 605, 332), 1), ((645, 192, 885, 328), 1),
        ((300, 348, 472, 508), 1), ((518, 380, 735, 505), 1),
    ], [], dict(shadow=False, holes=True, out_bg=(255, 0, 255))),
    # Prensa: TITULAR (espera, caminar, ataque, daño, derrota) · PAPARAZZI (ídem) · REPORTERO (ídem)
    'prensa': ('art/source/prensa-gemini.jpg', 'art/source/prensa-sheet.png', [
        ((96, 140, 372, 540), 1), ((470, 140, 820, 540), 1), ((870, 150, 1300, 540), 1), ((1300, 150, 1640, 540), 1), ((1620, 300, 2030, 600), 1),
        ((130, 780, 380, 1260), 1), ((520, 860, 800, 1260), 1), ((950, 740, 1320, 1260), 1), ((1325, 800, 1640, 1258), 1), ((1610, 940, 2030, 1262), 1),
        ((20, 1530, 410, 1985), 1), ((530, 1540, 830, 1980), 1), ((905, 1545, 1335, 1975), 1), ((1315, 1600, 1645, 1985), 1), ((1640, 1745, 2030, 2015), 1),
    ], []),
}

if __name__ == '__main__':
    name = sys.argv[1]
    src, out, frames, blank, *opt = SETS[name]
    opt = opt[0] if opt else {}
    a, bg = load(src)
    # Fondo de salida magenta cuando la figura tiene grises parecidos al fondo original.
    sheet([frame(a, bg, b, s, blank, opt.get('shadow', True), opt.get('holes', False)) for b, s in frames], out, opt.get('out_bg', bg))
