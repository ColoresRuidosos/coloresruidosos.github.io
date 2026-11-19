# Recorta las hojas de sprites de Gemini/ChatGPT y genera el atlas del juego (plan §7.1, T5.1).
#   python3 -I scripts/slice_sheet.py antonio
# Lee art/source/<músico>/*.jpg según SHEETS y escribe:
#   art/build/<músico>-atlas.png   (para revisar)
#   src/data/atlas-<músico>.js     (lo que carga el juego: PNG en base64 + fotogramas)
# Pasos: quitar fondo → borrar líneas de suelo → separar poses (filas y columnas, sabiendo cuántas hay)
#        → escalar a la altura del juego → paleta fija → contorno → pies alineados → atlas.
import base64, io, json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STAND_H = 66            # altura en px de un personaje de pie (el juego dibuja a 384×216)
PORTRAIT = 58            # lado del retrato (cabina de selección; el HUD lo reduce)
# Hoja común con los 4 retratos (una fila, en este orden): si existe, manda sobre el retrato de cada hoja.
PORTRAITS_SHEET = dict(file='retratos.png', order=['antonio', 'pepe', 'dani', 'jota'])
SIZE_MUL = 1.12         # v2 (15 nov): todos un 12 % más grandes («parecen enanos» junto a los fondos)
COLORS = 32             # colores por músico
OUTLINE = (18, 12, 24)

