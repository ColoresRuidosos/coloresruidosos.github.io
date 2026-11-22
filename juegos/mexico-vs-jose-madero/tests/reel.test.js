// Tráiler de Alba (reel/spec.md): línea de tiempo y letreros.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SCENES, FPS, RW, RH, GAME_Y, SAFE, totalFrames, sceneAt } from '../reel/timeline.js';
import { textWidth } from '../src/render/font.js';

test('8+ escenas seguidas, sin huecos, ~31 s a 30 fps', () => {
  assert.equal(FPS, 30);
  assert.ok(SCENES.length >= 8);
  for (let i = 1; i < SCENES.length; i++) assert.equal(SCENES[i].from, SCENES[i - 1].to, SCENES[i].id);
  const secs = totalFrames() / FPS;
  assert.ok(secs >= 29 && secs <= 33, `${secs} s`);
  assert.equal(sceneAt(0).id, SCENES[0].id);
  assert.equal(sceneAt(totalFrames() - 1).id, SCENES.at(-1).id);
});

test('lienzo 360×640 (×3 = 1080×1920) con el juego de 320×224 dentro', () => {
  assert.equal(RW * 3, 1080); assert.equal(RH * 3, 1920);
  assert.ok(GAME_Y >= SAFE && GAME_Y + 224 <= RH - SAFE);
});

test('cada letrero cabe a lo ancho y está en la zona segura de Reels (120 px reales arriba y abajo)', () => {
  assert.equal(SAFE * 3, 120);
  for (const s of SCENES) for (const c of s.captions ?? []) {
    const w = textWidth(c.text) * (c.scale ?? 2);
    assert.ok(w <= RW - 12, `«${c.text}» mide ${w}`);
    assert.ok(c.y >= SAFE && c.y + 7 * (c.scale ?? 2) <= RH - SAFE, `«${c.text}» en y=${c.y}`);
    assert.ok((c.scale ?? 2) >= 2 || c.small, `«${c.text}»: texto mínimo ×2 (42 px reales)`);
  }
});

test('el cierre lleva HOMENAJE NO OFICIAL y la cuenta de CR', () => {
  const txt = SCENES.at(-1).captions.map((c) => c.text).join(' ');
  assert.match(txt, /HOMENAJE NO OFICIAL/); assert.match(txt, /@COLORESRUIDOSOS/);
});
