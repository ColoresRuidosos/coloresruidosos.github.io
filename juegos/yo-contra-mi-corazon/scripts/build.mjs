// Empaqueta el juego en dist/index.html (todo el código y los sprites). La canción va aparte: dist/cancion.mp3.
import { build } from 'esbuild';
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';

const { outputFiles } = await build({ entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'iife', write: false, target: 'es2020' });
const js = outputFiles[0].text.replace(/<\/script/g, '<\\/script');
const html = (await readFile('index.html', 'utf8')).replace('<script type="module" src="src/main.js"></script>', () => `<script>${js}</script>`);
await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', html);
await copyFile('../../static/games/yo-contra-mi-corazon/cancion.mp3', 'dist/cancion.mp3');
console.log(`dist/index.html · ${(html.length / 1024).toFixed(1)} KB (+ cancion.mp3)`);
