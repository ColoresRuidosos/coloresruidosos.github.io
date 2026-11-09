# Audio del reel: latidos en cada compás + efectos chiptune en los eventos del juego (reel/spec.md R3).
# Uso: python3 -I scripts/reel_audio.py eventos.json salida.wav duracion_s beat_s [--solo-gancho]
import sys, json, wave
import numpy as np
ev = json.load(open(sys.argv[1])); out = sys.argv[2]; dur = float(sys.argv[3]); beat = float(sys.argv[4])
solo_gancho = '--solo-gancho' in sys.argv
SR = 44100; buf = np.zeros(int(SR * (dur + 1)), np.float32)
rng = np.random.default_rng(3)

def add(t, sig):
    i = int(t * SR); j = min(len(buf), i + len(sig))
    if i < len(buf): buf[i:j] += sig[: j - i]

def env(n, a=0.004, d=None):
    t = np.arange(n) / SR; e = np.exp(-t / (d or (n / SR / 4))); e[: int(a * SR)] *= np.linspace(0, 1, int(a * SR)); return e

def tone(f, d, kind='square', vol=0.3, f2=None, decay=None):
    n = int(SR * d); t = np.arange(n) / SR
    fr = f if f2 is None else f * (f2 / f) ** (t / d)
    ph = 2 * np.pi * np.cumsum(fr) / SR
    w = {'square': np.sign(np.sin(ph)), 'tri': 2 / np.pi * np.arcsin(np.sin(ph)), 'saw': 2 * ((ph / (2 * np.pi)) % 1) - 1, 'sine': np.sin(ph)}[kind]
    return (w * env(n, d=decay) * vol).astype(np.float32)

def noise(d, vol=0.3, decay=None):
    n = int(SR * d); x = rng.standard_normal(n).astype(np.float32)
    x = np.diff(np.concatenate([[0], x]))  # paso alto sencillo
    return x * env(n, d=decay) * vol

def mix(*sigs):
    n = max(len(x) for x in sigs); o = np.zeros(n, np.float32)
    for x in sigs: o[: len(x)] += x
    return o

def latido(t, fuerte=1.0):
    add(t, mix(tone(55, 0.22, 'sine', 0.9 * fuerte, f2=40, decay=0.07), noise(0.03, 0.15 * fuerte, 0.01)))
    add(t + 0.17, tone(48, 0.2, 'sine', 0.6 * fuerte, f2=36, decay=0.06))

gancho_fin = 8 * beat
t = 0.0
while t < (gancho_fin if solo_gancho else dur - 0.5):
    latido(t, 1.0 if t < gancho_fin else 0.7); t += 2 * beat

# acentos de las escenas del reel (en tiempos de la canción)
for b, kind in [(10, 'boom'), (12, 'boom'), (16, 'up')] + [(41.5 + i, 'blip') for i in range(6)] + [(48.5, 'boom'), (53, 'boom'), (55, 'blip'), (57, 'blip')]:
    tt = b * beat
    if kind == 'boom': add(tt, mix(tone(70, 0.5, 'sine', 0.8, f2=35, decay=0.15), noise(0.25, 0.35, 0.06)))
    elif kind == 'up': add(tt, tone(220, 0.35, 'saw', 0.18, f2=880))
    else: add(tt, tone(880, 0.07, 'square', 0.12) ); add(tt + 0.07, tone(1320, 0.07, 'square', 0.1))

for e in ev:
    tt = e['t']; ty = e['type']
    if ty == 'batazo': add(tt + 0.05, mix(noise(0.08, 0.5, 0.02), tone(520 if e.get('grade') == 'perfecto' else 380, 0.15, 'square', 0.22, f2=110, decay=0.05)))
    elif ty == 'esquiva': add(tt, tone(700, 0.1, 'tri', 0.3, f2=1500))
    elif ty == 'aviso': add(tt, tone(1320, 0.06, 'square', 0.12)); add(tt + 0.07, tone(1760, 0.06, 'square', 0.12))
    elif ty == 'grito': add(tt, mix(tone(220, 0.8, 'saw', 0.3, f2=880, decay=0.4), noise(0.8, 0.12, 0.3)))
    elif ty == 'transicion': [add(tt + i * 0.1, tone(f, 0.12, 'square', 0.18)) for i, f in enumerate([660, 440, 330])]
    elif ty == 'ko':
        [add(tt + i * 0.12, tone(f, 0.2, 'tri', 0.3)) for i, f in enumerate([523, 659, 784, 1046])]
        add(tt, noise(1.2, 0.15, 0.4))

peak = np.max(np.abs(buf)) or 1
buf = np.tanh(buf / peak * 1.4) * 0.85
pcm = (buf[: int(SR * dur)] * 32767).astype(np.int16)
w = wave.open(out, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
print('audio', out, f'{dur:.2f}s', len(ev), 'eventos')
