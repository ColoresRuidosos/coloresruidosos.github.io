# Hoja de concepto de los sprites de Alba (spec §3.0f Q v10.3).
# Uso: node scripts/hoja_alba.mjs > alba.json && python3 -I scripts/hoja_alba.py alba.json art/source/alba/concepto-sprites.png
import sys, json, math
from PIL import Image, ImageDraw, ImageFont
data = json.load(open(sys.argv[1])); OUT = sys.argv[2]
F = lambda sz, b=True: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if b else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', sz)

def img(f, s=1):
    im = Image.new('RGBA', (f['w'], f['h']))
    for i, c in enumerate(f['px']):
        if c: im.putpixel((i % f['w'], i // f['w']), tuple(int(c[k:k+2], 16) for k in (1, 3, 5)) + (255,))
    return im.resize((f['w'] * s, f['h'] * s), Image.NEAREST) if s != 1 else im

A = data['alba']; fr = lambda id, key: next(f for f in A[id] if f['key'] == key)
W, H = 1900, 1560
sheet = Image.new('RGBA', (W, H), (46, 42, 54, 255)); d = ImageDraw.Draw(sheet)
d.text((40, 24), 'MUNDO 3 · ALBA — hoja de concepto de sprites', font=F(40), fill='white')
d.text((40, 76), 'Por código, estilo Neo Geo (contorno oscuro + 3 tonos), mismo generador que los invitados de Noche. Mostrados a ×3 y ×4.', font=F(20, False), fill=(200, 196, 210))

# 1. La Nostalgia
d.text((40, 120), 'LA NOSTALGIA (jefe) — flota · lanza · gira · se despide (de sepia a dorado)', font=F(24), fill=(255, 210, 140))
keys = ['flota0', 'flota2', 'lanza0', 'lanza1', 'gira0', 'despide0', 'despide1', 'despide3']
for i, k in enumerate(keys):
    x = 40 + i * 225
    sheet.alpha_composite(img(fr('nostalgia', k), 3), (x, 160))
    d.text((x + 40, 405), k.rstrip('0123'), font=F(18), fill=(230, 226, 240))

# 2. Escena de prueba: fase 2 en la Maldita Rueda, al amanecer
sx, sy, sw, sh = 40, 460, 900, 520
scene = Image.new('RGBA', (sw // 3, sh // 3)); sd = ImageDraw.Draw(scene)
for y in range(scene.height):
    t = y / scene.height
    c = tuple(int(a + (b - a) * t) for a, b in zip((120, 130, 175), (255, 214, 160)))
    sd.line([(0, y), (scene.width, y)], c + (255,))
sd.ellipse((150, 120, 210, 180), (255, 236, 170, 255))  # sol saliendo
sd.rectangle((0, 160, scene.width, scene.height), (236, 226, 206, 255)); sd.line([(0, 160), (scene.width, 160)], (18, 12, 24, 255))
cx, cy, R = 110, 82, 58
sd.ellipse((cx - R, cy - R, cx + R, cy + R), outline=(70, 60, 80, 255), width=2)
for k in range(6):
    a = k * math.pi / 3 + 0.3
    sd.line([(cx, cy), (cx + R * math.cos(a), cy + R * math.sin(a))], (90, 80, 100, 255), 1)
sd.line([(cx, cy), (cx - 22, 160)], (70, 60, 80, 255), 3); sd.line([(cx, cy), (cx + 22, 160)], (70, 60, 80, 255), 3)
for k in range(6):
    a = k * math.pi / 3 + 0.3
    scene.alpha_composite(img(fr('cabina', 'idle0')), (int(cx + R * math.cos(a)) - 10, int(cy + R * math.sin(a)) - 1))
scene.alpha_composite(img(fr('eje', 'idle0')), (cx - 7, cy - 7))
scene.alpha_composite(img(fr('nostalgia', 'gira0')), (scene.width - 70, 74))
scene.alpha_composite(img(fr('atril', 'normal0')), (14, 135))
scene.alpha_composite(img(fr('luz', 'brilla0')), (180, 150))
sheet.alpha_composite(scene.resize((sw, sh), Image.NEAREST), (sx, sy))
d.text((sx, sy + sh + 8), 'Maqueta: fase 2 «La vuelta que siempre vuelve» (la noria se dibuja con líneas en el juego)', font=F(18), fill=(230, 226, 240))

# 3. Objetos y obstáculos
X0 = 990
d.text((X0, 460), 'RECUERDOS (polaroids de tus mundos)', font=F(22), fill=(255, 210, 140))
for i, v in enumerate(['rosa', 'antifaz', 'flash', 'noria']):
    sheet.alpha_composite(img(fr('recuerdo', v + '0'), 4), (X0 + i * 100, 500)); d.text((X0 + i * 100, 584), v, font=F(16), fill=(230, 226, 240))
d.text((X0, 630), 'ESCENARIO Y OBJETOS', font=F(22), fill=(255, 210, 140))
items = [('cabina', 'idle0', 'cabina'), ('eje', 'idle0', 'eje'), ('atril', 'normal0', 'atril'), ('atril', 'leido0', 'leído'), ('luz', 'brilla0', 'Luz del Alba'), ('luz', 'brilla2', '')]
x = X0
for id, k, lab in items:
    im = img(fr(id, k), 4); sheet.alpha_composite(im, (x, 670)); d.text((x, 784), lab, font=F(16), fill=(230, 226, 240)); x += im.width + 30
items = [('plataforma', 'on0', 'plataforma'), ('plataforma', 'off0', '(apagada)'), ('banca', 'idle0', 'banca'), ('caballito', 'idle0', 'caballito'), ('diana', 'parada0', 'diana'), ('diana', 'caida0', 'caída')]
x = X0
for id, k, lab in items:
    im = img(fr(id, k), 4); sheet.alpha_composite(im, (x, 830)); d.text((x, 945), lab, font=F(16), fill=(230, 226, 240)); x += max(im.width, int(d.textlength(lab, font=F(16)))) + 24

# 4. Los de septiembre
d.text((40, 1040), '«LOS DE SEPTIEMBRE»: los invitados de Noche, ya sin disfraz, caminan contigo un tramo (sprites que ya existen)', font=F(22), fill=(255, 210, 140))
for i, (id, f) in enumerate(data['septiembre'].items()):
    sheet.alpha_composite(img(f, 4), (40 + i * 170, 1080))
d.text((40, 1310), 'Pepe usa el traje clásico (camisa blanca) que ya existe. Los recuerdos de los jefes en la fase 1 son el Flash-Bot y el Enmascarado pasados a sepia.', font=F(20, False), fill=(200, 196, 210))
sheet.convert('RGB').save(OUT); print('ok', OUT)
