// Renderiza el tráiler de Alba (reel/spec.md): reel/out/trailer-alba-musica.mp4, -efectos.mp4 y portada-alba.png.
import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
const pw = createRequire(import.meta.url)('playwright');
const OUT = 'reel/out'; mkdirSync(OUT, { recursive: true });
const port = 5197;
const srv = spawn('node', ['scripts/serve.mjs'], { env: { ...process.env, PORT: String(port) } });
await new Promise((r) => setTimeout(r, 600));
const browser = await pw.chromium.launch();
try {
  const page = await browser.newPage();
  let err = null; page.on('pageerror', (e) => { err = e; });
  await page.goto(`http://localhost:${port}/reel/reel.html`);
  await page.waitForFunction(() => window.reel); await page.evaluate(() => window.reel.ready);
  if (err) throw err;
  await page.evaluate(() => window.reel.setup());
  const { frames, fps } = await page.evaluate(() => ({ frames: window.reel.frames, fps: window.reel.fps }));
  const dur = frames / fps, video = `${OUT}/_video.mp4`;
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-c:v', 'png', '-r', String(fps), '-i', '-',
    '-vf', 'scale=1080:1920:flags=neighbor', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', video]);
  const cover = Math.round(frames - fps * 1.0);   // portada: el cierre con todo el texto
  for (let i = 0; i < frames; i++) {
    const d = await page.evaluate((i) => window.reel.frame(i), i);
    if (err) throw err;
    const png = Buffer.from(d.slice(d.indexOf(',') + 1), 'base64');
    if (i === cover) writeFileSync(`${OUT}/_portada.png`, png);
    if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise((r, j) => ff.on('close', (c) => (c ? j(new Error('ffmpeg ' + c)) : r())));
  writeFileSync(`${OUT}/_eventos.json`, JSON.stringify(await page.evaluate(() => window.reel.events())));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', `${OUT}/_portada.png`, '-vf', 'scale=1080:1920:flags=neighbor', `${OUT}/portada-alba.png`]);
  for (const [name, flag] of [['musica', []], ['efectos', ['--solo-efectos']]]) {
    execFileSync('node', ['scripts/reel_audio.mjs', `${OUT}/_eventos.json`, `${OUT}/_${name}.wav`, String(dur), ...flag], { stdio: 'inherit' });
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', video, '-i', `${OUT}/_${name}.wav`, '-af', `loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=out:st=${dur - 1}:d=1`,
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', `${OUT}/trailer-alba-${name}.mp4`]);
  }
  console.log(`tráiler: ${dur.toFixed(1)} s · ${OUT}/trailer-alba-musica.mp4, trailer-alba-efectos.mp4 y portada-alba.png`);
} finally { await browser.close(); srv.kill(); }
