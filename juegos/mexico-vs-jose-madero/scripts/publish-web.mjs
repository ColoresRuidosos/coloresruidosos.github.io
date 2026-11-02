// Copia el HTML compilado a la web de Colores Ruidosos (Hugo sirve static/ tal cual).
// Se despliega al fusionar en main: el workflow «Publicar Colores Ruidosos» se lanza con cambios en static/.
import { copyFile, mkdir, stat } from 'node:fs/promises';
const out = '../../static/juegos/mexico-vs-jose-madero';
await mkdir(out, { recursive: true });
await copyFile('dist/mexico-vs-jose-madero.html', `${out}/index.html`);
console.log(`${out}/index.html · ${((await stat(`${out}/index.html`)).size / 1024).toFixed(1)} KB`);
