#!/usr/bin/env python3
"""Recorta una hoja de sprites sobre fondo liso y la convierte en un atlas de pixel art.

Uso: python3 scripts/slice_sheet.py <hoja> <nombre> <altura_px> <filas> <anim1:n1,anim2:n2,...> [cortes]
  filas: cuántos fotogramas hay en cada fila (p. ej. 4,8,5,5,7)
  anims: nombres en orden de lectura con su número de fotogramas.
  cortes (opcional): anim:px,... borra lo que quede a más de px a la derecha del ancla
                     (p. ej. el micro dibujado en «throw»: el juego dibuja su propio cable).
Salida: art/out/<nombre>.png, art/out/<nombre>-preview.png y src/data/<nombre>-atlas.js
"""
import base64, io, json, os, sys
import numpy as np
from PIL import Image

def components(mask):
    """Etiquetado por tramos horizontales + union-find (sin scipy)."""
    h, w = mask.shape
    parent = []
    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a
    prev = []  # (x0, x1, id) de la fila anterior
    runs = []  # (y, x0, x1, id)
    for y in range(h):
        row = mask[y]
        d = np.diff(np.concatenate(([0], row.view(np.int8), [0])))
        starts, ends = np.where(d == 1)[0], np.where(d == -1)[0]
        cur = []
        j = 0
        for x0, x1 in zip(starts, ends):
            rid = len(parent); parent.append(rid)
            while j < len(prev) and prev[j][1] < x0 - 1: j += 1
            k = j
            while k < len(prev) and prev[k][0] <= x1:
                a, b = find(rid), find(prev[k][2])
                if a != b: parent[b] = a
                k += 1
            cur.append((x0, x1, rid)); runs.append((y, x0, x1, rid))
        prev = cur
    comps = {}
    for y, x0, x1, rid in runs:
        r = find(rid)
        c = comps.setdefault(r, [10**9, 10**9, -1, -1, 0, []])
        c[0] = min(c[0], x0); c[1] = min(c[1], y); c[2] = max(c[2], x1 - 1); c[3] = max(c[3], y); c[4] += x1 - x0
        c[5].append((y, x0, x1))
    return list(comps.values())

