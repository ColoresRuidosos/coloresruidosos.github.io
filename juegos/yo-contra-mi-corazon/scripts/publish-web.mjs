// Copia el juego compilado a la web de Colores Ruidosos (Hugo sirve static/ tal cual).
// La canción ya vive en static/games/yo-contra-mi-corazon/cancion.mp3 (una sola copia en el repo).
import { copyFile, mkdir, stat } from 'node:fs/promises';
const out = '../../static/games/yo-contra-mi-corazon';
await mkdir(out, { recursive: true });
await copyFile('dist/index.html', `${out}/index.html`);
console.log(`${out}/index.html · ${((await stat(`${out}/index.html`)).size / 1024).toFixed(1)} KB`);
