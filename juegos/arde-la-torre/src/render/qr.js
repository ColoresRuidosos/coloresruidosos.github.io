// Código QR de la sala (T4.7): matriz con qrcode-generator (MIT) y dibujo en el canvas, píxel a píxel.
import qrcode from 'qrcode-generator';

export function qrMatrix(text, level = 'M') {
  const q = qrcode(0, level);
  q.addData(text); q.make();
  const n = q.getModuleCount();
  return { n, dark: (r, c) => q.isDark(r, c) };
}

// Dibuja el QR con margen blanco de 2 módulos; `size` es el lado total en px lógicos.
export function drawQR(ctx, m, x, y, size) {
  const total = m.n + 4, s = size / total;
  ctx.fillStyle = '#fff'; ctx.fillRect(x, y, size, size);
  ctx.fillStyle = '#000';
  for (let r = 0; r < m.n; r++) for (let c = 0; c < m.n; c++) {
    if (m.dark(r, c)) ctx.fillRect(x + (c + 2) * s, y + (r + 2) * s, Math.ceil(s), Math.ceil(s));
  }
}
