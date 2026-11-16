// v10.1 · Fragmentos de letras de Alba (✅ permiso confirmado por el usuario, 15 nov 2026).
// El texto exacto lo aporta el equipo de Colores Ruidosos desde la fuente oficial: Claude NO lo transcribe.
// Formato: { cancion: 'MALDITA RUEDA', fragmento: ['línea 1', 'línea 2'], credito: '«MALDITA RUEDA» · JOSÉ MADERO · ALBA (2018) · USADO CON AUTORIZACIÓN' }
// Hasta 4 líneas de 30 caracteres. Mientras una canción no tenga fragmento, su atril muestra solo la reflexión.
// ✅ Fragmentos aportados por el equipo de CR el 16 nov 2026 (copiados tal cual, en mayúsculas por la fuente del juego).
// Sin fragmento todavía: LA CÉLULA NO EXPLOTÓ, AHORA Y HOY y ETRUSCO ÚNICO (sus atriles muestran solo la reflexión).
export const LETRAS = [
  { cancion: 'WILLKOMMEN', fragmento: ['EL HECHIZO AYER SE ROMPIÓ,', 'ESA MAGIA TAMBIÉN SE EXTINGUIÓ'],
    credito: '«WILLKOMMEN» · JOSÉ MADERO · ALBA (2018) · USADO CON AUTORIZACIÓN' },
  { cancion: 'AÚN HAY MÁS', fragmento: ['ESTO QUE SIENTO ES TEMOR,', 'ESTO QUE SIENTO ES DOLOR,', 'ESTO QUE SIENTO ES AMOR'],
    credito: '«AÚN HAY MÁS» · JOSÉ MADERO · ALBA (2018) · USADO CON AUTORIZACIÓN' },
  { cancion: 'LOS DE SEPTIEMBRE', fragmento: ['TARDE O TEMPRANO APRENDO', 'QUE LA VIDA SÓLO ES UN MOMENTO'],
    credito: '«LOS DE SEPTIEMBRE» · JOSÉ MADERO · ALBA (2018) · USADO CON AUTORIZACIÓN' },
  { cancion: 'CABALLEROS BRITÁNICOS', fragmento: ['AVANZO CON LOS AÑOS,', 'PERO VOY A PIE'],
    credito: '«CABALLEROS BRITÁNICOS» · JOSÉ MADERO · ALBA (2018) · USADO CON AUTORIZACIÓN' },
  { cancion: 'NO LO CAMBIO POR NADA', fragmento: ['TODAVÍA CREO EN EL PAPEL,', 'CREO EN LA PLUMA Y EL PINCEL'],
    credito: '«NO LO CAMBIO POR NADA» · JOSÉ MADERO · ALBA (2018) · USADO CON AUTORIZACIÓN' },
  { cancion: 'MALDITA RUEDA', fragmento: ['DEL JUEGO TIENES QUE BAJAR,', 'PUES TODO LLEGA A SU FINAL'],
    credito: '«MALDITA RUEDA» · JOSÉ MADERO · ALBA (2018) · USADO CON AUTORIZACIÓN' },
  { cancion: 'CARRUSEL DE ADULTOS', fragmento: ['ES UNA MÁQUINA DEL TIEMPO', 'EN EL PRESENTE Y REALIDAD'],
    credito: '«CARRUSEL DE ADULTOS» · JOSÉ MADERO · ALBA (2018) · USADO CON AUTORIZACIÓN' },
];
export const letraDe = (cancion) => LETRAS.find((l) => l.cancion === cancion && l.fragmento.length) ?? null;
