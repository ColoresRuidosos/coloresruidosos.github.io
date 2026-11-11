// T6.1–T6.2: pantalla de escritorio + 2 móviles emulados (Playwright + Chromium preinstalado) con ?net=loop.
// Necesita `npm run build`. SHOTS=carpeta guarda capturas.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const require = createRequire(import.meta.url);
let pw = null; try { pw = require('playwright'); } catch { /* sin navegador */ }
const SHOTS = process.env.SHOTS;
const skip = !pw || !existsSync('dist/index.html') || !existsSync('dist/mando/index.html');

async function server(port) {
  const srv = spawn('node', ['scripts/serve.mjs', '--dist'], { env: { ...process.env, PORT: String(port) } });
  await new Promise((r) => srv.stdout.once('data', r));
  return srv;
}
const tapKey = async (page, code) => { await page.keyboard.down(code); await page.waitForTimeout(80); await page.keyboard.up(code); await page.waitForTimeout(80); };

test('2 móviles se unen por la sala, eligen músico, juegan el nivel 1 y se reconectan', { skip, timeout: 240000 }, async () => {
  const port = 5198;
  const srv = await server(port);
  const browser = await pw.chromium.launch();
  const errors = [];
  const watch = (p, who) => { p.on('pageerror', (e) => errors.push(`${who}: ${e.message}`)); p.on('console', (m) => m.type() === 'error' && errors.push(`${who}: ${m.text()}`)); };
  try {
    const ctx = await browser.newContext();
    const screen = await ctx.newPage({ viewport: { width: 1152, height: 648 } });
    watch(screen, 'pantalla');
    screen.setDefaultTimeout(60000);
    await screen.goto(`http://localhost:${port}/?net=loop&bot&sim=6&seed=1`);
    await screen.waitForFunction(() => window.__arde && window.__arde.screen === 'titulo');
    await tapKey(screen, 'Enter');
    await screen.waitForFunction(() => window.__arde.screen === 'sala' && window.__arde.code);
    const code = await screen.evaluate(() => window.__arde.code);
    assert.match(code, /^[A-Z2-9]{4}$/);

    const phone = async (sid, hero) => {
      const p = await ctx.newPage({ ...pw.devices['iPhone 13 landscape'] });
      watch(p, sid);
      await p.goto(`http://localhost:${port}/mando/?s=${code}&net=loop&sid=${sid}`);
      await p.waitForFunction(() => window.__pad && window.__pad.state.status === 'conectado', null, { timeout: 15000 });
      await p.click(`button[data-hero="${hero}"]`);
      await p.click('#ready');
      return p;
    };
    const p1 = await phone('movil-uno-1', 'pepe');
    const p2 = await phone('movil-dos-2', 'jota');
    if (SHOTS) { await screen.waitForTimeout(300); await screen.screenshot({ path: `${SHOTS}/sala-2-moviles.png` }); }
    const lobby = await screen.evaluate(() => window.__arde.slots.joined().map((s) => [s.slot, s.hero, s.ready, s.kind]));
    assert.deepEqual(lobby, [[0, 'pepe', true, 'movil'], [1, 'jota', true, 'movil']]);

    // Todos listos → cuenta atrás → partida; los móviles pasan a modo mando.
    await screen.waitForFunction(() => window.__arde.screen === 'juego');
    await p1.waitForSelector('#pad.on', { timeout: 15000 });
    if (SHOTS) { await p1.screenshot({ path: `${SHOTS}/movil-mando.png` }); await screen.waitForTimeout(1500); await screen.screenshot({ path: `${SHOTS}/juego-2-moviles.png` }); }

    // Reconexión (T6.2): se cierra el móvil 2 → ausente → vuelve con el mismo sid y recupera su hueco.
    await p2.close();
    await screen.waitForFunction(() => window.__arde.room.isAway(1), null, { timeout: 10000 });
    const p2b = await ctx.newPage({ ...pw.devices['iPhone 13 landscape'] });
    watch(p2b, 'movil-dos-bis');
    await p2b.goto(`http://localhost:${port}/mando/?s=${code}&net=loop&sid=movil-dos-2`);
    await p2b.waitForFunction(() => window.__pad && window.__pad.state.status === 'conectado' && window.__pad.state.slot === 1, null, { timeout: 15000 });
    await screen.waitForFunction(() => !window.__arde.room.isAway(1), null, { timeout: 10000 });

    // Los bots completan el nivel 1 y pasa al 2.
    await screen.waitForFunction(() => window.__arde.world && window.__arde.world.levelIdx >= 1, null, { timeout: 180000 });
    const st = await p1.evaluate(() => window.__pad.state);
    assert.ok(st.maxHp > 0, 'el móvil recibe la vida de su músico');
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    srv.kill();
  }
});

test('pausa con el teclado y opciones guardadas', { skip, timeout: 60000 }, async () => {
  const port = 5197;
  const srv = await server(port);
  const browser = await pw.chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 768, height: 432 } });
    const errors = []; page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`http://localhost:${port}/?nonet&auto=1&seed=2`);
    await page.waitForFunction(() => window.__arde && window.__arde.screen === 'intro');
    await tapKey(page, 'KeyF');
    await page.waitForFunction(() => window.__arde.screen === 'juego');
    await tapKey(page, 'Escape');
    await page.waitForFunction(() => window.__arde.screen === 'pausa');
    await tapKey(page, 'KeyS');                // ▼ sacudida
    await tapKey(page, 'KeyF');                // cambia
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('arde-la-torre:opciones')));
    assert.equal(saved.shake, false);
    await tapKey(page, 'Escape');
    await page.waitForFunction(() => window.__arde.screen === 'juego');
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    srv.kill();
  }
});
