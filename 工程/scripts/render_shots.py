# -*- coding: utf-8 -*-
"""国模·江湖之间 —— 不需要 AI 视频的镜头（第一幕 3–8 镜 + 第三幕 15 镜）
立绘抠图 + 程序化水墨背景 + 图表 / 排行榜 / 角色卡 + 逐字艺术字歌词。
用法: python render_shots.py <config.json> [段名 ...]
段名: act1 (11.2–43.8s，镜头 3–8)  cards (66.9–70.4s，镜头 15)
config 里 "stills_only": true 时只输出预览帧，不编码视频。
"""
import json, sys, math, subprocess, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import cv2

cfg = json.load(open(sys.argv[1], encoding='utf-8'))
# 配置里的相对路径按 config 文件所在目录解析，仓库换位置也能直接跑
_CFG_DIR = os.path.dirname(os.path.abspath(sys.argv[1]))
def _abs(p): return p if (not isinstance(p, str) or os.path.isabs(p) or p == 'ffmpeg') else os.path.normpath(os.path.join(_CFG_DIR, p))
for _k in ('font_lyric', 'font_label', 'audio', 'out', 'still_dir'):
    if cfg.get(_k): cfg[_k] = _abs(cfg[_k])
cfg['images'] = {k: _abs(v) for k, v in cfg.get('images', {}).items()}
cfg['outs'] = {k: _abs(v) for k, v in cfg.get('outs', {}).items()}
W, H, FPS = cfg.get('W', 1920), cfg.get('H', 1080), 30
SEGMENTS = {'act1': (11.20, 43.80), 'cards': (66.90, 70.40)}
todo = sys.argv[2:] or list(SEGMENTS)
rng = np.random.default_rng(7)

# ================= 工具 =================
def clamp01(x): return min(max(x, 0.0), 1.0)
def ease_out(x): x = clamp01(x); return 1 - (1 - x) ** 3
def ease_io(x): x = clamp01(x); return x * x * (3 - 2 * x)
def lerp(a, b, k): return a + (b - a) * k

