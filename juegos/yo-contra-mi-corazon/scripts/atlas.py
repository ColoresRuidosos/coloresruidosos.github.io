# Genera src/data/atlas.js: un PNG (base64) con todos los sprites y el mapa de cuadros.
# Uso: python3 -I scripts/atlas.py
import sys, os, io, base64, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sprites_lib import *

items = [('stage', stage())]
items += [(f'heart.{p}', heart(p)) for p in HEART_POSES]
items += [('heart.curitas', curitas())]
items += [(f'clown.{p}', clown(p)) for p in CLOWN_POSES]
items += [('icon.clown', clown_face()), ('icon.heart', heart_icon()), ('crowd', crowd())]
items += [(f'badge.{b}', badge(b)) for b in BADGE_IDS + ['locked']]

W = 512; x = y = rowh = 0; frames = {}
for name, im in sorted(items, key=lambda it: -it[1].height):
    if x + im.width > W: x, y, rowh = 0, y + rowh + 1, 0
    frames[name] = [x, y, im.width, im.height]; x += im.width + 1; rowh = max(rowh, im.height)
H = y + rowh
atlas = Image.new('RGBA', (W, H))
for name, im in items:
    fx, fy, _, _ = frames[name]; atlas.alpha_composite(im, (fx, fy))
buf = io.BytesIO(); atlas.save(buf, 'PNG', optimize=True)
b64 = base64.b64encode(buf.getvalue()).decode()
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
with open(os.path.join(root, 'src/data/atlas.js'), 'w') as f:
    f.write('// Generado por scripts/atlas.py — no editar a mano.\n')
    f.write(f'export const ATLAS_SIZE = [{W}, {H}];\n')
    f.write('export const FRAMES = ' + json.dumps(frames, separators=(",", ":")) + ';\n')
    f.write(f'export const ATLAS_PNG = "data:image/png;base64,{b64}";\n')
atlas.save('/tmp/claude-0/-home-user/3c872456-79c1-50d4-b792-1b22fb815609/scratchpad/atlas.png')
print(f'atlas {W}×{H}, {len(buf.getvalue())//1024} KB, {len(frames)} cuadros')
