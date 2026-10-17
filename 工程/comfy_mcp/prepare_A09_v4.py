"""为 A09 制作不含文字的人物反应底片首帧；不覆盖已有首帧。"""
from pathlib import Path
import hashlib
import json

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
SOURCE = ROOT / 'Ai娘图片/DeepSeek_表情差分/02_沮丧_透明.png'
DEST = HERE / 'A09_Flash1017_v4_firstframe.png'
W, H = 864, 480


def main():
    if DEST.exists():
        with Image.open(DEST) as existing:
            size = existing.size
        print(json.dumps({'status': 'already_present', 'path': str(DEST), 'size': size}, ensure_ascii=False))
        return

    y, x = np.mgrid[0:H, 0:W]
    glow = np.exp(-(((x - 230) / 310) ** 2 + ((y - 215) / 220) ** 2))
    edge = np.clip(1 - .22 * (((x - W / 2) / (W / 2)) ** 2 + ((y - H / 2) / (H / 2)) ** 2), .56, 1)
    rgb = np.zeros((H, W, 3), dtype=np.float32)
    for c, (base, extra) in enumerate([(9, 9), (15, 23), (28, 37)]):
        rgb[:, :, c] = (base + extra * glow) * edge
    rng = np.random.default_rng(10172026)
    rgb += rng.normal(0, .55, (H, W, 1))
    canvas = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).convert('RGBA')

    room = Image.new('RGBA', (W, H))
    d = ImageDraw.Draw(room)
    d.rounded_rectangle((25, 86, 341, 300), radius=12, fill=(20, 38, 61, 210), outline=(61, 95, 123, 115), width=2)
    d.rounded_rectangle((43, 104, 323, 283), radius=5, fill=(18, 40, 66, 235))
    # 纯几何屏幕形状，不放假新闻、假终端文字或数据。
    d.rectangle((62, 125, 217, 131), fill=(63, 96, 124, 115))
    d.rectangle((62, 149, 286, 154), fill=(57, 89, 119, 100))
    d.rectangle((62, 171, 249, 176), fill=(55, 91, 124, 95))
    d.rectangle((62, 199, 180, 239), fill=(40, 69, 99, 120))
    d.rectangle((195, 199, 302, 239), fill=(39, 67, 95, 105))
    d.rectangle((167, 300, 198, 352), fill=(16, 28, 43, 235))
    d.rounded_rectangle((116, 348, 250, 356), radius=4, fill=(31, 47, 62, 220))
    d.polygon([(0, 377), (864, 395), (864, 480), (0, 480)], fill=(13, 22, 34, 170))
    d.line((0, 378, 864, 396), fill=(68, 92, 110, 65), width=2)
    room = room.filter(ImageFilter.GaussianBlur(2.4))
    canvas = Image.alpha_composite(canvas, room)

    source = Image.open(SOURCE).convert('RGBA')
    original_alpha = source.getchannel('A')
    source = ImageEnhance.Color(source).enhance(.76)
    source = ImageEnhance.Brightness(source).enhance(.83)
    source.putalpha(original_alpha)
    source = source.crop((0, 0, source.width, min(source.height, 810)))
    target_w = 520
    source = source.resize((target_w, round(source.height * target_w / source.width)), Image.Resampling.LANCZOS)
    canvas.alpha_composite(source, (360, 18))
    # 不裁出一只孤立的手；构图下沿截在躯干，动作只交给眼睛和下巴。
    canvas.convert('RGB').save(DEST, format='PNG', optimize=True)
    metadata = {
        'source': str(SOURCE),
        'source_sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        'first_frame': str(DEST),
        'first_frame_sha256': hashlib.sha256(DEST.read_bytes()).hexdigest(),
        'width': W, 'height': H,
        'purpose': 'A09 人物微动底片，复杂资料与文字后期叠加',
    }
    (HERE / 'A09_Flash1017_v4_firstframe_meta.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'status': 'prepared', **metadata}, ensure_ascii=False))


if __name__ == '__main__':
    main()
