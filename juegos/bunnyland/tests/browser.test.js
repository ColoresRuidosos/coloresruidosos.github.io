// Fase 4 · En el navegador con un iPhone emulado (requiere npm run build). Spec F1, F11, NFR.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const DIST = resolve('dist/index.html');
let pw = null; try { pw = require('playwright'); } catch { /* sin Playwright: se salta */ }
const skip = !pw || !existsSync(DIST) ? 'falta Playwright o dist/ (npm run build)' : false;

test('peso: un solo HTML de 250 KB o menos (NFR)', { skip: !existsSync(DIST) && 'sin dist/' }, () => {
  assert.ok(statSync(DIST).size <= 250 * 1024, `${statSync(DIST).size} bytes`);
});

test('iPhone: título → tutorial → juego; deslizar mueve al Bunny; sin scroll; pausa al ocultarse', { skip, timeout: 30000 }, async () => {
  const browser = await pw.chromium.launch();
  try {
    const page = await browser.newPage({ ...pw.devices['iPhone 13'], deviceScaleFactor: 1 });
    const errores = []; page.on('pageerror', (e) => errores.push(e.message));
    await page.goto('file://' + DIST + '?seed=1&mudo');
    const box = await page.locator('canvas').boundingBox();
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    const tocar = async () => { await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(100); };
    assert.equal(await page.evaluate(() => __bunny.S.pantalla), 'titulo');
    await tocar(); assert.equal(await page.evaluate(() => __bunny.S.pantalla), 'tutorial');
    await tocar(); assert.equal(await page.evaluate(() => __bunny.S.pantalla), 'juego');
    await page.waitForFunction(() => __bunny.S.m.mode === 'play', null, { timeout: 5000 });
    // Deslizar hacia la derecha: el Bunny da media vuelta (empieza yendo a la izquierda)
    await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx + 40, cy, { steps: 4 }); await page.mouse.up();
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => __bunny.S.m.bunny.face), 'right');
    assert.equal(await page.evaluate(() => scrollY), 0);
    // Segundo plano → pausa
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    assert.equal(await page.evaluate(() => __bunny.S.pantalla), 'pausa');
    // Botón de sonido y fin de partida con el bot
    await page.evaluate(() => { __bunny.S.pantalla = 'juego'; __bunny.S.m.lives = 1; __bunny.OPT.sim = 8; });
    await page.waitForFunction(() => __bunny.S.pantalla === 'fin', null, { timeout: 20000 });
    assert.deepEqual(errores, []);
  } finally { await browser.close(); }
});
