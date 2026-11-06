// Genera art/source/enemies-sheet.png: hoja de enemigos chibi en SVG, con el mismo formato que la de Pepe
// (fondo liso #474747, una fila por enemigo). Después: scripts/slice_sheet.py → src/data/enemies-atlas.js
import { createRequire } from 'node:module';
import { writeFile, mkdir } from 'node:fs/promises';

const O = '#1b1226';           // contorno (el mismo tono oscuro que la hoja de Pepe)
const SKIN = '#f1c9a0', SKIN2 = '#d9a27a';
const st = `stroke="${O}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"`;

// Extremidad con contorno: trazo ancho oscuro + trazo de color encima.
const limb = (x0, y0, x1, y1, color, w = 22) =>
  `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${O}" stroke-width="${w + 10}" stroke-linecap="round"/>` +
  `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
const shoe = (x, y, color = '#6b3f22', dir = 1) =>
  `<ellipse cx="${x + dir * 6}" cy="${y - 10}" rx="24" ry="13" fill="${color}" ${st}/>`;
const fist = (x, y, color = '#ffffff', r = 15) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" ${st}/>`;
const eye = (x, y, rx = 18, ry = 22, look = 4) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" ${st}/><circle cx="${x + look}" cy="${y + 3}" r="${rx * 0.48}" fill="${O}"/><circle cx="${x + look + 3}" cy="${y - 2}" r="3" fill="#fff"/>`;
const xEye = (x, y) => `<path d="M${x - 12} ${y - 12} L${x + 12} ${y + 12} M${x + 12} ${y - 12} L${x - 12} ${y + 12}" stroke="${O}" stroke-width="8" stroke-linecap="round"/>`;
const steps = [[-28, 0, 28, 0], [-40, -12, 20, 0], [-28, 0, 28, 0], [-20, 0, 40, -12]];

// ── Titular: periódico con patas, gritando su titular ─────────
function titular(phase, ko = false) {
  const [lx, ly, rx, ry] = steps[phase % 4];
  const lines = [];
  for (let y = -148; y <= -60; y += 14) { lines.push(`<rect x="-62" y="${y}" width="${y > -100 ? 40 : 30}" height="5" fill="#9b94a6"/>`); lines.push(`<rect x="22" y="${y}" width="40" height="5" fill="#9b94a6"/>`); }
  const face = ko
    ? xEye(-30, -128) + xEye(30, -128) + `<path d="M-22 -80 q11 -10 22 0 t22 0" fill="none" stroke="${O}" stroke-width="8" stroke-linecap="round"/>`
    : eye(-30, -128) + eye(30, -128) +
      `<path d="M-54 -162 L-12 -150 M54 -162 L12 -150" stroke="${O}" stroke-width="11" stroke-linecap="round"/>` +
      `<ellipse cx="0" cy="-82" rx="26" ry="19" fill="#5a1020" ${st}/><ellipse cx="0" cy="-74" rx="14" ry="7" fill="#e2556b"/><rect x="-16" y="-97" width="32" height="7" rx="2" fill="#fff"/>`;
  const body =
    limb(-28, -50, lx, ly - 18, '#2a2230', 16) + limb(28, -50, rx, ry - 18, '#2a2230', 16) + shoe(lx, ly) + shoe(rx, ry) +
    limb(-72, -130, -104, -96, '#f1ead6', 14) + fist(-108, -92) +
    limb(72, -140, 104, -186 + (phase % 2) * 8, '#f1ead6', 14) + fist(108, -192 + (phase % 2) * 8) +
    `<rect x="-76" y="-216" width="152" height="172" rx="12" fill="#f1ead6" ${st}/>` +
    `<path d="M-76 -60 L76 -60" stroke="#d8cfb8" stroke-width="5"/>` +
    `<rect x="-62" y="-203" width="124" height="28" fill="#2a2230"/>` +
    [0, 1, 2, 3, 4].map((i) => `<rect x="${-54 + i * 22}" y="-196" width="14" height="14" fill="#f1ead6"/>`).join('') +
    lines.join('') + face;
  const tilt = ko ? -28 : [2, 0, -2, 0][phase % 4];
  return `<g transform="rotate(${tilt})">${body}</g>`;
}

