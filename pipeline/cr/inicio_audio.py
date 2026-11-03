"""Dónde empieza a sonar de verdad cada avance de Adivina la canción (F22/D28).

Algunos avances de Apple Music arrancan con un fade o una intro casi muda, y el fragmento de 1 s sonaba vacío.
Se mide la energía (RMS) cada 0,1 s y se elige el primer segundo que ya suena; los fragmentos parten de ahí."""
import array
import math
import os
import subprocess
import tempfile

PASO = 0.1          # segundos por medición
TOPE = 14.0         # 30 s de avance − 16 s del fragmento más largo
SR = 8000           # basta para medir energía
TIEMPO = 30


def _percentil(valores, p):
    v = sorted(valores)
    return v[min(len(v) - 1, int(round(p * (len(v) - 1))))]


def inicio_audible(rms, paso=PASO, tope=TOPE):
    """rms: energía cada `paso` segundos (0–1). Devuelve el inicio en segundos, redondeado a 0,1.

    Una ventana de 1 s vale si su primer instante ya suena (≥ 20 % de la referencia), su media llega al 35 % y
    ningún tramo de 0,2 s baja del 10 %. Referencia = percentil 95 de lo que no es silencio digital."""
    sonido = [x for x in rms if x > 1e-4]
    if not sonido:
        return 0.0
    ref = _percentil(sonido, 0.95)
    n = round(1.0 / paso)
    bloque = max(1, round(0.2 / paso))
    ultimo = min(round(tope / paso), len(rms) - n)
    mejor, mejor_i = -1.0, 0
    for i in range(0, max(0, ultimo) + 1):
        v = rms[i:i + n]
        if len(v) < n:
            break
        media = sum(v) / n
        if media > mejor:
            mejor, mejor_i = media, i
        bloques = [sum(v[k:k + bloque]) / len(v[k:k + bloque]) for k in range(0, n, bloque)]
        if v[0] >= 0.2 * ref and media >= 0.35 * ref and min(bloques) >= 0.1 * ref:
            return round(i * paso, 1)
    return round(mejor_i * paso, 1) if mejor > 0 else 0.0


def rms_por_paso(muestras, sr, paso=PASO):
    """muestras: PCM de 16 bits (enteros). RMS normalizado por cada tramo completo de `paso` segundos."""
    k = int(sr * paso)
    salida = []
    for i in range(0, len(muestras) - k + 1, k):
        tramo = muestras[i:i + k]
        salida.append(math.sqrt(sum(x * x for x in tramo) / k) / 32768)
    return salida


def medir_inicio(url, http_get=None):
    """Descarga el avance, lo decodifica con ffmpeg (mono, 8 kHz) y devuelve su inicio audible."""
    if http_get is None:
        import requests
        http_get = requests.get
    r = http_get(url, timeout=TIEMPO)
    r.raise_for_status()
    # El m4a puede traer el índice al final: ffmpeg lo lee mejor de un archivo que de una tubería.
    with tempfile.NamedTemporaryFile(suffix=".m4a", delete=False) as f:
        f.write(r.content)
        ruta = f.name
    try:
        pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", ruta, "-ac", "1", "-ar", str(SR), "-f", "s16le", "pipe:1"],
                             capture_output=True, check=True, timeout=TIEMPO).stdout
    finally:
        os.unlink(ruta)
    muestras = array.array("h")
    muestras.frombytes(pcm[: len(pcm) // 2 * 2])
    return inicio_audible(rms_por_paso(muestras, SR))
