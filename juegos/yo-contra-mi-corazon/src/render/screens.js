// F9 / F11: pantallas fuera de la pelea. Cada una dibuja y devuelve sus botones [{ id, x, y, w, h }].
import { drawText, wrap } from './text.js';
import { spr } from './sprites.js';
import { rankOf } from '../game/match.js';

const W = 180, YEL = '#ffe25c';
export const hit = (btns, x, y) => btns.find((b) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h);

function button(ctx, id, label, y, { w = 120, primary = false, x = (W - w) / 2, h = 18 } = {}) {
  ctx.fillStyle = '#1a0a16'; ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = primary ? '#c8283c' : '#3a2c4c'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = primary ? '#f0606a' : '#5a4870'; ctx.fillRect(x, y, w, 2);
  drawText(ctx, label, x + w / 2, y + (h - 7) / 2 + 1, { align: 'center', color: '#fff' });
  return { id, x, y, w, h };
}

function backdrop(ctx, dim = 0.5) {
  spr(ctx, 'stage', 0, 0);
  ctx.fillStyle = `rgba(10,8,20,${dim})`; ctx.fillRect(0, 0, W, 320);
}

export function drawLoading(ctx, frac, error) {
  backdrop(ctx, 0.6);
  drawText(ctx, 'YO CONTRA', W / 2, 110, { scale: 2, align: 'center' });
  drawText(ctx, 'MI CORAZÓN', W / 2, 128, { scale: 2, align: 'center', color: '#ff6a7a' });
  if (error) {
    wrap(error, 160).forEach((l, i) => drawText(ctx, l, W / 2, 170 + i * 10, { align: 'center', color: '#ff9a9a' }));
    return [button(ctx, 'reintentarCarga', 'REINTENTAR', 210, { primary: true })];
  }
  drawText(ctx, 'AFINANDO LA CANCIÓN…', W / 2, 170, { align: 'center', color: '#cfc8e0' });
  ctx.fillStyle = '#1a0a16'; ctx.fillRect(30, 184, 120, 8);
  ctx.fillStyle = YEL; ctx.fillRect(31, 185, Math.round(118 * frac), 6);
  return [];
}

export function drawTitle(ctx, t, save) {
  backdrop(ctx, 0.35);
  const bob = Math.floor(t * 2.8) % 2;
  spr(ctx, 'heart.idle', 40, 58 - bob);
  ctx.fillStyle = 'rgba(10,8,20,0.75)'; ctx.fillRect(0, 12, W, 40);
  drawText(ctx, 'YO CONTRA', W / 2, 16, { scale: 2, align: 'center' });
  drawText(ctx, 'MI CORAZÓN', W / 2, 34, { scale: 2, align: 'center', color: '#ff6a7a' });
  spr(ctx, 'clown.listo', 40, 150);
  ctx.fillStyle = 'rgba(10,8,20,0.8)'; ctx.fillRect(0, 214, W, 106);
  const b = [button(ctx, 'jugar', '▶ JUGAR', 222, { primary: true })];
  b.push(button(ctx, 'como', 'CÓMO SE JUEGA', 246));
  b.push(button(ctx, 'opciones', 'OPCIONES', 268));
  if (save.best.score) drawText(ctx, `RÉCORD ${save.best.score} · ${save.best.rank}`, W / 2, 292, { align: 'center', color: '#cfc8e0' });
  drawText(ctx, 'HOMENAJE NO OFICIAL', W / 2, 302, { align: 'center', color: '#a89cc0' });
  drawText(ctx, '@COLORESRUIDOSOS', W / 2, 311, { align: 'center', color: YEL });
  return b;
}

const HOWTO = [
  ['icon', 'EL CORAZÓN BRILLA ANTES DE PEGAR. ¡FÍJATE DE QUÉ LADO SUBE EL PUÑO!'],
  ['izq', 'DESLIZA AL LADO CONTRARIO DEL PUÑO PARA ESQUIVAR.'],
  ['abajo', 'SI SE INFLA Y LE BRILLAN LAS VENAS (LATIDO), DESLIZA HACIA ABAJO.'],
  ['tap', 'SI ESQUIVAS, QUEDA ABIERTO: TOCA LA PANTALLA AL RITMO PARA BATEAR.'],
  ['mic', 'CON 5 ESTRELLAS DEL PÚBLICO, TOCA EL MICRÓFONO: ¡GRITO!'],
];
export function drawHowTo(ctx) {
  backdrop(ctx, 0.82);
  drawText(ctx, 'CÓMO SE JUEGA', W / 2, 12, { scale: 2, align: 'center', color: YEL });
  let y = 38;
  for (const [, txt] of HOWTO) {
    const lines = wrap(txt, 168);
    ctx.fillStyle = YEL; ctx.fillRect(6, y + 2, 3, 3);
    lines.forEach((l, i) => drawText(ctx, l, 13, y + i * 10));
    y += lines.length * 10 + 9;
  }
  drawText(ctx, 'EN PC: FLECHAS, ESPACIO Y M', W / 2, y + 2, { align: 'center', color: '#a89cc0' });
  return [button(ctx, 'listo', '¡A ESCENA!', 286, { primary: true })];
}

