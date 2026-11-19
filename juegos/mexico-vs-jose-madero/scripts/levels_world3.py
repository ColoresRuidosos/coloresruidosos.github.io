#!/usr/bin/env python3
"""Genera src/data/world3.js (niveles del Mundo 3 «Alba», spec §3.0f Q: paseo al amanecer). Tras generarlo, el texto es la
fuente: se puede editar a mano. Leyenda en src/engine/tilemap.js. Fila 11 = donde se apoyan las cosas (suelo en 12–13).
Alba es un paseo: no hay enemigos ni pinchos; hay recuerdos 'I', atriles 'S', bancas 'b', Luz del Alba '@',
plataformas de luz '~', la Maldita Rueda 'D' y, en 3-3, el jefe 'n'."""
H = 14

def level(w):
    g = [['.'] * w for _ in range(H)]
    for y in (12, 13):
        for x in range(w): g[y][x] = '#'
    return g

def put(g, x, y, c): g[y][x] = c
def gap(g, x0, n, fill='.'):
    for x in range(x0, x0 + n):
        g[12][x] = fill; g[13][x] = '.'
def block(g, x0, y0, w, h, c='#'):
    for y in range(y0, y0 + h):
        for x in range(x0, x0 + w): g[y][x] = c
def plat(g, x0, y, w): block(g, x0, y, w, 1, '=')
def text(g): return [''.join(r) for r in g]

# ── 3-1 «Willkommen»: el pueblo blanco antes del amanecer (4 atriles, 3 recuerdos, 2 bancas, luz del alba) ──
a = level(150)
put(a, 2, 11, 'P')
put(a, 10, 11, 'S')                               # «Willkommen»
plat(a, 16, 9, 4); put(a, 17, 8, '*')
put(a, 24, 9, 'I')
put(a, 30, 11, 'b')
put(a, 40, 11, 'S')                               # «Aún hay más»
put(a, 48, 11, 'C')
put(a, 55, 9, 'I'); put(a, 52, 10, '*')
put(a, 57, 10, '@')                               # Luz del Alba antes del puente de luz
gap(a, 60, 4, '~')                                # puente de luz (solo con luz)
put(a, 62, 8, '*')
put(a, 75, 11, 'S')                               # «Los de septiembre»
plat(a, 80, 9, 5); put(a, 82, 8, '*')
put(a, 85, 11, 'b')
put(a, 95, 9, 'I')
put(a, 100, 11, 'C')
gap(a, 106, 2)
put(a, 110, 11, 'S')                               # «La célula no explotó»
plat(a, 118, 9, 4); put(a, 119, 8, '*')
put(a, 130, 11, 'C')
put(a, 146, 11, 'G')

# ── 3-2 «Carrusel de adultos»: la feria al alba; la Maldita Rueda lleva a la parte alta ──
b = level(170)
put(b, 2, 11, 'P')
put(b, 12, 11, 'S')                               # «Caballeros británicos»
plat(b, 20, 9, 4); put(b, 21, 8, '*')
put(b, 30, 9, 'I')
put(b, 45, 11, 'C')
put(b, 50, 11, 'b')
put(b, 60, 9, 'I'); put(b, 63, 10, '*')
put(b, 70, 11, 'S')                               # «Ahora y hoy»
put(b, 78, 11, 'C')
put(b, 90, 5, 'D')                                 # la Maldita Rueda
block(b, 96, 4, 2, 8)                              # muro: solo se pasa por arriba, en la noria
plat(b, 98, 4, 14); put(b, 104, 3, '*')
block(b, 112, 4, 1, 1, '='); block(b, 113, 6, 3, 1, '='); block(b, 116, 8, 3, 1, '='); block(b, 119, 10, 3, 1, '=')
put(b, 125, 9, 'I')
put(b, 130, 11, 'C')
put(b, 140, 11, 'S')                               # «No lo cambio por nada»
put(b, 150, 10, '@'); gap(b, 153, 4, '~'); put(b, 155, 8, '*')
put(b, 166, 11, 'G')

# ── 3-3 «Ahora y hoy»: el cerro; el jefe La Nostalgia (rayos de sol, la noria y el viento) ──
c = level(150)
put(c, 2, 11, 'P')
put(c, 8, 11, 'S')                                # «Etrusco único»
put(c, 14, 11, 'b')
put(c, 20, 11, 'S')                               # «Maldita rueda»
put(c, 26, 11, 'C')
put(c, 30, 11, 'n')                               # arena de la Nostalgia
put(c, 70, 5, 'D')                                 # la Maldita Rueda del jefe
block(c, 76, 7, 74, 5)                             # repisa alta: se sube por la noria
put(c, 110, 6, 'S')                               # «Carrusel de adultos», ya con viento en contra
put(c, 90, 5, '*'); put(c, 125, 5, '*')

def js(lv):
    return ',\n'.join("    '" + r + "'" for r in text(lv))

out = f"""// Mundo 3 «Alba» (spec §3.0f Q). Generado al inicio con scripts/levels_world3.py; se puede editar a mano.
// Leyenda en src/engine/tilemap.js. Paseo: sin daño; pasajes por nivel en alba-story.js (PASAJES_POR_NIVEL).
export const WORLD_3 = [
  {{ id: '3-1', theme: 'alba-pueblo', name: 'EL PUEBLO', map: [
{js(a)},
  ].join('\\n') }},
  {{ id: '3-2', theme: 'alba-feria', name: 'LA FERIA', map: [
{js(b)},
  ].join('\\n') }},
  {{ id: '3-3', theme: 'alba-cerro', name: 'EL CERRO', map: [
{js(c)},
  ].join('\\n') }},
];
"""
open('src/data/world3.js', 'w').write(out)
print('world3.js', [len(text(x)[0]) for x in (a, b, c)])
