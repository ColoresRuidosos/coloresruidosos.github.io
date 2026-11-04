#!/usr/bin/env python3
"""Convierte escenas completas (Gemini / ChatGPT) en fondos panorámicos del juego (224 px de alto, paleta reducida).
Uso: python3 scripts/import_backdrop.py [--gris] <tema>=<imagen> [...]   →  src/data/backdrops-w1.js
v9: AÑADE o sustituye los temas indicados y conserva los demás (antes reescribía el archivo entero).
--gris: pasa la imagen a escala de grises (mundo Noche).
"""
import base64, io, json, os, re, sys
from PIL import Image

H = 224
OUT = 'src/data/backdrops-w1.js'
args = sys.argv[1:]
gray = '--gris' in args
args = [a for a in args if a != '--gris']
out = {}
if os.path.exists(OUT):
    m = re.search(r'export const BACKDROPS = (\{.*\});', open(OUT).read(), re.S)
    if m: out = json.loads(m.group(1))
for arg in args:
    name, src = arg.split('=', 1)
    im = Image.open(src).convert('RGB')
    if gray: im = im.convert('L').convert('RGB')
    w = round(im.width * H / im.height)
    small = im.resize((w, H), Image.LANCZOS)
    # Paleta de 64 colores sin tramado: aspecto 16 bits y PNG ligero.
    small = small.quantize(colors=64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    buf = io.BytesIO(); small.save(buf, 'PNG', optimize=True)
    out[name] = {'w': w, 'h': H, 'png': 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()}
    os.makedirs('art/out', exist_ok=True)
    small.resize((w * 3, H * 3), Image.NEAREST).save(f'art/out/backdrop-{name}-preview.png')
    print(name, (w, H), len(buf.getvalue()) // 1024, 'KB')
with open(OUT, 'w') as fh:
    fh.write('// Generado por scripts/import_backdrop.py (art/source/*) — no editar a mano.\n')
    fh.write(f'export const BACKDROPS = {json.dumps(out)};\n')
print('temas:', ', '.join(out))
