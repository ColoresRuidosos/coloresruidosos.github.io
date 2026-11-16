# Monta el tráiler de Arde la Torre (16:9 y 9:16) con escenas reales, cortes a compás y el final de «La Torre Picasso».
import glob, json, os, subprocess, sys
from PIL import Image, ImageFilter
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pixfont

GAME = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
T = os.environ.get('TRAILER_DIR', os.path.join(GAME, 'dist', 'trailer'))
os.makedirs(os.path.join(T, 'gfx'), exist_ok=True)
SONG = f'{GAME}/art/source/musica/la-torre-picasso-final.mp3'
BPM, PHASE = 117.45, 0.046
BAR = 4 * 60 / BPM
MUSIC_START = PHASE + 16 * BAR                 # empieza en un primer golpe de compás y acaba con la canción
FPS = 25
marks = json.load(open(f'{T}/raw/marks.json'))
clip = lambda k: glob.glob(f'{T}/raw/{k}/*.webm')[0]
YEL, RED, WHITE, GREY = (255, 210, 63, 255), (163, 36, 44, 255), (255, 255, 255, 255), (207, 201, 224, 255)

# (tipo, fuente, compases, rótulos [(texto, desde_compás, hasta_compás)])
SEGS = [
    ('clip', 'titulo', 2, []),
    ('card', ['LA BANDA SUBE', 'LA TORRE PICASSO'], 1, []),
    ('clip', 'nivel1', 3, [('HASTA 4 JUGADORES', 0, 3)]),
    ('clip', 'nivel2', 2, [('TU MÓVIL ES EL MANDO', 0, 2)]),
    ('clip', 'nivel3', 2, [('PLANTA A PLANTA, A GOLPES', 0, 2)]),
    ('clip', 'jefe', 3, [('CONTRA SILENCIO S.A.', 0, 3)]),
    ('card', ['Y ARRIBA', 'TE ESPERA...'], 1, []),
    ('clip', 'concierto', 5, [('¡EL CONCIERTO EN LA AZOTEA!', 0, 2.5), ('CADA UNO TOCA SU INSTRUMENTO', 2.5, 5)]),
    ('end', None, 3, []),
]
FORMATS = {'16x9': (1920, 1080), '9x16': (1080, 1920)}

def run(cmd): subprocess.run(cmd, check=True)

