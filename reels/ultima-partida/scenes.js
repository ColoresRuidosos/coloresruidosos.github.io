// scenes.js — un escenario por época, dibujado dentro del panel de escena (coordenadas absolutas del framebuffer)
import { C, GBI, T, bayer, hash, clamp } from './px.js';
import { fanSprite } from './fan.js';

export const PANEL = { x: 4, y: 66, w: 172, h: 100 };
const P = PANEL;
const [K, D, S, Wt] = GBI;                     // 4 colores: tinta, pizarra, acero, blanco
const st = (t, fps) => Math.floor(t * fps);
const mod = (n, m) => ((n % m) + m) % m;

function withClip(fb, fn) { const old = fb.clip; fb.clip = [P.x, P.y, P.x + P.w, P.y + P.h]; fn(); fb.clip = old; }
function cloud(fb, x, y, r, a, b) { fb.disc(x, y, r, b); fb.disc(x + r, y - r * .5, r * 1.1, b); fb.disc(x + r * 2.1, y, r * .9, b); fb.disc(x + 1, y - 1, r - 1, a); fb.disc(x + r, y - r * .5 - 1, r * 1.1 - 1, a); fb.disc(x + r * 2.1, y - 1, r * .9 - 1, a); }
function fan(fb, x, y, o) {                    // x,y = pies (centro)
  const s = fanSprite(o.pose, o.fr || 0, o.tail || 0, o.breath || 0, o.blink || false, o.flip || false);
  fb.blit(s, Math.round(x - s.w / 2), Math.round(y - s.h));
}
const blinkAt = t => mod(t, 3.1) < 0.12;
const tail = t => mod(st(t, 12), 3);

// —— 1997 · 4 colores: azotea bajo cielo con nubes y un letrero de neón ——
export function sky97(fb, t, L) {
  withClip(fb, () => {
    fb.gradV(P.x, P.y, P.w, 70, [S, S, Wt, Wt]);
    const cam = Math.round(t * 14);                  // paneo lateral
    for (let i = 0; i < 4; i++) { const x = mod(i * 61 - Math.round(cam * .3), 244) - 40 + P.x, y = P.y + 16 + (i % 2) * 18; cloud(fb, x, y, 6 + (i % 3), Wt, S); }
    for (let i = 0; i < 14; i++) {                   // ciudad lejana
      const x = mod(i * 23 - Math.round(cam * .6), 322) - 30 + P.x, h = 14 + Math.floor(hash(i, 3) * 22);
      fb.rect(x, P.y + 74 - h, 18, h + 10, D);
      for (let wy = P.y + 78 - h; wy < P.y + 80; wy += 6) for (let wx = x + 3; wx < x + 16; wx += 5) if (hash(i, wx, wy) > .55) fb.rect(wx, wy, 2, 2, S);
    }
    fb.rect(P.x, P.y + 80, P.w, 20, K);              // azotea
    fb.hline(P.x, P.x + P.w, P.y + 80, D);
    for (let x = mod(-cam, 12); x < P.w; x += 12) fb.vline(P.x + x, P.y + 82, P.y + 99, D);
    // letrero de neón: poste + marco que parpadea (sin texto)
    const nx = P.x + mod(150 - cam, 260) - 20, on = !(mod(st(t, 8), 13) === 5 || mod(st(t, 8), 17) === 9);
    fb.rect(nx + 13, P.y + 46, 2, 34, K);
    fb.rect(nx, P.y + 26, 28, 20, K);
    const neon = on ? Wt : D;
    fb.rect(nx + 2, P.y + 28, 24, 1, neon); fb.rect(nx + 2, P.y + 43, 24, 1, neon); fb.rect(nx + 2, P.y + 28, 1, 16, neon); fb.rect(nx + 25, P.y + 28, 1, 16, neon);
    for (let k = 0; k < 3; k++) fb.disc(nx + 8 + k * 6, P.y + 36, 1.5, neon);
    fan(fb, P.x + 52, P.y + 81, { pose: 'walk', fr: st(t, 8), tail: tail(t), blink: blinkAt(t) });
  });
  return { neonOn: true };
}

