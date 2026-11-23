// Genera art/concepto/hoja-concepto.png con Playwright.
import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const { outputFiles } = await build({ entryPoints: ['scripts/concepto-entry.js'], bundle: true, write: false, format: 'iife', logLevel: 'error' });
await mkdir('dist', { recursive: true }); await mkdir('art/concepto', { recursive: true });
await writeFile('dist/concepto.html', `<!doctype html><meta charset="utf-8"><body style="margin:0"><canvas id="c" style="image-rendering:pixelated"></canvas><script>${outputFiles[0].text}</script>`);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 560 } });
await p.goto('file://' + resolve('dist/concepto.html')); await p.waitForFunction(() => window.listo);
await p.locator('canvas').screenshot({ path: 'art/concepto/hoja-concepto.png' }); await b.close();
console.log('art/concepto/hoja-concepto.png');
