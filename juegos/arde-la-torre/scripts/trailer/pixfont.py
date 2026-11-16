# Dibuja texto con la fuente pixelada del juego (src/render/font.js) en imágenes PIL.
import os, re
from PIL import Image
SRC = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'render', 'font.js'), encoding='utf-8').read()
GLYPHS = {}
for k, v in re.findall(r"(?:'([^']+)'|(\w))\s*:\s*G\('([01 ]+)'\)", SRC) and [(a or b, c) for a, b, c in re.findall(r"(?:'([^']+)'|(\w))\s*:\s*G\('([01 ]+)'\)", SRC)]:
    GLYPHS[k] = v.split(' ')
AGUDO = [(3, -2), (2, -1)]
ACCENT = {'Á': ('A', AGUDO), 'É': ('E', AGUDO), 'Í': ('I', AGUDO), 'Ó': ('O', AGUDO), 'Ú': ('U', AGUDO)}

def width(s, scale): return (len(s) * 6 - 1) * scale if s else 0

def draw(im, s, x, y, scale, color, shadow=(0, 0, 0, 255), align='left'):
    s = s.upper()
    w = width(s, scale)
    if align == 'center': x -= w // 2
    elif align == 'right': x -= w
    px = im.load()
    def put(cx, cy, col):
        for dy in range(scale):
            for dx in range(scale):
                xx, yy = cx + dx, cy + dy
                if 0 <= xx < im.width and 0 <= yy < im.height: px[xx, yy] = col
    for col, off in ([(shadow, scale)] if shadow else []) + [(color, 0)]:
        cx = x + off
        for ch in s:
            rows, extra = GLYPHS.get(ch), []
            if rows is None and ch in ACCENT: rows, extra = GLYPHS[ACCENT[ch][0]], ACCENT[ch][1]
            if rows:
                for r in range(7):
                    for c in range(5):
                        if rows[r][c] == '1': put(cx + c * scale, y + off + r * scale, col)
                for c, r in extra: put(cx + c * scale, y + off + r * scale, col)
            cx += 6 * scale
    return w
