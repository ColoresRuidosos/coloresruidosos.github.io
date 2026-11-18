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

test('móvil sin mando: se juega con los botones táctiles de la propia pantalla (iPhone emulado)', { skip, timeout: 90000 }, async () => {
  const port = 5196;
  const srv = await server(port);
  const browser = await pw.chromium.launch();
  try {
    const page = await browser.newPage({ ...pw.devices['iPhone 13 landscape'] });
    const errors = []; page.on('pageerror', (e) => errors.push(e.message));
    page.setDefaultTimeout(30000);
    await page.goto(`http://localhost:${port}/sin-red.html?seed=4`);
    const cdp = await page.context().newCDPSession(page);
    const touch = async (pts, type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
    const tapEl = async (sel) => {
      const b = await page.locator(sel).boundingBox();
      const pt = [{ x: b.x + b.width / 2, y: b.y + b.height / 2, id: 1 }];
      await touch(pt, 'touchStart'); await page.waitForTimeout(120); await touch([], 'touchEnd'); await page.waitForTimeout(120);
    };
    await page.waitForFunction(() => window.__arde && window.__arde.screen === 'titulo');
    // toca la opción HISTORIA del menú (un toque suelto fuera del menú ya no elige modo, T10.13)
    const opt = await page.evaluate(() => { const r = document.getElementById('game').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + (window.__TITLE_MENU_Y + 3) * r.height / 216 }; });
    await touch([{ x: opt.x, y: opt.y, id: 1 }], 'touchStart'); await page.waitForTimeout(80); await touch([], 'touchEnd');
    await page.waitForFunction(() => window.__arde.screen === 'sala');
    assert.equal(await page.evaluate(() => window.__arde.mode), 'historia');
    assert.ok(await page.locator('#tactil.on').isVisible(), 'aparecen los botones táctiles');
    await tapEl('#tactil .golpe');                                    // unirse
    await page.waitForFunction(() => window.__arde.slots.joined().length === 1);
    assert.equal(await page.evaluate(() => window.__arde.slots.get(0).kind), 'tactil');
    await tapEl('#tactil .golpe');                                    // listo
    await page.waitForFunction(() => window.__arde.screen === 'intro', null, { timeout: 15000 });
    await page.waitForFunction(() => window.__arde.screen === 'juego', null, { timeout: 15000 });
    const x0 = await page.evaluate(() => window.__arde.world.fighters[0].x);
    // Joystick: dedo en la mitad izquierda y arrastrar a la derecha; a la vez, GOLPE con otro dedo.
    await touch([{ x: 150, y: 250, id: 1 }], 'touchStart');
    for (let i = 1; i <= 6; i++) { await touch([{ x: 150 + i * 12, y: 250, id: 1 }], 'touchMove'); await page.waitForTimeout(30); }
    await page.waitForTimeout(700);
    const x1 = await page.evaluate(() => window.__arde.world.fighters[0].x);
    assert.ok(x1 > x0 + 20, `el joystick mueve al músico (${x0} → ${x1})`);
    const g = await page.locator('#tactil .golpe').boundingBox();
    await touch([{ x: 162 + 60, y: 250, id: 1 }, { x: g.x + g.width / 2, y: g.y + g.height / 2, id: 2 }], 'touchStart');
    await page.waitForFunction(() => ['attack', 'grab'].includes(window.__arde.world.fighters[0].state), null, { timeout: 3000 });
    await touch([], 'touchEnd');
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/movil-tactil.png` });
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    srv.kill();
  }
});

test('T10.5 página del concierto: 2 jugadores en el teclado entran, eligen músico, confirman y tocan su parte', { skip: skip || !existsSync('dist/concierto.html'), timeout: 60000 }, async () => {
  const browser = await pw.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    const page = await browser.newPage({ viewport: { width: 768, height: 432 } });
    const errors = []; page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`file://${process.cwd()}/dist/concierto.html?nonet`);
    await page.waitForFunction(() => window.__concierto && window.__concierto.screen === 'inicio');
    await tapKey(page, 'KeyF');                // J1 entra (Antonio)
    await tapKey(page, 'KeyK');                // J2 entra (Pepe)
    await tapKey(page, 'ArrowRight');          // J2 cambia de músico
    const heroes = await page.evaluate(() => window.__concierto.slots.joined().map((s) => s.hero));
    assert.equal(heroes.length, 2); assert.notEqual(heroes[0], heroes[1]);
    await tapKey(page, 'KeyF'); await tapKey(page, 'KeyK');   // los dos, listos
    await page.waitForFunction(() => window.__concierto.screen === 'concierto' && window.__concierto.k.started, null, { timeout: 15000 });
    const parts = await page.evaluate(() => Object.values(window.__concierto.k.c.players).map((p) => JSON.stringify(p.notes)));
    assert.notEqual(parts[0], parts[1], 'cada uno toca la parte de su instrumento');
    // J1 toca a tiempo su primera nota
    const [ms0, lane] = await page.evaluate(() => window.__concierto.k.c.players[0].notes[0]);
    await page.waitForFunction((t) => window.__concierto.k.ms >= t - 20, ms0, { timeout: 15000 });
    await tapKey(page, ['KeyF', 'KeyG', 'KeyH'][lane]);
    const p0 = await page.evaluate(() => { const p = window.__concierto.k.c.players[0]; return p.perfect + p.good; });
    assert.equal(p0, 1, 'la primera nota cuenta');
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});

test('T10.9 concierto suelto con 2 móviles: QR, eligen en el móvil, tocan con sus botones (F18)', { skip: skip || !existsSync('dist/concierto.html'), timeout: 90000 }, async () => {
  const port = 5196;
  const srv = await server(port);
  const browser = await pw.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const errors = [];
  const watch = (p, who) => { p.on('pageerror', (e) => errors.push(`${who}: ${e.message}`)); };
  try {
    const ctx = await browser.newContext();
    const screen = await ctx.newPage({ viewport: { width: 1152, height: 648 } });
    watch(screen, 'pantalla');
    await screen.goto(`http://localhost:${port}/concierto.html?net=loop`);
    await screen.waitForFunction(() => window.__concierto && window.__concierto.code, null, { timeout: 15000 });
    const code = await screen.evaluate(() => window.__concierto.code);
    const url = await screen.evaluate(() => window.__concierto.padUrl);
    assert.ok(url.includes('/mando/') && url.includes(`s=${code}`), url);
    const phone = async (sid, hero) => {
      const p = await ctx.newPage({ ...pw.devices['iPhone 13 landscape'] });
      watch(p, sid);
      await p.goto(`http://localhost:${port}/mando/?s=${code}&net=loop&sid=${sid}`);
      await p.waitForFunction(() => window.__pad && window.__pad.state.status === 'conectado', null, { timeout: 15000 });
      await p.click(`button[data-hero="${hero}"]`);
      await p.click('#ready');
      return p;
    };
    const p1 = await phone('movil-uno-1', 'jota');
    await phone('movil-dos-2', 'dani');
    if (SHOTS) { await screen.waitForTimeout(300); await screen.screenshot({ path: `${SHOTS}/concierto-sala.png` }); }
    await screen.waitForFunction(() => window.__concierto.screen === 'concierto' && window.__concierto.k.started, null, { timeout: 20000 });
    const heroes = await screen.evaluate(() => window.__concierto.players.map((p) => p.type));
    assert.deepEqual(heroes, ['jota', 'dani']);
    await p1.waitForSelector('#pad.on', { timeout: 15000 });
    assert.equal(await p1.evaluate(() => getComputedStyle(document.getElementById('hp')).visibility), 'hidden', 'sin barra de vida en el concierto');
    // J1 (batería) toca su primera nota con el botón del móvil
    const [ms0, lane] = await screen.evaluate(() => window.__concierto.k.c.players[0].notes[0]);
    await screen.waitForFunction((t) => window.__concierto.k.ms >= t - 40, ms0, { timeout: 15000 });
    const btn = await p1.$(['#b-golpe', '#b-salto', '#b-especial'][lane]);
    const box = await btn.boundingBox();
    await p1.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await p1.mouse.down(); await p1.waitForTimeout(60); await p1.mouse.up();
    await screen.waitForFunction(() => { const p = window.__concierto.k.c.players[0]; return p.perfect + p.good >= 1; }, null, { timeout: 3000 });
    if (SHOTS) { await screen.waitForTimeout(2000); await screen.screenshot({ path: `${SHOTS}/concierto-moviles.png` }); await p1.screenshot({ path: `${SHOTS}/concierto-mando.png` }); }
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    srv.kill();
  }
});

test('T10.10 juego base: en el título se elige SOLO EL CONCIERTO y la canción empieza al estar listos (F19)', { skip, timeout: 60000 }, async () => {
  const browser = await pw.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    const page = await browser.newPage({ viewport: { width: 768, height: 432 } });
    const errors = []; page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`file://${process.cwd()}/dist/index.html?nonet`);
    await page.waitForFunction(() => window.__arde && window.__arde.screen === 'titulo');
    await tapKey(page, 'KeyS');                // ▼ SOLO EL CONCIERTO
    assert.equal(await page.evaluate(() => window.__arde.titleSel), 1);
    await tapKey(page, 'KeyF');
    await page.waitForFunction(() => window.__arde.screen === 'sala');
    assert.equal(await page.evaluate(() => window.__arde.mode), 'concierto');
    await tapKey(page, 'KeyF');                // J1 entra
    await page.waitForTimeout(100);
    await tapKey(page, 'KeyF');                // listo
    await page.waitForFunction(() => window.__arde.screen === 'concierto', null, { timeout: 15000 });
    const types = await page.evaluate(() => window.__arde.concert.players.map((p) => p.type));
    assert.equal(types.length, 1);
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});

