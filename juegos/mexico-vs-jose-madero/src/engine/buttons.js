// Flancos de subida: qué se ha pulsado este frame.
export function edges(prev, now) {
  return { jumpPressed: !!now.jump && !prev.jump, micPressed: !!now.mic && !prev.mic, specialPressed: !!now.special && !prev.special };
}
