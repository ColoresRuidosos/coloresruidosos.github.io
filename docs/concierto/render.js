// Dibuja cartel.html a un tamaño en píxeles (300 dpi) y lo guarda como PNG. Lo llama generar_cartel.py.
const { chromium } = require('playwright');
const [html, ancho, alto, salida] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const p = await b.newPage({ viewport: { width: +ancho + 50, height: +alto + 50 } });
  await p.goto('file://' + html + `?w=${ancho}&h=${alto}`);
  await p.evaluate(() => window.listo);
  await (await p.$('#c')).screenshot({ path: salida });
  await b.close();
})();
