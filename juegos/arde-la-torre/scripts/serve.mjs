// Servidor de desarrollo: empaqueta al vuelo (app.js y mando/pad.js) y escucha en toda la red local,
// para abrir la pantalla en el portátil y el mando en el móvil con la misma wifi.
//   node scripts/serve.mjs          → código fuente
//   node scripts/serve.mjs --dist   → lo compilado en dist/
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { networkInterfaces } from 'node:os';
import { build } from 'esbuild';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png' };
const port = Number(process.env.PORT || 5176);
const dist = process.argv.includes('--dist');
const BUNDLES = { '/app.js': 'src/main.js', '/mando/pad.js': 'src/pad-main.js' };

async function bundle(entry) {
  const r = await build({ entryPoints: [join(ROOT, entry)], bundle: true, format: 'iife', write: false, sourcemap: 'inline', logLevel: 'error' });
  return r.outputFiles[0].contents;
}

createServer(async (req, res) => {
  let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/\\/g, '/');
  if (path.includes('..')) { res.writeHead(400).end(); return; }
  if (path.endsWith('/')) path += 'index.html';
  try {
    let body;
    if (!dist && BUNDLES[path]) body = await bundle(BUNDLES[path]);
    else body = await readFile(join(ROOT, dist ? 'dist' : '', path));
    res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch (e) {
    if (e.errors) console.error(e.message);
    res.writeHead(404).end('no encontrado');
  }
}).listen(port, '0.0.0.0', () => {
  const ips = Object.values(networkInterfaces()).flat().filter((i) => i && i.family === 'IPv4' && !i.internal).map((i) => i.address);
  console.log(`Arde la Torre${dist ? ' (dist)' : ''} en http://localhost:${port}`);
  for (const ip of ips) console.log(`  en tu red: http://${ip}:${port}   ← abre esta en la pantalla para que el QR funcione en los móviles`);
});
