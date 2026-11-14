// F13: el juego solo está disponible esta semana (9–15 nov 2026, hora de CDMX).
export const CIERRE = '2026-11-15T23:59:59-06:00';
export const CIERRE_TEXTO = 'HASTA EL DOMINGO 15 DE NOV';
const OFFSET_CDMX_MS = 6 * 3600 * 1000;   // México no usa horario de verano desde 2022
const diaCDMX = (d) => Math.floor((d.getTime() - OFFSET_CDMX_MS) / 86400000);

export function temporada(ahora = new Date()) {
  const fin = new Date(CIERRE);
  if (ahora.getTime() > fin.getTime()) return { abierta: false, dias: 0, aviso: 'ESTE JUEGO YA TERMINÓ' };
  const dias = diaCDMX(fin) - diaCDMX(ahora) + 1;
  return { abierta: true, dias, aviso: dias <= 1 ? '¡ÚLTIMO DÍA!' : `QUEDAN ${dias} DÍAS` };
}
