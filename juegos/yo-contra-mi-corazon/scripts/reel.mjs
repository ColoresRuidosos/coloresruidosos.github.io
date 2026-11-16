// Renderiza el reel promocional (reel/spec.md): 4 variantes × 2 audios → reel/out/*.mp4 (1080×1920, 30 fps, −14 LUFS).
// Uso: npm run reel            (todas)      ·  npm run reel -- principal   (una)  ·  npm run reel -- pepe   (gancho R4)
import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
const pw = createRequire(import.meta.url)('playwright');

const VARIANTES = ['principal', 'quedan-5', 'quedan-3', 'ultimo-dia'];
const pedidas = process.argv.slice(2).filter((a) => VARIANTES.includes(a));
const GANCHO = process.argv.includes('pepe') ? 'pepe' : 'payaso';   // R4: «PEPE MADERO VS MI CORAZÓN»
const MODO = process.argv.includes('insignias') ? 'insignias' : 'normal';   // R5
const PRE = (GANCHO === 'pepe' ? 'reel-pepe' : 'reel') + (MODO === 'insignias' ? '-insignias' : '');
const OUT = 'reel/out', SONG = '../../static/games/yo-contra-mi-corazon/cancion.mp3', SONG_FROM = 56.044;
mkdirSync(OUT, { recursive: true });

const port = 5196;
const srv = spawn('node', ['scripts/serve.mjs'], { env: { ...process.env, PORT: String(port) } });
await new Promise((r) => srv.stdout.once('data', r));
const browser = await pw.chromium.launch();
try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => { throw e; });
  await page.goto(`http://localhost:${port}/reel/reel.html`);
  await page.waitForFunction(() => window.reel); await page.evaluate(() => window.reel.ready);
  for (const v of pedidas.length ? pedidas : VARIANTES) {
    await page.evaluate(([v, g, mo]) => { window.__g = g; window.__mo = mo; window.reel.setup(v, g, mo); }, [v, GANCHO, MODO]);
    const { frames, fps, beat } = await page.evaluate(() => ({ frames: window.reel.frames, fps: window.reel.fps, beat: window.reel.beat }));
    const dur = frames / fps;
    const video = `${OUT}/_${v}.mp4`;
    const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-c:v', 'png', '-r', String(fps), '-i', '-',
      '-vf', 'scale=1080:1920:flags=neighbor', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', video]);
    for (let i = 0; i < frames; i++) {
      const d = await page.evaluate((i) => window.reel.frame(i), i);
      if (!ff.stdin.write(Buffer.from(d.slice(d.indexOf(',') + 1), 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
    }
    ff.stdin.end(); await new Promise((r, j) => ff.on('close', (c) => (c ? j(new Error('ffmpeg ' + c)) : r())));
    // los eventos (para los efectos de sonido) se leen ANTES de exportar portada o historia, que reinician el reel
    const evs = await page.evaluate(() => window.reel.events());
    if (v === 'principal') {   // portada: el cartel VS con el título (tiempo 15)
      await page.evaluate((v) => window.reel.setup(v, window.__g, window.__mo), v);
      const d = await page.evaluate(() => window.reel.frame(Math.round(15 * window.reel.beat * window.reel.fps)));
      writeFileSync(`${OUT}/_portada.png`, Buffer.from(d.slice(d.indexOf(',') + 1), 'base64'));
      execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', `${OUT}/_portada.png`, '-vf', 'scale=1080:1920:flags=neighbor', `${OUT}/${GANCHO === 'pepe' ? 'portada-pepe' : 'portada'}.png`]);
    }
    if (MODO === 'insignias' && v === 'principal') {   // R5: imagen para historia
      const d = await page.evaluate(() => window.reel.story());
      writeFileSync(`${OUT}/_historia.png`, Buffer.from(d.slice(d.indexOf(',') + 1), 'base64'));
      execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', `${OUT}/_historia.png`, '-vf', 'scale=1080:1920:flags=neighbor', `${OUT}/historia-insignias.png`]);
    }
    writeFileSync(`${OUT}/_${v}.json`, JSON.stringify(evs));
    // 1) latidos + efectos (para ponerle la canción desde la biblioteca de Instagram)
    execFileSync('python3', ['-I', 'scripts/reel_audio.py', `${OUT}/_${v}.json`, `${OUT}/_${v}-latidos.wav`, String(dur), String(beat)], { stdio: 'inherit' });
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', video, '-i', `${OUT}/_${v}-latidos.wav`, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11,aformat=channel_layouts=stereo', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', `${OUT}/${PRE}-${v}-latidos.mp4`]);
    // 2) con la canción: entra en el cartel VS (tiempo 8) sobre la misma rejilla, con latidos solo en el gancho
    execFileSync('python3', ['-I', 'scripts/reel_audio.py', `${OUT}/_${v}.json`, `${OUT}/_${v}-fx.wav`, String(dur), String(beat), '--solo-gancho'], { stdio: 'inherit' });
    const songAt = 8 * beat, fadeAt = dur - 1.5;
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', video, '-ss', String(SONG_FROM), '-t', String(dur - songAt), '-i', SONG, '-i', `${OUT}/_${v}-fx.wav`,
      '-filter_complex', `[1:a]adelay=${Math.round(songAt * 1000)}|${Math.round(songAt * 1000)},afade=t=out:st=${fadeAt}:d=1.5,volume=0.9[s];[2:a]volume=0.55,aformat=channel_layouts=stereo[f];[s][f]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]`,
      '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', String(dur), `${OUT}/${PRE}-${v}-cancion.mp4`]);
    console.log(`${PRE}-${v}: ${dur.toFixed(1)} s · latidos y canción`);
  }
} finally { await browser.close(); srv.kill(); }
