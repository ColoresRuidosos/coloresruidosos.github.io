// Lado del móvil (F10): se conecta a la sala, manda las entradas (al cambiar y como latido cada 50 ms),
// recibe vida y vibración, y se reconecta solo si se corta.
import { VERSION, encodeInput, parseCtl } from './protocol.js';
import { NEUTRAL } from '../input/source.js';

export const HEARTBEAT_MS = 50;
export const HOST_TIMEOUT_MS = 3500;
export const MAX_RETRIES = 8;

const same = (a, b) => a.x === b.x && a.y === b.y && a.golpe === b.golpe && a.salto === b.salto && a.especial === b.especial && a.pausa === b.pausa;

export function createPadClient({ transport, code, sid, now = () => performance.now(), onChange = () => {}, onVibrate = () => {}, setTimer = setTimeout, clearTimer = clearTimeout }) {
  const st = { status: 'conectando', slot: null, color: null, hero: null, ready: false, fase: 'sala', hp: 0, maxHp: 0, lives: 0, score: 0, away: false, error: '' };
  let link = null, seq = 0, lastSent = -Infinity, input = NEUTRAL, sent = NEUTRAL, lastHost = 0, attempts = 0, timer = null, stopped = false;

  const set = (o) => { Object.assign(st, o); onChange({ ...st }); };

  async function connect() {
    if (stopped) return;
    set({ status: attempts ? 'reconectando' : 'conectando' });
    try {
      const c = await transport.open(code);
      const ctl = await c.connect('ctl', { reliable: true });
      const inp = await c.connect('in', { reliable: false });
      if (stopped) { c.close(); return; }
      link = { c, ctl, inp };
      ctl.onData((raw) => onMsg(parseCtl(raw)));
      ctl.onClose(() => lost(link));
      lastHost = now();
      ctl.send({ t: 'hola', v: VERSION, sid });
    } catch (e) {
      retry(e);
    }
  }

  function retry(e) {
    if (stopped) return;
    attempts++;
    if (attempts > MAX_RETRIES) { set({ status: 'cerrada', error: e ? String(e.message || e.type || e) : '' }); return; }
    set({ status: 'reconectando', error: e ? String(e.message || e.type || e) : '' });
    timer = setTimer(connect, Math.min(1000 * 2 ** (attempts - 1), 5000));
  }

  function lost(which) {
    if (stopped || !link || (which && which !== link)) return;
    const l = link; link = null;
    try { l.c.close(); } catch { /* ya cerrado */ }
    if (st.status === 'llena') return;
    retry(null);
  }

  function onMsg(m) {
    if (!m) return;
    lastHost = now();
    switch (m.t) {
      case 'bienvenido': attempts = 0; set({ status: 'conectado', slot: m.slot, color: m.color, hero: m.hero, ready: !!m.ready, error: '' }); break;
      case 'llena': set({ status: 'llena' }); stopped = true; if (link) link.c.close(); break;
      case 'error': set({ status: 'cerrada', error: m.msg || '' }); stopped = true; break;
      case 'fase': set({ fase: m.fase }); break;
      case 'estado': set({ hp: m.hp, maxHp: m.maxHp, lives: m.lives, score: m.score, away: !!m.away, hero: m.hero || st.hero, ready: m.ready ?? st.ready, fase: m.fase || st.fase }); break;
      case 'vibra': onVibrate(m.ms); break;
      default: break;
    }
  }

  function sendInput(force = false) {
    if (!link || st.status !== 'conectado') return;
    const t = now();
    if (force || !same(input, sent) || t - lastSent >= HEARTBEAT_MS) {
      link.inp.send(encodeInput(input, seq = (seq + 1) & 255));
      sent = input; lastSent = t;
    }
  }

  return {
    start() { connect(); return this; },
    get state() { return { ...st }; },
    setInput(i) { input = i; sendInput(); },
    tick() {
      if (link && now() - lastHost > HOST_TIMEOUT_MS) { lost(link); return; }
      sendInput();
    },
    choose(hero) { set({ hero }); if (link) link.ctl.send({ t: 'elige', hero }); },
    setReady(ready) { set({ ready }); if (link) link.ctl.send({ t: 'listo', ready }); },
    retryNow() { if (timer) clearTimer(timer); stopped = false; attempts = 0; connect(); },
    stop() { stopped = true; if (timer) clearTimer(timer); if (link) link.c.close(); link = null; },
  };
}
