import glob, os
from PIL import Image
src = 'D:/DeepSeek Harness WorkSpace/国模 江湖之间/素材/截图/raw'
dst = 'D:/DeepSeek Harness WorkSpace/国模 江湖之间/素材/截图/mid'
os.makedirs(dst, exist_ok=True)
for f in sorted(glob.glob(src + '/*.png')):
    im = Image.open(f).convert('RGB')
    w = 960; h = round(im.height * w / im.width)
    im = im.resize((w, h), Image.LANCZOS)
    o = dst + '/' + os.path.basename(f)[:-4] + '.jpg'
    im.save(o, quality=62)
    print(os.path.basename(o), im.size, os.path.getsize(o))