def main():
    src, name, target_h, rows_spec, anim_spec = sys.argv[1:6]
    cuts = dict((c.split(':')[0], int(c.split(':')[1])) for c in sys.argv[6].split(',')) if len(sys.argv) > 6 else {}
    frame_anim = [an for an, n in [(x.split(':')[0], int(x.split(':')[1])) for x in anim_spec.split(',')] for _ in range(n)]
    target_h = int(target_h)
    row_counts = [int(n) for n in rows_spec.split(',')]
    anims = [(a.split(':')[0], int(a.split(':')[1])) for a in anim_spec.split(',')]
    im = Image.open(src).convert('RGB')
    a = np.asarray(im).astype(np.int16)
    bg = np.median(np.concatenate([a[:8, :].reshape(-1, 3), a[-8:, :].reshape(-1, 3)]), axis=0)
    dist = np.abs(a - bg).sum(axis=2)
    mask = dist > 30

    comps = [c for c in components(mask) if c[4] >= 40]
    if os.environ.get('SLICE_BY_GAP'):
        # Hojas compuestas de una sola fila (scripts/compose_frames.py): cada hueco horizontal grande separa
        # una pose, aunque la pose esté hecha de varias piezas (imágenes de poca resolución).
        groups = []
        for c in sorted(comps, key=lambda c: c[0]):
            if groups and c[0] <= groups[-1]['x1'] + 60:
                g = groups[-1]; g['boxes'].append(c); g['runs'] += c[5]; g['x1'] = max(g['x1'], c[2])
            else:
                groups.append({'boxes': [c], 'runs': list(c[5]), 'x1': c[2]})
        for g in groups: g['boxes'].sort(key=lambda c: -c[4])
    else:
        groups = None
    # Figura = componente grande (≥ 4000 px y ≥ 20 % de la mayor); lo demás (destellos, papeles, gorras que salen volando) se une a la figura más cercana.
    limit = max(4000, 0.2 * max(c[4] for c in comps))
    big = [c for c in comps if c[4] >= limit]
    small = [c for c in comps if c[4] < limit]
    if groups is None: groups = [{'boxes': [c], 'runs': list(c[5])} for c in big]
    for s in (small if not os.environ.get('SLICE_BY_GAP') else []):  # efectos (destellos, rayas, cable) al personaje más cercano
        cx, cy = (s[0] + s[2]) / 2, (s[1] + s[3]) / 2
        def gap(g):
            b = g['boxes'][0]
            dx = max(b[0] - cx, 0, cx - b[2]); dy = max(b[1] - cy, 0, cy - b[3])
            return (dx * dx + dy * dy) ** 0.5
        best = min(groups, key=gap)
        if gap(best) < 160:
            best['boxes'].append(s); best['runs'] += s[5]

    for g in groups:
        b = g['boxes']
        g['x0'] = min(c[0] for c in b); g['y0'] = min(c[1] for c in b)
        g['x1'] = max(c[2] for c in b); g['y1'] = max(c[3] for c in b)
        g['cy'] = (g['boxes'][0][1] + g['boxes'][0][3]) / 2
    # Filas por posición vertical del personaje.
    groups.sort(key=lambda g: g['cy'])
    rows, cur = [], [groups[0]]
    for g in groups[1:]:
        if abs(g['cy'] - cur[-1]['cy']) < 150: cur.append(g)
        else: rows.append(cur); cur = [g]
    rows.append(cur)
    counts = [len(r) for r in rows]
    assert counts == row_counts, f'filas detectadas {counts}, esperadas {row_counts}'
    ordered = [g for r in rows for g in sorted(r, key=lambda g: g['x0'])]
    assert len(ordered) == sum(n for _, n in anims)

    # Escala común: la altura media del primer grupo (reposo) = target_h.
    first = ordered[:anims[0][1]]
    scale = target_h / np.mean([g['y1'] - g['y0'] + 1 for g in first])

    rgba = np.dstack([a.astype(np.uint8), np.zeros(a.shape[:2], np.uint8)])
    frames = []
    for g in ordered:
        for (y, x0, x1) in g['runs']: rgba[y, x0:x1, 3] = 255
        crop = Image.fromarray(rgba[g['y0']:g['y1'] + 1, g['x0']:g['x1'] + 1].copy(), 'RGBA')
        w = max(1, round(crop.width * scale)); h = max(1, round(crop.height * scale))
        # Reducción con premultiplicado para no ensuciar los bordes con el gris del fondo.
        arr = np.asarray(crop).astype(np.float32)
        al = arr[..., 3:4] / 255
        pm = Image.fromarray(np.dstack([arr[..., :3] * al, arr[..., 3:]]).astype(np.uint8), 'RGBA').resize((w, h), Image.LANCZOS)
        p = np.asarray(pm).astype(np.float32)
        alpha = p[..., 3]
        rgb = np.where(alpha[..., None] > 0, p[..., :3] / np.maximum(alpha[..., None] / 255, 1e-3), 0)
        out = np.dstack([np.clip(rgb, 0, 255), np.where(alpha > 110, 255, 0)]).astype(np.uint8)
        # Ancla: centro de los pies (12 % inferior de la figura principal); y = suelo.
        main = g['boxes'][0]
        ay = int(round((main[3] - g['y0'] + 1) * scale))
        sub = out[max(0, ay - int(h * 0.12)):ay, :, 3] > 0
        cols = np.where(sub.any(axis=0))[0]
        ax = int(round((cols.min() + cols.max()) / 2)) if len(cols) else w // 2
        cut = cuts.get(frame_anim[len(frames)])
        if cut is not None:
            out[:, ax + cut + 1:, 3] = 0
            keep = np.where(out[..., 3].any(axis=0))[0]
            out = out[:, :keep.max() + 1]
        frames.append({'img': Image.fromarray(out, 'RGBA'), 'ax': ax, 'ay': ay})

    # Paleta común (estilo 16 bits): cuantizar todo junto.
    W = sum(f['img'].width + 2 for f in frames); H = max(f['img'].height for f in frames)
    atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    x = 0
    for f in frames:
        atlas.paste(f['img'], (x, 0)); f['x'] = x; x += f['img'].width + 2
    alpha = atlas.getchannel('A')
    q = atlas.convert('RGB').quantize(colors=48, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    atlas = Image.merge('RGBA', (*q.split(), alpha))
    atlas.save(f'art/out/{name}.png', optimize=True)

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
        fh.write(f'// Generado por scripts/slice_sheet.py desde art/source — no editar a mano.\n')
        fh.write(f'export const {name.upper()}_META = {json.dumps(meta)};\n')
        fh.write(f"export const {name.upper()}_PNG = '{uri}';\n")
    preview = atlas.resize((atlas.width * 4, atlas.height * 4), Image.NEAREST)
    bgimg = Image.new('RGBA', preview.size, (60, 50, 80, 255)); bgimg.alpha_composite(preview)
    bgimg.save(f'art/out/{name}-preview.png')
    print(f'{name}: {len(frames)} fotogramas, escala {scale:.3f}, atlas {atlas.size}, {len(uri) // 1024} KB')

if __name__ == '__main__':
    main()
