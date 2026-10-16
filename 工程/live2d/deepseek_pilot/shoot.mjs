// 用 puppeteer 打开预览页，按几组参数截图，用于目视验收
import { createRequire } from 'module';
const require = createRequire('D:/DeepSeek Harness WorkSpace/国模 江湖之间/工程/mg/package.json');
const puppeteer = require('puppeteer-core');
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({ width: 1200, height: 900 });
p.on('console', m => console.log('console:', m.text()));
await p.goto('http://127.0.0.1:8766/index.html', { waitUntil: 'networkidle0' });
await p.waitForFunction('window.L2D_READY || window.L2D_ERR', { timeout: 30000 });
console.log(await p.evaluate(() => window.L2D_ERR || document.getElementById('status').textContent));
const sets = { a_default: {}, b_tilt_blink_closed: { ParamAngleZ: 8, ParamEyeLOpen: 0, ParamEyeROpen: 0, ParamMouthOpenY: 0 }, c_sway_hair: { ParamAngleZ: -8, ParamBodySway: 1, ParamHairSwing: 1, ParamBreath: 1 } };
for (const [n, s] of Object.entries(sets)) {
  await p.evaluate(s => { document.getElementById('reset').click(); window.setParams(s); }, s);
  await new Promise(r => setTimeout(r, 600));
  await p.screenshot({ path: `shot_${n}.png` });
}
await b.close();
