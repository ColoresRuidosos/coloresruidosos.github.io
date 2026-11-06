#!/usr/bin/env python3
"""Reparte ayudas en los niveles (spec §3.0f H): hasta 3 cartas '+', 3 checkpoints 'C' y un power-up ('J' o 'Z')
por nivel normal, en el suelo libre y repartidas a lo largo del nivel. Idempotente: solo añade lo que falta.
Uso: python3 scripts/ayudas.py src/data/world1.js src/data/world2.js
"""
import re, sys

GROUND = 11  # fila donde se apoyan las cosas (suelo en 12)

def free(rows, x):
    return rows[GROUND][x] == '.' and rows[GROUND + 1][x] == '#' and all(rows[GROUND][k] in '.#=' for k in range(max(0, x - 2), min(len(rows[0]), x + 3)) if k != x) and rows[GROUND - 1][x] == '.'

def place(rows, ch, need, start, end, extra_free=()):
    have = sum(r.count(ch) for r in rows)
    for k in range(need - have):
        # Puntos repartidos: busca el hueco libre más cercano al objetivo.
        target = start + (end - start) * (k + 1) // (need - have + 1)
        for d in range(0, 30):
            for x in (target + d, target - d):
                if start < x < end and free(rows, x) and x not in extra_free:
                    rows[GROUND] = rows[GROUND][:x] + ch + rows[GROUND][x + 1:]
                    break
            else:
                continue
            break

def fix(path):
    src = open(path).read()
    def one(m):
        body = m.group(2)
        rows = re.findall(r"'([^']*)'", body)
        text = ''.join(rows)
        if 'B' in text or 'E' in text or len(rows[0]) < 60:  # niveles con jefe: nada
            return m.group(0)
        w = len(rows[0])
        goal = next(i for i, r in enumerate(rows) for i in [r.find('G')] if i >= 0) if 'G' in text else w - 4
        place(rows, '+', 3, 6, goal - 4)
        place(rows, 'C', 3, 20, goal - 8)
        if 'J' not in text and 'Z' not in text:
            place(rows, 'J' if m.group(1) in ('1-1', '2-1') else 'Z', 1, w // 3, goal - 4)
        new = ',\n'.join(f"    '{r}'" for r in rows)
        return m.group(0).replace(body, '\n' + new + ',\n  ')
    out = re.sub(r"id: '(\d-\d)'.*?map: \[(.*?)\]\.join", one, src, flags=re.S)
    open(path, 'w').write(out)

if __name__ == '__main__':
    for p in sys.argv[1:]: fix(p)
    print('ok')
