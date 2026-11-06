// v7 · Guardado, modo asistido, progreso, desbloqueo de trajes y Museo (spec §3.0f A–D; tareas O1, O2, O4, O5).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createSave, defaults, SAVE_KEY } from '../src/engine/save.js';
import { recordLevel, checkUnlocks, costumeFor, doorState, COSTUMES } from '../src/game/progress.js';
import { WORLDS } from '../src/data/worlds.js';
import { HUB, createHub, doorAt } from '../src/game/museum.js';
import { createGame, stepGame, hurt } from '../src/game/game.js';
import { TILE } from '../src/game/constants.js';

const memory = (init = {}) => { const m = { ...init }; return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, m }; };
const idle = { left: false, right: false, jump: false, mic: false, special: false };

describe('guardado (O1 / E5)', () => {
  test('sin datos: valores por defecto', () => {
    const s = createSave(memory());
    assert.deepEqual(s.data, defaults());
    assert.equal(s.data.v, 1);
    assert.deepEqual(s.data.options, { flashes: true, shake: true, assist: false, music: true, notas: true });
    assert.equal(s.data.costume, 'auto');
    assert.deepEqual(s.data.unlocked, ['clasico']);
  });

  test('ida y vuelta: lo guardado se lee igual', () => {
    const st = memory();
    const a = createSave(st);
    a.data.options.flashes = false; a.data.record = 1234; a.data.unlocked.push('boina');
    a.commit();
    const b = createSave(st);
    assert.equal(b.data.options.flashes, false);
    assert.equal(b.data.record, 1234);
    assert.deepEqual(b.data.unlocked, ['clasico', 'boina']);
  });

  test('datos dañados o de otra versión: se empieza de cero sin romper', () => {
    assert.deepEqual(createSave(memory({ [SAVE_KEY]: '{no es json' })).data, defaults());
    assert.deepEqual(createSave(memory({ [SAVE_KEY]: JSON.stringify({ v: 99, record: 5 }) })).data, defaults());
  });

  test('faltan campos: se completan con los valores por defecto', () => {
    const s = createSave(memory({ [SAVE_KEY]: JSON.stringify({ v: 1, options: { flashes: false } }) }));
    assert.deepEqual(s.data.options, { flashes: false, shake: true, assist: false, music: true, notas: true });
    assert.deepEqual(s.data.worlds, {});
  });

  test('sin almacenamiento (modo privado, lanza errores): funciona en memoria', () => {
    const broken = { getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('bloqueado'); } };
    const s = createSave(broken);
    s.data.record = 9; assert.doesNotThrow(() => s.commit());
    assert.doesNotThrow(() => createSave(null).commit());
  });

  test('se conserva el récord antiguo (jmv-record)', () => {
    assert.equal(createSave(memory({ 'jmv-record': '45600' })).data.record, 45600);
  });
});

describe('modo asistido (O2)', () => {
  test('un golpe no quita corazones, pero sí empuja y da invulnerabilidad', () => {
    const g = createGame('.P..\n####', {}, { assist: true });
    hurt(g, 100);
    assert.equal(g.hearts, 3);
    assert.ok(g.invuln > 0);
    assert.ok(g.player.vx < 0);
    assert.equal(g.hurts, 1, 'se cuenta el golpe (para el reto «sin daño»)');
  });

  test('caer a un foso devuelve al checkpoint sin perder corazones', () => {
    const g = createGame('.P......\n##....##\n........', {}, { assist: true });
    g.player.x = 3 * TILE; g.player.y = 5 * TILE;
    for (let i = 0; i < 60 && g.player.y < 4 * TILE; i++) stepGame(g, idle);
    for (let i = 0; i < 30; i++) stepGame(g, idle);
    assert.equal(g.hearts, 3);
    assert.equal(g.status, 'play');
  });

  test('sin modo asistido todo sigue igual', () => {
    const g = createGame('.P..\n####');
    hurt(g, 100);
    assert.equal(g.hearts, 2);
  });
});

