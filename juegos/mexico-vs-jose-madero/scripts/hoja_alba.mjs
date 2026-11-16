// Vuelca los sprites de Alba (y los invitados sin disfraz para «Los de septiembre») a JSON
// para que scripts/hoja_alba.py arme la hoja de concepto. Uso: node scripts/hoja_alba.mjs > /tmp/alba.json
import { ALBA, renderAlba } from '../src/render/sprites-alba.js';
import { renderCharacter } from '../src/render/sprites-fiesta.js';
const out = { alba: {}, septiembre: {} };
for (const id of Object.keys(ALBA)) out.alba[id] = renderAlba(id).frames;
for (const id of ['gigante', 'invisible', 'anfibio', 'llorona', 'charro']) out.septiembre[id] = renderCharacter(id).frames.find((f) => f.key === 'uwalk0');
process.stdout.write(JSON.stringify(out));
