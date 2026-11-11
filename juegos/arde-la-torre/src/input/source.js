// Interfaz común de entrada (plan §4): toda fuente da { x, y, golpe, salto, especial, pausa }.
// Los botones van «mantenidos»; el «pulsado ahora» se calcula en la simulación comparando con el tick anterior.
export const NEUTRAL = Object.freeze({ x: 0, y: 0, golpe: false, salto: false, especial: false, pausa: false });
export const BUTTONS = ['golpe', 'salto', 'especial', 'pausa'];

const clamp1 = (v) => (v > 1 ? 1 : v < -1 ? -1 : v);

export function normalize(i = {}) {
  return {
    x: clamp1(Number(i.x) || 0), y: clamp1(Number(i.y) || 0),
    golpe: !!i.golpe, salto: !!i.salto, especial: !!i.especial, pausa: !!i.pausa,
  };
}

// Detector de flancos para menús: devuelve qué botones/direcciones se acaban de pulsar.
export function createEdges() {
  let prev = NEUTRAL;
  return (cur) => {
    const e = {
      golpe: cur.golpe && !prev.golpe, salto: cur.salto && !prev.salto,
      especial: cur.especial && !prev.especial, pausa: cur.pausa && !prev.pausa,
      left: cur.x < -0.5 && !(prev.x < -0.5), right: cur.x > 0.5 && !(prev.x > 0.5),
      up: cur.y < -0.5 && !(prev.y < -0.5), down: cur.y > 0.5 && !(prev.y > 0.5),
    };
    prev = cur;
    return e;
  };
}
