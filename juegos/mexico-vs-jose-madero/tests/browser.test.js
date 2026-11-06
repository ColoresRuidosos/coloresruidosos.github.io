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

test('START: la primera vez sale el prólogo (B lo salta) y después el Museo; B en Carmesí abre el capítulo 1 y A empieza 1-1', async () => {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  assert.equal(await page.evaluate(() => window.__jmv.screen), 'prologue');
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter'); // A: siguiente viñeta
  await page.waitForTimeout(150);
  await page.screenshot({ path: 'out/02p-prologo.png' });
  await page.keyboard.press('KeyX'); // B: saltar
  await page.waitForTimeout(200);
  assert.equal(await page.evaluate(() => window.__jmv.screen), 'museum');
  assert.equal(await page.evaluate(() => window.__jmv.save.data.seenPrologue), true);
  assert.equal(await page.evaluate(() => window.__jmv.door), 'carmesi');
  await page.screenshot({ path: 'out/02a-museo.png' });
  await page.keyboard.press('KeyX');
  await page.waitForTimeout(150);
  assert.equal(await page.evaluate(() => window.__jmv.screen), 'cutscene', 'escena de entrada del mundo');
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter'); // A: siguiente viñeta
  await page.waitForTimeout(150);
  await page.screenshot({ path: 'out/02c-escena.png' });
  await page.keyboard.press('KeyX'); // B: saltar
  await page.waitForTimeout(150);
  assert.equal(await page.evaluate(() => window.__jmv.screen), 'card');
  await page.waitForTimeout(700);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  assert.equal(await page.evaluate(() => [window.__jmv.screen, window.__jmv.level].join(' ')), 'play 1-1');
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

// ── v7 (spec §3.0f; tarea N7) ──────────────────────────
test('v7: Opciones desde la pausa; «Destellos: no» se guarda y sobrevive a recargar', async () => {
  await page.evaluate(() => window.__jmv.goto(0, 'carmesi'));
  await page.keyboard.press('KeyP'); await page.waitForTimeout(200);
  await page.keyboard.press('KeyX'); await page.waitForTimeout(200);
  assert.equal(await page.evaluate(() => window.__jmv.screen), 'options');
  await page.keyboard.press('KeyZ'); await page.waitForTimeout(200); // primera opción: Destellos
  await page.screenshot({ path: 'out/06-opciones.png' });
  assert.equal(await page.evaluate(() => window.__jmv.save.data.options.flashes), false);
  await page.reload(); await page.waitForTimeout(400);
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('jmv-save')).options.flashes), false);
  assert.equal(await page.evaluate(() => window.__jmv.save.data.options.flashes), false);
  assert.deepEqual(errors, []);
});

test('v7: Galería — un traje bloqueado no se puede poner; uno desbloqueado, sí', async () => {
  await page.evaluate(() => window.__jmv.museum('galeria'));
  await page.waitForTimeout(100);
  await page.keyboard.press('KeyX'); await page.waitForTimeout(80);
  assert.equal(await page.evaluate(() => window.__jmv.screen), 'gallery');
  for (let i = 0; i < 2; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(60); } // boina
  await page.keyboard.press('KeyZ'); await page.waitForTimeout(60);
  assert.equal(await page.evaluate(() => window.__jmv.save.data.costume), 'auto');
  await page.evaluate(() => window.__jmv.save.data.unlocked.push('boina'));
  await page.keyboard.press('KeyZ'); await page.waitForTimeout(60);
  assert.equal(await page.evaluate(() => window.__jmv.save.data.costume), 'boina');
  await page.screenshot({ path: 'out/07-galeria.png' });
  await page.keyboard.press('Escape'); await page.waitForTimeout(60);
  assert.equal(await page.evaluate(() => window.__jmv.screen), 'museum');
  assert.deepEqual(errors, []);
});

test('v7: la puerta de Noche está cerrada hasta terminar Carmesí', async () => {
  await page.evaluate(() => { window.__jmv.save.data.worlds = {}; window.__jmv.museum('noche'); });
  await page.keyboard.press('KeyX'); await page.waitForTimeout(80);
  assert.equal(await page.evaluate(() => window.__jmv.screen), 'museum');
  await page.evaluate(() => { window.__jmv.save.data.worlds.carmesi = { cleared: ['1-1', '1-2', '1-3'], best: {} }; });
  await page.keyboard.press('KeyX'); await page.waitForTimeout(80);
  assert.equal(await page.evaluate(() => window.__jmv.screen), 'cutscene');
  await page.keyboard.press('KeyX'); await page.waitForTimeout(80);
  assert.equal(await page.evaluate(() => [window.__jmv.screen, window.__jmv.level].join(' ')), 'card 2-1');
});

