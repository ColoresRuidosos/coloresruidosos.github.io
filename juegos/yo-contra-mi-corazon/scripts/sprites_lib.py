# Sprites de «Yo contra mi corazón»: dibujados por código a 1x, contorno oscuro + 3 tonos.
# Lo usan scripts/atlas.py (atlas del juego) y scripts/hoja_concepto.py (hoja de concepto).
import re, sys, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont

OL = (26, 10, 22, 255)
def rgba(c): return tuple(c) + (255,) if len(c) == 3 else c

def shift(m, dx, dy):
    o = np.zeros_like(m); h, w = m.shape
    ys = slice(max(dy,0), h+min(dy,0)); yd = slice(max(-dy,0), h+min(-dy,0))
    xs = slice(max(dx,0), w+min(dx,0)); xd = slice(max(-dx,0), w+min(-dx,0))
    o[ys, xs] = m[yd, xd]; return o

class Off:
    """ImageDraw con desplazamiento vertical."""
    def __init__(s, d, dy): s.d, s.dy = d, dy
    def _p(s, pts):
        if isinstance(pts, tuple) and len(pts) == 4 and all(isinstance(v, (int, float)) for v in pts):
            return (pts[0], pts[1]+s.dy, pts[2], pts[3]+s.dy)
        if isinstance(pts, tuple) and len(pts) == 2 and all(isinstance(v, (int, float)) for v in pts): return (pts[0], pts[1]+s.dy)
        return [(x, y+s.dy) for x, y in pts]
    def __getattr__(s, n):
        f = getattr(s.d, n)
        return lambda xy, *a, **k: f(s._p(xy), *a, **k)

class Spr:
    def __init__(s, w, h): s.w, s.h = w, h; s.a = np.zeros((h, w, 4), np.uint8)
    Y = 0
    def mask(s, fn):
        im = Image.new('L', (s.w, s.h)); fn(Off(ImageDraw.Draw(im), s.Y)); return np.array(im) > 127
    def part(s, fn, base, dark=None, light=None, k=3, kl=3, line=True, pattern=None, pcol=None, m=None):
        if m is None: m = s.mask(fn)
        col = np.zeros((s.h, s.w, 4), np.uint8); col[:] = rgba(base)
        if pattern is not None:
            yy, xx = np.mgrid[0:s.h, 0:s.w]; col[pattern(xx, yy)] = rgba(pcol)
        if dark: col[m & ~shift(m, -k, -k)] = rgba(dark)
        if light: col[m & ~shift(m, kl, kl) & shift(m, -1, -1)] = rgba(light)
        if line:
            er = m & shift(m,1,0) & shift(m,-1,0) & shift(m,0,1) & shift(m,0,-1)
            col[m & ~er] = OL
        s.a[m] = col[m]; return m
    def draw(s, fn):
        im = Image.fromarray(s.a, 'RGBA'); fn(Off(ImageDraw.Draw(im), s.Y)); s.a = np.array(im)
    def img(s): return Image.fromarray(s.a, 'RGBA')

# ---------- CORAZÓN (diseño propio: corazón anatómico de caricatura) ----------
RED = ((206,38,62), (136,18,48), (246,104,116))
RED_HOT = ((240,70,80), (170,30,54), (255,150,150))
BLUE = ((64,96,186), (36,54,120), (120,150,230))
PINK = ((222,92,112), (150,40,70), (250,150,160))
YEL = (255, 226, 92)

