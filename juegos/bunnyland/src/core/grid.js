// Rejilla del laberinto: parseo, muros, puerta, casa y túnel (spec F1, F8).
export const WALL = 0, OPEN = 1, DOOR = 2, HOUSE = 3;
export const DIRS = { up: [0, -1], left: [-1, 0], down: [0, 1], right: [1, 0] };
export const DIR_ORDER = ['up', 'left', 'down', 'right'];
export const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

export const mirror = (half) => half.map((h) => h + h.slice(0, 10).split('').reverse().join(''));

export function parseMaze(def) {
  const rows = mirror(def.half);
  const h = rows.length, w = rows[0].length;
  const cells = new Uint8Array(w * h);
  const carrots = [], power = [], house = [], tunnelRows = [];
  let start = null, door = null;
  rows.forEach((r, y) => {
    for (let x = 0; x < w; x++) {
      const c = r[x];
      const t = c === '#' ? WALL : c === '=' ? DOOR : c === 'H' ? HOUSE : OPEN;
      cells[y * w + x] = t;
      if (c === '.') carrots.push([x, y]);
      else if (c === 'o') power.push([x, y]);
      else if (c === 'S') start = { x, y };
      else if (c === '=') door = { x, y };
      else if (c === 'H') house.push({ x, y });
    }
    if (r[0] !== '#' && r[w - 1] !== '#') tunnelRows.push(y);
  });
  const cell = (x, y) => (y < 0 || y >= h ? WALL : cells[y * w + (((x % w) + w) % w)]);
  const cx = Math.floor(w / 2);
  const exit = { x: door.x, y: door.y - 1 };
  const houseCenter = { x: door.x, y: door.y + 1 };
  // Especiales en la columna central: besito arriba, «desaparezco» abajo, bonus bajo la casa.
  const centerOpen = (y) => cell(cx, y) === OPEN;
  let hy = 1; while (!centerOpen(hy)) hy++;
  let vy = h - 2; while (!centerOpen(vy)) vy--;
  let by = houseCenter.y + 2; while (!centerOpen(by)) by++;
  const heart = { x: cx, y: hy }, vanish = { x: cx, y: vy }, bonus = { x: cx, y: by };
  const isSpecial = ([x, y]) => [heart, vanish, bonus, start].some((s) => s.x === x && s.y === y);
  return {
    id: def.id, nombre: def.nombre, rows, w, h, cells, cell,
    carrots: carrots.filter((c) => !isSpecial(c)), power, start, door, exit, house, houseCenter,
    tunnelRows, heart, vanish, bonus,
  };
}

export const wrapX = (g, x) => ((x % g.w) + g.w) % g.w;

export function step(g, x, y, dir) {
  const [dx, dy] = DIRS[dir];
  return [wrapX(g, x + dx), y + dy];
}

// ¿Se puede pisar? La puerta y la casa solo para quien sale o vuelve a la nube.
export function isWalkable(g, x, y, viaDoor = false) {
  const t = g.cell(x, y);
  return t === OPEN || (viaDoor && (t === DOOR || t === HOUSE));
}
