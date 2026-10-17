/* 墨玻璃层 v2（思路借鉴 mg-styles-15 / 12-aurora-glass，MIT）
 * 默认（不带参数）= 按 shots.js 里 GLASS_SCOPE 的时间窗，只给窗内出现的深色信息容器加 .glass；
 *   ?glass=0   完全关闭（= v5 原版外观，用于对照）
 *   ?glass=all 全片所有深色容器都上玻璃（旧的实验模式；?glass=1 等同）
 *   ?aurora=0  关闭柔光斑
 * 规则：终端 .term 永不上玻璃（S12 要冷、要实）；元素可用 item.frost = true/false 强制开/关。
 * 另提供 makeLensFilter()：液态玻璃放大镜的 SVG 折射 + RGB 色散滤镜（S16 使用）。
 * 一切由 t 决定（闭式曲线），可逐帧确定性渲染。 */
(function () {
  const Q = new URLSearchParams(location.search);
  const g = Q.get('glass');
  const MODE = g === '0' ? 'off' : (g === 'all' || g === '1') ? 'all' : 'scope';
  const AURORA = Q.get('aurora') !== '0' && MODE !== 'off';
  const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'glass.css'; document.head.appendChild(link);
  if (MODE === 'all') document.documentElement.classList.add('glass-all');
  if (MODE === 'off') document.documentElement.classList.add('glass-off');
  const SCOPE = (typeof GLASS_SCOPE !== 'undefined') ? GLASS_SCOPE : [];
  const SEL = '.stat,.panel,.toast,.news.dark,.hf404,.gh';
  const overlap = (it, w) => Math.min(it.t1, w.t1) - Math.max(it.t0, w.t0);
  let scanned = false;
  function scan() {
    scanned = true;
    if (MODE !== 'scope' || typeof ITEMS === 'undefined') return;
    for (const it of ITEMS) {
      const e = it.el;
      if (!e || !e.matches || e.matches('.term')) continue;
      const hit = it.frost === true || (it.frost !== false && SCOPE.some((w) => overlap(it, w) >= 0.3));
      if (!hit) continue;
      if (e.matches(SEL)) e.classList.add('glass');
      if (e.matches('.browser')) e.classList.add('glass-bar');
    }
  }

  // ---------- 液态玻璃放大镜滤镜：位移贴图 → 三通道不同强度折射 → screen 合成（色散） ----------
  window.makeLensFilter = function (id, size, s = 26, spread = 7) {
    if (document.getElementById(id)) return id;
    const c = document.createElement('canvas'); c.width = c.height = size;
    const cx = c.getContext('2d'), im = cx.createImageData(size, size);
    const ss = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const nx = (x + 0.5) / size * 2 - 1, ny = (y + 0.5) / size * 2 - 1, r = Math.hypot(nx, ny);
      const f = r >= 1 ? 0 : Math.pow(ss(0.5, 0.97, r), 1.4) * (1 - ss(0.97, 1.0, r)); // 只在边缘一圈折射，中心保持清晰放大
      const i = (y * size + x) * 4;
      im.data[i] = Math.round(128 + 127 * nx * f); im.data[i + 1] = Math.round(128 + 127 * ny * f); im.data[i + 2] = 128; im.data[i + 3] = 255;
    }
    cx.putImageData(im, 0, 0);
    const url = c.toDataURL('image/png');
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.style.position = 'absolute';
    const ch = (sc, m, res) => `<feDisplacementMap in="SourceGraphic" in2="map" scale="${sc}" xChannelSelector="R" yChannelSelector="G" result="d${res}"/>` +
      `<feColorMatrix in="d${res}" type="matrix" values="${m}" result="${res}"/>`;
    svg.innerHTML = `<defs><filter id="${id}" x="0" y="0" width="${size}" height="${size}" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">` +
      `<feImage href="${url}" x="0" y="0" width="${size}" height="${size}" preserveAspectRatio="none" result="map"/>` +
      ch(s + spread, '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0', 'r') +
      ch(s, '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0', 'g') +
      ch(s - spread, '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0', 'b') +
      `<feBlend in="r" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="b" mode="screen"/></filter></defs>`;
    document.body.appendChild(svg);
    return id;
  };

  // ---------- 柔光斑：插在 #mist 与 #stage 之间，作为玻璃的“折射对象”；只在玻璃时间窗内淡入 ----------
  const au = document.createElement('div'); au.id = 'aurora';
  const mist = document.getElementById('mist'); mist.parentNode.insertBefore(au, mist.nextSibling);
  const BLOBS = [
    { r: 760, px: 31, py: 23, ph: 0.0, cx: 0.30, cy: 0.34, ax: 0.16, ay: 0.12, col: 'c1' },
    { r: 620, px: 27, py: 37, ph: 1.7, cx: 0.74, cy: 0.30, ax: 0.14, ay: 0.14, col: 'c3' },
    { r: 540, px: 39, py: 29, ph: 3.1, cx: 0.58, cy: 0.74, ax: 0.18, ay: 0.10, col: 'c1' },
    { r: 460, px: 23, py: 33, ph: 4.4, cx: 0.16, cy: 0.80, ax: 0.10, ay: 0.12, col: 'c3' },
  ];
  const els = BLOBS.map(() => { const d = document.createElement('i'); au.appendChild(d); return d; });
  const rgba = (s) => { const m = s && s.match(/rgba?\(([^)]+)\)/); if (!m) return [120, 150, 220]; return m[1].split(',').slice(0, 3).map(Number); };
  const actFog = (t) => (t >= 43.9 && t < 61.7) ? 1 : (t >= 38.6 && t < 43.9) ? (t - 38.6) / 5.3 : 0; // 第二幕雾化
  const cl = (x) => Math.min(1, Math.max(0, x));
  const weight = (t) => MODE === 'all' ? 1 : SCOPE.reduce((m, w) => Math.max(m, cl((t - w.t0) / 0.6) * cl((w.t1 - t) / 0.6)), 0);
  const TAU = Math.PI * 2;

  const base = window.renderAt;
  window.renderAt = async (t) => {
    if (!scanned) scan();
    await base(t);
    if (MODE === 'off') return;
    const fog = actFog(t), wv = AURORA ? weight(t) : 0;
    au.style.display = wv > 0.001 ? '' : 'none';
    const b = (typeof bgAt === 'function') ? bgAt(t) : null;
    if (wv > 0.001 && b) {
      BLOBS.forEach((B, i) => {
        const c = rgba(b[B.col]);
        const x = (B.cx + B.ax * Math.sin(TAU * t / B.px + B.ph)) * 1920;
        const y = (B.cy + B.ay * Math.sin(TAU * t / B.py + B.ph * 1.3)) * 1080;
        const s = 1 + 0.06 * Math.sin(TAU * t / (B.px * 0.7) + i);
        const gc = c.map((v) => Math.round(v + (128 - v) * 0.75 * fog));
        const a = (0.42 - 0.24 * fog) * wv;
        const e = els[i];
        e.style.width = e.style.height = (B.r * 2) + 'px';
        e.style.transform = `translate(${(x - B.r).toFixed(1)}px,${(y - B.r).toFixed(1)}px) scale(${s.toFixed(4)})`;
        e.style.background = `radial-gradient(closest-side, rgba(${gc},${a.toFixed(3)}), rgba(${gc},${(a * 0.45).toFixed(3)}) 45%, rgba(${gc},0))`;
      });
    }
    const root = document.documentElement.style;
    root.setProperty('--sheen', (((t / 6) % 1) * 260 - 80).toFixed(1) + '%');
    root.setProperty('--sheen-a', (0.16 - 0.09 * fog).toFixed(3));
    root.setProperty('--frost-sat', (1.55 - 0.85 * fog).toFixed(3));
  };
})();