// ── Paparazzi: gorra al revés, gafas oscuras, gabardina, cámara ─
function paparazzi(mode, phase = 0) {
  const [lx, ly, rx, ry] = steps[phase ? 3 : 1];
  const legs = limb(-24, -60, lx, ly - 18, '#3a3a46', 22) + limb(24, -60, rx, ry - 18, '#3a3a46', 22) + shoe(lx, ly) + shoe(rx, ry);
  const coat = `<path d="M-56 -158 L56 -158 L70 -54 L-70 -54 Z" fill="#c9a46a" ${st}/>` +
    `<path d="M-56 -158 L-14 -158 L-30 -112 Z M56 -158 L14 -158 L30 -112 Z" fill="#b38d55" ${st}/>` +
    `<rect x="-66" y="-92" width="132" height="12" fill="#8a6a3a"/><circle cx="0" cy="-130" r="5" fill="${O}"/><circle cx="0" cy="-108" r="5" fill="${O}"/>`;
  const head = `<circle cx="0" cy="-222" r="68" fill="${SKIN}" ${st}/>` +
    `<path d="M-70 -228 Q0 -318 70 -228 Z" fill="#2f5d3a" ${st}/><rect x="-96" y="-246" width="34" height="16" rx="6" fill="#244a2e" ${st}/>` +
    `<rect x="-46" y="-232" width="38" height="26" rx="8" fill="#141018" ${st}/><rect x="8" y="-232" width="38" height="26" rx="8" fill="#141018" ${st}/>` +
    `<rect x="-36" y="-228" width="8" height="5" fill="#fff"/><rect x="18" y="-228" width="8" height="5" fill="#fff"/>` +
    `<path d="M-14 -180 Q8 -168 26 -184" fill="none" stroke="${O}" stroke-width="8" stroke-linecap="round"/>`;
  const camAt = (x, y) => `<rect x="${x}" y="${y}" width="62" height="40" rx="6" fill="#22202a" ${st}/>` +
    `<circle cx="${x + 62}" cy="${y + 20}" r="16" fill="#5b6068" ${st}/><circle cx="${x + 64}" cy="${y + 20}" r="7" fill="${O}"/>` +
    `<rect x="${x + 8}" y="${y - 18}" width="28" height="16" rx="3" fill="#3a3a46" ${st}/><rect x="${x + 12}" y="${y - 14}" width="20" height="7" fill="#fff6a8"/>`;
  if (mode === 'ko') {
    return `<g transform="translate(120 -30) rotate(-70)">${legs}${coat}${head.replace(/#141018/g, '#141018')}${camAt(-20, -150)}</g>`;
  }
  if (mode === 'walk') {
    return legs + coat + limb(-56, -150, -76, -100, SKIN, 18) + fist(-78, -96, SKIN, 13) +
      `<path d="M-20 -160 L10 -124 L40 -160" fill="none" stroke="${O}" stroke-width="5"/>` + camAt(-6, -140) +
      limb(56, -150, 72, -104, SKIN, 18) + fist(74, -100, SKIN, 13) + head;
  }
  // Apuntar / disparar: cámara delante de la cara.
  const burst = mode === 'flash'
    ? `<polygon points="${Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 22 : 54; return `${50 + Math.cos(a) * r},${-268 + Math.sin(a) * r}`; }).join(' ')}" fill="#fff6a8" stroke="#f2c94c" stroke-width="5"/><circle cx="50" cy="-268" r="16" fill="#fff"/>`
    : '';
  return legs + coat + head + limb(-40, -150, 20, -200, SKIN, 18) + limb(48, -150, 70, -196, SKIN, 18) +
    camAt(18, -248) + fist(26, -206, SKIN, 13) + fist(74, -204, SKIN, 13) + burst;
}

