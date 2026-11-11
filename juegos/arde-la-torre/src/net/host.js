// Sala en la pantalla principal (F10): código, aceptar o rechazar móviles, latidos, ausencias y reconexión.
import { VERSION, makeCode, decodeInput, parseCtl } from './protocol.js';
import { createRemoteSource } from '../input/remote.js';
import { SLOT_COLORS } from '../input/slots.js';

export const AWAY_MS = 1500;     // sin latido → ausente (F10.5)
export const DROP_MS = 20000;    // ausente 20 s → sale de la partida
export const KEEPALIVE_MS = 1000;

export function createRoom({ transport, slots, now = () => performance.now(), random = Math.random, onEvent = () => {} }) {
  const sessions = new Map();          // sid → sesión
  const inByPeer = new Map();          // peer → canal de entradas
  let code = null, listener = null, lastKeep = 0;

  const byPeer = (peer) => [...sessions.values()].find((s) => s.peer === peer);
  const bySlot = (slot) => [...sessions.values()].find((s) => s.slot === slot);
  const keyOf = (sid) => `movil:${sid}`;

  async function start(tries = 6) {
    for (let i = 0; i < tries; i++) {
      const c = makeCode(random);
      try { listener = await transport.listen(c, onConn); code = c; return c; } catch (e) { if (!e || !e.taken) throw e; }
    }
    throw new Error('no se encontró un código libre');
  }

  function onConn(conn) {
    if (conn.label === 'in') {
      inByPeer.set(conn.peer, conn);
      conn.onData((d) => {
        const s = byPeer(conn.peer);
        const m = decodeInput(d);
        if (!s || !m) return;
        if (s.source.apply(m)) { s.lastSeen = now(); if (s.away) back(s); }
      });
      conn.onClose(() => { if (inByPeer.get(conn.peer) === conn) inByPeer.delete(conn.peer); });
      return;
    }
    conn.onData((raw) => handleCtl(conn, parseCtl(raw)));
    conn.onClose(() => { const s = byPeer(conn.peer); if (s && s.ctl === conn && !s.away) markAway(s); });
  }

  function welcome(s) {
    const slot = slots.get(s.slot);
    s.ctl.send({ t: 'bienvenido', v: VERSION, slot: s.slot, color: SLOT_COLORS[s.slot], hero: slot && slot.hero, ready: !!(slot && slot.ready) });
  }

  function handleCtl(conn, m) {
    if (!m) return;
    if (m.t === 'hola') {
      if (m.v !== VERSION) { conn.send({ t: 'error', msg: 'VERSIÓN DISTINTA: RECARGA LA PÁGINA' }); return; }
      let s = sessions.get(m.sid);
      if (s) {
        if (s.ctl && s.ctl !== conn) s.ctl.close();
        s.ctl = conn; s.peer = conn.peer; s.lastSeen = now();
        welcome(s);
        if (s.away) back(s);
        return;
      }
      const slot = slots.join(keyOf(m.sid), 'movil');
      if (slot === null) { conn.send({ t: 'llena' }); return; }
      s = { sid: m.sid, slot, ctl: conn, peer: conn.peer, source: createRemoteSource(now), lastSeen: now(), away: false, awaySince: 0 };
      sessions.set(m.sid, s);
      welcome(s);
      onEvent({ type: 'join', slot, sid: m.sid });
      return;
    }
    const s = [...sessions.values()].find((x) => x.ctl === conn);
    if (!s) return;
    s.lastSeen = now();
    if (s.away) back(s);
    if (m.t === 'elige') { if (slots.setHero(s.slot, m.hero)) onEvent({ type: 'hero', slot: s.slot, hero: m.hero }); }
    else if (m.t === 'listo') { slots.setReady(s.slot, m.ready); onEvent({ type: 'ready', slot: s.slot, ready: m.ready }); }
    else if (m.t === 'ping') conn.send({ t: 'pong' });
  }

  function markAway(s) {
    s.away = true; s.awaySince = now(); s.source.reset();
    onEvent({ type: 'away', slot: s.slot });
  }
  function back(s) {
    s.away = false;
    onEvent({ type: 'back', slot: s.slot });
  }
  function drop(s) {
    sessions.delete(s.sid);
    slots.leave(keyOf(s.sid));
    if (s.ctl) s.ctl.close();
    const inp = inByPeer.get(s.peer); if (inp) inp.close();
    onEvent({ type: 'leave', slot: s.slot });
  }

  return {
    start,
    get code() { return code; },
    update() {
      const t = now();
      for (const s of [...sessions.values()]) {
        if (!s.away && t - s.lastSeen > AWAY_MS) markAway(s);
        else if (s.away && t - s.awaySince > DROP_MS) drop(s);
      }
      if (t - lastKeep >= KEEPALIVE_MS) { lastKeep = t; this.broadcast({ t: 'pong' }); }
    },
    sourceFor: (slot) => { const s = bySlot(slot); return s ? s.source : null; },
    isPhone: (slot) => !!bySlot(slot),
    isAway: (slot) => { const s = bySlot(slot); return !!(s && s.away); },
    sendTo(slot, msg) { const s = bySlot(slot); if (s && s.ctl && s.ctl.open) s.ctl.send(msg); },
    broadcast(msg) { for (const s of sessions.values()) if (s.ctl && s.ctl.open) s.ctl.send(msg); },
    kick(slot) { const s = bySlot(slot); if (s) drop(s); },
    get size() { return sessions.size; },
    close() { for (const s of sessions.values()) if (s.ctl) s.ctl.close(); if (listener) listener.close(); sessions.clear(); },
  };
}
