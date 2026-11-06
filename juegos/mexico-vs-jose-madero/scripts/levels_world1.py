#!/usr/bin/env python3
"""Genera src/data/world1.js (niveles de texto del Mundo 1). Tras generarlo, el texto es la fuente:
se puede editar a mano. Leyenda en src/engine/tilemap.js. Fila 11 = donde se apoyan las cosas (suelo en 12–13)."""
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

# ── 1-1 Calle Carmesí: tutorial rápido ───────────────────
a = level(150)
put(a, 2, 11, 'P')
put(a, 16, 11, 'T')
block(a, 22, 11, 2, 1); put(a, 23, 9, '*')
put(a, 28, 11, 'A')
plat(a, 31, 8, 4); put(a, 32, 7, '*')
put(a, 38, 11, 'F')
gap(a, 45, 2); put(a, 46, 8, '*')
put(a, 52, 11, 'T')
block(a, 57, 10, 2, 2); put(a, 58, 8, '*')
put(a, 64, 11, 'R')
put(a, 70, 11, 'C')
block(a, 76, 11, 2, 1, '^')
put(a, 83, 11, 'T')
gap(a, 88, 5); put(a, 90, 7, 'H'); put(a, 90, 5, '*')
put(a, 98, 3, 'V')
plat(a, 103, 8, 3); put(a, 104, 7, '+')
put(a, 108, 11, 'F')
put(a, 114, 11, 'C')
put(a, 120, 11, 'T'); put(a, 126, 11, 'R')
block(a, 130, 11, 1, 1); block(a, 131, 10, 1, 2); put(a, 131, 8, '*')
put(a, 144, 11, 'G')

# ── 1-2 Azoteas: ganchos encadenados y voladores ─────────
b = level(170)
put(b, 2, 11, 'P')
put(b, 12, 11, 'T')
gap(b, 18, 6); put(b, 20, 7, 'H'); put(b, 23, 6, '*')
put(b, 30, 4, 'V')
block(b, 34, 10, 3, 2); put(b, 35, 8, '*')
put(b, 42, 9, 'M')
put(b, 46, 11, 'F')
put(b, 52, 11, 'C')
gap(b, 56, 7); put(b, 58, 7, 'H'); put(b, 61, 6, '*')
block(b, 68, 11, 2, 1, '^')
put(b, 74, 11, '+'); put(b, 81, 8, '*')
put(b, 78, 9, 'M')
put(b, 84, 11, 'R')
put(b, 90, 11, 'C')
put(b, 96, 3, 'V'); put(b, 100, 11, 'T')
gap(b, 104, 6); put(b, 106, 7, 'H'); put(b, 106, 5, '*')
put(b, 114, 11, 'A')
put(b, 118, 9, 'M'); put(b, 122, 11, 'F')
put(b, 128, 11, 'C')
block(b, 134, 11, 2, 1, '^')
put(b, 140, 4, 'V'); put(b, 144, 11, 'T')
plat(b, 148, 8, 4); put(b, 149, 7, '*')
put(b, 164, 11, 'G')

# ── 1-3 El Teatro: arena del jefe ────────────────────────
c = level(26)
block(c, 0, 0, 1, 12); block(c, 25, 0, 1, 12)
put(c, 3, 11, 'P')
plat(c, 3, 7, 3); plat(c, 20, 7, 3)
put(c, 9, 3, 'H'); put(c, 16, 3, 'H')   # candelabro
put(c, 4, 6, '*')
put(c, 20, 11, 'B')

levels = [('1-1', 'calle', 'CALLE CARMESÍ', a), ('1-2', 'azoteas', 'AZOTEAS', b), ('1-3', 'teatro', 'EL TEATRO', c)]
out = ['// Mundo 1 «Carmesí» (spec §3.0d). Generado al inicio con scripts/levels_world1.py; se puede editar a mano.',
       '// Leyenda en src/engine/tilemap.js.', 'export const WORLD_1 = [']
for id_, theme, name, g in levels:
    out.append(f"  {{ id: '{id_}', theme: '{theme}', name: '{name}', map: [")
    out += [f"    '{r}'," for r in text(g)]
    out.append("  ].join('\\n') },")
out.append('];')
open('src/data/world1.js', 'w', encoding='utf8').write('\n'.join(out) + '\n')
print('ok')
