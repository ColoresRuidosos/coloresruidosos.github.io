"""mix.py — música original (synth) + efectos desde events.json → out/mix.wav
La música demuestra los datos: se calla de verdad en el silencio (9.5–14 s) y llega al clímax en el s 19.
Correr desde la raíz de la biblioteca: .venv/bin/python films/ciencia-ruidosa-01/mix.py"""
import json, os, sys
import numpy as np
import soundfile as sf
from scipy.signal import fftconvolve

HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB', os.path.abspath(os.path.join(HERE, '..', '..')))
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import SR, lp, hp, bp, t_, limit, add  # noqa: E402

E = json.load(open(os.path.join(HERE, 'events.json')))
DUR, EV = E['dur'], E['ev']
SECS = [e for e in EV if e['type'] == 'section']
N = int(DUR * SR)
rng = np.random.default_rng(5)
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
def music_of(t):
    for s in SECS:
        if s['t'] <= t < s['t1']:
            if s['id'] == 'dopa': return 'climax' if t >= 19 else ('none' if t >= 18.5 else 'build')
            return s['music']
    return 'outro'

# —— Instrumentos ——
def saw(f, d, det=0.0):
    t = t_(d); return 2 * ((t * f * (1 + det)) % 1) - 1
def env(d, a=.005, r=.05, dec=None, sus=1.0):
    t = t_(d); e = np.minimum(1, t / a) * np.minimum(1, np.maximum(0, (d - t) / r))
    if dec: e *= sus + (1 - sus) * np.exp(-t / dec)
    return e
def pad(notes, d, v=.12):
    x = sum(saw(mtof(n), d, dt) for n in notes for dt in (-.004, .0, .005))
    return lp(x, 1400) * env(d, .35, .5) * v / len(notes)
def pluck(n, d, v=.2, cut=2600):
    x = saw(mtof(n), d) + .5 * saw(mtof(n + 12), d, .003)
    return lp(x * env(d, .002, .03, .12, .0), cut) * v
def bass(n, d, v=.35):
    t = t_(d); f = mtof(n); x = np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t) + .15 * np.sin(6 * np.pi * f * t)
    return x * env(d, .004, .04, .25, .5) * v
def kick(v=.8):
    t = t_(.35); f = 45 + 110 * np.exp(-t / .035)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .12) * v
def clap(v=.35):
    x = rng.standard_normal(int(.2 * SR)); t = t_(.2)
    e = np.exp(-t / .05) + .6 * np.exp(-np.maximum(0, t - .012) / .02) * (t > .012)
    return bp(x, 900, 3200) * e * v
def hat(v=.08): return hp(rng.standard_normal(int(.05 * SR)), 7000) * np.exp(-t_(.05) / .012) * v
def bell(f, d=.6, v=.15):
    t = t_(d); return (np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * f * 2.76 * t)) * np.exp(-t / (d / 4)) * v
def lead(n, d, v=.13):
    t = t_(d); f = mtof(n) * (1 + .006 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / .2))
    x = 2 * ((np.cumsum(f) / SR) % 1) - 1
    return lp(x, 3200) * env(d, .01, .08) * v

# —— Partitura: Dm · Bb · F · C (120 BPM, compás 2 s) ——
CH = {'Dm': [50, 53, 57], 'Bb': [46, 50, 53], 'F': [41, 45, 48], 'C': [48, 52, 55]}
PROG = ['Dm', 'Bb', 'F', 'C']
LEAD = [[74, 72, 69, None, 69, 72, 74, 77], [74, None, 72, 70, 69, None, 65, None],
        [72, 69, 65, None, 65, 69, 72, 74], [76, None, 74, 72, 74, None, None, None]]
