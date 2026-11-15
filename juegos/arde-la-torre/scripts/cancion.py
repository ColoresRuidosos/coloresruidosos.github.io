# Concierto final (F17, plan §3): recorta el final de «La Torre Picasso», calcula el tempo y genera las notas.
#   python3 -I scripts/cancion.py [ruta-al-mp3-completo]
# Con la ruta, recorta el fragmento y lo guarda en art/source/musica/la-torre-picasso-final.mp3 (96 kbps).
# Sin ruta, reutiliza ese fragmento. Escribe src/data/cancion-final.js (MP3 en base64, BPM, notas y duración).
# PARTS: una parte por músico, [ms, carril] con carril 0 = GOLPE, 1 = SALTO y 2 = ESPECIAL (ver PARTS abajo).
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
    flux = d.sum(1); flux = (flux - flux.mean()) / flux.std()
    return dict(mag=mag[1:], d=d, freqs=freqs, flux=flux, fps=SR / HOP)


def band_flux(a, lo, hi):
    m = (a['freqs'] >= lo) & (a['freqs'] < hi)
    b = a['d'][:, m].sum(1)
    return (b - b.mean()) / (b.std() + 1e-9)


def peak_freq(a, i, lo, hi):
    m = (a['freqs'] >= lo) & (a['freqs'] < hi)
    seg = a['mag'][i:i + 4, m].mean(0)
    return float(a['freqs'][m][int(np.argmax(seg))])


def tempo(flux, fps):
    ac = np.correlate(flux, flux, 'full')[len(flux) - 1:]
    best = max(np.arange(100, 130, 0.05), key=lambda b: np.interp(60 / b * fps, np.arange(len(ac)), ac))
    period = 60 / best * fps
    # fase: la que más ataques recoge en los pulsos
    phases = np.arange(0, period, 0.25)
    score = [np.interp(np.arange(p, len(flux), period), np.arange(len(flux)), flux).sum() for p in phases]
    return float(best), float(phases[int(np.argmax(score))] / fps)


# Una parte por músico (F17 v2). `onset`: banda donde se buscan los ataques de su instrumento.
# Carriles: la batería por pieza (bombo, caja, platos); el resto por altura de la nota (grave → GOLPE, aguda → ESPECIAL).
PARTS = {
    'jota': dict(onset=[(30, 120), (150, 600), (6000, 11000)], kit=True, extra=1.0),        # batería
    'pepe': dict(onset=[(40, 250)], pitch=(40, 250)),                                          # bajo
    'dani': dict(onset=[(250, 2500)], pitch=(200, 1200)),                                      # guitarra
    'antonio': dict(onset=[(300, 3000)], pitch=(150, 900)),                                    # voz
}


def downbeats(bpm, phase, dur):
    """ms de los primeros golpes de compás (cada 8 corcheas): ahí se cuenta el «¡TODOS A UNA!»."""
    bar = 60 / bpm * 4
    return {int(round((phase + i * bar) * 1000)) for i in range(int(dur / bar) + 1)}


def part_notes(a, cfg, bpm, phase, dur):
    fps = a['fps']; eighth = 60 / bpm / 2
    bands = [band_flux(a, lo, hi) for lo, hi in cfg['onset']]
    onset = np.max(bands, axis=0) if cfg.get('kit') else bands[0]
    def strength(arr, s):
        i = int(round(s * fps)); return float(arr[max(0, i - 2):i + 3].max()) if i < len(arr) else -9
    grid = []
    t, k = phase, 0
    while t < dur - 0.8:
        if t * 1000 >= LEAD_MS: grid.append((t, k))
        t += eighth; k += 1
    chosen = []
    for w in range(0, len(grid), 16):                      # ventanas de 2 compases (16 corcheas)
        win = grid[w:w + 16]
        if not win: break
        prog = win[0][0] / dur
        per_bar = 3 + 3 * prog + cfg.get('extra', 0) * prog   # 3 notas por compás al principio, ~6 en el clímax
        n = max(1, round(per_bar * len(win) / 8))
        cand = []
        for t, k in win:
            st = strength(onset, t) + (0.35 if k % 2 == 0 else 0) + (0.25 if k % 8 == 0 else 0)
            if prog < 0.2 and k % 2: continue               # al principio, solo negras
            if st > -0.2: cand.append((st, t, k))
        chosen += sorted(cand, reverse=True)[:n]
    chosen.sort(key=lambda c: c[1])
    out = []
    if cfg.get('kit'):
        for _, t, k in chosen:
            out.append([int(round(t * 1000)), int(np.argmax([strength(b, t) for b in bands]))])
    else:
        lo, hi = cfg['pitch']
        f = [peak_freq(a, int(round(t * fps)), lo, hi) for _, t, k in chosen]
        rank = np.empty(len(f), int); rank[np.argsort(np.array(f) + np.arange(len(f)) * 1e-6, kind='stable')] = np.arange(len(f))
        for (_, t, k), r in zip(chosen, rank):            # tercios por altura: de grave (GOLPE) a aguda (ESPECIAL)
            out.append([int(round(t * 1000)), min(2, int(3 * r / max(1, len(f))))])
    # variedad: no más de 3 notas seguidas en el mismo carril
    for i in range(3, len(out)):
        if out[i][1] == out[i - 1][1] == out[i - 2][1] == out[i - 3][1]:
            out[i][1] = (out[i][1] + 1 + (i % 2)) % 3
    return out


def main():
    if len(sys.argv) > 1: cut(sys.argv[1])
    y = pcm(CLIP)
    dur = len(y) / SR
    a = analyse(y)
    bpm, phase = tempo(a['flux'], a['fps'])
    parts = {h: part_notes(a, cfg, bpm, phase, dur) for h, cfg in PARTS.items()}
    data = base64.b64encode(open(CLIP, 'rb').read()).decode()
    sets = [set(n[0] for n in ns) for ns in parts.values()]
    unison = sorted(set.intersection(*sets) & downbeats(bpm, phase, dur))
    with open(os.path.join(ROOT, 'src', 'data', 'cancion-final.js'), 'w') as f:
        f.write("// Generado por scripts/cancion.py: final de «La Torre Picasso» (Arde Bogotá), con permiso de la banda según el usuario (spec §6.1).\n"
                "// No editar a mano. PARTS[músico]: [ms desde el inicio del fragmento, carril 0 GOLPE · 1 SALTO · 2 ESPECIAL].\n"
                f"export const BPM = {bpm:.2f};\nexport const DURATION_MS = {int(dur * 1000)};\n"
                f"export const PARTS = {json.dumps(parts, separators=(',', ':'))};\n"
                f"export const UNISON = {json.dumps(unison)};   // primeros golpes de compás donde las 4 partes tienen nota\n"
                "export const INSTRUMENTS = { antonio: 'VOZ', pepe: 'BAJO', dani: 'GUITARRA', jota: 'BATERÍA' };\n"
                f"export const MP3 = 'data:audio/mpeg;base64,{data}';\n")
    for h, ns in parts.items():
        print(f"{h}: {len(ns)} notas {[sum(1 for n in ns if n[1] == l) for l in range(3)]}")
    print(f"todos a una (primer golpe de compás): {len(unison)}")
    print(f"{dur:.1f} s · {bpm:.2f} BPM · fase {phase * 1000:.0f} ms · todos a una: {len(set.intersection(*sets))} · MP3 {len(data) * 3 // 4 // 1024} KB")


if __name__ == '__main__':
    main()
