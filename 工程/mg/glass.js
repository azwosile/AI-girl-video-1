/* 毛玻璃 + 弥散光实验层（opt-in）：film.html?glass=1 才启用；不带参数时完全不生效，v5 输出不变。
 * 思路借鉴 mg-styles-15 / 12-aurora-glass（MIT）：大面积柔光斑缓慢漂移作底 + 磨砂玻璃承载信息。
 * 适配本片：光斑颜色取自每镜已有 BG 调色（邻近色），第二幕自动降饱和变“雾玻璃”；
 * 只把深色 UI 容器（数据卡 / 面板 / 通知 / 终端 / 浏览器标题栏）换成玻璃，新闻与网页截图保持不透明以保证可读。
 * 一切由 t 决定（闭式曲线），可逐帧确定性渲染。 */
(function () {
  const Q = new URLSearchParams(location.search);
  if (Q.get('glass') !== '1') return;
  const AURORA = Q.get('aurora') !== '0';
  document.documentElement.classList.add('glass-on');
  const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'glass.css'; document.head.appendChild(link);

  // 柔光斑层：插在 #mist 与 #stage 之间，作为玻璃的“折射对象”
  const au = document.createElement('div'); au.id = 'aurora';
  const mist = document.getElementById('mist'); mist.parentNode.insertBefore(au, mist.nextSibling);
  const BLOBS = [ // 半径 px、Lissajous 周期 s、相位、取色（c1 / c3 / mix）
    { r: 760, px: 31, py: 23, ph: 0.0, cx: 0.30, cy: 0.34, ax: 0.16, ay: 0.12, col: 'c1' },
    { r: 620, px: 27, py: 37, ph: 1.7, cx: 0.74, cy: 0.30, ax: 0.14, ay: 0.14, col: 'c3' },
    { r: 540, px: 39, py: 29, ph: 3.1, cx: 0.58, cy: 0.74, ax: 0.18, ay: 0.10, col: 'c1' },
    { r: 460, px: 23, py: 33, ph: 4.4, cx: 0.16, cy: 0.80, ax: 0.10, ay: 0.12, col: 'c3' },
  ];
  const els = BLOBS.map(() => { const d = document.createElement('i'); au.appendChild(d); return d; });
  const rgba = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return [120, 150, 220]; return m[1].split(',').slice(0, 3).map(Number); };
  const actFog = (t) => (t >= 43.9 && t < 61.7) ? 1 : (t >= 38.6 && t < 43.9) ? (t - 38.6) / 5.3 : 0; // 第二幕雾化
  const TAU = Math.PI * 2;

  const base = window.renderAt;
  window.renderAt = async (t) => {
    await base(t);
    const b = (typeof bgAt === 'function') ? bgAt(t) : null;
    const fog = actFog(t);
    if (AURORA && b) {
      BLOBS.forEach((B, i) => {
        const c = rgba(b[B.col]);
        const x = (B.cx + B.ax * Math.sin(TAU * t / B.px + B.ph)) * 1920;
        const y = (B.cy + B.ay * Math.sin(TAU * t / B.py + B.ph * 1.3)) * 1080;
        const s = 1 + 0.06 * Math.sin(TAU * t / (B.px * 0.7) + i); // 呼吸
        const g = c.map((v) => Math.round(v + (128 - v) * 0.75 * fog)); // 雾化：向灰收拢
        const a = (0.42 - 0.24 * fog).toFixed(3);
        const e = els[i];
        e.style.width = e.style.height = (B.r * 2) + 'px';
        e.style.transform = `translate(${(x - B.r).toFixed(1)}px,${(y - B.r).toFixed(1)}px) scale(${s.toFixed(4)})`;
        e.style.background = `radial-gradient(closest-side, rgba(${g},${a}), rgba(${g},${(a * 0.45).toFixed(3)}) 45%, rgba(${g},0))`;
      });
    }
    // 玻璃高光：一道斜向反光缓慢扫过（约 6 s 一次），第二幕变弱
    const sweep = ((t / 6) % 1) * 260 - 80;
    document.documentElement.style.setProperty('--sheen', sweep.toFixed(1) + '%');
    document.documentElement.style.setProperty('--sheen-a', (0.16 - 0.09 * fog).toFixed(3));
    document.documentElement.style.setProperty('--frost-sat', (1.55 - 0.85 * fog).toFixed(3));
  };
})();
