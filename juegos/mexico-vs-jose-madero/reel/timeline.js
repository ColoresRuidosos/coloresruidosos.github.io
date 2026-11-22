// Tráiler del Mundo 3 «Alba» (reel/spec.md T1): línea de tiempo pura (sin DOM), para probarla y para reel.js.
export const FPS = 30;
export const RW = 360, RH = 640;            // ×3 = 1080×1920
export const GAME_X = 20, GAME_Y = 208;     // el juego (320×224) en el centro
export const SAFE = 40;                     // 120 px reales: zona segura de Reels arriba y abajo
const TOP = 132, TOP2 = 156, BOT = 456, BOT2 = 480;
const s = (sec) => Math.round(sec * FPS);

// kind: qué se dibuja en el centro. captions: letreros (at = segundo dentro de la escena en que aparece).
export const SCENES = [
  { id: 'gancho', kind: 'quieto', secs: 3, captions: [
    { text: 'SI TE QUEDAS QUIETO…', y: TOP, at: 0 },
    { text: '…LA NOSTALGIA TE JALA', y: BOT, at: 1.4, color: '#d2b48c' }] },
  { id: 'titulo', kind: 'escena', scene: 'a1', secs: 3, captions: [
    { text: 'MÉXICO VS. JOSÉ MADERO', y: TOP, at: 0.3, color: '#f7c86a' },
    { text: 'MUNDO 3 · ALBA', y: BOT, at: 0.9, scale: 3 }] },
  { id: 'atril', kind: 'clip', clip: 'atril', secs: 3, captions: [
    { text: '10 PASAJES DEL DISCO', y: TOP, at: 0.2 }] },
  { id: 'enemigos', kind: 'clip', clip: 'enemigos', secs: 3, captions: [
    { text: 'EL TIEMPO SE TE ECHA ENCIMA', y: TOP, at: 0.2 }] },
  { id: 'tiro', kind: 'clip', clip: 'tiro', secs: 4, captions: [
    { text: 'MINIJUEGO:', y: TOP, at: 0.1, color: '#ffd040' },
    { text: 'TIRO DE FRASES', y: TOP2, at: 0.1 },
    { text: 'DISPÁRALE A LA NOSTALGIA', y: BOT, at: 1.2, color: '#ff9a9a' }] },
  { id: 'rueda', kind: 'clip', clip: 'rueda', secs: 3, captions: [
    { text: 'SÚBETE A LA', y: TOP, at: 0.2 },
    { text: 'MALDITA RUEDA', y: TOP2, at: 0.2, color: '#ffd040' }] },
  { id: 'nube', kind: 'clip', clip: 'nube', secs: 6, captions: [
    { text: 'LA NOSTALGIA', y: TOP, at: 0.3, color: '#d2b48c' },
    { text: 'TE PERSIGUE…', y: TOP2, at: 0.3 },
    { text: '…CADA VEZ MÁS RÁPIDO', y: BOT, at: 2.8, color: '#ff9a9a' }] },
  { id: 'letra', kind: 'clip', clip: 'despedida', secs: 3, captions: [
    { text: 'DEL JUEGO TIENES QUE BAJAR,', y: TOP, at: 0.3 },
    { text: 'PUES TODO LLEGA A SU FINAL', y: TOP2 + 4, at: 0.9 },
    { text: '«MALDITA RUEDA» · JOSÉ MADERO · ALBA (2018)', y: BOT, at: 1.2, scale: 1, small: true, color: '#e8dcc0' },
    { text: 'USADO CON AUTORIZACIÓN', y: BOT + 12, at: 1.2, scale: 1, small: true, color: '#e8dcc0' }] },
  { id: 'cierre', kind: 'cierre', secs: 3, captions: [
    { text: 'YA DISPONIBLE', y: TOP, at: 0, scale: 3, color: '#ffd040' },
    { text: 'SE ABRE AL TERMINAR NOCHE', y: BOT, at: 0.4 },
    { text: 'JUEGA GRATIS EN LA WEB DE', y: BOT2 + 8, at: 0.8, scale: 1, small: true },
    { text: 'COLORES RUIDOSOS', y: BOT2 + 22, at: 0.8 },
    { text: 'HOMENAJE NO OFICIAL · @COLORESRUIDOSOS', y: BOT2 + 50, at: 0.8, scale: 1, small: true, color: '#e6e9f0' }] },
];
let f = 0;
for (const sc of SCENES) { sc.from = f; sc.to = f += s(sc.secs); }

export const totalFrames = () => SCENES.at(-1).to;
export const sceneAt = (frame) => SCENES.find((sc) => frame >= sc.from && frame < sc.to) ?? SCENES.at(-1);
