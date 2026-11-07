// fan.js — el fan de Colores Ruidosos: sprite ASCII de ~16×29 mirando a la derecha, con bufanda rosa protegida
import { C, T, sprFromRows } from './px.js';

const MAP = {
  h: C.night, H: C.dslate, f: C.skin, F: C.skinS, e: C.ink, m: C.brown,
  s: C.pk, S: C.pkD, L: C.pkL,
  t: C.bBlue, T: C.navy, p: C.dslate, P: C.night, b: C.ink, w: C.silver,
};
const HEAD = [
  '.....hhhhh......',
  '...hhhhhhhhh....',
  '..hhHHHhhhhhh...',
  '..hhHhhhhhhhhh..',
  '.hhhhhhhhhfffh..',
  '.hhhhhhhfffeff..',
  '.hhhhhhFfffeff..',
  '..hhhhhFffffff..',
  '..hhhhFfffffF...',
  '...hh.FFfffm....',
  '......FFfff.....',
];
const TORSO = [
  '....ssssssss....',
  '...sLLssssss....',
  '....tssssssS....',
  '....ttttttTt....',
  '....ttttttTt....',
  '....tttFfTTt....',
  '....tttFFTtt....',
  '....tttttttt....',
  '....pppppppp....',
];
const TORSO_UP = [                       // brazos arriba (festejo)
  '.ff.ssssssss.ff.',
  '.tt.LLssssss.tt.',
  '..ttssssssSStt..',
  '...tttttttTtt...',
  '....ttttttTt....',
  '....ttttttTt....',
  '....tttttTTt....',
  '....tttttttt....',
  '....pppppppp....',
];
const TORSO_OUT = [                      // brazos abiertos (equilibrio en la cuerda)
  '....ssssssss....',
  '...sLLssssss....',
  'Fttttsssssssttff',
  '....ttttttTt....',
  '....ttttttTt....',
  '....ttttttTt....',
  '....tttttTTt....',
  '....tttttttt....',
  '....pppppppp....',
];
const LEGS = {
  stand: ['....pppPpppp....', '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....', '....bbb..bbbb...', '....bbbb.bbbbb..', '....wwww.wwwww..'],
  w1: ['....pppPpppp....', '...ppp...ppp....', '..ppp.....ppp...', '..pp.......ppp..', '.bbb........bbbb', '.bbbb.......bbbb', '.www........wwww'],
  w2: ['....pppPpppp....', '.....ppppp......', '.....pppp.......', '.....ppp........', '.....bbbbb......', '.....bbbbbb.....', '.....wwwwww.....'],
  w3: ['....pppPpppp....', '...ppp...ppp....', '...pp.....ppp...', '..ppp......pp...', '.bbbb......bbbb.', '.bbbb......bbbbb', '.wwww......wwwww'],
  tuck: ['....pppPpppp....', '...pppppppppp...', '...bbbb..bbbb...', '...wwww..wwww...', '................', '................', '................'],
  crouch: ['...pppPppppp....', '..pppp...pppp...', '..bbbbb..bbbbb..', '..wwwww..wwwww..', '................', '................', '................'],
};
// cola de la bufanda: 3 cuadros escalonados (12 fps), a la izquierda del cuello
const TAILS = [
  [[3, 11, 'S'], [2, 11, 's'], [1, 12, 'S'], [0, 12, 's'], [0, 13, 'S']],
  [[3, 11, 'S'], [2, 12, 's'], [1, 12, 'S'], [0, 13, 's'], [1, 13, 'S']],
  [[3, 11, 'S'], [2, 11, 's'], [1, 11, 'S'], [0, 12, 's'], [0, 11, 'S']],
];

