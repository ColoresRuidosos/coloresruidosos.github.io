// v7 · Museo (puertas y vitrinas), Galería de trajes, Opciones y pausa (spec §3.0f A, C y D).
import { W, H } from '../game/constants.js';
import { text, drawCostume, drawCarmesi } from './draw.js';
import { drawPortrait } from './draw-historia.js';
import { COSTUMES } from '../game/progress.js';
import { worldById } from '../data/worlds.js';

const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
const shade = (hex, k) => {
  const n = parseInt(hex.slice(1), 16), f = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
};

// Puertas del pasillo (se dibujan detrás de Pepe). info[id] = { state, piezas, total }.
// v8: a la izquierda, el retrato de Pepe con sus 8 piezas de identidad.
export function drawMuseumDoors(g, hub, info, t, art = null, worldsDone = []) {
  if (art) drawPortrait(g, art, worldsDone, 22, 52);
  for (const d of hub.doors) {
    const x = d.x, y = d.y;
    if (d.id === 'galeria') {
      R(g, '#1b1226', x - 22, y - 62, 44, 62); R(g, '#c8963c', x - 20, y - 60, 40, 60); R(g, '#7a3b8f', x - 16, y - 54, 32, 54);
      R(g, '#f0c870', x + 9, y - 28, 3, 3);
      text(g, 'GALERÍA', x, y - 76, { align: 'center', color: '#f0c870' });
      text(g, 'DE TRAJES', x, y - 67, { align: 'center', color: '#f0c870' });
      continue;
    }
    const w = worldById(d.id), st = info[d.id]?.state ?? 'soon';
    const open = st === 'open';
    R(g, '#1b1226', x - 20, y - 58, 40, 58);
    R(g, open ? w.color : shade(w.color, 0.35), x - 18, y - 56, 36, 56);
    R(g, open ? shade(w.color, 0.6) : '#1b1226', x - 13, y - 50, 26, 50);
    if (d.id === 'noche') { R(g, '#f2f2f2', x - 18, y - 56, 36, 2); R(g, '#f2f2f2', x - 18, y - 56, 2, 56); R(g, '#f2f2f2', x + 16, y - 56, 2, 56); }
    if (open) R(g, Math.floor(t * 2) % 2 ? '#ffcf7a' : '#e8a23c', x - 2, y - 30, 4, 4);
    else { R(g, '#b9bec6', x - 4, y - 34, 8, 7); R(g, '#1b1226', x - 1, y - 32, 2, 3); R(g, '#b9bec6', x - 3, y - 38, 6, 4); R(g, '#1b1226', x - 1, y - 37, 2, 3); }
    text(g, w.name, x, y - 72, { align: 'center', color: open ? '#ffffff' : '#8a7a9a' });
    text(g, String(w.year), x, y - 63, { align: 'center', color: open ? '#ffcf7a' : '#6c6577' });
    // Vitrina con las piezas recuperadas.
    const inf = info[d.id];
    if (inf && inf.total) {
      R(g, '#1b1226', x - 22, y - 96, 44, 16); R(g, '#c9d6e6', x - 21, y - 95, 42, 14); R(g, '#e8f0fa', x - 21, y - 95, 42, 2);
      if (d.id === 'carmesi') drawCarmesi(g, x - 14, y - 88, 0, 4);
      else { R(g, '#1b1226', x - 18, y - 92, 7, 8); R(g, '#e6e6e6', x - 17, y - 91, 5, 6); }
      text(g, `${inf.piezas}/${inf.total}`, x - 8, y - 92, { color: '#1b1226', shadow: null });
    }
  }
}

// Cabecera del Museo y aviso de la puerta que tiene delante Pepe.
export function drawMuseumHud(g, door, info, record, toast, t) {
  g.globalAlpha = 0.55; R(g, '#12040a', 0, 0, W, 18); g.globalAlpha = 1;
  text(g, 'EL MUSEO', 6, 5, { color: '#ffcf7a' });
  text(g, `RÉCORD ${String(record).padStart(7, '0')}`, W - 6, 5, { align: 'right', color: '#b9c0d0' });
  let msg = null, color = '#ffffff';
  if (door) {
    const st = door.id === 'galeria' ? 'open' : info[door.id]?.state;
    if (st === 'open') { msg = 'B: ENTRAR'; color = '#ffcf7a'; }
    else if (st === 'locked') msg = `TERMINA ${worldById(worldById(door.id).requires).name} PARA ABRIR`;
    else msg = 'PRÓXIMAMENTE';
  }
  if (toast) { msg = toast; color = '#ff9a5a'; }
  if (msg) {
    R(g, '#1b1226', 0, H - 22, W, 22);
    text(g, msg, W / 2, H - 15, { align: 'center', color: msg === 'B: ENTRAR' && Math.floor(t * 3) % 2 ? '#ffffff' : color });
  } else text(g, '◀ ▶ CAMINAR · B DELANTE DE UNA PUERTA', W / 2, H - 12, { align: 'center', color: '#8a7a9a' });
}

