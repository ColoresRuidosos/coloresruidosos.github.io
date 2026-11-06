// Guía de objetos (spec §3.0f L): qué es cada cosa y para qué sirve. `first`: lo que se explica la primera vez.
export const GUIDE = [
  { kind: 'carta', name: 'CARTA DE FAN', lines: ['+1 CORAZÓN (COMO MÁXIMO, 3).', 'CAE UNA CADA 6 ENEMIGOS VENCIDOS.'], first: 'CARTA DE FAN: +1 CORAZÓN.' },
  { kind: 'amp', name: 'AMPLIFICADOR', lines: ['EL MICRO LLEGA EL DOBLE DE LEJOS.', 'DURA 10 SEGUNDOS.'], first: 'AMPLIFICADOR: EL MICRO LLEGA MÁS LEJOS.' },
  { kind: 'pua', name: 'PÚA DE GUITARRA', lines: ['CADA VEZ QUE LANZAS EL MICRO', 'SALE UNA PÚA QUE VUELA. DURA 15 S.'], first: 'PÚA: CON EL MICRO, DISPARAS PÚAS.' },
  { kind: 'antifaz', name: 'ANTIFAZ DE LA FIESTA', lines: ['INVENCIBLE: LO QUE TOCAS, CAE.', 'DURA 8 SEGUNDOS.'], first: 'ANTIFAZ: ¡INVENCIBLE UNOS SEGUNDOS!' },
  { kind: 'aceite', name: 'ACEITE', lines: ['RELLENA EL FAROL EN LOS NIVELES', 'A OSCURAS (MUNDO NOCHE).'], first: 'ACEITE: EL FAROL VUELVE A ALUMBRAR.' },
  { kind: 'solo', name: 'SOLO DE GUITARRA', lines: ['VENCE ENEMIGOS PARA LLENAR LA OVACIÓN', 'Y PULSA C / ★: CAE TODO A TU ALREDEDOR.'], first: '¡OVACIÓN LLENA! PULSA C / ★ PARA EL SOLO.' },
  { kind: 'piezas', name: 'CARMESÍS Y LUNAS', lines: ['PIEZAS DEL MUSEO DE CADA MUNDO.', 'RECÓGELAS TODAS PARA GANAR TRAJES.'], first: 'PIEZA DEL MUSEO: ¡A POR TODAS!' },
  { kind: 'gancho', name: 'GANCHOS', lines: ['SALTA Y PULSA B CUANDO VEAS LA «B»:', 'TE CUELGAS Y SALES DISPARADO.'], first: 'GANCHO: SALTA Y PULSA B PARA COLGARTE.' },
];
export const guideOf = (kind) => GUIDE.find((g) => g.kind === kind);
