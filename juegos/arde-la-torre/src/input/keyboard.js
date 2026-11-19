// Teclado (F9): 2 jugadores en un mismo teclado sin que se pisen.
import { NEUTRAL } from './source.js';

export const KEYMAPS = [
  {
    id: 'kb1', label: 'TECLADO J1 · WASD + F G H',
    left: ['KeyA'], right: ['KeyD'], up: ['KeyW'], down: ['KeyS'],
    golpe: ['KeyF', 'Space'], salto: ['KeyG'], especial: ['KeyH'], pausa: ['Escape', 'KeyP'],
  },
  {
    id: 'kb2', label: 'TECLADO J2 · FLECHAS + K L Ñ',
    left: ['ArrowLeft'], right: ['ArrowRight'], up: ['ArrowUp'], down: ['ArrowDown'],
    golpe: ['KeyK', 'Numpad1', 'Enter'], salto: ['KeyL', 'Numpad2'], especial: ['Semicolon', 'Numpad3'], pausa: ['Numpad0', 'Backspace'],
  },
];

const any = (down, codes) => codes.some((c) => down.has(c));

// Función pura: estado de teclas → entrada.
export function readKeys(down, map) {
  if (!down.size) return NEUTRAL;
  return {
    x: (any(down, map.right) ? 1 : 0) - (any(down, map.left) ? 1 : 0),
    y: (any(down, map.down) ? 1 : 0) - (any(down, map.up) ? 1 : 0),
    golpe: any(down, map.golpe), salto: any(down, map.salto), especial: any(down, map.especial), pausa: any(down, map.pausa),
  };
}

// Recreativa (F23, `?arcade`): distribución por defecto de MAME y de las placas tipo I-PAC.
// Botón 1 = GOLPE, botón 2 = SALTO, botón 3 = ESPECIAL y Start = pausa.
export const ARCADE_KEYMAPS = [
  {
    id: 'kb1', label: 'RECREATIVA J1',
    left: ['ArrowLeft'], right: ['ArrowRight'], up: ['ArrowUp'], down: ['ArrowDown'],
    golpe: ['ControlLeft'], salto: ['AltLeft'], especial: ['Space'], pausa: ['Digit1'],
  },
  {
    id: 'kb2', label: 'RECREATIVA J2',
    left: ['KeyD'], right: ['KeyG'], up: ['KeyR'], down: ['KeyF'],
    golpe: ['KeyA'], salto: ['KeyS'], especial: ['KeyQ'], pausa: ['Digit2'],
  },
];

const codesOf = (maps) => new Set(maps.flatMap((m) => [...m.left, ...m.right, ...m.up, ...m.down, ...m.golpe, ...m.salto, ...m.especial, ...m.pausa]));
export const ALL_CODES = codesOf(KEYMAPS);

export function createKeyboard(target = globalThis.window, maps = KEYMAPS) {
  const down = new Set();
  const codes = codesOf(maps);
  const onDown = (e) => { if (codes.has(e.code)) { e.preventDefault(); down.add(e.code); } };
  const onUp = (e) => { down.delete(e.code); };
  const clear = () => down.clear();
  target.addEventListener('keydown', onDown);
  target.addEventListener('keyup', onUp);
  target.addEventListener('blur', clear);
  return {
    sources: maps.map((m) => ({ key: m.id, kind: 'teclado', label: m.label, read: () => readKeys(down, m) })),
    destroy() { target.removeEventListener('keydown', onDown); target.removeEventListener('keyup', onUp); target.removeEventListener('blur', clear); },
  };
}
