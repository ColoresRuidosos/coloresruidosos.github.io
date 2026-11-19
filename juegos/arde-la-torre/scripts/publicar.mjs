// Publica el juego en la web de Colores Ruidosos (T7.4): copia lo compilado a static/games/arde-la-torre/
// y añade (o actualiza) su tarjeta en data/games.json. Antes: npm run build && npm test.
//   node scripts/publicar.mjs
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';

const SITE = join(process.cwd(), '..', '..');
const DEST = join(SITE, 'static', 'games', 'arde-la-torre');
await mkdir(join(DEST, 'mando'), { recursive: true });
await copyFile('dist/index.html', join(DEST, 'index.html'));
await copyFile('dist/mando/index.html', join(DEST, 'mando', 'index.html'));

const CARD = {
  id: 'arde-la-torre',
  nombre: 'Arde la Torre',
  descripcion: 'Beat \u2019em up de 16 bits para 4 con el móvil como mando: Antonio, Pepe, Dani y Jota suben la Torre Picasso a golpes y acaban en concierto con «La Torre Picasso». Homenaje no oficial.',
  url: 'games/arde-la-torre/',
  boton: '▶ Jugar',
  etiqueta: 'Nuevo',
  desde: '2026-11-15T00:00:00-06:00',
};
const file = join(SITE, 'data', 'games.json');
const games = JSON.parse(await readFile(file, 'utf8'));
const i = games.findIndex((g) => g.id === CARD.id);
if (i >= 0) games[i] = { ...games[i], ...CARD }; else games.unshift(CARD);
await writeFile(file, JSON.stringify(games, null, 2) + '\n');
console.log(`Publicado en static/games/arde-la-torre/ y tarjeta en data/games.json (${games.length} juegos)`);
