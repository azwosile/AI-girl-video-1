# 生成 AE 特效工程脚本：cue 表 → build_fx.jsx（中等力度；参考 world.execute(me) 的转场/光效语法）
import json, math, sys
FPS = 30
DUR = 90.67
PLATE = sys.argv[1] if len(sys.argv) > 1 else "D:/DeepSeek Harness WorkSpace/国模 江湖之间/素材/示例镜头/示例_00-90_全片MG_v10_帕累托展望_S18超分.mp4"
AEP = sys.argv[2] if len(sys.argv) > 2 else "D:/DeepSeek Harness WorkSpace/国模 江湖之间/工程/ae/江湖之间_FX_v1.aep"

ev = []          # (t, kind, amp, extra)
def E(t, k, a=1.0, **x): ev.append((t, k, a, x))

# ---- 镜头切点：每个切点的处理由镜头内容决定（硬切卡点 / 推进 / 故障 / 光） ----
E(5.6, 'punch', 3); E(5.6, 'rgb', 6)                                   # S02 R1
E(11.2, 'punch', 4); E(11.2, 'flash', .18); E(11.2, 'rgb', 8)          # S03 大字快切
E(16.9, 'punch', 3); E(16.9, 'glitch', .25, dur=.25)                   # S04 GLM 开源
E(22.9, 'punch', 3); E(22.9, 'rgb', 8)                                 # S05 Kimi vs Claude
E(28.3, 'zoom', 40, lead=.25, tail=.22); E(28.3, 'punch', 4)           # S06 Seedance Token 洪流：推进
E(32.7, 'flash', .22); E(32.7, 'punch', 4)                             # S07 拼贴快切
E(38.6, 'glow', .35)                                                   # S08 昙花：软，不闪
E(44.13, 'punch', 6); E(44.13, 'rgb', 14); E(44.13, 'flash', .2); E(44.13, 'glow', .6)  # S09 副歌：画面 44.1 才从黑里出来，卡在出画瞬间
E(44.40, 'shake', 10, dur=.5); E(44.40, 'rgb', 8)                   # ¥6 涨价牌砸下
for w in [44.82, 45.10, 45.36, 45.86, 46.20, 46.52, 46.86, 47.12]:     # 「逃不过相忘江湖之间」逐字微推
    E(w, 'punch', 1.2)
E(47.5, 'zoom', 45, lead=.25, tail=.22); E(47.5, 'punch', 3)           # S10 追赶：推进
E(50.4, 'glitch', .3, dur=.3); E(50.4, 'rgb', 10)                      # S11 Qwen Max
E(55.4, 'glitch', .35, dur=.35); E(55.4, 'rgb', 10)                    # S12 终端 .git（+扫描线段）
E(59.0, 'glitch', .4, dur=.4); E(59.0, 'rgb', 12)                      # S13 Kimi 没了消息（+掉帧段）
E(61.7, 'punch', 4); E(61.7, 'flash', .2)                              # S14 豆包「唐」
E(66.9, 'punch', 5); E(66.9, 'flash', .28); E(66.9, 'glow', .6)        # S15 副歌二：未来四卡
for w in [67.70, 68.22, 68.70, 69.08]:                                 # 四张卡翻面
    E(w, 'punch', 1.5); E(w, 'rgb', 4); E(w, 'glow', .25)
E(70.4, 'rays', 40, t1=72.3, at=(960, 420), peak=.45); E(70.4, 'glow', .5); E(70.4, 'punch', 3)  # S16 1017 揭开
E(73.3, 'punch', 3); E(73.3, 'rgb', 8)                                 # S17 Qwen 4
E(75.8, 'punch', 3); E(75.8, 'rgb', 8)                                 # S18 GLM-5.5
E(78.2, 'punch', 3); E(78.2, 'rgb', 8)                                 # S19 Kimi K3.1
E(81.8, 'punch', 2.5)                                                  # S20 群像（S19 已模糊出，软）
E(85.0, 'rays', 30, t1=86.9, at=(1420, 300), peak=.5)                  # S21 DeepSeek 入场
E(86.18, 'glow', .4)                                                   # 帕累托最优
E(87.48, 'punch', 2); E(87.48, 'glow', .4)                             # SOTA
E(87.95, 'glow', .3)                                                   # V4.1 Pro 弧线

# ---- 包络（逐帧采样后求和）----
def env(kind, a, u):
    if kind == 'punch':  # 冲一下再回
        if u < 0: return 0
        return a * math.exp(-u / .12) if u < .6 else 0
    if kind == 'rgb':
        if u < 0: return 0
        return a * math.exp(-u / .10) if u < .45 else 0
    if kind == 'flash':
        if u < 0: return 0
        return a * math.exp(-u / .07) if u < .3 else 0
    if kind == 'glow':
        if u < 0: return 0
        return a * math.exp(-u / .25) if u < 1.2 else 0
    return 0
def env_shake(a, dur, u):
    return a * (1 - u / dur) if 0 <= u < dur else 0

N = int(round(DUR * FPS)) + 1
ch = {k: [0.0] * N for k in ('punch', 'rgb', 'flash', 'glow', 'shake')}
for t, k, a, x in ev:
    if k in ('punch', 'rgb', 'flash', 'glow'):
        for f in range(N):
            v = env(k, a, f / FPS - t)
            if v: ch[k][f] += v
    elif k == 'shake':
        for f in range(N):
            v = env_shake(a, x['dur'], f / FPS - t)
            if v: ch[k][f] += v
def keys(arr, eps=1e-3):
    ts, vs = [], []
    for f, v in enumerate(arr):
        prev = arr[f - 1] if f else 0; nxt = arr[f + 1] if f + 1 < len(arr) else 0
        if abs(v) > eps or abs(prev) > eps or abs(nxt) > eps:
            ts.append(round(f / FPS, 5)); vs.append(round(v, 4))
    if not ts: ts, vs = [0], [0]
    return [ts, vs]
cues = {k: keys(v) for k, v in ch.items()}
trim = [dict(t=t, kind=k, a=a, **{kk: vv for kk, vv in x.items()}) for t, k, a, x in ev if k in ('zoom', 'glitch', 'rays')]
data = dict(fps=FPS, dur=DUR, plate=PLATE, aep=AEP, cues=cues, trim=trim,
            echo=[38.6, 43.9], stutter=[59.0, 61.7], scan=[55.4, 59.0])
jsx = open('/home/user/ae/build_fx_tpl.jsx', encoding='utf-8').read().replace('__DATA__', json.dumps(data, ensure_ascii=False))
open('/home/user/ae/build_fx.jsx', 'w', encoding='utf-8-sig').write(jsx)
print('events', len(ev), {k: len(v[0]) for k, v in cues.items()}, 'trim', len(trim))
