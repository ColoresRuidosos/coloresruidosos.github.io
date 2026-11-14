// F2/F12: la canción con Web Audio. Su reloj es el reloj del juego.
import { songTimeAt } from '../core/clock.js';

export function createPlayer({ ctx } = {}) {
  ctx = ctx || new (globalThis.AudioContext || globalThis.webkitAudioContext)();
  const master = ctx.createGain(); master.connect(ctx.destination);
  const music = ctx.createGain(); music.connect(master);
  let buffer = null, src = null;
  const p = {
    ctx, master, startAt: 0, playing: false,
    async load(url, onProgress = () => {}, fetchFn = globalThis.fetch?.bind(globalThis)) {
      if (url.startsWith('data:')) {   // versión de prueba: la canción viene incrustada en base64
        const bin = atob(url.slice(url.indexOf(',') + 1)); const u8 = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        onProgress(1); buffer = await ctx.decodeAudioData(u8.buffer); return buffer;
      }
      const res = await fetchFn(url);
      if (!res.ok) throw new Error('No se pudo cargar la canción');
      const total = Number(res.headers.get('content-length')) || 0;
      let ab;
      if (res.body?.getReader && total) {
        const reader = res.body.getReader(); const parts = []; let got = 0;
        for (;;) { const { done, value } = await reader.read(); if (done) break; parts.push(value); got += value.length; onProgress(Math.min(1, got / total)); }
        const all = new Uint8Array(got); let o = 0; for (const c of parts) { all.set(c, o); o += c.length; }
        ab = all.buffer;
      } else { ab = await res.arrayBuffer(); onProgress(1); }
      buffer = await ctx.decodeAudioData(ab);
      return buffer;
    },
    setBuffer(b) { buffer = b; },
    get duration() { return buffer?.duration || 0; },
    async unlock() {
      if (ctx.state !== 'running') await ctx.resume();
      try { const s = ctx.createBufferSource(); s.buffer = ctx.createBuffer(1, 1, 22050); s.connect(master); s.start(0); } catch { /* sin buffer */ }
    },
    start(offset = 0) {
      p.stop();
      src = ctx.createBufferSource(); src.buffer = buffer; src.connect(music);
      music.gain.cancelScheduledValues?.(0); music.gain.value = 1;
      const when = ctx.currentTime + 0.15;
      src.start(when, offset);
      p.startAt = when - offset; p.playing = true;
    },
    stop() { try { src?.stop(); } catch { /* ya parado */ } src = null; p.playing = false; },
    fadeOut(sec = 1.5) { music.gain.setTargetAtTime?.(0, ctx.currentTime, sec / 4); },
    async pause() { await ctx.suspend(); },
    async resume() { await ctx.resume(); },
    // tiempo de canción (s) que se OYE en el instante perfMs (performance.now)
    songTime(perfMs, offsetMs = 0) {
      const ts = ctx.getOutputTimestamp?.();
      if (ts && ts.performanceTime > 0 && ctx.state === 'running') {
        return songTimeAt(perfMs, { contextTime: ts.contextTime, performanceTime: ts.performanceTime, startAt: p.startAt, offsetMs });
      }
      const lat = ctx.outputLatency || ctx.baseLatency || 0;
      return ctx.currentTime - lat - p.startAt - offsetMs / 1000;
    },
  };
  return p;
}

// Reloj sin audio para pruebas y demos (?sim=N): N veces la velocidad real.
export function createSimPlayer({ speed = 1, now = () => performance.now() } = {}) {
  let base = 0, at = null, paused = false;
  const p = {
    ctx: null, playing: false, duration: 0,
    async load(_u, onProgress = () => {}) { onProgress(1); }, async unlock() {},
    start(offset = 0) { base = offset; at = now(); paused = false; p.playing = true; },
    stop() { p.playing = false; }, fadeOut() {},
    pause() { base = p.songTime(now()); paused = true; },
    resume() { at = now(); paused = false; },
    songTime(perfMs) { if (at === null) return -1; return paused ? base : base + ((perfMs - at) / 1000) * speed; },
  };
  return p;
}
