#!/usr/bin/env python3
"""Recorta los trajes de Pepe (spec §3.0f D) de las hojas de Gemini en rejilla de 4×4 (filas = trajes;
columnas = reposo, correr, saltar, lanzar) y genera src/data/costumes-atlas.js.
Uso: python3 scripts/slice_costumes.py
- Fondo de cada celda = mediana del borde de la celda; se quedan las piezas grandes (figura, guitarra, capa).
- Escala común por hoja: el reposo del primer traje de la hoja mide 48 px.
- En «lanzar» se borra lo que queda a más de CUT px delante del ancla (micro y cable: el juego pinta los suyos).
"""
import base64, io, json
import numpy as np
from PIL import Image
from slice_sheet import components

SHEETS = [
    # (archivo, recuadro útil x0,y0,x1,y1, trajes por fila; None = fila que no se usa)
    ('art/source/pepe-trajes-1.jpg', (0, 0, 2400, 1792), [None, 'rojo', 'boina', 'bandana']),
    ('art/source/pepe-trajes-2.png', (40, 8, 970, 705), ['chamarra', 'vampiro', 'botarga', 'lentes']),
]
POSES = ['idle', 'run', 'jump', 'throw']
TARGET_H, CUT = 48, 20

def cell_figure(a, box):
    x0, y0, x1, y1 = box
    c = a[y0:y1, x0:x1]
    edge = np.concatenate([c[:4].reshape(-1, 3), c[-4:].reshape(-1, 3), c[:, :4].reshape(-1, 3), c[:, -4:].reshape(-1, 3)])
    bg = np.median(edge, axis=0)
    mask = np.abs(c - bg).sum(axis=2) > 42
    comps = [k for k in components(mask) if k[4] >= 30]
    big = max(k[4] for k in comps)
    h, w = mask.shape
    # Fuera: motas y restos de la fila vecina (piezas pequeñas que tocan el borde de la celda).
    edge_bit = lambda k: k[1] <= 2 or k[3] >= h - 3 or k[0] <= 2 or k[2] >= w - 3
    keep = [k for k in comps if k[4] >= 0.01 * big and not (edge_bit(k) and k[4] < 0.3 * big)]
    out = np.zeros(mask.shape, bool)
    for k in keep:
        for (y, a0, a1) in k[5]: out[y, a0:a1] = True
    ys, xs = np.where(out)
    main = max(keep, key=lambda k: k[4])
    return c, out, (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1), main

def main():
    frames = []
    for path, (px0, py0, px1, py1), rows in SHEETS:
        a = np.asarray(Image.open(path).convert('RGB')).astype(np.int16)
        cw, ch = (px1 - px0) / 4, (py1 - py0) / 4
        cells = {}
        for r, cid in enumerate(rows):
            if not cid: continue
            for col, pose in enumerate(POSES):
                box = (int(px0 + col * cw), int(py0 + r * ch), int(px0 + (col + 1) * cw), int(py0 + (r + 1) * ch))
                cells[(cid, pose)] = cell_figure(a, box)
        first = next(c for c in rows if c)
        _, _, (bx0, by0, bx1, by1), _ = cells[(first, 'idle')]
        scale = TARGET_H / (by1 - by0)
        for (cid, pose), (c, m, (bx0, by0, bx1, by1), mainc) in cells.items():
            rgba = np.dstack([c.astype(np.uint8), (m * 255).astype(np.uint8)])[by0:by1, bx0:bx1]
            crop = Image.fromarray(np.ascontiguousarray(rgba), 'RGBA')
            w, h = max(1, round(crop.width * scale)), max(1, round(crop.height * scale))
            arr = np.asarray(crop).astype(np.float32); al = arr[..., 3:4] / 255
            pm = Image.fromarray(np.dstack([arr[..., :3] * al, arr[..., 3:]]).astype(np.uint8), 'RGBA').resize((w, h), Image.LANCZOS)
            p = np.asarray(pm).astype(np.float32); alpha = p[..., 3]
            rgb = np.where(alpha[..., None] > 0, p[..., :3] / np.maximum(alpha[..., None] / 255, 1e-3), 0)
            out = np.dstack([np.clip(rgb, 0, 255), np.where(alpha > 110, 255, 0)]).astype(np.uint8)
            ay = h
            sub = out[int(h * 0.88):, :, 3] > 0
            cols = np.where(sub.any(axis=0))[0]
            ax = int(round((cols.min() + cols.max()) / 2)) if len(cols) else w // 2
            if pose == 'throw':
                out[:, ax + CUT + 1:, 3] = 0
                keep = np.where(out[..., 3].any(axis=0))[0]
                out = out[:, :keep.max() + 1]
            frames.append({'key': f'{cid}_{pose}', 'img': Image.fromarray(out, 'RGBA'), 'ax': ax, 'ay': ay})

    W = sum(f['img'].width + 2 for f in frames); H = max(f['img'].height for f in frames)
    atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0)); x = 0
    for f in frames: atlas.paste(f['img'], (x, 0)); f['x'] = x; x += f['img'].width + 2
    alpha = atlas.getchannel('A')
    q = atlas.convert('RGB').quantize(colors=64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    atlas = Image.merge('RGBA', (*q.split(), alpha))
    meta = {'frames': {f['key']: {'x': f['x'], 'y': 0, 'w': f['img'].width, 'h': f['img'].height, 'ax': f['ax'], 'ay': f['ay']} for f in frames}}
    buf = io.BytesIO(); atlas.save(buf, 'PNG', optimize=True)
    uri = 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()
    with open('src/data/costumes-atlas.js', 'w') as fh:
        fh.write('// Generado por scripts/slice_costumes.py desde art/source/pepe-trajes-*.{jpg,png} — no editar a mano.\n')
        fh.write(f'export const COSTUMES_META = {json.dumps(meta)};\n')
        fh.write(f"export const COSTUMES_PNG = '{uri}';\n")
    import os; os.makedirs('art/out', exist_ok=True)
    prev = atlas.resize((atlas.width * 4, atlas.height * 4), Image.NEAREST)
    bgimg = Image.new('RGBA', prev.size, (60, 50, 80, 255)); bgimg.alpha_composite(prev); bgimg.save('art/out/costumes-preview.png')
    print(f'trajes: {len(frames)} fotogramas, atlas {atlas.size}, {len(uri) // 1024} KB')

if __name__ == '__main__':
    main()