mus = np.zeros((N, 2), np.float32); drums = np.zeros((N, 2), np.float32)
for b in range(int(np.ceil(DUR / 2))):
    t0 = b * 2.0; ch = PROG[b % 4] if t0 < 32 else 'Dm'
    for half in (0, 1):
        th = t0 + half; m = music_of(th + .01)
        if m == 'none': continue
        add(mus, pad([n + 12 for n in CH[ch]], 1.05, .16 if m != 'climax' else .2), th, pan=0)
    for k in range(16):                                  # semicorcheas
        t = t0 + k * .125; m = music_of(t)
        if m == 'none': continue
        arp = CH[ch] + [CH[ch][0] + 12]
        if m in ('intro', 'outro', 'groove') and k % 2 == 0:
            add(mus, pluck(arp[(k // 2) % 4] + 12, .3, .16, 2200), t, pan=.3 * (1 if k % 4 else -1))
        if m == 'build':
            u = (t - 14) / 4.5; step = 4 if u < .33 else 2 if u < .66 else 1
            if k % step == 0: add(mus, pluck(arp[k % 4] + 12, .25, .14 + .08 * u, 1200 + 3800 * u), t, pan=.3 * (1 if k % 2 else -1))
            if k % step == 0: add(drums, clap(.08 + .2 * u), t)
        if m == 'climax':
            add(mus, pluck(arp[k % 4] + 24, .18, .1, 4200), t, pan=.4 * (1 if k % 2 else -1))
        if m in ('groove', 'climax', 'outro'):
            if k % 4 == 0 and not (m == 'outro' and t > 31): add(drums, kick(.4 if m == 'climax' else .3), t)
            if k % 8 == 4 and m != 'outro': add(drums, clap(.32), t)
            if k % 2 == 1: add(drums, hat(.07 if m != 'outro' else .04), t, pan=.2)
        if m in ('groove', 'climax') and k % 2 == 0:
            add(mus, bass(CH[ch][0] - 12 + (12 if k % 4 == 2 else 0), .24, .17), t)
    if music_of(t0 + .01) == 'climax':                  # melodía del clímax
        mel = LEAD[b % 4]
        for k, n in enumerate(mel):
            if n is not None: add(mus, lead(n, .24 if k < 7 and mel[k + 1] is not None else .45), t0 + k * .25, pan=-.1)
# subida (riser) 14 → 18.5
tr = t_(4.5); f = 200 * 2 ** (tr / 4.5 * 3.5)
riser = (lp(rng.standard_normal(len(tr)), 6000) * .12 + np.sin(2 * np.pi * np.cumsum(f) / SR) * .05) * (tr / 4.5) ** 2
add(mus, riser, 14.0)
# acorde final que resuelve
add(mus, pad([62, 65, 69, 74], 1.6, .22), 32.0 - .6)

# reverb (respuesta al impulso de ruido con caída) para dar espacio
ir_t = t_(1.6); ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t / .35); ir /= np.abs(ir).sum() ** .5 * 6
wet = np.stack([fftconvolve(mus[:, c], ir)[:N] for c in (0, 1)], 1)
music = mus + wet * .5 + drums

# silencios reales (cero digital, sin colas): 9.5–14 y 18.5–19
for a, b in ((9.5, 14.0), (18.5, 19.0)):
    music[int(a * SR):int(b * SR)] = 0

# —— Efectos ——
fx = np.zeros((N, 2), np.float32)
def heart(v=1.0):
    t = t_(.55); x = np.zeros(len(t))
    for a, f, g in ((0, 58, 1.0), (.2, 50, .7)):
        s = int(a * SR); tt = t[:len(t) - s]; x[s:] += np.sin(2 * np.pi * f * tt) * np.exp(-tt / .06) * g
    return lp(x, 220) * v
for e in EV:
    ty, t = e['type'], e['t']
    if ty == 'heart':
        if e.get('solo'): add(fx, heart(1.0), t)
        elif 3.5 <= t < 9.5: add(fx, heart(.18), t)
    elif ty == 'title': add(fx, bell(1568, .5, .06) + bell(2093, .5, .04), t, pan=.2)
    elif ty == 'tick': add(fx, bell(2637, .25, .07), t)
    elif ty == 'sparkle':
        f = 2000 + 1500 * ((t * 7.3) % 1); add(fx, bell(f, .3, .035 if not e.get('climax') else .05), t, pan=((t * 3.1) % 2) - 1)
    elif ty == 'whoosh':
        tt = t_(.7); x = bp(rng.standard_normal(len(tt)), 300, 4000) * np.sin(np.pi * tt / .7) ** 2 * .35
        add(fx, x, t, pan=-.3)
    elif ty == 'shimmer':
        for k in range(14): add(fx, bell(mtof(86 + (k * 5) % 14), .4, .045), t + k * .065, pan=-.8 + k * .12)
    elif ty == 'flash':
        tt = t_(1.2); add(fx, lp(rng.standard_normal(len(tt)), 5000) * np.exp(-tt / .25) * .2, t); add(fx, kick(.4), t)

# —— Mezcla ——
mixd = music * .6 + fx * .9
mixd = np.stack([hp(mixd[:, 0], 28), hp(mixd[:, 1], 28)], 1)
mixd = np.stack([limit(mixd[:, 0], .6), limit(mixd[:, 1], .6)], 1)
for a, b in ((9.5, 14.0), (18.5, 19.0)):               # el limitador no debe dejar colas: solo el latido en 9.5–14
    seg = slice(int(a * SR), int(b * SR)); keep = np.zeros((N, 2), np.float32)
    if a == 9.5:
        for e in EV:
            if e['type'] == 'heart' and e.get('solo'): add(keep, heart(1.0) * .9 * .6, e['t'])
    mixd[seg] = keep[seg]
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mixd.astype(np.float32), SR, subtype='PCM_16')
mm = mixd.mean(1); F = np.abs(np.fft.rfft(mm)) ** 2; fr = np.fft.rfftfreq(len(mm), 1 / SR)
print(f'mix.wav {DUR:.1f}s · graves 20-120 Hz vs resto: {10 * np.log10(F[(fr > 20) & (fr < 120)].sum() / F[(fr >= 120) & (fr < 12000)].sum()):+.1f} dB')
