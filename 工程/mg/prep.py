import glob, os, shutil
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')).replace('\\', '/')  # 项目根目录
M = R + '/工程/mg/assets'
shutil.copy(R + '/素材/字体/ZhiMangXing-Regular.ttf', M + '/fonts/ZhiMangXing-Regular.ttf')
Image.open(R + '/Ai娘图片/豆包.webp').convert('RGBA').save(M + '/chars/doubao.png')
for f in sorted(glob.glob(R + '/素材/截图/raw/*.png')):
    im = Image.open(f).convert('RGB'); w = 1440
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(M + '/shots/' + os.path.basename(f)[:-4] + '.jpg', quality=86)
print('ok', len(os.listdir(M + '/shots')))
