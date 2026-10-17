// v10：S21 放大官方图、强调帕累托最优 + V4.1 Pro 展望；S15 GLM/Kimi 剪影回第一版改发色
// v9（2026-10-17）：S16–S19 加官方 logo；S17/S18/S19 加新闻证据页；S18 换 v7 底片；S20 删标题 + 转场；S21 换官方图、去「作者判断」
// ================= 后段接续（S16–S21，按 文稿/01_文稿与分镜_v3_按v5样片修订.md「接续规划」逐镜补） =================
// 前 70.4 秒（shots.js）不动；本文件只追加 70.4 秒之后的镜头。

// ---------- v8：AI 底片图像序列（24 fps，ffmpeg 864×480 → lanczos 1920×1080；换超分版时只替换 assets/clips/<key>/ 里的帧） ----------
// tin：序列第 1 帧对应的成片时间（默认 t0；早于 tin 时停在首帧）
function Clip(key, n, o) {
  const fps = o.fps || 24, tin = o.tin ?? o.t0;
  const html = Array.from({ length: n }, (_, i) => `<img src="assets/clips/${key}/f_${String(i + 1).padStart(3, '0')}.jpg" style="position:absolute;left:0;top:0;width:1920px;height:1080px;display:none">`).join('');
  const b = Box(`<div style="position:relative;width:1920px;height:1080px;overflow:hidden">${html}</div>`, 'clip', Object.assign({ base: { x: W / 2, y: H / 2 } }, o));
  const all = [...b.el.querySelectorAll('img')]; let cur = -1;
  b.upd = (t) => { const i = Math.min(n - 1, Math.max(0, Math.floor((t - tin) * fps + 1e-6))); if (i !== cur) { if (cur >= 0) all[cur].style.display = 'none'; all[i].style.display = 'block'; cur = i; } };
  b.frost = false;
  return b;
}
// 品牌巨型字回声（官方 logo 进 PR/AE 时可直接替换）：大号模糊字 + 慢漂移
function Echo(text, c, o) {
  const e = Box(text, 'echo', Object.assign({ z: 2 }, o));
  e.el.style.setProperty('--c', c);
  return e;
}
// 品牌色光晕（screen 叠加，缓慢呼吸）
function Glow(c, o, size = 1100) {
  const g = Box('', 'bglow', Object.assign({ z: 2 }, o));
  g.el.style.cssText += `;width:${size}px;height:${size}px;background:radial-gradient(closest-side, ${c}, transparent)`;
  const ph = (o.base && o.base.x || 0) / 300;
  const prev = g.upd; g.upd = (t, lt, it) => { it.el.style.opacity = (parseFloat(it.el.style.opacity) * (.8 + .2 * Math.sin(t * 1.7 + ph))).toFixed(3); if (prev) prev(t, lt, it); };
  return g;
}

// v9：官方 logo（assets/logos/*.svg，lobehub 图标；白字版 + 彩色版）——清晰小标 + 模糊大回声
function Logo(name, o, h = 56, text = true) {
  const im = `<img src="assets/logos/${name}.svg" style="height:${h}px;display:block">` + (text ? `<img src="assets/logos/${name}_text.svg" style="height:${Math.round(h * .62)}px;display:block">` : '');
  const b = Box(`<div style="display:flex;align-items:center;gap:${Math.round(h * .28)}px;padding:${Math.round(h * .2)}px ${Math.round(h * .34)}px;border-radius:${Math.round(h * .3)}px;background:rgba(8,12,24,.5);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14)">${im}</div>`, 'blogo', Object.assign({ z: 30, glow: 'drop-shadow(0 4px 16px rgba(0,0,0,.6))' }, o));
  b.frost = false; return b;
}
function LogoEcho(name, c, o, h = 560) {
  const b = Box(`<img src="assets/logos/${name}.svg" style="height:${h}px;display:block">`, 'blecho', Object.assign({ z: 2, glow: `drop-shadow(0 0 70px ${c})` }, o));
  b.el.style.mixBlendMode = 'screen'; b.frost = false; return b;
}

// 背景：S15 的暖色段截到 70.4，S16 起回到 DeepSeek 蓝 + 一点暖金
BG.forEach((b) => { if (b.t0 === 66.9) b.t1 = 70.4; });
BG.push({ t0: 70.4, t1: 99, c1: 'rgba(77,107,254,.50)', c2: '#0a1226', c3: 'rgba(255,190,110,.28)', grid: .12, mist: .45 });
ZOOM.push([70.45, 1, 'step'], [73.3, 1.025, 'lin']);
// 歌词：与首段「忘不了惊鸿一眼」(47.58) 同句；对原曲 47.3–50.7s 与其后 +22.5–23.2s 做起音包络互相关，峰值 +22.90s
// （与第二段副歌已校时值的偏移 22.84–22.90 一致），据此推算；如需逐字精校再按原曲微调
lyric('忘不了惊鸿一眼', [70.48, 71.22, 71.43, 71.64, 72.28, 72.48, 72.68], 73.15);

