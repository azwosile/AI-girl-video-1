from PIL import Image
R='../../Ai娘图片/'
Image.open(R+'你这吃白饭的蓝色大肥鱼.png').convert('RGB').resize((900,900),Image.LANCZOS).save('assets/chars/fish.jpg',quality=90)
Image.open(R+'豆包 奶龙版.jpg').convert('RGB').save('assets/chars/doubao_nailong.jpg',quality=92)
print('ok')
