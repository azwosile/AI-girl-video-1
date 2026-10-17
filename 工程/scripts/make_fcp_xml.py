from urllib.parse import quote
from xml.sax.saxutils import escape
from pathlib import Path
FPS = 30
P = Path(__file__).resolve().parents[2].as_posix() + '/'  # 项目根目录
def url(p): return 'file://localhost/' + quote(p, safe='/:')
def fr(s): return int(round(s * FPS))
RATE = f'<rate><timebase>{FPS}</timebase><ntsc>FALSE</ntsc></rate>'
VID = [('示例_00-70_非AI镜头_v4.mp4', 0.0, 70.4)]
AUD = (P + '音频/江湖之间.mp4', 90.67)
SHOTS = [(0.0, '01 GPT 娘独亮'), (5.6, '02 R1 · 思维链公开 / 深度思考成标配'), (11.2, '03 Qwen3.8-27B 家用显卡能跑'), (16.9, '04 GLM-5.3 开源第一'),
         (22.9, '05 Kimi K3 ≈ Opus 4.8'), (28.3, '06 Seedance 2.5 · 日均 Token 180 万亿'), (32.7, '07 拼贴 → 合影（+Gemini/Grok）'),
         (38.6, '08 去色 · 404 · 烧边'), (43.9, '09 V4-Pro-0813 超级涨价 · 神区二相性'), (47.5, '10 V4.1 Flash · 蓝色大肥鱼'), (50.4, '11 Qwen3.8-Max-0902 B站实测：不如 Flash'),
         (55.4, '12 GLM ZCode .git'), (59.0, '13 Kimi 台历'), (61.7, '14 豆包 · 最直白最直接 · 唐'), (66.9, '15 ? 卡翻面'),
         (70.4, '16 [AI A9] DeepSeek 归来'), (73.4, '17 [AI A10] Qwen 4'), (75.8, '18 [AI A11] GLM-5.5'), (78.2, '19 [AI A12] Kimi K3.1'),
         (81.8, '20 [AI A13] 隔河平视'), (84.8, '21 [AI A14] 好眠（淡出）')]
def vfile(i, name, dur):
    return (f'<file id="vf{i}"><name>{escape(name)}</name><pathurl>{url(P + "素材/示例镜头/" + name)}</pathurl>{RATE}'
            f'<duration>{fr(dur)}</duration><media><video><samplecharacteristics>{RATE}<width>1920</width><height>1080</height>'
            f'<pixelaspectratio>square</pixelaspectratio></samplecharacteristics></video>'
            f'<audio><samplecharacteristics><depth>16</depth><samplerate>48000</samplerate></samplecharacteristics><channelcount>2</channelcount></audio></media></file>')
vclips = ''
for i, (name, st, dur) in enumerate(VID):
    vclips += (f'<clipitem id="vc{i}"><name>{escape(name)}</name><enabled>TRUE</enabled><duration>{fr(dur)}</duration>{RATE}'
               f'<start>{fr(st)}</start><end>{fr(st) + fr(dur)}</end><in>0</in><out>{fr(dur)}</out>{vfile(i, name, dur)}'
               f'<sourcetrack><mediatype>video</mediatype></sourcetrack></clipitem>')
ad = fr(AUD[1])
afile = (f'<file id="af0"><name>江湖之间.mp4</name><pathurl>{url(AUD[0])}</pathurl>{RATE}<duration>{ad}</duration>'
         f'<media><audio><samplecharacteristics><depth>16</depth><samplerate>44100</samplerate></samplecharacteristics><channelcount>2</channelcount></audio></media></file>')
atracks = ''
for ch in (1, 2):
    f = afile if ch == 1 else '<file id="af0"/>'
    atracks += (f'<track><clipitem id="ac{ch}"><name>江湖之间.mp4</name><enabled>TRUE</enabled><duration>{ad}</duration>{RATE}'
                f'<start>0</start><end>{ad}</end><in>0</in><out>{ad}</out>{f}'
                f'<sourcetrack><mediatype>audio</mediatype><trackindex>{ch}</trackindex></sourcetrack></clipitem>'
                f'<outputchannelindex>{ch}</outputchannelindex></track>')
markers = ''.join(f'<marker><name>{escape(n)}</name><comment></comment><in>{fr(t)}</in><out>-1</out></marker>' for t, n in SHOTS)
xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="4"><sequence id="seq1"><name>审查_无AI镜头_v4</name><duration>{ad}</duration>{RATE}
<media><video><format><samplecharacteristics>{RATE}<width>1920</width><height>1080</height><pixelaspectratio>square</pixelaspectratio><fielddominance>none</fielddominance></samplecharacteristics></format>
<track>{vclips}</track></video>
<audio><numOutputChannels>2</numOutputChannels><format><samplecharacteristics><depth>16</depth><samplerate>48000</samplerate></samplecharacteristics></format>{atracks}</audio></media>
{markers}</sequence></xmeml>
'''
open('review_seq_v4.xml', 'w', encoding='utf-8').write(xml)
print(len(xml))