# Cada hoja: archivo, poses por fila, nombres en orden, poses de referencia (de pie; se usa la mediana de su altura) para la escala,
# y fotogramas que no están de pie (se anclan por el centro de la caja, no por los pies).
SHEETS = {
    # v4 (16 nov 2026, «Pepe no se parece» y «también al vocalista»): Antonio y Pepe rehechos desde fotos reales,
    # con la misma estructura que Dani y Jota. Las hojas anteriores están en art/source/<músico>/descartes-v2/.
    'antonio': [
        dict(file='antonio-2.png', rows=[2, 4, 4, 2],
             names=['idle0', 'idle1', 'walk0', 'walk1', 'walk2', 'walk3', 'run0', 'run1', 'run2', 'run3', 'jump0', 'jump1'],
             ref=['idle0', 'idle1', 'walk0', 'walk2'], target=66, loose=['jump0', 'jump1']),
        dict(file='antonio-3.png', scale_from_first=True, rows=[2, 2, 3, 5],
             names=['punch1a', 'punch1b', 'punch2a', 'punch2b', 'guit0', 'guit1', 'guit2', 'air', 'grab', 'knee', 'throw0', 'throw1'],
             ref=['punch1a', 'punch1b'], target=64, loose=['air']),
        dict(file='antonio-4.png', scale_from_first=True, rows=[3, 3, 4],
             names=['hurt', 'fall0', 'fall1', 'down', 'rise0', 'rise1', 'sp0', 'sp1', 'sp2', 'sp3'],
             ref=['sp0', 'sp1'], target=64, loose=['fall0', 'fall1', 'down']),
        dict(file='antonio-5.png', scale_from_first=True, rows=[3, 4, 2, 1],
             names=['lash0', 'lash1', 'lash2', 'hymn0', 'hymn1', 'hymn2', 'hymn3', 'win0', 'win1', 'portrait'],
             ref=['hymn1', 'hymn2'], target=68, loose=[], portrait='portrait'),
    ],
    'pepe': [
        dict(file='pepe-2.png', rows=[2, 4, 4, 2],
             names=['idle0', 'idle1', 'walk0', 'walk1', 'walk2', 'walk3', 'run0', 'run1', 'run2', 'run3', 'jump0', 'jump1'],
             ref=['idle0', 'idle1', 'walk0', 'walk2'], target=66, loose=['jump0', 'jump1']),
        dict(file='pepe-3.png', rows=[2, 2, 3, 5],   # hoja de otro tamaño (1199×1312): escala propia
             names=['punch1a', 'punch1b', 'punch2a', 'punch2b', 'guit0', 'guit1', 'guit2', 'air', 'grab', 'knee', 'throw0', 'throw1'],
             ref=['punch1a', 'punch1b'], target=64, loose=['air']),
        dict(file='pepe-4.png', rows=[3, 3, 4],
             names=['hurt', 'fall0', 'fall1', 'down', 'rise0', 'rise1', 'sp0', 'sp1', 'sp2', 'sp3'],
             ref=['rise1'], target=64, loose=['fall0', 'fall1', 'down']),
        dict(file='pepe-5.png', rows=[3, 4, 2, 1],   # Gemini lo dibujó más pequeño en esta hoja: escala propia
             names=['sig0', 'sig1', 'sig2', 'sup0', 'sup1', 'sup2', 'sup3', 'win0', 'win1', 'portrait'],
             ref=['win0', 'win1'], target=70, loose=[], portrait='portrait'),
    ],
    # Jota: Gemini le puso a la camiseta el nombre de otra banda; se borra con `sin_texto` (regla de CR: nada de marcas de terceros).
    'jota': [
        dict(file='jota-2-movimiento.png', rows=[2, 4, 4, 2], sin_texto=True,
             names=['idle0', 'idle1', 'walk0', 'walk1', 'walk2', 'walk3', 'run0', 'run1', 'run2', 'run3', 'jump0', 'jump1'],
             ref=['idle0', 'idle1', 'walk0', 'walk2'], target=66, loose=['jump0', 'jump1']),
        dict(file='jota-3-combo.png', scale_from_first=True, rows=[2, 2, 3, 5], sin_texto=True,
             names=['punch1a', 'punch1b', 'punch2a', 'punch2b', 'guit0', 'guit1', 'guit2', 'air', 'grab', 'knee', 'throw0', 'throw1'],
             ref=['punch1a', 'punch1b'], target=64, loose=['air']),
        dict(file='jota-4-dano-especial.png', scale_from_first=True, rows=[3, 3, 4], sin_texto=True,
             names=['hurt', 'fall0', 'fall1', 'down', 'rise0', 'rise1', 'sp0', 'sp1', 'sp2', 'sp3'],
             ref=['sp0', 'sp1'], target=60, loose=['fall0', 'fall1', 'down']),
        dict(file='jota-5-firma-super.png', scale_from_first=True, rows=[3, 4, 2, 1], sin_texto=True,
             names=['sig0', 'sig1', 'sig2', 'sup0', 'sup1', 'sup2', 'sup3', 'win0', 'win1', 'portrait'],
             ref=['win0', 'win1'], target=68, loose=[], portrait='portrait'),
    ],
    'dani': [
        dict(file='dani-2-movimiento.png', rows=[2, 4, 4, 5],
             names=['idle0', 'idle1', 'walk0', 'walk1', 'walk2', 'walk3', 'run0', 'run1', 'run2', 'run3',
                    'jump0', 'jump1', 'dj0', 'dj1', 'jump2'],
             ref=['idle0', 'idle1', 'walk0', 'walk2'], target=66, loose=['jump0', 'jump1', 'dj0', 'dj1', 'jump2']),
        dict(file='dani-3-combo.png', scale_from_first=True, rows=[4, 2, 3, 5],
             names=['punch1a', 'punch1b', 'punch2a', 'punch2b', 'kick0', 'kick1', 'guit0', 'guit1', 'guit2',
                    'air', 'grab', 'knee', 'throw0', 'throw1'],
             ref=['punch1a', 'punch1b'], target=64, loose=['air']),
        dict(file='dani-4-dano-especial.png', scale_from_first=True, rows=[3, 3, 4],
             names=['hurt', 'fall0', 'kneel', 'down', 'rise0', 'rise1', 'sp0', 'sp1', 'sp2', 'sp3'],
             ref=['sp0'], target=66, loose=['fall0', 'down']),
        dict(file='dani-5-firma-super.png', scale_from_first=True, rows=[3, 4, 2, 1],
             names=['sig0', 'sig1', 'sig2', 'sup0', 'sup1', 'sup2', 'sup3', 'win0', 'win1', 'portrait'],
             ref=['win0', 'win1'], target=70, loose=['sig0'], portrait='portrait'),
    ],
}

