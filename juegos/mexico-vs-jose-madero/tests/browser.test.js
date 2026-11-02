import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';

const { chromium } = createRequire(import.meta.url)('playwright');
let server, browser, page;
const errors = [];

before(async () => {
  server = spawn(process.execPath, ['scripts/serve.mjs'], { env: { ...process.env, PORT: '5199' }, stdio: 'pipe' });
  await new Promise((r) => server.stdout.once('data', r));
  browser = await chromium.launch();
  page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto('http://127.0.0.1:5199/');
  await mkdir('out', { recursive: true });
});
after(async () => { await browser?.close(); server?.kill(); });

test('carga sin errores y muestra la portada', async () => {
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'out/01-portada.png' });
  assert.deepEqual(errors, []);
});

test('START arranca la partida y Pepe se mueve a la derecha', async () => {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(1200);
  await page.keyboard.press('KeyZ');
  await page.waitForTimeout(500);
  await page.keyboard.press('KeyX');
  await page.waitForTimeout(150);
  await page.screenshot({ path: 'out/02-juego.png' });
  await page.waitForTimeout(1600);
  await page.keyboard.up('ArrowRight');
  await page.screenshot({ path: 'out/03-juego.png' });
  assert.deepEqual(errors, []);
});

test('no quedan restos de fotogramas anteriores en los fosos', async () => {
  // Dos posiciones de cámara que acaban en el mismo sitio deben pintar exactamente lo mismo.
  const shot = async (from) => {
    await page.evaluate((x) => { const g = window.__jmv.game; g.player.x = x; g.player.y = 120; g.player.vy = 0; }, from);
    await page.waitForTimeout(120);
    await page.evaluate(() => { const g = window.__jmv.game; g.player.x = 600; g.player.y = 152; g.player.vy = 0; });
    await page.waitForTimeout(400);
    return page.evaluate(() => {
      const c = document.getElementById('game');
      const d = c.getContext('2d').getImageData(140, 190, 100, 34).data; // franja baja del foso
      let dark = 0;
      for (let i = 0; i < d.length; i += 4) if (d[i] === 0x1b && d[i + 1] === 0x12 && d[i + 2] === 0x26) dark++;
      return dark;
    });
  };
  const a = await shot(200), b = await shot(1500);
  assert.equal(a, b);
});

test('v5: el Solo de guitarra vence a los enemigos cercanos', async () => {
  await page.evaluate(() => { window.__jmv.goto(0); const g = window.__jmv.game; g.ovacion = 100; g.player.x = g.enemies[0].x - 60; });
  await page.waitForTimeout(100);
  await page.keyboard.down('KeyC'); await page.waitForTimeout(80); await page.keyboard.up('KeyC');
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'out/04-solo.png' });
  const r = await page.evaluate(() => ({ alive: window.__jmv.game.enemies[0].alive, ov: window.__jmv.game.ovacion }));
  assert.equal(r.alive, false);
  assert.equal(r.ov, 0);
  assert.deepEqual(errors, []);
});

test('v5: los tres niveles del Mundo 1 se dibujan sin errores', async () => {
  for (const [i, id] of [[0, '1-1'], [1, '1-2'], [2, '1-3']]) {
    await page.evaluate((n) => window.__jmv.goto(n), i);
    await page.waitForTimeout(1500);
    assert.equal(await page.evaluate(() => window.__jmv.level), id);
    await page.screenshot({ path: `out/05-nivel-${id}.png` });
  }
  assert.deepEqual(errors, []);
});

test('móvil: los botones no se seleccionan ni se quedan pegados (iOS)', async () => {
  const r = await page.evaluate(() => {
    const btn = document.querySelector('[data-btn="right"]');
    const st = getComputedStyle(btn);
    const out = { select: st.webkitUserSelect || st.userSelect };
    btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 7 }));
    out.down = window.__jmv.held.right;
    // iOS interrumpe el toque (selección, llamada, cambio de app) sin pointerup sobre el botón.
    window.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId: 7 }));
    out.afterCancel = window.__jmv.held.right;
    btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 8 }));
    window.dispatchEvent(new Event('blur'));
    out.afterBlur = window.__jmv.held.right;
    const menu = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    btn.dispatchEvent(menu);
    out.menuBlocked = menu.defaultPrevented;
    return out;
  });
  assert.equal(r.select, 'none');
  assert.equal(r.down, true);
  assert.equal(r.afterCancel, false);
  assert.equal(r.afterBlur, false);
  assert.equal(r.menuBlocked, true);
});
