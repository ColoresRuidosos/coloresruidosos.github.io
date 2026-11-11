// Sprites PROVISIONALES dibujados por código (spec §7: el arte final llega con las hojas de Gemini).
// Cada personaje es un esqueleto de articulaciones con poses por estado; se dibuja una vez por pose y se guarda en caché.
// El resultado lleva contorno oscuro y sombreado plano, en el estilo arcade del juego.

const SIZE = 112, FOOT_X = 56, FOOT_Y = 104;
const OUTLINE = '#120c18';

// ---- Aspecto de cada personaje (colores y accesorios). Paletas 1–3: ropa alternativa para repetidos. ----
const HERO_LOOKS = {
  antonio: { skin: '#e8b48c', hair: '#3a2418', hairStyle: 'tupe', top: '#20202a', top2: '#f2efe6', legs: '#2c3e6b', shoes: '#111', inst: 'guitarraEspalda', instColor: '#c8282e', hand: 'mic', beard: true },
  pepe: { skin: '#e0a882', hair: '#1c1410', hairStyle: 'largo', top: '#3d5a80', top2: '#1d2433', legs: '#18181f', shoes: '#3a2a1a', inst: 'bajo', instColor: '#d9822b', beard: true, wide: 2 },
  dani: { skin: '#eab993', hair: '#5a3a22', hairStyle: 'corto', top: '#a3242c', top2: '#16161c', legs: '#1b1b22', shoes: '#ddd', inst: 'guitarra', instColor: '#f1f1f1', thin: 1 },
  jota: { skin: '#dba27c', hair: '#111', hairStyle: 'rapado', top: '#55585f', top2: '#55585f', legs: '#1a1a20', shoes: '#c33', inst: 'baquetas', instColor: '#e2c08a', sleeveless: true, beard: true },
};
const PALETTE_SWAPS = [null, { top: '#2f6d3a', legs: '#3a2b1a' }, { top: '#6b3fa0', legs: '#22303f' }, { top: '#b88a1e', legs: '#3b1f1f' }];

const ENEMY_LOOKS = {
  becario: { skin: '#f0c49c', hair: '#6b4a2a', hairStyle: 'corto', top: '#f4f4f0', tie: '#7d7d86', legs: '#c2b28f', shoes: '#4a3424', earplugs: true, thin: 1 },
  comercial: { skin: '#e7b38e', hair: '#22160f', hairStyle: 'engominado', top: '#8f97a3', top2: '#f4f4f0', tie: '#2b4ea2', legs: '#8f97a3', shoes: '#111', inst: 'maletin' },
  guardia: { skin: '#d9a07a', hair: '#222', hairStyle: 'gorra', top: '#34383f', legs: '#2a2d33', shoes: '#111', inst: 'escudo', wide: 3 },
  contable: { skin: '#f2c8a0', hair: '#8a8a8a', hairStyle: 'calvo', top: '#7a5a3a', top2: '#efe7d4', legs: '#4b4b55', shoes: '#3a2a1a', glasses: true, inst: 'grapadoraMano' },
  ejecutiva: { skin: '#e6ad86', hair: '#2a1a12', hairStyle: 'mono', top: '#1f2f55', top2: '#f4f4f0', legs: '#1f2f55', shoes: '#111', skirt: true },
  jefeSeguridad: { skin: '#c98d66', hair: '#111', hairStyle: 'rapado', top: '#121218', top2: '#f4f4f0', tie: '#111', legs: '#121218', shoes: '#000', sunglasses: true, wide: 4 },
  recepcionista: { skin: '#f0c09a', hair: '#7a2a1a', hairStyle: 'mono', top: '#b0262e', top2: '#f4f4f0', legs: '#262630', shoes: '#111', headset: true, skirt: true, inst: 'telefono' },
  tecnico: { skin: '#d79a72', hair: '#3a2a1a', hairStyle: 'gorra', top: '#e07b1f', legs: '#e07b1f', shoes: '#2a2a2a', inst: 'caja', wide: 4, beard: true },
  director: { skin: '#e2a982', hair: '#444', hairStyle: 'engominado', top: '#2c2f3a', top2: '#f4f4f0', tie: '#a3242c', legs: '#2c2f3a', shoes: '#000', wide: 3, inst: 'maletin' },
  presidente: { skin: '#e8b896', hair: '#d8d8d8', hairStyle: 'engominado', top: '#eeeee6', top2: '#2a2a2a', tie: '#d9b21f', legs: '#eeeee6', shoes: '#5a3a1a', wide: 4, sunglasses: true },
};

