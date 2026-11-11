// Reproductor Web Audio: secuenciador con programación adelantada y efectos sintetizados (F12).
// Los móviles no suenan: solo la pantalla principal (plan §8).
import { SONGS, songEvents, stepSeconds, midiHz } from './music.js';

export function createAudio() {
  let ctx = null, master = null, musicGain = null, sfxGain = null, noise = null;
  let song = null, step = 0, nextT = 0, timer = null, volume = 0.7;

  function ensure() {
    if (ctx) return true;
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = volume; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = 0.32; musicGain.connect(master);
    sfxGain = ctx.createGain(); sfxGain.gain.value = 0.6; sfxGain.connect(master);
    noise = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const d = noise.getChannelData(0); let seed = 7;
    for (let i = 0; i < d.length; i++) { seed = (seed * 16807) % 2147483647; d[i] = (seed / 2147483647) * 2 - 1; }
    return true;
  }

  function tone(t, freq, dur, { type = 'square', gain = 0.3, to = null, dest = musicGain } = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.02);
  }
  function hiss(t, dur, { gain = 0.3, hp = 1000, dest = musicGain } = {}) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noise; f.type = 'highpass'; f.frequency.value = hp;
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t); s.stop(t + dur + 0.02);
  }

  function schedule() {
    if (!song) return;
    const sd = stepSeconds(song);
    while (nextT < ctx.currentTime + 0.12) {
      for (const e of songEvents(song, step)) {
        if (e.ch === 'bass') tone(nextT, midiHz(e.note), sd * 0.9, { type: 'square', gain: 0.22 });
        else if (e.ch === 'lead') tone(nextT, midiHz(e.note), sd * e.len * 0.9, { type: 'square', gain: 0.1 });
        else if (e.ch === 'kick') tone(nextT, 140, 0.12, { type: 'sine', gain: 0.6, to: 40 });
        else if (e.ch === 'snare') hiss(nextT, 0.1, { gain: 0.35, hp: 1500 });
        else if (e.ch === 'hat') hiss(nextT, 0.03, { gain: 0.12, hp: 7000 });
      }
      step++; nextT += sd;
    }
  }

  const SFX = {
    swing: (t) => hiss(t, 0.05, { gain: 0.15, hp: 3000, dest: sfxGain }),
    hit: (t) => { hiss(t, 0.08, { gain: 0.5, hp: 400, dest: sfxGain }); tone(t, 180, 0.08, { gain: 0.3, to: 60, dest: sfxGain }); },
    block: (t) => tone(t, 1200, 0.06, { type: 'triangle', gain: 0.25, dest: sfxGain }),
    jump: (t) => tone(t, 300, 0.12, { gain: 0.12, to: 600, dest: sfxGain }),
    land: (t) => tone(t, 90, 0.1, { type: 'sine', gain: 0.4, to: 40, dest: sfxGain }),
    special: (t) => { for (let i = 0; i < 4; i++) tone(t + i * 0.05, midiHz(64 + i * 4), 0.1, { gain: 0.18, dest: sfxGain }); hiss(t, 0.3, { gain: 0.2, hp: 800, dest: sfxGain }); },
    ko: (t) => tone(t, 400, 0.35, { gain: 0.2, to: 80, dest: sfxGain }),
    pickup: (t) => { for (let i = 0; i < 3; i++) tone(t + i * 0.06, midiHz(76 + i * 5), 0.08, { gain: 0.15, dest: sfxGain }); },
    break: (t) => hiss(t, 0.15, { gain: 0.4, hp: 300, dest: sfxGain }),
    go: (t) => { tone(t, 880, 0.1, { gain: 0.15, dest: sfxGain }); tone(t + 0.15, 880, 0.1, { gain: 0.15, dest: sfxGain }); },
    shoot: (t) => tone(t, 900, 0.08, { type: 'triangle', gain: 0.12, to: 500, dest: sfxGain }),
    join: (t) => { tone(t, midiHz(72), 0.08, { gain: 0.15, dest: sfxGain }); tone(t + 0.08, midiHz(79), 0.12, { gain: 0.15, dest: sfxGain }); },
    menu: (t) => tone(t, midiHz(84), 0.05, { gain: 0.12, dest: sfxGain }),
    clear: (t) => { [72, 76, 79, 84].forEach((n, i) => tone(t + i * 0.12, midiHz(n), 0.2, { gain: 0.18, dest: sfxGain })); },
  };

  return {
    unlock() { if (!ensure()) return; if (ctx.state === 'suspended') ctx.resume(); },
    play(i) {
      if (!ensure()) return;
      if (song === SONGS[i]) return;
      song = SONGS[i]; step = 0; nextT = ctx.currentTime + 0.05;
      if (!timer) timer = setInterval(schedule, 25);
    },
    stop() { song = null; },
    sfx(name) { if (!ctx || ctx.state !== 'running' || !SFX[name]) return; SFX[name](ctx.currentTime + 0.005); },
    setVolume(v) { volume = v; if (master) master.gain.value = v; },
    suspend() { if (ctx) ctx.suspend(); },
    resume() { if (ctx) ctx.resume(); },
    get running() { return !!ctx && ctx.state === 'running'; },
  };
}
