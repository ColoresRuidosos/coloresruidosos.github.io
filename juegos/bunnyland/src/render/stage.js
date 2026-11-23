// El escenario: muros por tema (cacheados por nivel), zanahorias, objetos, charcos y personajes.
import { WALL, DOOR, HOUSE } from '../core/grid.js';
import { createRng } from '../core/rng.js';
import { TEMAS } from '../data/themes.js';
import { BONUS_POR_ESCENARIO } from '../data/sprites.js';
import { TILE, hyperSteps } from '../data/tuning.js';
import { drawSprite } from './sprites.js';
import { TOP, PX, W, MAZE_H } from './layout.js';

let bgKey = null, bg = null;

function buildBackground(g, tema) {
  const c = document.createElement('canvas'); c.width = W; c.height = MAZE_H;
  const x = c.getContext('2d');
  x.fillStyle = tema.fondo; x.fillRect(0, 0, W, MAZE_H);
  const isWall = (cx, cy) => cx < 0 || cx >= g.w || g.cell(cx, cy) === WALL;
  const rng = createRng(tema.id.length * 31);
  // Sombra (como las letras del presskit) y bloque
  for (let cy = 0; cy < g.h; cy++) for (let cx = 0; cx < g.w; cx++) {
    if (g.cell(cx, cy) !== WALL) continue;
    x.fillStyle = tema.sombra; x.fillRect(cx * PX + 1, cy * PX + 1, PX, PX);
  }
  for (let cy = 0; cy < g.h; cy++) for (let cx = 0; cx < g.w; cx++) {
    const t = g.cell(cx, cy), px = cx * PX, py = cy * PX;
    if (t === HOUSE) { x.fillStyle = tema.sombra; x.fillRect(px, py, PX, PX); continue; }
    if (t === DOOR) { x.fillStyle = tema.puerta; x.fillRect(px, py + 3, PX, 2); continue; }
    if (t !== WALL) continue;
    x.fillStyle = tema.muro; x.fillRect(px, py, PX, PX);
    x.fillStyle = tema.borde;
    if (!isWall(cx, cy - 1)) x.fillRect(px, py, PX, 1);
    if (!isWall(cx, cy + 1)) x.fillRect(px, py + PX - 1, PX, 1);
    if (!isWall(cx - 1, cy)) x.fillRect(px, py, 1, PX);
    if (!isWall(cx + 1, cy)) x.fillRect(px + PX - 1, py, 1, PX);
    const interior = isWall(cx - 1, cy) && isWall(cx + 1, cy) && isWall(cx, cy - 1) && isWall(cx, cy + 1);
    if (!interior) continue;
    if (tema.deco === 'koi') { x.fillStyle = '#2F7FD8'; x.fillRect(px + 1, py + 1, 6, 6); if (rng.int(4) === 0) { x.fillStyle = '#FF8A1F'; x.fillRect(px + 2 + rng.int(3), py + 3, 2, 1); } }
    else if (tema.deco === 'grafiti' && rng.int(3) === 0) { x.fillStyle = ['#FF66C4', '#FEED01', '#FE2C4E', '#2F7FD8'][rng.int(4)]; x.fillRect(px + rng.int(5), py + rng.int(5), 2 + rng.int(3), 1 + rng.int(2)); }
    else if (tema.deco === 'estrellas' && rng.int(5) === 0) { x.fillStyle = '#FEED01'; x.fillRect(px + 3, py + 2, 1, 3); x.fillRect(px + 2, py + 3, 3, 1); }
    else if (tema.deco === 'ventanas') { x.fillStyle = rng.int(3) ? '#FEED01' : '#56545B'; x.fillRect(px + 2, py + 2, 2, 2); x.fillStyle = rng.int(3) ? '#FEED01' : '#56545B'; x.fillRect(px + 5, py + 5, 1, 2); }
  }
  return c;
}

const center = (a) => [(a.x / TILE) * PX + PX / 2, TOP + (a.y / TILE) * PX + PX / 2];

