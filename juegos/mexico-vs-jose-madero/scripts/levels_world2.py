#!/usr/bin/env python3
"""Genera src/data/world2.js (niveles de texto del Mundo 2 «Noche», spec §3.0f G: la fiesta de disfraces). Tras generarlo, el texto es la
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

# v8.1 (spec §3.0f G): todo el mundo transcurre en la fiesta de disfraces de la casona junto al lago.
# ── 2-1 El Jardín: la fiesta en marcha, estanques con el Hombre anfibio (sin farol) ──
a = level(150)
put(a, 2, 11, 'P')
put(a, 12, 11, 'T')
block(a, 18, 11, 2, 1); put(a, 19, 9, '*')
put(a, 24, 11, 'X')                                   # Charro Negro
gap(a, 30, 2); put(a, 30, 11, 'U'); put(a, 31, 8, '*')  # estanque con anfibio
put(a, 36, 6, 'W')
plat(a, 40, 8, 4); put(a, 41, 7, '*')
put(a, 46, 11, 'K')                                   # Gigante cosido
put(a, 54, 11, 'C')
put(a, 60, 11, 'Q')                                   # La Llorona
put(a, 66, 11, 'A')
gap(a, 72, 2); put(a, 72, 11, 'U')
put(a, 78, 11, 'T')
put(a, 84, 6, 'W'); put(a, 86, 9, '*')
block(a, 90, 11, 2, 1, '^')
put(a, 96, 11, 'C')
gap(a, 101, 5); put(a, 103, 7, 'H'); put(a, 103, 5, '*')
put(a, 110, 11, 'X')
plat(a, 114, 8, 3); put(a, 115, 7, '+')
put(a, 120, 11, 'K')
put(a, 126, 11, 'C')
block(a, 132, 11, 1, 1); block(a, 133, 10, 1, 2); put(a, 133, 8, '*')
put(a, 138, 11, 'Q')
put(a, 144, 11, 'G')

# ── 2-2 La Casona: se va la luz; pasillos, escalones, fantasmas y el Hombre invisible (con farol) ──
b = level(160)
for x in range(160): b[0][x] = '#'; b[1][x] = '#'   # techo
put(b, 2, 11, 'P')
put(b, 8, 11, 'L')
put(b, 14, 11, 'N')                                   # Hombre invisible
block(b, 20, 11, 2, 1); block(b, 22, 10, 2, 2); put(b, 23, 8, '*')   # escalones
put(b, 30, 7, 'O')                                    # Fantasma
put(b, 36, 11, 'T')
put(b, 42, 4, 'W')
plat(b, 46, 8, 4); put(b, 47, 7, '*')
put(b, 52, 11, 'C'); put(b, 55, 11, 'L')
put(b, 60, 11, 'Q')
gap(b, 66, 5); put(b, 68, 7, 'H'); put(b, 68, 5, '*')   # suelo hundido
put(b, 76, 11, 'N')
put(b, 82, 7, 'O')
put(b, 88, 11, 'T')
put(b, 92, 11, 'L')
plat(b, 96, 8, 3); put(b, 97, 7, '+')
put(b, 102, 4, 'W')
put(b, 106, 11, 'C')
put(b, 112, 7, 'O')
block(b, 118, 11, 2, 1, '^')
put(b, 124, 11, 'K')
block(b, 130, 11, 2, 1); block(b, 132, 10, 2, 2); put(b, 133, 8, '*')
put(b, 138, 11, 'L')
put(b, 142, 11, 'N')
put(b, 146, 9, '*')
put(b, 154, 11, 'G')

# ── 2-3 El Muelle: más ancho, con barcas a dos alturas (spec §3.0f G, B2) ──
c = [['.'] * 30 for _ in range(H)]
for y in range(H): c[y][0] = c[y][29] = '#'
for y in (12, 13):
    for x in range(30): c[y][x] = '#'
put(c, 3, 11, 'P'); put(c, 14, 4, '*')
plat(c, 4, 8, 4); plat(c, 22, 8, 4)     # barcas bajas
plat(c, 12, 5, 6)                       # pasarela alta
put(c, 22, 11, 'E')

levels = [('2-1', 'jardin', 'EL JARDÍN', False, a), ('2-2', 'casona', 'LA CASONA', True, b), ('2-3', 'muelle', 'EL MUELLE', True, c)]
out = ["// Mundo 2 «Noche» (spec §3.0f E). Generado al inicio con scripts/levels_world2.py; se puede editar a mano.",
       "// Leyenda en src/engine/tilemap.js. `lantern`: nivel a oscuras con farol.", "export const WORLD_2 = ["]
for id_, theme, name, lantern, g in levels:
    rows = ',\n'.join(f"    '{r}'" for r in text(g))
    out.append(f"  {{ id: '{id_}', theme: '{theme}', name: '{name}', lantern: {str(lantern).lower()}, map: [\n{rows},\n  ].join('\\n') }},")
out.append('];\n')
open('src/data/world2.js', 'w').write('\n'.join(out))
print('ok')
