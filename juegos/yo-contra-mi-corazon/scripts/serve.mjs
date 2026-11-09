// Servidor de desarrollo: sirve el código sin compilar y la canción desde static/.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SONG = join(ROOT, '../../static/games/yo-contra-mi-corazon/cancion.mp3');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.mp3': 'audio/mpeg' };
const port = Number(process.env.PORT || 5175);
const dist = process.argv.includes('--dist');
createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  try {
    const file = path.endsWith('cancion.mp3') ? SONG : join(ROOT, dist ? 'dist' : '', path === '/' || path === '\\' ? 'index.html' : path);
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'content-length': body.length });
    res.end(body);
  } catch { res.writeHead(404).end('not found'); }
}).listen(port, () => console.log(`Juego en http://localhost:${port}${dist ? ' (dist)' : ''}`));
