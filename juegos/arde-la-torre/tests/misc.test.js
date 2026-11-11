// T4.7 (QR), T5.5 (secuenciador) y T5.7 (opciones guardadas).
import test from 'node:test';
import assert from 'node:assert/strict';
import jsQR from 'jsqr';
import { qrMatrix } from '../src/render/qr.js';
import { SONGS, songEvents, stepSeconds, BOSS_SONG } from '../src/audio/music.js';
import { LEVELS } from '../src/data/levels.js';
import { loadOptions, saveOptions, DEFAULTS, KEY } from '../src/core/save.js';

test('T4.7 el QR de la sala se lee con un decodificador y lleva la URL del mando', () => {
  const url = 'https://coloresruidosos.github.io/games/arde-la-torre/mando/?s=K7QP';
  const m = qrMatrix(url);
  const scale = 4, total = (m.n + 8) * scale;
  const data = new Uint8ClampedArray(total * total * 4).fill(255);
  for (let r = 0; r < m.n; r++) for (let c = 0; c < m.n; c++) {
    if (!m.dark(r, c)) continue;
    for (let y = 0; y < scale; y++) for (let x = 0; x < scale; x++) {
      const i = (((r + 4) * scale + y) * total + (c + 4) * scale + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = 0;
    }
  }
  const out = jsQR(data, total, total);
  assert.ok(out, 'se decodifica');
  assert.equal(out.data, url);
  assert.ok(m.n <= 41, `cabe en la sala a 2 px por módulo (${m.n} módulos)`);
});

test('T5.5 secuenciador: eventos deterministas, bajo en cada tiempo fuerte y un tema por nivel', () => {
  for (const l of LEVELS) assert.ok(SONGS[l.music], `nivel ${l.id} con tema`);
  assert.ok(SONGS[BOSS_SONG]);
  const s = SONGS[0];
  assert.deepEqual(songEvents(s, 0), songEvents(s, 0));
  assert.ok(songEvents(s, 0).some((e) => e.ch === 'bass' && e.note === s.prog[0]));
  assert.ok(songEvents(s, 0).some((e) => e.ch === 'kick'));
  const bar3 = Array.from({ length: 16 }, (_, i) => songEvents(s, 48 + i)).flat();
  assert.ok(bar3.some((e) => e.ch === 'lead'), 'la melodía entra en la 2.ª mitad de la vuelta');
  const bar0 = Array.from({ length: 16 }, (_, i) => songEvents(s, i)).flat();
  assert.ok(!bar0.some((e) => e.ch === 'lead'));
  assert.ok(Math.abs(stepSeconds(s) - 60 / s.bpm / 4) < 1e-9);
  for (const song of SONGS) { assert.equal(song.riff.length, 16); assert.equal(song.drums.length, 16); }
});

test('T5.7 opciones: valores por defecto, guardar y cargar, y datos corruptos', () => {
  const mem = new Map();
  const st = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  assert.deepEqual(loadOptions(st), { ...DEFAULTS });
  assert.ok(saveOptions({ ...DEFAULTS, shake: false, volume: 0.3 }, st));
  assert.deepEqual(loadOptions(st), { ...DEFAULTS, shake: false, volume: 0.3 });
  mem.set(KEY, '{roto');
  assert.deepEqual(loadOptions(st), { ...DEFAULTS });
  mem.set(KEY, JSON.stringify({ volume: 7, assisted: 'sí' }));
  assert.deepEqual(loadOptions(st), { ...DEFAULTS, volume: 1 });
});
