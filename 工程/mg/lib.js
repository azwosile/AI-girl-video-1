// 国模·江湖之间 —— 确定性 MG 引擎：每一帧都是时间 t 的纯函数（window.renderAt(t)）
// 坐标系 1920×1080，元素以中心点定位。
'use strict';
const W = 1920, H = 1080;
const $ = (s) => document.querySelector(s);
const STAGE = () => $('#stage');

// ---------- 缓动 ----------
const clamp = (x, a = 0, b = 1) => Math.min(Math.max(x, a), b);
const lerp = (a, b, k) => a + (b - a) * k;
const EASE = {
  lin: (x) => x,
  out: (x) => 1 - Math.pow(1 - x, 3),
  out5: (x) => 1 - Math.pow(1 - x, 5),
  expo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  in: (x) => x * x * x,
  io: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  back: (x) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  el: (x) => (x === 0 || x === 1 ? x : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * (2 * Math.PI) / 3.2) + 1),
  step: (x) => (x < 1 ? 0 : 1),
};
// keys: [[t, v, ease?], ...]；ease 作用于“到达该关键帧”的这一段
function kf(t, keys) {
  if (!keys || !keys.length) return undefined;
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e] = keys[i];
    if (t < t1) {
      const [t0, v0] = keys[i - 1];
      const k = (EASE[e || 'out'])((t - t0) / Math.max(1e-6, t1 - t0));
      return v0 + (v1 - v0) * k;
    }
  }
  return keys[keys.length - 1][1];
}
// 确定性伪随机
function rnd(i, s = 1) { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); }
function noise1(t, s = 0) { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return lerp(rnd(i, s), rnd(i + 1, s), u) * 2 - 1; }

// ---------- 场景元素 ----------
const ITEMS = [];
const PROPS = ['x', 'y', 'z', 's', 'sx', 'sy', 'rx', 'ry', 'rz', 'o', 'blur', 'sat', 'br', 'hue'];
const DEF = { x: W / 2, y: H / 2, z: 0, s: 1, sx: 1, sy: 1, rx: 0, ry: 0, rz: 0, o: 1, blur: 0, sat: 1, br: 1, hue: 0 };
function el(tag, cls, html, parent) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  (parent || STAGE()).appendChild(e);
  return e;
}
// 合并多段关键帧：K({o:[...]},{s:[...]}, ...)
function K(...parts) {
  const out = {};
  for (const p of parts) for (const k in p) { (out[k] = out[k] || []).push(...p[k]); }
  for (const k in out) out[k].sort((a, b) => a[0] - b[0]);
  return out;
}
/** add(el, {t0,t1, base:{x,y,...}, keys:{...}, upd(t, lt, item), z, glow, jitter}) */
function add(e, o) {
  const it = Object.assign({ t0: -1, t1: 999, base: {}, keys: {}, z: 0 }, o, { el: e });
  e.style.position = 'absolute'; e.style.left = '0px'; e.style.top = '0px';
  e.style.zIndex = it.z; e.style.willChange = 'transform';
  ITEMS.push(it); return it;
}
function applyItem(it, t) {
  const vis = t >= it.t0 && t < it.t1;
  if (!vis) { if (it._vis !== false) { it.el.style.display = 'none'; it._vis = false; } return; }
  if (it._vis !== true) { it.el.style.display = ''; it._vis = true; }
  const p = {};
  for (const k of PROPS) {
    const v = kf(t, it.keys[k]);
    p[k] = v !== undefined ? v : (it.base[k] !== undefined ? it.base[k] : DEF[k]);
  }
  if (it.jitter) { // 定格式抖动（拼贴风 12fps）
    const f = Math.floor(t * (it.jitterFps || 12));
    p.x += (rnd(f, 3.1) - 0.5) * it.jitter * 2; p.y += (rnd(f, 7.7) - 0.5) * it.jitter * 2; p.rz += (rnd(f, 9.3) - 0.5) * it.jitter * 0.4;
  }
  if (it.float) { p.y += Math.sin(t * it.float[1] + (it.float[2] || 0)) * it.float[0]; }
  it.el.style.transform = `translate(-50%,-50%) translate3d(${p.x.toFixed(2)}px,${p.y.toFixed(2)}px,${p.z.toFixed(1)}px) rotateX(${p.rx.toFixed(2)}deg) rotateY(${p.ry.toFixed(2)}deg) rotateZ(${p.rz.toFixed(2)}deg) scale(${(p.s * p.sx).toFixed(4)},${(p.s * p.sy).toFixed(4)})`;
  it.el.style.opacity = clamp(p.o).toFixed(3);
  let f = '';
  if (p.blur > 0.05) f += `blur(${p.blur.toFixed(2)}px) `;
  if (Math.abs(p.sat - 1) > 0.005) f += `saturate(${p.sat.toFixed(3)}) `;
  if (Math.abs(p.br - 1) > 0.005) f += `brightness(${p.br.toFixed(3)}) `;
  if (Math.abs(p.hue) > 0.1) f += `hue-rotate(${p.hue.toFixed(1)}deg) `;
  if (it.glow) f += it.glow;
  it.el.style.filter = f || 'none';
  if (it.upd) it.upd(t, t - it.t0, it, p);
}

