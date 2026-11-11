// T4.1–T4.5: protocolo, transporte local, sala, ausencias y reconexión (con reloj falso).
import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeInput, decodeInput, seqNewer, makeCode, isCode, CODE_ALPHABET, parseCtl } from '../src/net/protocol.js';
import { loopbackTransport } from '../src/net/transport.js';
import { createRoom, AWAY_MS, DROP_MS } from '../src/net/host.js';
import { createPadClient } from '../src/net/pad.js';
import { createRemoteSource, STALE_MS } from '../src/input/remote.js';
import { createSlots } from '../src/input/slots.js';
import { NEUTRAL } from '../src/input/source.js';

const wait = (ms = 30) => new Promise((r) => setTimeout(r, ms));
const until = async (fn, ms = 2000) => { const t0 = Date.now(); while (!fn()) { if (Date.now() - t0 > ms) throw new Error('tiempo agotado'); await wait(10); } };

test('T4.1 entradas en 5 bytes; ida y vuelta; mensajes fuera de orden', () => {
  const b = encodeInput({ x: -1, y: 1, golpe: true, salto: false, especial: true, pausa: false }, 300);
  assert.equal(b.length, 5);
  const m = decodeInput(b);
  assert.deepEqual(m, { seq: 300 & 255, x: -1, y: 1, golpe: true, salto: false, especial: true, pausa: false });
  assert.deepEqual(decodeInput(b.buffer), m, 'también como ArrayBuffer');
  assert.equal(decodeInput(new Uint8Array([1, 2, 3])), null);
  assert.equal(decodeInput('hola'), null);
  assert.ok(seqNewer(5, 4)); assert.ok(!seqNewer(4, 5)); assert.ok(seqNewer(2, 250), 'da la vuelta'); assert.ok(!seqNewer(7, 7));
  assert.equal(parseCtl({ t: 'hola', sid: 'x' }), null, 'sid demasiado corto');
  assert.equal(parseCtl({ t: 'desconocido' }), null);
  assert.ok(parseCtl({ t: 'elige', hero: 'pepe' }));
});

test('T4.3 el código no lleva caracteres ambiguos', () => {
  for (const c of 'O0I1L') assert.ok(!CODE_ALPHABET.includes(c));
  for (let i = 0; i < 200; i++) assert.ok(isCode(makeCode()));
});

test('T4.5 la fuente remota descarta paquetes viejos y vuelve a neutro si se corta (sin botones pegados)', () => {
  let t = 0;
  const src = createRemoteSource(() => t);
  assert.ok(src.apply({ seq: 10, x: 1, y: 0, golpe: true }));
  assert.equal(src.read().golpe, true);
  assert.ok(!src.apply({ seq: 9, x: -1, y: 0, golpe: false }), 'paquete viejo');
  assert.equal(src.read().x, 1);
  t = STALE_MS + 1;
  assert.equal(src.read(), NEUTRAL);
});

async function setup(t0 = { v: 0 }) {
  const ns = `t-${Math.random().toString(36).slice(2)}-`;
  const transport = loopbackTransport(ns);
  const slots = createSlots();
  const events = [];
  const room = createRoom({ transport, slots, now: () => t0.v, onEvent: (e) => events.push(e) });
  const code = await room.start();
  const pads = [];
  const pad = (sid) => { const p = createPadClient({ transport, code, sid, now: () => t0.v }); pads.push(p); return p.start(); };
  return { room, slots, events, code, pad, clock: t0, close: () => { pads.forEach((p) => p.stop()); room.close(); } };
}

test('T4.2–T4.3 la sala acepta 4 móviles y rechaza el 5.º con «llena»', async () => {
  const s = await setup();
  try {
    const ps = ['aaaaaa1', 'bbbbbb2', 'cccccc3', 'dddddd4'].map((sid) => s.pad(sid));
    await until(() => ps.every((p) => p.state.status === 'conectado'));
    assert.deepEqual(ps.map((p) => p.state.slot), [0, 1, 2, 3]);
    const fifth = s.pad('eeeeee5');
    await until(() => fifth.state.status === 'llena');
    assert.equal(s.events.filter((e) => e.type === 'join').length, 4);
  } finally { s.close(); }
});

test('T4.4–T4.5 entradas del móvil, elegir músico, ausencia a los 1,5 s, salida a los 20 s y reconexión', async () => {
  const s = await setup();
  try {
    const p = s.pad('telefono-1');
    await until(() => p.state.status === 'conectado');
    p.choose('jota'); p.setReady(true);
    await until(() => s.slots.get(0).hero === 'jota' && s.slots.get(0).ready);
    p.setInput({ ...NEUTRAL, x: 1, golpe: true });
    await until(() => s.room.sourceFor(0).read().golpe === true);
    assert.equal(s.room.sourceFor(0).read().x, 1);

    // Se corta la conexión (el móvil deja de mandar): ausente a los 1,5 s.
    p.stop();
    s.clock.v += AWAY_MS + 10; s.room.update();
    assert.ok(s.events.some((e) => e.type === 'away' && e.slot === 0));
    assert.equal(s.room.sourceFor(0).read(), NEUTRAL, 'sin botones pegados');

    // Vuelve con el mismo sid antes de 20 s: recupera su hueco.
    const p2 = s.pad('telefono-1');
    await until(() => p2.state.status === 'conectado');
    assert.equal(p2.state.slot, 0); assert.equal(p2.state.hero, 'jota');
    assert.ok(s.events.some((e) => e.type === 'back' && e.slot === 0));

    // Se va del todo: a los 20 s ausente, sale de la partida.
    p2.stop();
    s.clock.v += AWAY_MS + 10; s.room.update();
    s.clock.v += DROP_MS + 10; s.room.update();
    assert.ok(s.events.some((e) => e.type === 'leave' && e.slot === 0));
    assert.equal(s.slots.get(0), null);
  } finally { s.close(); }
});

test('la pantalla manda el estado (vida, vidas, fase) al móvil de cada jugador', async () => {
  const s = await setup();
  try {
    const p = s.pad('telefono-9');
    await until(() => p.state.status === 'conectado');
    s.room.sendTo(0, { t: 'estado', hp: 50, maxHp: 100, lives: 2, score: 1200, fase: 'juego' });
    await until(() => p.state.hp === 50);
    assert.equal(p.state.fase, 'juego');
  } finally { s.close(); }
});
