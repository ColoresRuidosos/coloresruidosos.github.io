#!/usr/bin/env python3
"""Convierte escenas completas de Gemini en fondos panorámicos del juego (224 px de alto, paleta reducida).
Uso: python3 scripts/import_backdrop.py <tema>=<imagen> [...]   →  src/data/backdrops-w1.js
"""
import base64, io, json, sys
from PIL import Image

H = 224
out = {}
for arg in sys.argv[1:]:
    name, src = arg.split('=', 1)
    im = Image.open(src).convert('RGB')
    w = round(im.width * H / im.height)
    small = im.resize((w, H), Image.LANCZOS)
    # Paleta de 64 colores sin tramado: aspecto 16 bits y PNG ligero.
    small = small.quantize(colors=64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    buf = io.BytesIO(); small.save(buf, 'PNG', optimize=True)
    out[name] = {'w': w, 'h': H, 'png': 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()}
    small.resize((w * 3, H * 3), Image.NEAREST).save(f'art/out/backdrop-{name}-preview.png')
    print(name, (w, H), len(buf.getvalue()) // 1024, 'KB')
with open('src/data/backdrops-w1.js', 'w') as fh:
    fh.write('// Generado por scripts/import_backdrop.py desde art/source/carmesi/ — no editar a mano.\n')
    fh.write(f'export const BACKDROPS = {json.dumps(out)};\n')
