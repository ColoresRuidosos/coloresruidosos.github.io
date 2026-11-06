import { W, H, DT } from './game/constants.js';
import { createGame, stepGame, hookAhead, hasNotes, skipNotes } from './game/game.js';
import { createCamera, stepCamera } from './engine/camera.js';
import { createSave } from './engine/save.js';
import { museumExhibits, recordLevel, checkUnlocks, costumeFor, doorState, COSTUMES, identity, worldCleared, startLevelIndex } from './game/progress.js';
import { PROLOGO, PENSAMIENTOS, VUELTA_AL_MUSEO, recuerdoCard } from './data/historia.js';
import { drawPrologue, drawVictory } from './render/draw-historia.js';
import { WORLD_SCENES } from './data/cinematicas.js';
import { VICTORY } from './game/constants.js';
import { HUB, createHub, doorAt } from './game/museum.js';
import { WORLD_1 } from './data/world1.js';
import { WORLD_2 } from './data/world2.js';
import { worldById, WORLDS } from './data/worlds.js';
import { ERA_FACTS_W1, CHAPTERS_W1, LEVEL_CARDS_W1 } from './data/carmesi-story.js';
import { ERA_FACTS_W2, CHAPTERS_W2, LEVEL_CARDS_W2 } from './data/noche-story.js';
import { createArt, drawWorld, drawHud, drawTitle, drawEnd, drawCard, drawIntro } from './render/draw.js';
import { drawGuide, drawMuseumExhibits, drawMuseumDoors, drawMuseumHud, drawGallery, drawOptions, drawPause, OPTION_ITEMS } from './render/draw-menus.js';
import { createAudio } from './audio/audio.js';

const cv = document.getElementById('game');
cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;
const audio = createAudio();

// ── Guardado y opciones (spec §3.0f A–B) ────────────────
let storage = null;
try { storage = window.localStorage; } catch { /* sin almacenamiento: el juego sigue en memoria */ }
const save = createSave(storage);
const opt = save.data.options;
const musicBtn = document.getElementById('music');
function setMusic(on) {
  if (audio.toggleMusic() !== on) audio.toggleMusic();
  opt.music = on; musicBtn.textContent = on ? '♪ ON' : '♪ OFF';
}
setMusic(opt.music);
// v9.4: notas en pantalla (dato, pensamiento y aviso), con la tecla N o el botón 💬.
const notesBtn = document.getElementById('notes');
function setNotes(on) { opt.notas = on; if (notesBtn) notesBtn.textContent = on ? '💬 NOTAS: SÍ' : '💬 NOTAS: NO'; }
setNotes(opt.notas !== false);
// v9.6: saltar la nota que está en pantalla (toque sobre la nota, botón ⏭ o tecla S).
const skipBtn = document.getElementById('skip');
let noteZones = {};
const canSkip = () => screen === 'play' && !paused && game && hasNotes(game, opt);
function skipNote() { if (canSkip()) { skipNotes(game); noteZones = {}; } }

// ── Mundos jugables ─────────────────────────────────────
const WORLD_DATA = {
  carmesi: { n: 1, levels: WORLD_1, facts: ERA_FACTS_W1, chapters: CHAPTERS_W1, cards: LEVEL_CARDS_W1 },
  noche: { n: 2, levels: WORLD_2, facts: ERA_FACTS_W2, chapters: CHAPTERS_W2, cards: LEVEL_CARDS_W2 },
};
const piecesIn = (map) => (map.match(/\*/g) || []).length;
function museumInfo() {
  const info = {};
  for (const id of ['carmesi', 'noche', 'alba', 'psalmos', 'giallo', 'aurora', 'sarajevo', 'querido']) {
    const wd = WORLD_DATA[id], best = save.data.worlds[id]?.best ?? {};
    info[id] = { state: doorState(save, id), total: wd ? wd.levels.reduce((n, l) => n + piecesIn(l.map), 0) : 0, piezas: Object.values(best).reduce((n, b) => n + b.piezas, 0) };
  }
  return info;
}

