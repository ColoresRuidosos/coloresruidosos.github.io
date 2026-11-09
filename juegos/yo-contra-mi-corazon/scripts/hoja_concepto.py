# Hoja de concepto. Uso: python3 -I scripts/hoja_concepto.py src/render/font.js art/concepto/hoja-concepto.png
import sys, os, re, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sprites_lib import *
FONTJS = sys.argv[1]; OUT = sys.argv[2]
# ---------- fuente bitmap 5x7 del juego ----------
src = open(FONTJS, encoding='utf8').read()
GL = {}
for k, v in re.findall(r"(?:'([^']+)'|(\w)):\s*G\('([01 ]+)'\)", src) and [(a or b, c) for a, b, c in re.findall(r"(?:'([^']+)'|(\w)):\s*G\('([01 ]+)'\)", src)]:
    GL[k] = v.split(' ')
def text(img, s, x, y, col=(255,255,255), sh=(20,10,25)):
    d = ImageDraw.Draw(img)
    for pass_, c in ((1, sh), (0, col)):
        cx = x
        for ch in s.upper():
            g = GL.get(ch)
            if g:
                for r, row in enumerate(g):
                    for q, b in enumerate(row):
                        if b == '1': d.point((cx+q+pass_, y+r+pass_), fill=c)
            cx += 6
def twidth(s): return 6*len(s)

def mockup(hpose='aviso', cpose='idle'):
    im = stage()
    im.alpha_composite(heart(hpose), (40, 66))
    # público (siluetas al frente)
    d = ImageDraw.Draw(im); rnd = random.Random(2)
    for x in range(-6, 186, 13):
        h = rnd.randrange(0, 6); d.ellipse((x, 296-h, x+12, 310-h), (8,6,14,255)); d.rectangle((x-2, 304-h, x+14, 320), (8,6,14,255))
        if rnd.random() < .45: d.line([(x+10, 300-h), (x+14, 280-h)], (8,6,14,255), 3)
    im.alpha_composite(clown(cpose), (42, 186))
    # HUD
    d.rectangle((0,0,180,34), (10,8,18,230))
    im.alpha_composite(clown_face(), (2, 2)); im.alpha_composite(heart_icon(), (148, 2))
    def bar(x, y, w, frac, col, rev=False):
        d.rectangle((x, y, x+w, y+5), (40,30,50,255), OL)
        fw = int((w-2) * frac)
        if rev: d.rectangle((x+w-1-fw, y+1, x+w-1, y+4), col)
        else: d.rectangle((x+1, y+1, x+1+fw, y+4), col)
    text(im, 'PAYASO', 34, 4); bar(34, 13, 52, .8, (120,230,120,255))
    text(im, 'CORAZÓN', 146 - twidth('CORAZÓN'), 4); bar(94, 13, 52, .45, (240,60,80,255), rev=True)
    text(im, 'PÚBLICO', 34, 22, (255,226,92))
    for i in range(5):
        x = 80 + i*9; c = (255,226,92,255) if i < 3 else (60,50,70,255)
        d.polygon([(x+3,22),(x+4,25),(x+7,25),(x+5,27),(x+6,30),(x+3,28),(x,30),(x+1,27),(x-1,25),(x+2,25)], c)
    text(im, '2:41', 145 - twidth('2:41') + 30, 24)
    # indicador de ritmo
    for i in range(4):
        cx = 72 + i*12; r = 4 if i == 0 else 2
        d.ellipse((cx-r, 44-r, cx+r, 44+r), (255,226,92,255) if i == 0 else (120,110,150,255))
    d.ellipse((66, 38, 78, 50), None, (255,226,92,255))
    # botón de micrófono
    d.ellipse((150, 254, 174, 278), (40,20,60,230), YEL+(255,))
    d.rectangle((160,259,164,267), (200,200,210,255), OL); d.line([(162,268),(162,272)], (200,200,210,255)); d.line([(158,272),(166,272)], (200,200,210,255))
    text(im, '◀ DESLIZA ▶', 90 - twidth('◀ DESLIZA ▶')//2, 302)
    text(im, 'TOCA: BATAZO', 90 - twidth('TOCA: BATAZO')//2, 312, (255,226,92))
    return im

# ---------- HOJA ----------
SC = 3
def up(im, s=SC): return im.resize((im.width*s, im.height*s), Image.NEAREST)
F = lambda sz, b=True: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if b else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', sz)
sheet = Image.new('RGBA', (1980, 1330), (52,50,58,255)); sd = ImageDraw.Draw(sheet)
sd.text((40, 26), 'PAYASO VS. CORAZÓN — hoja de concepto', font=F(40), fill=(255,255,255))
sd.text((40, 78), 'Pixel art 16 bits (misma línea que México vs. José Madero): contorno oscuro, 3 tonos por color, sprites a 1x mostrados a 3x', font=F(20, False), fill=(200,196,210))
mk = up(mockup()); sheet.alpha_composite(mk, (40, 130))
sd.text((40, 130+mk.height+8), 'Pantalla del celular (180×320 px, vertical)', font=F(18), fill=(230,226,240))
X0 = 640
sd.text((X0, 130), 'EL CORAZÓN — diseño propio (corazón anatómico, no un personaje existente)', font=F(22), fill=(255,140,150))
hp = [('idle', 'En guardia'), ('aviso', 'Aviso (brilla)'), ('golpe', 'Golpe'), ('dano', 'Le pegaste'), ('parchado', 'Fase 2: parchado'), ('roto', 'Fase 3: roto')]
for i, (p, lab) in enumerate(hp):
    x = X0 + (i % 3) * 430; y = 170 + (i // 3) * 360
    sheet.alpha_composite(up(heart(p)), (x, y))
    sd.text((x, y + 108*SC + 2), lab, font=F(20), fill=(240,236,246))
Y1 = 940
sd.text((X0, Y1 - 40 + 10), 'EL PAYASO — de espaldas (vista del jugador)', font=F(22), fill=(255,226,120))
cp = [('idle', 'Listo'), ('esquiva', 'Esquiva'), ('batazo', 'Batazo'), ('grito', 'Grito (micrófono)')]
for i, (p, lab) in enumerate(cp):
    x = X0 + i * 240
    sheet.alpha_composite(up(clown(p), 2), (x, Y1 + 10))
    sd.text((x, Y1 + 270), lab, font=F(20), fill=(240,236,246))
sheet.alpha_composite(up(clown_face(), 5), (X0 + 990, Y1 + 40))
sheet.alpha_composite(up(heart_icon(), 5), (X0 + 1150, Y1 + 40))
sd.text((X0 + 990, Y1 + 200), 'Retratos del HUD', font=F(20), fill=(240,236,246))
sheet.convert('RGB').save(OUT)
print('ok', OUT)
