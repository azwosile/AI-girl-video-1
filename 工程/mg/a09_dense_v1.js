/* anime.js 控制信息卡与歌词；Lottie 负责可逐帧定位的矢量轨迹。 */
(async function () {
  const C = window.A09_CONFIG;
  const q = s => document.querySelector(s);
  const clamp = v => Math.max(0, Math.min(1, v));
  const params = new URLSearchParams(location.search);
  const overlayOnly = params.get('overlay') === '1';
  const isStill = params.get('still') === '1';
  const preview = !overlayOnly && !isStill;
  document.body.classList.add(preview ? 'preview' : isStill ? 'still' : 'overlay');
  if (typeof anime !== 'function' || !window.lottie) throw new Error('本地动画库未加载');

  [...C.lyric].forEach(ch => { const el = document.createElement('span'); el.textContent = ch; q('#lyrics').appendChild(el); });
  const crawl = '<b>2025.01.20 / R1</b>　发布记录　◆　V4 PRO—0813　期待与落差　◆　<b>2026.10.17 / FLASH-1017</b>　正式更新　◆　DeepSWE v1.1 77.0　◆　有望冲击 Flash SOTA　◆　官方更新 / 前瞻判断　◆　';
  q('#ticker-track').innerHTML = crawl.repeat(4);

  const tl = anime.timeline({ autoplay: false });
  tl.add({ targets: '#archive-paper', opacity: [0, .86], translateX: [-190, 0], translateY: [70, 0], rotate: [-17, -9], duration: 480, easing: 'easeOutExpo' }, 0)
    .add({ targets: '#archive-r1', opacity: [0, .97], translateX: [-260, 0], translateY: [50, 0], rotate: [-19, -11], duration: 560, easing: 'easeOutExpo' }, 110)
    .add({ targets: '#archive-price', opacity: [0, .93], translateX: [160, 0], translateY: [100, 0], rotate: [17, 7], duration: 600, easing: 'easeOutExpo' }, 260)
    .add({ targets: '.era', opacity: [.25, 1], translateY: [-17, 0], duration: 420, delay: anime.stagger(125), easing: 'easeOutCubic' }, 40)
    .add({ targets: '#watch-panel', opacity: [0, 1], translateY: [48, 0], translateX: [-75, 0], scale: [.94, 1], duration: 540, easing: 'easeOutExpo' }, 550)
    .add({ targets: '#new-message', opacity: [0, 1], translateY: [-38, 0], rotate: [3, -2], scale: [.88, 1], duration: 430, easing: 'easeOutBack' }, 940)
    .add({ targets: '#forecast', opacity: [0, 1], translateX: [-42, 0], translateY: [20, 0], duration: 620, easing: 'easeOutExpo' }, 1220)
    .add({ targets: '#identifier-panel', opacity: [0, 1], translateX: [55, 0], duration: 520, easing: 'easeOutExpo' }, 870)
    .add({ targets: '#panel-sweep', translateX: [0, 1470], duration: 1200, easing: 'linear' }, 1030)
    .add({ targets: '#lyrics span', opacity: [0, 1], translateY: [21, 0], scale: [1.16, 1], duration: 350, delay: anime.stagger(79), easing: 'easeOutCubic' }, 80)
    .add({ targets: '#lyrics', opacity: [1, 0], duration: 170, easing: 'linear' }, 2730);

  const k = value => ({ a: 0, k: value });
  const animated = points => ({ a: 1, k: points.map(([t, value], i) => ({ t, s: [value], ...(i < points.length - 1 ? { e: [points[i + 1][1]], i: { x: [.67], y: [1] }, o: { x: [.33], y: [0] } } : {}) })) });
  const transform = () => ({ ty: 'tr', p: k([0, 0]), a: k([0, 0]), s: k([100, 100]), r: k(0), o: k(100), sk: k(0), sa: k(0) });
  const stroke = (color, width = 1.7) => ({ ty: 'st', c: k(color), o: k(72), w: k(width), lc: 2, lj: 2, ml: 4 });
  const path = vertices => ({ ty: 'sh', ks: k({ i: vertices.map(() => [0, 0]), o: vertices.map(() => [0, 0]), v: vertices, c: false }) });
  const layer = (ind, name, shapes, position = [0, 0, 0], rotation = k(0)) => ({ ddd: 0, ind, ty: 4, nm: name, sr: 1, ks: { o: k(62), r: rotation, p: k(position), a: k([0, 0, 0]), s: k([100, 100, 100]) }, shapes, ip: 0, op: 91, st: 0, bm: 0 });
  const paths = [
    [[88, 284], [88, 206], [155, 206]], [[1140, 230], [1169, 230], [1169, 438]],
    [[62, 800], [162, 800], [162, 817], [710, 817]], [[1126, 595], [1182, 595], [1182, 697]],
    [[1115, 185], [1200, 185], [1200, 162]], [[92, 578], [92, 634], [32, 634]]
  ];
  const lineGroups = paths.map((points, i) => ({ ty: 'gr', it: [path(points), stroke(i % 2 ? [.89, .78, .55, 1] : [.43, .75, .9, 1]), { ty: 'tm', s: k(0), e: animated([[0, 0], [38 + i * 3, 100]]), o: k(0), m: 1 }, transform()], nm: 'message route ' + i }));
  const ring = { ty: 'gr', it: [{ ty: 'el', p: k([0, 0]), s: k([128, 128]), d: 1 }, { ...stroke([.47, .81, .94, 1], 1.2), d: [{ n: 'd', v: k(13) }, { n: 'g', v: k(8) }, { n: 'o', v: k(0) }] }, transform()], nm: 'signal orbit' };
  const lottieData = { v: '5.12.2', fr: 30, ip: 0, op: 91, w: 1920, h: 1080, nm: 'A09 信息路径', ddd: 0, assets: [], layers: [layer(1, 'routes', lineGroups), layer(2, 'orbit', [ring], [1106, 712, 0], animated([[0, -40], [90, 235]]))], markers: [] };
  const vectors = lottie.loadAnimation({ container: q('#lottie-lines'), renderer: 'svg', loop: false, autoplay: false, animationData: lottieData, rendererSettings: { preserveAspectRatio: 'xMidYMid meet' } });
  vectors.setSubframe(false);
  const vectorReady = new Promise((resolve, reject) => { vectors.addEventListener('DOMLoaded', resolve); vectors.addEventListener('data_failed', () => reject(new Error('Lottie 数据加载失败'))); });
  const imageReady = Promise.all([...document.images].map(im => im.complete && im.naturalWidth ? 1 : new Promise((resolve, reject) => { im.onload = resolve; im.onerror = () => reject(new Error('素材加载失败：' + im.src)); })));
  const base = q('#base-video');
  let baseReady = Promise.resolve();
  if (!overlayOnly) {
    baseReady = new Promise((resolve, reject) => { base.addEventListener('loadeddata', resolve, { once: true }); base.addEventListener('error', () => reject(new Error('原片加载失败')), { once: true }); });
    base.src = C.source; base.preload = 'auto'; base.load();
  }
  await Promise.all([vectorReady, imageReady, document.fonts.ready, baseReady]);

  window.renderAt = async (seconds, seekBase = true) => {
    const t = Math.max(0, Math.min(C.duration - .0001, seconds));
    tl.seek(t * 1000);
    vectors.goToAndStop(t * 30, true);
    q('#watch-inner').style.transform = 'translateY(' + (Math.sin(t * 1.9) * 2.3).toFixed(3) + 'px) rotateY(' + (Math.sin(t * 1.5) * .55).toFixed(3) + 'deg)';
    q('#panel-sweep').style.opacity = String(Math.sin(clamp((t - 1.03) / 1.2) * Math.PI) * .72);
    q('#ticker-track').style.transform = 'translateX(' + (-t * 208).toFixed(3) + 'px)';
    q('#identifier-text').textContent = 'deepseek-v4.1-flash-1017'.slice(0, Math.floor(clamp((t - .91) / 1.24) * 26));
    q('#cursor').style.opacity = Math.floor(t * 4) % 2 ? '.2' : '1';
    q('#scanline').style.transform = 'translateY(' + ((t * 180) % 690).toFixed(3) + 'px)';
    q('#scanline').style.opacity = String(.09 + .1 * (Math.sin(t * 5) + 1));
    q('#signal-brackets').style.opacity = String(.28 + .09 * (Math.sin(t * 3.5) + 1));
    if (!overlayOnly && seekBase && Math.abs(base.currentTime - t) > .012) {
      await new Promise(resolve => { const done = () => { base.removeEventListener('seeked', done); resolve(); }; base.addEventListener('seeked', done); base.currentTime = t; });
    }
  };
  await window.renderAt(0);
  window.__libraries = { anime: anime.version, lottie: lottie.version };
  window.__ready = true;
  window.__effectStats = { animatedCards: 7, archiveScreenshots: 3, lottiePaths: paths.length, masterAudioStart: C.musicStart, lyric: C.lyric };

  if (preview) {
    const fit = () => { const s = Math.min(innerWidth / 1920, innerHeight / 1080); document.documentElement.style.setProperty('--fit', s); q('#scene').style.left = ((innerWidth - 1920 * s) / 2) + 'px'; q('#scene').style.top = ((innerHeight - 1080 * s) / 2) + 'px'; };
    fit(); addEventListener('resize', fit);
    const music = new Audio(C.music); music.preload = 'auto';
    let active = false;
    const tick = () => { if (!active) return; window.renderAt(base.currentTime, false); if (base.currentTime >= C.duration - .015 || base.ended) { active = false; base.pause(); music.pause(); return; } requestAnimationFrame(tick); };
    q('#play-button').onclick = async () => { active = false; base.pause(); music.pause(); await window.renderAt(0); base.currentTime = 0; music.currentTime = C.musicStart; await base.play(); music.play().catch(console.warn); active = true; requestAnimationFrame(tick); };
  }
})().catch(error => { window.__error = String(error.stack || error); console.error(error); });
