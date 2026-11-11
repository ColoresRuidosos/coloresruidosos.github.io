// Protocolo entre el móvil y la pantalla (plan §5.2).
// Entradas: binario de 5 bytes [tipo, secuencia, x, y, botones]. Control: objetos JSON por el canal fiable.
export const VERSION = 1;
export const PREFIX = 'arde-la-torre-';
export const T_INPUT = 0xa1;
export const BITS = { golpe: 1, salto: 2, especial: 4, pausa: 8 };

// Sin caracteres que se confundan (O/0, I/1/L).
export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const CODE_LEN = 4;

export function makeCode(random = Math.random) {
  let s = '';
  for (let i = 0; i < CODE_LEN; i++) s += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)];
  return s;
}
export const isCode = (s) => typeof s === 'string' && s.length === CODE_LEN && [...s].every((c) => CODE_ALPHABET.includes(c));
export const normalizeCode = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

const toI8 = (v) => Math.max(-127, Math.min(127, Math.round(v * 127)));

export function encodeInput(inp, seq) {
  const b = new Uint8Array(5);
  b[0] = T_INPUT; b[1] = seq & 255;
  b[2] = toI8(inp.x || 0) & 255; b[3] = toI8(inp.y || 0) & 255;
  b[4] = (inp.golpe ? BITS.golpe : 0) | (inp.salto ? BITS.salto : 0) | (inp.especial ? BITS.especial : 0) | (inp.pausa ? BITS.pausa : 0);
  return b;
}

export function decodeInput(data) {
  let b = data;
  if (b instanceof ArrayBuffer) b = new Uint8Array(b);
  else if (ArrayBuffer.isView(b)) b = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
  else if (Array.isArray(b)) b = Uint8Array.from(b);
  else return null;
  if (b.length !== 5 || b[0] !== T_INPUT) return null;
  const i8 = (v) => (v > 127 ? v - 256 : v) / 127;
  const x = i8(b[2]), y = i8(b[3]);
  return {
    seq: b[1], x: Math.abs(x) < 0.01 ? 0 : x, y: Math.abs(y) < 0.01 ? 0 : y,
    golpe: !!(b[4] & BITS.golpe), salto: !!(b[4] & BITS.salto), especial: !!(b[4] & BITS.especial), pausa: !!(b[4] & BITS.pausa),
  };
}

// ¿`a` es más nuevo que `b` en un contador de 8 bits que da la vuelta?
export const seqNewer = (a, b) => { const d = (a - b) & 255; return d > 0 && d < 128; };

// Mensajes de control válidos (los desconocidos se ignoran).
const CTL = {
  hola: (m) => typeof m.sid === 'string' && m.sid.length >= 6 && m.sid.length <= 40,
  elige: (m) => typeof m.hero === 'string',
  listo: (m) => typeof m.ready === 'boolean',
  ping: () => true,
  bienvenido: (m) => Number.isInteger(m.slot),
  llena: () => true, sala: () => true, estado: () => true, vibra: (m) => Number.isFinite(m.ms), fase: () => true, error: () => true, pong: () => true,
};
export function parseCtl(m) {
  if (!m || typeof m !== 'object' || typeof m.t !== 'string' || !CTL[m.t]) return null;
  return CTL[m.t](m) ? m : null;
}
