// Exporta los subtítulos desde window.SUBS (los mismos datos que la pantalla) → ultima-partida.srt
import { fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';
const DIR = fileURLToPath(new URL('..', import.meta.url));
const LIB = process.env.LIB || fileURLToPath(new URL('../../..', import.meta.url));
const { openDemo, closeServer } = await import(LIB + '/core/render/page.mjs');
const { browser, page } = await openDemo(DIR, { w: 1080, h: 1920 });
const subs = await page.evaluate(() => window.SUBS);
await browser.close(); await closeServer();
const ts = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, x = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
writeFileSync(DIR + 'ultima-partida.srt', subs.map((c, i) => `${i + 1}\n${ts(c.t0)} --> ${ts(c.t1)}\n${c.text}\n`).join('\n'));
console.log('srt', subs.length, 'cues');
