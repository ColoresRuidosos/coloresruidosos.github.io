# Prepara los fondos de Gemini para el juego (art/source/fondos/*.png → src/data/fondo-<nivel>.js).
#   python3 -I scripts/fondos.py
# La línea donde empieza el suelo en la imagen (`suelo`, fracción de la altura) se lleva a la del juego (HORIZON = 124 px),
# así los personajes pisan el suelo dibujado. Se oscurece un poco para que los personajes resalten.
# El juego repite la imagen en espejo hasta cubrir el ancho del nivel; la azotea (arena) se recorta centrada en el escenario.
import base64, io, os
from PIL import Image, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
H, HORIZON = 216, 124
ZOOM = 0.75   # v2 (15 nov): los fondos se veían demasiado grandes junto a los músicos («parecen enanos»)

FONDOS = {
    'parking':   dict(file='parking.png',   suelo=0.70),
    'vestibulo': dict(file='vestibulo.png', suelo=0.66),
    'oficinas':  dict(file='oficinas.png',  suelo=0.68),
    'azotea':    dict(file='azotea.png',    suelo=0.74, centro=0.62),   # centro del escenario (fracción del ancho)
}


def build(nivel, cfg):
    im = Image.open(os.path.join(ROOT, 'art', 'source', 'fondos', cfg['file'])).convert('RGB')
    w, h = im.size
    s = (H - HORIZON) / (h * (1 - cfg['suelo'])) * ZOOM
    sw, sh = round(w * s), round(h * s)
    im = im.resize((sw, sh), Image.BOX)
    top = HORIZON - round(cfg['suelo'] * h * s)          # dónde cae el borde superior de la imagen en el juego
    canvas = Image.new('RGB', (sw, H))
    canvas.paste(im, (0, top))
    bottom = top + sh
    if bottom < H:                                       # suelo prolongado: espejo de la franja inferior
        strip = im.crop((0, sh - (H - bottom), sw, sh)).transpose(Image.FLIP_TOP_BOTTOM)
        canvas.paste(strip, (0, bottom))
    if top > 0:                                          # techo prolongado: espejo de la franja superior
        strip = im.crop((0, 0, sw, top)).transpose(Image.FLIP_TOP_BOTTOM)
        canvas.paste(strip, (0, 0))
    im = canvas
    im = ImageEnhance.Brightness(im).enhance(0.85)
    im = ImageEnhance.Color(im).enhance(0.9)
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=86, optimize=True)
    centro = round(cfg.get('centro', 0.5) * sw)
    with open(os.path.join(ROOT, 'src', 'data', f'fondo-{nivel}.js'), 'w') as f:
        f.write(f"// Generado por scripts/fondos.py a partir de art/source/fondos/{cfg['file']}. No editar a mano.\n"
                f"export const JPG = 'data:image/jpeg;base64,{base64.b64encode(buf.getvalue()).decode()}';\n"
                f"export const WIDTH = {sw};\nexport const CENTER = {centro};\n")
    print(f"{nivel}: {sw}×{H}, {len(buf.getvalue()) // 1024} KB")


if __name__ == '__main__':
    for k, v in FONDOS.items(): build(k, v)