# Enemigos y jefes (15 nov 2026): una hoja por tipo en art/source/enemigos/<tipo>.jpg. Nombres comunes:
#   idle0-1 · walk0-3 · wind/atk (puñetazo) · charge0-2 · shoot0-2 · grab0-1 · throw0-1 · block · call · hurt · fall0-1 · down.
# `target` = alto de pie en el juego ≈ def.h × 66/58 (la misma proporción que los músicos).
# `erase`: franjas (y0, y1) donde Gemini escribió rótulos; se borra el texto claro sin tocar zapatos ni sombras.
_E = ['idle0', 'idle1', 'walk0', 'walk1', 'walk2', 'walk3']
_D = ['hurt', 'fall0', 'fall1', 'down']
def _enemy(file, rows, names, target, **kw):
    return [dict(dir='enemigos', file=file, rows=rows, names=names, ref=['idle0', 'idle1'], target=target,
                 loose=['fall0', 'fall1', 'down'] + kw.pop('loose', []), **kw)]
SHEETS.update({
    'becario': _enemy('becario.jpg', [6, 2, 4], _E + ['wind', 'atk'] + _D, 61),
    'comercial': _enemy('comercial.jpg', [6, 3, 4], _E + ['charge0', 'charge1', 'charge2'] + _D, 64),
    'guardia': _enemy('guardia.jpg', [6, 3, 4], _E + ['block', 'wind', 'atk'] + _D, 68),
    # La grapa que vuela es tan pequeña que el separador la descarta: quedan 3 poses en la fila 2.
    'contable': _enemy('contable.jpg', [6, 3, 4], _E + ['shoot0', 'shoot1', 'atk'] + _D, 59),
    'ejecutiva': _enemy('ejecutiva.jpg', [6, 4, 4], _E + ['grab0', 'grab1', 'throw0', 'throw1'] + _D, 64),
    'jefeSeguridad': _enemy('jefeSeguridad.jpg', [6, 5, 5], _E + ['wind', 'atk', 'charge0', 'charge1', 'charge2', 'call'] + _D, 77),
    # El teléfono que vuela invade la pose de al lado: la fila 2 se corta a mano.
    'recepcionista': _enemy('recepcionista.jpg', [6, 5, 5], _E + ['shoot0', 'shoot1', 'shoot2', 'wind', 'atk', 'call'] + _D, 71,
                            cuts={1: [40, 450, 1018, 1460, 1910, 2380]}),
    # Director: Gemini dio solo 2 pasos y una pose de cada ataque, con rótulos; el agarre y el lanzamiento traen
    # a la víctima dibujada en transparente, así que se descartan (el juego usa el puñetazo).
    'director': _enemy('director.jpg', [4, 3, 4], ['idle0', 'idle1', 'walk0', 'walk1', 'atk', 'charge0', 'grab0', 'throw0', 'hurt', 'fall0', 'down'],
                       75, skip=['grab0', 'throw0'], erase=[(425, 515), (925, 1015), (1425, 1536)]),
    # Presidente: 3 poses quieto, rótulos en inglés y en español, y el disco volando aparte (se descarta).
    'presidente': _enemy('presidente.jpg', [7, 8, 6],
                         ['idle0', 'idle1', 'idle2', 'walk0', 'walk1', 'walk2', 'walk3',
                          'wind', 'atk', 'atk2', 'charge0', 'charge1', 'shoot0', 'shoot1', 'disc',
                          'grab0', 'grab1', 'hurt', 'fall0', 'fall1', 'down'],
                         80, skip=['disc'], erase=[(0, 64), (488, 562), (908, 1052), (1404, 1536)]),
})
# Objetos (F7): una fila de 12. Escala común: el extintor mide ~20 px (la silla y el pie de micro, algo más).
_OBJ = ['bocadillo', 'cafe', 'pua', 'setlist', 'ampli', 'pedal', 'suerte', 'pase', 'grapadora', 'extintor', 'silla', 'pie']
SHEETS['objetos'] = [dict(dir='objetos', file='objetos.png', rows=[12], names=_OBJ, ref=['extintor'], target=20 / SIZE_MUL, loose=_OBJ)]
# Tony, el manager (F20): Gemini escribió rótulos y mezcló filas, así que cada pose va en su caja (x0, y0, x1, y1).
# Las dos poses de «lanzar contrato» salieron cortadas por la cintura y no se usan (lanza con la pose de «llamar»).
# target 67 (20 nov): misma estatura que la banda (con 75 medía 86 px frente a 77).
SHEETS['manager'] = [dict(dir='enemigos', file='manager.jpg', rows=[16], target=67, ref=['idle0', 'idle1'],
    names=['idle0', 'idle1', 'walk0', 'walk1', 'walk2', 'walk3', 'wind', 'atk', 'charge0', 'charge1', 'charge2',
           'call', 'hurt', 'fall0', 'fall1', 'down', 'win0'],
    boxes=[(150, 50, 380, 488), (500, 50, 730, 488), (1060, 50, 1300, 488), (1400, 50, 1650, 488), (1750, 50, 1980, 488), (2090, 50, 2340, 488),
           (140, 505, 420, 925), (560, 505, 880, 925), (1160, 555, 1480, 918), (1590, 552, 1940, 912), (2030, 548, 2360, 918),
           (1680, 958, 2000, 1350), (150, 1228, 480, 1612), (590, 1250, 1060, 1605), (1120, 1328, 1510, 1612), (1600, 1418, 2070, 1620),
           (2190, 1148, 2430, 1612)],
    loose=['fall0', 'fall1', 'down'], erase=[(320, 486, 610, 542), (1530, 486, 1860, 542), (180, 926, 840, 990), (1570, 926, 1960, 990),
           (330, 1188, 1020, 1240), (1690, 1348, 1930, 1402), (0, 1622, 2528, 1696)]),
    # Retrato (F24, Tony jugable): la pose de frente de su imagen de referencia.
    dict(dir='enemigos', file='manager-1.jpg', rows=[3], names=['ref0', 'ref1', 'portrait'], ref=['portrait'], target=75,
         loose=[], skip=['ref0', 'ref1'], portrait='portrait')]