const cache = new Map();
// pose: 'stand' | 'walk' | 'out' | 'up' | 'jump' | 'crouch' ; fr: cuadro de caminata 0..3 ; tail 0..2 ; breath 0/1 ; blink
export function fanSprite(pose = 'stand', fr = 0, tail = 0, breath = 0, blink = false, flip = false) {
  const key = [pose, fr, tail, breath, blink, flip].join();
  if (cache.has(key)) return cache.get(key);
  let head = HEAD.slice();
  if (blink) head = head.map(r => r.replace(/e/g, 'f'));
  const torso = pose === 'up' || pose === 'jump' ? TORSO_UP : pose === 'out' ? TORSO_OUT : TORSO;
  const legs = pose === 'walk' || pose === 'out' ? LEGS[['w1', 'w2', 'w3', 'w2'][fr & 3]] : pose === 'jump' ? LEGS.tuck : pose === 'crouch' ? LEGS.crouch : LEGS.stand;
  let rows = [...head, ...torso, ...legs];
  if (pose === 'crouch') rows = ['................', ...rows.slice(0, rows.length - 1)];
  if (breath) rows = ['................', ...rows.slice(0, 18), ...rows.slice(19)];  // respiración: cabeza y hombros bajan 1 px
  rows = rows.map(r => r.split(''));
  for (const [x, y, ch] of TAILS[tail % 3]) if (rows[y] && rows[y][x] === '.') rows[y][x] = ch;
  const spr = sprFromRows(rows.map(r => r.join('')), MAP);
  const out = outline(spr, C.ink);
  const res = flip ? mirror(out) : out;
  cache.set(key, res); return res;
}
// contorno global de 1 px en tinta
export function outline(s, col) {
  const w = s.w + 2, h = s.h + 2, d = new Uint8Array(w * h).fill(T);
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) { const c = s.d[y * s.w + x]; if (c !== T) d[(y + 1) * w + x + 1] = c; }
  const o = d.slice();
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (d[y * w + x] !== T) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < w && Y < h && d[Y * w + X] !== T) { o[y * w + x] = col; break; } }
  }
  return { w, h, d: o };
}
function mirror(s) { const d = new Uint8Array(s.w * s.h); for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) d[y * s.w + x] = s.d[y * s.w + s.w - 1 - x]; return { w: s.w, h: s.h, d }; }

// máscaras de las categorías (16×16): pequeña pastel, con flecos, alta con plumas
const MASK_MAP = { k: C.ink, a: C.pink, A: C.rose, b: C.cyan, B: C.blue, y: C.yellow, Y: C.amber, w: C.white, o: C.orange, g: C.lime, G: C.green, e: C.ink, p: C.plum };
export const MASKS = [
  sprFromRows([
    '................', '................', '................', '................',
    '................', '.....kkkkkk.....', '....kaaaaaak....', '...kaawaawaak...',
    '...kaeeaaeeak...', '...kaaaaaaaak...', '....kaaAAaak....', '.....kaaaak.....',
    '......kkkk......', '................', '................', '................'], MASK_MAP),
  sprFromRows([
    '................', '................', '................', '....kkkkkkkk....',
    '...kbbbbbbbbk...', '..kbbwbbbbwbbk..', '..kbeebbbbeebk..', '..kbbbbbbbbbbk..',
    '..kbbbbBBbbbbk..', '...kbbbbbbbbk...', '..kykykykykyk...', '..kyk.ky.ky.k...',
    '...k..k..k..k...', '................', '................', '................'], MASK_MAP),
  sprFromRows([
    '..o..g..a..y..b.', '..oo.gg.aa.yy.bb', '...o..g..a..y.b.', '...kkkkkkkkkkk..',
    '..kYYYYYYYYYYYk.', '..kYwYYYYYYwYYk.', '..kYeeYYYYeeYYk.', '..kYYYYYYYYYYYk.',
    '..kYYYYppYYYYYk.', '...kYYYYYYYYYk..', '....kYYYYYYYk...', '.....kYYYYYk....',
    '......kkkkk.....', '................', '................', '................'], MASK_MAP),
];
