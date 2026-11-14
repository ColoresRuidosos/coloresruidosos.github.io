// v9.7 (spec §3.0f P): escuchar cada disco en las plataformas oficiales, que tienen la licencia.
// El juego no reproduce ni incrusta música de José Madero. Enlaces: búsqueda oficial de cada plataforma
// con «José Madero <disco>» (los enlaces exactos de cada álbum no se pudieron verificar; cambiar cuando se tengan).
const q = (album) => encodeURIComponent(`José Madero ${album}`);
const links = (album) => ({
  spotify: `https://open.spotify.com/search/${q(album)}`,
  apple: `https://music.apple.com/mx/search?term=${q(album)}`,
  youtube: `https://music.youtube.com/search?q=${q(album)}`,
});

export const PLATAFORMAS = [
  { key: 'spotify', name: 'SPOTIFY' },
  { key: 'apple', name: 'APPLE MUSIC' },
  { key: 'youtube', name: 'YOUTUBE MUSIC' },
];

export const ESCUCHAR = {
  carmesi: { album: 'Carmesí', year: 2016, links: links('Carmesí') },
  noche: { album: 'Noche', year: 2017, links: links('Noche') },
};

// Qué disco ofrecer: el del mundo en juego, o el de la puerta abierta del Museo. Ninguno en portada ni prólogo.
export function albumFor(screen, run, door) {
  if (screen === 'museum' || screen === 'gallery') return door?.open ? ESCUCHAR[door.id] ?? null : null;
  if (['title', 'prologue', 'options', 'guide'].includes(screen) && !run) return null;
  return run ? ESCUCHAR[run.world] ?? null : null;
}