ENEMIES = [k for k in SHEETS if k not in ('antonio', 'pepe', 'dani', 'jota', 'objetos')]


def erase_text(a, mask, bands):
    """Quita rótulos claros (texto blanco con borde) en las franjas indicadas; deja lo oscuro (zapatos, sombras)."""
    lum = a.mean(axis=2)
    for b in bands:                                   # (y0, y1) franja entera, o (x0, y0, x1, y1) rectángulo
        x0, y0, x1, y1 = (0, b[0], mask.shape[1], b[1]) if len(b) == 2 else b
        bright = np.zeros_like(mask); bright[y0:y1, x0:x1] = lum[y0:y1, x0:x1] > 150
        near = box_sum(bright, 3) > 0
        band = np.zeros_like(mask); band[y0:y1, x0:x1] = True
        mask &= ~(near & band)
    return mask


def background(a):
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    return np.median(border, axis=0)


def foreground(a, bg, tol=26):
    d = np.sqrt(((a.astype(np.int32) - bg.astype(np.int32)) ** 2).sum(axis=2))
    return d > tol


def erase_floor_lines(a, mask, min_run=140, dark=70, clear=6):
    """Borra las líneas de suelo que a veces dibuja la IA bajo los pies: rayas oscuras, largas y FINAS
    (por encima y por debajo, a `clear` px, no hay dibujo). Así no se confunden con un pantalón o una chaqueta."""
    lum = a.mean(axis=2)
    h, w = mask.shape
    for y in range(clear, h - clear):
        row = mask[y] & (lum[y] < dark)
        if row.sum() < min_run: continue
        x = 0
        while x < w:
            if not row[x]: x += 1; continue
            x0 = x
            while x < w and row[x]: x += 1
            if x - x0 < min_run: continue
            above = mask[y - clear, x0:x].mean(); below = mask[y + clear, x0:x].mean()
            if above < 0.25 and below < 0.25:            # es una raya, no un cuerpo
                mask[y - 3:y + 4, x0:x] = False
    return mask


