// F9 / F11: pantallas fuera de la pelea. Cada una dibuja y devuelve sus botones [{ id, x, y, w, h }].
import { drawText, wrap } from './text.js';
import { spr } from './sprites.js';
import { rankOf } from '../game/match.js';
import { CIERRE_TEXTO } from '../ranking/temporada.js';
import { BADGES, badgeById } from '../game/badges.js';

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

export function drawTitle(ctx, t, save, temp) {
  backdrop(ctx, 0.35);
  const bob = Math.floor(t * 2.8) % 2;
  spr(ctx, 'heart.idle', 40, 66 - bob);
  ctx.fillStyle = 'rgba(10,8,20,0.75)'; ctx.fillRect(0, 12, W, 40);
  drawText(ctx, 'YO CONTRA', W / 2, 16, { scale: 2, align: 'center' });
  drawText(ctx, 'MI CORAZÓN', W / 2, 34, { scale: 2, align: 'center', color: '#ff6a7a' });
  // F13: anuncio de temporada limitada
  ctx.fillStyle = temp.abierta ? YEL : '#ff7080'; ctx.fillRect(0, 54, W, 31);
  ctx.fillStyle = '#1a0a16'; ctx.fillRect(0, 54, W, 1); ctx.fillRect(0, 84, W, 1);
  const dark = { color: '#1a0a16', shadow: null, align: 'center' };
  if (temp.abierta) {
    drawText(ctx, '¡SOLO ESTA SEMANA!', W / 2, 57, dark);
    drawText(ctx, CIERRE_TEXTO, W / 2, 66, dark);
    if (Math.floor(t * 2) % 2 === 0 || temp.dias > 1) drawText(ctx, temp.aviso, W / 2, 75, { ...dark, color: '#a01828' });
  } else {
    drawText(ctx, temp.aviso, W / 2, 57, dark);
    drawText(ctx, 'GRACIAS POR JUGAR', W / 2, 66, dark);
    drawText(ctx, 'MIRA EL RANKING FINAL', W / 2, 75, dark);
  }
  spr(ctx, 'clown.listo', 40, 150);
  ctx.fillStyle = 'rgba(10,8,20,0.8)'; ctx.fillRect(0, 204, W, 116);
  const b = [];
  if (temp.abierta) {
    b.push(button(ctx, 'jugar', '▶ JUGAR', 208, { primary: true }));
    b.push(button(ctx, 'ranking', 'RANKING', 229));
    b.push(button(ctx, 'como', 'CÓMO SE JUEGA', 250, { w: 86, x: 4 }));
    b.push(button(ctx, 'opciones', 'OPCIONES', 250, { w: 86, x: 90 }));
    b.push(button(ctx, 'insignias', `INSIGNIAS ${Object.keys(save.insignias || {}).length}/10`, 271));
  } else {
    b.push(button(ctx, 'ranking', 'RANKING FINAL', 230, { primary: true }));
    b.push(button(ctx, 'insignias', `INSIGNIAS ${Object.keys(save.insignias || {}).length}/10`, 254));
  }
  if (save.best.score) drawText(ctx, `TU RÉCORD: ${save.best.score}`, W / 2, 293, { align: 'center', color: '#cfc8e0' });
  drawText(ctx, 'HOMENAJE NO OFICIAL', W / 2, 303, { align: 'center', color: '#a89cc0' });
  drawText(ctx, '@COLORESRUIDOSOS', W / 2, 312, { align: 'center', color: YEL });
  return b;
}

