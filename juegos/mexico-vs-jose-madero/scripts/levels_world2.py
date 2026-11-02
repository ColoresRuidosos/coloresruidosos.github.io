#!/usr/bin/env python3
"""Genera src/data/world2.js (niveles de texto del Mundo 2 «Noche», spec §3.0f E). Tras generarlo, el texto es la
fuente: se puede editar a mano. Leyenda en src/engine/tilemap.js. Fila 11 = donde se apoyan las cosas (suelo en 12–13)."""
H = 14

def level(w):
    g = [['.'] * w for _ in range(H)]
    for y in (12, 13):
        for x in range(w): g[y][x] = '#'
    return g

def put(g, x, y, c): g[y][x] = c
def gap(g, x0, n):
    for x in range(x0, x0 + n):
        for y in (12, 13): g[y][x] = '.'
def block(g, x0, y0, w, h, c='#'):
    for y in range(y0, y0 + h):
        for x in range(x0, x0 + w): g[y][x] = c
def plat(g, x0, y, w): block(g, x0, y, w, 1, '=')
def text(g): return [''.join(r) for r in g]

# ── 2-1 La Fiesta: calle de noche, invitados enmascarados y murciélagos (sin farol) ──
a = level(150)
put(a, 2, 11, 'P')
put(a, 14, 11, 'I')
block(a, 20, 11, 2, 1); put(a, 21, 9, '*')
put(a, 27, 11, 'T')
put(a, 33, 6, 'W')
plat(a, 38, 8, 4); put(a, 39, 7, '*')
put(a, 46, 11, 'I')
gap(a, 52, 2); put(a, 53, 8, '*')
put(a, 59, 11, 'F')
put(a, 66, 11, 'C')
put(a, 72, 6, 'W'); put(a, 75, 9, '*')
block(a, 78, 11, 2, 1, '^')
put(a, 85, 11, 'T')
gap(a, 90, 5); put(a, 92, 7, 'H'); put(a, 92, 5, '*')
put(a, 100, 11, 'I')
plat(a, 105, 8, 3); put(a, 106, 7, '+')
put(a, 111, 6, 'W')
put(a, 116, 11, 'C')
put(a, 122, 11, 'F'); put(a, 128, 11, 'I')
block(a, 133, 11, 1, 1); block(a, 134, 10, 1, 2); put(a, 134, 8, '*')
put(a, 144, 11, 'G')

# ── 2-2 Las Cabañas: a oscuras con farol, fantasmas, aceite y ganchos sobre el lago ──
b = level(160)
put(b, 2, 11, 'P')
put(b, 10, 11, 'L')
put(b, 16, 11, 'I')
block(b, 22, 10, 3, 2); put(b, 23, 8, '*')           # cabaña
put(b, 30, 8, 'O')
gap(b, 36, 6); put(b, 38, 7, 'H'); put(b, 40, 6, '*')  # orilla del lago
put(b, 47, 11, 'T')
put(b, 52, 6, 'W')
put(b, 56, 11, 'C'); put(b, 58, 11, 'L')
block(b, 64, 10, 3, 2); put(b, 65, 8, '*')           # cabaña
put(b, 72, 8, 'O')
put(b, 78, 11, 'I')
gap(b, 84, 7); put(b, 86, 7, 'H'); put(b, 89, 7, 'H'); put(b, 88, 5, '*')
put(b, 96, 11, 'T')
put(b, 100, 11, 'L')
plat(b, 104, 8, 3); put(b, 105, 7, '+')
put(b, 110, 6, 'W')
put(b, 114, 11, 'C'); put(b, 118, 9, '*')
put(b, 120, 8, 'O')
block(b, 126, 11, 2, 1, '^')
put(b, 132, 11, 'I')
block(b, 137, 10, 3, 2); put(b, 138, 8, '*')         # última cabaña
put(b, 143, 11, 'L')
put(b, 154, 11, 'G')

# ── 2-3 El Lago: muelle cerrado para el jefe ──
c = [['.'] * 26 for _ in range(H)]
for y in range(H): c[y][0] = c[y][25] = '#'
for y in (12, 13):
    for x in range(26): c[y][x] = '#'
put(c, 3, 11, 'P'); put(c, 4, 6, '*')
plat(c, 3, 7, 3); plat(c, 20, 7, 3)
put(c, 18, 11, 'E')

levels = [('2-1', 'fiesta', 'LA FIESTA', False, a), ('2-2', 'cabanas', 'LAS CABAÑAS', True, b), ('2-3', 'lago', 'EL LAGO', True, c)]
out = ["// Mundo 2 «Noche» (spec §3.0f E). Generado al inicio con scripts/levels_world2.py; se puede editar a mano.",
       "// Leyenda en src/engine/tilemap.js. `lantern`: nivel a oscuras con farol.", "export const WORLD_2 = ["]
for id_, theme, name, lantern, g in levels:
    rows = ',\n'.join(f"    '{r}'" for r in text(g))
    out.append(f"  {{ id: '{id_}', theme: '{theme}', name: '{name}', lantern: {str(lantern).lower()}, map: [\n{rows},\n  ].join('\\n') }},")
out.append('];\n')
open('src/data/world2.js', 'w').write('\n'.join(out))
print('ok')
