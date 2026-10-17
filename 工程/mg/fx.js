/* 局部强调特效层 —— 按 文稿/01_文稿与分镜_v3_按v5样片修订.md §三/§五：
 * 全屏白闪只留给 R1 首爆 / 档案墙转群像 / 旧 Flash 回彩 / 章节转暖 / 最终盖章；震屏只留真正有冲击因果的爆点。
 * 其余小重拍改用下面这些“局部”手段，且各镜用不同的动作语法：
 *   LEAK.push([t, dur, color, side, max])      边缘漏光转场（side: l r t b tl tr bl br），不是整屏白
 *   item.hits  = [[t, dur, k, glowColor]]       元素局部曝光（亮度 + 外发光脉冲）
 *   item.kicks = [[t, amp, dur, deg]]           元素局部惯性（只抖这一块）
 *   item.wipe  = [t, dur, dir]                  扫描显现（clip-path；dir r=左→右, d=上→下）
 *   item.glint = [[t, dur, selector?]]          卡面 / 纸边斜向反光扫过
 *   PANX / PANY                                 舞台横移 / 纵移关键帧（横向量尺、纵向排行、胶片滑轨、目录流向）
 * 新动作预设（与 A.pop / A.slam 区分职责）：settle 落定 · stick 贴入 · unfold 横向展开 · merge 中线合拢 ·
 *   drop 旁批落下 · flipIn 翻贴 · tagFlip 状态翻牌 · lift 被框带出
 * 全部由 t 闭式计算，逐帧确定。 */