// ── Estado ──────────────────────────────────────────────
const hub = createHub();
let screen = 'title', back = 'title', camX = 0, cam = null, t = 0, paused = false, card = null, screenT = 0;
let game, art, run = null, museumDoor = null, toast = null, toastT = 0, endInfo = {};
import { guideOf } from './data/guia.js';
let guideSel = 0, guideBack = 'options';
let optSel = 0, galSel = 0, prologueIdx = 0, cut = null, cutArt = null;
// Escenas de cada mundo (spec §3.0f I): A avanza, B las salta. Se dibujan siempre a color (con el arte del Museo).
function playCutscene(panels, then) { cut = { panels, idx: 0, then }; screen = 'cutscene'; screenT = 0; }
const worldsDone = () => WORLDS.filter((w) => worldCleared(save, w.id)).map((w) => w.id);

function enterMuseum(atDoor = null, returning = false) {
  run = null; paused = false;
  if (returning) { toast = VUELTA_AL_MUSEO; toastT = 2.5; }
  game = createGame(HUB, { hearts: 3 });
  art = createArt(game.level, 'museo', { costume: costumeFor(save, 'carmesi') });
  const d = atDoor && hub.doors.find((x) => x.id === atDoor);
  if (d) { game.player.x = d.x - game.player.w / 2; game.player.facing = 1; }
  cam = createCamera(game.player.x + game.player.w / 2, game.level.w * 16, game.player.facing);
  screen = 'museum'; screenT = 0;
}

function loadLevel(i, c = {}) {
  const wd = WORLD_DATA[run.world], L = wd.levels[i];
  run.idx = i; run.carry = c; run.levelStart = { ...c };
  game = createGame(L.map, c, { facts: wd.facts, assist: opt.assist, lantern: L.lantern, thoughts: PENSAMIENTOS[run.world] });
  art = createArt(game.level, L.theme, { costume: costumeFor(save, run.world) });
  cam = createCamera(game.player.x + game.player.w / 2, game.level.w * 16, game.player.facing);
}
const showCard = (c) => { card = c; screen = 'card'; screenT = 0; };
function startLevel(i, c) {
  loadLevel(i, c);
  const wd = WORLD_DATA[run.world], L = wd.levels[i];
  showCard({ kind: 'chapter', n: (wd.n - 1) * 3 + i + 1, ...wd.chapters[L.id], then: () => {} });
}
// Continuar (spec §3.0f H): se entra por el primer nivel sin superar. Si no se empieza desde el 1, no cuenta para el reto de tiempo.
function startWorld(id) {
  const i = startLevelIndex(save, id, WORLD_DATA[id].levels);
  run = { world: id, idx: 0, carry: {}, levelStart: {}, time: 0, assistUsed: opt.assist, partial: i > 0 };
  // Al empezar el mundo desde su primer nivel, su escena de entrada.
  if (i === 0 && WORLD_SCENES[id]) playCutscene(WORLD_SCENES[id].intro, () => startLevel(0));
  else startLevel(i);
}

const costumeName = (id) => COSTUMES.find((c) => c.id === id)?.name ?? id;
function finishLevel() {
  const wd = WORLD_DATA[run.world], L = wd.levels[run.idx], next = wd.levels[run.idx + 1];
  run.time += game.time;
  run.assistUsed ||= game.assist;
  const stats = { time: game.time, score: game.score, piezas: game.piezas, total: game.pieces.length };
  recordLevel(save, run.world, L.id, stats);
  const ctxU = { world: run.world, levelId: L.id, ...stats, hurts: game.hurts, assist: game.assist, worldDone: !next, runTime: run.assistUsed || run.partial ? Infinity : run.time };
  const unlocks = checkUnlocks(save, ctxU);
  if (!next && !run.assistUsed) save.data.record = Math.max(save.data.record, game.score);
  save.commit();
  const nuevos = unlocks.map((u) => `NUEVO TRAJE EN LA GALERÍA: ${costumeName(u)}`);
  const c = { score: game.score, ovacion: game.ovacion, hearts: Math.max(game.hearts, 1), quoteIdx: game.quoteIdx, thoughtIdx: game.thoughtIdx };
  const fact = { kind: 'fact', facts: wd.cards[L.id].facts };
  if (next) {
    fact.then = () => startLevel(run.idx + 1, c);
    showCard({ kind: 'clear', id: L.id, time: game.time, score: game.score, piezas: game.piezas, total: game.pieces.length, next: `${next.id} ${next.name}`, unlocks: nuevos, pieceName: run.world === 'noche' ? 'LUNAS' : 'CARMESÍS', then: () => showCard(fact) });
  } else {
    const w = worldById(run.world);
    endInfo = { title: `¡MUNDO ${wd.n} COMPLETADO!`, lines: [...nuevos, run.world === 'carmesi' ? 'SE ABRIÓ LA PUERTA DE NOCHE EN EL MUSEO' : `${w.name} YA ESTÁ EN TU MUSEO`] };
    // Al terminar el mundo: «¿Sabías que…?» → «RECUERDO RECUPERADO» (con el retrato ya con su pieza) → final.
    const toEnd = () => { screen = 'end'; screenT = 0; };
    const recuerdo = { ...recuerdoCard(run.world, worldsDone()), then: () => (WORLD_SCENES[run.world] ? playCutscene(WORLD_SCENES[run.world].outro, toEnd) : toEnd()) };
    showCard({ ...fact, then: () => showCard(recuerdo) });
  }
}