const HOWTO = [
  ['icon', 'EL CORAZÓN BRILLA ANTES DE PEGAR. ¡FÍJATE DE QUÉ LADO SUBE EL PUÑO!'],
  ['izq', 'DESLIZA AL LADO CONTRARIO DEL PUÑO PARA ESQUIVAR.'],
  ['abajo', 'SI SE INFLA Y LE BRILLAN LAS VENAS (LATIDO), DESLIZA HACIA ABAJO.'],
  ['tap', 'SI ESQUIVAS, QUEDA ABIERTO: TOCA CUANDO EL ARO LLEGUE AL CÍRCULO VERDE.'],
  ['mic', 'CON 5 ESTRELLAS DEL PÚBLICO, TOCA EL MICRÓFONO: ¡GRITO!'],
  ['meta', 'GANAS SI VACÍAS SUS 3 BARRAS (K.O.) O SI AL FINAL TU «DAÑO» ESTÁ EN VERDE.'],
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
export function drawResult(ctx, m, { newRecord, shareMsg, published, temp, ranking, tip, nuevas = [] }) {
  ctx.fillStyle = 'rgba(10,8,20,0.94)'; ctx.fillRect(0, 0, W, 320);
  const [title, col] = TITLES[m.over] || ['FIN', '#fff'];
  drawText(ctx, title, W / 2, 22, { scale: title.length > 10 ? 1 : 3, align: 'center', color: col });
  const rank = rankOf(m.score);
  drawText(ctx, rank, W / 2, 52, { scale: rank.length > 14 ? 1 : 2, align: 'center' });
  drawText(ctx, `${m.score} PUNTOS`, W / 2, 72, { scale: 2, align: 'center', color: YEL });
  if (newRecord) drawText(ctx, '¡NUEVO RÉCORD!', W / 2, 91, { align: 'center', color: '#9cff7a' });
  const s = m.stats;
  if (nuevas.length) {   // F15: insignias ganadas en esta partida (se ven 2; el total va en el título)
    drawText(ctx, nuevas.length > 1 ? `¡${nuevas.length} INSIGNIAS NUEVAS!` : '¡INSIGNIA NUEVA!', W / 2, 101, { align: 'center', color: '#9cff7a' });
    nuevas.slice(0, 2).forEach((id, i) => {
      const y = 111 + i * 18;
      ctx.fillStyle = '#2c2238'; ctx.fillRect(14, y - 1, W - 28, 17);
      spr(ctx, 'badge.' + id, 16, y - 1);
      drawText(ctx, badgeById(id).nombre, 36, y + 4, { color: YEL });
    });
  } else if (tip) {
    drawText(ctx, 'CONSEJO:', W / 2, 102, { align: 'center', color: YEL });
    wrap(tip, 168).slice(0, 4).forEach((l, i) => drawText(ctx, l, W / 2, 112 + i * 9, { align: 'center', color: '#cfc8e0' }));
  } else {
    const rows = [['PERFECTOS', s.perfecto], ['COMBO MÁXIMO', m.maxCombo], ['GOLPES RECIBIDOS', s.golpes], ['FASE ALCANZADA', m.phase]];
    rows.forEach(([k, v], i) => { drawText(ctx, k, 26, 106 + i * 10, { color: '#cfc8e0' }); drawText(ctx, String(v), 154, 106 + i * 10, { align: 'right' }); });
  }
  const b = [button(ctx, 'reintentar', 'REINTENTAR', 152, { primary: true })];
  if (ranking && temp.abierta && !published && m.score > 0) b.push(button(ctx, 'publicar', '★ PUBLICAR EN EL RANKING', 174, { w: 160 }));
  else if (published) drawText(ctx, '¡PUBLICADO EN EL RANKING!', W / 2, 180, { align: 'center', color: '#9cff7a' });
  b.push(button(ctx, 'ranking', 'VER RANKING', 196));
  b.push(button(ctx, 'compartir', 'COMPARTIR RESULTADO', 218, { w: 150 }));
  b.push(button(ctx, 'inicio', 'INICIO', 240));
  if (shareMsg) drawText(ctx, shareMsg, W / 2, 264, { align: 'center', color: '#9cff7a' });
  drawText(ctx, temp.abierta ? 'CIERRA EL DOMINGO 15 DE NOV' : 'EL RANKING YA CERRÓ', W / 2, 278, { align: 'center', color: '#ff9aa8' });
  drawText(ctx, 'HOMENAJE NO OFICIAL', W / 2, 296, { align: 'center', color: '#a89cc0' });
  drawText(ctx, '@COLORESRUIDOSOS', W / 2, 306, { align: 'center', color: YEL });
  return b;
}

const ERRORES = {
  'no-listo': 'EL RANKING AÚN NO ESTÁ DISPONIBLE. ¡VUELVE PRONTO!',
  red: 'SIN CONEXIÓN CON EL RANKING. INTENTA DE NUEVO.',
  limite: 'DEMASIADOS ENVÍOS. INTENTA EN UNA HORA.',
  cerrado: 'EL RANKING YA CERRÓ.',
};
const errorTexto = (e) => ERRORES[e] || 'NO SE PUDO PUBLICAR. INTENTA DE NUEVO.';

export function drawPublish(ctx, m, opciones, elegido, pub, prueba) {
  backdrop(ctx, 0.88);
  drawText(ctx, 'PUBLICAR', W / 2, 16, { scale: 2, align: 'center', color: YEL });
  drawText(ctx, `${m.score} PUNTOS`, W / 2, 38, { align: 'center' });
  drawText(ctx, 'ELIGE TU NOMBRE:', W / 2, 54, { align: 'center', color: '#cfc8e0' });
  const b = [];
  opciones.forEach((n, i) => {
    const y = 66 + i * 21, sel = n === elegido;
    ctx.fillStyle = sel ? YEL : '#1a0a16'; ctx.fillRect(5, y - 1, W - 10, 19);
    ctx.fillStyle = sel ? '#3a2c10' : '#2c2238'; ctx.fillRect(6, y, W - 12, 17);
    drawText(ctx, (sel ? '▶ ' : '') + n, W / 2, y + 5, { align: 'center', color: sel ? YEL : '#fff' });
    b.push({ id: 'opcion' + i, x: 5, y: y - 1, w: W - 10, h: 19 });
  });
  b.push(button(ctx, 'otrasOpciones', 'OTRAS OPCIONES', 132, { w: 110 }));
  wrap('SOLO SE ENVÍAN NOMBRE, PUNTOS, TIEMPO Y FECHA.', 166)
    .forEach((l, i) => drawText(ctx, l, W / 2, 158 + i * 10, { align: 'center', color: '#a89cc0' }));
  if (prueba) drawText(ctx, 'PRUEBA: SOLO SE GUARDA AQUÍ', W / 2, 182, { align: 'center', color: '#ff9ac8' });
  if (pub.status === 'enviando') drawText(ctx, 'ENVIANDO…', W / 2, 198, { align: 'center', color: YEL });
  else {
    if (pub.error) wrap(errorTexto(pub.error), 166).forEach((l, i) => drawText(ctx, l, W / 2, 190 + i * 10, { align: 'center', color: '#ff7080' }));
    b.push(button(ctx, 'enviar', 'PUBLICAR', 214, { primary: true }));
  }
  b.push(button(ctx, 'cancelarPub', 'CANCELAR', 238));
  return b;
}

export function drawRanking(ctx, rk, { miNombre, prueba, temp, nueva = null }) {
  backdrop(ctx, 0.9);
  drawText(ctx, 'RANKING', W / 2, 10, { scale: 2, align: 'center', color: YEL });
  drawText(ctx, temp.abierta ? 'TOP 20 DE LA SEMANA' : 'RANKING FINAL', W / 2, 28, { align: 'center' });
  if (prueba) drawText(ctx, 'PRUEBA: SOLO EN ESTE NAVEGADOR', W / 2, 38, { align: 'center', color: '#ff9ac8' });
  const b = [];
  if (rk.status === 'cargando') drawText(ctx, 'CARGANDO…', W / 2, 140, { align: 'center', color: '#cfc8e0' });
  else if (rk.error) wrap(errorTexto(rk.error), 160).forEach((l, i) => drawText(ctx, l, W / 2, 130 + i * 10, { align: 'center', color: '#ff9aa8' }));
  else if (!rk.lista.length) drawText(ctx, 'AÚN NO HAY PUNTAJES. ¡SÉ EL PRIMERO!', W / 2, 140, { align: 'center', color: '#cfc8e0' });
  else {
    const pages = Math.ceil(rk.lista.length / 10), page = Math.min(rk.page, pages - 1);
    rk.lista.slice(page * 10, page * 10 + 10).forEach((f, i) => {
      const pos = page * 10 + i + 1, y = 50 + i * 21, mine = f.nombre === miNombre;
      if (mine) { ctx.fillStyle = 'rgba(255,226,92,0.18)'; ctx.fillRect(2, y - 2, W - 4, 20); }
      const c = pos === 1 ? YEL : pos <= 3 ? '#ffb070' : mine ? YEL : '#fff';
      drawText(ctx, `${pos}.`, 20, y, { align: 'right', color: c });
      drawText(ctx, f.nombre, 24, y, { color: c });
      drawText(ctx, `${f.puntos} PTS`, W - 6, y + 9, { align: 'right', color: '#cfc8e0' });
    });
    if (pages > 1) {
      if (page > 0) b.push(button(ctx, 'rkPrev', '◀', 262, { w: 30, x: 20 }));
      drawText(ctx, `${page + 1}/${pages}`, W / 2, 268, { align: 'center', color: '#a89cc0' });
      if (page < pages - 1) b.push(button(ctx, 'rkNext', '▶', 262, { w: 30, x: 130 }));
    }
  }
  if (nueva) {   // F15: «Querido…» se gana al publicar
    ctx.fillStyle = '#2c2238'; ctx.fillRect(10, 275, W - 20, 18);
    spr(ctx, 'badge.' + nueva, 13, 276);
    drawText(ctx, `¡INSIGNIA! ${badgeById(nueva).nombre}`, 33, 281, { color: '#9cff7a' });
  } else if (temp.abierta) drawText(ctx, 'CIERRA EL DOMINGO 15 DE NOV', W / 2, 284, { align: 'center', color: '#ff9aa8' });
  b.push(button(ctx, 'rkVolver', 'VOLVER', 296, { primary: true }));
  return b;
}

// F15: vitrina de insignias
export function drawBadges(ctx, save) {
  backdrop(ctx, 0.9);
  const tiene = save.insignias || {};
  drawText(ctx, `INSIGNIAS ${Object.keys(tiene).length}/10`, W / 2, 8, { scale: 2, align: 'center', color: YEL });
  BADGES.forEach((bd, i) => {
    const y = 28 + i * 26, ok = !!tiene[bd.id];
    ctx.fillStyle = ok ? 'rgba(255,226,92,0.12)' : 'rgba(255,255,255,0.04)'; ctx.fillRect(3, y - 2, W - 6, 23);
    spr(ctx, ok ? 'badge.' + bd.id : 'badge.locked', 6, y + 1);
    drawText(ctx, bd.nombre, 26, y + 1, { color: ok ? YEL : '#8a80a0' });
    drawText(ctx, bd.pista, 26, y + 11, { color: ok ? '#cfc8e0' : '#6a6080', shadow: null });
  });
  return [button(ctx, 'volver', 'VOLVER', 293, { primary: true })];
}
