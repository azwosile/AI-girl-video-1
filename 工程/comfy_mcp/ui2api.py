# 把 ComfyUI UI 工作流里「启用」(mode 0) 的节点转成 API 格式。用法: python ui2api.py ui.json out.json
import json, sys, urllib.request
ui = json.load(open(sys.argv[1], encoding='utf-8'))
SKIP = {'MarkdownNote', 'Note', 'Fast Groups Bypasser (rgthree)', 'Reroute'}
nodes = {n['id']: n for n in ui['nodes'] if n.get('mode', 0) == 0 and n['type'] not in SKIP}
links = {l[0]: l for l in ui['links']}
types = sorted({n['type'] for n in nodes.values()})
info = {t: json.load(urllib.request.urlopen('http://127.0.0.1:8188/object_info/' + urllib.parse.quote(t)))[t] for t in types}
api = {}
for nid, n in nodes.items():
    oi = info[n['type']]; req = oi['input'].get('required', {}); opt = oi['input'].get('optional', {})
    order = oi.get('input_order', {}); names = order.get('required', list(req)) + order.get('optional', list(opt))
    spec = {**req, **opt}
    linked = {i['name']: i['link'] for i in n.get('inputs', []) if i.get('link') is not None}
    wv = n.get('widgets_values') or []
    if isinstance(wv, dict): wvals = dict(wv); wv = []
    else: wvals = {}
    inputs = {}; k = 0
    for name in names:
        s = spec[name]; t = s[0]
        is_widget = isinstance(t, list) or t in ('INT', 'FLOAT', 'STRING', 'BOOLEAN', 'COMBO') or (len(s) > 1 and isinstance(s[1], dict) and s[1].get('forceInput') is False)
        if name in linked:
            l = links[linked[name]]
            if l[1] in nodes: inputs[name] = [str(l[1]), l[2]]
            if is_widget and wv: k += 1
            if is_widget and wv and t == 'INT' and name in ('seed', 'noise_seed') : k += 1
            continue
        if not is_widget: continue
        if wvals: 
            if name in wvals: inputs[name] = wvals[name]
            continue
        if k < len(wv): inputs[name] = wv[k]; k += 1
        if t == 'INT' and len(s) > 1 and isinstance(s[1], dict) and (s[1].get('control_after_generate') or name in ('seed', 'noise_seed')) and k < len(wv) and wv[k] in ('fixed', 'increment', 'decrement', 'randomize'): k += 1
    api[str(nid)] = {'class_type': n['type'], 'inputs': inputs, '_meta': {'title': n.get('title') or n['type']}}
json.dump(api, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for k2, v in api.items(): print(k2, v['class_type'], json.dumps(v['inputs'], ensure_ascii=False)[:200])