// ── Entrada: teclado, táctil y mando → mismos 5 botones ──
const held = { left: false, right: false, jump: false, mic: false, special: false };
const KEYS = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', KeyZ: 'jump', Space: 'jump', ArrowUp: 'jump', KeyW: 'jump', KeyX: 'mic', KeyJ: 'mic', KeyK: 'mic', KeyC: 'special', KeyL: 'special' };
const MENUS = ['options', 'gallery', 'guide'];
let menuMove = 0, escPressed = false;
// Pulsaciones «enganchadas»: una tecla que se pulsa y se suelta entre dos pasos del bucle no se pierde.
const latch = { left: false, right: false, jump: false, mic: false };
addEventListener('keydown', (e) => {
  // En los menús, ▲ ▼ mueven el cursor (no saltan) y Escape vuelve.
  if (MENUS.includes(screen) && (e.code === 'ArrowUp' || e.code === 'ArrowDown')) { menuMove += e.code === 'ArrowUp' ? -1 : 1; e.preventDefault(); return; }
  if (KEYS[e.code]) { held[KEYS[e.code]] = true; e.preventDefault(); if (!e.repeat && KEYS[e.code] in latch) latch[KEYS[e.code]] = true; }
  if (e.code === 'Enter') { held.jump = true; if (!e.repeat) latch.jump = true; }
  if (e.code === 'Escape' && MENUS.includes(screen)) { escPressed = true; return; }
  if ((e.code === 'KeyP' || e.code === 'Escape') && screen === 'play') paused = !paused;
  if (e.code === 'KeyM') { setMusic(!opt.music); save.commit(); }
  if (e.code === 'KeyN') { setNotes(!opt.notas); save.commit(); }
  if (e.code === 'KeyS') skipNote();
});
addEventListener('keyup', (e) => { if (KEYS[e.code]) held[KEYS[e.code]] = false; if (e.code === 'Enter') held.jump = false; });

// Controles táctiles. En iOS, mantener pulsado selecciona texto y abre el menú «Copiar / Traducir»,
// y el botón se queda pegado: se bloquean esos gestos y cualquier interrupción suelta los botones.
const touching = new Map(); // pointerId → botón
const release = (k) => { held[k] = false; document.querySelector(`[data-btn="${k}"]`)?.classList.remove('on'); };
// 🐞 v9.1: al soltar todo por una interrupción también se borran las pulsaciones pendientes (si no, una ▶ «enganchada»
// abría la guía desde la pausa sin querer).
const releaseAll = () => { touching.clear(); for (const b of document.querySelectorAll('[data-btn]')) release(b.dataset.btn); for (const k in latch) latch[k] = false; };
for (const btn of document.querySelectorAll('[data-btn]')) {
  const k = btn.dataset.btn;
  const on = (e) => { e.preventDefault(); touching.set(e.pointerId, k); held[k] = true; if (k in latch) latch[k] = true; btn.classList.add('on'); audio.unlock(); };
  const off = (e) => { e.preventDefault(); touching.delete(e.pointerId); release(k); };
  btn.addEventListener('pointerdown', on);
  btn.addEventListener('pointerup', off);
  btn.addEventListener('pointerleave', off);
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
}
const padEl = document.querySelector('.pad');
for (const ev of ['touchstart', 'touchmove']) padEl?.addEventListener(ev, (e) => e.preventDefault(), { passive: false });
padEl?.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('selectstart', (e) => { if (e.target.closest?.('.pad')) e.preventDefault(); });
addEventListener('pointercancel', (e) => { const k = touching.get(e.pointerId); touching.delete(e.pointerId); if (k) release(k); });
addEventListener('pointerup', (e) => { const k = touching.get(e.pointerId); if (k) { touching.delete(e.pointerId); release(k); } });
addEventListener('blur', releaseAll);
document.addEventListener('visibilitychange', () => { if (document.hidden) { releaseAll(); if (screen === 'play') paused = true; } });
musicBtn.addEventListener('click', () => { setMusic(!opt.music); save.commit(); });
notesBtn?.addEventListener('click', () => { setNotes(!opt.notas); save.commit(); });
document.getElementById('pause')?.addEventListener('click', () => { if (screen === 'play') paused = !paused; });
let tapStart = false;
cv.addEventListener('pointerdown', (e) => {
  audio.unlock();
  // v9.6: un toque sobre una nota la salta (y no hace saltar a Pepe).
  if (canSkip()) {
    const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
    if (Object.values(noteZones).some((z) => x >= z.x - 6 && x <= z.x + z.w + 6 && y >= z.y - 6 && y <= z.y + z.h + 6)) { e.preventDefault(); skipNote(); return; }
  }
  tapStart = true;
});
skipBtn?.addEventListener('click', skipNote);

