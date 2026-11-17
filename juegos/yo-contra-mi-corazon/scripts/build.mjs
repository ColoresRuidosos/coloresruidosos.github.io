// Empaqueta el juego:
//  - dist/index.html: código y sprites; la música se genera en el navegador (spec §3.0b). Es lo que se publica en la web.
//  - dist/yo-contra-mi-corazon-prueba.html: el mismo juego con ranking de prueba (F14).
import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const { outputFiles } = await build({ entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'iife', write: false, target: 'es2020', logLevel: 'error' });
const js = outputFiles[0].text.replace(/<\/script/g, '<\\/script');
const tpl = await readFile('index.html', 'utf8');
const TAG = '<script type="module" src="src/main.js"></script>';
const html = tpl.replace(TAG, () => `<script>${js}</script>`);
await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', html);
const prueba = tpl.replace('<title>', '<title>PRUEBA · ')
  .replace(TAG, () => `<script>window.YCMC_PRUEBA={};</script>\n<script>${js}</script>`);
await writeFile('dist/yo-contra-mi-corazon-prueba.html', prueba);
console.log(`dist/index.html · ${(html.length / 1024).toFixed(1)} KB · prueba: ${(prueba.length / 1024).toFixed(1)} KB`);