// ================= 16 · Flash-1017 正式更新：官方标签揭开 + 液态玻璃放大镜扫过新旧值 70.4–73.3 =================
// 文稿：用“官方更新标签揭开 / 新旧值替换”，不翻第五张问号牌、不强加山巅拔剑；A09 视频是否叠用留到后段试剪。
// 数据：DeepSeek 官方更新日志 2026-10-17（1017）与 2026-09-10（上一版 V4.1 Flash）同名指标；同表对照按文稿固定事实。
(() => {
  const T0 = 70.4, T1 = 73.3, CX = 640, CY = 430, W1 = 860; // v8：卡片整体左移 60 px，避开底片里向左飘的头发
  // v8：DeepSeek 立绘与右侧滑入取消，改用 A09 v5 AI 底片（S16 对位 2.9 s，24 fps → 70 帧）；73.30 切走，剩余帧不用
  Clip('a09', 70, { t0: T0, t1: T1, z: 1, keys: A.fadeIn(T0, .25) });
  // [指标, 框架注, 9/10 旧值, 1017 新值, 放大镜经过（换值）时刻]
  const ROWS = [
    ['Terminal-Bench 4.0', 'Claude Code 框架', 31.2, 42.3, 71.25],
    ['ProgramBench', '代码项目生成', 20.3, 29.1, 71.65],
    ['DeepSWE v1.1', 'Mini-SWE-V2 框架', 74.2, 77.0, 72.10],
  ];
  const rows = ROWS.map(([nm, fw, v0, v1], i) => `<div class="u-row r${i}"><div class="u-nm">${nm}<small>${fw}</small></div><div class="u-old">${v0.toFixed(1)}</div><div class="u-val">${v0.toFixed(1)}</div><div class="u-tag">9/10 版</div><div class="u-d">+${(v1 - v0).toFixed(1)}</div></div>`).join('');
  const card = Box(`<div class="u-head"><span class="u-chip"><i></i>官方更新日志</span><span class="u-date">2026.10.17 · 正式更新</span></div>
    <div class="u-title">DeepSeek-V4.1-Flash-1017</div>
    <div class="u-sub">API 价格不变 · 仍用 <code>deepseek-flash</code> 调用</div>
    <div class="u-rows">${rows}</div>
    <div class="u-cmp">DeepSWE v1.1 同表<b class="me">1017　77.0</b><b>Opus 5　74.0</b><b>GPT-5.6 Sol　73.0</b></div>
    <div class="u-src">来源：DeepSeek 官方评测 / 官方更新日志 · 旧值为 2026-09-10 V4.1 Flash</div>`, 'panel u1017', {
    t0: T0, t1: T1, z: 9, base: { x: CX, y: CY }, keys: K({ y: [[T0, CY + 8], [T0 + .7, CY, 'out']] }, A.fadeIn(T0, .5)) });
  card.frost = true; // 必上玻璃（GLASS_SCOPE 也覆盖此段）
  card.el.style.width = W1 + 'px';
  const q = (s) => document.querySelectorAll('.u1017 ' + s); // 同时更新放大镜里的克隆
  card.upd = (t) => {
    const kr = EASE.out(clamp((t - 70.55) / .45)); // 官方更新标签揭开
    q('.u-chip').forEach((e) => { e.style.clipPath = `inset(0 ${(100 - 100 * kr).toFixed(1)}% 0 0 round 99px)`; });
    ROWS.forEach(([, , v0, v1, ts], i) => {
      const on = t >= ts, k = EASE.out5(clamp((t - ts) / .4));
      q(`.r${i} .u-val`).forEach((e) => { e.textContent = (on ? lerp(v0, v1, k) : v0).toFixed(1); e.classList.toggle('new', on); });
      q(`.r${i} .u-old`).forEach((e) => { e.style.opacity = (on ? k * .85 : 0).toFixed(3); });
      q(`.r${i} .u-tag`).forEach((e) => { e.textContent = on ? '1017' : '9/10 版'; e.classList.toggle('new', on); });
      q(`.r${i} .u-d`).forEach((e) => { e.style.opacity = k.toFixed(3); e.style.transform = `translateY(${(8 * (1 - k)).toFixed(1)}px)`; });
    });
    const kc = EASE.out(clamp((t - 72.78) / .45)); // 放大镜离场后，同表对照慢慢浮现（opacity + 8px）
    q('.u-cmp').forEach((e) => { e.style.opacity = kc.toFixed(3); e.style.transform = `translateY(${(8 * (1 - kc)).toFixed(1)}px)`; });
  };

  // ---- 液态玻璃放大镜：克隆卡片内容放大 1.5×，边缘一圈 SVG 折射 + RGB 色散，顶部高光 ----
  const R = 120, D = 2 * R;
  // 「惊鸿一眼」：停在 77.0 上，唱到「眼」(72.68) 后镜片收拢淡出，把同表对照让出来
  const lens = Box('<div class="lclip"><div class="lfx"></div></div><div class="lrim"></div>', 'lens1017', { t0: 70.95, t1: 73.1, z: 12, keys: K(A.fadeIn(70.95, .25), { o: [[72.72, 1], [73.04, 0, 'io']] }) });
  lens.el.style.width = lens.el.style.height = D + 'px';
  let clone = null, LX, LY;
  lens.upd = (t, lt, it, p) => {
    if (!clone) {
      makeLensFilter('lensCA', D);
      clone = card.el.cloneNode(true); clone.removeAttribute('style'); clone.className = 'panel u1017 lzc'; clone.style.width = W1 + 'px';
      lens.el.querySelector('.lfx').appendChild(clone);
      const bl = card.el.clientLeft, bt = card.el.clientTop;
      const pts = [...card.el.querySelectorAll('.u-row')].map((r) => { const v = r.querySelector('.u-val'); return [bl + v.offsetLeft + v.offsetWidth / 2, bt + v.offsetTop + v.offsetHeight / 2]; });
      LX = [[70.95, -170], [71.25, pts[0][0], 'io'], [71.38, pts[0][0] + 6, 'io'], [71.62, pts[1][0] + 12, 'io'], [71.75, pts[1][0] + 8, 'io'], [72.07, pts[2][0], 'io']];
      LY = [[70.95, pts[0][1]], [71.38, pts[0][1], 'io'], [71.62, pts[1][1], 'io'], [71.75, pts[1][1], 'io'], [72.07, pts[2][1], 'io']];
    }
    const hold = Math.max(0, t - 72.07);
    const lx = kf(t, LX) + Math.sin(hold * 2.1) * 4 * clamp(hold / .3), ly = kf(t, LY) + Math.sin(hold * 1.6 + 1) * 3 * clamp(hold / .3);
    // 液态感：按速度沿运动方向轻微拉伸
    const vx = (kf(t + 1 / 60, LX) - kf(t, LX)) * 60, vy = (kf(t + 1 / 60, LY) - kf(t, LY)) * 60;
    const sp = Math.min(0.07, Math.hypot(vx, vy) / 9000), ang = Math.atan2(vy, vx) * 180 / Math.PI;
    // 「一眼」(72.42) 时镜片轻轻一鼓：放大倍率 1.5 → 1.62 → 1.55
    const S = 1.5 + .12 * Math.sin(Math.PI * clamp((t - 72.42) / .5)) * (t < 72.67 ? 1 : 0) + .05 * clamp((t - 72.67) / .3);
    const cy = kf(t, card.keys.y) ?? CY;
    const x0 = CX - card.el.offsetWidth / 2, y0 = cy - card.el.offsetHeight / 2;
    const out = EASE.io(clamp((t - 72.72) / .32)), ls = 1 - .35 * out; // 离场：收拢 + 上浮
    it.el.style.transform = `translate(-50%,-50%) translate3d(${(x0 + lx).toFixed(2)}px,${(y0 + ly - 26 * out).toFixed(2)}px,0) rotate(${ang.toFixed(1)}deg) scale(${((1 + sp) * ls).toFixed(4)},${((1 - sp) * ls).toFixed(4)}) rotate(${(-ang).toFixed(1)}deg)`;
    clone.style.transform = `translate(${(R - lx * S).toFixed(2)}px,${(R - ly * S).toFixed(2)}px) scale(${S.toFixed(4)})`;
  };

  Logo('ds', { t0: 70.5, t1: T1, base: { x: 168, y: 74 }, keys: A.fadeIn(70.6, .4) }, 50); // v9：左上角空白处
  Ticker({ text: '2026-10-17 官方更新日志　·　DeepSeek-V4.1-Flash-1017 正式更新　·　DeepSWE v1.1 77.0 / Terminal-Bench 4.0 42.3 / ProgramBench 29.1　·　API 价格不变，仍用 deepseek-flash　·　DeepSeek 官方评测', cls: 'navy', item: { t0: 70.5, t1: T1, z: 70, keys: A.from(70.5, .4, 'y', 1110, 1050) } });
})();

