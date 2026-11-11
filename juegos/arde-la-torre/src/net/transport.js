// Transporte abstracto (plan §5): misma interfaz con PeerJS (producción) y BroadcastChannel (desarrollo y tests).
//   host:    listen(code, onConn) → Promise<{ close }>   (rechaza con err.taken si el código está ocupado)
//   cliente: open(code) → Promise<{ peer, connect(label, { reliable }) → Promise<Conn>, close }>
//   Conn:    { label, peer, open, send(d), onData(fn), onClose(fn), close() }
import { PREFIX } from './protocol.js';

function makeConn({ label, peer, sendRaw, closeRaw }) {
  const dataH = [], closeH = [];
  let open = true;
  const fireClose = () => { if (!open) return; open = false; for (const f of closeH) f(); };
  return {
    label, peer,
    get open() { return open; },
    send(d) { if (open) sendRaw(d); },
    onData(f) { dataH.push(f); },
    onClose(f) { closeH.push(f); },
    close() { if (!open) return; closeRaw(); fireClose(); },
    _data(d) { if (open) for (const f of dataH) f(d); },
    _closed: fireClose,
  };
}

let uid = 0;
const rid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}${(uid++).toString(36)}`;

// ---- BroadcastChannel: pestañas del mismo origen (o el mismo proceso de Node) ----
export function loopbackTransport(ns = 'arde-loop-') {
  return {
    kind: 'loop',
    async listen(code, onConn) {
      const ch = new BroadcastChannel(ns + code);
      const conns = new Map();
      ch.onmessage = ({ data: m }) => {
        if (!m || m.to !== 'h') return;
        if (m.k === 'open') {
          const c = makeConn({
            label: m.label, peer: m.peer,
            sendRaw: (d) => ch.postMessage({ to: 'c', k: 'data', cid: m.cid, d }),
            closeRaw: () => ch.postMessage({ to: 'c', k: 'close', cid: m.cid }),
          });
          conns.set(m.cid, c);
          ch.postMessage({ to: 'c', k: 'ack', cid: m.cid });
          onConn(c);
        } else if (m.k === 'data') conns.get(m.cid)?._data(m.d);
        else if (m.k === 'close') { conns.get(m.cid)?._closed(); conns.delete(m.cid); }
      };
      return { close() { for (const c of conns.values()) c.close(); ch.close(); } };
    },
    async open(code) {
      const ch = new BroadcastChannel(ns + code);
      const peer = rid();
      const conns = new Map(), acks = new Map();
      let n = 0;
      ch.onmessage = ({ data: m }) => {
        if (!m || m.to !== 'c') return;
        const c = conns.get(m.cid);
        if (!c) return;
        if (m.k === 'ack') acks.get(m.cid)?.();
        else if (m.k === 'data') c._data(m.d);
        else if (m.k === 'close') c._closed();
      };
      return {
        peer,
        connect(label, { timeout = 3000 } = {}) {
          return new Promise((resolve, reject) => {
            const cid = `${peer}:${label}:${n++}`;
            const c = makeConn({
              label, peer,
              sendRaw: (d) => ch.postMessage({ to: 'h', k: 'data', cid, d }),
              closeRaw: () => ch.postMessage({ to: 'h', k: 'close', cid }),
            });
            conns.set(cid, c);
            const to = setTimeout(() => { acks.delete(cid); conns.delete(cid); reject(new Error('sin respuesta de la sala')); }, timeout);
            acks.set(cid, () => { clearTimeout(to); acks.delete(cid); resolve(c); });
            ch.postMessage({ to: 'h', k: 'open', cid, label, peer });
          });
        },
        close() { for (const c of conns.values()) c.close(); ch.close(); },
      };
    },
  };
}

// ---- PeerJS (WebRTC DataChannel); su servidor gratuito solo presenta a los dos extremos ----
function wrapDC(dc) {
  const c = makeConn({ label: dc.label, peer: dc.peer, sendRaw: (d) => { try { dc.send(d); } catch { /* canal cerrándose */ } }, closeRaw: () => dc.close() });
  dc.on('data', (d) => c._data(d));
  dc.on('close', () => c._closed());
  dc.on('error', () => c._closed());
  return c;
}

export function peerTransport(PeerCtor, options = {}) {
  return {
    kind: 'peer',
    listen(code, onConn) {
      return new Promise((resolve, reject) => {
        const peer = new PeerCtor(PREFIX + code, options);
        let opened = false;
        peer.on('open', () => { opened = true; resolve({ close: () => peer.destroy() }); });
        peer.on('connection', (dc) => dc.on('open', () => onConn(wrapDC(dc))));
        peer.on('disconnected', () => { if (!peer.destroyed) peer.reconnect(); });
        peer.on('error', (e) => {
          if (opened) return;
          peer.destroy();
          reject(e && e.type === 'unavailable-id' ? Object.assign(new Error('código ocupado'), { taken: true }) : e);
        });
      });
    },
    open(code) {
      return new Promise((resolve, reject) => {
        const peer = new PeerCtor(options);
        const pending = new Set();
        let done = false;
        const to = setTimeout(() => { if (!done) { done = true; peer.destroy(); reject(new Error('sin conexión con el servidor')); } }, 12000);
        peer.on('error', (e) => {
          if (!done) { done = true; clearTimeout(to); peer.destroy(); reject(e); return; }
          for (const rej of pending) rej(e);        // p. ej. 'peer-unavailable': la sala no existe
          pending.clear();
        });
        peer.on('open', () => {
          if (done) return;
          done = true; clearTimeout(to);
          resolve({
            peer: peer.id,
            connect(label, { reliable = true, timeout = 12000 } = {}) {
              return new Promise((res, rej) => {
                const dc = peer.connect(PREFIX + code, { label, reliable, serialization: reliable ? 'json' : 'raw' });
                const fail = (e) => { clearTimeout(t); pending.delete(fail); rej(e); };
                const t = setTimeout(() => fail(new Error('sin respuesta de la sala')), timeout);
                pending.add(fail);
                dc.on('open', () => { clearTimeout(t); pending.delete(fail); res(wrapDC(dc)); });
                dc.on('error', fail);
              });
            },
            close: () => peer.destroy(),
          });
        });
      });
    },
  };
}
