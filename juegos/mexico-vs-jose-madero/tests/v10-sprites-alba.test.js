// v10.3 · Sprites de Alba por código, estilo Neo Geo (spec §3.0f Q v10.3; tarea AL7b).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { OUTLINE } from '../src/render/pixel.js';
import { ALBA, renderAlba } from '../src/render/sprites-alba.js';

const visible = (f) => {
  const rows = [], cols = [];
  for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) if (f.px[y * f.w + x]) { rows.push(y); cols.push(x); }
  return { h: Math.max(...rows) - Math.min(...rows) + 1, w: Math.max(...cols) - Math.min(...cols) + 1, n: rows.length };
};

describe('sprites de Alba', () => {
  test('existen todos, con sus animaciones y tamaños de la spec', () => {
    for (const [id, spec] of Object.entries(ALBA)) {
      const s = renderAlba(id);
      for (const [anim, n] of Object.entries(spec.anims)) assert.equal(s.anims[anim]?.length, n, `${id}.${anim}`);
      for (const f of s.frames) { assert.equal(f.w, spec.w, `${id} ancho`); assert.equal(f.h, spec.h, `${id} alto`); }
    }
    assert.deepEqual(Object.keys(ALBA).sort(), ['atril', 'banca', 'caballito', 'cabina', 'diana', 'eje', 'luz', 'nostalgia', 'plataforma', 'recuerdo'].sort());
  });

  test('cada fotograma tiene contorno oscuro y suficientes tonos (salvo la plataforma apagada)', () => {
    for (const id of Object.keys(ALBA)) {
      for (const f of renderAlba(id).frames) {
        const used = f.px.filter(Boolean);
        assert.ok(used.includes(OUTLINE), `${id}/${f.key} sin contorno`);
        if (!(id === 'plataforma' && f.key.startsWith('off'))) assert.ok(new Set(used).size >= 4, `${id}/${f.key}: ${new Set(used).size} colores`);
      }
    }
  });

  test('La Nostalgia: grande (más de 60 px de alto), flota y al despedirse pasa de sepia a dorado', () => {
    const s = renderAlba('nostalgia');
    const f0 = s.frames.find((f) => f.key === 'flota0');
    assert.ok(visible(f0).h >= 60, `alto ${visible(f0).h}`);
    assert.notEqual(f0.px.join(), s.frames.find((f) => f.key === 'flota2').px.join(), 'flota se mueve');
    const warm = (f) => f.px.filter((c) => c && parseInt(c.slice(1, 3), 16) > 200 && parseInt(c.slice(3, 5), 16) > 170 && parseInt(c.slice(5, 7), 16) < 140).length;
    assert.ok(warm(s.frames.find((f) => f.key === 'despide3')) > warm(f0) * 2, 'el final es más dorado');
  });

  test('Recuerdo: 4 fotos distintas (rosa, antifaz, flash, noria) dentro de un marco blanco', () => {
    const s = renderAlba('recuerdo');
    const fotos = ['rosa', 'antifaz', 'flash', 'noria'].map((v) => s.frames.find((f) => f.key === `${v}0`));
    assert.equal(new Set(fotos.map((f) => f.px.join())).size, 4);
    for (const f of fotos) assert.ok(f.px.filter((c) => c && c.toLowerCase() >= '#e8').length > 20, `${f.key}: marco claro`);
  });

  test('plataforma de luz: encendida es sólida; apagada, solo un contorno punteado', () => {
    const s = renderAlba('plataforma');
    const on = visible(s.frames.find((f) => f.key === 'on0')), off = visible(s.frames.find((f) => f.key === 'off0'));
    assert.ok(on.n > off.n * 2, `${on.n} vs ${off.n}`);
  });

  test('atril leído y diana caída se ven distintos', () => {
    const a = renderAlba('atril'), d = renderAlba('diana');
    assert.notEqual(a.frames[0].px.join(), a.frames.find((f) => f.key === 'leido0').px.join());
    assert.ok(visible(d.frames.find((f) => f.key === 'caida0')).h < visible(d.frames[0]).h, 'caída: más baja');
  });
});
