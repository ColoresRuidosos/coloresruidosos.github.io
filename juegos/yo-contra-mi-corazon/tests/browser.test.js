// T4.1/T4.2: el juego compilado en un iPhone emulado (Playwright + Chromium preinstalado).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const require = createRequire(import.meta.url);
let pw = null; try { pw = require('playwright'); } catch { /* sin navegador */ }
const SHOTS = process.env.SHOTS;   // carpeta para guardar capturas (opcional)

test('iPhone: título → cómo se juega → la pelea completa con el bot → resultado, sin errores', { skip: !pw || !existsSync('dist/index.html'), timeout: 300000 }, async () => {
  const port = 5199;
  const srv = spawn('node', ['scripts/serve.mjs', '--dist'], { env: { ...process.env, PORT: String(port) } });
  await new Promise((r) => srv.stdout.once('data', r));
  const browser = await pw.chromium.launch();
  try {
    const page = await browser.newPage({ ...pw.devices['iPhone 13'] });
    page.setDefaultTimeout(90000);   // en paralelo con los bots, la máquina va más lenta
    const errors = []; page.on('pageerror', (e) => errors.push(e.message)); page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto(`http://localhost:${port}/?sim=10&bot&seed=1&rankingPrueba`);
    await page.waitForFunction(() => window.__ycmc?.screen === 'titulo');
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/1-titulo.png` });
    const tapAt = async (x, y) => { const b = await page.locator('#game').boundingBox(); await page.mouse.click(b.x + (x / 180) * b.width, b.y + (y / 320) * b.height); };
    await tapAt(90, 216);                                         // ▶ JUGAR
    await page.waitForFunction(() => window.__ycmc.screen === 'como');
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/2-como.png` });
    await tapAt(90, 294);                                         // ¡A ESCENA!
    await page.waitForFunction(() => window.__ycmc.screen === 'juego');
    for (const [i, secs] of [[3, 0.75], [4, 1.5], [5, 9], [6, 14]]) {
      await page.waitForFunction((s) => window.__ycmc.lastT > s * 10, secs);
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/${i}-juego.png` });
    }
    await page.waitForFunction(() => window.__ycmc.screen === 'resultado', null, { timeout: 120000 });
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/7-resultado.png` });
    const tapBtn = async (id) => {
      const b = await page.waitForFunction((i) => window.__ycmc.buttons.find((x) => x.id === i), id, { timeout: 5000 })
        .then((h) => h.jsonValue())
        .catch(async () => { throw new Error(`no aparece el botón ${id}: ${JSON.stringify(await page.evaluate(() => ({ s: window.__ycmc.screen, over: window.__ycmc.match.over, t: window.__ycmc.match.t, btn: window.__ycmc.buttons.map((x) => x.id) })))}`); });
      await tapAt(b.x + b.w / 2, b.y + b.h / 2);
    };
    await tapBtn('publicar');                                     // ★ PUBLICAR EN EL RANKING
    await page.waitForFunction(() => window.__ycmc.screen === 'publicar');
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/8-publicar.png` });
    await tapBtn('opcion2');                                      // elige la 3.ª opción
    const elegido = await page.evaluate(() => window.__ycmc.opciones[2]);
    assert.equal(await page.evaluate(() => window.__ycmc.save.rankName), elegido);
    await tapBtn('enviar');                                       // PUBLICAR
    await page.waitForFunction(() => window.__ycmc.screen === 'ranking' && window.__ycmc.rk.status === 'listo');
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/9-ranking.png` });
    const rk = await page.evaluate(() => ({ lista: window.__ycmc.rk.lista, yo: window.__ycmc.save.rankName }));
    assert.ok(rk.lista.some((f) => f.nombre === rk.yo), 'mi nombre sale en el ranking');
    const r = await page.evaluate(() => ({ over: window.__ycmc.match.over, score: window.__ycmc.match.score, saved: localStorage.getItem('ycmc-save') }));
    assert.ok(['ko', 'decision'].includes(r.over), r.over);
    assert.match(r.saved, /"best":\{"score":\d+/);
    assert.deepEqual(errors, []);
  } finally { await browser.close(); srv.kill(); }
});

test('horizontal en celular: pide girarlo', { skip: !pw || !existsSync('dist/index.html') }, async () => {
  const port = 5198;
  const srv = spawn('node', ['scripts/serve.mjs', '--dist'], { env: { ...process.env, PORT: String(port) } });
  await new Promise((r) => srv.stdout.once('data', r));
  const browser = await pw.chromium.launch();
  try {
    const page = await browser.newPage({ ...pw.devices['iPhone 13 landscape'] });
    await page.goto(`http://localhost:${port}/?sim=1`);
    await page.waitForFunction(() => window.__ycmc?.screen === 'titulo');
    await page.waitForTimeout(100);
    const px = await page.evaluate(() => Array.from(document.getElementById('game').getContext('2d').getImageData(5, 300, 1, 1).data));
    assert.deepEqual(px.slice(0, 3), [14, 12, 28], 'fondo de «gira tu celular»');
  } finally { await browser.close(); srv.kill(); }
});