// ── Reportero: traje, corbata, micrófono sin logo ───────────
function reportero(mode, phase = 0) {
  const spread = mode === 'dash' ? [-56, 0, 50, 0] : steps[phase ? 3 : 1];
  const [lx, ly, rx, ry] = spread;
  const legs = limb(-22, -60, lx, ly - 18, '#26325c', 22) + limb(22, -60, rx, ry - 18, '#26325c', 22) + shoe(lx, ly, '#1e1a22') + shoe(rx, ry, '#1e1a22');
  const suit = `<path d="M-58 -164 L58 -164 L64 -54 L-64 -54 Z" fill="#2f3f73" ${st}/>` +
    `<path d="M-22 -164 L0 -120 L22 -164 Z" fill="#fff" ${st}/><path d="M-6 -150 L6 -150 L10 -96 L0 -84 L-10 -96 Z" fill="#c0392b" ${st}/>`;
  const head = `<circle cx="0" cy="-228" r="66" fill="${SKIN}" ${st}/>` +
    `<path d="M-68 -232 Q-60 -306 10 -298 Q66 -292 68 -236 Q30 -262 -10 -258 Q-40 -256 -68 -232 Z" fill="#3b2a20" ${st}/>` +
    eye(-22, -222, 15, 19, 5) + eye(26, -222, 15, 19, 5) +
    `<path d="M-38 -250 L-8 -256 M12 -256 L42 -250" stroke="${O}" stroke-width="8" stroke-linecap="round"/>` +
    `<ellipse cx="4" cy="-186" rx="11" ry="14" fill="#5a1020" ${st}/>` + `<circle cx="-50" cy="-206" r="9" fill="#f29c8f"/>`;
  const mic = `<line x1="96" y1="-150" x2="122" y2="-184" stroke="${O}" stroke-width="16" stroke-linecap="round"/><line x1="96" y1="-150" x2="122" y2="-184" stroke="#5b6068" stroke-width="9" stroke-linecap="round"/>` +
    `<rect x="102" y="-176" width="22" height="20" fill="#f2c94c" ${st}/><circle cx="128" cy="-192" r="15" fill="#9aa0a8" ${st}/>`;
  const arms = limb(-56, -152, -78, -102, '#2f3f73', 20) + fist(-80, -96, SKIN, 13) + limb(56, -152, 92, -150, '#2f3f73', 20) + fist(98, -150, SKIN, 13);
  const all = legs + suit + arms + mic + head;
  if (mode === 'ko') return `<g transform="translate(-60 -40) rotate(72)">${all.replace(/<ellipse cx="4" cy="-186"[^>]*\/>/, '')}${xEye(-22, -222)}${xEye(26, -222)}</g>`;
  if (mode === 'dash') {
    const lines = [-120, -170, -220].map((y) => `<rect x="-130" y="${y}" width="48" height="8" rx="4" fill="#cfd6e6"/>`).join('');
    return `<g transform="rotate(14)">${all}</g>${lines}`;
  }
  return all;
}

const rows = [
  [titular(0), titular(1), titular(2), titular(3), titular(0, true)],
  [paparazzi('walk', 0), paparazzi('walk', 1), paparazzi('aim'), paparazzi('flash'), paparazzi('ko')],
  [reportero('walk', 0), reportero('walk', 1), reportero('dash'), reportero('ko')],
];
const CW = 340, CH = 420, W = CW * 5, H = CH * rows.length;
const cells = rows.flatMap((r, j) => r.map((svg, i) => `<g transform="translate(${CW * i + CW / 2} ${CH * j + CH - 40})">${svg}</g>`)).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="100%" height="100%" fill="#474747"/>${cells}</svg>`;

await mkdir('art/source', { recursive: true });
await writeFile('art/source/enemies-sheet.svg', svg);
const { chromium } = createRequire(import.meta.url)('playwright');
const b = await chromium.launch();
const pg = await b.newPage({ viewport: { width: W, height: H } });
await pg.setContent(`<html><body style="margin:0">${svg}</body></html>`);
await pg.screenshot({ path: 'art/source/enemies-sheet.png', clip: { x: 0, y: 0, width: W, height: H } });
await b.close();
console.log(`art/source/enemies-sheet.png (${W}×${H})`);