// —— 2005 · 8 bits: fondo blanco, el fan cruza una cuerda floja; una burbuja roja sube ——
export function line05(fb, t) {
  withClip(fb, () => {
    fb.rect(P.x, P.y, P.w, P.h, C.white);
    for (let i = 0; i < 18; i++) { const x = P.x + Math.floor(hash(i, 7) * P.w), y = P.y + Math.floor(hash(i, 9) * 60); fb.px(x, y, C.silver); }
    const cy = P.y + 78, sag = x => Math.round(4 * Math.sin(Math.PI * (x - P.x) / P.w));
    for (let x = P.x; x < P.x + P.w; x++) fb.px(x, cy + sag(x), C.ink);
    fb.rect(P.x, cy - 30, 4, 60, C.ink); fb.rect(P.x + P.w - 4, cy - 30, 4, 60, C.ink);
    const fx = P.x + 30 + Math.round(t * 18), wob = Math.round(Math.sin(t * 5.3) * 1);
    fan(fb, fx, cy + sag(fx) + 1, { pose: 'out', fr: st(t, 6), tail: tail(t), blink: blinkAt(t + 1) });
    fb.px(fx - 8 + wob, cy + sag(fx) - 18, C.ink);
    // burbuja roja
    const by = P.y + 64 - Math.round(t * 9), bx = P.x + 130 + Math.round(Math.sin(t * 2) * 4);
    fb.disc(bx, by, 9, C.crimson); fb.disc(bx, by, 8, C.red); fb.rect(bx - 4, by - 5, 3, 2, C.white);
    for (let k = 0; k < 14; k++) fb.px(bx + Math.round(Math.sin(k * .7 + t * 3)), by + 9 + k, C.ink);
  });
}

// —— 2009 · 16 bits: baño de azulejos verdes, tina, gotas ——
export function bath09(fb, t) {
  withClip(fb, () => {
    for (let y = 0; y < 70; y++) for (let x = 0; x < P.w; x++) {
      const gx = mod(x, 10), gy = mod(y, 10), grout = gx === 0 || gy === 0;
      const hl = gx === 1 || gy === 1;
      fb.px(P.x + x, P.y + y, grout ? C.dgreen : hl ? C.lime : C.green);
    }
    for (let y = 70; y < P.h; y++) for (let x = 0; x < P.w; x++) fb.px(P.x + x, P.y + y, (mod(x, 12) < 6) !== (mod(y - 70, 12) < 6) ? C.silver : C.white);
    fb.hline(P.x, P.x + P.w, P.y + 70, C.teal);
    // tina
    const tx = P.x + 74, ty = P.y + 50;
    fb.rect(tx, ty, 84, 26, C.steel); fb.rect(tx + 1, ty + 1, 82, 24, C.white); fb.rect(tx + 3, ty + 14, 78, 10, C.silver);
    fb.rect(tx + 4, ty + 3, 76, 4, C.cyan); fb.hline(tx + 6, tx + 40, ty + 3, C.white);
    fb.rect(tx + 6, ty + 26, 4, 4, C.steel); fb.rect(tx + 74, ty + 26, 4, 4, C.steel);
    // pato
    const dk = Math.round(Math.sin(t * 3) * 1);
    fb.rect(tx + 52, ty - 2 + dk, 9, 5, C.yellow); fb.rect(tx + 58, ty - 6 + dk, 5, 5, C.yellow); fb.px(tx + 61, ty - 5 + dk, C.ink); fb.rect(tx + 63, ty - 4 + dk, 2, 2, C.orange);
    // llave y gotas
    fb.rect(tx + 76, ty - 18, 3, 16, C.steel); fb.rect(tx + 70, ty - 18, 8, 3, C.steel); fb.px(tx + 70, ty - 15, C.slate);
    const ph = mod(t, 1); if (ph < .8) fb.rect(tx + 70, ty - 14 + Math.round(ph * 18), 1, 2, C.cyan);
    const s = Math.round(clamp((t - 0.2) / 0.8, 0, 1) * 6);   // tilt de 6 px
    fan(fb, P.x + 44, P.y + 86 - 6 + s, { pose: 'stand', tail: tail(t), breath: mod(st(t, 1 / .6), 2), blink: blinkAt(t + 2) });
  });
}

// —— 2021 · 16 bits: contrapicado entre muros de mosaico azul; el fan rebota en un trampolín ——
export function tramp21(fb, t) {
  withClip(fb, () => {
    const per = 1.0, ph = mod(t, per) / per, hgt = 4 * ph * (1 - ph);   // parábola por pulso
    const jy = Math.round(hgt * 46), cam = Math.round(hgt * 10);        // tilt que sigue el salto
    fb.gradV(P.x, P.y, P.w, P.h, [C.teal, C.cyan, C.cyan, C.white]);
    for (const side of [0, 1]) for (let y = 0; y < P.h; y++) {
      const w = Math.round(46 - y * .22);
      for (let x = 0; x < w; x++) {
        const X = side ? P.x + P.w - 1 - x : P.x + x, cx = mod(x + (y >> 2), 6), cy = mod(y + cam, 6);
        fb.px(X, P.y + y, cx === 0 || cy === 0 ? C.navy : hash(x >> 1, (y + cam) >> 1, side) > .7 ? C.blue : C.bBlue);
      }
    }
    // trampolín visto desde abajo
    const tyy = P.y + 92 + cam, tx = P.x + P.w / 2;
    const squash = ph < .08 || ph > .92;
    fb.rect(tx - 34, tyy, 68, 3, C.ink); fb.rect(tx - 30, tyy + (squash ? 2 : 1), 60, 2, C.night);
    for (const lx of [-30, 30]) fb.rect(tx + lx - 1, tyy + 3, 3, 12, C.ink);
    fan(fb, tx, tyy - jy + (squash ? 2 : 0), { pose: squash ? 'crouch' : 'jump', tail: tail(t), blink: false });
  });
}