test('T10.11 pausa en el concierto: la canción y las notas se detienen y siguen donde iban', { skip, timeout: 60000 }, async () => {
  const browser = await pw.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    const page = await browser.newPage({ viewport: { width: 768, height: 432 } });
    const errors = []; page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`file://${process.cwd()}/dist/index.html?nonet&concierto`);
    await page.waitForFunction(() => window.__arde && window.__arde.screen === 'titulo');
    await tapKey(page, 'KeyF');
    await page.waitForFunction(() => window.__arde.screen === 'sala');
    await tapKey(page, 'KeyF'); await page.waitForTimeout(100); await tapKey(page, 'KeyF');
    await page.waitForFunction(() => window.__arde.screen === 'concierto' && window.__arde.concert.started && window.__arde.concert.ms > 1000, null, { timeout: 20000 });
    await tapKey(page, 'Escape');
    await page.waitForFunction(() => window.__arde.screen === 'pausa');
    const ms1 = await page.evaluate(() => window.__arde.concert.ms);
    await page.waitForTimeout(1500);
    const ms2 = await page.evaluate(() => window.__arde.concert.ms);
    assert.ok(Math.abs(ms2 - ms1) < 50, `en pausa el reloj no avanza (${ms1} → ${ms2})`);
    await tapKey(page, 'Escape');
    await page.waitForFunction(() => window.__arde.screen === 'concierto');
    await page.waitForTimeout(800);
    const ms3 = await page.evaluate(() => window.__arde.concert.ms);
    assert.ok(ms3 > ms2 + 300 && ms3 < ms2 + 2000, `sigue donde iba (${ms2} → ${ms3})`);
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});