// ---------- 常用动作预设（返回 keys 片段） ----------
const A = {
  pop: (t, d = 0.32, s0 = 0.55) => ({ s: [[t, s0], [t + d, 1, 'back']], o: [[t, 0], [t + 0.08, 1, 'lin']] }),
  slam: (t, s0 = 2.6, d = 0.22) => ({ s: [[t, s0], [t + d, 1, 'out5']], o: [[t, 0], [t + 0.06, 1, 'lin']] }),
  fadeIn: (t, d = 0.25) => ({ o: [[t, 0], [t + d, 1, 'lin']] }),
  fadeOut: (t, d = 0.25) => ({ o: [[t, 1], [t + d, 0, 'lin']] }),
  from: (t, d, prop, v0, v1, e = 'out') => ({ [prop]: [[t, v0], [t + d, v1, e]] }),
  outUp: (t, d = 0.25, dy = -120) => ({ o: [[t, 1], [t + d, 0, 'lin']] }),
  blurIn: (t, d = 0.3, b = 18) => ({ blur: [[t, b], [t + d, 0]], o: [[t, 0], [t + d * 0.6, 1, 'lin']] }),
  whipOut: (t, dx = -900, d = 0.18) => ({ blur: [[t, 0], [t + d, 22, 'in']], o: [[t, 1], [t + d, 0, 'in']] }),
};

// ---------- 组件 ----------
// 浏览器窗口：3D 卡片 + 网页截图滚动
function Browser(o) {
  const w = o.w || 900, vh = o.vh || 560;
  const e = el('div', 'browser' + (o.dark ? ' dark' : ''));
  e.style.width = w + 'px';
  e.innerHTML = `<div class="bbar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i>
    <div class="url"><span class="lock">🔒</span><span class="utext"></span></div></div>
    <div class="bview" style="height:${vh}px"><img class="page" src="${o.img}" style="width:${w}px"></div>`;
  const ut = e.querySelector('.utext'), page = e.querySelector('.page');
  const url = o.url || '';
  const it = add(e, Object.assign({}, o.item));
  const scrollK = o.scroll || [[0, 0]];
  const ratio = w / (o.srcW || 960);
  const typeT = o.typeT !== undefined ? o.typeT : it.t0;
  it.upd = (t) => {
    const n = Math.floor(clamp((t - typeT) / 0.35) * url.length);
    ut.textContent = url.slice(0, n);
    page.style.transform = `translateY(${(-kf(t, scrollK) * ratio).toFixed(1)}px)`;
    if (o.upd) o.upd(t, e);
  };
  if (o.marks) for (const m of o.marks) { // 高亮框（截图坐标，960 宽）
    const b = el('div', 'mark', '', e.querySelector('.bview'));
    b.style.cssText += `left:${m[0] * ratio}px;top:${m[1] * ratio}px;width:${m[2] * ratio}px;height:${m[3] * ratio}px`;
    const mt = m[4];
    const prev = it.upd;
    it.upd = (t) => { prev(t); const k = EASE.out(clamp((t - mt) / 0.25)); b.style.opacity = k; b.style.transform = `translateY(${(-kf(t, scrollK) * ratio).toFixed(1)}px) scale(${1.15 - 0.15 * k})`; };
  }
  return it;
}