function pad() {
  const gp = navigator.getGamepads?.()[0];
  if (!gp) return {};
  const ax = gp.axes[0] || 0;
  return { left: ax < -0.4 || gp.buttons[14]?.pressed, right: ax > 0.4 || gp.buttons[15]?.pressed, jump: gp.buttons[0]?.pressed || gp.buttons[9]?.pressed, mic: gp.buttons[2]?.pressed || gp.buttons[1]?.pressed, special: gp.buttons[3]?.pressed };
}

// ── Menús ───────────────────────────────────────────────
function openOptions(from) { back = from; optSel = 0; screen = 'options'; screenT = 0; }
// Guía de objetos (spec §3.0f L): la primera vez que se recoge cada cosa (o se llena la Ovación, o se usa un gancho),
// su explicación abajo durante 3 s. Queda guardado para no repetirla.
const ITEM_GUIDE = { carta: 'carta', amp: 'amp', pua: 'pua', antifaz: 'antifaz', aceite: 'aceite' };
function explainFirstTime() {
  let kind = null;
  for (const e of game.events) if (e.startsWith('item:')) kind = ITEM_GUIDE[e.slice(5)] ?? kind;
  if (game.events.includes('piece')) kind ??= 'piezas';
  if (game.events.includes('hook') || hookAhead(game)) kind ??= 'gancho';  // v9.2: al verlo, no después
  if (game.ovacion >= 100) kind ??= 'solo';
  if (opt.notas === false) { game.hint = null; return; }   // v9.4: sin notas, el aviso espera (no se da por visto)
  if (!kind || save.data.seenItems.includes(kind)) { if (game.hint && (game.hint.t -= DT) <= 0) game.hint = null; return; }
  save.data.seenItems.push(kind); save.commit();
  game.hint = { text: guideOf(kind).first, t: kind === 'gancho' ? 5 : 3 };
}

function stepOptions(pr) {
  const n = OPTION_ITEMS.length;
  if (pr.right || menuMove > 0) optSel = (optSel + 1) % n;
  if (pr.left || menuMove < 0) optSel = (optSel + n - 1) % n;
  const it = OPTION_ITEMS[optSel];
  if (pr.jump) {
    if (it.key === 'back') pr.mic = true;
    else if (it.key === 'guia') { guideSel = 0; guideBack = 'options'; screen = 'guide'; screenT = 0; return; }
    else if (it.key === 'music') setMusic(!opt.music);
    else if (it.key === 'notas') setNotes(!opt.notas);
    else { opt[it.key] = !opt[it.key]; if (it.key === 'assist' && game && run) { game.assist = opt.assist; if (opt.assist) run.assistUsed = true; } }
    save.commit();
  }
  if (pr.mic || escPressed) { screen = back; screenT = 0; }
}
function stepGallery(pr) {
  const n = COSTUMES.length + 1;
  if (pr.right || menuMove > 0) galSel = (galSel + 1) % n;
  if (pr.left || menuMove < 0) galSel = (galSel + n - 1) % n;
  const id = galSel === 0 ? 'auto' : COSTUMES[galSel - 1].id;
  if (pr.jump && (id === 'auto' || save.data.unlocked.includes(id))) {
    save.data.costume = id; save.commit();
    art.costume = costumeFor(save, 'carmesi');
  }
  if (pr.mic || escPressed) { screen = 'museum'; screenT = 0; }
}
function stepMuseum(btn, pr) {
  const door = doorAt(hub, game.player);
  museumDoor = door;
  stepGame(game, { ...btn, mic: false, special: false });
  if (toastT > 0) toastT -= DT; else toast = null;
  if (!door || !pr.mic) return;
  if (door.id === 'galeria') { galSel = 0; screen = 'gallery'; screenT = 0; return; }
  const st = doorState(save, door.id);
  if (st === 'open' && WORLD_DATA[door.id]) startWorld(door.id);
  else { toast = st === 'locked' ? 'AÚN NO: ' + `TERMINA ${worldById(worldById(door.id).requires).name}` : 'ESTA SALA SE ABRIRÁ PRÓXIMAMENTE'; toastT = 1.6; }
}

