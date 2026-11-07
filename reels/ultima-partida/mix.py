"""mix.py — partitura chiptune original + foley 8 bits desde events.json → out/mix.wav
La fidelidad de la música sigue a la profundidad de color: 1997 = mono 4 bits, 2005 = mono tipo NES, 2009+ = estéreo con eco.
Correr desde la raíz de la biblioteca: .venv/bin/python films/ultima-partida/mix.py"""
import json, os, sys
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB', os.path.abspath(os.path.join(HERE, '..', '..')))
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import SR, lp, hp, bp, env_exp, t_, limit, add  # noqa: E402

E = json.load(open(os.path.join(HERE, 'events.json')))
DUR, EV = E['dur'], E['ev']
SECS = [e for e in EV if e['type'] == 'section']
N = int(DUR * SR)
BEAT = 0.5
rng = np.random.default_rng(11)
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)


def sec_at(t):
    for s in SECS:
        if s['t'] <= t < s['t1']: return s['id']
    return SECS[-1]['id']


# —— Voces de chip ——
def pulse(f, d, duty=.25, v=1.0, dec=.25):
    t = t_(d); ph = (t * f) % 1
    x = np.where(ph < duty, 1.0, -1.0)
    env = np.minimum(1, t / .004) * (0.55 + 0.45 * np.exp(-t / dec)) * np.minimum(1, (d - t) / .02)
    return (x * env * v).astype(np.float32)


def tri(f, d, v=1.0):
    t = t_(d); ph = (t * f) % 1
    x = 4 * np.abs(ph - .5) - 1
    x = np.round(x * 7.5) / 7.5                   # triángulo de 4 bits
    env = np.minimum(1, t / .003) * np.minimum(1, (d - t) / .02)
    return (x * env * v).astype(np.float32)


