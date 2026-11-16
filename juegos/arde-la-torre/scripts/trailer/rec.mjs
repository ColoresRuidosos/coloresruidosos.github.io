// Tráiler (paso 1): graba escenas del juego con bots (Playwright). Antes: npm run build.
//   node scripts/trailer/rec.mjs            → dist/trailer/raw/<escena>/*.webm y marks.json
//   python3 -I scripts/trailer/build.py      → dist/trailer/arde-la-torre-trailer-16x9.mp4 y -9x16.mp4
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { resolve } from 'path';
const GAME = resolve(new URL('.', import.meta.url).pathname, '..', '..');
const OUT = resolve(process.env.TRAILER_DIR || resolve(GAME, 'dist', 'trailer'), 'raw') + '/';
const BASE = 'file://' + resolve(GAME, 'dist', 'index.html');
const SIZE = { width: 1920, height: 1080 };
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const marks = {};
async function scene(name, url, ready, wait, dur) {
  const ctx = await b.newContext({ viewport: SIZE, recordVideo: { dir: OUT + name, size: SIZE } });
  const t0 = Date.now();
  const pg = await ctx.newPage();
  await pg.goto(url);
  if (ready) await pg.waitForFunction(ready, null, { timeout: 60000 });
  await pg.waitForTimeout(wait);
  marks[name] = (Date.now() - t0) / 1000;
  await pg.waitForTimeout(dur * 1000 + 300);
  await ctx.close();
  console.log(name, marks[name]);
}
const only = process.argv[2];
const S = [
  ['titulo', BASE + '?nonet', null, 1200, 5],
  ['nivel1', BASE + '?nonet&auto=4&bot&seed=11&nivel=1', () => window.__arde.screen === 'juego', 2500, 8],
  ['nivel2', BASE + '?nonet&auto=4&bot&seed=12&nivel=2', () => window.__arde.screen === 'juego', 9000, 6],
  ['nivel3', BASE + '?nonet&auto=4&bot&seed=13&nivel=3', () => window.__arde.screen === 'juego', 4000, 6],
  ['jefe', BASE + '?nonet&auto=4&bot&seed=14&nivel=4', () => window.__arde.screen === 'juego', 6000, 9],
  ['concierto', BASE + '?nonet&auto=4&bot&concierto', () => window.__arde.screen === 'concierto' && window.__arde.concert.started, 15000, 12],
];
for (const s of S) if (!only || s[0] === only) await scene(...s);
await b.close();
import('fs').then((fs) => fs.writeFileSync(OUT + `marks${only ? '-' + only : ''}.json`, JSON.stringify(marks)));