test('T10.12 volver al menú principal desde la selección y desde los resultados', { skip, timeout: 60000 }, async () => {
  const browser = await pw.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    const page = await browser.newPage({ viewport: { width: 768, height: 432 } });
    const errors = []; page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`file://${process.cwd()}/dist/index.html?nonet`);
    await page.waitForFunction(() => window.__arde && window.__arde.screen === 'titulo');
    await tapKey(page, 'KeyF');
    await page.waitForFunction(() => window.__arde.screen === 'sala');
    await tapKey(page, 'KeyF');                 // J1 entra
    await tapKey(page, 'Escape');               // vuelve al menú
    await page.waitForFunction(() => window.__arde.screen === 'titulo', null, { timeout: 5000 });
    // cambia a SOLO EL CONCIERTO, juega y desde los resultados vuelve al menú
    await tapKey(page, 'KeyS'); await tapKey(page, 'KeyF');
    await page.waitForFunction(() => window.__arde.screen === 'sala' && window.__arde.mode === 'concierto');
    const ready = await page.evaluate(() => window.__arde.slots.joined().map((s) => s.ready));
    assert.ok(ready.every((r) => !r), 'al volver nadie queda «listo»');
    await tapKey(page, 'KeyF'); await page.waitForTimeout(100); await tapKey(page, 'KeyF');
    await page.waitForFunction(() => window.__arde.screen === 'concierto' && window.__arde.concert.started, null, { timeout: 20000 });
    await page.evaluate(() => { window.__arde.concert.c.durationMs = window.__arde.concert.ms + 500; });
    await page.waitForFunction(() => window.__arde.screen === 'resultado', null, { timeout: 20000 });
    await page.waitForTimeout(1600);
    await tapKey(page, 'Escape');
    await page.waitForFunction(() => window.__arde.screen === 'titulo', null, { timeout: 5000 });
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});

test('T10.13 el menú solo cambia de modo con las flechas o tocando la opción (un clic suelto no elige)', { skip, timeout: 60000 }, async () => {
  const browser = await pw.chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1152, height: 648 } });   // escala ×3
    const errors = []; page.on('pageerror', (e) => errors.push(e.message));
    const open = async () => { await page.goto(`file://${process.cwd()}/dist/index.html?nonet`); await page.waitForFunction(() => window.__arde && window.__arde.screen === 'titulo'); await page.waitForTimeout(200); };
    // 1) flechas: abajo dos veces sigue en CONCIERTO; un clic suelto arriba no lo cambia; GOLPE entra en CONCIERTO
    await open();
    await tapKey(page, 'KeyS'); await tapKey(page, 'KeyS');
    assert.equal(await page.evaluate(() => window.__arde.titleSel), 1, 'abajo siempre es CONCIERTO');
    await page.mouse.click(576, 60);
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => window.__arde.screen), 'titulo', 'un clic fuera del menú no empieza');
    await tapKey(page, 'KeyF');
    await page.waitForFunction(() => window.__arde.screen === 'sala');
    assert.equal(await page.evaluate(() => window.__arde.mode), 'concierto');
    // 2) tocar la opción HISTORIA la elige y empieza
    await open();
    await tapKey(page, 'KeyS');
    const y = await page.evaluate(() => window.__TITLE_MENU_Y);
    await page.mouse.click(576, (y + 3) * 3);
    await page.waitForFunction(() => window.__arde.screen === 'sala');
    assert.equal(await page.evaluate(() => window.__arde.mode), 'historia');
    // 3) tocar la opción CONCIERTO
    await open();
    await page.mouse.click(576, (y + 16) * 3);
    await page.waitForFunction(() => window.__arde.screen === 'sala');
    assert.equal(await page.evaluate(() => window.__arde.mode), 'concierto');
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});
