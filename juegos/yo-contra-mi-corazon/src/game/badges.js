// F15: 10 insignias con nombres de discos y canciones verificados de José Madero (CONTEXTO.md §5).
export const BADGES = [
  { id: 'carmesi', nombre: 'CARMESÍ', pista: 'VACÍA LA PRIMERA BARRA' },
  { id: 'brujas', nombre: 'NOCHE DE BRUJAS', pista: 'NO CAIGAS EN 3 FINTAS' },
  { id: 'teoremas', nombre: 'TEOREMAS, ETC.', pista: 'AGUANTA HASTA EL FINAL' },
  { id: 'bestia', nombre: 'ÉRASE UNA BESTIA', pista: 'GANA POR K.O.' },
  { id: 'plural', nombre: 'PLURAL SIENDO SINGULAR', pista: 'GANA SIN USAR EL GRITO' },
  { id: 'rey', nombre: 'REY AHOGADO', pista: 'GANA CON LA VIDA EN ROJO' },
  { id: 'fantasmas', nombre: 'FANTASMAS', pista: 'UNA FASE SIN GOLPES' },
  { id: 'psalmos', nombre: 'PSALMOS', pista: '16 PERFECTOS SEGUIDOS' },
  { id: 'rueda', nombre: 'MALDITA RUEDA', pista: 'PIERDE 3 Y VUELVE A JUGAR' },
  { id: 'querido', nombre: 'QUERIDO…', pista: 'PUBLICA EN EL RANKING' },
];
export const badgeById = (id) => BADGES.find((b) => b.id === id);

// Insignias que gana una partida terminada. ctx.derrotasPrevias = derrotas seguidas antes de esta partida.
export function earnedBadges(m, { derrotasPrevias = 0 } = {}) {
  const s = m.stats, won = m.over === 'ko' || m.over === 'decision';
  const out = [];
  if (m.heart.hp[0] <= 0) out.push('carmesi');
  if (s.fintas >= 3 && s.caiste === 0) out.push('brujas');
  if (m.over && m.over !== 'derrota') out.push('teoremas');
  if (m.over === 'ko') out.push('bestia');
  if (won && s.gritos === 0) out.push('plural');
  if (won && m.clown.hp <= 20) out.push('rey');
  if (m.fasesLimpias > 0) out.push('fantasmas');
  if (s.maxStreak >= 16) out.push('psalmos');
  if (derrotasPrevias >= 3) out.push('rueda');
  return out;
}

// Guarda en save.insignias las que no tenía y devuelve solo las nuevas.
export function awardBadges(save, ids, now = new Date()) {
  save.insignias = save.insignias || {};
  const nuevas = ids.filter((id) => !save.insignias[id]);
  for (const id of nuevas) save.insignias[id] = now.toISOString().slice(0, 10);
  return nuevas;
}
export const badgeCount = (save) => Object.keys(save.insignias || {}).length;