// ================= v8 · S17–S21：AI 底片 + 品牌节拍 + 结论卡（文稿/01_文稿与分镜_v5_按v7样片修订.md §四；03_AI视频清单_v6_后段.md） =================
// 歌词：按 文稿/歌词时间轴.srt 第 17–20 句起点，对首段副歌同句的逐字时值做整体平移（+22.95 / +22.85 / +22.85 / +23.10）；逐字可在试剪时按原曲微调
lyric('独自卷帘望寒星几点', [73.35, 74.17, 74.37, 74.65, 75.01, 75.55, 75.79, 76.11, 76.57], 78.10);
lyric('躲不了岁月催老少年', [78.23, 78.99, 79.29, 79.59, 80.09, 80.47, 80.83, 81.09, 81.35], 81.66);
lyric('寻不到爱恨缠绵', [81.81, 82.55, 82.76, 82.97, 83.69, 84.01, 84.27], 84.50);
lyric('既然无缘寻一场好眠', [84.82, 85.82, 86.00, 86.40, 86.76, 87.08, 87.48, 87.72, 88.18], 89.70);
ZOOM.push([73.3, 1, 'step'], [75.8, 1.02, 'lin'], [75.8, 1, 'step'], [78.2, 1.02, 'lin'], [78.2, 1, 'step'], [81.8, 1.025, 'lin'],
  [81.8, 1, 'step'], [84.2, 1.03, 'lin'], [84.75, 1.12, 'io'], [85.4, 1, 'out'], [90.67, 1.03, 'lin']); // v9：S20→S21 推近后在 S21 回落，不再硬切
// 镜间只用边缘漏光 + 硬切，不加全屏白闪 / 震屏（慢段）
LEAK.push([73.26, .4, 'rgba(160,140,255,.85)', 'r', .32], [75.76, .4, 'rgba(120,230,215,.8)', 'l', .3], [78.16, .45, 'rgba(150,200,255,.85)', 'tr', .34],
  [84.5, .7, 'rgba(255,205,140,.9)', 'l', .42]);