// Galería: 9 vitrinas (AUTOMÁTICO + 8 trajes). sel = índice; save = guardado.
export function drawGallery(g, art, save, sel, t) {
  R(g, '#1b1226', 0, 0, W, H);
  text(g, 'GALERÍA DE TRAJES', W / 2, 8, { scale: 2, align: 'center', color: '#f0c870' });
  const items = [{ id: 'auto', name: 'AUTOMÁTICO', how: 'CADA MUNDO CON SU TRAJE' }, ...COSTUMES];
  const cur = items[sel], unlocked = cur.id === 'auto' || save.data.unlocked.includes(cur.id);
  const worn = save.data.costume === cur.id;
  // Vitrina grande con el traje en sus 4 poses.
  R(g, '#3a2848', 40, 30, 240, 92); R(g, '#c9d6e6', 42, 32, 236, 2);
  const poses = ['idle', 'run', 'jump', 'throw'];
  const show = cur.id === 'auto' ? ['clasico', 'vampiro', 'clasico', 'vampiro'] : poses.map(() => cur.id);
  for (let i = 0; i < 4; i++) {
    const x = 70 + i * 60, y = 112;
    // Bloqueado: vitrina vacía con un «?» (no se enseña el traje hasta ganarlo).
    if (unlocked) drawCostume(g, art, show[i], cur.id === 'auto' ? 'idle' : poses[i], x, y);
    else { R(g, '#241830', x - 14, y - 50, 28, 50); text(g, '?', x, y - 32, { scale: 2, align: 'center', color: '#8a7a9a' }); }
  }
  text(g, cur.name, W / 2, 130, { scale: 2, align: 'center', color: unlocked ? '#ffffff' : '#8a7a9a' });
  text(g, unlocked ? (worn ? '★ PUESTO' : 'A: PONÉRMELO') : `RETO: ${cur.how}`, W / 2, 150, { align: 'center', color: unlocked ? '#ffcf7a' : '#ff9a5a' });
  if (cur.id === 'auto' || unlocked) text(g, cur.id === 'auto' ? cur.how : '', W / 2, 161, { align: 'center', color: '#b9a8d6' });
  // Fila de vitrinas pequeñas.
  for (let i = 0; i < items.length; i++) {
    const x = 16 + i * 33, y = 176, it = items[i], on = it.id === 'auto' || save.data.unlocked.includes(it.id);
    R(g, i === sel ? '#ffcf7a' : '#1b1226', x - 1, y - 1, 30, 30);
    R(g, on ? '#3a2848' : '#241830', x, y, 28, 28);
    if (save.data.costume === it.id) R(g, '#d8312b', x, y + 26, 28, 2);
    text(g, on ? (it.id === 'auto' ? 'A' : '★') : '?', x + 14, y + 10, { align: 'center', color: on ? '#ffffff' : '#6c6577' });
  }
  text(g, '◀ ▶ ELEGIR · A PONER · B SALIR', W / 2, H - 9, { align: 'center', color: '#8a7a9a' });
}

export const OPTION_ITEMS = [
  { key: 'flashes', name: 'DESTELLOS', help: 'NO: SIN FLASHES NI PARPADEOS' },
  { key: 'shake', name: 'TEMBLOR DE PANTALLA', help: 'NO: LA CÁMARA NO TIEMBLA' },
  { key: 'assist', name: 'MODO ASISTIDO', help: 'SÍ: NO SE PIERDEN CORAZONES (NO CUENTA PARA RÉCORDS NI RETOS «SIN DAÑO»)' },
  { key: 'music', name: 'MÚSICA Y SONIDO', help: 'TAMBIÉN CON LA TECLA M' },
  { key: 'back', name: 'VOLVER', help: '' },
];
export function drawOptions(g, options, sel, t) {
  g.fillStyle = 'rgba(18,4,10,0.94)'; g.fillRect(0, 0, W, H);
  text(g, 'OPCIONES', W / 2, 14, { scale: 2, align: 'center', color: '#ffcf7a' });
  OPTION_ITEMS.forEach((it, i) => {
    const y = 46 + i * 22, on = i === sel;
    if (on) R(g, '#3a2050', 24, y - 4, W - 48, 16);
    text(g, (on ? '▶ ' : '  ') + it.name, 32, y, { color: on ? '#ffffff' : '#b9a8d6' });
    if (it.key !== 'back') text(g, options[it.key] ? 'SÍ' : 'NO', W - 32, y, { align: 'right', color: options[it.key] ? '#7ad07a' : '#ff9a5a' });
  });
  const help = OPTION_ITEMS[sel].help;
  if (help) {
    const words = help.split(' '); const lines = []; let l = '';
    for (const w of words) { if ((l + ' ' + w).trim().length > 46) { lines.push(l); l = w; } else l = (l + ' ' + w).trim(); }
    lines.push(l);
    lines.forEach((s, i) => text(g, s, W / 2, 162 + i * 10, { align: 'center', color: '#efe8d4' }));
  }
  text(g, '◀ ▶ ELEGIR · A CAMBIAR · B VOLVER', W / 2, H - 12, { align: 'center', color: '#8a7a9a' });
}

export function drawPause(g, t) {
  g.fillStyle = 'rgba(27,18,38,0.78)'; g.fillRect(0, 0, W, H);
  text(g, 'PAUSA', W / 2, 70, { scale: 3, align: 'center', color: '#ffcf7a' });
  text(g, 'A: SEGUIR', W / 2, 110, { align: 'center' });
  text(g, 'B: OPCIONES', W / 2, 122, { align: 'center' });
  text(g, '◀: SALIR AL MUSEO', W / 2, 134, { align: 'center', color: '#b9a8d6' });
}
