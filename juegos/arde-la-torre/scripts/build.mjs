// Empaqueta en dos HTML autocontenidos (NFR peso):
//   dist/index.html        → la pantalla principal (juego)
//   dist/mando/index.html  → el mando del móvil (ligero: sin fondos ni pantallas del juego)
import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

async function bundle(entry, tplPath, tag, out) {
  const { outputFiles } = await build({ entryPoints: [entry], bundle: true, minify: true, format: 'iife', write: false, target: 'es2020', logLevel: 'error', legalComments: 'none' });
  const js = outputFiles[0].text.replace(/<\/script/g, '<\\/script');
  const tpl = await readFile(tplPath, 'utf8');
  if (!tpl.includes(tag)) throw new Error(`${tplPath}: falta ${tag}`);
  const html = tpl.replace(tag, () => `<script>${js}</script>`);
  await writeFile(out, html);
  return html.length;
}

await mkdir('dist/mando', { recursive: true });
const a = await bundle('src/main.js', 'index.html', '<script src="./app.js"></script>', 'dist/index.html');
const b = await bundle('src/pad-main.js', 'mando/index.html', '<script src="./pad.js"></script>', 'dist/mando/index.html');
console.log(`dist/index.html · ${(a / 1024).toFixed(1)} KB  ·  dist/mando/index.html · ${(b / 1024).toFixed(1)} KB`);
