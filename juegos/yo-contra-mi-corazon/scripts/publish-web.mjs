// Copia el juego compilado a la web de Colores Ruidosos (Hugo sirve static/ tal cual).
// Ya no hay canción: la música se genera en el navegador (spec §3.0b).
import { copyFile, mkdir, stat } from 'node:fs/promises';
const out = '../../static/games/yo-contra-mi-corazon';
await mkdir(out, { recursive: true });
await copyFile('dist/index.html', `${out}/index.html`);
console.log(`${out}/index.html · ${((await stat(`${out}/index.html`)).size / 1024).toFixed(1)} KB`);
