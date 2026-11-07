#!/bin/sh
# Reconstruye el reel desde cero. Necesita la biblioteca lemo-opuscar (render, mux):
#   LIB=<ruta a lemo-opuscar> FFMPEG_DIR=<carpeta con ffmpeg 7+> sh reels/ultima-partida/build.sh
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$(cd "$HERE/../.." && pwd)}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
# ffmpeg 7+ (el 6.x mide mal la longitud con loudnorm): FFMPEG_DIR=<carpeta con ffmpeg 7+>
[ -n "$FFMPEG_DIR" ] && PATH="$FFMPEG_DIR:$PATH" && export PATH
cd "$LIB"
mkdir -p "$HERE/out"
SIZE="--size 1080x1920"
node --test "$HERE"/tests/*.test.mjs                                      # datos y línea de tiempo
node "$HERE/tests/layout.test.mjs"                                        # zona segura
node core/render/readcheck.mjs "$HERE" $SIZE > "$HERE/out/readcheck.txt"  # tiempos de lectura
node core/render/events.mjs "$HERE" $SIZE
"$LIB/.venv/bin/python" "$HERE/mix.py"                                    # partitura + foley → out/mix.wav
node "$HERE/tools/srt.mjs"                                                # subtítulos (.srt)
node core/render/video.mjs "$HERE" --fps 24 --workers 3 $SIZE --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/ultima-partida.mp4" 24 0
node core/render/still.mjs "$HERE" 0 $SIZE --prefix poster_ --out "$HERE/out" && cp "$HERE/out/poster_0.jpg" "$HERE/poster.jpg"