// 新闻弹窗卡
function News(o) {
  const e = el('div', 'news ' + (o.theme || 'light'));
  e.style.width = (o.w || 620) + 'px';
  e.innerHTML = `<div class="nhead"><span class="nsrc" style="background:${o.color || '#d62828'}">${o.src}</span><span class="ndate">${o.date || ''}</span>${o.tag ? `<span class="ntag">${o.tag}</span>` : ''}</div>
   <div class="ntitle" style="font-size:${o.fs || 34}px">${o.title}</div>${o.sub ? `<div class="nsub">${o.sub}</div>` : ''}`;
  return add(e, o.item);
}
// 通知 toast
function Toast(o) {
  const e = el('div', 'toast');
  e.innerHTML = `<div class="ticon" style="background:${o.color || '#4d6bfe'}">${o.icon || '!'}</div><div><div class="tt">${o.title}</div><div class="ts">${o.sub || ''}</div></div>`;
  return add(e, o.item);
}
// HUD 数字
function Stat(o) {
  const e = el('div', 'stat');
  e.style.setProperty('--c', o.color || '#ffd27a');
  e.innerHTML = `<div class="slabel">${o.label}</div><div class="sval"><span class="num"></span><span class="unit">${o.unit || ''}</span></div>${o.foot ? `<div class="sfoot">${o.foot}</div>` : ''}<b class="c1"></b><b class="c2"></b><b class="c3"></b><b class="c4"></b>`;
  const num = e.querySelector('.num');
  const it = add(e, o.item);
  it.upd = (t) => {
    if (typeof o.value === 'string') { num.textContent = o.value; return; }
    const [v0, v1, ts, d] = o.count; const k = EASE.out5(clamp((t - ts) / d));
    const v = lerp(v0, v1, k); num.textContent = (o.fmt ? o.fmt(v) : v.toFixed(o.dec || 0));
  };
  return it;
}
// 跑马灯
function Ticker(o) {
  const e = el('div', 'ticker ' + (o.cls || ''));
  const inner = el('div', 'tin', (o.text + '　　').repeat(8), e);
  const it = add(e, Object.assign({ base: { x: W / 2, y: o.y || 1040 } }, o.item));
  it.upd = (t) => { inner.style.transform = `translateX(${(-(t * (o.speed || 260)) % 2400).toFixed(1)}px)`; };
  return it;
}
// 印章 / 花字
function Stamp(o) {
  const e = el('div', 'stamp ' + (o.cls || ''), o.text);
  if (o.color) e.style.setProperty('--c', o.color);
  if (o.fs) e.style.fontSize = o.fs + 'px';
  return add(e, o.item);
}
// 弹幕：[[text, t, y, speed?, cls?], ...]
function Danmaku(list, t1) {
  for (const [txt, t, y, sp, cls] of list) {
    const e = el('div', 'dm ' + (cls || ''), txt);
    const speed = sp || 520;
    add(e, { t0: t, t1: t1 || t + 6, z: 60, keys: { x: [[t, W + 300], [t + (W + 900) / speed, -600, 'lin']], y: [[t, y]] } });
  }
}
// 终端：lines=[[t, text, cls?], ...] 打字机
function Terminal(o) {
  const e = el('div', 'term');
  e.style.width = (o.w || 760) + 'px'; e.style.height = (o.h || 360) + 'px';
  e.innerHTML = `<div class="tbar">${o.title || 'zsh'}</div><div class="tbody"></div>`;
  const body = e.querySelector('.tbody');
  const it = add(e, o.item);
  it.upd = (t) => {
    let html = '';
    for (const [lt, txt, cls] of o.lines) {
      if (t < lt) break;
      const n = Math.floor(clamp((t - lt) / (o.cps ? txt.length / o.cps : 0.18)) * txt.length);
      html += `<div class="${cls || ''}">${txt.slice(0, n).replace(/</g, '&lt;')}</div>`;
    }
    if (o.progress) { const [pt0, pt1, label] = o.progress; if (t >= pt0) { const k = clamp((t - pt0) / (pt1 - pt0)); const n = Math.round(k * 28); html += `<div class="pg">${label} [${'█'.repeat(n)}${'░'.repeat(28 - n)}] ${(k * 100).toFixed(1)}%</div>`; } }
    body.innerHTML = html;
  };
  return it;
}
// 人物立绘
function Char(name, o) {
  const e = el('img', 'char');
  e.src = `assets/chars/${name}.png`; e.style.height = (o.h || 900) + 'px';
  return add(e, o.item);
}
// 圆头像
function Avatar(name, o) {
  const e = el('div', 'avatar');
  const d = o.d || 120; e.style.width = e.style.height = d + 'px';
  e.style.borderColor = o.color || '#fff';
  e.innerHTML = `<img src="assets/chars/${name}.png" style="height:${d * (o.zoom || 4.2)}px;left:${o.ox ?? -60}%;top:${o.oy ?? -8}%">`;
  return add(e, o.item);
}
function Box(html, cls, item) { return add(el('div', cls, html), item); }