def segments(occ, gap):
    """Tramos ocupados de un vector booleano, uniendo huecos menores que `gap`."""
    segs, start, last = [], None, None
    for i, v in enumerate(occ):
        if v:
            if start is None: start = i
            elif i - last > gap: segs.append([start, last + 1]); start = i
            last = i
    if start is not None: segs.append([start, last + 1])
    return segs


def merge_to(segs, n, weights=None):
    """Une tramos vecinos (los de hueco más pequeño) hasta quedarse con n."""
    segs = [list(s) for s in segs]
    while len(segs) > n:
        gaps = [segs[i + 1][0] - segs[i][1] for i in range(len(segs) - 1)]
        i = int(np.argmin(gaps))
        segs[i] = [segs[i][0], segs[i + 1][1]]
        del segs[i + 1]
    return segs


def split(mask, rows, cuts=None):
    occ_r = mask.sum(axis=1) > 3
    bands = segments(occ_r, gap=10)
    bands = [b for b in bands if b[1] - b[0] > 12]
    occ_count = mask.sum(axis=1)
    while len(bands) < len(rows):   # filas que se tocan: se corta la más alta por la línea con menos dibujo
        i = max(range(len(bands)), key=lambda k: bands[k][1] - bands[k][0])
        b0, b1 = bands[i]; hh = b1 - b0
        lo, hi = int(hh * 0.25), int(hh * 0.75)
        cut = b0 + lo + int(np.argmin(occ_count[b0 + lo:b0 + hi]))
        bands[i:i + 1] = [[b0, cut], [cut, b1]]
    bands = merge_to(bands, len(rows))
    boxes = []
    for r, ((y0, y1), n) in enumerate(zip(bands, rows)):
        if cuts and r in cuts:      # cortes a mano (x en la hoja original) cuando un objeto lanzado invade la pose vecina
            xs = cuts[r]
            for x0, x1 in zip(xs[:-1], xs[1:]): boxes.append((x0, y0, x1, y1))
            continue
        sub = mask[y0:y1]
        occ_c = sub.sum(axis=0) > 2
        cols = segments(occ_c, gap=6)
        weight = [int(sub[:, a:b].sum()) for a, b in cols]
        big = max(weight)
        cols = [c for c, wt in zip(cols, weight) if wt > big * 0.01]
        while len(cols) < n:     # dos poses unidas (p. ej. por un cable): se corta por la columna con menos píxeles
            i = max(range(len(cols)), key=lambda k: cols[k][1] - cols[k][0])
            a0, a1 = cols[i]; w = a1 - a0
            prof = sub[:, a0:a1].sum(axis=0)
            lo, hi = int(w * 0.2), int(w * 0.8)
            cut = a0 + lo + int(np.argmin(prof[lo:hi]))
            cols[i:i + 1] = [[a0, cut], [cut, a1]]
        cols = merge_to(cols, n)
        for x0, x1 in cols: boxes.append((x0, y0, x1, y1))
    return boxes


def crop_frame(a, mask, box):
    """Recorta la pose ignorando motas sueltas y restos lejanos (no deben agrandar la caja ni falsear la escala)."""
    x0, y0, x1, y1 = box
    m = mask[y0:y1, x0:x1].copy()
    def span(occ, gap):
        segs = segments(occ, gap)
        w = [m[s:e].sum() if occ is rows else m[:, s:e].sum() for s, e in segs]
        k = int(np.argmax(w)); s0, e0 = segs[k]
        # se queda con el tramo principal y los vecinos cercanos con peso apreciable
        for (s, e), wt in zip(segs, w):
            if wt > max(w) * 0.03 and (s - e0 <= gap * 3 and s0 - e <= gap * 3): s0, e0 = min(s0, s), max(e0, e)
        return s0, e0
    rows = m.sum(axis=1) >= 3
    by0, by1 = span(rows, 12)
    m[:by0] = False; m[by1:] = False
    cols = m.sum(axis=0) >= 2
    bx0, bx1 = span(cols, 12)
    m[:, :bx0] = False; m[:, bx1:] = False
    rgb = a[y0 + by0:y0 + by1, x0 + bx0:x0 + bx1]
    alpha = (m[by0:by1, bx0:bx1] * 255).astype(np.uint8)
    return np.dstack([rgb, alpha])


