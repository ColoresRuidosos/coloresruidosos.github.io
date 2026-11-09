# Analiza la canción y genera src/data/beatmap.js (tempo, primer pulso y secciones).
# Uso: python3 -I scripts/beatmap.py ../../static/games/yo-contra-mi-corazon/cancion.mp3
import sys, os, subprocess, json
import numpy as np

SR, HOP, N = 11025, 64, 1024
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', sys.argv[1], '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
dur = len(x) / SR
fr = np.lib.stride_tricks.sliding_window_view(x, N)[::HOP] * np.hanning(N)
S = np.log1p(np.abs(np.fft.rfft(fr, axis=1)) * 10)
flux = np.maximum(np.diff(S, axis=0), 0).sum(1)
flux = np.maximum(flux - np.convolve(flux, np.ones(128) / 128, 'same'), 0)
fps = SR / HOP; t = (np.arange(len(flux)) + N / 2 / HOP) / fps

def fit(lo, hi, mask=slice(None)):
    best = None
    for bpm in np.arange(lo, hi, 0.01):
        z = (flux[mask] * np.exp(2j * np.pi * t[mask] * bpm / 60)).sum()
        if best is None or abs(z) > best[0]: best = (abs(z), bpm, np.angle(z))
    _, bpm, ang = best; per = 60 / bpm
    return bpm, (-ang / (2 * np.pi)) * per % per

bpm, phase = fit(160, 176)
half = len(flux) // 2
b1, p1 = fit(bpm - 0.3, bpm + 0.3, slice(0, half)); b2, p2 = fit(bpm - 0.3, bpm + 0.3, slice(half, None))
print(f'tempo {bpm:.2f} BPM, fase {phase:.3f} s · 1.ª mitad {b1:.2f} · 2.ª mitad {b2:.2f}')
beat = 60 / bpm
# Secciones (fronteras medidas por energía RMS; se ajustan al compás de 4 tiempos más cercano)
FRONTERAS = [('intro', 0.0), ('fase1', 6.0), ('respiro', 36.0), ('alta', 56.0), ('respiro', 112.0), ('alta', 132.0), ('cierre', 220.0)]
snap = lambda s: round(phase + round((s - phase) / (beat * 4)) * beat * 4, 3) if s > 0 else 0.0
secs = []
for i, (kind, s) in enumerate(FRONTERAS):
    e = FRONTERAS[i + 1][1] if i + 1 < len(FRONTERAS) else dur
    secs.append({'kind': kind, 'from': snap(s), 'to': round(dur, 3) if i + 1 == len(FRONTERAS) else snap(e)})
out = {'bpm': round(bpm, 2), 'firstBeat': round(phase, 3), 'duration': round(dur, 3),
       'phase2At': snap(72.0), 'phase3At': snap(132.0), 'sections': secs}
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
with open(os.path.join(root, 'src/data/beatmap.js'), 'w') as f:
    f.write('// Generado por scripts/beatmap.py a partir de la canción — no editar a mano.\n')
    f.write('export const BEATMAP = ' + json.dumps(out, indent=2, ensure_ascii=False) + ';\n')
print(json.dumps(out, ensure_ascii=False))
