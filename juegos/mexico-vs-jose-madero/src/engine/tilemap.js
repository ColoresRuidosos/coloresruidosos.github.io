import { TILE } from '../game/constants.js';

// Niveles como texto: '#' sólido, '=' semisólido, '^' pinchos, 'H' gancho, '*' pieza,
// 'P' Pepe, 'T' Titular, 'F' Paparazzi, 'R' Reportero, 'C' checkpoint, 'G' puerta (meta).
// v5: 'V' Rumor Volador, 'M' Micrófono Traidor, 'B' jefe, 'A' Amplificador, '+' Carta de fan. Un carácter = 16×16 px.
export function parseLevel(text) {
  const rows = text.split('\n');
  const h = rows.length, w = Math.max(...rows.map((r) => r.length));
  const L = { w, h, grid: [], player: null, enemies: [], pieces: [], hooks: [], checkpoints: [], items: [], boss: null, goal: null };
  rows.forEach((row, ty) => {
    let out = '';
    for (let tx = 0; tx < w; tx++) {
      const c = row[tx] ?? '.';
      const feet = { x: tx * TILE + TILE / 2, y: (ty + 1) * TILE };
      const center = { x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 };
      if (c === 'P') L.player = feet;
      else if (c === 'T') L.enemies.push({ ...feet, kind: 'titular' });
      else if (c === 'F') L.enemies.push({ ...feet, kind: 'paparazzi' });
      else if (c === 'R') L.enemies.push({ ...feet, kind: 'reportero' });
      else if (c === 'V') L.enemies.push({ ...feet, kind: 'rumor' });
      else if (c === 'M') L.enemies.push({ ...feet, kind: 'traidor' });
      else if (c === 'B') L.boss = feet;
      else if (c === 'A') L.items.push({ ...center, kind: 'amp' });
      else if (c === '+') L.items.push({ ...center, kind: 'carta' });
      else if (c === '*') L.pieces.push(center);
      else if (c === 'H') L.hooks.push(center);
      else if (c === 'C') L.checkpoints.push(feet);
      else if (c === 'G') L.goal = feet;
      out += '#=^'.includes(c) ? c : '.';
    }
    L.grid.push(out);
  });
  L.tileAt = (tx, ty) => tileAt(L, tx, ty);
  return L;
}

export function tileAt(L, tx, ty) {
  if (tx < 0 || tx >= L.w) return '#';
  if (ty < 0 || ty >= L.h) return '.';
  return L.grid[ty][tx];
}

const solid = (c) => c === '#';

function overlapsSolid(L, b) {
  const x0 = Math.floor(b.x / TILE), x1 = Math.floor((b.x + b.w - 1e-6) / TILE);
  const y0 = Math.floor(b.y / TILE), y1 = Math.floor((b.y + b.h - 1e-6) / TILE);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (solid(tileAt(L, tx, ty))) return { tx, ty };
  return null;
}

// Mueve un cuerpo AABB con pasos de ≤ 4 px (sin atravesar nada). Devuelve contactos.
export function moveBody(L, b, dx, dy) {
  const res = { hitX: false, ground: false, ceiling: false };
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 4));
  const sx = dx / steps, sy = dy / steps;
  for (let i = 0; i < steps; i++) {
    if (sx) {
      b.x += sx;
      const hit = overlapsSolid(L, b);
      if (hit) {
        b.x = sx > 0 ? hit.tx * TILE - b.w : (hit.tx + 1) * TILE;
        res.hitX = true;
      }
    }
    if (sy) {
      const prevBottom = b.y + b.h;
      b.y += sy;
      const hit = overlapsSolid(L, b);
      if (hit) {
        if (sy > 0) { b.y = hit.ty * TILE - b.h; res.ground = true; }
        else { b.y = (hit.ty + 1) * TILE; res.ceiling = true; }
      } else if (sy > 0) {
        // Semisólidas: solo frenan al caer desde encima.
        const x0 = Math.floor(b.x / TILE), x1 = Math.floor((b.x + b.w - 1e-6) / TILE);
        const ty = Math.floor((b.y + b.h - 1e-6) / TILE);
        for (let tx = x0; tx <= x1; tx++) {
          if (tileAt(L, tx, ty) === '=' && prevBottom <= ty * TILE + 1e-6) {
            b.y = ty * TILE - b.h;
            res.ground = true;
            break;
          }
        }
      }
    }
  }
  // Apoyado sin moverse: comprobar suelo justo debajo.
  if (!res.ground && dy >= 0) {
    const probe = { ...b, y: b.y + 1 };
    if (overlapsSolid(L, probe)) res.ground = true;
    else {
      const ty = Math.floor((b.y + b.h) / TILE);
      if (Math.abs(ty * TILE - (b.y + b.h)) < 1e-6) {
        const x0 = Math.floor(b.x / TILE), x1 = Math.floor((b.x + b.w - 1e-6) / TILE);
        for (let tx = x0; tx <= x1; tx++) if (tileAt(L, tx, ty) === '=') res.ground = true;
      }
    }
  }
  return res;
}
