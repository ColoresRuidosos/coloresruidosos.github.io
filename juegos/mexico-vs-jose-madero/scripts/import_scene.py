#!/usr/bin/env python3
"""Importa ilustraciones de escenas (ChatGPT) a la franja de la viñeta: 320×150 px, paleta de 64 colores.
Uso: python3 scripts/import_scene.py <id>=<imagen>[@y0] [...]   →  src/data/scenes-art.js (añade sin borrar)
  y0: primera fila del recorte en la imagen original (por defecto, centrado).
Tapado (spec §3.0f K): en p2 (la Arena) el cartel trae la cara realista del artista, su nombre y el logotipo del
recinto; se tapa con una pantalla genérica y el juego pinta encima el sello JMV (propio).
"""
import base64, io, json, os, re, sys
from PIL import Image, ImageDraw

W, H = 320, 150
OUT = 'src/data/scenes-art.js'
# Polígonos a tapar, en coordenadas de la imagen original 1536×1024 (medidos a mano).
TAPAR = {'p2': [(226, 262), (885, 204), (1298, 262), (1298, 668), (885, 642), (226, 668)]}

out = {}
if os.path.exists(OUT):
    m = re.search(r'export const SCENE_ART = (\{.*\});', open(OUT).read(), re.S)
    if m: out = json.loads(m.group(1))
for arg in sys.argv[1:]:
    sid, rest = arg.split('=', 1)
    src, _, y0 = rest.partition('@')
    im = Image.open(src).convert('RGB')
    entry = {}
    if sid in TAPAR:
        d = ImageDraw.Draw(im)
        poly = TAPAR[sid]
        d.polygon(poly, fill=(26, 16, 44))
        xs = [p[0] for p in poly]; ys = [p[1] for p in poly]
        for y in range(min(ys) + 8, max(ys) - 4, 10):  # líneas de pantalla LED
            d.line([(min(xs) + 6, y), (max(xs) - 6, y)], fill=(44, 30, 72), width=3)
        entry['badgeSrc'] = [(min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2]
    ch = round(im.width * H / W)  # alto del recorte con la proporción de la viñeta
    top = int(y0) if y0 else (im.height - ch) // 2
    top = max(0, min(im.height - ch, top))
    crop = im.crop((0, top, im.width, top + ch)).resize((W, H), Image.LANCZOS)
    crop = crop.quantize(colors=64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    buf = io.BytesIO(); crop.save(buf, 'PNG', optimize=True)
    entry['png'] = 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()
    if 'badgeSrc' in entry:
        bx, by = entry.pop('badgeSrc'); s = W / im.width
        entry['badge'] = [round(bx * s), round((by - top) * s)]
    out[sid] = entry
    os.makedirs('art/out', exist_ok=True)
    crop.resize((W * 3, H * 3), Image.NEAREST).save(f'art/out/escena-{sid}-preview.png')
    print(sid, f'recorte desde y={top}', len(buf.getvalue()) // 1024, 'KB')
with open(OUT, 'w') as fh:
    fh.write('// Generado por scripts/import_scene.py (art/source/escenas/) — no editar a mano.\n')
    fh.write(f'export const SCENE_ART = {json.dumps(out)};\n')
print('escenas:', ', '.join(sorted(out)))