def lfsr(d, rate=12000, v=1.0, tau=.05):
    n = int(round(d * SR)); hold = max(1, int(SR / rate))
    x = np.repeat(rng.choice([-1.0, 1.0], n // hold + 1), hold)[:n]
    return (x * env_exp(d, tau) * v).astype(np.float32)


def kick(v=1.0):
    t = t_(.18); f = 50 + 120 * np.exp(-t / .025)
    return (np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t / .07) * v * .9).astype(np.float32)


def crush(x, rate, bits):
    hold = max(1, int(SR / rate)); y = np.repeat(x[::hold], hold)[:len(x)]
    q = 2 ** (bits - 1); return np.round(y * q) / q


# —— Partitura (original): Am · F · C · G, 120 BPM, compás = 2 s ——
CH = {'Am': [57, 60, 64], 'F': [53, 57, 60], 'C': [48, 52, 55], 'G': [55, 59, 62], 'E': [52, 56, 59]}
PROG = ['Am', 'F', 'C', 'G']
MEL = [  # corcheas; None = silencio, '-' = liga
    [76, '-', 81, '-', 79, 76, 74, 76],
    [72, '-', 77, '-', 76, 72, 69, 72],
    [67, '-', 72, 76, 79, '-', 76, 74],
    [74, '-', 71, '-', 67, 69, 71, 74],
]
END_MEL = [71, '-', 68, '-', 64, 68, 71, '-']    # último compás sobre la dominante (E): resuelve en el bucle

lead = np.zeros((N, 2), np.float32); harm = np.zeros((N, 2), np.float32)
bass = np.zeros((N, 2), np.float32); drums = np.zeros((N, 2), np.float32)
nbars = int(np.ceil(DUR / 2))
for b in range(nbars):
    t0 = b * 2.0; s = sec_at(t0 + .01)
    last = b == nbars - 1
    chord = 'E' if last else ('Am' if s == 'boss' else PROG[b % 4])
    mel = END_MEL if last else MEL[b % 4]
    # bajo: negras en 1997-jefe (pedal), corcheas octavadas en el resto
    root = CH[chord][0] - 12
    for k in range(8):
        t = t0 + k * .25; sk = sec_at(t)
        if sk == 'boss':
            if k % 4 == 0: add(bass, tri(mtof(45), .9, .6), t)
            continue
        if sk in ('q1',): continue
        add(bass, tri(mtof(root + (12 if k % 2 else 0)), .22, .5), t)
    # melodía
    k = 0
    while k < 8:
        n = mel[k]; t = t0 + k * .25; ln = 1
        while k + ln < 8 and mel[k + ln] == '-': ln += 1
        if n not in (None, '-') and sec_at(t) not in ('boss', 'turn'):
            add(lead, pulse(mtof(n), .25 * ln - .02, .25, .32), t, pan=.1)
        k += ln
    # armonía (pulso 12.5 %): arpegio en corcheas (q3) o semicorcheas (q4, final)
    for k in range(16):
        t = t0 + k * .125; sk = sec_at(t)
        if sk not in ('q3', 'q4', 'result', 'save'): continue
        if sk == 'q3' and k % 2: continue
        n = CH[chord][k % 3] + 12
        add(harm, pulse(mtof(n), .11, .125, .14, .05), t, pan=-.35)
    # batería LFSR
    for k in range(16):
        t = t0 + k * .125; sk = sec_at(t)
        if sk in ('turn', 'boss'): continue
        if k % 2 == 0: add(drums, lfsr(.04, 16000, .16 if sk != 'q1' else .1, .015), t, pan=.25)
        if sk in ('q1', 'q2'):
            if sk == 'q2' and k % 8 == 4: add(drums, lfsr(.12, 6000, .35, .05), t)
            continue
        if k % 8 == 0: add(drums, kick(.5), t)
        if k % 8 == 4: add(drums, lfsr(.14, 7000, .38, .06), t)

# —— Proceso por época ——
def mask(ids, fade=.01):
    m = np.zeros(N, np.float32)
    for s in SECS:
        if s['id'] in ids: m[int(s['t'] * SR):int(s['t1'] * SR)] = 1
    k = int(fade * SR); return np.convolve(m, np.ones(k) / k, 'same')

music = lead + harm + bass + drums
mono = music.mean(1, keepdims=True).repeat(2, 1)
m97, m05 = mask(['q1', 'boss']), mask(['q2'])
c97 = np.stack([crush(mono[:, 0], 11025, 4)] * 2, 1)
c05 = np.stack([crush(mono[:, 0], 22050, 6)] * 2, 1)
# eco estilo 16 bits (3 tomas, realimentación con pasa bajos)
wet = np.zeros_like(music)
for d, g in ((.18, .35), (.27, .25), (.37, .18)):
    n = int(d * SR); wet[n:] += music[:-n] * g
wet = np.stack([lp(wet[:, 0], 3000), lp(wet[:, 1], 3000)], 1)
m16 = 1 - m97 - m05
music = c97 * m97[:, None] + c05 * m05[:, None] + (music + wet * .8) * m16[:, None]
# respiro antes de cada revelación: la música baja en el último segundo de la cuenta
quiz = [(e['t'], e) for e in EV if e['type'] == 'tick' and e['n'] == 1]
g = np.ones(N, np.float32)
for t, _ in quiz:
    a, b = int(t * SR), int((t + 1) * SR); g[a:b] = np.minimum(g[a:b], .35)
g[int(25.0 * SR):int(25.5 * SR)] = 0                 # casi silencio antes de la luz
g = np.convolve(g, np.ones(480) / 480, 'same')
music *= g[:, None]

# —— Foley ——
fx = np.zeros((N, 2), np.float32)
def blip(f, d=.03, v=.3, duty=.5): return pulse(f, d, duty, v, .02)
def era_crush(x, era):
    if era == 1997: return crush(x, 11025, 4)
    if era == 2005: return crush(x, 22050, 6)
    return x

for e in EV:
    ty, t, era = e['type'], e['t'], e.get('era', 2026)
    s = None; gain = 1.0; pan = 0.0
    if ty == 'blip': s = blip(1200 if era != 1997 else 900, .022, .12)
    elif ty == 'pop': s = np.concatenate([blip(660 + 110 * e.get('j', 0), .03, .25), blip(990 + 110 * e.get('j', 0), .04, .25)])
    elif ty == 'tick':
        f = {3: 880, 2: 880, 1: 1320}[e['n']]; s = pulse(f, .08, .5, .45, .03)
    elif ty == 'cursor': s = np.concatenate([blip(1760, .018, .18), blip(2349, .025, .18)])
    elif ty == 'reveal':
        s = np.concatenate([pulse(mtof(n), d, .5, .4, .08) for n, d in ((72, .07), (76, .07), (79, .07), (84, .32))])
    elif ty == 'wrong': s = (pulse(110, .35, .5, .35) + pulse(116, .35, .5, .35)) * .8
    elif ty == 'step': s = lp(lfsr(.03, 4000, .25, .01), 1800)
    elif ty == 'rope': s = pulse(180 + 30 * (int(t * 3) % 2), .05, .25, .18, .02)
    elif ty == 'drip':
        tt = t_(.12); s = (np.sin(2 * np.pi * np.cumsum(1400 - 6000 * tt) / SR) * np.exp(-tt / .04) * .35).astype(np.float32)
    elif ty == 'boing':
        tt = t_(.4); f = 160 + 260 * np.exp(-tt / .12) * (1 + .08 * np.sin(2 * np.pi * 18 * tt))
        s = (np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-tt / .15) * .22).astype(np.float32)
    elif ty == 'swirl':
        tt = t_(.55); f = 200 + 2400 * (tt / .55) ** 1.5
        s = ((np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .25 + lfsr(.55, 9000, .25, 1)) * np.minimum(1, tt / .4) * .6).astype(np.float32)
    elif ty == 'heart':                         # el único sonido orgánico: sin bit-crush
        tt = t_(.5); L = len(tt)
        th = lambda a, f: np.pad((np.sin(2 * np.pi * f * t_(.16)) * np.exp(-t_(.16) / .05)), (int(a * SR), 0))[:L]
        th2 = lambda a, f: np.pad(th(a, f), (0, L - len(th(a, f))))
        hb = th2(0, 55) + .7 * th2(.2, 48); s = lp(hb[:len(tt)], 180).astype(np.float32) * .9; era = 0
    elif ty == 'light':
        s = lfsr(.015, 20000, .5, .004)
        ch = sum(pulse(mtof(n), 1.6, .25, .16, .5) for n in (57, 64, 69, 72, 76))
        s = np.concatenate([s, np.zeros(int(.03 * SR), np.float32), ch]); era = 1997
    elif ty == 'flood':
        s = np.concatenate([pulse(mtof(57 + k * 2 + (k % 3)), .05, .25, .22, .03) for k in range(16)])
    elif ty == 'item':
        s = np.concatenate([pulse(mtof(n), d, .25, .3, .1) for n, d in ((79, .08), (84, .08), (88, .08), (91, .25))])
    elif ty == 'savetick': s = blip(2637, .02, .14)
    elif ty == 'select': s = np.concatenate([blip(1319, .04, .25), blip(1976, .09, .25)])
    if s is None: continue
    add(fx, era_crush(np.asarray(s, np.float32), era), t, gain, pan)

# —— Mezcla ——
mixd = music * .55 + fx * .85
mixd[int(19.0 * SR):int(19.5 * SR)] = 0              # silencio absoluto (sin colas de eco)
mixd = np.stack([hp(mixd[:, 0], 30), hp(mixd[:, 1], 30)], 1)
mixd = np.stack([limit(mixd[:, 0], .89), limit(mixd[:, 1], .89)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mixd.astype(np.float32), SR, subtype='PCM_16')
# balance de graves: energía 20–120 Hz vs. el resto
mm = mixd.mean(1); F = np.abs(np.fft.rfft(mm)) ** 2; fr = np.fft.rfftfreq(len(mm), 1 / SR)
lo, rest = F[(fr > 20) & (fr < 120)].sum(), F[(fr >= 120) & (fr < 12000)].sum()
print(f'mix.wav {DUR:.1f}s · graves 20-120 Hz vs resto: {10 * np.log10(lo / rest):+.1f} dB')