// ---------- 全局：背景 / 闪白 / 镜头抖动 / 歌词 ----------
const BG = []; // [{t0,t1,c1,c2,c3,grid}]
const FLASH = []; // [t, dur, color, max]
const SHAKE = []; // [t, amp, dur]
const ZOOM = []; // 舞台整体推拉 [[t, s], ...]
function bgAt(t) { for (const b of BG) if (t >= b.t0 && t < b.t1) return b; return BG[BG.length - 1]; }

// 歌词（逐字艺术字）
const LYR = [];
function lyric(text, times, tout, opt = {}) { LYR.push({ text, times, tout, opt }); }
function buildLyrics() {
  const box = $('#lyrics');
  for (const L of LYR) {
    const line = el('div', 'lline', '', box);
    L.el = line; L.chars = [];
    [...L.text].forEach((c) => { const s = el('span', 'lch', c, line); L.chars.push(s); });
  }
}
function renderLyrics(t) {
  for (const L of LYR) {
    const on = t >= L.times[0] - 0.05 && t < L.tout + 0.5;
    L.el.style.display = on ? '' : 'none';
    if (!on) continue;
    const ko = clamp((t - L.tout) / 0.45);
    L.el.style.filter = L.opt.gray && t > L.opt.gray ? `saturate(${1 - clamp((t - L.opt.gray) / 1)})` : '';
    L.chars.forEach((s, i) => {
      const k = EASE.out(clamp((t - L.times[i]) / 0.42));
      const sc = 1.32 - 0.32 * k, b = (1 - k) * 12 + ko * 9;
      s.style.opacity = (k * (1 - ko)).toFixed(3);
      s.style.transform = `translateY(${(-16 * (1 - k) - 26 * ko).toFixed(1)}px) scale(${sc.toFixed(3)})`;
      s.style.filter = b > 0.3 ? `blur(${b.toFixed(1)}px)` : 'none';
    });
  }
}

let BUILT = false;
window.renderAt = async (t) => {
  if (!BUILT) { buildLyrics(); BUILT = true; }
  // 背景
  const b = bgAt(t), bg = $('#bg');
  bg.style.background = `radial-gradient(1200px 800px at ${50 + noise1(t * 0.15, 1) * 18}% ${38 + noise1(t * 0.12, 2) * 10}%, ${b.c1}, transparent 70%), radial-gradient(900px 700px at ${15 + noise1(t * 0.1, 3) * 10}% 90%, ${b.c3}, transparent 70%), linear-gradient(180deg, ${b.c2}, #04050a)`;
  $('#grid').style.opacity = b.grid || 0;
  $('#grid').style.backgroundPosition = `${(-t * 30) % 80}px ${(t * 12) % 80}px`;
  $('#mist').style.transform = `translateX(${(-(t * 40) % 1920).toFixed(1)}px)`;
  $('#mist').style.opacity = b.mist !== undefined ? b.mist : 0.5;
  // 元素
  for (const it of ITEMS) applyItem(it, t);
  // 镜头
  let sx = 0, sy = 0, rz = 0;
  for (const [st, amp, d] of SHAKE) {
    if (t >= st && t < st + d) { const k = 1 - (t - st) / d, f = Math.floor(t * 60); sx += (rnd(f, 1) - 0.5) * 2 * amp * k; sy += (rnd(f, 2) - 0.5) * 2 * amp * k; rz += (rnd(f, 4) - 0.5) * amp * 0.03 * k; }
  }
  const zs = ZOOM.length ? kf(t, ZOOM) : 1;
  STAGE().style.transform = `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) rotate(${rz.toFixed(2)}deg) scale(${zs.toFixed(4)})`;
  // 闪白
  let fa = 0, fc = '#fff';
  for (const [ft, d, c, m] of FLASH) if (t >= ft && t < ft + d) { const a = (1 - (t - ft) / d) * (m || 1); if (a > fa) { fa = a; fc = c || '#fff'; } }
  const fl = $('#flash'); fl.style.opacity = fa.toFixed(3); fl.style.background = fc;
  // 颗粒
  const f = Math.floor(t * 24);
  $('#grain').style.backgroundPosition = `${Math.floor(rnd(f, 5) * 512)}px ${Math.floor(rnd(f, 6) * 512)}px`;
  if (window.POST) window.POST(t);
  renderLyrics(t);
};