def fist(S, cx, cy, r, pal):
    S.part(lambda d: d.ellipse((cx-r, cy-r, cx+r, cy+r), 255), *pal, k=2, kl=2)
    S.draw(lambda d: [d.line((cx-r//2+i*(r//2), cy-r+2, cx-r//2+i*(r//2), cy-r//3), fill=OL) for i in range(3)])

HEART_POSES = ['idle', 'avisoIzq', 'avisoDer', 'golpeIzq', 'golpeDer', 'avisoLatido', 'avisoAorta', 'dano']
ALIAS = {'aviso': 'avisoDer', 'golpe': 'golpeDer', 'parchado': 'idle', 'roto': 'idle'}

def glow(S, m, n=3, col=YEL):
    g = m.copy()
    for _ in range(n): g = g | shift(g,1,0) | shift(g,-1,0) | shift(g,0,1) | shift(g,0,-1)
    S.a[g & ~m & (S.a[..., 3] == 0)] = rgba(col)

def heart(pose='idle'):
    """Corazón de 100×108. Las poses «Izq/Der» son del lado de la pantalla por el que viene el golpe."""
    concept = pose
    pose = ALIAS.get(pose, pose)
    S = Spr(100, 108); ox = 2
    aviso = pose.startswith('aviso')
    pal = RED_HOT if aviso else RED
    mx = lambda x: 100 - x
    # piernas y pies
    for lx in (34, 56):
        S.part(lambda d, lx=lx: d.rectangle((lx+ox, 86, lx+ox+8, 98), 255), pal[1], None, pal[0])
        S.part(lambda d, lx=lx: d.ellipse((lx+ox-3, 95, lx+ox+11, 104), 255), (70,14,34), None, (120,30,50))
    # vasos: aorta (rosa), vena (azul), arteria pequeña
    aorta = lambda d: d.line([(46+ox,34),(44+ox,14),(38+ox,7),(29+ox,8),(26+ox,16)], 255, 9, joint='curve')
    if pose == 'avisoAorta':
        glow(S, S.mask(aorta), 3)
    pk = ((255,150,120), (190,60,70), (255,210,170)) if pose == 'avisoAorta' else PINK
    S.part(aorta, *pk, k=2, kl=2)
    S.draw(lambda d: d.ellipse((21+ox,13,31+ox,20), (110,20,46,255), OL))
    S.part(lambda d: d.line([(58+ox,30),(61+ox,9)], 255, 8), *BLUE, k=2, kl=2)
    S.draw(lambda d: d.ellipse((57+ox,5,66+ox,11), (22,30,80,255), OL))
    S.part(lambda d: d.line([(66+ox,32),(73+ox,17)], 255, 6), *PINK, k=2, kl=2)
    S.draw(lambda d: d.ellipse((70+ox,14,77+ox,19), (110,20,46,255), OL))
    # cuerpo
    def body(d):
        d.ellipse((8+ox,22,54+ox,68), 255); d.ellipse((42+ox,22,88+ox,68), 255)
        d.polygon([(10+ox,52),(86+ox,52),(48+ox,98)], 255)
    if pose in ('avisoIzq', 'avisoDer', 'avisoLatido'):
        glow(S, S.mask(body), 3)
    S.part(body, *pal, k=5, kl=3)
    # venas y brillo
    def veins(d):
        c = (255,200,90,255) if pose == 'avisoLatido' else (120,24,70,255)
        w = 2 if pose == 'avisoLatido' else 1
        d.line([(20+ox,38),(25+ox,48),(22+ox,58)], c, w); d.line([(25+ox,48),(32+ox,52)], c, w)
        d.line([(78+ox,38),(72+ox,48),(76+ox,58)], c, w); d.line([(72+ox,48),(66+ox,50)], c, w)
        d.line([(46+ox,84),(50+ox,90)], c, w)
        d.ellipse((15+ox,29,24+ox,36), (255,196,196,255))
        d.point((27+ox,31), (255,230,230,255))
    S.draw(veins)
    # cara
    def face(d):
        if pose == 'dano':
            d.line([(31+ox,48),(41+ox,53),(31+ox,57)], OL, 2); d.line([(65+ox,48),(55+ox,53),(65+ox,57)], OL, 2)
            d.polygon([(38+ox,64),(58+ox,64),(55+ox,74),(41+ox,74)], (70,8,24,255), OL)
            d.rectangle((44+ox,64,52+ox,66), (240,240,240,255))
            return
        pupil = YEL + (255,) if aviso else (20,10,20,255)
        d.ellipse((29+ox,45,44+ox,59), (250,250,245,255), OL); d.ellipse((52+ox,45,67+ox,59), (250,250,245,255), OL)
        d.rectangle((38+ox,50,42+ox,56), pupil); d.rectangle((54+ox,50,58+ox,56), pupil)
        if aviso:
            d.rectangle((39+ox,51,41+ox,52), (255,255,255,255)); d.rectangle((55+ox,51,57+ox,52), (255,255,255,255))
        d.polygon([(25+ox,40),(47+ox,48),(47+ox,52),(25+ox,45)], OL)
        d.polygon([(71+ox,40),(49+ox,48),(49+ox,52),(71+ox,45)], OL)
        if pose == 'avisoLatido':  # aprieta los dientes: se infla
            d.rectangle((38+ox,66,58+ox,72), (250,250,250,255), OL); d.line([(38+ox,69),(58+ox,69)], OL)
            return
        d.polygon([(36+ox,73),(41+ox,66),(55+ox,66),(60+ox,73),(55+ox,70),(41+ox,70)], (70,8,24,255), OL)
        d.polygon([(41+ox,67),(45+ox,67),(43+ox,72)], (255,255,255,255), OL)
        d.polygon([(51+ox,67),(55+ox,67),(53+ox,72)], (255,255,255,255), OL)
    S.draw(face)
    # brazos y puños
    def low(side):
        if side == 'L':
            S.part(lambda d: d.line([(12+ox,62),(24+ox,78)], 255, 7), pal[1], None, pal[0]); fist(S, 24+ox, 80, 8, pal)
        else:
            S.part(lambda d: d.line([(84+ox,62),(72+ox,78)], 255, 7), pal[1], None, pal[0]); fist(S, 72+ox, 80, 8, pal)
    def raised(side):
        f = (lambda x: x) if side == 'R' else mx
        S.part(lambda d: d.line([(f(84+ox),58),(f(92+ox),40)], 255, 7), pal[1], None, pal[0]); fist(S, f(90+ox), 36, 8, pal)
        S.draw(lambda d: [d.line((f(p[0][0]), p[0][1], f(p[1][0]), p[1][1]), YEL+(255,), 1) for p in [((80+ox,22),(84+ox,27)),((90+ox,18),(90+ox,24)),((98,24),(95,28))]])
    def punch(side):
        f = (lambda x: x) if side == 'R' else mx
        S.part(lambda d: d.line([(f(82+ox),60),(f(60+ox),74)], 255, 9), pal[1], None, pal[0])
        fist(S, f(54+ox), 80, 17, pal)
        S.draw(lambda d: [d.line((f(p[0][0]), p[0][1], f(p[1][0]), p[1][1]), (255,255,255,255), 1) for p in [((28,96),(36,90)),((80,100),(72,94)),((54+ox,104),(54+ox,98)),((22,70),(30,72))]])
    if pose in ('idle', 'avisoLatido', 'avisoAorta'):
        low('L'); low('R')
    elif pose == 'avisoDer': low('L'); raised('R')
    elif pose == 'avisoIzq': low('R'); raised('L')
    elif pose == 'golpeDer': low('L'); punch('R')
    elif pose == 'golpeIzq': low('R'); punch('L')
    elif pose == 'dano':
        S.part(lambda d: d.line([(12+ox,62),(4+ox,48)], 255, 7), pal[1], None, pal[0]); fist(S, 4+ox, 46, 7, pal)
        S.part(lambda d: d.line([(84+ox,62),(94,48)], 255, 7), pal[1], None, pal[0]); fist(S, 93, 46, 7, pal)
        def fx(d):
            rnd = random.Random(3)
            for _ in range(16):
                x, y = rnd.randrange(2, 98), rnd.randrange(14, 70)
                c = rnd.choice([(255,226,92),(120,220,255),(255,120,200),(255,255,255)])
                d.rectangle((x, y, x+1, y+2 if rnd.random()<.5 else y+1), c+(255,))
            for sx, sy in ((14,24),(84,26)):
                d.polygon([(sx,sy-4),(sx+1,sy-1),(sx+4,sy),(sx+1,sy+1),(sx,sy+4),(sx-1,sy+1),(sx-4,sy),(sx-1,sy-1)], YEL+(255,))
        S.draw(fx)
    im = S.img()
    if concept == 'parchado': im.alpha_composite(curitas())
    if concept == 'roto': im = split(im)
    return im

def curitas():
    """Capa de la fase 2: curitas en X, costura y gota de sudor (va encima de cualquier pose)."""
    S = Spr(100, 108); ox = 2
    def f(d):
        band = (232,196,150,255)
        d.polygon([(14+ox,36),(18+ox,32),(36+ox,46),(32+ox,50)], band, OL)
        d.polygon([(14+ox,46),(32+ox,32),(36+ox,36),(18+ox,50)], band, OL)
        d.rectangle((23+ox,39,27+ox,43), (210,170,130,255))
        d.line([(64+ox,28),(80+ox,44)], OL, 1)
        for t in range(5): x0 = 66+ox+t*3; y0 = 30+t*3; d.line([(x0-2,y0+2),(x0+2,y0-2)], OL, 1)
        d.ellipse((82+ox,48,86+ox,54), (150,200,255,255), OL)
    S.draw(f); return S.img()

def split(im, gap=3):
    """Fase 3 (solo para la hoja; en el juego se parte por código)."""
    a = np.array(im); o = np.zeros_like(a)
    for y in range(a.shape[0]):
        if y <= 20: o[y] = a[y]; continue
        zx = 50 + (3 if (y//6) % 2 else -3)
        o[y, 0:zx-gap] = a[y, gap:zx]; o[y, zx+gap:] = a[y, zx:100-gap]
        o[y, zx-gap-1] = OL if o[y, zx-gap-1, 3] else o[y, zx-gap-1]
        o[y, zx+gap] = OL if o[y, zx+gap, 3] else o[y, zx+gap]
    return Image.fromarray(o, 'RGBA')

# ---------- PAYASO (de espaldas, vista del jugador) ----------
WHITE = ((238,234,226), (168,164,172), (255,255,255))
BLACK = ((40,34,44), (18,14,22), (86,78,96))
SKIN = ((232,184,150), (186,128,102), (250,210,180))
HAIR = ((50,34,32), (26,16,18), (104,74,64))
WOOD = ((190,130,74), (128,82,44), (228,178,114))
NAIL = (196,202,214,255)

CLOWN_POSES = ['listo', 'esquivaIzq', 'esquivaDer', 'agachado', 'batazo', 'impacto', 'grito', 'golpeado']

def clown(pose='idle'):
    """Payaso de espaldas, 100×126 (la cabeza queda en x≈48)."""
    pose = {'idle': 'listo', 'esquiva': 'esquivaIzq'}.get(pose, pose)
    if pose == 'agachado':
        a = np.array(clown('listo')); o = np.zeros_like(a)
        o[10:96] = a[0:86]; o[96:] = a[96:]   # quita 10 filas de piernas
        return Image.fromarray(o, 'RGBA')
    if pose == 'golpeado':
        im = clown('listo'); a = np.array(im).astype(np.int16)
        m = a[..., 3] > 0
        a[m, 0] = np.minimum(255, a[m, 0] + 90); a[m, 1] = a[m, 1] * 0.6; a[m, 2] = a[m, 2] * 0.6
        im = Image.fromarray(a.astype(np.uint8), 'RGBA'); d = ImageDraw.Draw(im)
        for sx, sy in ((30, 12), (48, 6), (66, 12)):
            d.polygon([(sx,sy-4),(sx+1,sy-1),(sx+4,sy),(sx+1,sy+1),(sx,sy+4),(sx-1,sy+1),(sx-4,sy),(sx-1,sy-1)], YEL+(255,), OL)
        return im
    S = Spr(100, 126); S.Y = 20; ox = {'esquivaIzq': 6, 'esquivaDer': 22}.get(pose, 16)
    lean = {'listo': 0, 'esquivaIzq': -7, 'esquivaDer': 7, 'batazo': 3, 'impacto': -3, 'grito': 0}[pose]
    hx = ox + lean; tx = ox + lean // 2
    late = []
    stripes = lambda xx, yy: (yy // 3) % 2 == 0
    checks = lambda xx, yy: ((xx // 4) + (yy // 4)) % 2 == 0
    # piernas (una a cuadros, otra a rayas, como en la referencia)
    S.part(lambda d: d.polygon([(14+ox,62),(31+ox,62),(25+ox,92),(9+ox,92)], 255), *WHITE, pattern=checks, pcol=(30,26,34))
    S.part(lambda d: d.polygon([(33+ox,62),(50+ox,62),(55+ox,92),(39+ox,92)], 255), *WHITE, pattern=stripes, pcol=(30,26,34))
    def holanes(d):
        for x0 in (8+ox, 38+ox):
            pts = [(x0+i*3, 90 + (3 if i % 2 else 0)) for i in range(7)]
            d.line(pts, (250,250,250,255), 2)
    S.draw(holanes)
    S.part(lambda d: d.polygon([(7+ox,93),(26+ox,93),(27+ox,101),(4+ox,101)], 255), *BLACK, k=2)
    S.part(lambda d: d.polygon([(38+ox,93),(57+ox,93),(60+ox,101),(37+ox,101)], 255), *BLACK, k=2)
    # torso: chaleco negro con costuras + holán en la cintura
    S.part(lambda d: d.polygon([(15+tx,34),(49+tx,34),(51+tx,64),(13+tx,64)], 255), *BLACK, k=4)
    def costuras(d):
        for y in range(40, 60, 6): d.line([(31+tx,y),(33+tx,y)], (120,112,130,255))
        d.line([(32+tx,36),(32+tx,62)], (70,62,80,255))
        d.point((22+tx,46), (150,30,40,255)); d.point((42+tx,52), (150,30,40,255)); d.point((24+tx,56), (150,30,40,255))
    S.draw(costuras)
    S.part(lambda d: d.polygon([(12+tx,60)] + [(12+tx+i*4, 64+(3 if i % 2 else 0)) for i in range(11)] + [(52+tx,60)], 255), *WHITE, k=2)
    # brazos según pose
    def arm(pts, w=8):
        # como en las referencias: la manga del brazo del bate es a cuadros y la otra a rayas
        pat = checks if pts[0][0] - tx > 32 else stripes
        S.part(lambda d: d.line(pts, 255, w, joint='curve'), *WHITE, k=2, pattern=pat, pcol=(30,26,34))
    def hand(x, y):
        S.part(lambda d: d.ellipse((x-4, y-4, x+4, y+4), 255), *SKIN, k=2, kl=2)
    def bat(x0, y0, x1, y1):
        ang = math.atan2(y1-y0, x1-x0); nx, ny = -math.sin(ang), math.cos(ang)
        p = lambda t, w: (x0 + (x1-x0)*t + nx*w, y0 + (y1-y0)*t + ny*w)
        poly = [p(0, 2), p(0.45, 2.5), p(1, 5), p(1, -5), p(0.45, -2.5), p(0, -2)]
        S.part(lambda d: d.polygon(poly, 255), *WOOD, k=2, kl=2)
        def clavos(d):
            for t in (0.6, 0.72, 0.84, 0.95):
                for sgn in (1, -1):
                    a = p(t, sgn*4.5); b = p(t, sgn*8)
                    d.line([a, b], NAIL, 1)
            d.line([p(0.05, 0), p(0.22, 0)], (60,40,30,255), 3)  # cinta del mango
        S.draw(clavos)
    def mic(x, y, up=True):
        S.draw(lambda d: d.line([(x, y), (x-2, y-9 if up else y+9)], (20,20,24,255), 3))
        cy = y-11 if up else y+11
        S.part(lambda d: d.ellipse((x-6, cy-3, x+1, cy+4), 255), (150,150,160), (90,90,100), (210,210,220), k=1, kl=1)
    if pose in ('listo', 'esquivaIzq', 'esquivaDer'):
        arm([(16+tx,38),(8+tx,52),(12+tx,60)]); hand(12+tx, 62); mic(12+tx, 60)
        bat(56+tx, 58, 68+tx, 8)
        arm([(48+tx,38),(56+tx,50),(54+tx,58)]); hand(55+tx, 59)
    elif pose == 'batazo':
        arm([(16+tx,38),(8+tx,52),(12+tx,60)]); hand(12+tx, 62); mic(12+tx, 60)
        def raise_bat():
            arm([(48+tx,38),(58+tx,26),(54+tx,14)]); hand(54+tx, 13)
            bat(54+tx, 14, 30+tx, -16)
            S.draw(lambda d: [d.arc((6+tx, -26, 70+tx, 34), a, a+16, (255,255,255,255), 1) for a in (200, 222, 244)])
        late.append(raise_bat)
    elif pose == 'impacto':
        # contacto: el bate cruza al frente, de la mano derecha hacia arriba a la izquierda (hacia el corazón)
        arm([(16+tx,38),(10+tx,50),(14+tx,58)]); hand(14+tx, 60); mic(14+tx, 58)
        def swing():
            arm([(48+tx,38),(54+tx,22),(46+tx,10)]); hand(46+tx, 9)
            bat(46+tx, 10, 16+tx, -17)
            S.draw(lambda d: [d.line([(54+tx+i*4, -6+i*6), (66+tx+i*4, -12+i*6)], (255,255,255,255), 1) for i in range(3)])
        late.append(swing)
    elif pose == 'grito':
        bat(56+tx, 58, 68+tx, 8)
        arm([(48+tx,38),(56+tx,50),(54+tx,58)]); hand(55+tx, 59)
        def raise_mic():
            arm([(16+tx,38),(6+tx,24),(10+tx,10)]); hand(10+tx, 9); mic(10+tx, 8)
            S.draw(lambda d: [d.arc((-4+tx-i*6, -18-i*5, 18+tx+i*6, 0+i*5), 220, 330, YEL+(255,), 1) for i in range(3)])
        late.append(raise_mic)
    # gorguera (holán grande del cuello)
    cx, cy = 32+hx, 33
    pts = []
    for i in range(28):
        a = i / 28 * 2 * math.pi; r = 1.0 if i % 2 == 0 else 0.72
        pts.append((cx + math.cos(a)*23*r, cy + math.sin(a)*9*r))
    S.part(lambda d: d.polygon(pts, 255), *WHITE, k=3)
    S.draw(lambda d: [d.point((cx+dx, cy+dy), (150,30,40,255)) for dx, dy in ((-12,2),(9,4),(14,-1))])
    # cabeza de espaldas: pelo peinado hacia atrás y orejas
    S.part(lambda d: d.ellipse((17+hx,15,23+hx,24), 255), *SKIN, k=1, kl=1)
    S.part(lambda d: d.ellipse((41+hx,15,47+hx,24), 255), *SKIN, k=1, kl=1)
    S.part(lambda d: d.ellipse((20+hx,2,44+hx,30), 255), *HAIR, k=4)
    S.draw(lambda d: [d.line([(26+hx+i*4,6),(25+hx+i*4,22)], (110,80,70,255)) for i in range(4)])
    for f in late: f()
    if pose == 'esquivaIzq':
        S.draw(lambda d: [d.line([(80,30+i*14),(92,30+i*14)], (255,255,255,255)) for i in range(4)])
    if pose == 'esquivaDer':
        S.draw(lambda d: [d.line([(4,30+i*14),(16,30+i*14)], (255,255,255,255)) for i in range(4)])
    return S.img()

def clown_face():
    S = Spr(30, 30)
    S.part(lambda d: d.ellipse((5,3,25,28), 255), (240,238,232), (196,192,196), (255,255,255), k=2, kl=2)
    S.part(lambda d: (d.ellipse((5,0,25,11), 255), d.polygon([(5,6),(25,6),(15,10)], 255)), *HAIR, k=2)
    def f(d):
        R = (200,24,36,255)
        d.polygon([(10,3),(12,13),(10,19),(8,13)], R); d.polygon([(20,3),(22,13),(20,19),(18,13)], R)
        d.rectangle((9,13,11,15), OL); d.rectangle((19,13,21,15), OL)
        d.line([(7,11),(12,13)], OL); d.line([(23,11),(18,13)], OL)
        d.ellipse((12,15,18,21), (230,20,34,255), OL); d.point((14,16), (255,170,170,255))
        d.polygon([(7,21),(15,25),(23,21),(21,25),(15,27),(9,25)], R)
        d.line([(9,23),(21,23)], (255,255,255,255)); d.line([(8,22),(22,22)], OL)
        d.point((11,24), (255,255,255,255)); d.point((19,24), (255,255,255,255))  # colmillos
    S.draw(f); return S.img()

def heart_icon():
    S = Spr(30, 30)
    S.part(lambda d: (d.ellipse((2,6,16,20),255), d.ellipse((14,6,28,20),255), d.polygon([(3,15),(27,15),(15,28)],255)), *RED, k=2, kl=2)
    S.draw(lambda d: (d.polygon([(6,10),(13,13),(13,14),(6,12)], OL), d.polygon([(24,10),(17,13),(17,14),(24,12)], OL),
                      d.rectangle((10,13,12,15), OL), d.rectangle((18,13,20,15), OL), d.line([(11,21),(15,19),(19,21)], OL)))
    return S.img()

# ---------- ESCENARIO + MAQUETA DE PANTALLA (180x320, vertical) ----------
def stage():
    W, H = 180, 320; im = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(im)
    for y in range(H):
        t = min(y / 230, 1); c = tuple(int(a + (b-a)*t) for a, b in zip((14,12,40), (52,30,92)))
        d.line([(0,y),(W,y)], c + (255,))
    rnd = random.Random(7)
    for _ in range(9):  # murciélagos
        x, y = rnd.randrange(16, 160), rnd.randrange(40, 110)
        d.polygon([(x,y),(x+3,y-2),(x+4,y),(x+5,y-2),(x+8,y),(x+5,y+1),(x+4,y+2),(x+3,y+1)], (10,8,20,255))
    for i in range(6):  # telaraña
        d.line([(0,36),(30 - i*5, 36 + i*6)], (90,84,120,255))
    for r in (8, 16, 24): d.arc((-r, 36-r, r, 36+r), 270, 90, (90,84,120,255))
    # haz de luz
    beam = Image.new('RGBA', (W, H)); bd = ImageDraw.Draw(beam)
    bd.polygon([(78,36),(102,36),(150,240),(30,240)], (180,170,255,36)); im = Image.alpha_composite(im, beam); d = ImageDraw.Draw(im)
    # amplis
    for x0 in (14, 140):
        for j in range(2):
            y0 = 178 + j*28
            d.rectangle((x0, y0, x0+26, y0+26), (24,22,30,255), OL)
            for gx in range(x0+3, x0+24, 3):
                for gy in range(y0+3, y0+24, 3): d.point((gx, gy), (60,56,72,255))
    # escenario
    d.rectangle((0,232,W,H), (44,30,38,255))
    for y in range(236, H, 9): d.line([(0,y),(W,y)], (30,20,26,255))
    for x in range(0, W, 23): d.line([(x,232),(x - 14,H)], (34,24,30,255))
    fog = Image.new('RGBA', (W, H)); fd = ImageDraw.Draw(fog)
    for i in range(9): fd.ellipse((i*22-20, 236+(i%3)*6, i*22+30, 262+(i%3)*6), (170,160,220,40))
    im = Image.alpha_composite(im, fog); d = ImageDraw.Draw(im)
    for x0, x1, s in ((0, 16, 1), (164, 180, -1)):  # telón
        d.rectangle((x0, 0, x1, H), (104,16,36,255))
        for x in range(x0+2, x1, 4): d.line([(x,0),(x,H)], (70,8,24,255))
    d.rectangle((0,0,W,10), (104,16,36,255)); d.line([(0,10),(W,10)], OL)
    for x in range(0, W, 8): d.polygon([(x,10),(x+8,10),(x+4,14)], (104,16,36,255))
    return im


def crowd(seed=2):
    """Siluetas del público al frente (180×44, va en y=276)."""
    im = Image.new('RGBA', (180, 44)); d = ImageDraw.Draw(im); rnd = random.Random(seed); Y = -276
    for x in range(-6, 186, 13):
        h = rnd.randrange(0, 6); d.ellipse((x, 296-h+Y, x+12, 310-h+Y), (8,6,14,255)); d.rectangle((x-2, 304-h+Y, x+14, 320+Y), (8,6,14,255))
        if rnd.random() < .45: d.line([(x+10, 300-h+Y), (x+14, 280-h+Y)], (8,6,14,255), 3)
    return im
