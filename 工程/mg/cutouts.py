# 立绘抠图 -> 透明 PNG（裁到包围盒）。用法: python cutouts.py <out_dir> <height> name=path ...
import sys, os, numpy as np, cv2
from PIL import Image
out, H = sys.argv[1], int(sys.argv[2]); os.makedirs(out, exist_ok=True)
for arg in sys.argv[3:]:
    name, path = arg.split('=', 1)
    im = Image.open(path)
    if im.mode in ('RGBA', 'LA', 'P') and np.asarray(im.convert('RGBA'))[..., 3].min() < 200:
        im = im.convert('RGBA'); im = im.resize((round(im.width * H / im.height), H), Image.LANCZOS)
    else:
        im = im.convert('RGB'); im = im.resize((round(im.width * H / im.height), H), Image.LANCZOS)
        a = np.asarray(im).astype(np.int16)
        white = ((a.min(axis=2) > 228) & ((a.max(axis=2) - a.min(axis=2)) < 22)).astype(np.uint8)
        h, w = white.shape; ff = white * 255; mask = np.zeros((h + 2, w + 2), np.uint8)
        for (x, y) in [(0, 0), (w-1, 0), (0, h-1), (w-1, h-1), (w//2, 0), (0, h//2), (w-1, h//2), (w//2, h-1)]:
            if ff[y, x] == 255: cv2.floodFill(ff, mask, (x, y), 128)
        alpha = 1 - (ff == 128).astype(np.uint8)
        alpha = cv2.erode(alpha, np.ones((3, 3), np.uint8), 1)
        alpha = cv2.GaussianBlur(alpha.astype(np.float32), (0, 0), 1.2)
        im = Image.fromarray(np.dstack([np.asarray(im), (alpha * 255).clip(0, 255).astype(np.uint8)]), 'RGBA')
    im = im.crop(im.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox())
    im.save(f'{out}/{name}.png', optimize=True); print(name, im.size)
