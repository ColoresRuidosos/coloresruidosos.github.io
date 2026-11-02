import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { TILE, P, DT } from '../src/game/constants.js';
import { parseLevel, tileAt, moveBody } from '../src/engine/tilemap.js';
import { stepPlayerMotion, createPlayer } from '../src/engine/physics.js';
import { followCamera } from '../src/engine/camera.js';
import { edges } from '../src/engine/buttons.js';

const FLAT = [
  '..........',
  '..........',
  '.P........',
  '##########',
].join('\n');

const NONE = { left: false, right: false, jump: false, jumpPressed: false };
const settle = (p, level, n = 30, btn = NONE) => { for (let i = 0; i < n; i++) stepPlayerMotion(p, btn, level); };

describe('tilemap (E3)', () => {
  test('parsea entidades y deja el hueco vacío', () => {
    const L = parseLevel('..H*..\nP.T..G\n######');
    assert.equal(L.w, 6);
    assert.equal(L.h, 3);
    assert.deepEqual(L.player, { x: 8, y: 2 * TILE });
    assert.equal(L.hooks.length, 1);
    assert.equal(L.pieces.length, 1);
    assert.equal(L.enemies.length, 1);
    assert.ok(L.goal);
    assert.equal(tileAt(L, 2, 1), '.');
  });

  test('fuera del mapa: paredes a los lados, vacío abajo (foso)', () => {
    const L = parseLevel(FLAT);
    assert.equal(tileAt(L, -1, 0), '#');
    assert.equal(tileAt(L, 10, 0), '#');
    assert.equal(tileAt(L, 3, 99), '.');
  });

  test('no atraviesa el suelo cayendo muy rápido', () => {
    const L = parseLevel(FLAT);
    const b = { x: 20, y: 0, w: 12, h: 26 };
    const r = moveBody(L, b, 0, 200);
    assert.ok(r.ground);
    assert.equal(b.y + b.h, 3 * TILE);
  });

  test('plataforma semisólida: se cae encima pero se atraviesa desde abajo', () => {
    const L = parseLevel('....\n.==.\n....\n....');
    const top = { x: 18, y: 0, w: 12, h: 10 };
    assert.ok(moveBody(L, top, 0, 20).ground);
    const below = { x: 18, y: 40, w: 12, h: 10 };
    const r = moveBody(L, below, 0, -30);
    assert.ok(!r.ceiling);
    assert.equal(below.y, 10);
  });
});

describe('física del salto (E2)', () => {
  test('gravedad lo deja en el suelo y la velocidad máxima se respeta', () => {
    const L = parseLevel(FLAT);
    const p = createPlayer(L.player);
    settle(p, L);
    assert.ok(p.onGround);
    settle(p, L, 120, { ...NONE, right: true });
    assert.ok(p.vx <= P.maxRun + 1e-9);
  });

  test('salto variable: soltar antes salta más bajo', () => {
    const peak = (holdFrames) => {
      const L = parseLevel(FLAT.replace(/\.\.\.\.\.\.\.\.\.\./g, '..........'));
      const p = createPlayer(L.player);
      settle(p, L);
      const y0 = p.y;
      let min = y0;
      for (let i = 0; i < 80; i++) {
        stepPlayerMotion(p, { ...NONE, jump: i < holdFrames, jumpPressed: i === 0 }, L);
        min = Math.min(min, p.y);
      }
      return y0 - min;
    };
    const full = peak(60), short = peak(4);
    assert.ok(full > 50, `salto completo ${full}`);
    assert.ok(short < full * 0.6, `corto ${short} vs ${full}`);
  });

  test('coyote time: puede saltar unos frames después de dejar el borde', () => {
    const L = parseLevel(['......', '.P....', '##....'].join('\n'));
    const p = createPlayer(L.player);
    settle(p, L);
    p.x = 2 * TILE + 1; // ya fuera del borde
    stepPlayerMotion(p, NONE, L);
    assert.ok(!p.onGround);
    stepPlayerMotion(p, { ...NONE, jump: true, jumpPressed: true }, L);
    assert.ok(p.vy < 0, 'debería haber saltado');
  });

  test('jump buffer: pulsar justo antes de aterrizar también salta', () => {
    const L = parseLevel(FLAT);
    const p = createPlayer(L.player);
    settle(p, L);
    p.y -= 4; p.onGround = false; p.coyote = 0; // a 4 px del suelo, cayendo
    stepPlayerMotion(p, { ...NONE, jump: true, jumpPressed: true }, L);
    let jumped = false;
    for (let i = 0; i < 8; i++) {
      stepPlayerMotion(p, { ...NONE, jump: true }, L);
      if (p.vy < -P.jumpVel * 0.9) jumped = true;
    }
    assert.ok(jumped);
  });
});

describe('cámara y botones (E1, E4)', () => {
  test('la cámara no se sale del nivel', () => {
    assert.equal(followCamera(0, 10, 3000), 0);
    assert.equal(followCamera(0, 2990, 3000), 3000 - 320);
  });

  test('edges detecta pulsaciones', () => {
    const e = edges({ jump: false, mic: false }, { jump: true, mic: false });
    assert.equal(e.jumpPressed, true);
    assert.equal(e.micPressed, false);
  });
});