// ---- S17 · Qwen 4：人物在左（底片）；右侧先叠两页证据（预览评测 / HF 社区量化），“卷帘”时收进下方，Qwen 4 卡片展开 73.30–75.80 ----
(() => {
  const T0 = 73.3, T1 = 75.8, C = '#7c5cff', TW = 74.37; // TW：卷帘（卡片展开、证据收起）
  Clip('s17', 58, { t0: T0, t1: T1, tin: 73.40, z: 1 });
  Glow('rgba(124,92,255,.55)', { t0: T0, t1: T1, base: { x: 1380, y: 380 }, keys: A.fadeIn(T0, .5) });
  LogoEcho('qwen', 'rgba(124,92,255,.9)', { t0: T0, t1: T1, base: { x: 1420, y: 430, blur: 16, o: .3 }, keys: K({ s: [[T0, 1.12], [T1, 1.0, 'lin']], x: [[T0, 1480], [T1, 1400, 'lin']] }, { o: [[T0, 0], [73.9, .3, 'lin']] }) });
  Logo('qwen', { t0: T0, t1: T1, base: { x: 1782, y: 72 }, keys: A.fadeIn(73.4, .4) }, 54);
  // 证据 1：千问 AI 平台「Qwen 预览模型评测第二期」（2026-09-30 结束）
  Browser({ img: SH('qwen_drops'), srcW: 1920, url: 'qianwenai.com/drops/qwen-0922', w: 700, vh: 400, scroll: [[73.35, 150], [TW, 210, 'lin']],
    marks: [[430, 280, 1020, 200, 73.7]],
    item: { t0: 73.35, t1: T1, z: 5, base: { x: 1170, y: 390 }, keys: K(A.pop(73.35, .3, .8),
      { x: [[TW - .05, 1170], [TW + .4, 1470, 'io']], y: [[TW - .05, 390], [TW + .4, 655, 'io']], s: [[TW - .05, 1], [TW + .4, .5, 'io']], o: [[TW - .05, 1], [TW + .4, .6, 'io']], rz: [[TW - .05, 0], [TW + .4, -3, 'io']] }) } });
  Box('内测反馈：Qwen 预览模型「能力很强」', 'stamp tag', { t0: 73.9, t1: TW + .3, z: 9, base: { x: 1120, y: 618 }, keys: K(A.tagFlip(73.9), A.fadeOut(TW, .3)) }).el.style.cssText += ';--c:#9d86ff;font-size:24px;background:rgba(14,10,30,.85)';
  // 证据 2：HF 社区量化 Qwen3.8-Flash-Next（社区评价：前端很强）
  Browser({ img: SH('qwen38_next_hf'), srcW: 1920, url: 'huggingface.co/Maximilian228/Qwen3.8-Flash-Next-NVFP4-GPTQ-Strata', w: 640, vh: 360, dark: true, scroll: [[73.95, 0], [T1, 140, 'lin']],
    marks: [[10, 400, 900, 220, 74.2]],
    item: { t0: 73.95, t1: T1, z: 6, base: { x: 1330, y: 560, rz: 2 }, keys: K(A.pop(73.95, .3, .8),
      { x: [[TW - .05, 1330], [TW + .4, 1660, 'io']], y: [[TW - .05, 560], [TW + .4, 700, 'io']], s: [[TW - .05, 1], [TW + .4, .54, 'io']], o: [[TW - .05, 1], [TW + .4, .82, 'io']] }) } });
  Box('Qwen3.8-Flash-Next · 社区实测：前端很强', 'stamp tag', { t0: 74.08, t1: TW + .3, z: 9, base: { x: 1330, y: 775 }, keys: K(A.tagFlip(74.08), A.fadeOut(TW, .3)) }).el.style.cssText += ';--c:#9d86ff;font-size:24px;background:rgba(14,10,30,.85)';
  // 页签：先从右缘贴入一枚小 tab，再在“卷帘”向下展开成卡（卡片缩到 0.85，挪到右上）
  const tab = Box(`<i></i>Qwen 4<span>前瞻 · 传闻</span>`, 'btab', { t0: 73.6, t1: T1, z: 8, base: { x: 1560, y: 150 }, keys: K(A.from(73.6, .45, 'x', 2050, 1560, 'out5'), A.fadeIn(73.6, .1)) });
  tab.el.style.setProperty('--c', C);
  const card = Box(`<div class="bc-name">Qwen 4</div><div class="bc-sub">Max &amp; 27B</div>
    <div class="bc-eta">传 10 月底–11 月初</div>
    <div class="bc-ev" style="margin-top:12px;font:600 21px/1.5 'Microsoft YaHei','Noto Sans CJK SC',sans-serif;color:#d9d2ff">· 预览模型内测反馈：能力很强<br>· Qwen3.8-Flash-Next 社区实测：前端很强</div>
    <div class="bc-foot">未官宣 · 时间表以官方发布为准</div>`, 'panel bcard', { t0: TW, t1: T1, z: 7, base: { x: 1560, y: 365, s: .85 }, keys: A.fadeIn(TW, .08) });
  card.el.style.setProperty('--c', C); card.wipe = [TW, .5, 'd']; card.glint = [[75.05, .55]];
  card.frost = true;
  const eta = card.el.querySelector('.bc-eta'), ev = card.el.querySelector('.bc-ev');
  card.upd = (t) => {
    const k = EASE.out5(clamp((t - 75.01) / .3)); eta.style.transform = `perspective(600px) rotateX(${(88 * (1 - k)).toFixed(1)}deg)`; eta.style.opacity = k.toFixed(3);
    const ke = EASE.out(clamp((t - 74.75) / .35)); ev.style.opacity = ke.toFixed(3); ev.style.transform = `translateY(${(8 * (1 - ke)).toFixed(1)}px)`;
  };
})();