export function drawOptions(ctx, opts) {
  backdrop(ctx, 0.82);
  drawText(ctx, 'OPCIONES', W / 2, 16, { scale: 2, align: 'center', color: YEL });
  const yes = (v) => (v ? 'SÍ' : 'NO');
  const b = [];
  b.push(button(ctx, 'sinDestellos', `SIN DESTELLOS: ${yes(opts.sinDestellos)}`, 50, { w: 160 }));
  b.push(button(ctx, 'asistido', `MODO ASISTIDO: ${yes(opts.asistido)}`, 76, { w: 160 }));
  drawText(ctx, 'VENTANAS DOBLES Y NO PIERDES VIDA', W / 2, 98, { align: 'center', color: '#a89cc0' });
  b.push(button(ctx, 'vibracion', `VIBRACIÓN: ${yes(opts.vibracion)}`, 112, { w: 160 }));
  drawText(ctx, `DESFASE DEL AUDIO: ${opts.desfase > 0 ? '+' : ''}${opts.desfase} MS`, W / 2, 144, { align: 'center' });
  b.push(button(ctx, 'desfaseMenos', '-10', 156, { w: 50, x: 30 }));
  b.push(button(ctx, 'desfaseMas', '+10', 156, { w: 50, x: 100 }));
  wrap('SI SIENTES QUE TUS TOQUES LLEGAN TARDE, SUBE EL DESFASE; SI LLEGAN ANTES, BÁJALO.', 160)
    .forEach((l, i) => drawText(ctx, l, W / 2, 182 + i * 10, { align: 'center', color: '#a89cc0' }));
  b.push(button(ctx, 'volver', 'VOLVER', 270, { primary: true }));
  return b;
}

export function drawPause(ctx) {
  ctx.fillStyle = 'rgba(10,8,20,0.75)'; ctx.fillRect(0, 0, W, 320);
  drawText(ctx, 'PAUSA', W / 2, 100, { scale: 3, align: 'center', color: YEL });
  return [
    button(ctx, 'continuar', 'CONTINUAR', 150, { primary: true }),
    button(ctx, 'reiniciar', 'REINICIAR', 176),
    button(ctx, 'salir', 'SALIR', 202),
  ];
}

export function drawCountdown(ctx, n) {
  ctx.fillStyle = 'rgba(10,8,20,0.5)'; ctx.fillRect(0, 0, W, 320);
  drawText(ctx, String(n), W / 2, 130, { scale: 5, align: 'center', color: YEL });
}

export function drawRotate(ctx) {
  ctx.fillStyle = '#0e0c1c'; ctx.fillRect(0, 0, W, 320);
  drawText(ctx, 'GIRA TU CELULAR', W / 2, 150, { scale: 2, align: 'center', color: YEL });
  drawText(ctx, 'SE JUEGA EN VERTICAL', W / 2, 172, { align: 'center' });
}

const TITLES = { ko: ['¡K.O.!', YEL], decision: ['¡GANAS POR DECISIÓN!', YEL], derrota: ['SE ACABÓ EL SHOW', '#ff7080'], perdio: ['PERDISTE POR DECISIÓN', '#ff7080'] };
export function drawResult(ctx, m, { newRecord, shareMsg }) {
  ctx.fillStyle = 'rgba(10,8,20,0.94)'; ctx.fillRect(0, 0, W, 320);
  const [title, col] = TITLES[m.over] || ['FIN', '#fff'];
  drawText(ctx, title, W / 2, 30, { scale: title.length > 10 ? 1 : 3, align: 'center', color: col });
  const rank = rankOf(m.score);
  drawText(ctx, rank, W / 2, 64, { scale: rank.length > 14 ? 1 : 2, align: 'center' });
  drawText(ctx, `${m.score} PUNTOS`, W / 2, 86, { scale: 2, align: 'center', color: YEL });
  if (newRecord) drawText(ctx, '¡NUEVO RÉCORD!', W / 2, 106, { align: 'center', color: '#9cff7a' });
  const s = m.stats;
  const rows = [['PERFECTOS', s.perfecto], ['BIEN', s.bien], ['BATAZOS', s.batazos], ['COMBO MÁXIMO', m.maxCombo], ['GOLPES RECIBIDOS', s.golpes], ['FASE ALCANZADA', m.phase]];
  rows.forEach(([k, v], i) => { drawText(ctx, k, 26, 122 + i * 11, { color: '#cfc8e0' }); drawText(ctx, String(v), 154, 122 + i * 11, { align: 'right' }); });
  const b = [button(ctx, 'reintentar', 'REINTENTAR', 200, { primary: true }), button(ctx, 'compartir', 'COMPARTIR RESULTADO', 224, { w: 150 }), button(ctx, 'inicio', 'INICIO', 248)];
  if (shareMsg) drawText(ctx, shareMsg, W / 2, 274, { align: 'center', color: '#9cff7a' });
  drawText(ctx, 'HOMENAJE NO OFICIAL', W / 2, 296, { align: 'center', color: '#a89cc0' });
  drawText(ctx, '@COLORESRUIDOSOS', W / 2, 306, { align: 'center', color: YEL });
  return b;
}
