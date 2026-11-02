// Exporta infografia.html a PNG 1080×1350. Uso: node exportar.js
// Requiere Playwright (Chromium). Ver plan.md.
const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const DIR = __dirname;
const SALIDA = path.join(DIR, "siloe-viene-a-mexico.png");
const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css", ".woff2": "font/woff2" };

const srv = http.createServer((req, res) => {
  const ruta = path.join(DIR, decodeURIComponent(req.url.split("?")[0]));
  if (!ruta.startsWith(DIR) || !fs.existsSync(ruta) || fs.statSync(ruta).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": TIPOS[path.extname(ruta)] || "application/octet-stream" });
  fs.createReadStream(ruta).pipe(res);
});

srv.listen(0, "127.0.0.1", async () => {
  const navegador = await chromium.launch();
  try {
    const pagina = await navegador.newPage({ viewport: { width: 1080, height: 1350 } });
    const errores = [];
    pagina.on("pageerror", (e) => errores.push(e.message));
    await pagina.goto(`http://127.0.0.1:${srv.address().port}/infografia.html`);
    await pagina.evaluate(() => window.listo);
    await pagina.evaluate(() => document.fonts.ready);
    if (errores.length) throw new Error(errores.join("\n"));
    // Nada se sale del lienzo
    const desborde = await pagina.evaluate(() => {
      const l = document.getElementById("lienzo").getBoundingClientRect();
      return [...document.querySelectorAll("#lienzo *")].filter((e) => { const r = e.getBoundingClientRect(); return r.right > l.right + 1 || r.bottom > l.bottom + 1; }).map((e) => e.className || e.tagName);
    });
    if (desborde.length) throw new Error("Se sale del lienzo: " + desborde.join(", "));
    await pagina.locator("#lienzo").screenshot({ path: SALIDA });
    console.log("Listo:", path.relative(DIR, SALIDA));
  } catch (e) {
    console.error(e.message); process.exitCode = 1;
  } finally {
    await navegador.close(); srv.close();
  }
});