// ---- S18 · GLM-5.5：人物在右（v7 底片，GLM 本人设定）；左侧先叠新浪科技页（摩根大通预测万亿参数），“点”时卡片压上来分层切换 75.80–78.20 ----
(() => {
  const T0 = 75.8, T1 = 78.2, C = '#2bc4b0', TC = 76.57; // TC：卡片压入（“点”）
  Clip('s18v7', 58, { t0: T0, t1: T1, z: 1 });
  Glow('rgba(160,210,230,.45)', { t0: T0, t1: T1, base: { x: 560, y: 380 }, keys: A.fadeIn(T0, .5) });
  LogoEcho('glm', 'rgba(190,232,240,.85)', { t0: T0, t1: T1, base: { x: 560, y: 400, blur: 16, o: .24 }, keys: K({ s: [[T0, 1.12], [T1, 1.0, 'lin']], x: [[T0, 500], [T1, 580, 'lin']] }, { o: [[T0, 0], [76.3, .24, 'lin']] }) }, 520);
  Logo('glm', { t0: T0, t1: T1, base: { x: 112, y: 72 }, keys: A.fadeIn(75.9, .4) }, 50);
  // 证据：新浪科技 2026-06-22「智谱 GLM-5.5 将升级万亿参数」——摩根大通预测
  Browser({ img: SH('glm55_jpm'), srcW: 1920, url: 'finance.sina.com.cn/tech/discovery/2026-06-22/…', w: 720, vh: 420, scroll: [[75.85, 300], [75.95, 300], [76.3, 1180, 'io']],
    marks: [[200, 1750, 940, 92, 76.28]],
    item: { t0: 75.85, t1: 77.3, z: 5, base: { x: 640, y: 380 }, keys: K(A.pop(75.85, .3, .85),
      { o: [[76.75, 1], [77.05, 0, 'io']], blur: [[76.75, 0], [77.05, 8, 'in']], y: [[76.75, 380], [77.05, 330, 'io']] }) } });
  Box('摩根大通预测：GLM-5.5 参数量将突破 1 万亿', 'stamp tag', { t0: 76.3, t1: T1, z: 9, base: { x: 560, y: 640 }, keys: K(A.tagFlip(76.3), { y: [[76.75, 640], [77.1, 712, 'io']] }) }).el.style.cssText += ';--c:#2bc4b0;font-size:26px;background:rgba(8,18,22,.85)';
  const card = Box(`<div class="bc-old"><b>上一页 · S12</b>ZCode 风波：09-18 致歉 · 09-19 修复 · 09-21 开源</div>
    <div class="bc-new"><div class="bc-state"><span class="s0">等待中</span><span class="s1">下一站</span></div><div class="bc-name">GLM-5.5</div>
    <div class="bc-eta">传 10 月底 · 预测破万亿参数</div><div class="bc-foot">未官宣 · 旧事件与新能力分开看</div></div>`, 'panel bcard glm', { t0: TC, t1: T1, z: 7, base: { x: 560, y: 470 },
    keys: K(A.settle(TC, .4, .96)) });
  card.el.style.setProperty('--c', C); card.frost = true; card.glint = [[77.55, .55]];
  const old = card.el.querySelector('.bc-old'), nw = card.el.querySelector('.bc-new'), s0 = card.el.querySelector('.s0'), s1 = card.el.querySelector('.s1'), eta = card.el.querySelector('.bc-eta');
  card.upd = (t) => {
    const ko = EASE.io(clamp((t - 76.92) / .45)); // 旧事件压暗、收起
    old.style.opacity = (1 - .65 * ko).toFixed(3); old.style.maxHeight = (90 - 52 * ko).toFixed(1) + 'px'; old.style.filter = `saturate(${(1 - ko).toFixed(2)})`;
    const kn = EASE.out(clamp((t - 76.97) / .4)); nw.style.opacity = (.25 + .75 * kn).toFixed(3); nw.style.transform = `translateY(${(14 * (1 - kn)).toFixed(1)}px)`;
    const ks = EASE.out5(clamp((t - 77.22) / .28)); // 合书抱紧、抬眼后：状态翻牌（呼应 S12 的状态标签）
    s0.style.transform = `perspective(500px) rotateX(${(-88 * ks).toFixed(1)}deg)`; s0.style.opacity = (1 - ks).toFixed(3);
    s1.style.transform = `perspective(500px) rotateX(${(88 * (1 - ks)).toFixed(1)}deg)`; s1.style.opacity = ks.toFixed(3);
    const ke = EASE.out5(clamp((t - 77.38) / .3)); eta.style.opacity = ke.toFixed(3); eta.style.transform = `translateX(${(-16 * (1 - ke)).toFixed(1)}px)`;
  };
})();

