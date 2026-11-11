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
COLORS = 32             # colores por músico
OUTLINE = (18, 12, 24)

# Cada hoja: archivo, poses por fila, nombres en orden, poses de referencia (de pie; se usa la mediana de su altura) para la escala,
# y fotogramas que no están de pie (se anclan por el centro de la caja, no por los pies).
SHEETS = {
    'antonio': [
        dict(file='antonio-2-movimiento.jpg', rows=[2, 4, 4, 2],
             names=['idle0', 'idle1', 'walk0', 'walk1', 'walk2', 'walk3', 'run0', 'run1', 'run2', 'run3', 'jump0', 'jump1'],
             ref=['idle0', 'idle1', 'walk0', 'walk2'], loose=['jump0', 'jump1']),
        dict(file='antonio-3-combo.jpg', rows=[4, 3, 5],
             names=['punch1a', 'punch1b', 'punch2a', 'punch2b', 'guit0', 'guit1', 'guit2', 'air', 'grab', 'knee', 'throw0', 'throw1'],
             ref=['punch1a', 'punch1b'], loose=['air']),
        dict(file='antonio-4-dano-especial.jpg', rows=[3, 3, 4],
             names=['fall0', 'fall1', 'fall2', 'down', 'rise0', 'rise1', 'sp0', 'sp1', 'sp2', 'sp3'],
             ref=['sp0', 'sp1'], loose=['fall0', 'fall1', 'fall2', 'down'], recolor='pantalon'),
        dict(file='antonio-5-firma-super.jpg', rows=[3, 4, 3],
             names=['lash0', 'lash1', 'lash2', 'hymn0', 'hymn1', 'hymn2', 'hymn3', 'win0', 'win1', 'portrait'],
             ref=['hymn1', 'hymn2', 'hymn3', 'lash0'], loose=[], portrait='portrait'),
    ],
    # Pepe: Gemini dio 3 poses en la fila de la rodilla y una borrosa de más en la del bajazo (se descarta).
    # `target`: altura de las poses de referencia según su postura (Pepe en guardia va agachado; la victoria, erguida).
    'pepe': [
        dict(file='pepe-2-movimiento.jpg', rows=[2, 4, 4, 2],
             names=['idle0', 'idle1', 'walk0', 'walk1', 'walk2', 'walk3', 'run0', 'run1', 'run2', 'run3', 'jump0', 'jump1'],
             ref=['idle0', 'idle1', 'walk0', 'walk2'], target=64, loose=['jump0', 'jump1']),
        dict(file='pepe-3-combo.jpg', rows=[2, 3, 4, 5],
             names=['punch1a', 'punch1b', 'punch2a', 'punch2m', 'punch2b', 'guit0', 'guit1', 'guit2', 'blur',
                    'air', 'grab', 'knee', 'throw0', 'throw1'],
             ref=['punch1b', 'punch2b'], target=66, loose=['air'], skip=['blur']),
        dict(file='pepe-4-dano-especial.jpg', rows=[3, 3, 4],
             names=['hurt', 'fall0', 'fall1', 'down', 'rise0', 'rise1', 'sp0', 'sp1', 'sp2', 'sp3'],
             ref=['hurt'], target=70, loose=['fall0', 'fall1', 'down']),
        dict(file='pepe-5-firma-super.jpg', rows=[3, 4, 4],
             names=['sig0', 'sig1', 'sig2', 'sup0', 'sup1', 'sup2', 'sup3', 'win0', 'win1', 'win2', 'portrait_small'],
             ref=['win0', 'win2'], target=74, loose=[], skip=['portrait_small']),
        dict(portrait_file='pepe-6-retrato.jpg'),
    ],
}


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


def split(mask, rows):
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
    for (y0, y1), n in zip(bands, rows):
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
    src = os.path.join(ROOT, 'art', 'source', hero)
    names, frames, anchors_loose, portrait = [], [], [], None
    for sh in SHEETS[hero]:
        if sh.get('portrait_file'):          # retrato suelto (imagen cuadrada aparte)
            a = np.asarray(Image.open(os.path.join(src, sh['portrait_file'])).convert('RGB'))
            m = foreground(a, background(a))
            ys, xs = np.where(m)
            c = np.dstack([a, (m * 255).astype(np.uint8)])[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
            side = max(c.shape[:2]); pad = np.zeros((side, side, 4), np.uint8)
            pad[side - c.shape[0]:, (side - c.shape[1]) // 2:(side - c.shape[1]) // 2 + c.shape[1]] = c
            portrait = downscale(pad, 46 / side)
            print(f"{sh['portrait_file']}: retrato")
            continue
        a = np.asarray(Image.open(os.path.join(src, sh['file'])).convert('RGB'))
        bg = background(a)
        mask = erase_floor_lines(a, foreground(a, bg))
        boxes = split(mask, sh['rows'])
        assert len(boxes) == len(sh['names']), (sh['file'], len(boxes))
        crops = {n: crop_frame(a, mask, b) for n, b in zip(sh['names'], boxes)}
        scale = sh.get('target', STAND_H) / float(np.median([crops[r].shape[0] for r in sh['ref']]))   # mediana de varias poses de referencia
        for n in sh['names']:
            if n in sh.get('skip', []): continue
            if n == sh.get('portrait'):
                c = crops[n]; side = max(c.shape[:2])
                pad = np.zeros((side, side, 4), np.uint8)
                pad[side - c.shape[0]:, (side - c.shape[1]) // 2:(side - c.shape[1]) // 2 + c.shape[1]] = c
                portrait = downscale(pad, 46 / side)
                continue
            fr = downscale(crops[n], scale)
            if sh.get('recolor') == 'pantalon': fr = recolor_pants(fr)
            names.append(n); frames.append(fr); anchors_loose.append(n in sh['loose'])
        print(f"{sh['file']}: {len(boxes)} poses, escala {scale:.3f}")
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
    js = (f"// Generado por scripts/slice_sheet.py a partir de art/source/{hero}/. No editar a mano.\n"
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
