// 用现有 H3 视频作底片，只渲染 HTML 动画叠层；不访问 ComfyUI 或生成模型。
import puppeteer from 'puppeteer-core';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const C = require('./a09_dense_v1.config.js');
const checkOnly = process.argv.includes('--check');
const resolve = value => path.resolve(here, value);
const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const input = resolve(C.source), music = resolve(C.music), output = resolve(C.output);
if (sha(input) !== C.sourceSha256) throw new Error('原片哈希已变化，停止，先重新检查素材。');
if (!checkOnly && fs.existsSync(output)) throw new Error('增强版已经存在，不覆盖：' + output);
const browser = await puppeteer.launch({ executablePath: process.env.MG_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--allow-file-access-from-files', '--hide-scrollbars', '--force-color-profile=srgb', '--disable-gpu', '--font-render-hinting=none'] });
let encoder;
try {
  const page = await browser.newPage();
  await page.setViewport({ width: C.width, height: C.height, deviceScaleFactor: 1 });
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  page.on('console', msg => { if (msg.type() === 'error') console.error('[browser]', msg.text()); });
  await page.goto(pathToFileURL(resolve('a09_dense_v1.html')).href + (checkOnly ? '?still=1' : '?overlay=1'), { waitUntil: 'load', timeout: 45000 });
  await page.waitForFunction('window.__ready === true || !!window.__error', { timeout: 45000 });
  const info = await page.evaluate(() => ({ ready: window.__ready, error: window.__error, libraries: window.__libraries, effects: window.__effectStats, lottiePaths: document.querySelectorAll('#lottie-lines svg path').length }));
  if (info.error || pageErrors.length) throw new Error(JSON.stringify({ info, pageErrors }));
  if (!info.lottiePaths) throw new Error('Lottie 没有绘制路径。');
  console.log('SCENE_READY ' + JSON.stringify(info));
  if (checkOnly) {
    await page.evaluate(t => window.renderAt(t), 2.55);
    const poster = resolve(C.checkPoster); fs.mkdirSync(path.dirname(poster), { recursive: true });
    await page.screenshot({ path: poster, type: 'jpeg', quality: 91 });
    console.log('CHECK_POSTER ' + poster);
  } else {
    const count = Math.round(C.duration * C.fps);
    const temp = output.replace(/\.mp4$/i, '.partial.mp4');
    if (fs.existsSync(temp)) throw new Error('存在未完成的本次临时文件，先核查，不自动覆盖：' + temp);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    const filter = `[0:v]scale=${C.width}:${C.height}:force_original_aspect_ratio=increase:flags=lanczos,crop=${C.width}:${C.height},fps=${C.fps},trim=duration=${C.duration},setpts=PTS-STARTPTS[base];[1:v]format=rgba,setpts=PTS-STARTPTS[fx];[base][fx]overlay=0:0:format=auto:shortest=1,format=yuv420p[v]`;
    const args = ['-hide_banner', '-loglevel', 'warning', '-nostdin', '-n', '-i', input, '-f', 'image2pipe', '-framerate', String(C.fps), '-i', 'pipe:0', '-ss', String(C.musicStart), '-t', String(C.duration), '-i', music, '-filter_complex', filter, '-map', '[v]', '-map', '2:a:0', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(C.fps), '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-t', String(C.duration), '-movflags', '+faststart', temp];
    encoder = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
    let encoderError;
    encoder.stdin.on('error', error => { encoderError = error; });
    const finished = new Promise((resolve, reject) => { encoder.on('error', reject); encoder.on('close', code => code === 0 ? resolve() : reject(new Error('ffmpeg 退出码 ' + code))); });
    const began = Date.now();
    for (let f = 0; f < count; f++) {
      await page.evaluate(t => window.renderAt(t), f / C.fps);
      const png = await page.screenshot({ type: 'png', omitBackground: true });
      if (encoderError) throw encoderError;
      if (!encoder.stdin.write(png)) await once(encoder.stdin, 'drain');
      if (f % 15 === 0) console.log('FRAME ' + f + '/' + count + ' ' + ((Date.now() - began) / 1000).toFixed(1) + 's');
    }
    encoder.stdin.end(); await finished;
    const probed = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate', '-of', 'json', temp], { encoding: 'utf8' });
    if (probed.status !== 0) throw new Error('ffprobe 失败：' + probed.stderr);
    const metadata = JSON.parse(probed.stdout);
    const v = metadata.streams.find(stream => stream.codec_type === 'video');
    const a = metadata.streams.find(stream => stream.codec_type === 'audio');
    if (v?.width !== C.width || v?.height !== C.height || v?.r_frame_rate !== C.fps + '/1' || !a || Math.abs(Number(metadata.format.duration) - C.duration) > .08) throw new Error('输出规格检查失败：' + probed.stdout);
    if (sha(input) !== C.sourceSha256) throw new Error('检测到原片变化，不把本次结果标记为完成。');
    fs.renameSync(temp, output);
    const record = { mode: 'post-production-only', regeneratedSource: false, containsExistingAIFootage: true, source: input, sourceSha256: C.sourceSha256, output, outputSha256: sha(output), music, musicStart: C.musicStart, lyric: C.lyric, libraries: info.libraries, effects: info.effects, renderSeconds: (Date.now() - began) / 1000, metadata };
    fs.writeFileSync(output.replace(/\.mp4$/i, '.json'), JSON.stringify(record, null, 2), 'utf8');
    console.log('OUTPUT_VERIFIED ' + JSON.stringify(record));
  }
} finally {
  if (encoder && !encoder.killed && encoder.exitCode === null) encoder.stdin.end();
  await browser.close();
}