describe('progreso y trajes (O4)', () => {
  test('8 mundos en orden, con color, año y traje automático', () => {
    assert.deepEqual(WORLDS.map((w) => w.id), ['carmesi', 'noche', 'alba', 'psalmos', 'giallo', 'aurora', 'sarajevo', 'querido']);
    for (const w of WORLDS) { assert.match(w.color, /^#[0-9a-f]{6}$/i); assert.ok(w.year >= 2016 && w.year <= 2026); assert.ok(COSTUMES.some((c) => c.id === w.costume)); }
    assert.equal(WORLDS[0].costume, 'clasico');
    assert.equal(WORLDS[1].costume, 'vampiro');
  });

  test('8 trajes; ninguno con nombre de personaje registrado', () => {
    assert.equal(COSTUMES.length, 8);
    for (const c of COSTUMES) { assert.ok(c.name && c.how); assert.doesNotMatch(c.name + c.how, /tinky|teletubbie|foro gnp/i); }
  });

  test('marcas por nivel: se guarda lo mejor de cada cosa', () => {
    const s = createSave(memory());
    recordLevel(s, 'carmesi', '1-1', { time: 70, score: 3000, piezas: 3, total: 5 });
    recordLevel(s, 'carmesi', '1-1', { time: 60, score: 2000, piezas: 5, total: 5 });
    const b = s.data.worlds.carmesi.best['1-1'];
    assert.deepEqual(b, { time: 60, score: 3000, piezas: 5, total: 5 });
    assert.deepEqual(s.data.worlds.carmesi.cleared, ['1-1']);
  });

  test('puertas del museo: Carmesí abierta, Noche al terminar Carmesí, el resto próximamente', () => {
    const s = createSave(memory());
    assert.equal(doorState(s, 'carmesi'), 'open');
    assert.equal(doorState(s, 'noche'), 'locked');
    assert.equal(doorState(s, 'alba'), 'soon');
    s.data.worlds.carmesi = { cleared: ['1-1', '1-2', '1-3'], best: {} };
    assert.equal(doorState(s, 'noche'), 'open');
  });

  test('gris con boina: todas las piezas de un nivel del Mundo 1', () => {
    const s = createSave(memory());
    assert.deepEqual(checkUnlocks(s, { world: 'carmesi', levelId: '1-1', piezas: 4, total: 5 }), []);
    assert.deepEqual(checkUnlocks(s, { world: 'carmesi', levelId: '1-1', piezas: 5, total: 5 }), ['boina']);
    assert.deepEqual(checkUnlocks(s, { world: 'carmesi', levelId: '1-2', piezas: 5, total: 5 }), [], 'no se desbloquea dos veces');
  });

  test('chamarra: Mundo 1 en menos de 4:00; botarga: jefe sin daño y sin asistido', () => {
    const s = createSave(memory());
    assert.ok(!checkUnlocks(s, { world: 'carmesi', levelId: '1-3', worldDone: true, runTime: 241, hurts: 1 }).length);
    assert.deepEqual(checkUnlocks(s, { world: 'carmesi', levelId: '1-3', worldDone: true, runTime: 239, hurts: 1 }), ['chamarra']);
    assert.deepEqual(checkUnlocks(s, { world: 'carmesi', levelId: '1-3', hurts: 0, assist: true }), []);
    assert.deepEqual(checkUnlocks(s, { world: 'carmesi', levelId: '1-3', hurts: 0 }), ['botarga']);
  });

  test('negro con lentes: todos los Carmesís del Mundo 1 (sumando las mejores marcas)', () => {
    const s = createSave(memory());
    recordLevel(s, 'carmesi', '1-1', { time: 1, score: 1, piezas: 5, total: 5 });
    recordLevel(s, 'carmesi', '1-2', { time: 1, score: 1, piezas: 6, total: 6 });
    assert.ok(!checkUnlocks(s, { world: 'carmesi', levelId: '1-2' }).includes('lentes'));
    recordLevel(s, 'carmesi', '1-3', { time: 1, score: 1, piezas: 1, total: 1 });
    assert.ok(checkUnlocks(s, { world: 'carmesi', levelId: '1-3' }).includes('lentes'));
  });

  test('vampiro: terminar Noche; rojo y bandana negra aún no se pueden ganar', () => {
    const s = createSave(memory());
    assert.deepEqual(checkUnlocks(s, { world: 'noche', levelId: '2-3', worldDone: true, hurts: 3 }), ['vampiro']);
    assert.ok(!s.data.unlocked.includes('rojo') && !s.data.unlocked.includes('bandana'));
  });

  test('traje: automático por mundo, o el elegido si está desbloqueado', () => {
    const s = createSave(memory());
    assert.equal(costumeFor(s, 'carmesi'), 'clasico');
    assert.equal(costumeFor(s, 'noche'), 'vampiro');
    s.data.costume = 'botarga';
    assert.equal(costumeFor(s, 'carmesi'), 'clasico', 'bloqueado: se ignora');
    s.data.unlocked.push('botarga');
    assert.equal(costumeFor(s, 'noche'), 'botarga');
  });
});

describe('Museo (O5 / J6)', () => {
  test('pasillo con 8 puertas en orden y la Galería al final, sin enemigos', () => {
    const hub = createHub();
    assert.deepEqual(hub.doors.map((d) => d.id), [...WORLDS.map((w) => w.id), 'galeria']);
    for (let i = 1; i < hub.doors.length; i++) assert.ok(hub.doors[i].x > hub.doors[i - 1].x);
    const g = createGame(HUB);
    assert.equal(g.enemies.length, 0);
    assert.equal(g.boss, null);
    assert.equal(g.level.goal, null);
  });

  test('doorAt: delante de una puerta, sí; entre puertas, no', () => {
    const hub = createHub();
    const g = createGame(HUB);
    const d = hub.doors[1];
    g.player.x = d.x - g.player.w / 2;
    assert.equal(doorAt(hub, g.player)?.id, 'noche');
    g.player.x = (hub.doors[0].x + hub.doors[1].x) / 2 - g.player.w / 2;
    assert.equal(doorAt(hub, g.player), null);
  });

  test('se puede caminar de la primera puerta a la Galería sin saltar', () => {
    const hub = createHub();
    const g = createGame(HUB);
    for (let i = 0; i < 60 * 30 && !doorAt(hub, g.player)?.id?.startsWith('galeria'); i++) stepGame(g, { ...idle, right: true });
    assert.equal(doorAt(hub, g.player)?.id, 'galeria');
  });
});
