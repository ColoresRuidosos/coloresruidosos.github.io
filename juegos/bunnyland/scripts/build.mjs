// Empaqueta el juego en un solo archivo: dist/index.html (código, sprites y música generada; sin audio ni fotos).
import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const { outputFiles } = await build({ entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'iife', write: false, target: 'es2020', logLevel: 'error' });
const js = outputFiles[0].text.replace(/<\/script/g, '<\\/script');
const tpl = await readFile('index.html', 'utf8');
const html = tpl.replace('<script type="module" src="src/main.js"></script>', () => `<script>${js}</script>`);
await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', html);
console.log(`dist/index.html · ${(html.length / 1024).toFixed(1)} KB`);