// ---- S19 · Kimi K3.1：人物在左（底片），右侧时间轴承接 S13 的机械日期，末端“Kimi K3.1 · 待开启” 78.20–81.80 ----
(() => {
  const T0 = 78.2, T1 = 81.8, C = '#8ec5ff';
  Clip('s19', 87, { t0: T0, t1: T1, z: 1, keys: { blur: [[81.55, 0], [81.8, 8, 'in']] } });
  Glow('rgba(170,205,255,.42)', { t0: T0, t1: T1, base: { x: 1560, y: 180 }, keys: K(A.fadeIn(T0, .4), { s: [[79.6, 1], [80.4, 1.25, 'out']] }) }, 900);
  LogoEcho('kimi', 'rgba(170,205,255,.85)', { t0: T0, t1: T1, base: { x: 1400, y: 470, blur: 16, o: .24 }, keys: K({ s: [[T0, 1.1], [T1, 1.0, 'lin']] }, { o: [[T0, 0], [78.8, .24, 'lin']] }) }, 520);
  Logo('kimi', { t0: T0, t1: T1, base: { x: 1792, y: 70 }, keys: A.fadeIn(78.3, .4) }, 52);
  // 证据：快科技 2026-10-11（新浪转载）「Kimi K3.1 月中发布：K4 要冲 5–6 万亿参数」——野村
  Browser({ img: SH('kimi_k31_sina'), srcW: 1920, url: 'finance.sina.com.cn/tech/roll/2026-10-11/…', w: 700, vh: 360, scroll: [[79.0, 640], [80.1, 900, 'lin']],
    marks: [[200, 890, 915, 92, 79.3], [200, 1316, 915, 90, 79.75]],
    item: { t0: 79.0, t1: 80.35, z: 5, base: { x: 1380, y: 560 }, keys: K(A.pop(79.0, .3, .85), { o: [[80.02, 1], [80.32, 0, 'io']], blur: [[80.02, 0], [80.32, 8, 'in']] }) } });
  Box('野村：K3.1 10 月中旬前发布 · 重点提升 Agent 长任务', 'stamp tag', { t0: 79.6, t1: 80.35, z: 9, base: { x: 1380, y: 790 }, keys: K(A.tagFlip(79.6), A.fadeOut(80.02, .3)) }).el.style.cssText += ';--c:#8ec5ff;font-size:24px;background:rgba(10,14,28,.85)';
  // [时间, 日期, 事件, 状态]  状态：done 已发生 / quiet 无消息 / next 待开启
  const N = [[78.30, '07-16', 'K3 发布', 'done'], [78.55, '07-27', 'K3 权重开源', 'done'], [78.99, '09-11', 'K2.8 Preview', 'done'],
    [79.29, '09-20', '无消息', 'quiet'], [79.45, '10-08', '无消息', 'quiet'], [79.59, '10-16', '……', 'quiet'], [80.09, '传 10 月中下旬', 'Kimi K3.1', 'next']];
  const X0 = 960, X1 = 1830, Y = 220, xs = N.map((_, i) => X0 + (X1 - X0) * i / (N.length - 1));
  const tl = Box(`<div class="tl-line"><i></i></div>${N.map(([, d, ev, st], i) => `<div class="tl-n ${st}" style="left:${xs[i] - X0}px"><b></b><div class="d">${d}</div><div class="e">${ev}</div></div>`).join('')}`,
    'tl', { t0: T0, t1: T1, z: 7, base: { x: (X0 + X1) / 2, y: Y }, keys: A.fadeIn(78.25, .2) });
  tl.el.style.width = (X1 - X0) + 'px'; tl.el.style.setProperty('--c', C);
  const fill = tl.el.querySelector('.tl-line i'), nodes = [...tl.el.querySelectorAll('.tl-n')];
  tl.upd = (t) => {
    let p = 0; N.forEach(([ts], i) => { if (t >= ts) p = i + EASE.out(clamp((t - ts) / .2)) - 1; });
    fill.style.width = (Math.max(0, p) / (N.length - 1) * 100).toFixed(2) + '%';
    nodes.forEach((e, i) => { const k = EASE.out5(clamp((t - N[i][0]) / .25)); e.style.opacity = k.toFixed(3); e.style.transform = `translateY(${(10 * (1 - k)).toFixed(1)}px)`; });
  };
  // 待开启标签：睁眼望月（≈79.7–80.45）时浮出，虚线框呼吸
  const tag = Box('<span class="lk"></span>Kimi K3.1 · 待开启', 'kopen', { t0: 80.09, t1: T1, z: 9, base: { x: 1560, y: 420 }, keys: K(A.settle(80.09, .5, .92)) });
  tag.el.style.setProperty('--c', C); tag.glint = [[80.7, .6]]; tag.frost = true;
  tag.upd = (t) => { tag.el.style.boxShadow = `0 0 ${(26 + 14 * Math.sin(t * 3.2)).toFixed(1)}px rgba(142,197,255,.45), inset 0 0 0 1px rgba(255,255,255,.18)`; };
  Box('未官宣 · 时间为传闻', 'stamp tag', { t0: 80.47, t1: T1, z: 9, base: { x: 1560, y: 510 }, keys: A.tagFlip(80.47) }).el.style.cssText += ';--c:#8ec5ff;font-size:22px;background:rgba(10,14,28,.8)';
  Box('快科技：K4 冲 5–6 万亿参数（在训）', 'stamp tag', { t0: 80.83, t1: T1, z: 9, base: { x: 1560, y: 600 }, keys: A.tagFlip(80.83) }).el.style.cssText += ';--c:#cfe4ff;font-size:24px;background:rgba(10,14,28,.82)';
})();

// ---- S20 · 群像回扣：各家仍在江湖里（对齐 / 留位，不再大爆炸）81.80–84.80 ----
(() => {
  const T0 = 81.8, T1 = 84.8;
  BG.push({ t0: 81.8, t1: 84.8, c1: 'rgba(120,150,255,.40)', c2: '#0b1022', c3: 'rgba(255,200,130,.30)', grid: .06, mist: .7 });
  BG.sort((a, b) => a.t0 - b.t0); BG.forEach((b) => { if (b.t0 === 70.4) b.t1 = 81.8; });
  BG.push({ t0: 84.8, t1: 99, c1: 'rgba(77,107,254,.50)', c2: '#0a1226', c3: 'rgba(255,190,110,.28)', grid: .12, mist: .45 });
  Box('', 'horizon', { t0: T0, t1: T1, z: 1, base: { x: 960, y: 720 }, keys: K(A.unfold(81.85, .8), { o: [[81.85, 0], [82.2, .8, 'lin'], [84.3, .8], [84.65, 0, 'io']] }) });
  // 后排：海外四家，较小、偏冷、压暗；前排：国模五家对齐站位，中位留给最后升起的 DeepSeek（“缠”，接 S21）
  const back = [['gpt', 560], ['claude', 820], ['gemini', 1100], ['grok', 1360]];
  back.forEach(([n, x], i) => Char(n, { h: 470, item: { t0: T0, t1: T1, z: 2, glow: BLUE_GLOW, base: { x, y: 430, br: .62, sat: .7 },
    keys: K(A.from(81.86 + i * .06, .7, 'y', 470, 430, 'out'), { o: [[81.86 + i * .06, 0], [82.3 + i * .06, .85, 'lin'], [84.2, .85], [84.5, 0, 'io']], blur: [[84.2, 0], [84.5, 10, 'in']] }) } }));
  const front = [['seed', 200, 82.55], ['kimi', 520, 82.76], ['qwen', 1400, 82.97], ['glm', 1720, 83.18]];
  front.forEach(([n, x, ts]) => Char(n, { h: 600, item: { t0: T0, t1: T1, z: 4, glow: GOLD_GLOW, base: { x, y: 500 },
    keys: K(A.from(ts - .3, .6, 'y', 560, 500, 'out'), A.fadeIn(ts - .3, .3), { o: [[84.22, 1], [84.55, 0, 'io']], blur: [[84.22, 0], [84.55, 12, 'in']], x: [[84.22, x], [84.6, x + (x < 960 ? -90 : 90), 'in']] }) } }));
  Char('ds', { h: 640, item: { t0: T0, t1: T1, z: 5, glow: BLUE_GLOW, base: { x: 960, y: 500 }, keys: K(A.from(83.69 - .3, .6, 'y', 560, 500, 'out'), A.fadeIn(83.69 - .3, .3), { s: [[84.2, 1], [84.7, 1.25, 'io']], o: [[84.55, 1], [84.8, 0, 'lin']], blur: [[84.55, 0], [84.8, 6, 'in']] }) } });
  // v9：删去顶部「各家仍在江湖里」；84.2–84.7 转场：其余角色虚化淡出，DeepSeek 推近，S21 底片从模糊中浮出（见 S21 Clip）
})();