def card_png(lines, W, H, path, sub=None):
    im = Image.new('RGBA', (W, H), (14, 10, 26, 255))
    sc = 12 if W > H else 10
    y = H // 2 - (len(lines) * 10 * sc) // 2
    for ln in lines:
        while pixfont.width(ln, sc) > W * 0.9: sc -= 1
    for ln in lines:
        pixfont.draw(im, ln, W // 2, y, sc, YEL, RED, 'center'); y += 10 * sc
    im.save(path)

def end_png(W, H, path):
    # fondo: un fotograma del título, oscurecido y desenfocado
    bg = f'{T}/gfx/end-bg.png'
    run(['ffmpeg', '-v', 'error', '-y', '-ss', str(marks['titulo'] + 1), '-i', clip('titulo'), '-frames:v', '1', bg])
    b = Image.open(bg).convert('RGB')
    if W < H:
        s = H / b.height; b = b.resize((int(b.width * s), H)); x0 = (b.width - W) // 2; b = b.crop((x0, 0, x0 + W, H))
    else: b = b.resize((W, H))
    b = b.filter(ImageFilter.GaussianBlur(6)).point(lambda v: int(v * 0.35)).convert('RGBA')
    big = 22 if W > H else 12
    yy = H // 2 - (34 * big) // 2 if W > H else H // 2 - 420
    pixfont.draw(b, 'ARDE LA TORRE', W // 2, yy, big, YEL, RED, 'center')
    sm = 7 if W > H else 6
    lines = ([('BEAT EM UP COOPERATIVO DE 16 BITS', WHITE), ('HASTA 4 JUGADORES · TU MÓVIL ES EL MANDO', WHITE), ('', None), ('PRÓXIMAMENTE', YEL)]
             if W > H else [('BEAT EM UP DE 16 BITS', WHITE), ('HASTA 4 JUGADORES', WHITE), ('TU MÓVIL ES EL MANDO', WHITE), ('', None), ('PRÓXIMAMENTE', YEL)])
    y = yy + 11 * big
    for t, c in lines:
        if t: pixfont.draw(b, t, W // 2, y, sm, c, (0, 0, 0, 255), 'center')
        y += 11 * sm
    pixfont.draw(b, 'HOMENAJE NO OFICIAL · @COLORESRUIDOSOS', W // 2, H - (80 if W > H else 160), 5 if W > H else 4, GREY, (0, 0, 0, 255), 'center')
    b.save(path)

def caption_png(text, W, H, path):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sc = 8 if W > H else 7
    while pixfont.width(text, sc) > W * 0.92: sc -= 1
    tw, th = pixfont.width(text, sc), 7 * sc
    y = H - 190 if W > H else int(H * 0.79)
    band = Image.new('RGBA', (tw + 6 * sc, th + 5 * sc), (14, 10, 26, 215))
    im.alpha_composite(band, ((W - band.width) // 2, y - int(2.5 * sc)))
    im.alpha_composite(Image.new('RGBA', (band.width, sc // 2 + 1), RED), ((W - band.width) // 2, y - int(2.5 * sc)))
    pixfont.draw(im, text, W // 2, y, sc, YEL, RED, 'center')
    im.save(path)

def build(fmt):
    W, H = FORMATS[fmt]
    parts = []
    for i, (kind, src, bars, caps) in enumerate(SEGS):
        dur = bars * BAR
        out = f'{T}/gfx/{fmt}-{i:02d}.mp4'
        if kind == 'clip':
            if W > H: vf = f'scale={W}:{H}:flags=neighbor'
            else:     # vertical: el juego a lo ancho en el centro, con el mismo fotograma desenfocado detrás
                vf = (f'split[a][b];[a]scale=-2:{H},crop={W}:{H},boxblur=24:2,eq=brightness=-0.25[bg];'
                      f'[b]scale={W}:-2:flags=neighbor[fg];[bg][fg]overlay=0:(H-h)/2-140')
            inputs = ['-ss', f'{marks[src]:.3f}', '-t', f'{dur:.3f}', '-i', clip(src)]
            filt = f'[0:v]{vf},fps={FPS},format=rgba[v0]'
            last = 'v0'
            for j, (txt, a, b) in enumerate(caps):
                png = f'{T}/gfx/{fmt}-cap-{i}-{j}.png'; caption_png(txt, W, H, png)
                inputs += ['-i', png]
                filt += f";[{last}][{j + 1}:v]overlay=0:0:enable='between(t,{a * BAR:.3f},{b * BAR:.3f})'[v{j + 1}]"
                last = f'v{j + 1}'
            filt += f';[{last}]format=yuv420p[out]'
            run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', filt, '-map', '[out]', '-r', str(FPS),
                 '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-t', f'{dur:.3f}', out])
        else:
            png = f'{T}/gfx/{fmt}-card-{i}.png'
            if kind == 'card': card_png(src, W, H, png)
            else: end_png(W, H, png)
            fade = f'fade=t=in:st=0:d=0.25' + (f',fade=t=out:st={dur - 1.2:.3f}:d=1.2' if kind == 'end' else '')
            run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-framerate', str(FPS), '-t', f'{dur:.3f}', '-i', png,
                 '-vf', f'{fade},format=yuv420p', '-r', str(FPS), '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', out])
        parts.append(out)
    lst = f'{T}/gfx/{fmt}-list.txt'
    open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
    total = sum(s[2] for s in SEGS) * BAR
    final = f'{T}/arde-la-torre-trailer-{fmt}.mp4'
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-ss', f'{MUSIC_START:.3f}', '-t', f'{total:.3f}', '-i', SONG,
         '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
         '-af', f'afade=t=in:st=0:d=0.3,afade=t=out:st={total - 2:.3f}:d=2', '-movflags', '+faststart', '-shortest', final])
    print(final, f'{total:.1f} s')

import sys
for f in (sys.argv[1:] or FORMATS): build(f)