export function lookFor(type, palette = 0) {
  const base = HERO_LOOKS[type] || ENEMY_LOOKS[type];
  const sw = HERO_LOOKS[type] && PALETTE_SWAPS[palette % PALETTE_SWAPS.length];
  return sw ? { ...base, ...sw } : base;
}

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

// ---- Poses: ángulos en grados desde la vertical hacia abajo (positivo = hacia delante) ----
// legs: [muslo, espinilla], arms: [brazo, antebrazo]. lean: inclinación del torso. dy: baja la cadera.
const P = (o) => ({ lean: 0, dy: 0, legF: [8, 0], legB: [-8, 0], armF: [30, 120], armB: [15, 110], head: 0, inst: 'rest', ...o });

export function poseFor(state, frame, f = {}) {
  const s = Math.sin(frame * Math.PI / 2);
  switch (state) {
    case 'walk': return P({ legF: [22 * s, 22 * s - 8], legB: [-22 * s, -22 * s - 8], armF: [30 - 15 * s, 115], armB: [15 + 15 * s, 105], dy: frame % 2 });
    case 'run': return P({ lean: 14, legF: [40 * s, 40 * s - 30], legB: [-40 * s, -40 * s - 30], armF: [60 * -s, 100], armB: [60 * s, 100], dy: frame % 2 });
    case 'jump': return P({ legF: [70, -10], legB: [30, -50], armF: [120, 160], armB: [90, 150], dy: -2 });
    case 'air': return P({ lean: -10, legF: [95, 95], legB: [20, -50], armF: [140, 170], armB: [-40, 10] });
    case 'punch1': return P({ lean: 8, legF: [24, 0], legB: [-18, 0], armF: [90, 90], armB: [20, 120] });
    case 'punch2': return P({ lean: 10, legF: [24, 0], legB: [-18, 0], armF: [10, 110], armB: [95, 95] });
    case 'wind': return P({ lean: -8, legF: [18, 0], legB: [-18, 0], armF: [-50, 10], armB: [-30, 40], inst: 'up' });
    case 'swing': return P({ lean: 16, legF: [30, 0], legB: [-24, 0], armF: [100, 100], armB: [90, 95], inst: 'swing' });
    case 'dash': return P({ lean: 24, legF: [50, 10], legB: [-40, -20], armF: [90, 90], armB: [80, 90], inst: 'swing' });
    case 'grab': return P({ lean: 6, legF: [16, 0], legB: [-16, 0], armF: [70, 70], armB: [65, 70] });
    case 'knee': return P({ lean: 6, legF: [85, -5], legB: [-6, 0], armF: [70, 60], armB: [65, 60] });
    case 'throw': return P({ lean: -14, legF: [20, 0], legB: [-24, 0], armF: [-60, -40], armB: [-50, -30] });
    case 'grabbed': return P({ lean: -14, legF: [6, 6], legB: [-4, 6], armF: [-20, -10], armB: [-30, -20], head: -10 });
    case 'hurt': return P({ lean: -18, legF: [16, 0], legB: [-20, 0], armF: [-30, -20], armB: [-50, -40], head: -15 });
    case 'block': return P({ lean: -4, legF: [16, 0], legB: [-16, 0], armF: [70, 160], armB: [60, 150], inst: 'block' });
    case 'charge': return P({ lean: 28, legF: [45 * s, 20], legB: [-45 * s, -30], armF: [-30, 0], armB: [-40, 0], head: 15, inst: 'swing' });
    case 'rise': return P({ lean: 28, dy: 10, legF: [70, -50], legB: [10, -70], armF: [40, 60], armB: [30, 50] });
    case 'down': return P({ lean: 0, legF: [4, 0], legB: [-4, 0], armF: [170, 170], armB: [150, 160], head: 5 });
    case 'victory': return P({ legF: [12, 0], legB: [-12, 0], armF: [175, 175], armB: [20, 90], inst: 'raise', dy: frame % 2 ? -1 : 0 });
    case 'special': {
      const k = f.hero || '';
      if (k === 'antonio') return P({ lean: -12, legF: [22, 0], legB: [-22, 0], armF: [150, 175], armB: [-60, -30], head: -12, inst: 'mic' });
      if (k === 'pepe') return frame < 2 ? P({ lean: -10, armF: [175, 170], armB: [170, 165], inst: 'up', legF: [20, 0], legB: [-20, 0] })
        : P({ lean: 30, dy: 6, armF: [80, 70], armB: [75, 70], inst: 'slam', legF: [40, -20], legB: [-30, -10] });
      if (k === 'dani') return P({ lean: 8, legF: [20, 0], legB: [-20, 0], armF: [90, 90], armB: [90, 90], inst: 'swing' });
      if (k === 'jota') return frame % 2 ? P({ armF: [100, 100], armB: [40, 120], legF: [20, 0], legB: [-20, 0] }) : P({ armF: [40, 120], armB: [100, 100], legF: [20, 0], legB: [-20, 0] });
      return P({ armF: [150, 170], armB: [150, 170] });
    }
    default: return P({ dy: frame % 2 ? 1 : 0, armF: [35, 140], armB: [20, 125] });   // idle: guardia
  }
}

