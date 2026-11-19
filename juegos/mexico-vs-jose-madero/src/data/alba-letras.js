// v10.1 · Fragmentos de letras de Alba (✅ permiso confirmado por el usuario, 15 nov 2026).
// El texto exacto lo aporta el equipo de Colores Ruidosos desde la fuente oficial: Claude NO lo transcribe.
// Formato: { cancion: 'MALDITA RUEDA', fragmento: ['línea 1', 'línea 2'], credito: '«MALDITA RUEDA» — JOSÉ MADERO · ALBA (2018) · USADO CON AUTORIZACIÓN' }
// Hasta 4 líneas de 30 caracteres. Mientras una canción no tenga fragmento, su atril muestra solo la reflexión.
export const LETRAS = [];
export const letraDe = (cancion) => LETRAS.find((l) => l.cancion === cancion && l.fragmento.length) ?? null;
