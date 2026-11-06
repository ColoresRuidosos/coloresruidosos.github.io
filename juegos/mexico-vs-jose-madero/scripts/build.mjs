// Empaqueta el juego en un único HTML autocontenido (dist/mexico-vs-jose-madero.html).
import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const { outputFiles } = await build({ entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'iife', write: false, target: 'es2020' });
const js = outputFiles[0].text.replace(/<\/script/g, '<\\/script');
const html = (await readFile('index.html', 'utf8')).replace('<script type="module" src="src/main.js"></script>', () => `<script>${js}</script>`);
await mkdir('dist', { recursive: true });
await writeFile('dist/mexico-vs-jose-madero.html', html);
console.log(`dist/mexico-vs-jose-madero.html · ${(html.length / 1024).toFixed(1)} KB`);
