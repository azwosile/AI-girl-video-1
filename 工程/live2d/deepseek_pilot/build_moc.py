"""DeepSeek 娘 Live2D 试点：直接写 MOC3（改编自 live2d-from-art worked-example/build_moc.py）。
整图一张网格（头部侧倾 / 呼吸 / 身体摆动 / 头发+鲸尾摆动），另加闭眼、闭嘴补层。"""
from pathlib import Path
import sys, json, math
SK = Path('D:/DeepSeek Harness WorkSpace/.agents/skills/live2d-from-art/assets/worked-example')
sys.path.insert(0, str(SK / 'tooling/py-moc3/src'))
from moc3 import Moc3
from moc3._core import SECTION_LAYOUT, ElemType, SectionEntry
SECTION_LAYOUT[41], SECTION_LAYOUT[44] = SECTION_LAYOUT[44], SECTION_LAYOUT[41]
SECTION_LAYOUT[82], SECTION_LAYOUT[83] = SECTION_LAYOUT[83], SECTION_LAYOUT[82]
from PIL import Image
import numpy as np
ROOT = Path(__file__).resolve().parent; out = ROOT / 'runtime'; out.mkdir(exist_ok=True)
lay = json.loads((ROOT / 'layout.json').read_text()); layers = lay['layers']; n = len(layers)
CW, CH = lay['canvas']; OX, OY, PPU = CW // 2, CH // 2, 1000
GRID = {'Body': (17, 31)}; DEFAULT_GRID = (6, 5)
geo = []
for l in layers:
    c, r = GRID.get(l['name'], DEFAULT_GRID); nv = c * r; nf = nv * 2
    geo.append(dict(cols=c, rows=r, nv=nv, nf=nf, stride=((nf + 15) // 16) * 16, ni=(c - 1) * (r - 1) * 6))
AT = 2048
m = Moc3(); m.canvas.pixels_per_unit = PPU; m.canvas.origin_x = OX; m.canvas.origin_y = OY; m.canvas.canvas_width = CW; m.canvas.canvas_height = CH
m.counts[4] = n; m.counts[9] = n; m.counts[10] = sum(g['stride'] for g in geo); m.counts[15] = sum(g['nf'] for g in geo); m.counts[16] = sum(g['ni'] for g in geo); m.counts[18] = 1; m.counts[19] = n; m.counts[12] = 1
for e in SECTION_LAYOUT:
    if e.elem_type != ElemType.RUNTIME: m[e.name] = [('' if e.elem_type == ElemType.STR64 else 0)] * m.counts[e.count_idx]
def put(k, v): m[k] = v
names = [l['name'] for l in layers]
put('art_mesh.ids', names)
for k in ['parent_part_indices', 'parent_deformer_indices']: put('art_mesh.' + k, [-1] * n)
for k in ['visibles', 'enables']: put('art_mesh.' + k, [True] * n)
put('art_mesh.vertex_counts', [g['nv'] for g in geo]); put('art_mesh.position_index_counts', [g['ni'] for g in geo])
put('art_mesh.drawable_flags', [4] * n)
m.counts[17] = 0; put('art_mesh.mask_begin_indices', [0] * n); put('art_mesh.mask_counts', [0] * n); put('drawable_mask.art_mesh_indices', [])
uvb = []; pib = []; a = b = 0
for g in geo: uvb.append(a); pib.append(b); a += g['nf']; b += g['ni']
put('art_mesh.uv_begin_indices', uvb); put('art_mesh.position_index_begin_indices', pib)
# 纹理图集 + 基础网格
base = []; uv = []; indices = []; atlas = Image.new('RGBA', (AT, AT)); cx = cy = 4; rowh = 0
for l, g in zip(layers, geo):
    im = Image.open(ROOT / l['texture']).convert('RGBA'); w, h = im.size
    if cx + w + 4 > AT: cx = 4; cy += rowh + 4; rowh = 0
    assert cy + h + 4 <= AT, 'atlas overflow'
    atlas.paste(Image.fromarray(np.pad(np.array(im), ((2, 2), (2, 2), (0, 0)), mode='edge')), (cx - 2, cy - 2))
    pts = []
    for row in range(g['rows']):
        for col in range(g['cols']):
            u, v = col / (g['cols'] - 1), row / (g['rows'] - 1)
            uv += [(cx + w * u) / AT, (cy + h * v) / AT]; pts += [(l['x'] + w * u - OX) / PPU, (l['y'] + h * v - OY) / PPU]
    base.append(pts)
    C = g['cols']
    for row in range(g['rows'] - 1):
        for col in range(C - 1):
            q = row * C + col; indices += [q, q + C, q + 1, q + 1, q + C, q + C + 1]
    cx += w + 4; rowh = max(rowh, h)
put('uv.xys', uv); put('position_index.indices', indices)
for k, v in [('object_begin_indices', [0]), ('object_counts', [n]), ('object_total_counts', [n]), ('min_draw_orders', [0]), ('max_draw_orders', [n - 1])]: put('draw_order_group.' + k, v)
put('draw_order_group_object.types', [0] * n); put('draw_order_group_object.indices', list(range(n))); put('draw_order_group_object.group_indices', [-1] * n)
params = [('ParamAngleZ', [-10., 0., 10.], 0.), ('ParamEyeLOpen', [0., 1.], 1.), ('ParamEyeROpen', [0., 1.], 1.), ('ParamMouthOpenY', [0., 1.], 1.),
          ('ParamBreath', [0., 1.], 0.), ('ParamBodySway', [-1., 0., 1.], 0.), ('ParamHairSwing', [-1., 0., 1.], 0.)]
p = len(params)
put('parameter.ids', [x for x, _, _ in params]); put('parameter.min_values', [v[0] for _, v, _ in params]); put('parameter.max_values', [v[-1] for _, v, _ in params])
put('parameter.default_values', [d for _, _, d in params]); put('parameter.repeats', [False] * p); put('parameter.decimal_places', [3] * p)
put('parameter.keyform_binding_begin_indices', list(range(p))); put('parameter.keyform_binding_counts', [1] * p)
offsets = []; keys = []
for _, v, _ in params: offsets.append(len(keys)); keys += v
m.counts[5] = p; m.counts[13] = p
put('keyform_binding.keys_begin_indices', offsets); put('keyform_binding.keys_counts', [len(v) for _, v, _ in params]); put('keys.values', keys)
# 保留与案例一致的（未挂载）旋转变形器
m.counts[1] = 1; m.counts[3] = 1; m.counts[8] = 3
for e in SECTION_LAYOUT:
    if e.group in ['deformer', 'rotation_deformer', 'rotation_deformer_keyform'] and e.elem_type != ElemType.RUNTIME: m[e.name] = [0] * m.counts[e.count_idx]
put('deformer.ids', ['HeadRotation']); put('deformer.keyform_binding_band_indices', [1]); put('deformer.visibles', [True]); put('deformer.enables', [True]); put('deformer.parent_part_indices', [-1]); put('deformer.parent_deformer_indices', [-1]); put('deformer.types', [1]); put('deformer.specific_indices', [0])
put('rotation_deformer.keyform_binding_band_indices', [1]); put('rotation_deformer.keyform_begin_indices', [0]); put('rotation_deformer.keyform_counts', [3]); put('rotation_deformer.base_angles', [0.])
put('rotation_deformer_keyform.opacities', [1.] * 3); put('rotation_deformer_keyform.angles', [-10., 0., 10.]); put('rotation_deformer_keyform.origin_xs', [0.] * 3); put('rotation_deformer_keyform.origin_ys', [-.16] * 3); put('rotation_deformer_keyform.scales', [1.] * 3)
# ---- 形变函数（像素坐标）----
NECK = (410., 300.)
def sstep(e0, e1, x):
    t = max(0., min(1., (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t)
def deform(px, py, tilt, breath, sway, hair):
    x, y = px, py
    # 头发 / 鲸尾：根部不动，越往下摆得越多
    if hair:
        wl = sstep(240, 120, x) * sstep(300, 760, y) * sstep(860, 700, y)       # 左侧长发
        wt = sstep(640, 820, x) * sstep(700, 1060, y) * (1 - sstep(1060, 1120, y))  # 鲸尾
        x += hair * (9 * wl + 14 * wt); y -= abs(hair) * (2 * wl + 3 * wt)
    # 呼吸：胸口轻抬，领口和腰部锚定
    if breath:
        wb = math.exp(-((y - 450) / 110) ** 2) * sstep(150, 300, x) * sstep(700, 600, x)
        y -= 4 * breath * wb
    # 头部侧倾：以颈部为轴，颈部以下渐变到不动
    if tilt:
        w = sstep(335, 285, y); ang = math.radians(tilt) * w
        dx, dy = x - NECK[0], y - NECK[1]
        x = NECK[0] + dx * math.cos(ang) - dy * math.sin(ang); y = NECK[1] + dx * math.sin(ang) + dy * math.cos(ang)
    # 身体重心：以脚为锚，越往上偏移越多
    if sway: x += 16 * sway * sstep(1560, 300, y)
    return x, y
AX = {0: 'tilt', 4: 'breath', 5: 'sway', 6: 'hair'}
band_axes = [[]] + [[i] for i in range(p)]
position = []; begins = []; counts = []; bands = []; opac = []; orders = []; posb = []
for i, (l, g) in enumerate(zip(layers, geo)):
    nm = l['name']
    own = {'EyeClosedLeft': 1, 'EyeClosedRight': 2, 'MouthClosed': 3}.get(nm)
    axes = [0, 4, 5, 6] if nm == 'Body' else [own, 0, 5]
    if axes not in band_axes: band_axes.append(axes)
    bands.append(band_axes.index(axes)); begins.append(len(opac))
    import itertools
    combos = list(itertools.product(*[params[a][1] for a in reversed(axes)]))  # 第一个轴变化最快
    counts.append(len(combos))
    for combo in combos:
        val = dict(zip(reversed(axes), combo)); kw = {AX[k]: val.get(k, 0.) for k in AX}
        pts = []
        for k in range(0, g['nf'], 2):
            px, py = base[i][k] * PPU + OX, base[i][k + 1] * PPU + OY
            qx, qy = deform(px, py, **kw); pts += [(qx - OX) / PPU, (qy - OY) / PPU]
        o = 1. if own is None else (1 - val[own]) ** .7
        posb.append(len(position)); position += pts + [0.] * (g['stride'] - g['nf']); opac.append(o); orders.append(float(i))
slot = []; bstart = []
for ax in band_axes: bstart.append(len(slot)); slot += ax
m.counts[12] = len(band_axes); m.counts[11] = len(slot)
put('keyform_binding_index.indices', slot); put('keyform_binding_band.begin_indices', bstart); put('keyform_binding_band.counts', [len(x) for x in band_axes])
m.counts[9] = len(opac); m.counts[10] = len(position)
put('art_mesh.keyform_binding_band_indices', bands); put('art_mesh.keyform_begin_indices', begins); put('art_mesh.keyform_counts', counts)
put('art_mesh_keyform.opacities', opac); put('art_mesh_keyform.draw_orders', orders); put('art_mesh_keyform.keyform_position_begin_indices', posb); put('keyform_position.xys', position)
extra = []
for s in range(101, 137):
    extra.append(SectionEntry(f'v42.{s}', ElemType.F32 if s in list(range(108, 114)) + [135, 136] else ElemType.I32, -1, 64)); m[f'v42.{s}'] = []
extra[1] = SectionEntry('v42.102', ElemType.RUNTIME, 5, 64)
m.header.version = 4; m._build_layout = lambda: list(SECTION_LAYOUT) + extra
colors = len(opac) + 3; m.counts.extend([colors, colors] + [0] * 7)
put('v42.103', [len(keys) + o for o in offsets]); put('v42.104', [len(v) for _, v, _ in params])
put('keys.values', keys + keys); m.counts[14] = len(keys) * 2
put('v42.106', [0]); put('v42.107', [b + 3 for b in begins])
for s in range(108, 111): put(f'v42.{s}', [1.] * colors)
for s in range(111, 114): put(f'v42.{s}', [0.] * colors)
put('v42.114', [0] * p); put('v42.115', [0] * p); put('v42.116', [0] * p)
m.to_file(out / 'DeepSeek.moc3'); atlas.save(out / 'texture_00.png')
# 待机动作（8 秒循环）+ 物理 + 清单
curves = []
def curve(cid, vals, dur=8.):
    seg = [0., vals[0]]; st = dur / (len(vals) - 1)
    for t, v in enumerate(vals[1:], 1): seg += [0, round(t * st, 3), float(v)]
    curves.append({'Target': 'Parameter', 'Id': cid, 'Segments': seg})
curve('ParamAngleZ', [0, 1.5, 3, 2, 0, -1.5, -2.5, -1, 0]); curve('ParamBreath', [0, .5, 1, .5, 0, .5, 1, .5, 0])
curve('ParamBodySway', [0, .1, .2, .1, 0, -.1, -.2, -.1, 0]); curve('ParamHairSwing', [0, .3, .5, .2, -.2, -.5, -.3, 0, 0])
curves.append({'Target': 'Parameter', 'Id': 'ParamMouthOpenY', 'Segments': [0, 1, 0, 8, 1]})
for e in ('ParamEyeLOpen', 'ParamEyeROpen'): curves.append({'Target': 'Parameter', 'Id': e, 'Segments': [0, 1, 0, 2.4, 1, 0, 2.5, 0, 0, 2.65, 1, 0, 6.3, 1, 0, 6.4, 0, 0, 6.55, 1, 0, 8, 1]})
segs = sum((len(c['Segments']) - 2) // 3 for c in curves)
(out / 'idle.motion3.json').write_text(json.dumps({'Version': 3, 'Meta': {'Duration': 8., 'Fps': 30., 'Loop': True, 'AreBeziersRestricted': True, 'CurveCount': len(curves), 'TotalSegmentCount': segs, 'TotalPointCount': segs + len(curves), 'UserDataCount': 0, 'TotalUserDataSize': 0}, 'Curves': curves, 'UserData': []}, indent=1))
(out / 'DeepSeek.cdi3.json').write_text(json.dumps({'Version': 3, 'Parameters': [{'Id': x, 'GroupId': '', 'Name': x} for x, _, _ in params], 'ParameterGroups': [], 'Parts': []}, indent=1))
(out / 'DeepSeek.model3.json').write_text(json.dumps({'Version': 3, 'FileReferences': {'Moc': 'DeepSeek.moc3', 'Textures': ['texture_00.png'], 'DisplayInfo': 'DeepSeek.cdi3.json', 'Motions': {'Idle': [{'File': 'idle.motion3.json', 'FadeInTime': .5, 'FadeOutTime': .5}]}},
    'Groups': [{'Target': 'Parameter', 'Name': 'EyeBlink', 'Ids': ['ParamEyeLOpen', 'ParamEyeROpen']}, {'Target': 'Parameter', 'Name': 'LipSync', 'Ids': ['ParamMouthOpenY']}]}, indent=1))
print(m.summary())
