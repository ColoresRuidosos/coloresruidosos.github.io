// Empaqueta el juego:
//  - dist/index.html: código y sprites; la canción va aparte (dist/cancion.mp3). Es lo que se publica en la web.
//  - dist/yo-contra-mi-corazon-prueba.html: un solo archivo con la canción incrustada y ranking de prueba (F14).
import { build } from 'esbuild';
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';

const SONG = '../../static/games/yo-contra-mi-corazon/cancion.mp3';
const { outputFiles } = await build({ entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'iife', write: false, target: 'es2020', logLevel: 'error' });
const js = outputFiles[0].text.replace(/<\/script/g, '<\\/script');
const tpl = await readFile('index.html', 'utf8');
const TAG = '<script type="module" src="src/main.js"></script>';
const html = tpl.replace(TAG, () => `<script>${js}</script>`);
await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', html);
await copyFile(SONG, 'dist/cancion.mp3');
const b64 = (await readFile(SONG)).toString('base64');
const prueba = tpl.replace('<title>', '<title>PRUEBA · ')
  .replace(TAG, () => `<script>window.YCMC_PRUEBA={song:"data:audio/mpeg;base64,${b64}"};</script>\n<script>${js}</script>`);
await writeFile('dist/yo-contra-mi-corazon-prueba.html', prueba);
console.log(`dist/index.html · ${(html.length / 1024).toFixed(1)} KB (+ cancion.mp3) · prueba: ${(prueba.length / 1048576).toFixed(1)} MB`);