// —— Jefe · 1997 · 4 colores: cuarto a oscuras → luz: la cocina forrada de colchones ——
export function kitchen97(fb, t, lit) {
  withClip(fb, () => {
    if (!lit) {
      fb.rect(P.x, P.y, P.w, P.h, K);
      const ex = P.x + 86, ey = P.y + 60;
      if (!blinkAt(t)) { fb.rect(ex, ey, 2, 2, Wt); fb.rect(ex + 6, ey, 2, 2, Wt); }
      return;
    }
    // colores reales elegidos por luminancia: en 4 colores caen en tinta/pizarra/acero/blanco; a todo color se ven
    fb.rect(P.x, P.y, P.w, 76, C.plum);
    for (let y = P.y; y < P.y + 76; y += 4) for (let x = P.x + ((y >> 2) & 1) * 4; x < P.x + P.w; x += 8) fb.px(x, y, C.rose);
    // colchones con acolchado: esquinas redondas, costuras horizontales y botones hundidos
    for (let i = 0; i < 4; i++) {
      const mx = P.x + 4 + i * 42, my = P.y + 5;
      fb.rect(mx + 1, my, 36, 64, C.ink); fb.rect(mx, my + 1, 38, 62, C.ink);
      fb.rect(mx + 2, my + 1, 34, 62, C.sand); fb.rect(mx + 1, my + 2, 36, 60, C.sand);
      fb.rect(mx + 33, my + 3, 3, 58, C.pink);
      for (let y = my + 9; y < my + 62; y += 13) { fb.hline(mx + 3, mx + 34, y, C.pink); for (let bx = mx + 8; bx < mx + 34; bx += 10) { fb.rect(bx, y - 6, 2, 2, C.rose); fb.px(bx - 1, y - 7, C.pink); } }
    }
    fb.rect(P.x, P.y + 76, P.w, 24, C.ink);
    for (let x = P.x; x < P.x + P.w; x += 8) fb.vline(x, P.y + 77, P.y + 99, C.umber);
    fb.hline(P.x, P.x + P.w, P.y + 76, C.steel);
    // estufa con olla y lámpara
    fb.rect(P.x + 120, P.y + 56, 44, 30, C.steel); fb.rect(P.x + 121, P.y + 57, 42, 3, C.white); fb.rect(P.x + 126, P.y + 64, 32, 18, C.slate);
    fb.rect(P.x + 130, P.y + 46, 16, 10, C.red); fb.rect(P.x + 128, P.y + 46, 20, 2, C.ink); fb.rect(P.x + 131, P.y + 48, 3, 6, C.pink);
    fb.vline(P.x + 86, P.y, P.y + 10, C.ink); fb.rect(P.x + 80, P.y + 10, 13, 5, C.ink); fb.rect(P.x + 83, P.y + 15, 7, 2, C.yellow);
    // pie de micrófono
    fb.vline(P.x + 70, P.y + 46, P.y + 86, C.ink); fb.rect(P.x + 66, P.y + 86, 9, 2, C.ink); fb.rect(P.x + 68, P.y + 42, 5, 5, C.slate); fb.rect(P.x + 69, P.y + 43, 3, 3, C.steel);
    fan(fb, P.x + 92, P.y + 88, { pose: lit === 'up' ? 'up' : 'stand', tail: tail(t), blink: blinkAt(t) });
  });
}

// —— Noche en la ciudad (fondo de la pantalla de guardado) ——
export function city(fb, t, x0, y0, w, h) {
  const old = fb.clip; fb.clip = [x0, y0, x0 + w, y0 + h];
  fb.gradV(x0, y0, w, h, [C.ink, C.night, C.night, C.plum, C.rose]);
  for (let i = 0; i < 40; i++) { const x = x0 + Math.floor(hash(i, 21) * w), y = y0 + Math.floor(hash(i, 22) * h * .5); if (mod(st(t, 3) + i, 7)) fb.px(x, y, i % 5 ? C.silver : C.yellow); }
  for (let i = 0; i < 16; i++) {
    const bw = 10 + Math.floor(hash(i, 5) * 10), bh = 20 + Math.floor(hash(i, 6) * (h * .45)), bx = x0 + i * 12 - 4;
    fb.rect(bx, y0 + h - bh, bw, bh, C.ink);
    for (let wy = y0 + h - bh + 3; wy < y0 + h - 2; wy += 5) for (let wx = bx + 2; wx < bx + bw - 2; wx += 4) if (hash(i, wx, wy) > .6) fb.rect(wx, wy, 2, 2, hash(wx, wy) > .5 ? C.amber : C.yellow);
  }
  fb.clip = old;
}
