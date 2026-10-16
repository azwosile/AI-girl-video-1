// Capture real web pages as tall PNGs for the 3D-scroll shots.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const list = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const outDir = process.argv[3];
fs.mkdirSync(outDir, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
  args: ['--lang=zh-CN', '--disable-blink-features=AutomationControlled', '--hide-scrollbars'] });
for (const it of list) {
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36');
  await page.setViewport({ width: it.w || 1280, height: 900, deviceScaleFactor: 1.5 });
  let st = 'ok';
  try {
    await page.goto(it.url, { waitUntil: 'networkidle2', timeout: 45000 });
  } catch (e) { st = 'goto:' + e.message.slice(0, 60); }
  try {
    await new Promise(r => setTimeout(r, 2500));
    if (it.hide) await page.addStyleTag({ content: it.hide + '{display:none!important}' });
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    const h = Math.min(H, it.maxh || 3600);
    await page.setViewport({ width: it.w || 1280, height: h, deviceScaleFactor: 1.5 });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: `${outDir}/${it.id}.png`, clip: { x: 0, y: 0, width: it.w || 1280, height: h } });
    const title = await page.title();
    console.log(it.id, st, H, JSON.stringify(title).slice(0, 80));
  } catch (e) { console.log(it.id, 'FAIL', e.message.slice(0, 80)); }
  await page.close();
}
await browser.close();
