// Bot para pruebas y ajuste: busca zanahorias por casillas seguras, persigue a los tristes y huye si no hay salida.
import { DIR_ORDER, step, isWalkable } from '../core/grid.js';
import { tileOf } from './actor.js';

function bfs(g, starts, blocked = null) {
  const dist = new Int16Array(g.w * g.h).fill(-1), first = new Array(g.w * g.h);
  const q = [];
  for (const [x, y, d0] of starts) { dist[y * g.w + x] = 0; first[y * g.w + x] = d0; q.push([x, y]); }
  for (let h = 0; h < q.length; h++) {
    const [x, y] = q[h], i = y * g.w + x;
    for (const d of DIR_ORDER) {
      const [nx, ny] = step(g, x, y, d), j = ny * g.w + nx;
      if (!isWalkable(g, nx, ny) || dist[j] >= 0 || (blocked && blocked(j, dist[i] + 1))) continue;
      dist[j] = dist[i] + 1; first[j] = first[i] ?? d; q.push([nx, ny]);
    }
  }
  return { dist, first };
}

const ESPACIO_MIN = 25;

export function botDir(m) {
  if (m.mode !== 'play') return null;
  const g = m.grid, [bx, by] = tileOf(m.bunny);
  const peligro = m.vanish > 0 ? [] : m.enemies.filter((e) => !e.triste && (e.estado === 'activo' || e.estado === 'saliendo'));
  const ed = bfs(g, peligro.map((e) => { const [x, y] = tileOf(e); return [x, y, null]; })).dist;
  const ratio = m.speeds.enemigo / m.speeds.bunny;
  const tristes = new Set(m.hyper > 60 ? m.enemies.filter((e) => e.triste && e.estado === 'activo').map((e) => { const [x, y] = tileOf(e); return y * g.w + x; }) : []);
  // Para cada salida: cuánto espacio seguro deja y qué tan cerca queda la siguiente zanahoria.
  const opciones = [];
  for (const d of DIR_ORDER) {
    const [nx, ny] = step(g, bx, by, d), j0 = ny * g.w + nx;
    if (!isWalkable(g, nx, ny)) continue;
    if (ed[j0] >= 0 && ed[j0] <= ratio + 1) { opciones.push({ d, espacio: 0, valor: Infinity, lejos: ed[j0] }); continue; }
    const r = bfs(g, [[nx, ny, d]], (j, dd) => ed[j] >= 0 && ed[j] <= (dd + 1) * ratio + 2);
    let espacio = 0, valor = Infinity;
    for (let j = 0; j < r.dist.length; j++) {
      const dd = r.dist[j];
      if (dd < 0) continue;
      espacio++;
      const v = tristes.has(j) ? dd - 6 : m.items[j] === 2 ? dd - 3 : m.items[j] ? dd : Infinity;
      if (v < valor) valor = v;
    }
    opciones.push({ d, espacio, valor, lejos: ed[j0] < 0 ? 999 : ed[j0] });
  }
  const seguras = opciones.filter((o) => o.espacio >= ESPACIO_MIN && o.valor < Infinity);
  if (seguras.length) return seguras.reduce((a, b) => (b.valor < a.valor ? b : a)).d;
  const amplias = opciones.filter((o) => o.espacio > 0);
  if (amplias.length) return amplias.reduce((a, b) => (b.espacio > a.espacio ? b : a)).d;
  return opciones.reduce((a, b) => (b.lejos > a.lejos ? b : a), { lejos: -1, d: null }).d;
}
