// Renderiza video.html a MP4 1080×1920 a 30 fps, sin audio, más una hoja de contacto.
// Uso: node render.js [--fps 30] [--salida in-memoriam-2026.mp4] [--contacto (solo la hoja de contacto)]
// Requiere Playwright (Chromium) y ffmpeg. Ver plan.md.
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const http = require("http");
const fs = require("fs");
const path = require("path");

const DIR = __dirname;
const args = process.argv.slice(2);
const opcion = (n, def) => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : def; };
const FPS = Number(opcion("fps", 30));
const SALIDA = path.resolve(DIR, opcion("salida", "in-memoriam-2026.mp4"));
const CONTACTO = path.join(DIR, "contacto.png");
const SOLO_CONTACTO = args.includes("--contacto");

// Servidor local mínimo: fetch() y las fuentes no cargan desde file://.
const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css", ".woff2": "font/woff2" };
function servir() {
  const srv = http.createServer((req, res) => {
    const ruta = path.join(DIR, decodeURIComponent(req.url.split("?")[0]));
    if (!ruta.startsWith(DIR) || !fs.existsSync(ruta) || fs.statSync(ruta).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": TIPOS[path.extname(ruta)] || "application/octet-stream" });
    fs.createReadStream(ruta).pipe(res);
  });
  return new Promise((ok) => srv.listen(0, "127.0.0.1", () => ok(srv)));
}

async function renderizar(pagina, cuadros) {
  const ffmpeg = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", SALIDA],
  { stdio: ["pipe", "inherit", "inherit"] });
  const terminado = new Promise((ok, mal) => ffmpeg.on("close", (c) => (c === 0 ? ok() : mal(new Error("ffmpeg salió con " + c)))));

  for (let f = 0; f < cuadros; f++) {
    const datos = await pagina.evaluate((t) => { window.seek(t); return document.getElementById("lienzo").toDataURL("image/png"); }, f / FPS);
    const buf = Buffer.from(datos.split(",")[1], "base64");
    if (!ffmpeg.stdin.write(buf)) await new Promise((ok) => ffmpeg.stdin.once("drain", ok));
    if (f % (FPS * 5) === 0) process.stdout.write(`  ${Math.round((100 * f) / cuadros)} %\r`);
  }
  ffmpeg.stdin.end();
  await terminado;
}

(async () => {
  const srv = await servir();
  const url = `http://127.0.0.1:${srv.address().port}/video.html?render`;
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage({ viewport: { width: 1080, height: 1920 } });
  pagina.on("pageerror", (e) => { console.error("Error en la página:", e.message); process.exit(1); });
  await pagina.goto(url);
  const duracion = await pagina.evaluate(() => window.listo);
  const cuadros = Math.round(duracion * FPS);
  console.log(`Duración ${duracion.toFixed(1)} s · ${cuadros} cuadros a ${FPS} fps`);

  if (!SOLO_CONTACTO) await renderizar(pagina, cuadros);

  // Hoja de contacto: 8 momentos clave en una cuadrícula 4×2 (plan.md, E8).
  const contacto = await pagina.evaluate((dur) => {
    const L = window.CRvideo, T = L.T, n = Math.round((dur - T.INTRO - T.CIERRE) / T.TRAMO);
    const tiempos = [2.6, T.INTRO + 1.5, T.INTRO + T.TRAMO * 1 + 1.5, T.INTRO + T.TRAMO * Math.floor(n / 2) + 1.5,
      T.INTRO + T.TRAMO * (n - 3) + 1.5, T.INTRO + T.TRAMO * (n - 1) + 1.5, dur - 3, dur - 0.05];
    const c = document.createElement("canvas"); c.width = 4 * 360; c.height = 2 * 640;
    const g = c.getContext("2d"), fuente = document.getElementById("lienzo");
    tiempos.forEach((t, i) => { window.seek(t); g.drawImage(fuente, (i % 4) * 360, Math.floor(i / 4) * 640, 360, 640); });
    return c.toDataURL("image/png");
  }, duracion);
  fs.writeFileSync(CONTACTO, Buffer.from(contacto.split(",")[1], "base64"));

  await navegador.close();
  srv.close();
  console.log(`Listo: ${path.relative(DIR, SALIDA)} y ${path.relative(DIR, CONTACTO)}`);
})().catch((e) => { console.error(e); process.exit(1); });
