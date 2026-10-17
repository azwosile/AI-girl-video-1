// 国模·江湖之间 —— 非 AI 镜头编排（时间均为歌曲绝对时间，秒）
'use strict';
const SH = (n) => `assets/shots/${n}.jpg`;
const PRE = new Set();
function pre(u) { if (PRE.has(u)) return; PRE.add(u); const i = el('img', '', null, document.body); i.src = u; i.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;left:-10px'; }
const BAOZI = `<svg viewBox="0 0 120 100" width="W" height="H"><ellipse cx="60" cy="88" rx="50" ry="9" fill="rgba(0,0,0,.12)"/><path d="M12 70 Q14 28 60 22 Q106 28 108 70 Q108 86 60 86 Q12 86 12 70Z" fill="#fbf4e4" stroke="#e2d2b0" stroke-width="2"/><g stroke="#d9c49a" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M60 26 Q52 34 40 34"/><path d="M60 26 Q56 38 46 44"/><path d="M60 26 Q62 38 72 44"/><path d="M60 26 Q68 34 80 34"/><path d="M60 26 Q60 36 60 46"/></g><circle cx="60" cy="25" r="4" fill="#e9dcc0"/></svg>`;
const baozi = (w) => BAOZI.replace('W', w).replace('H', Math.round(w * 0.83));
const NAILONG = `<svg viewBox="0 0 200 200" width="260" height="260"><ellipse cx="100" cy="186" rx="70" ry="10" fill="rgba(0,0,0,.25)"/><path d="M40 120 Q30 40 100 36 Q170 40 160 120 Q166 180 100 182 Q34 180 40 120Z" fill="#ffd93b" stroke="#2b2100" stroke-width="5"/><ellipse cx="100" cy="140" rx="38" ry="30" fill="#fff3b0"/><circle cx="78" cy="92" r="9" fill="#2b2100"/><circle cx="124" cy="92" r="9" fill="#2b2100"/><circle cx="81" cy="89" r="3" fill="#fff"/><circle cx="127" cy="89" r="3" fill="#fff"/><path d="M84 112 Q101 126 118 112" stroke="#2b2100" stroke-width="5" fill="#ff7a7a"/><ellipse cx="64" cy="110" rx="9" ry="6" fill="#ffb3a7"/><ellipse cx="138" cy="110" rx="9" ry="6" fill="#ffb3a7"/><path d="M84 40 L92 22 L100 38 L108 20 L116 40" fill="#ffb000" stroke="#2b2100" stroke-width="4"/></svg>`;

// ================= 歌词 =================
lyric('提笔写苍苍蒹葭', [0.05, 0.54, 0.86, 1.24, 1.54, 1.92, 2.32], 5.25);
lyric('前路有漫漫黄沙', [5.70, 6.08, 6.60, 6.90, 7.26, 7.60, 8.06], 10.85);
lyric('几句情话谁人应答', [11.24, 12.06, 12.70, 13.28, 13.68, 14.18, 14.68, 14.98], 16.35);
lyric('深情不过那一刹那', [16.94, 17.24, 17.54, 18.02, 18.24, 18.76, 19.16, 19.52], 22.35);
lyric('以长剑河滩作画', [22.98, 23.38, 23.68, 24.04, 24.44, 24.72, 25.22], 27.75);
lyric('以明月写尽无暇', [28.28, 29.16, 29.36, 29.76, 30.12, 30.50, 31.08], 32.20);
lyric('年岁漫漫不过一刹', [32.74, 33.62, 34.12, 34.90, 35.72, 36.68, 37.02, 37.86], 38.05);
lyric('儿女情长仿若昙花', [38.58, 40.18, 40.46, 40.82, 41.16, 41.52, 41.94, 42.46], 43.00, { gray: 40.2 });
lyric('逃不过相忘江湖之间', [43.90, 44.82, 45.10, 45.36, 45.86, 46.20, 46.52, 46.86, 47.12], 47.40);
lyric('忘不了惊鸿一眼', [47.58, 48.32, 48.53, 48.74, 49.38, 49.58, 49.78], 50.25);
lyric('独自卷帘望寒星几点', [50.40, 51.22, 51.42, 51.70, 52.06, 52.60, 52.84, 53.16, 53.62], 55.20);
lyric('躲不了岁月催老少年', [55.38, 56.14, 56.44, 56.74, 57.24, 57.62, 57.98, 58.24, 58.50], 58.85);
lyric('寻不到爱恨缠绵', [58.96, 59.70, 59.91, 60.12, 60.84, 61.16, 61.42], 61.66);
lyric('既然无缘寻一场好眠', [61.72, 62.72, 62.90, 63.30, 63.66, 63.98, 64.38, 64.62, 65.08], 66.75);
lyric('逃不过相忘江湖之间', [66.94, 67.70, 68.00, 68.22, 68.70, 69.08, 69.40, 69.74, 69.96], 70.20);

// ================= 背景分段 =================
BG.push(
  { t0: 0, t1: 5.6, c1: 'rgba(60,110,190,.55)', c2: '#0a1424', c3: 'rgba(30,60,120,.4)', grid: .35, mist: .35 },
  { t0: 5.6, t1: 11.2, c1: 'rgba(77,107,254,.55)', c2: '#0b1430', c3: 'rgba(200,120,60,.25)', grid: .25, mist: .4 },
  { t0: 11.2, t1: 16.9, c1: 'rgba(120,80,240,.55)', c2: '#140d2c', c3: 'rgba(80,50,200,.35)', grid: .2, mist: .4 },
  { t0: 16.9, t1: 22.9, c1: 'rgba(40,170,160,.45)', c2: '#06181c', c3: 'rgba(30,90,200,.3)', grid: .4, mist: .3 },
  { t0: 22.9, t1: 28.3, c1: 'rgba(70,90,200,.45)', c2: '#0a0f22', c3: 'rgba(220,120,70,.3)', grid: .15, mist: .45 },
  { t0: 28.3, t1: 32.7, c1: 'rgba(150,200,255,.45)', c2: '#0b1626', c3: 'rgba(90,160,230,.3)', grid: .1, mist: .7 },
  { t0: 32.7, t1: 38.6, c1: 'rgba(230,170,90,.35)', c2: '#17110b', c3: 'rgba(120,80,40,.35)', grid: 0, mist: .5 },
  { t0: 38.6, t1: 43.9, c1: 'rgba(150,150,160,.25)', c2: '#0c0d10', c3: 'rgba(60,60,70,.3)', grid: 0, mist: .55 },
  { t0: 43.9, t1: 47.5, c1: 'rgba(110,125,150,.30)', c2: '#0b0e14', c3: 'rgba(60,70,90,.3)', grid: .12, mist: .6 },
  { t0: 47.5, t1: 50.4, c1: 'rgba(77,107,254,.45)', c2: '#0b1226', c3: 'rgba(160,110,60,.25)', grid: .1, mist: .4 },
  { t0: 50.4, t1: 55.4, c1: 'rgba(70,80,140,.35)', c2: '#070a16', c3: 'rgba(40,50,100,.35)', grid: 0, mist: .45 },
  { t0: 55.4, t1: 59.0, c1: 'rgba(200,50,50,.32)', c2: '#140708', c3: 'rgba(90,20,30,.35)', grid: .25, mist: .3 },
  { t0: 59.0, t1: 61.7, c1: 'rgba(90,100,130,.3)', c2: '#0b0d13', c3: 'rgba(50,60,90,.3)', grid: .1, mist: .5 },
  { t0: 61.7, t1: 66.9, c1: 'rgba(255,200,60,.35)', c2: '#1a1408', c3: 'rgba(255,120,60,.25)', grid: 0, mist: .25 },
  { t0: 66.9, t1: 99, c1: 'rgba(255,190,110,.42)', c2: '#0d1424', c3: 'rgba(90,150,255,.35)', grid: .15, mist: .5 },
);
// 起幅不留黑：0.0 起直接有画面
// —— 特效去重（按修订文稿 §五）：全屏白闪 33 → 5，只留 R1 首爆 / 档案墙转群像 / 旧 Flash 回彩 / 最终盖章 / 章节转暖；
//    震屏 25 → 4，只留 R1 登场 / 群像揭示 / 回彩冲击 / 豆包盖章。其余拍点改为各镜自己的局部强调（见 fx.js 与各镜 hits/kicks/wipe/glint）。
FLASH.push([5.58, 0.42, '#fff', 1], [37.02, 0.35, '#fff3d6', 1], [47.58, 0.3, '#fff', .9], [65.08, 0.22, '#fff', .55], [66.94, 0.45, '#ffe2b0', .45]);
SHAKE.push([5.6, 14, .35], [37.02, 10, .35], [47.58, 14, .35], [65.08, 26, .5]);
// 镜头切换改用边缘漏光（颜色 / 方向各镜不同），不再整屏白
LEAK.push([11.2, .42, 'rgba(185,164,255,.9)', 'r', .45], [16.9, .42, 'rgba(95,242,214,.85)', 'b', .4], [22.9, .4, 'rgba(120,170,255,.85)', 'l', .35],
  [23.66, .32, 'rgba(207,227,255,.95)', 'tr', .4], [28.28, .45, 'rgba(168,228,255,.9)', 't', .4], [32.72, .4, 'rgba(255,236,200,.9)', 'l', .35],
  [50.4, .5, 'rgba(159,180,255,.85)', 't', .35], [55.38, .36, 'rgba(255,48,48,.9)', 'l', .4], [61.7, .45, 'rgba(255,240,190,.9)', 'tl', .4], [69.96, .5, 'rgba(255,210,138,.9)', 'b', .3]);
// 全场慢推只留开场 / 档案拉远 / 盖章顶一下 / 第三幕悬念；中段改为横向量尺、纵向排行、静止对照、胶片滑轨、目录流向、日历停机
ZOOM.push([0, 1], [5.55, 1.05, 'lin'], [5.6, 1, 'step'], [10.0, 1], [11.15, .975, 'io'], [11.2, 1, 'step'],
  [32.7, 1], [37.0, 1.03, 'lin'], [37.02, 1.08, 'step'], [43.8, 1.0, 'lin'],
  [65.08, 1], [65.32, 1.035, 'out5'], [66.85, 1.035], [66.9, 1, 'step'], [70.4, 1.03, 'lin']);
PANX.push([0, 0], [11.2, 0, 'step'], [16.85, -36, 'lin'], [16.9, 0, 'step'],   // S03 横向量尺
  [28.3, 0], [32.65, -48, 'lin'], [32.7, 0, 'step'],                         // S06 胶片滑轨
  [47.5, 0], [50.35, -30, 'lin'], [50.4, 0, 'step']);                        // S10 追赶方向
PANY.push([0, 0], [16.9, 0], [16.95, 22, 'step'], [22.85, -22, 'lin'], [22.9, 0, 'step'], // S04 纵向晋位
  [55.4, 0], [58.95, -18, 'lin'], [59.0, 0, 'step']);                        // S12 目录流向

// ================= 墨玻璃范围（glass.js 读取） =================
// 只作用于时间窗内出现的深色信息容器（数据卡 / 面板 / 通知 / 404 卡 / 浏览器标题栏）；新闻、网页截图保持不透明。
// 不进范围：S03/S04 大字快切、S12 终端（要冷、要实，glass.js 也永不给 .term 上玻璃）。?glass=0 可渲染无玻璃对照版。
const GLASS_SCOPE = [
  { t0: 8.6, t1: 10.1, note: 'S02 R1 vs o1 对比面板' },
  { t0: 22.9, t1: 28.3, note: 'S05 Kimi K3 参数卡' },
  { t0: 38.6, t1: 43.9, note: 'S08 昙花 · 404（第二幕起自动雾化变灰）' },
  { t0: 59.0, t1: 61.7, note: 'S13 Kimi 等待（雾玻璃）' },
  { t0: 66.9, t1: 70.4, note: 'S15 传闻卡' },
  { t0: 70.4, t1: 90.7, note: 'S16–S21 结尾慢段（S16 1017 卡 + 液态玻璃放大镜）' },
];

const BLUE_GLOW = 'drop-shadow(0 0 26px rgba(120,190,255,.55))';
const GOLD_GLOW = 'drop-shadow(0 0 28px rgba(255,200,120,.5))';

// ================= 01 · 2025 前夜：GPT 娘独亮 0–5.6 =================
(() => {
  const T0 = 0, T1 = 5.6;
  Char('gpt', { h: 1000, item: { t0: T0, t1: T1, z: 5, glow: BLUE_GLOW, base: { x: 560, y: 590 }, keys: K(A.blurIn(0, .5, 20), { s: [[0, 1.08], [5.6, 1.0, 'out']], br: [[4.9, 1], [5.2, .55, 'out']] }) } });
  // 榜单面板
  const p = Box(`<div class="ptitle">LLM 榜 · 2025.01</div>
    <div class="row r1"><span class="rk">01</span>OpenAI o1<span class="rv">闭源</span></div>
    <div class="row r2"><span class="rk">02</span>Claude 3.5 Sonnet<span class="rv">闭源</span></div>
    <div class="row r3"><span class="rk">03</span>Gemini 2.0<span class="rv">闭源</span></div>
    <div class="row r4" style="color:#8ea2ff"><span class="rk">??</span>DeepSeek-R1<span class="rv">开源</span></div>`, 'panel', { t0: .4, t1: T1, z: 6, base: { x: 1390, y: 380 }, keys: K(A.from(.4, .4, 'ry', -50, -14), A.fadeIn(.4, .2), A.from(.4, .5, 'x', 1600, 1390)) });
  p.el.style.width = '560px';
  const rows = [...p.el.querySelectorAll('.row')];
  p.upd = (t) => rows.forEach((r, i) => { const ti = i < 3 ? .6 + i * .3 : 4.4; const k = EASE.out(clamp((t - ti) / .3)); r.style.opacity = k; r.style.transform = `translateX(${(1 - k) * 60}px)`; if (i === 3) r.style.textShadow = t > 4.4 ? `0 0 ${12 + 10 * Math.sin(t * 20)}px #4d6bfe` : ''; });
  Stat({ label: 'AIME 2024 · o1', count: [0, 79.2, 1.24, .8], dec: 1, color: '#9fd0ff', item: { t0: 1.24, t1: T1, z: 7, base: { x: 1200, y: 740 }, keys: A.settle(1.24) } });
  Stat({ label: 'o1 输出价格', count: [0, 60, 1.54, .8], fmt: (v) => '$' + v.toFixed(0), unit: '/M tokens', color: '#ffd27a', item: { t0: 1.54, t1: T1, z: 7, base: { x: 1560, y: 740 }, keys: A.settle(1.54) } });
  // 日期翻牌
  const d = Box('<span class="dd"></span>', 'stamp tag', { t0: .05, t1: T1, z: 8, base: { x: 960, y: 92 }, keys: A.pop(.05) });
  d.el.style.fontSize = '40px';
  const dd = d.el.querySelector('.dd');
  d.upd = (t) => { const nx = t >= 4.2; dd.textContent = nx ? '2025 · 01 · 20' : '2025 · 01 · 19'; d.el.style.setProperty('--c', nx ? '#4d6bfe' : '#888'); const k = clamp(Math.abs(t - 4.2) / .12); d.el.style.transform += ` scaleY(${t > 4.08 && t < 4.32 ? k : 1})`; };
  const r1t = Toast({ title: 'DeepSeek-R1 Release', sub: 'api-docs.deepseek.com · 2025/01/20', icon: '🐋', color: '#4d6bfe', item: { t0: 4.4, t1: T1, z: 9, base: { x: 1560, y: 190 }, keys: K(A.from(4.4, .35, 'x', 2200, 1560, 'back'), { s: [[5.0, 1], [5.4, 1.15]] }) } });
  r1t.kicks = [[4.62, 10, .3, 180]]; r1t.hits = [[4.4, .5, .8, 'rgba(77,107,254,.9)']]; // 通知挤入：只让通知自己有惯性，不再整屏震
})();

// ================= 02 · R1：把「思考」摆上台面 5.6–11.2 =================
(() => {
  const T0 = 5.6, T1 = 11.2;
  Browser({ img: SH('ds_r1_news'), url: 'api-docs.deepseek.com/news/news250120', w: 880, vh: 600,
    scroll: [[6.3, 0], [7.2, 0], [8.5, 1720, 'io']],
    item: { t0: T0, t1: 10.1, z: 4, base: { x: 700, y: 460 }, keys: K({ ry: [[5.6, 42], [6.3, 12], [6.6, 12], [7.0, 24, 'io']], rx: [[5.6, 10], [6.3, 4]], s: [[5.6, .7], [6.3, 1, 'back'], [6.6, 1], [7.0, .8, 'io']], x: [[6.6, 700], [7.0, 470, 'io']], o: [[9.8, 1], [10.1, 0, 'lin']] }, A.fadeIn(5.6, .12)) } });
  Char('ds', { h: 930, item: { t0: 6.0, t1: T1, z: 3, glow: BLUE_GLOW, base: { x: 1620, y: 600 }, keys: K(A.from(6.08, .5, 'x', 2200, 1620, 'out5'), { br: [[9.95, 1], [10.1, .6]] }) } });
  // DeepSeek 对话：深度思考（R1）——思维链全程可见
  const TH = '嗯，用户问 9.11 和 9.9 哪个大。先把小数位对齐：9.11 和 9.90。比较十分位：1 < 9……';
  const chat = Box(`<div class="ch">🐋 DeepSeek<span class="pill on" style="margin-left:auto;font-size:19px;padding:6px 14px;box-shadow:0 0 0 2px #4d6bfe">◎ 深度思考 (R1)</span></div><div class="cb">
      <div class="bub me" style="align-self:flex-end">9.11 和 9.9 哪个大？</div>
      <div class="think"><div class="th">✦ 已深度思考（用时 8 秒）</div><div class="tt2"></div><div class="aha">Wait, wait. That's an aha moment.</div></div>
      <div class="ans">9.9 更大。</div></div>`, 'dschat', { t0: 6.6, t1: 8.75, z: 8, base: { x: 1160, y: 500, rz: 1 }, keys: K(A.from(6.6, .35, 'y', 1400, 500, 'back'), A.whipOut(8.6)) });
  const tt2 = chat.el.querySelector('.tt2'), aha = chat.el.querySelector('.aha'), ans = chat.el.querySelector('.ans');
  chat.upd = (t) => { tt2.textContent = TH.slice(0, Math.floor(clamp((t - 6.95) / 1.0) * TH.length)); aha.style.opacity = t > 7.9 ? 1 : 0; ans.style.opacity = t > 8.2 ? 1 : 0; };
  News({ src: 'CNBC', color: '#005594', date: '2025-01-27', title: 'Nvidia sheds almost $600 billion in market cap, biggest drop ever', fs: 30, w: 560, tag: '史上最大单日跌幅',
    item: { t0: 7.26, t1: 8.8, z: 9, base: { x: 420, y: 200, rz: -2 }, keys: K(A.stick(7.26, -7, -2), A.whipOut(8.6)) } });
  News({ src: 'arXiv 2501.12948', color: '#b31b1b', date: 'DeepSeek-R1 论文', title: 'R1-Zero：纯强化学习，长思维链自发涌现', sub: '“aha moment” —— 模型学会停下来、回头检查自己', fs: 32, w: 600,
    item: { t0: 7.6, t1: 8.8, z: 10, base: { x: 440, y: 800, rz: 1.5 }, keys: K(A.stick(7.6, 6, 1.5), A.whipOut(8.6)) } });
  // R1 vs o1：思维链 隐藏 vs 公开 + 跑分 + 价格
  const cmp = Box(`<div class="ptitle">DeepSeek-R1 vs OpenAI o1</div>
    <div class="row" style="font-size:30px;font-weight:900;margin:6px 0 10px"><span style="width:180px;opacity:.7;font-size:22px">思维链</span><span style="color:#9aa3b5;width:200px">o1：隐藏 🔒</span><span style="color:#8ea2ff;text-shadow:0 0 18px #4d6bfe">R1：全程公开 ✓</span></div>
    <div class="lbl" style="opacity:.7">AIME 2024 (Pass@1)</div>
    <div class="row"><span style="width:110px;color:#8ea2ff">R1</span><div class="bar b1" style="background:#4d6bfe"></div><span class="rv v1"></span></div>
    <div class="row"><span style="width:110px">o1</span><div class="bar b2" style="background:#9aa3b5"></div><span class="rv v2"></span></div>
    <div class="lbl" style="opacity:.7;margin-top:12px">输出价格（$/百万 tokens）</div>
    <div class="row"><span style="width:110px;color:#8ea2ff">R1</span><div class="bar b3" style="background:#4d6bfe"></div><span class="rv v3"></span></div>
    <div class="row"><span style="width:110px">o1</span><div class="bar b4" style="background:#e9a23b"></div><span class="rv v4"></span></div>`, 'panel', { t0: 8.6, t1: 10.05, z: 9, base: { x: 1080, y: 470 }, keys: K(A.from(8.6, .35, 'ry', -60, -10), A.fadeIn(8.6, .15), A.from(8.6, .35, 'x', 1500, 1080), A.whipOut(9.9, 0, .15)) });
  cmp.el.style.width = '720px';
  const bs = ['.b1', '.b2', '.b3', '.b4'].map((s) => cmp.el.querySelector(s)), vs = ['.v1', '.v2', '.v3', '.v4'].map((s) => cmp.el.querySelector(s));
  const vals = [[79.8, 79.8 / 80 * 440, 8.75], [79.2, 79.2 / 80 * 440, 8.85], [2.19, 2.19 / 60 * 440 + 6, 9.2], [60, 440, 9.3]];
  cmp.upd = (t) => vals.forEach(([v, w, ts], i) => { const k = EASE.out5(clamp((t - ts) / .45)); bs[i].style.width = (w * k).toFixed(1) + 'px'; vs[i].textContent = (i > 1 ? '$' : '') + (v * k).toFixed(i === 3 ? 0 : (i > 1 ? 2 : 1)); });
  // 10.0：「深度思考」按钮遍地开花 —— 思维链成了标配
  const P = [['ds', '深度思考 (R1)', 960, 300, 0], ['qwen', '深度思考', 520, 200, .1], ['kimi', '长思考', 1420, 190, .16], ['doubao', '深度思考', 380, 470, .22], ['glm', '思考模式', 1560, 450, .28],
    ['gpt', 'Thinking', 560, 700, .34], ['claude', 'Extended thinking', 1380, 700, .4], ['gemini', 'Thinking', 960, 840, .46]];
  P.forEach(([n, txt, x, y, d], i) => Box(`<img src="assets/chars/${n}.png"><span>${txt}</span><span class="sw"></span>`, 'pill' + (i === 0 ? ' on' : ''), { t0: 10.0 + d, t1: T1, z: 20 + i, base: { x, y, rz: (rnd(i, 41) - .5) * 8 }, keys: K(A.pop(10.0 + d, .25, .3), { s: [[10.6, 1], [11.2, 1.05, 'lin']] }) }).hits = i === 0 ? [[10.0, .45, 1, 'rgba(77,107,254,1)']] : null); // 扩散起点只亮 R1 按钮本身
  Stamp({ text: '思考，被看见了', cls: 'hanazi', fs: 110, color: '#ffffff', item: { t0: 10.4, t1: T1, z: 40, base: { x: 960, y: 560, rz: -4 }, keys: A.settle(10.4, .55, .9) } }); // 随按钮汇聚落定，不再巨字砸入
  Ticker({ text: 'DeepSeek-R1　·　2025-01-20 MIT 开源　·　思维链（CoT）全程可见　·　App「深度思考」按钮从此成为标配　·　NVDA 单日 −$589B　·　API 输出 $2.19 / 百万 tokens', item: { t0: 7.26, t1: T1, z: 70, keys: A.from(7.26, .3, 'y', 1110, 1050) } });
})();

// ================= 03 · Qwen3.8-27B：一张家用显卡就能跑 11.2–16.9 =================
(() => {
  const T0 = 11.2, T1 = 16.9;
  Browser({ img: SH('qwen27_aihub'), url: 'aihub.cn/news/qwen3-8-open-source', w: 860, vh: 600, scroll: [[11.7, 40], [12.6, 160]],
    item: { t0: T0, t1: T1, z: 4, base: { x: 680, y: 430 }, keys: K({ x: [[11.2, -300], [11.7, 680, 'out5'], [12.06, 680], [12.5, 420, 'io']], ry: [[11.2, 50], [11.7, 14], [12.06, 14], [12.5, 26]], s: [[12.06, 1], [12.5, .78]], o: [[12.06, 1], [12.5, .8]] }) } });
  Browser({ img: SH('qwen27_hf'), url: 'huggingface.co/Qwen/Qwen3.8-27B', w: 860, vh: 600, dark: true, scroll: [[12.4, 0], [14.0, 1000, 'io'], [16.9, 1250, 'lin']],
    item: { t0: 12.06, t1: T1, z: 5, base: { x: 860, y: 470 }, keys: K({ ry: [[12.06, -50], [12.5, -10], [16.9, -4, 'lin']], x: [[12.06, 1400], [12.5, 860, 'out5']] }, A.fadeIn(12.06, .12)) } });
  Char('qwen', { h: 930, item: { t0: 11.24, t1: T1, z: 7, glow: 'drop-shadow(0 0 26px rgba(170,140,255,.6))', base: { x: 1580, y: 600 }, keys: A.from(11.24, .55, 'y', 1400, 600, 'out5') } });
  News({ src: 'AIHub', color: '#5b3fd6', date: '2026-08-14', title: 'Qwen3.8 正式开源：27B 原生多模态，消费级显卡可部署', sub: '综合能力超过 Qwen3.7-Plus · Apache 2.0', fs: 34, w: 620,
    item: { t0: 12.7, t1: 14.1, z: 9, base: { x: 1240, y: 200, rz: -2 }, keys: K(A.stick(12.7, 4, -2), A.whipOut(13.95)) } });
  // 显存：BF16 54GB → 4-bit ≈17GB，塞进 24GB 家用卡
  const g = Box(`<div class="ptitle">Qwen3.8-27B · 显存占用</div>
    <div class="row"><span style="width:150px;opacity:.75">BF16 原版</span><div class="bar g1" style="background:#6b7080"></div><span class="rv">54 GB</span></div>
    <div class="row"><span style="width:150px;color:#b9a4ff">4-bit 量化</span><div class="bar g2" style="background:#7c5cff;box-shadow:0 0 20px #7c5cff"></div><span class="rv" style="color:#b9a4ff">≈17 GB</span></div>
    <div class="row" style="margin-top:20px;font-size:26px"><span class="gp" style="padding:8px 16px;border-radius:10px;background:#1e2a1e;color:#7ee787;border:2px solid #7ee787">🖥 RTX 4090 24GB ✓</span><span class="gp2" style="padding:8px 16px;border-radius:10px;background:#1e2a1e;color:#7ee787;border:2px solid #7ee787;font-size:20px">16GB 卡 · Q3 可全 GPU</span></div>
    <div class="lbl" style="opacity:.7;margin-top:16px;font-size:21px">27B 稠密 · 原生多模态 · 262K 上下文 · Apache 2.0</div>`, 'panel gpu', { t0: 13.28, t1: T1, z: 10, base: { x: 660, y: 560 }, keys: K(A.settle(13.28, .4), { x: [[16.3, 660], [16.9, 520]], o: [[16.5, 1], [16.9, 0, 'lin']] }) });
  g.kicks = [[14.18, 9, .32, 90]]; // 容量框扣合：面板自己向下一顿
  g.el.style.width = '640px';
  const g1 = g.el.querySelector('.g1'), g2 = g.el.querySelector('.g2'), gp = g.el.querySelector('.gp'), gp2 = g.el.querySelector('.gp2');
  g.upd = (t) => { g1.style.width = (EASE.out5(clamp((t - 13.5) / .5)) * 330) + 'px'; g2.style.width = (t < 13.68 ? 0 : lerp(330, 104, EASE.io(clamp((t - 13.78) / .42)))) + 'px'; /* 量化：从原版长度压缩下来，而不是再从零生长 */ gp.style.transform = `scale(${t < 14.18 ? 0 : EASE.back(clamp((t - 14.18) / .3))})`; gp2.style.opacity = t > 14.68 ? 1 : 0; };
  Stamp({ text: '家用显卡就能跑', cls: 'hanazi', fs: 112, item: { t0: 14.18, t1: T1, z: 12, base: { x: 1280, y: 330, rz: -7 }, keys: A.lift(14.22) } }); // 由硬件框“带出”，不从 2.4 倍砸入
  Box('还挺能打：社区实测 Coding / Agent 不输闭源旗舰', 'stamp tag', { t0: 14.68, t1: T1, z: 12, base: { x: 1280, y: 450 }, keys: A.tagFlip(14.68) }).el.style.cssText += ';--c:#7c5cff;font-size:24px';
  Avatar('gpt', { d: 150, color: '#9fd0ff', item: { t0: 14.98, t1: T1, z: 13, base: { x: 1790, y: 190 }, keys: K(A.pop(14.98), { rz: [[14.98, -20], [15.4, 8, 'back']] }) } });
  Box('?!', 'stamp hanazi', { t0: 15.2, t1: T1, z: 14, base: { x: 1700, y: 120 }, keys: A.pop(15.2) }).el.style.fontSize = '64px';
  Ticker({ text: 'Qwen3.8-27B　·　2026-08-14 开源　·　270 亿参数稠密 · 原生多模态　·　4-bit 量化约 17GB，24GB 消费级显卡可跑　·　综合能力超过 Qwen3.7-Plus　·　Apache 2.0', cls: 'purple', item: { t0: 12.7, t1: T1, z: 70, keys: A.from(12.7, .3, 'y', 1110, 1050) } });
})();

// ================= 04 · GLM-5.3 开源 No.1 16.9–22.9 =================
(() => {
  const T0 = 16.9, T1 = 22.9;
  Browser({ img: SH('glm_baike'), url: 'baike.baidu.com/item/GLM-5.3', w: 760, vh: 560, scroll: [[17.6, 0], [19.5, 1300, 'io'], [22.9, 1600, 'lin']],
    item: { t0: 17.54, t1: T1, z: 3, base: { x: 1180, y: 400, s: .92, o: .9 }, keys: K({ ry: [[17.54, -60], [18.0, -22], [22.9, -16, 'lin']], x: [[17.54, 1700], [18.0, 1180, 'out5']] }, A.fadeIn(17.54, .15)) } });
  Browser({ img: SH('glm_sohu'), url: 'sohu.com/a/1063090469_121956422', w: 860, vh: 600, scroll: [[17.5, 0], [18.9, 820, 'io'], [22.9, 1000, 'lin']],
    item: { t0: T0, t1: T1, z: 5, base: { x: 680, y: 460 }, keys: K({ rx: [[16.9, 40], [17.4, 6], [22.9, 2, 'lin']], y: [[16.9, 1200], [17.4, 460, 'out5']], ry: [[16.9, 10], [22.9, 14, 'lin']] }) } });
  Char('glm', { h: 900, item: { t0: 17.24, t1: T1, z: 7, glow: 'drop-shadow(0 0 26px rgba(80,220,200,.5))', base: { x: 1600, y: 610 }, keys: A.from(17.24, .5, 'x', 2200, 1600, 'out5') } });
  News({ src: '智谱 Z.ai', color: '#2a4dff', date: '2026-08-14', title: 'GLM-5.3 发布：编程能力飞跃，开源模型新标杆', sub: 'TerminalBench 3.0 · Agents’ Last Exam (CLI) 均位列开源第一', fs: 34, w: 640,
    item: { t0: 18.02, t1: 20.1, z: 9, base: { x: 560, y: 190, rz: -2 }, keys: K(A.stick(18.02, -6, -2), A.whipOut(19.9)) } });
  Stat({ label: '真实世界漏洞发现', count: [0, 2436, 18.76, 1], fmt: (v) => Math.round(v).toLocaleString('en-US'), unit: '个', foot: '网络安全能力“涌现”', color: '#5ff2d6', item: { t0: 18.76, t1: T1, z: 10, base: { x: 330, y: 670 }, keys: A.fadeIn(18.76, .12) } }).wipe = [18.76, .45, 'r']; // 扫描显现，不再轮番弹跳
  Stat({ label: '代码生成效率', value: '+50%', foot: '对比 GLM-5.2（内部评测）', color: '#ffd27a', item: { t0: 19.16, t1: T1, z: 10, base: { x: 330, y: 505 }, keys: A.fadeIn(19.16, .12) } }).wipe = [19.16, .4, 'r'];
  const no1 = Stamp({ text: '开源 No.1', cls: 'hanazi', fs: 140, color: '#ffd400', item: { t0: 19.52, t1: T1, z: 12, base: { x: 1060, y: 400, rz: -6 }, keys: A.unfold(19.52) } });
  no1.hits = [[19.86, .6, 1, 'rgba(255,212,0,1)']]; // 横向展开后“锁金”；不再“全屏白闪＋整屏震＋3 倍砸字”三件套
  [['API 上线', '2026-08-19 · 定价与 GLM-5.2 一致', 20.3], ['GLM-5.3-Flash 开源', '2026-08-26 · 320B-A18B 原生多模态', 20.8], ['权重开源', '2026-08-28', 21.3]].forEach(([a, b, ts], i) =>
    Toast({ title: a, sub: b, icon: 'Z', color: '#2a4dff', item: { t0: ts, t1: T1, z: 11, base: { x: 470, y: 150 + i * 100 }, keys: A.tagFlip(ts) } })); // 标签翻出
  Ticker({ text: 'GLM-5.3　·　代码生成效率 +50%　·　TerminalBench 3.0 开源第一　·　ZCode / AutoClaw 同步更新　·　GLM Coding Plan 额度重置　·　十余家编码平台抢先体验', cls: 'teal', item: { t0: 18.02, t1: T1, z: 70, keys: A.from(18.02, .3, 'y', 1110, 1050) } });
})();

// ================= 05 · Kimi K3 ≈ Opus 4.8（Kimi vs Claude）22.9–28.3 =================
(() => {
  const T0 = 22.9, T1 = 28.3;
  const L = Box('', '', { t0: T0, t1: T1, z: 1, base: { x: 960, y: 540 }, keys: A.fadeIn(22.9, .2) });
  L.el.style.cssText += 'width:1920px;height:1080px;background:linear-gradient(115deg, rgba(40,90,255,.28) 0 49.6%, transparent 49.6% 50.4%, rgba(255,140,70,.22) 50.4%)';
  Char('kimi', { h: 940, item: { t0: 22.98, t1: T1, z: 5, glow: BLUE_GLOW, base: { x: 430, y: 600 }, keys: A.from(22.98, .45, 'x', -400, 430, 'out5') } });
  Char('claude', { h: 940, item: { t0: 23.38, t1: T1, z: 5, glow: 'drop-shadow(0 0 26px rgba(255,160,90,.55))', base: { x: 1500, y: 600 }, keys: A.from(23.38, .45, 'x', 2300, 1500, 'out5') } });
  const sw = Box('', '', { t0: 23.6, t1: 24.3, z: 20, base: { x: 960, y: 540, rz: -65 }, keys: K({ sx: [[23.62, 0], [23.78, 1, 'out5']], o: [[24.0, 1], [24.3, 0, 'lin']] }) });
  sw.el.style.cssText += 'width:1600px;height:14px;background:linear-gradient(90deg,transparent,#dff0ff 30%,#fff 50%,#dff0ff 70%,transparent);box-shadow:0 0 40px 10px rgba(180,220,255,.8);border-radius:7px';
  Browser({ img: SH('kimi_hf'), url: 'huggingface.co/moonshotai/Kimi-K3', w: 760, vh: 480, dark: true, scroll: [[24.4, 0], [25.7, 1420, 'io'], [28.3, 1560, 'lin']],
    item: { t0: 24.04, t1: T1, z: 8, base: { x: 960, y: 400 }, keys: K(A.fadeIn(24.04, .2), { rx: [[24.04, 30], [24.5, 6]], s: [[25.85, 1], [26.0, .9]], br: [[25.85, 1], [26.0, .6]] }) } });
  Stat({ label: '总参数', value: '2.8T', foot: '激活 104B · MoE', color: '#8ec5ff', item: { t0: 24.44, t1: T1, z: 10, base: { x: 250, y: 220 }, keys: A.fadeIn(24.44, .1) } }).wipe = [24.44, .35, 'd']; // 规格沿同一纵向标尺依次展开
  Stat({ label: '上下文', value: '1M', foot: '1,048,576 tokens', color: '#8ec5ff', item: { t0: 24.72, t1: T1, z: 10, base: { x: 250, y: 420 }, keys: A.fadeIn(24.72, .1) } }).wipe = [24.72, .35, 'd'];
  Stat({ label: 'Terminal-Bench 2.1', count: [0, 88.3, 25.22, .6], dec: 1, unit: '%', foot: '第三方整理 · 开源模型首次进入前二', color: '#8ec5ff', item: { t0: 25.22, t1: T1, z: 10, base: { x: 280, y: 620 }, keys: A.fadeIn(25.22, .1) } }).wipe = [25.22, .35, 'd'];
  News({ src: 'BenchLM', color: '#111', date: '2026-07-27', title: 'Kimi K3: The Open Model Closing the Gap', sub: '96 个权重分片 · 发布 11 天后全量开源', fs: 32, w: 540,
    item: { t0: 25.22, t1: T1, z: 11, base: { x: 1600, y: 210, rz: 2 }, keys: A.stick(25.22, 7, 2) } });
  Stamp({ text: '≈ Opus 4.8', cls: 'hanazi', fs: 130, color: '#8ee3ff', item: { t0: 25.9, t1: T1, z: 13, base: { x: 960, y: 470, rz: -4 }, keys: A.merge(25.9) } }); // 由两侧对照向中线合拢，不照搬 No.1 的砸字
  Box('（官方口径：编程对标 Opus 4.8）', 'stamp tag', { t0: 26.3, t1: T1, z: 13, base: { x: 960, y: 590 }, keys: A.settle(26.3, .35) }).el.style.fontSize = '26px';
  Ticker({ text: 'Kimi K3　·　2026-07-16 发布　·　07-27 全量权重开源　·　2.8T MoE / 104B 激活　·　1M 上下文　·　官方口径编程对标 Opus 4.8', cls: 'navy', item: { t0: 24.04, t1: T1, z: 70, keys: A.from(24.04, .3, 'y', 1110, 1050) } });
})();

// ================= 06 · Seedance 2.5：30 秒直出 + Token 洪流 28.3–32.7 =================
(() => {
  const T0 = 28.3, T1 = 32.7;
  Browser({ img: SH('seed_ithome'), url: 'ithome.com/0/967/374.htm', w: 860, vh: 580, dark: true, scroll: [[28.8, 0], [30.1, 660, 'io'], [32.7, 760, 'lin']],
    item: { t0: T0, t1: T1, z: 4, base: { x: 680, y: 440 }, keys: K({ ry: [[28.3, -50], [28.8, 12], [32.7, 6, 'lin']], x: [[28.3, -200], [28.8, 680, 'out5']], s: [[30.9, 1], [31.2, .86]], br: [[30.9, 1], [31.2, .6]] }) } });
  Char('seed', { h: 920, item: { t0: 28.28, t1: T1, z: 6, glow: 'drop-shadow(0 0 26px rgba(150,220,255,.6))', base: { x: 1560, y: 610 }, keys: K(A.from(28.28, .6, 'y', 1400, 610, 'out5')) } });
  Stat({ label: '单次直出', count: [0, 30, 29.16, .5], unit: '秒', color: '#a8e4ff', item: { t0: 29.16, t1: T1, z: 10, base: { x: 1190, y: 190 }, wipe: [29.16, .5, 'r'], keys: K(A.fadeIn(29.16, .1), { s: [[30.95, 1], [31.15, .7]], x: [[30.95, 1190], [31.15, 1060]], y: [[30.95, 190], [31.15, 300]] }) } });
  Stat({ label: '全模态参考素材', count: [0, 50, 29.36, .5], unit: '个', color: '#a8e4ff', item: { t0: 29.36, t1: T1, z: 10, base: { x: 1190, y: 380 }, keys: K(A.tagFlip(29.36), { s: [[30.95, 1], [31.15, .7]], x: [[30.95, 1190], [31.15, 1300]], y: [[30.95, 380], [31.15, 300]] }) } });
  const film = Box(['gpt', 'claude', 'ds', 'qwen', 'glm', 'kimi', 'seed', 'gemini', 'grok', 'ds'].map((n) => `<div class="fr"><img src="assets/chars/${n}.png"></div>`).join(''), 'film', { t0: 29.76, t1: T1, z: 9, base: { x: 960, y: 128, rz: -2 }, keys: K(A.fadeIn(29.76, .15), { x: [[29.76, 1900], [31.08, 1420, 'lin'], [31.55, 960, 'io'], [32.7, 760, 'lin']] }) }); // 31.08 量级爆点：胶片流速突然加快承担强调
  film.el.style.width = '2860px';
  Browser({ img: SH('seed_jiemian'), url: 'jiemian.com/article/14629207.html', w: 640, vh: 330, scroll: [[30.2, 40]],
    item: { t0: 30.12, t1: T1, z: 11, base: { x: 520, y: 700, rz: -2 }, keys: K(A.from(30.12, .3, 'x', -400, 520, 'back'), A.fadeIn(30.12, .1)) } });
  // Token 调用量：日均 180 万亿
  const tk = Stat({ label: '豆包大模型 · 日均 Token 调用量', count: [0, 180, 31.08, .7], unit: '万亿', foot: '2026.06 火山引擎 FORCE · 一年涨超 10 倍', color: '#ffe066', item: { t0: 31.08, t1: T1, z: 13, base: { x: 1120, y: 560, rz: -3 }, keys: A.settle(31.08, .4, .97) } }); // 数字占位，不再换一张大卡砸屏
  tk.wipe = [31.08, .4, 'r'];
  tk.el.querySelector('.sval').style.fontSize = '150px';
  Box('1 分钟 720P 视频 ≈ 百万级 Token · 视频成了 Token 消耗新主力', 'stamp tag', { t0: 31.5, t1: T1, z: 13, base: { x: 1120, y: 780, rz: -2 }, keys: A.settle(31.5, .35) }).el.style.cssText += ';--c:#ffe066;font-size:25px';
  Ticker({ text: 'Seedance 2.5　·　2026-07-31 发布　·　单条 30 秒直出 · 50 个全模态参考　·　豆包大模型日均 Token 调用量 180 万亿（2026.06）　·　生成 1 分钟 720P 视频 Token 消耗达百万级', cls: 'cyan', item: { t0: 29.2, t1: T1, z: 70, keys: A.from(29.2, .3, 'y', 1110, 1050) } });
})();

// ================= 07 · 年岁漫漫：拼贴快切 → 合影 32.7–38.6 =================
const CLIPS = [
  ['ds_r1_news', 0, 32.74, 520, 330, -7, '2025.01', 'ds'],
  ['cnbc_nvda', 120, 33.62, 1380, 300, 5, '2025.01', null],
  ['qwen27_aihub', 40, 34.12, 760, 610, 4, '2026.08', 'qwen'],
  ['seed_ithome', 330, 34.90, 1220, 650, -5, '2026.06', 'seed'],
  ['kimi_benchlm', 0, 35.72, 330, 690, 6, '2026.07', 'kimi'],
  ['glm_sohu', 0, 36.68, 1600, 610, -4, '2026.08', 'glm'],
];
(() => {
  const T1 = 37.3;
  CLIPS.forEach(([img, y0, ts, x, y, r, date, who], i) => {
    pre(SH(img));
    const ENTER = [{ s: [[ts, 1.6], [ts + .14, 1, 'out5']] }, { x: [[ts, x + (x < 960 ? -260 : 260)], [ts + .2, x, 'out5']], rz: [[ts, r * 3], [ts + .2, r, 'out']] }, { ry: [[ts, 80], [ts + .2, 0, 'out']] }][i % 3]; // 纸片入场：拍下 / 贴附滑入 / 翻贴 交替
    const c = Box(`<div class="tape"></div>`, 'clip', { t0: ts, t1: T1, z: 10 + i, jitter: 2.2, base: { x, y, rz: r }, keys: K(ENTER, { o: [[ts, 0], [ts + .05, 1, 'lin']] }, { x: [[37.02, x], [37.3, x + (x - 960) * 1.6, 'in']], rz: [[37.02, r], [37.3, r * 4, 'in']] }) });
    if (i) c.glint = [[ts + .12, .35]]; // 小拍点：只扫一下纸边反光，不整屏闪
    c.el.style.cssText += `width:560px;height:360px;background-image:url(${SH(img)});background-size:560px auto;background-position:0 ${-y0 * 560 / 960}px;background-color:#fff`;
    Box(date, 'sticker', { t0: ts + .08, t1: T1, z: 30 + i, jitter: 2.2, base: { x: x + 200, y: y - 150, rz: -8 }, keys: K(A.pop(ts + .08, .2, .3), { x: [[37.02, x + 200], [37.3, x + 200 + (x - 960) * 1.8, 'in']] }) });
    if (who) Avatar(who, { d: 120, item: { t0: ts + .12, t1: T1, z: 31 + i, jitter: 2.2, base: { x: x - 240, y: y + 140 }, keys: K(A.pop(ts + .12, .2, .3), { x: [[37.02, x - 240], [37.3, x - 240 + (x - 960) * 1.8, 'in']] }) } });
  });
  // 合影：五国模 | 河 | GPT + Claude
  const river = Box('', 'river', { t0: 37.02, t1: 43.9, z: 2, base: { x: 960, y: 760 }, keys: A.fadeIn(37.02, .4) });
  const cast = [['ds', 130], ['qwen', 290], ['glm', 450], ['kimi', 610], ['seed', 770], ['gpt', 1160], ['claude', 1340], ['gemini', 1520], ['grok', 1700]];
  cast.forEach(([n, x], i) => Char(n, { h: 600, item: { t0: 37.02, t1: 43.9, z: 4 + (i % 2), glow: i < 5 ? GOLD_GLOW : BLUE_GLOW, base: { x: x + 40, y: 470 }, keys: K(A.from(37.02 + i * .03, .5, 'y', 900, 470, 'out5'), A.fadeIn(37.02 + i * .03, .2), { sat: [[38.6, 1], [41.2, 0, 'io']], br: [[38.6, 1], [42.5, .55, 'lin']] }) } }));
  const lab = Box('<span style="color:#ffd27a">国 模</span><span style="display:inline-block;width:640px"></span><span style="color:#9fd0ff">海 外</span>', 'lbl', { t0: 37.3, t1: 43.9, z: 8, base: { x: 960, y: 140 }, keys: K(A.fadeIn(37.3, .4), A.fadeOut(38.5, .3)) });
  lab.el.style.cssText += 'font-size:40px;letter-spacing:12px;white-space:nowrap';
})();

// ================= 08 · 昙花：褪色、旧页倒流、404、烧边黑场 38.6–43.9 =================
(() => {
  // 时间轴
  const tl = Box(`<div style="position:absolute;left:0;right:0;top:44px;height:3px;background:rgba(255,255,255,.4)"></div>
    ${[['2025.01', 0], ['2026.04', .45], ['2026.06', .58], ['2026.07', .68], ['2026.08', .78], ['2026.10', 1]].map(([d, p]) => `<div style="position:absolute;left:${p * 100}%;top:30px;width:30px;height:30px;margin-left:-15px;border-radius:50%;background:#ddd"></div><div class="lbl" style="position:absolute;left:${p * 100}%;top:66px;transform:translateX(-50%);opacity:.7;font-size:20px">${d}</div>`).join('')}
    <div class="ph" style="position:absolute;top:18px;width:6px;height:56px;background:#ff5a5a;box-shadow:0 0 16px #ff5a5a"></div>`, 'timeline', { t0: 38.58, t1: 43.9, z: 9, base: { x: 960, y: 120 }, keys: K(A.fadeIn(38.58, .4)) });
  const ph = tl.el.querySelector('.ph');
  tl.upd = (t) => { ph.style.left = (EASE.io(clamp((t - 38.8) / 3.4)) * 100) + '%'; };
  // 旧网页灰色倒流（快速向上滚动）
  [['ds_r1_news', 40.46, 420], ['qwen27_hf', 40.82, 960], ['kimi_hf', 41.16, 1500], ['glm_sohu', 41.52, 960]].forEach(([img, ts, x], i) =>
    Browser({ img: SH(img), url: '', w: 520, vh: 360, scroll: [[ts, 1600], [ts + .9, 0, 'lin']], item: { t0: ts, t1: ts + .9, z: 20, base: { x, y: 500, sat: 0, br: .75, rz: (i % 2 ? 3 : -3) }, keys: K(A.pop(ts, .2, .7), A.fadeOut(ts + .6, .3)) } }));
  // 404
  Browser({ img: SH('future_linuxdo'), url: 'linux.do/t/topic/…', w: 760, vh: 460, dark: true, item: { t0: 41.94, t1: 43.4, z: 30, base: { x: 960, y: 470, rz: -2 }, keys: K(A.settle(41.94, .4, .9), { sat: [[41.94, .3]], blur: [[41.94, 6], [42.2, 0], [42.6, 0], [43.3, 10]], o: [[41.94, 0], [42.1, 1, 'lin'], [42.9, 1], [43.4, 0, 'lin']] }) } });
  Box('404', 'stamp seal', { t0: 42.1, t1: 43.4, z: 31, base: { x: 1240, y: 300, rz: 10 }, keys: K(A.tagFlip(42.1, .3), A.fadeOut(42.9, .5)) }); // 作为网页状态翻出，不再盖章
  window.POST = (t) => {
    const burn = $('#burn'), black = $('#black');
    // 烧边：42.46 起橙色胶片烧灼向内吞噬
    if (t > 42.3 && t < 43.95) { const k = clamp((t - 42.3) / 1.2); burn.style.opacity = (Math.sin(Math.min(1, k) * Math.PI) * .9).toFixed(3); burn.style.background = `radial-gradient(${(120 - k * 60).toFixed(1)}% ${(110 - k * 60).toFixed(1)}% at ${45 + noise1(t * 3, 9) * 8}% 50%, transparent 40%, rgba(255,140,40,.85) 62%, rgba(120,20,0,.95) 78%, #000 92%)`; }
    else burn.style.opacity = 0;
    let bo = 0;
    if (t > 43.0 && t < 44.15) bo = t < 43.6 ? clamp((t - 43.0) / .5) : clamp(1 - (t - 43.9) / .25);
    if (t > 61.5 && t < 61.75) bo = Math.max(bo, clamp((t - 61.5) / .2) * .6);
    black.style.opacity = bo.toFixed(3);
    // 第二幕：整体冷灰（闪回与豆包段除外）
    let sat = 1;
    if (t >= 38.6 && t < 47.5) sat = 1 - .75 * clamp((t - 38.8) / 2.6);
    if (t >= 45.86 && t < 47.5) sat = Math.max(sat, .25 + .65 * clamp((t - 45.86) / .2));
    if (t >= 50.4 && t < 61.7) sat = .45;
    if (t >= 53.1 && t < 55.4) sat = .45 + .35 * clamp((t - 53.1) / .3);
    $('#stage').style.filter = sat < .99 ? `saturate(${sat.toFixed(3)})` : 'none';
  };
})();

// ================= 09 · DeepSeek V4-Pro-0813：超级涨价 + 神区二相性 43.9–47.5 =================
(() => {
  const T0 = 43.9, T1 = 47.5;
  Char('ds', { h: 920, item: { t0: T0, t1: T1, z: 3, base: { x: 1600, y: 620, sat: .25, br: .75 }, glow: 'drop-shadow(0 0 22px rgba(140,160,200,.35))', keys: K(A.fadeIn(43.9, .4), { s: [[43.9, 1.02], [47.5, 1.08, 'lin']], x: [[43.9, 1640], [47.5, 1580, 'lin']] }) } });
  Browser({ img: SH('ds_price163'), url: '163.com/dy/article/L485A7RT05198NMR.html', w: 860, vh: 580, scroll: [[44.2, 120], [45.4, 520, 'io'], [47.5, 640, 'lin']],
    item: { t0: T0, t1: T1, z: 5, base: { x: 640, y: 440 }, keys: K({ ry: [[43.9, 30], [44.4, 10], [47.5, 4, 'lin']], s: [[43.9, .86], [44.4, 1, 'out5'], [45.8, 1], [46.1, .84]], x: [[45.8, 640], [46.1, 520]], br: [[45.8, 1], [46.1, .6]] }, A.fadeIn(43.9, .3)) } });
  // 价格：6 → 27 元
  const pr = Stat({ label: 'V4-Pro 输出价格 · 元 / 百万 tokens（高峰）', count: [6, 27, 44.82, .6], fmt: (v) => '¥' + v.toFixed(0), unit: '', foot: '8 月 17 日生效 · 峰谷定价 · 空闲时段 13.5', color: '#ff5a5a', item: { t0: 44.3, t1: T1, z: 9, base: { x: 1230, y: 230, rz: 2 }, keys: K(A.settle(44.3, .35), { s: [[45.8, 1], [46.1, .8]], x: [[45.8, 1230], [46.1, 1380]], y: [[45.8, 230], [46.1, 150]] }) } });
  pr.el.querySelector('.sval').style.fontSize = '120px';
  Box('+350%', 'stamp hanazi', { t0: 45.1, t1: T1, z: 10, base: { x: 1500, y: 390, rz: -8 }, keys: K(A.tagFlip(45.1, .3), { x: [[45.8, 1500], [46.1, 1620]], y: [[45.8, 390], [46.1, 280]], s: [[45.8, 1], [46.1, .7]] }) }).el.style.cssText += ';--c:#ff4b4b;font-size:100px';
  // B 站：AI 界最抽象 96 小时
  Browser({ img: SH('bili_96h'), url: 'bilibili.com/video/BV1DMbv6REyC', w: 640, vh: 380, scroll: [[45.4, 0]],
    item: { t0: 45.36, t1: T1, z: 8, base: { x: 560, y: 760, rz: -2 }, keys: K(A.from(45.36, .3, 'y', 1300, 760, 'back'), A.fadeIn(45.36, .1)) } });
  Danmaku([['【王牌落幕】大涨价！', 45.5, 120, 700, 'r'], ['DSV4-Pro-0813 撤回权重！', 45.7, 420, 660], ['最新消息：权重又回来了', 45.95, 330, 760, 'y'], ['Flash 斩杀 Pro？', 46.2, 200, 820, 'b'], ['AI 界最抽象的 96 小时', 45.8, 470, 780, 'r'], ['灰测神作 / 正式版拉胯', 46.1, 540, 760, 'y']], T1);
  // 神 ⇄ 区：每拍翻一次
  const FL = [45.86, 46.20, 46.52, 46.86, 47.12];
  const fl = Box('<div class="fc shen">神</div><div class="fc qu">区</div>', 'flip', { t0: 45.86, t1: T1, z: 14, base: { x: 1000, y: 430 }, keys: A.settle(45.86, .25, .8) });
  fl.kicks = [[46.52, 14, .35, 0]]; // 翻面冲突点只给一次局部反应（替代红闪 + 整屏震）
  fl.upd = (t) => { let n = 0, ts = FL[0]; FL.forEach((f, i) => { if (t >= f) { n = i; ts = f; } }); const k = EASE.back(clamp((t - ts) / .2)); const ang = (n - 1 + k) * 180; fl.el.style.transform += ` rotateY(${ang.toFixed(1)}deg)`; };
  Box('神区二相性', 'stamp hanazi', { t0: 46.2, t1: T1, z: 15, base: { x: 1000, y: 690, rz: -3 }, keys: A.lift(46.2, .35) }).el.style.cssText += ';--c:#ffe066;font-size:84px';
  Ticker({ text: 'DeepSeek-V4-Pro-0813　·　08-13 正式版上线　·　08-17 起峰谷定价：高峰输出 6 → 27 元/百万 tokens（+350%）　·　权重撤回又放回　·　测一次封神，测一次拉胯 —— 神区二相性', cls: 'gray', item: { t0: 44.3, t1: T1, z: 70, keys: A.from(44.3, .3, 'y', 1110, 1050) } });
})();

// ================= 10 · V4.1 Flash：拼尽全力，还是追不上 47.5–50.4 =================
(() => {
  const T0 = 47.5, T1 = 50.4;
  Browser({ img: SH('ds41_news'), url: 'api-docs.deepseek.com/zh-cn/news/news260910', w: 860, vh: 580, scroll: [[47.7, 0], [48.6, 230, 'io'], [50.4, 300, 'lin']],
    item: { t0: T0, t1: T1, z: 4, base: { x: 640, y: 440 }, keys: K(A.slam(47.58, 1.25, .2), { ry: [[47.58, 4], [50.4, 12, 'lin']], sat: [[49.6, 1], [50.3, .3]] }) } });
  [['#ff2a6d', -14], ['#2ad4ff', 14]].forEach(([c, dx]) => {
    const g = Box('', '', { t0: T0, t1: 48.2, z: 3, base: { x: 640 + dx, y: 440 }, keys: K(A.fadeOut(47.6, .6)) });
    g.el.style.cssText += `width:860px;height:626px;border-radius:14px;background:${c};mix-blend-mode:screen;opacity:.5`;
  });
  Stat({ label: 'V4.1 Flash · 2026-09-10', value: '552B', unit: 'MoE', foot: '激活 读 8B / 写 16B · 全面超越自家 V4 Pro', color: '#8ea2ff', item: { t0: 47.8, t1: T1, z: 9, base: { x: 1250, y: 170, rz: -2 }, keys: A.fadeIn(47.8, .1) } }).wipe = [47.8, .4, 'r'];
  // 赛跑：HLE —— Flash 拼命跑，Opus 在前面
  const race = Box(`<div class="ptitle">HLE · 前沿硬核推理</div>
    <div class="row"><span style="width:170px;color:#8ea2ff">V4.1 Flash</span><div class="bar r1" style="background:#4d6bfe"></div><span class="rv v1"></span><span class="sw2" style="font-size:30px">💦</span></div>
    <div class="row"><span style="width:170px;color:#ffb37a">Opus 5</span><div class="bar r2" style="background:#e9a23b"></div><span class="rv v2"></span></div>
    <div class="lbl" style="opacity:.6;margin-top:12px;font-size:19px">Terminal-Bench 4.0 仅 31.2 · 第三方评测</div>`, 'panel race', { t0: 48.32, t1: T1, z: 10, base: { x: 1160, y: 470 }, keys: K(A.from(48.32, .3, 'x', 1700, 1160, 'out5'), A.fadeIn(48.32, .1), { s: [[48.74, 1], [48.95, .8]], x: [[48.74, 1160], [48.95, 470]], y: [[48.74, 470], [48.95, 250]] }) });
  const r1 = race.el.querySelector('.r1'), r2 = race.el.querySelector('.r2'), v1 = race.el.querySelector('.v1'), v2 = race.el.querySelector('.v2'), sw2 = race.el.querySelector('.sw2');
  race.upd = (t) => { const k1 = EASE.out(clamp((t - 48.4) / .9)), k2 = EASE.out5(clamp((t - 48.4) / .4)); r1.style.width = (36.8 / 60 * 420 * k1 + Math.sin(t * 40) * 3 * (1 - k1)).toFixed(1) + 'px'; r2.style.width = (56.3 / 60 * 420 * k2).toFixed(1) + 'px'; v1.textContent = (36.8 * k1).toFixed(1); v2.textContent = (56.3 * k2).toFixed(1); sw2.style.transform = `translateY(${(Math.abs(Math.sin(t * 14)) * -8).toFixed(1)}px)`; };
  // 吃白饭的蓝色大肥鱼
  const fish = Box('<img src="assets/chars/fish.jpg" style="width:560px;height:560px">', 'sticker2', { t0: 48.74, t1: T1, z: 12, base: { x: 1480, y: 560, rz: 4 }, keys: A.flipIn(48.74, .38) }); // 局部翻贴后停住，不再叠第二次全屏白闪 / 震
  Box('全面超越自家 V4 Pro ✓　追上海外旗舰 ✗', 'stamp tag', { t0: 49.38, t1: T1, z: 13, base: { x: 1400, y: 900, rz: -2 }, keys: A.tagFlip(49.38) }).el.style.cssText += ';--c:#ff5a5a;font-size:30px';
  Box('拼尽全力了……', 'stamp hanazi', { t0: 49.78, t1: T1, z: 14, base: { x: 640, y: 660, rz: -6 }, keys: A.drop(49.78, -6) }) // 像旁批落下.el.style.cssText += ';--c:#8ec5ff;font-size:90px';
})();

// ================= 11 · Qwen3.8-Max 0902：有提升，仍不如自家 Flash（B 站实测）50.4–55.4 =================
(() => {
  const T0 = 50.4, T1 = 55.4;
  for (let i = 0; i < 70; i++) { const s = Box('', 'star', { t0: T0, t1: T1, z: 1, base: { x: rnd(i, 11) * 1920, y: rnd(i, 12) * 520, s: .5 + rnd(i, 13) * 1.4 } }); const ph = rnd(i, 14) * 6; s.upd = (t) => { s.el.style.opacity = (.35 + .65 * Math.abs(Math.sin(t * 2.2 + ph))).toFixed(2); }; }
  Char('qwen', { h: 900, item: { t0: T0, t1: T1, z: 3, base: { x: 1640, y: 620, br: .8 }, glow: 'drop-shadow(0 0 20px rgba(150,160,255,.35))', keys: K(A.fadeIn(50.4, .4), { s: [[50.4, 1.02], [55.4, 1.07, 'lin']] }) } });
  // B 站播放器：标题卡 → 四个测试项快切（真实测试画面）
  const CUTS = [[50.4, 'title', 1, '模型信息'], [51.22, 'arch', 20, '3D 体素 · 中国建筑群'], [51.70, 'voxel', 20, '体素山 · 瀑布穿云'], [52.06, 'front', 20, '前端落地页 · 零风格约束'], [52.60, 'bh', 20, '黑洞模拟 · 广义相对论']];
  const imgs = CUTS.map(([, k, n]) => Array.from({ length: n }, (_, i) => `assets/clips/q11/${k}_${String(i + 1).padStart(2, '0')}.jpg`));
  const pl = Box(`<div class="bbar" style="background:#fff;color:#18191c;display:flex;align-items:center;gap:12px;padding:0 16px;height:52px;font:800 20px/52px 'Microsoft YaHei',sans-serif"><span style="color:#00aeec;font-size:24px">bilibili</span><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Qwen3.8 Max 0902：有提升，但仍旧表现不如自家的 Flash 模型……</span></div>
    <div class="scr" style="position:relative;width:900px;height:506px;background:#000;overflow:hidden">${imgs.flat().map((u) => `<img src="${u}" style="position:absolute;inset:0;width:900px;height:506px;display:none">`).join('')}
    <div class="chap" style="position:absolute;left:16px;bottom:16px;padding:6px 14px;border-radius:8px;background:rgba(0,0,0,.72);color:#fff;font:800 24px 'Microsoft YaHei',sans-serif"></div></div>
    <div style="height:46px;background:#18191c;color:#c9ccd0;font:600 18px/46px 'Microsoft YaHei',sans-serif;padding:0 16px">UP 无机酸-_- · 2026-09-02 · 测试平台 Windows 11 + Qoder · AI 六项能力测试</div>`, 'browser', { t0: T0, t1: T1, z: 6, base: { x: 640, y: 430 },
    keys: K({ y: [[50.4, -300], [50.9, 430, 'out5']], ry: [[50.4, 30], [50.9, 8]] }, { s: [[53.1, 1], [53.4, .5, 'io']], x: [[53.1, 640], [53.4, 330, 'io']], y: [[53.1, 430], [53.4, 210, 'io']], rz: [[53.1, 0], [53.4, -4]] }) });
  pl.el.style.width = '900px';
  const all = [...pl.el.querySelectorAll('.scr img')], chap = pl.el.querySelector('.chap');
  let off = 0; const offs = imgs.map((a) => { const o = off; off += a.length; return o; });
  pl.upd = (t) => { let c = 0; CUTS.forEach((cu, i) => { if (t >= cu[0]) c = i; }); const n = imgs[c].length; const fi = Math.min(n - 1, Math.max(0, Math.floor((t - CUTS[c][0]) * 30))); const idx = offs[c] + fi; all.forEach((im, j) => { im.style.display = j === idx ? 'block' : 'none'; }); chap.textContent = CUTS[c][3]; chap.style.display = c === 0 ? 'none' : ''; };
  Box('「看到跑分我还以为能有 Opus 5 的水准……较自己虽有改进，但仍旧配不上它的价格。」', 'stamp tag', { t0: 51.0, t1: 53.1, z: 9, base: { x: 700, y: 78 }, keys: K(A.settle(51.0, .35), A.fadeOut(52.9, .2)) }).el.style.cssText += ';--c:#00aeec;font-size:22px';
  // 前端处理能力榜（真实榜单截图）
  Browser({ img: SH('qwen_board_front'), srcW: 1920, url: 'B 站 · 无机酸-_- · 前端处理能力榜', w: 900, vh: 506, marks: [[30, 378, 1860, 58, 53.4], [30, 556, 1860, 58, 53.5]],
    item: { t0: 53.1, t1: T1, z: 8, base: { x: 820, y: 470, rz: 1 }, keys: K(A.settle(53.1, .3, .92), { s: [[53.62, 1], [53.85, .62, 'io']], x: [[53.62, 820], [53.85, 470, 'io']], y: [[53.62, 470], [53.85, 700, 'io']], rz: [[53.62, 1], [53.85, -3]] }) } });
  Box('前端榜：Flash <b style="color:#7ee787">91.05（#5）</b> ＞ Max 0902 <b style="color:#ff8a8a">87.48（#8）</b>', 'stamp tag', { t0: 53.4, t1: T1, z: 12, base: { x: 820, y: 170 }, wipe: [53.4, .3, 'r'], keys: K(A.fadeIn(53.4, .08), { x: [[53.62, 820], [53.85, 470, 'io']], y: [[53.62, 170], [53.85, 960, 'io']], s: [[53.62, 1], [53.85, .8]] }) }).el.style.cssText += ';--c:#7c5cff;font-size:30px';
  // 总分榜
  Browser({ img: SH('qwen_board_total'), srcW: 1920, url: 'B 站 · 无机酸-_- · 总分榜', w: 820, vh: 461, marks: [[30, 424, 1860, 58, 53.95], [30, 720, 1860, 58, 54.05]],
    item: { t0: 53.62, t1: T1, z: 10, base: { x: 1080, y: 420, rz: -1 }, keys: K(A.from(53.62, .3, 'x', 2300, 1080, 'out5'), A.fadeIn(53.62, .1)) } });
  Box('总分：Flash <b style="color:#7ee787">372.95（#3）</b> ＞ Max 0902 <b style="color:#ff8a8a">344.43（#8）</b>', 'stamp tag', { t0: 53.95, t1: T1, z: 12, base: { x: 1080, y: 130 }, wipe: [53.95, .3, 'r'], keys: A.fadeIn(53.95, .08) }).el.style.cssText += ';--c:#7c5cff;font-size:30px';
  Stamp({ text: '旗舰 < Flash', cls: 'hanazi', fs: 120, color: '#c9c9d6', item: { t0: 54.24, t1: T1, z: 14, base: { x: 1240, y: 760, rz: 6 }, wipe: [54.24, .45, 'r'], keys: A.fadeIn(54.24, .1) } }); // 由两行差距导出：顺行写出，不另一次巨字撞击
  Ticker({ text: 'Qwen3.8-Max-0902　·　B 站 UP 无机酸-_- AI 六项能力测试（2026-09-02）　·　前端处理能力榜：Qwen3.8-Flash 91.05 第 5，Max 0902 87.48 第 8　·　总分榜：Flash 372.95 第 3，Max 0902 344.43 第 8　·　“有提升，但仍旧表现不如自家的 Flash 模型”', cls: 'gray', item: { t0: 51.22, t1: T1, z: 70, keys: A.from(51.22, .3, 'y', 1110, 1050) } });
})();

// ================= 12 · GLM ZCode：.git 被打包上传 55.4–59.0 =================
(() => {
  const T0 = 55.4, T1 = 59.0;
  Char('glm', { h: 880, item: { t0: T0, t1: T1, z: 2, base: { x: 1660, y: 620, br: .75 }, glow: 'drop-shadow(0 0 26px rgba(255,60,60,.55))', keys: K(A.fadeIn(55.4, .3)) } });
  Browser({ img: SH('zcode_sina'), url: 'finance.sina.com.cn/roll/2026-10-01/…', w: 760, vh: 540, scroll: [[56.2, 0], [57.9, 1500, 'io']],
    item: { t0: 56.14, t1: T1, z: 4, base: { x: 1220, y: 420 }, keys: K({ ry: [[56.14, -50], [56.5, -16], [59, -10, 'lin']], x: [[56.14, 1900], [56.5, 1220, 'out5']] }, A.fadeIn(56.14, .1)) } });
  Terminal({ title: 'ZCode · Repo Wiki 代码库索引（示意）', w: 860, h: 440, lines: [[55.4, '$ zcode index --repo-wiki', 'c'], [55.62, 'packing workspace snapshot …', 'd'], [55.8, '  + .git/objects/pack/*.pack'], [55.96, '  + .git/logs/HEAD   (reflog)'], [56.12, '  + .git/lfs/objects/…'], [56.28, '  + ~/.config  (全局应用配置)'], [56.44, 'encrypt: AES → key wrapped by server RSA', 'y'], [56.74, 'PUT oss://…aliyuncs.com/snapshot.enc', 'r']],
    progress: [56.9, 57.8, 'upload'], item: { t0: T0, t1: T1, z: 6, base: { x: 610, y: 420, ry: 8 }, keys: K(A.pop(55.4, .25, .8), { br: [[57.98, 1], [58.1, .6]] }), kicks: [[57.24, 8, .3, 0]] } });
  Box('⚠ 包体 86.6% 是 .git 历史', 'stamp tag', { t0: 57.24, t1: T1, z: 9, base: { x: 560, y: 690 }, keys: A.tagFlip(57.24), hits: [[57.24, .5, 1, 'rgba(255,59,48,1)']] }).el.style.cssText += ';--c:#ff3b30;font-size:34px;background:#2a0505';
  Box(`<span class="st">● Open</span><span style="opacity:.6;font-size:20px">ZCode 反馈区</span><div class="tt">Issue #707：已接受的快照清单里，有两千多条 .git 路径</div><div class="mt">快照还会附带全局配置与自动执行脚本（基于本机记录）</div>`, 'gh', { t0: 57.62, t1: T1, z: 10, base: { x: 1220, y: 230, rz: 2 }, keys: K(A.from(57.62, .35, 'x', 1560, 1220, 'out5'), A.fadeIn(57.62, .12)) });
  Box(`<h3>智谱 · ZCode 致歉说明</h3><ul style="margin:0;padding-left:28px"><li>09-18 当日致歉，问题源于「代码库索引」默认开启</li><li>09-19 v3.14.0 移除上传链路</li><li>09-21 宣布开源 ZCode，引入第三方安全审计</li></ul>`, 'notice', { t0: 57.98, t1: T1, z: 12, base: { x: 960, y: 470, rz: -1 }, keys: K(A.from(57.98, .4, 'y', 1250, 470, 'out5'), A.fadeIn(57.98, .1)) }); // 回应从下方升起，前景状态切换
  Stamp({ text: '已致歉', cls: 'seal', fs: 72, color: '#d62828', item: { t0: 58.24, t1: T1, z: 13, base: { x: 1300, y: 600, rz: 8 }, keys: A.tagFlip(58.24, .3) } }); // 改为状态标签；真正的大盖章留给豆包
  Ticker({ text: 'ZCode　·　09-18 被曝静默打包工作区上传阿里云 OSS　·　当日致歉　·　09-19 v3.14.0 修复　·　09-21 宣布开源并引入第三方审计', item: { t0: 55.6, t1: T1, z: 70, keys: A.from(55.6, .3, 'y', 1110, 1050) } });
})();

// ================= 13 · Kimi：K3 之后只剩 K2.8 Preview，然后没了消息 59.0–61.7 =================
(() => {
  const T0 = 59.0, T1 = 61.7;
  const SEQ = [[58.96, '07', '16', 'K3 发布', '#2a5bd7'], [59.7, '07', '27', 'K3 权重开源', '#2a5bd7'], [60.12, '09', '11', 'K2.8 Preview（无跑分）', '#7a5af5'],
    [60.84, '09', '20', '无消息', '#888'], [61.0, '09', '30', '无消息', '#888'], [61.16, '10', '08', '无消息', '#888'], [61.3, '10', '12', '……', '#888'], [61.42, '10', '16', '……', '#666']];
  const cal = Box('<div class="top"></div><div class="day"></div><div class="ev"></div>', 'cal', { t0: T0, t1: T1, z: 6, base: { x: 560, y: 430, rz: -3 }, keys: K(A.settle(58.98, .35, .9), { y: [[61.45, 430], [61.7, 1300, 'in']] }) });
  const top = cal.el.querySelector('.top'), day = cal.el.querySelector('.day'), ev = cal.el.querySelector('.ev');
  cal.upd = (t) => { let cur = SEQ[0], ts = SEQ[0][0]; for (const s of SEQ) if (t >= s[0]) { cur = s; ts = s[0]; } top.textContent = `2026 · ${cur[1]} 月`; top.style.background = cur[4]; day.textContent = cur[2]; ev.textContent = cur[3]; ev.style.color = cur[4]; const k = clamp((t - ts) / .12); cal.el.style.transform += ` rotateX(${((1 - EASE.out(k)) * -70).toFixed(1)}deg)`; };
  Browser({ img: SH('kimi_k28_ithome'), url: 'ithome.com/1/001/319.htm', w: 760, vh: 520, dark: true, scroll: [[60.3, 0], [61.2, 420, 'io']],
    item: { t0: 60.12, t1: T1, z: 4, base: { x: 1300, y: 400 }, keys: K({ ry: [[60.12, -45], [60.45, -14]], x: [[60.12, 1900], [60.45, 1300, 'out5']], y: [[61.45, 400], [61.7, 1300, 'in']] }) } });
  News({ src: '今日头条', color: '#f04142', date: '2026-09-20', title: '“本次预览没有公布任何 benchmark 数据”', fs: 30, w: 560, theme: 'dark', item: { t0: 60.5, t1: T1, z: 9, base: { x: 1330, y: 690, rz: 1 }, keys: K(A.settle(60.5, .35), { y: [[61.45, 690], [61.7, 1400, 'in']] }) } });
  Avatar('kimi', { d: 150, color: '#8ec5ff', item: { t0: T0, t1: T1, z: 10, base: { x: 1720, y: 160 }, keys: A.settle(59.1, .35) } });
  const typing = Box('<span>●</span> <span>●</span> <span>●</span>', 'bub ai', { t0: 59.2, t1: T1, z: 10, base: { x: 1560, y: 170 }, keys: A.pop(59.2) });
  typing.el.style.cssText += ';font-size:22px;color:#555';
  const dots = typing.el.querySelectorAll('span');
  typing.upd = (t) => dots.forEach((d, i) => { d.style.opacity = (.3 + .7 * (0.5 + 0.5 * Math.sin(t * 9 - i * 1.2))).toFixed(2); });
})();

// ================= 14 · 豆包「唐」：最直白、最直接、最不绕弯子 61.7–66.9 =================
(() => {
  const T0 = 61.7, T1 = 66.9;
  const wb = Box(`<div class="wh">微博热搜</div>
    ${[['#豆包 机票退款#', '热'], ['#豆包 笨还收费#', '新'], ['#豆包越来越诡异了#', ''], ['#豆包不会做馒头#', '爆']].map(([h, b], i) => `<div class="wr"><span class="n">${i + 1}</span><span>${h}</span>${b ? `<span class="hot">${b}</span>` : ''}</div>`).join('')}`, 'weibo', { t0: T0, t1: T1, z: 6, base: { x: 520, y: 330, rz: -3 }, keys: K(A.from(61.72, .35, 'x', -500, 520, 'back'), { s: [[63.3, 1], [63.6, .8]], x: [[63.3, 520], [63.6, 430]], y: [[63.3, 330], [63.6, 250]] }) });
  const rows = [...wb.el.querySelectorAll('.wr')];
  wb.upd = (t) => rows.forEach((r, i) => { r.style.background = `rgba(255,130,0,${(.06 + .08 * Math.max(0, Math.sin(t * 8 - i))).toFixed(3)})`; });
  // 豆包对话：豆包体开场 → 一本正经胡说
  const MEME = '我用最直白、最直接、最不绕弯子、最一针见血、最不废话的方式告诉你：';
  const chat = Box(`<div class="ch"><img src="assets/chars/doubao.png">豆包</div><div class="cb">
      <div class="bub me">退票要扣多少手续费？</div>
      <div class="bub ai a1"><span class="mt1"></span><b class="r1" style="color:#e02020;font-size:30px">只扣 5%！</b></div>
      <div class="bub me m2">你确定？</div>
      <div class="bub ai a2"><span style="opacity:.55">我用最直白、最直接……告诉你：</span><b style="color:#e02020">扣 20%。</b></div>
      <div class="bub me m3">？？？</div>
      <div class="bub ai a3"><span style="opacity:.55">我用最直白……</span><b style="color:#e02020">不扣钱！</b></div></div>`, 'chat', { t0: 61.9, t1: T1, z: 8, base: { x: 1280, y: 470, rz: 2 }, keys: A.from(61.9, .35, 'y', 1400, 470, 'back') });
  chat.el.style.cssText += ';width:660px;height:700px';
  const q = (s) => chat.el.querySelector(s), mt1 = q('.mt1'), r1 = q('.r1'), m2 = q('.m2'), a2 = q('.a2'), m3 = q('.m3'), a3 = q('.a3'), body = q('.cb');
  chat.upd = (t) => {
    mt1.textContent = MEME.slice(0, Math.floor(clamp((t - 62.2) / 1.0) * MEME.length)); r1.style.display = t > 63.3 ? '' : 'none';
    m2.style.display = t > 63.98 ? '' : 'none'; a2.style.display = t > 64.3 ? '' : 'none'; m3.style.display = t > 64.62 ? '' : 'none'; a3.style.display = t > 64.85 ? '' : 'none';
    body.style.transform = `translateY(${(-EASE.out(clamp((t - 64.3) / .3)) * 120 - EASE.out(clamp((t - 64.85) / .3)) * 130).toFixed(1)}px)`;
  };
  Toast({ title: '网友实测：说好扣 5%，实扣 40%', sub: '损失 600 元，起诉到互联网法院', icon: '!', color: '#e02020', item: { t0: 63.66, t1: T1, z: 10, base: { x: 1300, y: 120 }, keys: K(A.from(63.66, .3, 'y', -120, 120, 'back'), A.fadeIn(63.66, .1)) } });
  Box('同一个问题问三次，三个答案', 'stamp tag', { t0: 64.62, t1: T1, z: 10, base: { x: 560, y: 560, rz: -2 }, keys: A.pop(64.62) }).el.style.cssText += ';--c:#ffd400;font-size:28px';
  // 豆包 · 奶龙版
  const nl = Box('<img src="assets/chars/doubao_nailong.jpg" style="width:330px;height:330px">', 'sticker2', { t0: 63.66, t1: T1, z: 9, base: { x: 270, y: 740, rz: -5 }, keys: A.from(63.66, .4, 'y', 1400, 740, 'back') });
  nl.upd = (t) => { const b = Math.abs(Math.sin((t - 63.66) * Math.PI / .72)); nl.el.style.transform += ` translateY(${(-b * 22).toFixed(1)}px) scaleY(${(1 - (1 - b) * .05).toFixed(3)})`; };
  Stamp({ text: '唐', cls: 'seal', fs: 330, color: '#e02020', item: { t0: 65.08, t1: T1, z: 20, base: { x: 960, y: 430, rz: -10 }, keys: K(A.slam(65.08, 3.4, .25), { s: [[65.4, 1], [66.9, 1.08, 'lin']] }) } });
  const RAIN = ['最直白', '最直接', '最不绕弯子', '最一针见血', '最不废话'];
  for (let i = 0; i < 18; i++) { const x = 100 + rnd(i, 21) * 1720, ts = 65.1 + rnd(i, 22) * .9; const isB = i % 3 === 0;
    const it = Box(isB ? baozi(90 + rnd(i, 23) * 50) : RAIN[i % 5], isB ? '' : 'dm y', { t0: ts, t1: T1, z: 15, base: { x }, keys: { y: [[ts, -120], [ts + 1.6, 1250, 'in']], rz: [[ts, 0], [ts + 1.6, (rnd(i, 24) - .5) * 200, 'lin']] } });
    if (!isB) it.el.style.fontSize = (40 + rnd(i, 25) * 30).toFixed(0) + 'px'; }
  Ticker({ text: '豆包体：「我用最直白、最直接、最不绕弯子的方式告诉你」　·　网友：退票说扣 5%，实扣 40%　·　同一问题问三次，三个答案　·　#豆包不会做馒头# 曾登热搜第一', cls: 'yellow', item: { t0: 62.0, t1: T1, z: 70, keys: A.from(62.0, .3, 'y', 1110, 1050) } });
})();

// ================= 15 · 未来：四张“？”卡翻面 66.9–70.4（v8：卡面换成剪影 sil_*.png，未官宣 = 剪影） =================
(() => {
  const T0 = 66.9, T1 = 70.4;
  News({ src: '前瞻 · 传闻', color: '#c77d1a', date: '2026-10-12', title: '10 月底，可能是国产模型最挤的两周', sub: '时间表均为传闻，尚无官宣', fs: 36, w: 820, theme: 'dark', tag: '未官宣', item: { t0: 66.94, t1: T1, z: 9, base: { x: 960, y: 140 }, keys: A.from(66.94, .35, 'y', -200, 140, 'back') } });
  const C = [['ds', 'DeepSeek V4.1 Pro', '传 10 月下旬', '#4d6bfe', 67.70], ['qwen', 'Qwen 4', '传 10 月底–11 月初', '#7c5cff', 68.22], ['glm', 'GLM-5.5', '传 10 月底', '#2bc4b0', 68.70], ['kimi', 'Kimi K3.1', '传 10 月中下旬', '#8ec5ff', 69.08]];
  C.forEach(([n, nm, eta, c, ts], i) => {
    const card = Box(`<div class="face f silf" style="--c:${c}"><img class="sil" src="assets/chars/sil_${n}.png"><div class="cap"><div class="nm">${nm}</div><div class="eta">${eta}</div></div></div><div class="face q">?</div>`, 'card', { t0: 66.94, t1: T1, z: 10, base: { x: 390 + i * 380, y: 560 }, keys: K(A.from(66.94 + i * .06, .35, 'y', 1400, 560, 'out5'), { ry: [[ts - .02, 180], [ts + .45, 0, 'back']], s: [[ts, 1], [ts + .1, 1.08], [ts + .4, 1]] }) });
    card.el.style.setProperty('--c', c);
    card.glint = [[ts + .28, .5, '.face.f']]; card.hits = [[ts + .46, .4, .5, c]]; // 翻完再提亮（滤镜会压平 3D，避开翻面过程）
  });
  Ticker({ text: 'DeepSeek V4.1 Pro · GLM-5.5 · Kimi K3.1　传 10 月下旬至月底　·　Qwen 4 Max & 27B　传 10 月底–11 月初　·　均为传闻，尚无官宣', cls: 'navy', item: { t0: 67.0, t1: T1, z: 70, keys: A.from(67.0, .3, 'y', 1110, 1050) } });
})();
