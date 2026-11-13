"""PDF de revisión del banco de la Trivia José Madero (F26), para contactos de confianza.
Lee docs/trivia-madero.md (la fuente de verdad) y genera una hoja por etapa con casillas para marcar.
Uso: python3 docs/generar_pdf_revision_madero.py salida.pdf
"""
import re, sys, datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

FONTS = '/usr/share/fonts/truetype/dejavu/'
pdfmetrics.registerFont(TTFont('DV', FONTS + 'DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DVB', FONTS + 'DejaVuSans-Bold.ttf'))
from reportlab.lib.fonts import addMapping
addMapping('DV', 0, 0, 'DV'); addMapping('DV', 1, 0, 'DVB'); addMapping('DV', 0, 1, 'DV'); addMapping('DV', 1, 1, 'DVB')

ROJO, TINTA, GRIS, VERDE = colors.HexColor('#c02a38'), colors.HexColor('#141414'), colors.HexColor('#6b6b6b'), colors.HexColor('#1f7a4d')
st = {
  'h0': ParagraphStyle('h0', fontName='DVB', fontSize=20, leading=24, textColor=ROJO, spaceAfter=4),
  'h1': ParagraphStyle('h1', fontName='DVB', fontSize=14, leading=18, textColor=ROJO, spaceBefore=6, spaceAfter=6),
  'p': ParagraphStyle('p', fontName='DV', fontSize=9.5, leading=13, textColor=TINTA, spaceAfter=4),
  'small': ParagraphStyle('s', fontName='DV', fontSize=8, leading=10.5, textColor=GRIS),
  'q': ParagraphStyle('q', fontName='DVB', fontSize=10.5, leading=13.5, textColor=TINTA),
  'ok': ParagraphStyle('ok', fontName='DVB', fontSize=9.5, leading=12.5, textColor=VERDE),
  'cell': ParagraphStyle('c', fontName='DV', fontSize=8.5, leading=11, textColor=TINTA),
  'link': ParagraphStyle('l', fontName='DV', fontSize=7.5, leading=10, textColor=colors.HexColor('#2f5bff')),
  'center': ParagraphStyle('ce', fontName='DV', fontSize=8, leading=10, textColor=GRIS, alignment=TA_CENTER),
}
esc = lambda s: s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
def md(s):  # *cursiva* y **negrita** del banco → marcas de ReportLab
    s = esc(s)
    s = re.sub(r'\*\*((?:[^*]|\*[^*]+\*)+?)\*\*', r'<b>\1</b>', s)   # negrita (puede llevar *cursiva* dentro)
    return re.sub(r'\*([^*]+?)\*', r'<i>\1</i>', s)

src = open(sys.argv[2] if len(sys.argv) > 2 else 'docs/trivia-madero.md', encoding='utf-8').read()

def table_rows(section_title_regex):
    """Filas de las tablas bajo los encabezados que coinciden."""
    out, cur = [], None
    for line in src.split('\n'):
        if line.startswith('#'):
            cur = line if re.search(section_title_regex, line) else None
            continue
        if cur and line.startswith('|') and not re.match(r'\|\s*-', line):
            cells = [c.strip() for c in line.strip().strip('|').split('|')]
            if cells and cells[0] not in ('ID', 'Dato', '#', 'Etapa'):
                out.append((cur.lstrip('# ').strip(), cells))
    return out

preguntas = [(sec, c) for sec, c in table_rows(r'^### E[12]') if re.match(r'[CNP]\d\d$', c[0])]
descartadas = [c for _, c in table_rows(r'^## 4\.')]
espera = [c for _, c in table_rows(r'^## 5\.')]
listas = re.search(r'## 3\..*?(?=\n## 4\.)', src, re.S).group(0)

CAJA = '☐'
story = []
hoy = datetime.date.today().strftime('%d/%m/%Y')
story += [Paragraph('Trivia José Madero: <i>Carmesí</i> y <i>Noche</i>', st['h0']),
          Paragraph(f'Hoja de revisión para contactos de confianza · Colores Ruidosos · {hoy}', st['small']),
          Spacer(1, 8),
          Paragraph('<b>Gracias por ayudarnos.</b> Queremos que todo lo que pregunte la trivia esté <b>confirmado</b>. Cada pregunta trae su respuesta correcta y <b>dos fuentes o más</b> (los enlaces se pueden tocar). Te pedimos:', st['p']),
          Paragraph('1. Abre <b>los enlaces</b> de cada pregunta y confirma que dicen lo mismo que la respuesta correcta (en verde).', st['p']),
          Paragraph('2. Revisa que <b>ninguna opción incorrecta</b> pueda ser también verdad.', st['p']),
          Paragraph(f'3. Marca {CAJA} <b>Confirmada</b> o {CAJA} <b>No coincide</b>, y si algo no cuadra, escribe por qué en «Notas».', st['p']),
          Paragraph('4. <b>Si sabes de memoria que algo está mal, también dínoslo, pero con un enlace</b>: solo cambiamos datos con fuente.', st['p']),
          Paragraph('5. Devuélvenos el PDF marcado (o una foto, o un mensaje con el ID de la pregunta, ✔ o ✘ y tu nota).', st['p']),
          Spacer(1, 4),
          Paragraph('Reglas: sin letras de canciones (solo títulos, fechas, personas y lugares) y sin polémicas. Con una sola fuente, el dato no entra. Si las fuentes se contradicen, se descarta. Es un homenaje no oficial.', st['small']),
          Spacer(1, 10)]

