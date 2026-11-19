// Dibuja las 8 páginas de una edición del fanzine (PNG a 300 dpi). Lo llama generar_fanzine.py.
const { chromium } = require('playwright');
const [html, edicion, carpeta] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const p = await b.newPage({ viewport: { width: 900, height: 1350 } });
  for (let n = 1; n <= 8; n++) {
    await p.goto(`file://${html}?ed=${edicion}&p=${n}`);
    await p.evaluate(() => window.listo);
    await (await p.$('#c')).screenshot({ path: `${carpeta}/${edicion}-p${n}.png` });
  }
  await b.close();
})();
