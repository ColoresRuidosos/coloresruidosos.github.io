#!/usr/bin/env python3
"""Recorta hojas de sprites por FILAS y HUECOS (v8; hojas de ChatGPT de Noche). A diferencia de slice_sheet.py,
no exige que cada pose sea una sola figura: une las piezas sueltas (jirones, máscaras lanzadas, chispas) a la pose
más cercana de su fila hasta que el número de poses coincide con el pedido.

Uso: python3 scripts/slice_rows.py <hoja> <nombre> <alto_px> <filas> <anim1:n1,anim2:n2,...>
  filas: poses por fila (p. ej. 6,6,4,3). anims: nombres en orden de lectura con su número de fotogramas.
Salida: src/data/<nombre>-atlas.js (mismo formato que slice_sheet.py) y art/out/<nombre>-preview.png
"""
import base64, io, json, os, sys
import numpy as np
from PIL import Image

def runs(flags, min_gap):
    """Tramos [a, b) donde flags es True, separados por al menos min_gap posiciones vacías."""
    idx = np.where(flags)[0]
    if not len(idx): return []
    out, a, prev = [], idx[0], idx[0]
    for i in idx[1:]:
        if i - prev > min_gap: out.append([a, prev + 1]); a = i
        prev = i
    out.append([a, prev + 1])
    return out

def merge_to(segs, mass, n):
    """Une el tramo con menos píxeles a su vecino más cercano hasta quedarse con n."""
    segs, mass = [list(s) for s in segs], list(mass)
    assert len(segs) >= n, f'hay {len(segs)} y se esperaban {n}'
    while len(segs) > n:
        i = int(np.argmin(mass))
        gl = segs[i][0] - segs[i - 1][1] if i > 0 else 10**9
        gr = segs[i + 1][0] - segs[i][1] if i < len(segs) - 1 else 10**9
        j = i - 1 if gl <= gr else i + 1
        a, b = min(i, j), max(i, j)
        segs[a] = [segs[a][0], segs[b][1]]; mass[a] += mass[b]
        del segs[b]; del mass[b]
    return segs

def main():
    src, name, target_h, rows_spec, anim_spec = sys.argv[1:6]
    target_h = int(target_h)
    row_counts = [int(n) for n in rows_spec.split(',')]
    anims = [(a.split(':')[0], int(a.split(':')[1])) for a in anim_spec.split(',')]
    assert sum(row_counts) == sum(n for _, n in anims), 'las filas y las animaciones no suman lo mismo'
    a = np.asarray(Image.open(src).convert('RGB')).astype(np.int16)
    edge = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    bg = np.median(edge, axis=0)
    mask = np.abs(a - bg).sum(axis=2) > 40

    # Filas: bandas horizontales con contenido.
    rmass = mask.sum(axis=1)
    bands = runs(rmass > 2, 8)
    bands = merge_to(bands, [int(rmass[y0:y1].sum()) for y0, y1 in bands], len(row_counts))

    items = []
    for (y0, y1), n in zip(bands, row_counts):
        cm = mask[y0:y1].sum(axis=0)
        segs = runs(cm > 0, 6)
        # Poses que se tocan (abrigos largos): se parte la más ancha por la columna con menos píxeles.
        while len(segs) < n:
            k = max(range(len(segs)), key=lambda i: segs[i][1] - segs[i][0])
            x0, x1 = segs[k]
            lo, hi = x0 + (x1 - x0) * 3 // 10, x0 + (x1 - x0) * 7 // 10
            cut = lo + int(np.argmin(cm[lo:hi]))
            segs[k:k + 1] = [[x0, cut], [cut, x1]]
        segs = merge_to(segs, [int(cm[x0:x1].sum()) for x0, x1 in segs], n)
        for x0, x1 in segs:
            m = mask[y0:y1, x0:x1]
            ys, xs = np.where(m)
            items.append({'box': (x0 + xs.min(), y0 + ys.min(), x0 + xs.max() + 1, y0 + ys.max() + 1)})

    first = items[:anims[0][1]]
    scale = target_h / np.mean([it['box'][3] - it['box'][1] for it in first])
    frames = []
    for it in items:
        bx0, by0, bx1, by1 = it['box']
        rgba = np.dstack([a[by0:by1, bx0:bx1].astype(np.uint8), (mask[by0:by1, bx0:bx1] * 255).astype(np.uint8)])
        crop = Image.fromarray(np.ascontiguousarray(rgba), 'RGBA')
        w, h = max(1, round(crop.width * scale)), max(1, round(crop.height * scale))
        arr = np.asarray(crop).astype(np.float32); al = arr[..., 3:4] / 255
        pm = Image.fromarray(np.dstack([arr[..., :3] * al, arr[..., 3:]]).astype(np.uint8), 'RGBA').resize((w, h), Image.LANCZOS)
        p = np.asarray(pm).astype(np.float32); alpha = p[..., 3]
        rgb = np.where(alpha[..., None] > 0, p[..., :3] / np.maximum(alpha[..., None] / 255, 1e-3), 0)
        out = np.dstack([np.clip(rgb, 0, 255), np.where(alpha > 110, 255, 0)]).astype(np.uint8)
        sub = out[int(h * 0.88):, :, 3] > 0
        cols = np.where(sub.any(axis=0))[0]
        ax = int(round((cols.min() + cols.max()) / 2)) if len(cols) else w // 2
        frames.append({'img': Image.fromarray(out, 'RGBA'), 'ax': ax, 'ay': h})

    W = sum(f['img'].width + 2 for f in frames); H = max(f['img'].height for f in frames)
    atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0)); x = 0
    for f in frames: atlas.paste(f['img'], (x, 0)); f['x'] = x; x += f['img'].width + 2
    alpha = atlas.getchannel('A')
    q = atlas.convert('RGB').quantize(colors=48, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    atlas = Image.merge('RGBA', (*q.split(), alpha))
    meta, i = {'frames': {}, 'anims': {}}, 0
    for anim, n in anims:
        meta['anims'][anim] = []
        for k in range(n):
            f = frames[i]; key = f'{anim}{k}'
            meta['frames'][key] = {'x': f['x'], 'y': 0, 'w': f['img'].width, 'h': f['img'].height, 'ax': f['ax'], 'ay': f['ay']}
            meta['anims'][anim].append(key); i += 1
    buf = io.BytesIO(); atlas.save(buf, 'PNG', optimize=True)
    uri = 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()
    with open(f'src/data/{name}-atlas.js', 'w') as fh:
        fh.write(f'// Generado por scripts/slice_rows.py desde {src} — no editar a mano.\n')
        fh.write(f'export const {name.upper()}_META = {json.dumps(meta)};\n')
        fh.write(f"export const {name.upper()}_PNG = '{uri}';\n")
    os.makedirs('art/out', exist_ok=True)
    prev = atlas.resize((atlas.width * 3, atlas.height * 3), Image.NEAREST)
    bgimg = Image.new('RGBA', prev.size, (60, 50, 80, 255)); bgimg.alpha_composite(prev); bgimg.save(f'art/out/{name}-preview.png')
    print(f'{name}: {len(frames)} fotogramas, escala {scale:.3f}, atlas {atlas.size}, {len(uri) // 1024} KB')

if __name__ == '__main__':
    main()