def cutout_full(path, height):
    im = Image.open(path).convert('RGB')
    im = im.resize((round(im.width * height / im.height), height), Image.LANCZOS)
    a = np.asarray(im).astype(np.int16)
    white = ((a.min(axis=2) > 228) & ((a.max(axis=2) - a.min(axis=2)) < 22)).astype(np.uint8)
    h, w = white.shape
    ff = white.copy() * 255
    mask = np.zeros((h + 2, w + 2), np.uint8)
    for (x, y) in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (0, h // 2), (w - 1, h // 2), (w // 2, h - 1)]:
        if ff[y, x] == 255: cv2.floodFill(ff, mask, (x, y), 128)
    alpha = 1 - (ff == 128).astype(np.uint8)
    alpha = cv2.erode(alpha, np.ones((3, 3), np.uint8), 1)
    alpha = cv2.GaussianBlur(alpha.astype(np.float32), (0, 0), 1.2)
    return Image.fromarray(np.dstack([np.asarray(im), (alpha * 255).clip(0, 255).astype(np.uint8)]), 'RGBA')

def tint(img, bright=1.0, sat=1.0, color=None, amt=0.0):
    rgb = img.convert('RGB'); a = img.getchannel('A')
    if sat != 1.0: rgb = ImageEnhance.Color(rgb).enhance(sat)
    if bright != 1.0: rgb = ImageEnhance.Brightness(rgb).enhance(bright)
    if color is not None and amt > 0: rgb = Image.blend(rgb, Image.new('RGB', rgb.size, color), amt)
    rgb.putalpha(a); return rgb

def glow_of(img, radius, color, strength=1.0):
    pad = radius * 3
    big = Image.new('L', (img.width + 2 * pad, img.height + 2 * pad), 0)
    big.paste(img.getchannel('A'), (pad, pad))
    a = big.filter(ImageFilter.GaussianBlur(radius)).point(lambda v: min(255, int(v * strength)))
    g = Image.new('RGBA', a.size, color + (0,)); g.putalpha(a); g.pad = pad; return g

def comp(canvas, img, x, y):
    x, y = int(x), int(y)
    l, t = max(0, -x), max(0, -y)
    r, b = min(img.width, canvas.width - x), min(img.height, canvas.height - y)
    if r <= l or b <= t: return
    canvas.alpha_composite(img, (x + l, y + t), (l, t, r, b))

def with_alpha(img, alpha):
    if alpha >= 0.999: return img
    out = img.copy(); out.putalpha(img.getchannel('A').point(lambda v: int(v * alpha))); return out

def paste_scaled(canvas, img, cx, bottom, scale=1.0, alpha=1.0):
    if alpha <= 0.003: return
    pad = getattr(img, 'pad', 0)
    bottom = bottom + pad * scale
    if abs(scale - 1.0) > 1e-3:
        img = img.resize((max(1, int(img.width * scale)), max(1, int(img.height * scale))), Image.BICUBIC)
    comp(canvas, with_alpha(img, alpha), cx - img.width / 2, bottom - img.height)

def paste_center(canvas, img, cx, cy, alpha=1.0):
    if alpha <= 0.003: return
    comp(canvas, with_alpha(img, alpha), cx - img.width / 2, cy - img.height / 2)

# ================= 背景：程序化水墨远山 =================
def smooth_noise_1d(n, octaves, seed):
    r = np.random.default_rng(seed); y = np.zeros(n)
    for o in range(octaves):
        k = 3 * 2 ** o; pts = r.uniform(-1, 1, k + 3)
        y += np.interp(np.linspace(0, k, n), np.arange(k + 3), pts) / (1.7 ** o)
    return cv2.GaussianBlur(y.reshape(1, -1).astype(np.float32), (0, 0), 6).ravel()

BW = W + 200
def make_bg(top, bot, col, seed=0):
    yy_ = np.linspace(0, 1, H)[:, None]
    top, bot, col = np.array(top), np.array(bot), np.array(col)
    img = (top + (bot - top) * yy_[..., None]).repeat(BW, 1).astype(np.float32)
    for base, amp, op, sd in [(0.50, 140, 0.20, 11), (0.62, 110, 0.32, 23), (0.76, 80, 0.50, 37)]:
        ridge = (base * H + amp * smooth_noise_1d(BW, 4, sd + seed)).astype(int)
        m = cv2.GaussianBlur((np.arange(H)[:, None] > ridge[None, :]).astype(np.float32), (0, 0), 3)
        fog = np.linspace(1, 0.35, H)[:, None]
        img = img * (1 - m[..., None] * op * fog[..., None]) + col * (m[..., None] * op * fog[..., None])
    return img

PAL = {
    'teal':   ((8, 18, 26), (20, 46, 54), (60, 112, 122)),
    'violet': ((14, 10, 24), (38, 28, 56), (92, 72, 124)),
    'moon':   ((8, 12, 26), (24, 32, 54), (72, 88, 120)),
    'amber':  ((24, 14, 10), (64, 38, 22), (130, 86, 54)),
    'dream':  ((12, 14, 32), (42, 32, 74), (92, 84, 152)),
    'gold':   ((26, 18, 12), (72, 50, 28), (150, 110, 64)),
}
BG = {k: make_bg(*v, seed=i * 5) for i, (k, v) in enumerate(PAL.items())}

def make_mist(seed):
    r = np.random.default_rng(seed)
    n = cv2.resize(r.random((H // 16, BW // 16)).astype(np.float32), (BW, H), interpolation=cv2.INTER_CUBIC)
    n = cv2.GaussianBlur(n, (0, 0), 40); n = (n - n.min()) / (n.max() - n.min() + 1e-6)
    band = np.exp(-((np.linspace(0, 1, H) - 0.72) ** 2) / 0.02)[:, None]
    return (n * band * 0.55).astype(np.float32)
MIST = make_mist(5)
GRAIN = [rng.normal(0, 7, (H, W, 1)).astype(np.float32) for _ in range(6)]
yy, xx = np.mgrid[0:H, 0:W]
VIGN = (1 - 0.55 * (((xx - W / 2) / (W / 1.6)) ** 2 + ((yy - H / 2) / (H / 1.25)) ** 2)).clip(0.35, 1)[..., None].astype(np.float32)

def radial(cx, cy, r, color, strength):
    d2 = ((xx - cx) ** 2 + (yy - cy) ** 2) / (r * r)
    return (np.exp(-d2 * 2.2) * strength)[..., None] * np.array(color, np.float32)

def bg_frame(name, t, drift=6, mist_col=(150, 165, 190)):
    off = int(100 + t * drift) % 200
    b = BG[name][:, off:off + W]
    m = MIST[:, int(t * 14) % 200: int(t * 14) % 200 + W][..., None]
    return b + m * np.array(mist_col, np.float32)

def to_canvas(f): return Image.fromarray(f.clip(0, 255).astype(np.uint8)).convert('RGBA')

# ================= 角色 =================
IMG = cfg['images']
FACE = {'ds': (0.45, 0.13), 'gpt': (0.45, 0.12), 'claude': (0.45, 0.12), 'qwen': (0.45, 0.13),
        'glm': (0.45, 0.13), 'kimi': (0.45, 0.13), 'seed': (0.55, 0.12)}
_full = {}
def full(name, h):
    k = (name, h)
    if k not in _full: _full[k] = cutout_full(IMG[name], h)
    return _full[k]
_body = {}
def body(name, h):
    k = (name, h)
    if k not in _body:
        f = full(name, h); _body[k] = f.crop(f.getbbox())
    return _body[k]
_glow = {}
def glow(name, h, color, strength=1.5, radius=26):
    k = (name, h, color)
    if k not in _glow: _glow[k] = glow_of(body(name, h), radius, color, strength)
    return _glow[k]

def portrait(name, w, h, src_h=1600, span=0.30):
    """以脸为中心裁出半身像（透明底）"""
    f = full(name, src_h); fx, fy = FACE[name]
    ch = int(span * src_h); cw = int(ch * w / h)
    cx, cy = int(fx * f.width), int(fy * src_h)
    top_k = 0.5 if span < 0.2 else 0.24
    box = (cx - cw // 2, cy - int(ch * top_k), cx + cw // 2, cy + int(ch * (1 - top_k)))
    return f.crop(box).resize((w, h), Image.LANCZOS)

def circle_avatar(name, d):
    p = portrait(name, d, d, span=0.16)
    m = Image.new('L', (d * 4, d * 4), 0); ImageDraw.Draw(m).ellipse([0, 0, d * 4 - 1, d * 4 - 1], fill=255)
    m = m.resize((d, d), Image.LANCZOS)
    bg = Image.new('RGBA', (d, d), (235, 232, 240, 255)); bg.alpha_composite(p)
    bg.putalpha(m); return bg

# ================= 字体 / 歌词 =================
FONT_LYR = ImageFont.truetype(cfg['font_lyric'], int(H * 0.105))
def lbl(size): return ImageFont.truetype(cfg['font_label'], int(H * size))
F_S, F_M, F_L, F_XL = lbl(0.024), lbl(0.030), lbl(0.042), lbl(0.060)

def L(text, times, t_out):
    assert len(text) == len(times), text
    return (list(zip(text, times)), t_out)
LYRICS = [
    L('几句情话谁人应答', [11.24, 12.06, 12.70, 13.28, 13.68, 14.18, 14.68, 14.98], 16.35),
    L('深情不过那一刹那', [16.94, 17.24, 17.54, 18.02, 18.24, 18.76, 19.16, 19.52], 22.35),
    L('以长剑河滩作画', [22.98, 23.38, 23.68, 24.04, 24.44, 24.72, 25.22], 27.75),
    L('以明月写尽无暇', [28.28, 29.16, 29.36, 29.76, 30.12, 30.50, 31.08], 32.20),
    L('年岁漫漫不过一刹', [32.74, 33.62, 34.12, 34.90, 35.72, 36.68, 37.02, 37.86], 38.05),
    L('儿女情长仿若昙花', [38.58, 40.18, 40.46, 40.82, 41.16, 41.52, 41.94, 42.46], 43.00),
    L('逃不过相忘江湖之间', [66.94, 67.70, 68.00, 68.22, 68.70, 69.08, 69.40, 69.74, 69.96], 70.00),
]

def glyph(ch):
    pad = 40; bbox = FONT_LYR.getbbox(ch)
    w, h = bbox[2] - bbox[0] + pad * 2, FONT_LYR.size + pad * 2
    sh = Image.new('L', (w, h), 0); ImageDraw.Draw(sh).text((pad - bbox[0], pad), ch, font=FONT_LYR, fill=255)
    grad = np.linspace(0, 1, h)[:, None]
    top, bot = np.array([255, 246, 222]), np.array([214, 168, 92])
    face = (top + (bot - top) * grad[..., None]).repeat(w, 1).astype(np.uint8)
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    s = Image.new('RGBA', (w, h), (6, 8, 14, 0)); s.putalpha(sh.filter(ImageFilter.GaussianBlur(9)).point(lambda v: int(v * 0.95)))
    out.alpha_composite(s, (4, 6))
    gl = Image.new('RGBA', (w, h), (255, 200, 120, 0)); gl.putalpha(sh.filter(ImageFilter.GaussianBlur(16)).point(lambda v: int(v * 0.45)))
    out.alpha_composite(gl)
    f = Image.fromarray(face).convert('RGBA'); f.putalpha(sh); out.alpha_composite(f)
    return out, FONT_LYR.getlength(ch)
GLYPHS = {}
def get_glyph(ch):
    if ch not in GLYPHS: GLYPHS[ch] = glyph(ch)
    return GLYPHS[ch]

def draw_lyrics(canvas, t, sat=1.0):
    for chars, t_out in LYRICS:
        if t < chars[0][1] - 0.05 or t > t_out + 0.5: continue
        advs = [get_glyph(c)[1] * 1.04 for c, _ in chars]
        x = W / 2 - sum(advs) / 2; base_y = int(H * 0.80)
        k_out = clamp01((t - t_out) / 0.45)
        for (c, tc), adv in zip(chars, advs):
            g = get_glyph(c)[0]; k = ease_out((t - tc) / 0.42)
            if k > 0:
                a = k * (1 - k_out); sc = 1.28 - 0.28 * k; blur = (1 - k) * 10 + k_out * 8
                img = g
                if sat < 0.99: img = tint(img, sat=sat)
                if blur > 0.4: img = img.filter(ImageFilter.GaussianBlur(blur))
                if abs(sc - 1) > 0.01: img = img.resize((int(img.width * sc), int(img.height * sc)), Image.BICUBIC)
                paste_center(canvas, img, x + adv / 2, base_y - 14 * (1 - k) - 24 * k_out, a)
            x += adv

BAND = Image.new('RGBA', (W, H), (4, 6, 12, 0))
BAND.putalpha(Image.fromarray(np.repeat((np.exp(-((np.linspace(0, 1, H) - 0.80) ** 2) / 0.006) * 115).astype(np.uint8)[:, None], W, 1)))

def text_c(d, x, y, s, font, fill):
    w = d.textlength(s, font=font); d.text((x - w / 2, y), s, font=font, fill=fill)

def panel(canvas, x0, y0, w, h, a=1.0, fill=(8, 10, 18), op=150, outline=(230, 200, 140), r=18):
    p = Image.new('RGBA', (w, h), fill + (int(op * a),))
    ImageDraw.Draw(p).rounded_rectangle([0, 0, w - 1, h - 1], r, outline=outline + (int(110 * a),), width=2)
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, w - 1, h - 1], r, fill=255)
    p.putalpha(Image.fromarray(np.minimum(np.asarray(p.getchannel('A')), np.asarray(m))))
    canvas.alpha_composite(p, (int(x0), int(y0)))

# ================= 镜头 3：Qwen 以小胜大 =================
CH_H = int(H * 0.86)
def shot3(t):
    lt = t - 11.2
    f = bg_frame('teal', t, mist_col=(130, 175, 185)) + radial(W * 0.24, H * 0.32, W * 0.34, (170, 160, 255), 0.42)
    cv = to_canvas(f)
    k_in = ease_out(lt / 0.6)
    paste_scaled(cv, glow('qwen', CH_H, (200, 190, 255)), W * 0.24 - 60 * (1 - k_in), H * 1.02, 1.0 + 0.04 * ease_io(lt / 5.7), 0.85 * k_in)
    paste_scaled(cv, body('qwen', CH_H), W * 0.24 - 60 * (1 - k_in), H * 1.02, 1.0 + 0.04 * ease_io(lt / 5.7), k_in)
    d = ImageDraw.Draw(cv)
    base = int(H * 0.70)
    fat_w, thin_w = int(W * 0.21), max(6, int(W * 0.21 / 15))
    fat_cx, thin_cx = W * 0.70, W * 0.50
    fat_hmax, thin_hmax = H * 0.44, H * 0.50
    # GPT 娘从巨柱后面探出头（被反超的那一刻）
    k_peek = ease_out((t - 13.85) / 0.6)
    if k_peek > 0:
        g = tint(body('gpt', CH_H), bright=0.85, sat=0.9)
        paste_scaled(cv, g, W * 0.86, H * (1.75 - 0.36 * k_peek), 1.0, 0.95)
    k_f = ease_out((t - 11.3) / 1.0)
    fh = int(fat_hmax * k_f)
    if fh > 0:
        bar = Image.new('RGBA', (fat_w, fh), (120, 132, 142, 225))
        ImageDraw.Draw(bar).rectangle([0, 0, fat_w - 1, 3], fill=(170, 182, 192, 255))
        cv.alpha_composite(bar, (int(fat_cx - fat_w / 2), base - fh))
    k_t = ease_io((t - 11.9) / 2.3)
    th = int(thin_hmax * k_t)
    if th > 0:
        comp(cv, glow_of(Image.new('RGBA', (thin_w, th), (255, 215, 130, 255)), 10, (255, 200, 110), 1.2),
             thin_cx - thin_w / 2 - 30, base - th - 30)
        cv.alpha_composite(Image.new('RGBA', (thin_w, th), (250, 200, 105, 255)), (int(thin_cx - thin_w / 2), base - th))
    a_l = ease_out((t - 11.5) / 0.5)
    text_c(d, thin_cx, base + 12, 'Qwen3.6-27B', F_S, (250, 215, 140, int(255 * a_l)))
    text_c(d, fat_cx, base + 12, '前代旗舰 · 约 15 倍参数', F_S, (200, 210, 215, int(255 * a_l)))
    text_c(d, (thin_cx + fat_cx) / 2, int(H * 0.10), '柱宽 = 参数量　　柱高 = 得分', F_S, (200, 215, 220, int(200 * a_l)))
    # 反超的瞬间：细柱顶端一道光
    if 13.68 <= t < 14.4:
        k = (t - 13.68) / 0.72
        ring = Image.new('RGBA', (240, 240), (0, 0, 0, 0))
        ImageDraw.Draw(ring).ellipse([120 - 110 * k, 120 - 110 * k, 120 + 110 * k, 120 + 110 * k], outline=(255, 230, 170, int(220 * (1 - k))), width=4)
        comp(cv, ring, thin_cx - 120, base - th - 120)
    return cv

# ================= 镜头 4：GLM 开源第一 =================
def shot4(t):
    lt = t - 16.9
    f = bg_frame('violet', t, mist_col=(150, 135, 185)) + radial(W * 0.22, H * 0.32, W * 0.34, (190, 160, 255), 0.40)
    cv = to_canvas(f)
    k_in = ease_out(lt / 0.6)
    sc = 1.0 + 0.04 * ease_io(lt / 6)
    paste_scaled(cv, glow('glm', CH_H, (205, 175, 255)), W * 0.21, H * 1.02, sc, 0.8 * k_in)
    paste_scaled(cv, body('glm', CH_H), W * 0.21, H * 1.02, sc, k_in)
    # 排行榜
    px, py, pw, ph = int(W * 0.47), int(H * 0.08), int(W * 0.46), int(H * 0.62)
    panel(cv, px, py, pw, ph, a=k_in)
    rows = [('hdr', '闭源'), ('row', 'claude', 'Claude Opus 4.8', ''), ('row', 'gpt', 'GPT', ''),
            ('hdr', '开源'), ('row', 'glm', 'GLM-5.3', '1'), ('dim', '2'), ('dim', '3'), ('dim', '4'), ('dim', '5')]
    rh = int(H * 0.088)
    layer = Image.new('RGBA', (pw, ph), (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    target = rh * 3.9   # GLM 行停在面板中间
    scroll = lerp(ph + rh * 2, 0, ease_out((t - 17.0) / 2.4))
    hi = ease_out((t - 19.52) / 0.35)
    y = rh * 0.4 + scroll - target + ph * 0.50
    for r in rows:
        if r[0] == 'hdr':
            d.text((34, y + rh * 0.35), r[1], font=F_S, fill=(210, 200, 225, 200))
            d.line([(110, y + rh * 0.55), (pw - 34, y + rh * 0.55)], fill=(210, 200, 225, 90), width=1)
            y += rh * 0.8; continue
        box = [24, y + 6, pw - 24, y + rh - 6]
        if r[0] == 'dim':
            d.rounded_rectangle(box, 12, fill=(255, 255, 255, 14))
            d.text((50, y + rh * 0.28), r[1], font=F_M, fill=(170, 170, 185, 120))
            d.rounded_rectangle([200, y + rh * 0.40, 200 + pw * 0.35, y + rh * 0.58], 6, fill=(170, 170, 185, 50))
            y += rh; continue
        _, who, name, rank = r
        is_glm = who == 'glm'
        fill = (255, 214, 140, int(40 + 50 * hi)) if is_glm else (255, 255, 255, 22)
        d.rounded_rectangle(box, 12, fill=fill, outline=(255, 214, 140, int(230 * hi)) if is_glm else None, width=3)
        av = circle_avatar(who, int(rh * 0.72))
        layer.alpha_composite(av, (110, int(y + rh * 0.14)))
        if rank: d.text((48, y + rh * 0.22), rank, font=F_L, fill=(255, 214, 140, 255))
        d.text((110 + int(rh * 0.72) + 24, y + rh * 0.26), name, font=F_M,
               fill=(255, 236, 200, 255) if is_glm else (225, 225, 235, 230))
        if is_glm and hi > 0:
            tag = '开源 No.1'; tw = d.textlength(tag, font=F_S)
            d.rounded_rectangle([pw - 60 - tw - 24, y + rh * 0.28, pw - 48, y + rh * 0.72], 10, fill=(255, 205, 120, int(235 * hi)))
            d.text((pw - 60 - tw - 12, y + rh * 0.31), tag, font=F_S, fill=(40, 24, 10, int(255 * hi)))
        y += rh
    # 裁到面板内
    m = Image.new('L', (pw, ph), 0); ImageDraw.Draw(m).rounded_rectangle([2, 2, pw - 3, ph - 3], 16, fill=255)
    layer.putalpha(Image.fromarray(np.minimum(np.asarray(layer.getchannel('A')), np.asarray(m))))
    cv.alpha_composite(with_alpha(layer, k_in), (px, py))
    # 金边扫光
    if 20.0 <= t < 21.2:
        k = (t - 20.0) / 1.2
        sweep = Image.new('RGBA', (120, ph), (255, 230, 180, 0))
        sweep.putalpha(Image.fromarray((np.exp(-((np.arange(120) - 60) / 30.0) ** 2) * 70).astype(np.uint8)[None, :].repeat(ph, 0)))
        comp(cv, sweep, px + k * (pw + 120) - 120, py)
    return cv

# ================= 镜头 5：Kimi K3 vs Claude =================
SPLIT_M = None
def split_mask():
    global SPLIT_M
    if SPLIT_M is None:
        xline = W * 0.53 - (W * 0.06) * (yy / H)
        SPLIT_M = np.clip((xx - xline) / 3 + 0.5, 0, 1)[..., None].astype(np.float32)
    return SPLIT_M

def shot5(t):
    lt = t - 22.9
    m = split_mask()
    left = bg_frame('moon', t) + radial(W * 0.17, H * 0.22, W * 0.14, (220, 230, 255), 0.55)
    right = bg_frame('amber', t, drift=-6, mist_col=(200, 160, 120)) + radial(W * 0.80, H * 0.30, W * 0.30, (255, 160, 80), 0.35)
    f = left * (1 - m) + right * m
    cv = to_canvas(f)
    d = ImageDraw.Draw(cv)
    # 月亮
    d.ellipse([W * 0.17 - 62, H * 0.22 - 62, W * 0.17 + 62, H * 0.22 + 62], fill=(236, 240, 250, 235))
    kk = ease_out((t - 22.95) / 0.6); kc = ease_out((t - 23.38) / 0.6)
    paste_scaled(cv, glow('kimi', CH_H, (190, 210, 255)), W * 0.23 - 120 * (1 - kk), H * 1.02, 1.0, 0.8 * kk)
    paste_scaled(cv, body('kimi', CH_H), W * 0.23 - 120 * (1 - kk), H * 1.02, 1.0, kk)
    paste_scaled(cv, glow('claude', CH_H, (255, 180, 110)), W * 0.79 + 120 * (1 - kc), H * 1.02, 1.0, 0.8 * kc)
    paste_scaled(cv, body('claude', CH_H), W * 0.79 + 120 * (1 - kc), H * 1.02, 1.0, kc)
    # 分割线（墨笔光）
    line = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(line).line([(W * 0.53, 0), (W * 0.47, H)], fill=(255, 240, 210, 200), width=3)
    cv.alpha_composite(line.filter(ImageFilter.GaussianBlur(2)))
    # 剑光（“剑” 23.68）
    if 23.62 <= t < 24.0:
        k = (t - 23.62) / 0.38
        st = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(st)
        x = lerp(-W * 0.1, W * 0.55, k)
        sd.line([(x - 300, H * 0.85), (x + 300, H * 0.10)], fill=(235, 245, 255, int(255 * (1 - k))), width=10)
        cv.alpha_composite(st.filter(ImageFilter.GaussianBlur(4)))
    # 中间跑分条
    kp = ease_out((t - 23.9) / 0.4)
    pw, ph = int(W * 0.17), int(H * 0.58)
    px, py = int(W * 0.50 - pw / 2), int(H * 0.10)
    panel(cv, px, py, pw, ph, a=kp, op=170)
    d = ImageDraw.Draw(cv)
    text_c(d, W * 0.5, py + 18, '官方评测', F_S, (235, 225, 205, int(255 * kp)))
    base = py + ph - int(H * 0.07); bh = int(H * 0.38); bw = int(W * 0.035)
    kb = ease_io((t - 24.04) / 1.6)
    for i, (name, v, col) in enumerate([('Kimi K3', 0.985, (190, 208, 245)), ('Opus 4.8', 1.0, (245, 160, 90))]):
        xb = int(W * 0.5 + (i - 0.5) * (bw + int(W * 0.03)) - bw / 2)
        h = int(bh * v * kb)
        if h > 0: cv.alpha_composite(Image.new('RGBA', (bw, h), col + (240,)), (xb, base - h))
        text_c(d, xb + bw / 2, base + 10, name, F_S, (230, 230, 235, int(235 * kp)))
    ka = ease_out((t - 25.7) / 0.4)
    if ka > 0: text_c(d, W * 0.5, base - bh - int(H * 0.075), '≈', F_XL, (255, 225, 160, int(255 * ka)))
    return cv

# ================= 镜头 6：Seed 娘 + Seedance 演示（占位） =================
PARTS = [(rng.uniform(0, 2 * math.pi), rng.uniform(80, 420), rng.uniform(0, 4.4), rng.uniform(2, 6)) for _ in range(140)]
def shot6(t):
    lt = t - 28.3
    f = bg_frame('dream', t, mist_col=(150, 150, 220)) + radial(W * 0.30, H * 0.35, W * 0.36, (150, 210, 255), 0.45)
    cv = to_canvas(f)
    k_in = ease_out(lt / 0.5)
    bob = 8 * math.sin(lt * 2.2)
    paste_scaled(cv, glow('seed', CH_H, (150, 220, 255)), W * 0.28, H * 1.02 + bob, 1.0, 0.85 * k_in)
    paste_scaled(cv, body('seed', CH_H), W * 0.28, H * 1.02 + bob, 1.0, k_in)
    # 星光粒子
    st = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(st)
    ox, oy = W * 0.40, H * 0.20 + bob
    for ang, sp, t0, sz in PARTS:
        age = (lt - t0 * 0.5)
        if age < 0 or age > 1.8: continue
        r = sp * age; a = 1 - age / 1.8
        x, y = ox + math.cos(ang) * r * 1.4, oy + math.sin(ang) * r * 0.8 + 30 * age * age
        sd.ellipse([x - sz, y - sz, x + sz, y + sz], fill=(200, 235, 255, int(230 * a)))
    cv.alpha_composite(st.filter(ImageFilter.GaussianBlur(1.2)))
    cv.alpha_composite(st.filter(ImageFilter.GaussianBlur(6)))
    # 三个演示片段框（按拍弹出）
    fw, fh = int(W * 0.24), int(W * 0.135)
    spots = [(29.16, 0.65, 0.23, (60, 90, 150), (210, 150, 120)), (29.76, 0.84, 0.38, (40, 70, 60), (200, 210, 140)),
             (30.50, 0.67, 0.54, (90, 50, 90), (250, 190, 150))]
    d = ImageDraw.Draw(cv)
    for i, (t0, fx, fy, c1, c2) in enumerate(spots):
        k = ease_out((t - t0) / 0.35)
        if k <= 0: continue
        fr = Image.new('RGBA', (fw, fh), (0, 0, 0, 255))
        g = np.linspace(0, 1, fw)[None, :, None]
        arr = (np.array(c1) + (np.array(c2) - np.array(c1)) * g).repeat(fh, 0)
        fr = Image.fromarray(arr.astype(np.uint8)).convert('RGBA')
        fd = ImageDraw.Draw(fr)
        for sx in range(10, fw, 34):
            fd.rectangle([sx, 6, sx + 16, 16], fill=(10, 10, 14, 200)); fd.rectangle([sx, fh - 16, sx + 16, fh - 6], fill=(10, 10, 14, 200))
        text_c(fd, fw / 2, fh / 2 - 30, f'Seedance 2.5 演示片段 {"①②③"[i]}', F_S, (255, 255, 255, 230))
        text_c(fd, fw / 2, fh / 2 + 6, '（在 Pr 里替换成官方 demo）', F_S, (255, 255, 255, 160))
        sc = 0.85 + 0.15 * k
        fr = fr.resize((int(fw * sc), int(fh * sc)), Image.BICUBIC)
        m = Image.new('L', fr.size, 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, fr.width - 1, fr.height - 1], 14, fill=255)
        fr.putalpha(m)
        sh = Image.new('RGBA', (fr.width + 60, fr.height + 60), (0, 0, 0, 0)); sh.paste((0, 0, 0, 150), (30, 30, 30 + fr.width, 30 + fr.height))
        paste_center(cv, sh.filter(ImageFilter.GaussianBlur(14)), W * fx + 10, H * fy + 14, k)
        paste_center(cv, fr, W * fx, H * fy, k)
    return cv

# ================= 镜头 7–8：高光快切 → 隔河合影 → 去色 / 烧边 =================
CUTS = [(32.70, 'ds', 'gold', (255, 190, 110)), (33.62, 'qwen', 'teal', (200, 190, 255)), (34.12, 'glm', 'violet', (205, 175, 255)),
        (34.90, 'kimi', 'moon', (190, 210, 255)), (35.72, 'seed', 'dream', (150, 220, 255)), (36.68, 'duo', 'amber', None)]
BIG_H = int(H * 1.25)
LINEUP_T = 37.02
GROUP = ['ds', 'qwen', 'glm', 'kimi', 'seed']
SM_H = int(H * 0.60)

def lineup(t):
    te = min(t, 38.60)  # 38.6 之后定格
    lt = te - LINEUP_T
    f = bg_frame('gold', te, mist_col=(210, 180, 130)) + radial(W * 0.56, H * 0.25, W * 0.30, (255, 220, 160), 0.35)
    # 窄河：一条竖向的流光
    rx = W * 0.565
    river = np.exp(-((xx - rx - 6 * np.sin(yy / 40.0 + te * 3)) / 9.0) ** 2) * (0.6 + 0.4 * np.sin(yy / 13.0 - te * 9))
    f = f + river[..., None] * np.array([190, 220, 255], np.float32) * 0.9
    cv = to_canvas(f)
    sc = 1.0 + 0.03 * ease_io(lt / 1.6)
    for i, n in enumerate(GROUP):
        k = ease_out((te - (LINEUP_T + 0.05 * i)) / 0.35)
        cx = W * (0.08 + 0.10 * i)
        paste_scaled(cv, body(n, SM_H), W / 2 + (cx - W / 2) * sc, H * 0.98 + 40 * (1 - k), sc, k)
    for j, n in enumerate(['gpt', 'claude']):
        k = ease_out((te - (LINEUP_T + 0.15 + 0.05 * j)) / 0.35)
        cx = W * (0.70 + 0.17 * j)
        paste_scaled(cv, glow(n, int(H * 0.64), (255, 240, 220), 1.0, 20), W / 2 + (cx - W / 2) * sc, H * 0.98, sc, 0.5 * k)
        paste_scaled(cv, body(n, int(H * 0.64)), W / 2 + (cx - W / 2) * sc, H * 0.98 + 40 * (1 - k), sc, k)
    return cv

def shot7(t):
    if t >= LINEUP_T: return lineup(t)
    idx = max(i for i, c in enumerate(CUTS) if t >= c[0])
    t0, who, pal, gcol = CUTS[idx]
    t1 = CUTS[idx + 1][0] if idx + 1 < len(CUTS) else LINEUP_T
    lt = (t - t0) / max(0.2, t1 - t0)
    f = bg_frame(pal, t, drift=30)
    cv = to_canvas(f + radial(W * 0.5, H * 0.3, W * 0.4, (255, 230, 200), 0.25))
    if who == 'duo':
        for n, cx, sgn in [('gpt', 0.30, -1), ('claude', 0.70, 1)]:
            paste_scaled(cv, glow(n, BIG_H, (255, 235, 210), 1.2), W * cx + sgn * 40 * lt, H * 1.42, 1.0 + 0.05 * lt, 0.7)
            paste_scaled(cv, body(n, BIG_H), W * cx + sgn * 40 * lt, H * 1.42, 1.0 + 0.05 * lt, 1.0)
    else:
        side = 1 if idx % 2 else -1
        cx = W * 0.5 + side * W * 0.12 - side * 80 * lt
        paste_scaled(cv, glow(who, BIG_H, gcol, 1.3), cx, H * 1.42, 1.0 + 0.08 * lt, 0.8)
        paste_scaled(cv, body(who, BIG_H), cx, H * 1.42, 1.0 + 0.08 * lt, 1.0)
    return cv

# 烧边噪声（低分辨率，按时间放大阈值）
BURN_N = cv2.GaussianBlur(cv2.resize(rng.random((H // 24, W // 24)).astype(np.float32), (W, H), interpolation=cv2.INTER_CUBIC), (0, 0), 30)
BURN_N = (BURN_N - BURN_N.min()) / (BURN_N.max() - BURN_N.min())
EDGE = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / 1.41
BURN_F = (0.55 * EDGE + 0.45 * BURN_N).astype(np.float32)

def post8(out, t):
    """镜头 8：去饱和 → 胶片烧边 → 黑场"""
    s = 1 - 0.85 * ease_io((t - 39.0) / 2.5)
    gray = out.mean(axis=2, keepdims=True)
    out = gray + (out - gray) * s
    kb = clamp01((t - 41.9) / 1.6)
    if kb > 0:
        th = 1.0 - 0.75 * kb
        x = (BURN_F - th) / 0.06
        hot = np.clip(x, 0, 1)[..., None]; core = np.clip(x - 1.5, 0, 1)[..., None]
        out = out * (1 - hot) + np.array([255, 150, 50], np.float32) * hot
        out = out * (1 - core) + np.array([255, 245, 225], np.float32) * core
    if t >= 43.5: out = out * 0
    return out

# ================= 镜头 15：四张角色卡翻开 =================
CARDS = [('ds', 'DeepSeek', 'V4.1 Pro', 66.94, 69.08), ('qwen', 'Qwen', 'Qwen 4', 67.70, 69.40),
         ('glm', 'GLM', 'GLM-5.5', 68.22, 69.74), ('kimi', 'Kimi', 'K3.1', 68.70, 69.96)]
CW, CHH = int(W * 0.185), int(H * 0.56)
_card = {}
def card_img(who, name, ver, lit):
    k = (who, lit)
    if k in _card: return _card[k]
    c = Image.new('RGBA', (CW, CHH), (0, 0, 0, 0))
    g = np.linspace(0, 1, CHH)[:, None, None]
    top = np.array([46, 40, 58]) if lit else np.array([30, 30, 34])
    bot = np.array([120, 84, 40]) if lit else np.array([16, 16, 18])
    arr = (top + (bot - top) * g).repeat(CW, 1)
    c = Image.fromarray(arr.astype(np.uint8)).convert('RGBA')
    p = portrait(who, CW - 24, int(CHH * 0.70))
    if not lit: p = tint(p, bright=0.55, sat=0.0)
    c.alpha_composite(p, (12, 12))
    d = ImageDraw.Draw(c)
    d.rectangle([0, int(CHH * 0.70), CW, CHH], fill=(10, 10, 14, 200))
    text_c(d, CW / 2, int(CHH * 0.735), name, F_M, (235, 230, 220, 255) if lit else (150, 150, 155, 255))
    text_c(d, CW / 2, int(CHH * 0.83), ver if lit else '?', F_L, (255, 214, 140, 255) if lit else (110, 110, 115, 255))
    m = Image.new('L', (CW, CHH), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, CW - 1, CHH - 1], 16, fill=255)
    c.putalpha(m)
    ImageDraw.Draw(c).rounded_rectangle([0, 0, CW - 1, CHH - 1], 16, outline=(255, 214, 140, 230) if lit else (90, 90, 96, 200), width=3)
    _card[k] = c; return c

def shot15(t):
    warm = ease_io((t - 68.9) / 1.4)
    f = np.zeros((H, W, 3), np.float32) + np.array([6, 7, 10], np.float32)
    f = f + radial(W * 0.5, H * 0.45, W * 0.6, (90, 110, 160), 0.25 * (1 - warm)) + radial(W * 0.5, H * 0.5, W * 0.6, (255, 170, 80), 0.32 * warm)
    cv = to_canvas(f)
    for i, (who, name, ver, ta, tr) in enumerate(CARDS):
        cx, cy = W * (0.20 + 0.20 * i), H * 0.41
        ka = ease_out((t - ta) / 0.35)
        if ka <= 0: continue
        lit = t >= tr
        img = card_img(who, name, ver, lit)
        # 翻牌：先水平压扁再展开
        kf = clamp01((t - tr + 0.12) / 0.24)
        sx = abs(math.cos(kf * math.pi)) if 0 < kf < 1 else 1.0
        sx = max(0.02, sx) * (0.6 + 0.4 * ka)
        sy = 0.92 + 0.08 * ka
        im2 = img.resize((max(2, int(CW * sx)), int(CHH * sy)), Image.BICUBIC)
        if lit:
            gl = glow_of(im2, 22, (255, 190, 100), 1.2 * (0.6 + 0.4 * ease_out((t - tr) / 0.4)))
            paste_center(cv, gl, cx, cy, 0.9)
        paste_center(cv, im2, cx, cy + 30 * (1 - ka), ka)
        if lit and t - tr < 0.25:
            fl = Image.new('RGBA', im2.size, (255, 245, 225, int(200 * (1 - (t - tr) / 0.25))))
            fl.putalpha(Image.fromarray(np.minimum(np.asarray(im2.getchannel('A')), int(200 * (1 - (t - tr) / 0.25))).astype(np.uint8)))
            paste_center(cv, fl, cx, cy)
    return cv

# ================= 调度 =================
def scene(t):
    if t < 16.90: return shot3(t)
    if t < 22.90: return shot4(t)
    if t < 28.30: return shot5(t)
    if t < 32.70: return shot6(t)
    if t < 43.80: return shot7(t)
    return shot15(t)

FLASH = [13.68, 19.52, 23.68, 37.02, 38.58]
CUT_FLASH = [c[0] for c in CUTS[1:]] + [16.90, 22.90, 28.30, 32.70]

def render(name):
    T0, T1 = SEGMENTS[name]
    NF = int(round((T1 - T0) * FPS))
    stills = set(int(round((s - T0) * FPS)) for s in cfg.get('stills', {}).get(name, []))
    only = cfg.get('stills_only', False)
    out_path = cfg.get('outs', {}).get(name) or cfg['out'].replace('{name}', name)
    proc = None
    if not only:
        cmd = [cfg['ffmpeg'], '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-']
        if cfg.get('audio'):
            cmd += ['-ss', f'{T0}', '-t', f'{T1 - T0}', '-i', cfg['audio'], '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '256k']
        cmd += ['-c:v', 'libx264', '-preset', 'medium', '-crf', str(cfg.get('crf', 18)), '-pix_fmt', 'yuv420p', '-shortest', out_path]
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    os.makedirs(cfg['still_dir'], exist_ok=True)
    for fi in range(NF):
        if only and fi not in stills: continue
        t = T0 + fi / FPS
        cv = scene(t)
        cv.alpha_composite(BAND)
        sat = 1 - 0.85 * ease_io((t - 39.0) / 2.5) if 38.6 <= t < 43.8 else 1.0
        if not (43.5 <= t < 43.8): draw_lyrics(cv, t, sat)
        out = np.asarray(cv.convert('RGB')).astype(np.float32)
        if 38.6 <= t < 43.8: out = post8(out, t)
        out = out * VIGN + GRAIN[fi % 6]
        for tf in FLASH:
            if 0 <= t - tf < 0.18: out = out + (255 - out) * (0.5 * (1 - (t - tf) / 0.18))
        for tf in CUT_FLASH:
            if 0 <= t - tf < 0.10: out = out + (255 - out) * (0.25 * (1 - (t - tf) / 0.10))
        out = out.clip(0, 255).astype(np.uint8)
        if proc: proc.stdin.write(out.tobytes())
        if fi in stills:
            Image.fromarray(out).save(os.path.join(cfg['still_dir'], f'{name}_{t:05.2f}.jpg'), quality=88)
        if fi % 90 == 0: print(name, 'frame', fi, '/', NF, flush=True)
    if proc: proc.stdin.close(); proc.wait()
    print('done', name, out_path if not only else '(stills)')

for n in todo: render(n)