// ---- S21 · DeepSeek：人物在右（底片挥手），左半边结论卡（旧资料与新成绩同框更新），跟随尾音淡出 84.80–90.67 ----
(() => {
  const T0 = 84.8, T1 = 90.67, C = '#4d6bfe';
  // v9：S21 底片 84.55 起从模糊中浮出（盖在 S20 群像之上），84.95 清晰
  Clip('s21', 141, { t0: 84.55, t1: T1, tin: T0, z: 6, keys: { o: [[84.55, 0], [84.95, 1, 'io']], blur: [[84.55, 12], [84.95, 0, 'out']] } });
  Glow('rgba(255,200,130,.30)', { t0: T0, t1: T1, base: { x: 520, y: 420 }, keys: A.fadeIn(T0, .8) }, 1200);
  // v10 结论卡：官方 DeepSWE v1.1 图放大（只取坐标区，去掉图例/脚注）→ 推近强调「帕累托最优」→ 拉回后在前沿外画出 V4.1 Pro 的展望点
  // 坐标：原图按 1000×880 计，裁 y 95–660 → 显示 940×531（f = 0.94）；P(x,y) 把原图坐标换到显示坐标
  const CW = 940, CH = 531, f = .94, P = (x, y) => [(x * f).toFixed(1), ((y - 95) * f).toFixed(1)];
  const FR = [[131, 607], [131, 200], [134, 200], [174, 195], [218, 155], [978, 155]].map(([x, y]) => P(x, y).join(',')).join(' '); // 帕累托前沿
  const [mx, my] = P(218, 155), [gx, gy] = P(631, 112); // 1017 max 点 / V4.1 Pro 展望点（¥20、80% 以上，示意）
  const CHIPS = [['DeepSWE v1.1', 77.0, 86.40], ['Terminal-Bench 4.0', 42.3, 86.58], ['ProgramBench', 29.1, 86.76]];
  const chip = 'display:inline-flex;align-items:baseline;gap:8px;padding:6px 14px;white-space:nowrap;border-radius:99px;background:rgba(77,107,254,.20);border:1px solid rgba(140,165,255,.55);font:600 18px/1.2 "Microsoft YaHei","Noto Sans CJK SC",sans-serif;color:#cdd7ff';
  const card = Box(`<div class="u-head"><span class="u-chip"><i></i>结论</span><span class="u-date">DeepSeek-V4.1-Flash-1017 · DeepSWE v1.1 通过率 vs 每任务费用</span></div>
    <div class="u-chart" style="position:relative;width:${CW}px;height:${CH}px;margin:12px auto 10px;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.35);background:#fff">
      <div class="zl" style="position:absolute;inset:0;transform-origin:16% 14%">
        <img src="assets/ds1017_plot.png" style="width:${CW}px;height:${CH}px;display:block">
        <svg viewBox="0 0 ${CW} ${CH}" width="${CW}" height="${CH}" style="position:absolute;left:0;top:0;overflow:visible">
          <defs><filter id="pglow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          <polyline class="fr" points="${FR}" fill="none" stroke="#ffb020" stroke-width="5" stroke-linejoin="round" filter="url(#pglow)" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/>
          <circle class="rg" cx="${mx}" cy="${my}" r="12" fill="none" stroke="#4d6bfe" stroke-width="4" opacity="0"/>
          <path class="ga" d="M${mx} ${my} Q ${(+mx + +gx) / 2} ${+gy - 30} ${gx} ${gy}" fill="none" stroke="#4d6bfe" stroke-width="3.5" stroke-dasharray="9 7" opacity="0"/>
          <g class="gn" opacity="0" transform="translate(${gx} ${gy})">
            <circle r="15" fill="rgba(77,107,254,.18)" stroke="#4d6bfe" stroke-width="3" stroke-dasharray="5 4"/>
            <text y="7" text-anchor="middle" font-size="20" font-weight="900" fill="#4d6bfe" font-family="Microsoft YaHei,Noto Sans CJK SC,sans-serif">?</text>
            <text x="26" y="8" font-size="21" font-weight="800" fill="#2a3fb8" font-family="Microsoft YaHei,Noto Sans CJK SC,sans-serif">DeepSeek V4.1 Pro？</text>
          </g>
        </svg>
      </div>
      <div class="pl" style="position:absolute;left:300px;top:150px;opacity:0;padding:10px 22px 12px;border-radius:14px;background:rgba(14,20,44,.88);border:2px solid #ffb020;box-shadow:0 0 30px rgba(255,176,32,.45);font-family:'Microsoft YaHei','Noto Sans CJK SC',sans-serif;color:#fff;white-space:nowrap">
        <div style="font:900 46px/1.1 'Microsoft YaHei','Noto Sans CJK SC',sans-serif;color:#ffcf6a;letter-spacing:2px">帕累托最优</div>
        <div style="font:600 19px/1.5 'Microsoft YaHei','Noto Sans CJK SC',sans-serif;color:#dfe5ff">同价位通过率最高 · 同通过率最便宜<br>其余模型都落在这条前沿的右下方</div>
      </div>
    </div>
    <div class="u-chips" style="display:flex;gap:10px;justify-content:center;margin:2px 0 6px">${CHIPS.map(([nm, v]) => `<span class="cp" style="${chip};opacity:0">${nm}<b style="font-size:22px;color:#fff">${v.toFixed(1)}</b></span>`).join('')}</div>
    <div class="u-sum"><b>有望冲击 Flash SOTA</b></div>
    <div class="u-src">API 价格不变 · 数据：DeepSeek 官方评测 / 官方更新日志 · 「V4.1 Pro」位置为示意</div>`, 'panel uend', { t0: 84.9, t1: T1, z: 8, base: { x: 505, y: 405 }, keys: K({ s: [[84.9, .84], [85.4, .9, 'out']] }, A.fadeIn(84.9, .4)) });
  card.el.style.width = '1010px'; card.frost = true; card.glint = [[87.0, .6]];
  const sum = card.el.querySelector('.u-sum'), zl = card.el.querySelector('.zl'), fr = card.el.querySelector('.fr'), rg = card.el.querySelector('.rg'), pl = card.el.querySelector('.pl'),
    ga = card.el.querySelector('.ga'), gn = card.el.querySelector('.gn'), cps = [...card.el.querySelectorAll('.cp')];
  const gaLen = 520; ga.setAttribute('stroke-dasharray', `9 7`);
  card.upd = (t) => {
    // 85.82 推近到前沿（×1.55），86.95 拉回全图
    const zin = EASE.io(clamp((t - 85.82) / .6)), zout = EASE.io(clamp((t - 86.95) / .55));
    zl.style.transform = `scale(${(1 + .55 * zin - .55 * zout).toFixed(4)})`;
    fr.setAttribute('stroke-dashoffset', (100 * (1 - EASE.out(clamp((t - 85.95) / .55)))).toFixed(2)); // 前沿描出来
    let rs = 12, ro = 0; for (const [ts, amp] of [[85.82, 1], [86.40, .6]]) { const k = clamp((t - ts) / .7); if (t >= ts && k < 1) { rs = 12 + 26 * amp * EASE.out(k); ro = Math.max(ro, (1 - k) * amp); } }
    rg.setAttribute('r', rs.toFixed(1)); rg.setAttribute('opacity', Math.max(ro, t >= 86.2 ? .9 : 0).toFixed(3));
    const kp = EASE.out5(clamp((t - 86.18) / .35)), kpo = EASE.io(clamp((t - 86.95) / .45)); // 「帕累托最优」：推近时弹出，拉回时缩到右侧
    pl.style.opacity = kp.toFixed(3);
    pl.style.transform = `translate(${(330 * kpo).toFixed(1)}px,${(140 * kpo).toFixed(1)}px) scale(${((.8 + .2 * kp) * (1 - .22 * kpo)).toFixed(4)})`; pl.style.transformOrigin = '0 0';
    CHIPS.forEach(([, , ts], i) => { const k = EASE.out5(clamp((t - ts) / .35)); cps[i].style.opacity = k.toFixed(3); cps[i].style.transform = `translateY(${(10 * (1 - k)).toFixed(1)}px)`; });
    const ks = EASE.out(clamp((t - 87.48) / .6)); // “好眠”前写出结论
    sum.style.clipPath = `inset(0 ${(100 - 100 * ks).toFixed(1)}% 0 0)`;
    // 87.95 起：从 1017 的 max 点沿虚线伸向前沿之外的 V4.1 Pro 展望点
    const kg = EASE.out(clamp((t - 87.95) / .6)), kn = EASE.out5(clamp((t - 88.4) / .35));
    ga.setAttribute('opacity', (kg > 0 ? 1 : 0).toString()); ga.style.clipPath = `inset(0 ${(100 - 100 * kg).toFixed(1)}% 0 0)`;
    gn.setAttribute('opacity', kn.toFixed(3)); gn.setAttribute('transform', `translate(${gx} ${gy}) scale(${(.6 + .4 * kn).toFixed(3)})`);
  };
  // 右上角空白：DeepSeek V4.1 Pro 展望（与图上的「?」点同时出现）
  const pro = Box(`<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="padding:3px 12px;border-radius:99px;background:#4d6bfe;font:800 18px/1.3 'Microsoft YaHei','Noto Sans CJK SC',sans-serif;color:#fff">展望</span><span style="font:600 18px/1 'Microsoft YaHei','Noto Sans CJK SC',sans-serif;color:#b9c6ff">下一站</span></div>
    <div style="font:900 30px/1.1 'Microsoft YaHei','Noto Sans CJK SC',sans-serif;color:#fff;white-space:nowrap;text-shadow:0 0 18px rgba(77,107,254,.8)">DeepSeek V4.1 Pro</div>
    <div style="margin-top:8px;font:700 18px/1.45 'Microsoft YaHei','Noto Sans CJK SC',sans-serif;color:#dfe6ff">传 10 月下旬 · 未官宣<br><span style="color:#ffcf6a">Flash 已站上前沿<br>Pro 能把它推多高？</span></div>`,
    'panel', { t0: 88.3, t1: T1, z: 9, base: { x: 1718, y: 124 }, keys: K(A.settle(88.3, .45, .9), { o: [[89.2, 1], [89.9, 0, 'lin']], blur: [[89.2, 0], [89.9, 6, 'in']] }) });
  pro.el.style.cssText += ';padding:16px 22px 18px;border-radius:18px;border:1px solid rgba(140,165,255,.55);box-shadow:0 0 40px rgba(77,107,254,.35)'; pro.frost = true; pro.glint = [[88.9, .6]];
  card.hits = [[87.5, .7, .45, 'rgba(255,210,140,.9)']];
  // 尾音：卡片先淡（89.2–89.9），全片 89.9–90.6 收黑
  card.keys = K(card.keys, { o: [[89.2, 1], [89.9, 0, 'lin']], blur: [[89.2, 0], [89.9, 6, 'in']] });
  const P0 = window.POST;
  window.POST = (t) => { if (P0) P0(t); if (t > 89.9) { const b = $('#black'); b.style.opacity = Math.max(parseFloat(b.style.opacity) || 0, clamp((t - 89.9) / .7)).toFixed(3); } };
})();
