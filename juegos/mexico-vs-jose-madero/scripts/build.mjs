// Empaqueta el juego en un único HTML autocontenido (dist/mexico-vs-jose-madero.html).
import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

// --solo=alba: versión de prueba de un solo mundo (sin Museo), en dist/<juego>-<mundo>.html.
const solo = process.argv.find((a) => a.startsWith('--solo='))?.slice(7) ?? null;
const { outputFiles } = await build({ entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'iife', write: false, target: 'es2020',
  define: solo ? { __SOLO__: JSON.stringify(solo) } : {} });
const js = outputFiles[0].text.replace(/<\/script/g, '<\\/script');
const html = (await readFile('index.html', 'utf8')).replace('<script type="module" src="src/main.js"></script>', () => `<script>${js}</script>`);
await mkdir('dist', { recursive: true });
const out = solo ? `dist/mexico-vs-jose-madero-${solo}.html` : 'dist/mexico-vs-jose-madero.html';
await writeFile(out, html);
console.log(`${out} · ${(html.length / 1024).toFixed(1)} KB`);