export function drawStage(ctx, m, frame, opts = {}) {
  const g = m.grid, tema = TEMAS[m.escenario];
  const key = m.nivel + ':' + m.escenario;
  if (bgKey !== key) { bg = buildBackground(g, tema); bgKey = key; }
  ctx.drawImage(bg, 0, TOP);
  // Luces del escenario rosa
  if (tema.deco === 'luces') for (let i = 0; i < 7; i++) { ctx.fillStyle = (i + (frame >> 5)) % 2 ? '#FF66C4' : '#FEED01'; ctx.fillRect(8 + i * 24, TOP + 1, 3, 2); }
  // Charquitos de la Gotita
  ctx.fillStyle = 'rgba(254,44,78,0.45)';
  for (const k of m.charcos.keys()) { const cx = k % g.w, cy = Math.floor(k / g.w); ctx.fillRect(cx * PX, TOP + cy * PX + 3, PX, 3); }
  // Zanahorias
  for (let i = 0; i < m.items.length; i++) {
    const it = m.items[i]; if (!it) continue;
    const px = (i % g.w) * PX, py = TOP + Math.floor(i / g.w) * PX;
    if (it === 1) { ctx.fillStyle = '#FF8A1F'; ctx.fillRect(px + 3, py + 3, 2, 3); ctx.fillStyle = '#3BB54A'; ctx.fillRect(px + 3, py + 2, 2, 1); }
    else if ((frame >> 4) % 4 !== 3) drawSprite(ctx, 'item.hyper', px + 4, py + 4);
  }
  const at = (p) => [p.x * PX + PX / 2, TOP + p.y * PX + PX / 2];
  if (m.bonus.t > 0) drawSprite(ctx, BONUS_POR_ESCENARIO[m.escenario], ...at(g.bonus));
  if (m.heartItem) drawSprite(ctx, 'item.besito', at(g.heart)[0], at(g.heart)[1] + Math.round(Math.sin(frame / 10)));
  if (m.vanishItem) drawSprite(ctx, 'item.desaparezco', ...at(g.vanish), { alpha: 0.6 + 0.3 * Math.sin(frame / 12) });

  // Enemigos
  const parpadea = m.hyper > 0 && m.hyper < 120 && (frame >> 4) % 2 === 0;
  for (const e of m.enemies) {
    let [x, y] = center(e);
    const f = (frame >> 3) & 1;
    let name = `${e.tipo}.${f}`;
    if (e.estado === 'nube') name = 'nube.0';
    else if (e.triste && !parpadea) name = `${e.tipo}.triste.${f}`;
    if (e.estado === 'casa') y += Math.round(Math.sin((frame + e.releaseAt) / 8) * 2);
    drawSprite(ctx, name, x, y, { flip: e.dir === 'left' && e.tipo !== 'coronado' });
    if (e.tipo === 'estrellita' && e.aviso > 0 && e.tpDest && (frame >> 3) % 2) {
      const [tx, ty] = e.tpDest; ctx.fillStyle = '#FEED01';
      const sx = tx * PX + 4, sy = TOP + ty * PX + 4; ctx.fillRect(sx - 4, sy, 9, 1); ctx.fillRect(sx, sy - 4, 1, 9);
    }
    if (e.tipo === 'coronado' && e.estado === 'activo' && !e.triste && m.restantes < m.total * 0.2 && (frame >> 2) % 2) {
      ctx.fillStyle = '#FEED01'; ctx.fillRect(x - 8, y - 9, 1, 1); ctx.fillRect(x + 7, y - 9, 1, 1); ctx.fillRect(x, y - 11, 1, 1);
    }
  }

  // Bunny
  const b = m.bunny;
  const [bx, by] = center(b);
  if (m.mode === 'dying' || m.mode === 'over') drawSprite(ctx, 'bunny.cuclillas', bx, by);
  else {
    const f = b.dir && m.mode === 'play' ? (frame >> 3) & 1 : 0;
    const vista = b.face === 'up' ? 'espalda' : b.face === 'down' ? 'frente' : 'lado';
    const alpha = m.vanish > 0 ? (m.vanish < 60 && (frame >> 2) % 2 ? 0.7 : 0.35) : 1;
    drawSprite(ctx, `bunny.${vista}.${f}`, bx, by, { flip: b.face === 'left', alpha });
  }
}

export const hyperPct = (m) => m.hyper / hyperSteps(m.nivel);
export { TEMAS };