test('v7: los tres niveles de Noche se dibujan sin errores (con farol en 2-2 y 2-3)', async () => {
  for (const [i, id] of [[0, '2-1'], [1, '2-2'], [2, '2-3']]) {
    await page.evaluate((n) => window.__jmv.goto(n, 'noche'), i);
    await page.waitForTimeout(1200);
    assert.equal(await page.evaluate(() => window.__jmv.level), id);
    assert.equal(await page.evaluate(() => !!window.__jmv.game.lantern), i > 0);
    await page.screenshot({ path: `out/08-nivel-${id}.png` });
  }
  assert.deepEqual(errors, []);
});

// ── v8.3 (spec §3.0f I) ─────────────────────────────────
test('v8.3: al vencer al jefe, pose de festejo; A la salta y salen las tarjetas', async () => {
  await page.evaluate(() => {
    window.__jmv.goto(2, 'carmesi');
    const g = window.__jmv.game; g.intro = null; g.boss.alive = false; g.boss.deadT = 1;
    g.disco = { kind: 'disco', x: g.player.x + g.player.w / 2, y: g.player.y + g.player.h / 2, taken: false };
  });
  await page.waitForTimeout(200);
  assert.equal(await page.evaluate(() => window.__jmv.screen), 'victory');
  await page.screenshot({ path: 'out/09-festejo.png' });
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  assert.equal(await page.evaluate(() => window.__jmv.screen), 'card');
  assert.deepEqual(errors, []);
});

// ── v9.1 (spec §3.0f L) ─────────────────────────────────
test('v9.1: la guía de objetos se abre desde las Opciones de la portada y desde la pausa', async () => {
  await page.reload(); await page.waitForTimeout(400);
  await page.keyboard.press('KeyX'); await page.waitForTimeout(200); // portada → Opciones
  for (let i = 0; i < 5; i++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(120); } // hasta «GUÍA DE OBJETOS» (6.ª opción desde v9.4)
  await page.keyboard.press('KeyZ'); await page.waitForTimeout(120);
  assert.equal(await page.evaluate(() => window.__jmv.screen), 'guide');
  await page.screenshot({ path: 'out/10-guia.png' });
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  assert.equal(await page.evaluate(() => window.__jmv.screen), 'options');
  await page.evaluate(() => window.__jmv.goto(0, 'carmesi'));
  await page.keyboard.press('KeyP'); await page.waitForTimeout(200);
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(200);
  assert.equal(await page.evaluate(() => window.__jmv.screen), 'guide');
  await page.keyboard.press('KeyX'); await page.waitForTimeout(200);
  assert.equal(await page.evaluate(() => window.__jmv.screen), 'play');
  assert.deepEqual(errors, []);
});

// ── v9.4 (spec §3.0f N): quitar las notas ──────────────
test('v9.4: la tecla N y el botón 💬 quitan y ponen las notas; se guarda al recargar', async () => {
  await page.reload(); await page.waitForTimeout(400);
  await page.evaluate(() => window.__jmv.goto(0, 'carmesi'));
  assert.equal(await page.evaluate(() => window.__jmv.save.data.options.notas), true);
  await page.keyboard.press('KeyN'); await page.waitForTimeout(150);
  assert.equal(await page.evaluate(() => window.__jmv.save.data.options.notas), false);
  assert.equal(await page.textContent('#notes'), '💬 NOTAS: NO');
  // Un dato en cola no se dibuja sin notas: comparamos la franja de abajo con y sin el cartel.
  const strip = () => page.evaluate(() => { const c = document.getElementById('game'); return c.getContext('2d').getImageData(8, 170, 304, 40).data.reduce((a, v) => a + v, 0); });
  await page.evaluate(() => { const g = window.__jmv.game; g.popups.length = 0; g.popups.push({ text: 'DATO DE PRUEBA PARA LAS NOTAS', source: 'PRUEBA', t: 30 }); });
  await page.waitForTimeout(250); const off = await strip();
  await page.click('#notes'); await page.waitForTimeout(250);
  assert.equal(await page.evaluate(() => window.__jmv.save.data.options.notas), true);
  const on = await strip();
  assert.ok(on > off * 1.2, `el cartel claro del dato debería aclarar la franja (con ${on}, sin ${off})`);
  await page.keyboard.press('KeyN'); await page.waitForTimeout(150);
  await page.reload(); await page.waitForTimeout(400);
  assert.equal(await page.evaluate(() => window.__jmv.save.data.options.notas), false);
  assert.equal(await page.textContent('#notes'), '💬 NOTAS: NO');
  assert.deepEqual(errors, []);
});

