// v8.1 · El Enmascarado con repertorio de ataques (spec §3.0f G; tarea B1).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { MASK, TILE } from '../src/game/constants.js';
import { createGame, stepGame } from '../src/game/game.js';
import { hitMask, MASK_VULNERABLE } from '../src/game/noche.js';
import { WORLD_2 } from '../src/data/world2.js';
import { maskBot } from './bot.js';

const idle = { left: false, right: false, jump: false, mic: false, special: false };
const arena = WORLD_2[2];
const fight = () => { const g = createGame(arena.map, {}, { lantern: arena.lantern }); g.intro = null; return g; };
// Deja correr el combate con Pepe quieto e invulnerable, y apunta los ataques elegidos.
function watch(g, seconds) {
  for (let i = 0; i < 60 * seconds; i++) { stepGame(g, idle); g.invuln = 1; g.hearts = 3; }
  return g.boss.attacks;
}

describe('repertorio', () => {
  test('fase 1: embestida, salto y máscaras, sin repetir el mismo dos veces seguidas', () => {
    const at = watch(fight(), 60);
    for (const a of ['dash', 'leap', 'throw']) assert.ok(at.includes(a), `${a} en ${at}`);
    assert.ok(!at.includes('fog') && !at.includes('summon'), 'niebla e invitados solo en la fase 2');
    for (let i = 1; i < at.length; i++) assert.notEqual(at[i], at[i - 1], `repite ${at[i]} en ${i}`);
  });

  test('fase 2 (4 golpes o menos): añade la niebla y los invitados, con apagón antes de cada ataque', () => {
    const g = fight(); g.boss.hp = MASK.phase2; g.boss.phase = 2;
    let blackout = false;
    for (let i = 0; i < 60 * 60; i++) { stepGame(g, idle); g.invuln = 1; g.hearts = 3; blackout ||= g.blackout; }
    assert.ok(g.boss.attacks.includes('fog') && g.boss.attacks.includes('summon'), g.boss.attacks.join(','));
    assert.ok(blackout);
  });

  test('determinista: el mismo combate elige siempre los mismos ataques', () => {
    assert.deepEqual(watch(fight(), 40), watch(fight(), 40));
  });
});

describe('ataques', () => {
  test('salto encima: cae cerca de donde estaba Pepe y lanza dos ondas por el suelo en direcciones opuestas', () => {
    const g = fight(), b = g.boss;
    let waves = null, target = null;
    for (let i = 0; i < 60 * 30 && !waves; i++) {
      stepGame(g, idle); g.invuln = 1; g.hearts = 3;
      if (b.state === 'leap' && target === null) target = g.player.x + g.player.w / 2;
      const ws = g.shots.filter((s) => s.kind === 'wave');
      if (ws.length) waves = ws;
    }
    assert.ok(waves, 'hubo ondas');
    assert.deepEqual(waves.map((w) => Math.sign(w.vx)).sort(), [-1, 1]);
    assert.ok(Math.abs(b.x + b.w / 2 - target) < 40, 'aterriza cerca de Pepe');
    assert.equal(b.state, 'landed');
  });

  test('las ondas hacen daño a Pepe en el suelo, pero no si salta', () => {
    const g = fight(); g.boss.state = 'landed'; g.boss.t = 0;
    const p = g.player, floor = p.y + p.h;
    g.shots.push({ kind: 'wave', x: p.x + p.w + 4, y: floor - 10, w: 10, h: 10, vx: -160, vy: 0, life: 1 });
    stepGame(g, idle); stepGame(g, idle); stepGame(g, idle);
    assert.ok(g.hearts < 3);
    const g2 = fight(); g2.boss.state = 'landed';
    const p2 = g2.player;
    p2.y -= 40; p2.vy = -50;
    g2.shots.push({ kind: 'wave', x: p2.x - 2, y: p2.y + 40 + p2.h - 10, w: 10, h: 10, vx: -160, vy: 0, life: 1 });
    stepGame(g2, idle);
    assert.equal(g2.hearts, 3);
  });

  test('máscaras: lanza tres en abanico hacia Pepe', () => {
    const g = fight();
    let masks = [];
    for (let i = 0; i < 60 * 30 && !masks.length; i++) { stepGame(g, idle); g.invuln = 1; g.hearts = 3; masks = g.shots.filter((s) => s.kind === 'mask'); }
    assert.equal(masks.length, 3);
    const dir = Math.sign(g.player.x - g.boss.x);
    for (const m of masks) assert.equal(Math.sign(m.vx), dir);
    assert.equal(new Set(masks.map((m) => Math.round(m.vy))).size, 3, 'en abanico');
  });

  test('invitados (fase 2): llama a un Charro Negro y a un Gigante, y no repite mientras sigan en pie', () => {
    const g = fight(); g.boss.hp = MASK.phase2; g.boss.phase = 2;
    for (let i = 0; i < 60 * 60 && !g.enemies.some((e) => e.summoned); i++) { stepGame(g, idle); g.invuln = 1; g.hearts = 3; }
    const s = g.enemies.filter((e) => e.summoned).map((e) => e.kind).sort();
    assert.deepEqual(s, ['charro', 'gigante']);
    const n = g.boss.attacks.filter((a) => a === 'summon').length;
    for (let i = 0; i < 60 * 20; i++) { stepGame(g, idle); g.invuln = 1; g.hearts = 3; }
    assert.equal(g.boss.attacks.filter((a) => a === 'summon').length, n, 'no vuelve a llamar con los suyos en pie');
  });
});

describe('ventanas para golpearle', () => {
  test('solo es vulnerable al terminar cada ataque, y un golpe por ventana', () => {
    for (const st of ['stun', 'landed', 'recover', 'clawRecover', 'summon']) {
      assert.ok(MASK_VULNERABLE.has(st));
      const g = fight(), b = g.boss; b.state = st; b.t = 0;
      assert.equal(hitMask(g, b), true, st);
      b.hurtT = 0;
      assert.equal(hitMask(g, b), false, `${st}: segundo golpe en la misma ventana`);
    }
    for (const st of ['idle', 'lurk', 'dash', 'crouch', 'leap', 'aim', 'fade', 'claw', 'blackout']) {
      const g = fight(), b = g.boss; b.state = st;
      assert.equal(hitMask(g, b), false, st);
    }
  });
});

describe('combate completo', () => {
  test('un bot que esquiva y golpea en las ventanas le gana con 3 corazones', () => {
    const g = fight(), b = g.boss;
    for (let i = 0; i < 60 * 240 && g.status === 'play'; i++) stepGame(g, maskBot(g));
    assert.equal(g.status, 'won', `hp=${b.hp} corazones=${g.hearts} ataques=${b.attacks.join(',')}`);
    assert.equal(b.unmasked, true);
    assert.equal(g.disco.kind, 'mascara');
    void TILE;
  });
});
