# -*- coding: utf-8 -*-
"""国模·江湖之间 —— 示例镜头 01–02（0:00–0:11.2）
不依赖 AI 视频：立绘抠图 + 程序化水墨背景 + 对比图表 + 艺术字歌词（逐字书写）。
用法: python render_sample.py <config.json>
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
T0, T1 = 0.0, 11.2
NF = int(round((T1 - T0) * FPS))
rng = np.random.default_rng(7)

# ---------------- 工具 ----------------
def ease_out(x):
    x = min(max(x, 0.0), 1.0); return 1 - (1 - x) ** 3
def ease_io(x):
    x = min(max(x, 0.0), 1.0); return x * x * (3 - 2 * x)
def clamp01(x): return min(max(x, 0.0), 1.0)

def cutout(path, height):
    im = Image.open(path).convert('RGB')
    im = im.resize((round(im.width * height / im.height), height), Image.LANCZOS)
    a = np.asarray(im).astype(np.int16)
    white = ((a.min(axis=2) > 228) & ((a.max(axis=2) - a.min(axis=2)) < 22)).astype(np.uint8)
    h, w = white.shape
    ff = white.copy() * 255
    mask = np.zeros((h + 2, w + 2), np.uint8)
    for (x, y) in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (0, h // 2), (w - 1, h // 2), (w // 2, h - 1)]:
        if ff[y, x] == 255:
            cv2.floodFill(ff, mask, (x, y), 128)
    bg = (ff == 128).astype(np.uint8)
    alpha = 1 - bg
    alpha = cv2.erode(alpha, np.ones((3, 3), np.uint8), 1)
    alpha = cv2.GaussianBlur(alpha.astype(np.float32), (0, 0), 1.2)
    rgba = np.dstack([np.asarray(im), (alpha * 255).clip(0, 255).astype(np.uint8)])
    out = Image.fromarray(rgba, 'RGBA')
    return out.crop(out.getbbox())

def tint(img, bright=1.0, sat=1.0, color=None, amt=0.0):
    rgb = img.convert('RGB'); a = img.getchannel('A')
    if sat != 1.0: rgb = ImageEnhance.Color(rgb).enhance(sat)
    if bright != 1.0: rgb = ImageEnhance.Brightness(rgb).enhance(bright)
    if color is not None and amt > 0:
        rgb = Image.blend(rgb, Image.new('RGB', rgb.size, color), amt)
    rgb.putalpha(a); return rgb

def glow_of(img, radius, color, strength=1.0):
    pad = radius * 3
    big = Image.new('L', (img.width + 2 * pad, img.height + 2 * pad), 0)
    big.paste(img.getchannel('A'), (pad, pad))
    a = big.filter(ImageFilter.GaussianBlur(radius))
    a = a.point(lambda v: min(255, int(v * strength)))
    g = Image.new('RGBA', a.size, color + (0,)); g.putalpha(a); g.pad = pad; return g

def paste_scaled(canvas, img, cx, bottom, scale=1.0, alpha=1.0):
    if alpha <= 0.003: return
    bottom = bottom + getattr(img, 'pad', 0) * scale
    if abs(scale - 1.0) > 1e-3:
        img = img.resize((max(1, int(img.width * scale)), max(1, int(img.height * scale))), Image.BICUBIC)
    if alpha < 0.999:
        a = img.getchannel('A').point(lambda v: int(v * alpha)); img = img.copy(); img.putalpha(a)
    canvas.alpha_composite(img, (int(cx - img.width / 2), int(bottom - img.height)))

# ---------------- 背景：程序化水墨远山 ----------------
def smooth_noise_1d(n, octaves, seed):
    r = np.random.default_rng(seed); y = np.zeros(n)
    for o in range(octaves):
        k = 3 * 2 ** o; pts = r.uniform(-1, 1, k + 3)
        xs = np.linspace(0, k, n); y += np.interp(xs, np.arange(k + 3), pts) / (1.7 ** o)
    return cv2.GaussianBlur(y.reshape(1, -1).astype(np.float32), (0, 0), 6).ravel()

BW = W + 200
def make_bg(warm):
    yy = np.linspace(0, 1, H)[:, None]
    top = np.array([10, 14, 28]) if not warm else np.array([22, 16, 14])
    bot = np.array([26, 32, 48]) if not warm else np.array([58, 40, 28])
    img = (top + (bot - top) * yy[..., None]).repeat(BW, 1).astype(np.float32)
    layers = [(0.50, 140, 0.20, 11), (0.62, 110, 0.32, 23), (0.76, 80, 0.50, 37)]
    for base, amp, op, seed in layers:
        ridge = (base * H + amp * smooth_noise_1d(BW, 4, seed)).astype(int)
        m = (np.arange(H)[:, None] > ridge[None, :]).astype(np.float32)
        m = cv2.GaussianBlur(m, (0, 0), 3)
        fog = np.linspace(1, 0.35, H)[:, None]
        col = np.array([70, 84, 110]) if not warm else np.array([120, 88, 60])
        img = img * (1 - m[..., None] * op * fog[..., None]) + col * (m[..., None] * op * fog[..., None])
    return img

def make_mist(seed):
    r = np.random.default_rng(seed)
    n = r.random((H // 16, BW // 16)).astype(np.float32)
    n = cv2.resize(n, (BW, H), interpolation=cv2.INTER_CUBIC)
    n = cv2.GaussianBlur(n, (0, 0), 40)
    n = (n - n.min()) / (n.max() - n.min() + 1e-6)
    band = np.exp(-((np.linspace(0, 1, H) - 0.72) ** 2) / 0.02)[:, None]
    return (n * band * 0.55).astype(np.float32)

BG_COLD, BG_WARM = make_bg(False), make_bg(True)
MIST = make_mist(5)
GRAIN = [rng.normal(0, 7, (H, W, 1)).astype(np.float32) for _ in range(6)]
yy, xx = np.mgrid[0:H, 0:W]
VIGN = (1 - 0.55 * (((xx - W / 2) / (W / 1.6)) ** 2 + ((yy - H / 2) / (H / 1.25)) ** 2)).clip(0.35, 1)[..., None].astype(np.float32)

def radial(cx, cy, r, color, strength):
    d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / r
    g = np.exp(-d ** 2 * 2.2)[..., None] * strength
    return g * np.array(color, np.float32)

# ---------------- 角色 ----------------
IMG = cfg['images']
CH_H = int(H * 0.86)
gpt = cutout(IMG['gpt'], CH_H)
ds = cutout(IMG['deepseek'], CH_H)
ds_small = tint(cutout(IMG['deepseek'], int(H * 0.46)), bright=0.28, sat=0.1, color=(40, 60, 100), amt=0.35)
gpt_glow = glow_of(gpt, 28, (190, 215, 255), 1.6)
ds_glow = glow_of(ds, 26, (255, 200, 120), 1.5)

# ---------------- 文字 ----------------
FONT_LYR = ImageFont.truetype(cfg['font_lyric'], int(H * 0.105))
FONT_LBL = ImageFont.truetype(cfg['font_label'], int(H * 0.026))
FONT_NUM = ImageFont.truetype(cfg['font_label'], int(H * 0.040))
FONT_TAG = ImageFont.truetype(cfg['font_label'], int(H * 0.022))

LYRICS = [  # (字, 出现时间)
    ([('提', 0.05), ('笔', 0.54), ('写', 0.86), ('苍', 1.24), ('苍', 1.54), ('蒹', 1.92), ('葭', 2.32)], 5.10),
    ([('前', 5.72), ('路', 6.08), ('有', 6.60), ('漫', 6.90), ('漫', 7.26), ('黄', 7.60), ('沙', 8.06)], 10.70),
]

def glyph(ch):
    pad = 40
    bbox = FONT_LYR.getbbox(ch)
    w, h = bbox[2] - bbox[0] + pad * 2, FONT_LYR.size + pad * 2
    # 墨色描边阴影
    sh = Image.new('L', (w, h), 0); ImageDraw.Draw(sh).text((pad - bbox[0], pad), ch, font=FONT_LYR, fill=255)
    shadow = sh.filter(ImageFilter.GaussianBlur(9))
    # 金色渐变字面
    grad = np.linspace(0, 1, h)[:, None]
    top, bot = np.array([255, 246, 222]), np.array([214, 168, 92])
    face = (top + (bot - top) * grad[..., None]).repeat(w, 1).astype(np.uint8)
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    s = Image.new('RGBA', (w, h), (6, 8, 14, 0)); s.putalpha(shadow.point(lambda v: int(v * 0.95)))
    out.alpha_composite(s, (4, 6))
    gl = Image.new('RGBA', (w, h), (255, 200, 120, 0)); gl.putalpha(sh.filter(ImageFilter.GaussianBlur(16)).point(lambda v: int(v * 0.45)))
    out.alpha_composite(gl)
    f = Image.fromarray(face, 'RGB').convert('RGBA'); f.putalpha(sh)
    out.alpha_composite(f)
    adv = FONT_LYR.getlength(ch)
    return out, adv, pad

GLYPHS = {}
def get_glyph(ch):
    if ch not in GLYPHS: GLYPHS[ch] = glyph(ch)
    return GLYPHS[ch]

def draw_lyrics(canvas, t):
    for chars, t_out in LYRICS:
        if t < chars[0][1] - 0.05 or t > t_out + 0.5: continue
        advs = [get_glyph(c)[1] * 1.04 for c, _ in chars]
        total = sum(advs); x = W / 2 - total / 2; base_y = int(H * 0.80)
        k_out = clamp01((t - t_out) / 0.45)
        for (c, tc), adv in zip(chars, advs):
            g, _, pad = get_glyph(c)
            k = ease_out((t - tc) / 0.42)
            if k <= 0: x += adv; continue
            a = k * (1 - k_out)
            sc = 1.28 - 0.28 * k
            blur = (1 - k) * 10 + k_out * 8
            img = g
            if blur > 0.4: img = img.filter(ImageFilter.GaussianBlur(blur))
            if abs(sc - 1) > 0.01: img = img.resize((int(img.width * sc), int(img.height * sc)), Image.BICUBIC)
            if a < 0.999:
                al = img.getchannel('A').point(lambda v: int(v * a)); img = img.copy(); img.putalpha(al)
            cx = x + adv / 2; cy = base_y - 14 * (1 - k) - 24 * k_out
            canvas.alpha_composite(img, (int(cx - img.width / 2), int(cy - img.height / 2)))
            x += adv

# ---------------- 中间对比图表 ----------------
def draw_chart(canvas, t):
    if t < 5.75: return
    d = ImageDraw.Draw(canvas)
    cx = W // 2; top = int(H * 0.17); bh = int(H * 0.40); bw = int(W * 0.045); gap = int(W * 0.035)
    phase2 = t >= 8.30
    k_in = ease_out((t - (5.85 if not phase2 else 8.32)) / 1.1)
    k_panel = ease_out((t - 5.75) / 0.35)
    # 面板
    pw, ph = int(W * 0.21), int(H * 0.60)
    panel = Image.new('RGBA', (pw, ph), (8, 10, 18, int(150 * k_panel)))
    pd = ImageDraw.Draw(panel); pd.rounded_rectangle([0, 0, pw - 1, ph - 1], 18, outline=(230, 200, 140, int(110 * k_panel)), width=2)
    canvas.alpha_composite(panel, (cx - pw // 2, top - int(H * 0.05)))
    if not phase2:
        title, unit = cfg['label_aime'], ''
        vals = [('DeepSeek-R1', 79.8, (240, 190, 100)), ('OpenAI o1', 79.2, (170, 195, 235))]
        vmax = 100.0; fmt = lambda v: f'{v:.1f}'
    else:
        title, unit = cfg['label_price'], ''
        vals = [('DeepSeek-R1', 2.19, (240, 190, 100)), ('OpenAI o1', 60.0, (170, 195, 235))]
        vmax = 64.0; fmt = lambda v: f'${v:.2f}' if v < 10 else f'${v:.0f}'
    # 切换时的闪白
    tw = d.textlength(title, font=FONT_LBL)
    d.text((cx - tw / 2, top - int(H * 0.035)), title, font=FONT_LBL, fill=(235, 225, 205, int(255 * k_panel)))
    x0 = cx - gap // 2 - bw
    base = top + int(H * 0.06) + bh
    for i, (name, v, col) in enumerate(vals):
        xb = x0 + i * (bw + gap)
        h = int(bh * (v / vmax) * k_in)
        if h > 0:
            bar = Image.new('RGBA', (bw, h), col + (235,))
            canvas.alpha_composite(bar, (xb, base - h))
        num = fmt(v * k_in)
        nw = d.textlength(num, font=FONT_NUM)
        d.text((xb + bw / 2 - nw / 2, base - h - int(H * 0.052)), num, font=FONT_NUM, fill=col + (int(255 * k_panel),))
        lw = d.textlength(name, font=FONT_TAG)
        d.text((xb + bw / 2 - lw / 2, base + 10), name, font=FONT_TAG, fill=(220, 220, 220, int(230 * k_panel)))
    if phase2 and t > 9.4:
        k = ease_out((t - 9.4) / 0.4)
        s = cfg['label_ratio']; sw = d.textlength(s, font=FONT_NUM)
        d.text((cx - gap // 2 - bw / 2 - sw / 2, base - int(H * 0.20)), s, font=FONT_NUM, fill=(255, 210, 130, int(255 * k)))

BAND = Image.new('RGBA', (W, H), (0, 0, 0, 0))
_band = (np.exp(-((np.linspace(0, 1, H) - 0.80) ** 2) / 0.006) * 115).astype(np.uint8)
BAND.putalpha(Image.fromarray(np.repeat(_band[:, None], W, 1), 'L'))
BAND = Image.merge('RGBA', (Image.new('L', (W, H), 4), Image.new('L', (W, H), 6), Image.new('L', (W, H), 12), BAND.getchannel('A')))

# ---------------- 主循环 ----------------
ff = cfg['ffmpeg']
cmd = [ff, '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-']
if cfg.get('audio'):
    cmd += ['-ss', '0', '-t', f'{T1}', '-i', cfg['audio'], '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '256k',
            ] + (['-af', f'afade=t=out:st={T1-0.4}:d=0.4'] if cfg.get('fade_out', True) else [])
cmd += ['-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-shortest', cfg['out']]
proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
stills = set(int(s * FPS) for s in cfg.get('stills', []))
FLASH = [5.60, 8.30]

for fi in range(NF):
    t = T0 + fi / FPS
    shot2 = t >= 5.60
    par = t * 6
    bg = (BG_WARM if shot2 else BG_COLD)[:, int(100 + (par if not shot2 else -par)) % 200: int(100 + (par if not shot2 else -par)) % 200 + W]
    if bg.shape[1] < W: bg = (BG_WARM if shot2 else BG_COLD)[:, :W]
    mist = MIST[:, int(t * 14) % 200: int(t * 14) % 200 + W][..., None]
    frame = bg + mist * (np.array([150, 165, 190]) if not shot2 else np.array([200, 160, 120]))
    if not shot2:
        frame = frame + radial(W * 0.66, H * 0.30, W * 0.42, (120, 150, 210), 0.55)
    else:
        frame = frame + radial(W * 0.22, H * 0.35, W * 0.35, (255, 170, 80), 0.45) + radial(W * 0.78, H * 0.35, W * 0.35, (120, 150, 210), 0.40)
    canvas = Image.fromarray(frame.clip(0, 255).astype(np.uint8), 'RGB').convert('RGBA')

    if not shot2:
        # 镜头 1：GPT 高高在上，DeepSeek 只是远处一个暗影
        k = t / 5.6
        paste_scaled(canvas, ds_small, W * 0.20 + 10 * k, H * 0.93, 1.0, 0.75 * ease_io(t / 1.2))
        sc = 1.0 + 0.06 * ease_io(k)
        paste_scaled(canvas, gpt_glow, W * 0.64, H * 1.02, sc, 0.9)
        paste_scaled(canvas, gpt, W * 0.64, H * 1.02, sc, 1.0)
    else:
        # 镜头 2：并肩
        k_hit = ease_out((t - 5.6) / 0.5)
        sc_ds = 1.10 - 0.10 * k_hit
        paste_scaled(canvas, ds_glow, W * 0.22, H * 1.02, sc_ds, 0.85)
        paste_scaled(canvas, ds, W * 0.22, H * 1.02, sc_ds, 1.0)
        paste_scaled(canvas, gpt_glow, W * 0.78, H * 1.02, 1.0, 0.6)
        paste_scaled(canvas, gpt, W * 0.78, H * 1.02, 1.0, 1.0)
        draw_chart(canvas, t)

    canvas.alpha_composite(BAND)
    draw_lyrics(canvas, t)

    out = np.asarray(canvas.convert('RGB')).astype(np.float32)
    out = out * VIGN + GRAIN[fi % 6]
    for tf in FLASH:  # 卡点闪白
        if 0 <= t - tf < 0.18: out = out + (255 - out) * (0.55 * (1 - (t - tf) / 0.18))
    out = out * ease_io(t / 0.6) * ((1 - ease_io((t - (T1 - 0.35)) / 0.35)) if cfg.get('fade_out', True) else 1.0)
    out = out.clip(0, 255).astype(np.uint8)
    proc.stdin.write(out.tobytes())
    if fi in stills:
        Image.fromarray(out).save(os.path.join(cfg['still_dir'], f'still_{fi/FPS:05.2f}.jpg'), quality=88)
    if fi % 60 == 0: print('frame', fi, '/', NF, flush=True)
proc.stdin.close(); proc.wait()
print('done', cfg['out'])
