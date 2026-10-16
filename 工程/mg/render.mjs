// 确定性 HTML → 视频：node render.mjs <from> <to> <out.mp4> [--audio song] [--scale 1] [--stills t1,t2]
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const [from, to] = [parseFloat(args[0]), parseFloat(args[1])];
const out = args[2];
const audio = opt('audio', null), scale = parseFloat(opt('scale', '1')), stills = opt('stills', null);
const FPS = 30, W = Math.round(1920 * scale), H = Math.round(1080 * scale);
const CHROME = process.env.MG_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
  args: ['--allow-file-access-from-files', '--hide-scrollbars', '--force-color-profile=srgb', '--disable-gpu-vsync', '--font-render-hinting=none'] });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: scale });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(pathToFileURL(path.resolve('film.html')).href, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction('window.__ready === true', { timeout: 120000 });
await page.evaluate(() => document.fonts.ready);
if (stills) {
  fs.mkdirSync(out, { recursive: true });
  for (const t of stills.split(',').map(Number)) {
    await page.evaluate((t) => window.renderAt(t), t);
    await page.screenshot({ path: path.join(out, `t${t.toFixed(2)}.jpg`), type: 'jpeg', quality: 88 });
  }
  await browser.close(); process.exit(0);
}
const n = Math.round((to - from) * FPS);
const ff = ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-'];
if (audio) ff.push('-ss', String(from), '-t', String(to - from), '-i', audio, '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000');
ff.push('-c:v', 'libx264', '-preset', 'medium', '-crf', opt('crf', '16'), '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', out);
const p = spawn('ffmpeg', ff, { stdio: ['pipe', 'inherit', 'inherit'] });
const done = new Promise((r, j) => p.on('close', (c) => (c === 0 ? r() : j(new Error('ffmpeg ' + c)))));
const t0 = Date.now();
for (let f = 0; f < n; f++) {
  const t = from + f / FPS;
  await page.evaluate((t) => window.renderAt(t), t);
  const buf = await page.screenshot({ type: 'jpeg', quality: 95, optimizeForSpeed: true });
  if (!p.stdin.write(buf)) await new Promise((r) => p.stdin.once('drain', r));
  if (f % 150 === 0) console.log(`frame ${f}/${n}  t=${t.toFixed(2)}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
p.stdin.end(); await done; await browser.close();
console.log('done', out, ((Date.now() - t0) / 1000).toFixed(0) + 's');
