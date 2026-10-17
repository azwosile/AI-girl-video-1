import glob, os
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))  # 项目根目录
src = os.path.join(ROOT, '素材', '截图', 'raw')
dst = os.path.join(ROOT, '素材', '截图', 'mid')
os.makedirs(dst, exist_ok=True)
for f in sorted(glob.glob(src + '/*.png')):
    im = Image.open(f).convert('RGB')
    w = 960; h = round(im.height * w / im.width)
    im = im.resize((w, h), Image.LANCZOS)
    o = dst + '/' + os.path.basename(f)[:-4] + '.jpg'
    im.save(o, quality=62)
    print(os.path.basename(o), im.size, os.path.getsize(o))