// ── Bucle de paso fijo ─────────────────────────────────
let last = performance.now(), acc = 0, prev = { ...held };
function frame(now) {
  acc += Math.min(0.1, (now - last) / 1000);
  last = now;
  const gp = pad();
  const btn = { left: held.left || gp.left, right: held.right || gp.right, jump: held.jump || gp.jump, mic: held.mic || gp.mic, special: held.special || gp.special };
  while (acc >= DT) {
    acc -= DT; t += DT; screenT += DT;
    const pr = { left: (btn.left && !prev.left) || latch.left, right: (btn.right && !prev.right) || latch.right, jump: (btn.jump && !prev.jump) || latch.jump || tapStart, mic: (btn.mic && !prev.mic) || latch.mic };
    prev = { ...btn }; tapStart = false;
    for (const k in latch) latch[k] = false;
    if (screen === 'title') {
      if (pr.jump) { audio.unlock(); if (save.data.seenPrologue) enterMuseum('carmesi'); else { prologueIdx = 0; screen = 'prologue'; screenT = 0; } }
      else if (pr.mic) openOptions('title');
    } else if (screen === 'prologue') {
      // Prólogo (spec §1.1b): A avanza, B lo salta. Solo la primera vez.
      if ((pr.jump && screenT > 0.4) || pr.mic) {
        if (pr.jump && prologueIdx < PROLOGO.length - 1) { prologueIdx++; screenT = 0; }
        else { save.data.seenPrologue = true; save.commit(); enterMuseum('carmesi'); }
      }
    } else if (screen === 'cutscene') {
      if (pr.mic) { const then = cut.then; cut = null; then(); }
      else if (pr.jump && screenT > 0.4) {
        if (cut.idx < cut.panels.length - 1) { cut.idx++; screenT = 0; } else { const then = cut.then; cut = null; then(); }
      }
    } else if (screen === 'victory') {
      if (screenT >= VICTORY.time || (pr.jump && screenT > VICTORY.skip)) finishLevel();
    } else if (screen === 'guide') {
      const n = 8;
      if (pr.right || menuMove > 0) guideSel = (guideSel + 1) % n;
      if (pr.left || menuMove < 0) guideSel = (guideSel + n - 1) % n;
      if (pr.mic || escPressed) { screen = guideBack; screenT = 0; }
    } else if (screen === 'options') stepOptions(pr);
    else if (screen === 'gallery') stepGallery(pr);
    else if (screen === 'museum') stepMuseum(btn, pr);
    else if (screen === 'play') {
      if (paused) {
        if (pr.jump) paused = false;
        else if (pr.mic) openOptions('play');
        else if (pr.left) enterMuseum(run.world);
        else if (pr.right) { guideSel = 0; guideBack = 'play'; screen = 'guide'; screenT = 0; }
      } else {
        stepGame(game, btn);
        audio.play(game.events);
        explainFirstTime();
        // Jefe vencido: pose de festejo (3 s, A la salta a los 0,5 s) antes de las tarjetas.
        if (game.status === 'won') { if (game.boss) { screen = 'victory'; screenT = 0; } else finishLevel(); }
        else if (game.status === 'gameover') { screen = 'end'; screenT = 0; }
      }
    } else if (screen === 'card' && pr.jump && screenT > 0.6) {
      const then = card.then; card = null; screen = 'play'; then();
    } else if (screen === 'end' && screenT > 0.6) {
      // Tras perder: A repite el nivel con lo que tenías al empezarlo, B vuelve al Museo. Tras ganar: al Museo.
      if (game.status === 'gameover' && pr.jump) { loadLevel(run.idx, { ...run.levelStart, hearts: 3 }); screen = 'play'; }
      else if (game.status === 'gameover' && pr.mic) enterMuseum(run.world);
      else if (game.status === 'won' && pr.jump) enterMuseum(run.world, true);
    }
    menuMove = 0; escPressed = false;
  }
  const p = game.player;
  const duel = game.boss && game.boss.alive;
  const target = duel ? (p.x + p.w / 2 + game.boss.x + game.boss.w / 2) / 2 + W * 0.08 : p.x + p.w / 2;
  camX = stepCamera(cam, target, game.level.w * 16, duel ? 0 : p.facing);
  const vis = { flashes: opt.flashes, shake: opt.shake };
  if (screen === 'guide') drawGuide(ctx, guideSel, t); // la guía ocupa toda la pantalla
  else if (screen === 'prologue') drawPrologue(ctx, PROLOGO[prologueIdx], prologueIdx, screenT, art, opt.flashes);
  else if (screen === 'cutscene') {
    cutArt ??= createArt(createGame(HUB).level, 'museo');
    drawPrologue(ctx, cut.panels[cut.idx], cut.idx, screenT, cutArt, opt.flashes, cut.panels.length);
  }
  else if (screen === 'title' || (screen === 'options' && back === 'title')) {
    drawTitle(ctx, t, art);
    if (screen === 'options') drawOptions(ctx, opt, optSel, t);
  } else if (screen === 'museum' || screen === 'gallery' || (screen === 'options' && back === 'museum')) {
    const info = museumInfo();
    const exhibits = museumExhibits(save);
    drawWorld(ctx, game, art, camX, t, 'museo', { ...vis, decor: (g) => drawMuseumDoors(g, hub, info, t, art, worldsDone()), backdropDecor: (g, ox) => drawMuseumExhibits(g, ox, exhibits, t) });
    drawMuseumHud(ctx, museumDoor, info, save.data.record, toast, t);
    if (screen === 'gallery') drawGallery(ctx, art, save, galSel, t);
  } else {
    const L = WORLD_DATA[run.world].levels[run.idx];
    drawWorld(ctx, game, art, camX, t, L.id, vis);
    if (game.intro) drawIntro(ctx, game, camX, t, vis);
    else noteZones = drawHud(ctx, game, `${L.id} ${L.name}`, t, art, { notas: opt.notas }) || {};
    if (screen === 'victory') drawVictory(ctx, game, camX, screenT, opt.flashes);
    if (screen === 'card') drawCard(ctx, card, art, t);
    if (screen === 'end') drawEnd(ctx, game, save.data.record, art, t, endInfo);
    if (paused && screen === 'play') drawPause(ctx, t);
    if (skipBtn) { const show = canSkip(); if (skipBtn.hidden === show) skipBtn.hidden = !show; }
    if (screen === 'options') drawOptions(ctx, opt, optSel, t);
  }
  requestAnimationFrame(frame);
}