def box_sum(m, r):
    """Suma de una máscara en una ventana de (2r+1)² alrededor de cada píxel (imagen integral)."""
    p = np.pad(m.astype(np.int32), r)
    ii = np.zeros((p.shape[0] + 1, p.shape[1] + 1), np.int64)
    ii[1:, 1:] = p.cumsum(0).cumsum(1)
    k = 2 * r + 1
    return ii[k:, k:] - ii[:-k, k:] - ii[k:, :-k] + ii[:-k, :-k]


def remove_shirt_text(rgba, r=7, min_red=90):
    """Borra letras naranjas sobre una camiseta negra (p. ej. un nombre de banda que inventó la IA).
    Medido en las hojas de Jota: las letras tienen g/r ≤ 0,51 y b/r ≤ 0,32; la piel, g/r ≥ 0,55 y b/r ≥ 0,32.
    Además se exige estar rodeado de bastante negro (dentro de la camiseta)."""
    rgb = rgba[..., :3].astype(float)
    alpha = rgba[..., 3] > 0
    R = np.maximum(rgb[..., 0], 1)
    gr, br, lum = rgb[..., 1] / R, rgb[..., 2] / R, rgb.mean(axis=2)
    dark = (lum < 50) & alpha
    win = (2 * r + 1) ** 2
    near_shirt = box_sum(dark, r) / win > 0.30
    text = alpha & (rgb[..., 0] > min_red) & (gr < 0.53) & (br < 0.30) & near_shirt
    text = (box_sum(text, 1) > 0) & alpha & (lum > 30) & near_shirt   # bordes antialiasados de las letras
    out = rgba.copy()
    out[text, :3] = (24, 22, 26)
    return out


def recolor_pants(rgba):
    """Gemini pintó el pantalón gris azulado en una hoja y marrón oscuro en las demás: lo igualamos.
    Solo toca azules oscuros y poco saturados (la camisa, azul claro, no cambia)."""
    rgb = rgba[..., :3].astype(float) / 255
    mx, mn = rgb.max(axis=2), rgb.min(axis=2)
    v = mx; sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    bluish = (b >= r + 0.03) & (b >= g - 0.01) & (v < 0.62) & (sat > 0.08) & (rgba[..., 3] > 0)
    target = np.array([0.36, 0.24, 0.20])                    # marrón oscuro de las otras hojas
    out = rgba.copy()
    out[bluish, :3] = np.clip(target * (v[bluish, None] / 0.40) * 255, 0, 255).astype(np.uint8)
    return out


def downscale(rgba, scale):
    h, w = rgba.shape[:2]
    nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
    im = Image.fromarray(rgba, 'RGBA').convert('RGBa').resize((nw, nh), Image.BOX).convert('RGBA')
    out = np.asarray(im).copy()
    out[..., 3] = np.where(out[..., 3] >= 85, 255, 0)     # umbral bajo: conserva mástiles y cables finos
    return out


def add_outline(rgba):
    a = rgba[..., 3] > 0
    p = np.pad(a, 1)
    near = p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:]
    edge = near & ~a
    out = np.pad(rgba, ((1, 1), (1, 1), (0, 0)))
    e = np.pad(edge, 1)
    out[e] = (*OUTLINE, 255)
    return out


def anchor(rgba, loose):
    """(ox, oy): punto del suelo bajo el personaje. Mediana ponderada de las piernas (el cable o la guitarra no lo mueven)."""
    a = rgba[..., 3] > 0
    h, w = a.shape
    if loose: return w // 2, h - 1
    legs = a[int(h * 0.75):]
    counts = legs.sum(axis=0).astype(float)
    counts[counts < 2] = 0
    if counts.sum() == 0: return w // 2, h - 1
    c = np.cumsum(counts)
    return int(np.searchsorted(c, c[-1] / 2)), h - 1


