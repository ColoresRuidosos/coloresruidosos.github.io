# Concierto final (F17, plan §3): recorta el final de «La Torre Picasso», calcula el tempo y genera las notas.
#   python3 -I scripts/cancion.py [ruta-al-mp3-completo]
# Con la ruta, recorta el fragmento y lo guarda en art/source/musica/la-torre-picasso-final.mp3 (96 kbps).
# Sin ruta, reutiliza ese fragmento. Escribe src/data/cancion-final.js (MP3 en base64, BPM, notas y duración).
# Notas: [ms, carril] con carril 0 = GOLPE (graves), 1 = SALTO (medios) y 2 = ESPECIAL (agudos).
import base64, json, os, subprocess, sys, tempfile
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLIP = os.path.join(ROOT, 'art', 'source', 'musica', 'la-torre-picasso-final.mp3')
START, END = 396.0, 475.0        # 6:36 → 7:55 del videoclip: sube hasta el clímax y termina sola
FADE_IN = 1.5
SR, HOP, N = 22050, 256, 1024
LEAD_MS = 2500                   # primera nota: da tiempo a prepararse


def cut(src):
    os.makedirs(os.path.dirname(CLIP), exist_ok=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(START), '-to', str(END), '-i', src, '-vn',
                    '-af', f'afade=t=in:d={FADE_IN},afade=t=out:st={END - START - 2.5}:d=2.5',
                    '-ac', '2', '-ar', '44100', '-b:a', '96k', '-map_metadata', '-1', CLIP], check=True)


def pcm(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def analyse(y):
    frames = np.lib.stride_tricks.sliding_window_view(y, N)[::HOP] * np.hanning(N)
    mag = np.abs(np.fft.rfft(frames, axis=1))
    freqs = np.fft.rfftfreq(N, 1 / SR)
    lm = np.log1p(10 * mag)
    d = np.maximum(0, np.diff(lm, axis=0))
    bands = [d[:, freqs < 180].sum(1), d[:, (freqs >= 180) & (freqs < 2000)].sum(1), d[:, freqs >= 2000].sum(1)]
    bands = [(b - b.mean()) / (b.std() + 1e-9) for b in bands]
    flux = d.sum(1); flux = (flux - flux.mean()) / flux.std()
    fps = SR / HOP
    return flux, bands, fps


def tempo(flux, fps):
    ac = np.correlate(flux, flux, 'full')[len(flux) - 1:]
    best = max(np.arange(100, 130, 0.05), key=lambda b: np.interp(60 / b * fps, np.arange(len(ac)), ac))
    period = 60 / best * fps
    # fase: la que más ataques recoge en los pulsos
    phases = np.arange(0, period, 0.25)
    score = [np.interp(np.arange(p, len(flux), period), np.arange(len(flux)), flux).sum() for p in phases]
    return float(best), float(phases[int(np.argmax(score))] / fps)


def notes(flux, bands, fps, bpm, phase, dur):
    eighth = 60 / bpm / 2
    t = phase
    out = []
    idx = lambda s: int(round(s * fps))
    def strength(arr, s):
        i = idx(s); return float(arr[max(0, i - 2):i + 3].max()) if i < len(arr) else -9
    k = 0
    while t < dur - 0.8:
        ms = t * 1000
        if ms >= LEAD_MS:
            on_beat = k % 2 == 0
            prog = ms / (dur * 1000)                       # dificultad que sube: al principio solo negras fuertes
            thr = (0.6 if on_beat else 1.6) - 0.5 * prog
            if not on_beat and prog < 0.25: thr = 99
            st = strength(flux, t)
            if st > thr:
                lane = int(np.argmax([strength(b, t) for b in bands]))
                out.append([int(round(ms)), lane])
        t += eighth; k += 1
    # variedad: no más de 3 notas seguidas en el mismo carril
    for i in range(3, len(out)):
        if out[i][1] == out[i - 1][1] == out[i - 2][1] == out[i - 3][1]:
            out[i][1] = (out[i][1] + 1 + (i % 2)) % 3
    return out


def main():
    if len(sys.argv) > 1: cut(sys.argv[1])
    y = pcm(CLIP)
    dur = len(y) / SR
    flux, bands, fps = analyse(y)
    bpm, phase = tempo(flux, fps)
    ns = notes(flux, bands, fps, bpm, phase, dur)
    data = base64.b64encode(open(CLIP, 'rb').read()).decode()
    counts = [sum(1 for n in ns if n[1] == l) for l in range(3)]
    with open(os.path.join(ROOT, 'src', 'data', 'cancion-final.js'), 'w') as f:
        f.write("// Generado por scripts/cancion.py: final de «La Torre Picasso» (Arde Bogotá), con permiso de la banda según el usuario (spec §6.1).\n"
                "// No editar a mano. NOTES: [ms desde el inicio del fragmento, carril 0 GOLPE · 1 SALTO · 2 ESPECIAL].\n"
                f"export const BPM = {bpm:.2f};\nexport const DURATION_MS = {int(dur * 1000)};\n"
                f"export const NOTES = {json.dumps(ns, separators=(',', ':'))};\n"
                f"export const MP3 = 'data:audio/mpeg;base64,{data}';\n")
    print(f"{dur:.1f} s · {bpm:.2f} BPM · fase {phase * 1000:.0f} ms · {len(ns)} notas {counts} · MP3 {len(data) * 3 // 4 // 1024} KB")


if __name__ == '__main__':
    main()