// ── v9.4: en celulares estrechos (navegador de Instagram, 320–412 px) caben los 5 botones del mando ──
for (const width of [320, 360, 390, 412]) {
  test(`v9.4: a ${width} px de ancho se ven completos ◀ ▶ ★ B y A`, async () => {
    const ctx = await browser.newContext({ viewport: { width, height: 760 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:5199/'); await p.waitForTimeout(300);
    const r = await p.evaluate(() => [...document.querySelectorAll('.pad button')].map((b) => { const q = b.getBoundingClientRect(); return { k: b.dataset.btn, l: q.left, r: q.right, w: q.width }; }));
    const W = await p.evaluate(() => innerWidth);
    assert.equal(r.length, 5);
    for (const b of r) {
      assert.ok(b.l >= 0 && b.r <= W, `${b.k}: de ${b.l.toFixed(0)} a ${b.r.toFixed(0)} px, la pantalla mide ${W}`);
      assert.ok(b.w >= 44, `${b.k}: ${b.w.toFixed(0)} px, menos que el mínimo táctil de 44`);
    }
    await ctx.close();
  });
}

// ── v9.5 (spec §3.0f Ñ): ningún enlace junto al mando (un toque sin querer sacaba del juego) ──
test('v9.5: la página del juego no tiene enlaces; el crédito de homenaje sigue como texto', async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 760 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:5199/'); await p.waitForTimeout(300);
  assert.equal(await p.evaluate(() => document.querySelectorAll('a[href]').length), 0);
  assert.match(await p.textContent('.bar'), /Homenaje no oficial · Colores Ruidosos/);
  await ctx.close();
});

// ── v9.6 (spec §3.0f O): saltar la nota en pantalla ──
test('v9.6: tocar la nota la salta sin hacer saltar a Pepe; botón ⏭ solo con nota; tecla S', async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 760 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto('http://127.0.0.1:5199/'); await p.waitForTimeout(300);
  await p.evaluate(() => { const s = window.__jmv.save; s.data.options.notas = true; window.__jmv.goto(0, 'carmesi'); });
  await p.waitForTimeout(2500);   // que pase la intro del nivel
  await p.evaluate(() => { const g = window.__jmv.game; g.thought = null; g.hint = null; g.popups.length = 0; });
  await p.waitForTimeout(150);
  assert.equal(await p.isVisible('#skip'), false, 'sin nota no hay botón');
  await p.evaluate(() => { const g = window.__jmv.game; g.popups.push({ text: 'DATO UNO PARA SALTAR', source: 'PRUEBA', t: 30 }, { text: 'DATO DOS', source: 'PRUEBA', t: 30 }); });
  await p.waitForTimeout(200);
  assert.equal(await p.isVisible('#skip'), true, 'con nota aparece ⏭');
  // Toque sobre el dato (franja de abajo del lienzo): se salta el primero y Pepe no despega del suelo.
  const box = await p.locator('#game').boundingBox();
  const y0 = await p.evaluate(() => window.__jmv.game.player.y);
  await p.touchscreen.tap(box.x + box.width / 2, box.y + box.height * 0.88);
  await p.waitForTimeout(120);
  assert.deepEqual(await p.evaluate(() => window.__jmv.game.popups.map((q) => q.text)), ['DATO DOS']);
  assert.ok(Math.abs((await p.evaluate(() => window.__jmv.game.player.y)) - y0) < 2, 'tocar la nota no es un salto');
  await p.click('#skip'); await p.waitForTimeout(150);
  assert.equal(await p.evaluate(() => window.__jmv.game.popups.length), 0);
  assert.equal(await p.isVisible('#skip'), false);
  await p.evaluate(() => { window.__jmv.game.thought = { text: 'PENSAMIENTO', t: 30 }; });
  await p.keyboard.press('KeyS'); await p.waitForTimeout(100);
  assert.equal(await p.evaluate(() => window.__jmv.game.thought), null);
  assert.deepEqual(errs, []);
  await ctx.close();
});
