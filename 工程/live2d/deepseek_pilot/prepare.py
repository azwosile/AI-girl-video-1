"""DeepSeek 娘 Live2D 试点：从单张立绘生成闭眼 / 闭嘴补层（OpenCV inpaint 补皮肤 + 手绘线）。"""
from pathlib import Path
import json, cv2, numpy as np
from PIL import Image, ImageDraw
R = Path(__file__).resolve().parent; L = R / 'layers'; L.mkdir(exist_ok=True)
ref = Image.open(R / 'Reference.png').convert('RGBA'); W, H = ref.size
rgb = cv2.cvtColor(np.array(ref.convert('RGB')), cv2.COLOR_RGB2BGR)
def patch(name, box, ellipse, rot, lines, lw=3):
    x0, y0, x1, y1 = box; S = 4
    mask = np.zeros((H, W), np.uint8); cv2.ellipse(mask, ellipse[0], ellipse[1], rot, 0, 360, 255, -1)
    ring = cv2.dilate(mask, np.ones((15, 15), np.uint8)) & ~mask
    src = np.array(ref.convert('RGB')).astype(int)
    skin = (src[..., 0] > 190) & (src[..., 0] > src[..., 2] + 25) & (src[..., 1] > 140)
    cyy = ellipse[0][1]; ys = np.arange(H)[:, None].repeat(W, 1)
    top = np.median(src[(ring > 0) & skin & (ys < cyy)], 0); bot = np.median(src[(ring > 0) & skin & (ys >= cyy)], 0)
    # 皮肤色竖向渐变（上眼睑略深），4 倍超采样画线后缩小，避免锯齿
    bw, bh = x1 - x0, y1 - y0
    big = Image.new('RGBA', (bw * S, bh * S)); px = big.load()
    for yy in range(bh * S):
        t = yy / (bh * S - 1); c = top * (1 - t) * 0.97 + bot * t
        for xx in range(bw * S): px[xx, yy] = (int(c[0]), int(c[1]), int(c[2]), 255)
    m = cv2.GaussianBlur(mask, (0, 0), 1.6)[y0:y1, x0:x1]
    big.putalpha(Image.fromarray(m).resize((bw * S, bh * S), Image.BILINEAR))
    d = ImageDraw.Draw(big)
    for pts, col, w in lines: d.line([((x - x0) * S, (y - y0) * S) for x, y in pts], fill=col, width=w * S, joint='curve')
    big.resize((bw, bh), Image.LANCZOS).save(L / f'{name}.png')
    return {'name': name, 'texture': f'layers/{name}.png', 'x': x0, 'y': y0, 'w': bw, 'h': bh}
def arc(p0, p1, sag, n=12):
    import math
    return [(p0[0] + (p1[0] - p0[0]) * t / n, p0[1] + (p1[1] - p0[1]) * t / n + sag * math.sin(math.pi * t / n)) for t in range(n + 1)]
LASH = (38, 30, 62, 255)
layers = [{'name': 'Body', 'texture': 'Reference.png', 'x': 0, 'y': 0, 'w': W, 'h': H}]
layers.append(patch('EyeClosedLeft', (334, 188, 396, 240), ((366, 214), (25, 17)), -15,
    [(arc((345, 221), (387, 211), 5), LASH, 3), ([(347, 221), (339, 225)], LASH, 2), ([(351, 224), (345, 230)], LASH, 2)]))
layers.append(patch('EyeClosedRight', (424, 162, 488, 212), ((455, 187), (26, 17)), -6,
    [(arc((433, 191), (478, 186), 5), LASH, 3), ([(476, 187), (484, 190)], LASH, 2), ([(472, 190), (479, 196)], LASH, 2)]))
layers.append(patch('MouthClosed', (392, 232, 446, 276), ((419, 254), (21, 15)), -8,
    [(arc((404, 254), (434, 249), 4), (120, 50, 60, 255), 2)], 2))
(R / 'layout.json').write_text(json.dumps({'canvas': [W, H], 'layers': layers}, indent=1))
# 预览：所有补层叠到原图上（= 闭眼 + 闭嘴状态）
comp = ref.copy()
for l in layers[1:]: comp.alpha_composite(Image.open(R / l['texture']), (l['x'], l['y']))
Image.fromarray(np.hstack([np.array(ref.crop((300, 120, 540, 320)).convert('RGB')), np.array(comp.crop((300, 120, 540, 320)).convert('RGB'))])).resize((960, 400)).save(R / 'check_closed_face.jpg', quality=88)
print('ok', len(layers))