def quantize_all(frames, n):
    """Una sola paleta para todo el músico (así no cambian los colores entre poses)."""
    strip_w = sum(f.shape[1] for f in frames); strip_h = max(f.shape[0] for f in frames)
    strip = np.zeros((strip_h, strip_w, 4), np.uint8); x = 0
    for f in frames: strip[:f.shape[0], x:x + f.shape[1]] = f; x += f.shape[1]
    opaque = strip[..., 3] > 0
    pal_img = Image.fromarray(strip[..., :3][opaque].reshape(1, -1, 3), 'RGB').quantize(n, method=Image.MEDIANCUT)
    out = []
    for f in frames:
        q = Image.fromarray(np.ascontiguousarray(f[..., :3]), 'RGB').quantize(palette=pal_img, dither=Image.NONE).convert('RGB')
        out.append(np.dstack([np.asarray(q), f[..., 3]]))
    return out


def portrait_crop(c):
    """Encuadre común de los retratos: cuadrado desde lo alto de la cabeza, centrado en la cabeza."""
    a = c[..., 3] > 0
    ys, xs = np.where(a)
    top = ys.min()
    head = a[top:top + max(4, (ys.max() - top) // 3)]
    hx = np.where(head.any(axis=0))[0]
    cx = int((hx.min() + hx.max()) / 2)
    side = min(c.shape[1], int((ys.max() - top) * 0.85))
    x0 = max(0, min(c.shape[1] - side, cx - side // 2))
    sq = np.zeros((side, side, 4), np.uint8)
    part = c[top:top + side, x0:x0 + side]
    sq[:part.shape[0], :part.shape[1]] = part
    return sq


def brighten_skin(rgba, target=150.0):
    """Iguala el brillo de los retratos: lleva la luminancia media de la piel a `target` con una curva gamma."""
    rgb = rgba[..., :3].astype(float)
    m = rgba[..., 3] > 0
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    skin = m & (r > g) & (g > b) & (r > 60) & ((r - b) > 25)
    if skin.sum() < 20: return rgba
    cur = rgb[skin].mean()
    if cur >= target - 5: return rgba
    gamma = np.log(target / 255) / np.log(max(cur, 1) / 255)
    out = rgba.copy()
    out[..., :3] = np.clip(255 * (rgb / 255) ** gamma, 0, 255).astype(np.uint8)
    return out


def pack(frames, width=512):
    x = y = row_h = 0; pos = []
    for f in frames:
        h, w = f.shape[:2]
        if x + w > width: x, y, row_h = 0, y + row_h + 1, 0
        pos.append((x, y)); x += w + 1; row_h = max(row_h, h)
    atlas = np.zeros((y + row_h, width, 4), np.uint8)
    for f, (px, py) in zip(frames, pos): atlas[py:py + f.shape[0], px:px + f.shape[1]] = f
    return atlas, pos


def build(hero):
    base = os.path.join(ROOT, 'art', 'source')
    names, frames, anchors_loose, portrait = [], [], [], None
    first_scale = None
    for sh in SHEETS[hero]:
        src = os.path.join(base, sh.get('dir', hero))
        if sh.get('portrait_file'):          # retrato suelto (imagen cuadrada aparte)
            a = np.asarray(Image.open(os.path.join(src, sh['portrait_file'])).convert('RGB'))
            m = foreground(a, background(a))
            ys, xs = np.where(m)
            c = np.dstack([a, (m * 255).astype(np.uint8)])[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
            side = max(c.shape[:2]); pad = np.zeros((side, side, 4), np.uint8)
            pad[side - c.shape[0]:, (side - c.shape[1]) // 2:(side - c.shape[1]) // 2 + c.shape[1]] = c
            portrait = downscale(pad, PORTRAIT / side)
            print(f"{sh['portrait_file']}: retrato")
            continue
        a = np.asarray(Image.open(os.path.join(src, sh['file'])).convert('RGB'))
        bg = background(a)
        mask = erase_floor_lines(a, foreground(a, bg))
        if sh.get('erase'): mask = erase_text(a, mask, sh['erase'])
        boxes = sh['boxes'] if sh.get('boxes') else split(mask, sh['rows'], sh.get('cuts'))   # `boxes`: cajas a mano
        assert len(boxes) == len(sh['names']), (sh['file'], len(boxes))
        crops = {n: crop_frame(a, mask, b) for n, b in zip(sh['names'], boxes)}
        if sh.get('sin_texto'): crops = {n: remove_shirt_text(c) for n, c in crops.items()}
        if sh.get('scale_from_first') and first_scale: scale = first_scale   # mismas dimensiones de hoja → misma escala
        else: scale = SIZE_MUL * sh.get('target', STAND_H) / float(np.median([crops[r].shape[0] for r in sh['ref']]))   # mediana de poses de referencia
        first_scale = first_scale or scale
        for n in sh['names']:
            if n in sh.get('skip', []): continue
            if n == sh.get('portrait'):
                sq = portrait_crop(crops[n])
                portrait = brighten_skin(downscale(sq, PORTRAIT / sq.shape[0]))
                continue
            fr = downscale(crops[n], scale)
            if sh.get('recolor') == 'pantalon': fr = recolor_pants(fr)
            names.append(n); frames.append(fr); anchors_loose.append(n in sh['loose'])
        print(f"{sh['file']}: {len(boxes)} poses, escala {scale:.3f}")
    common = os.path.join(base, PORTRAITS_SHEET['file'])
    if os.path.exists(common) and hero in PORTRAITS_SHEET['order']:   # los 4 retratos de una misma imagen: mismo estilo
        a = np.asarray(Image.open(common).convert('RGB'))
        mask = foreground(a, background(a))
        boxes = split(mask, [len(PORTRAITS_SHEET['order'])])
        c = crop_frame(a, mask, boxes[PORTRAITS_SHEET['order'].index(hero)])
        sq = portrait_crop(c)
        portrait = downscale(sq, PORTRAIT / sq.shape[0])
        print(f"{PORTRAITS_SHEET['file']}: retrato común")
    frames = quantize_all(frames, COLORS)
    frames = [add_outline(f) for f in frames]
    allf = frames + ([quantize_all([portrait], 48)[0]] if portrait is not None else [])
    alln = names + (['portrait'] if portrait is not None else [])
    atlas, pos = pack(allf)
    meta = {}
    for i, (n, f, (x, y)) in enumerate(zip(alln, allf, pos)):
        ox, oy = anchor(f, anchors_loose[i] if i < len(anchors_loose) else True)
        meta[n] = [x, y, f.shape[1], f.shape[0], ox, oy]
    colors = len(np.unique(atlas[atlas[..., 3] > 0][:, :3].reshape(-1, 3), axis=0))
    assert colors <= COLORS + 1 + 48, colors
    os.makedirs(os.path.join(ROOT, 'art', 'build'), exist_ok=True)
    png = io.BytesIO(); Image.fromarray(atlas, 'RGBA').save(png, 'PNG', optimize=True)
    with open(os.path.join(ROOT, 'art', 'build', f'{hero}-atlas.png'), 'wb') as fh: fh.write(png.getvalue())
    js = (f"// Generado por scripts/slice_sheet.py a partir de art/source/. No editar a mano.\n"
          f"// Fotogramas: [x, y, ancho, alto, ox, oy] — (ox, oy) es el punto del suelo bajo el personaje.\n"
          f"export const PNG = 'data:image/png;base64,{base64.b64encode(png.getvalue()).decode()}';\n"
          f"export const FRAMES = {json.dumps(meta, separators=(',', ':'))};\n")
    with open(os.path.join(ROOT, 'src', 'data', f'atlas-{hero}.js'), 'w') as fh: fh.write(js)
    if portrait is not None:     # retrato suelto y ligero para el mando del móvil
        pq = quantize_all([portrait], 48)[0]
        pb = io.BytesIO(); Image.fromarray(pq, 'RGBA').save(pb, 'PNG', optimize=True)
        with open(os.path.join(ROOT, 'src', 'data', f'retrato-{hero}.js'), 'w') as fh:
            fh.write(f"// Generado por scripts/slice_sheet.py. No editar a mano.\nexport const PNG = 'data:image/png;base64,{base64.b64encode(pb.getvalue()).decode()}';\n")
    print(f"{hero}: {len(alln)} fotogramas, atlas {atlas.shape[1]}×{atlas.shape[0]}, {colors} colores, {len(png.getvalue()) // 1024} KB")


if __name__ == '__main__':
    for h in (sys.argv[1:] or list(SHEETS)): build(h)