// ---- Dibujo ----
function limb(ctx, x0, y0, x1, y1, w, col) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
}
const rad = (d) => (d * Math.PI) / 180;
const dirOf = (deg) => [Math.sin(rad(deg)), Math.cos(rad(deg))];   // 0° = abajo, 90° = delante, 180° = arriba

function drawInstrument(ctx, look, kind, hand, shoulder, hip, pose, h) {
  const c = look.instColor || '#999';
  const mode = pose.inst;
  ctx.save();
  if (kind === 'mic' || look.hand === 'mic') {
    ctx.fillStyle = '#222'; ctx.fillRect(hand[0] - 1, hand[1] - 1, 3, 6);
    ctx.fillStyle = '#bbb'; ctx.beginPath(); ctx.arc(hand[0] + 1, hand[1] - 2, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  const neck = (x0, y0, ang, len, body, bodyW, bodyH, col) => {
    ctx.translate(x0, y0); ctx.rotate(ang);
    ctx.fillStyle = '#5a3a1e'; ctx.fillRect(-1, -len, 3, len);
    ctx.fillStyle = '#2a1a0e'; ctx.fillRect(-2, -len - 3, 5, 4);
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, body, bodyW, bodyH, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = shade(col.startsWith('#') ? col : '#888888', 0.7); ctx.beginPath(); ctx.ellipse(0, body + 1, bodyW * 0.45, bodyH * 0.35, 0, 0, Math.PI * 2); ctx.fill();
  };
  switch (look.inst) {
    case 'guitarraEspalda':
      if (mode === 'swing' || mode === 'up' || mode === 'raise') {
        const ang = mode === 'swing' ? rad(75) : mode === 'raise' ? rad(-20) : rad(-50);
        neck(hand[0], hand[1], ang, h * 0.34, 6, 7, 9, c);
      } else {
        ctx.save(); neck(shoulder[0] - 7, shoulder[1] + 14, rad(-35), h * 0.3, 4, 6, 8, c); ctx.restore();
      }
      break;
    case 'guitarra':
    case 'bajo': {
      const big = look.inst === 'bajo' ? 1.25 : 1;
      let ang = rad(-62), x = (hand[0] + hip[0]) / 2, y = hip[1] - 4;
      if (mode === 'swing' || mode === 'slam') { ang = rad(mode === 'slam' ? 110 : 80); x = hand[0]; y = hand[1]; }
      else if (mode === 'up' || mode === 'raise') { ang = rad(-10); x = hand[0]; y = hand[1]; }
      else if (mode === 'block') { ang = rad(-80); x = hand[0]; y = hand[1] + 6; }
      neck(x, y, ang, h * 0.36 * big, 7 * big, 7 * big, 9 * big, c);
      break;
    }
    case 'baquetas':
      ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.lineCap = 'round';
      for (const [hx, hy, a] of [[hand[0], hand[1], pose.armF[1]], [pose.handB[0], pose.handB[1], pose.armB[1]]]) {
        const [dx, dy] = dirOf(a + 30);
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + dx * 14, hy + dy * 14); ctx.stroke();
      }
      break;
    case 'maletin':
      ctx.fillStyle = '#4a2e1a'; ctx.fillRect(pose.handB[0] - 6, pose.handB[1], 12, 9);
      ctx.fillStyle = '#d9b21f'; ctx.fillRect(pose.handB[0] - 1, pose.handB[1] + 1, 2, 2);
      break;
    case 'escudo':
      ctx.fillStyle = 'rgba(170,210,235,0.55)'; ctx.fillRect(hand[0] - 2, shoulder[1] - 4, 7, h * 0.55);
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(hand[0] - 1, shoulder[1] - 2, 1, h * 0.5);
      break;
    case 'grapadoraMano':
      ctx.fillStyle = '#333'; ctx.fillRect(hand[0] - 2, hand[1] - 3, 8, 4); ctx.fillStyle = '#c33'; ctx.fillRect(hand[0] - 2, hand[1] - 4, 8, 1);
      break;
    case 'telefono':
      ctx.fillStyle = '#e8e2d0'; ctx.fillRect(pose.handB[0] - 4, pose.handB[1] - 2, 9, 5);
      break;
    case 'caja':
      ctx.fillStyle = '#b5281f'; ctx.fillRect(pose.handB[0] - 7, pose.handB[1], 14, 9); ctx.fillStyle = '#333'; ctx.fillRect(pose.handB[0] - 7, pose.handB[1] + 3, 14, 1);
      break;
    default: break;
  }
  ctx.restore();
}

function drawHair(ctx, look, hx, hy, r) {
  ctx.fillStyle = look.hair;
  switch (look.hairStyle) {
    case 'tupe': ctx.beginPath(); ctx.arc(hx, hy - 1, r + 1, Math.PI, 0); ctx.fill(); ctx.fillRect(hx - 1, hy - r - 4, r + 3, 4); ctx.fillRect(hx - r - 1, hy - 1, 3, 5); break;
    case 'largo': ctx.beginPath(); ctx.arc(hx, hy - 1, r + 1.5, Math.PI, 0); ctx.fill(); ctx.fillRect(hx - r - 2, hy - 2, 4, r * 2 + 3); break;
    case 'corto': ctx.beginPath(); ctx.arc(hx, hy - 1, r + 1, Math.PI * 1.05, -0.1); ctx.fill(); break;
    case 'rapado': ctx.beginPath(); ctx.arc(hx, hy - 1, r + 0.5, Math.PI * 1.1, -0.2); ctx.fill(); break;
    case 'engominado': ctx.beginPath(); ctx.arc(hx - 1, hy - 1, r + 1, Math.PI * 1.0, -0.15); ctx.fill(); ctx.fillStyle = '#fff3'; ctx.fillRect(hx - 2, hy - r - 1, 4, 1); break;
    case 'mono': ctx.beginPath(); ctx.arc(hx, hy - 1, r + 1, Math.PI, 0); ctx.fill(); ctx.beginPath(); ctx.arc(hx - r - 1, hy - 3, 3, 0, Math.PI * 2); ctx.fill(); break;
    case 'gorra': ctx.fillStyle = look.top; ctx.beginPath(); ctx.arc(hx, hy - 2, r + 1, Math.PI, 0); ctx.fill(); ctx.fillRect(hx, hy - 3, r + 5, 2); break;
    case 'calvo': ctx.fillRect(hx - r - 1, hy - 1, 2, 4); break;
    default: break;
  }
}

function drawFigure(ctx, look, pose, h) {
  const k = h / 58;
  const wide = (look.wide || 0) - (look.thin || 0);
  const hipY = FOOT_Y - h * 0.47 + pose.dy;
  const legL = h * 0.25;
  const lean = rad(pose.lean);
  const hip = [FOOT_X, hipY];
  const torsoLen = h * 0.33;
  const neck = [hip[0] + Math.sin(lean) * torsoLen, hip[1] - Math.cos(lean) * torsoLen];
  const shoulder = [neck[0], neck[1] + 3 * k];
  const headR = 5.2 * k + wide * 0.15;
  const headC = [neck[0] + Math.sin(lean + rad(pose.head)) * (headR + 1), neck[1] - Math.cos(lean + rad(pose.head)) * (headR + 1)];

  const leg = (a) => {
    const [d1x, d1y] = dirOf(a[0]); const knee = [hip[0] + d1x * legL, hip[1] + d1y * legL];
    const [d2x, d2y] = dirOf(a[1]); const foot = [knee[0] + d2x * legL, knee[1] + d2y * legL];
    return [knee, foot];
  };
  const arm = (a, from) => {
    const L = h * 0.17;
    const [d1x, d1y] = dirOf(a[0]); const elbow = [from[0] + d1x * L, from[1] + d1y * L];
    const [d2x, d2y] = dirOf(a[1]); const hand = [elbow[0] + d2x * L, elbow[1] + d2y * L];
    return [elbow, hand];
  };
  const legW = (5 + wide * 0.5) * k, armW = (4 + wide * 0.4) * k, torsoW = (12 + wide * 1.5) * k;
  const [kneeB, footB] = leg(pose.legB), [kneeF, footF] = leg(pose.legF);
  const [elbowB, handB] = arm(pose.armB, [shoulder[0] - 2, shoulder[1]]);
  const [elbowF, handF] = arm(pose.armF, [shoulder[0] + 2, shoulder[1]]);
  pose.handB = handB;

  // Guitarra a la espalda va detrás de todo
  if (look.inst === 'guitarraEspalda' && !['swing', 'up', 'raise'].includes(pose.inst)) drawInstrument(ctx, look, null, handF, shoulder, hip, pose, h);

  const legsBack = shade(look.legs, 0.7), armsBack = shade(look.sleeveless ? look.skin : look.top, 0.7);
  // pierna y brazo de atrás
  limb(ctx, ...hip, ...kneeB, legW, legsBack); limb(ctx, ...kneeB, ...footB, legW - 1, legsBack);
  ctx.fillStyle = shade(look.shoes, 0.8); ctx.fillRect(footB[0] - 2, footB[1] - 2, 7, 3);
  limb(ctx, shoulder[0] - 2, shoulder[1], ...elbowB, armW, armsBack); limb(ctx, ...elbowB, ...handB, armW - 0.5, shade(look.skin, 0.8));
  if (look.inst === 'maletin' || look.inst === 'telefono' || look.inst === 'caja') drawInstrument(ctx, look, null, handF, shoulder, hip, pose, h);

  // torso
  ctx.save(); ctx.translate(...hip); ctx.rotate(lean);
  ctx.fillStyle = look.skirt ? look.legs : look.legs; ctx.fillRect(-torsoW / 2 + 1, -4, torsoW - 2, 6);
  if (look.skirt) { ctx.fillStyle = look.legs; ctx.beginPath(); ctx.moveTo(-torsoW / 2 - 1, -2); ctx.lineTo(torsoW / 2 + 1, -2); ctx.lineTo(torsoW / 2 + 3, 10 * k); ctx.lineTo(-torsoW / 2 - 3, 10 * k); ctx.fill(); }
  ctx.fillStyle = look.top; ctx.fillRect(-torsoW / 2, -torsoLen, torsoW, torsoLen - 2);
  if (look.top2 && look.top2 !== look.top) { ctx.fillStyle = look.top2; ctx.fillRect(-2 * k, -torsoLen, 5 * k, torsoLen * 0.7); }
  if (look.tie) { ctx.fillStyle = look.tie; ctx.fillRect(0, -torsoLen + 2, 2, torsoLen * 0.55); }
  ctx.fillStyle = shade(look.top, 0.75); ctx.fillRect(-torsoW / 2, -torsoLen, 3, torsoLen - 2);
  ctx.fillStyle = '#0003'; ctx.fillRect(-torsoW / 2, -5, torsoW, 2);   // cinturón
  ctx.restore();

  // cabeza
  ctx.fillStyle = look.skin; ctx.fillRect(neck[0] - 2, neck[1] - 2, 4, 4);
  ctx.beginPath(); ctx.arc(...headC, headR, 0, Math.PI * 2); ctx.fill();
  if (look.beard) { ctx.fillStyle = shade(look.hair, 1.1); ctx.beginPath(); ctx.arc(headC[0] + 1, headC[1] + 1.5, headR * 0.85, 0.1, Math.PI - 0.3); ctx.fill(); }
  drawHair(ctx, look, headC[0], headC[1], headR);
  ctx.fillStyle = '#111'; ctx.fillRect(Math.round(headC[0] + headR * 0.45), Math.round(headC[1] - 1), 1, 2);   // ojo
  if (look.sunglasses) { ctx.fillStyle = '#000'; ctx.fillRect(headC[0], headC[1] - 2, headR + 1, 2); }
  if (look.glasses) { ctx.strokeStyle = '#222'; ctx.lineWidth = 1; ctx.strokeRect(headC[0] + 1.5, headC[1] - 2.5, 3, 3); }
  if (look.earplugs) { ctx.fillStyle = '#ff8a1c'; ctx.fillRect(headC[0] - 1, headC[1], 2, 2); }
  if (look.headset) { ctx.fillStyle = '#222'; ctx.fillRect(headC[0] - 2, headC[1] - 1, 2, 4); ctx.fillRect(headC[0], headC[1] + 3, 4, 1); }

  // pierna y brazo de delante
  limb(ctx, ...hip, ...kneeF, legW, look.legs); limb(ctx, ...kneeF, ...footF, legW - 1, look.legs);
  ctx.fillStyle = look.shoes; ctx.fillRect(footF[0] - 2, footF[1] - 2, 7, 3);
  if (!['guitarraEspalda', 'maletin', 'telefono', 'caja'].includes(look.inst) || ['swing', 'up', 'raise'].includes(pose.inst)) drawInstrument(ctx, look, null, handF, shoulder, hip, pose, h);
  limb(ctx, shoulder[0] + 2, shoulder[1], ...elbowF, armW, look.sleeveless ? look.skin : look.top);
  limb(ctx, ...elbowF, ...handF, armW - 0.5, look.skin);
  if (look.hand === 'mic') drawInstrument(ctx, { inst: 'none', hand: 'mic' }, 'mic', handF, shoulder, hip, pose, h);
}

function outline(canvas) {
  const ctx = canvas.getContext('2d');
  const img = ctx.getImageData(0, 0, SIZE, SIZE), d = img.data;
  const out = new Uint8ClampedArray(d);
  const a = (x, y) => (x < 0 || y < 0 || x >= SIZE || y >= SIZE ? 0 : d[(y * SIZE + x) * 4 + 3]);
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    const i = (y * SIZE + x) * 4;
    if (d[i + 3] > 100) { out[i + 3] = 255; continue; }    // sin semitransparencias: pixel art limpio
    if (a(x + 1, y) > 100 || a(x - 1, y) > 100 || a(x, y + 1) > 100 || a(x, y - 1) > 100) {
      out[i] = 0x12; out[i + 1] = 0x0c; out[i + 2] = 0x18; out[i + 3] = 255;
    } else out[i + 3] = 0;
  }
  img.data.set(out); ctx.putImageData(img, 0, 0);
}

const cache = new Map();
let makeCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
export function setCanvasFactory(fn) { makeCanvas = fn; }

// Devuelve { canvas, ox, oy }: dibújalo en (x − ox, y − oy) para que los pies caigan en (x, y).
export function getSprite(type, palette, state, frame, h, hero) {
  const key = `${type}|${palette}|${state}|${frame}`;
  let s = cache.get(key);
  if (!s) {
    const c = makeCanvas(SIZE, SIZE);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    drawFigure(ctx, lookFor(type, palette), poseFor(state, frame, { hero }), h);
    outline(c);
    s = { canvas: c, ox: FOOT_X, oy: FOOT_Y };
    cache.set(key, s);
  }
  return s;
}

// Retrato para el HUD y la sala: recorta la cabeza del sprite en reposo.
export function getPortrait(type, palette, h) {
  const s = getSprite(type, palette, 'idle', 0, h);
  return { canvas: s.canvas, sx: FOOT_X - 12, sy: FOOT_Y - h - 8, sw: 24, sh: 24 };
}

export { OUTLINE, SIZE };
