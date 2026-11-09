// F7b: un consejo al perder, según cómo se jugó (el primero que aplique).
export function tipFor(m, { derrotasSeguidas = 0 } = {}) {
  const s = m.stats;
  const esquivas = s.perfecto + s.bien + s.temprano;
  if (derrotasSeguidas >= 2) return 'SI SE TE COMPLICA, ACTIVA EL MODO ASISTIDO EN OPCIONES: VENTANAS MÁS AMPLIAS Y NO PIERDES VIDA.';
  if (s.golpes >= 5 && s.golpes > esquivas / 2) return 'FÍJATE QUÉ PUÑO SUBE Y DESLIZA AL LADO CONTRARIO. SI SE INFLA Y LE BRILLAN LAS VENAS, DESLIZA ABAJO.';
  if (s.temprano > s.perfecto + s.bien) return 'ESQUIVAS MUY PRONTO. ESPERA A QUE LANCE EL GOLPE: DESLIZA EN EL TIEMPO DE LA CANCIÓN.';
  if (s.abiertos > 0 && s.batazos < s.abiertos * 2) return 'DESPUÉS DE ESQUIVAR QUEDA ABIERTO: TOCA CUANDO EL ARO LLEGUE AL CÍRCULO VERDE, HASTA 4 VECES.';
  if (s.rebotes >= 10) return 'SI TOCAS CUANDO NO ESTÁ ABIERTO, EL BATE REBOTA Y PIERDES LA RACHA. PRIMERO ESQUIVA.';
  return 'CON 5 ESTRELLAS USA EL GRITO (EL MICRÓFONO): EL CORAZÓN SE QUEDA QUIETO Y TU DAÑO SE TRIPLICA.';
}