resumen = {}
for _, c in preguntas: resumen[c[1]] = resumen.get(c[1], 0) + 1
story.append(Paragraph(f'<b>{len(preguntas)} preguntas para revisar:</b> ' + ', '.join(f'{v} {k}' for k, v in resumen.items()) + f'. Además: listas de canciones de los dos discos, {len(descartadas)} datos descartados y {len(espera)} en espera de una segunda fuente.', st['p']))

DIF = {'fácil': '★', 'difícil': '★★', 'muy difícil': '★★★'}
sec_actual = None
for sec, c in preguntas:
    qid, dif, preg, ok, inc, fuentes, estado, notas = (c + [''] * 8)[:8]
    if sec != sec_actual:
        story += [Spacer(1, 6), Paragraph(md(sec), st['h1'])]
        sec_actual = sec
    links = [u.strip() for u in fuentes.split('·') if u.strip().startswith('http')]
    link_par = Paragraph('<br/>'.join(f'<a href="{esc(u)}" color="#2f5bff">{esc(u)}</a>' for u in links), st['link'])
    cuerpo = [
        [Paragraph(f'<b>{qid}</b> · {DIF.get(dif, dif)} {esc(dif)}', st['small']), Paragraph(f'{CAJA} Confirmada&nbsp;&nbsp;&nbsp;{CAJA} No coincide', st['cell'])],
        [Paragraph(md(preg), st['q']), ''],
        [Paragraph('✔ ' + md(ok), st['ok']), ''],
        [Paragraph('Incorrectas: ' + md(inc), st['cell']), ''],
        [Paragraph('<b>Fuentes</b>', st['small']), ''],
        [link_par, ''],
    ]
    if notas: cuerpo.append([Paragraph('Nota del equipo: ' + md(notas), st['small']), ''])
    cuerpo.append([Paragraph('Notas: ______________________________________________________________', st['small']), ''])
    t = Table(cuerpo, colWidths=[118 * mm, 52 * mm])
    t.setStyle(TableStyle([
        ('SPAN', (0, i), (1, i)) for i in range(1, len(cuerpo))] + [
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#d9c9c2')),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f4efe6')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5)]))
    story += [KeepTogether([t]), Spacer(1, 6)]

story += [PageBreak(), Paragraph('Listas de canciones (para el contrarreloj)', st['h1']),
          Paragraph('Confirma que el <b>orden</b> y los <b>títulos</b> coinciden con la edición estándar de cada disco.', st['p'])]
for bloque in re.split(r'\n(?=\*\*E\d)', listas)[1:]:
    head, *items = [l for l in bloque.split('\n') if l.strip()]
    story.append(Paragraph(md(head), st['q']))
    canciones = [l for l in items if re.match(r'\d+\.', l)]
    story.append(Paragraph('<br/>'.join(md(x) for x in canciones), st['cell']))
    story += [Paragraph(f'{CAJA} Lista confirmada&nbsp;&nbsp;&nbsp;{CAJA} Hay un error. Notas: ____________________________', st['cell']), Spacer(1, 8)]

def tabla(filas, cab, ancho):
    data = [[Paragraph(f'<b>{h}</b>', st['cell']) for h in cab]] + [[Paragraph(md(x), st['cell']) for x in f[:len(cab)]] for f in filas]
    t = Table(data, colWidths=ancho, repeatRows=1)
    t.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d9c9c2')), ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f4efe6')), ('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    return t

story += [Paragraph('Descartadas: las fuentes se contradicen', st['h1']),
          Paragraph('Si tienes una fuente <b>oficial</b> que resuelva alguna, mándanosla.', st['p']),
          tabla(descartadas, ['Dato', 'Contradicción', 'Qué hacemos'], [48 * mm, 70 * mm, 52 * mm]), Spacer(1, 10),
          Paragraph('En espera: falta una segunda fuente con enlace', st['h1']),
          Paragraph('<b>Aquí es donde más nos ayudas:</b> si encuentras un segundo enlace confiable para alguno de estos datos, escríbelo en la última columna.', st['p']),
          tabla([e[:3] + ['______________________'] for e in espera], ['Dato', 'Fuente que ya tenemos', 'Qué falta', 'Tu enlace'], [55 * mm, 35 * mm, 40 * mm, 40 * mm])]

def pie(canvas, doc):
    canvas.saveState(); canvas.setFont('DV', 7.5); canvas.setFillColor(GRIS)
    canvas.drawString(18 * mm, 10 * mm, 'Colores Ruidosos · Trivia José Madero (homenaje no oficial) · documento de revisión, no publicar')
    canvas.drawRightString(198 * mm, 10 * mm, f'pág. {doc.page}'); canvas.restoreState()

doc = SimpleDocTemplate(sys.argv[1], pagesize=letter, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=16 * mm, bottomMargin=18 * mm,
                        title='Revisión · Trivia José Madero: Carmesí y Noche', author='Colores Ruidosos')
doc.build(story, onFirstPage=pie, onLaterPages=pie)
print(sys.argv[1], len(preguntas), 'preguntas')