// Acceso para pruebas automáticas (no afecta al juego).
window.__jmv = {
  get game() { return game; }, get screen() { return screen; }, get paused() { return paused; }, get held() { return held; }, get save() { return save; },
  get level() { return run ? WORLD_DATA[run.world].levels[run.idx].id : 'museo'; },
  get door() { return museumDoor?.id ?? null; },
  start() { tapStart = true; },
  goto(i, world = run?.world ?? 'carmesi') { if (!run || run.world !== world) run = { world, idx: 0, carry: {}, levelStart: {}, time: 0 }; loadLevel(i, run.carry); screen = 'play'; },
  museum(door) { enterMuseum(door); },
};
enterMuseum('carmesi'); screen = 'title';
art.ready.then(() => requestAnimationFrame(frame));

// Escalado: entero cuando cabe (píxeles nítidos); fraccionario en pantallas pequeñas.
function fit() {
  const controls = matchMedia('(pointer: coarse)').matches ? 170 : 0;
  const s = Math.min(innerWidth / W, (innerHeight - controls - 24) / H);
  const k = s >= 2 ? Math.floor(s) : Math.max(1, s);
  cv.style.width = `${Math.floor(W * k)}px`;
  cv.style.height = `${Math.floor(H * k)}px`;
}
addEventListener('resize', fit);
fit();