'use strict';
const LEAK = [];
const PANX = [], PANY = [];
Object.assign(A, {
  settle: (t, d = .45, s0 = .94) => ({ s: [[t, s0], [t + d, 1, 'out']], o: [[t, 0], [t + d * .5, 1, 'lin']], blur: [[t, 6], [t + d * .6, 0, 'out']] }),
  stick: (t, rz0, rz1, d = .28) => ({ s: [[t, 1.07], [t + d, 1, 'out']], rz: [[t, rz0], [t + d, rz1, 'out']], o: [[t, 0], [t + .06, 1, 'lin']] }),
  unfold: (t, d = .38) => ({ sx: [[t, .02], [t + d, 1, 'out5']], o: [[t, 0], [t + .08, 1, 'lin']] }),
  merge: (t, d = .45) => ({ sx: [[t, 1.9], [t + d, 1, 'out']], blur: [[t, 16], [t + d * .8, 0, 'out']], o: [[t, 0], [t + d * .4, 1, 'lin']] }),
  drop: (t, rz1, d = .5) => ({ rx: [[t, -75], [t + d, 0, 'back']], rz: [[t, rz1 - 8], [t + d, rz1, 'out']], o: [[t, 0], [t + .1, 1, 'lin']] }),
  flipIn: (t, d = .4) => ({ ry: [[t, 88], [t + d, 0, 'out']], o: [[t, 0], [t + .08, 1, 'lin']] }),
  tagFlip: (t, d = .26) => ({ rx: [[t, 88], [t + d, 0, 'out5']], o: [[t, 0], [t + .06, 1, 'lin']] }),
  lift: (t, d = .4) => ({ sy: [[t, .1], [t + d, 1, 'back']], o: [[t, 0], [t + .08, 1, 'lin']] }),
});
(function () {
  const st = document.createElement('style');
  st.textContent = `#leak{position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;z-index:0}
.fxg{position:absolute;inset:0;pointer-events:none;border-radius:inherit;overflow:hidden;opacity:0;mix-blend-mode:screen;
 background:linear-gradient(115deg,transparent 0 38%,rgba(255,255,255,.6) 50%,transparent 62% 100%);background-size:320% 100%;}`;
  document.head.appendChild(st);
  const SIDE = { l: [0, 50, 1, 0], r: [100, 50, -1, 0], t: [50, 0, 0, 1], b: [50, 100, 0, -1], tl: [0, 0, .7, .7], tr: [100, 0, -.7, .7], bl: [0, 100, .7, -.7], br: [100, 100, -.7, -.7] };
  let leak = null, built = false;
  const cl = (x) => Math.min(1, Math.max(0, x));
  function build() {
    built = true;
    leak = document.createElement('div'); leak.id = 'leak';
    const fl = document.getElementById('flash'); fl.parentNode.insertBefore(leak, fl);
    for (const it of ITEMS) if (it.glint) for (const g of it.glint) {
      const host = g[2] ? it.el.querySelector(g[2]) : it.el; if (!host) continue;
      const e = document.createElement('i'); e.className = 'fxg'; host.appendChild(e); (it._glints = it._glints || []).push([g[0], g[1], e]);
    }
  }
  const base = window.renderAt;
  window.renderAt = async (t) => {
    if (!built) build();
    await base(t);
    // 舞台横移 / 纵移（叠加在 ZOOM 与震屏之前）
    const px = PANX.length ? kf(t, PANX) : 0, py = PANY.length ? kf(t, PANY) : 0;
    if (Math.abs(px) > .01 || Math.abs(py) > .01) { const sg = STAGE(); sg.style.transform = `translate(${px.toFixed(1)}px,${py.toFixed(1)}px) ` + sg.style.transform; }
    // 边缘漏光
    let bg = [];
    for (const [lt, d, c, side, m] of LEAK) {
      if (t < lt || t >= lt + d) continue;
      const k = (t - lt) / d, a = Math.sin(Math.PI * k) * (m || .4), S = SIDE[side] || SIDE.l;
      const x = S[0] + S[2] * 22 * k, y = S[1] + S[3] * 22 * k;
      bg.push(`radial-gradient(70% 80% at ${x.toFixed(1)}% ${y.toFixed(1)}%, ${c}, transparent 70%)`);
      leak.style.opacity = a.toFixed(3);
    }
    leak.style.display = bg.length ? '' : 'none'; if (bg.length) leak.style.background = bg.join(',');
    // 元素级：局部曝光 / 局部惯性 / 扫描显现 / 反光
    for (const it of ITEMS) {
      if (it._vis !== true) continue;
      if (it.kicks) for (const [kt, amp, d, deg] of it.kicks) {
        if (t < kt || t >= kt + d) continue;
        const k = (t - kt) / d, v = amp * Math.pow(1 - k, 2) * Math.sin(2 * Math.PI * 9 * (t - kt)), r = (deg || 0) * Math.PI / 180;
        it.el.style.transform += ` translate(${(v * Math.cos(r)).toFixed(2)}px,${(v * Math.sin(r)).toFixed(2)}px)`;
      }
      if (it.hits) {
        let b = 0, col = '';
        for (const [ht, d, k0, c] of it.hits) if (t >= ht && t < ht + d) { const v = k0 * Math.pow(1 - (t - ht) / d, 2); if (v > b) { b = v; col = c || 'rgba(255,255,255,.9)'; } }
        if (b > .002) { const f = it.el.style.filter; it.el.style.filter = (f === 'none' ? '' : f + ' ') + `brightness(${(1 + b * .6).toFixed(3)}) drop-shadow(0 0 ${(30 * b).toFixed(1)}px ${col})`; }
      }
      if (it.wipe) {
        const [wt, d, dir] = it.wipe, k = EASE.out(cl((t - wt) / d)), r = ((1 - k) * 100).toFixed(1);
        it.el.style.clipPath = k >= 1 ? 'none' : (dir === 'd' ? `inset(0 0 ${r}% 0)` : `inset(0 ${r}% 0 0)`);
      }
      if (it._glints) for (const [gt, d, e] of it._glints) {
        const k = (t - gt) / d, on = k >= 0 && k < 1;
        e.style.opacity = on ? Math.sin(Math.PI * k).toFixed(3) : 0;
        if (on) e.style.backgroundPosition = `${(100 - k * 100).toFixed(1)}% 0`;
      }
    }
  };
})();
