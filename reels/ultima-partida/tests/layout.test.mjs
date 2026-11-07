// Zona segura de Reels/TikTok: cada texto de TEXTS(t) cae en x ∈ [6,172]·6 y y ∈ [12,272]·6 (salvo el @ del pie, decorativo).
// Se corre con Chromium: node tests/layout.test.mjs (sirve la carpeta con el mismo servidor que core/render).
// Se corre desde la raíz de la biblioteca: LIB=<ruta> node films/ultima-partida/tests/layout.test.mjs
import { fileURLToPath } from 'node:url';
const DIR = fileURLToPath(new URL('..', import.meta.url));
const LIB = process.env.LIB || fileURLToPath(new URL('../../..', import.meta.url));
const { openDemo, closeServer } = await import(LIB + '/core/render/page.mjs');
const { browser: b, page: pg } = await openDemo(DIR, { w: 1080, h: 1920 });
const errs = [];
const bad = await pg.evaluate(() => { const out = []; for (let t = 0; t < window.DUR; t += 0.1) for (const x of window.TEXTS(t)) {
  if (x.x0 < 6 * 6 || x.x1 > 172 * 6 || x.y0 < 12 * 6 || x.y1 > 272 * 6) out.push(`${t.toFixed(1)} ${x.id} "${x.text}" ${x.x0},${x.y0}-${x.x1},${x.y1}`);
  if (/[?]{2}/.test(x.text)) out.push('glifo raro ' + x.text); } return [...new Set(out)].slice(0, 20); });
await b.close(); await closeServer();
if (errs.length || bad.length) { console.error('FALLA\n' + [...errs, ...bad].join('\n')); process.exit(1); }
console.log('layout OK');
